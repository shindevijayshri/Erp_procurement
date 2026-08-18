package com.payment.service;

import com.payment.entity.Payment;
import com.payment.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    // Step 1: Create Razorpay Order & Save Initial Payment Record
    public Payment createRazorpayOrder(Long invoiceId) {
        try {
            String invoiceUrl = "http://localhost:8080/api/invoices/" + invoiceId;
            Map<String, Object> invoiceResponse = restTemplate.getForObject(invoiceUrl, Map.class);
            
            if (invoiceResponse == null || !invoiceResponse.containsKey("amount")) {
                throw new RuntimeException("Invoice not found with id: " + invoiceId);
            }

            Object rawAmount = invoiceResponse.get("amount");
            System.out.println("DEBUG: Fetched raw invoice amount from API: " + rawAmount);

            Double amount = Double.valueOf(rawAmount.toString());

            // Convert amount to paise safely using long
            long amountInPaise = Math.round(amount * 100);

            // Razorpay gateway limit safety check (e.g., maximum allowed order amount threshold)
            if (amountInPaise > 500000000L) { // Limit set to prevent upper bound errors
                throw new RuntimeException("Amount exceeds maximum allowed limit for online processing.");
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise); 
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "invoice_rcpt_" + invoiceId);

            Order razorpayOrder = razorpay.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            Payment payment = new Payment();
            payment.setInvoiceId(invoiceId);
            payment.setAmount(amount);
            payment.setPaymentDate(LocalDate.now());
            payment.setStatus("CREATED");
            payment.setRazorpayOrderId(razorpayOrderId);

            return paymentRepository.save(payment);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error initializing Razorpay order: " + e.getMessage());
        }
    }

    // Step 2: Verify Razorpay Signature and Update Status
    public boolean verifyAndCompletePayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                if (payment != null) {
                    payment.setStatus("SUCCESS");
                    paymentRepository.save(payment);

                    // --- Notify Main App (Port 8080) to update invoice status ---
                    try {
                        String updateInvoiceUrl = "http://localhost:8080/api/invoices/" + payment.getInvoiceId() + "/status?status=PAID";
                        restTemplate.put(updateInvoiceUrl, null);
                    } catch (Exception ex) {
                        System.out.println("Could not update main app invoice status: " + ex.getMessage());
                    }

                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error verifying payment signature: " + e.getMessage());
        }
    }
    
    // Fetch all payment transactions history
    public List<Payment> getAllPayments() {
        try {
            return paymentRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching payments: " + e.getMessage());
        }
    }
}
package com.payment.controller;

import com.payment.entity.Payment;
import com.payment.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order/{invoiceId}")
    public ResponseEntity<Payment> createOrder(@PathVariable Long invoiceId) {
        Payment payment = paymentService.createRazorpayOrder(invoiceId);
        return new ResponseEntity<>(payment, HttpStatus.CREATED);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> paymentData) {
        String razorpayOrderId = paymentData.get("razorpay_order_id");
        String razorpayPaymentId = paymentData.get("razorpay_payment_id");
        String razorpaySignature = paymentData.get("razorpay_signature");

        boolean isVerified = paymentService.verifyAndCompletePayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (isVerified) {
            return ResponseEntity.ok("Payment verified successfully and status updated!");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payment verification failed: Invalid Signature");
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
}
	package com.erp.service;

	import org.springframework.stereotype.Service;

	import com.erp.entities.Invoice;
	import com.erp.entities.Payment;
	import com.erp.repository.InvoiceRepository;
	import com.erp.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
	import java.util.List;

	@Service
	@RequiredArgsConstructor
	public class PaymentService {

	    private final PaymentRepository paymentRepository;

	    private final InvoiceRepository invoiceRepository;

	    // 1. Process/Record a Payment against an Invoice
	    public Payment createPayment(Long invoiceId, Payment payment) {
	        Invoice invoice = invoiceRepository.findById(invoiceId)
	                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));

	        payment.setInvoice(invoice);

	        if (payment.getPaymentDate() == null) {
	            payment.setPaymentDate(LocalDate.now());
	        }
	        if (payment.getStatus() == null || payment.getStatus().isEmpty()) {
	            payment.setStatus("COMPLETED"); // States: PENDING, COMPLETED, FAILED
	        }

	        return paymentRepository.save(payment);
	    }

	    // 2. Fetch Payments for an Invoice
	    public List<Payment> getPaymentsByInvoiceId(Long invoiceId) {
	        return paymentRepository.findByInvoice_InvoiceId(invoiceId);
	    }

	    // 3. Get Payment by ID
	    public Payment getPaymentById(Long paymentId) {
	        return paymentRepository.findById(paymentId)
	                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
	    }
	}

	package com.erp.controller;
	import com.erp.entities.Payment;
	import com.erp.service.PaymentService;

import lombok.RequiredArgsConstructor;

import java.util.List;
	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;



	@RestController
	@RequestMapping("/api/payments")
	@RequiredArgsConstructor
	public class PaymentController {

	    private final PaymentService paymentService;

	    // 1. Create Payment -> POST /api/payments?invoiceId=1
	    @PostMapping
	    public ResponseEntity<Payment> createPayment(@RequestParam Long invoiceId, @RequestBody Payment payment) {
	        Payment createdPayment = paymentService.createPayment(invoiceId, payment);
	        return new ResponseEntity<>(createdPayment, HttpStatus.CREATED);
	    }

	    // 2. Get Payments for an Invoice -> GET /api/payments/invoice/1
	    @GetMapping("/invoice/{invoiceId}")
	    public ResponseEntity<List<Payment>> getPaymentsByInvoiceId(@PathVariable Long invoiceId) {
	        return ResponseEntity.ok(paymentService.getPaymentsByInvoiceId(invoiceId));
	    }

	    // 3. Get Payment By ID -> GET /api/payments/{id}
	    @GetMapping("/{id}")
	    public ResponseEntity<Payment> getPaymentById(@PathVariable("id") Long paymentId) {
	        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
	    }
	}

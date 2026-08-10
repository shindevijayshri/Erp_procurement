	package com.erp.controller;
	import com.erp.entities.Invoice;
	import com.erp.service.InvoiceService;

import lombok.RequiredArgsConstructor;

import java.util.List;

	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;


	@RestController
	@RequestMapping("/api/invoices")
	@RequiredArgsConstructor
	public class InvoiceController {

	    private final InvoiceService invoiceService;

	    // 1. Create Invoice -> POST /api/invoices?poId=1
	    @PostMapping
	    public ResponseEntity<Invoice> createInvoice(@RequestParam Long poId, @RequestBody Invoice invoice) {
	        Invoice createdInvoice = invoiceService.createInvoice(poId, invoice);
	        return new ResponseEntity<>(createdInvoice, HttpStatus.CREATED);
	    }

	    // 2. Get All Invoices -> GET /api/invoices
	    @GetMapping
	    public ResponseEntity<List<Invoice>> getAllInvoices() {
	        return ResponseEntity.ok(invoiceService.getAllInvoices());
	    }

	    // 3. Get Invoice By ID -> GET /api/invoices/{id}
	    @GetMapping("/{id}")
	    public ResponseEntity<Invoice> getInvoiceById(@PathVariable("id") Long invoiceId) {
	        return ResponseEntity.ok(invoiceService.getInvoiceById(invoiceId));
	    }

	    // 4. Get Invoices for PO -> GET /api/invoices/po/1
	    @GetMapping("/po/{poId}")
	    public ResponseEntity<List<Invoice>> getInvoicesByPoId(@PathVariable Long poId) {
	        return ResponseEntity.ok(invoiceService.getInvoicesByPoId(poId));
	    }

	    // 5. Delete Invoice -> DELETE /api/invoices/{id}
	    @DeleteMapping("/{id}")
	    public ResponseEntity<String> deleteInvoice(@PathVariable("id") Long invoiceId) {
	        invoiceService.deleteInvoice(invoiceId);
	        return ResponseEntity.ok("Invoice deleted successfully.");
	    }
	    
	    
	    @PutMapping("/{id}")
	    public ResponseEntity<Invoice> updateInvoice(
	            @PathVariable Long id,
	            @RequestParam(required = false) Long poId,
	            @RequestBody Invoice invoiceDetails) {
	        
	        Invoice updatedInvoice = invoiceService.updateInvoice(id, poId, invoiceDetails);
	        return ResponseEntity.ok(updatedInvoice);
	    }
	    
	    @PutMapping("/{id}/status")
	    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Long id, @RequestParam String status) {
	        Invoice updatedInvoice = invoiceService.updateInvoiceStatus(id, status);
	        return ResponseEntity.ok(updatedInvoice);
	    }
	}
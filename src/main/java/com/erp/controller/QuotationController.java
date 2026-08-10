	package com.erp.controller;

	import com.erp.entities.Quotation;
	import com.erp.service.QuotationService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;


	@RestController
	@RequestMapping("/api/quotations")
	@RequiredArgsConstructor
	public class QuotationController {

	    private final QuotationService quotationService;
	    
	    @GetMapping
	    public ResponseEntity<List<Quotation>> getAllQuotations() {
	        // Ensure you have a getAllQuotations() method in your QuotationService
	        List<Quotation> quotations = quotationService.getAllQuotations(); 
	        return ResponseEntity.ok(quotations);
	    }

	    // 1. Log vendor quotation -> POST /api/quotations?prId=1&vendorId=2
	    @PostMapping
	    public ResponseEntity<Quotation> createQuotation(@RequestParam Long prId,
	                                                     @RequestParam Long vendorId,
	                                                     @RequestBody Quotation quotation) {
	        Quotation createdQuotation = quotationService.createQuotation(prId, vendorId, quotation);
	        return new ResponseEntity<>(createdQuotation, HttpStatus.CREATED);
	    }

	    // 2. Get all quotes for a specific PR -> GET /api/quotations/pr/1
	    @GetMapping("/pr/{prId}")
	    public ResponseEntity<List<Quotation>> getQuotationsByPrId(@PathVariable Long prId) {
	        List<Quotation> quotations = quotationService.getQuotationsByPrId(prId);
	        return ResponseEntity.ok(quotations);
	    }

	    // 3. Select winning quote -> PATCH /api/quotations/1/status?status=SELECTED
	    @PatchMapping("/{id}/status")
	    public ResponseEntity<Quotation> updateStatus(@PathVariable("id") Long quotationId,
	                                                   @RequestParam String status) {
	        Quotation updatedQuotation = quotationService.updateQuotationStatus(quotationId, status);
	        return ResponseEntity.ok(updatedQuotation);
	    }

	    // 4. Delete quotation -> DELETE /api/quotations/1
	    @DeleteMapping("/{id}")
	    public ResponseEntity<String> deleteQuotation(@PathVariable("id") Long quotationId) {
	        quotationService.deleteQuotation(quotationId);
	        return ResponseEntity.ok("Quotation deleted successfully.");
	    }
	    
	    @PutMapping("/{id}")
	    public ResponseEntity<Quotation> updateQuotation(@PathVariable("id") Long quotationId,
	                                                     @RequestParam Long prId,
	                                                     @RequestParam Long vendorId,
	                                                     @RequestBody Quotation quotation) {
	        Quotation updatedQuotation = quotationService.updateQuotation(quotationId, prId, vendorId, quotation);
	        return ResponseEntity.ok(updatedQuotation);
	    }
	}

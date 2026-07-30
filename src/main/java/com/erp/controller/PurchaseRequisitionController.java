	package com.erp.controller;
	import com.erp.entities.PRItem;
	import com.erp.entities.PurchaseRequisition;
	import com.erp.service.PurchaseRequisitionService;

import lombok.RequiredArgsConstructor;

import java.util.List;
	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;



	@RestController
	@RequestMapping("/api/requisitions")
	@RequiredArgsConstructor
	public class PurchaseRequisitionController {

	    private final PurchaseRequisitionService prService;

	    // 1. Create PR Header -> POST /api/requisitions?userId=1
	    @PostMapping
	    public ResponseEntity<PurchaseRequisition> createPR(@RequestParam Long userId, 
	                                                        @RequestBody PurchaseRequisition pr) {
	        PurchaseRequisition createdPR = prService.createPR(userId, pr);
	        return new ResponseEntity<>(createdPR, HttpStatus.CREATED);
	    }

	    // 2. Add Line Item -> POST /api/requisitions/{prId}/items?itemId=1
	    @PostMapping("/{prId}/items")
	    public ResponseEntity<PRItem> addPRItem(@PathVariable Long prId, 
	                                            @RequestParam Long itemId, 
	                                            @RequestBody PRItem prItem) {
	        PRItem addedItem = prService.addPRItem(prId, itemId, prItem);
	        return new ResponseEntity<>(addedItem, HttpStatus.CREATED);
	    }

	    // 3. Get All PRs -> GET /api/requisitions
	    @GetMapping
	    public ResponseEntity<List<PurchaseRequisition>> getAllPRs() {
	        return ResponseEntity.ok(prService.getAllPRs());
	    }

	    // 4. Get PR By ID -> GET /api/requisitions/{id}
	    @GetMapping("/{id}")
	    public ResponseEntity<PurchaseRequisition> getPRById(@PathVariable("id") Long prId) {
	        return ResponseEntity.ok(prService.getPRById(prId));
	    }

	    // 5. Get Line Items for a PR -> GET /api/requisitions/{id}/items
	    @GetMapping("/{id}/items")
	    public ResponseEntity<List<PRItem>> getPRItems(@PathVariable("id") Long prId) {
	        return ResponseEntity.ok(prService.getPRItemsByPrId(prId));
	    }

	    // 6. Update PR Status -> PATCH /api/requisitions/{id}/status?status=APPROVED
	    @PatchMapping("/{id}/status")
	    public ResponseEntity<PurchaseRequisition> updateStatus(@PathVariable("id") Long prId, 
	                                                            @RequestParam String status) {
	        return ResponseEntity.ok(prService.updatePRStatus(prId, status));
	    }

	    // 7. Delete PR -> DELETE /api/requisitions/{id}
	    @DeleteMapping("/{id}")
	    public ResponseEntity<String> deletePR(@PathVariable("id") Long prId) {
	        prService.deletePR(prId);
	        return ResponseEntity.ok("Purchase Requisition with ID " + prId + " deleted successfully.");
	    }
	}

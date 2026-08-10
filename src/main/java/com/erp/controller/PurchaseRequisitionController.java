package com.erp.controller;

import com.erp.entities.PRItem;
import com.erp.entities.PurchaseRequisition;
import com.erp.service.PurchaseRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisitions")
@CrossOrigin(origins = "*") // Allows flexible origin access (React, Swagger, etc.)
@RequiredArgsConstructor
public class PurchaseRequisitionController {

    private final PurchaseRequisitionService prService;

    // 1. Create Purchase Requisition Header
    @PostMapping
    public ResponseEntity<PurchaseRequisition> createPR(
            @RequestParam String userId,
            @RequestBody PurchaseRequisition pr) {
        PurchaseRequisition createdPr = prService.createPR(userId, pr);
        return new ResponseEntity<>(createdPr, HttpStatus.CREATED);
    }

    // 2. Add Line Item to a PR
    @PostMapping("/{prId}/items")
    public ResponseEntity<PRItem> addPRItem(
            @PathVariable Long prId,
            @RequestParam Long itemId,
            @RequestBody PRItem prItem) {
        PRItem createdItem = prService.addPRItem(prId, itemId, prItem);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    // 3. Get All PRs OR Filtered by userId / Email
    @GetMapping
    public ResponseEntity<List<PurchaseRequisition>> getAllPRs(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.trim().isEmpty()) {
            return ResponseEntity.ok(prService.getPRsByUserIdentifier(userId));
        }
        return ResponseEntity.ok(prService.getAllPRs());
    }

    // 4. Get PR by ID
    @GetMapping("/{prId}")
    public ResponseEntity<PurchaseRequisition> getPRById(@PathVariable Long prId) {
        return ResponseEntity.ok(prService.getPRById(prId));
    }

    // 5. Get All Line Items for a Specific PR
    @GetMapping("/{prId}/items")
    public ResponseEntity<List<PRItem>> getPRItemsByPrId(@PathVariable Long prId) {
        return ResponseEntity.ok(prService.getPRItemsByPrId(prId));
    }

    // 6. Update PR Header (Remarks & PR Date) - Safe for PR User Updates
    @PutMapping("/{prId}")
    public ResponseEntity<PurchaseRequisition> updatePRHeader(
            @PathVariable Long prId,
            @RequestBody PurchaseRequisition details) {
        PurchaseRequisition updatedPr = prService.updatePRHeader(prId, details);
        return ResponseEntity.ok(updatedPr);
    }

    // 7. Update PR Status (Purchase Officer: PENDING -> APPROVED / REJECTED)
    @PutMapping("/{prId}/status")
    public ResponseEntity<PurchaseRequisition> updatePRStatus(
            @PathVariable Long prId,
            @RequestParam String status) {
        PurchaseRequisition updatedPr = prService.updatePRStatus(prId, status);
        return ResponseEntity.ok(updatedPr);
    }

    // 8. Delete PR and associated line items
    @DeleteMapping("/{prId}")
    public ResponseEntity<Void> deletePR(@PathVariable Long prId) {
        prService.deletePR(prId);
        return ResponseEntity.noContent().build();
    }

    // 9. Update quantity of an existing line item
    @PutMapping("/items/{prItemId}")
    public ResponseEntity<PRItem> updatePRItemQuantity(
            @PathVariable Long prItemId,
            @RequestParam Integer quantity) {
        PRItem updatedItem = prService.updatePRItemQuantity(prItemId, quantity);
        return ResponseEntity.ok(updatedItem);
    }

    // 10. Delete an individual line item
    @DeleteMapping("/items/{prItemId}")
    public ResponseEntity<Void> deletePRItem(@PathVariable Long prItemId) {
        prService.deletePRItem(prItemId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/next-number")
    public ResponseEntity<String> getNextPRNumber() {
        return ResponseEntity.ok(prService.getNextPRNumber());
    }
}
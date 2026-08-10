	package com.erp.controller;
	import com.erp.entities.POItem;
	import com.erp.entities.PurchaseOrder;
	import com.erp.service.PurchaseOrderService;

import lombok.RequiredArgsConstructor;

import java.util.List;
	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;



	@RestController
	@RequestMapping("/api/orders")
	@RequiredArgsConstructor
	public class PurchaseOrderController {

	    private final PurchaseOrderService poService;

	    // 1. Create PO Header -> POST /api/orders?vendorId=1&quotationId=1
	    @PostMapping
	    public ResponseEntity<PurchaseOrder> createPO(@RequestParam Long vendorId,
	                                                  @RequestParam Long quotationId,
	                                                  @RequestBody PurchaseOrder po) {
	        PurchaseOrder createdPO = poService.createPO(vendorId, quotationId, po);
	        return new ResponseEntity<>(createdPO, HttpStatus.CREATED);
	    }

	    // 2. Add Line Item -> POST /api/orders/{poId}/items?itemId=1
	    @PostMapping("/{poId}/items")
	    public ResponseEntity<POItem> addPOItem(@PathVariable Long poId,
	                                            @RequestParam Long itemId,
	                                            @RequestBody POItem poItem) {
	        POItem addedItem = poService.addPOItem(poId, itemId, poItem);
	        return new ResponseEntity<>(addedItem, HttpStatus.CREATED);
	    }

	    // 3. Get All POs -> GET /api/orders
	    @GetMapping
	    public ResponseEntity<List<PurchaseOrder>> getAllPOs() {
	        return ResponseEntity.ok(poService.getAllPOs());
	    }

	    // 4. Get PO By ID -> GET /api/orders/{id}
	    @GetMapping("/{id}")
	    public ResponseEntity<PurchaseOrder> getPOById(@PathVariable("id") Long poId) {
	        return ResponseEntity.ok(poService.getPOById(poId));
	    }

	    // 5. Get PO Items -> GET /api/orders/{id}/items
	    @GetMapping("/{id}/items")
	    public ResponseEntity<List<POItem>> getPOItems(@PathVariable("id") Long poId) {
	        return ResponseEntity.ok(poService.getPOItemsByPoId(poId));
	    }

	    // 6. Update PO Status -> PATCH /api/orders/{id}/status?status=DELIVERED
	    @PatchMapping("/{id}/status")
	    public ResponseEntity<PurchaseOrder> updateStatus(@PathVariable("id") Long poId,
	                                                       @RequestParam String status) {
	        return ResponseEntity.ok(poService.updatePOStatus(poId, status));
	    }

	    // 7. Delete PO -> DELETE /api/orders/{id}
	    @DeleteMapping("/{id}")
	    public ResponseEntity<String> deletePO(@PathVariable("id") Long poId) {
	        poService.deletePO(poId);
	        return ResponseEntity.ok("Purchase Order deleted successfully.");
	    }
	 // 8. Update PO and its items -> PUT /api/orders/{id}
	    @PutMapping("/{id}")
	    public ResponseEntity<PurchaseOrder> updatePO(@PathVariable("id") Long poId,
	                                                  @RequestBody PurchaseOrder po) {
	        PurchaseOrder updatedPO = poService.updatePO(poId, po);
	        return ResponseEntity.ok(updatedPO);
	    }
	}

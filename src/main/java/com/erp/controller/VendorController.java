	package com.erp.controller;
	import com.erp.entities.Vendor;
	import com.erp.service.VendorService;

import lombok.RequiredArgsConstructor;

import java.util.List;
	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;



	@RestController
	@RequestMapping("/api/vendors")
	@RequiredArgsConstructor
	public class VendorController {

	    private final VendorService vendorService;

	    // 1. Create Vendor -> POST /api/vendors
	    @PostMapping
	    public ResponseEntity<Vendor> createVendor(@RequestBody Vendor vendor) {
	        Vendor createdVendor = vendorService.createVendor(vendor);
	        return new ResponseEntity<>(createdVendor, HttpStatus.CREATED);
	    }

	    // 2. Get All Vendors -> GET /api/vendors
	    @GetMapping
	    public ResponseEntity<List<Vendor>> getAllVendors() {
	        List<Vendor> vendors = vendorService.getAllVendors();
	        return ResponseEntity.ok(vendors);
	    }

	    // 3. Get Vendor By ID -> GET /api/vendors/{id}
//	    @GetMapping("/{id}")
//	    public ResponseEntity<Vendor> getVendorById(@PathVariable("id") Long vendorId) {
//	        Vendor vendor = vendorService.getVendorById(vendorId);
//	        return ResponseEntity.ok(vendor);
//	    }

	    // 4. Update Vendor -> PUT /api/vendors/{id}
	    @PutMapping("/{id}")
	    public ResponseEntity<Vendor> updateVendor(@PathVariable("id") Long vendorId, @RequestBody Vendor vendorDetails) {
	        Vendor updatedVendor = vendorService.updateVendor(vendorId, vendorDetails);
	        return ResponseEntity.ok(updatedVendor);
	    }

	    // 5. Delete Vendor -> DELETE /api/vendors/{id}
	    @DeleteMapping("/{id}")
	    public ResponseEntity<String> deleteVendor(@PathVariable("id") Long vendorId) {
	        vendorService.deleteVendor(vendorId);
	        return ResponseEntity.ok("Vendor with ID " + vendorId + " deleted successfully.");
	    }
	}

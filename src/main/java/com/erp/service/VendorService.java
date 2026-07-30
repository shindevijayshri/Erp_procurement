	package com.erp.service;
	import com.erp.entities.Vendor;
	import com.erp.repository.VendorRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
	import org.springframework.stereotype.Service;



	@Service
	@RequiredArgsConstructor
	public class VendorService {

	    private final VendorRepository vendorRepository;

	    // 1. Create New Vendor
	    public Vendor createVendor(Vendor vendor) {
	        if (vendorRepository.existsByEmail(vendor.getEmail())) {
	            throw new RuntimeException("Vendor with email " + vendor.getEmail() + " already exists.");
	        }
	        return vendorRepository.save(vendor);
	    }

	    // 2. Get All Vendors
	    public List<Vendor> getAllVendors() {
	        return vendorRepository.findAll();
	    }

	    // 3. Get Vendor By ID
	    public Vendor getVendorById(Long vendorId) {
	        return vendorRepository.findById(vendorId)
	                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));
	    }

	    // 4. Update Vendor
	    public Vendor updateVendor(Long vendorId, Vendor vendorDetails) {
	        Vendor existingVendor = getVendorById(vendorId);

	        // Explicitly maintain ID to keep entity managed properly
	        existingVendor.setVendorId(vendorId);

	        existingVendor.setVendorName(vendorDetails.getVendorName());
	        existingVendor.setEmail(vendorDetails.getEmail());
	        existingVendor.setPhone(vendorDetails.getPhone());
	        existingVendor.setAddress(vendorDetails.getAddress());
	        existingVendor.setGstNo(vendorDetails.getGstNo());

	        return vendorRepository.save(existingVendor);
	    }

	    // 5. Delete Vendor
	    public void deleteVendor(Long vendorId) {
	        Vendor existingVendor = getVendorById(vendorId);
	        vendorRepository.delete(existingVendor);
	    }
	}

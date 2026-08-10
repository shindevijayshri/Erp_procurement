	package com.erp.service;
	import com.erp.entities.PurchaseRequisition;
	import com.erp.entities.Quotation;
	import com.erp.entities.Vendor;
	import com.erp.repository.PurchaseRequisitionRepository;
	import com.erp.repository.QuotationRepository;
	import com.erp.repository.VendorRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
	import java.util.List;
	import org.springframework.stereotype.Service;



	@Service
	@RequiredArgsConstructor
	public class QuotationService {

	    private final QuotationRepository quotationRepository;

	    private final PurchaseRequisitionRepository prRepository;

	    private final VendorRepository vendorRepository;

	    
	    public List<Quotation> getAllQuotations() {
	        return quotationRepository.findAll();
	    }
	    
	    // 1. Officer manually logs a received quotation into the ERP
	    public Quotation createQuotation(Long prId, Long vendorId, Quotation quotation) {
	        PurchaseRequisition pr = prRepository.findById(prId)
	                .orElseThrow(() -> new RuntimeException("PR not found with id: " + prId));

	        Vendor vendor = vendorRepository.findById(vendorId)
	                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));

	        quotation.setPurchaseRequisition(pr);
	        quotation.setVendor(vendor);

	        if (quotation.getQuoteDate() == null) {
	            quotation.setQuoteDate(LocalDate.now());
	        }
	        if (quotation.getStatus() == null || quotation.getStatus().isEmpty()) {
	            quotation.setStatus("RECEIVED"); // States: RECEIVED, SELECTED, REJECTED
	        }

	        return quotationRepository.save(quotation);
	    }

	    // 2. Fetch all quotes for a PR (For comparison)
	    public List<Quotation> getQuotationsByPrId(Long prId) {
	        return quotationRepository.findByPurchaseRequisition_PrId(prId);
	    }

	    // 3. Get quotation by ID
	    public Quotation getQuotationById(Long quotationId) {
	        return quotationRepository.findById(quotationId)
	                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + quotationId));
	    }

	    // 4. Update status (e.g., mark winning quote as "SELECTED")
	    public Quotation updateQuotationStatus(Long quotationId, String status) {
	        Quotation quotation = getQuotationById(quotationId);
	        quotation.setStatus(status);
	        return quotationRepository.save(quotation);
	    }

	    // 5. Delete quotation
	    public void deleteQuotation(Long quotationId) {
	        Quotation quotation = getQuotationById(quotationId);
	        quotationRepository.delete(quotation);
	    }
	    
	  
	    @Transactional
	    public Quotation updateQuotation(Long quotationId, Long prId, Long vendorId, Quotation quotationDetails) {
	        // 1. Fetch existing quotation
	        Quotation existingQuotation = quotationRepository.findById(quotationId)
	                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + quotationId));

	        // 2. Fetch Purchase Requisition
	        PurchaseRequisition pr = prRepository.findById(prId)
	                .orElseThrow(() -> new RuntimeException("Purchase Requisition not found with id: " + prId));

	        // 3. Fetch Vendor
	        Vendor vendor = vendorRepository.findById(vendorId)
	                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));

	        // 4. Update fields
	        existingQuotation.setPurchaseRequisition(pr);
	        existingQuotation.setVendor(vendor);
	        existingQuotation.setAmount(quotationDetails.getAmount());
	        existingQuotation.setQuoteDate(quotationDetails.getQuoteDate());
	        
	        if (quotationDetails.getStatus() != null) {
	            existingQuotation.setStatus(quotationDetails.getStatus());
	        }

	        // 5. Save and return updated entity
	        return quotationRepository.save(existingQuotation);
	    }
	}

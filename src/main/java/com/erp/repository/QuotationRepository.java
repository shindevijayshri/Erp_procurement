	package com.erp.repository;
	import com.erp.entities.Quotation;

	import java.util.List;
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;



	@Repository
	public interface QuotationRepository extends JpaRepository<Quotation, Long> {

	    // Fetch all quotes received for a specific Purchase Requisition
	    List<Quotation> findByPurchaseRequisition_PrId(Long prId);

	    // Fetch all quotes submitted by a specific Vendor
	    List<Quotation> findByVendor_VendorId(Long vendorId);
	}
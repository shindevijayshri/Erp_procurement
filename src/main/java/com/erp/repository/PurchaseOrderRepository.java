	package com.erp.repository;
	import com.erp.entities.PurchaseOrder;

	import java.util.List;
	import java.util.Optional;
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;



	@Repository
	public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

	    Optional<PurchaseOrder> findByPoNumber(String poNumber);

	    List<PurchaseOrder> findByVendor_VendorId(Long vendorId);

	    List<PurchaseOrder> findByStatus(String status);
	}

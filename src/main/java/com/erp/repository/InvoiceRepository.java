	package com.erp.repository;
	import com.erp.entities.Invoice;

	import java.util.List;
	import java.util.Optional;
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;



	@Repository
	public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

	    Optional<Invoice> findByInvoiceNo(String invoiceNo);

	    List<Invoice> findByPurchaseOrder_PoId(Long poId);
	}

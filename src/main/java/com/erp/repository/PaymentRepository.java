	package com.erp.repository;
	import com.erp.entities.Payment;

	import java.util.List;
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;



	@Repository
	public interface PaymentRepository extends JpaRepository<Payment, Long> {

	    List<Payment> findByInvoice_InvoiceId(Long invoiceId);
	}

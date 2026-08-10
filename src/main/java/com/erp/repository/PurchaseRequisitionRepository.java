	package com.erp.repository;

	import com.erp.entities.PurchaseRequisition;
	
	import java.util.List;
	import java.util.Optional;
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;


	@Repository
	public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Long> {

	    Optional<PurchaseRequisition> findByPrNumber(String prNumber);

	    List<PurchaseRequisition> findByUser_UserId(Long userId);

	    List<PurchaseRequisition> findByStatus(String status);
	    
	    Optional<PurchaseRequisition> findTopByOrderByPrIdDesc();
	    
	}

	package com.erp.repository;
	import com.erp.entities.POItem;

	import java.util.List;

	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;


	@Repository
	public interface POItemRepository extends JpaRepository<POItem, Long> {

	    List<POItem> findByPurchaseOrder_PoId(Long poId);
	}

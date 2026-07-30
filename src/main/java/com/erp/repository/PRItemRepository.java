	package com.erp.repository;

	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;

import com.erp.entities.PRItem;

import java.util.List;

	@Repository
	public interface PRItemRepository extends JpaRepository<PRItem, Long> {

	    List<PRItem> findByPurchaseRequisition_PrId(Long prId);
	}

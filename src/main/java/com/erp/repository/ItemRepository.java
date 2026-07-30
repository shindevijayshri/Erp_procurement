	package com.erp.repository;
	import com.erp.entities.Item;

	import java.util.Optional;
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;



	@Repository
	public interface ItemRepository extends JpaRepository<Item, Long> {

	    // Useful for checking duplicate codes during item registration
	    Optional<Item> findByItemCode(String itemCode);

	    boolean existsByItemCode(String itemCode);
	}

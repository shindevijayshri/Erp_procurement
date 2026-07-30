	package com.erp.repository;
	import com.erp.entities.Vendor;

	import java.util.Optional;
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;



	@Repository
	public interface VendorRepository extends JpaRepository<Vendor, Long> {

	    // Useful to check duplicate vendor registration by email or GST number
	    Optional<Vendor> findByEmail(String email);

	    boolean existsByEmail(String email);

	    boolean existsByGstNo(String gstNo);
	}

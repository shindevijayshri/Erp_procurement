	package com.erp.repository;

	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;

	import com.erp.entities.User;

	import java.util.Optional;

	@Repository
	public interface UserRepository extends JpaRepository<User, Long> {
	    
	    // Custom query method to check if email already exists during creation/update
	    Optional<User> findByEmail(String email);
	    
	    boolean existsByEmail(String email);
	
}

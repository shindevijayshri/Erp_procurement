	package com.erp.service;
	
	import com.erp.entities.User;
import com.erp.entities.UserStatus;
import com.erp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
	
	
	import java.util.List;

	@Service
	@RequiredArgsConstructor
	public class UserService {

	    
	    private final UserRepository userRepository;

	   
	    private final PasswordEncoder passwordEncoder;
	    
	    // Create New User
	    public User createUser(User user) {

	        if (userRepository.existsByEmail(user.getEmail())) {
	            throw new RuntimeException("User with email " + user.getEmail() + " already exists.");
	        }

	        // Encrypt password
	        user.setPassword(passwordEncoder.encode(user.getPassword()));

	        // Every newly registered user requires admin approval
	        user.setStatus(UserStatus.PENDING);

	        return userRepository.save(user);
	    }

	    // List All Users
	    public List<User> getAllUsers() {
	        return userRepository.findByStatus(UserStatus.APPROVED);
	    }

	    // Get User by ID
	    public User getUserById(Long userId) {
	        return userRepository.findById(userId)
	                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
	    }

	    // Update User
	    public User updateUser(Long userId, User userDetails) {
	        User existingUser = getUserById(userId);

	        existingUser.setName(userDetails.getName());
	        existingUser.setEmail(userDetails.getEmail());
	        existingUser.setDepartment(userDetails.getDepartment());
	        existingUser.setPhone(userDetails.getPhone());
	        existingUser.setRole(userDetails.getRole());
	        
	        // Update password if provided
	        if (userDetails.getPassword() != null &&
	        	    !userDetails.getPassword().trim().isEmpty()) {

	        	    existingUser.setPassword(
	        	        passwordEncoder.encode(userDetails.getPassword())
	        	    );
	        	}

	        return userRepository.save(existingUser);
	    }

	    // Delete User
	    public void deleteUser(Long userId) {
	        User existingUser = getUserById(userId);
	        userRepository.delete(existingUser);
	    }
	
	    
	    public List<User> getPendingUsers() {
	        return userRepository.findByStatus(UserStatus.PENDING);
	    }
	    
	    public User approveUser(Long userId) {

	        User user = getUserById(userId);

	        user.setStatus(UserStatus.APPROVED);

	        return userRepository.save(user);
	    }
	    
	    public User rejectUser(Long userId) {

	        User user = getUserById(userId);

	        user.setStatus(UserStatus.REJECTED);

	        return userRepository.save(user);
	    }
}

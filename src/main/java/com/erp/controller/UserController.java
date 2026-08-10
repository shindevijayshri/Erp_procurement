	package com.erp.controller;
	import com.erp.entities.User;
	import com.erp.service.UserService;

import lombok.RequiredArgsConstructor;

	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;


	import java.util.List;

	@RestController
	@RequestMapping("/api/users")
	@RequiredArgsConstructor
	public class UserController {

	    private final UserService userService;

	    // 1. Create User -> POST /api/users
	    @PostMapping
	    public ResponseEntity<User> createUser(@RequestBody User user) {
	        User createdUser = userService.createUser(user);
	        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
	    }

	    // 2. Get All Users -> GET /api/users
	    @GetMapping
	    public ResponseEntity<List<User>> getAllUsers() {
	        List<User> users = userService.getAllUsers();
	        return ResponseEntity.ok(users);
	    }

	    // 3. Get User By ID -> GET /api/users/{id}
//	    @GetMapping("/{id}")
//	    public ResponseEntity<User> getUserById(@PathVariable("id") Long userId) {
//	        User user = userService.getUserById(userId);
//	        return ResponseEntity.ok(user);
//	    }

	    // 4. Update User -> PUT /api/users/{id}
	    @PutMapping("/{id}")
	    public ResponseEntity<User> updateUser(@PathVariable("id") Long userId, @RequestBody User userDetails) {
	        User updatedUser = userService.updateUser(userId, userDetails);
	        return ResponseEntity.ok(updatedUser);
	    }

	    // 5. Delete User -> DELETE /api/users/{id}
	    @DeleteMapping("/{id}")
	    public ResponseEntity<String> deleteUser(@PathVariable("id") Long userId) {
	        userService.deleteUser(userId);
	        return ResponseEntity.ok("User with ID " + userId + " deleted successfully.");
	    }
	
	    @GetMapping("/pending")
	    public ResponseEntity<List<User>> getPendingUsers() {
	        return ResponseEntity.ok(userService.getPendingUsers());
	    }
	    
	    @PutMapping("/approve/{id}")
	    public ResponseEntity<User> approveUser(@PathVariable Long id) {
	        return ResponseEntity.ok(userService.approveUser(id));
	    }
	    
	    @PutMapping("/reject/{id}")
	    public ResponseEntity<User> rejectUser(@PathVariable Long id) {
	        return ResponseEntity.ok(userService.rejectUser(id));
	    }
}

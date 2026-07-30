package com.erp.controller;

import com.erp.dto.LoginRequest;
import com.erp.dto.JwtResponse;
import com.erp.entities.User;
import com.erp.repository.UserRepository;
import com.erp.security.JwtUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor

public class AuthController {

   
    private final AuthenticationManager authenticationManager;

    
    private final UserRepository userRepository;

   
    private final JwtUtils jwtUtils;
   
   
	
    
   @PostMapping("/login")
public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

    User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException(
                    "User not found: " + loginRequest.getEmail()));


    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
            )
    );

    SecurityContextHolder.getContext().setAuthentication(authentication);

    String jwt = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

    return ResponseEntity.ok(new JwtResponse(
            jwt,
            user.getUserId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
    ));
}
}
package com.erp.security;

import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    private final CustomUserDetailsService customUserDetailsService;

    // Password Encoder Bean using BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // DaoAuthenticationProvider explicitly handles BCrypt + CustomUserDetailsService
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Expose AuthenticationManager Bean for login processing
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Enable CORS & Disable CSRF
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            
            // 2. Set session management to STATELESS
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 3. Register Custom DaoAuthenticationProvider
            .authenticationProvider(authenticationProvider())
            
            // 4. Define Endpoint Access Rules based on Roles
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()

                // Public Endpoints (Login & Swagger Docs)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // ADMIN Only Rules
                .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN")
                
                // PURCHASE OFFICER Rules
                .requestMatchers("/api/vendors/**").hasAuthority("ROLE_PURCHASE_OFFICER")
                .requestMatchers("/api/orders/**").hasAuthority("ROLE_PURCHASE_OFFICER")
                .requestMatchers("/api/quotations/**").hasAuthority("ROLE_PURCHASE_OFFICER")
                .requestMatchers(HttpMethod.PATCH, "/api/requisitions/*/status").hasAuthority("ROLE_PURCHASE_OFFICER")
                
                // FINANCE OFFICER Rules
                .requestMatchers("/api/invoices/**").hasAnyAuthority("ROLE_FINANCE_OFFICER", "ROLE_PURCHASE_OFFICER")
                .requestMatchers("/api/payments/**").hasAuthority("ROLE_FINANCE_OFFICER")
                
                // REQUISITION (PR) Rules
                .requestMatchers("/api/requisitions/**").hasAnyAuthority("ROLE_USER", "ROLE_PURCHASE_OFFICER", "ROLE_ADMIN")
                
                // Lock down all remaining requests
                .anyRequest().authenticated()
            );

        // 5. Add JWT Filter before standard Spring Security Auth Filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // 6. Build and return the security chain
        return http.build();
    }

    // Helper Bean for CORS configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
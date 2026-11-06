package com.lenhuthuy.fuminihotel.service;

import com.lenhuthuy.fuminihotel.dto.AuthResponse;
import com.lenhuthuy.fuminihotel.dto.LoginRequest;
import com.lenhuthuy.fuminihotel.dto.RegisterRequest;
import com.lenhuthuy.fuminihotel.entity.Customer;
import com.lenhuthuy.fuminihotel.exception.AppException;
import com.lenhuthuy.fuminihotel.repository.CustomerRepository;
import com.lenhuthuy.fuminihotel.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomerRepository customerRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.staff.email}")
    private String staffEmail;

    @Value("${app.staff.password}")
    private String staffPassword;

    @Value("${app.staff.name:Hotel Staff}")
    private String staffName;

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim();
        String password = request.getPassword().trim();

        // Xac thuc tai khoan Staff tu application.properties
        if (email.equalsIgnoreCase(staffEmail) && password.equals(staffPassword)) {
            String token = jwtTokenProvider.generateToken(staffEmail, "STAFF", null, staffName);
            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .role("STAFF")
                    .customerId(null)
                    .fullName(staffName)
                    .email(staffEmail)
                    .message("Login successfully")
                    .build();
        }

        // Xac thuc tai khoan Customer trong SQL Server
        Customer customer = customerRepository.findByEmailAddressIgnoreCase(email)
                .orElseThrow(() -> new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (customer.getPassword() == null || !customer.getPassword().equals(password)) {
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        if (customer.getCustomerStatus() != null && customer.getCustomerStatus() == 0) {
            throw new AppException("Customer account is inactive", HttpStatus.FORBIDDEN);
        }

        String token = jwtTokenProvider.generateToken(
                customer.getEmailAddress(),
                "CUSTOMER",
                customer.getCustomerId(),
                customer.getCustomerFullName()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .role("CUSTOMER")
                .customerId(customer.getCustomerId())
                .fullName(customer.getCustomerFullName())
                .email(customer.getEmailAddress())
                .message("Login successfully")
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmailAddress().trim();

        if (email.equalsIgnoreCase(staffEmail) || customerRepository.existsByEmailAddressIgnoreCase(email)) {
            throw new AppException("Email already exists: " + email, HttpStatus.BAD_REQUEST);
        }

        Customer customer = Customer.builder()
                .customerFullName(request.getCustomerFullName().trim())
                .telephone(request.getTelephone().trim())
                .emailAddress(email)
                .customerBirthday(request.getCustomerBirthday())
                .customerStatus(1)
                .password(request.getPassword().trim())
                .build();

        Customer saved = customerRepository.save(customer);

        String token = jwtTokenProvider.generateToken(
                saved.getEmailAddress(),
                "CUSTOMER",
                saved.getCustomerId(),
                saved.getCustomerFullName()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .role("CUSTOMER")
                .customerId(saved.getCustomerId())
                .fullName(saved.getCustomerFullName())
                .email(saved.getEmailAddress())
                .message("Registered successfully")
                .build();
    }
}

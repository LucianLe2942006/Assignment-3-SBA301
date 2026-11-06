package com.lenhuthuy.fuminihotel.service;

import com.lenhuthuy.fuminihotel.dto.CustomerDTO;
import com.lenhuthuy.fuminihotel.entity.Customer;
import com.lenhuthuy.fuminihotel.exception.AppException;
import com.lenhuthuy.fuminihotel.repository.BookingReservationRepository;
import com.lenhuthuy.fuminihotel.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BookingReservationRepository bookingReservationRepository;

    @Value("${app.staff.email}")
    private String staffEmail;

    public List<CustomerDTO> getAllCustomers(String search) {
        return customerRepository.searchCustomers(search)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException("Customer not found with ID: " + id, HttpStatus.NOT_FOUND));
        return toDTO(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        String email = dto.getEmailAddress().trim();
        if (email.equalsIgnoreCase(staffEmail) || customerRepository.existsByEmailAddressIgnoreCase(email)) {
            throw new AppException("Email already exists: " + email, HttpStatus.BAD_REQUEST);
        }

        String password = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty())
                ? dto.getPassword().trim()
                : "123@";

        Customer customer = Customer.builder()
                .customerFullName(dto.getCustomerFullName().trim())
                .telephone(dto.getTelephone().trim())
                .emailAddress(email)
                .customerBirthday(dto.getCustomerBirthday())
                .customerStatus(dto.getCustomerStatus() != null ? dto.getCustomerStatus() : 1)
                .password(password)
                .build();

        return toDTO(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDTO updateCustomer(Integer id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException("Customer not found with ID: " + id, HttpStatus.NOT_FOUND));

        String newEmail = dto.getEmailAddress().trim();
        if (!customer.getEmailAddress().equalsIgnoreCase(newEmail)) {
            if (newEmail.equalsIgnoreCase(staffEmail) || customerRepository.existsByEmailAddressIgnoreCase(newEmail)) {
                throw new AppException("Email already in use: " + newEmail, HttpStatus.BAD_REQUEST);
            }
            customer.setEmailAddress(newEmail);
        }

        customer.setCustomerFullName(dto.getCustomerFullName().trim());
        customer.setTelephone(dto.getTelephone().trim());
        customer.setCustomerBirthday(dto.getCustomerBirthday());

        if (dto.getCustomerStatus() != null) {
            customer.setCustomerStatus(dto.getCustomerStatus());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            customer.setPassword(dto.getPassword().trim());
        }

        return toDTO(customerRepository.save(customer));
    }

    @Transactional
    public Map<String, Object> deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException("Customer not found with ID: " + id, HttpStatus.NOT_FOUND));

        Map<String, Object> result = new HashMap<>();
        if (bookingReservationRepository.existsByCustomer_CustomerId(id)) {
            customer.setCustomerStatus(0);
            customerRepository.save(customer);
            result.put("action", "STATUS_CHANGED");
            result.put("message", "Customer has existing booking reservations, status changed to inactive (0)");
        } else {
            customerRepository.deleteById(id);
            result.put("action", "DELETED");
            result.put("message", "Customer deleted successfully");
        }
        return result;
    }

    public CustomerDTO getProfile(Integer customerId) {
        if (customerId == null) {
            throw new AppException("Customer ID not found", HttpStatus.BAD_REQUEST);
        }
        return getCustomerById(customerId);
    }

    @Transactional
    public CustomerDTO updateProfile(Integer customerId, CustomerDTO dto) {
        if (customerId == null) {
            throw new AppException("Customer ID not found", HttpStatus.BAD_REQUEST);
        }
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException("Customer not found", HttpStatus.NOT_FOUND));

        String newEmail = dto.getEmailAddress().trim();
        if (!customer.getEmailAddress().equalsIgnoreCase(newEmail)) {
            if (newEmail.equalsIgnoreCase(staffEmail) || customerRepository.existsByEmailAddressIgnoreCase(newEmail)) {
                throw new AppException("Email already in use: " + newEmail, HttpStatus.BAD_REQUEST);
            }
            customer.setEmailAddress(newEmail);
        }

        customer.setCustomerFullName(dto.getCustomerFullName().trim());
        customer.setTelephone(dto.getTelephone().trim());
        customer.setCustomerBirthday(dto.getCustomerBirthday());

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            customer.setPassword(dto.getPassword().trim());
        }

        return toDTO(customerRepository.save(customer));
    }

    private CustomerDTO toDTO(Customer c) {
        return CustomerDTO.builder()
                .customerId(c.getCustomerId())
                .customerFullName(c.getCustomerFullName())
                .telephone(c.getTelephone())
                .emailAddress(c.getEmailAddress())
                .customerBirthday(c.getCustomerBirthday())
                .customerStatus(c.getCustomerStatus())
                .password(c.getPassword())
                .build();
    }
}

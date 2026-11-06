/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.repository;

import com.lenhuthuy.fuminihotel.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByEmailAddressIgnoreCase(String emailAddress);

    boolean existsByEmailAddressIgnoreCase(String emailAddress);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.customerFullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.emailAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.telephone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.customerId ASC")
    List<Customer> searchCustomers(@Param("search") String search);
}

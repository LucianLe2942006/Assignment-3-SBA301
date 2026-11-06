/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.repository;

import com.lenhuthuy.fuminihotel.entity.BookingReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingReservationRepository extends JpaRepository<BookingReservation, Integer> {

    List<BookingReservation> findByCustomer_CustomerIdOrderByBookingDateDescBookingReservationIdDesc(Integer customerId);

    boolean existsByCustomer_CustomerId(Integer customerId);

    @Query("SELECT COALESCE(MAX(b.bookingReservationId), 0) FROM BookingReservation b")
    Integer findMaxBookingReservationId();

    @Query("SELECT DISTINCT b FROM BookingReservation b " +
           "LEFT JOIN FETCH b.customer c " +
           "LEFT JOIN FETCH b.bookingDetails d " +
           "LEFT JOIN FETCH d.roomInformation r " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "LOWER(c.customerFullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.emailAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(b.bookingReservationId AS string) LIKE CONCAT('%', :search, '%')) " +
           "AND (:status IS NULL OR b.bookingStatus = :status) " +
           "ORDER BY b.bookingDate DESC, b.bookingReservationId DESC")
    List<BookingReservation> searchBookings(
            @Param("search") String search,
            @Param("status") Integer status
    );
}

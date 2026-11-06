/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.controller;

import com.lenhuthuy.fuminihotel.dto.BookingReservationDTO;
import com.lenhuthuy.fuminihotel.security.AuthenticatedUser;
import com.lenhuthuy.fuminihotel.service.BookingReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingReservationController {

    private final BookingReservationService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingReservationDTO>> getAllBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer status
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(search, status));
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<BookingReservationDTO>> getMyBookingHistory(
            @AuthenticationPrincipal AuthenticatedUser currentUser
    ) {
        return ResponseEntity.ok(bookingService.getCustomerBookingHistory(currentUser.getCustomerId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingReservationDTO> getBookingById(
            @PathVariable Integer id,
            @AuthenticationPrincipal AuthenticatedUser currentUser
    ) {
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<BookingReservationDTO> createBooking(
            @Valid @RequestBody BookingReservationDTO dto,
            @AuthenticationPrincipal AuthenticatedUser currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(dto, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingReservationDTO> updateBooking(
            @PathVariable Integer id,
            @Valid @RequestBody BookingReservationDTO dto
    ) {
        return ResponseEntity.ok(bookingService.updateBooking(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable Integer id) {
        bookingService.deleteBooking(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking reservation deleted successfully");
        return ResponseEntity.ok(response);
    }
}

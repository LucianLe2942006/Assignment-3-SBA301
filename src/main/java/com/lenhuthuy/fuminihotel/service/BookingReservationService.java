package com.lenhuthuy.fuminihotel.service;

import com.lenhuthuy.fuminihotel.dto.BookingDetailDTO;
import com.lenhuthuy.fuminihotel.dto.BookingReservationDTO;
import com.lenhuthuy.fuminihotel.entity.*;
import com.lenhuthuy.fuminihotel.exception.AppException;
import com.lenhuthuy.fuminihotel.repository.BookingReservationRepository;
import com.lenhuthuy.fuminihotel.repository.CustomerRepository;
import com.lenhuthuy.fuminihotel.repository.RoomInformationRepository;
import com.lenhuthuy.fuminihotel.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingReservationService {

    private final BookingReservationRepository bookingReservationRepository;
    private final CustomerRepository customerRepository;
    private final RoomInformationRepository roomInformationRepository;

    public List<BookingReservationDTO> getAllBookings(String search, Integer status) {
        return bookingReservationRepository.searchBookings(search, status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookingReservationDTO> getCustomerBookingHistory(Integer customerId) {
        if (customerId == null) {
            throw new AppException("Customer ID is required", HttpStatus.BAD_REQUEST);
        }
        return bookingReservationRepository
                .findByCustomer_CustomerIdOrderByBookingDateDescBookingReservationIdDesc(customerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BookingReservationDTO getBookingById(Integer id, AuthenticatedUser currentUser) {
        BookingReservation booking = bookingReservationRepository.findById(id)
                .orElseThrow(() -> new AppException("Booking reservation not found with ID: " + id, HttpStatus.NOT_FOUND));

        if (currentUser != null && "CUSTOMER".equals(currentUser.getRole())) {
            if (!booking.getCustomer().getCustomerId().equals(currentUser.getCustomerId())) {
                throw new AppException("Not authorized to view this booking reservation", HttpStatus.FORBIDDEN);
            }
        }
        return toDTO(booking);
    }

    @Transactional
    public BookingReservationDTO createBooking(BookingReservationDTO dto, AuthenticatedUser currentUser) {
        final Integer targetCustomerId = (currentUser != null && "CUSTOMER".equals(currentUser.getRole()))
                ? currentUser.getCustomerId()
                : dto.getCustomerId();
        if (targetCustomerId == null) {
            throw new AppException("Customer ID is required", HttpStatus.BAD_REQUEST);
        }

        Customer customer = customerRepository.findById(targetCustomerId)
                .orElseThrow(() -> new AppException("Customer not found with ID: " + targetCustomerId, HttpStatus.NOT_FOUND));

        if (customer.getCustomerStatus() != null && customer.getCustomerStatus() == 0) {
            throw new AppException("Cannot create booking for an inactive customer", HttpStatus.BAD_REQUEST);
        }

        Integer nextId = dto.getBookingReservationId();
        if (nextId == null || nextId <= 0 || bookingReservationRepository.existsById(nextId)) {
            nextId = bookingReservationRepository.findMaxBookingReservationId() + 1;
        }

        BookingReservation reservation = BookingReservation.builder()
                .bookingReservationId(nextId)
                .bookingDate(dto.getBookingDate() != null ? dto.getBookingDate() : LocalDate.now())
                .customer(customer)
                .bookingStatus(dto.getBookingStatus() != null ? dto.getBookingStatus() : 1)
                .bookingDetails(new ArrayList<>())
                .build();

        BigDecimal totalPrice = buildAndValidateDetails(reservation, dto.getBookingDetails());
        reservation.setTotalPrice(totalPrice);

        BookingReservation saved = bookingReservationRepository.save(reservation);
        return toDTO(saved);
    }

    @Transactional
    public BookingReservationDTO updateBooking(Integer id, BookingReservationDTO dto) {
        BookingReservation reservation = bookingReservationRepository.findById(id)
                .orElseThrow(() -> new AppException("Booking reservation not found with ID: " + id, HttpStatus.NOT_FOUND));

        if (dto.getCustomerId() != null && !dto.getCustomerId().equals(reservation.getCustomer().getCustomerId())) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new AppException("Customer not found with ID: " + dto.getCustomerId(), HttpStatus.NOT_FOUND));
            reservation.setCustomer(customer);
        }

        if (dto.getBookingDate() != null) {
            reservation.setBookingDate(dto.getBookingDate());
        }
        if (dto.getBookingStatus() != null) {
            reservation.setBookingStatus(dto.getBookingStatus());
        }

        if (dto.getBookingDetails() != null && !dto.getBookingDetails().isEmpty()) {
            reservation.getBookingDetails().clear();
            BigDecimal totalPrice = buildAndValidateDetails(reservation, dto.getBookingDetails());
            reservation.setTotalPrice(totalPrice);
        }

        BookingReservation saved = bookingReservationRepository.save(reservation);
        return toDTO(saved);
    }

    @Transactional
    public void deleteBooking(Integer id) {
        if (!bookingReservationRepository.existsById(id)) {
            throw new AppException("Booking reservation not found with ID: " + id, HttpStatus.NOT_FOUND);
        }
        bookingReservationRepository.deleteById(id);
    }

    private BigDecimal buildAndValidateDetails(BookingReservation reservation, List<BookingDetailDTO> detailDTOs) {
        if (detailDTOs == null || detailDTOs.isEmpty()) {
            throw new AppException("Booking reservation must contain at least one room detail", HttpStatus.BAD_REQUEST);
        }

        Set<Integer> seenRoomIds = new HashSet<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (BookingDetailDTO item : detailDTOs) {
            if (item.getRoomId() == null) {
                throw new AppException("Room ID is required", HttpStatus.BAD_REQUEST);
            }
            if (!seenRoomIds.add(item.getRoomId())) {
                throw new AppException("Duplicate Room ID " + item.getRoomId() + " in booking reservation", HttpStatus.BAD_REQUEST);
            }
            if (item.getStartDate() == null || item.getEndDate() == null) {
                throw new AppException("StartDate and EndDate are required", HttpStatus.BAD_REQUEST);
            }
            if (item.getEndDate().isBefore(item.getStartDate())) {
                throw new AppException("EndDate must be on or after StartDate", HttpStatus.BAD_REQUEST);
            }

            RoomInformation room = roomInformationRepository.findById(item.getRoomId())
                    .orElseThrow(() -> new AppException("Room not found with ID: " + item.getRoomId(), HttpStatus.NOT_FOUND));

            BigDecimal unitPrice = (item.getActualPrice() != null && item.getActualPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? item.getActualPrice()
                    : (room.getRoomPricePerDay() != null ? room.getRoomPricePerDay() : BigDecimal.ZERO);

            long days = ChronoUnit.DAYS.between(item.getStartDate(), item.getEndDate());
            if (days <= 0) {
                days = 1;
            }

            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(days));
            totalPrice = totalPrice.add(lineTotal);

            BookingDetail detail = BookingDetail.builder()
                    .id(new BookingDetailId(reservation.getBookingReservationId(), room.getRoomId()))
                    .bookingReservation(reservation)
                    .roomInformation(room)
                    .startDate(item.getStartDate())
                    .endDate(item.getEndDate())
                    .actualPrice(unitPrice)
                    .build();

            reservation.getBookingDetails().add(detail);
        }

        return totalPrice;
    }

    private BookingReservationDTO toDTO(BookingReservation b) {
        List<BookingDetailDTO> details = b.getBookingDetails() == null ? List.of() :
                b.getBookingDetails().stream().map(d -> BookingDetailDTO.builder()
                        .bookingReservationId(b.getBookingReservationId())
                        .roomId(d.getRoomInformation() != null ? d.getRoomInformation().getRoomId() : d.getId().getRoomId())
                        .roomNumber(d.getRoomInformation() != null ? d.getRoomInformation().getRoomNumber() : null)
                        .roomTypeName(d.getRoomInformation() != null && d.getRoomInformation().getRoomType() != null
                                ? d.getRoomInformation().getRoomType().getRoomTypeName() : null)
                        .startDate(d.getStartDate())
                        .endDate(d.getEndDate())
                        .actualPrice(d.getActualPrice())
                        .build()
                ).collect(Collectors.toList());

        return BookingReservationDTO.builder()
                .bookingReservationId(b.getBookingReservationId())
                .bookingDate(b.getBookingDate())
                .totalPrice(b.getTotalPrice())
                .customerId(b.getCustomer() != null ? b.getCustomer().getCustomerId() : null)
                .customerFullName(b.getCustomer() != null ? b.getCustomer().getCustomerFullName() : null)
                .customerEmail(b.getCustomer() != null ? b.getCustomer().getEmailAddress() : null)
                .customerTelephone(b.getCustomer() != null ? b.getCustomer().getTelephone() : null)
                .bookingStatus(b.getBookingStatus())
                .bookingDetails(details)
                .build();
    }
}

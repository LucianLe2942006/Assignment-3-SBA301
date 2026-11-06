/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingReservationDTO {

    private Integer bookingReservationId;
    private LocalDate bookingDate;
    private BigDecimal totalPrice;
    private Integer customerId;
    private String customerFullName;
    private String customerEmail;
    private String customerTelephone;
    private Integer bookingStatus;

    @NotEmpty(message = "At least one booking detail is required")
    @Valid
    private List<BookingDetailDTO> bookingDetails;
}

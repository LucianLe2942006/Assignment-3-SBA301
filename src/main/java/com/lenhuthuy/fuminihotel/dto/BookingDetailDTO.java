package com.lenhuthuy.fuminihotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDetailDTO {

    private Integer bookingReservationId;

    @NotNull(message = "Room ID is required")
    private Integer roomId;

    private String roomNumber;
    private String roomTypeName;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private BigDecimal actualPrice;
}

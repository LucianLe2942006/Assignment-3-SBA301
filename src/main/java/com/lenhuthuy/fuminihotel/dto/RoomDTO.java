package com.lenhuthuy.fuminihotel.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {

    private Integer roomId;

    @NotBlank(message = "Room number is required")
    @Size(max = 50, message = "Room number must not exceed 50 characters")
    private String roomNumber;

    @Size(max = 220, message = "Room detail description must not exceed 220 characters")
    private String roomDetailDescription;

    @NotNull(message = "Room max capacity is required")
    @Min(value = 1, message = "Room max capacity must be at least 1")
    private Integer roomMaxCapacity;

    @NotNull(message = "Room type ID is required")
    private Integer roomTypeId;

    private String roomTypeName;
    private String typeDescription;

    private Integer roomStatus;

    @NotNull(message = "Room price per day is required")
    @DecimalMin(value = "0.01", message = "Room price per day must be greater than 0")
    private BigDecimal roomPricePerDay;
}

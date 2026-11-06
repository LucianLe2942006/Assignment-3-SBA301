/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeDTO {

    private Integer roomTypeId;

    @NotBlank(message = "Room type name is required")
    @Size(max = 50, message = "Room type name must not exceed 50 characters")
    private String roomTypeName;

    @Size(max = 250, message = "Type description must not exceed 250 characters")
    private String typeDescription;

    @Size(max = 250, message = "Type note must not exceed 250 characters")
    private String typeNote;
}

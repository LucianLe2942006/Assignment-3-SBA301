/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "RoomInformation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoomID")
    private Integer roomId;

    @Column(name = "RoomNumber", length = 50, nullable = false, columnDefinition = "nvarchar(50)")
    private String roomNumber;

    @Column(name = "RoomDetailDescription", length = 220, columnDefinition = "nvarchar(220)")
    private String roomDetailDescription;

    @Column(name = "RoomMaxCapacity")
    private Integer roomMaxCapacity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "RoomTypeID", nullable = false)
    private RoomType roomType;

    @Column(name = "RoomStatus", columnDefinition = "tinyint")
    private Integer roomStatus;

    @Column(name = "RoomPricePerDay", columnDefinition = "money")
    private BigDecimal roomPricePerDay;
}

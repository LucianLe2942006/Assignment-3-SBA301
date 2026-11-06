/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RoomType")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoomTypeID")
    private Integer roomTypeId;

    @Column(name = "RoomTypeName", length = 50, nullable = false, columnDefinition = "nvarchar(50)")
    private String roomTypeName;

    @Column(name = "TypeDescription", length = 250, columnDefinition = "nvarchar(250)")
    private String typeDescription;

    @Column(name = "TypeNote", length = 250, columnDefinition = "nvarchar(250)")
    private String typeNote;
}

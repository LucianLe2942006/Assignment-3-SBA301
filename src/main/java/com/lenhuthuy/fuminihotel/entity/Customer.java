package com.lenhuthuy.fuminihotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "Customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CustomerID")
    private Integer customerId;

    @Column(name = "CustomerFullName", length = 50, columnDefinition = "nvarchar(50)")
    private String customerFullName;

    @Column(name = "Telephone", length = 12, columnDefinition = "nvarchar(12)")
    private String telephone;

    @Column(name = "EmailAddress", length = 50, nullable = false, unique = true, columnDefinition = "nvarchar(50)")
    private String emailAddress;

    @Column(name = "CustomerBirthday")
    private LocalDate customerBirthday;

    @Column(name = "CustomerStatus", columnDefinition = "tinyint")
    private Integer customerStatus;

    @Column(name = "Password", length = 50, columnDefinition = "nvarchar(50)")
    private String password;
}

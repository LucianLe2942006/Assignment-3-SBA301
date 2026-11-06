package com.lenhuthuy.fuminihotel.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {

    private Integer customerId;

    @NotBlank(message = "Customer full name is required")
    @Size(max = 50, message = "Full name must not exceed 50 characters")
    private String customerFullName;

    @NotBlank(message = "Telephone is required")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "Telephone must be 9 to 12 digits")
    private String telephone;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    @Size(max = 50, message = "Email must not exceed 50 characters")
    private String emailAddress;

    @Past(message = "Birthday must be in the past")
    private LocalDate customerBirthday;

    private Integer customerStatus;

    @Size(max = 50, message = "Password must not exceed 50 characters")
    private String password;
}

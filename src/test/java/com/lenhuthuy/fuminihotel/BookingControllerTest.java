/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lenhuthuy.fuminihotel.dto.BookingDetailDTO;
import com.lenhuthuy.fuminihotel.dto.BookingReservationDTO;
import com.lenhuthuy.fuminihotel.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void testGetCustomerBookingHistory() throws Exception {
        String customerToken = jwtTokenProvider.generateToken(
                "WilliamShakespeare@FUMiniHotel.org", "CUSTOMER", 3, "William Shakespeare"
        );

        mockMvc.perform(get("/api/bookings/my-history")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testCreateAndDeleteMultiRoomBooking() throws Exception {
        String customerToken = jwtTokenProvider.generateToken(
                "WilliamShakespeare@FUMiniHotel.org", "CUSTOMER", 3, "William Shakespeare"
        );
        String staffToken = jwtTokenProvider.generateToken(
                "admin@FUMiniHotelSystem.com", "STAFF", null, "Hotel Staff"
        );

        BookingDetailDTO d1 = BookingDetailDTO.builder()
                .roomId(1)
                .startDate(LocalDate.of(2026, 12, 1))
                .endDate(LocalDate.of(2026, 12, 3))
                .build();
        BookingDetailDTO d2 = BookingDetailDTO.builder()
                .roomId(2)
                .startDate(LocalDate.of(2026, 12, 1))
                .endDate(LocalDate.of(2026, 12, 2))
                .build();

        BookingReservationDTO bookingReq = BookingReservationDTO.builder()
                .bookingDetails(List.of(d1, d2))
                .build();

        String body = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value(3))
                .andReturn().getResponse().getContentAsString();

        BookingReservationDTO created = objectMapper.readValue(body, BookingReservationDTO.class);

        mockMvc.perform(delete("/api/bookings/" + created.getBookingReservationId())
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());
    }
}

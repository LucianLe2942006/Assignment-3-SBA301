/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lenhuthuy.fuminihotel.dto.RoomDTO;
import com.lenhuthuy.fuminihotel.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void testGetAllRoomsWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetAllRoomTypesWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/room-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testCreateAndDeleteRoomAsStaff() throws Exception {
        String staffToken = jwtTokenProvider.generateToken("admin@FUMiniHotelSystem.com", "STAFF", null, "Hotel Staff");

        RoomDTO newRoom = RoomDTO.builder()
                .roomNumber("8888")
                .roomDetailDescription("Temporary Room for Test")
                .roomMaxCapacity(2)
                .roomTypeId(1)
                .roomStatus(1)
                .roomPricePerDay(new BigDecimal("120.00"))
                .build();

        String responseBody = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomNumber").value("8888"))
                .andReturn().getResponse().getContentAsString();

        RoomDTO created = objectMapper.readValue(responseBody, RoomDTO.class);

        mockMvc.perform(delete("/api/rooms/" + created.getRoomId())
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.action").value("DELETED"));
    }
}

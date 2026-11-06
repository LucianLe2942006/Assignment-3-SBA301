/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel;

import com.lenhuthuy.fuminihotel.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void testGetAllCustomersRequiresStaffRole() throws Exception {
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isUnauthorized());

        String customerToken = jwtTokenProvider.generateToken(
                "WilliamShakespeare@FUMiniHotel.org", "CUSTOMER", 3, "William Shakespeare"
        );
        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        String staffToken = jwtTokenProvider.generateToken(
                "admin@FUMiniHotelSystem.com", "STAFF", null, "Hotel Staff"
        );
        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testCustomerGetOwnProfile() throws Exception {
        String customerToken = jwtTokenProvider.generateToken(
                "WilliamShakespeare@FUMiniHotel.org", "CUSTOMER", 3, "William Shakespeare"
        );
        mockMvc.perform(get("/api/customers/profile")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailAddress").value("WilliamShakespeare@FUMiniHotel.org"));
    }
}

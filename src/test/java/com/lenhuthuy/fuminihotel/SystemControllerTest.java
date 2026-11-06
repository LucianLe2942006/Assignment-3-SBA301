/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SystemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testSystemStatus() throws Exception {
        mockMvc.perform(get("/api/system/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void testResetData() throws Exception {
        mockMvc.perform(post("/api/system/reset-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));
    }
}

/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.controller;

import com.lenhuthuy.fuminihotel.service.DatabaseResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final DatabaseResetService databaseResetService;

    @PostMapping("/reset-data")
    public ResponseEntity<Map<String, Object>> resetData() {
        databaseResetService.resetDatabaseToDefaultSeed();
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", 200);
        response.put("message", "Database has been reset to initial seed data successfully!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}

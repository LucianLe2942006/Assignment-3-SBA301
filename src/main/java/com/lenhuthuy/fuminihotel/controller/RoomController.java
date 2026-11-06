/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.controller;

import com.lenhuthuy.fuminihotel.dto.RoomDTO;
import com.lenhuthuy.fuminihotel.dto.RoomTypeDTO;
import com.lenhuthuy.fuminihotel.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDTO>> getAllRooms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer roomTypeId,
            @RequestParam(required = false) Integer status
    ) {
        return ResponseEntity.ok(roomService.getAllRooms(search, roomTypeId, status));
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomDTO> createRoom(@Valid @RequestBody RoomDTO dto) {
        RoomDTO created = roomService.createRoom(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Integer id, @Valid @RequestBody RoomDTO dto) {
        RoomDTO updated = roomService.updateRoom(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Map<String, Object>> deleteRoom(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.deleteRoom(id));
    }

    @GetMapping("/room-types")
    public ResponseEntity<List<RoomTypeDTO>> getAllRoomTypes() {
        return ResponseEntity.ok(roomService.getAllRoomTypes());
    }

    @GetMapping("/room-types/{id}")
    public ResponseEntity<RoomTypeDTO> getRoomTypeById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomTypeById(id));
    }

    @PostMapping("/room-types")
    public ResponseEntity<RoomTypeDTO> createRoomType(@Valid @RequestBody RoomTypeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoomType(dto));
    }

    @PutMapping("/room-types/{id}")
    public ResponseEntity<RoomTypeDTO> updateRoomType(@PathVariable Integer id, @Valid @RequestBody RoomTypeDTO dto) {
        return ResponseEntity.ok(roomService.updateRoomType(id, dto));
    }

    @DeleteMapping("/room-types/{id}")
    public ResponseEntity<Map<String, String>> deleteRoomType(@PathVariable Integer id) {
        roomService.deleteRoomType(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Room type deleted successfully");
        return ResponseEntity.ok(response);
    }
}

/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.service;

import com.lenhuthuy.fuminihotel.dto.RoomDTO;
import com.lenhuthuy.fuminihotel.dto.RoomTypeDTO;
import com.lenhuthuy.fuminihotel.entity.RoomInformation;
import com.lenhuthuy.fuminihotel.entity.RoomType;
import com.lenhuthuy.fuminihotel.exception.AppException;
import com.lenhuthuy.fuminihotel.repository.BookingDetailRepository;
import com.lenhuthuy.fuminihotel.repository.RoomInformationRepository;
import com.lenhuthuy.fuminihotel.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomInformationRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BookingDetailRepository bookingDetailRepository;

    public List<RoomDTO> getAllRooms(String search, Integer roomTypeId, Integer status) {
        return roomRepository.searchRooms(search, roomTypeId, status)
                .stream()
                .map(this::toRoomDTO)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(Integer id) {
        RoomInformation room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException("Room not found with ID: " + id, HttpStatus.NOT_FOUND));
        return toRoomDTO(room);
    }

    @Transactional
    public RoomDTO createRoom(RoomDTO dto) {
        String roomNumber = dto.getRoomNumber().trim();
        if (roomRepository.existsByRoomNumberIgnoreCase(roomNumber)) {
            throw new AppException("Room number already exists: " + roomNumber, HttpStatus.BAD_REQUEST);
        }

        RoomType roomType = roomTypeRepository.findById(dto.getRoomTypeId())
                .orElseThrow(() -> new AppException("RoomType not found with ID: " + dto.getRoomTypeId(), HttpStatus.NOT_FOUND));

        RoomInformation room = RoomInformation.builder()
                .roomNumber(roomNumber)
                .roomDetailDescription(dto.getRoomDetailDescription() != null ? dto.getRoomDetailDescription().trim() : "")
                .roomMaxCapacity(dto.getRoomMaxCapacity())
                .roomType(roomType)
                .roomStatus(dto.getRoomStatus() != null ? dto.getRoomStatus() : 1)
                .roomPricePerDay(dto.getRoomPricePerDay())
                .build();

        return toRoomDTO(roomRepository.save(room));
    }

    @Transactional
    public RoomDTO updateRoom(Integer id, RoomDTO dto) {
        RoomInformation room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException("Room not found with ID: " + id, HttpStatus.NOT_FOUND));

        String newRoomNumber = dto.getRoomNumber().trim();
        if (!room.getRoomNumber().equalsIgnoreCase(newRoomNumber) && roomRepository.existsByRoomNumberIgnoreCase(newRoomNumber)) {
            throw new AppException("Room number already exists: " + newRoomNumber, HttpStatus.BAD_REQUEST);
        }

        RoomType roomType = roomTypeRepository.findById(dto.getRoomTypeId())
                .orElseThrow(() -> new AppException("RoomType not found with ID: " + dto.getRoomTypeId(), HttpStatus.NOT_FOUND));

        room.setRoomNumber(newRoomNumber);
        room.setRoomDetailDescription(dto.getRoomDetailDescription() != null ? dto.getRoomDetailDescription().trim() : "");
        room.setRoomMaxCapacity(dto.getRoomMaxCapacity());
        room.setRoomType(roomType);
        if (dto.getRoomStatus() != null) {
            room.setRoomStatus(dto.getRoomStatus());
        }
        room.setRoomPricePerDay(dto.getRoomPricePerDay());

        return toRoomDTO(roomRepository.save(room));
    }

    @Transactional
    public Map<String, Object> deleteRoom(Integer id) {
        RoomInformation room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException("Room not found with ID: " + id, HttpStatus.NOT_FOUND));

        Map<String, Object> response = new HashMap<>();
        // Neu phong da nam trong BookingDetail thi chi doi status sang 0, nguoc lai xoa cung
        if (bookingDetailRepository.existsByRoomInformation_RoomId(id)) {
            room.setRoomStatus(0);
            roomRepository.save(room);
            response.put("action", "STATUS_CHANGED");
            response.put("roomId", id);
            response.put("newStatus", 0);
            response.put("message", "Room is referenced in booking details, status changed to inactive (0)");
        } else {
            roomRepository.deleteById(id);
            response.put("action", "DELETED");
            response.put("roomId", id);
            response.put("message", "Room deleted successfully");
        }
        return response;
    }

    public List<RoomTypeDTO> getAllRoomTypes() {
        return roomTypeRepository.findAll()
                .stream()
                .map(this::toRoomTypeDTO)
                .collect(Collectors.toList());
    }

    public RoomTypeDTO getRoomTypeById(Integer id) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppException("RoomType not found with ID: " + id, HttpStatus.NOT_FOUND));
        return toRoomTypeDTO(rt);
    }

    @Transactional
    public RoomTypeDTO createRoomType(RoomTypeDTO dto) {
        RoomType rt = RoomType.builder()
                .roomTypeName(dto.getRoomTypeName().trim())
                .typeDescription(dto.getTypeDescription())
                .typeNote(dto.getTypeNote())
                .build();
        return toRoomTypeDTO(roomTypeRepository.save(rt));
    }

    @Transactional
    public RoomTypeDTO updateRoomType(Integer id, RoomTypeDTO dto) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppException("RoomType not found with ID: " + id, HttpStatus.NOT_FOUND));
        rt.setRoomTypeName(dto.getRoomTypeName().trim());
        rt.setTypeDescription(dto.getTypeDescription());
        rt.setTypeNote(dto.getTypeNote());
        return toRoomTypeDTO(roomTypeRepository.save(rt));
    }

    @Transactional
    public void deleteRoomType(Integer id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new AppException("RoomType not found with ID: " + id, HttpStatus.NOT_FOUND);
        }
        if (roomRepository.existsByRoomType_RoomTypeId(id)) {
            throw new AppException("Cannot delete RoomType because it has associated rooms", HttpStatus.BAD_REQUEST);
        }
        roomTypeRepository.deleteById(id);
    }

    private RoomDTO toRoomDTO(RoomInformation r) {
        return RoomDTO.builder()
                .roomId(r.getRoomId())
                .roomNumber(r.getRoomNumber())
                .roomDetailDescription(r.getRoomDetailDescription())
                .roomMaxCapacity(r.getRoomMaxCapacity())
                .roomTypeId(r.getRoomType() != null ? r.getRoomType().getRoomTypeId() : null)
                .roomTypeName(r.getRoomType() != null ? r.getRoomType().getRoomTypeName() : null)
                .typeDescription(r.getRoomType() != null ? r.getRoomType().getTypeDescription() : null)
                .roomStatus(r.getRoomStatus())
                .roomPricePerDay(r.getRoomPricePerDay())
                .build();
    }

    private RoomTypeDTO toRoomTypeDTO(RoomType rt) {
        return RoomTypeDTO.builder()
                .roomTypeId(rt.getRoomTypeId())
                .roomTypeName(rt.getRoomTypeName())
                .typeDescription(rt.getTypeDescription())
                .typeNote(rt.getTypeNote())
                .build();
    }
}

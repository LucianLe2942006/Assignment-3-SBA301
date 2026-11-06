/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.repository;

import com.lenhuthuy.fuminihotel.entity.RoomInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomInformationRepository extends JpaRepository<RoomInformation, Integer> {

    boolean existsByRoomNumberIgnoreCase(String roomNumber);

    boolean existsByRoomType_RoomTypeId(Integer roomTypeId);

    @Query("SELECT r FROM RoomInformation r WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.roomDetailDescription) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.roomType.roomTypeName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:roomTypeId IS NULL OR r.roomType.roomTypeId = :roomTypeId) " +
           "AND (:status IS NULL OR r.roomStatus = :status) " +
           "ORDER BY r.roomId ASC")
    List<RoomInformation> searchRooms(
            @Param("search") String search,
            @Param("roomTypeId") Integer roomTypeId,
            @Param("status") Integer status
    );
}

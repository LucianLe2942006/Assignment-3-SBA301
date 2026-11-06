package com.lenhuthuy.fuminihotel.repository;

import com.lenhuthuy.fuminihotel.entity.BookingDetail;
import com.lenhuthuy.fuminihotel.entity.BookingDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, BookingDetailId> {

    boolean existsByRoomInformation_RoomId(Integer roomId);
}

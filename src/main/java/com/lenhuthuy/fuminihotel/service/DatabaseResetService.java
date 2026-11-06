/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.service;

import com.lenhuthuy.fuminihotel.repository.RoomTypeRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.Statement;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseResetService {

    private final JdbcTemplate jdbcTemplate;
    private final RoomTypeRepository roomTypeRepository;

    @PostConstruct
    public void initSeedIfEmpty() {
        try {
            if (roomTypeRepository.count() == 0) {
                resetDatabaseToDefaultSeed();
            }
        } catch (Exception e) {
            log.warn("Could not auto-seed on startup: {}", e.getMessage());
        }
    }

    @Transactional
    public void resetDatabaseToDefaultSeed() {
        log.info("Starting database reset to default seed data...");

        jdbcTemplate.execute((Connection connection) -> {
            try (Statement stmt = connection.createStatement()) {
                stmt.execute("DELETE FROM BookingDetail");
                stmt.execute("DELETE FROM BookingReservation");
                stmt.execute("DELETE FROM RoomInformation");
                stmt.execute("DELETE FROM RoomType");
                stmt.execute("DELETE FROM Customer");

                stmt.execute("SET IDENTITY_INSERT RoomType ON");
                stmt.execute("INSERT INTO RoomType (RoomTypeID, RoomTypeName, TypeDescription, TypeNote) VALUES " +
                        "(1, N'Standard room', N'This is typically the most affordable option and provides basic amenities such as a bed, dresser, and TV.', N'N/A'), " +
                        "(2, N'Suite', N'Suites usually offer more space and amenities than standard rooms, such as a separate living area, kitchenette, and multiple bedrooms.', N'N/A'), " +
                        "(3, N'Deluxe room', N'Deluxe rooms offer additional features such as a balcony or sea view, upgraded bedding, and improved décor.', N'N/A'), " +
                        "(4, N'Executive room', N'Executive rooms are designed for business travelers and offer perks such as free breakfast, evening drink, and high-speed internet.', N'N/A'), " +
                        "(5, N'Family Room', N'A room specifically designed to accommodate families, often with multiple beds and additional space for children.', N'N/A'), " +
                        "(6, N'Connecting Room', N'Two or more rooms with a connecting door, giving larger groups or families more space and privacy.', N'N/A'), " +
                        "(7, N'Penthouse Suite', N'An extravagant, top-floor suite with exceptional views and exclusive amenities, typically chosen for special occasions or VIP guests.', N'N/A'), " +
                        "(8, N'Bungalow', N'A standalone cottage-style accommodation, providing privacy and a sense of seclusion often within a resort setting.', N'N/A')");
                stmt.execute("SET IDENTITY_INSERT RoomType OFF");

                stmt.execute("SET IDENTITY_INSERT RoomInformation ON");
                stmt.execute("INSERT INTO RoomInformation (RoomID, RoomNumber, RoomDetailDescription, RoomMaxCapacity, RoomTypeID, RoomStatus, RoomPricePerDay) VALUES " +
                        "(1, N'2364', N'A basic room with essential amenities, suitable for individual travelers or couples.', 3, 1, 1, 149.0000), " +
                        "(2, N'3345', N'Deluxe rooms offer additional features such as a balcony or sea view, upgraded bedding, and improved décor.', 5, 3, 1, 299.0000), " +
                        "(3, N'4432', N'A luxurious and spacious room with separate living and sleeping areas, ideal for guests seeking extra comfort.', 4, 2, 1, 199.0000), " +
                        "(5, N'3342', N'Floor 3, Window in the NorthWest', 5, 5, 1, 219.0000), " +
                        "(7, N'4434', N'Floor 4, main window in the South', 4, 1, 1, 179.0000)");
                stmt.execute("SET IDENTITY_INSERT RoomInformation OFF");

                stmt.execute("SET IDENTITY_INSERT Customer ON");
                stmt.execute("INSERT INTO Customer (CustomerID, CustomerFullName, Telephone, EmailAddress, CustomerBirthday, CustomerStatus, Password) VALUES " +
                        "(3, N'William Shakespeare', N'0903939393', N'WilliamShakespeare@FUMiniHotel.org', CAST(N'1990-02-02' AS Date), 1, N'123@'), " +
                        "(5, N'Elizabeth Taylor', N'0903939377', N'ElizabethTaylor@FUMiniHotel.org', CAST(N'1991-03-03' AS Date), 1, N'144@'), " +
                        "(8, N'James Cameron', N'0903946582', N'JamesCameron@FUMiniHotel.org', CAST(N'1992-11-10' AS Date), 1, N'443@'), " +
                        "(9, N'Charles Dickens', N'0903955633', N'CharlesDickens@FUMiniHotel.org', CAST(N'1991-12-05' AS Date), 1, N'563@'), " +
                        "(10, N'George Orwell', N'0913933493', N'GeorgeOrwell@FUMiniHotel.org', CAST(N'1993-12-24' AS Date), 1, N'177@'), " +
                        "(11, N'Victoria Beckham', N'0983246773', N'VictoriaBeckham@FUMiniHotel.org', CAST(N'1990-09-09' AS Date), 1, N'654@')");
                stmt.execute("SET IDENTITY_INSERT Customer OFF");

                stmt.execute("INSERT INTO BookingReservation (BookingReservationID, BookingDate, TotalPrice, CustomerID, BookingStatus) VALUES " +
                        "(1, CAST(N'2023-12-20' AS Date), 378.0000, 3, 1), " +
                        "(2, CAST(N'2023-12-21' AS Date), 1075.0000, 3, 1)");

                stmt.execute("INSERT INTO BookingDetail (BookingReservationID, RoomID, StartDate, EndDate, ActualPrice) VALUES " +
                        "(1, 3, CAST(N'2024-01-01' AS Date), CAST(N'2024-01-02' AS Date), 199.0000), " +
                        "(1, 7, CAST(N'2024-01-01' AS Date), CAST(N'2024-01-02' AS Date), 179.0000), " +
                        "(2, 3, CAST(N'2024-01-05' AS Date), CAST(N'2024-01-06' AS Date), 199.0000), " +
                        "(2, 5, CAST(N'2024-01-05' AS Date), CAST(N'2024-01-09' AS Date), 219.0000)");
            }
            return null;
        });

        log.info("Database reset to default seed data completed successfully.");
    }
}

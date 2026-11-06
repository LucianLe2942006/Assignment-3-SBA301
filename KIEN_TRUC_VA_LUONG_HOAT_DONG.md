# TÀI LIỆU KIẾN TRÚC VÀ LUỒNG HOẠT ĐỘNG HỆ THỐNG
**Học phần:** SBA301 - Single Page Application with Spring Boot  
**Đề bài:** Assignment 03 - Securing REST Services with Spring Boot  
**Sinh viên thực hiện:** Lê Nhựt Huy - MSSV: CE200376 (Lớp SE1910)  
**Hệ thống:** FUMiniHotelSystem (`A3LeNhutHuy_SE1910`)  

---

## 1. Tổng quan Kiến trúc Hệ thống

Hệ thống được xây dựng theo mô hình 3-Layer Architecture kết hợp Spring Security + JWT và ReactJS:

- **Backend (`Port 8080`)**: Spring Boot 3, Spring Data JPA, Spring Security 6, JSON Web Token (`jjwt`), MS SQL Server (`A3LeNhutHuy_SE1910`).
- **Frontend (`Port 5173`)**: ReactJS + Vite + Axios (tự động đính kèm `Authorization: Bearer <token>` qua Request Interceptor).

---

## 2. Tài khoản Mặc định

| Vai trò | Nguồn lưu trữ | Email | Password |
| :--- | :--- | :--- | :--- |
| **Staff** (`STAFF`) | `application.properties` | `admin@FUMiniHotelSystem.com` | `@@abc123@@` |
| **Customer** (`CUSTOMER`) | Bảng `Customer` (SQL Server) | `WilliamShakespeare@FUMiniHotel.org` | `123@` |
| **Customer** (`CUSTOMER`) | Bảng `Customer` (SQL Server) | `ElizabethTaylor@FUMiniHotel.org` | `144@` |

---

## 3. Danh sách RESTful API & Phân quyền

| Controller | Endpoint | Quyền | Chức năng |
| :--- | :--- | :--- | :--- |
| `AuthController` | `POST /api/auth/login`<br>`POST /api/auth/register` | Public | Đăng nhập nhận JWT token; Đăng ký tài khoản Customer mới. |
| `RoomController` | `GET /api/rooms`<br>`GET /api/room-types` | Public | Xem danh sách phòng và loại phòng không cần đăng nhập. |
| | `POST /api/rooms`<br>`PUT /api/rooms/{id}`<br>`DELETE /api/rooms/{id}` | `ROLE_STAFF` | Thêm, sửa, xóa phòng. Nếu phòng chưa từng thuộc `BookingDetail` nào thì xóa khỏi DB; nếu đã có trong `BookingDetail` thì chuyển `RoomStatus = 0`. |
| `CustomerController` | `GET /api/customers`<br>`POST /api/customers`<br>`PUT /api/customers/{id}`<br>`DELETE /api/customers/{id}` | `ROLE_STAFF` | Quản lý danh sách khách hàng (CRUD & Search). |
| | `GET /api/customers/profile`<br>`PUT /api/customers/profile` | `ROLE_CUSTOMER` | Xem và cập nhật hồ sơ cá nhân của Customer đang đăng nhập. |
| `BookingReservationController` | `GET /api/bookings`<br>`PUT /api/bookings/{id}`<br>`DELETE /api/bookings/{id}` | `ROLE_STAFF` | Quản lý toàn bộ đơn đặt phòng (`BookingReservation` & `BookingDetail`). |
| | `POST /api/bookings`<br>`GET /api/bookings/my-history` | `ROLE_CUSTOMER` / `ROLE_STAFF` | Đặt một hoặc nhiều phòng trực tuyến; Xem lịch sử đặt phòng của Customer. |
| `SystemController` | `POST /api/system/reset-data` | Public | Khôi phục toàn bộ dữ liệu SQL Server về seed gốc. |

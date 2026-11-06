import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import Modal from "../components/common/Modal";
import { roomService } from "../services/roomService";
import { bookingService } from "../services/bookingService";

function PublicRoomsPage({ currentUser, onGoToLogin, onBookingSuccess, isEmbedded = false }) {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [roomData, typeData] = await Promise.all([
          roomService.getAll(searchTerm, selectedTypeId, ""),
          roomService.getRoomTypes()
        ]);
        setRooms(roomData);
        setRoomTypes(typeData);
      } catch (err) {
        setErrorMessage(err.message || "Failed to load room catalog.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [searchTerm, selectedTypeId]);

  const handleToggleSelectRoom = (room) => {
    if (!currentUser) {
      if (onGoToLogin) onGoToLogin();
      return;
    }
    const exists = selectedRooms.some((item) => item.roomId === room.roomId);
    if (exists) {
      setSelectedRooms(selectedRooms.filter((item) => item.roomId !== room.roomId));
    } else {
      setSelectedRooms([
        ...selectedRooms,
        {
          roomId: room.roomId,
          roomNumber: room.roomNumber,
          roomTypeName: room.roomTypeName,
          actualPrice: Number(room.roomPricePerDay || 0),
          startDate: todayStr,
          endDate: tomorrowStr
        }
      ]);
    }
  };

  const handleDateChange = (roomId, field, value) => {
    setSelectedRooms(
      selectedRooms.map((item) =>
        item.roomId === roomId ? { ...item, [field]: value } : item
      )
    );
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 1;
  };

  const totalAmount = selectedRooms.reduce(
    (sum, item) =>
      sum + item.actualPrice * calcDays(item.startDate, item.endDate),
    0
  );

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (selectedRooms.length === 0) return;

    try {
      setSubmitting(true);
      setErrorMessage("");
      const created = await bookingService.create({
        customerId: currentUser?.customerId || 3,
        bookingDetails: selectedRooms.map((item) => ({
          roomId: item.roomId,
          startDate: item.startDate,
          endDate: item.endDate,
          actualPrice: item.actualPrice
        }))
      });
      setSuccessMessage(
        `Online Booking #${created.bookingReservationId} created successfully! Total Price: $${Number(created.totalPrice).toFixed(2)}`
      );
      setSelectedRooms([]);
      setIsBookingModalOpen(false);
      if (onBookingSuccess) {
        setTimeout(() => onBookingSuccess(), 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to create booking reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Available Hotel Rooms</h2>
          <p className="page-subtitle">
            Browse room information without authentication or select multiple rooms to book online
          </p>
        </div>
        {selectedRooms.length > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsBookingModalOpen(true)}
          >
            Complete Booking ({selectedRooms.length} room(s) - ${totalAmount.toFixed(2)})
          </button>
        )}
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by room number, description, or room type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: "200px" }}
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
          >
            <option value="">All Room Types</option>
            {roomTypes.map((rt) => (
              <option key={rt.roomTypeId} value={rt.roomTypeId}>
                {rt.roomTypeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Description</th>
              <th>Max Capacity</th>
              <th>Price / Day</th>
              <th>Status</th>
              <th className="text-right">Online Booking</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Loading rooms...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No rooms found.
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const isSelected = selectedRooms.some(
                  (r) => r.roomId === room.roomId
                );
                const isAvailable = room.roomStatus === 1;

                return (
                  <tr key={room.roomId}>
                    <td className="font-medium">Room {room.roomNumber}</td>
                    <td>
                      <span className="badge badge-info">{room.roomTypeName}</span>
                    </td>
                    <td>{room.roomDetailDescription}</td>
                    <td>{room.roomMaxCapacity} guests</td>
                    <td className="font-medium">
                      ${Number(room.roomPricePerDay || 0).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isAvailable ? "badge-success" : "badge-secondary"
                        }`}
                      >
                        {isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          isSelected ? "btn-primary" : "btn-outline"
                        }`}
                        disabled={!isAvailable}
                        onClick={() => handleToggleSelectRoom(room)}
                      >
                        {!currentUser
                          ? "Sign In to Book"
                          : isSelected
                          ? "Selected (Remove)"
                          : "Select Room"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isBookingModalOpen}
        title="Confirm Online Booking Reservation"
        onClose={() => setIsBookingModalOpen(false)}
      >
        <form onSubmit={handleConfirmBooking}>
          {selectedRooms.map((item) => (
            <div
              key={item.roomId}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "10px",
                backgroundColor: "#f8fafc"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px"
                }}
              >
                <strong>
                  Room {item.roomNumber} ({item.roomTypeName}) - $
                  {item.actualPrice.toFixed(2)}/day
                </strong>
                <button
                  type="button"
                  className="btn btn-sm btn-danger-outline"
                  onClick={() =>
                    setSelectedRooms(
                      selectedRooms.filter((r) => r.roomId !== item.roomId)
                    )
                  }
                >
                  Remove
                </button>
              </div>
              <div className="form-row">
                <div className="form-group form-col" style={{ marginBottom: 0 }}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={item.startDate}
                    onChange={(e) =>
                      handleDateChange(item.roomId, "startDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group form-col" style={{ marginBottom: 0 }}>
                  <label>End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={item.endDate}
                    onChange={(e) =>
                      handleDateChange(item.roomId, "endDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#eff6ff",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 600
            }}
          >
            <span>Total Price ({selectedRooms.length} room(s)):</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsBookingModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || selectedRooms.length === 0}
            >
              {submitting ? "Submitting..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="admin-layout">
      <header className="app-header">
        <div className="header-brand">
          <img src={logo} alt="FUMiniHotel Logo" className="header-logo" />
          <span className="header-title">FUMiniHotelSystem - Public Room Catalog</span>
        </div>
        <div className="header-user-info">
          <button type="button" className="btn btn-primary" onClick={onGoToLogin}>
            Sign In / Register
          </button>
        </div>
      </header>
      <main className="admin-content">{content}</main>
    </div>
  );
}

export default PublicRoomsPage;

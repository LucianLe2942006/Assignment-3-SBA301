import { useState, useEffect } from "react";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { bookingService } from "../services/bookingService";
import { customerService } from "../services/customerService";
import { roomService } from "../services/roomService";

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [customerId, setCustomerId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStatus, setBookingStatus] = useState(1);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

  const fetchData = async (keyword = searchTerm, st = statusFilter) => {
    try {
      setLoading(true);
      const [bookingList, customerList, roomList] = await Promise.all([
        bookingService.getAll(keyword, st),
        customerService.getAll(""),
        roomService.getAll("", "", "")
      ]);
      setBookings(bookingList);
      setCustomers(customerList);
      setRooms(roomList);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load booking reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchTerm, statusFilter);
  }, [searchTerm, statusFilter]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedBooking(null);
    setCustomerId(customers[0]?.customerId || 3);
    setBookingDate(todayStr);
    setBookingStatus(1);
    const firstRoom = rooms[0];
    setBookingDetails(
      firstRoom
        ? [
            {
              roomId: firstRoom.roomId,
              startDate: todayStr,
              endDate: tomorrowStr,
              actualPrice: Number(firstRoom.roomPricePerDay || 150)
            }
          ]
        : []
    );
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (booking) => {
    setModalMode("update");
    setSelectedBooking(booking);
    setCustomerId(booking.customerId);
    setBookingDate(booking.bookingDate || todayStr);
    setBookingStatus(booking.bookingStatus ?? 1);
    setBookingDetails(
      (booking.bookingDetails || []).map((d) => ({
        roomId: d.roomId,
        startDate: d.startDate,
        endDate: d.endDate,
        actualPrice: Number(d.actualPrice || 0)
      }))
    );
    setFormError("");
    setIsModalOpen(true);
  };

  const handleAddDetailRow = () => {
    const usedIds = new Set(bookingDetails.map((d) => Number(d.roomId)));
    const nextRoom = rooms.find((r) => !usedIds.has(r.roomId)) || rooms[0];
    if (!nextRoom) return;

    setBookingDetails([
      ...bookingDetails,
      {
        roomId: nextRoom.roomId,
        startDate: todayStr,
        endDate: tomorrowStr,
        actualPrice: Number(nextRoom.roomPricePerDay || 150)
      }
    ]);
  };

  const handleRemoveDetailRow = (index) => {
    setBookingDetails(bookingDetails.filter((_, idx) => idx !== index));
  };

  const handleDetailChange = (index, field, value) => {
    setBookingDetails(
      bookingDetails.map((item, idx) => {
        if (idx !== index) return item;
        if (field === "roomId") {
          const foundRoom = rooms.find((r) => r.roomId === Number(value));
          return {
            ...item,
            roomId: Number(value),
            actualPrice: foundRoom
              ? Number(foundRoom.roomPricePerDay || 0)
              : item.actualPrice
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 1;
  };

  const totalPreview = bookingDetails.reduce(
    (sum, d) =>
      sum + Number(d.actualPrice || 0) * calcDays(d.startDate, d.endDate),
    0
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (bookingDetails.length === 0) {
      setFormError("At least one room detail is required.");
      return;
    }

    const payload = {
      customerId: Number(customerId),
      bookingDate,
      bookingStatus: Number(bookingStatus),
      bookingDetails: bookingDetails.map((d) => ({
        roomId: Number(d.roomId),
        startDate: d.startDate,
        endDate: d.endDate,
        actualPrice: Number(d.actualPrice)
      }))
    };

    try {
      if (modalMode === "create") {
        await bookingService.create(payload);
        setSuccessMessage("Booking reservation created successfully.");
      } else if (modalMode === "update" && selectedBooking) {
        await bookingService.update(
          selectedBooking.bookingReservationId,
          payload
        );
        setSuccessMessage("Booking reservation updated successfully.");
      }
      setIsModalOpen(false);
      fetchData(searchTerm, statusFilter);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setFormError(err.message || "Operation failed.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await bookingService.delete(deleteTarget.bookingReservationId);
      setSuccessMessage("Booking reservation deleted successfully.");
      setIsConfirmOpen(false);
      setDeleteTarget(null);
      fetchData(searchTerm, statusFilter);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Cannot delete booking reservation.");
      setIsConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Booking Reservation Management</h2>
          <p className="page-subtitle">
            Manage online and offline booking transactions and room details
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Create Booking
        </button>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by customer name, email, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: "180px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="1">Confirmed</option>
            <option value="0">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Booking Date</th>
              <th>Booked Rooms (StartDate - EndDate)</th>
              <th>Total Price</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Loading bookings...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No booking reservations found.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.bookingReservationId}>
                  <td className="font-medium">#{b.bookingReservationId}</td>
                  <td>
                    <div className="font-medium">{b.customerFullName}</div>
                    <div className="table-secondary-text">{b.customerEmail}</div>
                  </td>
                  <td>{b.bookingDate}</td>
                  <td>
                    {(b.bookingDetails || []).map((d) => (
                      <div
                        key={`${b.bookingReservationId}-${d.roomId}`}
                        style={{ fontSize: "13px", marginBottom: "4px" }}
                      >
                        <strong>Room {d.roomNumber}</strong> ({d.roomTypeName}):{" "}
                        {d.startDate} to {d.endDate} ($
                        {Number(d.actualPrice || 0).toFixed(2)}/day)
                      </div>
                    ))}
                  </td>
                  <td className="font-medium">
                    ${Number(b.totalPrice || 0).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        b.bookingStatus === 1
                          ? "badge-success"
                          : "badge-secondary"
                      }`}
                    >
                      {b.bookingStatus === 1 ? "Confirmed" : "Cancelled"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleOpenEdit(b)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger-outline"
                        onClick={() => {
                          setDeleteTarget(b);
                          setIsConfirmOpen(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={
          modalMode === "create"
            ? "Create Booking Reservation"
            : `Update Booking #${selectedBooking?.bookingReservationId}`
        }
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="alert alert-error">{formError}</div>}

          <div className="form-group">
            <label>Customer</label>
            <select
              className="form-select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.customerFullName} ({c.emailAddress})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label>Booking Date</label>
              <input
                type="date"
                className="form-input"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>

            <div className="form-group form-col">
              <label>Status</label>
              <select
                className="form-select"
                value={bookingStatus}
                onChange={(e) => setBookingStatus(Number(e.target.value))}
              >
                <option value={1}>Confirmed</option>
                <option value={0}>Cancelled</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px"
            }}
          >
            <strong>Booking Details (Rooms)</strong>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleAddDetailRow}
            >
              + Add Room
            </button>
          </div>

          {bookingDetails.map((d, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "10px",
                backgroundColor: "#f8fafc"
              }}
            >
              <div className="form-row">
                <div className="form-group form-col">
                  <label>Room</label>
                  <select
                    className="form-select"
                    value={d.roomId}
                    onChange={(e) =>
                      handleDetailChange(index, "roomId", e.target.value)
                    }
                  >
                    {rooms.map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        Room {r.roomNumber} ({r.roomTypeName}) - $
                        {Number(r.roomPricePerDay).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group form-col">
                  <label>Price/Day ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={d.actualPrice}
                    onChange={(e) =>
                      handleDetailChange(index, "actualPrice", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-row" style={{ alignItems: "flex-end" }}>
                <div className="form-group form-col" style={{ marginBottom: 0 }}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={d.startDate}
                    onChange={(e) =>
                      handleDetailChange(index, "startDate", e.target.value)
                    }
                  />
                </div>

                <div className="form-group form-col" style={{ marginBottom: 0 }}>
                  <label>End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={d.endDate}
                    onChange={(e) =>
                      handleDetailChange(index, "endDate", e.target.value)
                    }
                  />
                </div>

                {bookingDetails.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger-outline"
                    onClick={() => handleRemoveDetailRow(index)}
                  >
                    Remove
                  </button>
                )}
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
            <span>Estimated Total Price:</span>
            <span>${totalPreview.toFixed(2)}</span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {modalMode === "create" ? "Create Booking" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Booking Reservation"
        message={`Are you sure you want to delete Booking #${deleteTarget?.bookingReservationId}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default BookingManagement;

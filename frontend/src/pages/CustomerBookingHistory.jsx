import { useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";

function CustomerBookingHistory({ onBookMore }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getMyHistory();
        setBookings(data);
      } catch (err) {
        setErrorMessage(err.message || "Failed to load booking history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>My Booking Reservation History</h2>
          <p className="page-subtitle">View your past and active room reservations</p>
        </div>
        {onBookMore && (
          <button type="button" className="btn btn-primary" onClick={onBookMore}>
            + New Online Booking
          </button>
        )}
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Booking Date</th>
              <th>Room Details (StartDate - EndDate)</th>
              <th>Total Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  Loading booking history...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  You have no booking reservations yet.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.bookingReservationId}>
                  <td className="font-medium">#{b.bookingReservationId}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerBookingHistory;

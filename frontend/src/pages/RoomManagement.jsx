import { useState, useEffect } from "react";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { roomService } from "../services/roomService";

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTypeId, setFilterTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomDetailDescription: "",
    roomMaxCapacity: 2,
    roomTypeId: 1,
    roomStatus: 1,
    roomPricePerDay: 150
  });
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchRooms = async (keyword = searchTerm, typeId = filterTypeId) => {
    try {
      setLoading(true);
      const [roomData, typeData] = await Promise.all([
        roomService.getAll(keyword, typeId, ""),
        roomService.getRoomTypes()
      ]);
      setRooms(roomData);
      setRoomTypes(typeData);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(searchTerm, filterTypeId);
  }, [searchTerm, filterTypeId]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedRoom(null);
    setFormData({
      roomNumber: "",
      roomDetailDescription: "",
      roomMaxCapacity: 2,
      roomTypeId: roomTypes[0]?.roomTypeId || 1,
      roomStatus: 1,
      roomPricePerDay: 150
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setModalMode("update");
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber || "",
      roomDetailDescription: room.roomDetailDescription || "",
      roomMaxCapacity: room.roomMaxCapacity || 1,
      roomTypeId: room.roomTypeId || 1,
      roomStatus: room.roomStatus ?? 1,
      roomPricePerDay: room.roomPricePerDay || 100
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    setFormError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const trimmedNumber = formData.roomNumber.trim();
    if (!trimmedNumber) {
      setFormError("Room number is required.");
      return;
    }

    const payload = {
      roomNumber: trimmedNumber,
      roomDetailDescription: formData.roomDetailDescription.trim(),
      roomMaxCapacity: Number(formData.roomMaxCapacity),
      roomTypeId: Number(formData.roomTypeId),
      roomStatus: Number(formData.roomStatus),
      roomPricePerDay: Number(formData.roomPricePerDay)
    };

    try {
      if (modalMode === "create") {
        await roomService.create(payload);
        setSuccessMessage("Room created successfully.");
      } else if (modalMode === "update" && selectedRoom) {
        await roomService.update(selectedRoom.roomId, payload);
        setSuccessMessage("Room updated successfully.");
      }
      handleCloseModal();
      fetchRooms(searchTerm, filterTypeId);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setFormError(err.message || "Operation failed.");
    }
  };

  const handleOpenDelete = (room) => {
    setErrorMessage("");
    setDeleteTarget(room);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await roomService.delete(deleteTarget.roomId);
      setSuccessMessage(res.message || "Room deleted successfully.");
      setIsConfirmOpen(false);
      setDeleteTarget(null);
      fetchRooms(searchTerm, filterTypeId);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Cannot delete this room.");
      setIsConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Room Management</h2>
          <p className="page-subtitle">
            Manage hotel rooms and pricing. Rooms with existing booking transactions will be set to Inactive on delete.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Create Room
        </button>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by room number, description, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: "200px" }}
            value={filterTypeId}
            onChange={(e) => setFilterTypeId(e.target.value)}
          >
            <option value="">All Room Types</option>
            {roomTypes.map((rt) => (
              <option key={rt.roomTypeId} value={rt.roomTypeId}>
                {rt.roomTypeName}
              </option>
            ))}
          </select>
          {(searchTerm || filterTypeId) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm("");
                setFilterTypeId("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Description</th>
              <th>Max Capacity</th>
              <th>Price / Day</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  Loading rooms...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  No rooms found.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.roomId}>
                  <td>#{room.roomId}</td>
                  <td className="font-medium">Room {room.roomNumber}</td>
                  <td>
                    <span className="badge badge-info">{room.roomTypeName}</span>
                  </td>
                  <td>{room.roomDetailDescription}</td>
                  <td>{room.roomMaxCapacity}</td>
                  <td className="font-medium">
                    ${Number(room.roomPricePerDay || 0).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        room.roomStatus === 1 ? "badge-success" : "badge-secondary"
                      }`}
                    >
                      {room.roomStatus === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleOpenEdit(room)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger-outline"
                        onClick={() => handleOpenDelete(room)}
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
        title={modalMode === "create" ? "Create New Room" : "Update Room"}
        onClose={handleCloseModal}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="alert alert-error">{formError}</div>}

          <div className="form-row">
            <div className="form-group form-col">
              <label>Room Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter room number"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              />
            </div>

            <div className="form-group form-col">
              <label>Room Type</label>
              <select
                className="form-select"
                value={formData.roomTypeId}
                onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
              >
                {roomTypes.map((rt) => (
                  <option key={rt.roomTypeId} value={rt.roomTypeId}>
                    {rt.roomTypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label>Max Capacity</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.roomMaxCapacity}
                onChange={(e) =>
                  setFormData({ ...formData, roomMaxCapacity: e.target.value })
                }
              />
            </div>

            <div className="form-group form-col">
              <label>Price Per Day ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={formData.roomPricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, roomPricePerDay: e.target.value })
                }
              />
            </div>

            <div className="form-group form-col">
              <label>Status</label>
              <select
                className="form-select"
                value={formData.roomStatus}
                onChange={(e) =>
                  setFormData({ ...formData, roomStatus: Number(e.target.value) })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Enter room detail description"
              value={formData.roomDetailDescription}
              onChange={(e) =>
                setFormData({ ...formData, roomDetailDescription: e.target.value })
              }
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {modalMode === "create" ? "Create" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Room"
        message={`Are you sure you want to delete Room "${deleteTarget?.roomNumber}"? If this room belongs to a booking detail, its status will be changed to Inactive.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default RoomManagement;

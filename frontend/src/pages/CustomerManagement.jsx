import { useState, useEffect } from "react";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { customerService } from "../services/customerService";

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    customerFullName: "",
    telephone: "",
    emailAddress: "",
    customerBirthday: "1995-01-01",
    customerStatus: 1,
    password: "123@"
  });
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchCustomers = async (keyword = "") => {
    try {
      setLoading(true);
      const data = await customerService.getAll(keyword);
      setCustomers(data);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchTerm);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedCustomer(null);
    setFormData({
      customerFullName: "",
      telephone: "",
      emailAddress: "",
      customerBirthday: "1995-01-01",
      customerStatus: 1,
      password: "123@"
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setModalMode("update");
    setSelectedCustomer(customer);
    setFormData({
      customerFullName: customer.customerFullName || "",
      telephone: customer.telephone || "",
      emailAddress: customer.emailAddress || "",
      customerBirthday: customer.customerBirthday || "1995-01-01",
      customerStatus: customer.customerStatus ?? 1,
      password: customer.password || ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setFormError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.customerFullName.trim() ||
      !formData.telephone.trim() ||
      !formData.emailAddress.trim()
    ) {
      setFormError("Full name, telephone, and email are required.");
      return;
    }

    const payload = {
      customerFullName: formData.customerFullName.trim(),
      telephone: formData.telephone.trim(),
      emailAddress: formData.emailAddress.trim(),
      customerBirthday: formData.customerBirthday,
      customerStatus: Number(formData.customerStatus),
      password: formData.password.trim()
    };

    try {
      if (modalMode === "create") {
        await customerService.create(payload);
        setSuccessMessage("Customer created successfully.");
      } else if (modalMode === "update" && selectedCustomer) {
        await customerService.update(selectedCustomer.customerId, payload);
        setSuccessMessage("Customer updated successfully.");
      }
      handleCloseModal();
      fetchCustomers(searchTerm);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setFormError(err.message || "Operation failed.");
    }
  };

  const handleOpenDelete = (customer) => {
    setErrorMessage("");
    setDeleteTarget(customer);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await customerService.delete(deleteTarget.customerId);
      setSuccessMessage(res.message || "Customer deleted successfully.");
      setIsConfirmOpen(false);
      setDeleteTarget(null);
      fetchCustomers(searchTerm);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Cannot delete customer.");
      setIsConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Customer Management</h2>
          <p className="page-subtitle">Manage registered hotel customers and contact records</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Create Customer
        </button>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="table-controls">
        <div className="search-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search customer by name, email, or telephone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchTerm("")}
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
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Telephone</th>
              <th>Birthday</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.customerId}>
                  <td>#{customer.customerId}</td>
                  <td className="font-medium">{customer.customerFullName}</td>
                  <td>{customer.emailAddress}</td>
                  <td>{customer.telephone}</td>
                  <td>{customer.customerBirthday}</td>
                  <td>
                    <span
                      className={`badge ${
                        customer.customerStatus === 1
                          ? "badge-success"
                          : "badge-secondary"
                      }`}
                    >
                      {customer.customerStatus === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleOpenEdit(customer)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger-outline"
                        onClick={() => handleOpenDelete(customer)}
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
        title={modalMode === "create" ? "Create New Customer" : "Update Customer"}
        onClose={handleCloseModal}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="alert alert-error">{formError}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.customerFullName}
              onChange={(e) =>
                setFormData({ ...formData, customerFullName: e.target.value })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label>Telephone</label>
              <input
                type="text"
                className="form-input"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
              />
            </div>

            <div className="form-group form-col">
              <label>Birthday</label>
              <input
                type="date"
                className="form-input"
                value={formData.customerBirthday}
                onChange={(e) =>
                  setFormData({ ...formData, customerBirthday: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.emailAddress}
              onChange={(e) =>
                setFormData({ ...formData, emailAddress: e.target.value })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label>Password</label>
              <input
                type="text"
                className="form-input"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="form-group form-col">
              <label>Status</label>
              <select
                className="form-select"
                value={formData.customerStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerStatus: Number(e.target.value)
                  })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
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
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${deleteTarget?.customerFullName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default CustomerManagement;

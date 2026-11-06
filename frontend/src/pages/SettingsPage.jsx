import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";
import { systemService } from "../services/systemService";

function SettingsPage({ currentUser, onUserUpdated }) {
  const isCustomer = currentUser?.role === "CUSTOMER";

  const [profileForm, setProfileForm] = useState({
    customerFullName: "",
    telephone: "",
    emailAddress: "",
    customerBirthday: "1990-01-01",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isCustomer) return;
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await customerService.getProfile();
        setProfileForm({
          customerFullName: data.customerFullName || "",
          telephone: data.telephone || "",
          emailAddress: data.emailAddress || "",
          customerBirthday: data.customerBirthday || "1990-01-01",
          password: data.password || ""
        });
      } catch (err) {
        setErrorMessage(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [isCustomer]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const updated = await customerService.updateProfile({
        customerFullName: profileForm.customerFullName.trim(),
        telephone: profileForm.telephone.trim(),
        emailAddress: profileForm.emailAddress.trim(),
        customerBirthday: profileForm.customerBirthday,
        password: profileForm.password.trim()
      });
      setSuccessMessage("Profile updated successfully.");
      if (onUserUpdated && currentUser) {
        const updatedUser = {
          ...currentUser,
          fullName: updated.customerFullName,
          email: updated.emailAddress
        };
        localStorage.setItem("fuminihotel_auth", JSON.stringify(updatedUser));
        onUserUpdated(updatedUser);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to update profile.");
    }
  };

  const handleResetDatabase = async () => {
    try {
      setResetting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await systemService.resetDatabase();
      setSuccessMessage(res.message || "Database reset to default seed data.");
    } catch (err) {
      setErrorMessage(err.message || "Failed to reset database.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>{isCustomer ? "My Profile & Settings" : "System Information"}</h2>
          <p className="page-subtitle">
            {isCustomer
              ? "Manage your personal customer profile information"
              : "View current authenticated session details and reset seed data"}
          </p>
        </div>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="settings-grid">
        {isCustomer ? (
          <div className="settings-card">
            <h3>Customer Profile Details</h3>
            {loading ? (
              <div className="empty-state">Loading profile...</div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.customerFullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        customerFullName: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group form-col">
                    <label>Telephone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.telephone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          telephone: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group form-col">
                    <label>Birthday</label>
                    <input
                      type="date"
                      className="form-input"
                      value={profileForm.customerBirthday}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          customerBirthday: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileForm.emailAddress}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        emailAddress: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.password}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        password: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Profile Changes
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="settings-card">
            <h3>Active Staff Session</h3>
            <div className="profile-details">
              <div className="profile-row">
                <span className="profile-label">Account Name</span>
                <span className="profile-value">{currentUser?.fullName}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email Address</span>
                <span className="profile-value">{currentUser?.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Role</span>
                <span className="profile-value">{currentUser?.role}</span>
              </div>
            </div>
          </div>
        )}

        <div className="settings-card">
          <h3>Database Seed Reset</h3>
          <p className="settings-description">
            Restore all RoomTypes, RoomInformation, Customers, BookingReservations, and BookingDetails to default seed data.
          </p>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleResetDatabase}
            disabled={resetting}
          >
            {resetting ? "Resetting..." : "Reset Database to Default Seed Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

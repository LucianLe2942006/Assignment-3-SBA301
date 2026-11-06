import { useState } from "react";
import logo from "../assets/logo.png";
import { authService } from "../services/authService";

function LoginPage({ onLogin, onGuestView }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [regForm, setRegForm] = useState({
    customerFullName: "",
    telephone: "",
    emailAddress: "",
    customerBirthday: "2000-01-01",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await authService.login(trimmedEmail, trimmedPass);
      localStorage.setItem("fuminihotel_auth", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (
      !regForm.customerFullName.trim() ||
      !regForm.telephone.trim() ||
      !regForm.emailAddress.trim() ||
      !regForm.password.trim()
    ) {
      setError("Please fill in all required registration fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await authService.register({
        customerFullName: regForm.customerFullName.trim(),
        telephone: regForm.telephone.trim(),
        emailAddress: regForm.emailAddress.trim(),
        customerBirthday: regForm.customerBirthday,
        password: regForm.password.trim()
      });
      localStorage.setItem("fuminihotel_auth", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="FUMiniHotel Logo" className="login-logo" />
          <h2>FUMiniHotelSystem</h2>
          <p className="login-subtitle">
            {isRegisterMode
              ? "Register a new Customer account"
              : "Sign in to access hotel management & booking portal"}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!isRegisterMode ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError("");
                }}
              >
                Create New Customer Account
              </button>

              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={onGuestView}
              >
                Browse Hotel Rooms (Public Mode)
              </button>
            </div>

            <div className="login-hint">
              <div><strong>Staff:</strong> admin@FUMiniHotelSystem.com / @@abc123@@</div>
              <div><strong>Customer:</strong> WilliamShakespeare@FUMiniHotel.org / 123@</div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter full name"
                value={regForm.customerFullName}
                onChange={(e) => setRegForm({ ...regForm, customerFullName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label>Telephone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0901234567"
                  value={regForm.telephone}
                  onChange={(e) => setRegForm({ ...regForm, telephone: e.target.value })}
                />
              </div>

              <div className="form-group form-col">
                <label>Birthday</label>
                <input
                  type="date"
                  className="form-input"
                  value={regForm.customerBirthday}
                  onChange={(e) => setRegForm({ ...regForm, customerBirthday: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter email address"
                value={regForm.emailAddress}
                onChange={(e) => setRegForm({ ...regForm, emailAddress: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Registering..." : "Register Account"}
            </button>

            <div style={{ marginTop: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError("");
                }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;

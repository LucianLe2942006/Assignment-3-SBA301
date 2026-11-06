import logo from "../../assets/logo.png";

function Header({ currentUser, onLogout, onOpenPublicView }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <img src={logo} alt="FUMiniHotel Logo" className="header-logo" />
        <span className="header-title">FUMiniHotelSystem</span>
      </div>
      <div className="header-user-info" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {onOpenPublicView && (
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={onOpenPublicView}
            style={{ fontSize: "0.85rem" }}
          >
            Public Room Catalog
          </button>
        )}
        <span className="user-badge">
          {currentUser?.fullName || currentUser?.email || "User"} ({currentUser?.role})
        </span>
        <button type="button" className="btn btn-outline" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;

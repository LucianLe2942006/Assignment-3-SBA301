function Sidebar({ activeMenu, onSelectMenu, currentUser }) {
  const isStaff = currentUser?.role === "STAFF";

  const menuItems = isStaff
    ? [
        { key: "rooms", label: "Room Information" },
        { key: "customers", label: "Customer Accounts" },
        { key: "bookings", label: "Booking Reservations" },
        { key: "settings", label: "System Info" }
      ]
    : [
        { key: "book-online", label: "Book Rooms Online" },
        { key: "my-history", label: "Booking History" },
        { key: "settings", label: "My Profile & Settings" }
      ];

  return (
    <aside className="app-sidebar">
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155" }}>
        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>
          {isStaff ? "Staff Management Portal" : "Customer Portal"}
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`nav-item ${activeMenu === item.key ? "active" : ""}`}
            onClick={() => onSelectMenu(item.key)}
          >
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import PublicRoomsPage from "./pages/PublicRoomsPage";
import AdminLayout from "./components/layout/AdminLayout";
import RoomManagement from "./pages/RoomManagement";
import CustomerManagement from "./pages/CustomerManagement";
import BookingManagement from "./pages/BookingManagement";
import CustomerBookingHistory from "./pages/CustomerBookingHistory";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fuminihotel_auth");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isGuestMode, setIsGuestMode] = useState(false);

  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      const saved = localStorage.getItem("fuminihotel_auth");
      const user = saved ? JSON.parse(saved) : null;
      return user?.role === "STAFF" ? "rooms" : "book-online";
    } catch {
      return "book-online";
    }
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsGuestMode(false);
    if (user.role === "STAFF") {
      setActiveMenu("rooms");
    } else {
      setActiveMenu("book-online");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("fuminihotel_auth");
    setIsGuestMode(false);
  };

  if (isGuestMode) {
    return (
      <PublicRoomsPage
        currentUser={null}
        onGoToLogin={() => setIsGuestMode(false)}
      />
    );
  }

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onGuestView={() => setIsGuestMode(true)}
      />
    );
  }

  return (
    <AdminLayout
      currentUser={currentUser}
      onLogout={handleLogout}
      activeMenu={activeMenu}
      onSelectMenu={setActiveMenu}
      onOpenPublicView={() => setIsGuestMode(true)}
    >
      {activeMenu === "rooms" && <RoomManagement />}
      {activeMenu === "customers" && <CustomerManagement />}
      {activeMenu === "bookings" && <BookingManagement />}
      {activeMenu === "book-online" && (
        <PublicRoomsPage
          currentUser={currentUser}
          isEmbedded={true}
          onBookingSuccess={() => setActiveMenu("my-history")}
        />
      )}
      {activeMenu === "my-history" && (
        <CustomerBookingHistory
          onBookMore={() => setActiveMenu("book-online")}
        />
      )}
      {activeMenu === "settings" && (
        <SettingsPage
          currentUser={currentUser}
          onUserUpdated={setCurrentUser}
        />
      )}
    </AdminLayout>
  );
}

export default App;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DriverNavbar.css";

export default function DriverNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("driver");
      navigate("/driver/login");
    }
  };

  return (
    <nav className="driver-navbar">
      <div 
        className="driver-nav-left" 
        onClick={() => navigate("/driver/dashboard")}
        style={{ cursor: "pointer" }}
      >
        🚕 Weefly
      </div>

      <button className="driver-menu-toggle" onClick={toggleMenu}>
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`driver-nav-right ${menuOpen ? "active" : ""}`}>
        <button
          onClick={() => {
            navigate("/driver/dashboard");
            setMenuOpen(false);
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => {
            navigate("/driver/orders");
            setMenuOpen(false);
          }}
        >
          Orders
        </button>
        <button
          onClick={() => {
            navigate("/driver/profile");
            setMenuOpen(false);
          }}
        >
          Profile
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

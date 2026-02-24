import "./DriverNavbar.css";

import { useNavigate } from "react-router-dom";

export default function DriverNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      localStorage.removeItem("driver");
      navigate("/driver/login");
    }
  };

  return (
    <nav className="driver-navbar">
      <div className="driver-nav-left">
    🚕 Weefly
  </div>

      <div className="driver-nav-right">
  <button onClick={() => navigate("/driver/orders")}>Orders</button>
  <button onClick={() => navigate("/driver/profile")}>Profile</button>
  <button onClick={handleLogout} className="logout-btn">
    Logout
  </button>
</div>

    </nav>
  );
}

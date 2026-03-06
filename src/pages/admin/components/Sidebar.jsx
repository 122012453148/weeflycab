import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  const handleNav = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <button className="admin-hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>Cab Admin</h2>

        <ul>
          <li onClick={() => handleNav("/admin/dashboard")}>Dashboard</li>
          <li onClick={() => handleNav("/admin/users")}>Users</li>
          <li onClick={() => handleNav("/admin/drivers")}>Drivers</li>
          <li onClick={() => handleNav("/admin/bookings")}>Bookings</li>
          <li onClick={() => handleNav("/admin/earnings")}>Earnings</li>
          <li onClick={() => handleNav("/admin/vehicles")}>Vehicle Types</li>
          <li onClick={() => handleNav("/admin/reports")}>Reports</li>
          <li onClick={logout}>Logout</li>
        </ul>
      </div>
    </>
  );
}

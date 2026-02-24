import { useNavigate } from "react-router-dom";



export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  return (
    <div className="sidebar">
      <h2>Cab Admin</h2>

      <ul>
  <li onClick={() => navigate("/admin/dashboard")}>Dashboard</li>
  <li onClick={() => navigate("/admin/users")}>Users</li>
  <li onClick={() => navigate("/admin/drivers")}>Drivers</li>
  <li onClick={() => navigate("/admin/bookings")}>Bookings</li>
  <li onClick={() => navigate("/admin/dashboard")}>Earnings</li>
  <li onClick={() => navigate("/admin/dashboard")}>Vehicle Types</li>
  <li onClick={() => navigate("/admin/dashboard")}>Reports</li>
  <li onClick={logout}>Logout</li>
</ul>

    </div>
  );
}

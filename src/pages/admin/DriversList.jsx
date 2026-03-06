import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";
import Sidebar from "./components/Sidebar";
import "./css/admin.css";

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await API.get("/admin/drivers");
      setDrivers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h2>🚕 Registered Drivers</h2>
          <p>View driver performance, contact info, and total earnings.</p>
        </div>

        {loading ? (
          <div className="admin-loading">Loading drivers...</div>
        ) : (
          <div className="table-section">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Car Number</th>
                  <th>Total Rides</th>
                  <th>Total Earnings</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver._id}>
                    <td>{driver.name}</td>
                    <td>{driver.phone}</td>
                    <td><span className="car-badge">{driver.carNumber || "N/A"}</span></td>
                    <td>{driver.totalRides || 0}</td>
                    <td>₹{driver.totalEarnings || 0}</td>
                    <td>{new Date(driver.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

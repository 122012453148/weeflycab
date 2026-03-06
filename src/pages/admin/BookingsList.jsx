import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";
import Sidebar from "./components/Sidebar";
import "./css/admin.css";

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/admin/bookings");
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h2>📅 All Bookings</h2>
          <p>Complete history of all rides requested on the platform.</p>
        </div>

        {loading ? (
          <div className="admin-loading">Loading bookings...</div>
        ) : (
          <div className="table-section">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Driver</th>
                  <th>Pickup - Drop</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="id-cell">{b._id.substring(b._id.length - 6)}</td>
                    <td>{b.userId?.name || b.customerName || "User"}</td>
                    <td>{b.driverId?.name || "Not Assigned"}</td>
                    <td>
                      <div className="route-cell">
                        <small>{b.pickup}</small>
                        <span>→</span>
                        <small>{b.drop}</small>
                      </div>
                    </td>
                    <td>₹{b.amount}</td>
                    <td>
                      <span className={`status-badge ${b.status}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
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

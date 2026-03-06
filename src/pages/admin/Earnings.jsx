import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";
import Sidebar from "./components/Sidebar";
import "./css/admin.css";

export default function Earnings() {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await API.get("/admin/earnings");
      setEarnings(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch earnings", err);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h2>💰 Earnings Report</h2>
          <p>Daily revenue breakdown from completed rides.</p>
        </div>

        {loading ? (
          <div className="admin-loading">Loading earnings...</div>
        ) : (
          <div className="table-section">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Completed Rides</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e._id}>
                    <td>{e._id}</td>
                    <td>{e.count}</td>
                    <td className="revenue-text">₹{e.amount}</td>
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

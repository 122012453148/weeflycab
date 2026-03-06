import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";
import Sidebar from "./components/Sidebar";
import "./css/admin.css";

export default function VehicleTypes() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await API.get("/admin/vehicles");
      setVehicles(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h2>🚖 Vehicle Categories</h2>
          <p>Manage different cab types and their pricing structures.</p>
        </div>

        {loading ? (
          <div className="admin-loading">Loading vehicles...</div>
        ) : (
          <div className="table-section">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Base Fare</th>
                  <th>Per KM</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td className="type-cell">{v.type}</td>
                    <td>₹{v.baseFare}</td>
                    <td>₹{v.perKmRate}</td>
                    <td>{v.capacity} Person</td>
                    <td>
                      <span className={`status-badge ${v.isActive ? "COMPLETED" : "CANCELLED"}`}>
                        {v.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
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

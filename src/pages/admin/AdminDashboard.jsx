import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import TopCards from "./components/TopCards";
import "./css/admin.css";

export default function AdminDashboard() {

  const [data, setData] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalRevenue: 0,
    recentRides: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <TopCards data={data} />

        <div className="table-section">
          <h3>Recent Bookings</h3>

          <table>
            <thead>
              <tr>
                <th>Ride ID</th>
                <th>User</th>
                <th>Driver</th>
                <th>Pickup</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {data.recentRides.map((ride) => (
                <tr key={ride._id}>
                  <td>{ride._id}</td>
                  <td>{ride.customerId?.name}</td>
                  <td>{ride.driverId?.name}</td>
                  <td>{ride.pickupLocation}</td>
                  <td>{new Date(ride.createdAt).toLocaleDateString()}</td>
                  <td>{ride.status}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

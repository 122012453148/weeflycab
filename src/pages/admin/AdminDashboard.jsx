import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";
import Sidebar from "./components/Sidebar";
import TopCards from "./components/TopCards";
import "./css/admin.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {

  const [data, setData] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalRevenue: 0,
    recentRides: [],
    chartData: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/admin/dashboard");
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

        <div className="chart-section">
          <h3>Revenue & Ride Trends</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="_id" 
                  stroke="#888" 
                  fontSize={12}
                  tickFormatter={(str) => str.split('-').slice(1).join('/')}
                />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(0,0,0,0.8)", 
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2A9D8F"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  name="Revenue (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

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
                  <td className="id-cell">{ride._id.substring(ride._id.length - 6)}</td>
                  <td>{ride.userId?.name || ride.customerName || "User"}</td>
                  <td>{ride.driverId?.name || "Searching..."}</td>
                  <td>{ride.pickup}</td>
                  <td>{new Date(ride.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${ride.status}`}>
                      {ride.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

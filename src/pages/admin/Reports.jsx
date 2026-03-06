import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";
import Sidebar from "./components/Sidebar";
import "./css/admin.css";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get("/admin/reports");
      setReport(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch reports", err);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h2>📊 Platform Reports</h2>
          <p>System-wide health and booking status distribution overview.</p>
        </div>

        {loading ? (
          <div className="admin-loading">Loading reports...</div>
        ) : (
          <div className="report-grid">
            <div className="report-card large">
              <h3>Ride Summary</h3>
              <div className="report-stat-list">
                <div className="report-item">
                  <span>Total Rides Requested</span>
                  <strong>{report.totalBookings}</strong>
                </div>
                <div className="report-item">
                  <span>Completed Trips</span>
                  <strong>{report.statusCounts.COMPLETED}</strong>
                </div>
                <div className="report-item">
                  <span>Cancelled/Expired</span>
                  <strong>{report.totalBookings - (report.statusCounts.COMPLETED + report.statusCounts.BOOKED + report.statusCounts.ASSIGNED + report.statusCounts.ON_TRIP)}</strong>
                </div>
              </div>
            </div>

            <div className="report-card">
              <h3>Current Activity</h3>
              <div className="live-status-list">
                <div className="status-item">
                  <span className="dot booked"></span>
                  <span>Pending (Booked)</span>
                  <strong>{report.statusCounts.BOOKED}</strong>
                </div>
                <div className="status-item">
                  <span className="dot assigned"></span>
                  <span>Assigned</span>
                  <strong>{report.statusCounts.ASSIGNED}</strong>
                </div>
                <div className="status-item">
                  <span className="dot ontrip"></span>
                  <span>In Progress (On Trip)</span>
                  <strong>{report.statusCounts.ON_TRIP}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

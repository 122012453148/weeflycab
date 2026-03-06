import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";
import Sidebar from "./components/Sidebar";
import "./css/admin.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setLoading(false);
    }
  };

  const toggleDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h2>👥 System Users</h2>
          <p>Manage and view all registered customers and their booking history.</p>
        </div>

        {loading ? (
          <div className="admin-loading">Loading users...</div>
        ) : (
          <div className="table-section">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Bookings</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <React.Fragment key={user._id}>
                    <tr>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className="badge-count">{user.bookingCount}</span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => toggleDetails(user._id)}
                        >
                          {expandedUser === user._id ? "Hide Orders" : "View Orders"}
                        </button>
                      </td>
                    </tr>
                    {expandedUser === user._id && (
                      <tr className="details-row">
                        <td colSpan="6">
                          <div className="user-orders-expand">
                            <h4>Order Details for {user.name}</h4>
                            {user.bookings && user.bookings.length > 0 ? (
                              <div className="mini-table-scroll">
                                <table className="mini-table">
                                  <thead>
                                    <tr>
                                      <th>Pickup</th>
                                      <th>Drop</th>
                                      <th>Amount</th>
                                      <th>Status</th>
                                      <th>Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {user.bookings.map((b) => (
                                      <tr key={b._id}>
                                        <td>{b.pickup}</td>
                                        <td>{b.drop}</td>
                                        <td>₹{b.amount}</td>
                                        <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="no-data">No bookings found for this user.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


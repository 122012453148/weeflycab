import { useEffect, useState } from "react";
import API from "../../services/api";
import DriverNavbar from "../../components/DriverNavbar";
import "./DriverOrders.css";

export default function DriverOrders() {
  const driver = JSON.parse(localStorage.getItem("driver"));
  const driverId = driver?._id;

  const [orders, setOrders] = useState([]);
  const [totalRides, setTotalRides] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get(`/drivers/${driverId}/orders`);
        setOrders(res.data.orders);
        setTotalRides(res.data.totalRides);
        setTotalEarnings(res.data.totalEarnings);
      } catch (err) {
        console.log("Failed to load orders");
      }
    };

    if (driverId) fetchOrders();
  }, [driverId]);

  return (
    <>
      <DriverNavbar />

      <div className="driver-orders-page">
        <div className="orders-container">

          <h2>📦 Orders Summary</h2>

          <div className="summary-cards">
            <div className="summary-card">
              <h4>Total Rides</h4>
              <p>{totalRides}</p>
            </div>

            <div className="summary-card">
              <h4>Total Earnings</h4>
              <p>₹ {totalEarnings}</p>
            </div>
          </div>

          <div className="orders-list">
            {orders && orders.length > 0 ? (
  orders.map((order) => (
    <div key={order._id} className="order-card">
      <p><strong>Pickup:</strong> {order.pickup}</p>
      <p><strong>Drop:</strong> {order.drop}</p>
      <p><strong>Amount:</strong> ₹ {order.amount}</p>
      <p><strong>Status:</strong> {order.status}</p>
    </div>
  ))
) : (
  <p>No completed rides yet.</p>
)}

          </div>

        </div>
      </div>
    </>
  );
}

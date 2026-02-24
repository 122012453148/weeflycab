import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DriverNavbar from "../../components/DriverNavbar";
import "./DriverPayment.css";

export default function DriverPayment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState(null);

  const handleCash = () => {
    alert("Cash Payment Received");
    navigate("/driver/dashboard");
  };

  const handleOnline = () => {
    setMethod("ONLINE");
  };

  return (
    <>
      <DriverNavbar />

      <div className="driver-page">
        <div className="payment-container">
          <h2>💰 Payment Collection</h2>

          {!method && (
            <>
              <button className="pay-btn cash" onClick={handleCash}>
                💵 Cash
              </button>

              <button className="pay-btn online" onClick={handleOnline}>
                📲 Pay Online
              </button>
            </>
          )}

          {method === "ONLINE" && (
            <div className="qr-section">
              <h3>Scan & Pay</h3>

              {/* 🔹 Replace with driver UPI QR later */}
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=driver@upi"
                alt="UPI QR"
                className="qr-img"
              />

              <p>UPI ID: driver@upi</p>

              <button
                className="pay-btn done"
                onClick={() => navigate("/driver/dashboard")}
              >
                ✅ Payment Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
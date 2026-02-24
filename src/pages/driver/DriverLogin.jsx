import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./DriverAuth.css";

export default function DriverLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/drivers/login", {
        phone,
        password,
      });

      localStorage.setItem("driver", JSON.stringify(res.data));

      // ✅ LOGIN SUCCESS → GO DASHBOARD
      navigate("/driver/dashboard");

    } catch (err) {
      alert("Invalid credentials");
      console.log(err.response?.data);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🚗 Driver Login</h2>
        <p>Login to accept ride requests</p>

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <div className="auth-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/driver/signup")}>
            Signup
          </span>
        </div>
      </div>
    </div>
  );
}

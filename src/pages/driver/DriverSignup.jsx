import { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../customer/Auth.css";  // or correct path where CSS is
  // 🔥 Same CSS file for login & signup

export default function DriverSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    await api.post("/drivers/signup", {
      name,
      email,
      phone,
      password,
    });

    navigate("/driver/login");
  };

  return (
  <div className="auth-page">
    <div className="auth-card">
      <h2>🚗 Driver Signup</h2>
      <p>Create your driver account</p>

      <input
        type="text"
        placeholder="Full Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone Number"
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignup}>Signup</button>

      <div className="auth-link">
        Already have account?{" "}
        <span onClick={() => navigate("/driver/login")}>
          Login
        </span>
      </div>
    </div>
  </div>
);

}

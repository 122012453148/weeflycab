import { useState } from "react";
import { loginUser } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await loginUser(form);
    console.log("SUCCESS:", res.data);

    localStorage.setItem("user", JSON.stringify(res.data.user));
    navigate("/");
  } catch (err) {
    console.log("ERROR:", err.response?.data);
  }
};



  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Login to continue booking your ride</p>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button type="submit">Login</button>
        </form>

        <div className="auth-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
}

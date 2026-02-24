import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");   // customer login data
    localStorage.removeItem("driver"); // driver login data (if any)

    navigate("/login");  // login page route
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <h2 className="logo">Weefly</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/cab/book">Book Ride</Link>
          <Link to="/cab/track">Track</Link>
<a href="#services">Services</a>
<a href="#about">About</a>
<a href="#contact">Contact</a>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}
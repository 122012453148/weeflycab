import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("driver");
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <h2 className="logo">Weefly</h2>

        {/* Hamburger */}
        <div className="menu-toggle" onClick={toggleMenu}>
          ☰
        </div>

        <div className={menuOpen ? "nav-links active" : "nav-links"}>

          <Link to="/" onClick={()=>setMenuOpen(false)}>Home</Link>
          <Link to="/cab/book" onClick={()=>setMenuOpen(false)}>Book Ride</Link>
          <Link to="/cab/track" onClick={()=>setMenuOpen(false)}>Track</Link>

          <a href="#services" onClick={()=>setMenuOpen(false)}>Services</a>
          <a href="#about" onClick={()=>setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={()=>setMenuOpen(false)}>Contact</a>

          <button onClick={handleLogout}>Logout</button>

        </div>

      </div>
    </nav>
  );
}
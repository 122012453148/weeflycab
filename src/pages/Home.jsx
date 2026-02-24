import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
  }, []);

  const handleBookRide = () => {
    if (!isLoggedIn) return;
    navigate("/cab/book");
  };

  return (
    <div>

 <div className="hero-section">
  <div className="hero-content">

    {/* LEFT TEXT */}
    <div className="hero-left">
      <h1>Ride Anywhere in Seconds</h1>
      <p>
        Fast pickup • Verified drivers • Transparent fares.
        Book your cab instantly with Weefly.
      </p>

      <button
        className="hero-cta"
        onClick={handleBookRide}
        disabled={!isLoggedIn}
      >
        Book Now
      </button>
    </div>

    {/* CENTER CARD (Your Original) */}
    <div className="home-container">
      <div className="home-card">
        <h2>Book & Track Your Ride</h2>
        <p>Fast • Safe • Reliable cab booking</p>

        <button
          className={`book-btn ${isLoggedIn ? "active" : ""}`}
          onClick={handleBookRide}
          disabled={!isLoggedIn}
        >
          Book Ride
        </button>

        {!isLoggedIn && (
          <>
            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <p className="signup-link">
              Don’t have an account?{" "}
              <span onClick={() => navigate("/signup")}>Sign Up</span>
            </p>
          </>
        )}

        <p className="links">
          📜 View Ride History → &nbsp; ❓ Need Help?
        </p>
      </div>
    </div>

    {/* RIGHT FEATURES */}
    <div className="hero-right">
      <div className="feature">✔ Real-time GPS Tracking</div>
      <div className="feature">✔ Verified Drivers</div>
      <div className="feature">✔ Transparent Pricing</div>
      <div className="feature">✔ 24×7 Support</div>
    </div>

  </div>
</div>

      {/* ───────── SERVICES SECTION ───────── */}
      <section id="services" className="services-section">
        <span className="section-label">What We Offer</span>
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">
          Comfortable and affordable cab options for every journey.
        </p>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🚗</div>
            <h3>Sedan Rides</h3>
            <p>Perfect for solo or couple trips.</p>
            <span className="service-tag">4 Seats • ₹12/km</span>
          </div>

          <div className="service-card">
            <div className="service-icon">🚙</div>
            <h3>SUV Rides</h3>
            <p>Spacious rides for families and groups.</p>
            <span className="service-tag">5 Seats • ₹16/km</span>
          </div>

          <div className="service-card">
            <div className="service-icon">🚌</div>
            <h3>MUV Rides</h3>
            <p>Large vehicles for big groups.</p>
            <span className="service-tag">7 Seats • ₹20/km</span>
          </div>
        </div>
      </section>

      {/* ───────── ABOUT SECTION ───────── */}
      <section id="about" className="about-section">
        <div className="about-inner">
          <div className="about-text">
            <span className="section-label">Our Story</span>
            <h2 className="section-title">About Weefly</h2>
            <p>
              Weefly makes cab booking fast, transparent, and stress-free.
              Connect with verified drivers instantly.
            </p>
            <p>
              Real-time tracking, OTP verification, and clear pricing ensure
              a safe journey every time.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── CONTACT SECTION ───────── */}
      <section id="contact" className="contact-section">
        <span className="section-label">Get In Touch</span>
        <h2 className="section-title">Contact Us</h2>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <h3>Email Us</h3>
            <p>support@weefly.com</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>Call Us</h3>
            <p>+91 1800 123 456</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h3>Our Office</h3>
            <p>Bengaluru, India</p>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">🚖 Weefly</span>
          <span className="footer-copy">
            © 2025 Weefly. All rights reserved.
          </span>
        </div>
      </footer>

    </div>
    
  );
}
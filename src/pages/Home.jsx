import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "./Home.css";
import "./HistoryModal.css";

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // History modal state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setIsLoggedIn(true);
      setUserId(parsed._id || parsed.id);
    }
  }, []);

  const handleBookRide = () => {
    if (!isLoggedIn) return;
    navigate("/cab/book");
  };

  const openHistory = async () => {
    if (!isLoggedIn || !userId) return;
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await API.get(`/bookings/user/${userId}`);
      const data = res.data;
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("History fetch error:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => setShowHistory(false);

  const badgeClass = (status) => {
    switch ((status || "").toUpperCase()) {
      case "COMPLETED":  return "badge-completed";
      case "ASSIGNED":   return "badge-assigned";
      case "BOOKED":     return "badge-booked";
      case "CANCELLED":  return "badge-cancelled";
      default:           return "badge-booked";
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>

      {/* ============ HISTORY MODAL ============ */}
      {showHistory && (
        <div className="history-overlay" onClick={closeHistory}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>

            <div className="history-header">
              <h3>🕓 Ride History</h3>
              <button className="history-close" onClick={closeHistory}>✕</button>
            </div>

            <div className="history-body">
              {historyLoading ? (
                <div className="history-loading">
                  <span></span>
                  <p>Loading your rides…</p>
                </div>
              ) : history.length === 0 ? (
                <div className="history-empty">
                  <p>🚗 No rides found yet.</p>
                  <p>Book your first ride to see it here!</p>
                </div>
              ) : (
                history.map((b) => (
                  <div key={b._id} className="history-card">
                    <div className="history-card-top">
                      <div className="history-route">
                        📍 {b.pickup}
                        <span>🏁 {b.drop}</span>
                      </div>
                      <span className={`history-badge ${badgeClass(b.status)}`}>
                        {b.status || "BOOKED"}
                      </span>
                    </div>
                    <div className="history-details">
                      <span>🚕 <strong>{b.cabType || "—"}</strong></span>
                      <span>💰 <strong>₹{b.amount || 0}</strong></span>
                      {b.distance && <span>📏 <strong>{b.distance} km</strong></span>}
                      {b.driverName && <span>👤 <strong>{b.driverName}</strong></span>}
                      <span>🗓 <strong>{formatDate(b.createdAt)}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============ HERO SECTION ============ */}
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

          {/* CENTER CARD */}
          <div className="home-container">
            <div className="home-card">
              <h2>Book &amp; Track Your Ride</h2>
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
                    Don&apos;t have an account?{" "}
                    <span onClick={() => navigate("/signup")}>Sign Up</span>
                  </p>
                </>
              )}

              <p className="links">
                <span
                  style={{ cursor: "pointer", textDecoration: "underline", marginRight: "12px" }}
                  onClick={openHistory}
                >
                  📜 View Ride History
                </span>
                &nbsp;❓ Need Help?
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
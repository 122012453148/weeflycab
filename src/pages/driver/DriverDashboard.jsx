import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import DriverNavbar from "../../components/DriverNavbar";
import mapboxgl from "mapbox-gl";
import "./DriverDashboard.css";
import API from "../../services/api";
import api from "../../services/api";


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function DriverDashboard() {
  const navigate = useNavigate();
  

  const driver = JSON.parse(localStorage.getItem("driver"));
  const driverId = driver?._id;

  const [availableRides, setAvailableRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [rideTimer, setRideTimer] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);


  


  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
    if (!driver) {
      navigate("/driver/login");
    }
  }, []);
  
useEffect(() => {
  if (!activeRide || (activeRide.status !== "ASSIGNED" && activeRide.status !== "ON_TRIP")) return;

  const interval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("driverLocation", {
          bookingId: activeRide._id,
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, 3000); // every 3 sec for smoother tracking

  return () => clearInterval(interval);
}, [activeRide?._id, activeRide?.status]);

  /* ================= CONNECT SOCKET (🔥 IMPORTANT FIX) ================= */
  useEffect(() => {
    socket.connect();   // ✅ MUST CONNECT

    return () => {
      socket.disconnect();  // cleanup
    };
  }, []);

  /* ================= FETCH CURRENT BOOKINGS ================= */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/bookings");

        const validBookings = res.data.filter(
          (b) =>
            b.status === "BOOKED" &&
            (!b.expiresAt || new Date(b.expiresAt) > new Date())
        );

        if (validBookings.length > 0) {
          setAvailableRides([validBookings[0]]);
        }
      } catch (err) {
        console.log("Failed to fetch bookings");
      }
    };

    fetchBookings();
  }, []);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    socket.on("new_ride_available", (ride) => {
      setAvailableRides([ride]);

      const timer = setTimeout(() => {
        setAvailableRides([]);
      }, 60000);

      setRideTimer(timer);
    });

    return () => socket.off("new_ride_available");
  }, []);

  /* ================= ACCEPT RIDE ================= */
  const handleAccept = (ride) => {
    console.log("🔥 ACCEPT CLICKED:", ride._id, driverId);

    if (!driverId) {
      alert("Driver not logged in properly");
      return;
    }

    if (rideTimer) clearTimeout(rideTimer);

    setActiveRide({ ...ride, status: "ASSIGNED" });
    setAvailableRides([]);

    socket.emit("acceptRide", {
      bookingId: ride._id,
      driverId,
    });
  };



  /* ================= OTP VERIFY ================= */
  const handleVerifyOtp = () => {
    if (String(enteredOtp) === String(activeRide.otp)) {
      setActiveRide({ ...activeRide, status: "ON_TRIP" });
      
      // Notify server and customer
      socket.emit("verifyOtp", { bookingId: activeRide._id });
      
      // Update DB status
      api.put(`/bookings/${activeRide._id}/start`).catch(err => console.log("Start trip error:", err));
      
      showRouteOnMap();
    } else {
      alert("Invalid OTP");
    }
  };
const handleCompleteRide = async () => {
  try {
    await api.put(`/bookings/${activeRide._id}/complete`);

    // 🔥 Payment page ku navigate pannum
    navigate("/driver/payment", {
      state: {
        ride: activeRide
      }
    });

  } catch (err) {
    console.log(err);
  }
};

  /* ================= MAP ROUTE ================= */
  const showRouteOnMap = async () => {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!activeRide) return;

    let destination = activeRide.status === "ASSIGNED" ? activeRide.pickup : activeRide.drop;
    
    // Get current driver location
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const driverLng = pos.coords.longitude;
      const driverLat = pos.coords.latitude;

      const geoDest = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          destination
        )}.json?access_token=${MAPBOX_TOKEN}`
      ).then((res) => res.json());

      if (!geoDest.features?.length) return;
      const [destLng, destLat] = geoDest.features[0].center;

      const directions = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLng},${driverLat};${destLng},${destLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      ).then((res) => res.json());

      if (!directions.routes?.length) return;
      const route = directions.routes[0].geometry;

      if (mapRef.current) mapRef.current.remove();

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [driverLng, driverLat],
        zoom: 12,
      });

      mapRef.current.on("load", () => {
        mapRef.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: route,
          },
        });

        mapRef.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#7b61ff",
            "line-width": 6,
          },
        });

        // Driver Marker (Car icon)
        const carEl = document.createElement('div');
        carEl.className = 'driver-marker-car';
        carEl.innerHTML = '🚗';
        carEl.style.fontSize = '32px';

        new mapboxgl.Marker(carEl)
          .setLngLat([driverLng, driverLat])
          .addTo(mapRef.current);

        // Destination Marker (Yellow for Pickup, Green for Drop)
        const destEl = document.createElement('div');
        const label = activeRide.status === "ASSIGNED" ? "Pickup" : "Drop";
        const theme = activeRide.status === "ASSIGNED" ? "pickup-marker" : "drop-marker";
        
        destEl.className = `custom-marker ${theme}`;
        destEl.innerHTML = `
          <div class="marker-label">${label}</div>
          <div class="marker-pin"></div>
        `;

        new mapboxgl.Marker({ element: destEl, anchor: 'bottom' })
          .setLngLat([destLng, destLat])
          .addTo(mapRef.current);
          
        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds()
          .extend([driverLng, driverLat])
          .extend([destLng, destLat]);
        mapRef.current.fitBounds(bounds, { padding: 50 });
      });
    });
  };

  useEffect(() => {
    if (activeRide && (activeRide.status === "ASSIGNED" || activeRide.status === "ON_TRIP")) {
      showRouteOnMap();
    }
  }, [activeRide?.status]);

  return (
    <>
      <DriverNavbar />

      <div className="driver-page">
        <div className="driver-layout">
          {/* Left Panel: Stats */}
          <div className="driver-side-panel">
            <h3>📊 Performance</h3>
            <div className="stat-card">
              <span>Today's Earnings</span>
              <strong>₹ 1,250</strong>
            </div>
            <div className="stat-card">
              <span>Rides Completed</span>
              <strong>8</strong>
            </div>
            <div className="stat-card">
              <span>Rating</span>
              <strong>⭐ 4.9</strong>
            </div>
            <div className="stat-card">
              <span>Online Time</span>
              <strong>5h 20m</strong>
            </div>
          </div>

          <div className="driver-container">
            <h2>🚕 Driver Dashboard</h2>

            {availableRides.length === 0 && !activeRide && (
              <div className="searching-box">
                <div className="spinner"></div>
                <p>Searching for nearby rides...</p>
              </div>
            )}

            {availableRides.map((ride) => (
              <div key={ride._id} className="order-card">
                <p><strong>Pickup:</strong> {ride.pickup}</p>
                <p><strong>Drop:</strong> {ride.drop}</p>
                <p className="amount">₹ {ride.amount}</p>

                <button
                  className="driver-btn"
                  onClick={() => handleAccept(ride)}
                >
                  Accept
                </button>
              </div>
            ))}

            {activeRide && (
              <div className="active-ride">
                <p><strong>Status:</strong> {activeRide.status}</p>

                {activeRide.customerName && (
                  <div className="customer-details">
                    <p><strong>Customer:</strong> {activeRide.customerName}</p>
                    <p><strong>Phone:</strong> {activeRide.customerPhone}</p>

                    <a
                      href={`tel:${activeRide.customerPhone}`}
                      className="driver-btn call-btn"
                    >
                      📞 Call Customer
                    </a>
                  </div>
                )}

                {activeRide.status === "ASSIGNED" && (
                  <div className="otp-section">
                    <p className="otp-label">Enter the OTP provided by the customer to start the ride:</p>
                    <input
                      type="text"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="0000"
                      className="otp-input"
                    />
                    <button
                      className="driver-btn verify-btn"
                      onClick={handleVerifyOtp}
                    >
                      Verify & Start Trip
                    </button>
                  </div>
                )}

                {activeRide.status === "ON_TRIP" && (
                  <>
                    <div
                      ref={mapContainer}
                      style={{
                        width: "100%",
                        height: "400px",
                        marginTop: "20px",
                        borderRadius: "10px",
                      }}
                    />

                    <button
                      className="complete-btn"
                      onClick={handleCompleteRide}
                      style={{
                        marginTop: "20px",
                        padding: "12px 20px",
                        borderRadius: "30px",
                        border: "none",
                        background: "#2A9D8F",
                        color: "white",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      ✅ Complete Ride
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Tips */}
          <div className="driver-side-panel">
            <h3>🛡️ Safety & Tips</h3>
            <ul className="tips-list">
              <li>Keep your vehicle clean for better ratings.</li>
              <li>Always verify OTP before starting the trip.</li>
              <li>Follow traffic rules and avoid speeding.</li>
              <li>Greet customers politely for a 5-star experience.</li>
              <li>Take regular breaks to stay fresh and alert.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

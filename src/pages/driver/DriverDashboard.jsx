import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import DriverNavbar from "../../components/DriverNavbar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./DriverDashboard.css";
import "../../styles/markers.css";
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
  const [driverData, setDriverData] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [driverLoc, setDriverLoc] = useState(null);


  


  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
    if (!driver) {
      navigate("/driver/login");
    } else {
      fetchDriverStats();
    }
  }, []);

  const fetchDriverStats = async () => {
    try {
      const res = await API.get(`/drivers/${driverId}`);
      setDriverData(res.data);
    } catch (err) {
      console.log("Error fetching stats");
    }
  };
  
useEffect(() => {
  if (!activeRide || (activeRide.status !== "ASSIGNED" && activeRide.status !== "ON_TRIP")) return;

  const interval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLoc([longitude, latitude]);
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
    if (!activeRide || !mapContainer.current) return;

    const driverLng = driverLoc?.[0] || 0;
    const driverLat = driverLoc?.[1] || 0;

    if (!driverLng) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        setDriverLoc([pos.coords.longitude, pos.coords.latitude]);
      });
      return;
    }

    try {
      const geoPickup = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          activeRide.pickup
        )}.json?access_token=${MAPBOX_TOKEN}`
      ).then((res) => res.json());

      const geoDrop = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          activeRide.drop
        )}.json?access_token=${MAPBOX_TOKEN}`
      ).then((res) => res.json());

      if (!geoPickup.features?.length || !geoDrop.features?.length) return;
      const [pickupLng, pickupLat] = geoPickup.features[0].center;
      const [dropLng, dropLat] = geoDrop.features[0].center;

      // Directions: Driver -> Pickup -> Drop
      const directions = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLng},${driverLat};${pickupLng},${pickupLat};${dropLng},${dropLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      ).then((res) => res.json());

      if (!directions.routes?.length) return;
      const route = directions.routes[0].geometry;

      // Initialize map once
      if (!mapRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [driverLng, driverLat],
          zoom: 13,
        });

        mapRef.current.on('styleimagemissing', (e) => {});

        mapRef.current.on("load", () => {
          mapRef.current.addSource("route", {
            type: "geojson",
            data: { type: "Feature", geometry: route },
          });

          mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            paint: { "line-color": "#7b61ff", "line-width": 6 },
          });

          // Add Markers
          const carEl = document.createElement("div");
          carEl.className = "driver-marker-car";
          carEl.innerHTML = "🚗";
          mapRef.current.carMarker = new mapboxgl.Marker({ element: carEl })
            .setLngLat([driverLng, driverLat])
            .addTo(mapRef.current);

          const pEl = document.createElement("div");
          pEl.className = "custom-marker pickup-marker";
          pEl.innerHTML = '<div class="marker-label">Pickup</div><div class="marker-pin"></div>';
          new mapboxgl.Marker({ element: pEl, anchor: "bottom" })
            .setLngLat([pickupLng, pickupLat])
            .addTo(mapRef.current);

          const dEl = document.createElement("div");
          dEl.className = "custom-marker drop-marker";
          dEl.innerHTML = '<div class="marker-label">Drop</div><div class="marker-pin"></div>';
          new mapboxgl.Marker({ element: dEl, anchor: "bottom" })
            .setLngLat([dropLng, dropLat])
            .addTo(mapRef.current);

          const bounds = new mapboxgl.LngLatBounds()
            .extend([driverLng, driverLat])
            .extend([pickupLng, pickupLat])
            .extend([dropLng, dropLat]);
          mapRef.current.fitBounds(bounds, { padding: 50 });
        });
      } else {
        // Update existing map
        const map = mapRef.current;
        if (map.getSource("route")) {
          map.getSource("route").setData({ type: "Feature", geometry: route });
        }
        if (map.carMarker) {
          map.carMarker.setLngLat([driverLng, driverLat]);
        }
      }
    } catch (err) {
      console.error("Map update failed:", err);
    }
  };

  useEffect(() => {
    if (activeRide && activeRide.status === "ON_TRIP") {
      showRouteOnMap();
    }
  }, [activeRide?.status, driverLoc]);

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
              <strong>₹ {driverData?.totalEarnings || 0}</strong>
            </div>
            <div className="stat-card">
              <span>Rides Completed</span>
              <strong>{driverData?.totalRides || 0}</strong>
            </div>
            <div className="stat-card">
              <span>Rating</span>
              <strong>⭐ {driverData?.rating || "5.0"}</strong>
            </div>
            <div className="stat-card">
              <span>Online Time</span>
              <strong>Active Now</strong>
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

                {activeRide.status === "ON_TRIP" && (
                  <div
                    ref={mapContainer}
                    style={{
                      width: "100%",
                      height: "450px",
                      marginTop: "15px",
                      borderRadius: "15px",
                      border: "2px solid rgba(255,255,255,0.1)"
                    }}
                  />
                )}

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
                  <button
                    className="complete-btn"
                    onClick={handleCompleteRide}
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#2A9D8F",
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "16px"
                    }}
                  >
                    ✅ Complete Ride
                  </button>
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

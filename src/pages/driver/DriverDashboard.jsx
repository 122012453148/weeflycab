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
  if (!activeRide || activeRide.status !== "ON_TRIP") return;

  const interval = setInterval(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit("driverLocation", {
        bookingId: activeRide._id,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, 5000); // every 5 sec

  return () => clearInterval(interval);
}, [activeRide]);

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
    if (enteredOtp === activeRide.otp) {
      setActiveRide({ ...activeRide, status: "ON_TRIP" });
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

    const [pickupLng, pickupLat] = geoPickup.features[0].center;
    const [dropLng, dropLat] = geoDrop.features[0].center;

    const directions = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLng},${pickupLat};${dropLng},${dropLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
    ).then((res) => res.json());

    const route = directions.routes[0].geometry;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [pickupLng, pickupLat],
        zoom: 7,
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
            "line-color": "#2A9D8F",
            "line-width": 5,
          },
        });

        new mapboxgl.Marker({ color: "green" })
          .setLngLat([pickupLng, pickupLat])
          .addTo(mapRef.current);

        new mapboxgl.Marker({ color: "red" })
          .setLngLat([dropLng, dropLat])
          .addTo(mapRef.current);
      });
    }
  };

  return (
    <>
      <DriverNavbar />

      <div className="driver-page">
        <div className="driver-container">
          <h2>🚕 Driver Dashboard</h2>

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
                <>
                  <input
                    type="text"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="otp-input"
                  />
                  <button
                    className="driver-btn"
                    onClick={handleVerifyOtp}
                  >
                    Verify OTP
                  </button>
                </>
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
      </div>
    </>
  );
}

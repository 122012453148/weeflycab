import { useEffect, useState, useRef } from "react";
import { getDistance, createBooking, searchPlaces } from "../../services/api";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import "./BookRide.css";

const VEHICLE_OPTIONS = [
  { type: "Bike", price: 8, icon: "🏍️" },
  { type: "Auto", price: 10, icon: "🛺" },
  {
    type: "Cars",
    icon: "🚗",
    isExpandable: true,
    subOptions: [
      { type: "Sedan", name: "Sedan (4 seater)", seats: 4, price: 12 },
      { type: "SUV", name: "SUV", seats: 5, price: 16 },
      { type: "MUV", name: "MUV", seats: 7, price: 20 },
    ],
  },
];

export default function BookRide() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [selectedCab, setSelectedCab] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [carsExpanded, setCarsExpanded] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  const navigate = useNavigate();
  

  /* ---------------- SOCKET CONNECT ---------------- */
  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
  }, []);

  /* ---------------- SEARCH PICKUP ---------------- */
  const handlePickupSearch = async (value) => {
    setPickup(value);

    if (value.length < 2) {
      setPickupSuggestions([]);
      return;
    }

    try {
      const results = await searchPlaces(value);
      setPickupSuggestions(results);
    } catch (err) {
      console.log("Search failed");
    }
  };

  /* ---------------- SEARCH DROP ---------------- */
  const handleDropSearch = async (value) => {
    setDrop(value);

    if (value.length < 2) {
      setDropSuggestions([]);
      return;
    }

    try {
      const results = await searchPlaces(value);
      setDropSuggestions(results);
    } catch (err) {
      console.log("Search failed");
    }
  };

  /* ---------------- DISTANCE ---------------- */
  useEffect(() => {
    const fetchDistance = async () => {
      if (!pickup || !drop) return;

      try {
        setLoadingDistance(true);

        const result = await getDistance(pickup, drop);

        setDistance(Math.ceil(result.distanceKm));
        setDuration(Math.ceil(result.durationMin));
      } catch {
        console.log("Distance fetch failed");
        setDistance(null);
      } finally {
        setLoadingDistance(false);
      }
    };

    fetchDistance();
  }, [pickup, drop]);

  const totalAmount =
    selectedCab && distance ? distance * selectedCab.price : 0;

  /* ---------------- BOOK ---------------- */
  const handleBook = async () => {
    if (!pickup || !drop || !selectedCab || !distance) {
      alert("Fill all details");
      return;
    }

     const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      alert("Error: User session not found. Please log in again.");
      navigate("/login");
      return;
    }

    const res = await createBooking({
      userId: user._id,
      pickup,
      drop,
      cabType: selectedCab.type,
      pricePerKm: selectedCab.price,
      distance,
      amount: totalAmount,
      eta: duration,
      status: "BOOKED",
      customerName: user.name,
      customerPhone: user.phone,
    });

   const bookingData = res.data;



navigate(`/cab/track/${bookingData._id}`);

  };

  return (
    <div className="book-page">
      <div className="book-layout">
        {/* Left Side Panel - Info/Features */}
        <div className="side-panel">
          <h3>🛡️ Your Safety First</h3>
          <div className="info-item">
            <span className="info-icon">📍</span>
            <p>Live tracking for every ride you book.</p>
          </div>
          <div className="info-item">
            <span className="info-icon">🆔</span>
            <p>Verified drivers with background checks.</p>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <p>24/7 SOS support for emergency assistance.</p>
          </div>
          <div className="info-item">
            <span className="info-icon">📱</span>
            <p>Share trip details with family and friends.</p>
          </div>
        </div>

        <div className="book-container">
          <h2>🚕 Book a Ride</h2>

          {/* Pickup */}
          <div className="input-box">
            <input
              ref={pickupRef}
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => handlePickupSearch(e.target.value)}
            />

            {pickupSuggestions.length > 0 && (
              <ul className="suggestions">
                {pickupSuggestions.map((place) => (
                  <li
                    key={place.id}
                    onClick={() => {
                      setPickup(place.place_name);
                      setPickupSuggestions([]);
                    }}
                  >
                    {place.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Drop */}
          <div className="input-box">
            <input
              ref={dropRef}
              placeholder="Drop location"
              value={drop}
              onChange={(e) => handleDropSearch(e.target.value)}
            />

            {dropSuggestions.length > 0 && (
              <ul className="suggestions">
                {dropSuggestions.map((place) => (
                  <li
                    key={place.id}
                    onClick={() => {
                      setDrop(place.place_name);
                      setDropSuggestions([]);
                    }}
                  >
                    {place.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h3>Available Vehicles</h3>

          {loadingDistance && <p>Calculating distance...</p>}

          <div className="vehicle-list">
            {VEHICLE_OPTIONS.map((option) => (
              <div key={option.type}>
                {option.isExpandable ? (
                  <div className="expandable-option">
                    <div 
                      className={`vehicle-card ${carsExpanded ? "expanded" : ""}`}
                      onClick={() => setCarsExpanded(!carsExpanded)}
                    >
                      <div className="vehicle-info">
                        <span className="vehicle-icon">{option.icon}</span>
                        <h4>{option.type}</h4>
                      </div>
                      <span className="chevron">{carsExpanded ? "▲" : "▼"}</span>
                    </div>

                    {carsExpanded && (
                      <div className="sub-options">
                        {option.subOptions.map((sub) => (
                          <div
                            key={sub.type}
                            className={`vehicle-card sub-card ${
                              selectedCab?.type === sub.type ? "active" : ""
                            }`}
                            onClick={() => setSelectedCab(sub)}
                          >
                            <div className="vehicle-info">
                              <h4>{sub.name}</h4>
                              <p>₹{sub.price} / km</p>
                            </div>
                            {distance && <p className="total-tag">Total ₹{distance * sub.price}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`vehicle-card ${
                      selectedCab?.type === option.type ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedCab(option);
                      setCarsExpanded(false);
                    }}
                  >
                    <div className="vehicle-info">
                      <span className="vehicle-icon">{option.icon}</span>
                      <h4>{option.type} – ₹{option.price} / km</h4>
                    </div>
                    {distance && <p className="total-tag">Total ₹{distance * option.price}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {distance && selectedCab && (
            <div className="summary">
              <p>Distance: {distance} km</p>
              <p>ETA: {duration} mins</p>
              <p>Total Amount: ₹{totalAmount}</p>

              <button className="confirm-btn" onClick={handleBook}>
                Confirm Booking
              </button>
            </div>
          )}
        </div>

        {/* Right Side Panel - Offers/Promos */}
        <div className="side-panel">
          <h3>🎁 Special Offers</h3>
          <div className="info-item">
            <span className="info-icon">💰</span>
            <p>Get 20% OFF on your first 3 rides! Code: <b>FIRST20</b></p>
          </div>
          <div className="info-item">
            <span className="info-icon">🥤</span>
            <p>Complimentary water and snacks on Premium rides.</p>
          </div>
          <div className="info-item">
            <span className="info-icon">⭐</span>
            <p>Earn loyalty points for every kilometer you travel.</p>
          </div>
          <div className="info-item">
            <span className="info-icon">🏙️</span>
            <p>Intercity packages starting from just ₹2500.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

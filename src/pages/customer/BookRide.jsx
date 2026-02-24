import { useEffect, useState, useRef } from "react";
import { getDistance, createBooking, searchPlaces } from "../../services/api";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import "./BookRide.css";

const CAB_TYPES = [
  { type: "Sedan", seats: 4, price: 12 },
  { type: "SUV", seats: 5, price: 16 },
  { type: "MUV", seats: 7, price: 20 },
];

export default function BookRide() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [selectedCab, setSelectedCab] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);

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

        <h3>Available Cabs</h3>

        {loadingDistance && <p>Calculating distance...</p>}

        <div className="cab-list">
          {CAB_TYPES.map((cab) => (
            <div
              key={cab.type}
              className={`cab-card ${
                selectedCab?.type === cab.type ? "active" : ""
              }`}
              onClick={() => setSelectedCab(cab)}
            >
              <h4>
                {cab.type} – {cab.seats} Seater
              </h4>
              <p>₹{cab.price} / km</p>
              {distance && <p>Total ₹{distance * cab.price}</p>}
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
    </div>
  );
}

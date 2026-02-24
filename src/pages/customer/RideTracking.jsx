import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import api from "../../services/api";
import socket from "../../services/socket";
import "./RideTracking.css";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;


export default function RideTracking() {
  const { bookingId } = useParams();
  const [ride, setRide] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);


  /* ---------------- FETCH RIDE ---------------- */
  const fetchRide = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setRide(res.data);
    } catch {
      setRide(null);
    }
  };

  useEffect(() => {
    if (!bookingId) return;
    fetchRide();
  }, [bookingId]);

  /* ---------------- SOCKET LISTEN ---------------- */
 useEffect(() => {
  if (!bookingId) return;

  socket.connect();

 socket.on("rideAccepted", (updatedBooking) => {
  if (updatedBooking._id.toString() === bookingId.toString()) {
    console.log("🔥 Ride matched. Updating UI...");
    setRide(updatedBooking);
    fetchRide();
  }
});


  socket.on("rideStarted", (id) => {
    if (id === bookingId) {
      setRide((prev) => ({ ...prev, status: "ON_TRIP" }));
    }
  });

  socket.on("rideCompleted", (id) => {
    if (id === bookingId) {
      setRide((prev) => ({ ...prev, status: "COMPLETED" }));
    }
  });

  return () => {
    socket.off("rideAccepted");
    socket.off("rideStarted");
    socket.off("rideCompleted");
  };
}, [bookingId]);


socket.on("updateDriverLocation", (data) => {
  if (data.bookingId !== bookingId) return;

  if (!mapRef.current) return;

  if (!driverMarkerRef.current) {
    driverMarkerRef.current = new mapboxgl.Marker({ color: "#2A9D8F" })
      .setLngLat([data.lng, data.lat])
      .addTo(mapRef.current);
  } else {
    driverMarkerRef.current.setLngLat([data.lng, data.lat]);
  }
});


  /* ---------------- AUTO REFRESH WHEN ASSIGNED ---------------- */
  useEffect(() => {
    if (!ride) return;
console.log("Ride data:", ride);

    if (ride.status === "ASSIGNED") {
      fetchRide();
    }
  }, [ride?.status]);

  /* ---------------- MAP ---------------- */
  useEffect(() => {
    if (!ride || !mapContainer.current) return;

    const loadMap = async () => {
      const pickupGeo = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          ride.pickup
        )}.json?access_token=${mapboxgl.accessToken}`
      ).then((res) => res.json());

      const dropGeo = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          ride.drop
        )}.json?access_token=${mapboxgl.accessToken}`
      ).then((res) => res.json());

      if (!pickupGeo.features.length || !dropGeo.features.length) return;

      const pickup = pickupGeo.features[0].center;
      const drop = dropGeo.features[0].center;

      const routeData = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.join(
          ","
        )};${drop.join(
          ","
        )}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      ).then((res) => res.json());

      if (!routeData.routes.length) return;

      const routeCoords = routeData.routes[0].geometry.coordinates;

      if (mapRef.current) mapRef.current.remove();

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: pickup,
        zoom: 10,
      });

      mapRef.current = map;

      map.on("load", () => {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: routeCoords,
            },
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#2A9D8F",
            "line-width": 5,
          },
        });

        new mapboxgl.Marker({ color: "green" })
          .setLngLat(pickup)
          .addTo(map);

        new mapboxgl.Marker({ color: "red" })
          .setLngLat(drop)
          .addTo(map);
      });
    };

    loadMap();
  }, [ride]);

  if (!ride) return <div>Loading...</div>;

  return (
    <div className="track-page">
      <div ref={mapContainer} className="track-map" />

      <div className="ride-card">
        <h3>🚕 Ride Tracking</h3>

        <p><strong>Pickup:</strong> {ride.pickup}</p>
        <p><strong>Drop:</strong> {ride.drop}</p>
        <p><strong>Distance:</strong> {ride.distance} km</p>
        <p><strong>ETA:</strong> {ride.eta || "Calculating..."} mins</p>
        <p><strong>Status:</strong> {ride.status}</p>
        <p><strong>OTP:</strong> {ride.otp}</p>
        <p className="amount">₹ {ride.amount}</p>
      </div>

      {/* DRIVER DETAILS */}
     {ride.status === "ASSIGNED" && ride.driverName && (
      
   <div className="driver-card">

    <div className="driver-left">
      <h4>🚗 Driver Details</h4>
      <p><strong>Name:</strong> {ride.driverName}</p>
      <p><strong>Phone:</strong> {ride.driverPhone}</p>
    </div>

    <div className="driver-right">
      <div className="driver-avatar">
        {ride.driverName?.charAt(0).toUpperCase()}
      </div>

      <a
        href={`tel:${ride.driverPhone}`}
        className="call-btn"
      >
        📞 Call Driver
      </a>
    </div>

  </div>
)}



    </div>
  );
}

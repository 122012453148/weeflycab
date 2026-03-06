import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import api from "../../services/api";
import socket from "../../services/socket";
import "./RideTracking.css";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const calculateBearing = (start, end) => {
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;
  const y = Math.sin((endLng - startLng) * (Math.PI / 180)) * Math.cos(endLat * (Math.PI / 180));
  const x = Math.cos(startLat * (Math.PI / 180)) * Math.sin(endLat * (Math.PI / 180)) -
            Math.sin(startLat * (Math.PI / 180)) * Math.cos(endLat * (Math.PI / 180)) * Math.cos((endLng - startLng) * (Math.PI / 180));
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
};


export default function RideTracking() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [ride, setRide] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);


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
      setTimeout(() => {
        navigate("/");
      }, 1500);
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

  const newPos = [data.lng, data.lat];

  if (!driverMarkerRef.current) {
    const el = document.createElement('div');
    el.className = 'driver-marker-car';
    el.innerHTML = '🚗';
    el.style.fontSize = '32px';
    el.style.transition = 'all 1s linear'; 

    driverMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat(newPos)
      .addTo(mapRef.current);
    
    driverMarkerRef.current.prevPos = newPos;
  } else {
    const prevPos = driverMarkerRef.current.prevPos;
    if (prevPos) {
      const bearing = calculateBearing(prevPos, newPos);
      driverMarkerRef.current.getElement().style.transform += ` rotate(${bearing}deg)`;
    }
    driverMarkerRef.current.setLngLat(newPos);
    driverMarkerRef.current.prevPos = newPos;
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
      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

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

      if (!pickupGeo.features?.length || !dropGeo.features?.length) return;

      const pickupCoords = pickupGeo.features[0].center;
      const dropCoords = dropGeo.features[0].center;

      // Determine which route to show
      let startCoords = pickupCoords;
      let endCoords = dropCoords;

      if (ride.status === "ASSIGNED") {
        // If assigned, we might want to show route TO pickup later
        // For now, let's keep showing the trip route but add markers properly
      }

      const routeData = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords.join(
          ","
        )};${endCoords.join(
          ","
        )}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      ).then((res) => res.json());

      if (!routeData.routes?.length) return;

      const routeCoords = routeData.routes[0].geometry.coordinates;

      if (!mapRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: pickupCoords,
          zoom: 12,
        });
      }

      const map = mapRef.current;

      const updateMapContent = () => {
        if (map.getSource("route")) {
          map.getSource("route").setData({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: routeCoords,
            },
          });
        } else {
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
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#7b61ff",
              "line-width": 6,
            },
          });
        }

        // Custom Pickup Marker (Yellow)
        const pickupEl = document.createElement('div');
        pickupEl.className = 'custom-marker pickup-marker';
        pickupEl.innerHTML = `
          <div class="marker-label">Pickup</div>
          <div class="marker-pin"></div>
        `;
        
        const m1 = new mapboxgl.Marker({ element: pickupEl, anchor: 'bottom' })
          .setLngLat(pickupCoords)
          .addTo(map);

        // Custom Drop Marker (Green)
        const dropEl = document.createElement('div');
        dropEl.className = 'custom-marker drop-marker';
        dropEl.innerHTML = `
          <div class="marker-label">Drop</div>
          <div class="marker-pin"></div>
        `;

        const m2 = new mapboxgl.Marker({ element: dropEl, anchor: 'bottom' })
          .setLngLat(dropCoords)
          .addTo(map);
          
        markersRef.current = [m1, m2];

        // Zoom to show both
        const bounds = new mapboxgl.LngLatBounds()
          .extend(pickupCoords)
          .extend(dropCoords);
        map.fitBounds(bounds, { padding: 50 });
      };

      if (map.loaded()) {
        updateMapContent();
      } else {
        map.on("load", updateMapContent);
      }
    };

    loadMap();
  }, [ride?.status]);

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

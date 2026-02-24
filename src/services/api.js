import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ---------------- BOOKING ----------------

export const createBooking = (data) =>
  API.post("/bookings", data);

export const getBookingById = (id) =>
  API.get(`/bookings/${id}`);
export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);


// ---------------- MAPBOX DISTANCE ----------------

export const getDistance = async (origin, destination) => {
  try {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!MAPBOX_TOKEN) {
      throw new Error("Mapbox token missing");
    }

    // 🔹 Encode locations properly
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);

    // 1️⃣ Geocode origin
    const geoOrigin = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedOrigin}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          limit: 1,
          country: "IN",
        },
      }
    );

    // 2️⃣ Geocode destination
    const geoDestination = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedDestination}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          limit: 1,
          country: "IN",
        },
      }
    );

    if (!geoOrigin.data.features?.length) {
      throw new Error("Origin not found");
    }

    if (!geoDestination.data.features?.length) {
      throw new Error("Destination not found");
    }

    const [originLng, originLat] = geoOrigin.data.features[0].center;
    const [destLng, destLat] = geoDestination.data.features[0].center;

    // 3️⃣ Directions API
    const directions = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          overview: "false",
        },
      }
    );

    if (!directions.data.routes?.length) {
      throw new Error("Route not found");
    }

    const route = directions.data.routes[0];

    return {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch (err) {
    console.error("Mapbox error:", err.message);
    throw err;
  }
};


// ---------------- SEARCH AUTOCOMPLETE ----------------

export const searchPlaces = async (query) => {
  try {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          autocomplete: true,
          limit: 5,
          country: "IN",
        },
      }
    );

    return response.data.features;
  } catch (err) {
    console.error("Search error:", err.response?.data || err.message);
    return [];
  }
};

export default API;

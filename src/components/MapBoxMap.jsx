import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapBoxMap({ pickupCoords, dropCoords }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!pickupCoords || !dropCoords) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: pickupCoords,
      zoom: 10,
    });

    // Pickup marker
    new mapboxgl.Marker({ color: "green" })
      .setLngLat(pickupCoords)
      .addTo(mapRef.current);

    // Drop marker
    new mapboxgl.Marker({ color: "red" })
      .setLngLat(dropCoords)
      .addTo(mapRef.current);

    return () => mapRef.current.remove();
  }, [pickupCoords, dropCoords]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "400px", borderRadius: "12px" }}
    />
  );
}

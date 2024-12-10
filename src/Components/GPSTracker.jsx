import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Set a custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to recenter map on new location
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const GPSTracker = () => {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 27.66525,
    longitude: 85.26676,
  });
  const [currentTime, setCurrentTime] = useState("");
  const [speed, setSpeed] = useState("");
  const [course, setCourse] = useState("");
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("routeHistory")) || [] // Retrieve from cache
  );

  const [reload, setReload] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("imei"); // Retrieves the 'code' parameter
    if (code) {
      const eventSource = new EventSource(`https://gps.goodwish.com.np/sse/${code}/`);
      eventSource.onmessage = (event) => {
        try {
          let sanitizedData = event.data.replace(/'/g, '"');
          const data = JSON.parse(sanitizedData);

          const latitude = data.latitude;
          const longitude = data.longitude;
          setCurrentTime(data.time);
          setCourse(data.course);
          setSpeed(data.speed);

          const newLocation = { latitude, longitude, time: data.time, speed: data.speed, course: data.course };
          setCurrentLocation({ latitude, longitude });
          setHistory((prevHistory) => {
            const updatedHistory = [...prevHistory, newLocation];
            localStorage.setItem("routeHistory", JSON.stringify(updatedHistory)); // Save to cache
            return updatedHistory;
          });
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = () => {
        console.error("SSE connection error");
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [reload]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white text-center py-4">
        <h1 className="text-2xl font-semibold">GPS Tracker</h1>
      </header>

      {/* Info Panel */}
      <div className="absolute top-16 left-4 bg-white shadow-lg rounded-lg p-4 z-10">
        <h2 className="text-lg font-bold mb-2">Current Location</h2>
        <p>
          <strong>Latitude:</strong> {currentLocation.latitude}
        </p>
        <p>
          <strong>Longitude:</strong> {currentLocation.longitude}
        </p>
        <p>
          <strong>Time:</strong> {currentTime}
        </p>
        <p>
          <strong>Speed:</strong> {speed}
        </p>
        <p>
          <strong>Course:</strong> {course}
        </p>
      </div>

      {/* Map */}
      <MapContainer className="flex-1" center={[currentLocation.latitude, currentLocation.longitude]} zoom={15}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <RecenterMap center={[currentLocation.latitude, currentLocation.longitude]} />

        {/* Marker for Current Location */}
        <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
          <Popup>
            <p>
              <strong>Latitude:</strong> {currentLocation.latitude}
              <br />
              <strong>Longitude:</strong> {currentLocation.longitude}
              <br />
              <strong>Time:</strong> {currentTime}
              <br />
              <strong>Speed:</strong> {speed}
              <br />
              <strong>Course:</strong> {course}
            </p>
          </Popup>
        </Marker>

        {/* Bold Points for History */}
        {history.map((point, index) => (
          <CircleMarker
            key={index}
            center={[point.latitude, point.longitude]}
            radius={5} // Adjust size for "boldness"
            color="blue"
            fillColor="blue"
            fillOpacity={1}
          >
            <Popup>
              <p>
                <strong>Latitude:</strong> {point.latitude}
                <br />
                <strong>Longitude:</strong> {point.longitude}
                <br />
                <strong>Time:</strong> {point.time}
                <br />
                <strong>Speed:</strong> {point.speed}
                <br />
                <strong>Course:</strong> {point.course}
              </p>
            </Popup>
          </CircleMarker>
        ))}

        {/* Polyline for Path History */}
        {history.length > 1 && <Polyline positions={history.map((point) => [point.latitude, point.longitude])} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default GPSTracker;

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Set a custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper function to convert DMS (space-separated) to Decimal
const convertDMSToDecimal = (dms) => {
  const dmsParts = dms.split(" ").map(parseFloat);
  if (dmsParts.length !== 3) {
    console.error("Invalid DMS format:", dms);
    return 0;
  }
  const [degrees, minutes, seconds] = dmsParts;
  return degrees + minutes / 60 + seconds / 3600;
};

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
  const [history, setHistory] = useState([]);
 const code = 
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
     const code = params.get('emi'); // Retrieves the 'code' parameter
     console.log(code)
     if (code) {
       
       const eventSource = new EventSource(`https://gps.goodwish.com.np/sse/${code}/`);
       
       eventSource.onmessage = (event) => {
         try {
           let sanitizedData = event.data;
           sanitizedData = sanitizedData.replace(/'/g, '"');
           const data = JSON.parse(sanitizedData);
           
           const latitude = convertDMSToDecimal(data.latitude.trim());
        const longitude = convertDMSToDecimal(data.longitude.trim());
        
        setCurrentTime(data.time);
        const newLocation = { latitude, longitude };
        setCurrentLocation(newLocation);
        setHistory((prevHistory) => [...prevHistory, [latitude, longitude]]);
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
  }, []);

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
          <strong>Latitude:</strong> {currentLocation.latitude.toFixed(5)}
        </p>
        <p>
          <strong>Longitude:</strong> {currentLocation.longitude.toFixed(5)}
        </p>
        <p>
          <strong>Time:</strong> {currentTime}
        </p>
      </div>

      {/* Map */}
      <MapContainer
        className="flex-1"
        center={[currentLocation.latitude, currentLocation.longitude]}
        zoom={15}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <RecenterMap center={[currentLocation.latitude, currentLocation.longitude]} />

        {/* Marker for Current Location */}
        <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
          <Popup>
            <p>
              <strong>Latitude:</strong> {currentLocation.latitude.toFixed(5)}
              <br />
              <strong>Longitude:</strong> {currentLocation.longitude.toFixed(5)}
              <br />
              <strong>Time:</strong> {currentTime}
            </p>
          </Popup>
        </Marker>

        {/* Polyline for Path History */}
        {history.length > 1 && <Polyline positions={history} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default GPSTracker;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Set a custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to convert DMS (space-separated) to Decimal
const convertDMSToDecimal = (dms) => {
  const dmsParts = dms.split(' ').map(parseFloat);
  if (dmsParts.length !== 3) {
    console.error('Invalid DMS format:', dms);
    return 0; // Default value if invalid
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
  const [currentLocation, setCurrentLocation] = useState({ latitude: 27.66525, longitude: 85.26676, time: '' });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('http://172.188.16.118:8000/sse/');

    eventSource.onmessage = (event) => {
      try {
        let sanitizedData = event.data;

        // Sanitize the data: Replace single quotes with double quotes
        sanitizedData = sanitizedData.replace(/'/g, '"');

        // Parse the sanitized JSON
        const data = JSON.parse(sanitizedData);

        // Parse latitude, longitude, and time
        const latitude = convertDMSToDecimal(data.latitude.trim());
        const longitude = convertDMSToDecimal(data.longitude.trim());
        const time = data.time.trim();

        // Update state
        const newLocation = { latitude, longitude, time };
        setCurrentLocation(newLocation);
        setHistory((prevHistory) => [...prevHistory, newLocation]);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        console.error('Received data:', event.data); // Log raw data for debugging
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    // Cleanup the event source on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <MapContainer
        className="w-full h-screen"
        center={[currentLocation.latitude, currentLocation.longitude]}
        zoom={15}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Recenter the map on the current location */}
        <RecenterMap center={[currentLocation.latitude, currentLocation.longitude]} />

        {/* Marker for Current Location */}
        <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
          <Popup>
            Current Location: <br />
            Latitude: {currentLocation.latitude.toFixed(5)} <br />
            Longitude: {currentLocation.longitude.toFixed(5)} <br />
            Time: {currentLocation.time}
          </Popup>
        </Marker>

        {/* Markers for History */}
        {history.map((point, index) => (
          <Marker key={index} position={[point.latitude, point.longitude]}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              {point.time}
            </Tooltip>
          </Marker>
        ))}

        {/* Polyline for the path (history) */}
        {history.length > 1 && (
          <Polyline
            positions={history.map((point) => [point.latitude, point.longitude])}
            color="blue"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default GPSTracker;

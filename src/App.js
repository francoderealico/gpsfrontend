
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const App = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/location');
        setLocations(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();

    // Optional: Set up polling for real-time updates
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading map data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <MapContainer
      center={locations.length > 0 ? [locations[0].lat, locations[0].lon] : [0, 0]}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) => (
        <Marker key={index} position={[location.lat, location.lon]}>
          <Popup>
            <div>
              <strong>Location #{index + 1}</strong><br />
              Track: {location.track}<br />
              Latitude: {location.lat.toFixed(6)}<br />
              Longitude: {location.lon.toFixed(6)}<br />
              Time: {new Date(location.timestamp).toLocaleString()}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default App;

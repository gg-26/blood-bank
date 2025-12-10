import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import api from '../../services/api';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RequestMap = ({ requests, user, onLocationUpdate }) => {
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to Delhi
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setMapCenter([parseFloat(user.latitude), parseFloat(user.longitude)]);
    }
  }, [user]);

  const handleUpdateLocation = async (lat, lon) => {
    setSaving(true);
    setError('');
    try {
      await api.put('/users/profile', {
        latitude: lat,
        longitude: lon
      });
      onLocationUpdate?.({ latitude: lat, longitude: lon });
      setMapCenter([lat, lon]);
    } catch (e) {
      console.error('Failed to update location', e);
      setError('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const LocationSelector = () => {
    useMapEvents({
      click: (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lon = parseFloat(e.latlng.lng.toFixed(6));
        handleUpdateLocation(lat, lon);
      }
    });
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Nearby Blood Requests</h2>
      <p className="text-sm text-gray-600 mb-2">
        Click on the map to set/update your location. Requests are ordered by proximity.
      </p>
      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationSelector />
          {user?.latitude && user?.longitude && (
            <Marker position={[parseFloat(user.latitude), parseFloat(user.longitude)]}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
          {requests.map((request) => {
            if (request.hospital?.latitude && request.hospital?.longitude) {
              return (
                <Marker
                  key={request.request_id}
                  position={[parseFloat(request.hospital.latitude), parseFloat(request.hospital.longitude)]}
                >
                  <Popup>
                    <div>
                      <p><strong>Blood Type:</strong> {request.blood_type_needed}</p>
                      <p><strong>Units:</strong> {request.units_required}</p>
                      <p><strong>Urgency:</strong> {request.urgency_level}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>
      {saving && <p className="text-xs text-blue-600 mt-2">Saving location…</p>}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <div className="mt-4 space-y-2">
        {requests.slice(0, 5).map((request) => (
          <div key={request.request_id} className="border rounded p-3">
            <p><strong>{request.blood_type_needed}</strong> - {request.units_required} units needed</p>
            <p className="text-sm text-gray-600">Urgency: {request.urgency_level}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestMap;


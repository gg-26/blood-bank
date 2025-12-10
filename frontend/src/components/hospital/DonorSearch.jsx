import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';

// Ensure default markers load when bundled
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const DonorSearch = () => {
  const [searchParams, setSearchParams] = useState({
    bloodType: '',
    radius: 10,
    hospitalLat: '',
    hospitalLon: ''
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India

  const hospitalPosition = useMemo(() => {
    if (!searchParams.hospitalLat || !searchParams.hospitalLon) return null;
    return [parseFloat(searchParams.hospitalLat), parseFloat(searchParams.hospitalLon)];
  }, [searchParams.hospitalLat, searchParams.hospitalLon]);

  useEffect(() => {
    if (hospitalPosition) {
      setMapCenter(hospitalPosition);
    }
  }, [hospitalPosition]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.hospitalLat || !searchParams.hospitalLon || !searchParams.bloodType) {
      alert('Please fill all search parameters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/matching/donors/nearby', {
        hospitalLat: parseFloat(searchParams.hospitalLat),
        hospitalLon: parseFloat(searchParams.hospitalLon),
        bloodType: searchParams.bloodType,
        radius: parseInt(searchParams.radius, 10)
      });
      setDonors(response.data.donors || []);
    } catch (error) {
      console.error('Failed to search donors:', error);
      alert('Failed to search donors');
    } finally {
      setLoading(false);
    }
  };

  const handleMapSelect = ([lat, lon]) => {
    setSearchParams((prev) => ({
      ...prev,
      hospitalLat: lat.toFixed(6),
      hospitalLon: lon.toFixed(6)
    }));
  };

  const HospitalSelector = () => {
    useMapEvents({
      click: (e) => handleMapSelect([e.latlng.lat, e.latlng.lng])
    });

    if (!hospitalPosition) return null;
    return (
      <Marker position={hospitalPosition}>
        <Popup>Hospital Location</Popup>
      </Marker>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Search Donors</h2>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Type</label>
            <select
              required
              value={searchParams.bloodType}
              onChange={(e) => setSearchParams({ ...searchParams, bloodType: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              step="any"
              required
              value={searchParams.hospitalLat}
              onChange={(e) => setSearchParams({ ...searchParams, hospitalLat: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="28.6139"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              step="any"
              required
              value={searchParams.hospitalLon}
              onChange={(e) => setSearchParams({ ...searchParams, hospitalLon: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="77.2090"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Radius (km)</label>
            <input
              type="number"
              min="1"
              value={searchParams.radius}
              onChange={(e) => setSearchParams({ ...searchParams, radius: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div className="col-span-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Donors'}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 rounded-lg overflow-hidden border">
          <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <HospitalSelector />
            {donors.map((donor) =>
              donor.latitude && donor.longitude ? (
                <Marker
                  key={donor.user_id}
                  position={[parseFloat(donor.latitude), parseFloat(donor.longitude)]}
                >
                  <Popup>
                    <div>
                      <p className="font-semibold">{donor.name}</p>
                      <p>Blood: {donor.blood_group}</p>
                      <p>Distance: {donor.distance} km</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>

        <div className="overflow-x-auto">
          {donors.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500 border rounded-md p-4">
              No donors available in the selected vicinity. Try expanding the radius or checking another location.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance (km)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donors.map((donor) => (
                  <tr key={donor.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.blood_group}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.distance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorSearch;


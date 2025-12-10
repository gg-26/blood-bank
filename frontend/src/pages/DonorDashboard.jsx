import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileCard from '../components/donor/ProfileCard';
import DonationHistory from '../components/donor/DonationHistory';
import RequestMap from '../components/donor/RequestMap';
import EligibilityChecker from '../components/donor/EligibilityChecker';

const DonorDashboard = () => {
  const { user, logout, fetchUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests', {
        params: { status: 'pending' }
      });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">Blood Bank System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-white bg-primary-600 rounded hover:bg-primary-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProfileCard user={user} />
              <EligibilityChecker user={user} />
            </div>
            <div className="lg:col-span-2">
              <RequestMap
                requests={requests}
                user={user}
                onLocationUpdate={() => fetchUser()}
              />
              <DonationHistory user={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;


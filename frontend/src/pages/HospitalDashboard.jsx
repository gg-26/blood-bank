import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import InventoryOverview from '../components/hospital/InventoryOverview';
import RequestManager from '../components/hospital/RequestManager';
import DonorSearch from '../components/hospital/DonorSearch';

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invResponse, reqResponse] = await Promise.all([
        api.get('/inventory'),
        api.get('/requests')
      ]);
      setInventory(invResponse.data.inventory || []);
      setRequests(reqResponse.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
              <h1 className="text-xl font-bold text-primary-600">Blood Bank System - Hospital</h1>
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
          <InventoryOverview inventory={inventory} onRefresh={fetchData} />
          <RequestManager requests={requests} onRefresh={fetchData} />
          <DonorSearch />
        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;


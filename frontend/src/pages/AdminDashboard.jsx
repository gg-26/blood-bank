import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInventory: 0,
    totalRequests: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResponse, invResponse, reqResponse] = await Promise.all([
        api.get('/users'),
        api.get('/inventory'),
        api.get('/requests')
      ]);
      setStats({
        totalUsers: usersResponse.data.count || 0,
        totalInventory: invResponse.data.count || 0,
        totalRequests: reqResponse.data.count || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">Blood Bank System - Admin</h1>
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
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Inventory</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalInventory}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Requests</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalRequests}</p>
            </div>
          </div>
          <UserManagement />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;


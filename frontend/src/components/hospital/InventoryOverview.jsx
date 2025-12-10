import { useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InventoryOverview = ({ inventory, onRefresh }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    blood_type: '',
    collection_date: new Date().toISOString().split('T')[0],
    storage_location_id: ''
  });

  // Calculate stock by blood type
  const stockByType = inventory.reduce((acc, unit) => {
    if (unit.status === 'available') {
      acc[unit.blood_type] = (acc[unit.blood_type] || 0) + 1;
    }
    return acc;
  }, {});

  const chartData = Object.entries(stockByType).map(([blood_type, count]) => ({
    blood_type,
    units: count
  }));

  const handleAddUnit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', formData);
      setShowAddForm(false);
      setFormData({
        blood_type: '',
        collection_date: new Date().toISOString().split('T')[0],
        storage_location_id: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to add unit:', error);
      alert('Failed to add blood unit');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Inventory Overview</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          {showAddForm ? 'Cancel' : 'Add Blood Unit'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddUnit} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Type</label>
              <select
                required
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">Collection Date</label>
              <input
                type="date"
                required
                value={formData.collection_date}
                onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Add Unit
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="blood_type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="units" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stockByType).map(([blood_type, count]) => (
          <div key={blood_type} className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-primary-600">{count}</p>
            <p className="text-sm text-gray-600">{blood_type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryOverview;


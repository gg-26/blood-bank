import { useState } from 'react';
import api from '../../services/api';

const RequestManager = ({ requests, onRefresh }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    blood_type_needed: '',
    units_required: 1,
    urgency_level: 'medium'
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', formData);
      setShowCreateForm(false);
      setFormData({
        blood_type_needed: '',
        units_required: 1,
        urgency_level: 'medium'
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to create request:', error);
      alert('Failed to create request');
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      await api.post(`/requests/${requestId}/fulfill`, { unit_ids: [] });
      onRefresh();
    } catch (error) {
      console.error('Failed to fulfill request:', error);
      alert('Failed to fulfill request');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Blood Requests</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          {showCreateForm ? 'Cancel' : 'Create Request'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRequest} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Type Needed</label>
              <select
                required
                value={formData.blood_type_needed}
                onChange={(e) => setFormData({ ...formData, blood_type_needed: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">Units Required</label>
              <input
                type="number"
                min="1"
                required
                value={formData.units_required}
                onChange={(e) => setFormData({ ...formData, units_required: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
              <select
                value={formData.urgency_level}
                onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="col-span-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Create Request
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.request_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.blood_type_needed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.units_required}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.urgency_level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleFulfill(request.request_id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Fulfill
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestManager;


import { useEffect, useState } from 'react';
import api from '../../services/api';

const DonorFrequency = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await api.get('/users/donors/stats');
        setDonors(res.data.donors || []);
      } catch (err) {
        console.error('Failed to load donor stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Donor Frequency</h2>
      </div>
      {loading ? (
        <p className="text-sm text-gray-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Donation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donors.map((donor) => (
                <tr key={donor.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.blood_group || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.donation_count ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DonorFrequency;



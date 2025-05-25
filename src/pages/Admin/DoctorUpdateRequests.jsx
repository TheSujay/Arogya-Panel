// admin/DoctorUpdateRequests.jsx
import { useEffect, useState } from 'react';
import {
  getDoctorUpdateRequests,
  approveUpdateRequest,
  rejectUpdateRequest,
} from './api';

export default function DoctorUpdateRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getDoctorUpdateRequests();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveUpdateRequest(id);
      showMessage('✅ Approved successfully');
      fetchRequests();
    } catch (error) {
      console.error('Approval failed:', error);
      showMessage('❌ Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await rejectUpdateRequest(id);
      showMessage('❌ Rejected successfully');
      fetchRequests();
    } catch (error) {
      console.error('Rejection failed:', error);
      showMessage('❌ Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Pending Doctor Updates</h2>
      </div>

      {message && (
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded mb-4 shadow-sm">
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-500">No update requests pending.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((doctor) => (
            <div
              key={doctor._id}
              className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white"
            >
              <h3 className="text-lg font-bold text-blue-700">{doctor.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{doctor.email}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Current Info</h4>
                  <p><strong>Phone:</strong> {doctor.phone || '-'}</p>
                  <p><strong>Specialization:</strong> {doctor.specialization || '-'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Requested Update</h4>
                  <p><strong>Phone:</strong> {doctor.updateRequest?.phone || '-'}</p>
                  <p><strong>Specialization:</strong> {doctor.updateRequest?.specialization || '-'}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  onClick={() => handleApprove(doctor._id)}
                  disabled={processingId === doctor._id}
                >
                  {processingId === doctor._id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  onClick={() => handleReject(doctor._id)}
                  disabled={processingId === doctor._id}
                >
                  {processingId === doctor._id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

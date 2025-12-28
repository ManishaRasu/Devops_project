import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './Requested.css';

function Requested() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [actionLoading, setActionLoading] = useState(null);

  // fetchRequests: show loading spinner
  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/pet-requests');
      setRequests(res.data.requests);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  // fetchRequestsBg: background refresh, no spinner
  const fetchRequestsBg = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pet-requests');
      setRequests(res.data.requests);
    } catch (err) {
      // Do not update error/loading for background
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequestsBg, 3000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const handleAction = async (id, status) => {
    setActionLoading(id);
    try {
      await axios.put(`http://localhost:5000/api/pet-requests/${id}`, { status });
      const actionText = status === 'approved' ? 'approved' : 'rejected';
      showToast(`Request ${actionText} successfully`, 'success');
      fetchRequests();
    } catch (err) {
      showToast('Failed to update request', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="requested-container">
      <AdminNavbar />
      <div className="requested-content">
        <h1>User Pet Requests</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : requests.length === 0 ? (
          <p>No pet requests found.</p>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>User Email</th>
                <th>Pet Name</th>
                <th>Type</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Description</th>
                <th>Image</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td>{req.requestedBy?.name || '-'}</td>
                  <td>{req.requestedBy?.email || '-'}</td>
                  <td>{req.name}</td>
                  <td>{req.type}</td>
                  <td>{req.breed}</td>
                  <td>{req.age}</td>
                  <td>{req.gender}</td>
                  <td>{req.description}</td>
                  <td>
                    {req.image && (
                      <img src={req.image} alt="pet" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                  </td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === 'pending' && (
                      <>
                        <button
                          className="accept-btn"
                          onClick={() => handleAction(req._id, 'approved')}
                          disabled={actionLoading === req._id}
                        >
                          {actionLoading === req._id ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          className="decline-btn"
                          onClick={() => handleAction(req._id, 'rejected')}
                          disabled={actionLoading === req._id}
                        >
                          {actionLoading === req._id ? 'Processing...' : 'Decline'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
        </div>
      )}
    </div>
  );
}

export default Requested;

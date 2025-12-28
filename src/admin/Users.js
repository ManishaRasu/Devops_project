import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './Users.css';

function Users() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin-login');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, [isAuthenticated, isAdmin, navigate]);

  // Note: This fetches user data from your backend API, which is connected to MongoDB at mongodb://localhost:27017/petad
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="users-container">
      <AdminNavbar />
      <div className="users-content">
        <h1>All Users</h1>
        <p className="users-count">
          Total Users Signed Up: <b>{users.filter(u => u.role !== 'admin').length}</b>
        </p>
        {error && (
          <div className="error-message">
            {error}
            <br />
            <span style={{ fontSize: '0.95em', color: '#888' }}>
              {error.includes('Failed to fetch') && 'Please make sure the backend server is running and MongoDB is connected.'}
            </span>
          </div>
        )}
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.filter(u => u.role !== 'admin').length === 0 && !error ? (
          <div className="error-message">No users found.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Role</th>
                <th>Signup Date</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role !== 'admin').map((u, idx) => (
                <tr key={u._id}>
                  <td>{idx + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.address}</td>
                  <td>{u.role}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Users;

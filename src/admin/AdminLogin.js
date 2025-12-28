import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './adminlogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(username, password, true);
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          setError('Only admin accounts can log in here.');
        }
      } else {
        setError(result.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* Left Banner */}
        <div className="admin-login-banner">
          <div className="admin-banner-icon">🛡️</div>
          <h2 className="admin-banner-title">Admin Portal</h2>
          <p className="admin-banner-subtitle">
            Secure access to TailMate management dashboard
          </p>
          <div className="admin-banner-features">
            <div className="admin-banner-feature">
              <span className="admin-feature-icon">📊</span>
              <span>Manage platform data</span>
            </div>
            <div className="admin-banner-feature">
              <span className="admin-feature-icon">👥</span>
              <span>User administration</span>
            </div>
            <div className="admin-banner-feature">
              <span className="admin-feature-icon">🐾</span>
              <span>Pet listings control</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="admin-login-form-section">
          <div className="admin-login-header">
            <h1>Admin Login</h1>
            <p>Enter your admin credentials</p>
          </div>
          
          {error && <div className="admin-error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label>Username or Email</label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="admin-form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="admin-submit-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="admin-back-link">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
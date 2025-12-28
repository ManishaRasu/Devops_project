import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './OwnerLogin.css';

function OwnerLogin() {
  const navigate = useNavigate();
  const { loginOwner } = useAuth();
  const [idOrEmail, setIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await loginOwner(idOrEmail, password);
    if (res.success) {
      navigate('/owner');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="owner-login-page">
      <div className="owner-login-container">
        {/* Left Banner */}
        <div className="owner-login-banner">
          <div className="banner-icon">🐾</div>
          <h2 className="banner-title">Welcome Back!</h2>
          <p className="banner-subtitle">
            Manage your pets and connect with potential adopters
          </p>
          <div className="banner-features">
            <div className="banner-feature">
              <span className="banner-feature-icon">📋</span>
              <span>List and manage your pets</span>
            </div>
            <div className="banner-feature">
              <span className="banner-feature-icon">💬</span>
              <span>Chat with interested adopters</span>
            </div>
            <div className="banner-feature">
              <span className="banner-feature-icon">📊</span>
              <span>Track adoption requests</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="owner-login-form-section">
          <div className="owner-login-header">
            <h1>Owner Login</h1>
            <p>Enter your credentials to access your account</p>
          </div>
          
          {error && <div className="owner-error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="owner-login-form">
            <div className="owner-form-group">
              <label>Email or Username</label>
              <input 
                type="text"
                placeholder="Enter your email or username"
                value={idOrEmail} 
                onChange={(e) => setIdOrEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="owner-form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="owner-form-actions">
              <button type="button" className="owner-cancel-btn" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button type="submit" className="owner-submit-btn">
                Login
              </button>
            </div>
          </form>
          
          <div className="owner-signup-link">
            <p>
              Don't have an owner account?
              <button type="button" onClick={() => navigate('/owner-signup')}>
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerLogin;

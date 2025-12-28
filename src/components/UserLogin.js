import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './UserAuth.css';

function UserLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        const redirectTarget = location.state?.from?.pathname || location.state?.from || '/';
        navigate(redirectTarget, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-page">
      <div className="user-login-container">
        {/* Left Banner */}
        <div className="user-login-banner">
          <div className="user-banner-icon">🐕</div>
          <h2 className="user-banner-title">Welcome Back!</h2>
          <p className="user-banner-subtitle">
            Find your perfect furry companion today
          </p>
          <div className="user-banner-features">
            <div className="user-banner-feature">
              <span className="user-feature-icon">🔍</span>
              <span>Browse available pets</span>
            </div>
            <div className="user-banner-feature">
              <span className="user-feature-icon">❤️</span>
              <span>Save favorites</span>
            </div>
            <div className="user-banner-feature">
              <span className="user-feature-icon">📱</span>
              <span>Connect with owners</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="user-login-form-section">
          <div className="user-login-header">
            <h1>Sign In</h1>
            <p>Access your TailMate account</p>
          </div>
          
          {successMessage && <div className="user-success-message">{successMessage}</div>}
          {error && <div className="user-error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="user-login-form">
            <div className="user-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="user-form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="user-submit-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="user-signup-link">
            <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
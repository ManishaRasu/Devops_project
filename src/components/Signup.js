import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './UserAuth.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/signup', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password
      });

      if (response.data.success) {
        navigate('/user-login', {
          state: {
            message: 'Account created successfully! Please log in with your credentials.',
            email: formData.email
          }
        });
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-signup-page">
      <div className="user-signup-container">
        {/* Left Banner */}
        <div className="user-signup-banner">
          <div className="user-banner-icon">🐾</div>
          <h2 className="user-banner-title">Join TailMate</h2>
          <p className="user-banner-subtitle">
            Create your account and start your pet adoption journey
          </p>
          <div className="user-banner-features">
            <div className="user-banner-feature">
              <span className="user-feature-icon">🏠</span>
              <span>Find your perfect pet</span>
            </div>
            <div className="user-banner-feature">
              <span className="user-feature-icon">💬</span>
              <span>Chat with pet owners</span>
            </div>
            <div className="user-banner-feature">
              <span className="user-feature-icon">🎉</span>
              <span>Complete adoptions easily</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="user-signup-form-section">
          <div className="user-signup-header">
            <h1>Create Account</h1>
            <p>Join TailMate to adopt or list pets</p>
          </div>

          {error && <div className="user-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="user-signup-form">
            <div className="user-signup-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="user-signup-group">
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
            <div className="user-signup-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="user-signup-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="user-signup-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="user-signup-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="user-signup-submit">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="user-login-link">
              <p>Already have an account? <Link to="/user-login">Sign In</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;

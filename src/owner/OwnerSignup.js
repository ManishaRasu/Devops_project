import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OwnerSignup.css';

function OwnerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/owner-signup', form);
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Owner account created successfully!');
        setForm({ name:'', email:'', password:'', phone:'', address:'' });
        setTimeout(() => {
          navigate('/owner-login');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Owner signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-signup-page">
      <div className="owner-signup-container">
        {/* Left Banner */}
        <div className="owner-signup-banner">
          <div className="signup-banner-icon">🐾</div>
          <h2 className="signup-banner-title">Join TailMate</h2>
          <p className="signup-banner-subtitle">
            Start listing your pets and connect with loving adopters
          </p>
        </div>

        {/* Right Form */}
        <div className="owner-signup-form-section">
          <div className="owner-signup-header">
            <h1>Owner Signup</h1>
            <p>Create your owner account to list pets</p>
          </div>
          
          {error && <div className="owner-signup-error">{error}</div>}
          {success && <div className="owner-signup-success">{success}</div>}
          
          <form onSubmit={onSubmit} className="owner-signup-form">
            <div className="owner-signup-group">
              <label>Full Name</label>
              <input 
                name="name" 
                placeholder="Enter your full name"
                value={form.name} 
                onChange={onChange} 
                required 
                disabled={loading} 
              />
            </div>
            <div className="owner-signup-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email"
                value={form.email} 
                onChange={onChange} 
                required 
                disabled={loading} 
              />
            </div>
            <div className="owner-signup-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Create a password"
                value={form.password} 
                onChange={onChange} 
                required 
                disabled={loading} 
              />
            </div>
            <div className="owner-signup-group">
              <label>Phone Number</label>
              <input 
                name="phone" 
                placeholder="Enter phone number"
                value={form.phone} 
                onChange={onChange} 
                required 
                disabled={loading} 
              />
            </div>
            <div className="owner-signup-group full-width">
              <label>Address</label>
              <input 
                name="address" 
                placeholder="Enter your address"
                value={form.address} 
                onChange={onChange} 
                required 
                disabled={loading} 
              />
            </div>
            <div className="owner-signup-actions">
              <button 
                type="button" 
                className="owner-back-btn" 
                onClick={() => navigate('/owner-login')} 
                disabled={loading}
              >
                Back to Login
              </button>
              <button type="submit" className="owner-create-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerSignup;

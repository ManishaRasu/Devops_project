import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import OwnerNavbar from './OwnerNavbar';
import './AddPet.css';

function OwnerAddPet() {
  const { isAuthenticated, isOwner, getRoleToken } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', type: '', breed: '', age: '', gender: '', description: '', listingType: 'adoption', price: '', lat: '', lng: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      navigate('/owner-login');
    }
  }, [isAuthenticated, isOwner, navigate]);

  if (!isAuthenticated || !isOwner) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size should be less than 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }
    if (formData.listingType === 'sale' && (!formData.price || Number(formData.price) <= 0)) {
      setError('Enter a valid price for sale listings');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      fd.append('image', imageFile);
      const token = getRoleToken('owner') || localStorage.getItem('token');

      // Debug token
      console.log('Current token:', token ? 'Present' : 'Missing');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
        } catch (e) {
          console.log('Invalid token format');
        }
      }

      await axios.post('http://localhost:5000/api/owner/pets', fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.alert('Pet listed successfully');
      navigate('/owner/my-pets');
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to list pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <OwnerNavbar />
      <div className="main-content">
        <div className="page-container">
          <h1>Add or Sell a Pet</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="add-pet-form">
            <div className="form-group">
              <label>Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="">Select type</option>
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
                <option>Rabbit</option>
                <option>Fish</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Breed *</label>
              <input name="breed" value={formData.breed} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Age (years) *</label>
              <input type="number" name="age" min="0" value={formData.age} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Listing Type</label>
                <select name="listingType" value={formData.listingType} onChange={handleChange}>
                  <option value="adoption">Adoption</option>
                  <option value="sale">Sale</option>
                </select>
              </div>
              {formData.listingType === 'sale' && (
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" name="price" min="1" value={formData.price} onChange={handleChange} placeholder="Enter price in rupees" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Pet Image *</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
              {imagePreview && (
                <div className="image-preview"><img src={imagePreview} alt="preview" style={{ maxWidth: '200px', borderRadius: 8 }} /></div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input name="lat" value={formData.lat} onChange={handleChange} placeholder="e.g. 12.9716" />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input name="lng" value={formData.lng} onChange={handleChange} placeholder="e.g. 77.5946" />
              </div>
            </div>
            <div className="form-group">
              <button type="button" className="secondary-btn" onClick={() => {
                if (!navigator.geolocation) { window.alert('Geolocation not supported'); return; }
                navigator.geolocation.getCurrentPosition(pos => {
                  setFormData(prev => ({ ...prev, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
                }, () => window.alert('Failed to get location'));
              }}>Use My Current Location</button>
              {formData.lat && formData.lng && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>Location set: {formData.lat}, {formData.lng}</div>
              )}
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/owner')}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerAddPet;

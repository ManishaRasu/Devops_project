import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import OwnerNavbar from './OwnerNavbar';
import './EditPet.css';

function OwnerEditPet() {
  const { isAuthenticated, isOwner, getRoleToken } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', type: '', breed: '', age: '', gender: '', description: '', status: 'available', listingType: 'adoption', price: '', image: '', lat: '', lng: ''
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      navigate('/owner-login');
      return;
    }
    const load = async () => {
      try {
        // Prefer explicit owner token to avoid collisions with other role tokens
        const token = getRoleToken('owner') || localStorage.getItem('ownerToken') || localStorage.getItem('token');
        if (!token) {
          setError('Missing authentication token. Please login again.');
          setLoading(false);
          return;
        }
        // Light debug (safe) – avoids dumping full token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // eslint-disable-next-line no-console
          console.log('[OwnerEditPet] JWT role:', payload.role, 'userId:', payload.userId);
        } catch { /* ignore */ }

        const res = await axios.get(`http://localhost:5000/api/owner/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const p = res.data?.pet;
        if (!p) {
          setError('Pet not found in response');
          setLoading(false);
          return;
        }
        setFormData({
          name: p.name || '',
          type: p.type || '',
          breed: p.breed || '',
          age: p.age || '',
          gender: p.gender || '',
          description: p.description || '',
          status: p.status || 'available',
          listingType: p.listingType || 'adoption',
          price: p.price || '',
          image: p.image || '',
          lat: p.location?.lat != null ? p.location.lat.toString() : '',
          lng: p.location?.lng != null ? p.location.lng.toString() : ''
        });
      } catch (e) {
        // Provide more granular error feedback
        const status = e.response?.status;
        if (status === 404) {
          setError('Pet not found (404). It may have been deleted.');
        } else if (status === 403) {
          setError('Forbidden: You do not own this pet.');
        } else if (status === 401) {
          setError('Unauthorized: Session expired. Please login again.');
        } else {
          setError(e.response?.data?.message || 'Failed to load pet');
        }
        // eslint-disable-next-line no-console
        console.warn('[OwnerEditPet] Load error:', e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, isOwner, navigate, id, getRoleToken]);

  if (!isAuthenticated || !isOwner) return null;
  if (loading) return <div><OwnerNavbar /><div className="page-container">Loading...</div></div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Reset price when switching away from sale
      if (name === 'listingType' && value !== 'sale') {
        return { ...prev, [name]: value, price: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setNewImageFile(f);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result);
    r.readAsDataURL(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = getRoleToken('owner') || localStorage.getItem('ownerToken') || localStorage.getItem('token');
      if (!token) {
        setError('Missing authentication token. Please login again.');
        return;
      }
      let body;
      let headers = { Authorization: `Bearer ${token}` };
      if (newImageFile) {
        body = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (k !== 'image') body.append(k, v);
        });
        body.append('image', newImageFile);
      } else {
        body = { ...formData };
        delete body.image;
        headers['Content-Type'] = 'application/json';
      }
      // Validation: if listingType is sale ensure price positive
      if (body.listingType === 'sale') {
        const priceNum = Number(body.price);
        if (!priceNum || priceNum <= 0) {
          setError('Please enter a valid positive price for sale listing.');
          return;
        }
      }
      await axios.put(`http://localhost:5000/api/owner/pets/${id}`, body, { headers });
      window.alert('Updated');
      navigate('/owner/my-pets');
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError('You are not allowed to modify this pet.');
      } else if (status === 404) {
        setError('Pet not found while updating.');
      } else {
        setError(err.response?.data?.message || 'Failed to update pet');
      }
      // eslint-disable-next-line no-console
      console.warn('[OwnerEditPet] Update error:', err.response?.data || err.message);
    }
  };

  return (
    <div>
      <OwnerNavbar />
      <div className="main-content">
        <div className="page-container">
          <h1>Edit Pet</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={onSubmit} className="edit-pet-form">
            <div className="form-row">
              <div className="form-group"><label>Name *</label><input name="name" value={formData.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Breed *</label><input name="breed" value={formData.breed} onChange={handleChange} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Age *</label><input type="number" name="age" value={formData.age} onChange={handleChange} min="0" required /></div>
              <div className="form-group"><label>Type *</label>
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
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="adopted">Adopted</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
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
              <label>Image</label>
              {formData.image && !preview && (
                <div className="image-preview"><img src={formData.image} alt="current" style={{ maxWidth: 200, borderRadius: 8 }} /></div>
              )}
              <input type="file" accept="image/*" onChange={handleImage} />
              {preview && <div className="image-preview"><img src={preview} alt="new" style={{ maxWidth: 200, borderRadius: 8 }} /></div>}
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/owner/my-pets')}>Cancel</button>
              <button type="submit" className="submit-btn">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerEditPet;

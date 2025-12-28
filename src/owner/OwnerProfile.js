import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import OwnerNavbar from './OwnerNavbar';
import './OwnerProfile.css';

function OwnerProfile() {
  const { isAuthenticated, isOwner } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      navigate('/owner-login');
      return;
    }
    const load = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile');
        setProfile(res.data.user);
      } catch (e) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, isOwner, navigate]);

  if (!isAuthenticated || !isOwner) return null;
  if (loading) return (
    <div>
      <OwnerNavbar />
      <div className="main-content">
        <div className="profile-container">
          <div className="profile-loading">
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <OwnerNavbar />
      <div className="main-content">
        <div className="profile-container">
          <div className="profile-page-header">
            <h1>Owner Profile</h1>
          </div>

          {error && (
            <div className="profile-error">
              <p>{error}</p>
            </div>
          )}

          <div className="profile-header">
            <div className="profile-avatar">
              <span>{profile?.name?.[0]?.toUpperCase() || 'O'}</span>
            </div>
            <div className="profile-info">
              <h2>{profile?.name || 'Unknown Owner'}</h2>
              <p>{profile?.email || 'No email provided'}</p>
              <p>Owner</p>
            </div>
          </div>

          <div className="profile-details">
            <h3>Profile Details</h3>
            <div className="detail-item">
              <strong>Phone:</strong>
              <span className={`detail-value ${!profile?.phone ? 'not-available' : ''}`}>
                {profile?.phone || 'Not provided'}
              </span>
            </div>
            <div className="detail-item">
              <strong>Address:</strong>
              <span className={`detail-value ${!profile?.address ? 'not-available' : ''}`}>
                {profile?.address || 'Not provided'}
              </span>
            </div>
            <div className="detail-item">
              <strong>Member Since:</strong>
              <span className="detail-value">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </span>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="action-btn"
              onClick={() => navigate('/owner/edit-profile')}
            >
              ✏️ Edit Profile
            </button>
            <button
              className="action-btn secondary"
              onClick={() => navigate('/owner')}
            >
              🏠 Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerProfile;

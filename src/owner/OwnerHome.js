import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import OwnerNavbar from './OwnerNavbar';
import axios from 'axios';
import './OwnerHome.css';

function OwnerHome() {
  const { isAuthenticated, isOwner, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPets: 0,
    availablePets: 0,
    adoptedPets: 0,
    soldPets: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Only regular users can access owner dashboard
    if (!isAuthenticated || !isOwner) {
      navigate('/owner-login');
    }
  }, [isAuthenticated, isOwner, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('ownerToken') || localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/owner/pets', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const pets = response.data.pets || [];
      setStats({
        totalPets: pets.length,
        availablePets: pets.filter(p => p.status === 'available').length,
        adoptedPets: pets.filter(p => p.status === 'adopted').length,
        soldPets: pets.filter(p => p.status === 'sold').length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isOwner) {
      fetchStats();
    }
  }, [isAuthenticated, isOwner, fetchStats]);

  if (!isAuthenticated || !isOwner) return null;

  return (
    <div>
      <OwnerNavbar />
      <div className="owner-home-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name}! 🐾</h1>
            <p>Manage your pet listings and connect with potential adopters</p>
          </div>
          <div className="quick-actions">
            <button className="action-btn primary" onClick={() => navigate('/owner/add-pet')}>
              ➕ List New Pet
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/owner/my-pets')}>
              📋 View My Pets
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/owner/pending')}>
              ✅ Pending Adoptions
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">🏠</div>
            <div className="stat-content">
              <h3>{statsLoading ? '...' : stats.totalPets}</h3>
              <p>Total Pets Listed</p>
            </div>
          </div>
          <div className="stat-card available">
            <div className="stat-icon">💚</div>
            <div className="stat-content">
              <h3>{statsLoading ? '...' : stats.availablePets}</h3>
              <p>Available for Adoption</p>
            </div>
          </div>
          <div className="stat-card adopted">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <h3>{statsLoading ? '...' : stats.adoptedPets}</h3>
              <p>Successfully Adopted</p>
            </div>
          </div>
          <div className="stat-card sold">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{statsLoading ? '...' : stats.soldPets}</h3>
              <p>Successfully Sold</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🐕</div>
              <h3>Pet Management</h3>
              <p>Add new pets, edit existing listings, and manage availability status with ease.</p>
              <button className="feature-btn" onClick={() => navigate('/owner/add-pet')}>
                Add Pet
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Messages</h3>
              <p>Chat with potential adopters and buyers. Respond to inquiries about your pets.</p>
              <button className="feature-btn" onClick={() => navigate('/owner/messages')}>
                View Messages
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>My Listings</h3>
              <p>View all your pet listings, track adoption status, and manage your inventory.</p>
              <button className="feature-btn" onClick={() => navigate('/owner/my-pets')}>
                View Listings
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Profile Settings</h3>
              <p>Update your contact information and manage your account preferences.</p>
              <button className="feature-btn" onClick={() => navigate('/owner/profile')}>
                Edit Profile
              </button>
            </div>
          </div>

          <div className="tips-section">
            <h3>💡 Tips for Success</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>📸 Great Photos</h4>
                <p>Upload clear, well-lit photos of your pets to attract more potential adopters.</p>
              </div>
              <div className="tip-card">
                <h4>📝 Detailed Descriptions</h4>
                <p>Provide comprehensive information about your pet's personality, health, and needs.</p>
              </div>
              <div className="tip-card">
                <h4>⚡ Quick Responses</h4>
                <p>Respond promptly to messages from interested adopters to increase adoption chances.</p>
              </div>
              <div className="tip-card">
                <h4>📍 Location Info</h4>
                <p>Add location details to help adopters find you easily and plan visits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerHome;

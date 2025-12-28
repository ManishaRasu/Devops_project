import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import AdminNavbar from './AdminNavbar';
import './Users.css';

function OwnerDetails() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin, getRoleToken } = useAuth();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin-login');
      return;
    }

    const fetchOwnerDetails = async () => {
      try {
        const token = getRoleToken('admin') || localStorage.getItem('token');
        console.log('OwnerDetails - Token:', token ? 'Present' : 'Missing');
        console.log('OwnerDetails - Owner ID:', id);

        // Fetch owner details
        const ownerRes = await axios.get(`http://localhost:5000/api/admin/owners/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Owner details response:', ownerRes.data);
        setOwner(ownerRes.data.owner);

        // Fetch owner's pets
        const petsRes = await axios.get(`http://localhost:5000/api/admin/owner/${id}/pets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Owner pets response:', petsRes.data);
        setPets(petsRes.data.pets || []);

      } catch (err) {
        console.error('Failed to fetch owner details:', err);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to load owner details');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDetails();

    // Set up auto-refresh every 2 seconds
    const interval = setInterval(fetchOwnerDetails, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [id, isAuthenticated, isAdmin, navigate, getRoleToken]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div>
        <AdminNavbar />
        <div className="main-content">
          <div className="page-container">
            <div className="loading">Loading owner details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div>
        <AdminNavbar />
        <div className="main-content">
          <div className="page-container">
            <div className="error-message">{error || 'Owner not found'}</div>
            <button className="cancel-btn" onClick={() => navigate('/admin/owners')}>
              Back to Owners
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasRatings = owner.ratingCount > 0 && Number.isFinite(Number(owner.ratingAverage));
  const formattedAverage = hasRatings ? Number(owner.ratingAverage).toFixed(1) : null;
  const ratingLabel = owner.ratingCount === 1 ? 'rating' : 'ratings';

  return (
    <div>
      <AdminNavbar />
      <div className="main-content admin-main">
        <div className="page-container">
          <div className="details-header">
            <button className="cancel-btn" onClick={() => navigate('/admin/owners')}>
              ← Back to Owners
            </button>
            <h1>Owner Details</h1>
          </div>

          <div className="owner-details-card">
            <div className="owner-info-section">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name:</strong>
                  <span>{owner.name}</span>
                </div>
                <div className="info-item">
                  <strong>Email:</strong>
                  <span>{owner.email}</span>
                </div>
                <div className="info-item">
                  <strong>Phone:</strong>
                  <span>{owner.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <strong>Role:</strong>
                  <span className="role-badge owner">{owner.role}</span>
                </div>
                <div className="info-item">
                  <strong>Join Date:</strong>
                  <span>{new Date(owner.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <strong>Rating:</strong>
                  {hasRatings ? (
                    <span className="owner-rating-chip">
                      <span className="owner-rating-score">{formattedAverage}</span>
                      <span className="owner-rating-star">★</span>
                      <span className="owner-rating-count">{owner.ratingCount} {ratingLabel}</span>
                    </span>
                  ) : (
                    <span className="owner-rating-empty">No ratings yet</span>
                  )}
                </div>
                {owner.lastRatedAt && (
                  <div className="info-item">
                    <strong>Last Rated:</strong>
                    <span className="owner-rating-meta">{new Date(owner.lastRatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pets-section">
              <h2>Pets Owned ({pets.length})</h2>
              {pets.length === 0 ? (
                <p>This owner has no pets listed.</p>
              ) : (
                <div className="pets-grid">
                  {pets.map((pet) => (
                    <div key={pet._id} className="pet-card">
                      <div className="pet-image">
                        <img src={pet.image} alt={pet.name} />
                      </div>
                      <div className="pet-info">
                        <h4>{pet.name}</h4>
                        <p><strong>Type:</strong> {pet.type}</p>
                        <p><strong>Breed:</strong> {pet.breed}</p>
                        <p><strong>Age:</strong> {pet.age} years</p>
                        <p><strong>Status:</strong> <span className={`status-badge ${pet.status}`}>{pet.status}</span></p>
                        <p><strong>Listing:</strong> {pet.listingType}</p>
                        {pet.price && (
                          <p><strong>Price:</strong> ₹{pet.price}</p>
                        )}
                        <p><strong>Added:</strong> {new Date(pet.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="pet-actions">
                        <button
                          className="view-btn"
                          onClick={() => navigate(`/pets/${pet._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDetails;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './OwnerPetsPage.css';

function OwnerPetsPage() {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOwnerPets = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/owners/${ownerId}/pets`);
        if (data.success) {
          setOwner(data.owner);
          setPets(data.pets);
        } else {
          setError('Failed to load owner pets');
        }
      } catch (err) {
        console.error('Error fetching owner pets:', err);
        setError(err.response?.data?.message || 'Failed to load owner pets');
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchOwnerPets();
    }
  }, [ownerId]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="owner-pets-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading pets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="owner-pets-container">
          <div className="error-state">
            <div className="error-icon">😕</div>
            <h2>Oops!</h2>
            <p>{error}</p>
            <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="owner-pets-container fade-in">
        <div className="owner-pets-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="owner-info-banner">
            <div className="owner-avatar">
              {owner?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="owner-details">
              <h1>{owner?.name}'s Pets</h1>
              <p className="owner-email">{owner?.email}</p>
              {owner?.phone && <p className="owner-phone">📞 {owner.phone}</p>}
            </div>
          </div>
        </div>

        {pets.length === 0 ? (
          <div className="no-pets-state">
            <div className="no-pets-icon">🐾</div>
            <h2>No Available Pets</h2>
            <p>This owner doesn't have any pets available for adoption right now.</p>
            <Link to="/pets" className="browse-btn">Browse All Pets</Link>
          </div>
        ) : (
          <>
            <div className="pets-count">
              <span className="count-badge">{pets.length}</span>
              <span>Available {pets.length === 1 ? 'Pet' : 'Pets'}</span>
            </div>
            <div className="pets-grid">
              {pets.map((pet) => (
                <Link to={`/pets/${pet._id}`} key={pet._id} className="pet-card">
                  <div className="pet-image-wrapper">
                    <img src={pet.image} alt={pet.name} className="pet-image" />
                    <div className="pet-type-badge">{pet.type}</div>
                    {pet.listingType === 'sale' && pet.price && (
                      <div className="pet-price-badge">₹{pet.price}</div>
                    )}
                  </div>
                  <div className="pet-info">
                    <h3 className="pet-name">{pet.name}</h3>
                    <p className="pet-breed">{pet.breed}</p>
                    <div className="pet-meta">
                      <span>{pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
                      <span className="separator">•</span>
                      <span>{pet.gender || 'Unknown'}</span>
                    </div>
                    <div className="pet-listing-type">
                      {pet.listingType === 'sale' ? '🏷️ For Sale' : '💚 For Adoption'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OwnerPetsPage;

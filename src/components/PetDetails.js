import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PetDetails.css';
import { useAuth } from './AuthContext';
import PetLocationMap from './PetLocationMap';
import { FavoritesContext } from './FavoritesContext';

function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isOwner } = useAuth();
  const { addToFavorites, removeFromFavorites, favoriteItems } = useContext(FavoritesContext);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/pets/${id}`);
        setPet(res.data);
      } catch (err) {
        console.error('Failed to load pet', err);
        setError('Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const handleAdoptOrBuyClick = () => {
    const isRegularUser = isAuthenticated && !isAdmin && !isOwner;
    if (!isRegularUser) {
      navigate('/user-login');
      return;
    }
    navigate(`/pets/${id}/request`);
  };

  const handleChatClick = () => {
    const isRegularUser = isAuthenticated && !isAdmin && !isOwner;
    if (!isRegularUser) {
      navigate('/user-login');
      return;
    }
    navigate(`/pets/${id}/chat`);
  };

  const isFavorite = () => favoriteItems?.some((item) => item._id === id);

  const handleFavoriteToggle = () => {
    const isRegularUser = isAuthenticated && !isAdmin;
    if (!isRegularUser) {
      navigate('/user-login');
      return;
    }
    if (pet) {
      if (isFavorite()) {
        removeFromFavorites(pet._id);
      } else {
        addToFavorites(pet);
      }
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-container"><div className="loading">Loading...</div></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="main-content">
        <div className="page-container"><div className="error-message">{error || 'Pet not found'}</div></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="pet-details-container fade-in">
        <div className="details-header">
          <button aria-label="Back" className="icon-btn" onClick={() => navigate(-1)}>←</button>
          <h2>{pet.name}</h2>
          <button
            className={`favorite-btn header-favorite ${isFavorite() ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            title={isFavorite() ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite() ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="details-body">
          <div className="details-image">
            <img src={pet.image} alt={pet.name} />
          </div>
          <div className="details-info">
            <p><strong>Type:</strong> {pet.type}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age} years</p>
            <p><strong>Gender:</strong> {pet.gender && pet.gender.trim() ? pet.gender : 'Not specified'}</p>
            {pet.price != null && (
              <p><strong>Price:</strong> ₹{pet.price}</p>
            )}
            <p className="details-description">{pet.description}</p>
            {pet.owner && (
              <div className="owner-info">
                <h4>Owner Information</h4>
                <p><strong>Owner:</strong> {pet.owner.name}</p>
                <p><strong>Contact:</strong> {pet.owner.email}</p>
                {pet.owner.phone && (
                  <p><strong>Phone:</strong> {pet.owner.phone}</p>
                )}
              </div>
            )}
            <div className="details-actions">
              <button className="adopt-btn" onClick={handleAdoptOrBuyClick}>
                {pet.listingType === 'sale' ? 'Buy Now!' : 'Adopt Me!'}
              </button>
              {pet.owner && pet.ownerModel === 'Owner' && (
                <button className="secondary-btn" onClick={handleChatClick}>Chat with Owner</button>
              )}
            </div>
          </div>
        </div>

        {pet.location?.lat != null && pet.location?.lng != null ? (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ margin: '16px 0 8px' }}>Location</h4>
            <PetLocationMap lat={pet.location.lat} lng={pet.location.lng} petName={pet.name} />
          </div>
        ) : (
          <div style={{ marginTop: 24, fontSize: 14, color: '#666' }}><em>Location not provided by owner.</em></div>
        )}

        <div className="details-footer">
          <button className="cancel-btn" onClick={() => navigate('/pets')}>Cancel</button>
        </div>
      </div>
      {/* Separate page handles the form */}
    </div>
  );
}

export default PetDetails;

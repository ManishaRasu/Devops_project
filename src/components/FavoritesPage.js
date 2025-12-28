import React, { useContext, useEffect } from 'react';
import { FavoritesContext } from './FavoritesContext'; // ✅ Correct context
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FavoritesPage.css'; // ✅ Using dedicated FavoritesPage styles

const FavoritesPage = () => {
  const { favoriteItems, removeFromFavorites } = useContext(FavoritesContext);
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Check if user is a regular user (not admin)
  const isRegularUser = isAuthenticated && !isAdmin;

  useEffect(() => {
    if (!isRegularUser) {
      navigate('/user-login');
    }
  }, [isRegularUser, navigate]);

  const handleAdopt = async (petId, petName) => {
    if (!isRegularUser) {
      navigate('/user-login');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/pets/${petId}/adopt`);
      // Remove from favorites after successful adoption
      removeFromFavorites(petId);
      alert(`${petName} adopted successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to adopt pet');
    }
  };

  // If not a regular user, don't render the page
  if (!isRegularUser) {
    return null;
  }

  return (
    <div className="favorites-main-content">
      <div className="favorites-pets-container fade-in">
        <div className="favorites-header">
          <h1>Your Favorites</h1>
          <div className="favorites-count">Total Favorites: {favoriteItems.length}</div>
        </div>

        <div className="favorites-pet-cards">
          {favoriteItems.length === 0 ? (
            <div className="favorites-empty-state">
              <h3>No favorites added yet.</h3>
              <p>Browse our pets and add your favorites to see them here!</p>
            </div>
          ) : (
            favoriteItems.map((pet) => (
              <div className="pet-card" key={pet._id}>
                <div className="pet-image-container">
                  <img src={pet.image} alt={pet.name} />
                  <button 
                    className="favorite-btn favorited"
                    onClick={() => removeFromFavorites(pet._id)}
                  >
                    ❤️
                  </button>
                </div>
                <div className="pet-info">
                  <h3>{pet.name}</h3>
                  <p><strong>Type:</strong> {pet.type}</p>
                  <p><strong>Breed:</strong> {pet.breed}</p>
                  <p><strong>Age:</strong> {pet.age} years</p>
                  <p><strong>Gender:</strong> {pet.gender && pet.gender.trim() ? pet.gender : 'Not specified'}</p>
                  <p className="pet-description">{pet.description}</p>
                  <div className="favorites-pet-buttons">
                    <button className="adopt-btn" onClick={() => handleAdopt(pet._id, pet.name)}>Adopt Me!</button>
                    <button className="cart-btn" onClick={() => removeFromFavorites(pet._id)}>Remove from Favorites</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;

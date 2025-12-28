import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { FavoritesContext } from './FavoritesContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ImageModal from './ImageModal';
import './PetsPage.css';
import './PetCard.css';

function PetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin } = useAuth();
  const { addToFavorites, removeFromFavorites, favoriteItems } = useContext(FavoritesContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // No modal state for separate page flow

  // Check if user is a regular user (not admin)
  const isRegularUser = isAuthenticated && !isAdmin;

  useEffect(() => {
    fetchPets();
    const interval = setInterval(fetchPets, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle URL search parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);

      // Auto-select filter based on search query
      const query = searchFromUrl.toLowerCase();
      if (query.includes('dog') || query.includes('puppy')) {
        setSelectedType('Dog');
      } else if (query.includes('cat') || query.includes('kitten')) {
        setSelectedType('Cat');
      } else if (query.includes('bird') || query.includes('parrot') || query.includes('canary')) {
        setSelectedType('Bird');
      } else if (query.includes('rabbit') || query.includes('bunny')) {
        setSelectedType('Rabbit');
      } else if (query.includes('fish') || query.includes('goldfish')) {
        setSelectedType('Fish');
      }
    }
  }, [searchParams]);

  const fetchPets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pets');
      setPets(response.data);
    } catch (error) {
      setError('Failed to fetch pets');
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptOrBuyClick = (pet) => {
    if (!isRegularUser) {
      navigate('/user-login');
      return;
    }
    navigate(`/pets/${pet._id}/request`);
  };

  const breedOptions = [...new Set(pets.filter(p => !selectedType || p.type === selectedType).map(p => p.breed))];

  const filteredPets = pets.filter(pet => {
    const matchesSearch = !searchQuery ||
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      pet.status === 'available' &&
      matchesSearch &&
      (!selectedType || pet.type === selectedType) &&
      (!selectedBreed || pet.breed === selectedBreed) &&
      (!selectedAge || pet.age.toString() === selectedAge) &&
      (!selectedGender || pet.gender === selectedGender)
    );
  });

  const isFavorite = (petId) => {
    return favoriteItems.some(item => item._id === petId);
  };

  const handleFavoriteToggle = (pet) => {
    // Only allow regular users (not admin) to add favorites
    if (!isRegularUser) {
      navigate('/user-login');
      return;
    }
    if (isFavorite(pet._id)) {
      removeFromFavorites(pet._id);
    } else {
      addToFavorites(pet);
    }
  };

  const handleImageClick = (pet) => {
    setModalImage({
      url: pet.image,
      alt: `${pet.name} - ${pet.breed}`
    });
    setIsModalOpen(true);
  };

  const openDetails = (petId) => {
    navigate(`/pets/${petId}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-container">
          <div className="loading">Loading pets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="pets-container fade-in">
        <div className="filter-sidebar">
          <h2>Filter Pets</h2>
          <label>
            Type:
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setSelectedBreed('');
              }}
            >
              <option value="">All</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Fish">Fish</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Breed:
            <select
              value={selectedBreed}
              onChange={e => setSelectedBreed(e.target.value)}
            >
              <option value="">All</option>
              {breedOptions.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </label>

          <label>
            Gender:
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          <label>
            Age:
            <select
              value={selectedAge}
              onChange={e => setSelectedAge(e.target.value)}
            >
              <option value="">All</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(age => (
                <option key={age} value={age}>{age} years</option>
              ))}
            </select>
          </label>
        </div>

        <div className="pet-cards">
          {error && <div className="error-message">{error}</div>}

          {filteredPets.length === 0 ? (
            <div className="no-pets">
              <h3>No pets found</h3>
              <p>Try adjusting your filters or check back later for new pets!</p>
            </div>
          ) : (
            filteredPets.map(pet => (
              <div className="pet-card" key={pet._id} onClick={() => openDetails(pet._id)}>
                <div className="pet-image-container">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    onClick={(e) => { e.stopPropagation(); handleImageClick(pet); }}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full size"
                  />
                  <button
                    className={`favorite-btn ${isFavorite(pet._id) ? 'favorited' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(pet); }}
                  >
                    {isFavorite(pet._id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="pet-info">
                  <h3>{pet.name}</h3>
                  <p><strong>Type:</strong> {pet.type}</p>
                  <p><strong>Breed:</strong> {pet.breed}</p>
                  <p><strong>Age:</strong> {pet.age} years</p>
                  <p><strong>Gender:</strong> {pet.gender && pet.gender.trim() ? pet.gender : 'Not specified'}</p>
                  {pet.listingType === 'sale' && pet.price && (
                    <p className="pet-price"><strong>Price:</strong> ₹{pet.price}</p>
                  )}
                  <p className="pet-description">{pet.description}</p>
                  <div className="pet-buttons">
                    <button
                      className="adopt-btn"
                      onClick={(e) => { e.stopPropagation(); handleAdoptOrBuyClick(pet); }}
                    >
                      {pet.listingType === 'sale' ? 'Buy Now!' : 'Adopt Me!'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {showLoginPopup && (
          <div className="login-popup-overlay">
            <div className="login-popup">
              <h3>User Login Required</h3>
              <p>You must be logged in as a regular user to adopt pets or add them to favorites.</p>
              <button className="adopt-btn" onClick={() => { setShowLoginPopup(false); window.location.href = '/user-login'; }}>
                Go to User Login
              </button>
              <button className="cancel-btn" onClick={() => setShowLoginPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <ImageModal
        isOpen={isModalOpen}
        imageUrl={modalImage?.url}
        altText={modalImage?.alt}
        onClose={closeModal}
      />
      {/* Separate page handles the form; no modal here */}
    </div>
  );
}

export default PetsPage;

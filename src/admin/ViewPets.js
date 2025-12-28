import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import ImageModal from '../components/ImageModal';
import './ViewPets.css';

function ViewPets() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin-login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    fetchPets();
    const interval = setInterval(fetchPets, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const handleDeletePet = async (petId) => {
    const pet = pets.find(p => p._id === petId);
    setDeleteConfirm({ petId, petName: pet?.name || 'this pet' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/pets/${deleteConfirm.petId}`);
      setPets(pets.filter(pet => pet._id !== deleteConfirm.petId));
      showToast(`${deleteConfirm.petName} deleted successfully`, 'success');
    } catch (error) {
      showToast('Failed to delete pet', 'error');
      console.error('Error deleting pet:', error);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleEditPet = (petId) => {
    navigate(`/admin/edit-pet/${petId}`);
  };

  const handleImageClick = (pet) => {
    setModalImage({
      url: pet.image,
      alt: `${pet.name} - ${pet.breed}`
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="view-pets-container">
        <AdminNavbar />
        <div className="loading">Loading pets...</div>
      </div>
    );
  }

  // Separate groups
  const availablePets = pets.filter(pet => pet.status === 'available');
  // Combine adopted and sold for admin overview
  const completedPets = pets.filter(pet => pet.status === 'adopted' || pet.status === 'sold');

  return (
    <div className="view-pets-container">
      <AdminNavbar />
      <div className="view-pets-content">
        <div className="view-pets-header">
          <h1>Manage Pets</h1>
          <p>View and manage all pets in the system</p>
          <button
            onClick={() => navigate('/admin/add-pet')}
            className="add-pet-btn"
          >
            ➕ Add New Pet
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Available Pets Section */}
        <h2>Available Pets</h2>
        <div className="pets-grid">
          {availablePets.length === 0 ? (
            <div className="no-pets">
              <h3>No available pets found</h3>
              <p>Add some pets to get started!</p>
              <button
                onClick={() => navigate('/admin/add-pet')}
                className="add-pet-btn"
              >
                Add First Pet
              </button>
            </div>
          ) : (
            availablePets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <div className="pet-image">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    onClick={() => handleImageClick(pet)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full size"
                  />
                  <div className={`pet-status ${pet.status}`}>
                    Available
                  </div>
                </div>
                <div className="pet-info">
                  <h3>{pet.name}</h3>
                  <p className="pet-breed">{pet.breed}</p>
                  <p className="pet-type">{pet.type} • {pet.age} years old</p>
                  <p className="pet-gender"><strong>Gender:</strong> {pet.gender}</p>
                  {pet.listingType === 'sale' && pet.price && (
                    <p className="pet-price"><strong>Price: ₹{pet.price}</strong></p>
                  )}
                  <p className="pet-description">{pet.description}</p>
                </div>
                <div className="pet-actions">
                  <button
                    onClick={() => handleEditPet(pet._id)}
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet._id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Adopted / Sold Pets Section */}
        <h2>Adopted / Sold Pets</h2>
        <div className="pets-grid">
          {completedPets.length === 0 ? (
            <div className="no-pets">
              <h3>No adopted or sold pets found</h3>
            </div>
          ) : (
            completedPets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <div className="pet-image">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    onClick={() => handleImageClick(pet)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full size"
                  />
                  <div className={`pet-status ${pet.status}`}>
                    {pet.status === 'sold' ? 'Sold' : 'Adopted'}
                  </div>
                </div>
                <div className="pet-info">
                  <h3>{pet.name}</h3>
                  <p className="pet-breed">{pet.breed}</p>
                  <p className="pet-type">{pet.type} • {pet.age} years old</p>
                  <p className="pet-gender"><strong>Gender:</strong> {pet.gender}</p>
                  {pet.listingType === 'sale' && pet.price && (
                    <p className="pet-price"><strong>{pet.status === 'sold' ? 'Sold for' : 'Listed Price'}: ₹{pet.price}</strong></p>
                  )}
                  <p className="pet-description">{pet.description}</p>
                  {pet.adoptedBy && pet.adoptedBy.name && (
                    <div className="adopted-info">
                      <p><strong>{pet.status === 'sold' ? 'Purchased by:' : 'Adopted by:'}</strong> {pet.adoptedBy.name}</p>
                      {pet.adoptedAt && (
                        <p><strong>{pet.status === 'sold' ? 'Sold on:' : 'Adopted on:'}</strong> {new Date(pet.adoptedAt).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="pet-actions">
                  <button
                    onClick={() => handleEditPet(pet._id)}
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet._id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={modalImage?.url}
        altText={modalImage?.alt}
        onClose={closeModal}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.petName}</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
        </div>
      )}
    </div>
  );
}

export default ViewPets;

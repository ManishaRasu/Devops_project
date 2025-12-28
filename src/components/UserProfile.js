import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserProfile.css';

function UserProfile() {
  // Include isOwner so we don't treat owners as regular adopters
  const { isAuthenticated, isAdmin, isOwner } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  // Regular user = authenticated AND not admin AND not owner
  const isRegularUser = isAuthenticated && !isAdmin && !isOwner;

  useEffect(() => {
    if (!isRegularUser) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      // If an owner accidentally lands here, send them to owner profile instead of login
      if (isOwner) {
        navigate('/owner/profile');
      } else {
        navigate('/user-login');
      }
      return;
    }

    let isCancelled = false;

    const fetchUserProfile = async (initial = false) => {
      try {
        if (initial) {
          setLoading(true);
        }
        const [profileRes, transactionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/user/profile'),
          axios.get('http://localhost:5000/api/user/transactions')
        ]);
        if (isCancelled) return;
        setUserProfile(profileRes.data.user);
        setTransactions(transactionsRes?.data?.transactions || []);
        setError('');
      } catch (error) {
        if (isCancelled) return;
        if (initial) {
          setError('Failed to load user profile');
        }
        console.error('Error fetching user profile or transactions:', error);
      } finally {
        if (initial && !isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile(true);

    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
    pollRef.current = setInterval(() => {
      fetchUserProfile(false);
    }, 2000);

    return () => {
      isCancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isRegularUser, isOwner, navigate]);

  const refreshTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/transactions');
      setTransactions(response?.data?.transactions || []);
    } catch (err) {
      console.error('Failed to refresh transactions', err);
    }
  };

  const openRatingModal = (tx) => {
    setToast(null);
    setRatingModal({
      transactionId: tx._id,
      rating: tx.rating || 0,
      petName: tx.pet?.name || 'this pet'
    });
  };

  const closeRatingModal = () => {
    if (ratingSubmitting) return;
    setRatingModal(null);
  };

  const setModalRating = (value) => {
    setRatingModal(prev => (prev ? { ...prev, rating: value } : prev));
  };

  const handleSubmitRating = async () => {
    if (!ratingModal || !ratingModal.rating) {
      setToast({ type: 'error', message: 'Select a star rating before submitting.' });
      return;
    }
    setRatingSubmitting(true);
    setToast(null);
    try {
      await axios.post(`http://localhost:5000/api/transactions/${ratingModal.transactionId}/rate`, {
        rating: ratingModal.rating
      });
      setToast({ type: 'success', message: 'Thanks for rating! The owner can now confirm the handover.' });
      setRatingModal(null);
      await refreshTransactions();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit rating. Please try again.';
      setToast({ type: 'error', message });
    } finally {
      setRatingSubmitting(false);
    }
  };

  const renderStars = (value = 0, interactive = false, onSelect = () => { }) => {
    const rounded = Math.round(value);
    return (
      <div className={`star-row ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= rounded;
          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                className={`star ${filled ? 'filled' : ''}`}
                onClick={() => onSelect(star)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            );
          }
          return (
            <span key={star} className={`star ${filled ? 'filled' : ''}`}>
              ★
            </span>
          );
        })}
      </div>
    );
  };

  const handleChatWithOwner = (petId) => {
    if (!petId) {
      setToast({ type: 'error', message: 'We could not open the chat for this pet just yet.' });
      return;
    }
    navigate(`/pets/${petId}/chat`);
  };

  if (!isRegularUser) {
    return null; // Render nothing while redirecting
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="page-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="profile-container fade-in">
        {toast && (
          <div className={`profile-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{userProfile?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-info">
            <h1>{userProfile?.name}</h1>
            <p className="user-email">{userProfile?.email}</p>
            <p className="user-role">{userProfile?.role === 'admin' ? 'Administrator' : 'Pet Lover'}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card adopted-stat-card">
            <div className="stat-number">{userProfile?.adoptedPets?.length || 0}</div>
            <div className="stat-label">Pets Adopted</div>
          </div>
          <div className="stat-card phone-stat-card">
            <div className="stat-number">{userProfile?.phone || 'N/A'}</div>
            <div className="stat-label">Phone Number</div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="detail-item">
              <strong>Email:</strong> {userProfile?.email}
            </div>
            <div className="detail-item">
              <strong>Phone:</strong> {userProfile?.phone || 'Not provided'}
            </div>
            <div className="detail-item">
              <strong>Address:</strong> {userProfile?.address || 'Not provided'}
            </div>
          </div>

          {transactions?.length > 0 && (
            <div className="detail-section">
              <h3>Pending Pet Transactions</h3>
              {transactions.filter(tx => tx.status === 'pending').length === 0 ? (
                <p className="pending-empty">No pending confirmations right now.</p>
              ) : (
                <div className="pending-transactions">
                  {transactions
                    .filter(tx => tx.status === 'pending')
                    .map((tx) => {
                      const petId = tx?.pet?._id || tx?.pet || tx?.petId;
                      return (
                        <div key={tx._id} className="pending-card">
                          <div className="pending-card-main">
                            <div className="pending-thumb">
                              {tx.pet?.image ? (
                                <img src={tx.pet.image} alt={tx.pet?.name || 'Pet'} />
                              ) : (
                                <div className="pending-thumb-placeholder">
                                  {(tx.pet?.name || 'P').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="pending-pet-info">
                              <h4>{tx.pet?.name || 'Pet'}</h4>
                              <p>
                                {tx.type === 'adoption' ? 'Adoption' : 'Purchase'} Request • {tx.pet?.breed || 'Unknown breed'}
                              </p>
                              <span className="pending-status">Waiting for owner confirmation</span>
                            </div>
                            <div className="pending-otp-block">
                              <span>Share this OTP with the owner</span>
                              <strong>{tx.otp || 'Generating...'}</strong>
                            </div>
                          </div>
                          <div className="pending-actions">
                            <button
                              type="button"
                              className="chat-owner-btn"
                              onClick={() => handleChatWithOwner(petId)}
                              disabled={!petId}
                            >
                              💬 Chat with Owner
                            </button>
                            {tx.status === 'pending' && !tx.userRated && (
                              <div className="rating-area">
                                <span className="rating-hint">Help the owner by leaving a quick rating.</span>
                                <button
                                  type="button"
                                  className="rate-btn"
                                  onClick={() => openRatingModal(tx)}
                                >
                                  Rate Owner
                                </button>
                              </div>
                            )}
                            {tx.status === 'pending' && tx.userRated && (
                              <div className="rating-area success">
                                <span className="rating-hint">Thanks! Owner can now confirm.</span>
                                {renderStars(tx.rating || 0)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {userProfile?.adoptedPets && userProfile.adoptedPets.length > 0 && (
            <div className="detail-section">
              <h3>Adopted Pets</h3>
              <div className="adopted-pets">
                {userProfile.adoptedPets.map((pet, index) => (
                  <div key={pet._id || index} className="pet-card">
                    <div className="pet-image">
                      <img src={pet.image} alt={pet.name} />
                    </div>
                    <div className="pet-info">
                      <h4>{pet.name}</h4>
                      <p>{pet.breed} • {pet.age} years old</p>
                      <p className="pet-description">{pet.description}</p>
                      {pet.adoptedAt && (
                        <p className="adopted-date"><strong>Adopted on:</strong> {new Date(pet.adoptedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-item">
              <strong>Member Since:</strong> {new Date(userProfile?.createdAt).toLocaleDateString()}
            </div>
            <div className="detail-item">
              <strong>Account Type:</strong> {userProfile?.role === 'admin' ? 'Administrator' : 'Regular User'}
            </div>
          </div>
        </div>
        {ratingModal && (
          <div className="rating-modal-overlay" role="dialog" aria-modal="true">
            <div className="rating-modal">
              <h3>Rate the owner</h3>
              <p>How was your experience completing the adoption of {ratingModal.petName}?</p>
              {renderStars(ratingModal.rating, true, setModalRating)}
              <div className="rating-modal-actions">
                <button type="button" className="cancel-btn" onClick={closeRatingModal} disabled={ratingSubmitting}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleSubmitRating}
                  disabled={ratingSubmitting || !ratingModal.rating}
                >
                  {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile; 
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './AdoptBuyPage.css';

export default function AdoptBuyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [mode, setMode] = useState('adoption');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: details, 2: payment (for purchase)
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cod'
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading to avoid premature redirect due to race condition
    if (authLoading) return;
    const isRegularUser = isAuthenticated && !isAdmin; // regular user (owners currently pass as regular per existing logic)
    if (!isRegularUser) {
      navigate('/user-login');
      return;
    }
    const fetchPet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/pets/${id}`);
        setPet(res.data);
        setMode(res.data?.listingType === 'sale' ? 'purchase' : 'adoption');
      } catch (err) {
        setPageError('Failed to load pet');
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id, isAuthenticated, isAdmin, authLoading, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    // For purchase, move to payment step first
    if (mode === 'purchase' && step === 1) {
      setStep(2);
      return;
    }
    // Validate contact info only on final submission (adoption, or purchase step 2)
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setFormError('Name, Email and Phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      const petName = pet?.name || 'this pet';
      let payStatus = null;
      let payRef = null;
      let payMethod = null;
      if (mode === 'purchase') {
        payMethod = paymentMethod;
        // Simple frontend validation for card
        if (paymentMethod === 'card') {
          if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
            setFormError('Please complete card details.');
            setSubmitting(false);
            return;
          }
          // Fake approval
          payStatus = 'succeeded';
          payRef = 'PMT-' + Math.random().toString(36).slice(2, 10).toUpperCase();
        } else {
          // Cash on delivery equivalent for pets (reservation)
          payStatus = 'pending';
          payRef = 'COD-' + Math.random().toString(36).slice(2, 10).toUpperCase();
        }
      }

      await axios.post(`http://localhost:5000/api/pets/${id}/request`, {
        type: mode,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        message: message.trim(),
        paymentMethod: payMethod,
        paymentStatus: payStatus,
        paymentRef: payRef
      });
      const initiateRes = await axios.post(`http://localhost:5000/api/pets/${id}/initiate`, { type: mode });
      const transactionId = initiateRes?.data?.transactionId;
      const purchaseNotice = mode === 'purchase'
        ? (payStatus === 'succeeded'
          ? 'Payment authorised. '
          : 'Reservation recorded. ')
        : '';
      setSuccess('Request submitted successfully! Your OTP is now available in your profile.');
      window.alert(`${purchaseNotice}Request submitted! Check your profile for the OTP to share with the owner.`);
      navigate('/profile', {
        replace: true,
        state: {
          flash: `${petName} request submitted. Share your OTP with the owner to complete the ${mode === 'purchase' ? 'purchase' : 'adoption'}.`,
          transactionId
        }
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <div className="main-content"><div className="page-container"><div className="loading">Loading...</div></div></div>;
  if (pageError || !pet) return <div className="main-content"><div className="page-container"><div className="error-message">{pageError || 'Pet not found'}</div></div></div>;

  return (
    <div className="main-content">
      <div className="adoptbuy-page fade-in">
        <div className="page-header">
          <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
          <h2>{mode === 'purchase' ? `Buy ${pet.name}` : `Adopt ${pet.name}`}</h2>
        </div>

        <div className="pet-summary">
          <img className="pet-img" src={pet.image} alt={pet.name} />
          <div className="pet-info">
            <div className="pet-name">{pet.name}</div>
            <div className="pet-meta">{pet.type} • {pet.breed} • {pet.age} years • {pet.gender || 'N/A'}</div>
            {pet.listingType === 'sale' && pet.price != null && (
              <div className="pet-price">Price: ₹{pet.price}</div>
            )}
          </div>
        </div>

        {formError && <div className="form-error">{formError}</div>}
        {success && <div className="form-success">{success}</div>}

        <form className="adoptbuy-form" target="_self" onSubmit={onSubmit}>
          <div className="field">
            <label>Name<span className="req">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email<span className="req">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone<span className="req">*</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          {mode === 'purchase' && step === 2 && (
            <>
              <div className="field">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="card">Card</option>
                  <option value="cod">Pay on Pickup</option>
                </select>
              </div>
              {paymentMethod === 'card' && (
                <>
                  <div className="field">
                    <label>Card Number</label>
                    <input inputMode="numeric" maxLength={19} placeholder="4111 1111 1111 1111" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Name on Card</label>
                    <input value={cardName} onChange={e => setCardName(e.target.value)} />
                  </div>
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label>Expiry (MM/YY)</label>
                      <input placeholder="12/29" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                    </div>
                    <div>
                      <label>CVV</label>
                      <input inputMode="numeric" maxLength={4} placeholder="123" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          <div className="actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(`/pets/${id}`)}>Cancel</button>
            <button type="submit" className="adopt-btn" disabled={submitting}>
              {submitting
                ? (mode === 'purchase' && step === 2 ? 'Submitting...' : 'Submitting...')
                : (mode === 'purchase' ? (step === 1 ? 'Continue to Payment' : 'Submit Request') : 'Submit Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

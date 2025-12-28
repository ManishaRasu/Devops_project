import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OwnerNavbar from './OwnerNavbar';
import { useAuth } from '../components/AuthContext';
import './OwnerPending.css';

function OwnerPending() {
    const { isAuthenticated, isOwner } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [otpInputs, setOtpInputs] = useState({});

    useEffect(() => {
        if (!isAuthenticated || !isOwner) {
            navigate('/owner-login');
        }
    }, [isAuthenticated, isOwner, navigate]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('ownerToken') || localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/owner/transactions', {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined
            });
            setTransactions(response.data.transactions || []);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError('Unable to load pending confirmations right now.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && isOwner) {
            fetchTransactions();
        }
    }, [isAuthenticated, isOwner, fetchTransactions]);

    const handleOtpChange = (id, value) => {
        setOtpInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleConfirm = async (transaction) => {
        const otpValue = (otpInputs[transaction._id] || '').trim();
        if (otpValue.length < 6) {
            setError('Enter the 6-digit OTP before confirming.');
            return;
        }
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('ownerToken') || localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/transactions/${transaction._id}/confirm`,
                { otp: otpValue },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                }
            );
            setSuccess(`Handover confirmed for ${transaction.pet?.name || 'pet'}!`);
            setOtpInputs(prev => ({ ...prev, [transaction._id]: '' }));
            fetchTransactions();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to confirm handover. Please double-check the OTP.';
            setError(message);
        }
    };

    const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
    const recentTransactions = transactions
        .filter(tx => tx.status === 'confirmed')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);

    if (!isAuthenticated || !isOwner) {
        return null;
    }

    return (
        <div>
            <OwnerNavbar />
            <div className="pending-container">
                <header className="pending-hero">
                    <div>
                        <p className="eyebrow">Adopted Pets • Pending OTP</p>
                        <h1>Pending Handover Confirmations</h1>
                        <p>Share the OTP with adopters and confirm the handover as soon as they give you the code.</p>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/owner')}>
                        ← Back to Dashboard
                    </button>
                </header>

                {success && <div className="pending-success">{success}</div>}
                {error && <div className="pending-error">{error}</div>}

                <section className="pending-section">
                    <div className="section-header">
                        <h2>Awaiting Confirmation</h2>
                        <span className="chip">{pendingTransactions.length} pending</span>
                    </div>
                    {loading ? (
                        <div className="pending-loading">Loading pending requests...</div>
                    ) : pendingTransactions.length === 0 ? (
                        <div className="pending-empty-box">
                            <h3>All caught up! 🎉</h3>
                            <p>No pending OTP confirmations at the moment.</p>
                        </div>
                    ) : (
                        <div className="pending-card-grid">
                            {pendingTransactions.map((tx) => (
                                <div key={tx._id} className="pending-card">
                                    <div className="pending-card-main">
                                        <div className="pending-pet-thumb">
                                            {tx.pet?.image ? (
                                                <img src={tx.pet.image} alt={tx.pet?.name || 'Pet'} />
                                            ) : (
                                                <div className="pending-pet-placeholder">
                                                    {(tx.pet?.name || 'P').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="pending-card-info">
                                            <h3>{tx.pet?.name || 'Pet'}</h3>
                                            <p className="muted">{tx.type === 'adoption' ? 'Adoption' : 'Purchase'} request</p>
                                            <p className="muted">Adopter: {tx.user?.name || 'Unknown'} ({tx.user?.email || 'n/a'})</p>
                                        </div>
                                        <div className="otp-pill">OTP: {tx.otp}</div>
                                    </div>
                                    <div className="pending-card-footer">
                                        <div className="otp-instructions">Enter the adopter's OTP to finish the handover.</div>
                                        <div className="otp-inputs">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="Enter OTP"
                                                value={otpInputs[tx._id] || ''}
                                                onChange={(e) => handleOtpChange(tx._id, e.target.value.replace(/[^0-9]/g, ''))}
                                            />
                                            <button
                                                onClick={() => handleConfirm(tx)}
                                                disabled={(otpInputs[tx._id] || '').length < 6}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="pending-section">
                    <div className="section-header">
                        <h2>Recently Confirmed</h2>
                        <span className="chip light">Last {recentTransactions.length}</span>
                    </div>
                    {recentTransactions.length === 0 ? (
                        <p className="pending-empty">No recent confirmations.</p>
                    ) : (
                        <div className="recent-list">
                            {recentTransactions.map(tx => (
                                <div key={tx._id} className="recent-item">
                                    <div>
                                        <strong>{tx.pet?.name || 'Pet'}</strong>
                                        <p className="muted">{tx.user?.name || 'Unknown adopter'}</p>
                                    </div>
                                    <span>{new Date(tx.updatedAt || tx.createdAt).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default OwnerPending;

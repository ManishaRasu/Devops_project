import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import './OwnerChat.css';
import OwnerNavbar from './OwnerNavbar';

export default function OwnerChat() {
    const { id } = useParams(); // pet id
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [pet, setPet] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const pollRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/owner-login');
            return;
        }
        if (!userId) {
            setError('Missing userId');
            setLoading(false);
            return;
        }
        const fetchPet = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/owner/pets/${id}`);
                if (!res.data?.success) throw new Error('Failed');
                setPet(res.data.pet);
            } catch (e) {
                setError(e.response?.data?.message || 'Failed to load pet');
            }
        };
        fetchPet();
    }, [id, isAuthenticated, navigate, userId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/pets/${id}/messages`, { params: { userId } });
            if (res.data?.success) {
                setMessages(res.data.messages);
                // Scroll to bottom after messages load
                setTimeout(scrollToBottom, 100);
            }
            // Mark user messages as read for this thread
            try { await axios.post(`http://localhost:5000/api/pets/${id}/messages/mark-read`, { userId }); } catch (_) { }
        } catch (e) {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;
        loadMessages();
        pollRef.current = setInterval(loadMessages, 3000);
        return () => clearInterval(pollRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, userId]);

    const onSend = async (e) => {
        e.preventDefault();
        setError('');
        const msg = text.trim();
        if (!msg) return;
        try {
            const res = await axios.post(`http://localhost:5000/api/pets/${id}/messages`, { text: msg, userId });
            if (!res.data?.success) throw new Error(res.data?.message || 'Failed');
            setText('');
            await loadMessages();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to send');
        }
    };

    const onClose = async () => {
        if (!window.confirm('Close this chat and clear all messages with this user?')) return;
        try { await axios.delete(`http://localhost:5000/api/pets/${id}/messages`, { data: { userId } }); } catch (_) { }
        clearInterval(pollRef.current);
        setMessages([]);
        navigate('/owner/messages');
    };

    if (loading && !pet) return <div className="main-content"><div className="page-container">Loading…</div></div>;
    if (error && !pet) return <div className="main-content"><div className="page-container"><div className="error-message">{error}</div></div></div>;

    return (
        <div className="chat-container">
            <OwnerNavbar />
            <div className="main-content">
                <div className="owner-chat-page">
                    <div className="owner-chat-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
                            <h3>Chat — {pet?.name}</h3>
                        </div>
                        <button className="cancel-btn" onClick={onClose} style={{ padding: '6px 12px' }}>Close Chat</button>
                    </div>
                    {error && <div className="error-message" style={{ flexShrink: 0 }}>{error}</div>}
                    <div className="owner-chat-box">
                        <div className="owner-messages">
                            {messages.length === 0 && <div className="no-messages">No messages yet.</div>}
                            {messages.map(m => {
                                const isMine = m.fromRole === 'owner';
                                return (
                                    <div key={m._id} className={`owner-msg ${isMine ? 'mine' : 'theirs'}`}>
                                        <div>{m.text}</div>
                                        <div className="meta">{new Date(m.createdAt).toLocaleTimeString()}</div>
                                        {isMine && (
                                            <div className="ticks">
                                                <span className={`tick ${m.read ? 'read' : ''}`}>✓</span>
                                                <span className={`tick ${m.read ? 'read' : ''}`}>{m.read ? '✓' : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={onSend} className="owner-send-row">
                            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message" />
                            <button type="submit" className="adopt-btn">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

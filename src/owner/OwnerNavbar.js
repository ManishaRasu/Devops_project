import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../admin/AdminNavbar.css';

function OwnerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-nav-container">
        <div className="admin-nav-brand">
          <Link to="/owner">
            <span className="admin-logo">🐾</span>
            <span className="admin-title">TailMate Owner</span>
          </Link>
        </div>

        <div className="admin-nav-menu">
          <Link to="/owner" className="admin-nav-link">Dashboard</Link>
          <Link to="/owner/add-pet" className="admin-nav-link">Add/Sell Pet</Link>
          <Link to="/owner/my-pets" className="admin-nav-link">My Pets</Link>
          <Link to="/owner/pending" className="admin-nav-link">Pending OTP</Link>
          <Link to="/owner/messages" className="admin-nav-link">Messages</Link>
          <Link to="/owner/profile" className="admin-nav-link">Profile</Link>
        </div>

        <div className="admin-nav-user">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name}</span>
            <span className="admin-user-role">Pet Owner</span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default OwnerNavbar;

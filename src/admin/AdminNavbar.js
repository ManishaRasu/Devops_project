import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './AdminNavbar.css';

function AdminNavbar() {
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
          <Link to="/admin">
            <span className="admin-logo">🐾</span>
            <span className="admin-title">TailMate Admin</span>
          </Link>
        </div>

        <div className="admin-nav-menu">
          <Link to="/admin" className="admin-nav-link">
            Dashboard
          </Link>
          <Link to="/admin/add-pet" className="admin-nav-link">
            Add Pet
          </Link>
          <Link to="/admin/view-pets" className="admin-nav-link">
            View Pets
          </Link>
          <Link to="/admin/requests" className="admin-nav-link">
            Requests
          </Link>
          <Link to="/admin/users" className="admin-nav-link">
            Users
          </Link>
          <Link to="/admin/owners" className="admin-nav-link">
            Owners
          </Link>
        </div>

        <div className="admin-nav-user">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name}</span>
            <span className="admin-user-role">Administrator</span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;

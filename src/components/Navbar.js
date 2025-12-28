import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FavoritesContext } from './FavoritesContext';
import { useAuth } from './AuthContext';
import paw from './assets/paw.png';
import './Navbar.css';

function Navbar({ onLoginClick }) {
  const { favoriteItems } = useContext(FavoritesContext);
  const { user, isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleUserClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else if (isOwner) {
      navigate('/owner');
    } else {
      navigate('/profile');
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/user-login');
    }
  };

  // Show user profile menu logic:
  // - Regular users: show on all pages
  // - Admin users: only show on admin pages (not on home, pets, about, etc.)
  const isAdminPage = location.pathname.startsWith('/admin');
  const isOwnerPage = location.pathname.startsWith('/owner');
  // Show dropdown menu for:
  // - Admin on admin pages
  // - Regular users (not admin, not owner) on user pages
  // - Owners only on owner pages (hide on user pages)
  const showUserProfileMenu = isAuthenticated && (
    (isAdmin && isAdminPage) || (!isAdmin && !isOwner) || (isOwner && isOwnerPage)
  );

  // Helper function to check if a link is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={paw} alt="TailMate Logo" />
        <span>TailMate</span>
      </div>
      <ul className="nav-links">
        <li><Link to="/" className={isActiveLink('/') ? 'active' : ''}>Home</Link></li>
        <li><Link to="/pets" className={isActiveLink('/pets') ? 'active' : ''}>Pets</Link></li>
        {/* Show favorites and Add Pets Request link for regular users only (not admin) */}
  {isAuthenticated && !isAdmin && !isOwner && (
          <>
            <li>
              <Link to="/favorites" className={isActiveLink('/favorites') ? 'active' : ''}>
                Favorites ({favoriteItems.length})
              </Link>
            </li>
            <li>
              <Link to="/add-pet-request" className={isActiveLink('/add-pet-request') ? 'active' : ''}>
                Add Pet Request
              </Link>
            </li>
          </>
        )}
        <li><Link to="/about" className={isActiveLink('/about') ? 'active' : ''}>About Us</Link></li>
        
        {showUserProfileMenu ? (
          <li className="user-menu" ref={dropdownRef}>
            <div 
              className="user-avatar" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p><strong>{user?.name}</strong></p>
                  <p className="user-email">{user?.email}</p>
                  <p>{isAdmin ? 'Admin' : isOwner ? 'Owner' : 'User'}</p>
                </div>
                <div className="dropdown-actions">
                  <button onClick={handleUserClick}>
                    {isAdmin ? 'Admin Dashboard' : isOwner ? 'Owner Dashboard' : 'My Profile'}
                  </button>
                  {isOwner && (
                    <>
                      <button onClick={() => { setShowUserMenu(false); navigate('/owner/profile'); }}>Owner Profile</button>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link to="/admin/add-pet">Add Pet</Link>
                      <Link to="/admin/view-pets">View Pets</Link>
                      <Link to="/admin/users">Manage Users</Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </li>
        ) : (
          <>
            {/* On non-dashboard pages, always show user-facing Login/Signup, even if admin/owner is authenticated */}
            <li>
              <button onClick={handleLoginClick} className="nav-btn">
                Login
              </button>
            </li>
            <li><Link to="/signup" className="nav-btn-signup">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;

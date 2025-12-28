import React from 'react';
import { Link } from 'react-router-dom';
import './LoginOptions.css';

function LoginOptions({ onClose, onUserLogin, onOwnerLogin, onAdminLogin }) {
  return (
    <div className="login-overlay">
      <div className="login-box">
        <h2>Select Login Type</h2>
        <div className="login-buttons">
          {/* Use Links for reliable client-side navigation; also call onClose to hide modal */}
          <Link className="login-option" to="/user-login" onClick={onClose}>User Login</Link>
          <Link className="login-option" to="/owner-login" onClick={onClose}>Owner Login</Link>
          <Link className="login-option" to="/admin-login" onClick={onClose}>Admin Login</Link>
        </div>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default LoginOptions;
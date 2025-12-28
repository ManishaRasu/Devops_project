import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './AdminHome.css';

function AdminHome() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin-login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-container">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage pets and oversee the TailMate platform from your dashboard.</p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">🐕</div>
            <div className="stat-content">
              <h3>Total Pets</h3>
              <p className="stat-number">Manage all pets</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">➕</div>
            <div className="stat-content">
              <h3>Add New Pet</h3>
              <p className="stat-number">Add pets to adoption</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>User Management</h3>
              <p className="stat-number">Monitor users</p>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <div className="action-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/admin/add-pet" className="action-btn primary">
                <span>➕</span>
                Add New Pet
              </Link>
              <Link to="/admin/view-pets" className="action-btn secondary">
                <span>👁️</span>
                View All Pets
              </Link>
            </div>
          </div>

          <div className="action-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📊</div>
                <div className="activity-content">
                  <h4>Dashboard Overview</h4>
                  <p>Monitor pet adoptions and user activity</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🔧</div>
                <div className="activity-content">
                  <h4>System Management</h4>
                  <p>Manage platform settings and configurations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;

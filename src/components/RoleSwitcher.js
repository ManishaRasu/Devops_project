import React from 'react';
import { useAuth } from './AuthContext';
import './RoleSwitcher.css';

function RoleSwitcher() {
  const { user, getRoleToken, switchToRole } = useAuth();

  const hasAdminToken = !!getRoleToken('admin');
  const hasOwnerToken = !!getRoleToken('owner');
  const currentRole = user?.role;

  if (!hasAdminToken && !hasOwnerToken) {
    return null; // Don't show if no multiple roles available
  }

  return (
    <div className="role-switcher">
      <div className="role-switcher-header">
        <span>Switch Role</span>
      </div>
      <div className="role-buttons">
        {hasAdminToken && (
          <button 
            className={`role-btn ${currentRole === 'admin' ? 'active' : ''}`}
            onClick={() => switchToRole('admin')}
            disabled={currentRole === 'admin'}
          >
            👑 Admin
          </button>
        )}
        {hasOwnerToken && (
          <button 
            className={`role-btn ${currentRole === 'owner' ? 'active' : ''}`}
            onClick={() => switchToRole('owner')}
            disabled={currentRole === 'owner'}
          >
            🐾 Owner
          </button>
        )}
      </div>
      <div className="current-role">
        Current: <span className={`role-badge ${currentRole}`}>{currentRole}</span>
      </div>
    </div>
  );
}

export default RoleSwitcher;

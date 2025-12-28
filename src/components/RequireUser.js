import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RequireUser = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="main-content">
                <div className="page-container">
                    <div className="loading">Checking login...</div>
                </div>
            </div>
        );
    }

    const isRegularUser = isAuthenticated && !isAdmin;

    if (!isRegularUser) {
        return <Navigate to="/user-login" replace state={{ from: location }} />;
    }

    return children;
};

export default RequireUser;

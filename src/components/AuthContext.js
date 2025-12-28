import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Get role-specific token
  const getRoleToken = (role) => {
    switch(role) {
      case 'admin':
        return localStorage.getItem('adminToken');
      case 'owner':
        return localStorage.getItem('ownerToken');
      default:
        return localStorage.getItem('token'); // user token
    }
  };

  // Set role-specific token
  const setRoleToken = (role, tokenValue) => {
    switch(role) {
      case 'admin':
        if (tokenValue) {
          localStorage.setItem('adminToken', tokenValue);
          localStorage.setItem('token', tokenValue); // For backward compatibility
        } else {
          localStorage.removeItem('adminToken');
        }
        break;
      case 'owner':
        if (tokenValue) {
          localStorage.setItem('ownerToken', tokenValue);
          localStorage.setItem('token', tokenValue); // For backward compatibility
        } else {
          localStorage.removeItem('ownerToken');
        }
        break;
      default:
        if (tokenValue) {
          localStorage.setItem('token', tokenValue);
        } else {
          localStorage.removeItem('token');
        }
    }
  };

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/user/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/api/admin-login' : '/api/user-login';
      const data = isAdmin ? { adminId: email, password } : { email, password };
      
      const response = await axios.post(`http://localhost:5000${endpoint}`, data);
      
      const { token: newToken, user: userData } = response.data;
      
      // Store token based on role
      const role = isAdmin ? 'admin' : 'user';
      setRoleToken(role, newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };
  const loginOwner = async (idOrEmail, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/owner-login', {
        ownerId: idOrEmail,
        password
      });
      const { token: newToken, user: userData } = response.data;
      
      // Store owner token separately
      setRoleToken('owner', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/signup', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    // Clear all tokens
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('ownerToken');
    setToken(null);
    setUser(null);
  };

  // Switch between roles if tokens exist
  const switchToRole = (role) => {
    const roleToken = getRoleToken(role);
    if (roleToken) {
      setToken(roleToken);
      localStorage.setItem('token', roleToken);
      // Refresh user data for the new role
      window.location.reload();
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginOwner,
    signup,
    logout,
    switchToRole,
    getRoleToken,
    updateUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
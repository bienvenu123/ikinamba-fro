import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    /**
     * IMPORTANT:
     * Only auto-authenticate if we have BOTH a user and a token.
     * This prevents the app from "logging you in" automatically
     * when there is only leftover user data from development,
     * which was making the login page never appear.
     */
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      // Clean up any partial / stale auth data
      if (storedUser || storedToken) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Try the auth/login endpoint first
      try {
        const response = await authService.login(username, password);
        const userData = response.data || response.user || response;
        const token = response.token || response.data?.token;

        // Store user and token
        if (token) {
          localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } catch (authError) {
        // If auth endpoint doesn't exist (404), try to find user from users list
        // This is a fallback for development when auth endpoint is not implemented
        if (authError.message.includes('404') || authError.message.includes('Not Found')) {
          // Import userService dynamically to avoid circular dependency
          const userService = (await import('../services/userService')).default;
          const usersResponse = await userService.getAllUsers();
          const users = usersResponse.data || [];
          const foundUser = users.find(u => u.username === username);

          if (foundUser) {
            // For development: allow login without password verification
            // In production, this should be removed and proper auth endpoint should be used
            const userData = foundUser;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true, user: userData };
          } else {
            throw new Error('User not found');
          }
        }
        throw authError;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

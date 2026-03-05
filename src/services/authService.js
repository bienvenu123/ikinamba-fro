import { apiRequest } from '../utils/apiHelper';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ikinamba-1.onrender.com/api';

/**
 * Auth Service
 * Handles authentication-related API calls
 */
const authService = {
  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} Response with user data and token (if applicable)
   */
  login: async (username, password) => {
    return apiRequest(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      'Login failed. Please check your credentials.'
    );
  },

  /**
   * Logout user
   * @returns {Promise} Response with success message
   */
  logout: async () => {
    try {
      return apiRequest(
        `${API_BASE_URL}/auth/logout`,
        { method: 'POST' },
        'Logout failed'
      );
    } catch (error) {
      // Even if logout fails on server, clear local storage
      return { success: true };
    }
  },

  /**
   * Get current user (verify token/session)
   * @returns {Promise} Response with current user data
   */
  getCurrentUser: async () => {
    return apiRequest(
      `${API_BASE_URL}/auth/me`,
      { method: 'GET' },
      'Failed to get current user'
    );
  },
};

export default authService;

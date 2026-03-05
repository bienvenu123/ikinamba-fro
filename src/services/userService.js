import { apiRequest } from '../utils/apiHelper';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ikinamba-1.onrender.com/api';

/**
 * User Service
 * Handles all API calls related to users
 */
const userService = {
  /**
   * Get all users
   * @returns {Promise} Response with users data
   */
  getAllUsers: async () => {
    return apiRequest(
      `${API_BASE_URL}/users`,
      { method: 'GET' },
      'Failed to fetch users'
    );
  },

  /**
   * Get a single user by ID
   * @param {string} id - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: async (id) => {
    return apiRequest(
      `${API_BASE_URL}/users/${id}`,
      { method: 'GET' },
      'Failed to fetch user'
    );
  },

  /**
   * Create a new user
   * @param {Object} userData - User data (full_name, username, password, role)
   * @returns {Promise} Response with created user data
   */
  createUser: async (userData) => {
    return apiRequest(
      `${API_BASE_URL}/users`,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      'Failed to create user'
    );
  },

  /**
   * Update a user by ID
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Response with updated user data
   */
  updateUser: async (id, userData) => {
    return apiRequest(
      `${API_BASE_URL}/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(userData),
      },
      'Failed to update user'
    );
  },

  /**
   * Delete a user by ID
   * @param {string} id - User ID
   * @returns {Promise} Response with success message
   */
  deleteUser: async (id) => {
    return apiRequest(
      `${API_BASE_URL}/users/${id}`,
      { method: 'DELETE' },
      'Failed to delete user'
    );
  },
};

export default userService;

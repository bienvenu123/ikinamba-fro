const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ikinamba-1.onrender.com/api';

/**
 * Driver Service
 * Handles all API calls related to drivers
 */
const driverService = {
  /**
   * Get all drivers
   * @returns {Promise} Response with drivers data
   */
  getAllDrivers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch drivers');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single driver by ID
   * @param {string} id - Driver ID
   * @returns {Promise} Response with driver data
   */
  getDriverById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch driver');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new driver
   * @param {Object} driverData - Driver data (full_name, phone, plate_number, car_type, car_color)
   * @returns {Promise} Response with created driver data
   */
  createDriver: async (driverData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create driver');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a driver by ID
   * @param {string} id - Driver ID
   * @param {Object} driverData - Updated driver data
   * @returns {Promise} Response with updated driver data
   */
  updateDriver: async (id, driverData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update driver');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a driver by ID
   * @param {string} id - Driver ID
   * @returns {Promise} Response with success message
   */
  deleteDriver: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete driver');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default driverService;

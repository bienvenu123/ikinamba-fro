const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ikinamba-1.onrender.com/api';

/**
 * Service Service
 * Handles all API calls related to services
 */
const serviceService = {
  /**
   * Get all services
   * @returns {Promise} Response with services data
   */
  getAllServices: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch services');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single service by ID
   * @param {string} id - Service ID
   * @returns {Promise} Response with service data
   */
  getServiceById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch service');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new service
   * @param {Object} serviceData - Service data (service_name, price, description)
   * @returns {Promise} Response with created service data
   */
  createService: async (serviceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create service');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a service by ID
   * @param {string} id - Service ID
   * @param {Object} serviceData - Updated service data
   * @returns {Promise} Response with updated service data
   */
  updateService: async (id, serviceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update service');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a service by ID
   * @param {string} id - Service ID
   * @returns {Promise} Response with success message
   */
  deleteService: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete service');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default serviceService;

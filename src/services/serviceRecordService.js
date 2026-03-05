const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ikinamba-1.onrender.com/api';

/**
 * Service Record Service
 * Handles all API calls related to service records
 */
const serviceRecordService = {
  /**
   * Get all service records
   * @param {string} status - Optional status filter (PENDING, IN_PROGRESS, COMPLETED)
   * @returns {Promise} Response with service records data
   */
  getAllServiceRecords: async (status = null) => {
    try {
      const url = status
        ? `${API_BASE_URL}/service-records?status=${status}`
        : `${API_BASE_URL}/service-records`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch service records');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single service record by ID
   * @param {string} id - Service Record ID
   * @returns {Promise} Response with service record data
   */
  getServiceRecordById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-records/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch service record');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get service records by driver ID
   * @param {string} driverId - Driver ID
   * @returns {Promise} Response with service records data
   */
  getServiceRecordsByDriverId: async (driverId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/service-records/driver/${driverId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch service records');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new service record
   * @param {Object} recordData - Service record data
   * @returns {Promise} Response with created service record data
   */
  createServiceRecord: async (recordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create service record');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a service record by ID
   * @param {string} id - Service Record ID
   * @param {Object} recordData - Updated service record data
   * @returns {Promise} Response with updated service record data
   */
  updateServiceRecord: async (id, recordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update service record');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a service record by ID
   * @param {string} id - Service Record ID
   * @returns {Promise} Response with success message
   */
  deleteServiceRecord: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-records/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete service record');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default serviceRecordService;

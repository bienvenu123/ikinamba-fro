const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ikinamba-1.onrender.com/api';

/**
 * Material Service
 * Handles all API calls related to materials
 */
const materialService = {
  /**
   * Get all materials
   * @returns {Promise} Response with materials data
   */
  getAllMaterials: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch materials');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single material by ID
   * @param {string} id - Material ID
   * @returns {Promise} Response with material data
   */
  getMaterialById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch material');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get materials by service record ID
   * @param {string} serviceRecordId - Service Record ID
   * @returns {Promise} Response with materials data
   */
  getMaterialsByServiceRecordId: async (serviceRecordId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/materials/service-record/${serviceRecordId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch materials');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new material
   * @param {Object} materialData - Material data (service_record_id, item_name, quantity, condition_note)
   * @returns {Promise} Response with created material data
   */
  createMaterial: async (materialData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create material');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a material by ID
   * @param {string} id - Material ID
   * @param {Object} materialData - Updated material data
   * @returns {Promise} Response with updated material data
   */
  updateMaterial: async (id, materialData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update material');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a material by ID
   * @param {string} id - Material ID
   * @returns {Promise} Response with success message
   */
  deleteMaterial: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete material');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default materialService;

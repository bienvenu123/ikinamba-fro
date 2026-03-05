import { apiRequest } from '../utils/apiHelper';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ikinamba-1.onrender.com/api';

/**
 * Report Service
 * Handles all report-related data fetching
 */
const reportService = {
  /**
   * Get drivers report data
   * @returns {Promise} Drivers data for reporting
   */
  getDriversReport: async () => {
    return apiRequest(
      `${API_BASE_URL}/drivers`,
      { method: 'GET' },
      'Failed to fetch drivers'
    );
  },

  /**
   * Get services report data
   * @returns {Promise} Services data for reporting
   */
  getServicesReport: async () => {
    return apiRequest(
      `${API_BASE_URL}/services`,
      { method: 'GET' },
      'Failed to fetch services'
    );
  },

  /**
   * Get service records report data
   * @param {string} status - Optional status filter
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {Promise} Service records data for reporting
   */
  getServiceRecordsReport: async (status = null, startDate = null, endDate = null) => {
    let url = `${API_BASE_URL}/service-records`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    return apiRequest(
      url,
      { method: 'GET' },
      'Failed to fetch service records'
    );
  },

  /**
   * Get materials report data
   * @param {string} serviceRecordId - Optional service record filter
   * @returns {Promise} Materials data for reporting
   */
  getMaterialsReport: async (serviceRecordId = null) => {
    let url = `${API_BASE_URL}/materials`;
    if (serviceRecordId) {
      url = `${API_BASE_URL}/materials/service-record/${serviceRecordId}`;
    }

    return apiRequest(
      url,
      { method: 'GET' },
      'Failed to fetch materials'
    );
  },

  /**
   * Get users report data
   * @returns {Promise} Users data for reporting
   */
  getUsersReport: async () => {
    return apiRequest(
      `${API_BASE_URL}/users`,
      { method: 'GET' },
      'Failed to fetch users'
    );
  },

  /**
   * Get summary/dashboard report
   * @returns {Promise} Summary statistics
   */
  getSummaryReport: async () => {
    try {
      const [driversData, servicesData, recordsData, materialsData, usersData] = await Promise.all([
        apiRequest(`${API_BASE_URL}/drivers`, { method: 'GET' }, 'Failed to fetch drivers').catch(() => ({ data: [] })),
        apiRequest(`${API_BASE_URL}/services`, { method: 'GET' }, 'Failed to fetch services').catch(() => ({ data: [] })),
        apiRequest(`${API_BASE_URL}/service-records`, { method: 'GET' }, 'Failed to fetch service records').catch(() => ({ data: [] })),
        apiRequest(`${API_BASE_URL}/materials`, { method: 'GET' }, 'Failed to fetch materials').catch(() => ({ data: [] })),
        apiRequest(`${API_BASE_URL}/users`, { method: 'GET' }, 'Failed to fetch users').catch(() => ({ data: [] })),
      ]);

      return {
        drivers: driversData.data || [],
        services: servicesData.data || [],
        records: recordsData.data || [],
        materials: materialsData.data || [],
        users: usersData.data || [],
      };
    } catch (error) {
      throw error;
    }
  },
};

export default reportService;

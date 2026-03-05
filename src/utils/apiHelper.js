/**
 * API Helper Utility
 * Provides common error handling for API calls
 */

/**
 * Handles API response errors
 * @param {Response} response - Fetch response object
 * @param {string} defaultMessage - Default error message
 * @returns {Promise<Error>} Error object with message
 */
export const handleApiError = async (response, defaultMessage = 'Request failed') => {
  let errorMessage = defaultMessage;
  
  try {
    const error = await response.json();
    errorMessage = error.message || error.error || errorMessage;
    
    // Handle validation errors
    if (error.errors) {
      const validationErrors = Object.values(error.errors)
        .map(err => err.message || err)
        .join(', ');
      errorMessage = validationErrors || errorMessage;
    }
  } catch (e) {
    // If response is not JSON, use status text
    errorMessage = `Server error: ${response.status} ${response.statusText || 'Internal Server Error'}`;
  }
  
  return new Error(errorMessage);
};

/**
 * Handles network and other fetch errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
export const handleNetworkError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new Error('Unable to connect to server. Please check if the backend is running on port 5000.');
  }
  return error;
};

/**
 * Makes an API request with improved error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} defaultErrorMessage - Default error message
 * @returns {Promise} Response data
 */
export const apiRequest = async (url, options = {}, defaultErrorMessage = 'Request failed') => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await handleApiError(response, defaultErrorMessage);
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw handleNetworkError(error);
  }
};

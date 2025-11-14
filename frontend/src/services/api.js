const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Fetch all escalations with optional filters
 * @param {Object} filters - Filter options (status, priority, category, search)
 * @returns {Promise<Array>} Array of escalations
 */
export const fetchEscalations = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/escalations${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

/**
 * Fetch a single escalation by ID
 * @param {string} id - Escalation ID
 * @returns {Promise<Object>} Escalation object
 */
export const fetchEscalationById = async (id) => {
  const url = `${API_BASE_URL}/escalations/${id}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Escalation not found');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

/**
 * Fetch escalation statistics
 * @returns {Promise<Object>} Statistics object
 */
export const fetchEscalationStats = async () => {
  const url = `${API_BASE_URL}/escalations/stats`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const fetchSimilarEscalations = async (id) => {
  const url = `${API_BASE_URL}/escalations/${id}/similar`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch similar escalations`);
  }

  return await response.json();
};



const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic API request wrapper
 */
export const apiClient = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

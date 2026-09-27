const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Core HTTP Request Wrapper
 */
export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  // Set default JSON Content-Type unless payload is FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = json?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json?.data !== undefined ? json.data : json;
};

// API Feature Services

export const authApi = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  verifyEmail: (token, email) => request(`/auth/verify?token=${encodeURIComponent(token)}${email ? `&email=${encodeURIComponent(email)}` : ''}`),
  resendVerification: (email) => request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me')
};

export const resultsApi = {
  getMyResults: () => request('/results/my-results'),
  updateGrade: (subjectId, grade) => request(`/results/grade/${subjectId}`, { method: 'PUT', body: JSON.stringify({ grade }) }),
  updateElective: (subjectId, isSelected) => request(`/results/elective/${subjectId}`, { method: 'PUT', body: JSON.stringify({ isSelected }) })
};

export const curriculumApi = {
  getCurriculum: () => request('/curriculum'),
  updateSubject: (id, data) => request(`/curriculum/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAuditHistory: (subjectId) => request(`/curriculum/audit-history${subjectId ? `?subjectId=${subjectId}` : ''}`)
};

export const usersApi = {
  getAllUsers: (search) => request(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getUserDetails: (id) => request(`/users/${id}`),
  flagUser: (id, reason) => request(`/users/${id}/flag`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' })
};

export const importsApi = {
  uploadPdf: (formData) => request('/imports/upload', { method: 'POST', body: formData }),
  applyResults: (data) => request('/imports/apply', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: () => request('/imports/history')
};

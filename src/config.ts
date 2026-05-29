export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ JWT Token Helpers
export const saveToken = (token: string) => localStorage.setItem('serviq_token', token);
export const getToken = () => localStorage.getItem('serviq_token');
export const removeToken = () => localStorage.removeItem('serviq_token');

// ✅ Get headers with JWT for API calls
export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

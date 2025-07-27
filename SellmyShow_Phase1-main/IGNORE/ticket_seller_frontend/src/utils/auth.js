// utils/auth.js

// Check if JWT token is expired
export function isTokenExpired() {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode base64 payload
    const expiry = payload.exp * 1000; // Convert expiry to milliseconds
    return Date.now() > expiry;
  } catch (e) {
    return true; // If decoding fails, treat token as expired
  }
}

// Get user info from JWT
export function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

// Logout helper
export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

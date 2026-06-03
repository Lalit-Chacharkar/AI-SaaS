// ─────────────────────────────────────────────
// api/axios.js
// Job: Create a pre-configured axios instance
// Instead of typing the full URL every time:
//   axios.post('http://localhost:5000/api/auth/login')
// We configure the base URL once:
//   api.post('/auth/login')  ← much cleaner
// ─────────────────────────────────────────────

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ai-saas-production-9f5a.up.railway.app/api',
  // baseURL = the prefix added to every request
  // api.get('/health') → http://localhost:5000/api/health

  headers: {
    'Content-Type': 'application/json'
    // Tell server: "I'm sending JSON data"
    // Same as selecting JSON in Thunder Client Body tab
  }
});

// ── Request Interceptor ──
// Runs BEFORE every request is sent
// Automatically attaches the JWT token to every request
// So you don't have to manually add Authorization header each time
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // localStorage = browser's built-in key-value storage
  // Data persists even after browser closes (unlike variables)
  // We store the token here after login

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Automatically adds: Authorization: Bearer eyJhbGci...
    // This is what we manually added in Thunder Client Headers tab
  }
  return config;
});

export default api;

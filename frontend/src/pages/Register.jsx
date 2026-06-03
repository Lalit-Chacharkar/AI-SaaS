// ─────────────────────────────────────────────
// pages/Register.jsx
// Job: Registration form — calls our POST /api/auth/register
// ─────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// useNavigate = hook to programmatically go to another page
// Link = like <a> tag but doesn't reload the page

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  // ── Form state ──
  // One state object for all form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  // error = message to show if something goes wrong

  const [loading, setLoading] = useState(false);
  // loading = true while waiting for API response
  // Used to disable button and show "Loading..." text

  const { login } = useAuth();
  // Get the login function from context — saves token after register

  const navigate = useNavigate();
  // navigate('/dashboard') = go to dashboard page

  // ── Handle input changes ──
  // One handler for ALL inputs — avoids writing 3 separate handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,          // spread: keep all existing fields
      [e.target.name]: e.target.value
      // [e.target.name] = computed key — uses the input's name attribute
      // e.g. typing in email input → { ...formData, email: "typed value" }
    });
  };

  // ── Handle form submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    // e.preventDefault() = stop the browser's default form behavior
    // Default behavior = reload the page on submit (we don't want that)

    setError('');       // clear any previous error
    setLoading(true);   // show loading state

    try {
      // Call our backend API — same as Thunder Client POST /api/auth/register
      const response = await api.post('/auth/register', formData);

      // response.data = the JSON our backend sent back
      // { message, token, user }

      // Don't auto-login — redirect to login page instead
      // This is the standard SaaS flow: "Account created! Now sign in."
      navigate('/login', { state: { registered: true } });
      // state: { registered: true } = pass extra info to login page
      // Login page reads this and shows "✅ Account created! Please login."

    } catch (err) {
      // err.response.data.message = the error message from our backend
      // e.g. "Email already registered"
      setError(err.response?.data?.message || 'Registration failed');
      // ?. = optional chaining — safe access even if err.response is undefined
    } finally {
      setLoading(false); // always stop loading, whether success or error
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Start generating AI content today</p>

        {/* Show error if exists */}
        {error && <p style={styles.error}>{error}</p>}
        {/* {error && ...} = conditional rendering — only shows if error is not empty */}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            name="name"           // matches formData key
            placeholder="Full Name"
            value={formData.name} // controlled input — React controls the value
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            style={loading ? styles.buttonDisabled : styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

// ── Inline styles (simple, no CSS file needed for now) ──
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' },
  card: { background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 0.5rem', color: '#1a1a2e' },
  subtitle: { margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', background: '#6c63ff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' },
  buttonDisabled: { width: '100%', padding: '0.75rem', background: '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'not-allowed', marginTop: '1rem' },
  error: { color: 'red', background: '#fff0f0', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' },
  link: { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }
};

export default Register;

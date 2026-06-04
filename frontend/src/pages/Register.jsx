import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const FEATURES = [
  { icon: '📝', title: 'Blog Posts', desc: 'SEO-optimised articles in seconds' },
  { icon: '📱', title: 'Social Media', desc: 'Engaging posts for any platform' },
  { icon: '📧', title: 'Email Copy', desc: 'Campaigns that convert' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Generate 1000 words in under 5s' },
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoMark}>✦</div>
          <h1 style={styles.heroTitle}>
            Your AI writing<br />
            <span style={styles.heroGradient}>superpower</span><br />
            starts here
          </h1>
          <p style={styles.heroSub}>Free to start. No credit card required.</p>

          <div style={styles.featureList}>
            {FEATURES.map(f => (
              <div key={f.title} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <div>
                  <div style={styles.featureTitle}>{f.title}</div>
                  <div style={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...styles.orb, top: '5%', right: '5%', width: 280, height: 280, background: 'rgba(108,99,255,0.12)' }} />
        <div style={{ ...styles.orb, bottom: '10%', left: '0%', width: 220, height: 220, background: 'rgba(159,122,234,0.1)' }} />
      </div>

      {/* Right form panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.brandBadge}>✦ AI SaaS</span>
            <h2 style={styles.cardTitle}>Create your account</h2>
            <p style={styles.cardSub}>Start with 3 free generations</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {[
              { name: 'name', type: 'text', label: 'Full name', placeholder: 'John Doe' },
              { name: 'email', type: 'email', label: 'Email address', placeholder: 'you@example.com' },
              { name: 'password', type: 'password', label: 'Password', placeholder: '••••••••  (min 6 chars)' },
            ].map(field => (
              <div key={field.name} style={styles.fieldGroup}>
                <label style={styles.label}>{field.label}</label>
                <input
                  style={{ ...styles.input, ...(focusedField === field.name ? styles.inputFocused : {}) }}
                  type={field.type} name={field.name} placeholder={field.placeholder}
                  value={formData[field.name]} onChange={handleChange}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>
            ))}

            <button style={loading ? styles.btnDisabled : styles.btn} type="submit" disabled={loading}>
              {loading ? (
                <span style={styles.btnInner}>
                  <span style={styles.spinner} /> Creating account...
                </span>
              ) : 'Create free account →'}
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footerLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0f' },
  leftPanel: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 50%, #0f1729 100%)',
    padding: '3rem', position: 'relative', overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  leftContent: { position: 'relative', zIndex: 1, maxWidth: 420 },
  logoMark: { fontSize: '2rem', color: '#6c63ff', marginBottom: '2rem', display: 'block', animation: 'float 3s ease-in-out infinite' },
  heroTitle: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: '1rem' },
  heroGradient: {
    background: 'linear-gradient(90deg, #6c63ff, #63b3ed, #9f7aea)',
    backgroundSize: '200%',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    animation: 'gradientShift 4s ease infinite',
  },
  heroSub: { color: '#94a3b8', fontSize: '1rem', marginBottom: '2.5rem' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: '1rem' },
  featureIcon: {
    fontSize: '1.3rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(108,99,255,0.15)', borderRadius: '10px', flexShrink: 0,
  },
  featureTitle: { fontSize: '0.92rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.15rem' },
  featureDesc: { fontSize: '0.8rem', color: '#64748b' },
  orb: { position: 'absolute', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' },

  rightPanel: {
    width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: '#0a0a0f',
  },
  card: {
    width: '100%', maxWidth: 400,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '2.5rem',
    animation: 'fadeInUp 0.6s ease both',
  },
  cardHeader: { marginBottom: '1.8rem' },
  brandBadge: {
    display: 'inline-block', fontSize: '0.8rem', fontWeight: 600,
    color: '#6c63ff', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: '20px', padding: '0.25rem 0.75rem', marginBottom: '1rem',
  },
  cardTitle: { fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.4rem' },
  cardSub: { color: '#64748b', fontSize: '0.9rem' },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(252,129,74,0.1)', border: '1px solid rgba(252,129,74,0.3)',
    color: '#fc8f4a', borderRadius: '8px', padding: '0.75rem 1rem',
    fontSize: '0.85rem', marginBottom: '1.2rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.82rem', fontWeight: 500, color: '#94a3b8' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#f1f5f9', fontSize: '0.95rem',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%',
  },
  inputFocused: { borderColor: '#6c63ff', boxShadow: '0 0 0 3px rgba(108,99,255,0.2)' },
  btn: {
    width: '100%', padding: '0.85rem', marginTop: '0.5rem',
    background: 'linear-gradient(135deg, #6c63ff, #9f7aea)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
  },
  btnDisabled: {
    width: '100%', padding: '0.85rem', marginTop: '0.5rem',
    background: 'rgba(255,255,255,0.08)', color: '#64748b',
    border: 'none', borderRadius: '8px', fontSize: '0.95rem', cursor: 'not-allowed',
  },
  btnInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' },
  spinner: {
    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
  footerText: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' },
  footerLink: { color: '#6c63ff', textDecoration: 'none', fontWeight: 500 },
};

export default Register;

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

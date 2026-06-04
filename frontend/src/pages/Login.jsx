import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel — decorative */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoMark}>✦</div>
          <h1 style={styles.heroTitle}>
            Create content<br />
            <span style={styles.heroGradient}>10× faster</span><br />
            with AI
          </h1>
          <p style={styles.heroSub}>
            Join thousands of creators using AI to generate blogs, social posts, and emails in seconds.
          </p>
          <div style={styles.stats}>
            {[['10K+', 'Users'], ['1M+', 'Words generated'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label} style={styles.statItem}>
                <span style={styles.statVal}>{val}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Background glow orbs */}
        <div style={{ ...styles.orb, top: '10%', left: '20%', width: 300, height: 300, background: 'rgba(108,99,255,0.15)' }} />
        <div style={{ ...styles.orb, bottom: '15%', right: '10%', width: 200, height: 200, background: 'rgba(99,179,237,0.1)' }} />
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.brandBadge}>✦ AI SaaS</span>
            <h2 style={styles.cardTitle}>Welcome back</h2>
            <p style={styles.cardSub}>Sign in to your account</p>
          </div>

          {justRegistered && (
            <div style={styles.successBanner}>
              <span>🎉</span> Account created successfully! Please sign in.
            </div>
          )}
          {error && (
            <div style={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <input
                style={{ ...styles.input, ...(focusedField === 'email' ? styles.inputFocused : {}) }}
                type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                required
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={{ ...styles.input, ...(focusedField === 'password' ? styles.inputFocused : {}) }}
                type="password" name="password" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
              />
            </div>
            <button style={loading ? styles.btnDisabled : styles.btn} type="submit" disabled={loading}>
              {loading ? (
                <span style={styles.btnInner}>
                  <span style={styles.spinner} /> Signing in...
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          <p style={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.footerLink}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0f' },

  // Left decorative panel
  leftPanel: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 50%, #0f1729 100%)',
    padding: '3rem', position: 'relative', overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  leftContent: { position: 'relative', zIndex: 1, maxWidth: 420 },
  logoMark: { fontSize: '2rem', color: '#6c63ff', marginBottom: '2rem', display: 'block', animation: 'float 3s ease-in-out infinite' },
  heroTitle: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: '1.2rem' },
  heroGradient: {
    background: 'linear-gradient(90deg, #6c63ff, #63b3ed, #9f7aea)',
    backgroundSize: '200%',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    animation: 'gradientShift 4s ease infinite',
  },
  heroSub: { color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' },
  stats: { display: 'flex', gap: '2rem' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  statVal: { fontSize: '1.4rem', fontWeight: 700, color: '#fff' },
  statLabel: { fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  orb: { position: 'absolute', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' },

  // Right form panel
  rightPanel: {
    width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: '#0a0a0f',
  },
  card: {
    width: '100%', maxWidth: 400,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '2.5rem',
    backdropFilter: 'blur(10px)',
    animation: 'fadeInUp 0.6s ease both',
  },
  cardHeader: { marginBottom: '1.8rem' },
  brandBadge: {
    display: 'inline-block', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em',
    color: '#6c63ff', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: '20px', padding: '0.25rem 0.75rem', marginBottom: '1rem',
  },
  cardTitle: { fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.4rem' },
  cardSub: { color: '#64748b', fontSize: '0.9rem' },

  successBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)',
    color: '#68d391', borderRadius: '8px', padding: '0.75rem 1rem',
    fontSize: '0.85rem', marginBottom: '1.2rem', animation: 'fadeIn 0.3s ease',
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(252,129,74,0.1)', border: '1px solid rgba(252,129,74,0.3)',
    color: '#fc8f4a', borderRadius: '8px', padding: '0.75rem 1rem',
    fontSize: '0.85rem', marginBottom: '1.2rem', animation: 'fadeIn 0.3s ease',
  },

  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.82rem', fontWeight: 500, color: '#94a3b8', letterSpacing: '0.03em' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#f1f5f9', fontSize: '0.95rem',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
  },
  inputFocused: {
    borderColor: '#6c63ff', boxShadow: '0 0 0 3px rgba(108,99,255,0.2)',
  },
  btn: {
    width: '100%', padding: '0.85rem', marginTop: '0.5rem',
    background: 'linear-gradient(135deg, #6c63ff, #9f7aea)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.02em',
  },
  btnDisabled: {
    width: '100%', padding: '0.85rem', marginTop: '0.5rem',
    background: 'rgba(255,255,255,0.08)', color: '#64748b',
    border: 'none', borderRadius: '8px', fontSize: '0.95rem',
    fontWeight: 600, cursor: 'not-allowed',
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

export default Login;
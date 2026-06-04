// ─────────────────────────────────────────────
// pages/Dashboard.jsx
// Job: Protected page — only logged-in users see this
// ─────────────────────────────────────────────

import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

// Content types the user can choose from
const CONTENT_TYPES = [
  { value: 'blog', label: '📝 Blog Post' },
  { value: 'social', label: '📱 Social Media' },
  { value: 'email', label: '📧 Email' },
  { value: 'general', label: '✨ General' },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [upgrading, setUpgrading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [result, setResult] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const FREE_LIMIT = 3;

  // Check if user just came back from successful Stripe payment
  useEffect(() => {
    if (location.search.includes('upgraded=true')) {
      alert('🎉 Welcome to Pro! Your account has been upgraded.');
    }
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Ask backend to create a Stripe checkout session
      const response = await api.post('/stripe/create-checkout-session');
      // Redirect user to Stripe's hosted payment page
      window.location.href = response.data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Upgrade failed');
      setUpgrading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult('');
    setGenError('');
    try {
      const response = await api.post('/content/generate', { prompt, contentType });
      setResult(response.data.content);
      // Update free usage counter if backend returns it
      if (response.data.generationsUsed !== undefined) {
        setGenerationsUsed(response.data.generationsUsed);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Generation failed. Try again.';
      setGenError(msg);
      // If limit reached, update counter to show 3/3
      if (err.response?.data?.limitReached) {
        setGenerationsUsed(FREE_LIMIT);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert('✅ Copied to clipboard!');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>✨ AI SaaS</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.content}>
        <h2 style={styles.welcome}>Welcome, {user?.name}! 👋</h2>
        <p style={styles.role}>Role: <span style={styles.badge}>{user?.role}</span></p>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>📝 Generate Content</h3>
            <p>Use AI to create blog posts, social media content, and more.</p>

            {/* Free tier usage bar */}
            {user?.role === 'user' && (
              <div style={styles.usageBar}>
                <span style={styles.usageText}>
                  Free generations: {generationsUsed}/{FREE_LIMIT}
                </span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${(generationsUsed / FREE_LIMIT) * 100}%`, background: generationsUsed >= FREE_LIMIT ? '#ff6b6b' : '#6c63ff' }} />
                </div>
                {generationsUsed >= FREE_LIMIT && (
                  <p style={styles.limitMsg}>
                    🔒 Free limit reached!{' '}
                    <span style={styles.upgradeLink} onClick={handleUpgrade}>Upgrade to Pro</span>
                    {' '}for unlimited.
                  </p>
                )}
              </div>
            )}

            {/* Generate UI — shown to all users, disabled if free limit reached */}
            <div>
              {/* Content type selector */}
              <div style={styles.typeRow}>
                {CONTENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    style={contentType === t.value ? styles.typeActive : styles.typeBtn}
                    onClick={() => setContentType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Prompt input */}
              <textarea
                style={styles.textarea}
                rows={4}
                placeholder="E.g. Write a blog post about the future of AI in healthcare..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                maxLength={500}
              />
              <p style={styles.charCount}>{prompt.length}/500</p>

              <button
                style={generating || !prompt.trim() || (user?.role === 'user' && generationsUsed >= FREE_LIMIT) ? styles.buttonDisabled : styles.actionBtn}
                onClick={handleGenerate}
                disabled={generating || !prompt.trim() || (user?.role === 'user' && generationsUsed >= FREE_LIMIT)}
              >
                {generating ? '⏳ Generating...' : '✨ Generate'}
              </button>

              {/* Error */}
              {genError && <p style={styles.error}>{genError}</p>}

              {/* Result */}
              {result && (
                <div style={styles.resultBox}>
                  <div style={styles.resultHeader}>
                    <strong>Generated Content:</strong>
                    <button style={styles.copyBtn} onClick={handleCopy}>📋 Copy</button>
                  </div>
                  <p style={styles.resultText}>{result}</p>
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h3>📊 Your Stats</h3>
            <p>Articles generated: 0</p>
            <p>Words written: 0</p>
          </div>

          <div style={styles.card}>
            <h3>⚙️ Account</h3>
            <p>Email: {user?.email}</p>
            <p>Plan: {user?.role === 'user' ? 'Free' : 'Pro'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  logo: { margin: 0, color: '#6c63ff' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #6c63ff', color: '#6c63ff', borderRadius: '4px', cursor: 'pointer' },
  content: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  welcome: { color: '#1a1a2e' },
  role: { color: '#666' },
  badge: { background: '#6c63ff', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' },
  card: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  actionBtn: { padding: '0.5rem 1rem', background: '#6c63ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' },
  lockedBtn: { padding: '0.5rem 1rem', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' },
  buttonDisabled: { padding: '0.5rem 1rem', background: '#aaa', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed', marginTop: '0.5rem' },
  typeRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' },
  typeBtn: { padding: '0.3rem 0.7rem', background: '#f0f2f5', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' },
  typeActive: { padding: '0.3rem 0.7rem', background: '#6c63ff', color: 'white', border: '1px solid #6c63ff', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' },
  textarea: { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', marginTop: '0.5rem' },
  charCount: { fontSize: '0.75rem', color: '#999', margin: '0.2rem 0 0.5rem', textAlign: 'right' },
  error: { color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem' },
  resultBox: { marginTop: '1rem', background: '#f8f9ff', border: '1px solid #e0e0ff', borderRadius: '6px', padding: '1rem' },
  resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  resultText: { whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#333', margin: 0 },
  copyBtn: { padding: '0.3rem 0.7rem', background: '#6c63ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  usageBar: { marginBottom: '1rem', padding: '0.7rem', background: '#f8f9ff', borderRadius: '6px', border: '1px solid #e0e0ff' },
  usageText: { fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '0.4rem' },
  barTrack: { height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  limitMsg: { fontSize: '0.82rem', color: '#ff6b6b', marginTop: '0.5rem', marginBottom: 0 },
  upgradeLink: { color: '#6c63ff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' },
};

export default Dashboard;

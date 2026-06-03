// ─────────────────────────────────────────────
// pages/Dashboard.jsx
// Job: Protected page — only logged-in users see this
// ─────────────────────────────────────────────

import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [upgrading, setUpgrading] = useState(false);

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
            {user?.role === 'user' ? (
              <button
                style={upgrading ? styles.buttonDisabled : styles.lockedBtn}
                onClick={handleUpgrade}
                disabled={upgrading}
              >
                {upgrading ? 'Redirecting to Stripe...' : '🔒 Upgrade to Pro - $9.99/mo'}
              </button>
            ) : (
              <button style={styles.actionBtn}>✨ Generate</button>
            )}
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
};

export default Dashboard;

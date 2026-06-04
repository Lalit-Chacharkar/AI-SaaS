import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const CONTENT_TYPES = [
  { value: 'blog', label: '📝 Blog Post', desc: 'Long-form articles' },
  { value: 'social', label: '📱 Social', desc: 'Instagram, Twitter' },
  { value: 'email', label: '📧 Email', desc: 'Campaigns & newsletters' },
  { value: 'general', label: '✨ General', desc: 'Any content' },
];

const FREE_LIMIT = 3;

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
  const [copied, setCopied] = useState(false);
  const [upgradedBanner, setUpgradedBanner] = useState(false);

  useEffect(() => {
    if (location.search.includes('upgraded=true')) setUpgradedBanner(true);
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await api.post('/stripe/create-checkout-session');
      window.location.href = response.data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Upgrade failed');
      setUpgrading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult('');
    setGenError('');
    try {
      const response = await api.post('/content/generate', { prompt, contentType });
      setResult(response.data.content);
      if (response.data.generationsUsed !== undefined) setGenerationsUsed(response.data.generationsUsed);
    } catch (err) {
      const msg = err.response?.data?.message || 'Generation failed. Try again.';
      setGenError(msg);
      if (err.response?.data?.limitReached) setGenerationsUsed(FREE_LIMIT);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPro = user?.role === 'pro' || user?.role === 'admin';
  const limitReached = !isPro && generationsUsed >= FREE_LIMIT;

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>✦ <span style={styles.logoText}>AI SaaS</span></div>
        <nav style={styles.nav}>
          {[
            { icon: '⚡', label: 'Generate' },
            { icon: '📁', label: 'History' },
            { icon: '⚙️', label: 'Settings' },
          ].map((item, i) => (
            <div key={item.label} style={{ ...styles.navItem, ...(i === 0 ? styles.navItemActive : {}) }}>
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
        <div style={styles.sidebarBottom}>
          {/* Plan badge */}
          <div style={styles.planCard}>
            <div style={styles.planBadge}>
              {isPro ? '⭐ Pro Plan' : '🆓 Free Plan'}
            </div>
            {!isPro && (
              <>
                <div style={styles.planUsageRow}>
                  <span style={styles.planUsageText}>{generationsUsed}/{FREE_LIMIT} used</span>
                  <span style={styles.planUsagePct}>{Math.round((generationsUsed/FREE_LIMIT)*100)}%</span>
                </div>
                <div style={styles.planBarTrack}>
                  <div style={{
                    ...styles.planBarFill,
                    width: `${Math.min((generationsUsed/FREE_LIMIT)*100, 100)}%`,
                    background: limitReached ? '#f56565' : 'linear-gradient(90deg, #6c63ff, #9f7aea)',
                  }} />
                </div>
                <button
                  style={upgrading ? styles.upgradeDisabled : styles.upgradeBtn}
                  onClick={handleUpgrade} disabled={upgrading}
                >
                  {upgrading ? 'Redirecting...' : '⚡ Upgrade to Pro'}
                </button>
              </>
            )}
          </div>
          {/* User info */}
          <div style={styles.userRow}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">↩</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Content Generator</h1>
            <p style={styles.pageSubtitle}>Create AI-powered content in seconds</p>
          </div>
          <div style={styles.rolePill}>
            {isPro ? '⭐ Pro' : '🆓 Free'}
          </div>
        </div>

        {/* Upgraded banner */}
        {upgradedBanner && (
          <div style={styles.successBanner}>
            🎉 Welcome to Pro! You now have unlimited generations.
            <button style={styles.bannerClose} onClick={() => setUpgradedBanner(false)}>✕</button>
          </div>
        )}

        <div style={styles.layout}>
          {/* Left: Input panel */}
          <div style={styles.inputPanel}>
            {/* Content type selector */}
            <div style={styles.section}>
              <label style={styles.sectionLabel}>Content Type</label>
              <div style={styles.typeGrid}>
                {CONTENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    style={{ ...styles.typeCard, ...(contentType === t.value ? styles.typeCardActive : {}) }}
                    onClick={() => setContentType(t.value)}
                  >
                    <div style={styles.typeIcon}>{t.label.split(' ')[0]}</div>
                    <div style={styles.typeName}>{t.label.split(' ').slice(1).join(' ')}</div>
                    <div style={styles.typeDesc}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div style={styles.section}>
              <label style={styles.sectionLabel}>Your Prompt</label>
              <textarea
                style={styles.textarea}
                rows={5}
                placeholder="E.g. Write an engaging blog post about the future of AI in healthcare, targeting medical professionals..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                maxLength={500}
                disabled={limitReached}
              />
              <div style={styles.promptMeta}>
                <span style={{ color: prompt.length > 450 ? '#f56565' : '#4a5568' }}>{prompt.length}/500</span>
                {limitReached && (
                  <span style={styles.limitWarning}>🔒 Upgrade to continue generating</span>
                )}
              </div>
            </div>

            <button
              style={generating || !prompt.trim() || limitReached ? styles.genBtnDisabled : styles.genBtn}
              onClick={handleGenerate}
              disabled={generating || !prompt.trim() || limitReached}
            >
              {generating ? (
                <span style={styles.btnInner}><span style={styles.spinner} /> Generating...</span>
              ) : (
                <span style={styles.btnInner}>✨ Generate Content</span>
              )}
            </button>

            {genError && (
              <div style={styles.errorBox}>
                <span>⚠️</span> {genError}
              </div>
            )}
          </div>

          {/* Right: Output panel */}
          <div style={styles.outputPanel}>
            <div style={styles.outputHeader}>
              <span style={styles.sectionLabel}>Generated Output</span>
              {result && (
                <button style={copied ? styles.copiedBtn : styles.copyBtn} onClick={handleCopy}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              )}
            </div>

            {result ? (
              <div style={styles.resultBox}>
                <p style={styles.resultText}>{result}</p>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>{generating ? '⏳' : '✨'}</div>
                <p style={styles.emptyTitle}>{generating ? 'AI is writing...' : 'Your content will appear here'}</p>
                <p style={styles.emptyDesc}>
                  {generating ? 'This usually takes 5–10 seconds' : 'Fill in the prompt and click Generate'}
                </p>
                {generating && <div style={styles.loadingDots}><span /><span /><span /></div>}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0' },

  // Sidebar
  sidebar: {
    width: 240, background: 'rgba(255,255,255,0.03)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem',
    position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
  },
  sidebarLogo: { fontSize: '1.2rem', fontWeight: 700, color: '#6c63ff', marginBottom: '2rem', padding: '0 0.5rem' },
  logoText: { color: '#f1f5f9' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b', transition: 'all 0.2s' },
  navItemActive: { background: 'rgba(108,99,255,0.15)', color: '#a78bfa' },
  navIcon: { fontSize: '1rem' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '1rem' },

  // Plan card in sidebar
  planCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.9rem' },
  planBadge: { fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.6rem' },
  planUsageRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' },
  planUsageText: {},
  planUsagePct: {},
  planBarTrack: { height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.75rem' },
  planBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.4s ease' },
  upgradeBtn: {
    width: '100%', padding: '0.55rem', background: 'linear-gradient(135deg, #6c63ff, #9f7aea)',
    color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
  },
  upgradeDisabled: {
    width: '100%', padding: '0.55rem', background: 'rgba(255,255,255,0.08)',
    color: '#64748b', border: 'none', borderRadius: '7px', fontSize: '0.8rem', cursor: 'not-allowed',
  },

  // User row
  userRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #6c63ff, #9f7aea)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 700, color: '#fff',
  },
  userName: { fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' },
  userEmail: { fontSize: '0.72rem', color: '#64748b' },
  logoutBtn: { marginLeft: 'auto', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' },

  // Main content
  main: { flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' },
  topBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' },
  pageSubtitle: { color: '#64748b', fontSize: '0.9rem' },
  rolePill: {
    padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600,
    background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa',
  },

  successBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)',
    color: '#68d391', borderRadius: '10px', padding: '0.9rem 1.2rem',
    fontSize: '0.9rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.4s ease',
  },
  bannerClose: { background: 'none', border: 'none', color: '#68d391', cursor: 'pointer', fontSize: '1rem' },

  // Two column layout
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' },

  // Input panel
  inputPanel: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  sectionLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' },

  // Type cards
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' },
  typeCard: {
    padding: '0.75rem', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
  },
  typeCardActive: {
    background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.4)',
  },
  typeIcon: { fontSize: '1.2rem', marginBottom: '0.3rem' },
  typeName: { fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.15rem' },
  typeDesc: { fontSize: '0.72rem', color: '#64748b' },

  // Textarea
  textarea: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '0.9rem 1rem', color: '#f1f5f9', fontSize: '0.92rem',
    outline: 'none', resize: 'vertical', width: '100%', lineHeight: 1.6,
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
  promptMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' },
  limitWarning: { color: '#f56565', fontWeight: 500 },

  // Generate button
  genBtn: {
    width: '100%', padding: '0.9rem',
    background: 'linear-gradient(135deg, #6c63ff 0%, #9f7aea 100%)',
    color: '#fff', border: 'none', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    animation: 'pulseGlow 3s ease-in-out infinite',
  },
  genBtnDisabled: {
    width: '100%', padding: '0.9rem',
    background: 'rgba(255,255,255,0.06)', color: '#475569',
    border: 'none', borderRadius: '10px', fontSize: '0.95rem', cursor: 'not-allowed',
  },
  btnInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' },
  spinner: {
    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(252,129,74,0.1)', border: '1px solid rgba(252,129,74,0.3)',
    color: '#fc8f4a', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem',
  },

  // Output panel
  outputPanel: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '1.5rem', minHeight: 400,
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  outputHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  copyBtn: {
    padding: '0.4rem 0.9rem', background: 'rgba(108,99,255,0.15)',
    border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa',
    borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
  },
  copiedBtn: {
    padding: '0.4rem 0.9rem', background: 'rgba(72,187,120,0.15)',
    border: '1px solid rgba(72,187,120,0.3)', color: '#68d391',
    borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
  },
  resultBox: { flex: 1, overflowY: 'auto' },
  resultText: { whiteSpace: 'pre-wrap', fontSize: '0.92rem', color: '#cbd5e0', lineHeight: 1.8, margin: 0 },

  // Empty state
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem 1rem' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  emptyTitle: { fontSize: '1rem', fontWeight: 600, color: '#94a3b8' },
  emptyDesc: { fontSize: '0.85rem', color: '#475569', textAlign: 'center' },
  loadingDots: { display: 'flex', gap: '0.4rem', marginTop: '0.5rem' },
};

export default Dashboard;
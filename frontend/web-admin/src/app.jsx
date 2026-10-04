import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

function AppRoutes() {
  const { isAuthenticated, loading, session } = useAuth();

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark">SO</div>
            <div><strong>societyOS</strong><span>operations suite</span></div>
          </div>
          <p className="eyebrow">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Prevent residents from accessing the web admin portal
  if (session?.user?.role === 'resident') {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark">SO</div>
            <div><strong>societyOS</strong><span>operations suite</span></div>
          </div>
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Access Denied</h2>
            <p style={{ color: 'var(--muted)' }}>Your account does not have access to this application. Please use the SocietyOS mobile app for residents.</p>
          </div>
          <button className="btn secondary" style={{ width: '100%' }} onClick={() => {
            localStorage.removeItem('societyOS.token');
            localStorage.removeItem('societyOS.session');
            window.location.href = '/login';
          }}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/:module" element={<DashboardPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}

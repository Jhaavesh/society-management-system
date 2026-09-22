import { useAuth } from './hooks/useAuth.js';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

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
    return <LoginPage />;
  }

  return <DashboardPage />;
}

export default function App() {
  return <AppRoutes />;
}

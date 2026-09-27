import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSocieties } from '../hooks/useSocieties.js';
import { useDashboard } from '../hooks/useDashboard.js';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { OverviewPage } from './OverviewPage.jsx';
import { ModulePage } from './ModulePage.jsx';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const { selectedSocietyId, societies } = useSocieties();
  const { data: dashboardData, loading, error, refetch } = useDashboard(selectedSocietyId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) return null;

  const currentSociety = societies.find((s) => String(s._id || s.id) === selectedSocietyId);
  const breadcrumb = [
    { label: currentSociety?.name || 'Select Society', href: '#' },
    { label: activeTab === 'overview' ? 'Overview' : activeTab, href: '#' },
  ];

  return (
    <div className='app-shell'>
      <Sidebar />
      <div className='main'>
        <TopBar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          breadcrumb={breadcrumb}
        />
        <main className='content'>
          {activeTab === 'overview' ? (
            <OverviewPage
              society={currentSociety}
              dashboardData={dashboardData}
              loading={loading}
              error={error}
              refetch={refetch}
            />
          ) : (
            <ModulePage
              module={activeTab}
              societyId={selectedSocietyId}
              society={currentSociety}
            />
          )}
        </main>
      </div>
    </div>
  );
}

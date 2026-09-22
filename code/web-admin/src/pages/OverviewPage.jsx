import { useSocieties } from '../../hooks/useSocieties.js';
import { useDashboard } from '../../hooks/useDashboard.js';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters.js';
import { formatDate } from '../../utils/date.js';
import { Card } from '../components/ui/Card.jsx';
import { KpiCard } from '../components/ui/KpiCard.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Icon } from '../components/ui/Icon.jsx';

export function OverviewPage({ society, dashboardData, loading, error, refetch }) {
  const { societies } = useSocieties();

  if (!society) {
    return (
      <div className='dashboard-empty'>
        <Icon name='building' size={64} style={{ color: 'var(--line)', marginBottom: '16px' }} />
        <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>Select a society</h2>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Choose a society from the sidebar to view dashboard</p>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {
    homes: 0,
    collected: 0,
    openRequests: 0,
    collectionRate: 0,
  };

  const societyPortfolio = societies.map((s) => ({
    name: s.name,
    city: s.city,
    state: s.state,
    homes: s.homes,
    rate: s.rate,
    active: s.active,
  }));

  return (
    <div>
      <div className='page-heading'>
        <div>
          <h1>{society.name}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
            {society.city}, {society.state} \u2022 {society.homes} homes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className='btn secondary' onClick={refetch} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className='kpis'>
        <KpiCard icon='home' value={formatNumber(kpis.homes)} label='Total Homes' tone='blue' />
        <KpiCard icon='rupee' value={formatCurrency(kpis.collected)} label='Collected' tone='mint' />
        <KpiCard icon='alert-triangle' value={formatNumber(kpis.openRequests)} label='Open Requests' tone='amber' />
        <KpiCard icon='percent' value={formatPercentage(kpis.collectionRate)} label='Collection Rate' tone='rose' />
      </div>

      <div className='dashboard-grid'>
        <div className='card hero'>
          <div className='hero-content'>
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: '22px' }}>Welcome back</h2>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                Here's what's happening with {society.name} today.
              </p>
            </div>
            <div className='hero-metric'>
              <strong style={{ fontSize: '48px', fontFamily: 'Space Grotesk' }}>
                {formatCurrency(kpis.collected)}
              </strong>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Collected this month</span>
            </div>
          </div>
        </div>

        <div className='card health'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Society Health</h3>
            <Badge tone={society.active ? 'mint' : 'rose'}>{society.active ? 'Active' : 'Inactive'}</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Collection Rate</div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{formatPercentage(kpis.collectionRate)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Open Requests</div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{formatNumber(kpis.openRequests)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Total Homes</div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{formatNumber(kpis.homes)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Collected</div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{formatCurrency(kpis.collected)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className='lower-grid'>
        <Card title='Society Portfolio' subtitle='All societies in your workspace'>
          <Table
            headers={[
              { key: 'name', label: 'Society' },
              { key: 'city', label: 'City' },
              { key: 'state', label: 'State' },
              { key: 'homes', label: 'Homes', align: 'right' },
              { key: 'rate', label: 'Rate %', align: 'right' },
              { key: 'active', label: 'Status', align: 'center' },
            ]}
            rows={societyPortfolio.map((s) => ({
              ...s,
              homes: formatNumber(s.homes),
              rate: formatPercentage(s.rate),
              active: <Badge tone={s.active ? 'mint' : 'rose'}>{s.active ? 'Active' : 'Inactive'}</Badge>,
            }))}
          />
        </Card>
      </div>
    </div>
  );
}

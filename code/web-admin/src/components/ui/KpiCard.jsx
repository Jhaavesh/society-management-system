import { Icon } from './Icon.jsx';

/** @typedef {{icon: string, value: string|number, label: string, tone?: 'blue'|'mint'|'amber'|'rose', trend?: {value: number, label: string}}} KpiCardProps */

const toneStyles = {
  blue: 'var(--blue)',
  mint: 'var(--mint)',
  amber: 'var(--amber)',
  rose: 'var(--rose)',
};

export function KpiCard({ icon, value, label, tone = 'blue', trend }) {
  const color = toneStyles[tone];
  return (
    <div
      className='kpi-card'
      style={{
        '--kpi-color': color,
        borderLeftColor: color,
      }}
    >
      <div className='kpi-header'>
        <div className='kpi-icon' style={{ backgroundColor: color + '20' }}>
          <Icon name={icon} size={20} style={{ color }} />
        </div>
        {trend && (
          <div className='kpi-trend' style={{ color: trend.value >= 0 ? 'var(--mint)' : 'var(--rose)' }}>
            <Icon name={trend.value >= 0 ? 'chevron-up' : 'chevron-down'} size={12} />
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
      </div>
      <div className='kpi-value' style={{ color }}>{value}</div>
      <div className='kpi-label'>{label}</div>
    </div>
  );
}
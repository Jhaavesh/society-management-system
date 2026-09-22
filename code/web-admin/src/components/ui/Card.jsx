export function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={\card \\}>
      {(title || subtitle) && (
        <div className='card-header' style={{ marginBottom: '16px' }}>
          {title && <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{title}</h3>}
          {subtitle && <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>{subtitle}</p>}
        </div>
      )}
      <div className='card-content'>{children}</div>
    </div>
  );
}

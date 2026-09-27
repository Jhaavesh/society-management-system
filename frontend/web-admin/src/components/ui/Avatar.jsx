export function Avatar({ name, size = 36, className = '' }) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const colors = [
    'var(--blue)', 'var(--mint)', 'var(--amber)', 'var(--rose)',
    '#7d88ff', '#43c6a5', '#f4b45b', '#ef7184',
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={'avatar ' + className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bgColor,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: Math.max(10, size * 0.35),
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

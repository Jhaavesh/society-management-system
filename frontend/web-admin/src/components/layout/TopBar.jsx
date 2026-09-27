import { useSocieties } from '../../hooks/useSocieties.js';
import { Icon } from '../ui/Icon.jsx';
import { Avatar } from '../ui/Avatar.jsx';

export function TopBar({ onMenuClick, breadcrumb, children }) {
  const { selectedSociety, societies } = useSocieties();
  const currentSociety = selectedSociety || societies.find((s) => s.active);

  return (
    <header className='topbar'>
      <button className='menu' onClick={onMenuClick} aria-label='Toggle menu'>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className='crumb' aria-label='Breadcrumb'>
        {breadcrumb && breadcrumb.map((item, idx) => (
          <span key={idx} className={item.href ? 'crumb-link' : 'crumb-current'}>
            {item.href ? <a href={item.href}>{item.label}</a> : item.label}
          </span>
        ))}
      </nav>

      <div className='top-actions'>
        <div className='live-pill'>
          <span className='live-dot'></span>
          Live
        </div>
        <Avatar name={currentSociety?.name || 'Society'} size={36} />
      </div>
    </header>
  );
}

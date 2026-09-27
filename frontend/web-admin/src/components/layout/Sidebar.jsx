import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocieties } from '../../hooks/useSocieties.js';
import { Icon } from '../ui/Icon.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { SidebarNav } from './SidebarNav.jsx';

export function Sidebar() {
  const { session, logout } = useAuth();
  const { societies, selectedSocietyId, selectSociety, loading } = useSocieties();
  const [isOpen, setIsOpen] = useState(false);

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  return (
    <aside className={'sidebar ' + (isOpen ? 'open' : '')}>
      <div className='brand'>
        <div className='brand-mark'>SO</div>
        <div>
          <strong>societyOS</strong>
          <span>operations suite</span>
        </div>
      </div>

      <div className='workspace-label'>
        <label>Workspace</label>
        <select
          value={selectedSocietyId}
          onChange={(e) => selectSociety(e.target.value)}
          disabled={loading}
        >
          <option value='all'>All societies</option>
          {societies.map((s) => (
            <option key={s._id || s.id} value={s._id || s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <SidebarNav />

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ffffff17' }}>
        <div className='nav-item' style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar name={session?.user?.name || 'User'} size={32} />
            <div style={{ color: '#fff', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>
                {session?.user?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: '#7887a7' }}>
                {session?.user?.role || 'Admin'}
              </div>
            </div>
          </div>
        </div>
        <button
          className='nav-item logout-button'
          onClick={logout}
          style={{ marginTop: '8px', color: '#8490a7' }}
        >
          <Icon name='logout' />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

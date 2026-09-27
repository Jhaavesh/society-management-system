import { useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon.jsx';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: 'home', path: '/dashboard' },
      { id: 'societies', label: 'Societies', icon: 'building', path: '/societies' },
      { id: 'buildings', label: 'Buildings', icon: 'building', path: '/buildings' },
      { id: 'flats', label: 'Flats', icon: 'grid', path: '/flats' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'residents', label: 'Residents', icon: 'users', path: '/residents' },
      { id: 'billing', label: 'Billing & payments', icon: 'credit-card', path: '/billing' },
      { id: 'complaints', label: 'Complaints', icon: 'alert-triangle', path: '/complaints' },
      { id: 'visitors', label: 'Visitors', icon: 'user-plus', path: '/visitors' },
      { id: 'notices', label: 'Notices', icon: 'bell', path: '/notices' },
      { id: 'reports', label: 'Reports', icon: 'file-text', path: '/reports' },
    ],
  },
];

export function SidebarNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav>
      {navGroups.map((group) => (
        <div key={group.label}>
          <div className={'nav-label ' + (group.label === 'Manage' ? 'manage' : '')}>
            {group.label}
          </div>
          {group.items.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={'nav-item ' + (currentPath === item.path ? 'active' : '')}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

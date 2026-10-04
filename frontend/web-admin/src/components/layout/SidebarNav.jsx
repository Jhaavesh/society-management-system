import { useLocation, Link } from 'react-router-dom';
import { Icon } from '../ui/Icon.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: 'home', path: '/dashboard', roles: ['platform_admin', 'society_admin', 'accountant', 'security', 'resident'] },
      { id: 'societies', label: 'Societies', icon: 'building', path: '/societies', roles: ['platform_admin'] },
      { id: 'buildings', label: 'Buildings', icon: 'building', path: '/buildings', roles: ['platform_admin', 'society_admin'] },
      { id: 'flats', label: 'Flats', icon: 'grid', path: '/flats', roles: ['platform_admin', 'society_admin', 'resident'] },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'residents', label: 'Residents', icon: 'users', path: '/residents', roles: ['platform_admin', 'society_admin'] },
      { id: 'billing', label: 'Billing & payments', icon: 'credit-card', path: '/billing', roles: ['platform_admin', 'society_admin', 'accountant', 'resident'] },
      { id: 'complaints', label: 'Complaints', icon: 'alert-triangle', path: '/complaints', roles: ['platform_admin', 'society_admin', 'security', 'resident'] },
      { id: 'visitors', label: 'Visitors', icon: 'user-plus', path: '/visitors', roles: ['platform_admin', 'society_admin', 'security', 'resident'] },
      { id: 'notices', label: 'Notices', icon: 'bell', path: '/notices', roles: ['platform_admin', 'society_admin', 'resident'] },
      { id: 'reports', label: 'Reports', icon: 'file-text', path: '/reports', roles: ['platform_admin', 'society_admin', 'accountant'] },
    ],
  },
];

export function SidebarNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { session } = useAuth();
  const userRole = session?.user?.role || 'resident';

  // Filter groups and items based on the current user's role
  const filteredGroups = navGroups.map(group => {
    return {
      ...group,
      items: group.items.filter(item => item.roles.includes(userRole))
    };
  }).filter(group => group.items.length > 0);

  return (
    <nav>
      {filteredGroups.map((group) => (
        <div key={group.label}>
          <div className={'nav-label ' + (group.label === 'Manage' ? 'manage' : '')}>
            {group.label}
          </div>
          {group.items.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={'nav-item ' + (currentPath === item.path ? 'active' : '')}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { key: 'books', label: 'Books', icon: '📚' },
  { key: 'bio', label: 'Bio', icon: '👤' },
  { key: 'social', label: 'Social Links', icon: '🔗' },
  { key: 'settings', label: 'Site Settings', icon: '⚙️' },
  { key: 'quiz', label: 'Quiz', icon: '❓' },
];

export default function Sidebar({ activeSection, onNavigate }) {
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-title">Admin</h2>}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link ${activeSection === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>
      <a
        href="https://gstreet-ops.github.io/ellie-hallaron-website/"
        target="_blank"
        rel="noopener noreferrer"
        className="sidebar-link sidebar-view-site"
        title="View Live Site"
      >
        <span className="sidebar-icon">🌐</span>
        {!collapsed && <span className="sidebar-label">View Site</span>}
      </a>
      <button className="sidebar-logout" onClick={signOut} title="Sign Out">
        <span className="sidebar-icon">🚪</span>
        {!collapsed && <span className="sidebar-label">Sign Out</span>}
      </button>
    </aside>
  );
}

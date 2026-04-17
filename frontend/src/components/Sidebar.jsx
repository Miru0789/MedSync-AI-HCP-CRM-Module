import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  BarChart3, 
  Settings,
  Stethoscope
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'Log Interaction', icon: <MessageSquarePlus size={18} />, path: '/log' },
    { name: 'Insights', icon: <BarChart3 size={18} />, path: '/insights' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '30px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-icon">
            <Stethoscope color="white" size={20} />
          </div>
          <div style={{ lineHeight: '1' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>MedSync AI</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>HCP CRM</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav-menu">
        <p className="nav-label">Main Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile */}
      <div className="side-profile">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander&backgroundColor=b6e3f4" 
          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b' }}
          alt="u"
        />
        <div style={{ overflow: 'hidden' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'white' }}>Alexander Rep</p>
          <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Territory Lead</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

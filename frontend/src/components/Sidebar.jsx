/**
 * Sidebar.jsx - Navigation Sidebar Component
 * =============================================
 * Displays the main navigation menu on the left side.
 * Highlights the current active page.
 * Collapses on mobile with a hamburger toggle.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineCloudUpload,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useState } from 'react';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/upload', label: 'Upload Meeting', icon: HiOutlineCloudUpload },
    { path: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
    { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  ];

  const sidebarStyle = {
    position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 40,
    width: 260, display: 'flex', flexDirection: 'column',
    background: 'white', borderRight: '1px solid var(--border-color)',
    transition: 'transform 0.3s ease-in-out',
  };

  const navLinkBase = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.2s ease',
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 50,
          padding: 8, borderRadius: 8, background: 'white',
          border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer', display: 'none',
        }}
        className="md-hide-button" id="mobile-menu-toggle">
        {mobileOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 30,
        }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        ...sidebarStyle,
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}>
        {/* Logo / Brand */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--primary-blue)', color: 'white', fontWeight: 700, fontSize: 14,
            }}>MI</div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3 }}>MeetIntel</h1>
              <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 1 }}>Meeting Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                ...navLinkBase,
                background: isActive ? '#EFF6FF' : 'transparent',
                color: isActive ? 'var(--primary-blue)' : 'var(--text-gray)',
                fontWeight: isActive ? 600 : 500,
              })}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--secondary-indigo)', color: 'white', fontSize: 13, fontWeight: 600,
            }}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, color: 'var(--danger-red)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            id="logout-button">
            <HiOutlineLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

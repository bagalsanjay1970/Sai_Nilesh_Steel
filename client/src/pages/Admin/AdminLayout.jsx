import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../firebase/services';
import toast from 'react-hot-toast';
import {
  FiHome, FiGrid, FiTag, FiImage, FiMessageSquare, FiSettings,
  FiLogOut, FiMenu, FiX, FiFileText, FiShield, FiUser
} from 'react-icons/fi';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/palkhis', icon: <FiGrid />, label: 'Palkhis' },
    { path: '/admin/categories', icon: <FiTag />, label: 'Categories' },
    { path: '/admin/gallery', icon: <FiImage />, label: 'Gallery' },
    { path: '/admin/inquiries', icon: <FiMessageSquare />, label: 'Inquiries' },
    { path: '/admin/custom-requests', icon: <FiFileText />, label: 'Custom Requests' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  const currentNav = navItems.find(item => item.path === location.pathname);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin/dashboard" className="sidebar-logo">
            <span className="sidebar-logo-icon">🙏</span>
            <div>
              <span className="sidebar-logo-name">Admin Panel</span>
              <span className="sidebar-logo-sub">Sai Nilesh Steel</span>
            </div>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '8px 12px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiUser style={{ fontSize: '0.9rem' }} />
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.email || 'admin@sainileshsteel.com'}
              </span>
            </div>
          </div>
          <Link to="/" className="sidebar-link" target="_blank">
            <FiHome />
            <span>View Website</span>
          </Link>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <div className="admin-header-title">
              {currentNav?.label || 'Admin'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            {!isFirebaseConfigured() ? (
              <span className="badge badge-warning" title="Local persistent mode is active. Changes save to browser & Express backend." style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 10px' }}>
                <FiShield /> Dev Mode (Local Store)
              </span>
            ) : (
              <span className="badge badge-success" title="Connected to live Firebase Firestore." style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 10px' }}>
                <FiShield /> Live Firebase
              </span>
            )}
            <Link to="/" target="_blank" className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Live Storefront ↗
            </Link>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default AdminLayout;

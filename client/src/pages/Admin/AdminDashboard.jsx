import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPalkhis, getGalleryItems, getInquiries, getCustomRequests } from '../../firebase/services';
import { FiGrid, FiStar, FiImage, FiMessageSquare, FiFileText, FiAlertCircle } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPalkhis: 0, featuredPalkhis: 0, galleryImages: 0,
    totalInquiries: 0, customRequests: 0, unreadInquiries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [palkhis, gallery, inquiries, customReqs] = await Promise.all([
          getAllPalkhis(), getGalleryItems(), getInquiries(), getCustomRequests()
        ]);
        setStats({
          totalPalkhis: palkhis.length,
          featuredPalkhis: palkhis.filter(p => p.featured).length,
          galleryImages: gallery.length,
          totalInquiries: inquiries.length,
          customRequests: customReqs.length,
          unreadInquiries: inquiries.filter(i => i.status === 'unread').length + customReqs.filter(r => r.status === 'unread').length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-page"><div className="spinner"></div></div>;
  }

  const statCards = [
    { icon: <FiGrid />, label: 'Total Palkhis', value: stats.totalPalkhis, color: 'primary', link: '/admin/palkhis' },
    { icon: <FiStar />, label: 'Featured Palkhis', value: stats.featuredPalkhis, color: 'warning', link: '/admin/palkhis' },
    { icon: <FiImage />, label: 'Gallery Images', value: stats.galleryImages, color: 'info', link: '/admin/gallery' },
    { icon: <FiMessageSquare />, label: 'Customer Inquiries', value: stats.totalInquiries, color: 'success', link: '/admin/inquiries' },
    { icon: <FiFileText />, label: 'Custom Requests', value: stats.customRequests, color: 'primary', link: '/admin/custom-requests' },
    { icon: <FiAlertCircle />, label: 'Unread Messages', value: stats.unreadInquiries, color: stats.unreadInquiries > 0 ? 'error' : 'success', link: '/admin/inquiries' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Dashboard Overview</h2>
      </div>

      <div className="admin-grid">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link} className="admin-stat-card">
            <div className={`admin-stat-icon ${card.color}`}>{card.icon}</div>
            <div>
              <span className="admin-stat-number">{card.value}</span>
              <span className="admin-stat-label">{card.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', border: '1px solid var(--color-border-light)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Link to="/admin/palkhis" className="btn btn-primary btn-sm">+ Add Palkhi</Link>
          <Link to="/admin/gallery" className="btn btn-outline btn-sm">+ Upload Photo</Link>
          <Link to="/admin/categories" className="btn btn-outline btn-sm">Manage Categories</Link>
          <Link to="/admin/settings" className="btn btn-outline btn-sm">Site Settings</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { getInquiries, updateInquiry, deleteInquiry } from '../../firebase/services';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';
import { FiTrash2, FiPhone, FiCheck, FiMail, FiEye, FiAlertTriangle, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsAppUrl } from '../../utils/whatsapp';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { settings } = useSettings();

  const fetchData = async () => {
    try {
      const data = await getInquiries();
      setInquiries(data);
    } catch (error) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const markAs = async (id, status) => {
    try {
      await updateInquiry(id, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleting(true);
    setInquiries(prev => prev.filter(i => String(i.id) !== String(id)));
    setDeleteTarget(null);
    try {
      await deleteInquiry(id);
      toast.success(`Inquiry from "${name}" deleted`);
    } catch (error) {
      toast.error('Failed to delete');
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      unread: 'badge-error',
      read: 'badge-warning',
      contacted: 'badge-info',
      completed: 'badge-success'
    };
    return map[status] || 'badge-info';
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Customer Inquiries</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {inquiries.filter(i => i.status === 'unread').length} unread
        </span>
      </div>

      {inquiries.length > 0 ? (
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Interest</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inq => (
                <tr key={inq.id} style={{ background: inq.status === 'unread' ? 'rgba(197, 150, 27, 0.05)' : 'transparent' }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inq.name}</div>
                    {inq.email && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{inq.email}</div>}
                  </td>
                  <td>{inq.phone}</td>
                  <td style={{ fontSize: '0.85rem' }}>{inq.palkhiInterest || inq.selectedPalkhi || '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {inq.createdAt?.toDate?.() ? inq.createdAt.toDate().toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td><span className={`badge ${getStatusBadge(inq.status)}`}>{inq.status}</span></td>
                  <td>
                    <div className="admin-table-actions" style={{ flexWrap: 'wrap' }}>
                      <button className="btn btn-sm" title="View" onClick={() => setSelectedInquiry(inq)}>
                        <FiEye />
                      </button>
                      {inq.phone && (
                        <a href={`tel:${inq.phone}`} className="btn btn-sm" title="Call" style={{ color: 'var(--color-info)' }}>
                          <FiPhone />
                        </a>
                      )}
                      {inq.phone && (
                        <a href={getWhatsAppUrl(inq.phone, null, `Hello ${inq.name}, regarding your inquiry about Sai Baba Palkhis...`)} target="_blank" rel="noopener noreferrer" className="btn btn-sm" title="WhatsApp" style={{ color: 'var(--color-whatsapp)' }}>
                          <FaWhatsapp />
                        </a>
                      )}
                      <select
                        value={inq.status}
                        onChange={e => markAs(inq.id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button 
                        className="btn btn-sm" 
                        style={{ color: 'var(--color-error)' }} 
                        onClick={() => setDeleteTarget({ id: inq.id, name: inq.name || 'Customer' })} 
                        title="Delete Inquiry"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📬</div>
          <h3 className="empty-state-title">No Inquiries Yet</h3>
          <p className="empty-state-text">Customer inquiries will appear here</p>
        </div>
      )}

      {/* Modern In-App Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAlertTriangle /> Confirm Deletion
              </h3>
              <button className="modal-close" onClick={() => !deleting && setDeleteTarget(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 'var(--space-sm)', fontSize: '0.95rem' }}>
                Are you sure you want to delete inquiry from <strong>{deleteTarget.name}</strong>?
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                This record will be permanently deleted from your inquiry list.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={() => setDeleteTarget(null)} 
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                style={{ background: 'var(--color-error)', color: '#fff', border: 'none' }} 
                onClick={confirmDelete} 
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Inquiry Details</h3>
              <button className="modal-close" onClick={() => setSelectedInquiry(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                <div><strong>Name:</strong> {selectedInquiry.name}</div>
                <div><strong>Phone:</strong> {selectedInquiry.phone}</div>
                {selectedInquiry.email && <div><strong>Email:</strong> {selectedInquiry.email}</div>}
                {selectedInquiry.palkhiInterest && <div><strong>Interest:</strong> {selectedInquiry.palkhiInterest}</div>}
                {selectedInquiry.message && <div><strong>Message:</strong><br />{selectedInquiry.message}</div>}
                <div><strong>Source:</strong> {selectedInquiry.source || 'Website'}</div>
                <div><strong>Status:</strong> <span className={`badge ${getStatusBadge(selectedInquiry.status)}`}>{selectedInquiry.status}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <a href={`tel:${selectedInquiry.phone}`} className="btn btn-call btn-sm"><FiPhone /> Call</a>
              <a href={getWhatsAppUrl(selectedInquiry.phone, null, `Hello ${selectedInquiry.name}, regarding your inquiry about Sai Baba Palkhis...`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm"><FaWhatsapp /> WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;

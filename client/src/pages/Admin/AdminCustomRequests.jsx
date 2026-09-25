import { useState, useEffect } from 'react';
import { getCustomRequests, updateCustomRequest, deleteCustomRequest } from '../../firebase/services';
import toast from 'react-hot-toast';
import { FiTrash2, FiPhone, FiEye, FiAlertTriangle, FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsAppUrl } from '../../utils/whatsapp';

const AdminCustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getCustomRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const markAs = async (id, status) => {
    try {
      await updateCustomRequest(id, { status });
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
    setRequests(prev => prev.filter(r => String(r.id) !== String(id)));
    setDeleteTarget(null);
    try {
      await deleteCustomRequest(id);
      toast.success(`Request from "${name}" deleted`);
    } catch (error) {
      toast.error('Failed to delete');
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = { unread: 'badge-error', read: 'badge-warning', contacted: 'badge-info', completed: 'badge-success' };
    return map[status] || 'badge-info';
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Custom Palkhi Requests</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {requests.filter(r => r.status === 'unread').length} unread
        </span>
      </div>

      {requests.length > 0 ? (
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Design</th>
                <th>Size</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ background: req.status === 'unread' ? 'rgba(197, 150, 27, 0.05)' : 'transparent' }}>
                  <td style={{ fontWeight: 600 }}>{req.name}</td>
                  <td>{req.mobile}</td>
                  <td style={{ fontSize: '0.85rem' }}>{req.preferredDesign || '-'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{req.requiredSize || '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {req.createdAt?.toDate?.() ? req.createdAt.toDate().toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span></td>
                  <td>
                    <div className="admin-table-actions" style={{ flexWrap: 'wrap' }}>
                      <button className="btn btn-sm" onClick={() => setSelected(req)}><FiEye /></button>
                      {req.mobile && <a href={`tel:${req.mobile}`} className="btn btn-sm" style={{ color: 'var(--color-info)' }}><FiPhone /></a>}
                      {req.mobile && (
                        <a href={getWhatsAppUrl(req.mobile, null, `Hello ${req.name}, regarding your custom Palkhi request...`)} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ color: 'var(--color-whatsapp)' }}>
                          <FaWhatsapp />
                        </a>
                      )}
                      <select value={req.status} onChange={e => markAs(req.id, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button 
                        className="btn btn-sm" 
                        style={{ color: 'var(--color-error)' }} 
                        onClick={() => setDeleteTarget({ id: req.id, name: req.name || 'Customer' })}
                        title="Delete Request"
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
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No Custom Requests</h3>
          <p className="empty-state-text">Custom Palkhi requests from customers will appear here</p>
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
                Are you sure you want to delete custom request from <strong>{deleteTarget.name}</strong>?
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                This request will be permanently removed from your system.
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

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Custom Request Details</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                <div><strong>Name:</strong> {selected.name}</div>
                <div><strong>Mobile:</strong> {selected.mobile}</div>
                {selected.email && <div><strong>Email:</strong> {selected.email}</div>}
                {selected.requiredSize && <div><strong>Required Size:</strong> {selected.requiredSize}</div>}
                {selected.preferredDesign && <div><strong>Preferred Design:</strong> {selected.preferredDesign}</div>}
                {selected.finish && <div><strong>Finish:</strong> {selected.finish}</div>}
                {selected.quantity && <div><strong>Quantity:</strong> {selected.quantity}</div>}
                {selected.requiredDate && <div><strong>Required By:</strong> {selected.requiredDate}</div>}
                {selected.additionalRequirements && <div><strong>Additional Requirements:</strong><br />{selected.additionalRequirements}</div>}
                <div><strong>Status:</strong> <span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <a href={`tel:${selected.mobile}`} className="btn btn-call btn-sm"><FiPhone /> Call</a>
              <a href={getWhatsAppUrl(selected.mobile, null, `Hello ${selected.name}, regarding your custom Palkhi request...`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm"><FaWhatsapp /> WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomRequests;

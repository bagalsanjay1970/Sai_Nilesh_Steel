import { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../firebase/services';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', order: 0, enabled: true });

  const fetchData = async () => {
    try {
      const data = await getCategories(false);
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', order: 0, enabled: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name || '', description: cat.description || '', order: cat.order || 0, enabled: cat.enabled !== false });
    setEditing(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) { toast.error('Category name is required'); return; }
    try {
      if (editing) {
        await updateCategory(editing, formData);
        toast.success('Category updated');
      } else {
        await addCategory(formData);
        toast.success('Category added');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleting(true);
    // Optimistic UI update
    setCategories(prev => prev.filter(c => String(c.id) !== String(id)));
    setDeleteTarget(null);
    try {
      await deleteCategory(id);
      toast.success(`Category "${name}" deleted`);
    } catch (error) {
      toast.error('Failed to delete category');
      fetchData(); // Rollback if error
    } finally {
      setDeleting(false);
    }
  };

  const toggleEnabled = async (id, current) => {
    try {
      await updateCategory(id, { enabled: !current });
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Category Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <FiPlus /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="modal-close" onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Traditional Palkhi" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input type="number" className="form-input" value={formData.order} onChange={e => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.enabled} onChange={e => setFormData(p => ({ ...p, enabled: e.target.checked }))} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Enabled</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.length > 0 ? (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{cat.description || '-'}</td>
                  <td>{cat.order || 0}</td>
                  <td>
                    <button onClick={() => toggleEnabled(cat.id, cat.enabled)}>
                      {cat.enabled !== false ? <FiEye style={{ color: 'var(--color-success)' }} /> : <FiEyeOff style={{ color: 'var(--color-text-muted)' }} />}
                    </button>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(cat)}><FiEdit2 /></button>
                      <button 
                        className="btn btn-sm" 
                        style={{ color: 'var(--color-error)' }} 
                        onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                        title="Delete Category"
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
          <div className="empty-state-icon">🏷️</div>
          <h3 className="empty-state-title">No Categories</h3>
          <p className="empty-state-text">Add Palkhi categories to organize your collection</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><FiPlus /> Add Category</button>
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
                Are you sure you want to delete category <strong>{deleteTarget.name}</strong>?
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Existing Palkhis under this category will retain their information but may need to be recategorized.
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
    </div>
  );
};

export default AdminCategories;

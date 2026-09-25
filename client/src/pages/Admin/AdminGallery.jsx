import { useState, useEffect } from 'react';
import { getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem, getCategories, uploadImage } from '../../firebase/services';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiAlertTriangle } from 'react-icons/fi';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', imageUrl: '', imagePath: '' });

  const fetchData = async () => {
    try {
      const [galleryData, catsData] = await Promise.all([getGalleryItems(), getCategories(false)]);
      setItems(galleryData);
      setCategories(catsData);
    } catch (error) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({ title: '', description: '', category: '', imageUrl: '', imagePath: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setFormData({ title: item.title || '', description: item.description || '', category: item.category || '', imageUrl: item.imageUrl || '', imagePath: item.imagePath || '' });
    setEditing(item.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, 'gallery');
      setFormData(prev => ({ ...prev, imageUrl: result.url, imagePath: result.path }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) { toast.error('Title and image are required'); return; }
    try {
      if (editing) {
        await updateGalleryItem(editing, formData);
        toast.success('Gallery item updated');
      } else {
        await addGalleryItem(formData);
        toast.success('Gallery item added');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    setDeleting(true);
    setItems(prev => prev.filter(item => String(item.id) !== String(id)));
    setDeleteTarget(null);
    try {
      await deleteGalleryItem(id);
      toast.success(`"${title}" deleted`);
    } catch (error) {
      toast.error('Failed to delete');
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Gallery Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <FiPlus /> Upload Photo
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Gallery Item' : 'Add Gallery Photo'}</h3>
              <button className="modal-close" onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Photo</label>
                  {formData.imageUrl && (
                    <div style={{ marginBottom: 'var(--space-sm)' }}>
                      <img src={formData.imageUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
                    </div>
                  )}
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                    <FiUpload /> {uploading ? 'Uploading...' : 'Choose Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input type="text" className="form-input" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update' : 'Add Photo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {items.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 'var(--space-md)' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: 'var(--space-xs)' }}>{item.title}</h4>
                {item.category && <span className="badge badge-info" style={{ marginBottom: 'var(--space-sm)', display: 'inline-block' }}>{item.category}</span>}
                <div className="admin-table-actions" style={{ marginTop: 'var(--space-sm)' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)}><FiEdit2 /></button>
                  <button 
                    className="btn btn-sm" 
                    style={{ color: 'var(--color-error)' }} 
                    onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                    title="Delete Photo"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📷</div>
          <h3 className="empty-state-title">No Gallery Photos</h3>
          <p className="empty-state-text">Upload your first Palkhi photograph</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><FiPlus /> Upload Photo</button>
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
                Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                This photograph will be permanently removed from your website gallery.
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

export default AdminGallery;

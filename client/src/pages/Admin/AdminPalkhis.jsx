import { useState, useEffect } from 'react';
import { getAllPalkhis, addPalkhi, updatePalkhi, deletePalkhi, getCategories, uploadImage } from '../../firebase/services';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiEye, FiEyeOff, FiX, FiUpload, FiAlertTriangle } from 'react-icons/fi';

const AdminPalkhis = () => {
  const [palkhis, setPalkhis] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', shortDescription: '', category: '', material: '',
    dimensions: '', weight: '', finish: '', price: '', availability: 'Made to Order',
    customizationOptions: '', featured: false, enabled: true, images: []
  });

  const fetchData = async () => {
    try {
      const [palkhisData, catsData] = await Promise.all([getAllPalkhis(), getCategories(false)]);
      setPalkhis(palkhisData);
      setCategories(catsData);
    } catch (error) {
      toast.error('Failed to load palkhis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', shortDescription: '', category: '', material: '', dimensions: '', weight: '', finish: '', price: '', availability: 'Made to Order', customizationOptions: '', featured: false, enabled: true, images: [] });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (palkhi) => {
    setFormData({
      name: palkhi.name || '', description: palkhi.description || '', shortDescription: palkhi.shortDescription || '',
      category: palkhi.category || '', material: palkhi.material || '', dimensions: palkhi.dimensions || '',
      weight: palkhi.weight || '', finish: palkhi.finish || '', price: palkhi.price || '',
      availability: palkhi.availability || 'Made to Order', customizationOptions: palkhi.customizationOptions || '',
      featured: palkhi.featured || false, enabled: palkhi.enabled !== false, images: palkhi.images || []
    });
    setEditing(palkhi.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file, 'palkhis'));
      const results = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...results]
      }));
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) { toast.error('Please enter a name'); return; }
    try {
      if (editing) {
        await updatePalkhi(editing, formData);
        toast.success('Palkhi updated successfully');
      } else {
        await addPalkhi(formData);
        toast.success('Palkhi added successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save palkhi');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleting(true);
    // Optimistic UI removal
    setPalkhis(prev => prev.filter(p => String(p.id) !== String(id)));
    setDeleteTarget(null);
    try {
      await deletePalkhi(id);
      toast.success(`"${name}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete palkhi');
      fetchData(); // Rollback if error
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (id, current) => {
    try {
      await updatePalkhi(id, { featured: !current });
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const toggleEnabled = async (id, current) => {
    try {
      await updatePalkhi(id, { enabled: !current });
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Palkhi Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <FiPlus /> Add Palkhi
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Palkhi' : 'Add New Palkhi'}</h3>
              <button className="modal-close" onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Palkhi Name *</label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input type="text" className="form-input" value={formData.shortDescription} onChange={e => setFormData(p => ({ ...p, shortDescription: e.target.value }))} placeholder="Brief one-liner" />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Description</label>
                  <textarea className="form-textarea" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Material</label>
                    <input type="text" className="form-input" value={formData.material} onChange={e => setFormData(p => ({ ...p, material: e.target.value }))} placeholder="e.g., Stainless Steel" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Dimensions</label>
                    <input type="text" className="form-input" value={formData.dimensions} onChange={e => setFormData(p => ({ ...p, dimensions: e.target.value }))} placeholder="e.g., 4ft x 3ft x 6ft" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight</label>
                    <input type="text" className="form-input" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} placeholder="e.g., 25 kg" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Finish</label>
                    <input type="text" className="form-input" value={formData.finish} onChange={e => setFormData(p => ({ ...p, finish: e.target.value }))} placeholder="e.g., Mirror Polish" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" className="form-input" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} placeholder="Leave empty for Contact for Price" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select className="form-select" value={formData.availability} onChange={e => setFormData(p => ({ ...p, availability: e.target.value }))}>
                    <option value="In Stock">In Stock</option>
                    <option value="Made to Order">Made to Order</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Customization Options</label>
                  <textarea className="form-textarea" value={formData.customizationOptions} onChange={e => setFormData(p => ({ ...p, customizationOptions: e.target.value }))} rows={2} placeholder="Describe available customizations..." />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Featured Palkhi</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.enabled} onChange={e => setFormData(p => ({ ...p, enabled: e.target.checked }))} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Enabled (visible on website)</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Images</label>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                    {formData.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                    <FiUpload /> {uploading ? 'Uploading...' : 'Upload Images'}
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update Palkhi' : 'Add Palkhi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {palkhis.length > 0 ? (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {palkhis.map(palkhi => (
                <tr key={palkhi.id}>
                  <td>
                    {palkhi.images?.length > 0 ? (
                      <img src={palkhi.images[0].url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 50, height: 50, background: 'var(--color-bg)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🙏</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{palkhi.name}</td>
                  <td><span className="badge badge-info">{palkhi.category || '-'}</span></td>
                  <td>{palkhi.price ? `₹${Number(palkhi.price).toLocaleString('en-IN')}` : 'Contact'}</td>
                  <td>
                    <button onClick={() => toggleFeatured(palkhi.id, palkhi.featured)} style={{ color: palkhi.featured ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                      <FiStar />
                    </button>
                  </td>
                  <td>
                    <button onClick={() => toggleEnabled(palkhi.id, palkhi.enabled)} title={palkhi.enabled ? 'Enabled' : 'Disabled'}>
                      {palkhi.enabled !== false ? <FiEye style={{ color: 'var(--color-success)' }} /> : <FiEyeOff style={{ color: 'var(--color-text-muted)' }} />}
                    </button>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(palkhi)}><FiEdit2 /></button>
                      <button 
                        className="btn btn-sm" 
                        style={{ color: 'var(--color-error)' }} 
                        onClick={() => setDeleteTarget({ id: palkhi.id, name: palkhi.name })}
                        title="Delete Palkhi"
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
          <div className="empty-state-icon">🙏</div>
          <h3 className="empty-state-title">No Palkhis Yet</h3>
          <p className="empty-state-text">Start by adding your first Sai Baba Palkhi</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus /> Add First Palkhi
          </button>
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
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                This Palkhi will be permanently removed from your showroom, categories, and database.
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

export default AdminPalkhis;

import { useState, useEffect } from 'react';
import { getSettings, updateSettings, uploadImage, syncAllDataToFirebase, clearAllDummyData } from '../../firebase/services';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';
import { FiSave, FiUpload, FiX, FiCloud, FiTrash2 } from 'react-icons/fi';

const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('business');
  const [formData, setFormData] = useState({
    businessName: '', ownerName: '', phone: '', whatsapp: '', email: '',
    address: '', businessHours: '', googleMapsLink: '',
    heroHeading: '', heroDescription: '', heroImages: [],
    stats: { yearsExperience: 25, palkhisCrafted: 500, happyCustomers: 350 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSettings();
        setFormData(prev => ({ ...prev, ...data }));
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('stats.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({ ...prev, stats: { ...prev.stats, [key]: parseInt(value) || 0 } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, 'hero');
      setFormData(prev => ({
        ...prev,
        heroImages: [...(prev.heroImages || []), { url: result.url, path: result.path, alt: 'Hero Image' }]
      }));
      toast.success('Hero image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeHeroImage = (index) => {
    setFormData(prev => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      refreshSettings();
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncAllToFirebase = async () => {
    setSyncing(true);
    const toastId = toast.loading('Uploading all Palkhis, Categories, Gallery & Settings to Firebase...');
    try {
      await syncAllDataToFirebase();
      toast.success('🎉 Successfully synced all website data directly into Firebase Firestore!', { id: toastId, duration: 6000 });
      refreshSettings();
    } catch (error) {
      toast.error('Sync failed: ' + error.message, { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data and start completely fresh? This will remove all dummy data so you can add everything new.')) {
      clearAllDummyData();
      toast.success('All dummy data cleared! Reloading fresh...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const tabs = [
    { key: 'business', label: 'Business Info' },
    { key: 'homepage', label: 'Homepage' },
    { key: 'stats', label: 'Statistics' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Website Settings</h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            onClick={handleClearAllData} 
            title="Wipe dummy data and start fresh"
          >
            <FiTrash2 /> Clear Dummy Data
          </button>
          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            onClick={handleSyncAllToFirebase} 
            disabled={syncing || saving}
            title="Upload all website content and categories directly to Google Cloud Firestore"
          >
            <FiCloud /> {syncing ? 'Syncing to Firebase...' : 'Push All Data to Firebase'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || syncing}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 'var(--space-sm)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2xl)', border: '1px solid var(--color-border-light)' }}>
        {activeTab === 'business' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>Business Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input type="text" name="businessName" className="form-input" value={formData.businessName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Name</label>
                <input type="text" name="ownerName" className="form-input" value={formData.ownerName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number (with country code, no +)</label>
                <input type="text" name="whatsapp" className="form-input" value={formData.whatsapp} onChange={handleChange} placeholder="919876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Business Hours</label>
                <input type="text" name="businessHours" className="form-input" value={formData.businessHours} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Workshop Address</label>
              <textarea name="address" className="form-textarea" value={formData.address} onChange={handleChange} rows={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Google Maps Link</label>
              <input type="url" name="googleMapsLink" className="form-input" value={formData.googleMapsLink} onChange={handleChange} />
            </div>
          </div>
        )}

        {activeTab === 'homepage' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>Homepage Settings</h3>
            <div className="form-group">
              <label className="form-label">Hero Heading</label>
              <input type="text" name="heroHeading" className="form-input" value={formData.heroHeading} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Description</label>
              <textarea name="heroDescription" className="form-textarea" value={formData.heroDescription} onChange={handleChange} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Slider Images</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                {(formData.heroImages || []).map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: 150, height: 90, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeHeroImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                <FiUpload /> {uploading ? 'Uploading...' : 'Add Hero Image'}
                <input type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>Business Statistics</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
              These statistics are displayed on the homepage.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-lg)' }}>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input type="number" name="stats.yearsExperience" className="form-input" value={formData.stats?.yearsExperience || 0} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Palkhis Crafted</label>
                <input type="number" name="stats.palkhisCrafted" className="form-input" value={formData.stats?.palkhisCrafted || 0} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Happy Customers</label>
                <input type="number" name="stats.happyCustomers" className="form-input" value={formData.stats?.happyCustomers || 0} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;

import { useState } from 'react';
import { addCustomRequest } from '../../firebase/services';
import toast from 'react-hot-toast';
import { FaPalette, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import './CustomRequest.css';

const CustomRequest = () => {
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', requiredSize: '',
    preferredDesign: '', finish: '', quantity: '1',
    requiredDate: '', additionalRequirements: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill in your name and mobile number');
      return;
    }
    setSubmitting(true);
    try {
      await addCustomRequest(formData);
      setSubmitted(true);
      toast.success('Your custom Palkhi request has been submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="custom-request-page page-enter">
        <section className="page-hero">
          <div className="page-hero-bg"></div>
          <div className="container page-hero-content">
            <div className="section-badge"><FaPalette /> Custom Design</div>
            <h1 className="page-hero-title">Custom Palkhi Request</h1>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="success-message animate-scale-in">
              <div className="success-icon"><FaCheckCircle /></div>
              <h2>Request Submitted Successfully!</h2>
              <p>Thank you for your interest in a custom Sai Baba Palkhi. Our team will review your requirements and contact you within 24 hours.</p>
              <button className="btn btn-primary btn-lg" onClick={() => { setSubmitted(false); setFormData({ name: '', mobile: '', email: '', requiredSize: '', preferredDesign: '', finish: '', quantity: '1', requiredDate: '', additionalRequirements: '' }); }}>
                Submit Another Request
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="custom-request-page page-enter">
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container page-hero-content">
          <div className="section-badge"><FaPalette /> Custom Design</div>
          <h1 className="page-hero-title">Request a Custom Sai Baba Palkhi</h1>
          <p className="page-hero-subtitle">
            Share your vision and let us create a bespoke Palkhi tailored to your exact specifications
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="custom-form-wrapper">
            <div className="custom-form-header">
              <h2>Tell Us About Your Dream Palkhi</h2>
              <p>Fill in the details below and our craftsmen will work with you to bring your vision to life</p>
            </div>
            
            <form onSubmit={handleSubmit} className="custom-form">
              <div className="form-section-title">Personal Information</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="form-input" placeholder="+91 XXXXX XXXXX" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="your@email.com" />
              </div>

              <div className="form-section-title">Palkhi Specifications</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Required Size / Dimensions</label>
                  <input type="text" name="requiredSize" value={formData.requiredSize} onChange={handleChange} className="form-input" placeholder="e.g., 4ft x 3ft x 6ft" />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Design</label>
                  <select name="preferredDesign" value={formData.preferredDesign} onChange={handleChange} className="form-select">
                    <option value="">Select Design Style</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Modern">Modern</option>
                    <option value="Royal">Royal / Premium</option>
                    <option value="Temple Style">Temple Style</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Ornate">Ornate / Detailed</option>
                    <option value="Custom">Completely Custom</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Finish / Coating</label>
                  <select name="finish" value={formData.finish} onChange={handleChange} className="form-select">
                    <option value="">Select Finish</option>
                    <option value="Mirror Polish">Mirror Polish</option>
                    <option value="Matte">Matte Finish</option>
                    <option value="Gold Plated">Gold Plated</option>
                    <option value="Silver Finish">Silver Finish</option>
                    <option value="Powder Coated">Powder Coated</option>
                    <option value="Antique">Antique Finish</option>
                    <option value="Custom">Custom Finish</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-input" min="1" placeholder="1" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Required By (Date)</label>
                <input type="date" name="requiredDate" value={formData.requiredDate} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Requirements</label>
                <textarea name="additionalRequirements" value={formData.additionalRequirements} onChange={handleChange} className="form-textarea" placeholder="Describe any specific designs, patterns, features, or special requirements..." rows={5} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Submitting...' : <><FaPaperPlane /> Submit Custom Palkhi Request</>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomRequest;

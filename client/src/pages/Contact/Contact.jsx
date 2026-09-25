import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { addInquiry } from '../../firebase/services';
import toast from 'react-hot-toast';
import { 
  FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaUser, FaDirections, FaPaperPlane
} from 'react-icons/fa';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './Contact.css';

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', palkhiInterest: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }
    setSubmitting(true);
    try {
      await addInquiry({
        ...formData,
        type: 'contact',
        source: 'Contact Page'
      });
      toast.success('Your inquiry has been sent successfully! We will contact you soon.');
      setFormData({ name: '', phone: '', email: '', palkhiInterest: '', message: '' });
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page page-enter">
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container page-hero-content">
          <div className="section-badge"><FaPhone /> Get in Touch</div>
          <h1 className="page-hero-title">Contact Us</h1>
          <p className="page-hero-subtitle">
            Have questions about our Sai Baba Palkhis? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="contact-info-title">{settings.businessName || 'Sai Nilesh Steel'}</h2>
              <p className="contact-info-subtitle">Handcrafted Sai Baba Palkhi Specialists</p>

              <div className="contact-cards">
                <div className="contact-card">
                  <div className="contact-card-icon"><FaUser /></div>
                  <div>
                    <span className="contact-card-label">Owner</span>
                    <span className="contact-card-value">{settings.ownerName || 'Nilesh Patil'}</span>
                  </div>
                </div>

                <a href={`tel:${settings.phone}`} className="contact-card clickable">
                  <div className="contact-card-icon"><FaPhone /></div>
                  <div>
                    <span className="contact-card-label">Phone</span>
                    <span className="contact-card-value">{settings.phone || '+91 98765 43210'}</span>
                  </div>
                </a>

                <a href={getWhatsAppUrl(settings.whatsapp, settings.phone, 'Hello, I want to chat regarding Sai Baba Palkhis.')} target="_blank" rel="noopener noreferrer" className="contact-card clickable whatsapp-card">
                  <div className="contact-card-icon whatsapp"><FaWhatsapp /></div>
                  <div>
                    <span className="contact-card-label">WhatsApp</span>
                    <span className="contact-card-value">Chat with us</span>
                  </div>
                </a>

                <a href={`mailto:${settings.email}`} className="contact-card clickable">
                  <div className="contact-card-icon"><FaEnvelope /></div>
                  <div>
                    <span className="contact-card-label">Email</span>
                    <span className="contact-card-value">{settings.email || 'info@sainileshsteel.com'}</span>
                  </div>
                </a>

                <div className="contact-card">
                  <div className="contact-card-icon"><FaMapMarkerAlt /></div>
                  <div>
                    <span className="contact-card-label">Workshop Address</span>
                    <span className="contact-card-value">{settings.address || 'Shirdi, Maharashtra'}</span>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon"><FaClock /></div>
                  <div>
                    <span className="contact-card-label">Business Hours</span>
                    <span className="contact-card-value">{settings.businessHours || 'Mon - Sat: 9 AM - 7 PM'}</span>
                  </div>
                </div>
              </div>

              <div className="contact-quick-actions">
                <a href={`tel:${settings.phone || '+919822054321'}`} className="btn btn-call btn-lg">
                  <FaPhone /> Call Now
                </a>
                <a
                  href={getWhatsAppUrl(settings.whatsapp, settings.phone, 'Hello, I would like to inquire about your handcrafted Sai Baba Palkhis.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
                {settings.googleMapsLink && (
                  <a href={settings.googleMapsLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                    <FaDirections /> Get Directions
                  </a>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <h3 className="contact-form-title">Send Us a Message</h3>
              <p className="contact-form-subtitle">Fill in the form below and we'll get back to you shortly</p>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Interested In</label>
                  <select name="palkhiInterest" value={formData.palkhiInterest} onChange={handleChange} className="form-select">
                    <option value="">Select Palkhi Type</option>
                    <option value="Traditional Palkhi">Traditional Palkhi</option>
                    <option value="Premium Palkhi">Premium Palkhi</option>
                    <option value="Temple Palkhi">Temple Palkhi</option>
                    <option value="Custom Palkhi">Custom Palkhi</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} className="form-textarea" placeholder="Tell us about your requirements..." rows={5} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? 'Sending...' : <><FaPaperPlane /> Send Inquiry</>}
                </button>
              </form>
            </div>
          </div>

          {/* Map */}
          {settings.googleMapsLink && (
            <div className="contact-map">
              <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                Find Our <span>Workshop</span>
              </h3>
              <div className="map-embed">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || 'Shirdi Maharashtra')}&output=embed`}
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: '16px' }}
                  allowFullScreen
                  loading="lazy"
                  title="Workshop Location"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;

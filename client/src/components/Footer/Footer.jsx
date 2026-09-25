import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './Footer.css';

const Footer = () => {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();
  const whatsappUrl = getWhatsAppUrl(
    settings.whatsapp,
    settings.phone,
    'Hello, I would like to inquire about handcrafted Sai Baba Palkhis.'
  );

  return (
    <footer className="footer">
      <div className="footer-ornament">
        <div className="ornament-line"></div>
        <span className="ornament-symbol">🙏</span>
        <div className="ornament-line"></div>
      </div>
      
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-logo">
              <span className="footer-logo-icon">🙏</span>
              {settings.businessName || 'Sai Nilesh Steel'}
            </h3>
            <p className="footer-description">
              Crafting sacred Sai Baba Palkhis with devotion, precision, and decades of 
              traditional craftsmanship. Every Palkhi is a masterpiece of faith and artistry.
            </p>
            <div className="footer-social">
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link social-whatsapp"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
              <a href={`tel:${settings.phone}`} className="social-link social-phone" aria-label="Phone">
                <FaPhone />
              </a>
              <a href={`mailto:${settings.email}`} className="social-link social-email" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/palkhis">Our Palkhis</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Our Palkhis</h4>
            <ul className="footer-links">
              <li><Link to="/palkhis?category=traditional">Traditional Palkhi</Link></li>
              <li><Link to="/palkhis?category=premium">Premium Palkhi</Link></li>
              <li><Link to="/palkhis?category=temple">Temple Palkhi</Link></li>
              <li><Link to="/palkhis?category=custom">Custom Palkhi</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="footer-contact-items">
              <a href={`tel:${settings.phone}`} className="footer-contact-item">
                <FaPhone className="footer-contact-icon" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </a>
              <a href={`mailto:${settings.email}`} className="footer-contact-item">
                <FaEnvelope className="footer-contact-icon" />
                <span>{settings.email || 'info@sainileshsteel.com'}</span>
              </a>
              <div className="footer-contact-item">
                <FaMapMarkerAlt className="footer-contact-icon" />
                <span>{settings.address || 'Shirdi, Maharashtra'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} {settings.businessName || 'Sai Nilesh Steel'}. All Rights Reserved.</p>
          <p className="footer-made-with">
            Made with <FaHeart className="heart-icon" /> for Sai Baba devotees
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

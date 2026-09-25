import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { FiMenu, FiX, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();

  const whatsappUrl = getWhatsAppUrl(
    settings.whatsapp,
    settings.phone,
    'Hello, I would like to inquire about handcrafted Sai Baba Palkhis.'
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/palkhis', label: 'Palkhis' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container header-container">
        <Link to="/" className="header-logo">
          <div className="logo-icon">🙏</div>
          <div className="logo-text">
            <span className="logo-name">{settings.businessName || 'Sai Nilesh Steel'}</span>
            <span className="logo-tagline">Handcrafted Sai Baba Palkhis</span>
          </div>
        </Link>

        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
              >
                {link.label}
                {isActive(link.path) && <span className="nav-link-indicator"></span>}
              </Link>
            ))}
          </div>
          <div className="nav-actions-mobile">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
            >
              <FaWhatsapp /> WhatsApp
            </a>
            <a href={`tel:${settings.phone || '+919822054321'}`} className="btn btn-call btn-sm">
              <FiPhone /> Call Now
            </a>
          </div>
        </nav>

        <div className="header-actions">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
          >
            <FaWhatsapp /> WhatsApp
          </a>
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)} />}
    </header>
  );
};

export default Header;

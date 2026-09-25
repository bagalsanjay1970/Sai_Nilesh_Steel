import { useSettings } from '../../context/SettingsContext';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './FloatingButtons.css';

const FloatingButtons = () => {
  const { settings } = useSettings();
  const whatsappUrl = getWhatsAppUrl(
    settings.whatsapp,
    settings.phone,
    'Hello, I am interested in your handcrafted Sai Baba Palkhis. Please share more details.'
  );

  return (
    <div className="floating-buttons">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn floating-btn-whatsapp"
        aria-label="Contact on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>
      <a
        href={`tel:${settings.phone || '+919822054321'}`}
        className="floating-btn floating-btn-call"
        aria-label="Call us"
        title="Call Now"
      >
        <FaPhone />
      </a>
    </div>
  );
};

export default FloatingButtons;

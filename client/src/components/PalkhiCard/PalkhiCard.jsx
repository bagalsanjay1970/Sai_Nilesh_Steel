import { Link } from 'react-router-dom';
import { FaWhatsapp, FaRulerCombined, FaStar } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './PalkhiCard.css';

const PalkhiCard = ({ palkhi }) => {
  const { settings } = useSettings();
  
  const mainImage = palkhi.images && palkhi.images.length > 0 
    ? palkhi.images[0].url 
    : '/placeholder-palkhi.jpg';

  const whatsappMessage = `Hello, I am interested in "${palkhi.name}". Please provide the details and price.`;
  const whatsappUrl = getWhatsAppUrl(settings.whatsapp, settings.phone, whatsappMessage);

  return (
    <div className="palkhi-card card">
      <Link to={`/palkhis/${palkhi.id}`} className="palkhi-card-image-wrapper">
        <img src={mainImage} alt={palkhi.name} className="palkhi-card-image" loading="lazy" />
        {palkhi.featured && (
          <span className="palkhi-card-badge">
            <FaStar /> Featured
          </span>
        )}
        {palkhi.category && (
          <span className="palkhi-card-category">{palkhi.category}</span>
        )}
        <div className="palkhi-card-overlay">
          <span className="palkhi-card-view">View Details</span>
        </div>
      </Link>
      <div className="palkhi-card-content">
        <Link to={`/palkhis/${palkhi.id}`}>
          <h3 className="palkhi-card-name">{palkhi.name}</h3>
        </Link>
        <p className="palkhi-card-desc">{palkhi.shortDescription || palkhi.description?.substring(0, 100)}</p>
        
        <div className="palkhi-card-specs">
          {palkhi.material && (
            <span className="palkhi-card-spec">
              <span className="spec-label">Material:</span> {palkhi.material}
            </span>
          )}
          {palkhi.dimensions && (
            <span className="palkhi-card-spec">
              <FaRulerCombined /> {palkhi.dimensions}
            </span>
          )}
        </div>

        <div className="palkhi-card-footer">
          <div className="palkhi-card-price">
            {palkhi.price ? `₹${Number(palkhi.price).toLocaleString('en-IN')}` : 'Contact for Price'}
          </div>
          <div className="palkhi-card-actions">
            <Link to={`/palkhis/${palkhi.id}`} className="btn btn-outline btn-sm">
              View
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
              aria-label="Enquire on WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalkhiCard;

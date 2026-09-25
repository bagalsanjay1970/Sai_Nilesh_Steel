import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPalkhi } from '../../firebase/services';
import { useSettings } from '../../context/SettingsContext';
import {
  FaWhatsapp, FaPhone, FaChevronLeft, FaChevronRight,
  FaRulerCombined, FaWeight, FaPalette, FaCog, FaCheckCircle,
  FaArrowLeft, FaStar, FaTag
} from 'react-icons/fa';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './PalkhiDetail.css';

const PalkhiDetail = () => {
  const { id } = useParams();
  const { settings } = useSettings();
  const [palkhi, setPalkhi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchPalkhi = async () => {
      try {
        const data = await getPalkhi(id);
        setPalkhi(data);
      } catch (error) {
        console.error('Error fetching palkhi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPalkhi();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="loading-page" style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
        <div className="spinner"></div>
        <p>Loading Palkhi details...</p>
      </div>
    );
  }

  if (!palkhi) {
    return (
      <div className="empty-state" style={{ paddingTop: 'calc(var(--header-height) + 4rem)' }}>
        <div className="empty-state-icon">🙏</div>
        <h3 className="empty-state-title">Palkhi Not Found</h3>
        <p className="empty-state-text">The Palkhi you're looking for doesn't exist or has been removed.</p>
        <Link to="/palkhis" className="btn btn-primary">Browse All Palkhis</Link>
      </div>
    );
  }

  const images = palkhi.images && palkhi.images.length > 0
    ? palkhi.images
    : [{ url: '/placeholder-palkhi.jpg', alt: palkhi.name }];

  const nextImage = () => setCurrentImage(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage(prev => (prev - 1 + images.length) % images.length);

  const whatsappMessage = encodeURIComponent(
    `Hello, I am interested in "${palkhi.name}". Please provide the details and price.`
  );

  const specs = [
    { icon: <FaRulerCombined />, label: 'Dimensions', value: palkhi.dimensions },
    { icon: <FaWeight />, label: 'Weight', value: palkhi.weight },
    { icon: <FaCog />, label: 'Material', value: palkhi.material },
    { icon: <FaPalette />, label: 'Finish', value: palkhi.finish },
    { icon: <FaTag />, label: 'Category', value: palkhi.category },
  ].filter(spec => spec.value);

  return (
    <div className="palkhi-detail-page page-enter">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <div className="container">
          <Link to="/palkhis" className="breadcrumb-back">
            <FaArrowLeft /> Back to Palkhis
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          {/* Image Gallery */}
          <div className="detail-gallery">
            <div className="detail-main-image">
              <img
                src={images[currentImage]?.url}
                alt={images[currentImage]?.alt || palkhi.name}
                className={`main-image ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
              />
              {palkhi.featured && (
                <span className="detail-badge">
                  <FaStar /> Featured
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button className="gallery-nav gallery-prev" onClick={prevImage}>
                    <FaChevronLeft />
                  </button>
                  <button className="gallery-nav gallery-next" onClick={nextImage}>
                    <FaChevronRight />
                  </button>
                </>
              )}
              <div className="image-counter">
                {currentImage + 1} / {images.length}
              </div>
            </div>
            {images.length > 1 && (
              <div className="detail-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === currentImage ? 'active' : ''}`}
                    onClick={() => { setCurrentImage(index); setImageLoaded(false); }}
                  >
                    <img src={img.url} alt={`${palkhi.name} - ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="detail-info">
            {palkhi.category && (
              <span className="detail-category">{palkhi.category}</span>
            )}
            <h1 className="detail-name">{palkhi.name}</h1>

            <div className="detail-price-section">
              <span className="detail-price">
                {palkhi.price ? `₹${Number(palkhi.price).toLocaleString('en-IN')}` : 'Contact for Price'}
              </span>
              <span className={`detail-availability ${palkhi.availability === 'In Stock' ? 'in-stock' : 'made-to-order'}`}>
                <FaCheckCircle /> {palkhi.availability || 'Made to Order'}
              </span>
            </div>

            <p className="detail-description">{palkhi.description}</p>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="detail-specs">
                <h3 className="detail-section-title">Specifications</h3>
                <div className="specs-grid">
                  {specs.map((spec, index) => (
                    <div key={index} className="spec-item">
                      <span className="spec-icon">{spec.icon}</span>
                      <div>
                        <span className="spec-label">{spec.label}</span>
                        <span className="spec-value">{spec.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Options */}
            {palkhi.customizationOptions && (
              <div className="detail-customization">
                <h3 className="detail-section-title">Customization Options</h3>
                <p>{palkhi.customizationOptions}</p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="detail-actions">
              <a
                href={getWhatsAppUrl(settings.whatsapp, settings.phone, `Hello, I am interested in "${palkhi.name}". Please provide the details and price.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <FaWhatsapp /> Enquire on WhatsApp
              </a>
              <a href={`tel:${settings.phone || '+919226763820'}`} className="btn btn-call btn-lg">
                <FaPhone /> Call Now
              </a>
            </div>

            {/* Trust Signals */}
            <div className="detail-trust">
              <div className="trust-item">
                <FaCheckCircle /> Premium Quality Materials
              </div>
              <div className="trust-item">
                <FaCheckCircle /> Customization Available
              </div>
              <div className="trust-item">
                <FaCheckCircle /> Safe Nationwide Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalkhiDetail;

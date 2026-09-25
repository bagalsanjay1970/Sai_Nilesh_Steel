import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { getPalkhis } from '../../firebase/services';
import PalkhiCard from '../../components/PalkhiCard/PalkhiCard';
import { 
  FaWhatsapp, FaPhone, FaStar, FaShieldAlt, FaCog, FaTruck, 
  FaHandshake, FaPalette, FaTools, FaCheckCircle, FaChevronLeft, 
  FaChevronRight, FaAward, FaGem, FaHeart
} from 'react-icons/fa';
import { GiAnvil } from 'react-icons/gi';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './Home.css';

const Home = () => {
  const { settings } = useSettings();
  const [featuredPalkhis, setFeaturedPalkhis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = settings.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : [
      { url: '/images/sai-baba-darbar.jpg', alt: 'Shri Sai Baba in Divine Darbar' },
      { url: '/images/sai-palkhi-procession.jpg', alt: 'Handcrafted Sai Baba Palkhi Grand Procession' },
      { url: '/images/sai-baba-blessing.jpg', alt: 'Sai Baba Divine Abhaya Mudra Blessing' },
    ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getPalkhis({ featured: true });
        setFeaturedPalkhis(data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured palkhis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length);

  const stats = settings.stats || { yearsExperience: 25, palkhisCrafted: 500, happyCustomers: 350 };

  const whyChooseUs = [
    { icon: <FaGem />, title: 'Premium Craftsmanship', description: 'Every Palkhi is handcrafted with meticulous attention to detail using the finest materials and traditional techniques.' },
    { icon: <FaHeart />, title: 'Made with Devotion', description: 'Each creation carries the essence of devotion to Sai Baba, reflecting spiritual significance in every element.' },
    { icon: <FaPalette />, title: 'Custom Designs', description: 'We create bespoke Palkhis tailored to your exact vision, size requirements, and design preferences.' },
    { icon: <FaShieldAlt />, title: 'Quality Guaranteed', description: 'Superior materials and rigorous quality checks ensure every Palkhi stands the test of time.' },
    { icon: <FaTruck />, title: 'Safe Delivery', description: 'Professional packaging and careful delivery to your doorstep anywhere across India.' },
    { icon: <FaHandshake />, title: 'Trusted Since Years', description: `Over ${stats.yearsExperience}+ years of experience serving temples, trusts, and Sai Baba devotees nationwide.` },
  ];

  const processSteps = [
    { step: '01', title: 'Design', description: 'Custom design consultation and sacred geometry planning', icon: <FaPalette /> },
    { step: '02', title: 'Material Selection', description: 'Finest stainless steel and premium materials sourced', icon: <FaGem /> },
    { step: '03', title: 'Construction', description: 'Expert welding and structural fabrication', icon: <GiAnvil /> },
    { step: '04', title: 'Detailed Crafting', description: 'Intricate ornamentation and devotional motifs', icon: <FaTools /> },
    { step: '05', title: 'Finishing', description: 'Premium polish, coating, and surface treatment', icon: <FaStar /> },
    { step: '06', title: 'Quality Check', description: 'Rigorous inspection for perfection', icon: <FaCheckCircle /> },
    { step: '07', title: 'Delivery', description: 'Safe packaging and doorstep delivery', icon: <FaTruck /> },
  ];

  return (
    <div className="home-page page-enter">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-slider">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img.url})` }}
            />
          ))}
          <div className="hero-overlay" />
        </div>

        {heroImages.length > 1 && (
          <>
            <button className="hero-nav hero-nav-prev" onClick={prevSlide} aria-label="Previous slide">
              <FaChevronLeft />
            </button>
            <button className="hero-nav hero-nav-next" onClick={nextSlide} aria-label="Next slide">
              <FaChevronRight />
            </button>
            <div className="hero-dots">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="hero-content">
          <div className="hero-spiritual-badge">
            <img src="/images/sai-baba-portrait.jpg" alt="Shirdi Sai Baba" className="hero-baba-avatar" />
            <div className="hero-spiritual-text">
              <span className="hero-mantra">॥ ॐ श्री साईंनाथाय नमः ॥</span>
              <span className="hero-subtext">Shraddha & Saburi • Faith & Devotion</span>
            </div>
          </div>
          <h1 className="hero-title">
            {settings.heroHeading || 'Handcrafted Sai Baba Palkhis — Made With Devotion & Precision'}
          </h1>
          <p className="hero-description">
            {settings.heroDescription || 'Premium handcrafted Sai Baba Palkhis designed and built with decades of experience, traditional craftsmanship, and unwavering devotion.'}
          </p>
          <div className="hero-actions">
            <Link to="/palkhis" className="btn btn-primary btn-lg">
              View Palkhis
            </Link>
            <a
              href={getWhatsAppUrl(settings.whatsapp, settings.phone, 'Hello, I am interested in your handcrafted Sai Baba Palkhis. Please share more details.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              <FaWhatsapp /> Enquire on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon"><FaAward /></div>
              <div className="stat-number">{stats.yearsExperience}+</div>
              <div className="stat-label">Years of Experience</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-icon"><GiAnvil /></div>
              <div className="stat-number">{stats.palkhisCrafted}+</div>
              <div className="stat-label">Palkhis Crafted</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-icon"><FaHandshake /></div>
              <div className="stat-number">{stats.happyCustomers}+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Palkhis */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <FaStar /> Our Collection
            </div>
            <h2 className="section-title">
              Featured <span>Sai Baba Palkhis</span>
            </h2>
            <p className="section-subtitle">
              Explore our finest handcrafted Palkhis, each one a masterpiece of devotion and artistry
            </p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : featuredPalkhis.length > 0 ? (
            <div className="palkhis-grid">
              {featuredPalkhis.map((palkhi, index) => (
                <div key={palkhi.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PalkhiCard palkhi={palkhi} />
                </div>
              ))}
            </div>
          ) : (
            <div className="featured-empty">
              <p>Our featured collection is being updated. Please visit our full catalog.</p>
            </div>
          )}

          <div className="section-cta">
            <Link to="/palkhis" className="btn btn-outline btn-lg">
              View All Palkhis →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <FaShieldAlt /> Why Choose Us
            </div>
            <h2 className="section-title">
              Why Devotees <span>Trust Us</span>
            </h2>
            <p className="section-subtitle">
              Decades of expertise, unwavering commitment to quality, and deep devotion to Sai Baba
            </p>
          </div>

          <div className="why-grid">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="why-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="why-card-icon">{item.icon}</div>
                <h3 className="why-card-title">{item.title}</h3>
                <p className="why-card-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section process-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <FaCog /> Our Process
            </div>
            <h2 className="section-title">
              How We Craft Your <span>Palkhi</span>
            </h2>
            <p className="section-subtitle">
              Every Palkhi goes through a meticulous 7-step process ensuring perfection at every stage
            </p>
          </div>

          <div className="process-timeline">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="process-step-number">{step.step}</div>
                <div className="process-step-icon">{step.icon}</div>
                <h4 className="process-step-title">{step.title}</h4>
                <p className="process-step-desc">{step.description}</p>
                {index < processSteps.length - 1 && <div className="process-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Palkhi CTA */}
      <section className="section custom-cta-section">
        <div className="container">
          <div className="custom-cta-card">
            <div className="custom-cta-content">
              <div className="section-badge">
                <FaPalette /> Custom Design
              </div>
              <h2 className="custom-cta-title">Need a Custom Sai Baba Palkhi?</h2>
              <p className="custom-cta-description">
                Have a specific design, size, or style in mind? We specialize in creating bespoke Palkhis 
                that perfectly match your vision. Share your requirements and let us bring your dream Palkhi to life.
              </p>
              <div className="custom-cta-actions">
                <Link to="/custom-request" className="btn btn-primary btn-lg">
                  Request Custom Palkhi
                </Link>
                <a
                  href={getWhatsAppUrl(settings.whatsapp, settings.phone, 'Hello, I want to discuss a custom Sai Baba Palkhi design.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                >
                  <FaWhatsapp /> Discuss on WhatsApp
                </a>
              </div>
            </div>
            <div className="custom-cta-decoration">
              <div className="cta-baba-card">
                <div className="cta-baba-frame">
                  <img src="/images/sai-baba-portrait.jpg" alt="Shirdi Sai Baba" className="cta-baba-img" />
                </div>
                <div className="cta-baba-caption">
                  <span className="cta-baba-tag">॥ ॐ साईं राम ॥</span>
                  <p className="cta-baba-blessing">"Dedicated to Baba's Sacred Service"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section final-cta-section">
        <div className="container">
          <div className="final-cta">
            <h2 className="final-cta-title">Ready to Get Your Sacred Sai Baba Palkhi?</h2>
            <p className="final-cta-text">Contact us today for inquiries, pricing, and customization options</p>
            <div className="final-cta-actions">
              <a
                href={getWhatsAppUrl(settings.whatsapp, settings.phone, 'Hello, I want to enquire about handcrafted Sai Baba Palkhis.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <FaWhatsapp /> WhatsApp Us
              </a>
              <a href={`tel:${settings.phone || '+919876543210'}`} className="btn btn-call btn-lg">
                <FaPhone /> Call Now
              </a>
              <Link to="/contact" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                Contact Page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

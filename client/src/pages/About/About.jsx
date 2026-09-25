import { useSettings } from '../../context/SettingsContext';
import { 
  FaHeart, FaShieldAlt, FaGem, FaStar, FaTruck, FaPalette, FaTools,
  FaCheckCircle, FaCog, FaAward, FaHandshake
} from 'react-icons/fa';
import { GiAnvil } from 'react-icons/gi';
import './About.css';

const About = () => {
  const { settings } = useSettings();

  const processSteps = [
    { icon: <FaPalette />, title: 'Design', description: 'Custom design consultation, blueprint creation, and sacred geometry planning' },
    { icon: <FaGem />, title: 'Material Selection', description: 'Finest stainless steel and premium materials carefully sourced and inspected' },
    { icon: <GiAnvil />, title: 'Construction', description: 'Expert welding, shaping, and structural fabrication by master craftsmen' },
    { icon: <FaTools />, title: 'Detailed Crafting', description: 'Intricate ornamentation, devotional motifs, and artistic embellishments' },
    { icon: <FaStar />, title: 'Finishing', description: 'Premium polish, coating, gold plating, and surface treatments' },
    { icon: <FaCheckCircle />, title: 'Quality Check', description: 'Rigorous multi-point inspection ensuring every detail meets our high standards' },
    { icon: <FaTruck />, title: 'Delivery', description: 'Professional packaging and careful doorstep delivery anywhere in India' },
  ];

  const values = [
    { icon: <FaHeart />, title: 'Devotion', description: 'Every Palkhi is crafted with deep devotion to Sai Baba' },
    { icon: <FaGem />, title: 'Quality', description: 'Only premium materials and finest craftsmanship' },
    { icon: <FaHandshake />, title: 'Trust', description: 'Decades of trust from temples and devotees' },
    { icon: <FaPalette />, title: 'Customization', description: 'Bespoke designs tailored to your vision' },
  ];

  return (
    <div className="about-page page-enter">
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container page-hero-content">
          <div className="section-badge"><FaHeart /> Our Story</div>
          <h1 className="page-hero-title">About {settings.businessName || 'Sai Nilesh Steel'}</h1>
          <p className="page-hero-subtitle">
            Crafting sacred Sai Baba Palkhis with devotion, precision, and generations of expertise
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story-content">
              <div className="section-badge"><FaAward /> Our Journey</div>
              <h2 className="section-title">A Legacy of <span>Devotion & Craftsmanship</span></h2>
              <p>
                {settings.businessName || 'Sai Nilesh Steel'} is a specialized workshop dedicated exclusively 
                to crafting handmade Sai Baba Palkhis. Founded with a deep devotion to Sai Baba and a passion 
                for traditional metalcraft, we have spent over {settings.stats?.yearsExperience || 25} years 
                perfecting the art of Palkhi making.
              </p>
              <p>
                Our journey began with a simple belief — every Sai Baba Palkhi should be a masterpiece that 
                reflects the divinity of Baba and the devotion of His followers. From humble beginnings in 
                a small workshop, we have grown to become one of the most trusted names in Palkhi craftsmanship, 
                serving temples, trusts, and individual devotees across India.
              </p>
              <p>
                Each Palkhi that leaves our workshop carries the essence of traditional Indian artistry 
                combined with modern construction techniques. We use the finest stainless steel, premium 
                finishes, and intricate detailing to create Palkhis that are not just structures, but 
                sacred vessels of devotion.
              </p>
            </div>
            <div className="about-story-visual">
              <div className="about-baba-image-wrapper">
                <img 
                  src="/images/sai-palkhi-procession.jpg" 
                  alt="Sacred Sai Baba Palkhi Procession" 
                  className="about-baba-image" 
                />
                <div className="about-baba-badge">
                  <span className="about-baba-badge-icon">🙏</span>
                  <div className="about-baba-badge-text">
                    <strong>श्रद्धा व सबुरी</strong>
                    <small>Handcrafted in Maharashtra</small>
                  </div>
                </div>
              </div>
              <div className="story-visual-card">
                <div className="story-stat">
                  <span className="story-stat-number">{settings.stats?.yearsExperience || 25}+</span>
                  <span className="story-stat-label">Years of Mastery</span>
                </div>
                <div className="story-stat">
                  <span className="story-stat-number">{settings.stats?.palkhisCrafted || 500}+</span>
                  <span className="story-stat-label">Palkhis Crafted</span>
                </div>
                <div className="story-stat">
                  <span className="story-stat-number">{settings.stats?.happyCustomers || 350}+</span>
                  <span className="story-stat-label">Happy Devotees</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge"><FaShieldAlt /> Our Values</div>
            <h2 className="section-title">What We <span>Stand For</span></h2>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="section process-detail-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge"><FaCog /> Our Process</div>
            <h2 className="section-title">The Art of <span>Palkhi Making</span></h2>
            <p className="section-subtitle">
              Every Palkhi goes through a meticulous multi-step process, ensuring perfection at every stage
            </p>
          </div>

          <div className="process-detail-grid">
            {processSteps.map((step, index) => (
              <div key={index} className="process-detail-card animate-fade-in-up" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="process-detail-number">0{index + 1}</div>
                <div className="process-detail-icon">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="section commitment-section">
        <div className="container">
          <div className="commitment-card">
            <h2>Our Commitment</h2>
            <p>
              At {settings.businessName || 'Sai Nilesh Steel'}, every Palkhi is more than a product — 
              it's a sacred offering. We are committed to delivering excellence in every aspect: from the 
              first design sketch to the final polish. Our dedication to Sai Baba and His devotees drives 
              us to create Palkhis that inspire awe, devotion, and reverence.
            </p>
            <div className="commitment-points">
              <div className="commitment-point"><FaCheckCircle /> 100% Handcrafted</div>
              <div className="commitment-point"><FaCheckCircle /> Premium Materials Only</div>
              <div className="commitment-point"><FaCheckCircle /> Customization Available</div>
              <div className="commitment-point"><FaCheckCircle /> Nationwide Delivery</div>
              <div className="commitment-point"><FaCheckCircle /> After-Sales Support</div>
              <div className="commitment-point"><FaCheckCircle /> Timely Completion</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

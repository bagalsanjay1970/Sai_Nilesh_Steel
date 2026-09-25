import { useState, useEffect } from 'react';
import { getGalleryItems, getCategories } from '../../firebase/services';
import { FaCamera, FaTimes } from 'react-icons/fa';
import './Gallery.css';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryData, categoriesData] = await Promise.all([
          getGalleryItems(),
          getCategories()
        ]);
        setItems(galleryData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="gallery-page page-enter">
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container page-hero-content">
          <div className="section-badge"><FaCamera /> Gallery</div>
          <h1 className="page-hero-title">Palkhi Gallery</h1>
          <p className="page-hero-subtitle">
            A visual journey through our handcrafted Sai Baba Palkhis
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="gallery-filters">
            <button
              className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.name?.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.name?.toLowerCase())}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-page">
              <div className="spinner"></div>
              <p>Loading gallery...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="gallery-grid">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="gallery-item animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setLightbox(item)}
                >
                  <img src={item.imageUrl} alt={item.title} loading="lazy" />
                  <div className="gallery-item-overlay">
                    <h4>{item.title}</h4>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📷</div>
              <h3 className="empty-state-title">Gallery Coming Soon</h3>
              <p className="empty-state-text">We're updating our gallery with the latest Palkhi photographs.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            <FaTimes />
          </button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={lightbox.imageUrl} alt={lightbox.title} />
            <div className="lightbox-info">
              <h3>{lightbox.title}</h3>
              {lightbox.description && <p>{lightbox.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

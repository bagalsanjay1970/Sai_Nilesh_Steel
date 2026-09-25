import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPalkhis, getCategories } from '../../firebase/services';
import PalkhiCard from '../../components/PalkhiCard/PalkhiCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import './Palkhis.css';

const Palkhis = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [palkhis, setPalkhis] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [palkhisData, categoriesData] = await Promise.all([
          getPalkhis(),
          getCategories()
        ]);
        setPalkhis(palkhisData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const filteredPalkhis = palkhis.filter(palkhi => {
    const matchesSearch = !searchTerm || 
      palkhi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      palkhi.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      palkhi.material?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || 
      palkhi.category?.toLowerCase() === activeCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="palkhis-page page-enter">
      {/* Page Header */}
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container page-hero-content">
          <div className="section-badge">
            <FaStar /> Our Collection
          </div>
          <h1 className="page-hero-title">Sai Baba Palkhis</h1>
          <p className="page-hero-subtitle">
            Explore our complete collection of handcrafted Sai Baba Palkhis — each one a unique masterpiece of devotion
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-bar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search Palkhis by name, material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="category-filters">
              <FiFilter className="filter-icon" />
              <button
                className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-btn ${activeCategory === cat.name?.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.name?.toLowerCase())}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Palkhis Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-page">
              <div className="spinner"></div>
              <p>Loading our Palkhi collection...</p>
            </div>
          ) : filteredPalkhis.length > 0 ? (
            <>
              <p className="results-count">{filteredPalkhis.length} Palkhi{filteredPalkhis.length !== 1 ? 's' : ''} found</p>
              <div className="palkhis-grid">
                {filteredPalkhis.map((palkhi, index) => (
                  <div key={palkhi.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <PalkhiCard palkhi={palkhi} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🙏</div>
              <h3 className="empty-state-title">No Palkhis Found</h3>
              <p className="empty-state-text">
                {searchTerm 
                  ? `No palkhis match "${searchTerm}". Try a different search term.`
                  : 'No palkhis available in this category yet. Please check back soon.'
                }
              </p>
              <button className="btn btn-outline" onClick={() => { setSearchTerm(''); handleCategoryChange('all'); }}>
                View All Palkhis
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Palkhis;

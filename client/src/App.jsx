import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FloatingButtons from './components/FloatingButtons/FloatingButtons';

// Public Pages
import Home from './pages/Home/Home';
import Palkhis from './pages/Palkhis/Palkhis';
import PalkhiDetail from './pages/PalkhiDetail/PalkhiDetail';
import Gallery from './pages/Gallery/Gallery';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import CustomRequest from './pages/CustomRequest/CustomRequest';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminPalkhis from './pages/Admin/AdminPalkhis';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminGallery from './pages/Admin/AdminGallery';
import AdminInquiries from './pages/Admin/AdminInquiries';
import AdminCustomRequests from './pages/Admin/AdminCustomRequests';
import AdminSettings from './pages/Admin/AdminSettings';

// Scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
};

// Public Layout
const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main style={{ minHeight: '60vh', paddingTop: 'var(--header-height)' }}>
      {children}
    </main>
    <Footer />
    <FloatingButtons />
  </>
);

// Home doesn't need paddingTop since hero is full-screen
const HomeLayout = ({ children }) => (
  <>
    <Header />
    <main>
      {children}
    </main>
    <Footer />
    <FloatingButtons />
  </>
);

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#3A2A1A',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(58, 42, 26, 0.12)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
              },
              success: {
                iconTheme: { primary: '#2D7A4F', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#C0392B', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeLayout><Home /></HomeLayout>} />
            <Route path="/palkhis" element={<PublicLayout><Palkhis /></PublicLayout>} />
            <Route path="/palkhis/:id" element={<PublicLayout><PalkhiDetail /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/custom-request" element={<PublicLayout><CustomRequest /></PublicLayout>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="palkhis" element={<AdminPalkhis />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="custom-requests" element={<AdminCustomRequests />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

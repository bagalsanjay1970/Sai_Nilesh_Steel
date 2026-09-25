import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../firebase/services';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    businessName: 'Sai Nilesh Steel',
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    businessHours: '',
    googleMapsLink: '',
    heroHeading: '',
    heroDescription: '',
    heroImages: [],
    stats: {
      yearsExperience: 0,
      palkhisCrafted: 0,
      happyCustomers: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

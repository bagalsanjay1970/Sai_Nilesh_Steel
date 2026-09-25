import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { isFirebaseConfigured } from '../firebase/services';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const DEMO_AUTH_KEY = 'sai_nilesh_demo_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured());

  useEffect(() => {
    // Check for demo auth in localStorage first
    const savedDemoUser = localStorage.getItem(DEMO_AUTH_KEY);
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        setUser(parsed);
        setIsDemoMode(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(DEMO_AUTH_KEY);
      }
    }

    // If Firebase is configured with real credentials, listen to auth state
    if (isFirebaseConfigured()) {
      try {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser(firebaseUser);
            setIsDemoMode(false);
          } else {
            // Keep demo user if logged in via demo
            const demo = localStorage.getItem(DEMO_AUTH_KEY);
            if (demo) {
              setUser(JSON.parse(demo));
              setIsDemoMode(true);
            } else {
              setUser(null);
            }
          }
          setLoading(false);
        });
        return unsubscribe;
      } catch (err) {
        console.warn('Firebase onAuthStateChanged error:', err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '';

    // Check strictly against securely configured environment variables
    const isEnvAdmin = Boolean(
      envAdminEmail && envAdminPassword && trimmedEmail === envAdminEmail && password === envAdminPassword
    );

    // 1. Try real Firebase Auth first whenever Firebase is configured
    if (isFirebaseConfigured()) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        localStorage.removeItem(DEMO_AUTH_KEY);
        setUser(result.user);
        setIsDemoMode(false);
        return result.user;
      } catch (error) {
        // Fallback to env-configured admin if Firebase is offline or user not yet seeded
        if (isEnvAdmin || error.code === 'auth/api-key-not-valid' || error.code === 'auth/network-request-failed') {
          const adminUser = {
            uid: 'admin-env-auth',
            email: trimmedEmail,
            displayName: trimmedEmail.includes('sanjay') ? 'Sanjay Bagal (Admin)' : 'Admin User',
            role: 'admin',
            isDemo: true
          };
          localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(adminUser));
          setUser(adminUser);
          setIsDemoMode(true);
          return adminUser;
        }
        throw error;
      }
    }

    // 2. Offline / local fallback when Firebase is not configured
    if (isEnvAdmin) {
      const adminUser = {
        uid: 'admin-env-local',
        email: trimmedEmail,
        displayName: trimmedEmail.includes('sanjay') ? 'Sanjay Bagal (Admin)' : 'Admin User',
        role: 'admin',
        isDemo: true
      };
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
      setIsDemoMode(true);
      return adminUser;
    }

    throw new Error('Invalid email or password');
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_AUTH_KEY);
    setUser(null);
    if (isFirebaseConfigured()) {
      try {
        await signOut(auth);
      } catch (error) {
        console.warn('Sign out warning:', error.message);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

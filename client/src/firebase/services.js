import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage, auth as clientAuth } from './firebase';
import firebaseConfig from './config';
import {
  sampleCategories,
  samplePalkhis,
  sampleGallery,
  sampleInquiries,
  sampleCustomRequests,
  sampleSettings
} from '../data/sampleData';

// API base URL for Render deployment (or empty string for local/Vercel proxy)
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Helper to determine if real Firebase credentials are provided
export const isFirebaseConfigured = () => {
  const key = firebaseConfig.apiKey;
  return Boolean(
    key &&
    key !== 'YOUR_API_KEY' &&
    key !== 'your_api_key_here' &&
    !key.includes('your_') &&
    firebaseConfig.projectId !== 'your_project_id'
  );
};

// Retrieve live Firebase ID Token for authenticated server requests
export const getAuthToken = async () => {
  try {
    if (clientAuth?.currentUser) {
      return await clientAuth.currentUser.getIdToken();
    }
  } catch (e) {
    console.warn('Error fetching Firebase ID token:', e);
  }
  return 'demo-admin-token';
};

// ============ LOCAL STORAGE BACKED STORE (OFFLINE / DEV MODE) ============
const STORAGE_KEYS = {
  PALKHIS: 'sns_palkhis_data',
  CATEGORIES: 'sns_categories_data',
  GALLERY: 'sns_gallery_data',
  INQUIRIES: 'sns_inquiries_data',
  CUSTOM_REQUESTS: 'sns_custom_requests_data',
  SETTINGS: 'sns_settings_data',
  DELETED_PALKHIS: 'sns_deleted_palkhi_ids',
  DELETED_CATEGORIES: 'sns_deleted_category_ids',
  DELETED_GALLERY: 'sns_deleted_gallery_ids',
  DELETED_INQUIRIES: 'sns_deleted_inquiry_ids',
  DELETED_CUSTOM_REQUESTS: 'sns_deleted_custom_request_ids'
};

// Helper to safely parse dates/timestamps
const parseTime = (val) => {
  if (!val) return 0;
  if (val.seconds) return val.seconds * 1000;
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
};

export const clearAllDummyData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.PALKHIS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.GALLERY);
    localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_PALKHIS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.DELETED_GALLERY);
    localStorage.removeItem(STORAGE_KEYS.DELETED_INQUIRIES);
    localStorage.removeItem(STORAGE_KEYS.DELETED_CUSTOM_REQUESTS);
  }
};

const getDeletedIds = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch (e) {
    return new Set();
  }
};

const addDeletedId = (key, id) => {
  try {
    const ids = getDeletedIds(key);
    ids.add(String(id));
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.warn(`Error updating deleted IDs for ${key}:`, e);
  }
};

const removeDeletedId = (key, id) => {
  try {
    const ids = getDeletedIds(key);
    ids.delete(String(id));
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch (e) {}
};

const getLocalData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage, using fallback:`, e);
    return fallback;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving ${key} to localStorage:`, e);
  }
};

// ============ PALKHIS ============
export const getPalkhis = async (filters = {}) => {
  const deletedIds = getDeletedIds(STORAGE_KEYS.DELETED_PALKHIS);
  if (isFirebaseConfigured()) {
    try {
      let snapshot = null;

      // 1. Try querying enabled palkhis without composite orderBy (avoids index requirement)
      try {
        const q = query(collection(db, 'palkhis'), where('enabled', '==', true));
        snapshot = await getDocs(q);
      } catch (qErr) {
        console.warn('Firestore enabled query notice, trying raw collection:', qErr.message);
      }

      // 2. Fallback to raw collection fetch if query returned empty or failed
      if (!snapshot || snapshot.empty) {
        try {
          snapshot = await getDocs(collection(db, 'palkhis'));
        } catch (rawErr) {
          console.warn('Firestore raw collection notice:', rawErr.message);
        }
      }

      if (snapshot && !snapshot.empty) {
        let list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => !deletedIds.has(String(p.id)) && p.enabled !== false);

        // Sort descending by createdAt in memory
        list.sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt));

        // Always cache live Firestore data to localStorage so cold-starts/offline sessions are populated
        if (list.length > 0) {
          setLocalData(STORAGE_KEYS.PALKHIS, list);
        }

        // Apply filters in memory
        if (filters.featured) {
          list = list.filter(p => Boolean(p.featured));
        }
        if (filters.category && filters.category !== 'all') {
          list = list.filter(p => p.category?.toLowerCase() === filters.category.toLowerCase());
        }

        return list;
      }
    } catch (error) {
      console.warn('Firestore getPalkhis error, falling back to local store:', error.message);
    }
  }

  // Local fallback (populated from previous fetch, admin edits, or defaults)
  const all = getLocalData(STORAGE_KEYS.PALKHIS, samplePalkhis).filter(p => !deletedIds.has(String(p.id)));
  return all.filter(p => {
    if (p.enabled === false) return false;
    if (filters.featured && !p.featured) return false;
    if (filters.category && filters.category !== 'all' && p.category?.toLowerCase() !== filters.category.toLowerCase()) return false;
    return true;
  });
};

export const getAllPalkhis = async () => {
  const deletedIds = getDeletedIds(STORAGE_KEYS.DELETED_PALKHIS);
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await getDocs(collection(db, 'palkhis'));
      if (snapshot && !snapshot.empty) {
        let list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => !deletedIds.has(String(p.id)));

        list.sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt));

        if (list.length > 0) {
          setLocalData(STORAGE_KEYS.PALKHIS, list);
        }
        return list;
      }
    } catch (error) {
      console.warn('Firestore getAllPalkhis error, falling back to local store:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.PALKHIS, samplePalkhis);
  return all.filter(p => !deletedIds.has(String(p.id)));
};

export const getPalkhi = async (id) => {
  const deletedIds = getDeletedIds(STORAGE_KEYS.DELETED_PALKHIS);
  if (deletedIds.has(String(id))) return null;

  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'palkhis', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (error) {
      console.warn('Firestore getPalkhi error, falling back to local store:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.PALKHIS, samplePalkhis);
  return all.find(p => String(p.id) === String(id) && !deletedIds.has(String(p.id))) || null;
};

export const addPalkhi = async (palkhiData) => {
  let createdId = null;

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'palkhis'), {
        ...palkhiData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      createdId = docRef.id;
    } catch (error) {
      console.warn('Firestore addPalkhi error, saving to local store:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.PALKHIS, samplePalkhis);
  const id = createdId || 'palkhi-' + Date.now();
  removeDeletedId(STORAGE_KEYS.DELETED_PALKHIS, id);

  const newPalkhi = {
    ...palkhiData,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  setLocalData(STORAGE_KEYS.PALKHIS, [newPalkhi, ...all.filter(p => String(p.id) !== String(id))]);

  // Sync to Express backend API if running
  try {
    const token = await getAuthToken();
    fetch(`${API_BASE}/api/palkhis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newPalkhi)
    }).catch(() => {});
  } catch (e) {}

  return id;
};

export const updatePalkhi = async (id, palkhiData) => {
  removeDeletedId(STORAGE_KEYS.DELETED_PALKHIS, id);
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'palkhis', id);
      await updateDoc(docRef, {
        ...palkhiData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Firestore updatePalkhi error, updating local store:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.PALKHIS, samplePalkhis);
  const updated = all.map(p => (String(p.id) === String(id) ? { ...p, ...palkhiData, updatedAt: new Date().toISOString() } : p));
  setLocalData(STORAGE_KEYS.PALKHIS, updated);

  try {
    const token = await getAuthToken();
    fetch(`${API_BASE}/api/palkhis/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(palkhiData)
    }).catch(() => {});
  } catch (e) {}
};

export const deletePalkhi = async (id) => {
  // 1. Mark as permanently deleted in deleted IDs registry
  addDeletedId(STORAGE_KEYS.DELETED_PALKHIS, id);

  // 2. Remove from local store immediately
  const all = getLocalData(STORAGE_KEYS.PALKHIS, samplePalkhis);
  const filtered = all.filter(p => String(p.id) !== String(id));
  setLocalData(STORAGE_KEYS.PALKHIS, filtered);

  // 3. Attempt Firestore deletion
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'palkhis', id));
    } catch (error) {
      console.warn('Firestore deletePalkhi notice:', error.message);
    }
  }

  // 4. Sync with Express backend API
  try {
    const token = await getAuthToken();
    await fetch(`${API_BASE}/api/palkhis/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});
  } catch (e) {}
};

// ============ CATEGORIES ============
export const getCategories = async (enabledOnly = true) => {
  const deletedIds = getDeletedIds(STORAGE_KEYS.DELETED_CATEGORIES);
  if (isFirebaseConfigured()) {
    try {
      let snapshot = null;
      try {
        if (enabledOnly) {
          const q = query(collection(db, 'categories'), where('enabled', '==', true));
          snapshot = await getDocs(q);
        } else {
          snapshot = await getDocs(collection(db, 'categories'));
        }
      } catch (qErr) {
        snapshot = await getDocs(collection(db, 'categories'));
      }

      if (!snapshot || snapshot.empty) {
        try {
          snapshot = await getDocs(collection(db, 'categories'));
        } catch (rawErr) {}
      }

      if (snapshot && !snapshot.empty) {
        let list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(c => !deletedIds.has(String(c.id)));

        if (enabledOnly) {
          list = list.filter(c => c.enabled !== false);
        }

        list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

        if (list.length > 0) {
          setLocalData(STORAGE_KEYS.CATEGORIES, list);
        }
        return list;
      }
    } catch (error) {
      console.warn('Firestore getCategories error, falling back to local store:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.CATEGORIES, sampleCategories).filter(c => !deletedIds.has(String(c.id)));
  return enabledOnly ? all.filter(c => c.enabled !== false) : all;
};

export const addCategory = async (categoryData) => {
  let createdId = null;

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: serverTimestamp()
      });
      createdId = docRef.id;
    } catch (error) {
      console.warn('Firestore addCategory error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.CATEGORIES, sampleCategories);
  const id = createdId || 'cat-' + Date.now();
  removeDeletedId(STORAGE_KEYS.DELETED_CATEGORIES, id);

  const newCat = { ...categoryData, id, createdAt: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.CATEGORIES, [...all.filter(c => String(c.id) !== String(id)), newCat]);

  // Sync with Express backend API
  try {
    const token = await getAuthToken();
    fetch(`${API_BASE}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newCat)
    }).catch(() => {});
  } catch (e) {}

  return id;
};

export const updateCategory = async (id, categoryData) => {
  removeDeletedId(STORAGE_KEYS.DELETED_CATEGORIES, id);
  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'categories', id), categoryData);
    } catch (error) {
      console.warn('Firestore updateCategory error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.CATEGORIES, sampleCategories);
  const updated = all.map(c => (String(c.id) === String(id) ? { ...c, ...categoryData } : c));
  setLocalData(STORAGE_KEYS.CATEGORIES, updated);

  try {
    const token = await getAuthToken();
    fetch(`${API_BASE}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    }).catch(() => {});
  } catch (e) {}
};

export const deleteCategory = async (id) => {
  // 1. Mark as permanently deleted in deleted IDs registry
  addDeletedId(STORAGE_KEYS.DELETED_CATEGORIES, id);

  // 2. Remove from local store immediately
  const all = getLocalData(STORAGE_KEYS.CATEGORIES, sampleCategories);
  setLocalData(STORAGE_KEYS.CATEGORIES, all.filter(c => String(c.id) !== String(id)));

  // 3. Attempt Firestore deletion
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.warn('Firestore deleteCategory notice:', error.message);
    }
  }

  // 4. Sync with Express backend API
  try {
    const token = await getAuthToken();
    await fetch(`${API_BASE}/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});
  } catch (e) {}
};

// ============ GALLERY ============
export const getGalleryItems = async (category = 'all') => {
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await getDocs(collection(db, 'gallery'));
      if (snapshot && !snapshot.empty) {
        let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        list.sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt));

        if (list.length > 0) {
          setLocalData(STORAGE_KEYS.GALLERY, list);
        }

        if (category && category !== 'all') {
          return list.filter(g => g.category?.toLowerCase() === category.toLowerCase());
        }
        return list;
      }
    } catch (error) {
      console.warn('Firestore getGalleryItems error, falling back to local store:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.GALLERY, sampleGallery);
  if (category && category !== 'all') {
    return all.filter(g => g.category?.toLowerCase() === category.toLowerCase());
  }
  return all;
};

export const addGalleryItem = async (itemData) => {
  let createdId = null;

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'gallery'), {
        ...itemData,
        createdAt: serverTimestamp()
      });
      createdId = docRef.id;
    } catch (error) {
      console.warn('Firestore addGalleryItem error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.GALLERY, sampleGallery);
  const id = createdId || 'gal-' + Date.now();
  const newItem = { ...itemData, id, createdAt: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.GALLERY, [newItem, ...all]);
  return id;
};

export const updateGalleryItem = async (id, itemData) => {
  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'gallery', id), itemData);
    } catch (error) {
      console.warn('Firestore updateGalleryItem error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.GALLERY, sampleGallery);
  setLocalData(STORAGE_KEYS.GALLERY, all.map(g => (g.id === id ? { ...g, ...itemData } : g)));
};

export const deleteGalleryItem = async (id) => {
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (error) {
      console.warn('Firestore deleteGalleryItem error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.GALLERY, sampleGallery);
  setLocalData(STORAGE_KEYS.GALLERY, all.filter(g => g.id !== id));
};

// ============ INQUIRIES ============
export const getInquiries = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (error) {
      console.warn('Firestore getInquiries error, falling back to local store:', error.message);
    }
  }

  return getLocalData(STORAGE_KEYS.INQUIRIES, sampleInquiries);
};

export const addInquiry = async (inquiryData) => {
  let createdId = null;

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'inquiries'), {
        ...inquiryData,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      createdId = docRef.id;
    } catch (error) {
      console.warn('Firestore addInquiry error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.INQUIRIES, sampleInquiries);
  const id = createdId || 'inq-' + Date.now();
  const newInq = {
    ...inquiryData,
    id,
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  setLocalData(STORAGE_KEYS.INQUIRIES, [newInq, ...all]);

  // Forward to server API
  try {
    fetch(`${API_BASE}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInq)
    }).catch(() => {});
  } catch (e) {}

  return id;
};

export const updateInquiry = async (id, data) => {
  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'inquiries', id), data);
    } catch (error) {
      console.warn('Firestore updateInquiry error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.INQUIRIES, sampleInquiries);
  setLocalData(STORAGE_KEYS.INQUIRIES, all.map(i => (i.id === id ? { ...i, ...data } : i)));
};

export const deleteInquiry = async (id) => {
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (error) {
      console.warn('Firestore deleteInquiry error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.INQUIRIES, sampleInquiries);
  setLocalData(STORAGE_KEYS.INQUIRIES, all.filter(i => i.id !== id));
};

// ============ CUSTOM REQUESTS ============
export const addCustomRequest = async (requestData) => {
  let createdId = null;

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, 'customRequests'), {
        ...requestData,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      createdId = docRef.id;
    } catch (error) {
      console.warn('Firestore addCustomRequest error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.CUSTOM_REQUESTS, sampleCustomRequests);
  const id = createdId || 'req-' + Date.now();
  const newReq = {
    ...requestData,
    id,
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  setLocalData(STORAGE_KEYS.CUSTOM_REQUESTS, [newReq, ...all]);

  try {
    fetch(`${API_BASE}/api/inquiries/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    }).catch(() => {});
  } catch (e) {}

  return id;
};

export const getCustomRequests = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, 'customRequests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (error) {
      console.warn('Firestore getCustomRequests error, falling back to local store:', error.message);
    }
  }

  return getLocalData(STORAGE_KEYS.CUSTOM_REQUESTS, sampleCustomRequests);
};

export const updateCustomRequest = async (id, data) => {
  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'customRequests', id), data);
    } catch (error) {
      console.warn('Firestore updateCustomRequest error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.CUSTOM_REQUESTS, sampleCustomRequests);
  setLocalData(STORAGE_KEYS.CUSTOM_REQUESTS, all.map(r => (r.id === id ? { ...r, ...data } : r)));
};

export const deleteCustomRequest = async (id) => {
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'customRequests', id));
    } catch (error) {
      console.warn('Firestore deleteCustomRequest error:', error.message);
    }
  }

  const all = getLocalData(STORAGE_KEYS.CUSTOM_REQUESTS, sampleCustomRequests);
  setLocalData(STORAGE_KEYS.CUSTOM_REQUESTS, all.filter(r => r.id !== id));
};

// ============ SETTINGS ============
export const getSettings = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'settings', 'siteSettings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.warn('Firestore getSettings error, using local settings:', error.message);
    }
  }

  return getLocalData(STORAGE_KEYS.SETTINGS, sampleSettings);
};

export const updateSettings = async (settingsData) => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'settings', 'siteSettings');
      await setDoc(docRef, {
        ...settingsData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn('Firestore updateSettings error, updating local store:', error.message);
    }
  }

  const current = getLocalData(STORAGE_KEYS.SETTINGS, sampleSettings);
  const updated = { ...current, ...settingsData, updatedAt: new Date().toISOString() };
  setLocalData(STORAGE_KEYS.SETTINGS, updated);

  try {
    const token = await getAuthToken();
    fetch(`${API_BASE}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settingsData)
    }).catch(() => {});
  } catch (e) {}
};

// Quick client-side image compression & optimization (runs in milliseconds)
const compressImage = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

// ============ FILE UPLOADS ============
export const uploadImage = async (file, path = 'images') => {
  const timestamp = Date.now();
  const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9.]/g, '_') : 'image.jpg';
  const filePath = `${path}/${timestamp}_${safeName}`;

  // 1. Instantly compress and generate base64 preview (takes <20ms)
  const base64Data = await compressImage(file);

  // 2. Try Firebase Storage with a strict 3.8-second timeout to prevent infinite retry hanging
  if (isFirebaseConfigured() && storage) {
    try {
      const storageRef = ref(storage, filePath);
      const uploadTask = (async () => {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      })();

      const timeoutTask = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage timeout (rules or bucket not ready)')), 3800)
      );

      const downloadURL = await Promise.race([uploadTask, timeoutTask]);
      return { url: downloadURL, path: filePath };
    } catch (error) {
      console.warn('Firebase Storage fast-fallback activated:', error.message);
    }
  }

  // 3. Fallback: Return optimized base64 Data URL instantly so the user is never kept waiting
  return {
    url: base64Data,
    path: filePath
  };
};

export const deleteImage = async (imagePath) => {
  if (isFirebaseConfigured()) {
    try {
      const storageRef = ref(storage, imagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn('Firebase Storage delete error:', error.message);
    }
  }
};

// ============ ONE-CLICK FIREBASE FULL DATABASE SYNC ============
export const syncAllDataToFirebase = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase configuration missing in .env');
  }

  // 1. Categories -> Firestore
  const categories = getLocalData(STORAGE_KEYS.CATEGORIES, sampleCategories);
  for (const cat of categories) {
    const { id, ...data } = cat;
    await setDoc(doc(db, 'categories', id), {
      ...data,
      createdAt: serverTimestamp()
    }, { merge: true });
  }

  // 2. Handcrafted Palkhis -> Firestore
  const palkhis = getLocalData(STORAGE_KEYS.PALKHIS, samplePalkhis);
  for (const palkhi of palkhis) {
    const { id, ...data } = palkhi;
    await setDoc(doc(db, 'palkhis', id), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // 3. Gallery -> Firestore
  const gallery = getLocalData(STORAGE_KEYS.GALLERY, sampleGallery);
  for (const item of gallery) {
    const { id, ...data } = item;
    await setDoc(doc(db, 'gallery', id), {
      ...data,
      createdAt: serverTimestamp()
    }, { merge: true });
  }

  // 4. Inquiries -> Firestore
  const inquiries = getLocalData(STORAGE_KEYS.INQUIRIES, sampleInquiries);
  for (const inq of inquiries) {
    const { id, ...data } = inq;
    await setDoc(doc(db, 'inquiries', id), {
      ...data,
      createdAt: serverTimestamp()
    }, { merge: true });
  }

  // 5. Website Settings (Hero, descriptions, contacts, stats) -> Firestore
  const currentSettings = getLocalData(STORAGE_KEYS.SETTINGS, sampleSettings);
  await setDoc(doc(db, 'settings', 'siteSettings'), {
    ...currentSettings,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return true;
};

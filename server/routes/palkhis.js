const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyAuth } = require('../middleware/auth');
const store = require('../data/store');

// GET /api/palkhis - Get all enabled palkhis (public)
router.get('/', async (req, res) => {
  const { category, featured } = req.query;

  try {
    let query = db.collection('palkhis').where('enabled', '==', true);
    
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    if (featured === 'true') {
      query = query.where('featured', '==', true);
    }
    
    query = query.orderBy('createdAt', 'desc');
    const snapshot = await query.get();
    const palkhis = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return res.json(palkhis);
  } catch (error) {
    // Fallback to store
    let filtered = store.palkhis.filter(p => p.enabled !== false);
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (featured === 'true') {
      filtered = filtered.filter(p => p.featured === true);
    }
    return res.json(filtered);
  }
});

// GET /api/palkhis/all - Get all palkhis including disabled (admin)
router.get('/all', async (req, res) => {
  try {
    const snapshot = await db.collection('palkhis').orderBy('createdAt', 'desc').get();
    const palkhis = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(palkhis);
  } catch (error) {
    return res.json(store.palkhis);
  }
});

// GET /api/palkhis/:id - Get single palkhi (public)
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('palkhis').doc(req.params.id).get();
    if (doc.exists) {
      return res.json({ id: doc.id, ...doc.data() });
    }
    // Check store
    const item = store.palkhis.find(p => p.id === req.params.id);
    if (item) return res.json(item);
    return res.status(404).json({ error: 'Palkhi not found' });
  } catch (error) {
    const item = store.palkhis.find(p => p.id === req.params.id);
    if (item) return res.json(item);
    return res.status(404).json({ error: 'Palkhi not found' });
  }
});

// POST /api/palkhis - Create palkhi (admin only)
router.post('/', verifyAuth, async (req, res) => {
  try {
    const palkhiData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    try {
      const docRef = await db.collection('palkhis').add(palkhiData);
      return res.status(201).json({ id: docRef.id, message: 'Palkhi created successfully' });
    } catch (fbErr) {
      const newId = 'palkhi-' + Date.now();
      const newPalkhi = { id: newId, ...palkhiData };
      store.palkhis.unshift(newPalkhi);
      return res.status(201).json({ id: newId, message: 'Palkhi created successfully' });
    }
  } catch (error) {
    console.error('Error creating palkhi:', error);
    res.status(500).json({ error: 'Failed to create palkhi' });
  }
});

// PUT /api/palkhis/:id - Update palkhi (admin only)
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    try {
      await db.collection('palkhis').doc(req.params.id).update(updateData);
    } catch (fbErr) {
      const idx = store.palkhis.findIndex(p => p.id === req.params.id);
      if (idx !== -1) {
        store.palkhis[idx] = { ...store.palkhis[idx], ...updateData };
      }
    }
    res.json({ message: 'Palkhi updated successfully' });
  } catch (error) {
    console.error('Error updating palkhi:', error);
    res.status(500).json({ error: 'Failed to update palkhi' });
  }
});

// DELETE /api/palkhis/:id - Delete palkhi (admin only)
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('palkhis').doc(req.params.id).delete();
    } catch (fbErr) {
      store.palkhis = store.palkhis.filter(p => p.id !== req.params.id);
    }
    res.json({ message: 'Palkhi deleted successfully' });
  } catch (error) {
    console.error('Error deleting palkhi:', error);
    res.status(500).json({ error: 'Failed to delete palkhi' });
  }
});

module.exports = router;

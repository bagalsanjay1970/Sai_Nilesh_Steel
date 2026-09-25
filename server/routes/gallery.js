const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyAuth } = require('../middleware/auth');
const store = require('../data/store');

// GET /api/gallery - Get gallery items (public)
router.get('/', async (req, res) => {
  const { category } = req.query;

  try {
    let query = db.collection('gallery');
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    query = query.orderBy('createdAt', 'desc');
    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(items);
  } catch (error) {
    let list = store.gallery;
    if (category && category !== 'all') {
      list = list.filter(g => g.category?.toLowerCase() === category.toLowerCase());
    }
    return res.json(list);
  }
});

// POST /api/gallery - Add gallery item (admin only)
router.post('/', verifyAuth, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      createdAt: new Date()
    };
    try {
      const docRef = await db.collection('gallery').add(itemData);
      return res.status(201).json({ id: docRef.id, message: 'Gallery item added' });
    } catch (fbErr) {
      const newId = 'gal-' + Date.now();
      const newItem = { id: newId, ...itemData };
      store.gallery.unshift(newItem);
      return res.status(201).json({ id: newId, message: 'Gallery item added' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

// PUT /api/gallery/:id - Update gallery item (admin only)
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('gallery').doc(req.params.id).update(req.body);
    } catch (fbErr) {
      const idx = store.gallery.findIndex(g => g.id === req.params.id);
      if (idx !== -1) {
        store.gallery[idx] = { ...store.gallery[idx], ...req.body };
      }
    }
    res.json({ message: 'Gallery item updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item (admin only)
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('gallery').doc(req.params.id).delete();
    } catch (fbErr) {
      store.gallery = store.gallery.filter(g => g.id !== req.params.id);
    }
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyAuth } = require('../middleware/auth');
const store = require('../data/store');

// GET /api/categories - Get all categories (public)
router.get('/', async (req, res) => {
  const enabledOnly = req.query.enabled !== 'false';

  try {
    let query = db.collection('categories');
    if (enabledOnly) {
      query = query.where('enabled', '==', true);
    }
    query = query.orderBy('order', 'asc');
    const snapshot = await query.get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(categories);
  } catch (error) {
    let list = store.categories;
    if (enabledOnly) {
      list = list.filter(c => c.enabled !== false);
    }
    return res.json(list);
  }
});

// POST /api/categories - Create category (admin only)
router.post('/', verifyAuth, async (req, res) => {
  try {
    const catData = {
      ...req.body,
      createdAt: new Date()
    };
    try {
      const docRef = await db.collection('categories').add(catData);
      return res.status(201).json({ id: docRef.id, message: 'Category created' });
    } catch (fbErr) {
      const newId = 'cat-' + Date.now();
      const newCat = { id: newId, ...catData };
      store.categories.push(newCat);
      return res.status(201).json({ id: newId, message: 'Category created' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('categories').doc(req.params.id).update(req.body);
    } catch (fbErr) {
      const idx = store.categories.findIndex(c => c.id === req.params.id);
      if (idx !== -1) {
        store.categories[idx] = { ...store.categories[idx], ...req.body };
      }
    }
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('categories').doc(req.params.id).delete();
    } catch (fbErr) {
      store.categories = store.categories.filter(c => c.id !== req.params.id);
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;

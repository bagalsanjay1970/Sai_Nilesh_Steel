const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyAuth } = require('../middleware/auth');
const store = require('../data/store');

// GET /api/settings - Get site settings (public)
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('siteSettings').get();
    if (doc.exists) {
      return res.json(doc.data());
    } else {
      return res.json(store.settings);
    }
  } catch (error) {
    return res.json(store.settings);
  }
});

// PUT /api/settings - Update settings (admin only)
router.put('/', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('settings').doc('siteSettings').set({
        ...req.body,
        updatedAt: new Date()
      }, { merge: true });
    } catch (fbErr) {
      store.settings = { ...store.settings, ...req.body };
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;

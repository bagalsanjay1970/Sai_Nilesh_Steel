const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyAuth } = require('../middleware/auth');
const store = require('../data/store');

// POST /api/inquiries - Submit inquiry (public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, palkhiInterest, message, type, source } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const inqData = {
      name, phone, email: email || '', palkhiInterest: palkhiInterest || '',
      message: message || '', type: type || 'general', source: source || 'Website',
      status: 'unread',
      createdAt: new Date()
    };

    try {
      const docRef = await db.collection('inquiries').add(inqData);
      return res.status(201).json({ id: docRef.id, message: 'Inquiry submitted successfully' });
    } catch (fbErr) {
      const newId = 'inq-' + Date.now();
      store.inquiries.unshift({ id: newId, ...inqData });
      return res.status(201).json({ id: newId, message: 'Inquiry submitted successfully' });
    }
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// POST /api/inquiries/custom - Submit custom palkhi request (public)
router.post('/custom', async (req, res) => {
  try {
    const { name, mobile } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile are required' });
    }

    const reqData = {
      ...req.body,
      status: 'unread',
      createdAt: new Date()
    };

    try {
      const docRef = await db.collection('customRequests').add(reqData);
      return res.status(201).json({ id: docRef.id, message: 'Custom request submitted successfully' });
    } catch (fbErr) {
      const newId = 'req-' + Date.now();
      store.customRequests.unshift({ id: newId, ...reqData });
      return res.status(201).json({ id: newId, message: 'Custom request submitted successfully' });
    }
  } catch (error) {
    console.error('Error submitting custom request:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// GET /api/inquiries - Get all inquiries (admin only)
router.get('/', verifyAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('inquiries').orderBy('createdAt', 'desc').get();
    const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(inquiries);
  } catch (error) {
    return res.json(store.inquiries);
  }
});

// GET /api/inquiries/custom - Get all custom requests (admin only)
router.get('/custom', verifyAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('customRequests').orderBy('createdAt', 'desc').get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(requests);
  } catch (error) {
    return res.json(store.customRequests);
  }
});

// PUT /api/inquiries/:id - Update inquiry status (admin only)
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('inquiries').doc(req.params.id).update(req.body);
    } catch (fbErr) {
      const idx = store.inquiries.findIndex(i => i.id === req.params.id);
      if (idx !== -1) {
        store.inquiries[idx] = { ...store.inquiries[idx], ...req.body };
      }
    }
    res.json({ message: 'Inquiry updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// PUT /api/inquiries/custom/:id - Update custom request (admin only)
router.put('/custom/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('customRequests').doc(req.params.id).update(req.body);
    } catch (fbErr) {
      const idx = store.customRequests.findIndex(r => r.id === req.params.id);
      if (idx !== -1) {
        store.customRequests[idx] = { ...store.customRequests[idx], ...req.body };
      }
    }
    res.json({ message: 'Custom request updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update custom request' });
  }
});

// DELETE /api/inquiries/:id - Delete inquiry (admin only)
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('inquiries').doc(req.params.id).delete();
    } catch (fbErr) {
      store.inquiries = store.inquiries.filter(i => i.id !== req.params.id);
    }
    res.json({ message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// DELETE /api/inquiries/custom/:id - Delete custom request (admin only)
router.delete('/custom/:id', verifyAuth, async (req, res) => {
  try {
    try {
      await db.collection('customRequests').doc(req.params.id).delete();
    } catch (fbErr) {
      store.customRequests = store.customRequests.filter(r => r.id !== req.params.id);
    }
    res.json({ message: 'Custom request deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete custom request' });
  }
});

module.exports = router;

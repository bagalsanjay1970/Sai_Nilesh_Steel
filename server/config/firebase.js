const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// Supports:
// 1. JSON string in FIREBASE_SERVICE_ACCOUNT env variable
// 2. serviceAccountKey.json placed in server/ directory
// 3. Application Default Credentials
try {
  const localKeyPath = path.join(__dirname, '../serviceAccountKey.json');

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('✅ Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT env');
  } else if (fs.existsSync(localKeyPath)) {
    const serviceAccount = require(localKeyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('✅ Firebase Admin SDK initialized using server/serviceAccountKey.json');
  } else {
    // Try application default credentials
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin SDK initialized using Application Default Credentials');
  }
} catch (error) {
  console.warn('Firebase Admin SDK initialization warning:', error.message);
  console.warn('Server will run with dev store fallback until Firebase credentials are provided.');
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };

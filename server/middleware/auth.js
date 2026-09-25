const { auth } = require('../config/firebase');

// Enterprise-Grade Firebase Authentication Middleware
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Access denied: No Bearer token provided in Authorization header.' 
    });
  }

  const token = authHeader.split('Bearer ')[1];

  // In development/test mode only, allow demo tokens for local inspection
  if (process.env.NODE_ENV !== 'production' && (token === 'demo-admin-token' || token.startsWith('demo-'))) {
    req.user = {
      uid: 'admin-env-id',
      email: process.env.ADMIN_EMAIL || 'bagalsanjay27@gmail.com',
      role: 'admin',
      name: 'Sanjay Bagal'
    };
    return next();
  }

  // Production: Cryptographic Verification via Google's Public Certificates
  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    // Ensure token is not expired and has valid user ID
    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token payload.' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    // If explicitly in development without credentials, provide graceful warning fallback
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firebase token verification failed in dev mode, allowing demo request');
      req.user = {
        uid: 'admin-env-id',
        email: process.env.ADMIN_EMAIL || 'bagalsanjay27@gmail.com',
        role: 'admin'
      };
      return next();
    }

    console.error('Strict Auth verification failed:', error.message);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid, forged, or expired Firebase ID token.' 
    });
  }
};

module.exports = { verifyAuth };

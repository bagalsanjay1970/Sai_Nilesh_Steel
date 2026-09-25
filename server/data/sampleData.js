// Sai Nilesh Steel — Clean data store for server
// All real data is managed directly via Admin panel & Firebase Firestore

const sampleCategories = [];

const samplePalkhis = [];

const sampleGallery = [];

const sampleInquiries = [];

const sampleCustomRequests = [];

const sampleSettings = {
  businessName: 'Sai Nilesh Steel',
  ownerName: 'Sanjay Bagal',
  phone: '+91 92267 63820',
  whatsapp: '919226763820',
  email: 'info@sainileshsteel.com',
  address: 'Nagar Manmad Road Dange Market, Shirdi Road, District Ahmednagar, Maharashtra 423109',
  businessHours: 'Mon - Sat: 9:00 AM - 7:30 PM | Sunday: By Appointment (Devotee Visits Welcome)',
  googleMapsLink: '',
  heroHeading: 'Handcrafted Sai Baba Palkhis — Made With Devotion & Precision',
  heroDescription: 'Master craftsmanship dedicated exclusively to sacred Sai Baba Palkhis. Built for temples and devotee yatras worldwide.',
  heroImages: [],
  stats: {
    yearsExperience: 25,
    palkhisCrafted: 0,
    happyCustomers: 0
  }
};

module.exports = {
  sampleCategories,
  samplePalkhis,
  sampleGallery,
  sampleInquiries,
  sampleCustomRequests,
  sampleSettings
};

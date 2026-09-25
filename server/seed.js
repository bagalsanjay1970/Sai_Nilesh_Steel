require('dotenv').config();
const { db } = require('./config/firebase');
const {
  sampleCategories,
  samplePalkhis,
  sampleGallery,
  sampleInquiries,
  sampleCustomRequests,
  sampleSettings
} = require('./data/sampleData');

async function seed() {
  console.log('🌱 Starting Firebase Firestore seed for Sai Nilesh Steel...');

  try {
    // 1. Categories
    console.log('Seeding categories...');
    for (const cat of sampleCategories) {
      const { id, ...data } = cat;
      await db.collection('categories').doc(id).set({
        ...data,
        createdAt: new Date()
      }, { merge: true });
    }
    console.log(`✅ ${sampleCategories.length} categories seeded.`);

    // 2. Palkhis
    console.log('Seeding handcrafted Sai Baba Palkhis...');
    for (const palkhi of samplePalkhis) {
      const { id, ...data } = palkhi;
      await db.collection('palkhis').doc(id).set({
        ...data,
        updatedAt: new Date()
      }, { merge: true });
    }
    console.log(`✅ ${samplePalkhis.length} Palkhis seeded.`);

    // 3. Gallery
    console.log('Seeding gallery photos...');
    for (const item of sampleGallery) {
      const { id, ...data } = item;
      await db.collection('gallery').doc(id).set(data, { merge: true });
    }
    console.log(`✅ ${sampleGallery.length} gallery items seeded.`);

    // 4. Inquiries
    console.log('Seeding inquiries...');
    for (const inq of sampleInquiries) {
      const { id, ...data } = inq;
      await db.collection('inquiries').doc(id).set(data, { merge: true });
    }
    console.log(`✅ ${sampleInquiries.length} inquiries seeded.`);

    // 5. Custom Requests
    console.log('Seeding custom requests...');
    for (const req of sampleCustomRequests) {
      const { id, ...data } = req;
      await db.collection('customRequests').doc(id).set(data, { merge: true });
    }
    console.log(`✅ ${sampleCustomRequests.length} custom requests seeded.`);

    // 6. Settings
    console.log('Seeding website settings...');
    await db.collection('settings').doc('siteSettings').set({
      ...sampleSettings,
      updatedAt: new Date()
    }, { merge: true });
    console.log('✅ Website settings seeded.');

    console.log('\n🎉 Successfully completed Firebase Firestore seeding for Sai Nilesh Steel!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    console.error('Make sure your Firebase service account or credentials in server/.env are valid.');
    process.exit(1);
  }
}

seed();

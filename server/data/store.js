// In-memory / persistent fallback store for development mode when Firebase is unconfigured
const {
  sampleCategories,
  samplePalkhis,
  sampleGallery,
  sampleInquiries,
  sampleCustomRequests,
  sampleSettings
} = require('./sampleData');

let palkhis = [...samplePalkhis];
let categories = [...sampleCategories];
let gallery = [...sampleGallery];
let inquiries = [...sampleInquiries];
let customRequests = [...sampleCustomRequests];
let settings = { ...sampleSettings };

module.exports = {
  palkhis,
  categories,
  gallery,
  inquiries,
  customRequests,
  settings
};

/**
 * WhatsApp Helper Utilities for Sai Nilesh Steel
 * Sanitizes phone numbers and generates universal WhatsApp click-to-chat links
 * Compatible with Desktop Web, Mobile App, and WhatsApp Desktop.
 */

export const getCleanWhatsAppNumber = (whatsapp, phone) => {
  const raw = whatsapp || phone || '919226763820';
  let digits = String(raw).replace(/\D/g, '');

  // If user entered 10 digits (e.g. 919226763820), add Indian country code 91
  if (digits.length === 10) {
    digits = '91' + digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = '91' + digits.slice(1);
  }

  // Fallback to official number if invalid length
  if (digits.length < 10) {
    digits = '919226763820';
  }

  return digits;
};

export const getWhatsAppUrl = (whatsapp, phone, message = '') => {
  const cleanNumber = getCleanWhatsAppNumber(whatsapp, phone);
  const baseUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}`;
  return message ? `${baseUrl}&text=${encodeURIComponent(message)}` : baseUrl;
};

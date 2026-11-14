/**
 * WhatsApp Deep-Link and Contextual Inquiries Generator
 */

export interface WhatsAppInquiryPayload {
  recipientPhone: string;
  itemType: 'POST' | 'CLASSIFIED' | 'STORY';
  title: string;
  price?: number;
  location?: string;
  itemId: string;
  sellerName?: string;
  currentUserFullName?: string;
  currentUserIts?: string;
}

export function generateWhatsAppLink(payload: WhatsAppInquiryPayload): string {
  // Sanitize phone number (remove spaces, plus, hyphens)
  let cleanPhone = payload.recipientPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const greeting = 'Salaamun Alaikum!';
  const priceText = payload.price ? ` (Listed for ₹${payload.price.toLocaleString('en-IN')})` : '';
  const locationText = payload.location ? ` in ${payload.location}` : '';

  let message = '';

  if (payload.itemType === 'POST') {
    message = `${greeting} I saw your product post "${payload.title}"${priceText} on Al-Souq.\n\nCould you please share details on order availability and delivery?`;
  } else if (payload.itemType === 'STORY') {
    message = `${greeting} I saw your Today's Fresh Drop "${payload.title}" on Al-Souq! I would like to place an order before the cutoff deadline.`;
  } else {
    // Classified
    message = `${greeting} I am reaching out regarding your listing on Al-Souq: "${payload.title}"${priceText}${locationText}.\n\nIs this still available for viewing/discussion?`;
  }

  if (payload.currentUserFullName) {
    const itsText = payload.currentUserIts ? ` (ITS: ${payload.currentUserIts})` : '';
    message += `\n\n— From: ${payload.currentUserFullName}${itsText}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Masks phone numbers for unverified users: e.g. +91 98200 •••••
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '••••••••••';
  const clean = phone.trim();
  if (clean.length > 5) {
    return clean.slice(0, 7) + ' •••••';
  }
  return '••••••••••';
}

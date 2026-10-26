export const SITE_CONFIG = Object.freeze({
  brandName: 'Crisples',
  locale: 'en-LB',
  currency: 'USD',
  instagramHandle: '@crispleslb',
  instagramUrl: 'https://www.instagram.com/crispleslb',
  // Add the official international number without + or spaces, e.g. 961XXXXXXXX.
  // When blank, checkout uses WhatsApp's contact chooser instead of inventing a number.
  whatsappNumber: '',
  announcement: '100% Apples • Naturally Sweet • Made for Your Everyday Crunch',
  navigation: [
    { label: 'Home', href: 'index.html' },
    { label: 'Shop', href: 'shop.html' },
    { label: 'About', href: 'about.html' },
    { label: 'Contact', href: 'contact.html' },
  ],
});

export function formatPrice(value) {
  if (value === null || value === undefined) return 'Price on request';
  return new Intl.NumberFormat(SITE_CONFIG.locale, {
    style: 'currency',
    currency: SITE_CONFIG.currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function whatsappUrl(message) {
  const number = SITE_CONFIG.whatsappNumber.trim();
  const base = number ? `https://wa.me/${number}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

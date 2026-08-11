/* ==========================================================================
   SITE DATA — Dprince Couture
   Every piece of brand chrome lives here: wordmark, navigation, footer,
   contact details, shipping rules. Change it here and it changes everywhere.
   ========================================================================== */

export const SITE = {
  name: 'Dprince Couture',
  wordmark: 'DPRINCE',
  wordmarkSuffix: 'COUTURE',
  tagline: 'Ceremonial tailoring, made to be inherited.',
  announcement: 'Complimentary nationwide delivery on orders above ₦500,000',

  // Primary navigation — order is the order rendered.
  nav: [
    { label: 'Shop', href: 'shop.html' },
    { label: 'Lookbook', href: 'lookbook.html' },
    { label: 'Journal', href: 'journal.html' },
    { label: 'About', href: 'about.html' },
    { label: 'Booking', href: 'booking.html' }
  ],

  footer: [
    {
      heading: 'Shop',
      links: [
        { label: 'All pieces', href: 'shop.html' },
        { label: 'Agbada', href: 'shop.html?category=Agbada' },
        { label: 'Kaftan', href: 'shop.html?category=Kaftan' },
        { label: 'Senator', href: 'shop.html?category=Senator' },
        { label: 'Accessories', href: 'shop.html?category=Accessories' }
      ]
    },
    {
      heading: 'The House',
      links: [
        { label: 'About', href: 'about.html' },
        { label: 'Lookbook', href: 'lookbook.html' },
        { label: 'Journal', href: 'journal.html' },
        { label: 'Book an appointment', href: 'booking.html' }
      ]
    },
    {
      heading: 'Client Services',
      links: [
        { label: 'Shipping', href: 'client-services.html#shipping' },
        { label: 'Returns', href: 'client-services.html#returns' },
        { label: 'Size guide', href: 'client-services.html#sizing' },
        { label: 'Garment care', href: 'client-services.html#care' },
        { label: 'Payment', href: 'client-services.html#payment' },
        { label: 'Frequently asked', href: 'client-services.html#faq' }
      ]
    },
    {
      heading: 'Contact',
      links: [
        { label: 'Enquiries', href: 'contact.html' },
        { label: 'Instagram', href: 'https://instagram.com', external: true },
        { label: 'WhatsApp', href: 'https://wa.me/2348000000000', external: true }
      ]
    }
  ],

  /* PLACEHOLDER CONTACT DETAILS — replace before this site goes live.
     See README, "Replacing brand content". */
  ateliers: [
    {
      city: 'Lagos',
      address: ['14 Musa Yar’Adua Street', 'Victoria Island', 'Lagos'],
      hours: 'Monday – Saturday, 10:00 – 19:00',
      phone: '+234 800 000 0000'
    },
    {
      city: 'Abuja',
      address: ['8 Gana Street', 'Maitama', 'Abuja'],
      hours: 'Monday – Saturday, 10:00 – 18:00',
      phone: '+234 800 000 0001'
    }
  ],

  email: 'atelier@dprincecouture.com',

  // Commerce rules — used by the cart for totals.
  shipping: {
    flatRate: 15000,
    freeThreshold: 500000,
    note: 'Nationwide delivery, 3–5 working days. International delivery quoted on request.'
  },

  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' }
};

/** Format a kobo-free naira integer as ₦890,000 */
export function formatPrice(value) {
  return new Intl.NumberFormat(SITE.currency.locale, {
    style: 'currency',
    currency: SITE.currency.code,
    maximumFractionDigits: 0
  }).format(value);
}

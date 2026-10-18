/** Single source of truth for business details. Edit here; everything else reads from this file. */
export const site = {
  name: "PassionateGiftsStore",
  tagline: "Handcrafted gifts, made with love in Mumbai",
  description:
    "Handmade resin art, scented candles and artisan soaps from PassionateGiftsStore, Mumbai. Lovingly crafted to order for birthdays, weddings and every occasion.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://passionategiftsstore.com",

  phone: "7852017655",
  phoneDisplay: "+91 78520 17655",
  whatsappNumber: "917852017655", // country code + number, digits only
  email: "passionategiftstore@gmail.com",
  hours: "9AM - 6PM Daily",
  address: "Mumbai, Maharashtra, India",
  city: "Mumbai",
  region: "Maharashtra",
  country: "IN",

  /** FSSAI licence number. Leave empty to hide it from the footer. */
  fssai: "",

  /** UPI details shown after an order is sent (advance payment). */
  upiId: "manjupathak135@okicici",
  instagramHandle: "@passionbakerynchoco15",

  /** Photo shown in the "About" section (swap for a photo of the baker any time). */
  aboutImage: "/store-logo.png",

  /** Products shown in "Signature Gifts" on the home page (must match the product names exactly). */
  featured: [
    "Ocean Wave Coaster Set",
    "Vanilla Bean Jar Candle",
    "Rose & Milk Soap",
    "Pressed Flower Wall Frame",
    "Candle Gift Trio",
    "Petal Soap Gift Box",
  ] as readonly string[],

  /**
   * Pincodes you deliver to (e.g. ["400001", "400050"]). While this list is empty the
   * delivery checker simply asks the customer to confirm their area with you on WhatsApp.
   */
  deliveryPincodes: [] as readonly string[],

  /** Fallback minimum notice for delivery / pick-up, in hours. Each product type has its own
   *  lead time in src/lib/gift-types.json; the longest one in the cart applies. */
  leadTimeHours: 48,
  /** Share of the total to be paid in advance to confirm an order. */
  advancePercent: 50,

  social: {
    facebook: "https://www.facebook.com/share/17UMkLQ8Kb/",
    instagram: "https://www.instagram.com/passionbakerynchoco15?igsh=NTA4NmNsZDNjd2Rp",
    pinterest: "https://pin.it/5SXLo07ns",
    youtube: "https://www.youtube.com/@passsionbakerynchocos",
    googleMaps: "https://share.google/scxv6y8LarOZqxfFF",
    googleReviews: "https://maps.app.goo.gl/G5Ro7eh8443WCXCo8",
  },
} as const;

export const whatsappChatUrl = `https://wa.me/${site.whatsappNumber}`;

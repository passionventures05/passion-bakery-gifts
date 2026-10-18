/**
 * The 4 banners in the home-page sliding gallery.
 * To use your own artwork: put the image files in /public/banners/ (16:9, e.g. 1920 x 1080 px, JPG or WebP)
 * and change the `src` below, e.g.  src: "/banners/diwali-sale.jpg".
 * `alt` describes the picture for screen readers; `href` (optional) is where a tap on the banner goes.
 */
export interface Banner {
  src: string;
  alt: string;
  href?: string;
}

export const banners: Banner[] = [
  { src: "/banners/gifts-main.webp", alt: "Gifts: find the best presents and gifts for your loved ones. Shop now.", href: "/products/" },
  { src: "/banners/banner-candles.png", alt: "Hand-poured scented candles by Pine & Glow", href: "/products/?type=candles" },
  { src: "/banners/banner-resin.png", alt: "One-of-a-kind resin keepsakes by Paradise Resin Arts", href: "/products/?type=resin" },
  { src: "/banners/banner-soaps.png", alt: "Handmade soaps and gift boxes by Pearl & Petal", href: "/products/?type=soaps" },
];

# PassionBakeryNChocos Gifts — Resin Art · Candles · Soaps (Next.js + React + TypeScript)

Gift-store website built from the cake website. Static export, no server, $0 hosting.
Three product types: **Paradise Resin Arts** (resin), **Pine & Glow** (candles), **Pearl & Petal** (soaps).

## Commands
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out  (deploy to Cloudflare Pages)
npm run check      # type-check + unit tests
```

## Things to replace (all currently placeholders)
- **4 home banners:** banner 1 is the gifts shop banner (`public/banners/gifts-main.webp`). Drop the other images in `public/banners/` and edit `src/lib/banners.ts` (16:9, e.g. 1920 x 1080 px).
- **Brand logos:** replace `public/brands/*.svg` (keep the file names, or change the paths in `src/lib/gift-types.json`). Store logo: `public/store-logo.svg` (+ `store-logo-180.png`).
- **Products:** 15 sample products in `content/products/` (edit in the CMS or the JSON files). Product photos go in `public/uploads/products/`.
- **Reviews:** `src/lib/reviews.ts` is empty, so the Reviews section is hidden until you add real ones.
- **UPI QR code:** `public/qr code.jpg` is still the one from the cake site. Replace it if gifts use a different UPI account.
- **Contact/social links** in `src/lib/site.ts` are still the bakery's. Phone is 9869153017.

## Product types, categories and lead times
Defined once in `src/lib/gift-types.json` (type names, descriptions, categories, lead time: resin 5 days, candles 3 days, soaps 2 days).
If you add or rename a category, also update the category list in `public/admin/config.yml` (a test checks they match).
The cart and special-order form use the longest lead time among the types chosen.

## Content management (Decap CMS)
Needs its **own** GitHub repo and Cloudflare login Worker: edit `repo` and `base_url` at the top of `public/admin/config.yml`
(see docs/CMS-SETUP.md). `public/gift_products.json` is generated from `content/products` on every build; don't edit it.
```bash
npm run dev:cms    # site + local CMS at http://localhost:3000/admin/index.html
```

## Where to change things
| What | File |
|---|---|
| Phone, email, address, hours, social links, lead time, advance %, **FSSAI number**, **UPI ID**, **products shown in "Signature Gifts"**, **delivery pincodes**, About photo | `src/lib/site.ts` |
| Home-page gallery photos (put the files in `public/gallery/`) | `src/lib/gallery.ts` |
| Home-page sections (hero, occasions, how to order, FAQ) | `src/components/home/` |
| Products (name, price, sizes, photo) | the CMS, or `content/products/*.json` |
| Reviews | `src/lib/reviews.ts` |
| Terms / Privacy wording | `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` |
| Site URL for SEO (or set `NEXT_PUBLIC_SITE_URL`) | `src/lib/site.ts` |

Product sizes (in the CMS) are weights like `500gm,1kg,1.5kg,2kg` for cakes and `1pc,3pc,5pc,7pc` for per-piece items.
Prices scale from `basePrice`/`baseQuantity` and are rounded to whole rupees.

## Structure
```
public/            images + cake_products.json
src/app/           routes: / /products /cart /special-order /terms /privacy (+ robots, sitemap)
src/components/    Navbar, Footer, Icon, ContactForm, FloatingWhatsApp, ScrollReveal, home/, products/, cart/, special-order/
src/lib/           site config, cart (localStorage "cakeCart_v2"), pricing, validation, WhatsApp helper
src/styles/        shared.css (footer/base) + one file per page, plus luxe*.css (typography, nav, animations, new sections)
source-images/     original full-size images (not served; the site uses the compressed WebP copies in public/)
tests/             unit tests (vitest)
```

## Quality checks done
- Pixel-identical to the pre-refactor build after the CSS consolidation.
- 13 unit tests; 20 browser flow checks (cart, sizes, modal focus, WhatsApp links, mobile menu).
- axe-core: 0 violations on all pages (desktop + mobile). Text contrast measured against real pixels (WCAG AA).
- Lighthouse: Accessibility 100, SEO 100, Best Practices 100 (96 on Products while product photos are missing).

## Design layer (luxury refresh)
- Fonts are self-hosted in `public/fonts/` (Cormorant Garamond for headings, Inter for text, Great Vibes for script accents).
- Colours are unchanged. Scroll animations use `data-reveal` (see `ScrollReveal.tsx`) and respect *reduced motion*.
- Checkout order is: cart → details → pay the advance (UPI link / ID / QR) → send on WhatsApp. The cart is only cleared after the customer confirms they sent the message.
- Product descriptions in `content/products/*.json` were drafted from each cake's name — please review them and correct anything that doesn't match your recipes.

## Known / deferred
- Product photos: only one cake has a photo so far; add the rest in the CMS (compress them to WebP/JPG under ~200 KB first).
- Terms and Privacy are drafts based on how the site works today — review them.

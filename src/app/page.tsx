import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { site, whatsappChatUrl } from "@/lib/site";
import BorderDivider from "@/components/BorderDivider";
import Icon from "@/components/Icon";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Faq from "@/components/home/Faq";
import BrandHierarchy from "@/components/home/BrandHierarchy";
import FeaturedGifts from "@/components/home/FeaturedGifts";
import Gallery from "@/components/home/Gallery";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Occasions from "@/components/home/Occasions";
import { reviews } from "@/lib/reviews";
import "@/styles/home.css";
import "@/styles/luxe-home.css";
import "@/styles/royal.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/og-banner.jpg`,
  logo: `${site.url}/store-logo.png`,
  telephone: `+91${site.phone}`,
  email: site.email,
  address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [site.social.facebook, site.social.instagram, site.social.pinterest, site.social.youtube],
};

const stripQuotes = (t: string) => t.replace(/^["“”\s]+|["“”\s]+$/g, "");

const contactCards = [
  { icon: "whatsapp", title: "WhatsApp", text: "Chat with us — the quickest way to order", href: whatsappChatUrl, external: true },
  { icon: "phone", title: "Call us", text: site.phoneDisplay, href: `tel:+91${site.phone}`, external: false },
  { icon: "envelope", title: "Email", text: site.email, href: `mailto:${site.email}`, external: false },
  { icon: "clock-o", title: "Hours", text: site.hours, href: undefined, external: false },
] as const;

export default function HomePage() {
  return (
    <div className="site page-home">
      <Navbar active="home" onHome />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main id="main" tabIndex={-1}>
        <Hero />

        <BorderDivider />

        {/* Brand hierarchy */}
        <section id="our-brands" className="lx-bare">
          <div className="lx-head on-light" data-reveal="">
            <span className="lx-eyebrow">Under one roof</span>
            <h2 className="lx-title">Our Three Brands</h2>
            <p className="lx-sub">{site.name} brings together three handcrafted labels, each with its own speciality.</p>
          </div>
          <BrandHierarchy />
        </section>

        <BorderDivider />

        {/* Signature gifts */}
        <section id="featured-products">
          <div className="lx-head" data-reveal="">
            <span className="lx-eyebrow">Our Favourites</span>
            <h2 className="lx-title">Signature Gifts</h2>
            <p className="lx-sub">A taste of what we make. Every piece is handcrafted to order, just for you.</p>
          </div>
          <FeaturedGifts />
          <div className="lx-center" data-reveal="">
            <Link href="/products/" className="lx-btn lx-btn-primary">
              Explore the Full Collection <Icon name="arrow-right" />
            </Link>
          </div>
        </section>

        {/* Occasions */}
        <section id="occasions" className="lx-bare">
          <div className="lx-head on-light" data-reveal="">
            <span className="lx-eyebrow">For every celebration</span>
            <h2 className="lx-title">Shop by Occasion</h2>
            <p className="lx-sub">Tell us what you&apos;re celebrating and we&apos;ll design a gift around it.</p>
          </div>
          <Occasions />
        </section>

        {/* How to order */}
        <section id="how-to-order" className="lx-bare">
          <div className="lx-head on-light" data-reveal="">
            <span className="lx-eyebrow">Simple &amp; sweet</span>
            <h2 className="lx-title">How to Order</h2>
          </div>
          <HowItWorks />
        </section>

        <BorderDivider />

        {/* About */}
        <section id="about-me">
          <div className="lx-head" data-reveal="">
            <span className="lx-eyebrow">Our story</span>
            <h2 className="lx-title">Meet the Maker</h2>
          </div>
          <div className="about-container">
            <div className="about-left" data-reveal="left">
              <img src={site.aboutImage} width={480} height={480} alt={`${site.name}`} loading="lazy" decoding="async" />
            </div>
            <div className="about-right" data-reveal="right">
              <p>
                I am a passionate maker and a proud self-made business owner. What started as a simple hobby
                at my kitchen table grew into three little brands, fuelled by creativity, dedication and an
                unyielding desire to bring joy through handmade gifts.
              </p>
              <p>
                Every resin piece, candle and bar of soap is handcrafted with care, using quality materials and a
                sprinkle of love. Everything is made in small batches so that each one gets the attention it deserves.
              </p>
              <p>
                Each order is more than just a gift — it&apos;s a part of someone&apos;s celebration, and I&apos;m honoured
                to be part of those special moments. My goal remains the same: to deliver beautiful, lasting
                creations that reflect both my artistry and my customers&apos; dreams.
              </p>
              <ul className="lx-badges">
                <li><Icon name="magic" /> Handmade</li>
                <li><Icon name="gift" /> Made to Order</li>
                <li><Icon name="check-circle" /> Small Batches</li>
                {site.fssai && <li><Icon name="check-circle" /> FSSAI {site.fssai}</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery">
          <div className="lx-head" data-reveal="">
            <span className="lx-eyebrow">Handmade moments</span>
            <h2 className="lx-title">Our Creations</h2>
            <p className="lx-sub">Resin, candles, soaps and a little bit of magic.</p>
          </div>
          <Gallery />
        </section>

        <BorderDivider />

        {/* Customer reviews (hidden until real reviews are added in src/lib/reviews.ts) */}
        {reviews.length > 0 && (
          <>
        <section id="customer-reviews">
          <div className="lx-head" data-reveal="">
            <span className="lx-eyebrow">Kind words</span>
            <h2 className="lx-title">What Our Customers Say</h2>
            <p className="lx-sub">Real reviews from our happy customers.</p>
          </div>

          <div className="reviews-container" data-reveal="fade">
            <div className="reviews-scroll">
              {[0, 1].map((copy) => (
                <div key={copy} style={{ display: "contents" }} aria-hidden={copy === 1 ? true : undefined}>
                  {reviews.map((r) => (
                    <div className="review-card" key={r.name}>
                      <div className="review-header">
                        <div className="reviewer-avatar">{r.name.trim().charAt(0).toUpperCase()}</div>
                        <div className="reviewer-info">
                          <h4 aria-level={3}>{r.name}</h4>
                          <div className="stars" aria-label={`${r.stars.length} out of 5 stars`}>{r.stars}</div>
                        </div>
                      </div>
                      <div className="review-text">{stripQuotes(r.text)}</div>
                      <div className="review-date"><Icon name="google" /> Google Review</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="reviews-cta" data-reveal="">
            <a
              href={site.social.googleReviews}
              className="google-reviews-btn"
              id="googleReviewsBtn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="google" /> Read All Google Reviews
            </a>
          </div>
        </section>

          </>
        )}

        {/* FAQ */}
        <section id="faq">
          <div className="lx-head" data-reveal="">
            <span className="lx-eyebrow">Good to know</span>
            <h2 className="lx-title">Frequently Asked Questions</h2>
          </div>
          <Faq />
        </section>

        <BorderDivider />

        {/* Contact */}
        <section id="contact-me">
          <div className="lx-head" data-reveal="">
            <span className="lx-eyebrow">Say hello</span>
            <h2 className="lx-title">Get in Touch</h2>
            <p className="lx-sub">Questions about a gift or a celebration? We&apos;d love to hear from you.</p>
          </div>
          <div className="contact-container">
            <div className="contact-form" data-reveal="left">
              <ContactForm />
            </div>
            <div className="lx-contact-cards" data-reveal="right">
              {contactCards.map((c) => {
                const inner = (
                  <>
                    <span className="lx-contact-icon"><Icon name={c.icon} /></span>
                    <span className="lx-contact-text">
                      <strong>{c.title}</strong>
                      <span>{c.text}</span>
                    </span>
                  </>
                );
                return c.href ? (
                  <a
                    key={c.title}
                    className="lx-contact-card"
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={c.title} className="lx-contact-card static">{inner}</div>
                );
              })}
              <p className="lx-contact-follow">Follow us on Instagram, Facebook, Pinterest and YouTube from the links at the bottom of the page.</p>
            </div>
          </div>
        </section>

        <BorderDivider />
      </main>

      <Footer />
    </div>
  );
}

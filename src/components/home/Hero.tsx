import Link from "next/link";
import Icon from "@/components/Icon";
import { site } from "@/lib/site";
import BannerSlider from "./BannerSlider";

const sparkles = Array.from({ length: 9 }, (_, i) => ({
  left: `${(i * 37 + 8) % 96}%`,
  top: `${(i * 53 + 11) % 88}%`,
  size: 5 + ((i * 7) % 9),
  delay: `${((i * 0.7) % 6).toFixed(1)}s`,
  dur: `${(4 + ((i * 3) % 4)).toFixed(0)}s`,
}));

const trust = [
  { icon: "magic", text: "Handmade in Mumbai" },
  { icon: "gift", text: "Beautifully Gift-Wrapped" },
  { icon: "check-circle", text: "Made Fresh to Order" },
  { icon: "palette", text: "Personalised Designs" },
] as const;

export default function Hero() {
  return (
    <section id="banner" className="lx-hero">
      <div className="glitter-container" aria-hidden="true">
        {sparkles.map((s, i) => (
          <span
            key={i}
            className="sparkle"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
          />
        ))}
      </div>

      <div className="lx-hero-media" data-reveal="zoom">
        <BannerSlider />
      </div>

      <div className="lx-hero-copy">
        <span className="lx-eyebrow on-light-eyebrow lx-hero-in" style={{ "--d": "0.05s" } as React.CSSProperties}>
          Handcrafted in {site.city}
        </span>
        <h1 className="lx-hero-in" style={{ "--d": "0.15s" } as React.CSSProperties}>
          <span className="lx-hero-welcome">Welcome to</span>
          <span className="lx-hero-brand">{site.name}</span>
        </h1>
        <p className="lx-hero-tag lx-hero-in" style={{ "--d": "0.28s" } as React.CSSProperties}>
          Resin art, scented candles and artisan soaps, handcrafted with love and made just for you.
        </p>

        <div className="lx-hero-cta lx-hero-in" style={{ "--d": "0.4s" } as React.CSSProperties}>
          <Link href="/products/" className="lx-btn lx-btn-primary">
            <Icon name="gift" /> Shop Gifts
          </Link>
          <Link href="/special-order/" className="lx-btn lx-btn-light">
            <Icon name="palette" /> Design Your Own
          </Link>
        </div>

        <ul className="lx-trust lx-hero-in" style={{ "--d": "0.52s" } as React.CSSProperties}>
          {trust.map((t) => (
            <li key={t.text}>
              <Icon name={t.icon} /> {t.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

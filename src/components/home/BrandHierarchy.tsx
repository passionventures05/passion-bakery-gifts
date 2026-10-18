import Link from "next/link";
import Icon from "@/components/Icon";
import { GIFT_TYPES } from "@/lib/products";
import { site } from "@/lib/site";

/** Home page only: the store at the top, with its three product brands branching beneath it. */
export default function BrandHierarchy() {
  return (
    <div className="bh">
      <div className="bh-root" data-reveal="">
        <img src="/store-logo.png" width={84} height={84} alt={`${site.name} logo`} loading="lazy" decoding="async" />
        <div>
          <strong>{site.name}</strong>
          <span>One store · three handcrafted brands</span>
        </div>
      </div>

      <div className="bh-stem" aria-hidden="true" />

      <ul className="bh-brands">
        {GIFT_TYPES.map((t, i) => (
          <li key={t.id} className="bh-brand" data-reveal="" style={{ "--i": i } as React.CSSProperties}>
            <Link href={`/products/?type=${t.id}`} className="bh-card">
              <img src={t.logo} width={120} height={120} alt={`${t.brand} logo`} loading="lazy" decoding="async" />
              <span className="bh-kind">{t.name}</span>
              <h3>{t.brand}</h3>
              <span className="bh-tag">{t.tagline}</span>
              <span className="bh-desc">{t.description}</span>
              <span className="bh-go">
                Shop {t.name.toLowerCase()} <Icon name="arrow-right" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

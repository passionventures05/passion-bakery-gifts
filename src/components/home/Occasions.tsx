import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";

const occasions: { name: string; blurb: string; icon: IconName }[] = [
  { name: "Birthday", blurb: "Personal keepsakes and pretty treats.", icon: "gift" },
  { name: "Wedding", blurb: "Favours and hampers for your big day.", icon: "ring" },
  { name: "Anniversary", blurb: "Something warm and lasting for two.", icon: "heart" },
  { name: "Festive & Corporate", blurb: "Diwali, Raksha Bandhan and bulk gifting.", icon: "cheers" },
];

export default function Occasions() {
  return (
    <div className="lx-occasion-grid">
      {occasions.map((o, i) => (
        <Link
          key={o.name}
          href={`/special-order/?occasion=${encodeURIComponent(o.name)}`}
          className="lx-occasion"
          data-reveal=""
          style={{ "--i": i } as React.CSSProperties}
        >
          <span className="lx-occasion-icon"><Icon name={o.icon} /></span>
          <span className="lx-occasion-name">{o.name} Gifts</span>
          <span className="lx-occasion-blurb">{o.blurb}</span>
          <span className="lx-occasion-go">Design yours <Icon name="arrow-right" /></span>
        </Link>
      ))}
    </div>
  );
}

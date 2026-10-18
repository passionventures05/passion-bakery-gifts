import Link from "next/link";
import { site } from "@/lib/site";
import Icon from "@/components/Icon";
import { GIFT_TYPES } from "@/lib/products";

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I place an order?",
    a: (
      <>
        Add gifts to your cart on the <Link href="/products/">Products</Link> page, or request a custom
        piece through <Link href="/special-order/">Special Order</Link>. Your order is sent to us on WhatsApp,
        we confirm availability and the final price, and your order is confirmed once the advance is received.
      </>
    ),
  },
  {
    q: "How much notice do you need?",
    a: (
      <>
        Everything is made to order. Handmade soaps need about {GIFT_TYPES[2].leadTimeLabel}, scented candles about{" "}
        {GIFT_TYPES[1].leadTimeLabel} and resin art about {GIFT_TYPES[0].leadTimeLabel} (resin has to cure fully).
        If your cart has more than one type, the longest one applies.
      </>
    ),
  },
  {
    q: "How does the advance payment work?",
    a: (
      <>
        We ask for {site.advancePercent}% of the total in advance, by UPI ID or QR code. After you send your
        order you&apos;ll see the exact amount. Send us the payment screenshot on WhatsApp and we&apos;ll confirm.
      </>
    ),
  },
  {
    q: "Can you personalise a gift?",
    a: (
      <>
        Yes! Names, initials, colours, scents, photos and gift boxes can all be customised. Fill in the{" "}
        <Link href="/special-order/">Special Order</Link> form, choose the product type, and send any reference
        pictures on WhatsApp. The final price is confirmed after we review your requirements.
      </>
    ),
  },
  {
    q: "Are the candles and soaps safe for sensitive skin or allergies?",
    a: <>Our soaps use gentle natural ingredients and our candles use soy wax, but they do contain fragrance and extracts. Please tell us about any allergy or sensitive skin when you order and we will suggest a suitable option.</>,
  },
  {
    q: "Do you deliver to my area?",
    a: (
      <>
        We serve {site.city} and nearby areas. Check your pincode on the <Link href="/products/">Products</Link>{" "}
        page or ask us on WhatsApp. You can also choose pick-up. Any delivery charge is confirmed before you pay.
      </>
    ),
  },
  {
    q: "What if I need to change or cancel an order?",
    a: <>Please message us on WhatsApp as early as possible. Each piece is made specially for you, so requests are handled case by case, and we&apos;ll always tell you what is possible.</>,
  },
];

export default function Faq() {
  return (
    <div className="lx-faq">
      {faqs.map((f, i) => (
        <details key={f.q} className="lx-faq-item" data-reveal="" style={{ "--i": i } as React.CSSProperties}>
          <summary>
            <span>{f.q}</span>
            <Icon name="chevron-down" />
          </summary>
          <div className="lx-faq-body">{f.a}</div>
        </details>
      ))}
    </div>
  );
}

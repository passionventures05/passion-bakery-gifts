import Icon, { type IconName } from "@/components/Icon";
import { site } from "@/lib/site";

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "gift",
    title: "Choose your gift",
    text: "Pick from our resin art, candles and soaps, or tell us about a custom piece through Special Order.",
  },
  {
    icon: "whatsapp",
    title: "Send us your order",
    text: "Your order arrives on WhatsApp and we confirm availability and the final price with you.",
  },
  {
    icon: "truck",
    title: "Pay & enjoy",
    text: `Pay a ${site.advancePercent}% advance to confirm. We make it fresh to order and deliver or keep it ready for pick-up. Lead time is 2 to 5 days depending on the product type.`,
  },
];

export default function HowItWorks() {
  return (
    <ol className="lx-steps">
      {steps.map((s, i) => (
        <li key={s.title} className="lx-step" data-reveal="" style={{ "--i": i } as React.CSSProperties}>
          <span className="lx-step-num" aria-hidden="true">{i + 1}</span>
          <span className="lx-step-icon"><Icon name={s.icon} /></span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

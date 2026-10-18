"use client";

import { useEffect, useRef, useState } from "react";
import BorderDivider from "@/components/BorderDivider";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/useToast";
import { openWhatsApp } from "@/lib/external";
import { GIFT_TYPES, typeById } from "@/lib/products";
import { site } from "@/lib/site";
import { digitsOnly, earliestDelivery, toDateInput, validatePhoneNumber } from "@/lib/validation";
import "@/styles/special-order.css";
import "@/styles/luxe-special-order.css";
import "@/styles/royal.css";

const MAX_QTY = 100;

interface Field {
  id: string;
  label: string;
  kind: "text" | "select" | "textarea";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
}

/** The extra questions that depend on the chosen product type. Required ones are checked before sending. */
const TYPE_FIELDS: Record<string, Field[]> = {
  resin: [
    { id: "item", label: "What would you like us to make?", kind: "select", required: true,
      options: ["Coaster set", "Serving tray", "Keychain", "Jewellery / pendant", "Wall clock", "Photo or flower frame", "Nameplate / sign", "Something else (describe below)"] },
    { id: "colours", label: "Colour theme", kind: "text", required: true, placeholder: "e.g., Ocean blue with gold flakes, or blush pink and white" },
    { id: "size", label: "Size or shape", kind: "text", placeholder: "e.g., Round 4 inch, or a heart shape (optional)" },
    { id: "embed", label: "Anything to set inside the resin?", kind: "text", placeholder: "e.g., Real flowers, glitter, a photo, small keepsake (optional)" },
  ],
  candles: [
    { id: "item", label: "Type of candle", kind: "select", required: true,
      options: ["Jar candle", "Pillar candle", "Floating candles", "Gift set / hamper", "Wedding or party favours", "Something else (describe below)"] },
    { id: "scent", label: "Fragrance", kind: "text", required: true, placeholder: "e.g., Vanilla, Lavender, Pine & Cedar, Rose" },
    { id: "size", label: "Candle size", kind: "select", required: true,
      options: ["Mini (about 50 g)", "Small (about 100 g)", "Medium (about 200 g)", "Large (300 g or more)"] },
    { id: "colours", label: "Wax or jar colour", kind: "text", placeholder: "e.g., Ivory with a gold lid (optional)" },
    { id: "label", label: "Custom label or message", kind: "text", placeholder: "e.g., “Thank you, Riya” printed on the label (optional)" },
  ],
  soaps: [
    { id: "item", label: "Type of soap", kind: "select", required: true,
      options: ["Single bars", "Gift box", "Wedding or party favours", "Hamper with other items", "Something else (describe below)"] },
    { id: "scent", label: "Fragrance or ingredient", kind: "text", required: true, placeholder: "e.g., Rose & milk, Saffron, Oatmeal & honey" },
    { id: "skin", label: "Skin type", kind: "select", required: true, options: ["Any / normal", "Dry", "Oily", "Sensitive"] },
    { id: "shape", label: "Shape or packaging", kind: "select", options: ["Our usual bar", "Heart or flower shape", "Ribbon-tied wrap", "Keepsake gift box"] },
    { id: "allergies", label: "Allergies to avoid", kind: "text", placeholder: "e.g., Nuts, fragrance, essential oils (optional)" },
  ],
};

interface FormState {
  type: string;
  occasion: string;
  details: string;
  personalise: string;
  specialRequest: string;
  deliveryDate: string;
  deliveryMode: string;
  address: string;
  name: string;
  phone: string;
}

const initial: FormState = {
  type: "",
  occasion: "",
  details: "",
  personalise: "",
  specialRequest: "",
  deliveryDate: "",
  deliveryMode: "",
  address: "",
  name: "",
  phone: "",
};

const MODE_LABEL: Record<string, string> = { pickup: "Pickup", "to-go": "Home Delivery" };

const findErrors = (f: FormState, extra: Record<string, string>): Record<string, string> => {
  const e: Record<string, string> = {};
  const t = typeById(f.type);
  if (!t) e["type"] = "Please choose the type of product first.";
  for (const field of TYPE_FIELDS[f.type] ?? []) {
    if (field.required && !(extra[field.id] ?? "").trim())
      e[`x-${field.id}`] = field.kind === "select" ? "Please choose an option." : "Please fill this in.";
  }
  if (!f.occasion.trim()) e["occasion"] = "Please tell us the occasion.";
  if (!f.deliveryDate) e["delivery-date"] = "Please choose a delivery date.";
  else if (f.deliveryDate < toDateInput(earliestDelivery(new Date(), t?.leadTimeHours)))
    e["delivery-date"] = `Please choose a date at least ${t?.leadTimeLabel ?? `${site.leadTimeHours} hours`} from now.`;
  if (!f.deliveryMode) e["delivery-mode"] = "Please choose pickup or home delivery.";
  if (!f.address.trim()) e["address"] = "Please enter your complete address.";
  if (!f.name.trim()) e["name"] = "Please enter your name.";
  if (!f.phone.trim()) e["phone"] = "Please enter your phone number.";
  else if (!validatePhoneNumber(f.phone.trim()))
    e["phone"] = "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
  return e;
};

export default function SpecialOrderView() {
  const [form, setForm] = useState<FormState>(initial);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const lastMessage = useRef("");
  const { toast, element: toastEl } = useToast();

  const giftType = typeById(form.type);

  // the earliest date depends on the product type chosen (resin needs longer than soap)
  useEffect(() => setMinDate(toDateInput(earliestDelivery(new Date(), giftType?.leadTimeHours))), [giftType]);

  // arriving from the home page: /special-order/?occasion=Birthday or ?type=candles
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const occasion = q.get("occasion");
    const type = q.get("type");
    setForm((f) => ({
      ...f,
      occasion: f.occasion || (occasion ? occasion.slice(0, 60) : ""),
      type: f.type || (type && typeById(type) ? type : ""),
    }));
  }, []);

  const clearError = (errorId?: string) => {
    if (!errorId) return;
    setErrors((e) => {
      if (!e[errorId]) return e;
      const { [errorId]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K], errorId?: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    clearError(errorId);
  };

  const setExtraField = (id: string, value: string) => {
    setExtra((x) => ({ ...x, [id]: value }));
    clearError(`x-${id}`);
  };

  const chooseType = (value: string) => {
    set("type", value, "type");
    setExtra({}); // different product types ask different questions
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith("x-") && k !== "delivery-date")));
  };

  const aria = (id: string) => ({
    "aria-invalid": errors[id] ? (true as const) : undefined,
    "aria-describedby": errors[id] ? `err-${id}` : undefined,
  });
  const fieldError = (id: string) =>
    errors[id] ? (
      <p className="lx-field-error" id={`err-${id}`} role="alert">
        <Icon name="exclamation-triangle" /> {errors[id]}
      </p>
    ) : null;

  const focusFirst = (found: Record<string, string>) => {
    const order = ["type", ...Object.keys(found)];
    const id = order.find((k) => found[k]);
    const el = id ? document.getElementById(id) : null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => el?.focus({ preventScroll: true }), 300);
  };

  const buildMessage = () => {
    const t = giftType!;
    const lines = (TYPE_FIELDS[t.id] ?? [])
      .filter((f) => (extra[f.id] ?? "").trim())
      .map((f) => `• ${f.label.replace(/\?$/, "")}: ${extra[f.id].trim()}`);
    return (
      `🎁 *${site.name} - Special Order* 🎁\n\n` +
      `🛍️ Product type: ${t.name} (${t.brand})\n` +
      `${lines.join("\n")}\n` +
      `🔢 Quantity: ${quantity}\n` +
      `🎉 Occasion: ${form.occasion.trim()}\n` +
      `✏️ Name / message to include: ${form.personalise.trim() || "None"}\n` +
      `🎨 Design details: ${form.details.trim() || "No special design requirements"}\n` +
      `💭 Other request: ${form.specialRequest.trim() || "None"}\n\n` +
      `📅 Delivery Date: ${form.deliveryDate}\n` +
      `🚚 Delivery Mode: ${MODE_LABEL[form.deliveryMode] ?? form.deliveryMode}\n` +
      `📍 Address: ${form.address.trim()}\n\n` +
      `👤 Name: ${form.name.trim()}\n` +
      `📞 Phone: ${form.phone.trim()}\n\n` +
      `📸 *Please send any reference images for the design in your next message*`
    );
  };

  const openChat = async () => {
    try {
      await openWhatsApp(lastMessage.current);
    } catch {
      toast(`We couldn't open WhatsApp. Please message us directly on ${site.phoneDisplay}.`);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findErrors(form, extra);
    if (Object.keys(found).length) {
      setErrors(found);
      return focusFirst(found);
    }
    lastMessage.current = buildMessage();
    setSent(true);
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    void openChat();
  };

  const startOver = () => {
    setForm(initial);
    setExtra({});
    setQuantity(1);
    setSent(false);
    setErrors({});
  };

  const renderField = (f: Field) => {
    const id = `x-${f.id}`;
    return (
      <div className="form-group" key={`${form.type}-${f.id}`}>
        <label htmlFor={id}>
          {f.label}
          {!f.required && <span className="opt"> (optional)</span>}
        </label>
        {f.kind === "select" ? (
          <select id={id} name={id} value={extra[f.id] ?? ""} {...aria(id)} onChange={(e) => setExtraField(f.id, e.target.value)}>
            <option value="">{f.required ? "Please choose" : "No preference"}</option>
            {f.options?.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : f.kind === "textarea" ? (
          <textarea id={id} name={id} placeholder={f.placeholder} {...aria(id)} value={extra[f.id] ?? ""}
            onChange={(e) => setExtraField(f.id, e.target.value)}></textarea>
        ) : (
          <input type="text" id={id} name={id} placeholder={f.placeholder} {...aria(id)} value={extra[f.id] ?? ""}
            onChange={(e) => setExtraField(f.id, e.target.value)} />
        )}
        {fieldError(id)}
      </div>
    );
  };

  return (
    <div className="site page-special-order">
      <Navbar active="special-order" />
      {toastEl}
      <main id="main" tabIndex={-1}>
        <div ref={topRef} className="lx-scroll-anchor" />
        <div className="lx-head on-light" data-reveal="">
          <span className="lx-eyebrow">Made just for you</span>
          <h1 className="lx-title">Design Your Own Gift</h1>
          <p className="lx-sub">Choose what you&apos;d like us to make and tell us your vision. We&apos;ll confirm the design and final price on WhatsApp.</p>
        </div>

        <div className="container">
          {sent ? (
            <div className="lx-so-result" aria-live="polite">
              <div className="lx-so-result-icon"><Icon name="whatsapp" /></div>
              <h2 className="lx-step-title" ref={headingRef} tabIndex={-1}>Almost done — send it on WhatsApp</h2>
              <p className="lx-so-lead">
                We&apos;ve opened WhatsApp with your order. <strong>Press Send there</strong> to complete it, and attach any reference pictures for the design.
              </p>
              <div className="lx-so-actions column">
                <button type="button" className="lx-btn lx-btn-primary" onClick={openChat}>
                  <Icon name="whatsapp" /> Open WhatsApp again
                </button>
                <button type="button" className="lx-btn lx-btn-light" onClick={() => setSent(false)}>
                  <Icon name="chevron-left" /> Review or change my order
                </button>
                <button type="button" className="lx-so-link" onClick={startOver}>Start a new order</button>
              </div>
            </div>
          ) : (
            <form id="special-order-form" onSubmit={onSubmit} noValidate>
              <div className="lx-so-step">
                <h2 className="lx-step-title">
                  <span>1</span>
                  Choose your product
                </h2>

                <div className="form-group">
                  <label htmlFor="type">Product type</label>
                  <select id="type" name="type" value={form.type} {...aria("type")} onChange={(e) => chooseType(e.target.value)}>
                    <option value="">Select a product type</option>
                    {GIFT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — {t.brand}</option>
                    ))}
                  </select>
                  {fieldError("type")}
                </div>

                {giftType && (
                  <div className="lx-note-box" aria-live="polite">
                    <Icon name="info-circle" />
                    <p>
                      <strong>{giftType.brand}:</strong> {giftType.description}{" "}
                      <strong>Please order at least {giftType.leadTimeLabel} ahead.</strong> {giftType.leadTimeNote}
                    </p>
                  </div>
                )}

                {giftType && (TYPE_FIELDS[giftType.id] ?? []).map(renderField)}

                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <div className="weight-input-wrapper">
                    <button type="button" className="weight-btn" id="decrease-quantity" aria-label="Decrease quantity"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                      −
                    </button>
                    <input type="number" id="quantity" name="quantity" value={quantity} min={1} max={MAX_QTY} step={1} readOnly />
                    <button type="button" className="weight-btn" id="increase-quantity" aria-label="Increase quantity"
                      onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}>
                      +
                    </button>
                  </div>
                  <div className="weight-display">
                    <Icon name="balance-scale" />
                    <span>Number of pieces or sets. For bulk or corporate orders, mention it below.</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="occasion">Occasion</label>
                  <input type="text" id="occasion" name="occasion" placeholder="e.g., Birthday, Anniversary, Wedding, Diwali" {...aria("occasion")}
                    value={form.occasion} onChange={(e) => set("occasion", e.target.value, "occasion")} />
                  {fieldError("occasion")}
                </div>

                <div className="form-group">
                  <label htmlFor="personalise">Name or message to include <span className="opt">(optional)</span></label>
                  <input type="text" id="personalise" name="personalise" placeholder="e.g., “Happy Birthday Riya” or initials A & R"
                    value={form.personalise} onChange={(e) => set("personalise", e.target.value)} />
                </div>

                <div className="form-group">
                  <label htmlFor="details">Design details <span className="opt">(optional)</span></label>
                  <textarea id="details" name="details" rows={3}
                    placeholder="Describe your idea: theme, colours, style, anything you have in mind"
                    value={form.details} onChange={(e) => set("details", e.target.value)}></textarea>
                  <small className="lx-hint">
                    <Icon name="camera" /> If you have reference images, please send them via WhatsApp after submitting this form
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="special-request">Any other request <span className="opt">(optional)</span></label>
                  <textarea id="special-request" name="special-request" placeholder="Tell us any special requirements, budget or preferences..."
                    value={form.specialRequest} onChange={(e) => set("specialRequest", e.target.value)}></textarea>
                </div>

                <div className="lx-note-box">
                  <Icon name="info-circle" />
                  <p>
                    <strong>Note:</strong> The final pricing for your custom order will be confirmed after our team
                    carefully reviews your specific requirements. We&apos;ll get back to you shortly with a detailed quote.
                  </p>
                </div>
              </div>

              <div className="lx-so-step">
                <h2 className="lx-step-title">
                  <span>2</span>
                  Delivery
                </h2>

                <div className="form-group">
                  <label htmlFor="delivery-date">
                    Date for order delivery (at least {giftType?.leadTimeLabel ?? `${site.leadTimeHours} hours`} from now)
                  </label>
                  <input type="date" id="delivery-date" name="delivery-date" min={minDate} {...aria("delivery-date")}
                    value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value, "delivery-date")} />
                  {!giftType && <small className="lx-hint">Choose a product type above to see its exact lead time.</small>}
                  {fieldError("delivery-date")}
                </div>

                <div className="form-group">
                  <label htmlFor="delivery-mode">Mode of delivery</label>
                  <select id="delivery-mode" name="delivery-mode" value={form.deliveryMode} {...aria("delivery-mode")}
                    onChange={(e) => set("deliveryMode", e.target.value, "delivery-mode")}>
                    <option value="">Select delivery mode</option>
                    <option value="pickup">Pickup</option>
                    <option value="to-go">Home Delivery</option>
                  </select>
                  {fieldError("delivery-mode")}
                </div>

                <div className="form-group">
                  <label htmlFor="address">Delivery address</label>
                  <textarea id="address" name="address" placeholder="Enter your complete delivery address" {...aria("address")}
                    value={form.address} onChange={(e) => set("address", e.target.value, "address")}></textarea>
                  {fieldError("address")}
                </div>
              </div>

              <div className="lx-so-step">
                <h2 className="lx-step-title">
                  <span>3</span>
                  Your details
                </h2>

                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" placeholder="Enter your full name" autoComplete="name" {...aria("name")}
                    value={form.name} onChange={(e) => set("name", e.target.value, "name")} />
                  {fieldError("name")}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone number</label>
                  <input type="tel" id="phone" name="phone" placeholder="Enter your 10-digit mobile number" autoComplete="tel-national" inputMode="numeric" maxLength={10} {...aria("phone")}
                    value={form.phone} onChange={(e) => set("phone", digitsOnly(e.target.value), "phone")} />
                  {fieldError("phone")}
                </div>
              </div>

              <div className="lx-so-actions">
                <button type="submit" className="lx-btn lx-btn-primary">
                  <Icon name="whatsapp" /> Send Order on WhatsApp
                </button>
              </div>
            </form>
          )}
        </div>

        <BorderDivider />
      </main>
      <Footer />
    </div>
  );
}

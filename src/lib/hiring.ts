import { site } from "./site";

/**
 * Hiring page settings. Edit here to add a role, change a question or change where applications go.
 * Applications and questions are sent to `site.email` (no phone number is asked for or shown).
 */
export interface HireField {
  id: string;
  label: string;
  kind: "text" | "textarea" | "select";
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface HireRole {
  id: string;
  label: string;
  /** one line shown under the role picker */
  blurb: string;
  /** "business" roles also ask for a business name */
  business: boolean;
  fields: HireField[];
}

const yesNo = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export const HIRE_ROLES: HireRole[] = [
  {
    id: "delivery",
    label: "Delivery partner",
    blurb: "Deliver fresh orders to our customers across the city.",
    business: false,
    fields: [
      {
        id: "vehicle", label: "Vehicle you will use", kind: "select", required: true,
        options: [
          { value: "Bike / scooter", label: "Bike / scooter" },
          { value: "Bicycle", label: "Bicycle" },
          { value: "Car", label: "Car" },
          { value: "Van / tempo", label: "Van / tempo" },
          { value: "I don't have a vehicle yet", label: "I don't have a vehicle yet" },
        ],
      },
      { id: "licence", label: "Valid driving licence", kind: "select", required: true, options: [...yesNo, { value: "Applying", label: "Applying" }] },
      { id: "areas", label: "Areas you can deliver in", kind: "text", required: true, placeholder: "e.g. Andheri, Bandra, Powai" },
      {
        id: "availability", label: "Availability", kind: "select", required: true,
        options: [
          { value: "Full time", label: "Full time" },
          { value: "Part time", label: "Part time" },
          { value: "Weekends & festivals only", label: "Weekends & festivals only" },
        ],
      },
      { id: "experience", label: "Delivery experience", kind: "text", placeholder: "e.g. 2 years with a food delivery app (or type 'None')" },
    ],
  },
  {
    id: "material-supply",
    label: "Raw material supplier",
    blurb: "Supply resin, wax, soap base, fragrance oils, dried flowers, moulds or other craft materials.",
    business: true,
    fields: [
      { id: "supplies", label: "What can you supply?", kind: "textarea", required: true, placeholder: "e.g. Epoxy resin, soy wax, soap base, fragrance oils, silicone moulds" },
      { id: "capacity", label: "Capacity per month", kind: "text", required: true, placeholder: "e.g. 200 kg resin or 500 moulds" },
      { id: "minorder", label: "Minimum order size", kind: "text", placeholder: "e.g. ₹5,000 or 25 kg" },
      { id: "leadtime", label: "Usual lead time for an order", kind: "text", placeholder: "e.g. 3 days" },
      { id: "gst", label: "GST number", kind: "text", placeholder: "Type 'None' if you don't have one" },
      { id: "link", label: "Website, Instagram or catalogue link", kind: "text", placeholder: "Link to your products or price list" },
    ],
  },
  {
    id: "packaging-supply",
    label: "Packaging & party material supplier",
    blurb: "Supply gift boxes, wrapping, ribbons, balloons, decor and party props.",
    business: true,
    fields: [
      { id: "supplies", label: "What can you supply?", kind: "textarea", required: true, placeholder: "e.g. Gift boxes, wrapping paper, ribbons, balloons, banners" },
      { id: "minorder", label: "Minimum order size", kind: "text", placeholder: "e.g. ₹5,000 or 100 pieces" },
      { id: "leadtime", label: "Usual lead time for an order", kind: "text", placeholder: "e.g. 3 days" },
      { id: "gst", label: "GST number", kind: "text", placeholder: "Type 'None' if you don't have one" },
      { id: "link", label: "Website, Instagram or catalogue link", kind: "text", placeholder: "Link to your products or price list" },
    ],
  },
  {
    id: "studio",
    label: "Studio & craft team",
    blurb: "Join our studio as a resin artist, candle or soap maker, or packing helper.",
    business: false,
    fields: [
      {
        id: "skill", label: "What you do best", kind: "select", required: true,
        options: [
          { value: "Resin art", label: "Resin art" },
          { value: "Candle making", label: "Candle making" },
          { value: "Soap making", label: "Soap making" },
          { value: "Gift packing & finishing", label: "Gift packing & finishing" },
        ],
      },
      { id: "experience", label: "Experience", kind: "text", required: true, placeholder: "e.g. 2 years making resin art (or type 'Fresher')" },
      {
        id: "availability", label: "Availability", kind: "select", required: true,
        options: [
          { value: "Full time", label: "Full time" },
          { value: "Part time", label: "Part time" },
          { value: "Festival season only", label: "Festival season only" },
        ],
      },
      { id: "link", label: "Link to your work", kind: "text", placeholder: "Instagram or Google Drive link with photos (optional)" },
    ],
  },
  {
    id: "other",
    label: "Something else",
    blurb: "Photography, social media, events — tell us how you can help.",
    business: false,
    fields: [
      { id: "offer", label: "How would you like to work with us?", kind: "textarea", required: true, placeholder: "Describe the role or service you have in mind" },
      { id: "link", label: "Link to your work", kind: "text", placeholder: "Portfolio, Instagram or website (optional)" },
    ],
  },
];

export const findRole = (id: string) => HIRE_ROLES.find((r) => r.id === id);

/** Keeps the email link short enough for mail apps. */
export const MAX_FIELD_LENGTH = 500;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export interface Application {
  role: HireRole;
  details: Record<string, string>;
  name: string;
  business: string;
  email: string;
  city: string;
  message: string;
}

export const buildApplicationText = (a: Application) => {
  const lines = [
    `Role: ${a.role.label}`,
    `Name: ${a.name.trim()}`,
    ...(a.role.business ? [`Business name: ${a.business.trim() || "-"}`] : []),
    `Email: ${a.email.trim()}`,
    `City / area: ${a.city.trim()}`,
    "",
    ...a.role.fields.map((f) => `${f.label}: ${a.details[f.id]?.trim() || "-"}`),
    "",
    "About me:",
    a.message.trim() || "-",
  ];
  return lines.join("\n");
};

export const applicationSubject = (a: Application) => `Application: ${a.role.label} - ${a.name.trim()}`;

/** mailto: link to the business email. */
export const mailtoUrl = (subject: string, body: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

import type { Product, SizeOption, Unit } from "@/types";
import { formatAmount } from "./format";
import giftTypes from "./gift-types.json";
import { site } from "./site";

export const PRODUCTS_PER_PAGE = 24;
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const DEFAULT_DESCRIPTION = "Handcrafted with love, made to order.";
const DEFAULT_QUANTITIES = "1pc";

/** Product types (Resin Art / Scented Candles / Handmade Soaps) and their categories live in gift-types.json. */
export interface GiftType {
  id: string;
  name: string;
  brand: string;
  logo: string;
  tagline: string;
  description: string;
  highlights: string[];
  leadTimeHours: number;
  leadTimeLabel: string;
  leadTimeNote: string;
  categories: string[];
}
export const GIFT_TYPES: GiftType[] = giftTypes.types;
export const typeById = (id: string | undefined) => GIFT_TYPES.find((t) => t.id === id);
export const typeOfCategory = (category: unknown) =>
  GIFT_TYPES.find((t) => t.categories.some((c) => c.toLowerCase() === String(category).toLowerCase().trim()))?.id ?? "";
export const typeOfProduct = (p: Pick<Product, "type" | "category">) => p.type || typeOfCategory(p.category);
export const placeholderFor = (typeId: string | undefined) => `/placeholders/${typeById(typeId)?.id ?? "gift"}.svg`;

/** Longest lead time among the given product types (falls back to the site default). */
export const leadTimeHoursFor = (typeIds: Iterable<string | undefined>) => {
  const hours = [...typeIds].map((id) => typeById(id)?.leadTimeHours ?? 0);
  return Math.max(site.leadTimeHours, ...hours);
};

const ALL_CATEGORIES = GIFT_TYPES.flatMap((t) => t.categories);
export const TAG_MAPPING: Record<string, string> = Object.fromEntries(
  ALL_CATEGORIES.map((c, i) => [c.toLowerCase(), `tag${i + 1}`])
);
export const FILTER_OPTIONS: { value: string; label: string }[] = ALL_CATEGORIES.map((c, i) => ({
  value: `tag${i + 1}`,
  label: c,
}));

export const normalizeCategory = (category: unknown) => String(category).toLowerCase().trim();
export const getCategoryTag = (category: unknown) => TAG_MAPPING[normalizeCategory(category)] || "";

/**
 * Understands "500gm", "500g", "1kg", "1.5 kg", "3pc", "3 pieces". A bare number is
 * pieces when small (< 50) and grams otherwise. Returns null for garbage.
 */
export const parseQuantity = (raw: unknown): { amount: number; unit: Unit } | null => {
  const m = String(raw ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .match(/^(\d+(?:\.\d+)?)(kg|gm|g|pcs|pc|pieces|piece)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const u = m[2];
  if (u === "kg") return { amount: Math.round(n * 1000), unit: "g" };
  if (u === "gm" || u === "g") return { amount: n, unit: "g" };
  if (u) return { amount: n, unit: "pc" };
  return n < 50 ? { amount: n, unit: "pc" } : { amount: n, unit: "g" };
};

/** price for `amount` when `baseAmount` costs `basePrice`, rounded to whole rupees */
export const calculatePrice = (basePrice: number, baseAmount: number, amount: number) =>
  Math.round(basePrice * (amount / baseAmount));

export const buildSizeOptions = (product: Product): SizeOption[] => {
  const basePrice = parseFloat(String(product.basePrice)) || 0;
  const base = parseQuantity(product.baseQuantity) ?? { amount: 1, unit: "pc" as Unit };
  const list = (product.availableQuantities || DEFAULT_QUANTITIES)
    .split(",")
    .map(parseQuantity)
    .filter((q): q is { amount: number; unit: Unit } => q !== null && q.unit === base.unit);
  const unique = [...new Map(list.map((q) => [q.amount, q])).values()].sort((a, b) => a.amount - b.amount);
  const options = unique.length ? unique : [base];
  return options.map((q) => ({
    amount: q.amount,
    unit: q.unit,
    label: formatAmount(q.amount, q.unit),
    price: calculatePrice(basePrice, base.amount, q.amount),
  }));
};

// ---- 5 minute sessionStorage cache ----
const CACHE_KEY = "productsCache";

export const getCachedProducts = (): Product[] | null => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const setCachedProducts = (data: Product[]) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn("Cache storage failed:", e);
  }
};

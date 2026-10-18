export interface Product {
  name: string;
  baseQuantity: string;
  basePrice: number | string;
  category: string;
  /** product type id ("resin" | "candles" | "soaps"), derived from the category at build time */
  type?: string;
  availableQuantities: string;
  description: string;
  /** photo path chosen in the CMS, e.g. "/uploads/products/x.jpg" */
  image?: string;
}

/** "g" = grams (sold by weight), "pc" = pieces. */
export type Unit = "g" | "pc";

export interface SizeOption {
  /** grams or pieces, depending on unit */
  amount: number;
  unit: Unit;
  label: string;
  /** whole-rupee price for ONE of this size */
  price: number;
}

export interface CartItem {
  name: string;
  amount: number;
  unit: Unit;
  label: string;
  /** price of one unit of this size, in whole rupees */
  unitPrice: number;
  quantity: number;
  /** product type id, used to work out the lead time for the order */
  type?: string;
}

/** keyed by cartKey(name, amount, unit) so one product can be in the cart in several sizes */
export type CartData = Record<string, CartItem>;

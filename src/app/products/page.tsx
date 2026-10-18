import type { Metadata } from "next";
import ProductsView from "@/components/products/ProductsView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gifts Collection",
  description: `Browse handmade resin art, scented candles and artisan soaps from ${site.name}, ${site.city}. Made to order.`,
  alternates: { canonical: "/products/" },
};

export default function ProductsPage() {
  return <ProductsView />;
}

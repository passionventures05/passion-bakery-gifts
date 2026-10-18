import type { Metadata } from "next";
import SpecialOrderView from "@/components/special-order/SpecialOrderView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Special Order",
  description: `Request a custom resin piece, candle or soap for birthdays, weddings and celebrations from ${site.name}, ${site.city}.`,
  alternates: { canonical: "/special-order/" },
};

export default function SpecialOrderPage() {
  return <SpecialOrderView />;
}

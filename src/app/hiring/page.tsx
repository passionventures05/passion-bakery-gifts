import type { Metadata } from "next";
import HiringView from "@/components/hiring/HiringView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "We Are Hiring",
  description: `Join ${site.name}, ${site.city}. We are hiring delivery partners, material and packaging suppliers and studio craft team members.`,
  alternates: { canonical: "/hiring/" },
};

export default function HiringPage() {
  return <HiringView />;
}

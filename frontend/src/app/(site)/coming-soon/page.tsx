import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon/ComingSoon";

export const metadata: Metadata = { title: "Coming Soon" };

export default function ComingSoonPage() {
  return <ComingSoon />;
}

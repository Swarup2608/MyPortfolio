import type { Metadata, Viewport } from "next";
import { Report2026 } from "./Report2026";

export const metadata: Metadata = {
  title: "Swarup — 2026 Contribution & Learning Report",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function Report2026Page() {
  return <Report2026 />;
}

import { notFound } from "next/navigation";

// The app has two root layouts, so there's no single root not-found for unmatched URLs.
// Catching them here renders (site)/not-found.tsx inside the site's nav and footer.
export default function MissingPage() {
  notFound();
}

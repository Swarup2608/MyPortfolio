import { notFound } from "next/navigation";

// Unknown /admin/* URLs land here so the 404 renders inside the admin shell.
export default function AdminMissingPage() {
  notFound();
}

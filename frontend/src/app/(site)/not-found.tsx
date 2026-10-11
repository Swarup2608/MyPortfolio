import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StatusScreen } from "@/components/ui/StatusScreen";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="max-w-6xl py-6 sm:py-10">
      <StatusScreen
        code="404"
        title="Page not found"
        message="This page doesn't exist or has moved. Check the address, or head back to the homepage."
        href="/"
        linkLabel="Back home"
        className="min-h-[calc(100dvh-7rem)] sm:min-h-[calc(100dvh-9.75rem)]"
      />
    </Container>
  );
}

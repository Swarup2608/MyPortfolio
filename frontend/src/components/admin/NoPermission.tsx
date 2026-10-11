import { StatusScreen } from "@/components/ui/StatusScreen";

// Sized to fill the admin content area under the sticky top bar.
export const ADMIN_SCREEN_HEIGHT = "min-h-[calc(100dvh-7rem)] sm:min-h-[calc(100dvh-10rem)]";

export function NoPermission({ section = "this section" }: { section?: string }) {
  return (
    <StatusScreen
      code="403"
      title="No permission"
      message={
        <>
          Your role doesn&apos;t include access to {section}. Ask an admin to update your
          permissions if you need it.
        </>
      }
      href="/admin"
      linkLabel="Back to dashboard"
      className={ADMIN_SCREEN_HEIGHT}
    />
  );
}

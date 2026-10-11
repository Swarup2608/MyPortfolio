import { StatusScreen } from "@/components/ui/StatusScreen";
import { ADMIN_SCREEN_HEIGHT } from "@/components/admin/NoPermission";

export default function AdminNotFound() {
  return (
    <StatusScreen
      code="404"
      title="Not found"
      message="This page or record doesn't exist. It may have been deleted, or the link is wrong."
      href="/admin"
      linkLabel="Back to dashboard"
      className={ADMIN_SCREEN_HEIGHT}
    />
  );
}

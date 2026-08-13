import { AdminAuthProvider } from "@/lib/adminAuthContext";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}

import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSiteSettings } from "@/lib/home/content";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const { name } = await getSiteSettings();
  return (
    <AdminShell login={session.login} siteName={name}>
      {children}
    </AdminShell>
  );
}

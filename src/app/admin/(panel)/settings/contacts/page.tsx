import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { BlockEditPage } from "@/components/admin/home/BlockEditPage";

export const metadata: Metadata = { title: "Контакты" };

export default async function ContactsSettingsPage() {
  await requireAdmin();
  return <BlockEditPage blockKey="contacts" previewHref="/#contact" />;
}

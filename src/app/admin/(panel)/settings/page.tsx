import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { BlockEditPage } from "@/components/admin/home/BlockEditPage";

export const metadata: Metadata = { title: "Настройки сайта" };

export default async function GeneralSettingsPage() {
  await requireAdmin();
  return <BlockEditPage blockKey="general" previewHref="/" />;
}

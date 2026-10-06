import type { Metadata } from "next";
import { listMediaAction } from "./actions";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export const metadata: Metadata = { title: "Медиатека" };

export default async function MediaPage() {
  // listMediaAction сам проверяет права администратора
  const items = await listMediaAction();
  return <MediaLibrary items={items} />;
}

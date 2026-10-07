import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Админ-панель",
    template: "%s · Админ-панель",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

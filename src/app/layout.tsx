import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import { siteConfig } from "@/lib/site";
// Шрифты из npm-пакетов Fontsource, а не next/font/google: сборка не
// зависит от доступности Google Fonts и от формата его ответа (Turbopack
// в Next 15.5 не разбирает ссылки вида fonts.gstatic.com/l/font?kit=…&…)
import "@fontsource-variable/manrope";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.title}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — психолог и расстановщик`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 1500,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — психолог и расстановщик`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
      >
        <Providers>
          <PersonJsonLd />
          <Header />
          <main className="pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileStickyCta />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

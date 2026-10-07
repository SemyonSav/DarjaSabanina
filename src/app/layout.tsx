import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/home/content";
// Шрифты из npm-пакетов Fontsource, а не next/font/google: сборка не
// зависит от доступности Google Fonts и от формата его ответа (Turbopack
// в Next 15.5 не разбирает ссылки вида fonts.gstatic.com/l/font?kit=…&…)
import "@fontsource-variable/manrope";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";

// Имя, описание и картинка редактируются в админке — читаем их из БД
// на каждый запрос (и не обращаемся к БД при сборке)
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const defaultTitle = `${settings.name} — ${settings.jobTitle}`;
  const image = settings.shareImage;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: defaultTitle, template: `%s · ${settings.name}` },
    description: settings.description,
    applicationName: settings.name,
    authors: [{ name: settings.name }],
    creator: settings.name,
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: settings.name,
      title: defaultTitle,
      description: settings.description,
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: settings.description,
      images: [image.url],
    },
    // Коды подтверждения прав из Яндекс.Вебмастера и Google Search Console
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      yandex: process.env.YANDEX_VERIFICATION || undefined,
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { name } = await getSiteSettings();
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${name} — статьи`}
          href="/rss.xml"
        />
      </head>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

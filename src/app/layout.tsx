import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/home/content";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

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
        className={`${manrope.variable} ${cormorant.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

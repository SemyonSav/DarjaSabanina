import { siteConfig } from "@/lib/site";

export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: "Психолог, психосоматолог, расстановщик",
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.avatar}`,
    telephone: siteConfig.phoneHref.replace("tel:", ""),
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      addressCountry: "RU",
    },
    sameAs: [siteConfig.telegram],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

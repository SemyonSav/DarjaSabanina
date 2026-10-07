import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { JsonLd } from "@/components/seo/JsonLd";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { graph, personSchema, websiteSchema } from "@/lib/seo/jsonld";
import { getSiteSettings } from "@/lib/home/content";

/** Шапка, подвал и общие элементы публичной части сайта */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd data={graph(personSchema(settings), websiteSchema(settings))} />
      <Header name={settings.name} nav={settings.nav} />
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer settings={settings} />
      <MobileStickyCta phone={settings.contacts.phone} />
      <ScrollToTop />
      <YandexMetrika />
    </>
  );
}

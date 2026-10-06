import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, personSchema, websiteSchema } from "@/lib/seo/jsonld";

/** Шапка, подвал и общие элементы публичной части сайта */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={graph(personSchema(), websiteSchema())} />
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileStickyCta />
      <ScrollToTop />
    </>
  );
}

import { Fragment } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Requests } from "@/components/sections/Requests";
import { Constellations } from "@/components/sections/Constellations";
import { Blog } from "@/components/sections/Blog";
import { WhyMe } from "@/components/sections/WhyMe";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFeaturedArticles, getTestimonials } from "@/lib/cms";
import {
  getHomeSections,
  getSiteSettings,
  type HomeSection,
  type SiteSettings,
} from "@/lib/home/content";
import { faqSchema, graph, professionalServiceSchema } from "@/lib/seo/jsonld";
import {
  toArticleSummary,
  type ArticleSummary,
  type Testimonial,
} from "@/types";

// Данные из БД: страница рендерится на каждый запрос
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    // absolute — без суффикса «· Имя» из шаблона: имя уже в заголовке
    title: settings.seoTitle
      ? { absolute: settings.seoTitle }
      : { absolute: `${settings.name} — ${settings.jobTitle}` },
    description: settings.seoDescription || settings.description,
    // canonical задаётся каждой странице отдельно: в корневом layout он
    // унаследовался бы всеми страницами и склеил бы их с главной
    alternates: { canonical: "/" },
  };
}

function renderSection(
  section: HomeSection,
  context: {
    settings: SiteSettings;
    articles: ArticleSummary[];
    testimonials: Testimonial[];
  },
) {
  switch (section.key) {
    case "hero":
      return <Hero data={section.data} photo={context.settings.photo} />;
    case "requests":
      return <Requests data={section.data} />;
    case "method":
      return <Constellations data={section.data} />;
    case "blog":
      return context.articles.length ? (
        <Blog data={section.data} articles={context.articles} />
      ) : null;
    case "advantages":
      return <WhyMe data={section.data} />;
    case "testimonials":
      return context.testimonials.length ? (
        <Testimonials
          heading={section.data.heading}
          items={context.testimonials}
        />
      ) : null;
    case "faq":
      return <FAQ data={section.data} />;
    case "contact":
      return (
        <Contact data={section.data} contacts={context.settings.contacts} />
      );
  }
}

export default async function HomePage() {
  const [sections, settings, articles, testimonials] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
    getFeaturedArticles(3),
    getTestimonials(),
  ]);
  const context = {
    settings,
    articles: articles.map(toArticleSummary),
    testimonials,
  };
  const faq = sections.find((s) => s.key === "faq");

  return (
    <>
      <JsonLd
        data={graph(
          professionalServiceSchema(settings),
          ...(faq?.key === "faq" && faq.data.items.length
            ? [faqSchema(faq.data.items)]
            : []),
        )}
      />
      {sections.map((section) => (
        <Fragment key={section.key}>{renderSection(section, context)}</Fragment>
      ))}
    </>
  );
}

import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Requests } from "@/components/sections/Requests";
import { Constellations } from "@/components/sections/Constellations";
import { Blog } from "@/components/sections/Blog";
import { WhyMe } from "@/components/sections/WhyMe";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { getFeaturedArticles, getTestimonials } from "@/lib/cms";
import { toArticleSummary } from "@/types";

// Данные из БД: страница рендерится на каждый запрос
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, testimonials] = await Promise.all([
    getFeaturedArticles(3),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <Requests />
      <Constellations />
      <Blog articles={articles.map(toArticleSummary)} />
      <WhyMe />
      {testimonials.length ? <Testimonials items={testimonials} /> : null}
      <FAQ />
      <Contact />
    </>
  );
}

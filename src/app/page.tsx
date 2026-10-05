import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Requests } from "@/components/sections/Requests";
import { Constellations } from "@/components/sections/Constellations";
import { Blog } from "@/components/sections/Blog";
import { WhyMe } from "@/components/sections/WhyMe";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { getFeaturedArticles, testimonials } from "@/lib/articles";

export default function HomePage() {
  const articles = getFeaturedArticles(3);

  return (
    <>
      <Hero />
      <Requests />
      <Constellations />
      <Blog articles={articles} />
      <WhyMe />
      <Testimonials items={testimonials} />
      <FAQ />
      <Contact />
    </>
  );
}

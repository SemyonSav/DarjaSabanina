"use client";

import { motion } from "framer-motion";
import type { ArticleSummary } from "@/types";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ArticleCard } from "@/components/articles/ArticleCard";

export function Blog({ articles }: { articles: ArticleSummary[] }) {
  return (
    <section id="blog" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            className="mb-0"
            eyebrow="Блог"
            title="Статьи"
            description="Размышления о тревоге, теле, отношениях и системных расстановках."
          />
          <ButtonLink href="/articles" variant="outline" className="shrink-0">
            Все статьи
          </ButtonLink>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {articles.map((article) => (
            <motion.div key={article.slug} variants={fadeInUp}>
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

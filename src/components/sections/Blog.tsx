"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ArticleSummary } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export function ArticleCard({
  article,
  className,
}: {
  article: ArticleSummary;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:border-accent/40",
        className,
      )}
    >
      <Link href={`/articles/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-sand">
        {article.cover ? (
          <Image
            src={article.cover.url}
            alt={article.cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {article.publishedAt ? (
          <time
            dateTime={article.publishedAt}
            className="text-sm text-muted-foreground"
          >
            {formatDate(article.publishedAt)}
          </time>
        ) : null}
        <h3 className="mt-2 font-display text-2xl font-medium leading-snug">
          <Link
            href={`/articles/${article.slug}`}
            className="transition hover:text-accent"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-muted-foreground leading-relaxed">
          {article.excerpt}
        </p>
        <Link
          href={`/articles/${article.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-accent transition hover:gap-3"
        >
          Читать
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

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

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-medium tracking-[0.16em] uppercase text-accent">
        404
      </p>
      <h1 className="mt-4 font-display text-5xl font-medium md:text-6xl">
        Страница не найдена
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Возможно, ссылка устарела или страница была перемещена. Вернитесь на
        главную или откройте статьи.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">На главную</ButtonLink>
        <ButtonLink href="/articles" variant="outline">
          Читать статьи
        </ButtonLink>
      </div>
      <Link href="/#contact" className="mt-6 text-accent hover:underline">
        Или запишитесь на консультацию
      </Link>
    </Container>
  );
}

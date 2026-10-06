import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: `Политика конфиденциальности сайта ${siteConfig.name}.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Container className="prose-article max-w-3xl py-16 md:py-24">
      <h1 className="font-display text-4xl font-medium md:text-5xl">
        Политика конфиденциальности
      </h1>
      <p className="mt-6 text-muted-foreground">
        Настоящая политика описывает, какие данные могут обрабатываться при
        использовании сайта {siteConfig.name} и отправке заявок через форму
        обратной связи.
      </p>

      <h2>Какие данные мы получаем</h2>
      <p>
        При заполнении формы вы можете указать имя, телефон, email и текст
        сообщения. Эти данные используются только для связи по вашей заявке.
      </p>

      <h2>Как используются данные</h2>
      <ul>
        <li>для ответа на запрос о консультации</li>
        <li>для уточнения формата и времени встречи</li>
        <li>для улучшения качества коммуникации</li>
      </ul>

      <h2>Хранение и защита</h2>
      <p>
        Данные не передаются третьим лицам в маркетинговых целях. Доступ к
        заявкам имеет только специалист, ведущий практику.
      </p>

      <h2>Контакты</h2>
      <p>
        По вопросам обработки персональных данных:{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </p>

      <ButtonLink href="/" variant="outline" className="mt-8 no-underline">
        На главную
      </ButtonLink>
    </Container>
  );
}

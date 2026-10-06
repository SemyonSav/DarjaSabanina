/** npm run db:seed — перенос исходных статей и отзывов в БД */
import { seedDatabase } from "../src/lib/db/seed";

const result = seedDatabase();
console.log(
  `Готово: рубрик — ${result.categories}, новых статей — ${result.articles}, ` +
    `новых отзывов — ${result.testimonials}, обновлён HTML-кэш — ${result.backfilled}`,
);

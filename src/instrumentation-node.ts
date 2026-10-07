import { runMigrations } from "@/lib/db/migrate";
import { isDatabaseEmpty, seedDatabase } from "@/lib/db/seed";

runMigrations();

if (process.env.SEED_ON_EMPTY !== "false" && isDatabaseEmpty()) {
  const result = seedDatabase();
  console.log(`База наполнена исходными данными: статей — ${result.articles}`);
}

import { databasePath } from "../src/lib/db";
import { runMigrations } from "../src/lib/db/migrate";

runMigrations();
console.log(`Миграции применены: ${databasePath}`);

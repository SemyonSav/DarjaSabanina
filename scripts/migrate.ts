import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, databasePath } from "../src/lib/db";

migrate(db, { migrationsFolder: "./drizzle" });
console.log(`Миграции применены: ${databasePath}`);

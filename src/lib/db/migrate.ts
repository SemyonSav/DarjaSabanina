import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";

/** Применяет миграции из папки drizzle/ (уже применённые пропускаются) */
export function runMigrations(): void {
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
}

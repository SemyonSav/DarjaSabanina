import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { dataDir } from "../data-dir";
import * as schema from "./schema";

export { dataDir };
export const databasePath = path.join(dataDir, "site.db");

export type DB = BetterSQLite3Database<typeof schema>;

function createConnection() {
  fs.mkdirSync(dataDir, { recursive: true });
  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  // Встроенные LOWER/LIKE в SQLite не знают кириллицы: «Тревога» ≠ «тревога»
  sqlite.function("unicode_lower", { deterministic: true }, (value) =>
    typeof value === "string" ? value.toLocaleLowerCase("ru") : value,
  );
  return sqlite;
}

// Одно соединение на процесс; в dev переживает hot reload
const globalForDb = globalThis as unknown as { sqlite?: Database.Database };
export const sqlite = globalForDb.sqlite ?? createConnection();
if (process.env.NODE_ENV !== "production") globalForDb.sqlite = sqlite;

export const db: DB = drizzle(sqlite, { schema });
export { schema };

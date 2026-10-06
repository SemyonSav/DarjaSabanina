import path from "node:path";

/** Папка с данными приложения: база SQLite и загруженные файлы */
export const dataDir = path.resolve(process.env.DATA_DIR || "./data");

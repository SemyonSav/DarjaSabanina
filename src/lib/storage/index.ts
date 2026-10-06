import fs from "node:fs/promises";
import path from "node:path";
import { uploadsDir } from "./paths";

/**
 * Хранилище загруженных файлов. Сейчас — диск сервера; при переезде
 * на S3-совместимое хранилище достаточно добавить ещё одну реализацию.
 */
export interface StorageAdapter {
  save(filePath: string, data: Buffer, contentType: string): Promise<void>;
  remove(filePath: string): Promise<void>;
  /** Публичный URL файла */
  url(filePath: string): string;
}

export class LocalDiskStorage implements StorageAdapter {
  constructor(private readonly root: string) {}

  private resolve(filePath: string): string {
    const full = path.resolve(this.root, filePath);
    if (!full.startsWith(this.root + path.sep)) {
      throw new Error(`Недопустимый путь: ${filePath}`);
    }
    return full;
  }

  async save(filePath: string, data: Buffer): Promise<void> {
    const full = this.resolve(filePath);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data, { flag: "wx" });
  }

  async remove(filePath: string): Promise<void> {
    await fs.rm(this.resolve(filePath), { force: true });
  }

  url(filePath: string): string {
    return `/uploads/${filePath}`;
  }
}

export const storage: StorageAdapter = new LocalDiskStorage(uploadsDir);

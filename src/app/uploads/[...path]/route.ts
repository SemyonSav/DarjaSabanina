import fs from "node:fs/promises";
import path from "node:path";
import { uploadsDir } from "@/lib/storage/paths";

const contentTypes: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path;
  const filePath = path.resolve(uploadsDir, ...segments);

  // Защита от выхода за пределы папки (../)
  if (!filePath.startsWith(uploadsDir + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const type = contentTypes[path.extname(filePath).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const file = await fs.readFile(filePath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(file.byteLength),
        // Имена загруженных файлов уникальны, содержимое не меняется
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // SVG не должен исполнять скрипты при прямом открытии
        ...(type === "image/svg+xml"
          ? { "Content-Security-Policy": "script-src 'none'; sandbox" }
          : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

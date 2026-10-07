import path from "node:path";
import { dataDir } from "@/lib/data-dir";

export const uploadsDir = path.join(dataDir, "uploads");

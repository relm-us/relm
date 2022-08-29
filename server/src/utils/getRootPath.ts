import url from "url";
import path from "path";

export function getRootPath() {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, "..", "..");
};
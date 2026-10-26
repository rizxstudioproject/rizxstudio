/**
 * Script: generate-mapping-preview.mjs
 * Generate URL mapping tanpa perlu upload dulu — untuk preview & validasi
 * URL final akan sama persis dengan yang dihasilkan setelah upload ke Supabase
 */

import { readdirSync, statSync, writeFileSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC = join(__dirname, "..", "public");
const BUCKET_BASE = "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media";

const FOLDERS = ["works", "sequence", "assets", "logos"];

function getAllFiles(dir) {
  const files = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) files.push(...getAllFiles(full));
      else files.push(full);
    }
  } catch {}
  return files;
}

const mapping = {};

for (const folder of FOLDERS) {
  const files = getAllFiles(join(PUBLIC, folder));
  for (const f of files) {
    const rel = relative(PUBLIC, f).replace(/\\/g, "/");
    const localKey = "/" + rel;
    // Supabase encode path segments (spasi → %20, dll)
    const encodedPath = rel.split("/").map(s => encodeURIComponent(s)).join("/");
    mapping[localKey] = `${BUCKET_BASE}/${encodedPath}`;
  }
}

writeFileSync(
  join(__dirname, "supabase-url-mapping.json"),
  JSON.stringify(mapping, null, 2),
  "utf8"
);

console.log(`✅ Mapping dibuat: ${Object.keys(mapping).length} URL`);
console.log("💾 Tersimpan di: scripts/supabase-url-mapping.json");

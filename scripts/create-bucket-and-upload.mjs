/**
 * Script: create-bucket-and-upload.mjs
 * Membutuhkan SUPABASE_SERVICE_KEY dari Supabase Dashboard → Settings → API → service_role key
 * 
 * Cara jalankan:
 *   $env:SUPABASE_SERVICE_KEY="eyJhb..."; node scripts/create-bucket-and-upload.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://tbbfetcuiplwlxcyjayw.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error(`
❌ SUPABASE_SERVICE_KEY tidak ditemukan!

Cara mendapatkan service role key:
1. Buka https://supabase.com/dashboard/project/tbbfetcuiplwlxcyjayw/settings/api
2. Copy "service_role" key (RAHASIA - jangan commit ke git!)
3. Jalankan script dengan:

   $env:SUPABASE_SERVICE_KEY="eyJhbGc..."; node scripts/create-bucket-and-upload.mjs

Atau set di .env.local (tidak akan di-commit):
   SUPABASE_SERVICE_KEY=eyJhbGc...
`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const BUCKET_NAME = "portfolio-media";
const PUBLIC_DIR = join(__dirname, "..", "public");

const MIGRATE_FOLDERS = [
  "works",
  "sequence",
  "assets",
  "logos",
];

function getMimeType(ext) {
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}

function getAllFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        files.push(...getAllFiles(full));
      } else {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET_NAME)) {
    console.log(`✅ Bucket '${BUCKET_NAME}' sudah ada.`);
    return true;
  }
  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 15 * 1024 * 1024,
  });
  if (error) {
    console.error("❌ Gagal buat bucket:", error.message);
    return false;
  }
  console.log(`✅ Bucket '${BUCKET_NAME}' berhasil dibuat (PUBLIC).`);
  return true;
}

async function main() {
  console.log("=".repeat(65));
  console.log("🚀 Rizx Studio — Supabase Storage Migration");
  console.log("=".repeat(65));

  if (!(await ensureBucket())) process.exit(1);

  const mapping = {};
  let uploaded = 0, skipped = 0, failed = 0;

  for (const folder of MIGRATE_FOLDERS) {
    const localDir = join(PUBLIC_DIR, folder);
    const files = getAllFiles(localDir);
    if (!files.length) { console.warn(`⚠️  Skip (kosong): ${folder}/`); continue; }

    console.log(`\n📁 ${folder}/ — ${files.length} file`);

    for (const filePath of files) {
      const rel = relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
      const localKey = "/" + rel;
      const ext = extname(filePath);
      const mime = getMimeType(ext);
      const buf = readFileSync(filePath);

      process.stdout.write(`  ↑ ${rel} `);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(rel, buf, { contentType: mime, upsert: true });

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(rel);
      mapping[localKey] = data.publicUrl;

      if (error && !error.message?.includes("already exists")) {
        console.log(`❌ ${error.message}`);
        failed++;
      } else {
        console.log(error ? "⏭️ (skip)" : "✅");
        error ? skipped++ : uploaded++;
      }
    }
  }

  console.log("\n" + "=".repeat(65));
  console.log(`📦 Selesai: ${uploaded} upload, ${skipped} sudah ada, ${failed} gagal`);
  console.log("=".repeat(65));

  writeFileSync(
    join(__dirname, "supabase-url-mapping.json"),
    JSON.stringify(mapping, null, 2),
    "utf8"
  );
  console.log("\n💾 Mapping tersimpan → scripts/supabase-url-mapping.json");
  console.log("📋 Jalankan selanjutnya: node scripts/apply-url-mapping.mjs");
}

main().catch(e => { console.error(e); process.exit(1); });

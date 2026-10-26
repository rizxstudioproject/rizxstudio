/**
 * Script: upload-assets-anon.mjs
 * Upload aset ke bucket 'portfolio-media' yang sudah ada (PUBLIC)
 * Menggunakan anon key — bucket harus sudah PUBLIC agar bisa upload
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "fs";
import { join, relative, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://tbbfetcuiplwlxcyjayw.supabase.co";
const ANON_KEY = "sb_publishable_NCtw2Ef307vYdZsF27LlFQ_N9n7yPsh";

const supabase = createClient(SUPABASE_URL, ANON_KEY);
const BUCKET = "portfolio-media";
const PUBLIC_DIR = join(__dirname, "..", "public");
const FOLDERS = ["works", "sequence", "assets", "logos"];

function getMime(ext) {
  return { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" }[ext.toLowerCase()] || "application/octet-stream";
}

function allFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    e.isDirectory() ? out.push(...allFiles(full)) : out.push(full);
  }
  return out;
}

async function main() {
  console.log("=".repeat(65));
  console.log("🚀 Rizx Studio — Upload ke Supabase Storage (portfolio-media)");
  console.log("=".repeat(65));

  // Verifikasi bucket bisa diakses
  const { data: list, error: listErr } = await supabase.storage.from(BUCKET).list("", { limit: 1 });
  if (listErr) {
    console.error("❌ Tidak bisa akses bucket:", listErr.message);
    console.log("\n💡 Pastikan bucket 'portfolio-media' sudah dibuat sebagai PUBLIC di Supabase Dashboard.");
    process.exit(1);
  }
  console.log("✅ Bucket 'portfolio-media' dapat diakses.\n");

  const mapping = {};
  let uploaded = 0, skipped = 0, failed = 0;

  for (const folder of FOLDERS) {
    const files = allFiles(join(PUBLIC_DIR, folder));
    if (!files.length) { console.warn(`⚠️  Skip: ${folder}/ (kosong)`); continue; }
    console.log(`\n📁 ${folder}/ — ${files.length} file`);

    for (const fp of files) {
      const rel = relative(PUBLIC_DIR, fp).replace(/\\/g, "/");
      const localKey = "/" + rel;
      const buf = readFileSync(fp);
      const mime = getMime(extname(fp));

      process.stdout.write(`  ↑ ${rel} ... `);

      const { error } = await supabase.storage.from(BUCKET).upload(rel, buf, { contentType: mime, upsert: true });
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(rel);
      mapping[localKey] = data.publicUrl;

      if (!error) { console.log("✅"); uploaded++; }
      else if (error.message?.includes("already exists")) { console.log("⏭️"); skipped++; }
      else { console.log(`❌ ${error.message}`); failed++; }
    }
  }

  console.log("\n" + "=".repeat(65));
  console.log(`📦 ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`);
  console.log("=".repeat(65));

  writeFileSync(join(__dirname, "supabase-url-mapping.json"), JSON.stringify(mapping, null, 2), "utf8");
  console.log("💾 Mapping → scripts/supabase-url-mapping.json");
}

main().catch(e => { console.error(e); process.exit(1); });

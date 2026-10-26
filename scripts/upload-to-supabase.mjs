/**
 * Script: upload-to-supabase.mjs
 * Upload semua aset media lokal ke Supabase Storage
 * Jalankan: node scripts/upload-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://tbbfetcuiplwlxcyjayw.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const SUPABASE_ANON_KEY = "sb_publishable_NCtw2Ef307vYdZsF27LlFQ_N9n7yPsh";

// Gunakan service key jika ada (lebih powerful), fallback ke anon key
const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, key);

const BUCKET_NAME = "portfolio-media";
const PUBLIC_DIR = join(__dirname, "..", "public");

// Folder yang akan dimigrasi beserta path Supabase-nya
const MIGRATE_FOLDERS = [
  { local: "works",    remote: "works" },
  { local: "sequence", remote: "sequence" },
  { local: "assets",   remote: "assets" },
  { local: "logos",    remote: "logos" },
];

// Ekstensi → MIME type
function getMimeType(ext) {
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}

// Rekursif kumpulkan semua file dalam folder
function getAllFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...getAllFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

// Buat/pastikan bucket ada
async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("❌ Gagal list buckets:", error.message);
    return false;
  }
  const exists = buckets.some((b) => b.name === BUCKET_NAME);
  if (exists) {
    console.log(`✅ Bucket '${BUCKET_NAME}' sudah ada.`);
    return true;
  }
  // Buat bucket baru (public)
  const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    allowedMimeTypes: ["image/*"],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  });
  if (createErr) {
    console.error("❌ Gagal buat bucket:", createErr.message);
    return false;
  }
  console.log(`✅ Bucket '${BUCKET_NAME}' berhasil dibuat (PUBLIC).`);
  return true;
}

// Upload satu file
async function uploadFile(localPath, remotePath) {
  const ext = extname(localPath);
  const mimeType = getMimeType(ext);
  const fileBuffer = readFileSync(localPath);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(remotePath, fileBuffer, {
      contentType: mimeType,
      upsert: true, // overwrite jika sudah ada
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(remotePath);

  return { ok: true, url: data.publicUrl };
}

// Main
async function main() {
  console.log("=".repeat(60));
  console.log("🚀 Rizx Studio — Supabase Storage Migration Script");
  console.log("=".repeat(60));

  // 1. Pastikan bucket ada
  const bucketOk = await ensureBucket();
  if (!bucketOk) {
    console.error("Hentikan proses. Bucket tidak tersedia.");
    process.exit(1);
  }

  const mapping = {}; // { "/works/client-KIA/KIA EV2_B.jpg": "https://..." }
  let totalUploaded = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  // 2. Upload tiap folder
  for (const { local, remote } of MIGRATE_FOLDERS) {
    const localDir = join(PUBLIC_DIR, local);
    let files;
    try {
      files = getAllFiles(localDir);
    } catch {
      console.warn(`⚠️  Folder tidak ditemukan: ${localDir}, skip.`);
      continue;
    }

    console.log(`\n📁 Memproses: public/${local}/ (${files.length} file)`);

    for (const filePath of files) {
      // Path relatif dari public/
      const relFromPublic = relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
      // Remote path di bucket (misal: works/client-KIA/KIA EV2_B.jpg)
      const remotePath = relFromPublic;
      // Local URL key (misal: /works/client-KIA/KIA EV2_B.jpg)
      const localKey = "/" + relFromPublic;

      process.stdout.write(`  ↑ ${relFromPublic} ... `);

      const result = await uploadFile(filePath, remotePath);
      if (result.ok) {
        mapping[localKey] = result.url;
        console.log("✅");
        totalUploaded++;
      } else if (result.error?.includes("already exists")) {
        // Sudah ada, ambil URL saja
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(remotePath);
        mapping[localKey] = data.publicUrl;
        console.log("⏭️  (sudah ada)");
        totalSkipped++;
      } else {
        console.log(`❌ ${result.error}`);
        totalFailed++;
      }
    }
  }

  // 3. Tampilkan hasil
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Upload selesai: ${totalUploaded} berhasil, ${totalSkipped} skip, ${totalFailed} gagal`);
  console.log("=".repeat(60));

  // 4. Print mapping sebagai JSON untuk referensi
  console.log("\n📋 URL Mapping (local → Supabase):");
  for (const [local, url] of Object.entries(mapping)) {
    console.log(`  ${local}`);
    console.log(`    → ${url}`);
  }

  // 5. Simpan mapping ke file
  const mappingJson = JSON.stringify(mapping, null, 2);
  const { writeFileSync } = await import("fs");
  writeFileSync(
    join(__dirname, "supabase-url-mapping.json"),
    mappingJson,
    "utf8"
  );
  console.log("\n💾 Mapping disimpan ke: scripts/supabase-url-mapping.json");
  console.log("\n✨ Langkah selanjutnya: jalankan scripts/apply-url-mapping.mjs");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

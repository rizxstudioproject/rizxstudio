/**
 * Script: remove-local-media.mjs
 * Hapus file media berat dari public/ setelah berhasil diupload ke Supabase Storage
 * HATI-HATI: Tidak bisa di-undo tanpa git restore
 */

import { rmSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

// Folder yang DIHAPUS dari repo (sudah ada di Supabase)
const REMOVE_FOLDERS = [
  "public/works",       // 32.6 MB - foto klien
  "public/sequence",    // 6.76 MB - frame animasi
  "public/assets",      // 1.88 MB - hero, card, selected images
  // "public/logos",    // 1.04 MB - SVG kecil, opsional (biarkan dulu)
];

// File yang TETAP di local (penting untuk SEO/meta)
const KEEP_FILES = [
  "public/apple-touch-icon.png",
  "public/brand-logo.png",
  "public/favicon.ico",
  "public/icon.png",
  "public/logo-admin.png",
  "public/logo-public.png",
  "public/navbar-logo.png",
  "public/og-image-square.png",
  "public/og-image.png",
];

const DRY_RUN = process.argv.includes("--dry-run");

if (DRY_RUN) {
  console.log("🔍 DRY RUN MODE — tidak ada file yang dihapus\n");
} else {
  console.log("⚠️  LIVE MODE — file akan dihapus permanen dari disk!\n");
}

let totalRemoved = 0;
let totalSizeMB = 0;

for (const folder of REMOVE_FOLDERS) {
  const fullPath = join(ROOT, folder.replace(/\//g, "\\"));
  if (!existsSync(fullPath)) {
    console.log(`⏭️  Skip (tidak ada): ${folder}`);
    continue;
  }
  if (DRY_RUN) {
    console.log(`🗑️  [DRY] Akan hapus: ${folder}/`);
    totalRemoved++;
  } else {
    console.log(`🗑️  Menghapus: ${folder}/`);
    rmSync(fullPath, { recursive: true, force: true });
    totalRemoved++;
    console.log(`   ✅ Terhapus`);
  }
}

console.log("\n" + "=".repeat(60));
if (DRY_RUN) {
  console.log(`📋 DRY RUN: ${totalRemoved} folder siap dihapus`);
  console.log("   Jalankan tanpa --dry-run untuk hapus sungguhan:");
  console.log("   node scripts/remove-local-media.mjs");
} else {
  console.log(`✅ Selesai: ${totalRemoved} folder dihapus dari disk`);
  console.log("\n📋 Langkah selanjutnya:");
  console.log("   npm run build              ← validasi tidak ada broken image");
  console.log("   git add -A");
  console.log("   git commit -m 'chore: migrate media to Supabase Storage, remove local files'");
  console.log("   git push origin master     ← deploy ke Vercel");
}
console.log("=".repeat(60));

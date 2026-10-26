/**
 * Script: apply-url-mapping.mjs
 * Replace semua local image path → Supabase public URL di source code
 * Jalankan SETELAH create-bucket-and-upload.mjs berhasil
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// Load mapping
const mappingPath = join(__dirname, "supabase-url-mapping.json");
if (!existsSync(mappingPath)) {
  console.error("❌ supabase-url-mapping.json tidak ditemukan. Jalankan create-bucket-and-upload.mjs dulu.");
  process.exit(1);
}

const mapping = JSON.parse(readFileSync(mappingPath, "utf8"));
console.log(`📋 Loaded ${Object.keys(mapping).length} URL mappings`);

// File-file yang perlu diupdate
const TARGET_FILES = [
  "context/PortfolioDataContext.tsx",
  "components/AdminDashboard.tsx",
  "components/admin/MobileAdminApp.tsx",
  "app/page.tsx",
  "app/layout.tsx",
];

// Juga cari di semua komponen
import { readdirSync, statSync } from "fs";

function getAllTSFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        files.push(...getAllTSFiles(full));
      } else if (/\.(tsx?|jsx?|json)$/.test(e.name)) {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

const allFiles = getAllTSFiles(ROOT).filter(f =>
  !f.includes("node_modules") &&
  !f.includes(".next") &&
  !f.includes("scripts/") &&
  !f.includes(".git")
);

console.log(`\n🔍 Scanning ${allFiles.length} source files...\n`);

let totalReplacements = 0;
let filesChanged = 0;

for (const filePath of allFiles) {
  let content = readFileSync(filePath, "utf8");
  let original = content;
  let count = 0;

  // Sort by length descending to avoid partial match issues
  const sortedMappings = Object.entries(mapping).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [localPath, supabaseUrl] of sortedMappings) {
    // Escape special chars for use in regex
    const escaped = localPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match: "/works/..." or '/works/...' or `/works/...`
    const regex = new RegExp(escaped, "g");
    const matches = content.match(regex)?.length || 0;
    if (matches > 0) {
      content = content.replace(regex, supabaseUrl);
      count += matches;
    }
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf8");
    const rel = filePath.replace(ROOT, "").replace(/\\/g, "/").replace(/^\//, "");
    console.log(`✅ ${rel} — ${count} replacement(s)`);
    totalReplacements += count;
    filesChanged++;
  }
}

console.log("\n" + "=".repeat(60));
console.log(`✨ Selesai: ${filesChanged} file diubah, ${totalReplacements} total replacements`);
console.log("=".repeat(60));
console.log("\n📋 Langkah selanjutnya:");
console.log("   node scripts/remove-local-media.mjs   ← hapus file lokal dari repo");
console.log("   npm run build                          ← validasi build");
console.log("   git add -A && git commit && git push  ← deploy ke Vercel");

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
// Allow up to 50MB payload for multi-frame sequence uploads
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada file foto yang diterima." },
        { status: 400 }
      );
    }

    // Natural sort by filename (e.g., frame_01, frame_02, ... frame_120)
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    const sortedFiles = [...files].sort((a, b) => collator.compare(a.name, b.name));

    const targetDir = path.join(process.cwd(), "public", "uploads", "hero-sequence");
    await fs.mkdir(targetDir, { recursive: true });

    // Clean existing files in custom sequence directory before saving new batch
    try {
      const existing = await fs.readdir(targetDir);
      for (const f of existing) {
        await fs.unlink(path.join(targetDir, f)).catch(() => {});
      }
    } catch {
      // ignore readdir error if dir is new
    }

    const writtenUrls: string[] = [];
    const firstExt = path.extname(sortedFiles[0].name) || ".webp";

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const ext = path.extname(file.name) || firstExt;
      const padded = String(i).padStart(6, "0");
      const filename = `frame_${padded}${ext.toLowerCase()}`;
      const filePath = path.join(targetDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);
      writtenUrls.push(`/uploads/hero-sequence/${filename}`);
    }

    return NextResponse.json({
      success: true,
      totalFrames: sortedFiles.length,
      folder: "/uploads/hero-sequence",
      pattern: `frame_{padded}${firstExt.toLowerCase()}`,
      padding: 6,
      startIndex: 0,
      urls: writtenUrls,
    });
  } catch (err: any) {
    console.error("Sequence upload handler error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal memproses upload sequence foto." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const targetDir = path.join(process.cwd(), "public", "uploads", "hero-sequence");
    await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {});
    return NextResponse.json({ success: true, message: "Sequence custom berhasil di-reset." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

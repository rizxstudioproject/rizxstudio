import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
// Allow up to 50MB payload for multi-frame sequence uploads
export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tbbfetcuiplwlxcyjayw.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_NCtw2Ef307vYdZsF27LlFQ_N9n7yPsh";

const BUCKET = "portfolio-media";
const SEQUENCE_PREFIX = "sequence";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

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
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    const sortedFiles = [...files].sort((a, b) =>
      collator.compare(a.name, b.name)
    );

    const supabase = getSupabase();

    // Hapus frame-frame lama di Supabase Storage
    try {
      const { data: existing } = await supabase.storage
        .from(BUCKET)
        .list(SEQUENCE_PREFIX);
      if (existing && existing.length > 0) {
        const oldPaths = existing.map((f) => `${SEQUENCE_PREFIX}/${f.name}`);
        await supabase.storage.from(BUCKET).remove(oldPaths);
      }
    } catch {
      // ignore jika folder sequence belum ada
    }

    const writtenUrls: string[] = [];
    const firstExt =
      "." + (sortedFiles[0].name.split(".").pop() || "webp");

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const ext =
        "." + (file.name.split(".").pop() || firstExt.slice(1));
      const padded = String(i).padStart(6, "0");
      const filename = `frame_${padded}${ext.toLowerCase()}`;
      const remotePath = `${SEQUENCE_PREFIX}/${filename}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const mimeType =
        ext === ".webp"
          ? "image/webp"
          : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".png"
          ? "image/png"
          : "image/webp";

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(remotePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error(`Error uploading ${filename}:`, error.message);
        continue;
      }

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(remotePath);

      writtenUrls.push(data.publicUrl);
    }

    return NextResponse.json({
      success: true,
      totalFrames: writtenUrls.length,
      folder: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${SEQUENCE_PREFIX}`,
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
    const supabase = getSupabase();
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list(SEQUENCE_PREFIX);
    if (existing && existing.length > 0) {
      const paths = existing.map((f) => `${SEQUENCE_PREFIX}/${f.name}`);
      await supabase.storage.from(BUCKET).remove(paths);
    }
    return NextResponse.json({
      success: true,
      message: "Sequence custom berhasil di-reset dari Supabase Storage.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

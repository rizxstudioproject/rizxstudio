import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tbbfetcuiplwlxcyjayw.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_NCtw2Ef307vYdZsF27LlFQ_N9n7yPsh";

const BUCKET = "portfolio-media";

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const supabase = getSupabase();

    let buffer: Buffer;
    let filename: string;
    let mimeType = "image/jpeg";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const base64Str = body.base64 as string;
      const folder = (body.folder as string) || "works";
      const customName = (body.filename as string) || "media";

      if (!base64Str) {
        return NextResponse.json(
          { error: "Tidak ada data base64 yang diterima." },
          { status: 400 }
        );
      }

      const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64Str, "base64");
      }

      let ext = "jpg";
      if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("svg")) ext = "svg";
      else if (mimeType.includes("gif")) ext = "gif";

      const cleanName = customName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
      filename = `${folder}/${Date.now()}_${cleanName}.${ext}`;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "works";

      if (!file) {
        return NextResponse.json(
          { error: "Tidak ada file yang diterima." },
          { status: 400 }
        );
      }

      const originalName = file.name || "media.jpg";
      const ext = originalName.split(".").pop() || "jpg";
      const cleanExt = ext.toLowerCase();
      const baseName = originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 40);

      filename = `${folder}/${Date.now()}_${baseName}.${cleanExt}`;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      mimeType = file.type || "image/jpeg";
      if (cleanExt === "webp") mimeType = "image/webp";
      else if (cleanExt === "png") mimeType = "image/png";
      else if (cleanExt === "svg") mimeType = "image/svg+xml";
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    const publicUrl = publicData.publicUrl;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (err: any) {
    console.error("Media upload route error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

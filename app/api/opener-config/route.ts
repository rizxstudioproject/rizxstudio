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

const OPENER_ROW_ID = "site-opener-config";

interface OpenerImageItem {
  id: string;
  url: string;
  active: boolean;
}

interface OpenerConfigPayload {
  words: [string, string][];
  final: [string, string];
  images: string[];
  imageItems?: OpenerImageItem[];
  updatedAt?: string;
}

const DEFAULT_IMAGE_ITEMS: OpenerImageItem[] = [
  {
    id: "img-1",
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-motion-graphics.jpg",
    active: true,
  },
  {
    id: "img-2",
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-brand-identity.jpg",
    active: true,
  },
  {
    id: "img-3",
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-uiux-design.jpg",
    active: true,
  },
  {
    id: "img-4",
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Burger%20King/Burger_ads04.jpg",
    active: true,
  },
  {
    id: "img-5",
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-KIA/KIA%20EV2_B.jpg",
    active: true,
  },
  {
    id: "img-6",
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-3d-design.jpg",
    active: true,
  },
  {
    id: "img-7",
    url: "/sequence/frame_000000.webp",
    active: true,
  },
];

const DEFAULT_OPENER_CONFIG: OpenerConfigPayload = {
  words: [
    ["Motion", "Graphics"],
    ["Branding", "Identity"],
    ["UI/UX", "Design"],
    ["Digital", "Advertising"],
    ["Video", "Production"],
    ["Vibe", "Coding"],
  ],
  final: ["Rizx", "Studio"],
  images: DEFAULT_IMAGE_ITEMS.filter((i) => i.active).map((i) => i.url),
  imageItems: DEFAULT_IMAGE_ITEMS,
};

let memoryCache: { data: OpenerConfigPayload; timestamp: number } | null = null;
const CACHE_TTL_MS = 10_000; // 10 detik cache singkat supaya cepat

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

function normalizeConfig(raw: any): OpenerConfigPayload {
  const words: [string, string][] =
    Array.isArray(raw?.words) && raw.words.length > 0
      ? raw.words
          .filter((pair: any) => Array.isArray(pair) && pair.length >= 2)
          .map(
            (pair: any) =>
              [
                String(pair[0] ?? "").trim() || "Rizx",
                String(pair[1] ?? "").trim() || "Studio",
              ] as [string, string]
          )
      : DEFAULT_OPENER_CONFIG.words;

  const finalPair: [string, string] =
    Array.isArray(raw?.final) && raw.final.length >= 2
      ? [
          String(raw.final[0] ?? "").trim() || "Rizx",
          String(raw.final[1] ?? "").trim() || "Studio",
        ]
      : DEFAULT_OPENER_CONFIG.final;

  let imageItems: OpenerImageItem[];
  if (Array.isArray(raw?.imageItems) && raw.imageItems.length > 0) {
    imageItems = raw.imageItems
      .filter((item: any) => item && typeof item.url === "string" && item.url.trim())
      .map((item: any, idx: number) => ({
        id: String(item.id || `img-${idx + 1}`),
        url: String(item.url).trim(),
        active: item.active !== false,
      }));
  } else if (Array.isArray(raw?.images) && raw.images.length > 0) {
    imageItems = raw.images
      .filter((u: any) => typeof u === "string" && u.trim())
      .map((u: string, idx: number) => ({
        id: `img-${idx + 1}`,
        url: u.trim(),
        active: true,
      }));
  } else {
    imageItems = DEFAULT_IMAGE_ITEMS;
  }

  const activeImages = imageItems
    .filter((item) => item.active && item.url)
    .map((item) => item.url);

  const images =
    activeImages.length > 0
      ? activeImages
      : DEFAULT_OPENER_CONFIG.images;

  return {
    words: words.length > 0 ? words : DEFAULT_OPENER_CONFIG.words,
    final: finalPair,
    images,
    imageItems,
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
}

async function fetchConfigFromDB(): Promise<OpenerConfigPayload> {
  const supabase = getSupabase();

  // Baca langsung dari tabel utama project: client_descriptions (client_id = "site-opener-config")
  try {
    const { data, error } = await supabase
      .from("client_descriptions")
      .select("description")
      .eq("client_id", OPENER_ROW_ID)
      .maybeSingle();

    if (!error && data?.description) {
      const parsed =
        typeof data.description === "string"
          ? JSON.parse(data.description)
          : data.description;
      return normalizeConfig(parsed);
    }
  } catch (err) {
    console.warn("fetchConfigFromDB error:", err);
  }

  return DEFAULT_OPENER_CONFIG;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bypassCache = url.searchParams.has("admin") || url.searchParams.has("t");

    if (
      !bypassCache &&
      memoryCache &&
      Date.now() - memoryCache.timestamp < CACHE_TTL_MS
    ) {
      return NextResponse.json(memoryCache.data, {
        headers: {
          "Cache-Control": "public, max-age=10, stale-while-revalidate=60",
        },
      });
    }

    const config = await fetchConfigFromDB();
    memoryCache = { data: config, timestamp: Date.now() };

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": bypassCache
          ? "no-store, max-age=0"
          : "public, max-age=10, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(DEFAULT_OPENER_CONFIG, {
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=60",
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    // Hanya admin yang boleh mengubah data opener
    const adminHeader = req.headers.get("x-admin-auth");
    if (adminHeader !== "rizx-admin") {
      return NextResponse.json(
        { error: "Unauthorized: Hanya admin yang diizinkan mengubah konfigurasi Opener." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const normalized = normalizeConfig({
      ...body,
      updatedAt: new Date().toISOString(),
    });

    const supabase = getSupabase();

    // Simpan ke tabel utama project (client_descriptions)
    const { error: descErr } = await supabase.from("client_descriptions").upsert({
      client_id: OPENER_ROW_ID,
      client_name: "Site Opener Intro Config",
      category: "Site Section Config",
      description: JSON.stringify(normalized),
      updated_at: new Date().toISOString(),
    });

    if (descErr) {
      console.error("Supabase opener save error:", descErr);
      return NextResponse.json({ error: descErr.message }, { status: 500 });
    }

    memoryCache = { data: normalized, timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      config: normalized,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to save opener config" },
      { status: 500 }
    );
  }
}

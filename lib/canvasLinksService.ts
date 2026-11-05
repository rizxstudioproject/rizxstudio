/**
 * Rizx Canvas External Links Service
 * Manages links shown on Rizx Canvas floating bottom bar (e.g. Figma design link).
 * Supports Add, Edit, Delete with cloud persistence (Supabase) and instant local storage fallback.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export interface CanvasExternalLink {
  id: string;
  title: string;
  url: string;
  type?: "figma" | "website" | "drive" | "custom";
}

export const DEFAULT_CANVAS_LINKS: CanvasExternalLink[] = [
  {
    id: "figma-main",
    title: "Open in Figma",
    url: "https://www.figma.com/design/stiNMbWG9UP6MBMfYr4fma/Rizx-Project-Porfolio?node-id=1-2&t=7nXMV1klfGcwOZos-1",
    type: "figma",
  },
];

const STORAGE_KEY = "rizx_canvas_external_links";
const SUPABASE_KEY = "site-canvas-external-links";

/**
 * Normalizes any link so it never acts as a relative URL
 */
export function normalizeCanvasUrl(url: string | undefined): string {
  if (!url) return "";
  let clean = url.trim();
  if (!clean) return "";
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    return `https://${clean}`;
  }
  return clean;
}

/**
 * Detects whether a URL is a Figma URL
 */
export function isFigmaUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().includes("figma.com");
}

/**
 * Get current external canvas links (synchronous from localStorage, fallback to default)
 */
export function getCanvasExternalLinks(): CanvasExternalLink[] {
  if (typeof window === "undefined") return DEFAULT_CANVAS_LINKS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to read canvas links from localStorage:", err);
  }
  return DEFAULT_CANVAS_LINKS;
}

/**
 * Save external canvas links to localStorage & Supabase
 */
export async function saveCanvasExternalLinks(links: CanvasExternalLink[]): Promise<boolean> {
  const normalizedLinks = links.map((l) => ({
    ...l,
    title: l.title.trim() || "Open in Figma",
    url: normalizeCanvasUrl(l.url),
    type: isFigmaUrl(l.url) ? "figma" : l.type || "website",
  }));

  // 1. LocalStorage for instant 0ms feedback
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedLinks));
      window.dispatchEvent(new CustomEvent("rizx:canvas-links-updated", { detail: normalizedLinks }));
    } catch (err) {
      console.error("Failed to save canvas links to localStorage:", err);
    }
  }

  // 2. Cloud persistence via Supabase client_descriptions
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("client_descriptions").upsert(
        {
          client_id: SUPABASE_KEY,
          client_name: "Canvas External Links",
          category: "Canvas Config",
          description: JSON.stringify(normalizedLinks),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );

      if (error) {
        console.warn("Supabase canvas links upsert warning:", error);
      } else {
        return true;
      }
    } catch (err) {
      console.error("Supabase canvas links network error:", err);
    }
  }

  return true;
}

/**
 * Fetch external canvas links from Supabase cloud and update localStorage
 */
export async function fetchCanvasExternalLinksFromCloud(): Promise<CanvasExternalLink[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("client_descriptions")
        .select("description")
        .eq("client_id", SUPABASE_KEY)
        .maybeSingle();

      if (!error && data?.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed)) {
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            window.dispatchEvent(new CustomEvent("rizx:canvas-links-updated", { detail: parsed }));
          }
          return parsed;
        }
      }
    } catch (err) {
      console.error("Failed to fetch canvas links from Supabase:", err);
    }
  }
  return getCanvasExternalLinks();
}

/**
 * SEO Management Service — Connected to Supabase Cloud & LocalStorage
 * Manages meta tags, keywords, social previews, verification codes, and Schema.org rich snippets.
 */
import { supabase, isSupabaseConfigured } from "./supabase";

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  authorName: string;
  studioName: string;
  canonicalUrl: string;
  ogImage: string;
  googleVerification: string;
  bingVerification: string;
  telephone: string;
  priceRange: string;
  enableRichSnippets: boolean;
  updatedAt?: string;
}

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  metaTitle: "Rizxstudio — Professional Creative, Motion & UI/UX Design Studio",
  metaDescription:
    "Professional creative studio by FOMY with 11+ years of experience specializing in digital advertising, branding, UI/UX, motion graphics, video, and creative production for global clients.",
  keywords:
    "Rizxstudio, FOMY, Fomy R, Creative Designer, Motion Specialist, Digital Advertising, Branding, UI/UX Design, Motion Graphics, Video Production, Creative Production",
  authorName: "FOMY R",
  studioName: "Rizxstudio",
  canonicalUrl: "https://rizxstudio.com",
  ogImage: "/og-image-square.png",
  googleVerification: "",
  bingVerification: "",
  telephone: "+6282381769146",
  priceRange: "$$$",
  enableRichSnippets: true,
};

const STORAGE_KEY = "rizx_seo_config";
const SUPABASE_SEO_KEY = "site-seo-settings";

/**
 * Fetch SEO settings from Supabase Cloud with LocalStorage fallback
 */
export async function getSeoConfig(): Promise<SeoConfig> {
  let config: SeoConfig | null = null;

  // 1. Try Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("client_descriptions")
        .select("description")
        .eq("client_id", SUPABASE_SEO_KEY)
        .single();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (parsed && typeof parsed === "object") {
          config = { ...DEFAULT_SEO_CONFIG, ...parsed };
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
          }
        }
      }
    } catch (err) {
      console.warn("Supabase SEO read notice:", err);
    }
  }

  // 2. Try LocalStorage
  if (!config && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        config = { ...DEFAULT_SEO_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("LocalStorage SEO read notice:", e);
    }
  }

  return config || { ...DEFAULT_SEO_CONFIG };
}

/**
 * Save SEO settings to Supabase Cloud & LocalStorage
 */
export async function saveSeoConfig(config: SeoConfig): Promise<boolean> {
  const payload: SeoConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  // 1. LocalStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("LocalStorage SEO save notice:", e);
    }
  }

  // 2. Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("client_descriptions").upsert(
        {
          client_id: SUPABASE_SEO_KEY,
          client_name: "SEO & Search Engine Configuration",
          description: JSON.stringify(payload),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );
      return true;
    } catch (err) {
      console.warn("Supabase SEO save notice:", err);
    }
  }

  return true;
}

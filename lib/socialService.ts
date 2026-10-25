/**
 * Social & Contact Persistence Service — Connected to Supabase Cloud & LocalStorage
 * Stores social media links (Instagram, LinkedIn, WhatsApp, Email, GitHub) with automatic URL normalization.
 */
import { supabase, isSupabaseConfigured } from "./supabase";

export interface SocialContactsConfig {
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  linkedinUrl: string;
  email: string;
  githubUrl: string;
  updatedAt?: string;
}

export const DEFAULT_SOCIAL_CONTACTS: SocialContactsConfig = {
  whatsappNumber: "6282381769146",
  whatsappMessage: "Halo Fomy R / Rizx Studio, saya ingin berkonsultasi mengenai proyek kreatif/desain.",
  instagramUrl: "https://www.instagram.com/rizxstudio/",
  linkedinUrl: "https://www.linkedin.com/in/rizxstudio/",
  email: "fomy@rizxstudio.com",
  githubUrl: "https://github.com/rizxstudio",
};

const STORAGE_KEY = "rizx_social_contacts_cloud_v1";
const SUPABASE_SOCIAL_KEY = "site-social-contacts";

/**
 * Normalizes input social URL so it never breaks as a relative path.
 * Handles inputs like:
 * - "instagram.com/user" -> "https://instagram.com/user"
 * - "@user" -> "https://www.instagram.com/user"
 * - "user@mail.com" -> "mailto:user@mail.com"
 */
export function normalizeSocialUrl(
  url: string | undefined,
  platform?: "instagram" | "linkedin" | "github" | "email" | "general"
): string {
  if (!url) return "";
  let clean = url.trim();
  if (!clean) return "";

  if (platform === "email" || (!platform && clean.includes("@") && !clean.includes("/"))) {
    if (!clean.startsWith("mailto:")) {
      return `mailto:${clean.replace(/^mailto:/i, "")}`;
    }
    return clean;
  }

  if (clean.startsWith("@")) {
    const handle = clean.slice(1);
    if (platform === "instagram") return `https://www.instagram.com/${handle}`;
    if (platform === "linkedin") return `https://www.linkedin.com/in/${handle}`;
    if (platform === "github") return `https://github.com/${handle}`;
  }

  if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("mailto:")) {
    return `https://${clean}`;
  }

  return clean;
}

/**
 * Normalizes WhatsApp phone number and creates direct wa.me chat URL
 */
export function formatWhatsAppUrl(phoneNumber: string | undefined, message: string | undefined): string {
  const cleanNumber = (phoneNumber || "6282381769146").replace(/[^0-9]/g, "");
  const defaultMsg = message || "Halo Fomy R / Rizx Studio, saya tertarik untuk berdiskusi proyek.";
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMsg)}`;
}

/**
 * Fetch Social Contacts from Supabase Cloud with LocalStorage fallback
 */
export async function getSocialContacts(): Promise<SocialContactsConfig> {
  let contacts: SocialContactsConfig | null = null;

  // 1. Try Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("client_descriptions")
        .select("description")
        .eq("client_id", SUPABASE_SOCIAL_KEY)
        .single();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (parsed && typeof parsed === "object") {
          contacts = {
            ...DEFAULT_SOCIAL_CONTACTS,
            ...parsed,
            instagramUrl: normalizeSocialUrl(parsed.instagramUrl, "instagram"),
            linkedinUrl: normalizeSocialUrl(parsed.linkedinUrl, "linkedin"),
            githubUrl: normalizeSocialUrl(parsed.githubUrl, "github"),
            email: parsed.email || DEFAULT_SOCIAL_CONTACTS.email,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
          }
        }
      }
    } catch (err) {
      console.warn("Supabase Social Contacts read notice:", err);
    }
  }

  // 2. Try LocalStorage
  if (!contacts && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        contacts = {
          ...DEFAULT_SOCIAL_CONTACTS,
          ...parsed,
          instagramUrl: normalizeSocialUrl(parsed.instagramUrl, "instagram"),
          linkedinUrl: normalizeSocialUrl(parsed.linkedinUrl, "linkedin"),
          githubUrl: normalizeSocialUrl(parsed.githubUrl, "github"),
        };
      }
    } catch (e) {
      console.warn("LocalStorage Social Contacts read notice:", e);
    }
  }

  return contacts || { ...DEFAULT_SOCIAL_CONTACTS };
}

/**
 * Persist Social Contacts to Supabase Cloud & LocalStorage
 */
export async function saveSocialContacts(
  contacts: Partial<SocialContactsConfig>
): Promise<boolean> {
  const current = await getSocialContacts();
  const normalizedPayload: SocialContactsConfig = {
    whatsappNumber: (contacts.whatsappNumber ?? current.whatsappNumber).trim(),
    whatsappMessage: (contacts.whatsappMessage ?? current.whatsappMessage).trim(),
    instagramUrl: normalizeSocialUrl(contacts.instagramUrl ?? current.instagramUrl, "instagram"),
    linkedinUrl: normalizeSocialUrl(contacts.linkedinUrl ?? current.linkedinUrl, "linkedin"),
    email: (contacts.email ?? current.email).trim(),
    githubUrl: normalizeSocialUrl(contacts.githubUrl ?? current.githubUrl, "github"),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to LocalStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedPayload));
      // Also update legacy motion theme settings storage key if present
      const legacy = localStorage.getItem("rizx_motion_theme_settings_v2");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        parsed.socialContacts = normalizedPayload;
        localStorage.setItem("rizx_motion_theme_settings_v2", JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn("LocalStorage Social Contacts save notice:", e);
    }
  }

  // 2. Save to Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("client_descriptions").upsert(
        {
          client_id: SUPABASE_SOCIAL_KEY,
          client_name: "Social Profiles & Contact Channels",
          description: JSON.stringify(normalizedPayload),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );
      return true;
    } catch (err) {
      console.warn("Supabase Social Contacts save notice:", err);
    }
  }

  return true;
}

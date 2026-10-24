import { supabase, isSupabaseConfigured } from "./supabase";

export interface AdminCredentials {
  username: string;
  password: string;
  email: string;
  secretParam?: string;
  updatedAt?: string;
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: "admin",
  password: "rizxstudio2026",
  email: "rizxstudioproject@gmail.com",
  secretParam: "secret",
};

const STORAGE_KEY = "rizx_admin_credentials";

export async function getAdminCredentials(): Promise<AdminCredentials> {
  // 1. Try Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("client_descriptions")
        .select("*")
        .eq("client_id", "site-admin-credentials")
        .single();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (parsed.username && parsed.password) {
          const creds: AdminCredentials = {
            username: parsed.username,
            password: parsed.password,
            email: parsed.email || DEFAULT_ADMIN_CREDENTIALS.email,
            secretParam: parsed.secretParam || DEFAULT_ADMIN_CREDENTIALS.secretParam,
            updatedAt: data.updated_at,
          };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
            } catch (_) {}
          }
          return creds;
        }
      }
    } catch (err) {
      console.warn("Supabase admin credentials read notice:", err);
    }
  }

  // 2. Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.username && parsed.password) {
          return {
            username: parsed.username,
            password: parsed.password,
            email: parsed.email || DEFAULT_ADMIN_CREDENTIALS.email,
            secretParam: parsed.secretParam || DEFAULT_ADMIN_CREDENTIALS.secretParam,
          };
        }
      }
    } catch (_) {}
  }

  return DEFAULT_ADMIN_CREDENTIALS;
}

export async function saveAdminCredentials(
  creds: Partial<AdminCredentials>
): Promise<AdminCredentials> {
  const current = await getAdminCredentials();
  const rawParam = creds.secretParam !== undefined ? creds.secretParam.trim().replace(/^[\?&]?(login=)?/, "") : current.secretParam;
  const updated: AdminCredentials = {
    username: creds.username?.trim() || current.username,
    password: creds.password?.trim() || current.password,
    email: creds.email?.trim() || current.email,
    secretParam: rawParam || "secret",
    updatedAt: new Date().toISOString(),
  };

  // 1. Save LocalStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  }

  // 2. Save Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("client_descriptions").upsert({
        client_id: "site-admin-credentials",
        client_name: "Admin Credentials & Recovery",
        category: "System Auth Config",
        description: JSON.stringify(updated),
        updated_at: updated.updatedAt,
      });
    } catch (err) {
      console.warn("Supabase admin credentials save notice:", err);
    }
  }

  return updated;
}

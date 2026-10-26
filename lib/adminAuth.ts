import { supabase, isSupabaseConfigured } from "./supabase";

export interface AdminUserItem {
  id: string;
  username: string;
  password: string;
  email: string;
  role: "superadmin" | "admin" | "editor" | string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  email: string;
  secretParam?: string;
  updatedAt?: string;
  adminUsers?: AdminUserItem[];
}

export const DEFAULT_ADMIN_USERS: AdminUserItem[] = [
  {
    id: "admin-root",
    username: "admin",
    password: "rizxstudio2026",
    email: "rizxstudioproject@gmail.com",
    role: "superadmin",
    name: "Super Admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: "admin",
  password: "rizxstudio2026",
  email: "rizxstudioproject@gmail.com",
  secretParam: "secret",
  adminUsers: DEFAULT_ADMIN_USERS,
};

const STORAGE_KEY = "rizx_admin_credentials";

function ensureAdminUsers(parsed: any): AdminUserItem[] {
  let list: AdminUserItem[] =
    Array.isArray(parsed?.adminUsers) && parsed.adminUsers.length > 0
      ? parsed.adminUsers
      : [];

  const rootUser = (parsed?.username || DEFAULT_ADMIN_CREDENTIALS.username).trim();
  const rootPass = (parsed?.password || DEFAULT_ADMIN_CREDENTIALS.password).trim();
  const rootEmail = (parsed?.email || DEFAULT_ADMIN_CREDENTIALS.email).trim();

  // If list is empty or doesn't have root user, ensure it exists:
  const rootIdx = list.findIndex(
    (u) => (u.username || "").toLowerCase() === rootUser.toLowerCase()
  );

  if (rootIdx === -1) {
    list.unshift({
      id: "admin-root",
      username: rootUser,
      password: rootPass,
      email: rootEmail,
      role: "superadmin",
      name: "Super Admin",
      createdAt: new Date().toISOString(),
    });
  } else {
    // Keep root user credentials in sync with root object
    list[rootIdx] = {
      ...list[rootIdx],
      username: rootUser,
      password: rootPass || list[rootIdx].password,
      email: rootEmail || list[rootIdx].email,
      role: list[rootIdx].role || "superadmin",
    };
  }

  return list;
}

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
          const adminUsers = ensureAdminUsers(parsed);
          const creds: AdminCredentials = {
            username: parsed.username,
            password: parsed.password,
            email: parsed.email || DEFAULT_ADMIN_CREDENTIALS.email,
            secretParam: parsed.secretParam || DEFAULT_ADMIN_CREDENTIALS.secretParam,
            updatedAt: data.updated_at,
            adminUsers,
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
          const adminUsers = ensureAdminUsers(parsed);
          return {
            username: parsed.username,
            password: parsed.password,
            email: parsed.email || DEFAULT_ADMIN_CREDENTIALS.email,
            secretParam: parsed.secretParam || DEFAULT_ADMIN_CREDENTIALS.secretParam,
            adminUsers,
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
  const rawParam =
    creds.secretParam !== undefined
      ? creds.secretParam.trim().replace(/^[\?&]?(login=)?/, "")
      : current.secretParam;

  const nextUsername = creds.username?.trim() || current.username;
  const nextPassword = creds.password?.trim() || current.password;
  const nextEmail = creds.email?.trim() || current.email;

  // Sync adminUsers
  let nextAdminUsers: AdminUserItem[] =
    creds.adminUsers || current.adminUsers || [...DEFAULT_ADMIN_USERS];

  // Ensure the primary account in adminUsers matches nextUsername / nextPassword / nextEmail
  const rootIdx = nextAdminUsers.findIndex(
    (u) =>
      (u.username || "").toLowerCase() === nextUsername.toLowerCase() ||
      u.id === "admin-root"
  );
  if (rootIdx !== -1) {
    nextAdminUsers[rootIdx] = {
      ...nextAdminUsers[rootIdx],
      username: nextUsername,
      password: nextPassword,
      email: nextEmail,
      updatedAt: new Date().toISOString(),
    };
  }

  const updated: AdminCredentials = {
    username: nextUsername,
    password: nextPassword,
    email: nextEmail,
    secretParam: rawParam || "secret",
    updatedAt: new Date().toISOString(),
    adminUsers: nextAdminUsers,
  };

  // 1. Save LocalStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("rizx_admin_credentials_updated", { detail: updated })
      );
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

/**
 * Add a new Admin user
 */
export async function addAdminUser(
  newUser: Omit<AdminUserItem, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; user?: AdminUserItem; error?: string }> {
  const creds = await getAdminCredentials();
  const users = creds.adminUsers || [...DEFAULT_ADMIN_USERS];

  const cleanUser = newUser.username.trim().toLowerCase();

  if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
    return { success: false, error: `Username "${newUser.username}" sudah digunakan.` };
  }

  const createdUser: AdminUserItem = {
    id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    username: newUser.username.trim(),
    password: newUser.password.trim(),
    email: newUser.email.trim(),
    role: newUser.role || "admin",
    name: newUser.name?.trim() || newUser.username.trim(),
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, createdUser];
  await saveAdminCredentials({ adminUsers: updatedUsers });
  return { success: true, user: createdUser };
}

/**
 * Update an Admin user
 */
export async function updateAdminUser(
  id: string,
  updates: Partial<AdminUserItem>
): Promise<{ success: boolean; error?: string }> {
  const creds = await getAdminCredentials();
  const users = creds.adminUsers || [...DEFAULT_ADMIN_USERS];

  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return { success: false, error: "Akun admin tidak ditemukan." };
  }

  // Check username collision if username changed
  if (updates.username) {
    const cleanUser = updates.username.trim().toLowerCase();
    const collision = users.some(
      (u) => u.id !== id && u.username.toLowerCase() === cleanUser
    );
    if (collision) {
      return {
        success: false,
        error: `Username "${updates.username}" sudah digunakan akun lain.`,
      };
    }
  }

  const updatedItem: AdminUserItem = {
    ...users[idx],
    ...updates,
    username: updates.username?.trim() || users[idx].username,
    email: updates.email?.trim() || users[idx].email,
    password: updates.password?.trim() || users[idx].password,
    name: updates.name !== undefined ? updates.name.trim() : users[idx].name,
    role: updates.role || users[idx].role,
    updatedAt: new Date().toISOString(),
  };

  const updatedUsers = [...users];
  updatedUsers[idx] = updatedItem;

  // If this user was root or primary, update root fields as well
  const isRoot =
    idx === 0 ||
    id === "admin-root" ||
    users[idx].username.toLowerCase() === creds.username.toLowerCase();

  await saveAdminCredentials({
    adminUsers: updatedUsers,
    ...(isRoot
      ? {
          username: updatedItem.username,
          password: updatedItem.password,
          email: updatedItem.email,
        }
      : {}),
  });

  return { success: true };
}

/**
 * Delete an Admin user
 */
export async function deleteAdminUser(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const creds = await getAdminCredentials();
  const users = creds.adminUsers || [...DEFAULT_ADMIN_USERS];

  if (users.length <= 1) {
    return {
      success: false,
      error: "Tidak dapat menghapus. Sistem harus memiliki minimal 1 akun Admin aktif.",
    };
  }

  const target = users.find((u) => u.id === id);
  if (!target) {
    return { success: false, error: "Akun admin tidak ditemukan." };
  }

  const updatedUsers = users.filter((u) => u.id !== id);

  // If deleted user was primary, promote next user as primary
  let rootUpdates: Partial<AdminCredentials> = {};
  if (
    target.username.toLowerCase() === creds.username.toLowerCase() &&
    updatedUsers.length > 0
  ) {
    rootUpdates = {
      username: updatedUsers[0].username,
      password: updatedUsers[0].password,
      email: updatedUsers[0].email,
    };
  }

  await saveAdminCredentials({
    adminUsers: updatedUsers,
    ...rootUpdates,
  });

  return { success: true };
}

/**
 * Authenticate login across multiple admin users
 */
export async function authenticateAdminUser(
  username: string,
  pass: string
): Promise<{ success: boolean; user?: AdminUserItem; error?: string }> {
  const creds = await getAdminCredentials();
  const users = creds.adminUsers || ensureAdminUsers(creds);

  const cleanUser = username.trim().toLowerCase();
  const matched = users.find(
    (u) => (u.username || "").trim().toLowerCase() === cleanUser && u.password === pass
  );

  // Fallback check against root creds
  const isRootMatch =
    cleanUser === (creds.username || "admin").trim().toLowerCase() &&
    pass === (creds.password || "rizxstudio2026");

  if (matched || isRootMatch) {
    const active = matched || users[0];
    return { success: true, user: active };
  }

  return { success: false, error: "Username atau password salah." };
}

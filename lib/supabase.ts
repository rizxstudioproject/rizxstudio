import { createClient } from "@supabase/supabase-js";

// Production Supabase Project credentials for Rizx Studio Portfolio
const DEFAULT_SUPABASE_URL = "https://tbbfetcuiplwlxcyjayw.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_NCtw2Ef307vYdZsF27LlFQ_N9n7yPsh";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project-id")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

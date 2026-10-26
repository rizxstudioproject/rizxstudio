"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  SocialContactsConfig,
  DEFAULT_SOCIAL_CONTACTS,
  getSocialContacts,
  saveSocialContacts,
  normalizeSocialUrl,
} from "@/lib/socialService";

export type CursorEffectType = "off" | "ink" | "hologram" | "ghost" | "particles" | "fluid";
export type ThemeMode = "dark" | "light";

export interface MotionScrollConfig {
  smoothInertia: boolean;
  parallax: boolean;
  scrollReveal: boolean;
}

export type { SocialContactsConfig };
export { normalizeSocialUrl };

export interface ColorPreset {
  id: string;
  name: string;
  label: { en: string; id: string; min: string };
  primary: string;
  accent: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "teal",
    name: "Teal Signature",
    label: { en: "Teal Signature", id: "Teal Khas Rizx", min: "Teal Khas Rizx" },
    primary: "#16b09f",
    accent: "#06B6D4",
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    label: { en: "Emerald Matrix", id: "Zamrud Modern", min: "Zamrud Modern" },
    primary: "#10B981",
    accent: "#34D399",
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon Violet",
    label: { en: "Cyber Neon Violet", id: "Ungu Cyberpunk", min: "Ungu Cyberpunk" },
    primary: "#8B5CF6",
    accent: "#C084FC",
  },
  {
    id: "amber",
    name: "Golden Sunset",
    label: { en: "Golden Sunset", id: "Emas Senja", min: "Ameh Sinjo" },
    primary: "#F59E0B",
    accent: "#FBBF24",
  },
  {
    id: "rose",
    name: "Electric Rose",
    label: { en: "Electric Rose", id: "Mawar Neon", min: "Mawa Neon" },
    primary: "#F43F5E",
    accent: "#FB7185",
  },
  {
    id: "blue",
    name: "Deep Ocean",
    label: { en: "Deep Ocean", id: "Biru Samudra", min: "Biru Lautan" },
    primary: "#0284C7",
    accent: "#38BDF8",
  },
];

export interface MotionThemeContextType {
  // Theme Mode
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;

  // Colors
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  applyColorPreset: (presetId: string) => void;
  colorPresets: ColorPreset[];

  // Cursor Effects
  cursorEffect: CursorEffectType;
  setCursorEffect: (effect: CursorEffectType) => void;
  comboMode: boolean;
  setComboMode: (val: boolean) => void;
  disableOnMobile: boolean;
  setDisableOnMobile: (val: boolean) => void;

  // Motion Scroll
  motionScroll: MotionScrollConfig;
  setMotionScroll: (val: Partial<MotionScrollConfig>) => void;

  // Contacts & Socials
  socialContacts: SocialContactsConfig;
  updateSocialContacts: (contacts: Partial<SocialContactsConfig>) => void;

  // Reset to Defaults
  resetToDefaults: () => void;
}

const STORAGE_KEY = "rizx_motion_theme_settings_v2";
const SUPABASE_THEME_KEY = "site-theme-motion-config";

const defaultSettings = {
  themeMode: "dark" as ThemeMode,
  primaryColor: "#16b09f",
  accentColor: "#06B6D4",
  cursorEffect: "off" as CursorEffectType,
  comboMode: false,
  disableOnMobile: false,
  motionScroll: {
    smoothInertia: true,
    parallax: true,
    scrollReveal: true,
  },
  socialContacts: {
    whatsappNumber: "6282381769146",
    whatsappMessage: "Halo Fomy R / Rizx Studio, saya ingin berkonsultasi mengenai proyek kreatif/desain.",
    instagramUrl: "https://www.instagram.com/rizxstudio/",
    linkedinUrl: "https://www.linkedin.com/in/rizxstudio/",
    email: "fomy@rizxstudio.com",
    githubUrl: "https://github.com/rizxstudio",
  },
};

const MotionThemeContext = createContext<MotionThemeContextType | undefined>(undefined);

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function MotionThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultSettings.themeMode);
  const [primaryColor, setPrimaryColorState] = useState<string>(defaultSettings.primaryColor);
  const [accentColor, setAccentColorState] = useState<string>(defaultSettings.accentColor);
  const [cursorEffect, setCursorEffectState] = useState<CursorEffectType>(defaultSettings.cursorEffect);
  const [comboMode, setComboModeState] = useState<boolean>(defaultSettings.comboMode);
  const [disableOnMobile, setDisableOnMobileState] = useState<boolean>(defaultSettings.disableOnMobile);
  const [motionScroll, setMotionScrollState] = useState<MotionScrollConfig>(defaultSettings.motionScroll);
  const [socialContacts, setSocialContactsState] = useState<SocialContactsConfig>(defaultSettings.socialContacts);
  const [isHydrated, setIsHydrated] = useState(false);

  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(
    typeof window !== "undefined"
      ? `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      : "server"
  );
  const lastLocalChangeTimeRef = useRef<number>(Date.now());

  // Direct synchronous DOM updater for instant feedback without layout thrashing
  const applyDomTheme = useCallback((mode: ThemeMode, primary?: string, accent?: string) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      if (document.body) {
        document.body.classList.add("dark");
        document.body.classList.remove("light");
      }
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      if (document.body) {
        document.body.classList.add("light");
        document.body.classList.remove("dark");
      }
    }

    const pColor = primary || primaryColor;
    const aColor = accent || accentColor;
    root.style.setProperty("--primary-color", pColor);
    root.style.setProperty("--accent-color", aColor);
    const rgb = hexToRgb(pColor);
    if (rgb) {
      root.style.setProperty("--primary-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }, [primaryColor, accentColor]);

  // Hydrate from localStorage & Supabase Cloud + Realtime Auto-Sync
  useEffect(() => {
    let localSavedTimestamp = 0;

    // 1. First hydrate from local device storage for instantaneous UI response
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.updatedAt) localSavedTimestamp = Number(parsed.updatedAt);
        if (parsed.themeMode) {
          setThemeModeState(parsed.themeMode);
          applyDomTheme(parsed.themeMode, parsed.primaryColor, parsed.accentColor);
        }
        if (parsed.primaryColor) {
          setPrimaryColorState(parsed.primaryColor === "#14AF9E" ? "#16b09f" : parsed.primaryColor);
        }
        if (parsed.accentColor) setAccentColorState(parsed.accentColor);
        if (parsed.cursorEffect) setCursorEffectState(parsed.cursorEffect);
        if (typeof parsed.comboMode === "boolean") setComboModeState(parsed.comboMode);
        if (typeof parsed.disableOnMobile === "boolean") {
          setDisableOnMobileState(parsed._v === 2 ? parsed.disableOnMobile : false);
        }
        if (parsed.motionScroll) setMotionScrollState(parsed.motionScroll);
        if (parsed.socialContacts) setSocialContactsState(parsed.socialContacts);
      }
    } catch (e) {
      console.warn("Failed to load local motion theme settings:", e);
    }

    // 2. Fetch cloud-persisted theme & cursor settings from Supabase Cloud
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("client_descriptions")
            .select("description")
            .eq("client_id", SUPABASE_THEME_KEY)
            .single();

          if (!error && data && data.description) {
            const cloud = JSON.parse(data.description);
            const cloudTimestamp = cloud.updatedAt ? Number(cloud.updatedAt) : 0;

            // Only overwrite local settings if cloud is strictly newer than what user saved locally
            if (!localSavedTimestamp || cloudTimestamp >= localSavedTimestamp) {
              if (cloud.themeMode) {
                setThemeModeState(cloud.themeMode);
                applyDomTheme(cloud.themeMode, cloud.primaryColor, cloud.accentColor);
              }
              if (cloud.primaryColor) setPrimaryColorState(cloud.primaryColor === "#14AF9E" ? "#16b09f" : cloud.primaryColor);
              if (cloud.accentColor) setAccentColorState(cloud.accentColor);
              if (cloud.cursorEffect) setCursorEffectState(cloud.cursorEffect);
              if (typeof cloud.comboMode === "boolean") setComboModeState(cloud.comboMode);
              if (typeof cloud.disableOnMobile === "boolean") setDisableOnMobileState(cloud.disableOnMobile);
              if (cloud.motionScroll) setMotionScrollState(cloud.motionScroll);

              localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: 2, ...cloud }));
            }
          }
        } catch (err) {
          console.warn("Notice loading cloud theme settings:", err);
        }
      })();
    }

    // 3. Set up Supabase Realtime WebSocket subscription (instant cross-device sync)
    let themeChannel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        themeChannel = supabase
          .channel(`realtime-theme-${Math.random().toString(36).substring(7)}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "client_descriptions",
              filter: `client_id=eq.${SUPABASE_THEME_KEY}`,
            },
            (payload) => {
              if (payload.new && (payload.new as any).description) {
                try {
                  const updated = JSON.parse((payload.new as any).description);

                  // Prevent echo loop from this same client session
                  if (updated.sessionId && updated.sessionId === sessionIdRef.current) {
                    return;
                  }

                  // Prevent stale network packets from reverting newer local changes
                  const incomingTime = updated.updatedAt ? Number(updated.updatedAt) : 0;
                  if (incomingTime && incomingTime < lastLocalChangeTimeRef.current) {
                    return;
                  }

                  if (updated.themeMode) {
                    setThemeModeState(updated.themeMode);
                    applyDomTheme(updated.themeMode, updated.primaryColor, updated.accentColor);
                  }
                  if (updated.primaryColor) setPrimaryColorState(updated.primaryColor);
                  if (updated.accentColor) setAccentColorState(updated.accentColor);
                  if (updated.cursorEffect) setCursorEffectState(updated.cursorEffect);
                  if (typeof updated.comboMode === "boolean") setComboModeState(updated.comboMode);
                  if (typeof updated.disableOnMobile === "boolean") setDisableOnMobileState(updated.disableOnMobile);
                  if (updated.motionScroll) setMotionScrollState(updated.motionScroll);

                  localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: 2, ...updated }));
                } catch (err) {
                  console.warn("Realtime theme sync parse error:", err);
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Supabase Realtime theme subscription notice:", err);
      }
    }

    // 4. Cross-tab BroadcastChannel for instant in-browser tab sync
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        broadcastChannel = new BroadcastChannel("rizx_theme_motion_channel");
        broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === "THEME_SYNC" && event.data.payload) {
            const p = event.data.payload;

            // Ignore self-broadcasts
            if (p.sessionId && p.sessionId === sessionIdRef.current) {
              return;
            }

            const pTime = p.updatedAt ? Number(p.updatedAt) : 0;
            if (pTime && pTime < lastLocalChangeTimeRef.current) {
              return;
            }

            if (p.themeMode) {
              setThemeModeState(p.themeMode);
              applyDomTheme(p.themeMode, p.primaryColor, p.accentColor);
            }
            if (p.primaryColor) setPrimaryColorState(p.primaryColor);
            if (p.accentColor) setAccentColorState(p.accentColor);
            if (p.cursorEffect) setCursorEffectState(p.cursorEffect);
            if (typeof p.comboMode === "boolean") setComboModeState(p.comboMode);
            if (typeof p.disableOnMobile === "boolean") setDisableOnMobileState(p.disableOnMobile);
            if (p.motionScroll) setMotionScrollState(p.motionScroll);
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel theme notice:", e);
      }
    }

    // 5. Fetch latest cloud-persisted social contacts
    getSocialContacts()
      .then((cloudContacts) => {
        setSocialContactsState(cloudContacts);
      })
      .catch((err) => console.warn("Notice loading cloud social contacts:", err));

    setIsHydrated(true);

    // After 1.2s, enable cloud push for user interactions
    const initTimer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1200);

    return () => {
      clearTimeout(initTimer);
      if (themeChannel) supabase?.removeChannel(themeChannel);
      if (broadcastChannel) broadcastChannel.close();
    };
  }, [applyDomTheme]);

  // Sync to localStorage & Supabase Cloud
  const persistSettings = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const now = Date.now();
      const payload = {
        _v: 2,
        themeMode,
        primaryColor,
        accentColor,
        cursorEffect,
        comboMode,
        disableOnMobile,
        motionScroll,
        socialContacts,
        sessionId: sessionIdRef.current,
        updatedAt: now,
      };

      // 1. LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // 2. BroadcastChannel
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const bc = new BroadcastChannel("rizx_theme_motion_channel");
          bc.postMessage({ type: "THEME_SYNC", payload });
          bc.close();
        } catch (e) {
          // ignore
        }
      }

      // 3. Push to Supabase Cloud (debounced 600ms) once initial hydration is complete
      if (!isInitialLoad.current && isSupabaseConfigured && supabase) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
          if (!supabase) return;
          try {
            await supabase.from("client_descriptions").upsert(
              {
                client_id: SUPABASE_THEME_KEY,
                client_name: "Theme & Motion Config",
                category: "System Config",
                description: JSON.stringify(payload),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "client_id" }
            );
          } catch (err) {
            console.warn("Error saving theme settings to Supabase:", err);
          }
        }, 600);
      }
    } catch (e) {
      console.warn("Failed to save motion theme settings:", e);
    }
  }, [themeMode, primaryColor, accentColor, cursorEffect, comboMode, disableOnMobile, motionScroll, socialContacts]);

  useEffect(() => {
    if (isHydrated) {
      persistSettings();
    }
  }, [isHydrated, persistSettings]);

  // Update Global CSS Variables on HTML element
  useEffect(() => {
    applyDomTheme(themeMode, primaryColor, accentColor);
  }, [themeMode, primaryColor, accentColor, applyDomTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    lastLocalChangeTimeRef.current = Date.now();
    setThemeModeState(mode);
    applyDomTheme(mode);
  };

  const toggleThemeMode = () => {
    lastLocalChangeTimeRef.current = Date.now();
    const nextMode: ThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeModeState(nextMode);
    applyDomTheme(nextMode);
  };

  const setPrimaryColor = (color: string) => setPrimaryColorState(color);
  const setAccentColor = (color: string) => setAccentColorState(color);

  const applyColorPreset = (presetId: string) => {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setPrimaryColorState(preset.primary);
      setAccentColorState(preset.accent);
    }
  };

  const setCursorEffect = (effect: CursorEffectType) => setCursorEffectState(effect);
  const setComboMode = (val: boolean) => setComboModeState(val);
  const setDisableOnMobile = (val: boolean) => setDisableOnMobileState(val);

  const setMotionScroll = (val: Partial<MotionScrollConfig>) => {
    setMotionScrollState((prev) => ({ ...prev, ...val }));
  };

  const updateSocialContacts = (contacts: Partial<SocialContactsConfig>) => {
    setSocialContactsState((prev) => {
      const updated: SocialContactsConfig = {
        ...prev,
        ...contacts,
        instagramUrl: contacts.instagramUrl !== undefined ? normalizeSocialUrl(contacts.instagramUrl, "instagram") : prev.instagramUrl,
        linkedinUrl: contacts.linkedinUrl !== undefined ? normalizeSocialUrl(contacts.linkedinUrl, "linkedin") : prev.linkedinUrl,
        githubUrl: contacts.githubUrl !== undefined ? normalizeSocialUrl(contacts.githubUrl, "github") : prev.githubUrl,
      };
      saveSocialContacts(updated).catch((err) => console.warn("Notice saving cloud social contacts:", err));
      return updated;
    });
  };

  const resetToDefaults = () => {
    setThemeModeState(defaultSettings.themeMode);
    setPrimaryColorState(defaultSettings.primaryColor);
    setAccentColorState(defaultSettings.accentColor);
    setCursorEffectState(defaultSettings.cursorEffect);
    setComboModeState(defaultSettings.comboMode);
    setDisableOnMobileState(defaultSettings.disableOnMobile);
    setMotionScrollState(defaultSettings.motionScroll);
    setSocialContactsState(defaultSettings.socialContacts);
  };

  return (
    <MotionThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        toggleThemeMode,
        primaryColor,
        setPrimaryColor,
        accentColor,
        setAccentColor,
        applyColorPreset,
        colorPresets: COLOR_PRESETS,
        cursorEffect,
        setCursorEffect,
        comboMode,
        setComboMode,
        disableOnMobile,
        setDisableOnMobile,
        motionScroll,
        setMotionScroll,
        socialContacts,
        updateSocialContacts,
        resetToDefaults,
      }}
    >
      {children}
    </MotionThemeContext.Provider>
  );
}

export function useMotionTheme() {
  const context = useContext(MotionThemeContext);
  if (!context) {
    throw new Error("useMotionTheme must be used within a MotionThemeProvider");
  }
  return context;
}

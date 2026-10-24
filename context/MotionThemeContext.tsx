"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CursorEffectType = "off" | "ink" | "hologram" | "ghost" | "particles" | "fluid";
export type ThemeMode = "dark" | "light";

export interface MotionScrollConfig {
  smoothInertia: boolean;
  parallax: boolean;
  scrollReveal: boolean;
}

export interface SocialContactsConfig {
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  linkedinUrl: string;
  email: string;
  githubUrl: string;
}

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

const defaultSettings = {
  themeMode: "dark" as ThemeMode,
  primaryColor: "#16b09f",
  accentColor: "#06B6D4",
  cursorEffect: "fluid" as CursorEffectType,
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

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.themeMode) setThemeModeState(parsed.themeMode);
        if (parsed.primaryColor) {
          setPrimaryColorState(parsed.primaryColor === "#14AF9E" ? "#16b09f" : parsed.primaryColor);
        }
        if (parsed.accentColor) setAccentColorState(parsed.accentColor);
        if (parsed.cursorEffect) setCursorEffectState(parsed.cursorEffect);
        if (typeof parsed.comboMode === "boolean") setComboModeState(parsed.comboMode);
        if (typeof parsed.disableOnMobile === "boolean") {
          // If explicitly toggled under active version, keep preference; otherwise enable touch by default
          setDisableOnMobileState(parsed._v === 2 ? parsed.disableOnMobile : false);
        }
        if (parsed.motionScroll) setMotionScrollState(parsed.motionScroll);
        if (parsed.socialContacts) setSocialContactsState(parsed.socialContacts);
      }
    } catch (e) {
      console.warn("Failed to load motion theme settings:", e);
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage
  const persistSettings = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.style.setProperty("--primary-color", primaryColor);
    root.style.setProperty("--accent-color", accentColor);

    const rgb = hexToRgb(primaryColor);
    if (rgb) {
      root.style.setProperty("--primary-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }

    // Set theme attribute & class
    root.setAttribute("data-theme", themeMode);
    if (themeMode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [themeMode, primaryColor, accentColor]);

  const setThemeMode = (mode: ThemeMode) => setThemeModeState(mode);
  const toggleThemeMode = () => setThemeModeState((prev) => (prev === "dark" ? "light" : "dark"));

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
    setSocialContactsState((prev) => ({ ...prev, ...contacts }));
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

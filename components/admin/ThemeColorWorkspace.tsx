"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiPaletteFill as HiPaintBrush,
  RiCheckFill as HiCheck,
  RiSparklingFill as HiSparkles,
  RiRestartFill as HiArrowPath,
  RiEyeFill as HiEye,
  RiColorFilterFill as HiSwatch,
  RiCursorFill as HiCursorArrowRays,
  RiSmartphoneFill as HiDevicePhoneMobile,
  RiFlashlightFill as HiBolt,
  RiEqualizerFill as HiAdjustmentsHorizontal,
  RiFullscreenFill as HiArrowsPointingOut,
  RiSunFill,
  RiMoonClearFill,
} from "react-icons/ri";
import { useMotionTheme, CursorEffectType } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function ThemeColorWorkspace() {
  const {
    themeMode,
    setThemeMode,
    toggleThemeMode,
    primaryColor,
    setPrimaryColor,
    accentColor,
    setAccentColor,
    applyColorPreset,
    colorPresets,
    resetToDefaults,
    // Cursor & Motion States
    cursorEffect,
    setCursorEffect,
    comboMode,
    setComboMode,
    disableOnMobile,
    setDisableOnMobile,
    motionScroll,
    setMotionScroll,
  } = useMotionTheme();

  const { lang, tr } = useLang();
  const [activeSubTab, setActiveSubTab] = useState<"colors" | "cursor">("colors");
  const [saveToast, setSaveToast] = useState(false);
  const isLight = themeMode === "light";

  const triggerSaved = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const cursorOptions: {
    id: CursorEffectType;
    title: { en: string; id: string; min: string };
    desc: { en: string; id: string; min: string };
    icon: string;
    badge: string;
  }[] = [
    {
      id: "off",
      title: {
        en: "Off (Default System Cursor)",
        id: "Off (Matikan Efek Kursor)",
        min: "Off (Matian Efek Kursor)",
      },
      desc: {
        en: "No custom canvas follower, native browser cursor only.",
        id: "Tanpa efek canvas, kursor asli browser standar.",
        min: "Indak pakai efek canvas, kursor biaso se.",
      },
      icon: "⚪",
      badge: "Clean",
    },
    {
      id: "ink",
      title: {
        en: "Liquid Ink Splash",
        id: "Tinta / Ink Splash",
        min: "Tinta / Titikan Tinta Cair",
      },
      desc: {
        en: "Organic fluid ink drops that burst and fade gracefully as you move.",
        id: "Tetesan tinta cair artistik yang menyebar dan memudar secara organik.",
        min: "Titikan tinta cair nan manyeba jo mamuda sacaro rancak.",
      },
      icon: "💧",
      badge: "Artistic",
    },
    {
      id: "hologram",
      title: {
        en: "Hologram / Cyberpunk Scan",
        id: "Hologram / Cyberpunk Scan",
        min: "Hologram / Scan Cyberpunk",
      },
      desc: {
        en: "Futuristic neon target ring, rotating dashed arcs, and tech reticle.",
        id: "Ring neon futuristik dengan busur berputar, scanline, dan retikel digital.",
        min: "Lingkaran neon futuristik nan baputa jo garis scan digital.",
      },
      icon: "🎯",
      badge: "Sci-Fi",
    },
    {
      id: "ghost",
      title: {
        en: "Ghost / Shadow Ribbon",
        id: "Ghost / Shadow Motion",
        min: "Ghost / Bayang Babantuak Pita",
      },
      desc: {
        en: "Translucent curved ribbon trailing fluidly behind the cursor trajectory.",
        id: "Jejak bayangan transparan memanjang yang meliuk dinamis mengikuti gerakan.",
        min: "Jajak bayang-bayang panjang nan liuk-maliuk mangikuik garak kursor.",
      },
      icon: "🌫️",
      badge: "Smooth",
    },
    {
      id: "particles",
      title: {
        en: "Particles / Star Dust",
        id: "Partikel / Serbuk Bintang",
        min: "Partikel / Serbuk Bintang Gemerlap",
      },
      desc: {
        en: "Twinkling stardust sparks and glowing dust particles floating dynamically.",
        id: "Serbuk partikel glowing yang berhamburan dan melayang saat kursor meluncur.",
        min: "Serbuk partikel bakilau nan tabang kutiko kursor bagarak.",
      },
      icon: "✨",
      badge: "Vibrant",
    },
    {
      id: "fluid",
      title: {
        en: "Magnetic Fluid / Blob",
        id: "Magnetic Fluid / Blob",
        min: "Cairan Magnetik / Blob Lentur",
      },
      desc: {
        en: "Dynamic liquid blob that expands and magnetically snaps to buttons and cards.",
        id: "Cairan kustom kursor yang membesar dan tertarik menempel secara magnetis ke tombol/link.",
        min: "Cairan lentur nan mambasa sarato manempel ka tombol jo pautan.",
      },
      icon: "🔮",
      badge: "Interactive",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 pb-28">
      {/* Header with Standard Mobile Padding */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${isLight ? "border-slate-200" : "border-white/10"}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <span className={`text-[11px] font-mono uppercase tracking-widest ${isLight ? "text-slate-500 font-semibold" : "text-neutral-400"}`}>
              {tr("Theme & Cursor Staging", "Pewarnaan, Tema & Kursor", "Pewarnaan, Tema & Kursor")}
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {tr("Theme, Colors & Cursor Effects", "Pengaturan Warna & Efek Kursor", "Aturan Warna & Efek Kursor")}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
            {tr(
              "Customize primary and accent colors, reactive CSS variables, and interactive cursor animations in one unified place.",
              "Ubah skema warna utama, CSS variables, dan animasi efek kursor interaktif secara lengkap dalam satu tempat.",
              "Tuka skema warna utamo jo efek kursor interaktif dalam satu tampek nan lengkap."
            )}
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1.5 rounded-xl text-xs font-mono text-white flex items-center gap-1.5 shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <HiCheck className="w-3.5 h-3.5" />
              <span>{tr("Saved", "Tersimpan", "Tasimpan")}</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation Pills (Colors & Theme vs Cursor Effects) */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-2 max-w-md ${
        isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/80 border-white/10"
      }`}>
        <button
          type="button"
          onClick={() => setActiveSubTab("colors")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "colors"
              ? isLight
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "bg-white/10 text-white shadow-md border border-white/15"
              : isLight
              ? "text-slate-600 hover:text-slate-900"
              : "text-neutral-400 hover:text-white"
          }`}
          style={activeSubTab === "colors" ? { borderColor: `${primaryColor}55`, color: primaryColor } : {}}
        >
          <HiSwatch className="w-4 h-4" />
          <span>{tr("Warna & Tema", "Colors & Theme", "Warna & Tema")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("cursor")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "cursor"
              ? isLight
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "bg-white/10 text-white shadow-md border border-white/15"
              : isLight
              ? "text-slate-600 hover:text-slate-900"
              : "text-neutral-400 hover:text-white"
          }`}
          style={activeSubTab === "cursor" ? { borderColor: `${primaryColor}55`, color: primaryColor } : {}}
        >
          <HiCursorArrowRays className="w-4 h-4" />
          <span>{tr("Kursor & Efek Motion (6)", "Cursor & Motion Effects (6)", "Kursor & Efek Motion (6)")}</span>
        </button>
      </div>

      {/* TAB 1: COLORS & THEME */}
      {activeSubTab === "colors" && (
        <div className="space-y-6">
          {/* 0. THEME MODE SELECTION (DARK VS LIGHT) */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                {isLight ? <RiMoonClearFill className="w-4 h-4 text-teal-600" /> : <RiSunFill className="w-4 h-4 text-amber-400" />}
                <span>{tr("Theme Mode (Dark / Light)", "Mode Tampilan Tema (Gelap / Terang)", "Mode Tampilan Tema (Galok / Tarang)")}</span>
              </h3>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                isLight ? "bg-teal-50 border-teal-200 text-teal-700 font-semibold" : "bg-white/5 border-white/10 text-neutral-400"
              }`}>
                {themeMode.toUpperCase()} MODE ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setThemeMode("dark");
                  triggerSaved();
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer relative group ${
                  !isLight
                    ? "bg-neutral-900/90 border-[#16b09f] shadow-lg ring-2 ring-[#16b09f]/30"
                    : "bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                  <RiSunFill className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${!isLight ? "text-white" : "text-slate-800"}`}>
                      {tr("Dark Studio Mode", "Mode Studio Gelap (Default)", "Mode Studio Galok")}
                    </h4>
                    {!isLight && (
                      <span className="w-5 h-5 rounded-full bg-[#16b09f] text-white flex items-center justify-center text-xs">
                        <HiCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${!isLight ? "text-neutral-400" : "text-slate-500"}`}>
                    {tr("Deep space black canvas with vibrant glowing neon accents.", "Tampilan latar hitam pekat dengan aksen neon menyala.", "Latar hitam pakaik jo aksen neon tarang.")}
                  </p>
                </div>
              </button>

              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setThemeMode("light");
                  triggerSaved();
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer relative group ${
                  isLight
                    ? "bg-white border-[#16b09f] shadow-lg ring-2 ring-[#16b09f]/30"
                    : "bg-neutral-900/40 hover:bg-white/[0.04] border-white/10"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
                  <RiMoonClearFill className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {tr("Light Studio Mode", "Mode Studio Terang", "Mode Studio Tarang")}
                    </h4>
                    {isLight && (
                      <span className="w-5 h-5 rounded-full bg-[#16b09f] text-white flex items-center justify-center text-xs">
                        <HiCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {tr("Clean architectural slate background with high-contrast typography.", "Tampilan bersih bernuansa terang arsitektural kontras tinggi.", "Latar arsitektural tarang jo tulisan kontras tinggi.")}
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* 1. CURATED COLOR PRESETS */}
          <section className="space-y-3.5">
            <h3 className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <HiSwatch className={`w-4 h-4 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
              <span>{tr("Curated Color Presets", "Preset Warna Pilihan", "Piliahan Preset Warna")}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {colorPresets.map((preset) => {
                const isSelected =
                  primaryColor.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      applyColorPreset(preset.id);
                      triggerSaved();
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer relative group flex flex-col items-center gap-2 ${
                      isSelected
                        ? isLight
                          ? "bg-white border-[#16b09f] shadow-md ring-2 ring-[#16b09f]/20"
                          : "bg-white/[0.08] border-white/40 shadow-lg"
                        : isLight
                          ? "bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-sm"
                          : "bg-neutral-900/50 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Visual Swatch Pill */}
                    <div className={`relative w-11 h-11 rounded-full overflow-hidden border-2 shadow-md group-hover:scale-105 transition-transform ${
                      isLight ? "border-slate-200 shadow-slate-200" : "border-white/20"
                    }`}>
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${preset.primary} 50%, ${preset.accent} 50%)`,
                        }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <HiCheck className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="w-full">
                      <h5 className={`text-xs font-semibold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                        {preset.label[lang as keyof typeof preset.label] || preset.label.en}
                      </h5>
                      <span className={`text-[10px] font-mono ${isLight ? "text-slate-500 font-medium" : "text-neutral-400"}`}>
                        {preset.primary}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. CUSTOM COLOR PICKERS & HEX INPUTS */}
          <section className="space-y-3.5">
            <h3 className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <HiPaintBrush className={`w-4 h-4 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
              <span>{tr("Custom Color Picker", "Kustomisasi Warna Bebas", "Kustomisasi Warna Bebas")}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Primary Color Picker */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/10"
              }`}>
                <div>
                  <h4 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Primary Brand Accent", "Warna Utama / Aksen Brand", "Warna Utamo / Aksen Brand")}
                  </h4>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {tr(
                      "Used for main buttons, highlights, badges, and cursor blob.",
                      "Digunakan untuk tombol utama, sorotan teks, badge, dan kursor.",
                      "Dipakai untuak tombol utamo, sorotan teks, badge, jo kursor."
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    className={`relative w-10 h-10 rounded-full border shadow-sm shrink-0 cursor-pointer overflow-hidden transition-transform hover:scale-105 active:scale-95 ${
                      isLight ? "border-slate-300 shadow-slate-200" : "border-white/25"
                    }`}
                    style={{ backgroundColor: primaryColor }}
                    title={tr("Pilih Warna", "Pick Color", "Pilih Warna")}
                  >
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        triggerSaved();
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Pick Primary Color"
                    />
                  </label>

                  <div className="flex-1 relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs ${isLight ? "text-slate-400 font-semibold" : "text-neutral-500"}`}>
                      HEX
                    </span>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        triggerSaved();
                      }}
                      className={`w-full border rounded-xl pl-12 pr-4 py-2.5 text-xs font-mono uppercase focus:outline-none transition-all ${
                        isLight
                          ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#16b09f] focus:bg-white"
                          : "bg-neutral-950 border-white/10 text-white focus:border-white/30"
                      }`}
                      placeholder="#16b09f"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary / Accent Color Picker */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/10"
              }`}>
                <div>
                  <h4 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Secondary Accent Color", "Warna Aksen Sekunder", "Warna Aksen Kaduo")}
                  </h4>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {tr(
                      "Used for secondary gradient fades, particles, and chart series.",
                      "Digunakan untuk gradasi sekunder, partikel bintang, dan grafik seri 2.",
                      "Dipakai untuak gradasi kaduo, partikel bintang, sarato grafik seri 2."
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    className={`relative w-10 h-10 rounded-full border shadow-sm shrink-0 cursor-pointer overflow-hidden transition-transform hover:scale-105 active:scale-95 ${
                      isLight ? "border-slate-300 shadow-slate-200" : "border-white/25"
                    }`}
                    style={{ backgroundColor: accentColor }}
                    title={tr("Pilih Warna", "Pick Color", "Pilih Warna")}
                  >
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => {
                        setAccentColor(e.target.value);
                        triggerSaved();
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Pick Secondary Accent Color"
                    />
                  </label>

                  <div className="flex-1 relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs ${isLight ? "text-slate-400 font-semibold" : "text-neutral-500"}`}>
                      HEX
                    </span>
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => {
                        setAccentColor(e.target.value);
                        triggerSaved();
                      }}
                      className={`w-full border rounded-xl pl-12 pr-4 py-2.5 text-xs font-mono uppercase focus:outline-none transition-all ${
                        isLight
                          ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#16b09f] focus:bg-white"
                          : "bg-neutral-950 border-white/10 text-white focus:border-white/30"
                      }`}
                      placeholder="#06B6D4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. LIVE COMPONENT PREVIEW */}
          <section className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
            isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/80 border-white/10"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiEye className={`w-4 h-4 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
                <h3 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {tr("Live Theme Application Preview", "Pratinjau Hasil Penerapan Warna", "Caliak Hasil Panarapan Warna")}
                </h3>
              </div>
              <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                {tr("Reactive CSS", "CSS Reaktif", "CSS Reaktif")}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4 items-center ${
              isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/5"
            }`}>
              <div className="space-y-2">
                <span className={`text-[11px] font-mono block ${isLight ? "text-slate-600 font-semibold" : "text-neutral-400"}`}>
                  {tr("Solid & Outline Buttons", "Tombol Solid & Garis", "Tombol Solid & Garih")}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl text-black font-semibold text-xs shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary CTA
                  </button>
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 rounded-xl font-medium text-xs border ${isLight ? "bg-white shadow-sm" : "text-white"}`}
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    Outline CTA
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[11px] font-mono block ${isLight ? "text-slate-600 font-semibold" : "text-neutral-400"}`}>
                  {tr("Badges & Tags", "Badge & Tag Status", "Badge & Tag Status")}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 border"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      borderColor: `${primaryColor}40`,
                      color: primaryColor,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: primaryColor }}
                    />
                    SELECTED WORK
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[11px] font-mono block ${isLight ? "text-slate-600 font-semibold" : "text-neutral-400"}`}>
                  {tr("Gradient Typography", "Tipografi Gradasi", "Tulisan Gradasi")}
                </span>
                <h4
                  className="text-base sm:text-lg font-bold tracking-tight bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                  }}
                >
                  Creative Meets AI
                </h4>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: CURSOR & MOTION EFFECTS */}
      {activeSubTab === "cursor" && (
        <div className="space-y-6">
          {/* 1. CURSOR SELECTION CARDS */}
          <section className="space-y-3.5">
            <h3 className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <HiCursorArrowRays className={`w-4 h-4 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
              <span>{tr("Interactive Cursor Styles", "Pilihan Efek Kursor Interaktif", "Pilihan Efek Kursor")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cursorOptions.map((opt) => {
                const isSelected = cursorEffect === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setCursorEffect(opt.id);
                      triggerSaved();
                    }}
                    className={`relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden group ${
                      isSelected
                        ? isLight
                          ? "bg-white border-[#16b09f] shadow-md ring-2 ring-[#16b09f]/20"
                          : "bg-white/[0.08] shadow-lg shadow-black/40 border-white/30"
                        : isLight
                        ? "bg-white hover:bg-slate-50 border-slate-200/90 shadow-sm"
                        : "bg-neutral-900/40 hover:bg-white/[0.04] border-white/10"
                    }`}
                    style={{
                      borderColor: isSelected ? primaryColor : undefined,
                    }}
                  >
                    {isSelected && (
                      <div
                        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <HiCheck className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl p-2 rounded-xl bg-white/[0.05] border border-white/5">
                        {opt.icon}
                      </span>
                      <div>
                        <h4 className={`text-sm font-semibold transition-colors ${isLight ? "text-slate-900" : "text-white"}`}>
                          {opt.title[lang as keyof typeof opt.title] || opt.title.en}
                        </h4>
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isLight ? "bg-slate-100 text-slate-600" : "bg-white/[0.05] text-neutral-400"
                        }`}>
                          {opt.badge}
                        </span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      {opt.desc[lang as keyof typeof opt.desc] || opt.desc.en}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. SPECIAL BEHAVIOR TOGGLES */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Combo Mode */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex items-start justify-between gap-4 ${
              isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/10"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HiSparkles className="w-4 h-4 text-amber-400" />
                  <h4 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Combo Mode (All Effects Combined)", "Gabungkan Semua Efek / Combo Mode", "Gabuangan Sadonyo Efek / Combo")}
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Activate fluid magnetic blob, starry particles, and shadow trail simultaneously for maximum visual impact.",
                    "Mengaktifkan fluid magnetic blob, partikel bintang, dan jejak ribbon secara bersamaan untuk visual spektakuler.",
                    "Aktipan fluid magnetic blob, partikel bintang, sarato jejak ribbon babarengan."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setComboMode(!comboMode);
                  triggerSaved();
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                  comboMode ? "bg-white" : "bg-neutral-800"
                }`}
                style={{ backgroundColor: comboMode ? primaryColor : undefined }}
                aria-label="Toggle Combo Mode"
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-black shadow transform transition-transform ${
                    comboMode ? "translate-x-6 bg-white" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Mobile / Touchscreen Interactive Effect */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex items-start justify-between gap-4 ${
              isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/10"
            }`}>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <HiDevicePhoneMobile className="w-4 h-4 text-cyan-400" />
                  <h4 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Touch Effects on Mobile / Tablet", "Efek Touch di Layar HP & Tablet", "Efek Sentuah di Layar HP & Tablet")}
                  </h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                      !disableOnMobile
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-neutral-800 text-neutral-400 border border-white/10"
                    }`}
                  >
                    {!disableOnMobile
                      ? tr("Aktif di HP", "Active on Mobile", "Aktif di HP")
                      : tr("Mati di HP", "Disabled on Mobile", "Mati di HP")}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Allow finger drag gestures on smartphones and tablets to render fluid trails, sparks, and ripple ripples.",
                    "Izinkan usapan jari di layar HP dan tablet untuk memunculkan jejak tinta, percikan bintang, dan efek blob.",
                    "Izinkan usapan jari di layar HP mamunculkan jejak rancak."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDisableOnMobile(!disableOnMobile);
                  triggerSaved();
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                  !disableOnMobile ? "bg-white" : "bg-neutral-800"
                }`}
                style={{ backgroundColor: !disableOnMobile ? primaryColor : undefined }}
                aria-label="Toggle Mobile Touch Effects"
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-black shadow transform transition-transform ${
                    !disableOnMobile ? "translate-x-6 bg-white" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* 3. MOTION SCROLL & TRACKPAD PARAMETERS */}
          <section className="space-y-4">
            <h3 className={`text-base font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <HiAdjustmentsHorizontal className={`w-5 h-5 ${isLight ? "text-slate-500" : "text-neutral-400"}`} />
              <span>{tr("Motion Scroll & Trackpad", "Pengaturan Motion Scroll & Trackpad", "Aturan Motion Scroll & Trackpad")}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Smooth Inertial Scroll */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? "bg-white border-slate-200/90 shadow-2xs" : "bg-neutral-900/50 border-white/5"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Smooth Inertial Scroll", "Scroll Halus Berinersia", "Scroll Haluih Bainersia")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMotionScroll({ smoothInertia: !motionScroll.smoothInertia });
                      triggerSaved();
                    }}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                      isLight && !motionScroll.smoothInertia ? "bg-slate-200" : "bg-[#262626]"
                    }`}
                    style={{ backgroundColor: motionScroll.smoothInertia ? primaryColor : undefined }}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                        motionScroll.smoothInertia ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Silky smooth deceleration when scrolling via mouse wheel or precision trackpads.",
                    "Pengereman scroll yang halus ketika digulir dengan mouse wheel atau trackpad.",
                    "Pangarian scroll nan haluih kutiko diguliah jo mouse atau trackpad."
                  )}
                </p>
              </div>

              {/* Parallax Motion */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? "bg-white border-slate-200/90 shadow-2xs" : "bg-neutral-900/50 border-white/5"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Parallax Depth Motion", "Efek Parallax Bertingkat", "Efek Parallax Batingkek")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMotionScroll({ parallax: !motionScroll.parallax });
                      triggerSaved();
                    }}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                      isLight && !motionScroll.parallax ? "bg-slate-200" : "bg-[#262626]"
                    }`}
                    style={{ backgroundColor: motionScroll.parallax ? primaryColor : undefined }}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                        motionScroll.parallax ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Background glows and typography travel at multi-speed depth layers during scroll.",
                    "Cahaya ambient dan tipografi bergerak pada kecepatan berbeda menciptakan ilusi kedalaman 3D.",
                    "Cahayo ambient jo tulisan bagarak babeda kacepatan mambuek ilusi kadalaman 3D."
                  )}
                </p>
              </div>

              {/* Scroll Reveal Animations */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? "bg-white border-slate-200/90 shadow-2xs" : "bg-neutral-900/50 border-white/5"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Scroll Reveal Elements", "Animasi Elemen Muncul", "Animasi Elemen Kalua")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMotionScroll({ scrollReveal: !motionScroll.scrollReveal });
                      triggerSaved();
                    }}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                      isLight && !motionScroll.scrollReveal ? "bg-slate-200" : "bg-[#262626]"
                    }`}
                    style={{ backgroundColor: motionScroll.scrollReveal ? primaryColor : undefined }}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                        motionScroll.scrollReveal ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Section elements fade in and slide into view as the viewport scrolls down.",
                    "Komponen halaman muncul berurutan dengan transisi lembut saat masuk viewport.",
                    "Komponen laman kalua sacaro barurutan jo transisi lambuik kutiko nampak."
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* 4. LIVE CURSOR TESTING PLAYGROUND */}
          <section className={`p-4 sm:p-6 rounded-2xl border space-y-3 ${
            isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/80 border-white/10"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiEye className={`w-4 h-4 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
                <h3 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {tr("Interactive Cursor Test Area", "Area Uji Coba Kursor Interaktif", "Tampek Uji Coba Kursor")}
                </h3>
              </div>
              <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                {cursorEffect.toUpperCase()} ACTIVE
              </span>
            </div>

            <div
              className={`relative h-32 sm:h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all overflow-hidden ${
                isLight ? "border-slate-300 bg-slate-50" : "border-white/10 bg-black/30"
              }`}
            >
              <HiSparkles className="w-8 h-8 mb-2 animate-bounce" style={{ color: primaryColor }} />
              <p className={`text-xs font-medium ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                {tr(
                  "Move your mouse or drag your finger here to preview the active cursor effect!",
                  "Gerakkan kursor atau usap jari Anda di sini untuk melihat efek kursor yang sedang aktif!",
                  "Garakkan kursor atau usap jari di siko untuak mancaliak efek kursor!"
                )}
              </p>
              <span className="text-[10px] font-mono text-neutral-500 mt-1">
                Preset: {cursorOptions.find((o) => o.id === cursorEffect)?.badge || "Custom"}
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RiPaletteFill as HiPaintBrush,
  RiSunFill as HiSun,
  RiMoonFill as HiMoon,
  RiCheckFill as HiCheck,
  RiSparklingFill as HiSparkles,
  RiRestartFill as HiArrowPath,
  RiEyeFill as HiEye,
  RiColorFilterFill as HiSwatch,
} from "react-icons/ri";
import { useMotionTheme } from "@/context/MotionThemeContext";
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
  } = useMotionTheme();

  const { lang, tr } = useLang();
  const [saveToast, setSaveToast] = useState(false);

  const triggerSaved = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              {tr("Theme & Brand Staging", "Pewarnaan & Tema Sistem", "Pewarnaan & Tema Sistem")}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tr("Color Scheme & Appearance", "Pengaturan Warna Tampilan", "Aturan Warna Tampilan")}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            {tr(
              "Customize primary and accent colors with precision color pickers or curated palettes. Changes reactively update CSS variables across all components.",
              "Ubah skema warna utama dan aksen dengan Color Picker atau palet preset. Warna terhubung ke CSS Variables dan otomatis mengubah seluruh tombol, kursor, dan grafik.",
              "Tuka skema warna utamo jo aksen jo Color Picker atau palet preset. Otomatis maubah sadonyo tombol, kursor, sarato grafik."
            )}
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-white flex items-center gap-1.5 shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <HiCheck className="w-3.5 h-3.5" />
              <span>{tr("Saved", "Tersimpan", "Tasimpan")}</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* 1. DARK & LIGHT MODE SELECTOR */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          {themeMode === "dark" ? (
            <HiMoon className="w-5 h-5 text-indigo-400" />
          ) : (
            <HiSun className="w-5 h-5 text-amber-400" />
          )}
          <span>{tr("Theme Mode (Dark / Light)", "Mode Gelap & Terang", "Mode Kalam & Tarang")}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => {
              setThemeMode("dark");
              triggerSaved();
            }}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
              themeMode === "dark"
                ? "bg-neutral-900 border-white/30 shadow-xl shadow-black/60"
                : "bg-neutral-950/60 border-white/5 hover:border-white/10"
            }`}
          >
            {themeMode === "dark" && (
              <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow"
                style={{ backgroundColor: primaryColor }}
              >
                <HiCheck className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-indigo-400">
                <HiMoon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {tr("Dark Space Mode (Default)", "Mode Gelap / Deep Space", "Mode Kalam / Deep Space")}
                </h4>
                <span className="text-xs text-neutral-400 font-mono">
                  #0a0a0a / High Contrast
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {tr(
                "Cinematic deep dark aesthetic optimal for showcasing motion graphics, video sequences, and 3D lighting.",
                "Tampilan gelap sinematik elegan, sangat ideal untuk memamerkan karya motion, video sequence, dan pencahayaan 3D.",
                "Tampilan kalam sinematik rancak, pas bana untuak mamamerkan karya motion, video, sarato 3D."
              )}
            </p>
          </button>

          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => {
              setThemeMode("light");
              triggerSaved();
            }}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
              themeMode === "light"
                ? "bg-neutral-800 border-white/30 shadow-xl shadow-black/60"
                : "bg-neutral-950/60 border-white/5 hover:border-white/10"
            }`}
          >
            {themeMode === "light" && (
              <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow"
                style={{ backgroundColor: primaryColor }}
              >
                <HiCheck className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <HiSun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {tr("Light Studio Mode", "Mode Terang / Clean Studio", "Mode Tarang / Barasiah")}
                </h4>
                <span className="text-xs text-neutral-400 font-mono">
                  #f8fafc / Clean Architectural
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {tr(
                "Clean, crisp high-readability architectural daylight layout with balanced gray contrasts.",
                "Tampilan cerah arsitektural yang bersih dengan kontras teks tajam dan tata letak minimalis modern.",
                "Tampilan tarang nan barasiah jo tulisan jaleh sarato tata latak minimalis modern."
              )}
            </p>
          </button>
        </div>
      </section>

      {/* 2. CURATED COLOR PRESETS */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <HiSwatch className="w-5 h-5 text-neutral-400" />
          <span>{tr("Curated Color Presets", "Preset Warna Pilihan", "Piliahan Preset Warna")}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer relative group flex flex-col items-center gap-2.5 ${
                  isSelected
                    ? "bg-white/[0.08] border-white/40 shadow-lg"
                    : "bg-neutral-900/50 border-white/5 hover:border-white/10"
                }`}
              >
                {/* Visual Swatch Pill */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-md group-hover:scale-105 transition-transform">
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

                <div>
                  <h5 className="text-xs font-semibold text-white truncate max-w-[110px]">
                    {preset.label[lang as keyof typeof preset.label] || preset.label.en}
                  </h5>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {preset.primary}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. CUSTOM COLOR PICKERS & HEX INPUTS */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <HiPaintBrush className="w-5 h-5 text-neutral-400" />
          <span>{tr("Custom Color Picker", "Kustomisasi Warna Bebas", "Kustomisasi Warna Bebas")}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Color Picker */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {tr("Primary Brand Accent", "Warna Utama / Aksen Brand", "Warna Utamo / Aksen Brand")}
                </h4>
                <p className="text-xs text-neutral-400">
                  {tr(
                    "Used for main buttons, highlights, badges, and cursor blob.",
                    "Digunakan untuk tombol utama, sorotan teks, badge, dan kursor.",
                    "Dipakai untuak tombol utamo, sorotan teks, badge, jo kursor."
                  )}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl border border-white/20 shadow-sm shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Native Color Input */}
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    triggerSaved();
                  }}
                  className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer border-0"
                  aria-label="Pick Primary Color"
                />
              </div>

              {/* Text Hex Input */}
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                  HEX
                </span>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    triggerSaved();
                  }}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-xs font-mono text-white uppercase focus:outline-none focus:border-white/30"
                  placeholder="#14AF9E"
                />
              </div>
            </div>
          </div>

          {/* Secondary / Accent Color Picker */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {tr("Secondary Accent Color", "Warna Aksen Sekunder", "Warna Aksen Kaduo")}
                </h4>
                <p className="text-xs text-neutral-400">
                  {tr(
                    "Used for secondary gradient fades, particles, and chart series.",
                    "Digunakan untuk gradasi sekunder, partikel bintang, dan grafik seri 2.",
                    "Dipakai untuak gradasi kaduo, partikel bintang, sarato grafik seri 2."
                  )}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl border border-white/20 shadow-sm shrink-0"
                style={{ backgroundColor: accentColor }}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Native Color Input */}
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    triggerSaved();
                  }}
                  className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer border-0"
                  aria-label="Pick Secondary Accent Color"
                />
              </div>

              {/* Text Hex Input */}
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                  HEX
                </span>
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    triggerSaved();
                  }}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-xs font-mono text-white uppercase focus:outline-none focus:border-white/30"
                  placeholder="#06B6D4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE COMPONENT PREVIEW */}
      <section className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiEye className="w-5 h-5 text-neutral-400" />
            <h3 className="text-sm font-semibold text-white">
              {tr("Live Theme Application Preview", "Pratinjau Hasil Penerapan Warna", "Caliak Hasil Panarapan Warna")}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {tr("Reactive CSS Variables", "CSS Variables Reaktif", "CSS Variables Reaktif")}
          </span>
        </div>

        <div className="p-6 rounded-xl bg-black/40 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Button preview */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-neutral-400 block">
              {tr("Solid & Outline Buttons", "Tombol Solid & Garis", "Tombol Solid & Garih")}
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-black font-semibold text-xs shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                Primary CTA
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-white font-medium text-xs border"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Outline CTA
              </button>
            </div>
          </div>

          {/* Badge & Highlight preview */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-neutral-400 block">
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

          {/* Gradient text preview */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-neutral-400 block">
              {tr("Gradient Typography", "Tipografi Gradasi", "Tulisan Gradasi")}
            </span>
            <h4
              className="text-lg font-bold tracking-tight bg-clip-text text-transparent"
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
  );
}

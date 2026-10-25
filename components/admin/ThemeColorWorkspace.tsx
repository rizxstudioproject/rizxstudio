"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RiPaletteFill as HiPaintBrush,
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
  const isLight = themeMode === "light";

  const triggerSaved = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${isLight ? "border-slate-200" : "border-white/5"}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              {tr("Theme & Brand Staging", "Pewarnaan & Tema Sistem", "Pewarnaan & Tema Sistem")}
            </span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {tr("Color Scheme & Appearance", "Pengaturan Warna Tampilan", "Aturan Warna Tampilan")}
          </h2>
          <p className={`text-sm mt-1 max-w-2xl ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
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

      {/* 1. CURATED COLOR PRESETS */}
      <section className="space-y-4">
        <h3 className={`text-base font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
          <HiSwatch className={`w-5 h-5 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
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
                    ? isLight
                      ? "bg-white border-[#16b09f] shadow-md ring-2 ring-[#16b09f]/20"
                      : "bg-white/[0.08] border-white/40 shadow-lg"
                    : isLight
                      ? "bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-sm"
                      : "bg-neutral-900/50 border-white/5 hover:border-white/10"
                }`}
              >
                {/* Visual Swatch Pill */}
                <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 shadow-md group-hover:scale-105 transition-transform ${
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

                <div>
                  <h5 className={`text-xs font-semibold truncate max-w-[110px] ${isLight ? "text-slate-900" : "text-white"}`}>
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

      {/* 3. CUSTOM COLOR PICKERS & HEX INPUTS */}
      <section className="space-y-4">
        <h3 className={`text-base font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
          <HiPaintBrush className={`w-5 h-5 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
          <span>{tr("Custom Color Picker", "Kustomisasi Warna Bebas", "Kustomisasi Warna Bebas")}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Color Picker */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/5"
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
              {/* Circular Color Swatch Input */}
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

              {/* Text Hex Input */}
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
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/5"
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
              {/* Circular Color Swatch Input */}
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

              {/* Text Hex Input */}
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

      {/* 4. LIVE COMPONENT PREVIEW */}
      <section className={`p-6 rounded-2xl border space-y-4 ${
        isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/80 border-white/10"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiEye className={`w-5 h-5 ${isLight ? "text-slate-600" : "text-neutral-400"}`} />
            <h3 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
              {tr("Live Theme Application Preview", "Pratinjau Hasil Penerapan Warna", "Caliak Hasil Panarapan Warna")}
            </h3>
          </div>
          <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
            {tr("Reactive CSS Variables", "CSS Variables Reaktif", "CSS Variables Reaktif")}
          </span>
        </div>

        <div className={`p-6 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-5 items-center ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/5"
        }`}>
          {/* Button preview */}
          <div className="space-y-2">
            <span className={`text-[11px] font-mono block ${isLight ? "text-slate-600 font-semibold" : "text-neutral-400"}`}>
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
                className={`px-4 py-2 rounded-xl font-medium text-xs border ${isLight ? "bg-white shadow-sm" : "text-white"}`}
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Outline CTA
              </button>
            </div>
          </div>

          {/* Badge & Highlight preview */}
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

          {/* Gradient text preview */}
          <div className="space-y-2">
            <span className={`text-[11px] font-mono block ${isLight ? "text-slate-600 font-semibold" : "text-neutral-400"}`}>
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


"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RiSparklingFill as HiSparkles,
  RiCursorFill as HiCursorArrowRays,
  RiSmartphoneFill as HiDevicePhoneMobile,
  RiCheckFill as HiCheck,
  RiEyeFill as HiEye,
  RiFlashlightFill as HiBolt,
  RiRestartFill as HiArrowPath,
  RiEqualizerFill as HiAdjustmentsHorizontal,
  RiFullscreenFill as HiArrowsPointingOut,
} from "react-icons/ri";
import { useMotionTheme, CursorEffectType } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function MotionEffectsWorkspace() {
  const {
    cursorEffect,
    setCursorEffect,
    comboMode,
    setComboMode,
    disableOnMobile,
    setDisableOnMobile,
    motionScroll,
    setMotionScroll,
    primaryColor,
    accentColor,
    resetToDefaults,
  } = useMotionTheme();

  const { lang, tr } = useLang();
  const [saveToast, setSaveToast] = useState(false);

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
              {tr("Motion & Follower Engine", "Mesin Motion & Kursor", "Masin Motion & Kursor")}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tr("Motion Scroll & Cursor Effects", "Pengaturan Motion & Kursor", "Aturan Motion & Kursor")}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            {tr(
              "Configure 60fps HTML5 Canvas mouse follower effects, magnetic snapping, and inertial smooth scrolling parameters.",
              "Konfigurasikan efek kursor HTML5 Canvas 60fps, daya tarik magnetis pada tombol, dan animasi inersia scroll.",
              "Atua efek kursor HTML5 Canvas 60fps, daya magnet ka tombol, sarato animasi inersia scroll rancak."
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

      {/* 1. CURSOR EFFECT SELECTOR */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <HiCursorArrowRays className="w-5 h-5 text-neutral-400" />
            <span>{tr("Cursor Follower Effect", "Pilihan Efek Kursor", "Pilihan Efek Kursor")}</span>
          </h3>
          <span className="text-xs font-mono text-neutral-400">
            {tr("Active: ", "Aktif: ", "Aktif: ")}
            <strong className="text-white capitalize">{cursorEffect}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                    ? "bg-white/[0.08] shadow-lg shadow-black/40"
                    : "bg-neutral-900/40 hover:bg-white/[0.04] border-white/5 hover:border-white/10"
                }`}
                style={{
                  borderColor: isSelected ? primaryColor : undefined,
                }}
              >
                {/* Active check pill */}
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
                    <h4 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                      {opt.title[lang as keyof typeof opt.title] || opt.title.en}
                    </h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-1.5 py-0.5 rounded bg-white/[0.05]">
                      {opt.badge}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {opt.desc[lang as keyof typeof opt.desc] || opt.desc.en}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. SPECIAL BEHAVIOR TOGGLES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Combo Mode Toggle */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HiSparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">
                {tr("Combo Mode (All Effects Combined)", "Gabungkan Semua Efek / Combo Mode", "Gabuangan Sadonyo Efek / Combo")}
              </h4>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
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
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <HiDevicePhoneMobile className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-white">
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
                  ? tr("Active (60fps Touch)", "Aktif (60fps Touch)", "Aktif (60fps Touch)")
                  : tr("Disabled on Mobile", "Nonaktif di HP", "Nonaktif di HP")}
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {tr(
                "Renders interactive visual effects (trail, glow, fluid, particles) when touching or dragging on mobile phones & tablets.",
                "Menampilkan efek visual interaktif (jejak, cahaya, fluid, partikel) saat layar sentuh HP & tablet disentuh atau digeser.",
                "Manampilan efek visual interaktif (jejak, cahayo, fluid, partikel) kutiko layar HP & tablet disentuah atau digeser."
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
            aria-label="Toggle Touch Effects on Mobile"
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
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <HiAdjustmentsHorizontal className="w-5 h-5 text-neutral-400" />
          <span>{tr("Motion Scroll & Trackpad", "Pengaturan Motion Scroll & Trackpad", "Aturan Motion Scroll & Trackpad")}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Smooth Inertial Scroll */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {tr("Smooth Inertial Scroll", "Scroll Halus Berinersia", "Scroll Haluih Bainersia")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMotionScroll({ smoothInertia: !motionScroll.smoothInertia });
                  triggerSaved();
                }}
                className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
                style={{ backgroundColor: motionScroll.smoothInertia ? primaryColor : "#262626" }}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                    motionScroll.smoothInertia ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              {tr(
                "Silky smooth deceleration when scrolling via mouse wheel or precision trackpads.",
                "Pengereman scroll yang halus ketika digulir dengan mouse wheel atau trackpad.",
                "Pangarian scroll nan haluih kutiko diguliah jo mouse atau trackpad."
              )}
            </p>
          </div>

          {/* Parallax Motion */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {tr("Parallax Depth Motion", "Efek Parallax Bertingkat", "Efek Parallax Batingkek")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMotionScroll({ parallax: !motionScroll.parallax });
                  triggerSaved();
                }}
                className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
                style={{ backgroundColor: motionScroll.parallax ? primaryColor : "#262626" }}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                    motionScroll.parallax ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              {tr(
                "Background glows and typography travel at multi-speed depth layers during scroll.",
                "Cahaya ambient dan tipografi bergerak pada kecepatan berbeda menciptakan ilusi kedalaman 3D.",
                "Cahayo ambient jo tulisan bagarak babeda kacepatan mambuek ilusi kadalaman 3D."
              )}
            </p>
          </div>

          {/* Scroll Reveal Animations */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {tr("Scroll Reveal Elements", "Animasi Elemen Muncul", "Animasi Elemen Kalua")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMotionScroll({ scrollReveal: !motionScroll.scrollReveal });
                  triggerSaved();
                }}
                className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
                style={{ backgroundColor: motionScroll.scrollReveal ? primaryColor : "#262626" }}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                    motionScroll.scrollReveal ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              {tr(
                "Section elements fade in and slide into view as the viewport scrolls down.",
                "Komponen halaman muncul berurutan dengan transisi lembut saat masuk viewport.",
                "Komponen laman kalua sacaro barurutan jo transisi lambuik kutiko nampak."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 4. LIVE PLAYGROUND INTERACTIVE TEST AREA */}
      <section className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiEye className="w-5 h-5 text-neutral-400" />
            <h3 className="text-sm font-semibold text-white">
              {tr("Live Cursor & Magnetic Test Playground", "Area Uji Coba Kursor & Daya Magnet", "Tampek Uji Cubo Kursor & Magnet")}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {tr("Hover elements to test magnetic fluid", "Arahkan mouse ke elemen untuk uji daya tarik", "Arahkan tetikus untuak uji magnet")}
          </span>
        </div>

        <div className="p-8 rounded-xl bg-black/50 border border-white/5 flex flex-wrap items-center justify-center gap-5 min-h-[160px]">
          <button
            type="button"
            className="magnetic-hover px-6 py-3 rounded-full text-black font-semibold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            {tr("Magnetic Button A", "Tombol Magnet A", "Tombol Magnet A")}
          </button>

          <button
            type="button"
            className="magnetic-hover px-6 py-3 rounded-full text-white font-medium text-sm border border-white/20 bg-white/[0.05] hover:bg-white/[0.1] transition-transform hover:scale-105 cursor-pointer"
          >
            {tr("Magnetic Button B", "Tombol Magnet B", "Tombol Magnet B")}
          </button>

          <a
            href="#test-link"
            onClick={(e) => e.preventDefault()}
            className="magnetic-hover text-sm font-mono text-neutral-300 hover:text-white underline underline-offset-4 px-3 py-2 rounded-lg cursor-pointer"
          >
            {tr("Interactive Link Test", "Uji Coba Pautan", "Uji Cubo Pautan")}
          </a>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, useInView, animate } from "framer-motion";
import SpotlightCard from "./SpotlightCard";
import { HiSparkles, HiGlobeAmericas, HiCheckBadge } from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

function AnimatedStatCounter({
  value,
  colorClass = "text-white",
  delay = 0,
}: {
  value: string;
  colorClass?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  // Extract prefix, numeric portion, and suffix (e.g. "100+" -> prefix: "", targetNum: 100, suffix: "+")
  const { prefix, targetNum, suffix } = useMemo(() => {
    const raw = String(value || "").trim();
    const match = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return { prefix: "", targetNum: 0, suffix: raw };
    return {
      prefix: match[1] || "",
      targetNum: parseFloat(match[2]) || 0,
      suffix: match[3] || "",
    };
  }, [value]);

  const [currentNum, setCurrentNum] = useState(0);

  useEffect(() => {
    if (!isInView) {
      setCurrentNum(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let controls: { stop: () => void } | null = null;

    timeoutId = setTimeout(() => {
      controls = animate(0, targetNum, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo: swift energetic start, gliding into the final count
        onUpdate: (latest) => {
          setCurrentNum(Math.floor(latest));
        },
      });
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (controls) controls.stop();
    };
  }, [isInView, targetNum, delay]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.9 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-baseline font-black tracking-tight select-none ${colorClass}`}
    >
      {prefix && <span>{prefix}</span>}
      <span className="tabular-nums font-mono">{isInView ? currentNum : 0}</span>
      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.3, delay: delay + 0.4 }}
        className="ml-0.5 text-inherit"
      >
        {suffix}
      </motion.span>
    </motion.span>
  );
}

export const DISCIPLINE_TRANSLATIONS: Record<string, { id: string; min: string }> = {
  "creative direction": { id: "Pengarahan Kreatif", min: "Pangaturan Kreatif" },
  "motion graphics": { id: "Motion Graphics", min: "Animasi Motion" },
  "branding & identity": { id: "Branding & Identitas", min: "Branding & Identitas" },
  "branding and identity": { id: "Branding & Identitas", min: "Branding & Identitas" },
  "ui/ux design": { id: "Desain UI/UX", min: "Desain UI/UX" },
  "ui / ux design": { id: "Desain UI/UX", min: "Desain UI/UX" },
  "digital advertising": { id: "Iklan Digital", min: "Iklan Digital" },
  "video production": { id: "Produksi Video", min: "Produksi Video" },
  "vibe coding": { id: "Vibe Coding", min: "Vibe Coding" },
  "logo design": { id: "Desain Logo", min: "Desain Logo" },
  "graphic design": { id: "Desain Grafis", min: "Desain Grafis" },
  "art direction": { id: "Pengarahan Seni", min: "Pangaturan Seni" },
  "3d design": { id: "Desain 3D", min: "Desain 3D" },
  "3d animation": { id: "Animasi 3D", min: "Animasi 3D" },
  "visual effects": { id: "Efek Visual (VFX)", min: "Efek Visual (VFX)" },
  "vfx": { id: "VFX", min: "VFX" },
  "illustration": { id: "Ilustrasi", min: "Ilustrasi" },
  "web design": { id: "Desain Web", min: "Desain Web" },
  "typography": { id: "Tipografi", min: "Tipografi" },
  "packaging design": { id: "Desain Kemasan", min: "Desain Kemasan" },
  "ai visuals": { id: "Visual AI", min: "Visual AI" },
  "ai generation": { id: "Generasi AI", min: "Generasi AI" },
  "sound design": { id: "Desain Audio", min: "Desain Audio" },
  "social media design": { id: "Desain Media Sosial", min: "Desain Media Sosial" },
  "commercial ads": { id: "Iklan Komersial", min: "Iklan Komersial" },
};

export default function About() {
  const { t, lang, toMinang } = useLang();
  const { about } = usePortfolioData();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";
  const isId = lang === "id";
  const isMin = lang === "min";
  const isLocalized = isId || isMin;

  const fallbackDisciplines = [
    "Motion Graphics",
    "Branding & Identity",
    "UI/UX Design",
    "Digital Advertising",
    "Video Production",
    "Vibe Coding",
    "Logo Design",
  ];

  const displayEyebrow = isLocalized ? t("about.eyebrow") : (about.eyebrow || t("about.eyebrow"));
  const displayTitle = isLocalized ? t("about.title") : (about.title || t("about.title"));
  const displayHeadline = isLocalized ? t("about.headline") : (about.headline || t("about.headline"));
  const displayBio = isLocalized ? t("about.para1") : (about.bio || t("about.para1"));
  const displayPhilosophyTitle = isLocalized ? t("about.card1.title") : (about.philosophyTitle || t("about.card1.title"));
  const displayPhilosophyQuote = isLocalized ? t("about.quote") : (about.philosophyQuote || t("about.quote"));
  const displayStat1Label = isLocalized ? t("about.stat1.label") : (about.stat1Label || t("about.stat1.label"));
  const displayStat2Label = isLocalized ? t("about.stat2.label") : (about.stat2Label || t("about.stat2.label"));
  const displayStat3Label = isLocalized ? t("about.stat3.label") : (about.stat3Label || t("about.stat3.label"));
  const displayCollabTitle = isLocalized ? t("about.card2.title") : (about.collabTitle || t("about.card2.title"));
  const displayCollabDesc = isLocalized ? t("about.card2.body") : (about.collabDesc || t("about.card2.body"));
  const displayDisciplinesTitle = isLocalized ? t("about.card3.title") : (about.disciplinesTitle || t("about.card3.title"));

  // Dynamic 1:1 synchronization across all languages:
  // If user configured disciplines in admin, precisely translate each item without dropping or altering count.
  const baseDisciplines =
    about.disciplines && about.disciplines.length > 0
      ? about.disciplines
      : fallbackDisciplines;

  const activeDisciplines = baseDisciplines.map((item) => {
    if (lang === "en") return item;
    const cleanKey = item.toLowerCase().trim();
    const match = DISCIPLINE_TRANSLATIONS[cleanKey];
    if (match) {
      return lang === "min" ? match.min : match.id;
    }
    return lang === "min" ? toMinang(item) : item;
  });

  return (
    <section id="about" className="relative py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col mb-8 sm:mb-10">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#16b09f] mb-2 font-semibold">
          {displayEyebrow}
        </span>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {displayTitle}<span className="text-neutral-500 font-normal">.</span>
        </h2>
        <div className="w-12 h-px bg-[#16b09f]/60 mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Main Narrative Card - 8 cols */}
        <SpotlightCard className="lg:col-span-8 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between h-full gap-6">
            <div className="space-y-4 sm:space-y-5 text-neutral-300 font-light leading-relaxed">
              {/* Main Headline */}
              <h3 className={`text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                {displayHeadline}
              </h3>

              {/* Paragraph 1 */}
              <p className={`text-[15px] sm:text-base md:text-lg leading-relaxed font-light whitespace-pre-line ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                {displayBio}
              </p>

              {/* Blockquote: Core Philosophy */}
              <div className="about-philosophy-card p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.03] border-l-2 border-[#16b09f] border-y border-r border-white/5 backdrop-blur-sm">
                <span className="text-[11px] font-mono text-[#16b09f] uppercase tracking-wider block mb-1 font-semibold">
                  {displayPhilosophyTitle}
                </span>
                <p className="about-philosophy-quote text-neutral-200 text-sm sm:text-base italic font-serif leading-relaxed">
                  &ldquo;{displayPhilosophyQuote}&rdquo;
                </p>
              </div>
            </div>

            {/* 3 Key Stats: 11+ Years Experience | 100+ Projects | 20+ Clients with Dynamic Motion */}
            <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-3 sm:gap-6 text-xs font-mono mt-auto">
              <div className="group flex flex-col cursor-default">
                <span className="text-[#16b09f] block font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight font-mono select-none">
                  {about.stat1Num || t("about.stat1.num") || "11+"}
                </span>
                <span className="text-neutral-400 uppercase tracking-wider text-[11px] sm:text-xs mt-1 block">
                  {displayStat1Label}
                </span>
              </div>

              <motion.div
                whileHover={{ y: -3, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="group flex flex-col cursor-default"
              >
                <span className="text-2xl sm:text-3xl lg:text-4xl block leading-tight">
                  <AnimatedStatCounter
                    value={about.stat2Num || t("about.stat2.num") || "100+"}
                    colorClass={isLight ? "text-slate-900 group-hover:text-cyan-600 transition-colors" : "text-white group-hover:text-cyan-300 drop-shadow-[0_0_18px_rgba(255,255,255,0.2)] transition-colors"}
                    delay={0.25}
                  />
                </span>
                <span className="text-neutral-400 uppercase tracking-wider text-[11px] sm:text-xs mt-1 block group-hover:text-neutral-200 transition-colors">
                  {displayStat2Label}
                </span>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="group flex flex-col cursor-default"
              >
                <span className="text-2xl sm:text-3xl lg:text-4xl block leading-tight">
                  <AnimatedStatCounter
                    value={about.stat3Num || t("about.stat3.num") || "20+"}
                    colorClass={isLight ? "text-slate-900 group-hover:text-teal-600 transition-colors" : "text-white group-hover:text-teal-300 drop-shadow-[0_0_18px_rgba(255,255,255,0.2)] transition-colors"}
                    delay={0.4}
                  />
                </span>
                <span className="text-neutral-400 uppercase tracking-wider text-[11px] sm:text-xs mt-1 block group-hover:text-neutral-200 transition-colors">
                  {displayStat3Label}
                </span>
              </motion.div>
            </div>
          </div>
        </SpotlightCard>

        {/* Sidebar Cards - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SpotlightCard className="p-5 sm:p-6 lg:p-7 lg:flex-1 min-h-[auto]">
            <div className="flex flex-col justify-center h-full">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400 mb-3 sm:mb-4 shrink-0">
                <HiGlobeAmericas className="w-5 h-5 text-[#16b09f]" />
              </div>
              <h3 className={`text-base sm:text-lg font-medium mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                {displayCollabTitle}
              </h3>
              <p className={`text-sm font-light leading-relaxed whitespace-pre-line ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                {displayCollabDesc}
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-5 sm:p-6 lg:p-7 lg:flex-1 min-h-[auto]">
            <div className="flex flex-col justify-center h-full">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 mb-3 sm:mb-4 shrink-0">
                <HiCheckBadge className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className={`text-base sm:text-lg font-medium mb-2.5 sm:mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>
                {displayDisciplinesTitle}
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-1">
                {activeDisciplines.map((tag, i) => (
                  <span
                    key={i}
                    className="about-discipline-tag px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-mono text-neutral-200 hover:border-[#16b09f]/40 hover:text-white transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

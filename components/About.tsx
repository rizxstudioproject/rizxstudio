"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import { HiSparkles, HiGlobeAmericas, HiCheckBadge } from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";

export default function About() {
  const { t, lang } = useLang();

  const disciplines = {
    en: [
      "Creative Direction",
      "Motion Graphics",
      "Branding & Identity",
      "UI/UX Design",
      "Digital Advertising",
      "Video Production",
    ],
    id: [
      "Pengarahan Kreatif",
      "Motion Graphics",
      "Branding & Identitas",
      "Desain UI/UX",
      "Iklan Digital",
      "Produksi Video",
    ],
  };

  return (
    <section id="about" className="relative py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col mb-8 sm:mb-10">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#14AF9E] mb-2 font-semibold">
          {t("about.eyebrow")}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
          {t("about.title")}<span className="text-neutral-500 font-normal">.</span>
        </h2>
        <div className="w-12 h-px bg-[#14AF9E]/60 mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Main Narrative Card - 8 cols */}
        <SpotlightCard className="lg:col-span-8 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between h-full gap-6">
            <div className="space-y-4 sm:space-y-5 text-neutral-300 font-light leading-relaxed">
              {/* Main Headline */}
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
                {t("about.headline")}
              </h3>

              {/* Paragraph 1 */}
              <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed font-light">
                {t("about.para1")}
              </p>

              {/* Blockquote: Core Philosophy */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.03] border-l-2 border-[#14AF9E] border-y border-r border-white/5 backdrop-blur-sm">
                <span className="text-[11px] font-mono text-[#14AF9E] uppercase tracking-wider block mb-1 font-semibold">
                  {t("about.card1.title")}
                </span>
                <p className="text-white/90 text-sm sm:text-base italic font-serif leading-relaxed">
                  &ldquo;{t("about.quote")}&rdquo;
                </p>
              </div>
            </div>

            {/* 3 Key Stats: 11+ Years Experience | 100+ Projects | 20+ Clients */}
            <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-3 sm:gap-6 text-xs font-mono mt-auto">
              <div>
                <span className="text-[#14AF9E] block font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                  {t("about.stat1.num")}
                </span>
                <span className="text-neutral-400 uppercase tracking-wider text-[11px] sm:text-xs mt-1 block">
                  {t("about.stat1.label")}
                </span>
              </div>
              <div>
                <span className="text-white block font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                  {t("about.stat2.num")}
                </span>
                <span className="text-neutral-400 uppercase tracking-wider text-[11px] sm:text-xs mt-1 block">
                  {t("about.stat2.label")}
                </span>
              </div>
              <div>
                <span className="text-white block font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                  {t("about.stat3.num")}
                </span>
                <span className="text-neutral-400 uppercase tracking-wider text-[11px] sm:text-xs mt-1 block">
                  {t("about.stat3.label")}
                </span>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Sidebar Cards - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SpotlightCard className="p-6 sm:p-7 flex-1 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400 mb-4">
              <HiGlobeAmericas className="w-5 h-5 text-[#14AF9E]" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">{t("about.card2.title")}</h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              {t("about.card2.body")}
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6 sm:p-7 flex-1 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 mb-4">
              <HiCheckBadge className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">{t("about.card3.title")}</h3>
            <div className="flex flex-wrap gap-2">
              {disciplines[lang].map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-200 hover:border-[#14AF9E]/40 hover:text-white transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

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
    <section id="about" className="relative py-28 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#14AF9E] mb-2 font-semibold">
          {t("about.eyebrow")}
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white">
          {t("about.title")}<span className="text-neutral-500 font-normal">.</span>
        </h2>
        <div className="w-12 h-px bg-[#14AF9E]/60 mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Narrative Card - 8 cols */}
        <SpotlightCard className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-6 text-neutral-300 font-light leading-relaxed">
            {/* Main Headline */}
            <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
              {t("about.headline")}
            </h3>

            {/* Paragraph 1 */}
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed font-light">
              {t("about.para1")}
            </p>

            {/* Blockquote: "A creative professional's greatest advantage..." */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border-l-2 border-[#14AF9E] border-y border-r border-white/5 my-6 backdrop-blur-sm">
              <p className="text-white/90 text-sm sm:text-base italic font-serif leading-relaxed">
                &ldquo;{t("about.quote")}&rdquo;
              </p>
            </div>
          </div>

          {/* 3 Key Stats: 11+ Years Experience | 100+ Projects | 20+ Clients */}
          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-3 gap-4 sm:gap-8 text-xs font-mono">
            <div>
              <span className="text-[#14AF9E] block font-black text-2xl sm:text-4xl tracking-tight">
                {t("about.stat1.num")}
              </span>
              <span className="text-neutral-400 uppercase tracking-wider text-xs sm:text-xs mt-1 block">
                {t("about.stat1.label")}
              </span>
            </div>
            <div>
              <span className="text-white block font-black text-2xl sm:text-4xl tracking-tight">
                {t("about.stat2.num")}
              </span>
              <span className="text-neutral-400 uppercase tracking-wider text-xs sm:text-xs mt-1 block">
                {t("about.stat2.label")}
              </span>
            </div>
            <div>
              <span className="text-white block font-black text-2xl sm:text-4xl tracking-tight">
                {t("about.stat3.num")}
              </span>
              <span className="text-neutral-400 uppercase tracking-wider text-xs sm:text-xs mt-1 block">
                {t("about.stat3.label")}
              </span>
            </div>
          </div>
        </SpotlightCard>

        {/* Sidebar Cards - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SpotlightCard className="p-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-amber-300 mb-5">
              <HiSparkles className="w-5 h-5 text-amber-300" />
            </div>
            <h3 className="text-lg font-light text-white mb-2">{t("about.card1.title")}</h3>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              {t("about.card1.body")}
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400 mb-5">
              <HiGlobeAmericas className="w-5 h-5 text-[#14AF9E]" />
            </div>
            <h3 className="text-lg font-light text-white mb-2">{t("about.card2.title")}</h3>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              {t("about.card2.body")}
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 mb-5">
              <HiCheckBadge className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-light text-white mb-2">{t("about.card3.title")}</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {disciplines[lang].map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-200 hover:border-[#14AF9E]/40 hover:text-white transition-colors"
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

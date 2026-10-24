"use client";

import React, { useRef, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";

interface OverlayProps {
  progress: number;
}

export default function Overlay({ progress }: OverlayProps) {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const { t, lang } = useLang();
  const { heroBanner } = usePortfolioData();
  const isLocalized = lang === "id" || lang === "min";

  const displayName = heroBanner?.name || "Fomy R";
  const displayRole = isLocalized ? t("hero.role") : (heroBanner?.role || t("hero.role"));
  const displayScroll = isLocalized ? t("hero.scroll") : (heroBanner?.scrollText || t("hero.scroll"));

  const displaySec2H1 = isLocalized ? t("hero.section2.headline1") : (heroBanner?.sec2Headline1 || t("hero.section2.headline1"));
  const displaySec2H2 = isLocalized ? t("hero.section2.headline2") : (heroBanner?.sec2Headline2 || t("hero.section2.headline2"));
  const displaySec2Body = isLocalized ? t("hero.section2.body") : (heroBanner?.sec2Body || t("hero.section2.body"));

  const displaySec3H1 = isLocalized ? t("hero.section3.headline1") : (heroBanner?.sec3Headline1 || t("hero.section3.headline1"));
  const displaySec3H2 = isLocalized ? t("hero.section3.headline2") : (heroBanner?.sec3Headline2 || t("hero.section3.headline2"));
  const displaySec3Body = isLocalized ? t("hero.section3.body") : (heroBanner?.sec3Body || t("hero.section3.body"));

  useEffect(() => {
    // ==========================================
    // SECTION 1 (0% to 26% scroll):
    // "Fomy Rizky." + "<AI-Powered Creative Designer/>"
    // Dedicated section: User absorbs hero introduction as portrait starts moving
    // ==========================================
    if (section1Ref.current) {
      if (progress <= 0.16) {
        // Fully visible during initial interaction
        const factor = Math.max(0, Math.min(1, progress / 0.16));
        section1Ref.current.style.opacity = "1";
        section1Ref.current.style.transform = `translate3d(0, ${(-12 * factor).toFixed(2)}px, 0)`;
        section1Ref.current.style.visibility = "visible";
      } else if (progress <= 0.26) {
        // Smoothly fade out before Section 2 begins
        const factor = (progress - 0.16) / (0.26 - 0.16);
        const opacity = (1 - factor).toFixed(4);
        section1Ref.current.style.opacity = opacity;
        section1Ref.current.style.transform = `translate3d(0, ${(-12 - 20 * factor).toFixed(2)}px, 0)`;
        section1Ref.current.style.visibility = Number(opacity) <= 0.001 ? "hidden" : "visible";
      } else {
        section1Ref.current.style.opacity = "0";
        section1Ref.current.style.visibility = "hidden";
      }
    }

    // ==========================================
    // SECTION 2 (30% to 62% scroll):
    // Left-aligned "Results-driven creative."
    // Dedicated section: In -> Long Hold -> Out
    // ==========================================
    if (section2Ref.current) {
      if (progress >= 0.30 && progress <= 0.62) {
        let opacity = 0;
        let y = 0;

        if (progress < 0.38) {
          // Gentle fade in floating up 24px
          const factor = (progress - 0.30) / (0.38 - 0.30);
          opacity = factor;
          y = 24 * (1 - factor);
        } else if (progress <= 0.54) {
          // Stable hold: plenty of scroll room to read comfortably without cutoff
          opacity = 1;
          y = 0;
        } else {
          // Gentle fade out floating up 24px
          const factor = (progress - 0.54) / (0.62 - 0.54);
          opacity = 1 - factor;
          y = -24 * factor;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        section2Ref.current.style.opacity = opacity.toFixed(4);
        section2Ref.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        section2Ref.current.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
      } else {
        section2Ref.current.style.opacity = "0";
        section2Ref.current.style.visibility = "hidden";
      }
    }

    // ==========================================
    // SECTION 3 (65% to 98% scroll):
    // Right-aligned "Creative meets AI."
    // Dedicated section: In -> Long Hold -> Out
    // ==========================================
    if (section3Ref.current) {
      if (progress >= 0.65 && progress <= 0.98) {
        let opacity = 0;
        let y = 0;

        if (progress < 0.73) {
          // Gentle fade in floating up 24px
          const factor = (progress - 0.65) / (0.73 - 0.65);
          opacity = factor;
          y = 24 * (1 - factor);
        } else if (progress <= 0.90) {
          // Stable hold: plenty of scroll room to read comfortably without cutoff
          opacity = 1;
          y = 0;
        } else {
          // Gentle fade out floating up 24px
          const factor = (progress - 0.90) / (0.98 - 0.90);
          opacity = 1 - factor;
          y = -24 * factor;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        section3Ref.current.style.opacity = opacity.toFixed(4);
        section3Ref.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        section3Ref.current.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
      } else {
        section3Ref.current.style.opacity = "0";
        section3Ref.current.style.visibility = "hidden";
      }
    }
  }, [progress]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none">
      {/* SECTION 1: Centered across lower-middle/chest region (matching reference Shivam Kumar) */}
      <div
        ref={section1Ref}
        style={{
          opacity: 1,
          transform: "translate3d(0, 0px, 0)",
          willChange: "transform, opacity",
        }}
        className="absolute inset-x-0 top-[48%] sm:top-[50%] -translate-y-1/2 flex flex-col items-center justify-center text-center px-4 transition-none"
      >
        <h1
          style={{ "--hero-text-color": heroBanner?.nameColor || "#ffffff" } as React.CSSProperties}
          className="hero-custom-color text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-2 leading-tight"
        >
          {displayName}<span className="text-neutral-500 font-normal">.</span>
        </h1>
        <p
          style={{ "--hero-text-color": heroBanner?.roleColor || "#16b09f" } as React.CSSProperties}
          className="hero-custom-color text-sm sm:text-base font-mono tracking-wider sm:tracking-widest mt-2 sm:mt-3"
        >
          {displayRole}
        </p>

        {/* Minimalist mouse scroll indicator matching reference */}
        <div className="flex flex-col items-center gap-2 mt-6 sm:mt-12">
          <div className="w-5 h-8 sm:w-5 sm:h-9 rounded-full border-2 border-neutral-400/60 flex justify-center pt-1.5">
            <span className="w-1 h-2 rounded-full bg-neutral-300 animate-bounce" />
          </div>
          <span
            style={{ "--hero-text-color": heroBanner?.scrollTextColor || "#a3a3a3" } as React.CSSProperties}
            className="hero-custom-color text-xs font-mono uppercase tracking-[0.25em]"
          >
            {displayScroll}
          </span>
        </div>
      </div>

      {/* SECTION 2: Left aligned (Matching reference "Results-driven engineer.") */}
      <div
        ref={section2Ref}
        style={{
          opacity: 0,
          transform: "translate3d(0, 24px, 0)",
          willChange: "transform, opacity",
          visibility: "hidden",
        }}
        className="absolute inset-x-0 px-6 sm:px-0 sm:left-12 md:left-16 lg:left-24 top-[48%] sm:top-[50%] -translate-y-1/2 max-w-sm sm:max-w-xl md:max-w-2xl text-left flex flex-col justify-center transition-none"
      >
        <h2 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-3 sm:mb-4 leading-[1.15]">
          <span
            style={{ "--hero-text-color": heroBanner?.sec2Headline1Color || "#ffffff" } as React.CSSProperties}
            className="hero-custom-color"
          >
            {displaySec2H1}
          </span>
          <br />
          <span
            style={{ "--hero-text-color": heroBanner?.sec2Headline2Color || "#a3a3a3" } as React.CSSProperties}
            className="hero-custom-color font-bold"
          >
            {displaySec2H2}
          </span>
          <span className="text-neutral-500 font-normal">.</span>
        </h2>
        <p
          style={{ "--hero-text-color": heroBanner?.sec2BodyColor || "#d4d4d4" } as React.CSSProperties}
          className="hero-custom-color text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-xs sm:max-w-lg"
        >
          {displaySec2Body}
        </p>
      </div>

      {/* SECTION 3: Right aligned (Matching reference "AI & Automation Developer.") */}
      <div
        ref={section3Ref}
        style={{
          opacity: 0,
          transform: "translate3d(0, 24px, 0)",
          willChange: "transform, opacity",
          visibility: "hidden",
        }}
        className="absolute inset-x-0 px-6 sm:px-0 sm:inset-x-auto sm:right-12 md:right-16 lg:right-24 top-[48%] sm:top-[50%] -translate-y-1/2 max-w-sm sm:max-w-xl md:max-w-2xl text-right flex flex-col items-end justify-center transition-none ml-auto"
      >
        <h2 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-3 sm:mb-4 leading-[1.15]">
          <span
            style={{ "--hero-text-color": heroBanner?.sec3Headline1Color || "#ffffff" } as React.CSSProperties}
            className="hero-custom-color"
          >
            {displaySec3H1}
          </span>
          <br />
          <span
            style={{ "--hero-text-color": heroBanner?.sec3Headline2Color || "#a3a3a3" } as React.CSSProperties}
            className="hero-custom-color font-bold"
          >
            {displaySec3H2}
          </span>
          <span className="text-neutral-500 font-normal">.</span>
        </h2>
        <p
          style={{ "--hero-text-color": heroBanner?.sec3BodyColor || "#d4d4d4" } as React.CSSProperties}
          className="hero-custom-color text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-xs sm:max-w-lg text-right"
        >
          {displaySec3Body}
        </p>
      </div>
    </div>
  );
}

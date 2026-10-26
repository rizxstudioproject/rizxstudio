"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLang } from "@/context/LanguageContext";
import { usePortfolioData, ClientLogoItem } from "@/context/PortfolioDataContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { normalizeMediaUrl, getMediaFallbackUrls } from "@/lib/mediaService";

function LogoItem({ logo, isLight }: { logo: ClientLogoItem; isLight: boolean }) {
  const fallbacks = useMemo(() => getMediaFallbackUrls(logo.file), [logo.file]);
  const [currentSrc, setCurrentSrc] = useState<string>(() => normalizeMediaUrl(logo.file));
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentSrc(normalizeMediaUrl(logo.file));
    setFallbackIndex(0);
  }, [logo.file]);

  const handleImageError = () => {
    if (fallbackIndex + 1 < fallbacks.length) {
      const nextIndex = fallbackIndex + 1;
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbacks[nextIndex]);
    }
  };

  return (
    <div
      className={`client-logo-card flex items-center justify-center px-6 py-3.5 mx-3 rounded-2xl border transition-all duration-300 cursor-default select-none shrink-0 group min-w-[90px] h-14 ${
        isLight
          ? "bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm"
          : "bg-white/[0.02] border-white/[0.06] hover:border-white/25 hover:bg-white/[0.06]"
      }`}
    >
      <div
        className={`client-logo-wrapper relative flex items-center justify-center transition-all ${
          isLight
            ? "brightness-0 opacity-60 group-hover:opacity-100"
            : "brightness-0 invert opacity-70 group-hover:opacity-100"
        }`}
      >
        <img
          src={currentSrc}
          alt={logo.name}
          onError={handleImageError}
          className="client-logo-img h-6 sm:h-7 w-auto object-contain max-h-7"
        />
      </div>
    </div>
  );
}

export default function ClientLogos() {
  const { t, lang } = useLang();
  const { clientLogos } = usePortfolioData();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

  const row1Logos = clientLogos?.logos?.filter((l) => l.row === 1) || [];
  const row2Logos = clientLogos?.logos?.filter((l) => l.row === 2) || [];
  const isLocalized = lang === "id" || lang === "min";
  const subtitleText = isLocalized ? t("clients.subtitle") : (clientLogos?.subtitle || t("clients.subtitle"));

  return (
    <section
      id="clients"
      className="relative py-16 bg-[var(--background,#0a0a0a)] overflow-hidden border-y border-white/5 transition-colors duration-300"
    >
      {/* Left / Right fade masks */}
      <div className="client-fade-left absolute inset-y-0 left-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-r from-[var(--background,#0a0a0a)] to-transparent" />
      <div className="client-fade-right absolute inset-y-0 right-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-l from-[var(--background,#0a0a0a)] to-transparent" />

      {/* Label */}
      <div className="mb-10 text-center px-4">
        <span className={`text-xs sm:text-xs font-mono uppercase tracking-[0.25em] font-semibold ${
          isLight ? "text-slate-600" : "text-neutral-400"
        }`}>
          {subtitleText}
        </span>
      </div>

      {/* Row 1 — scrolls LEFT */}
      {row1Logos.length > 0 && (
        <div className="flex w-full overflow-hidden mb-4">
          <div
            className="flex items-center py-1 shrink-0"
            style={{ animation: "marquee-left 45s linear infinite", willChange: "transform" }}
          >
            {row1Logos.map((logo, i) => (
              <LogoItem key={`r1a-${logo.id || i}`} logo={logo} isLight={isLight} />
            ))}
          </div>
          <div
            className="flex items-center py-1 shrink-0"
            aria-hidden="true"
            style={{ animation: "marquee-left 45s linear infinite", willChange: "transform" }}
          >
            {row1Logos.map((logo, i) => (
              <LogoItem key={`r1b-${logo.id || i}`} logo={logo} isLight={isLight} />
            ))}
          </div>
        </div>
      )}

      {/* Row 2 — scrolls RIGHT */}
      {row2Logos.length > 0 && (
        <div className="flex w-full overflow-hidden">
          <div
            className="flex items-center py-1 shrink-0"
            style={{ animation: "marquee-right 45s linear infinite", willChange: "transform" }}
          >
            {row2Logos.map((logo, i) => (
              <LogoItem key={`r2a-${logo.id || i}`} logo={logo} isLight={isLight} />
            ))}
          </div>
          <div
            className="flex items-center py-1 shrink-0"
            aria-hidden="true"
            style={{ animation: "marquee-right 45s linear infinite", willChange: "transform" }}
          >
            {row2Logos.map((logo, i) => (
              <LogoItem key={`r2b-${logo.id || i}`} logo={logo} isLight={isLight} />
            ))}
          </div>
        </div>
      )}

      {/* Inline keyframes */}
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

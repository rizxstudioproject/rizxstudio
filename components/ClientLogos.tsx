"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";
import { usePortfolioData, ClientLogoItem } from "@/context/PortfolioDataContext";

function LogoItem({ logo }: { logo: ClientLogoItem }) {
  return (
    <div className="flex items-center justify-center px-6 py-3.5 mx-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 cursor-default select-none shrink-0 group min-w-[90px] h-14">
      <div className="relative flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity brightness-0 invert">
        <img
          src={logo.file}
          alt={logo.name}
          className="h-6 sm:h-7 w-auto object-contain max-h-7"
        />
      </div>
    </div>
  );
}

export default function ClientLogos() {
  const { t, lang } = useLang();
  const { clientLogos } = usePortfolioData();

  const row1Logos = clientLogos?.logos?.filter((l) => l.row === 1) || [];
  const row2Logos = clientLogos?.logos?.filter((l) => l.row === 2) || [];
  const isId = lang === "id";
  const isDefaultSubtitle =
    !clientLogos?.subtitle ||
    clientLogos.subtitle === "Selected Clients & Creative Collaborations";
  const subtitleText = isId
    ? isDefaultSubtitle
      ? t("clients.subtitle")
      : clientLogos.subtitle
    : clientLogos?.subtitle || t("clients.subtitle");

  return (
    <section
      id="clients"
      className="relative py-16 bg-[#0a0a0a] overflow-hidden border-y border-white/5"
    >
      {/* Left / Right fade masks */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-r from-[#0a0a0a] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-l from-[#0a0a0a] to-transparent" />

      {/* Label */}
      <div className="mb-10 text-center px-4">
        <span className="text-xs sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
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
              <LogoItem key={`r1a-${logo.id || i}`} logo={logo} />
            ))}
          </div>
          <div
            className="flex items-center py-1 shrink-0"
            aria-hidden="true"
            style={{ animation: "marquee-left 45s linear infinite", willChange: "transform" }}
          >
            {row1Logos.map((logo, i) => (
              <LogoItem key={`r1b-${logo.id || i}`} logo={logo} />
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
              <LogoItem key={`r2a-${logo.id || i}`} logo={logo} />
            ))}
          </div>
          <div
            className="flex items-center py-1 shrink-0"
            aria-hidden="true"
            style={{ animation: "marquee-right 45s linear infinite", willChange: "transform" }}
          >
            {row2Logos.map((logo, i) => (
              <LogoItem key={`r2b-${logo.id || i}`} logo={logo} />
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

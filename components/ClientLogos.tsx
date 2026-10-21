"use client";

import React from "react";
import Image from "next/image";
import { useLang } from "@/context/LanguageContext";

// SVG Logos uploaded by user in public/logos/
const CLIENT_LOGOS_ROW_1 = [
  { file: "/logos/logo_01.svg", alt: "Tokopedia", width: 140, height: 38 },
  { file: "/logos/logo_02.svg", alt: "11ST", width: 110, height: 36 },
  { file: "/logos/logo_03.svg", alt: "Samsung", width: 150, height: 36 },
  { file: "/logos/logo_04.svg", alt: "Nexon", width: 120, height: 36 },
  { file: "/logos/logo_05.svg", alt: "Client", width: 70, height: 36 },
  { file: "/logos/logo_06.svg", alt: "TruCarbon", width: 120, height: 36 },
  { file: "/logos/logo_07.svg", alt: "Client", width: 120, height: 36 },
  { file: "/logos/logo_07-1.svg", alt: "Client", width: 180, height: 36 },
  { file: "/logos/logo_08.svg", alt: "Client", width: 110, height: 36 },
  { file: "/logos/logo_09.svg", alt: "SuperSmart", width: 100, height: 36 },
  { file: "/logos/logo_10.svg", alt: "Asian Trust Capital", width: 220, height: 34 },
  { file: "/logos/logo_11.svg", alt: "Client", width: 160, height: 36 },
  { file: "/logos/logo_12.svg", alt: "Client", width: 180, height: 36 },
  { file: "/logos/logo_13.svg", alt: "Client", width: 130, height: 36 },
  { file: "/logos/logo_14.svg", alt: "EDUF", width: 130, height: 36 },
  { file: "/logos/logo_15.svg", alt: "Client", width: 130, height: 36 },
];

const CLIENT_LOGOS_ROW_2 = [
  { file: "/logos/logo_16.svg", alt: "Client", width: 50, height: 36 },
  { file: "/logos/logo_17.svg", alt: "Client", width: 50, height: 36 },
  { file: "/logos/logo_18.svg", alt: "Client", width: 50, height: 36 },
  { file: "/logos/logo_19.svg", alt: "Client", width: 50, height: 36 },
  { file: "/logos/logo_20.svg", alt: "KB Bukopin", width: 150, height: 36 },
  { file: "/logos/logo_21.svg", alt: "Burger King", width: 100, height: 36 },
  { file: "/logos/logo_22.svg", alt: "Client", width: 140, height: 36 },
  { file: "/logos/logo_23.svg", alt: "Withings", width: 180, height: 34 },
  { file: "/logos/logo_24.svg", alt: "Client", width: 130, height: 36 },
  { file: "/logos/logo_25.svg", alt: "Client", width: 140, height: 36 },
  { file: "/logos/logo_26.svg", alt: "LINE", width: 100, height: 36 },
  { file: "/logos/logo_26-1.svg", alt: "Client", width: 50, height: 36 },
  { file: "/logos/logo_27.svg", alt: "Kotra", width: 130, height: 36 },
  { file: "/logos/logo_28.svg", alt: "WebToon", width: 90, height: 36 },
  { file: "/logos/logo_29.svg", alt: "Shortiz", width: 160, height: 36 },
  { file: "/logos/logo_30.svg", alt: "iLOTTE", width: 140, height: 36 },
  { file: "/logos/logo_31.svg", alt: "Client", width: 90, height: 36 },
];

function LogoItem({ logo }: { logo: { file: string; alt: string; width: number; height: number } }) {
  return (
    <div className="flex items-center justify-center px-6 py-3.5 mx-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 cursor-default select-none shrink-0 group min-w-[90px] h-14">
      <div className="relative flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity brightness-0 invert">
        <Image
          src={logo.file}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="h-6 sm:h-7 w-auto object-contain max-h-7"
          unoptimized
        />
      </div>
    </div>
  );
}

export default function ClientLogos() {
  const { t } = useLang();

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
        <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-500">
          {t("clients.subtitle")}
        </span>
      </div>

      {/* Row 1 — scrolls LEFT */}
      <div className="flex w-full overflow-hidden mb-4">
        <div
          className="flex items-center py-1 shrink-0"
          style={{ animation: "marquee-left 45s linear infinite", willChange: "transform" }}
        >
          {CLIENT_LOGOS_ROW_1.map((logo, i) => (
            <LogoItem key={`r1a-${i}`} logo={logo} />
          ))}
        </div>
        <div
          className="flex items-center py-1 shrink-0"
          aria-hidden="true"
          style={{ animation: "marquee-left 45s linear infinite", willChange: "transform" }}
        >
          {CLIENT_LOGOS_ROW_1.map((logo, i) => (
            <LogoItem key={`r1b-${i}`} logo={logo} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls RIGHT */}
      <div className="flex w-full overflow-hidden">
        <div
          className="flex items-center py-1 shrink-0"
          style={{ animation: "marquee-right 45s linear infinite", willChange: "transform" }}
        >
          {CLIENT_LOGOS_ROW_2.map((logo, i) => (
            <LogoItem key={`r2a-${i}`} logo={logo} />
          ))}
        </div>
        <div
          className="flex items-center py-1 shrink-0"
          aria-hidden="true"
          style={{ animation: "marquee-right 45s linear infinite", willChange: "transform" }}
        >
          {CLIENT_LOGOS_ROW_2.map((logo, i) => (
            <LogoItem key={`r2b-${i}`} logo={logo} />
          ))}
        </div>
      </div>

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

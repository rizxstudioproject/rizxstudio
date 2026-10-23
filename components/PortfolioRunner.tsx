"use client";

import React, { useRef } from "react";

// Curated portfolio images for the runner — mix of clients & selected works
// Row A (left-to-right): varied aspect ratios — wide, tall, square mix
const ROW_A = [
  { id: "r1",  image: "/works/client-KIA/KIA EV2_B.jpg",               label: "KIA EV2",               size: "lg" },
  { id: "r2",  image: "/assets/antigravity/selected-brand-identity.jpg", label: "Brand Identity",        size: "sm" },
  { id: "r3",  image: "/works/client-Burger King/Burger_ads06.jpg",     label: "Campaign",              size: "md" },
  { id: "r4",  image: "/assets/antigravity/selected-uiux-design.jpg",   label: "UI/UX Design",          size: "lg" },
  { id: "r5",  image: "/works/client-Xeilos/ad01.jpg",                  label: "Digital Ad",            size: "sm" },
  { id: "r6",  image: "/works/client-KIA/KIA PBV_A.jpg",                label: "KIA PBV",               size: "md" },
  { id: "r7",  image: "/assets/antigravity/selected-motion-graphics.jpg",label: "Motion Graphics",      size: "lg" },
  { id: "r8",  image: "/works/client-Hyashop/01A.jpg",                  label: "Social Media",          size: "sm" },
  { id: "r9",  image: "/works/client-Permifast/Permifast04.jpg",        label: "Branding",              size: "md" },
  { id: "r10", image: "/works/client-Xeilos/ad04.jpg",                  label: "Digital Ad",            size: "sm" },
  { id: "r11", image: "/assets/antigravity/selected-3d-design.jpg",     label: "3D Design",             size: "lg" },
  { id: "r12", image: "/works/client-KIA/KIA Sportag_A.jpg",            label: "Automotive",            size: "md" },
];

// Row B (right-to-left): different selection
const ROW_B = [
  { id: "s1",  image: "/works/client-Xeilos/ad07.jpg",                  label: "Ad Campaign",           size: "md" },
  { id: "s2",  image: "/works/client-Hyashop/1952.jpg",                 label: "Social Media",          size: "lg" },
  { id: "s3",  image: "/works/client-KIA/KIA EV2_G.jpg",               label: "KIA EV2",               size: "sm" },
  { id: "s4",  image: "/works/client-Burger King/Burger_ads07.jpg",     label: "Campaign",              size: "md" },
  { id: "s5",  image: "/assets/antigravity/hero-large.jpg",             label: "Creative Vision",       size: "lg" },
  { id: "s6",  image: "/works/client-Hyashop/02A.jpg",                  label: "Social Media",          size: "sm" },
  { id: "s7",  image: "/works/client-Xeilos/ad02.jpg",                  label: "Digital Ad",            size: "md" },
  { id: "s8",  image: "/works/client-Permifast/Permifast06.jpg",        label: "Brand Identity",        size: "lg" },
  { id: "s9",  image: "/works/client-KIA/KIA PBV_B.jpg",               label: "Automotive",            size: "sm" },
  { id: "s10", image: "/works/client-Hyashop/1960.jpg",                 label: "Social Media",          size: "md" },
  { id: "s11", image: "/works/client-Xeilos/v03.jpg",                   label: "Motion",                size: "sm" },
  { id: "s12", image: "/assets/antigravity/selected-campaign-visuals.jpg", label: "Campaign Visuals",   size: "lg" },
];

// Card size mapping → width + height
const SIZE_MAP: Record<string, { w: string; h: string }> = {
  sm: { w: "w-[110px] sm:w-[130px]",  h: "h-[130px] sm:h-[155px]" },
  md: { w: "w-[150px] sm:w-[175px]",  h: "h-[150px] sm:h-[175px]" },
  lg: { w: "w-[185px] sm:w-[220px]",  h: "h-[165px] sm:h-[200px]" },
};

interface RunnerCardProps {
  image: string;
  label: string;
  size: string;
}

function RunnerCard({ image, label, size }: RunnerCardProps) {
  const { w, h } = SIZE_MAP[size] ?? SIZE_MAP.md;
  return (
    <div
      className={`relative flex-shrink-0 ${w} ${h} rounded-2xl overflow-hidden border border-white/[0.07] bg-neutral-900 shadow-[0_8px_32px_rgba(0,0,0,0.6)] group`}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      {/* Category pill */}
      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] sm:text-xs font-mono text-neutral-200 backdrop-blur-sm truncate max-w-[calc(100%-16px)]">
        {label}
      </span>
    </div>
  );
}

interface MarqueeRowProps {
  items: typeof ROW_A;
  direction?: "left" | "right";
  speed?: number;
}

function MarqueeRow({ items, direction = "left", speed = 38 }: MarqueeRowProps) {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];
  const animClass = direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div className="relative w-full overflow-hidden">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div
        className={`flex gap-3 sm:gap-4 w-max ${animClass}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <RunnerCard key={`${item.id}-${i}`} image={item.image} label={item.label} size={item.size} />
        ))}
      </div>
    </div>
  );
}

export default function PortfolioRunner() {
  return (
    <section className="w-full overflow-hidden py-10 sm:py-14 bg-black border-t border-white/[0.05]">
      {/* Section label */}
      <div className="flex items-center gap-3 px-6 sm:px-10 mb-6 sm:mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14AF9E] animate-pulse" />
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Selected Works
        </span>
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Row 1: scroll left */}
        <MarqueeRow items={ROW_A} direction="left" speed={40} />
        {/* Row 2: scroll right */}
        <MarqueeRow items={ROW_B} direction="right" speed={48} />
      </div>
    </section>
  );
}

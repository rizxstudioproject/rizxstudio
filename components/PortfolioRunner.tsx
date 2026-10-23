"use client";

import React from "react";
import { usePortfolioData, PortfolioRunnerItem } from "@/context/PortfolioDataContext";

interface RunnerCardProps {
  item: PortfolioRunnerItem;
}

function RunnerCard({ item }: RunnerCardProps) {
  return (
    <div className="relative flex-shrink-0 w-[155px] sm:w-[190px] md:w-[220px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_12px_36px_rgba(0,0,0,0.7)] group">
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {/* Dark gradient overlay — pure dark theme, blends seamlessly */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent pointer-events-none" />

      {/* Card Info at Bottom */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-0.5 pointer-events-none">
        <span className="text-white text-xs sm:text-sm font-bold truncate leading-tight drop-shadow-md">
          {item.title}
        </span>
        {item.category && (
          <span className="text-[#14AF9E] text-[10px] sm:text-xs font-mono font-medium truncate">
            {item.category}
          </span>
        )}
      </div>
    </div>
  );
}

interface MarqueeRowProps {
  items: PortfolioRunnerItem[];
  direction?: "left" | "right";
  speed?: number;
}

/**
 * Builds a seamless, gap-free marquee row.
 * Guarantees that at any screen size (even 4K ultrawide), the track is wide enough
 * that the -50% translation NEVER reveals an empty gap or broken loop ("jangan ada putus").
 */
function MarqueeRow({ items, direction = "left", speed = 42 }: MarqueeRowProps) {
  if (!items || items.length === 0) return null;

  // 1. Ensure track has at least 16 cards before duplicating
  let baseList: PortfolioRunnerItem[] = [...items];
  while (baseList.length < 16) {
    baseList = [...baseList, ...items];
  }

  // 2. Duplicate exact base to form two identical halves for smooth -50% loop
  const doubled = [...baseList, ...baseList];
  const animClass = direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div className="relative w-full overflow-hidden">
      {/* Seamless edge fade overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div
        className={`flex gap-3 sm:gap-4 w-max ${animClass}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, idx) => (
          <RunnerCard key={`${item.id}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function PortfolioRunner() {
  const { portfolioRunner } = usePortfolioData();
  const items = portfolioRunner?.items || [];

  const row1Items = items.filter((i) => i.row === 1);
  const row2Items = items.filter((i) => i.row === 2);

  // If a row is empty, fallback to sharing the items
  const finalRow1 = row1Items.length > 0 ? row1Items : items;
  const finalRow2 = row2Items.length > 0 ? row2Items : items;

  if (items.length === 0) return null;

  return (
    <section className="w-full overflow-hidden py-10 sm:py-14 bg-black border-t border-white/[0.05]">
      {/* Section Header / Label */}
      <div className="flex items-center gap-3 px-6 sm:px-10 mb-6 sm:mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14AF9E] animate-pulse" />
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
          {portfolioRunner.title || "Selected Works"}
        </span>
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Row 1: Scroll Ke Kiri */}
        <MarqueeRow items={finalRow1} direction="left" speed={40} />
        {/* Row 2: Scroll Ke Kanan */}
        <MarqueeRow items={finalRow2} direction="right" speed={48} />
      </div>
    </section>
  );
}

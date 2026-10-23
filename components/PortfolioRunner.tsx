"use client";

import React from "react";
import { usePortfolioData, PortfolioRunnerItem } from "@/context/PortfolioDataContext";

interface RunnerCardProps {
  item: PortfolioRunnerItem;
}

function RunnerCard({ item }: RunnerCardProps) {
  return (
    <div className="relative flex-shrink-0 w-[105px] sm:w-[125px] md:w-[145px] aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.6)] group transition-colors duration-300 hover:border-[#14AF9E]/40 mr-2.5 sm:mr-3.5">
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {/* Dark gradient overlay — pure dark theme, blends seamlessly */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />

      {/* Card Info at Bottom */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5 pointer-events-none">
        <span className="text-white text-[10px] sm:text-[11px] font-semibold truncate leading-tight drop-shadow-md">
          {item.title}
        </span>
        {item.category && (
          <span className="text-[#14AF9E] text-[8px] sm:text-[9px] font-mono font-medium truncate">
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
 * Builds a seamless, gap-free marquee row using 2 identical side-by-side tracks.
 * - Each track is at least 20 items long (~2,900px+), far exceeding any ultrawide monitor width.
 * - Track A and Track B translate in lockstep (-100% or +100%) so there is 0 gap and 0 jump.
 */
function MarqueeRow({ items, direction = "left", speed = 85 }: MarqueeRowProps) {
  if (!items || items.length === 0) return null;

  // Guarantee track has at least 20 items so a single track exceeds ultrawide displays
  let trackItems: PortfolioRunnerItem[] = [...items];
  while (trackItems.length < 20) {
    trackItems = [...trackItems, ...items];
  }

  const animationName = direction === "left" ? "prunner-marquee-left" : "prunner-marquee-right";

  return (
    <div className="relative w-full overflow-hidden">
      {/* Seamless edge fade overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div className="flex w-max overflow-hidden">
        {/* Track 1 */}
        <div
          className="flex shrink-0"
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
            willChange: "transform",
          }}
        >
          {trackItems.map((item, idx) => (
            <RunnerCard key={`t1-${item.id}-${idx}`} item={item} />
          ))}
        </div>

        {/* Track 2 (Identical Clone for continuous, infinite loop) */}
        <div
          className="flex shrink-0"
          aria-hidden="true"
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
            willChange: "transform",
          }}
        >
          {trackItems.map((item, idx) => (
            <RunnerCard key={`t2-${item.id}-${idx}`} item={item} />
          ))}
        </div>
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
    <section className="w-full overflow-hidden py-5 sm:py-7 bg-black border-t border-white/[0.05]">
      {/* Unique keyframes isolated for portfolio runner */}
      <style>{`
        @keyframes prunner-marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes prunner-marquee-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div className="flex flex-col gap-2.5 sm:gap-3.5">
        {/* Row 1: Ambient Slow Scroll Ke Kiri */}
        <MarqueeRow items={finalRow1} direction="left" speed={85} />
        {/* Row 2: Ambient Slow Scroll Ke Kanan */}
        <MarqueeRow items={finalRow2} direction="right" speed={95} />
      </div>
    </section>
  );
}

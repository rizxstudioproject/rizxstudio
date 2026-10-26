"use client";

import React, { useRef, useEffect, useState } from "react";
import { usePortfolioData, PortfolioRunnerItem } from "@/context/PortfolioDataContext";

interface RunnerCardProps {
  item: PortfolioRunnerItem;
  onCardClick?: (item: PortfolioRunnerItem) => void;
}

const RunnerCard = React.forwardRef<HTMLDivElement, RunnerCardProps>(({ item, onCardClick }, ref) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.link && item.link.trim() !== "") {
      const target = item.link.trim();
      if (target.startsWith("http://") || target.startsWith("https://")) {
        window.open(target, "_blank", "noopener,noreferrer");
      } else if (target.startsWith("#")) {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.hash = target;
        }
      } else {
        window.location.href = target;
      }
      return;
    }
    if (onCardClick) {
      onCardClick(item);
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        transformOrigin: "bottom center",
        willChange: "transform",
      }}
      className="relative flex-shrink-0 w-[105px] sm:w-[125px] md:w-[145px] aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.6)] group transition-[transform,border-color,box-shadow] duration-200 ease-out mr-2.5 sm:mr-3.5 select-none cursor-pointer hover:border-[#16b09f]/60 hover:shadow-[0_12px_28px_rgba(22,176,159,0.25)]"
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />

      {/* External Link Indicator if link present */}
      {item.link && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-black/70 backdrop-blur-md border border-[#16b09f]/40 flex items-center justify-center text-[10px] text-[#16b09f] shadow-md group-hover:scale-110 transition-transform">
          ↗
        </div>
      )}

      {/* Card Info at Bottom */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5 pointer-events-none">
        <span className="text-white text-[10px] sm:text-[11px] font-semibold truncate leading-tight drop-shadow-md">
          {item.title}
        </span>
        {item.category && (
          <span className="text-[#16b09f] text-[8px] sm:text-[9px] font-mono font-medium truncate">
            {item.category}
          </span>
        )}
      </div>
    </div>
  );
});

RunnerCard.displayName = "RunnerCard";

interface MarqueeRowProps {
  items: PortfolioRunnerItem[];
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  waveEnabled?: boolean;
  waveLift?: number;
  waveScale?: number;
  waveRadius?: number;
  onCardClick?: (item: PortfolioRunnerItem) => void;
}

function MarqueeRow({
  items,
  direction = "left",
  speed = 85,
  pauseOnHover = false,
  waveEnabled = true,
  waveLift = 22,
  waveScale = 1.17,
  waveRadius = 240,
  onCardClick,
}: MarqueeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Guarantee track has at least 20 items so a single track exceeds ultrawide displays
  let trackItems: PortfolioRunnerItem[] = [...items];
  while (trackItems.length < 20) {
    trackItems = [...trackItems, ...items];
  }

  const animationName = direction === "left" ? "prunner-marquee-left" : "prunner-marquee-right";
  const pauseClass = pauseOnHover ? "hover:[animation-play-state:paused]" : "";

  useEffect(() => {
    const rowEl = rowRef.current;
    if (!rowEl || !waveEnabled) return;

    let mouseX: number | null = null;
    let isHovering = false;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      isHovering = true;
    };

    const onMouseLeave = () => {
      mouseX = null;
      isHovering = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        isHovering = true;
      }
    };

    const onTouchEnd = () => {
      mouseX = null;
      isHovering = false;
    };

    const W_RADIUS = Math.max(100, waveRadius || 240);
    const maxLift = Math.max(5, waveLift || 22);
    const scaleBonus = Math.max(0.02, (waveScale || 1.17) - 1.0);

    const updateWave = () => {
      const cards = cardRefs.current;

      if (!isHovering || mouseX === null) {
        // Reset any cards that were previously in a wave state
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          if (card && card.dataset.waved === "true") {
            card.style.transform = "";
            card.style.zIndex = "";
            card.style.borderColor = "";
            card.style.boxShadow = "";
            delete card.dataset.waved;
          }
        }
        animId = requestAnimationFrame(updateWave);
        return;
      }

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card) continue;

        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - cardCenter);

        if (dist < W_RADIUS) {
          const ratio = 1 - dist / W_RADIUS;
          const curve = Math.cos(((1 - ratio) * Math.PI) / 2);
          const lift = curve * maxLift;
          const scale = 1.0 + curve * scaleBonus;
          const tilt = ((cardCenter - mouseX) / W_RADIUS) * 3;

          card.style.transform = `translateY(-${lift}px) scale(${scale}) rotate(${tilt}deg)`;
          card.style.zIndex = "30";
          card.style.borderColor = "rgba(22, 176, 159, 0.4)";
          card.style.boxShadow = "0 14px 32px rgba(22, 176, 159, 0.28)";
          card.dataset.waved = "true";
        } else if (card.dataset.waved === "true") {
          card.style.transform = "";
          card.style.zIndex = "";
          card.style.borderColor = "";
          card.style.boxShadow = "";
          delete card.dataset.waved;
        }
      }

      animId = requestAnimationFrame(updateWave);
    };

    rowEl.addEventListener("mousemove", onMouseMove);
    rowEl.addEventListener("mouseleave", onMouseLeave);
    rowEl.addEventListener("touchmove", onTouchMove, { passive: true });
    rowEl.addEventListener("touchend", onTouchEnd, { passive: true });
    rowEl.addEventListener("touchcancel", onTouchEnd, { passive: true });

    animId = requestAnimationFrame(updateWave);

    return () => {
      rowEl.removeEventListener("mousemove", onMouseMove);
      rowEl.removeEventListener("mouseleave", onMouseLeave);
      rowEl.removeEventListener("touchmove", onTouchMove);
      rowEl.removeEventListener("touchend", onTouchEnd);
      rowEl.removeEventListener("touchcancel", onTouchEnd);
      cancelAnimationFrame(animId);
    };
  }, [waveEnabled, waveRadius, waveLift, waveScale]);

  if (!items || items.length === 0) return null;

  return (
    <div ref={rowRef} className="relative w-full overflow-hidden py-4 -my-4 group/row">
      {/* Seamless edge fade overlays */}
      <div className="runner-fade-left absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[var(--background,#0a0a0a)] to-transparent z-20 pointer-events-none" />
      <div className="runner-fade-right absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[var(--background,#0a0a0a)] to-transparent z-20 pointer-events-none" />

      <div className="flex w-max overflow-visible pt-6 pb-2">
        {/* Track 1 */}
        <div
          className={`flex shrink-0 overflow-visible ${pauseClass}`}
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
            willChange: "transform",
          }}
        >
          {trackItems.map((item, idx) => (
            <RunnerCard
              key={`t1-${item.id}-${idx}`}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              item={item}
              onCardClick={onCardClick}
            />
          ))}
        </div>

        {/* Track 2 (Identical Clone for continuous, infinite loop) */}
        <div
          className={`flex shrink-0 overflow-visible ${pauseClass}`}
          aria-hidden="true"
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
            willChange: "transform",
          }}
        >
          {trackItems.map((item, idx) => (
            <RunnerCard
              key={`t2-${item.id}-${idx}`}
              ref={(el) => {
                cardRefs.current[trackItems.length + idx] = el;
              }}
              item={item}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioRunner() {
  const { portfolioRunner } = usePortfolioData();
  const items = portfolioRunner?.items || [];
  const [selectedCard, setSelectedCard] = useState<PortfolioRunnerItem | null>(null);

  const row1Items = items.filter((i) => i.row === 1);
  const row2Items = items.filter((i) => i.row === 2);

  // If a row is empty, fallback to sharing the items
  const finalRow1 = row1Items.length > 0 ? row1Items : items;
  const finalRow2 = row2Items.length > 0 ? row2Items : items;

  // Dynamic Runner Settings from Admin
  const speedRow1 = portfolioRunner?.speedRow1 ?? 85;
  const speedRow2 = portfolioRunner?.speedRow2 ?? 95;
  const directionRow1 = portfolioRunner?.directionRow1 ?? "left";
  const directionRow2 = portfolioRunner?.directionRow2 ?? "right";
  const pauseOnHover = portfolioRunner?.pauseOnHover ?? false;
  const waveEnabled = portfolioRunner?.waveEffectEnabled ?? true;
  const waveLift = portfolioRunner?.waveLift ?? 22;
  const waveScale = portfolioRunner?.waveScale ?? 1.17;
  const waveRadius = portfolioRunner?.waveRadius ?? 240;

  if (items.length === 0) return null;

  return (
    <section className="portfolio-runner-section w-full overflow-hidden py-6 sm:py-8 bg-[var(--background,#0a0a0a)] border-t border-white/[0.05] transition-colors duration-300">
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

      <div className="flex flex-col gap-1 sm:gap-2">
        {/* Row 1 */}
        <MarqueeRow
          items={finalRow1}
          direction={directionRow1}
          speed={speedRow1}
          pauseOnHover={pauseOnHover}
          waveEnabled={waveEnabled}
          waveLift={waveLift}
          waveScale={waveScale}
          waveRadius={waveRadius}
          onCardClick={setSelectedCard}
        />
        {/* Row 2 */}
        <MarqueeRow
          items={finalRow2}
          direction={directionRow2}
          speed={speedRow2}
          pauseOnHover={pauseOnHover}
          waveEnabled={waveEnabled}
          waveLift={waveLift}
          waveScale={waveScale}
          waveRadius={waveRadius}
          onCardClick={setSelectedCard}
        />
      </div>

      {/* Lightbox Modal for Running Portfolio Card Artwork */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl bg-neutral-950 border border-white/15 p-4 sm:p-5 flex flex-col gap-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
              aria-label="Tutup"
            >
              ✕
            </button>

            {/* Image Preview 4:5 */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center">
              <img
                src={selectedCard.image}
                alt={selectedCard.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info & Action */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                {selectedCard.category && (
                  <span className="text-[10px] font-mono text-[#16b09f] font-semibold uppercase tracking-wider block">
                    {selectedCard.category}
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {selectedCard.title}
                </h3>
              </div>

              {selectedCard.link ? (
                <a
                  href={selectedCard.link}
                  target={selectedCard.link.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md"
                >
                  <span>Buka Link</span>
                  <span>↗</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all shrink-0 cursor-pointer"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

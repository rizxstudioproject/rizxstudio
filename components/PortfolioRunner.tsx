"use client";

import React, { useRef, useEffect } from "react";
import { usePortfolioData, PortfolioRunnerItem } from "@/context/PortfolioDataContext";

interface RunnerCardProps {
  item: PortfolioRunnerItem;
}

const RunnerCard = React.forwardRef<HTMLDivElement, RunnerCardProps>(({ item }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        transformOrigin: "bottom center",
        willChange: "transform",
      }}
      className="relative flex-shrink-0 w-[105px] sm:w-[125px] md:w-[145px] aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.6)] group transition-[transform,border-color,box-shadow] duration-200 ease-out mr-2.5 sm:mr-3.5 select-none"
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
      />
      {/* Dark gradient overlay — pure dark theme, blends seamlessly */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />

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
}

/**
 * Builds a seamless, gap-free marquee row with interactive Proximity Ripple Wave.
 * When the mouse touches or hovers near a card:
 * - The card closest to the mouse elevates ("melayang", up to -22px) and scales up with a teal glow.
 * - Neighboring cards within the wave radius also elevate and tilt in a smooth bell curve wave.
 */
function MarqueeRow({
  items,
  direction = "left",
  speed = 85,
  pauseOnHover = false,
  waveEnabled = true,
  waveLift = 22,
  waveScale = 1.17,
  waveRadius = 240,
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
            card.dataset.waved = "false";
          }
        }
      } else {
        const curMouseX = mouseX;

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          if (!card) continue;

          const rect = card.getBoundingClientRect();
          // Skip cards outside visible viewport window horizontally
          if (rect.right < -100 || rect.left > window.innerWidth + 100) continue;

          const cardCenterX = rect.left + rect.width / 2;
          const dist = Math.abs(curMouseX - cardCenterX);

          if (dist < W_RADIUS) {
            const norm = dist / W_RADIUS;
            // Cosine bell curve wave equation: 1.0 at epicenter, tapering smoothly to 0.0
            const wave = Math.cos(norm * (Math.PI / 2));

            const lift = -maxLift * wave;
            const curScale = 1 + scaleBonus * wave;
            const tilt = ((cardCenterX - curMouseX) / W_RADIUS) * 3.5 * wave;
            const zIndex = Math.round(10 + wave * 25);
            const borderAlpha = 0.12 + wave * 0.88;
            const shadowAlpha = wave * 0.45;

            card.style.transform = `translate3d(0, ${lift.toFixed(1)}px, 0) scale(${curScale.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;
            card.style.zIndex = String(zIndex);
            card.style.borderColor = `rgba(20, 175, 158, ${borderAlpha.toFixed(2)})`;
            card.style.boxShadow = `0 ${Math.round(8 + wave * 16)}px ${Math.round(20 + wave * 24)}px rgba(20, 175, 158, ${shadowAlpha.toFixed(2)})`;
            card.dataset.waved = "true";
          } else if (card.dataset.waved === "true") {
            card.style.transform = "";
            card.style.zIndex = "";
            card.style.borderColor = "";
            card.style.boxShadow = "";
            card.dataset.waved = "false";
          }
        }
      }

      animId = requestAnimationFrame(updateWave);
    };

    rowEl.addEventListener("mousemove", onMouseMove, { passive: true });
    rowEl.addEventListener("mouseleave", onMouseLeave, { passive: true });
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
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

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
    <section className="w-full overflow-hidden py-6 sm:py-8 bg-black border-t border-white/[0.05]">
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
        />
      </div>
    </section>
  );
}


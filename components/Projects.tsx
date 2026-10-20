"use client";

import React, { useState, useRef, useEffect } from "react";
import { antigravityData } from "@/data/projectsData";
import { HiArrowUpRight } from "react-icons/hi2";

export default function Projects() {
  const { headerPrompts, floatingBadges, projects } = antigravityData;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress of this 250vh section through viewport (0 to 1)
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;
      
      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Total cards count
  const N = projects.length; // 7 cards
  const centerIdx = Math.floor(N / 2); // index 3 is center

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full h-[250vh] bg-[#0a0a0a] text-white"
    >
      {/* Sticky Stage Container (Viewport pinned) */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-between py-12 px-4 sm:px-8 overflow-hidden select-none">
        
        {/* Subtle Ambient Radial Lighting in Deep Dark Space */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-orange-500/[0.04] via-cyan-500/[0.03] to-purple-500/[0.04] blur-[150px] pointer-events-none rounded-full" />

        {/* 1. Header & Text (Matches Pallet Ross exact layout) */}
        <div className="relative z-30 flex flex-col items-center text-center mt-4 sm:mt-8 max-w-4xl px-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-500 mb-3">
            {headerPrompts.badge || "03 / SELECTED WORKS"}
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            {headerPrompts.headline}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-light mt-3 max-w-xl mx-auto leading-relaxed">
            {headerPrompts.subheadline}
          </p>
        </div>

        {/* 2. Interactive Fan-out Deck Stage */}
        <div className="relative w-full flex-1 flex items-center justify-center my-auto min-h-[360px] sm:min-h-[440px]">
          
          {/* Floating Speech-Bubble Badges (Coplin, Howard, Andrea, Robin) */}
          {floatingBadges.map((badge, bIdx) => {
            // Badges fade in as cards fan out
            const badgeOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.25) / 0.4));
            
            // Positioning above the cards
            const badgePositions = [
              "top-6 sm:top-10 left-[8%] sm:left-[16%]",
              "top-2 sm:top-4 left-[46%] -translate-x-1/2",
              "top-6 sm:top-10 right-[8%] sm:right-[16%]",
              "bottom-4 right-[20%]",
            ];
            
            return (
              <div
                key={badge.id}
                className={`absolute ${badgePositions[bIdx % badgePositions.length]} z-40 transition-all duration-500`}
                style={{
                  opacity: badgeOpacity,
                  transform: `translateY(${(1 - badgeOpacity) * 20}px) scale(${badgeOpacity > 0.1 ? 1 : 0.8})`,
                  pointerEvents: badgeOpacity > 0.5 ? "auto" : "none",
                }}
              >
                <div
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg border backdrop-blur-md cursor-default select-none ${badge.color}`}
                >
                  <span>{badge.text}</span>
                  {/* Speech bubble tail pointer */}
                  <div className="absolute -bottom-1 left-4 w-2 h-2 rotate-45 bg-inherit border-r border-b border-inherit" />
                </div>
              </div>
            );
          })}

          {/* Cards Deck */}
          <div className="relative w-full max-w-5xl h-[340px] sm:h-[400px] flex items-center justify-center">
            {projects.map((card, i) => {
              const distFromCenter = i - centerIdx; // -3, -2, -1, 0, 1, 2, 3
              
              // Phase 1 (0 to 0.15): Single card / Stacked tightly in center
              // Phase 2 (0.15 to 0.85): Fans out horizontally into a curved hand
              const fanProgress = Math.max(0, Math.min(1, (scrollProgress - 0.1) / 0.7));
              
              // Target transforms when fully fanned out
              const targetX = distFromCenter * 115; // px horizontal separation
              const targetRotate = distFromCenter * 5.5; // arc tilt angle
              // Arc curvature: outer cards dip downwards slightly
              const targetY = Math.abs(distFromCenter) * 14;

              // Current interpolated values
              const currentX = targetX * fanProgress;
              const currentRotate = targetRotate * fanProgress;
              const currentY = targetY * fanProgress;

              const isHovered = hoveredCard === card.id;

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`absolute w-44 sm:w-56 md:w-64 aspect-square rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-neutral-900/90 border ${
                    card.borderAccent || "border-white/10"
                  } shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer transition-transform duration-300 ease-out`}
                  style={{
                    zIndex: isHovered ? 50 : 10 + i,
                    transform: `translate3d(${currentX}px, ${
                      currentY + (isHovered ? -24 : 0)
                    }px, 0) rotate(${isHovered ? 0 : currentRotate}deg) scale(${
                      isHovered ? 1.08 : 1
                    })`,
                  }}
                >
                  {/* Artwork / Poster Inside Card */}
                  <div
                    className={`relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br ${card.gradient} flex flex-col justify-between p-3 sm:p-4 border border-white/10`}
                  >
                    {/* Top Tag */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[9px] sm:text-[10px] font-mono tracking-wider text-neutral-300 uppercase border border-white/10">
                        {card.category}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-[10px] text-white">
                        ↗
                      </span>
                    </div>

                    {/* Bottom Title */}
                    <div>
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight drop-shadow-md">
                        {card.title}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-neutral-300/80 font-mono mt-0.5">
                        Selected Masterpiece
                      </p>
                    </div>

                    {/* Subtle Sheen Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.04] to-white/[0.12] pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Bottom Action CTA Bar (Join / Read more matching video) */}
        <div className="relative z-30 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-2">
          <a
            href="mailto:contact@fomyr.com"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)]"
          >
            <span>Explore Masterpieces</span>
            <HiArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08] text-xs sm:text-sm font-medium transition-all"
          >
            <span>Collaborate With Me</span>
          </a>
        </div>

      </div>
    </section>
  );
}

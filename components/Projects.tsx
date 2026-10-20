"use client";

import React, { useState, useRef, useEffect } from "react";
import { antigravityData } from "@/data/projectsData";
import { HiArrowUpRight } from "react-icons/hi2";

export default function Projects() {
  const { stage1, stage2, stage3, stage4 } = antigravityData;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Business" | "Personal">("Business");

  // Track scroll progress through this pinned 500vh container
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 4 STAGE INTERVALS IN 0..1 PROGRESS:
  // Phase 1 (0.00 - 0.28): 1 Card -> Fans out to 5 Cards + Badges
  // Phase 2 (0.28 - 0.52): Left Text + Right Dense Stacked Overlapping Cards
  // Phase 3 (0.52 - 0.74): Full Wide Hero Showcase ("Gateway to artist people.")
  // Phase 4 (0.74 - 1.00): Vision + Client Work Project Grid (Business/Personal)

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full h-[500vh] bg-[#0a0a0a] text-white"
    >
      {/* Sticky Fullscreen Stage */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden select-none px-4 sm:px-8">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-orange-500/[0.03] via-cyan-500/[0.03] to-purple-500/[0.03] blur-[170px] pointer-events-none rounded-full" />

        {/* ========================================================
            STAGE 1: 1 Card -> Fans out to 5 Cards + Floating Badges
            (Active: 0.00 -> 0.28)
           ======================================================== */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-between py-12 sm:py-16 px-4 transition-all duration-700 ease-out"
          style={{
            opacity: scrollProgress < 0.25 ? 1 : Math.max(0, 1 - (scrollProgress - 0.25) / 0.05),
            transform: `translate3d(0, ${scrollProgress < 0.25 ? 0 : -(scrollProgress - 0.25) * 400}px, 0)`,
            pointerEvents: scrollProgress <= 0.28 ? "auto" : "none",
            visibility: scrollProgress > 0.3 ? "hidden" : "visible",
          }}
        >
          {/* Header */}
          <div className="relative z-30 flex flex-col items-center text-center mt-2 max-w-4xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-500 mb-2">
              {stage1.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              {stage1.headline}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-light mt-3 max-w-xl mx-auto leading-relaxed">
              {stage1.subheadline}
            </p>
          </div>

          {/* Cards Stage: Starts as 1 Card at center, fans out to 5 on scroll */}
          <div className="relative w-full max-w-5xl h-[340px] sm:h-[400px] flex items-center justify-center my-auto">
            {/* Floating Badges */}
            {stage1.floatingBadges.map((badge, bIdx) => {
              const badgeOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.06) / 0.1));
              return (
                <div
                  key={badge.id}
                  className={`absolute z-40 transition-all duration-500`}
                  style={{
                    top: badge.top,
                    left: badge.left,
                    right: badge.right,
                    opacity: badgeOpacity,
                    transform: `translateY(${(1 - badgeOpacity) * 20}px)`,
                  }}
                >
                  <div
                    className={`relative px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg border backdrop-blur-md ${badge.color}`}
                  >
                    <span>{badge.text}</span>
                    <div className="absolute -bottom-1 left-4 w-2 h-2 rotate-45 bg-inherit border-r border-b border-inherit" />
                  </div>
                </div>
              );
            })}

            {/* 5 Cards Fan-out */}
            {stage1.deckCards.map((card, i) => {
              const N = stage1.deckCards.length;
              const centerIndex = Math.floor(N / 2); // 2
              const distFromCenter = i - centerIndex; // -2, -1, 0, 1, 2
              
              // Progress 0..1 within phase 1
              const fanProgress = Math.max(0, Math.min(1, (scrollProgress - 0.03) / 0.18));
              
              const targetX = distFromCenter * 140;
              const targetRotate = distFromCenter * 7;
              const targetY = Math.abs(distFromCenter) * 16;

              const currentX = targetX * fanProgress;
              const currentRotate = targetRotate * fanProgress;
              const currentY = targetY * fanProgress;

              const isHovered = hoveredCard === card.id;

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="absolute w-44 sm:w-56 md:w-64 aspect-square rounded-3xl p-3 bg-neutral-900/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer transition-transform duration-300 ease-out"
                  style={{
                    zIndex: isHovered ? 50 : 10 + i,
                    transform: `translate3d(${currentX}px, ${
                      currentY + (isHovered ? -24 : 0)
                    }px, 0) rotate(${isHovered ? 0 : currentRotate}deg) scale(${
                      isHovered ? 1.08 : 1
                    })`,
                  }}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-950 flex flex-col justify-between p-3.5 border border-white/5">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono uppercase tracking-wider text-neutral-300 border border-white/10">
                        {card.category}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-black/50 text-[10px] flex items-center justify-center text-white">
                        ↗
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-sm font-bold text-white tracking-tight">{card.title}</h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Masterpiece</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-30 text-xs text-neutral-500 font-mono flex items-center gap-2">
            <span>Scroll to see transition</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>

        {/* ========================================================
            STAGE 2: Left Headline & Text + Right Dense Overlapping Cards
            (Active: 0.28 -> 0.52)
           ======================================================== */}
        <div
          className="absolute inset-0 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 px-6 sm:px-12 my-auto transition-all duration-700 ease-out"
          style={{
            opacity:
              scrollProgress < 0.28
                ? 0
                : scrollProgress > 0.5
                ? Math.max(0, 1 - (scrollProgress - 0.5) / 0.05)
                : Math.min(1, (scrollProgress - 0.28) / 0.05),
            transform: `translate3d(0, ${
              scrollProgress < 0.28
                ? 60
                : scrollProgress > 0.5
                ? -(scrollProgress - 0.5) * 300
                : 0
            }px, 0)`,
            pointerEvents: scrollProgress >= 0.28 && scrollProgress <= 0.52 ? "auto" : "none",
            visibility: scrollProgress < 0.25 || scrollProgress > 0.55 ? "hidden" : "visible",
          }}
        >
          {/* Left Text Block */}
          <div className="max-w-lg">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-orange-400 mb-3 block">
              {stage2.categoryTag}
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-[1.12]">
              {stage2.headline}
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed mb-6">
              {stage2.description}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#contact"
                className="px-6 py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Join for $9.99/m
              </a>
              <a
                href="#about"
                className="px-5 py-3 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white text-xs sm:text-sm font-medium transition-all"
              >
                Read more
              </a>
            </div>
          </div>

          {/* Right Overlapping Dense Deck with Floating Badges */}
          <div className="relative w-full max-w-md h-[340px] sm:h-[400px] flex items-center justify-center">
            {/* Badges @howard & @robin */}
            <div className="absolute top-2 left-6 z-40 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#9A2D23] text-white border border-red-700 shadow-lg">
              @howard
              <div className="absolute -bottom-1 left-3 w-2 h-2 rotate-45 bg-[#9A2D23]" />
            </div>
            <div className="absolute top-8 right-6 z-40 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-800 text-white border border-neutral-700 shadow-lg">
              @robin
              <div className="absolute -bottom-1 right-4 w-2 h-2 rotate-45 bg-neutral-800" />
            </div>

            {/* Overlapping Dense Cards */}
            {stage2.overlappingCards.map((card, idx) => {
              return (
                <div
                  key={card.id}
                  className="absolute w-52 sm:w-60 aspect-square rounded-3xl p-3 bg-neutral-900 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-4 cursor-pointer"
                  style={{
                    zIndex: 10 + idx,
                    transform: `translate3d(${card.offset}px, ${idx * 6}px, 0) rotate(${card.rotate}deg)`,
                  }}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-950 relative border border-white/5">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-xs font-bold text-white">
                      {card.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            STAGE 3: Full Wide Hero Showcase ("Gateway to artist people.")
            (Active: 0.52 -> 0.74)
           ======================================================== */}
        <div
          className="absolute inset-0 max-w-5xl mx-auto flex flex-col justify-center px-4 sm:px-8 my-auto transition-all duration-700 ease-out"
          style={{
            opacity:
              scrollProgress < 0.52
                ? 0
                : scrollProgress > 0.72
                ? Math.max(0, 1 - (scrollProgress - 0.72) / 0.05)
                : Math.min(1, (scrollProgress - 0.52) / 0.05),
            transform: `translate3d(0, ${
              scrollProgress < 0.52
                ? 60
                : scrollProgress > 0.72
                ? -(scrollProgress - 0.72) * 300
                : 0
            }px, 0)`,
            pointerEvents: scrollProgress >= 0.52 && scrollProgress <= 0.74 ? "auto" : "none",
            visibility: scrollProgress < 0.49 || scrollProgress > 0.76 ? "hidden" : "visible",
          }}
        >
          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-500 block mb-2">
              {stage3.classTag}
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
              {stage3.headline}
            </h2>
          </div>

          {/* Large Aspect Card */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] bg-neutral-900 group cursor-pointer">
            <img
              src={stage3.heroCard.image}
              alt={stage3.heroCard.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 sm:left-10 flex flex-col">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
                {stage3.heroCard.category}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                {stage3.heroCard.title}
              </h3>
            </div>

            <div className="absolute bottom-6 right-6 sm:right-10 flex items-center gap-2">
              <span className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors">
                Watch
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            STAGE 4: Our Vision & Grid of Client Work Gallery
            (Active: 0.74 -> 1.00)
           ======================================================== */}
        <div
          className="absolute inset-0 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 px-6 sm:px-10 my-auto transition-all duration-700 ease-out"
          style={{
            opacity: scrollProgress < 0.74 ? 0 : Math.min(1, (scrollProgress - 0.74) / 0.05),
            transform: `translate3d(0, ${scrollProgress < 0.74 ? 60 : 0}px, 0)`,
            pointerEvents: scrollProgress >= 0.74 ? "auto" : "none",
            visibility: scrollProgress < 0.71 ? "hidden" : "visible",
          }}
        >
          {/* Left Text Block + Radial Tool Icons */}
          <div className="max-w-md">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center mb-4 text-xs">
              ✦
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              {stage4.headline}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed mb-6">
              {stage4.description}
            </p>
            <a
              href="#about"
              className="text-xs sm:text-sm font-medium text-white hover:text-cyan-300 underline underline-offset-4 transition-colors"
            >
              Read more →
            </a>

            {/* Radial Tools Stack */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
              {["Figma", "Blender", "After Effects", "Midjourney", "Octane", "Motion"].map((tool, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-mono text-neutral-400">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Right Folder Tab View (Business / Personal) with 3x2 Grid */}
          <div className="w-full max-w-lg bg-neutral-900/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
            {/* Folder Header Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab("Business")}
                  className={`text-sm font-bold transition-colors ${
                    activeTab === "Business" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Business
                </button>
                <button
                  onClick={() => setActiveTab("Personal")}
                  className={`text-sm font-bold transition-colors ${
                    activeTab === "Personal" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Personal
                </button>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                + Create
              </span>
            </div>

            {/* Grid of Work */}
            <div className="grid grid-cols-3 gap-3">
              {stage4.clientProjects
                .filter((p) => p.tag === activeTab)
                .map((proj) => (
                  <div
                    key={proj.id}
                    className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-950 border border-white/5 cursor-pointer hover:border-white/20 transition-all"
                  >
                    <img
                      src={proj.image}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-bold text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {proj.title}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

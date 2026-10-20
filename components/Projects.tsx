"use client";

import React, { useState, useRef, useEffect } from "react";
import { antigravityData } from "@/data/projectsData";

export default function Projects() {
  const { headerPrompts, floatingBadges, projects } = antigravityData;
  const stageRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isInsideStage, setIsInsideStage] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [pinnedBadge, setPinnedBadge] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Parallax tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Repulsion physics calculation relative to stage center (-1 to +1)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <section
      id="projects"
      className="relative w-full overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] text-white select-none"
    >
      {/* 1. Background Giant Watermark "PORTFOLIO" with Scroll Parallax */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(0, ${(scrollY * 0.08) % 60}px, 0)`,
        }}
      >
        <h1 className="text-[19vw] font-black tracking-tighter text-white/[0.03] uppercase leading-none">
          PORTFOLIO
        </h1>
      </div>

      {/* Ambient background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/[0.03] blur-[160px] pointer-events-none rounded-full" />

      {/* 2. Header & Prompt Metadata */}
      <div className="max-w-4xl mx-auto relative z-10 text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-[0.25em] bg-white/[0.04] border border-white/10 text-cyan-300 backdrop-blur-md shadow-sm">
            ✦ {headerPrompts.badge}
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
          {headerPrompts.headline}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-light mt-3.5 max-w-xl mx-auto leading-relaxed">
          {headerPrompts.subheadline}
        </p>
      </div>

      {/* 3. Interactive Floating Canvas Stage (Cascade Fan) */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsInsideStage(true)}
        onMouseLeave={() => {
          setIsInsideStage(false);
          setMousePos({ x: 0, y: 0 });
        }}
        className="relative max-w-6xl mx-auto min-h-[580px] sm:h-[620px] md:h-[660px] rounded-[36px] border border-white/[0.08] bg-neutral-950/60 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-4 sm:p-10"
      >
        {/* Subtle grid pattern inside stage */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

        {/* Floating Badges with Repulsion Physics & Idle Sine-Wave Floating */}
        {floatingBadges.map((badge, idx) => {
          const isPinned = pinnedBadge === badge.id;
          // Magnetic repulsion: move opposite/with mouse
          const repelX = isInsideStage && !isPinned ? mousePos.x * (idx + 1) * -16 : 0;
          const repelY = isInsideStage && !isPinned ? mousePos.y * (idx + 1) * -16 : 0;
          const floatDuration = 4 + (idx % 3) * 1.5;

          return (
            <div
              key={badge.id}
              onClick={() => setPinnedBadge(isPinned ? null : badge.id)}
              className={`floating-pill absolute z-30 px-4 py-2 rounded-full text-xs font-mono font-medium tracking-wide cursor-pointer transition-all duration-300 backdrop-blur-md shadow-lg ${
                isPinned
                  ? "bg-cyan-400 text-black border-cyan-300 font-bold shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-110"
                  : "bg-neutral-900/90 text-neutral-300 border border-white/10 hover:border-white/30 hover:text-white hover:scale-105"
              }`}
              style={{
                ...badge.initialPos,
                transform: `translate3d(${repelX}px, ${repelY}px, 0)`,
                animation: isPinned
                  ? "none"
                  : `sine-float-badge ${floatDuration}s ease-in-out infinite alternate`,
                animationDelay: `${idx * 0.4}s`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-cyan-400">{isPinned ? "📌" : "✦"}</span>
                <span>{badge.text}</span>
              </div>
            </div>
          );
        })}

        {/* 4. Overlapping Cascade Fan of Cards */}
        <div className="cards-fan-container relative z-20 flex flex-wrap md:flex-nowrap justify-center items-center gap-4 sm:gap-6 my-auto">
          {projects.map((project, idx) => {
            const isHovered = hoveredCard === project.id;
            const isHero = project.isHero;

            // Aspect ratio sizing
            let aspectClass = "aspect-square";
            let widthClass = "w-60 sm:w-72 md:w-80";

            if (project.aspectRatio === "4:5") {
              aspectClass = "aspect-[4/5]";
              widthClass = "w-56 sm:w-64 md:w-72";
            } else if (project.aspectRatio === "16:9") {
              aspectClass = "aspect-[16/9]";
              widthClass = "w-64 sm:w-72 md:w-80";
            }

            // Magnetic repulsion translation on cards
            const cardRepelX = isInsideStage ? mousePos.x * (idx === 1 ? -12 : 14) : 0;
            const cardRepelY = isInsideStage ? mousePos.y * 12 : 0;
            const floatDuration = 5 + (idx % 3) * 1.2;

            return (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredCard(project.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`cascade-card group relative transition-all duration-500 ease-out cursor-pointer rounded-[24px] sm:rounded-[28px] p-3 sm:p-4 bg-neutral-900/95 border ${
                  isHero
                    ? "border-cyan-400/40 shadow-[0_20px_60px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/20"
                    : "border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                } hover:border-white/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.9)] backdrop-blur-md ${widthClass}`}
                style={{
                  zIndex: isHovered ? 50 : project.zIndex,
                  transform: `translate3d(${cardRepelX}px, ${
                    project.baseYOffset + cardRepelY + (isHovered ? -20 : 0)
                  }px, 0) rotate(${isHovered ? 0 : project.baseRotate}deg) scale(${
                    isHovered ? 1.06 : 1
                  })`,
                  animation: `sine-float-card ${floatDuration}s ease-in-out infinite alternate`,
                  animationDelay: `${idx * 0.3}s`,
                }}
              >
                {/* Media Aspect Window with static <img> */}
                <div
                  className={`w-full ${aspectClass} rounded-2xl overflow-hidden mb-3 bg-neutral-950 relative flex items-center justify-center border border-white/5`}
                >
                  <img
                    src={project.coverImage}
                    alt={project.promptTitle}
                    className={`w-full h-full ${
                      project.objectFit || "object-cover"
                    } group-hover:scale-105 transition-transform duration-700 ease-out`}
                    onError={(e) => {
                      // Visual fallback gracefully
                      const target = e.currentTarget;
                      target.style.display = "none";
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-800 to-neutral-950 text-neutral-400 text-center">
                            <span class="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 mb-1">Preview</span>
                            <span class="text-sm font-bold tracking-tight text-white">${project.promptTitle}</span>
                            <span class="text-[10px] font-mono text-neutral-500 mt-1">${project.aspectRatio}</span>
                          </div>
                        `;
                      }
                    }}
                  />

                  {/* Year Tag Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300">
                    {project.year}
                  </div>

                  {/* Featured Hero Indicator */}
                  {isHero && (
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-cyan-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-wider">
                        HERO
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Caption / Meta Bar */}
                <div className="flex justify-between items-center px-1 py-0.5">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                      {project.promptTitle}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono tracking-wide mt-0.5">
                      {project.promptCategory}
                    </p>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 group-hover:bg-cyan-400 group-hover:text-black group-hover:border-cyan-300 transition-all duration-300 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold leading-none transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sine-Wave Idle Floating Keyframes */}
      <style>{`
        @keyframes sine-float-badge {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        @keyframes sine-float-card {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, -6px, 0); }
        }
      `}</style>
    </section>
  );
}

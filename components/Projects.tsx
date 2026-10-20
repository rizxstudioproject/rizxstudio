"use client";

import React, { useState, useRef, useEffect } from "react";
import { antigravityData } from "@/data/projectsData";

export default function Projects() {
  const { headerPrompts, floatingBadges, projects } = antigravityData;
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeBadge, setActiveBadge] = useState<number | null>(null);

  // Smooth mouse tracking for repulsion physics & 3D tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Normalized -1 to 1 from container center
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setMousePos({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full overflow-hidden py-28 px-4 sm:px-6 lg:px-8 bg-[#F6F6F6] text-[#121212] select-none"
    >
      {/* 1. Pallet Ross Massive Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[20vw] font-black tracking-tighter text-black/[0.035] leading-none transform -translate-y-6">
          PORTFOLIO
        </h1>
      </div>

      {/* 2. Header & Prompt Metadata */}
      <div className="max-w-4xl mx-auto relative z-10 text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.2em] bg-black/[0.04] border border-black/10 text-neutral-600 shadow-sm">
            ✦ {headerPrompts.badge || "Antigravity Showcase"}
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#111111] leading-[1.08]">
          {headerPrompts.headline}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-neutral-500 font-normal mt-4 max-w-xl mx-auto leading-relaxed">
          {headerPrompts.subheadline}
        </p>
      </div>

      {/* 3. Interactive Stage Container (Pallet Ross Framed Canvas) */}
      <div className="relative max-w-6xl mx-auto min-h-[580px] sm:h-[600px] md:h-[640px] rounded-[36px] border border-black/[0.08] bg-white/70 backdrop-blur-xl shadow-[0_20px_70px_-20px_rgba(0,0,0,0.07)] overflow-hidden flex items-center justify-center p-6 sm:p-12">
        {/* Subtle grid pattern inside stage */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Floating Badges with Pallet Ross Physics Repulsion */}
        {floatingBadges.map((badge, idx) => {
          const isSelected = activeBadge === badge.id;
          // Calculate badge coordinates and repulsion response
          const positions = [
            { top: "14%", left: "10%" },
            { top: "20%", right: "12%" },
            { bottom: "16%", left: "14%" },
            { bottom: "18%", right: "10%" },
          ];
          const pos = positions[idx % positions.length];
          const repulsionFactor = (idx + 1) * 12;

          return (
            <div
              key={badge.id}
              onClick={() => setActiveBadge(isSelected ? null : badge.id)}
              className={`floating-pill absolute z-30 px-4 py-2 rounded-full text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 backdrop-blur-md shadow-md ${
                isSelected
                  ? "bg-black text-white shadow-xl scale-110"
                  : "bg-white/95 text-neutral-700 border border-black/10 hover:border-black/30 hover:scale-105 hover:shadow-lg"
              }`}
              style={{
                ...pos,
                transform: `translate3d(${mousePos.x * repulsionFactor}px, ${
                  mousePos.y * repulsionFactor
                }px, 0)`,
                animation: `gentle-drift ${4 + idx}s ease-in-out infinite alternate`,
                animationDelay: `${idx * 0.5}s`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] opacity-60">✦</span>
                <span>{badge.text}</span>
              </div>
            </div>
          );
        })}

        {/* 4. Pallet Ross Cards Trio (Overlapping, Tilted, Physics Stacking) */}
        <div className="cards-stage relative z-20 flex flex-wrap md:flex-nowrap justify-center items-center gap-6 sm:gap-8 my-auto">
          {projects.map((project, idx) => {
            const isCenterHero = project.aspectRatio === "1:1" || project.isHero;
            const isHovered = hoveredCard === project.id;

            // Dynamics: tilt angle and translation for the cards fan-out
            let baseRotate = 0;
            let baseYOffset = 0;
            let widthClass = "w-64 sm:w-72";

            if (project.aspectRatio === "4:5") {
              baseRotate = -7;
              baseYOffset = 16;
              widthClass = "w-60 sm:w-68";
            } else if (project.aspectRatio === "1:1") {
              baseRotate = 0;
              baseYOffset = -18;
              widthClass = "w-68 sm:w-80";
            } else {
              baseRotate = 7;
              baseYOffset = 20;
              widthClass = "w-64 sm:w-72";
            }

            // Repulsion tilt from mouse cursor
            const cardRepelX = mousePos.x * (idx === 1 ? -15 : 18);
            const cardRepelY = mousePos.y * 15;

            return (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredCard(project.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`pallet-card group relative transition-all duration-500 ease-out cursor-pointer rounded-3xl p-3.5 bg-white border border-black/[0.08] shadow-[0_15px_45px_-10px_rgba(0,0,0,0.12)] hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.22)] ${widthClass} ${
                  isCenterHero ? "z-20 border-black/20" : "z-10"
                }`}
                style={{
                  transform: `translate3d(${cardRepelX}px, ${
                    baseYOffset + cardRepelY
                  }px, 0) rotate(${isHovered ? 0 : baseRotate}deg) scale(${
                    isHovered ? 1.06 : 1
                  })`,
                  animation: `card-hover-drift ${5 + idx}s ease-in-out infinite alternate`,
                  animationDelay: `${idx * 0.4}s`,
                }}
              >
                {/* Media Aspect Window */}
                <div
                  className={`w-full rounded-2xl overflow-hidden mb-3.5 bg-[#EFEFEF] relative flex items-center justify-center transition-all ${
                    project.aspectRatio === "4:5"
                      ? "aspect-[4/5]"
                      : project.aspectRatio === "1:1"
                      ? "aspect-square"
                      : "aspect-video"
                  }`}
                >
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.04)]" />

                  <img
                    src={project.coverImage}
                    alt={project.promptTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center p-5 bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 text-neutral-800 text-center">
                            <span class="text-xs font-mono font-bold tracking-widest uppercase text-neutral-400 mb-1">Pallet Ross</span>
                            <span class="text-base font-bold tracking-tight text-neutral-900">${project.promptTitle}</span>
                            <span class="text-[11px] font-mono text-neutral-500 mt-1">${project.promptCategory} • ${project.aspectRatio}</span>
                          </div>
                        `;
                      }
                    }}
                  />

                  {/* Year Tag Pill */}
                  <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-[10px] font-mono font-semibold text-neutral-700 shadow-sm">
                    {project.year || "2026"}
                  </div>
                </div>

                {/* Card Caption / Meta Bar */}
                <div className="flex justify-between items-center px-1.5 py-1">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base tracking-tight text-[#111111] group-hover:text-black">
                      {project.promptTitle}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-medium tracking-wide">
                      {project.promptCategory}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-black group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm">
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

      {/* Physics & Drift Keyframes */}
      <style>{`
        @keyframes gentle-drift {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        @keyframes card-hover-drift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, -6px, 0); }
        }
      `}</style>
    </section>
  );
}

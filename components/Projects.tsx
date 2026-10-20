"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { antigravityData } from "@/data/projectsData";
import { HiArrowUpRight } from "react-icons/hi2";

export default function Projects() {
  const { headerPrompts, floatingBadges, projects } = antigravityData;
  const [pinnedBadge, setPinnedBadge] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle interactive parallax based on mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getAspectClass = (ratio: string) => {
    switch (ratio) {
      case "4:5":
        return "aspect-[4/5]";
      case "1:1":
        return "aspect-square";
      case "16:9":
        return "aspect-[16/9]";
      default:
        return "aspect-square";
    }
  };

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative py-28 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Background Ambient Gravity Wells */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.04] blur-[140px] pointer-events-none rounded-full transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * 40}px, 0)`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/[0.03] blur-[160px] pointer-events-none rounded-full transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -50}px, ${mousePos.y * -50}px, 0)`,
        }}
      />

      {/* 1. Header & Text Section */}
      <div className="flex flex-col mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 mb-3 self-start">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-white/[0.04] border border-white/10 text-cyan-300 backdrop-blur-md">
            ✦ {headerPrompts.badge}
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white mb-3">
          {headerPrompts.headline}
        </h2>
        <p className="text-sm sm:text-base md:text-lg font-light text-neutral-400 max-w-2xl leading-relaxed">
          {headerPrompts.subheadline}
        </p>
        <div className="w-16 h-px bg-gradient-to-r from-cyan-400/40 via-white/20 to-transparent mt-6" />
      </div>

      {/* 2. Interactive Floating Badges Zone */}
      <div className="relative mb-12 py-3 px-2 flex flex-wrap items-center gap-3 sm:gap-4 select-none">
        {floatingBadges.map((badge, idx) => {
          const isPinned = pinnedBadge === badge.id;
          const floatOffset = (idx % 3) * 2;
          const duration = 4 + (idx % 4);

          return (
            <button
              key={badge.id}
              onClick={() => setPinnedBadge(isPinned ? null : badge.id)}
              style={{
                animation: isPinned
                  ? "none"
                  : `float-badge ${duration}s ease-in-out infinite alternate`,
                animationDelay: `${idx * 0.4}s`,
                transform: `translate3d(${mousePos.x * (idx + 1) * 8}px, ${
                  mousePos.y * (idx + 1) * 8
                }px, 0)`,
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-mono tracking-wide transition-all duration-300 cursor-pointer backdrop-blur-md ${
                isPinned
                  ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/30 scale-105"
                  : "bg-white/[0.03] text-neutral-300 border border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <span>{badge.text}</span>
              <span className="text-[10px] text-neutral-500 opacity-60">
                {isPinned ? "📌" : "✦"}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Antigravity Cards Grid with 4:5, 1:1, and 16:9 Aspect Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {projects.map((proj, idx) => {
          const aspectClass = getAspectClass(proj.aspectRatio);
          // Hero cards get prominent spans
          const colSpan =
            proj.aspectRatio === "16:9"
              ? "lg:col-span-12"
              : proj.isHero
              ? "lg:col-span-6"
              : "lg:col-span-6";

          const floatSpeed = 6 + (idx % 3) * 2;
          const delay = idx * 0.7;

          return (
            <div
              key={proj.id}
              className={`${colSpan} group relative flex flex-col justify-between rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/25 hover:bg-white/[0.04] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]`}
              style={{
                animation: `antigravity-float ${floatSpeed}s ease-in-out infinite alternate`,
                animationDelay: `${delay}s`,
                transform: `translate3d(${mousePos.x * ((idx % 3) + 1) * 10}px, ${
                  mousePos.y * ((idx % 3) + 1) * 10
                }px, 0)`,
              }}
            >
              {/* Card Meta Top */}
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-5 text-neutral-400">
                <span className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-neutral-300">
                  {proj.promptCategory}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-mono text-[11px]">
                    [{proj.aspectRatio}]
                  </span>
                  <span className="text-neutral-500">{proj.year}</span>
                </div>
              </div>

              {/* Aspect Ratio Responsive Preview Window */}
              <div
                className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden mb-6 bg-gradient-to-br ${
                  proj.gradient || "from-blue-600/20 via-cyan-600/10 to-transparent"
                } border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all duration-500`}
              >
                {/* Fallback Artwork Display when static image is loading or custom */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] group-hover:bg-black/20 transition-colors" />

                <div className="relative z-10 flex flex-col items-center text-center p-6 gap-2">
                  <span className="text-xl sm:text-2xl font-light text-white tracking-wide group-hover:scale-105 transition-transform duration-300">
                    {proj.promptTitle}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                    {proj.promptCategory} — {proj.aspectRatio}
                  </span>
                </div>

                {/* Hero Badge Pin */}
                {proj.isHero && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-cyan-200 uppercase tracking-widest">
                      FEATURED
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-medium text-white mb-2 flex items-center justify-between">
                  <span>{proj.promptTitle}</span>
                  <a
                    href={proj.linkUrl}
                    className="p-2 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label={`Open ${proj.promptTitle}`}
                  >
                    <HiArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </h3>
                <p className="text-xs sm:text-sm font-light text-neutral-400 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Tags Stack */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                {proj.tags?.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/5 text-neutral-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Keyframes */}
      <style>{`
        @keyframes antigravity-float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-badge {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-5px); }
        }
      `}</style>
    </section>
  );
}

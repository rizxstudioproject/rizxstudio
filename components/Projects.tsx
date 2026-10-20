"use client";

import React from "react";
import { antigravityData } from "@/data/projectsData";

export default function Projects() {
  const { headerPrompts, floatingBadges, projects } = antigravityData;

  return (
    <section id="projects" className="relative w-full overflow-hidden py-24 px-4 bg-[#F8F8F8] text-[#121212]">
      {/* Background Watermark Text "PORTFOLIO" */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <h1 className="text-[18vw] font-black tracking-tighter">PORTFOLIO</h1>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 text-center mb-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
          {headerPrompts.headline}
        </h2>
        <p className="text-sm md:text-base opacity-60 mt-3">
          {headerPrompts.subheadline}
        </p>
      </div>

      <div className="relative w-full min-h-[540px] md:h-[540px] rounded-3xl border border-black/10 bg-white/50 backdrop-blur-md overflow-hidden flex items-center justify-center p-6 md:p-0">
        {/* Floating Badges */}
        {floatingBadges.map((badge, idx) => (
          <div
            key={badge.id}
            className="floating-pill hidden md:block absolute px-4 py-1.5 rounded-full text-xs font-semibold shadow-md bg-white border border-black/10 cursor-pointer hover:scale-110 transition-transform select-none z-30"
            style={{
              top: `${18 + idx * 16}%`,
              left: idx % 2 === 0 ? `${8 + idx * 7}%` : "auto",
              right: idx % 2 !== 0 ? `${8 + idx * 6}%` : "auto",
            }}
          >
            {badge.text}
          </div>
        ))}

        {/* Mobile Badges Row */}
        <div className="flex md:hidden flex-wrap justify-center gap-2 mb-6 absolute top-4 inset-x-4 z-30">
          {floatingBadges.map((badge) => (
            <span
              key={badge.id}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white border border-black/10 shadow-sm"
            >
              {badge.text}
            </span>
          ))}
        </div>

        {/* Render Image Cards */}
        <div className="cards-container relative z-20 flex flex-wrap md:flex-nowrap justify-center items-center gap-6 mt-10 md:mt-0">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`antigravity-card transition-all duration-300 transform hover:scale-105 cursor-pointer rounded-2xl p-3 bg-white shadow-xl border border-black/5 ${
                project.aspectRatio === "4:5"
                  ? "w-64 md:-rotate-6"
                  : project.aspectRatio === "1:1"
                  ? "w-72 md:-translate-y-4 border-black"
                  : "w-64 md:rotate-6"
              }`}
            >
              <div
                className={`w-full rounded-xl overflow-hidden mb-3 bg-neutral-100 flex items-center justify-center ${
                  project.aspectRatio === "4:5"
                    ? "aspect-[4/5]"
                    : project.aspectRatio === "1:1"
                    ? "aspect-square"
                    : "aspect-video"
                }`}
              >
                {/* Fallback pattern + Image */}
                <img
                  src={project.coverImage}
                  alt={project.promptTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visually pleasing preview if image file hasn't been uploaded yet
                    const target = e.currentTarget;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-600 text-center">
                          <span class="text-sm font-bold tracking-tight text-neutral-800">${project.promptTitle}</span>
                          <span class="text-[10px] uppercase font-mono mt-1 text-neutral-500">${project.promptCategory} • ${project.aspectRatio}</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-black">
                    {project.promptTitle}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-normal">
                    {project.promptCategory}
                  </p>
                </div>
                <span className="text-xs font-bold bg-gray-100 text-black p-1.5 rounded-full leading-none flex items-center justify-center w-6 h-6">
                  ↗
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

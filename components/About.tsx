"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import { HiSparkles, HiCpuChip, HiGlobeAmericas, HiCheckBadge } from "react-icons/hi2";

export default function About() {
  return (
    <section id="about" className="relative py-28 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500 mb-2">
          ## WHO AM I
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white">
          About Me<span className="text-neutral-500 font-normal">.</span>
        </h2>
        <div className="w-12 h-px bg-white/20 mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Narrative Card - 8 cols */}
        <SpotlightCard className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-6 text-neutral-300 font-light leading-relaxed text-base sm:text-lg">
            <p className="text-white text-lg sm:text-2xl font-light leading-relaxed">
              I am an <strong className="text-white font-semibold">AI-Powered Creative Designer</strong> with over 10 years of experience transforming ideas into compelling visual experiences, high-performing digital campaigns, and meaningful brand identities.
            </p>

            <p className="text-neutral-400">
              Currently, I collaborate with global creative teams to produce AI-assisted social media advertising and scalable visual content for international markets. My approach combines strategic thinking, design craftsmanship, and emerging AI technologies to create work that is both visually distinctive and commercially effective.
            </p>

            <p className="text-neutral-400">
              From branding and UI/UX to motion graphics and performance-driven advertising, I focus on connecting creativity with measurable impact. I believe great design goes beyond aesthetics — it captures attention, communicates purpose, and inspires action.
            </p>

            <p className="text-neutral-400">
              By integrating human creativity with intelligent production workflows, I help brands move faster, maintain visual consistency, and deliver engaging digital experiences at scale.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
            <div>
              <span className="text-white block font-medium text-xl sm:text-2xl">10+</span>
              <span className="text-neutral-500 uppercase tracking-wider">Years Exp.</span>
            </div>
            <div>
              <span className="text-white block font-medium text-xl sm:text-2xl">Global</span>
              <span className="text-neutral-500 uppercase tracking-wider">Market Reach</span>
            </div>
            <div>
              <span className="text-white block font-medium text-xl sm:text-2xl">AI-Native</span>
              <span className="text-neutral-500 uppercase tracking-wider">Workflows</span>
            </div>
            <div>
              <span className="text-white block font-medium text-xl sm:text-2xl">360°</span>
              <span className="text-neutral-500 uppercase tracking-wider">Campaigns</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Sidebar Cards - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SpotlightCard className="p-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-amber-300 mb-5">
              <HiSparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-light text-white mb-2">Core Philosophy</h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              Great design goes beyond aesthetics — it captures attention, communicates purpose, and inspires action.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400 mb-5">
              <HiGlobeAmericas className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-light text-white mb-2">Global Collaboration</h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              Producing scalable visual content, high-performing ads, and campaign assets for international brands and agencies.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400 mb-5">
              <HiCheckBadge className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-light text-white mb-2">Disciplines</h3>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["AI Advertising", "Branding", "UI/UX", "Motion Graphics", "Video Production", "Vibe Coding"].map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-mono text-neutral-300 hover:border-emerald-400/30 hover:text-white transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

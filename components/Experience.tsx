"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import {
  SiFramer,
  SiTailwindcss,
  SiReact,
} from "react-icons/si";
import {
  HiBriefcase,
  HiSparkles,
  HiPaintBrush,
  HiVideoCamera,
} from "react-icons/hi2";

interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  highlights: string[];
  skills: { name: string; icon: React.ReactNode }[];
}

const EXPERIENCES: ExperienceItem[] = [
  {
    period: "2021 — PRESENT",
    role: "Principal AI Creative Director",
    company: "Neural Studio Labs",
    location: "Global / Remote",
    description:
      "Directing AI-powered advertising campaigns, generative visual identities, and cinematic commercial video production for international enterprise brands.",
    highlights: [
      "Engineered end-to-end AI creative production workflows resulting in a 4x acceleration in campaign turnaround and 38% lift in conversion metrics.",
      "Spearheaded multi-channel visual branding across web, digital out-of-home, and interactive 3D media.",
      "Mentored cross-functional teams of art directors, 3D artists, and motion designers in generative AI prompting, LoRA fine-tuning, and motion synthesis.",
    ],
    skills: [
      { name: "AI Advertising", icon: <HiSparkles className="w-3.5 h-3.5 text-amber-300" /> },
      { name: "Motion & Video", icon: <HiVideoCamera className="w-3.5 h-3.5 text-purple-400" /> },
      { name: "Branding", icon: <HiPaintBrush className="w-3.5 h-3.5 text-pink-400" /> },
      { name: "UI/UX", icon: <SiFramer className="w-3.5 h-3.5 text-cyan-400" /> },
    ],
  },
  {
    period: "2017 — 2021",
    role: "Senior Visual & Motion Designer",
    company: "Aura Creative Agency",
    location: "San Francisco / Hybrid",
    description:
      "Crafted high-fidelity graphic design systems, bespoke brand packaging, and kinetic motion storytelling for premier consumer tech launches.",
    highlights: [
      "Delivered 30+ comprehensive brand identities and motion design systems for Series A to pre-IPO startups.",
      "Directed short-form video commercials and 3D product animations featured across global advertising channels.",
      "Established unified design token standards bridging Figma design systems with interactive web prototypes.",
    ],
    skills: [
      { name: "Brand Identity", icon: <HiPaintBrush className="w-3.5 h-3.5 text-pink-400" /> },
      { name: "Motion Graphics", icon: <HiVideoCamera className="w-3.5 h-3.5 text-purple-400" /> },
      { name: "Graphic Design", icon: <HiBriefcase className="w-3.5 h-3.5 text-indigo-400" /> },
      { name: "UI/UX", icon: <SiTailwindcss className="w-3.5 h-3.5 text-teal-400" /> },
    ],
  },
  {
    period: "2014 — 2017",
    role: "UI/UX & Graphic Designer",
    company: "Kinetic Interactive",
    location: "Jakarta / Remote",
    description:
      "Designed responsive digital products, web experiences, and visual marketing assets focused on user retention and organic engagement.",
    highlights: [
      "Designed intuitive web and mobile interfaces reaching millions of daily active users.",
      "Produced print, digital advertising collateral, and editorial layouts maintaining strict brand consistency.",
    ],
    skills: [
      { name: "UI/UX Architecture", icon: <SiReact className="w-3.5 h-3.5 text-cyan-300" /> },
      { name: "Visual Design", icon: <HiPaintBrush className="w-3.5 h-3.5 text-pink-400" /> },
      { name: "Typography", icon: <HiBriefcase className="w-3.5 h-3.5 text-amber-300" /> },
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-28 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          02 / Experience
        </span>
        <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
          Journey &amp; Milestones
        </h2>
        <div className="w-12 h-px bg-white/20 mt-4" />
      </div>

      <div className="flex flex-col gap-6">
        {EXPERIENCES.map((exp, idx) => (
          <SpotlightCard key={idx} className="p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
                  <HiBriefcase className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{exp.company}</span>
                  <span>•</span>
                  <span>{exp.location}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                  {exp.role}
                </h3>
              </div>

              <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-mono tracking-widest text-neutral-400 bg-white/[0.03] border border-white/5">
                {exp.period}
              </span>
            </div>

            <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed mb-6">
              {exp.description}
            </p>

            <ul className="space-y-2 mb-8">
              {exp.highlights.map((highlight, hIdx) => (
                <li
                  key={hIdx}
                  className="flex items-start gap-3 text-xs sm:text-sm text-neutral-400 font-light"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider mr-2">
                Specialties:
              </span>
              {exp.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-xs text-neutral-300"
                >
                  {skill.icon}
                  <span>{skill.name}</span>
                </span>
              ))}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}

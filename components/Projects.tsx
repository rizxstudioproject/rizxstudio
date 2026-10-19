"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import {
  SiFramer,
  SiTailwindcss,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import { FaGithub } from "react-icons/fa6";
import {
  HiArrowUpRight,
  HiSparkles,
  HiPaintBrush,
  HiVideoCamera,
  HiCubeTransparent,
} from "react-icons/hi2";

interface Project {
  name: string;
  formattedText: string;
  category: string;
  year: string;
  demoUrl: string;
  repoUrl: string;
  gradient: string;
  tags: { name: string; icon: React.ReactNode }[];
}

const PROJECTS: Project[] = [
  {
    name: "Lumina AI Advertising",
    formattedText:
      "[Lumina AI Advertising]: High-impact multimodal advertising campaign combining generative diffusion models with dynamic personalized video synthesis for global retail brands. Directed the visual concept, AI workflow pipeline, and motion design as Lead Creative Designer.",
    category: "AI Advertising / Generative Video",
    year: "2024",
    demoUrl: "https://lumina-ad.demo",
    repoUrl: "https://github.com",
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    tags: [
      { name: "AI Advertising", icon: <HiSparkles className="w-3.5 h-3.5 text-amber-300" /> },
      { name: "Video Production", icon: <HiVideoCamera className="w-3.5 h-3.5 text-purple-400" /> },
      { name: "Motion Graphics", icon: <SiFramer className="w-3.5 h-3.5 text-pink-400" /> },
      { name: "Creative Direction", icon: <HiPaintBrush className="w-3.5 h-3.5 text-blue-400" /> },
    ],
  },
  {
    name: "NeuroBrand Architecture",
    formattedText:
      "[NeuroBrand Architecture]: Dynamic brand identity system and generative vector asset suite for next-generation AI enterprise platforms. Crafted the comprehensive visual language, design tokens, and motion guidelines as Principal Brand Designer.",
    category: "Branding / Graphic Design",
    year: "2024",
    demoUrl: "https://neurobrand.demo",
    repoUrl: "https://github.com",
    gradient: "from-purple-600/20 via-pink-600/10 to-transparent",
    tags: [
      { name: "Brand Identity", icon: <HiPaintBrush className="w-3.5 h-3.5 text-pink-400" /> },
      { name: "Design System", icon: <HiCubeTransparent className="w-3.5 h-3.5 text-cyan-300" /> },
      { name: "Typography", icon: <SiReact className="w-3.5 h-3.5 text-white" /> },
      { name: "Visual Identity", icon: <HiSparkles className="w-3.5 h-3.5 text-amber-300" /> },
    ],
  },
  {
    name: "Aether Spatial UI/UX",
    formattedText:
      "[Aether Spatial UI/UX]: Ultra-minimalist spatial interface and gesture-driven design system for next-gen interactive display surfaces. Led user experience architecture, cinematic prototypes, and tactile micro-interactions as Senior UI/UX Designer.",
    category: "UI/UX / Interaction Design",
    year: "2023",
    demoUrl: "https://aether-ui.demo",
    repoUrl: "https://github.com",
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    tags: [
      { name: "UI/UX Architecture", icon: <HiCubeTransparent className="w-3.5 h-3.5 text-emerald-400" /> },
      { name: "Framer Motion", icon: <SiFramer className="w-3.5 h-3.5 text-pink-400" /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className="w-3.5 h-3.5 text-cyan-400" /> },
      { name: "Prototyping", icon: <SiTypescript className="w-3.5 h-3.5 text-blue-400" /> },
    ],
  },
  {
    name: "Vortex Generative Motion",
    formattedText:
      "[Vortex Generative Motion]: AI-assisted commercial motion graphics and cinematic 3D trailer production pipeline for experiential product reveals. Produced and directed creative storytelling, neural grading, and sound-reactive motion sequences.",
    category: "Motion Graphics / Video Production",
    year: "2023",
    demoUrl: "https://vortex-motion.demo",
    repoUrl: "https://github.com",
    gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
    tags: [
      { name: "Motion Graphics", icon: <HiVideoCamera className="w-3.5 h-3.5 text-amber-400" /> },
      { name: "AI Video", icon: <HiSparkles className="w-3.5 h-3.5 text-purple-400" /> },
      { name: "Post-Production", icon: <HiPaintBrush className="w-3.5 h-3.5 text-pink-400" /> },
      { name: "3D Animation", icon: <HiCubeTransparent className="w-3.5 h-3.5 text-cyan-300" /> },
    ],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="relative py-28 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          03 / Selected Works
        </span>
        <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
          Case Studies &amp; Productions
        </h2>
        <div className="w-12 h-px bg-white/20 mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PROJECTS.map((project, idx) => (
          <SpotlightCard key={idx} className="p-8 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider mb-6">
                <span className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
                  {project.category}
                </span>
                <span className="text-neutral-500">{project.year}</span>
              </div>

              {/* Graphical Preview Panel */}
              <div
                className={`relative w-full h-48 rounded-xl overflow-hidden mb-6 bg-gradient-to-br ${project.gradient} border border-white/5 flex items-center justify-center`}
              >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-lg font-light text-white tracking-wider">
                    {project.name}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                    Production Showcase
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
                  <span className="text-[10px] font-mono text-neutral-400">FEATURED</span>
                </div>
              </div>

              {/* Formatted project text as requested */}
              <div className="mb-6">
                <p className="text-sm sm:text-base font-light text-neutral-300 leading-relaxed">
                  <span className="text-white font-medium">[{project.name}]:</span>{" "}
                  {project.formattedText.replace(`[${project.name}]: `, "")}
                </p>
              </div>
            </div>

            <div>
              {/* Tech Stack Pills with react-icons */}
              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5 mb-6">
                {project.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-xs text-neutral-300"
                  >
                    {tag.icon}
                    <span>{tag.name}</span>
                  </span>
                ))}
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:text-neutral-200 transition-colors group/link"
                >
                  <span>View Case Study</span>
                  <HiArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                </a>
                <span className="text-neutral-600">•</span>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  <FaGithub className="w-3.5 h-3.5" />
                  <span>Project Assets</span>
                </a>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}

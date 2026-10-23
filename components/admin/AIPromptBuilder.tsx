"use client";

import React, { useState } from "react";
import { HiSparkles, HiClipboardDocument, HiCheck } from "react-icons/hi2";

export default function AIPromptBuilder() {
  const [subject, setSubject] = useState("Electric concept vehicle in ultra-modern architectural pavilion");
  const [style, setStyle] = useState("Cinematic commercial photography, volumetric lighting, titanium highlights, reflections");
  const [aspect, setAspect] = useState("--ar 16:9");
  const [version, setVersion] = useState("--v 6.1");
  const [stylize, setStylize] = useState("--stylize 250");
  const [copied, setCopied] = useState(false);

  const fullPrompt = `${subject.trim()}, ${style.trim()} ${aspect} ${version} ${stylize}`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    {
      name: "Automotive Commercial",
      sub: "Sleek aerodynamic concept car with moody studio lighting",
      style: "Dramatic automotive commercial lighting, rim lights, high dynamic range, Hasselblad medium format 80mm",
      aspect: "--ar 16:9",
    },
    {
      name: "Luxury Brand Showcase",
      sub: "Minimalist aesthetic cosmetic or luxury timepiece",
      style: "Clean Scandinavian brutalist podium, soft diffused lighting, marble textures, hyper-detailed",
      aspect: "--ar 4:5",
    },
    {
      name: "Cyberpunk Digital Art",
      sub: "Futuristic neon cityscape with holographic displays",
      style: "Anamorphic lens flares, wet reflective asphalt, teal and magenta grade, octane render",
      aspect: "--ar 16:9",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#0d0f13]">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-[#14AF9E]/15 border border-[#14AF9E]/30 flex items-center justify-center text-[#14AF9E]">
          <HiSparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            AI Prompt Builder
          </h1>
          <p className="text-xs text-neutral-400">
            Craft tailored prompts for Midjourney, Magnific AI, Flux, and creative production workflows.
          </p>
        </div>
      </div>

      {/* Preset Launchpad */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-300">Quick Presets</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setSubject(p.sub);
                setStyle(p.style);
                setAspect(p.aspect);
              }}
              className="p-3.5 rounded-xl bg-[#111419] hover:bg-[#161a22] border border-white/5 hover:border-[#14AF9E]/40 text-left transition-all cursor-pointer group"
            >
              <p className="text-xs font-bold text-white group-hover:text-[#14AF9E] transition-colors">
                {p.name}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                {p.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Subject & Scene Description
          </label>
          <textarea
            rows={3}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-[#161a22] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E]/60 transition-colors leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Lighting, Camera & Aesthetic Style
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full bg-[#161a22] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E]/60 transition-colors"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Aspect Ratio
            </label>
            <select
              value={aspect}
              onChange={(e) => setAspect(e.target.value)}
              className="w-full bg-[#161a22] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              <option value="--ar 16:9">--ar 16:9 (Landscape)</option>
              <option value="--ar 4:5">--ar 4:5 (Social Feed)</option>
              <option value="--ar 9:16">--ar 9:16 (Story / Reel)</option>
              <option value="--ar 1:1">--ar 1:1 (Square)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Engine Version
            </label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-[#161a22] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              <option value="--v 6.1">--v 6.1</option>
              <option value="--v 6.0">--v 6.0</option>
              <option value="--v 5.2">--v 5.2</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Stylization
            </label>
            <select
              value={stylize}
              onChange={(e) => setStylize(e.target.value)}
              className="w-full bg-[#161a22] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              <option value="--stylize 100">--stylize 100 (Subtle)</option>
              <option value="--stylize 250">--stylize 250 (Balanced)</option>
              <option value="--stylize 750">--stylize 750 (High Artistic)</option>
            </select>
          </div>
        </div>

        {/* Generated Output Box */}
        <div className="pt-2">
          <div className="p-4 rounded-xl bg-[#090b0e] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono text-[#14AF9E]">Generated Prompt:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#14AF9E] text-black font-semibold text-xs hover:bg-[#119889] transition-all cursor-pointer"
              >
                {copied ? <HiCheck className="w-3.5 h-3.5" /> : <HiClipboardDocument className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Prompt"}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-neutral-200 select-all leading-relaxed">
              {fullPrompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

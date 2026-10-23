"use client";

import React from "react";
import { HiBookOpen, HiSwatch, HiCheck } from "react-icons/hi2";

export default function BrandGuidelines() {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colors = [
    { name: "Primary Studio Teal", hex: "#14AF9E", role: "Brand accent, CTAs, active highlights" },
    { name: "Deep Charcoal", hex: "#08090a", role: "Outer canvas background, left sidebar" },
    { name: "Container Dark", hex: "#111419", role: "Card background, panels, workspace surface" },
    { name: "Border Subtle", hex: "#1e2229", role: "Subtle card dividers and input borders" },
    { name: "Emerald Success", hex: "#10b981", role: "Active status dots, positive indicators" },
    { name: "Cyan Accent", hex: "#06b6d4", role: "Secondary highlights, badge tags" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#0d0f13]">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <HiBookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Brand Guidelines & Design Tokens
          </h1>
          <p className="text-xs text-neutral-400">
            Aesthetic standards, color palette, typography, and visual assets for Rizx Studio.
          </p>
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <HiSwatch className="w-4 h-4 text-[#14AF9E]" />
          <span>Core Color Palette</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {colors.map((c) => (
            <div
              key={c.hex}
              onClick={() => copyHex(c.hex)}
              className="p-3.5 rounded-xl bg-[#111419] border border-white/5 hover:border-white/20 transition-all cursor-pointer group space-y-2"
            >
              <div
                className="w-full h-12 rounded-lg border border-white/10 shadow-inner flex items-center justify-center"
                style={{ backgroundColor: c.hex }}
              >
                {copiedColor === c.hex && (
                  <span className="text-[10px] font-bold text-black bg-white/90 px-2 py-0.5 rounded shadow">
                    Copied!
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-[#14AF9E] transition-colors">
                  {c.name}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                  {c.hex}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                  {c.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography & Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Typography Specifications</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-neutral-400 block text-[10px]">Primary Sans</span>
              <p className="font-semibold text-white text-sm mt-0.5">Inter / Geist Sans</p>
              <p className="text-neutral-500 text-[10px] mt-0.5">Used for headlines, body text, and interfaces.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-neutral-400 block text-[10px]">Technical Monospace</span>
              <p className="font-mono font-semibold text-cyan-300 text-sm mt-0.5">JetBrains Mono / Courier</p>
              <p className="text-neutral-500 text-[10px] mt-0.5">Used for timestamps, badges, metrics, and parameters.</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Logo & Signature Mark</h3>
          <div className="p-4 rounded-xl bg-black border border-white/5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#14AF9E] text-black font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#14AF9E]/30">
              R
            </div>
            <div>
              <p className="text-base font-bold text-white tracking-tight">Rizx Studio</p>
              <p className="text-xs text-neutral-400">Creative Production & Direction</p>
              <span className="inline-block mt-2 text-[10px] font-mono text-[#14AF9E]">
                SVG & Vector Format Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

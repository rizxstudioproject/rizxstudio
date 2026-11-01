"use client";

import React, { useState, useMemo } from "react";
import { HiMagnifyingGlass, HiCheck } from "react-icons/hi2";

export interface AspectPreset {
  id: string;
  ratio: string;
  name: string;
  category: "ratios" | "social" | "video" | "print" | "wallpaper";
  description: string;
  width?: number;
  height?: number;
}

export const ALL_ASPECT_PRESETS: AspectPreset[] = [
  // ── RATIOS ─────────────────────────────────────────────────────────────
  { id: "auto", ratio: "original", name: "Auto", category: "ratios", description: "The model picks the best aspect ratio" },
  { id: "16:9", ratio: "16:9", name: "16:9", category: "ratios", description: "Widescreen", width: 1920, height: 1080 },
  { id: "9:16", ratio: "9:16", name: "9:16", category: "ratios", description: "Social story", width: 1080, height: 1920 },
  { id: "21:9", ratio: "21:9", name: "21:9", category: "ratios", description: "Ultrawide", width: 2560, height: 1080 },
  { id: "3:4", ratio: "3:4", name: "3:4", category: "ratios", description: "Traditional", width: 1200, height: 1600 },
  { id: "1:1", ratio: "1:1", name: "1:1", category: "ratios", description: "Square", width: 1080, height: 1080 },
  { id: "4:5", ratio: "4:5", name: "4:5", category: "ratios", description: "Social post", width: 1080, height: 1350 },
  { id: "5:4", ratio: "5:4", name: "5:4", category: "ratios", description: "Landscape", width: 1500, height: 1200 },
  { id: "4:3", ratio: "4:3", name: "4:3", category: "ratios", description: "Classic", width: 1440, height: 1080 },
  { id: "2:3", ratio: "2:3", name: "2:3", category: "ratios", description: "Portrait", width: 1080, height: 1620 },
  { id: "3:2", ratio: "3:2", name: "3:2", category: "ratios", description: "Standard", width: 1620, height: 1080 },
  { id: "10:16", ratio: "10:16", name: "10:16", category: "ratios", description: "Portrait", width: 1000, height: 1600 },
  { id: "16:10", ratio: "16:10", name: "16:10", category: "ratios", description: "Landscape", width: 1920, height: 1200 },
  { id: "1:2", ratio: "1:2", name: "1:2", category: "ratios", description: "Vertical", width: 800, height: 1600 },
  { id: "2:1", ratio: "2:1", name: "2:1", category: "ratios", description: "Horizontal", width: 1600, height: 800 },

  // ── SOCIAL ─────────────────────────────────────────────────────────────
  { id: "social-ig-post", ratio: "1:1", name: "Instagram post", category: "social", description: "1080 × 1080 px · 1:1", width: 1080, height: 1080 },
  { id: "social-ig-portrait", ratio: "4:5", name: "Instagram portrait", category: "social", description: "1080 × 1350 px · 4:5", width: 1080, height: 1350 },
  { id: "social-story", ratio: "9:16", name: "Story / Reel / TikTok", category: "social", description: "1080 × 1920 px · 9:16", width: 1080, height: 1920 },
  { id: "social-x-post", ratio: "16:9", name: "X post", category: "social", description: "1200 × 675 px · 16:9", width: 1200, height: 675 },
  { id: "social-link-prev", ratio: "2:1", name: "Link preview", category: "social", description: "1200 × 630 px · 2:1", width: 1200, height: 630 },
  { id: "social-yt-thumb", ratio: "16:9", name: "YouTube thumbnail", category: "social", description: "1280 × 720 px · 16:9", width: 1280, height: 720 },
  { id: "social-profile", ratio: "1:1", name: "Profile picture", category: "social", description: "1080 × 1080 px · 1:1", width: 1080, height: 1080 },
  { id: "social-fb-cover", ratio: "21:9", name: "Facebook cover", category: "social", description: "1640 × 624 px · 21:9", width: 1640, height: 624 },
  { id: "social-x-header", ratio: "3:1", name: "X header", category: "social", description: "1500 × 500 px · 3:1", width: 1500, height: 500 },
  { id: "social-yt-banner", ratio: "16:9", name: "YouTube banner", category: "social", description: "2560 × 1440 px · 16:9", width: 2560, height: 1440 },

  // ── VIDEO ──────────────────────────────────────────────────────────────
  { id: "video-1080p", ratio: "16:9", name: "1080p FHD", category: "video", description: "1920 × 1080 px · 16:9", width: 1920, height: 1080 },
  { id: "video-4k", ratio: "16:9", name: "4K UHD", category: "video", description: "3840 × 2160 px · 16:9", width: 3840, height: 2160 },
  { id: "video-720p", ratio: "16:9", name: "720p HD", category: "video", description: "1280 × 720 px · 16:9", width: 1280, height: 720 },

  // ── PRINT ──────────────────────────────────────────────────────────────
  { id: "print-a5", ratio: "3:4", name: "A5", category: "print", description: "148 × 210 mm · 300 DPI · 3:4", width: 1748, height: 2480 },
  { id: "print-a4", ratio: "3:4", name: "A4", category: "print", description: "210 × 297 mm · 300 DPI · 3:4", width: 2480, height: 3508 },
  { id: "print-a3", ratio: "3:4", name: "A3", category: "print", description: "297 × 420 mm · 300 DPI · 3:4", width: 3508, height: 4960 },
  { id: "print-letter", ratio: "3:4", name: "Letter", category: "print", description: "8.5 × 11 in · 300 DPI · 3:4", width: 2550, height: 3300 },
  { id: "print-4x6", ratio: "2:3", name: "4×6 in", category: "print", description: "4 × 6 in · 300 DPI · 2:3", width: 1200, height: 1800 },
  { id: "print-5x7", ratio: "3:4", name: "5×7 in", category: "print", description: "5 × 7 in · 300 DPI · 3:4", width: 1500, height: 2100 },
  { id: "print-8x10", ratio: "4:5", name: "8×10 in", category: "print", description: "8 × 10 in · 300 DPI · 4:5", width: 2400, height: 3000 },
  { id: "print-business", ratio: "3:2", name: "Business card", category: "print", description: "85 × 55 mm · 300 DPI · 3:2", width: 1004, height: 650 },

  // ── WALLPAPER ──────────────────────────────────────────────────────────
  { id: "wall-desk-16-10", ratio: "8:5", name: "Desktop 16:10", category: "wallpaper", description: "1920 × 1200 px · 8:5", width: 1920, height: 1200 },
  { id: "wall-desk-16-9", ratio: "16:9", name: "Desktop 16:9", category: "wallpaper", description: "1920 × 1080 px · 16:9", width: 1920, height: 1080 },
  { id: "wall-phone", ratio: "9:19.5", name: "Phone 9:19.5", category: "wallpaper", description: "1080 × 2340 px · 6:13", width: 1080, height: 2340 },
  { id: "wall-tablet", ratio: "3:4", name: "Tablet 3:4", category: "wallpaper", description: "2048 × 2732 px · 3:4", width: 2048, height: 2732 },
];

export function RatioWireframeIcon({ ratio, className = "text-neutral-400" }: { ratio: string; className?: string }) {
  switch (ratio) {
    case "16:9":
    case "video":
      return <div className={`w-5 h-3 border border-current rounded-xs shrink-0 ${className}`} />;
    case "9:16":
    case "social-story":
      return <div className={`w-2.5 h-4.5 border border-current rounded-xs shrink-0 ${className}`} />;
    case "21:9":
    case "3:1":
      return <div className={`w-6 h-2 border border-current rounded-xs shrink-0 ${className}`} />;
    case "1:1":
      return <div className={`w-4 h-4 border border-current rounded-xs shrink-0 ${className}`} />;
    case "4:5":
    case "3:4":
    case "10:16":
    case "2:3":
      return <div className={`w-3.5 h-4.5 border border-current rounded-xs shrink-0 ${className}`} />;
    case "5:4":
    case "4:3":
    case "3:2":
    case "16:10":
    case "8:5":
      return <div className={`w-4.5 h-3.5 border border-current rounded-xs shrink-0 ${className}`} />;
    case "1:2":
      return <div className={`w-2 h-4.5 border border-current rounded-xs shrink-0 ${className}`} />;
    case "2:1":
      return <div className={`w-5 h-2.5 border border-current rounded-xs shrink-0 ${className}`} />;
    case "auto":
    case "original":
      return (
        <div className={`relative w-4 h-4 shrink-0 ${className}`}>
          <div className="absolute inset-0 border border-current rounded-xs" />
          <div className="absolute inset-0.5 border border-current border-dashed opacity-50" />
        </div>
      );
    default:
      return <div className={`w-4 h-3.5 border border-current rounded-xs shrink-0 ${className}`} />;
  }
}

interface AspectRatioPickerProps {
  value: string;
  onChange: (ratio: string, preset?: AspectPreset) => void;
  isLight?: boolean;
  onClose?: () => void;
  className?: string;
  maxHeight?: string;
}

export default function AspectRatioPicker({
  value,
  onChange,
  isLight = false,
  onClose,
  className = "",
  maxHeight = "360px",
}: AspectRatioPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "ratios", label: "Ratios" },
    { id: "social", label: "Social" },
    { id: "video", label: "Video" },
    { id: "print", label: "Print" },
    { id: "wallpaper", label: "Wallpaper" },
  ];

  const filteredPresets = useMemo(() => {
    let list = ALL_ASPECT_PRESETS;
    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ratio.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  // Group presets by category for headings
  const groupedPresets = useMemo(() => {
    const groups: { [key: string]: AspectPreset[] } = {};
    filteredPresets.forEach((p) => {
      const cat = p.category.toUpperCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filteredPresets]);

  return (
    <div
      className={`flex flex-col rounded-2xl border shadow-2xl overflow-hidden font-sans select-none ${
        isLight
          ? "bg-white border-slate-200 text-slate-800 shadow-slate-300/60"
          : "bg-[#181a20] border-white/10 text-white shadow-black/80"
      } ${className}`}
    >
      {/* ── Search Bar (Screenshot 4) ────────────────────────────────────────── */}
      <div className="p-2.5 pb-2 border-b border-white/10">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            isLight
              ? "bg-slate-100 border-slate-200 text-slate-800 focus-within:border-teal-500"
              : "bg-black/50 border-white/10 text-white focus-within:border-[#0c8ce9]"
          }`}
        >
          <HiMagnifyingGlass className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search size"
            className="w-full bg-transparent border-none outline-none text-xs placeholder:text-neutral-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-neutral-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Filter Pills (All, Ratios, Social, Video, Print, Wallpaper) ─────── */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
          {categories.map((c) => {
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? isLight
                      ? "bg-slate-800 text-white shadow-xs"
                      : "bg-[#2c2d33] text-white shadow-xs"
                    : isLight
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable Presets List ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-3" style={{ maxHeight }}>
        {Object.keys(groupedPresets).length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-400">
            Tidak ada ukuran yang cocok dengan "{searchQuery}"
          </div>
        ) : (
          Object.entries(groupedPresets).map(([catName, list]) => (
            <div key={catName} className="space-y-0.5">
              {/* Category Header (e.g. ⌄ SOCIAL, ⌄ VIDEO, ⌄ PRINT) */}
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                <span>⌄</span>
                <span>{catName}</span>
              </div>

              {list.map((preset) => {
                const isSelected =
                  value === preset.ratio ||
                  value === preset.id ||
                  (preset.category === "ratios" && value === preset.name);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onChange(preset.ratio, preset);
                      onClose?.();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? isLight
                          ? "bg-slate-100 text-slate-950 font-bold"
                          : "bg-white/10 text-white font-bold"
                        : isLight
                        ? "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                        : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <RatioWireframeIcon
                        ratio={preset.ratio}
                        className={isSelected ? (isLight ? "text-slate-900" : "text-white") : "text-neutral-400 group-hover:text-neutral-200"}
                      />
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-xs mr-2">{preset.name}</span>
                        <span className={`text-[11px] truncate ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                          {preset.description}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <HiCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { HiCircleStack, HiPhoto, HiTrash, HiCheckCircle, HiArrowPath } from "react-icons/hi2";
import { ClientItem } from "@/context/PortfolioDataContext";

interface ResourceLibraryProps {
  clients: ClientItem[];
  showToast: (msg: string) => void;
}

export default function ResourceLibrary({ clients, showToast }: ResourceLibraryProps) {
  const [filterType, setFilterType] = useState<"all" | "clients" | "frames">("all");

  const allWorkImages = clients.flatMap((c) =>
    (c.works || []).map((w) => ({
      id: w.id,
      title: w.title,
      clientName: c.clientName,
      image: w.image,
      aspect: w.aspect || "4:5",
      type: "work",
    }))
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#0d0f13]">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HiCircleStack className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Resource Library & Storage Explorer
            </h1>
            <p className="text-xs text-neutral-400">
              Manage uploaded visual assets, scrollytelling frames, and IndexedDB storage.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-2">
          <span className="text-[11px] text-neutral-400">Total Studio Quota</span>
          <p className="text-2xl font-bold text-white">18.4 <span className="text-sm font-normal text-neutral-400">/ 100 GB</span></p>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#14AF9E] rounded-full w-[18.4%]" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-2">
          <span className="text-[11px] text-neutral-400">Client Works Images</span>
          <p className="text-2xl font-bold text-white">{allWorkImages.length} <span className="text-sm font-normal text-neutral-400">assets</span></p>
          <p className="text-[10px] text-neutral-500">Auto-compressed WebP & Canvas storage</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-2">
          <span className="text-[11px] text-neutral-400">Hero Sequence Cache</span>
          <p className="text-2xl font-bold text-white">121 <span className="text-sm font-normal text-neutral-400">frames</span></p>
          <p className="text-[10px] text-emerald-400">IndexedDB persistent storage active</p>
        </div>
      </div>

      {/* Media Grid */}
      <div className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">
            Client Visual Assets ({allWorkImages.length})
          </h3>
          <span className="text-[11px] font-mono text-[#14AF9E]">
            Indexed & Public Live
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {allWorkImages.slice(0, 24).map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-black border border-white/5"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                <p className="text-[9px] font-mono text-cyan-400 uppercase truncate">
                  {item.clientName}
                </p>
                <p className="text-[10px] font-bold text-white truncate">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

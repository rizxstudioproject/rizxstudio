"use client";

import React from "react";
import {
  HiSquares2X2,
  HiFolder,
  HiPhoto,
  HiSparkles,
  HiCloudArrowUp,
  HiArrowTopRightOnSquare,
  HiCheckCircle,
  HiCpuChip,
} from "react-icons/hi2";
import { ClientItem } from "@/context/PortfolioDataContext";

interface DashboardOverviewProps {
  clients: ClientItem[];
  onSelectTab: (tab: any) => void;
  onSelectClient: (id: string) => void;
  onViewWebsite: () => void;
  isCloudSyncActive?: boolean;
}

export default function DashboardOverview({
  clients,
  onSelectTab,
  onSelectClient,
  onViewWebsite,
  isCloudSyncActive = true,
}: DashboardOverviewProps) {
  const totalWorks = clients.reduce((acc, c) => acc + (c.works?.length || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#0d0f13]">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121820] via-[#0f141a] to-[#0c0f13] border border-white/5 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-mono tracking-widest text-[#14AF9E] uppercase font-bold">
            Studio Operating System
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Welcome back to Rizx Studio
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
            Manage your client portfolios, scrollytelling sequences, media showcases, and brand identity in one high-performance creative workspace.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => onSelectTab("clients")}
              className="px-4 py-2 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-semibold text-xs transition-all active:scale-95 shadow-md shadow-[#14AF9E]/25 cursor-pointer"
            >
              Manage Clients & Works
            </button>
            <button
              type="button"
              onClick={onViewWebsite}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Preview Website</span>
              <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#14AF9E]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400">Total Clients</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{clients.length}</span>
            <span className="text-[10px] font-mono text-[#14AF9E]">Brands</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400">Portfolio Works</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{totalWorks}</span>
            <span className="text-[10px] font-mono text-cyan-400">Deliverables</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400">Cloud Sync</span>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
              <HiCheckCircle className="w-4 h-4" /> Live
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Supabase</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400">Storage Used</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">18.4</span>
            <span className="text-[10px] font-mono text-neutral-400">/ 100 GB</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Recent Client Folders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Client Folders */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Recent Client Folders</h3>
            <button
              type="button"
              onClick={() => onSelectTab("clients")}
              className="text-xs text-[#14AF9E] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clients.slice(0, 6).map((client) => {
              const thumb = client.works?.[0]?.image || client.logo;
              return (
                <div
                  key={client.id}
                  onClick={() => {
                    onSelectClient(client.id);
                    onSelectTab("clients");
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#161a22] hover:bg-[#1b202a] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                    {thumb ? (
                      <img src={thumb} alt={client.clientName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-400">
                        {client.clientName.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[#14AF9E] transition-colors">
                      {client.clientName}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {client.category || "Client Folder"} · {client.works?.length || 0} works
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Studio Shortcuts */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-3">
          <h3 className="text-sm font-semibold text-white pb-2 border-b border-white/5">
            Quick Tools
          </h3>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onSelectTab("ai-prompt")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <HiSparkles className="w-4 h-4 text-[#14AF9E]" />
                <div>
                  <p className="text-xs font-medium text-white">AI Prompt Builder</p>
                  <p className="text-[10px] text-neutral-400">Generate creative prompts</p>
                </div>
              </div>
              <span className="text-neutral-500 group-hover:text-white">→</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("portfolio")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <HiPhoto className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-xs font-medium text-white">Hero & Showcases</p>
                  <p className="text-[10px] text-neutral-400">Scrollytelling & Video</p>
                </div>
              </div>
              <span className="text-neutral-500 group-hover:text-white">→</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("brand")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <HiCpuChip className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-white">Brand Guidelines</p>
                  <p className="text-[10px] text-neutral-400">Colors, typography, tokens</p>
                </div>
              </div>
              <span className="text-neutral-500 group-hover:text-white">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

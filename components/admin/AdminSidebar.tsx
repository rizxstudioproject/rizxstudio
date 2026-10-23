"use client";

import React from "react";
import {
  HiSquares2X2,
  HiFolder,
  HiPhoto,
  HiSparkles,
  HiBookOpen,
  HiCircleStack,
  HiAdjustmentsHorizontal,
  HiChevronDown,
} from "react-icons/hi2";

export type AdminSidebarTab =
  | "dashboard"
  | "clients"
  | "portfolio"
  | "ai-prompt"
  | "brand"
  | "resources"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminSidebarTab;
  onSelectTab: (tab: AdminSidebarTab) => void;
  storageUsed?: string;
  storageTotal?: string;
  adminName?: string;
  onOpenProfileMenu?: () => void;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  storageUsed = "18.4",
  storageTotal = "100",
  adminName = "Rizx Studio",
  onOpenProfileMenu,
}: AdminSidebarProps) {
  const menuItems: { id: AdminSidebarTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Dashboard", icon: HiSquares2X2 },
    { id: "clients", label: "Clients", icon: HiFolder },
    { id: "portfolio", label: "Portfolio", icon: HiPhoto },
    { id: "ai-prompt", label: "AI Prompt Builder", icon: HiSparkles },
    { id: "brand", label: "Brand Guidelines", icon: HiBookOpen },
    { id: "resources", label: "Resource Library", icon: HiCircleStack },
    { id: "settings", label: "Settings", icon: HiAdjustmentsHorizontal },
  ];

  const storagePercentage = Math.min(
    100,
    Math.max(5, (parseFloat(storageUsed) / parseFloat(storageTotal)) * 100)
  );

  return (
    <aside className="w-60 shrink-0 bg-[#08090a] border-r border-white/5 flex flex-col justify-between h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14AF9E] flex items-center justify-center font-bold text-black text-sm shadow-md shadow-[#14AF9E]/20 shrink-0">
            R
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white tracking-tight truncate">
              {adminName}
            </h1>
            <p className="text-[11px] text-neutral-400 font-sans truncate">
              Creative production
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? "bg-[#14AF9E]/15 text-[#14AF9E] font-semibold border-l-2 border-[#14AF9E]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-[#14AF9E]" : "text-neutral-500"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: Storage & Profile */}
      <div className="p-3 border-t border-white/5 space-y-3">
        {/* Storage Bar */}
        <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Storage</span>
            <span className="font-mono text-neutral-200">
              <strong className="text-white">{storageUsed}</strong> / {storageTotal} GB
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#14AF9E] rounded-full transition-all duration-500"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => onSelectTab("resources")}
              className="text-[11px] text-[#14AF9E] hover:underline font-medium cursor-pointer"
            >
              Upgrade plan
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <button
          type="button"
          onClick={onOpenProfileMenu || (() => onSelectTab("settings"))}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              RS
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {adminName}
              </p>
              <p className="text-[10px] text-neutral-400 font-sans truncate">
                Admin
              </p>
            </div>
          </div>
          <HiChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
        </button>
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import {
  HiSquares2X2,
  HiFolder,
  HiPhoto,
  HiSparkles,
  HiVideoCamera,
  HiTag,
  HiUser,
  HiKey,
  HiChevronDown,
  HiSquare3Stack3D,
} from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";

export type AdminSidebarTab =
  | "clients"
  | "resources"
  | "hero-banner"
  | "hero-works"
  | "flagship"
  | "runner"
  | "about"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminSidebarTab;
  onSelectTab: (tab: AdminSidebarTab) => void;
  storageUsed?: string;
  storageTotal?: string;
  adminName?: string;
  totalWorks?: number;
  totalClients?: number;
  onOpenProfileMenu?: () => void;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  storageUsed = "18.4",
  storageTotal = "100",
  adminName = "Rizx Studio",
  totalWorks = 0,
  totalClients = 0,
  onOpenProfileMenu,
}: AdminSidebarProps) {
  const { lang } = useLang();
  const isId = lang === "id";

  const menuItems: {
    id: AdminSidebarTab;
    label: string;
    badge?: string | number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "clients",
      label: isId ? "Portofolio & Klien" : "Portfolio & Clients",
      badge: totalClients > 0 ? totalClients : undefined,
      icon: HiFolder,
    },
    {
      id: "resources",
      label: "Resource Library",
      badge: totalWorks > 0 ? totalWorks : undefined,
      icon: HiSquare3Stack3D,
    },
    {
      id: "hero-banner",
      label: isId ? "Hero Banner (Scrolly)" : "Hero Banner (Scrolly)",
      icon: HiSparkles,
    },
    {
      id: "hero-works",
      label: isId ? "Hero & Karya Unggulan" : "Hero & Selected Works",
      icon: HiPhoto,
    },
    {
      id: "flagship",
      label: isId ? "Media Showcase (Stage 3)" : "Media Showcase (Stage 3)",
      icon: HiVideoCamera,
    },
    {
      id: "runner",
      label: isId ? "Running Portofolio (4:5)" : "Running Portfolio (4:5)",
      icon: HiSquares2X2,
    },
    {
      id: "about",
      label: isId ? "Tentang Saya (About Me)" : "About Me Section",
      icon: HiUser,
    },
    {
      id: "settings",
      label: isId ? "Sandi & Keamanan Akun" : "Password & Security",
      icon: HiKey,
    },
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

      {/* Navigation List — All 8 REAL Portfolio Admin Sections */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-3 pb-1 block">
          {isId ? "KONTROL PORTOFOLIO" : "PORTFOLIO CONTROLS"}
        </span>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? "bg-[#14AF9E]/15 text-[#14AF9E] font-semibold border-l-2 border-[#14AF9E]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-[#14AF9E]" : "text-neutral-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-[#14AF9E]/25 text-[#14AF9E]"
                      : "bg-white/5 text-neutral-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
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
          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span>{totalWorks} total works</span>
            <span className="text-emerald-400">Live Sync</span>
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

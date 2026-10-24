"use client";

import React from "react";
import {
  RiFolderFill,
  RiSparklingFill,
  RiImageFill,
  RiMovieFill,
  RiGridFill,
  RiUser3Fill,
  RiCursorFill,
  RiPaletteFill,
  RiChat3Fill,
  RiLineChartFill,
  RiDeleteBinFill,
  RiPieChartFill,
  RiKeyFill,
  RiStackFill,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

export type AdminSidebarTab =
  | "clients"
  | "resources"
  | "hero-banner"
  | "hero-works"
  | "flagship"
  | "runner"
  | "about"
  | "motion"
  | "theme"
  | "social"
  | "crm"
  | "trash"
  | "storage"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminSidebarTab;
  onSelectTab: (tab: AdminSidebarTab) => void;
  storageUsed?: string;
  storageTotal?: string;
  adminName?: string;
  totalWorks?: number;
  totalClients?: number;
  trashCount?: number;
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
  trashCount = 0,
  onOpenProfileMenu,
}: AdminSidebarProps) {
  const { lang, tr } = useLang();
  const { primaryColor } = useMotionTheme();

  const menuItems: {
    id: AdminSidebarTab;
    label: string;
    badge?: string | number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "clients",
      label: tr("Portfolio & Clients", "Portofolio & Klien", "Portofolio & Klien"),
      badge: totalClients > 0 ? totalClients : undefined,
      icon: RiFolderFill,
    },
    {
      id: "hero-banner",
      label: tr("Hero Banner (Scrolly)", "Banner Utama (Scrolly)", "Banner Utamo (Scrolly)"),
      icon: RiSparklingFill,
    },
    {
      id: "hero-works",
      label: tr("Hero & Selected Works", "Hero & Karya Unggulan", "Hero & Karya Tapiliah"),
      icon: RiImageFill,
    },
    {
      id: "flagship",
      label: tr("Media Showcase (Stage 3)", "Pameran Media (Stage 3)", "Pameran Media (Stage 3)"),
      icon: RiMovieFill,
    },
    {
      id: "runner",
      label: tr("Running Portfolio (4:5)", "Portofolio Berjalan (4:5)", "Portofolio Baguliah (4:5)"),
      icon: RiGridFill,
    },
    {
      id: "about",
      label: tr("About Me Section", "Tentang Saya", "Tantang Ambo"),
      icon: RiUser3Fill,
    },
    {
      id: "motion",
      label: tr("Motion & Cursor", "Motion & Kursor", "Motion & Kursor"),
      icon: RiCursorFill,
    },
    {
      id: "theme",
      label: tr("Theme & Colors", "Warna & Tema", "Warna & Tema"),
      icon: RiPaletteFill,
    },
    {
      id: "social",
      label: tr("Contact & Socials", "Kontak & Sosmed", "Kontak & Sosmed"),
      icon: RiChat3Fill,
    },
    {
      id: "crm",
      label: tr("CRM & Analytics", "CRM & Prospek", "CRM & Prospek"),
      icon: RiLineChartFill,
    },
    {
      id: "trash",
      label: tr("Recycle Bin", "Tong Sampah", "Tong Sarok"),
      badge: trashCount > 0 ? trashCount : undefined,
      icon: RiDeleteBinFill,
    },
    {
      id: "storage",
      label: tr("Storage & Analytics", "Kapasitas & Data", "Panyimpanan & Data"),
      badge: totalWorks > 0 ? totalWorks : undefined,
      icon: RiPieChartFill,
    },
    {
      id: "settings",
      label: tr("Password & Security", "Sandi & Keamanan Akun", "Kunci & Kaamanan Akun"),
      icon: RiKeyFill,
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
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center p-1.5 shadow-md shadow-black/40 shrink-0">
            <img
              src="/navbar-logo.png"
              alt="Rizx Studio"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white tracking-tight truncate">
              {adminName}
            </h1>
            <p className="text-[11px] text-neutral-400 font-sans truncate">
              {tr("Creative production", "Produksi kreatif", "Produksi kreatif")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List — All 8 REAL Portfolio Admin Sections */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-3 pb-1 block">
          {tr("PORTFOLIO CONTROLS", "KONTROL PORTOFOLIO", "PANGATURAN PORTOFOLIO")}
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
                  ? "font-semibold border-l-2"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              style={{
                backgroundColor: isActive ? `${primaryColor}20` : undefined,
                color: isActive ? primaryColor : undefined,
                borderLeftColor: isActive ? primaryColor : undefined,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="shrink-0 flex items-center justify-center"
                  style={{ color: isActive ? primaryColor : undefined }}
                >
                  <Icon className="w-4 h-4 transition-colors" />
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded-full"
                  style={{
                    backgroundColor: isActive ? `${primaryColor}35` : "rgba(255,255,255,0.05)",
                    color: isActive ? primaryColor : "#a3a3a3",
                  }}
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
        {/* Storage Bar (Clickable to open animated storage graphic view) */}
        <button
          type="button"
          onClick={() => onSelectTab("storage")}
          className="w-full text-left p-3 rounded-xl bg-[#0f1115] hover:bg-[#15181f] border border-white/5 hover:border-[#16b09f]/30 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 group-hover:text-[#16b09f] transition-colors flex items-center gap-1.5">
              <RiPieChartFill className="w-3.5 h-3.5 text-[#16b09f]" />
              <span>{tr("Storage", "Penyimpanan", "Panyimpanan")}</span>
            </span>
            <span className="font-mono text-neutral-200">
              <strong className="text-white">{storageUsed}</strong> / {storageTotal} GB
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#16b09f] rounded-full transition-all duration-500"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span>{totalWorks} {tr("total works", "total karya", "karya kasadonyo")}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}



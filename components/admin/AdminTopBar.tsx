"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  HiMagnifyingGlass,
  HiBell,
  HiArrowTopRightOnSquare,
  HiArrowRightOnRectangle,
  HiCheckCircle,
  HiCloud,
  HiBars3,
  HiXMark,
  HiFolder,
  HiPhoto,
  HiTag,
  HiSparkles,
  HiVideoCamera,
  HiSquares2X2,
  HiUser,
  HiKey,
  HiSquare3Stack3D,
  HiArrowRight,
  HiTrash,
  HiChartPie,
  HiCheck,
  HiArrowPath,
} from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";
import { ClientItem, ClientLogoItem } from "@/context/PortfolioDataContext";
import { AdminSidebarTab } from "./AdminSidebar";

interface AdminTopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onViewWebsite: () => void;
  onLogout: () => void;
  isCloudSyncActive?: boolean;
  onToggleMobileMenu?: () => void;
  clients?: ClientItem[];
  clLogos?: ClientLogoItem[];
  onSelectClient?: (clientId: string) => void;
  onSelectTab?: (tab: AdminSidebarTab) => void;
  onOpenLogosTab?: () => void;
  onResetDefault?: () => void;
  onSaveChanges?: () => void;
  showResetDefault?: boolean;
  showSaveChanges?: boolean;
}

export default function AdminTopBar({
  searchQuery,
  onSearchChange,
  onViewWebsite,
  onLogout,
  isCloudSyncActive = true,
  onToggleMobileMenu,
  clients = [],
  clLogos = [],
  onSelectClient,
  onSelectTab,
  onOpenLogosTab,
  onResetDefault,
  onSaveChanges,
  showResetDefault = true,
  showSaveChanges = true,
}: AdminTopBarProps) {
  const { lang, setLang, tr } = useLang();
  const isId = lang === "id";
  const isMin = lang === "min";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Close desktop search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus mobile search input when mobile popup opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Compute live search matches across clients, works, logos, and admin tabs
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    // 1. Clients & Folders
    const matchedClients = (clients || [])
      .filter(
        (c) =>
          c.clientName.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      )
      .slice(0, 5);

    // 2. Works & Visual Assets
    const matchedWorks: {
      workId: string;
      clientId: string;
      clientName: string;
      title: string;
      image: string;
      aspect: string;
    }[] = [];

    for (const c of clients || []) {
      for (const w of c.works || []) {
        const matchTitle = w.title && w.title.toLowerCase().includes(q);
        const matchTools =
          Array.isArray(w.tools) &&
          w.tools.some((t: string) => t.toLowerCase().includes(q));
        const matchType = w.type && w.type.toLowerCase().includes(q);
        if (matchTitle || matchTools || matchType) {
          matchedWorks.push({
            workId: w.id,
            clientId: c.id,
            clientName: c.clientName,
            title: w.title || "Untitled Asset",
            image: w.image || (c as any).coverImage || c.logo || "",
            aspect: w.aspect || "4:5",
          });
          if (matchedWorks.length >= 6) break;
        }
      }
      if (matchedWorks.length >= 6) break;
    }

    // 3. Partner Logos
    const matchedLogos = (clLogos || [])
      .filter((l) => l.name.toLowerCase().includes(q))
      .slice(0, 4);

    // 4. Admin Navigation Sections
    const sections: {
      id: AdminSidebarTab;
      label: string;
      sub: string;
      icon: React.ComponentType<{ className?: string }>;
    }[] = [
      {
        id: "clients",
        label: tr("Portfolio & Clients", "Portofolio & Klien", "Portofolio & Klien"),
        sub: tr("Client folders & works", "Folder klien & karya visual", "Folder klien & karya visual"),
        icon: HiFolder,
      },
      {
        id: "resources",
        label: tr("Resource Library", "Gudang Aset Media", "Gudang Aset Media"),
        sub: tr("Media asset explorer", "Vault media explorer & storage", "Gudang media explorer & aset"),
        icon: HiSquare3Stack3D,
      },
      {
        id: "hero-banner",
        label: tr("Hero Banner (Scrolly)", "Banner Utama (Scrolly)", "Banner Utamo (Scrolly)"),
        sub: tr("Canvas sequence frames", "Frame animasi kanvas utama", "Frame animasi kanvas utamo"),
        icon: HiSparkles,
      },
      {
        id: "hero-works",
        label: tr("Hero & Selected Works", "Hero & Karya Unggulan", "Hero & Karya Tapiliah"),
        sub: tr("3 top highlighted works", "3 karya sorotan utama", "3 karya sorotan utamo"),
        icon: HiPhoto,
      },
      {
        id: "flagship",
        label: tr("Media Showcase (Stage 3)", "Pameran Media (Stage 3)", "Pameran Media (Stage 3)"),
        sub: tr("Stage 3 video showcase", "Stage 3 video reels", "Stage 3 video reels"),
        icon: HiVideoCamera,
      },
      {
        id: "runner",
        label: tr("Running Portfolio (4:5)", "Portofolio Berjalan (4:5)", "Portofolio Baguliah (4:5)"),
        sub: tr("Vertical marquee poster cards", "Marquee poster vertikal", "Marquee poster tagak"),
        icon: HiSquares2X2,
      },
      {
        id: "about",
        label: tr("About Me Section", "Tentang Saya", "Tantang Ambo"),
        sub: tr("Profile bio & contacts", "Profil, biografi & kontak", "Profil, biografi & kontak"),
        icon: HiUser,
      },
      {
        id: "trash",
        label: tr("Recycle Bin", "Tong Sampah", "Tong Sarok"),
        sub: tr("Restore deleted works & folders", "Pulihkan karya & folder yang terhapus", "Puliahan karya & folder nan tahapuih"),
        icon: HiTrash,
      },
      {
        id: "storage",
        label: tr("Storage & Analytics", "Kapasitas & Data Terpakai", "Panyimpanan & Data Tapakai"),
        sub: tr("Visual memory graphics & capacity", "Grafik visual kapasitas memori & data", "Grafik visual panyimpanan & data"),
        icon: HiChartPie,
      },
      {
        id: "settings",
        label: tr("Password & Security", "Sandi & Keamanan Akun", "Kunci & Kaamanan Akun"),
        sub: tr("Admin credentials", "Pengaturan akun admin", "Pangaturan akun admin"),
        icon: HiKey,
      },
    ];

    const matchedSections = sections.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.sub.toLowerCase().includes(q) ||
        s.id.includes(q)
    );

    const totalResults =
      matchedClients.length +
      matchedWorks.length +
      matchedLogos.length +
      matchedSections.length;

    return {
      matchedClients,
      matchedWorks,
      matchedLogos,
      matchedSections,
      totalResults,
    };
  }, [searchQuery, clients, clLogos, isId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    } else if (e.key === "Enter") {
      if (!searchResults) return;
      if (searchResults.matchedClients.length > 0) {
        onSelectTab?.("clients");
        onSelectClient?.(searchResults.matchedClients[0].id);
        setIsSearchOpen(false);
      } else if (searchResults.matchedWorks.length > 0) {
        onSelectTab?.("clients");
        onSelectClient?.(searchResults.matchedWorks[0].clientId);
        setIsSearchOpen(false);
      } else if (searchResults.matchedSections.length > 0) {
        onSelectTab?.(searchResults.matchedSections[0].id);
        setIsSearchOpen(false);
      } else if (searchResults.matchedLogos.length > 0) {
        onSelectTab?.("clients");
        onOpenLogosTab?.();
        setIsSearchOpen(false);
      }
    }
  };

  return (
    <>
      <header className="h-14 shrink-0 bg-[#0c0e12] border-b border-white/5 px-3 sm:px-6 flex items-center justify-between gap-3 select-none relative z-40">
        {/* Left Side: Mobile Hamburger Menu & Search Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl min-w-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white cursor-pointer shrink-0"
              aria-label="Toggle menu"
            >
              <HiBars3 className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Search Icon Button (Transforms search bar into an icon on mobile) */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label={isId ? "Pencarian" : "Search"}
            title={isId ? "Buka Pencarian" : "Open Search"}
          >
            <HiMagnifyingGlass className="w-4 h-4 text-neutral-300" />
          </button>

          {/* Desktop Global Search Bar Container */}
          <div ref={searchContainerRef} className="hidden md:block relative w-full">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isMin
                  ? "Cari klien, karya visual, logo..."
                  : isId
                  ? "Cari klien, karya visual, logo partner..."
                  : "Search clients, folders, assets"
              }
              className={`w-full bg-[#12151a] hover:bg-[#161a20] focus:bg-[#161a20] border border-white/5 focus:border-[#14AF9E]/60 rounded-xl pl-9 ${
                searchQuery ? "pr-8" : "pr-3"
              } py-2 text-xs text-white placeholder-neutral-500 transition-all outline-none`}
            />

            {/* Quick Clear Button on Desktop */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  setIsSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isId ? "Hapus pencarian" : "Clear search"}
              >
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Desktop Autocomplete Palette Dropdown */}
            {isSearchOpen && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#12151a] border border-white/10 rounded-2xl shadow-2xl p-2.5 z-50 max-h-[75vh] overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                {/* 1. Clients & Folders */}
                {searchResults.matchedClients.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#14AF9E] px-2.5 py-1 block font-semibold">
                      {isId ? "Klien & Folder" : "Clients & Folders"} (
                      {searchResults.matchedClients.length})
                    </span>
                    <div className="space-y-1 mt-0.5">
                      {searchResults.matchedClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => {
                            onSelectTab?.("clients");
                            onSelectClient?.(client.id);
                            setIsSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-white/5 flex items-center justify-center shrink-0 text-[#14AF9E] group-hover:bg-[#14AF9E] group-hover:text-black transition-colors">
                              <HiFolder className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate group-hover:text-[#14AF9E] transition-colors">
                                {client.clientName}
                              </div>
                              <div className="text-[10px] text-neutral-400 truncate">
                                {client.category || "Client Folder"} •{" "}
                                {client.works?.length || 0} works
                              </div>
                            </div>
                          </div>
                          <HiArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Works & Visual Assets */}
                {searchResults.matchedWorks.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 px-2.5 py-1 block font-semibold">
                      {isId ? "Karya & Aset Visual" : "Works & Assets"} (
                      {searchResults.matchedWorks.length})
                    </span>
                    <div className="space-y-1 mt-0.5">
                      {searchResults.matchedWorks.map((work) => (
                        <button
                          key={`${work.clientId}-${work.workId}`}
                          type="button"
                          onClick={() => {
                            onSelectTab?.("clients");
                            onSelectClient?.(work.clientId);
                            setIsSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-white/5 overflow-hidden shrink-0">
                              {work.image ? (
                                <img
                                  src={work.image}
                                  alt={work.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                  <HiPhoto className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                                {work.title}
                              </div>
                              <div className="text-[10px] text-neutral-400 truncate flex items-center gap-1.5">
                                <span>{work.clientName}</span>
                                <span className="px-1 py-0.2 rounded bg-white/5 font-mono text-[9px] text-neutral-300">
                                  {work.aspect}
                                </span>
                              </div>
                            </div>
                          </div>
                          <HiArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Partner Logos */}
                {searchResults.matchedLogos.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 px-2.5 py-1 block font-semibold">
                      {isId ? "Partner Logo Marquee" : "Partner Logos"} (
                      {searchResults.matchedLogos.length})
                    </span>
                    <div className="space-y-1 mt-0.5">
                      {searchResults.matchedLogos.map((logo) => (
                        <button
                          key={logo.id}
                          type="button"
                          onClick={() => {
                            onSelectTab?.("clients");
                            onOpenLogosTab?.();
                            setIsSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center p-1 shrink-0">
                              {logo.file ? (
                                <img
                                  src={logo.file}
                                  alt={logo.name}
                                  className="max-w-full max-h-full object-contain filter invert opacity-80"
                                />
                              ) : (
                                <HiTag className="w-3.5 h-3.5 text-amber-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate group-hover:text-amber-300 transition-colors">
                                {logo.name}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                Marquee Row {logo.row}
                              </div>
                            </div>
                          </div>
                          <HiArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Admin Navigation Sections */}
                {searchResults.matchedSections.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 px-2.5 py-1 block font-semibold">
                      {isId ? "Halaman & Fitur Admin" : "Studio Sections"} (
                      {searchResults.matchedSections.length})
                    </span>
                    <div className="space-y-1 mt-0.5">
                      {searchResults.matchedSections.map((sec) => {
                        const Icon = sec.icon;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => {
                              onSelectTab?.(sec.id);
                              setIsSearchOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-white/5 flex items-center justify-center shrink-0 text-sky-400 group-hover:bg-sky-400 group-hover:text-black transition-colors">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-white truncate group-hover:text-sky-300 transition-colors">
                                  {sec.label}
                                </div>
                                <div className="text-[10px] text-neutral-400 truncate">
                                  {sec.sub}
                                </div>
                              </div>
                            </div>
                            <HiArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Empty State */}
                {searchResults.totalResults === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs text-neutral-300 font-medium">
                      {isId
                        ? `Tidak ada hasil untuk "${searchQuery}"`
                        : `No results found for "${searchQuery}"`}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isId
                        ? "Cari nama brand klien, karya visual, atau nama bagian menu."
                        : "Search by client brand, visual work, or menu section."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab?.("resources");
                        setIsSearchOpen(false);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#14AF9E] border border-white/10 transition-colors cursor-pointer"
                    >
                      <HiSquare3Stack3D className="w-3.5 h-3.5" />
                      <span>
                        {isId
                          ? "Jelajahi di Resource Library"
                          : "Explore in Resource Library"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: Notifications, View Website (Desktop only), Language, Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Dropdown (Desktop Only - Mobile in Burger Menu) */}
          <div className="hidden md:block relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Notifications & Cloud Sync"
            >
              <HiBell className="w-4 h-4" />
              {isCloudSyncActive && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#14AF9E]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#12151a] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-semibold text-white">
                    {tr("System Status", "Status Sistem", "Status Sistem")}
                  </span>
                  <span className="text-[10px] font-mono text-[#14AF9E] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14AF9E] animate-pulse" />
                    {tr("Live Sync", "Sinkron Langsung", "Sinkron Langsuang")}
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                    <HiCheckCircle className="w-4 h-4 text-[#14AF9E] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-neutral-200 font-medium">
                        {tr("Supabase Cloud Connected", "Cloud Supabase Terhubung", "Awan Supabase Tahubuang")}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {tr(
                          "All portfolio assets & client changes are synced live.",
                          "Semua aset & perubahan klien tersinkron langsung.",
                          "Sadoalah aset & parubahan klien tasinkron langsuang."
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                    <HiCloud className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-neutral-200 font-medium">
                        {tr("IndexedDB Backup Active", "Cadangan IndexedDB Aktif", "Cadangan IndexedDB Aktif")}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {tr(
                          "Fast local frame caching enabled.",
                          "Cache frame lokal aktif cepat.",
                          "Cache frame lokal aktif capek."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Website Button (Desktop Only) */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer no-underline"
          >
            <span>{tr("View website", "Lihat website", "Caliak website")}</span>
            <HiArrowTopRightOnSquare className="w-3.5 h-3.5 text-neutral-400" />
          </a>

          {/* Top Navbar Action: Reset to Default (Desktop Only - Mobile in Burger Menu) */}
          {showResetDefault && onResetDefault && (
            <button
              type="button"
              onClick={onResetDefault}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer active:scale-95"
              title={tr("Reset to Default", "Reset ke Bawaan", "Baliak ka Bawaan")}
            >
              <HiArrowPath className="w-3.5 h-3.5 text-neutral-400" />
              <span>{tr("Reset to Default", "Reset ke Bawaan", "Baliak Default")}</span>
            </button>
          )}

          {/* Top Navbar Action: Save Changes (Desktop Only - Mobile in Burger Menu) */}
          {showSaveChanges && onSaveChanges && (
            <button
              type="button"
              onClick={onSaveChanges}
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-bold text-xs transition-all shadow-md shadow-[#14AF9E]/25 cursor-pointer active:scale-95"
              title={tr("Save Changes", "Simpan Perubahan", "Simpan Parubahan")}
            >
              <HiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{tr("Save Changes", "Simpan Perubahan", "Simpan Parubahan")}</span>
            </button>
          )}

          {/* Language Switcher (Desktop Only - Mobile in Burger Menu) */}
          <div className="hidden md:flex items-center p-0.5 rounded-xl bg-[#12151a] border border-white/10">
            <button
              type="button"
              onClick={() => setLang("id")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                lang === "id"
                  ? "bg-[#14AF9E] text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-[#14AF9E] text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("min")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                lang === "min"
                  ? "bg-[#14AF9E] text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              MIN
            </button>
          </div>

          {/* Logout Button (Desktop Only - Mobile in Burger Menu) */}
          <button
            type="button"
            onClick={onLogout}
            className="hidden md:block p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Logout Admin"
          >
            <HiArrowRightOnRectangle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ==============================================================
          MOBILE FULLSCREEN SEARCH POPUP MODAL
          ("ketika di pencet popup dan ketikan kita jelas terlihat")
         ============================================================== */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-[#0c0e12]/98 backdrop-blur-2xl flex flex-col p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Top Bar with Clear, Large, Readable Input Field */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 shrink-0">
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  isId
                    ? "Cari klien, karya visual, logo partner..."
                    : "Search clients, folders, assets..."
                }
                className="w-full bg-[#161a22] border border-white/15 focus:border-[#14AF9E] rounded-2xl pl-11 pr-10 py-3.5 text-base font-semibold text-white placeholder-neutral-500 outline-none transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    mobileSearchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Clear"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="px-3.5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-semibold cursor-pointer shrink-0 active:scale-95"
            >
              {isId ? "Tutup" : "Cancel"}
            </button>
          </div>

          {/* Search Results Display inside Mobile Popup */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            {!searchQuery.trim() ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#14AF9E] mb-3">
                  <HiMagnifyingGlass className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">
                  {isId ? "Pencarian Cepat Studio" : "Studio Quick Search"}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  {isId
                    ? "Ketik nama brand klien, karya visual, logo partner, atau bagian menu navigasi."
                    : "Type client brands, visual works, logos, or menu navigation sections."}
                </p>
              </div>
            ) : searchResults?.totalResults === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-white">
                  {isId
                    ? `Tidak ada hasil untuk "${searchQuery}"`
                    : `No results found for "${searchQuery}"`}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {isId
                    ? "Coba cari nama klien atau aset lainnya."
                    : "Try searching with a different keyword."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.("resources");
                    setIsMobileSearchOpen(false);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14AF9E] text-black font-bold text-xs shadow-md shadow-[#14AF9E]/20"
                >
                  <HiSquare3Stack3D className="w-4 h-4" />
                  <span>
                    {isId ? "Buka Resource Library" : "Open Resource Library"}
                  </span>
                </button>
              </div>
            ) : (
              <>
                {/* 1. Clients & Folders */}
                {searchResults?.matchedClients &&
                  searchResults.matchedClients.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#14AF9E] font-bold px-1 mb-2 block">
                        {isId ? "Klien & Folder" : "Clients & Folders"} (
                        {searchResults.matchedClients.length})
                      </span>
                      <div className="space-y-1.5">
                        {searchResults.matchedClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              onSelectTab?.("clients");
                              onSelectClient?.(client.id);
                              setIsMobileSearchOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-white/5 text-left active:bg-white/10 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0 text-[#14AF9E]">
                                <HiFolder className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {client.clientName}
                                </p>
                                <p className="text-xs text-neutral-400 truncate">
                                  {client.category || "Client Folder"} •{" "}
                                  {client.works?.length || 0} works
                                </p>
                              </div>
                            </div>
                            <HiArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 2. Visual Works & Assets */}
                {searchResults?.matchedWorks &&
                  searchResults.matchedWorks.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold px-1 mb-2 block">
                        {isId ? "Karya & Aset Visual" : "Works & Assets"} (
                        {searchResults.matchedWorks.length})
                      </span>
                      <div className="space-y-1.5">
                        {searchResults.matchedWorks.map((work) => (
                          <button
                            key={`${work.clientId}-${work.workId}`}
                            type="button"
                            onClick={() => {
                              onSelectTab?.("clients");
                              onSelectClient?.(work.clientId);
                              setIsMobileSearchOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-white/5 text-left active:bg-white/10 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 overflow-hidden shrink-0">
                                {work.image ? (
                                  <img
                                    src={work.image}
                                    alt={work.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                    <HiPhoto className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {work.title}
                                </p>
                                <p className="text-xs text-neutral-400 truncate flex items-center gap-1.5">
                                  <span>{work.clientName}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-neutral-300">
                                    {work.aspect}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <HiArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 3. Partner Logos */}
                {searchResults?.matchedLogos &&
                  searchResults.matchedLogos.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold px-1 mb-2 block">
                        {isId ? "Partner Logo Marquee" : "Partner Logos"} (
                        {searchResults.matchedLogos.length})
                      </span>
                      <div className="space-y-1.5">
                        {searchResults.matchedLogos.map((logo) => (
                          <button
                            key={logo.id}
                            type="button"
                            onClick={() => {
                              onSelectTab?.("clients");
                              onOpenLogosTab?.();
                              setIsMobileSearchOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-white/5 text-left active:bg-white/10 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                                {logo.file ? (
                                  <img
                                    src={logo.file}
                                    alt={logo.name}
                                    className="max-w-full max-h-full object-contain filter invert opacity-80"
                                  />
                                ) : (
                                  <HiTag className="w-4 h-4 text-amber-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {logo.name}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  Marquee Row {logo.row}
                                </p>
                              </div>
                            </div>
                            <HiArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 4. Studio Navigation Sections */}
                {searchResults?.matchedSections &&
                  searchResults.matchedSections.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold px-1 mb-2 block">
                        {isId ? "Halaman Navigasi Admin" : "Studio Sections"} (
                        {searchResults.matchedSections.length})
                      </span>
                      <div className="space-y-1.5">
                        {searchResults.matchedSections.map((sec) => {
                          const Icon = sec.icon;
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => {
                                onSelectTab?.(sec.id);
                                setIsMobileSearchOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-white/5 text-left active:bg-white/10 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0 text-sky-400">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {sec.label}
                                  </p>
                                  <p className="text-xs text-neutral-400 truncate">
                                    {sec.sub}
                                  </p>
                                </div>
                              </div>
                              <HiArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

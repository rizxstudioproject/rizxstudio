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
}: AdminTopBarProps) {
  const { lang, setLang } = useLang();
  const isId = lang === "id";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Close search dropdown on click outside
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
        label: isId ? "Portofolio & Klien" : "Portfolio & Clients",
        sub: isId ? "Folder klien & karya visual" : "Client folders & works",
        icon: HiFolder,
      },
      {
        id: "resources",
        label: "Resource Library",
        sub: isId ? "Vault media explorer & storage" : "Media asset explorer",
        icon: HiSquare3Stack3D,
      },
      {
        id: "hero-banner",
        label: "Hero Banner (Scrolly)",
        sub: isId ? "Frame animasi kanvas utama" : "Canvas sequence frames",
        icon: HiSparkles,
      },
      {
        id: "hero-works",
        label: isId ? "Hero & Karya Unggulan" : "Hero & Selected Works",
        sub: isId ? "3 karya sorotan utama" : "3 top highlighted works",
        icon: HiPhoto,
      },
      {
        id: "flagship",
        label: "Media Showcase",
        sub: isId ? "Stage 3 video reels" : "Stage 3 video showcase",
        icon: HiVideoCamera,
      },
      {
        id: "runner",
        label: isId ? "Running Portofolio (4:5)" : "Running Portfolio",
        sub: isId ? "Marquee poster vertikal" : "Vertical marquee poster cards",
        icon: HiSquares2X2,
      },
      {
        id: "about",
        label: isId ? "Tentang Saya" : "About Me",
        sub: isId ? "Profil, biografi & kontak" : "Profile bio & contacts",
        icon: HiUser,
      },
      {
        id: "settings",
        label: isId ? "Sandi & Keamanan" : "Password & Security",
        sub: isId ? "Pengaturan akun admin" : "Admin credentials",
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
    <header className="h-14 shrink-0 bg-[#0c0e12] border-b border-white/5 px-4 sm:px-6 flex items-center justify-between gap-4 select-none relative z-40">
      {/* Left: Mobile Menu Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            <HiBars3 className="w-4 h-4" />
          </button>
        )}

        {/* Global Search Container */}
        <div ref={searchContainerRef} className="relative w-full">
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
              isId
                ? "Cari klien, karya visual, logo partner..."
                : "Search clients, folders, assets"
            }
            className={`w-full bg-[#12151a] hover:bg-[#161a20] focus:bg-[#161a20] border border-white/5 focus:border-[#14AF9E]/60 rounded-xl pl-9 ${
              searchQuery ? "pr-8" : "pr-3"
            } py-2 text-xs text-white placeholder-neutral-500 transition-all outline-none`}
          />

          {/* Quick Clear Button (Only when search query is entered) */}
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

          {/* Live Search Autocomplete Palette Dropdown */}
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

      {/* Right Actions: Notifications, View Website, Language, Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications Dropdown */}
        <div className="relative">
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
                  System Status
                </span>
                <span className="text-[10px] font-mono text-[#14AF9E] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14AF9E] animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="mt-2.5 space-y-2 text-xs">
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                  <HiCheckCircle className="w-4 h-4 text-[#14AF9E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-200 font-medium">
                      Supabase Cloud Connected
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      All portfolio assets & client changes are synced live.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                  <HiCloud className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-200 font-medium">
                      IndexedDB Backup Active
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Fast local frame caching enabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Website Button */}
        <button
          type="button"
          onClick={onViewWebsite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <span>View website</span>
          <HiArrowTopRightOnSquare className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* Language Switcher */}
        <div className="flex items-center p-0.5 rounded-xl bg-[#12151a] border border-white/10">
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
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Logout Admin"
        >
          <HiArrowRightOnRectangle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  RiSearchFill as HiMagnifyingGlass,
  RiNotification3Fill as HiBell,
  RiExternalLinkFill as HiArrowTopRightOnSquare,
  RiCheckboxCircleFill as HiCheckCircle,
  RiCloudFill as HiCloud,
  RiMenuFill as HiBars3,
  RiCloseFill as HiXMark,
  RiFolderFill as HiFolder,
  RiImageFill as HiPhoto,
  RiPriceTag3Fill as HiTag,
  RiSparklingFill as HiSparkles,
  RiMovieFill as HiVideoCamera,
  RiGridFill as HiSquares2X2,
  RiUser3Fill as HiUser,
  RiKeyFill as HiKey,
  RiStackFill as HiSquare3Stack3D,
  RiArrowRightSFill as HiArrowRight,
  RiDeleteBinFill as HiTrash,
  RiPieChartFill as HiChartPie,
  RiCheckFill as HiCheck,
  RiRestartFill as HiArrowPath,
  RiCursorFill,
  RiPaletteFill,
  RiChat3Fill,
  RiLineChartFill,
  RiSearchEyeFill,
  RiMoonFill,
  RiSunFill,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
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
  onSaveChanges?: () => void;
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
  onSaveChanges,
  showSaveChanges = true,
}: AdminTopBarProps) {
  const { lang, setLang, tr } = useLang();
  const { themeMode, primaryColor, toggleThemeMode } = useMotionTheme();
  const isLight = themeMode === "light";
  const isId = lang === "id";
  const isMin = lang === "min";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Language Slider State & Outside Click (Matches Website Navbar & Mobile Admin Slider System)
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);
  const languagesList = [
    { code: "en", label: "EN" },
    { code: "id", label: "ID" },
    { code: "min", label: "MIN" },
  ] as const;
  const activeLangIndex = Math.max(0, languagesList.findIndex((l) => l.code === lang));

  useEffect(() => {
    const handleLangClickOutside = (e: MouseEvent) => {
      if (
        langContainerRef.current &&
        !langContainerRef.current.contains(e.target as Node)
      ) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleLangClickOutside);
    return () => document.removeEventListener("mousedown", handleLangClickOutside);
  }, []);

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
        id: "motion",
        label: tr("Motion & Cursor", "Motion & Kursor", "Motion & Kursor"),
        sub: tr("Motion effects & cursor", "Efek gerak & kursor magnetik", "Efek garak & kursor magnetik"),
        icon: RiCursorFill,
      },
      {
        id: "theme",
        label: tr("Theme & Colors", "Warna & Tema", "Warna & Tema"),
        sub: tr("Accent colors & theme", "Skema warna aksen & tema UI", "Skema warna aksen & tema UI"),
        icon: RiPaletteFill,
      },
      {
        id: "social",
        label: tr("Contact & Socials", "Kontak & Sosmed", "Kontak & Sosmed"),
        sub: tr("WhatsApp, email & social links", "WhatsApp, email & tautan sosial", "WhatsApp, email & tautan sosial"),
        icon: RiChat3Fill,
      },
      {
        id: "crm",
        label: tr("CRM & Analytics", "CRM & Prospek", "CRM & Prospek"),
        sub: tr("Visitor telemetry & leads", "Data telemetri pengunjung & prospek", "Data telemetri pangunjuang & prospek"),
        icon: RiLineChartFill,
      },
      {
        id: "seo",
        label: tr("SEO & Search Engine", "SEO & Mesin Pencari", "SEO & Masin Pancari"),
        sub: tr("Google meta tags & search verification", "Meta tag Google, verifikasi & pratinjau medsos", "Meta tag Google & verifikasi"),
        icon: RiSearchEyeFill,
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
      <header className={`h-14 shrink-0 border-b px-3 sm:px-6 flex items-center justify-between gap-3 select-none relative z-40 ${
        isLight ? "bg-white border-slate-200" : "bg-[#0c0e12] border-white/5"
      }`}>
        {/* Left Side: Mobile Hamburger Menu & Search Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 md:max-w-xl">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  : "bg-neutral-900 border-white/10 text-neutral-300 hover:text-white"
              }`}
              aria-label="Toggle menu"
            >
              <HiBars3 className="w-4 h-4" />
            </button>
          )}

          {/* Global Search Bar (Mobile & Desktop) */}
          <div ref={searchContainerRef} className="relative flex-1 w-full min-w-0">
            <HiMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
              isLight ? "text-slate-400" : "text-neutral-500"
            }`} />
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
              className={`w-full rounded-full pl-9 ${
                searchQuery ? "pr-8" : "pr-3.5"
              } py-2 text-xs transition-all outline-none border ${
                isLight
                  ? "bg-slate-100/90 hover:bg-slate-100 focus:bg-white border-slate-200/90 focus:border-[#16b09f] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#16b09f]/10 shadow-xs"
                  : "bg-[#12151a] hover:bg-[#161a20] focus:bg-[#161a20] border-white/5 focus:border-[#16b09f]/60 text-white placeholder-neutral-500"
              }`}
            />

            {/* Quick Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  setIsSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors cursor-pointer ${
                  isLight
                    ? "text-slate-400 hover:text-slate-700 hover:bg-slate-200/80"
                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
                title={isId ? "Hapus pencarian" : "Clear search"}
              >
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autocomplete Palette Dropdown (Mobile & Desktop) */}
            {isSearchOpen && searchResults && (
              <div className={`fixed inset-x-3 top-14 md:absolute md:top-full md:inset-x-0 md:mt-2 rounded-2xl shadow-2xl p-2.5 z-50 max-h-[75vh] overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 backdrop-blur-xl border ${
                isLight
                  ? "bg-white/98 border-slate-200 text-slate-800 shadow-slate-300/50"
                  : "bg-[#12151a]/98 border-white/10 text-white shadow-2xl"
              }`}>
                {/* 1. Clients & Folders */}
                {searchResults.matchedClients.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#16b09f] px-2.5 py-1 block font-semibold">
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
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                            isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-[#16b09f] transition-colors ${
                              isLight
                                ? "bg-slate-100 border-slate-200 group-hover:bg-[#16b09f] group-hover:text-black"
                                : "bg-neutral-800 border-white/5 group-hover:bg-[#16b09f] group-hover:text-black"
                            }`}>
                              <HiFolder className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-semibold truncate transition-colors ${
                                isLight ? "text-slate-900 group-hover:text-[#16b09f]" : "text-white group-hover:text-[#16b09f]"
                              }`}>
                                {client.clientName}
                              </div>
                              <div className={`text-[10px] truncate ${
                                isLight ? "text-slate-500" : "text-neutral-400"
                              }`}>
                                {client.category || "Client Folder"} â€¢{" "}
                                {client.works?.length || 0} works
                              </div>
                            </div>
                          </div>
                          <HiArrowRight className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                            isLight ? "text-slate-400 group-hover:text-slate-700" : "text-neutral-500 group-hover:text-white"
                          }`} />
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
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                            isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg border overflow-hidden shrink-0 ${
                              isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-800 border-white/5"
                            }`}>
                              {work.image ? (
                                <img
                                  src={work.image}
                                  alt={work.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center ${
                                  isLight ? "text-slate-400" : "text-neutral-500"
                                }`}>
                                  <HiPhoto className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-medium truncate transition-colors ${
                                isLight ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-300"
                              }`}>
                                {work.title}
                              </div>
                              <div className={`text-[10px] truncate flex items-center gap-1.5 ${
                                isLight ? "text-slate-500" : "text-neutral-400"
                              }`}>
                                <span>{work.clientName}</span>
                                <span className={`px-1 py-0.2 rounded font-mono text-[9px] ${
                                  isLight ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-white/5 text-neutral-300"
                                }`}>
                                  {work.aspect}
                                </span>
                              </div>
                            </div>
                          </div>
                          <HiArrowRight className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                            isLight ? "text-slate-400 group-hover:text-slate-700" : "text-neutral-500 group-hover:text-white"
                          }`} />
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
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                            isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center p-1 shrink-0 ${
                              isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5"
                            }`}>
                              {logo.file ? (
                                <img
                                  src={logo.file}
                                  alt={logo.name}
                                  className={`max-w-full max-h-full object-contain ${
                                    isLight ? "opacity-90" : "filter invert opacity-80"
                                  }`}
                                />
                              ) : (
                                <HiTag className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-medium truncate transition-colors ${
                                isLight ? "text-slate-900 group-hover:text-amber-600" : "text-white group-hover:text-amber-300"
                              }`}>
                                {logo.name}
                              </div>
                              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                                Marquee Row {logo.row}
                              </div>
                            </div>
                          </div>
                          <HiArrowRight className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                            isLight ? "text-slate-400 group-hover:text-slate-700" : "text-neutral-500 group-hover:text-white"
                          }`} />
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
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                              isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                                isLight
                                  ? "bg-sky-50 border-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white"
                                  : "bg-neutral-800 border-white/5 text-sky-400 group-hover:bg-sky-400 group-hover:text-black"
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className={`text-xs font-medium truncate transition-colors ${
                                  isLight ? "text-slate-900 group-hover:text-sky-600" : "text-white group-hover:text-sky-300"
                                }`}>
                                  {sec.label}
                                </div>
                                <div className={`text-[10px] truncate ${
                                  isLight ? "text-slate-500" : "text-neutral-400"
                                }`}>
                                  {sec.sub}
                                </div>
                              </div>
                            </div>
                            <HiArrowRight className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                              isLight ? "text-slate-400 group-hover:text-slate-700" : "text-neutral-500 group-hover:text-white"
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Empty State */}
                {searchResults.totalResults === 0 && (
                  <div className="p-4 text-center">
                    <p className={`text-xs font-medium ${isLight ? "text-slate-800" : "text-neutral-300"}`}>
                      {isId
                        ? `Tidak ada hasil untuk "${searchQuery}"`
                        : `No results found for "${searchQuery}"`}
                    </p>
                    <p className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
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
                      className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#16b09f] border transition-colors cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-200"
                          : "bg-white/5 hover:bg-white/10 border-white/10"
                      }`}
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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#16b09f]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#12151a] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-semibold text-white">
                    {tr("System Status", "Status Sistem", "Status Sistem")}
                  </span>
                  <span className="text-[10px] font-mono text-[#16b09f] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
                    {tr("Live Sync", "Sinkron Langsung", "Sinkron Langsuang")}
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                    <HiCheckCircle className="w-4 h-4 text-[#16b09f] shrink-0 mt-0.5" />
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

          {/* Top Navbar Action: Save Changes (Desktop Only - Mobile in Burger Menu) */}
          {showSaveChanges && onSaveChanges && (
            <button
              type="button"
              onClick={onSaveChanges}
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs transition-all shadow-md shadow-[#16b09f]/25 cursor-pointer active:scale-95"
              title={tr("Save Changes", "Simpan Perubahan", "Simpan Parubahan")}
            >
              <HiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{tr("Save Changes", "Simpan Perubahan", "Simpan Parubahan")}</span>
            </button>
          )}

          {/* Language Switcher Sliding Pill (Desktop Only - Matches Circular Image 1 Style) */}
          <div
            ref={langContainerRef}
            className={`hidden md:flex relative items-center rounded-full border transition-all duration-300 ease-out overflow-hidden text-xs font-sans h-9 select-none shrink-0 ${
              isLangOpen
                ? `w-[114px] ${
                    isLight
                      ? "bg-white/95 border-slate-300 shadow-md"
                      : "bg-[#0c0e12]/95 border-white/20 shadow-lg"
                  }`
                : `w-9 ${
                    isLight
                      ? "border-transparent shadow-xs hover:opacity-90"
                      : "border-transparent shadow-xs hover:opacity-90"
                  }`
            }`}
            style={{
              backgroundColor: !isLangOpen ? (primaryColor || "#16b09f") : undefined,
            }}
          >
            <div
              className="flex items-center w-[114px] h-full transition-transform duration-300 ease-out"
              style={{
                transform: isLangOpen
                  ? "translateX(0px)"
                  : `translateX(-${activeLangIndex * 38}px)`,
              }}
            >
              {languagesList.map((l) => {
                const isSelected = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLangOpen) {
                        setIsLangOpen(true);
                      } else {
                        setLang(l.code);
                        setIsLangOpen(false);
                      }
                    }}
                    style={
                      isSelected && isLangOpen
                        ? { backgroundColor: primaryColor || "#16b09f" }
                        : undefined
                    }
                    className={`w-[38px] h-full shrink-0 flex items-center justify-center font-bold text-xs tracking-tight transition-all duration-200 cursor-pointer select-none ${
                      !isLangOpen
                        ? "text-white font-bold drop-shadow-xs"
                        : isSelected
                        ? "text-white shadow-xs font-bold rounded-full"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                        : "text-neutral-400 hover:text-white hover:bg-white/10 rounded-full"
                    }`}
                    aria-label={`Switch to ${l.label}`}
                    title={
                      !isLangOpen
                        ? tr("Pilih Bahasa", "Change Language", "Pilih Bahaso")
                        : l.label
                    }
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Mode Toggle (Desktop Admin - Matches Circular Moon/Sun Button Style) */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-all active:scale-95 cursor-pointer select-none shrink-0 ${
              isLight
                ? "bg-white text-teal-600 border border-slate-200 hover:bg-slate-50 shadow-xs"
                : "bg-white/10 text-amber-400 border border-white/10 hover:bg-white/15"
            }`}
            title={
              isLight
                ? tr("Beralih ke Mode Gelap", "Switch to Dark Mode", "Pindah ka Mode Galok")
                : tr("Beralih ke Mode Terang", "Switch to Light Mode", "Pindah ka Mode Tarang")
            }
          >
            {isLight ? (
              <RiMoonFill className="w-4 h-4 text-teal-600" />
            ) : (
              <RiSunFill className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </header>
    </>
  );
}



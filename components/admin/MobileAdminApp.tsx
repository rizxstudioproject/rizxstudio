"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiHome5Fill,
  RiFolderFill,
  RiLineChartFill,
  RiSettings4Fill,
  RiSparklingFill,
  RiImageFill,
  RiMovieFill,
  RiGridFill,
  RiUser3Fill,
  RiCursorFill,
  RiPaletteFill,
  RiChat3Fill,
  RiSearchEyeFill,
  RiDeleteBinFill,
  RiPieChartFill,
  RiKeyFill,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiEyeLine,
  RiLogoutBoxRFill,
  RiSave3Fill,
  RiCheckFill,
  RiNotification3Line,
  RiCalendarLine,
  RiShieldCheckFill,
  RiRestartFill,
  RiSearchLine,
  RiGlobalLine,
  RiArrowDownSLine,
  RiGoogleFill,
  RiSunFill,
  RiMoonClearFill,
  RiCloseLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { ClientItem } from "@/context/PortfolioDataContext";
import { AdminSidebarTab } from "./AdminSidebar";
import ClientsWorkspace from "./ClientsWorkspace";
import CrmAnalyticsView from "./CrmAnalyticsView";
import SeoWorkspace from "./SeoWorkspace";
import SocialContactsWorkspace from "./SocialContactsWorkspace";
import ThemeColorWorkspace from "./ThemeColorWorkspace";
import MotionEffectsWorkspace from "./MotionEffectsWorkspace";
import RecycleBinWorkspace from "./RecycleBinWorkspace";
import StorageAnalyticsView from "./StorageAnalyticsView";
import SecuritySettingsWorkspace from "./SecuritySettingsWorkspace";
import HeroBannerWorkspace from "./HeroBannerWorkspace";
import { getRealLeads, CrmLead } from "@/lib/crmService";

interface MobileAdminAppProps {
  activeTab: AdminSidebarTab;
  onSelectTab: (tab: AdminSidebarTab) => void;
  clients: ClientItem[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  clientsWorkspaceView: "folders" | "logos";
  onWorkspaceViewChange: (view: "folders" | "logos") => void;
  totalWorks: number;
  trashCount: number;
  onLogout: () => void;
  onTopBarSave: () => Promise<void>;
  onTopBarReset: () => Promise<void>;
  isCloudSyncActive?: boolean;
  adminUser?: string;
  renderWorkspaceContent?: (tab: AdminSidebarTab) => React.ReactNode;
  onOpenAddFolder?: () => void;
  onOpenEditFolder?: (client: ClientItem) => void;
  onDeleteFolder?: (client: ClientItem) => void;
  onOpenUploadWork?: () => void;
  onOpenEditWork?: (work: any) => void;
  onDeleteWork?: (clientId: string, workId: string, workTitle: string) => void;
  onSaveClientDescription?: (clientId: string, desc: string, tools: string[]) => void;
  onUpdateClientFolder?: (clientId: string, updates: Partial<ClientItem>) => void;
  onReplaceCoverImage?: (clientId: string, file: File) => void;
  showToast?: (msg: string) => void;
  clSubtitle?: string;
  setClSubtitle?: (s: string) => void;
  clLogos?: any[];
  setClLogos?: (l: any[]) => void;
  newLogoName?: string;
  setNewLogoName?: (s: string) => void;
  newLogoRow?: 1 | 2;
  setNewLogoRow?: any;
  newLogoFile?: any;
  setNewLogoFile?: any;
  currentScreen?: "home" | "workspace";
  onScreenChange?: (screen: "home" | "workspace") => void;
}

export default function MobileAdminApp({
  activeTab,
  onSelectTab,
  clients,
  selectedClientId,
  onSelectClient,
  clientsWorkspaceView,
  onWorkspaceViewChange,
  totalWorks,
  trashCount,
  onLogout,
  onTopBarSave,
  onTopBarReset,
  isCloudSyncActive = true,
  adminUser = "FOMY R",
  renderWorkspaceContent,
  onOpenAddFolder,
  onOpenEditFolder,
  onDeleteFolder,
  onOpenUploadWork,
  onOpenEditWork,
  onDeleteWork,
  onSaveClientDescription,
  onUpdateClientFolder,
  onReplaceCoverImage,
  showToast,
  clSubtitle,
  setClSubtitle,
  clLogos,
  setClLogos,
  newLogoName,
  setNewLogoName,
  newLogoRow,
  setNewLogoRow,
  newLogoFile,
  setNewLogoFile,
  currentScreen: propCurrentScreen,
  onScreenChange,
}: MobileAdminAppProps) {
  const { lang, setLang, tr } = useLang();
  const { themeMode, toggleThemeMode, primaryColor, accentColor, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const languagesList = [
    { code: "en" as const, label: "EN" },
    { code: "id" as const, label: "ID" },
    { code: "min" as const, label: "MIN" },
  ];
  const activeLangIndex = Math.max(0, languagesList.findIndex((l) => l.code === lang));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Navigation: 'home' shows the native home dashboard from reference mockup
  // When activeTab !== 'home', it shows the specific workspace screen
  const [internalScreen, setInternalScreen] = useState<"home" | "workspace">("home");
  const currentScreen = propCurrentScreen !== undefined ? propCurrentScreen : internalScreen;
  const setCurrentScreen = (screen: "home" | "workspace") => {
    setInternalScreen(screen);
    if (onScreenChange) onScreenChange(screen);
  };
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [savingAction, setSavingAction] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch recent leads for the Hero Card and Inbound Banner
  useEffect(() => {
    getRealLeads()
      .then((data) => setLeads(data))
      .catch((e) => console.warn("Mobile app CRM read notice:", e));
  }, []);

  const totalLeadsCount = leads.length;
  const wonLeadsCount = leads.filter((l) => l.status === "Won").length;
  const pipelineValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Format currency in millions (e.g., Rp 183 Jt)
  const formatPipeline = (val: number) => {
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`;
    }
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  // CRM & SEO Infographic Chart State (Image 2 mockup design)
  const [chartMode, setChartMode] = useState<"crm" | "seo">("crm");
  const [activeDayIdx, setActiveDayIdx] = useState<number>(3); // Default Thursday (Kamis / thu) as in reference
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Sep");
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState<boolean>(false);

  const crmChartData = [
    { key: "mon", label: "mon", idLabel: "Sen", x: 10, y: 52, val: "Rp 42 Jt", desc: "Senin: 1 Deal Baru" },
    { key: "tue", label: "tue", idLabel: "Sel", x: 70, y: 20, val: "Rp 88 Jt", desc: "Selasa: 3 Prospek Masuk" },
    { key: "wed", label: "wed", idLabel: "Rab", x: 135, y: 64, val: "Rp 32 Jt", desc: "Rabu: Follow-up Negosiasi" },
    { key: "thu", label: "thu", idLabel: "Kam", x: 200, y: 25, val: "Rp 76 Jt", desc: "Kamis: 2 Kontrak Deal Won" },
    { key: "fri", label: "fri", idLabel: "Jum", x: 260, y: 38, val: "Rp 64 Jt", desc: "Jumat: Invoice Terbit" },
  ];

  const seoChartData = [
    { key: "mon", label: "mon", idLabel: "Sen", x: 10, y: 48, val: "1.4k Clicks", desc: "Senin: 5.2k Impresi Google" },
    { key: "tue", label: "tue", idLabel: "Sel", x: 70, y: 22, val: "3.9k Clicks", desc: "Selasa: Peringkat #1 Keywords" },
    { key: "wed", label: "wed", idLabel: "Rab", x: 135, y: 62, val: "1.8k Clicks", desc: "Rabu: Traffic Organik" },
    { key: "thu", label: "thu", idLabel: "Kam", x: 200, y: 26, val: "4.8k Clicks", desc: "Kamis: Viral Social Traffic" },
    { key: "fri", label: "fri", idLabel: "Jum", x: 260, y: 36, val: "3.6k Clicks", desc: "Jumat: Google SERP Snippet" },
  ];

  const currentDataset = chartMode === "crm" ? crmChartData : seoChartData;
  const activePoint = currentDataset[activeDayIdx] || currentDataset[3];

  const crmWavePoints = [
    { x: 10, y: 52 },
    { x: 70, y: 20 },
    { x: 105, y: 82 },
    { x: 135, y: 64 },
    { x: 165, y: 72 },
    { x: 200, y: 25 },
    { x: 232, y: 55 },
    { x: 260, y: 38 },
  ];

  const seoWavePoints = [
    { x: 10, y: 48 },
    { x: 70, y: 22 },
    { x: 105, y: 80 },
    { x: 135, y: 62 },
    { x: 165, y: 70 },
    { x: 200, y: 26 },
    { x: 232, y: 52 },
    { x: 260, y: 36 },
  ];

  const activeWavePoints = chartMode === "crm" ? crmWavePoints : seoWavePoints;

  const getSvgCurvePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const strokeCurve = getSvgCurvePath(activeWavePoints);
  const areaCurve = `${strokeCurve} L 260 100 L 10 100 Z`;

  const getTabTitle = (tab: AdminSidebarTab) => {
    switch (tab) {
      case "clients":
        return tr("Portofolio & Klien", "Portfolio & Clients", "Portofolio & Klien");
      case "crm":
        return tr("CRM & Prospek Leads", "CRM & Leads", "CRM & Prospek");
      case "seo":
        return tr("SEO & Mesin Pencari", "SEO & Search Engine", "SEO & Masin Pancari");
      case "settings":
        return tr("Setting Admin & Keamanan", "Admin Security & Settings", "Setting Admin & Kaamanan");
      case "social":
        return tr("Kontak & Media Sosial", "Socials & Contacts", "Kontak & Sosmed");
      case "theme":
        return tr("Warna, Tema & Kursor", "Theme, Colors & Cursor", "Warna, Tema & Kursor");
      case "motion":
        return tr("Motion & Efek Gerak", "Motion & Cursor", "Motion & Garakan");
      case "trash":
        return tr("Tong Sampah (Restore)", "Recycle Bin", "Tong Sarok");
      case "storage":
        return tr("Kapasitas & Penyimpanan", "Storage & Analytics", "Panyimpanan & Data");
      case "hero-banner":
      case "flagship":
      case "runner":
        return tr("Hero Banner & Media Reels", "Hero Banner & Media Reels", "Hero Banner & Media Reels");
      case "hero-works":
        return tr("Karya Unggulan", "Top Works", "Karya Tapiliah");
      case "about":
        return tr("Tentang Saya (About)", "About Me", "Tantang Ambo");
      default:
        return tab;
    }
  };

  const navigateToWorkspace = (tab: AdminSidebarTab) => {
    onSelectTab(tab);
    setCurrentScreen("workspace");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
  };

  const handleSaveWorkspace = async () => {
    setSavingAction(true);
    try {
      await onTopBarSave();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSavingAction(false);
    }
  };

  // ==============================================================
  // FULL BOTTOM DOCK ITEMS: 8 REQUESTED TOOLS + HOME, PORTOFOLIO & SETTINGS
  // Animated Curved Elevated Notch Dock with Touch Horizontal Scroll & Tap (Image 3 Style)
  // ==============================================================
  interface BottomDockItem {
    id: "home" | AdminSidebarTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    gradient: string;
    glow: string;
    badge?: number;
  }

  const bottomDockItems: BottomDockItem[] = [
    {
      id: "home",
      label: tr("Home", "Home", "Home"),
      icon: RiHome5Fill,
      accentColor: "#10b981",
      gradient: "from-emerald-500 to-teal-400",
      glow: "rgba(16, 185, 129, 0.45)",
    },
    {
      id: "clients",
      label: tr("Portofolio", "Portfolio", "Portofolio"),
      icon: RiFolderFill,
      accentColor: "#3b82f6",
      gradient: "from-blue-500 to-indigo-500",
      glow: "rgba(59, 130, 246, 0.45)",
    },
    {
      id: "trash",
      label: tr("Sampah", "Trash Bin", "Tong Sarok"),
      icon: RiDeleteBinFill,
      accentColor: "#ef4444",
      gradient: "from-rose-500 to-red-600",
      glow: "rgba(239, 68, 68, 0.45)",
      badge: trashCount > 0 ? trashCount : undefined,
    },
    {
      id: "crm",
      label: tr("CRM Leads", "CRM Leads", "CRM Prospek"),
      icon: RiLineChartFill,
      accentColor: "#10b981",
      gradient: "from-emerald-500 to-teal-500",
      glow: "rgba(16, 185, 129, 0.45)",
    },
    {
      id: "seo",
      label: tr("SEO Google", "Google SEO", "SEO Google"),
      icon: RiSearchEyeFill,
      accentColor: "#a855f7",
      gradient: "from-purple-500 to-violet-600",
      glow: "rgba(168, 85, 247, 0.45)",
    },
    {
      id: "hero-banner",
      label: tr("Banner & Reels", "Banner & Reels", "Banner & Reels"),
      icon: RiSparklingFill,
      accentColor: "#f59e0b",
      gradient: "from-amber-500 to-orange-400",
      glow: "rgba(245, 158, 11, 0.45)",
    },
    {
      id: "hero-works",
      label: tr("Unggulan", "Top Works", "Tapiliah"),
      icon: RiImageFill,
      accentColor: "#f43f5e",
      gradient: "from-rose-500 to-pink-500",
      glow: "rgba(244, 63, 94, 0.45)",
    },
    {
      id: "theme",
      label: tr("Thema", "Theme", "Thema"),
      icon: RiPaletteFill,
      accentColor: "#6366f1",
      gradient: "from-indigo-500 to-blue-600",
      glow: "rgba(99, 102, 241, 0.45)",
    },
    {
      id: "social",
      label: tr("Sosmed WA", "Socials", "Sosmed WA"),
      icon: RiChat3Fill,
      accentColor: "#14b8a6",
      gradient: "from-teal-500 to-emerald-500",
      glow: "rgba(20, 184, 166, 0.45)",
    },
    {
      id: "settings",
      label: tr("Setting", "Settings", "Setting"),
      icon: RiSettings4Fill,
      accentColor: "#64748b",
      gradient: "from-slate-600 to-slate-800",
      glow: "rgba(100, 116, 139, 0.45)",
    },
  ];

  const activeDockId = currentScreen === "home" ? "home" : activeTab;
  const mobileFrameRef = useRef<HTMLDivElement>(null);
  const dockScrollRef = useRef<HTMLDivElement>(null);
  const dockItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [gliderX, setGliderX] = useState<number | null>(null);
  const [isSaveFabExpanded, setIsSaveFabExpanded] = useState<boolean>(false);

  const updateGliderPosition = useCallback((targetId: string) => {
    const el = dockItemRefs.current[targetId];
    if (el) {
      const center = el.offsetLeft + el.offsetWidth / 2;
      setGliderX(center - 40);
    }
  }, []);

  const scrollActiveItemIntoView = (id: string, smooth = true) => {
    const el = dockItemRefs.current[id];
    if (el && dockScrollRef.current) {
      el.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        inline: "center",
        block: "nearest",
      });
    }
  };

  useEffect(() => {
    updateGliderPosition(activeDockId);
    const timer = setTimeout(() => {
      updateGliderPosition(activeDockId);
      scrollActiveItemIntoView(activeDockId, true);
    }, 50);
    const handleResize = () => updateGliderPosition(activeDockId);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeDockId, updateGliderPosition]);

  const handleDockClick = (id: string) => {
    updateGliderPosition(id);
    scrollActiveItemIntoView(id, true);
    if (id === "home") {
      setCurrentScreen("home");
    } else {
      navigateToWorkspace(id as AdminSidebarTab);
    }
  };

  return (
    <div
      ref={mobileFrameRef}
      className={`mobile-admin-app flex flex-col h-screen w-screen overflow-hidden font-sans select-none relative ${
        isLight ? "bg-[#f4f6fa] text-slate-900" : "bg-[#090b10] text-slate-100"
      }`}
    >
      {/* ==============================================================
          SCREEN 1: NATIVE MOBILE APP DASHBOARD (HOME VIEW)
          Inspired by User's Reference Mockup
         ============================================================== */}
      {currentScreen === "home" ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-36 space-y-5">
            {/* 1. TOP GREETING & PROFILE HEADER */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                {/* User Avatar / Brand Logo */}
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center p-2 shadow-sm ${
                    isLight
                      ? "bg-slate-100 border border-slate-200"
                      : "bg-neutral-900 border border-white/10"
                  }`}>
                    <img
                      src="/navbar-logo.png"
                      alt="Rizx Studio"
                      className={`w-full h-full object-contain ${isLight ? "" : "brightness-0 invert"}`}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 font-medium block">
                    {tr("Selamat Datang,", "Good Morning,", "Salamaik Datang,")}
                  </span>
                  <h1 className="text-lg font-extrabold tracking-tight">
                    {adminUser === "admin" ? "FOMY R" : adminUser}
                  </h1>
                </div>
              </div>

              {/* Action Buttons: Theme Mode, Language Selector, Live Web & Logout (Image 1 Style) */}
              <div className="flex items-center gap-2 relative">
                {/* 1. Theme Mode Toggle (Light/Dark Mode Circular Button - Image 1 Style) */}
                <button
                  type="button"
                  onClick={toggleThemeMode}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
                    isLight
                      ? "bg-slate-100 text-amber-500 border border-slate-200 hover:bg-slate-200"
                      : "bg-[#182030] text-amber-400 border border-white/10 hover:bg-white/10"
                  }`}
                  title={
                    isLight
                      ? tr("Beralih ke Mode Gelap", "Switch to Dark Mode", "Pindah ka Mode Galok")
                      : tr("Beralih ke Mode Terang", "Switch to Light Mode", "Pindah ka Mode Tarang")
                  }
                >
                  <RiSunFill className={`w-4 h-4 ${isLight ? "text-amber-500" : "text-amber-400"}`} />
                </button>

                {/* 2. Language Switcher Sliding Pill (Mirip pada Website Navbar: 1 compact circular pill -> slides open horizontally on tap) */}
                <div
                  ref={mobileLangRef}
                  className={`relative flex items-center rounded-full border transition-all duration-300 ease-out overflow-hidden text-xs font-mono h-9 ${
                    isLangMenuOpen
                      ? `w-[114px] ${isLight ? "bg-white/95 border-slate-300 shadow-md" : "bg-[#0c0e12]/95 border-white/20 shadow-lg"}`
                      : `w-9 ${isLight ? "border-slate-200 shadow-xs" : "border-white/15 shadow-sm"}`
                  }`}
                  style={{
                    backgroundColor: !isLangMenuOpen ? (primaryColor || "#16b09f") : undefined,
                  }}
                >
                  <div
                    className="flex items-center w-[114px] h-full transition-transform duration-300 ease-out"
                    style={{
                      transform: isLangMenuOpen ? "translateX(0px)" : `translateX(-${activeLangIndex * 38}px)`,
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
                            if (!isLangMenuOpen) {
                              setIsLangMenuOpen(true);
                            } else {
                              setLang(l.code);
                              setIsLangMenuOpen(false);
                            }
                          }}
                          style={
                            isSelected && isLangMenuOpen
                              ? { backgroundColor: primaryColor || "#16b09f" }
                              : undefined
                          }
                          className={`w-[38px] h-full shrink-0 flex items-center justify-center font-bold tracking-wider transition-all duration-200 cursor-pointer select-none ${
                            !isLangMenuOpen
                              ? "text-black font-black"
                              : isSelected
                              ? "text-black shadow-xs font-black rounded-full"
                              : isLight
                              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              : "text-neutral-400 hover:text-white hover:bg-white/10"
                          }`}
                          aria-label={`Ganti ke ${l.label}`}
                          title={!isLangMenuOpen ? tr("Pilih Bahasa", "Change Language", "Pilih Bahaso") : l.label}
                        >
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    isLight
                      ? "bg-white text-slate-700 shadow-sm border border-slate-200"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                  title={tr("Buka Web Publik", "View Live Website", "Bukak Web")}
                >
                  <RiEyeLine className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 2. INFOGRAPHIC GRAPHIC METRIC CARD (CRM & SEO Wavy Curve Chart) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-3xl p-5 shadow-xl border transition-all ${
                isLight
                  ? "bg-white border-slate-200/90 text-slate-800 shadow-slate-200/50"
                  : "bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#0a0f1d] border-white/10 text-white"
              }`}
            >
              {/* Subtle ambient light glow (Dark mode) */}
              {!isLight && (
                <div
                  className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: chartMode === "crm" ? primaryColor : "#06b6d4" }}
                />
              )}

              {/* Top Row: CRM vs SEO Switcher Tabs */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div
                  className={`inline-flex items-center p-1 rounded-2xl border transition-all ${
                    isLight
                      ? "bg-slate-100/90 border-slate-200/80"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setChartMode("crm")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      chartMode === "crm"
                        ? isLight
                          ? "bg-white text-slate-900 shadow-xs"
                          : "bg-white/20 text-white shadow-xs"
                        : isLight
                        ? "text-slate-500 hover:text-slate-900"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <RiShieldCheckFill className="w-3.5 h-3.5 text-emerald-500" />
                    <span>CRM Pipeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartMode("seo")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      chartMode === "seo"
                        ? isLight
                          ? "bg-white text-slate-900 shadow-xs"
                          : "bg-white/20 text-white shadow-xs"
                        : isLight
                        ? "text-slate-500 hover:text-slate-900"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <RiSearchEyeFill className="w-3.5 h-3.5 text-cyan-500" />
                    <span>SEO Google</span>
                  </button>
                </div>

                {/* Period Selector Dropdown Button matching Image 2 ("Sep v") */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
                        : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <span>{selectedPeriod}</span>
                    <RiArrowDownSLine className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {isPeriodMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className={`absolute right-0 top-full mt-1.5 w-28 rounded-xl border p-1 shadow-xl z-30 ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-800"
                            : "bg-[#141b2a] border-white/15 text-white"
                        }`}
                      >
                        {["Sep", "Okt", "Nov", "Minggu Ini"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(p);
                              setIsPeriodMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              selectedPeriod === p
                                ? "bg-emerald-500/10 text-emerald-500 font-bold"
                                : isLight
                                ? "hover:bg-slate-100"
                                : "hover:bg-white/10"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Main Metric Header Row (Big Value + Trend Subtitle) */}
              <div className="relative z-10 mb-2">
                <div className="text-2xl font-black tracking-tight flex items-baseline gap-2">
                  <span className={isLight ? "text-slate-900" : "text-white"}>
                    {chartMode === "crm"
                      ? pipelineValue > 0
                        ? formatPipeline(pipelineValue)
                        : "Rp 238 Jt"
                      : "14.8k Clicks"}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {chartMode === "crm" ? "+18.4%" : "+24.2%"}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {chartMode === "crm"
                    ? totalLeadsCount > 0
                      ? `${totalLeadsCount} Prospek Klien Terdaftar`
                      : "7 Prospek Klien Terdaftar"
                    : "Google Search Console Aktif & Terindeks"}
                </p>
              </div>

              {/* Graphic Area Wave Chart with Y-Axis (Matches Image 2) */}
              <div className="mt-3 flex items-stretch gap-2 relative">
                {/* Y-Axis Column matching Image 2: 100, 80, 60, 40, 20, 0 */}
                <div className="flex flex-col justify-between text-[10px] font-mono text-slate-400 select-none pb-5 text-right w-6 shrink-0">
                  <span>100</span>
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>

                {/* SVG Curve Wave Chart Container */}
                <div className="flex-1 relative pb-5">
                  {/* Floating active point tooltip */}
                  <div
                    className={`absolute -top-3 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md pointer-events-none transition-all duration-300 border ${
                      isLight
                        ? "bg-slate-900 text-white border-slate-700"
                        : "bg-white text-slate-900 border-white/20"
                    }`}
                    style={{
                      left: `${(activePoint.x / 270) * 100}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {activePoint.val}
                  </div>

                  <svg viewBox="0 0 270 100" className="w-full h-28 overflow-visible" preserveAspectRatio="none">
                    <defs>
                      {/* Dynamic Gradient for Area Fill */}
                      <linearGradient id="chartWaveFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={chartMode === "crm" ? "#8b5cf6" : "#06b6d4"}
                          stopOpacity={isLight ? "0.85" : "0.75"}
                        />
                        <stop
                          offset="60%"
                          stopColor={chartMode === "crm" ? "#a855f7" : "#10b981"}
                          stopOpacity={isLight ? "0.45" : "0.25"}
                        />
                        <stop
                          offset="100%"
                          stopColor={chartMode === "crm" ? "#c084fc" : "#10b981"}
                          stopOpacity="0.0"
                        />
                      </linearGradient>

                      {/* Dynamic Gradient for Curve Line */}
                      <linearGradient id="chartWaveStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={chartMode === "crm" ? "#3b82f6" : "#0ea5e9"} />
                        <stop offset="50%" stopColor={chartMode === "crm" ? "#8b5cf6" : "#06b6d4"} />
                        <stop offset="100%" stopColor={chartMode === "crm" ? "#a855f7" : "#10b981"} />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines at 100, 80, 60, 40, 20, 0 */}
                    {[5, 24, 43, 62, 81, 98].map((yVal, idx) => (
                      <line
                        key={idx}
                        x1="0"
                        y1={yVal}
                        x2="270"
                        y2={yVal}
                        stroke={isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.08)"}
                        strokeWidth="1"
                      />
                    ))}

                    {/* Filled Area Wave */}
                    <motion.path
                      key={`area-${chartMode}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      d={areaCurve}
                      fill="url(#chartWaveFill)"
                    />

                    {/* Stroke Curve Line */}
                    <motion.path
                      key={`stroke-${chartMode}`}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      d={strokeCurve}
                      fill="none"
                      stroke="url(#chartWaveStroke)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive Highlight Dot Marker (Image 2 style) */}
                    <g className="transition-all duration-300">
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="9"
                        fill={isLight ? "rgba(148, 163, 184, 0.35)" : "rgba(255, 255, 255, 0.25)"}
                      />
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="7"
                        fill={isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.45)"}
                      />
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="4"
                        fill={isLight ? "#64748b" : "#ffffff"}
                      />
                    </g>
                  </svg>

                  {/* X-Axis Day Labels: mon, tue, wed, thu, fri (Image 2 style) */}
                  <div className="flex justify-between mt-1 text-[11px] font-mono select-none">
                    {currentDataset.map((item, idx) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setActiveDayIdx(idx)}
                        className={`transition-all duration-200 cursor-pointer px-1 py-0.5 rounded ${
                          activeDayIdx === idx
                            ? isLight
                              ? "text-slate-900 font-bold scale-105"
                              : "text-white font-bold scale-105"
                            : isLight
                            ? "text-slate-400 hover:text-slate-600"
                            : "text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Row */}
              <div
                className={`mt-2 pt-3 border-t flex items-center justify-between text-xs ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}
              >
                <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                  <RiCalendarLine className="w-3.5 h-3.5" />
                  <span>
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {chartMode === "crm" ? (
                  <button
                    type="button"
                    onClick={() => navigateToWorkspace("crm")}
                    className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{tr("Kelola CRM", "Manage CRM", "Atua CRM")}</span>
                    <RiArrowRightLine className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigateToWorkspace("seo")}
                    className="text-xs font-bold text-cyan-500 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{tr("Buka SEO & SERP", "Open SEO", "Bukak SEO")}</span>
                    <RiArrowRightLine className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* 3. STUDIO OVERVIEW PODS (Matches "Health Overview" in Reference) */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold tracking-tight">
                  {tr("Ringkasan Studio", "Studio Overview", "Ringkasan Studio")}
                </h2>
                <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                  <span>{tr("Real-time Cloud", "Real-time Cloud", "Real-time Cloud")}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Pod 1: Total Karya */}
                <div
                  onClick={() => navigateToWorkspace("clients")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                    isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#111622] border-white/10"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-neutral-400 block uppercase tracking-wider">
                    {tr("Karya", "Works", "Karya")}
                  </span>
                  <div className="text-xl font-black mt-1">{totalWorks}</div>
                  <span className="text-[10px] text-blue-500 font-semibold block mt-0.5">
                    {clients.length} {tr("Folder", "Folders", "Folder")}
                  </span>
                </div>

                {/* Pod 2: Prospek Leads */}
                <div
                  onClick={() => navigateToWorkspace("crm")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                    isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#111622] border-white/10"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-neutral-400 block uppercase tracking-wider">
                    {tr("Prospek", "Leads", "Prospek")}
                  </span>
                  <div className="text-xl font-black mt-1 text-emerald-400">{totalLeadsCount}</div>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                    {wonLeadsCount} Won
                  </span>
                </div>

                {/* Pod 3: Kapasitas */}
                <div
                  onClick={() => navigateToWorkspace("storage")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                    isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#111622] border-white/10"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-neutral-400 block uppercase tracking-wider">
                    {tr("Memori", "Storage", "Memori")}
                  </span>
                  <div className="text-xl font-black mt-1 text-purple-400">18.4</div>
                  <span className="text-[10px] text-purple-500 font-semibold block mt-0.5">
                    MB / 100 MB
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>
      ) : (
        /* ==============================================================
            SCREEN 2 & 3: WORKSPACE & EDITOR SHEET (WORK VIEW)
            With Native Back Navigation & Sticky Bottom Action Bar
           ============================================================== */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Navigation Bar with Home Button */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
              isLight ? "bg-white border-slate-200" : "bg-[#0d1017] border-white/10"
            }`}
          >
            {/* Home Icon Only Button (Without Text - Matches User Request) */}
            <button
              type="button"
              onClick={handleBackToHome}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              }`}
              title="Home"
            >
              <RiHome5Fill className="w-4 h-4 text-emerald-400" />
            </button>

            <span className="text-xs font-bold tracking-tight truncate max-w-[200px]">
              {getTabTitle(activeTab)}
            </span>

            {/* Spacer for balanced title centering */}
            <div className="w-9 h-9" />
          </div>

          {/* Workspace Body Container with bottom padding for sticky bar */}
          <div className="flex-1 overflow-y-auto pb-48">
            {activeTab === "clients" && (
              <ClientsWorkspace
                clients={clients}
                selectedClientId={selectedClientId || clients[0]?.id || ""}
                workspaceView={clientsWorkspaceView}
                onWorkspaceViewChange={onWorkspaceViewChange}
                onSelectClient={(id) => onSelectClient(id)}
                onOpenAddFolder={onOpenAddFolder || (() => {})}
                onOpenEditFolder={onOpenEditFolder || (() => {})}
                onDeleteFolder={onDeleteFolder || (() => {})}
                onOpenUploadWork={onOpenUploadWork || (() => {})}
                onOpenEditWork={onOpenEditWork || (() => {})}
                onDeleteWork={onDeleteWork || (() => {})}
                onSaveClientDescription={onSaveClientDescription || (() => {})}
                onUpdateClientFolder={onUpdateClientFolder}
                onReplaceCoverImage={onReplaceCoverImage}
                onViewWebsite={() => {
                  if (typeof window !== "undefined") {
                    window.open("/", "_blank");
                  }
                }}
                showToast={showToast || (() => {})}
                clSubtitle={clSubtitle}
                setClSubtitle={setClSubtitle}
                clLogos={clLogos}
                setClLogos={setClLogos as any}
                newLogoName={newLogoName}
                setNewLogoName={setNewLogoName}
                newLogoRow={newLogoRow as any}
                setNewLogoRow={setNewLogoRow as any}
                newLogoFile={typeof newLogoFile === "string" ? newLogoFile : undefined}
                setNewLogoFile={setNewLogoFile as any}
              />
            )}

            {activeTab === "crm" && <CrmAnalyticsView />}

            {activeTab === "seo" && <SeoWorkspace />}

            {activeTab === "social" && <SocialContactsWorkspace />}

            {activeTab === "theme" && <ThemeColorWorkspace />}

            {activeTab === "motion" && <MotionEffectsWorkspace />}

            {activeTab === "trash" && (
              <RecycleBinWorkspace showToast={showToast || (() => {})} />
            )}

            {activeTab === "storage" && (
              <StorageAnalyticsView
                showToast={showToast || (() => {})}
                onNavigateToTrash={() => onSelectTab("trash")}
              />
            )}

            {activeTab === "hero-banner" && (
              <HeroBannerWorkspace showToast={showToast || (() => {})} />
            )}

            {activeTab === "runner" && (
              <HeroBannerWorkspace initialTab="reels" showToast={showToast || (() => {})} />
            )}

            {activeTab === "flagship" && (
              <HeroBannerWorkspace initialTab="showcase" showToast={showToast || (() => {})} />
            )}

            {activeTab === "settings" && (
              <SecuritySettingsWorkspace
                showToast={showToast || (() => {})}
                onLogout={onLogout}
              />
            )}

            {renderWorkspaceContent &&
              activeTab !== "clients" &&
              activeTab !== "crm" &&
              activeTab !== "seo" &&
              activeTab !== "social" &&
              activeTab !== "theme" &&
              activeTab !== "motion" &&
              activeTab !== "trash" &&
              activeTab !== "storage" &&
              activeTab !== "hero-banner" &&
              activeTab !== "runner" &&
              activeTab !== "flagship" &&
              activeTab !== "settings" &&
              renderWorkspaceContent(activeTab)}
          </div>

          {/* DRAGGABLE FLOATING SAVE ACTION (Bisa digeser bebas di dalam frame, tap untuk slide/expand) */}
          <motion.div
            drag
            dragConstraints={mobileFrameRef}
            dragElastic={0.08}
            dragMomentum={false}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed bottom-[104px] right-4 z-40 cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: "none" }}
          >
            <AnimatePresence mode="wait">
              {!isSaveFabExpanded ? (
                /* 1. COMPACT FLOATING ICON BUBBLE (Tapped to slide open) */
                <motion.button
                  key="fab-bubble"
                  type="button"
                  layoutId="floatingSaveContainer"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSaveFabExpanded(true)}
                  className="relative flex items-center justify-center rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-2 border-white/25 backdrop-blur-xl transition-all cursor-pointer"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 8px 24px ${primaryColor}66`,
                    width: "52px",
                    height: "52px",
                  }}
                  title={tr("Simpan Perubahan", "Save Changes", "Simpan Parubahan")}
                >
                  <RiSave3Fill className="w-5 h-5 text-white drop-shadow" />
                  {/* Status Pulse Pip */}
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#090b10]" />
                  </span>
                </motion.button>
              ) : (
                /* 2. EXPANDED SLIDER CARD (Slide open with Sync Status & Save Changes Button) */
                <motion.div
                  key="fab-slider"
                  layoutId="floatingSaveContainer"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className={`flex items-center gap-2.5 p-2 pl-3 rounded-2xl border shadow-2xl backdrop-blur-2xl max-w-[340px] ${
                    isLight
                      ? "bg-white/98 border-slate-200/90 shadow-[0_14px_40px_rgba(15,23,42,0.18)]"
                      : "bg-[#0c101a]/98 border-white/15 shadow-[0_16px_45px_rgba(0,0,0,0.85)]"
                  }`}
                >
                  {/* Sync Status Badge */}
                  <div className="flex flex-col text-left shrink-0 pr-1">
                    <span className="text-neutral-400 block text-[9px] font-medium leading-tight">
                      {tr("Status Sinkron", "Sync Status", "Status Sinkron")}
                    </span>
                    <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{savedSuccess ? tr("Tersimpan!", "Saved!", "Tasimpan!") : tr("Cloud Siap", "Cloud Ready", "Cloud Siap")}</span>
                    </span>
                  </div>

                  {/* Save Changes Action Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSaveWorkspace();
                      // Auto-collapse after save
                      setTimeout(() => setIsSaveFabExpanded(false), 800);
                    }}
                    disabled={savingAction}
                    className="flex-1 py-2 px-3.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 6px 18px ${primaryColor}55`,
                    }}
                  >
                    <RiSave3Fill className="w-3.5 h-3.5" />
                    <span>
                      {savingAction
                        ? tr("Menyimpan...", "Saving...", "Manyimpan...")
                        : tr("Simpan Perubahan", "Save Changes", "Simpan")}
                    </span>
                    <RiArrowRightLine className="w-3.5 h-3.5" />
                  </button>

                  {/* Collapse / Close Button */}
                  <button
                    type="button"
                    onClick={() => setIsSaveFabExpanded(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title={tr("Tutup", "Close", "Tutuik")}
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* ==============================================================
          FULL-WIDTH BOTTOM DOCK / TAB BAR (SCROLL & TAP)
          Full-width frame to bottom (bottom-0) and left/right (left-0 right-0).
          Pin Bar (Notch & Bubble) glides across the dock.
         ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 w-full pointer-events-auto select-none">
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full relative"
        >
          {/* Ambient Background Glow behind Dock */}
          <div
            className="absolute inset-x-0 bottom-0 top-4 blur-2xl opacity-20 pointer-events-none transition-all duration-500"
            style={{
              backgroundColor:
                bottomDockItems.find((it) => it.id === activeDockId)?.accentColor || "#10b981",
            }}
          />

          {/* Full-width Base Bar Background (Spans edge-to-edge, full to bottom) */}
          <div
            className={`absolute inset-x-0 top-[18px] bottom-0 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all ${
              isLight
                ? "bg-white/98 border-t border-slate-200/90"
                : "bg-[#0c101a]/98 border-t border-white/10"
            }`}
          />

          {/* Scrollable Container with Headroom for Elevated Cutout Notch */}
          <div
            ref={dockScrollRef}
            className="relative flex items-center h-[88px] sm:h-[92px] w-full overflow-x-auto no-scrollbar scroll-smooth"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="relative flex items-center min-w-full h-full px-4">
              {/* 1. Gliding Cutout Notch & Elevated Circle (Niuuguo Tabbar No.04 Concept) */}
              {gliderX !== null && (
                <motion.div
                  initial={false}
                  animate={{ x: gliderX }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="absolute top-0 left-0 w-[80px] h-[88px] sm:h-[92px] pointer-events-none z-20"
                >
                  {/* Cutout Notch SVG: Cuts into the bar with page background color and fluid curved border */}
                  <svg
                    className="absolute left-0 top-[18px] w-[80px] h-[38px] pointer-events-none"
                    viewBox="0 0 80 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 0 0 C 14 0, 18 20, 26 29 C 33 35, 47 35, 54 29 C 62 20, 66 0, 80 0 L 80 -4 L 0 -4 Z"
                      fill={isLight ? "#f4f6fa" : "#090b10"}
                    />
                    <path
                      d="M 0 0 C 14 0, 18 20, 26 29 C 33 35, 47 35, 54 29 C 62 20, 66 0, 80 0"
                      fill="none"
                      stroke={isLight ? "rgba(203, 213, 225, 0.9)" : "rgba(255, 255, 255, 0.15)"}
                      strokeWidth="1.5"
                    />
                  </svg>

                  {/* Floating Elevated Active Circle Bubble */}
                  <div
                    className={`absolute left-[16px] top-[2px] w-[48px] h-[48px] rounded-full flex items-center justify-center shadow-xl bg-gradient-to-tr ${
                      bottomDockItems.find((it) => it.id === activeDockId)?.gradient ||
                      "from-emerald-500 to-teal-400"
                    }`}
                    style={{
                      boxShadow: `0 8px 24px ${
                        bottomDockItems.find((it) => it.id === activeDockId)?.glow ||
                        "rgba(16, 185, 129, 0.45)"
                      }`,
                      border: isLight ? "3px solid #ffffff" : "3px solid #090b10",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {(() => {
                        const curItem = bottomDockItems.find((it) => it.id === activeDockId);
                        const CurIcon = curItem ? curItem.icon : RiHome5Fill;
                        return (
                          <motion.div
                            key={activeDockId}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center justify-center"
                          >
                            <CurIcon className="w-6 h-6 text-white drop-shadow-sm" />
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                    {(() => {
                      const curItem = bottomDockItems.find((it) => it.id === activeDockId);
                      if (curItem?.badge !== undefined && curItem.badge > 0) {
                        return (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold shadow-md">
                            {curItem.badge}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </motion.div>
              )}

              {/* 2. Stationary Dock Buttons (Icons stay firmly in their slots, hiding only when active under the glider) */}
              <div className="z-10 flex items-center gap-1.5 w-full h-full pt-[14px] pb-[max(14px,env(safe-area-inset-bottom,14px))]">
                {bottomDockItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeDockId === item.id;

                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        dockItemRefs.current[item.id] = el;
                      }}
                      type="button"
                      onClick={() => handleDockClick(item.id)}
                      className="relative flex items-center justify-center shrink-0 cursor-pointer focus:outline-none select-none h-full py-1"
                      style={{ minWidth: "58px" }}
                      title={item.label}
                    >
                      <span
                        className={`transition-all duration-200 flex items-center justify-center ${
                          isActive
                            ? "opacity-0 scale-75"
                            : isLight
                            ? "opacity-100 text-slate-400 hover:text-slate-800 scale-100"
                            : "opacity-100 text-neutral-400 hover:text-white scale-100"
                        }`}
                      >
                        <Icon className="w-6 h-6 drop-shadow-sm" />
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold shadow-md">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

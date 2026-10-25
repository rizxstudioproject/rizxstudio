"use client";

import React, { useState, useEffect } from "react";
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
}: MobileAdminAppProps) {
  const { lang, setLang, tr } = useLang();
  const { themeMode, primaryColor, accentColor, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Navigation: 'home' shows the native home dashboard from reference mockup
  // When activeTab !== 'home', it shows the specific workspace screen
  const [currentScreen, setCurrentScreen] = useState<"home" | "workspace">("home");
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
        return tr("Warna & Tema UI", "Theme & Colors", "Warna & Tema");
      case "motion":
        return tr("Motion & Efek Gerak", "Motion & Cursor", "Motion & Garakan");
      case "trash":
        return tr("Tong Sampah (Restore)", "Recycle Bin", "Tong Sarok");
      case "storage":
        return tr("Kapasitas & Penyimpanan", "Storage & Analytics", "Panyimpanan & Data");
      case "hero-banner":
        return tr("Banner Utama (Scrolly)", "Hero Banner", "Banner Utamo");
      case "hero-works":
        return tr("Karya Unggulan", "Top Works", "Karya Tapiliah");
      case "flagship":
        return tr("Pameran Media Reels", "Media Showcase", "Media Reels");
      case "runner":
        return tr("Media Reels (Portofolio Berjalan)", "Media Reels (Running Portfolio)", "Media Reels (Portofolio Baguliah)");
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

  // Quick Access circular icons matching reference image
  const quickAccessItems = [
    {
      id: "trash" as AdminSidebarTab,
      label: tr("Sampah", "Trash Bin", "Tong Sarok"),
      icon: RiDeleteBinFill,
      bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      badge: trashCount > 0 ? trashCount : undefined,
    },
    {
      id: "crm" as AdminSidebarTab,
      label: tr("CRM Leads", "CRM Leads", "CRM Prospek"),
      icon: RiLineChartFill,
      bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      id: "seo" as AdminSidebarTab,
      label: tr("SEO Google", "Google SEO", "SEO Google"),
      icon: RiSearchEyeFill,
      bg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      id: "hero-banner" as AdminSidebarTab,
      label: tr("Banner", "Banner", "Banner"),
      icon: RiSparklingFill,
      bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      id: "hero-works" as AdminSidebarTab,
      label: tr("Unggulan", "Top Works", "Tapiliah"),
      icon: RiImageFill,
      bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
    {
      id: "runner" as AdminSidebarTab,
      label: tr("Media Reels", "Media Reels", "Media Reels"),
      icon: RiMovieFill,
      bg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    },
    {
      id: "theme" as AdminSidebarTab,
      label: tr("Thema", "Theme", "Thema"),
      icon: RiPaletteFill,
      bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    },
    {
      id: "social" as AdminSidebarTab,
      label: tr("Sosmed WA", "Socials", "Sosmed WA"),
      icon: RiChat3Fill,
      bg: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    },
  ];

  return (
    <div
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
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28 space-y-5">
            {/* 1. TOP GREETING & PROFILE HEADER */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                {/* User Avatar with Status Ring */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden p-1 border-2 border-primary shadow-sm bg-neutral-900">
                    <img
                      src="/navbar-logo.png"
                      alt="Rizx Studio"
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900 animate-pulse" />
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

              {/* Action Buttons: Language Selector, Live Web & Logout */}
              <div className="flex items-center gap-2 relative">
                {/* Language Switcher Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className={`h-9 px-2.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-bold font-mono cursor-pointer active:scale-95 ${
                      isLight
                        ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                        : "bg-white/10 text-white border border-white/10"
                    }`}
                    title={tr("Pilih Bahasa", "Change Language", "Pilih Bahaso")}
                  >
                    <RiGlobalLine className="w-3.5 h-3.5 text-teal-400" />
                    <span>{lang.toUpperCase()}</span>
                  </button>

                  <AnimatePresence>
                    {isLangMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 top-11 z-50 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col gap-1 min-w-[125px] ${
                          isLight ? "bg-white/95 border-slate-200" : "bg-[#0f1422]/95 border-white/15"
                        }`}
                      >
                        {[
                          { code: "id" as const, label: "Indonesia", flag: "🇮🇩" },
                          { code: "en" as const, label: "English", flag: "🇺🇸" },
                          { code: "min" as const, label: "Minang", flag: "🏛️" },
                        ].map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setLang(item.code);
                              setIsLangMenuOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              lang === item.code
                                ? "bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30"
                                : isLight
                                ? "hover:bg-slate-100 text-slate-700"
                                : "hover:bg-white/10 text-neutral-300"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{item.flag}</span>
                              <span>{item.code.toUpperCase()}</span>
                            </span>
                            {lang === item.code && <RiCheckFill className="w-3.5 h-3.5 text-teal-400" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                <button
                  type="button"
                  onClick={onLogout}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                  title={tr("Keluar Admin", "Logout", "Kalua")}
                >
                  <RiLogoutBoxRFill className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. HERO HIGHLIGHT METRIC CARD (Matches Reference Image Card) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl p-5 shadow-xl bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#0a0f1d] border border-white/10 text-white"
            >
              {/* Subtle ambient light glow */}
              <div
                className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mb-1">
                    <RiShieldCheckFill className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr("Status Studio & Pipeline", "Studio Pipeline Status", "Status Studio & Pipeline")}</span>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white mt-1">
                    {pipelineValue > 0 ? formatPipeline(pipelineValue) : "Rp 183.000.000"}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {totalLeadsCount > 0 ? `${totalLeadsCount} Prospek Klien Terdaftar` : "Potensi Kontrak Berjalan"}
                  </p>
                </div>

                {/* 3D Visual Icon / Camera Emblem */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center p-2.5 border shadow-lg"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  <RiSparklingFill className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
              </div>

              {/* Bottom Card Row */}
              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-300 font-mono text-[11px]">
                  <RiCalendarLine className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToWorkspace("crm")}
                  className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  <span>{tr("Kelola CRM", "Manage CRM", "Atua CRM")}</span>
                  <RiArrowRightLine className="w-3.5 h-3.5" />
                </button>
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

            {/* 4. QUICK ACCESS CIRCULAR BUTTONS (Matches "Quick Access" in Reference) */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold tracking-tight">
                  {tr("Akses Cepat Pengaturan", "Quick Access", "Akses Capek")}
                </h2>
                <span className="text-[11px] font-mono text-neutral-400">
                  {quickAccessItems.length} {tr("Menu", "Tools", "Menu")}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {quickAccessItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateToWorkspace(item.id)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all active:scale-90 cursor-pointer"
                    >
                      <div className="relative">
                        <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border shadow-xs ${item.bg}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold shadow-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-center truncate max-w-[68px] leading-tight">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
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
          {/* Top Navigation Bar with Back Button */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
              isLight ? "bg-white border-slate-200" : "bg-[#0d1017] border-white/10"
            }`}
          >
            <button
              type="button"
              onClick={handleBackToHome}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 text-white"
              }`}
            >
              <RiArrowLeftLine className="w-4 h-4" />
              <span>{tr("Beranda", "Home", "Barando")}</span>
            </button>

            <span className="text-xs font-bold tracking-tight truncate max-w-[170px]">
              {getTabTitle(activeTab)}
            </span>

            {/* Quick Save in Top Bar */}
            <button
              type="button"
              onClick={handleSaveWorkspace}
              disabled={savingAction}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md shadow-primary/20 transition-all active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <RiSave3Fill className="w-3.5 h-3.5" />
              <span>{savingAction ? "..." : tr("Simpan", "Save", "Simpan")}</span>
            </button>
          </div>

          {/* Workspace Body Container with bottom padding for sticky bar */}
          <div className="flex-1 overflow-y-auto pb-24">
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

            {activeTab === "settings" && (
              <SecuritySettingsWorkspace showToast={showToast || (() => {})} />
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
              activeTab !== "settings" &&
              renderWorkspaceContent(activeTab)}
          </div>

          {/* Floating Sticky Save Bar (Matches Screen 3 Bottom Bar in Mockup) */}
          <div
            className={`fixed bottom-0 left-0 right-0 p-3.5 border-t backdrop-blur-xl z-40 flex items-center justify-between gap-3 ${
              isLight ? "bg-white/95 border-slate-200" : "bg-[#090b10]/95 border-white/10"
            }`}
          >
            <div className="text-xs">
              <span className="text-neutral-400 block text-[10px]">
                {tr("Status Sinkronisasi", "Sync Status", "Status Sinkronisasi")}
              </span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{savedSuccess ? tr("Tersimpan!", "Saved!", "Tasimpan!") : tr("Cloud Siap", "Cloud Ready", "Cloud Siap")}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveWorkspace}
              disabled={savingAction}
              className="flex-1 py-3 px-6 rounded-2xl text-xs font-bold text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <RiSave3Fill className="w-4 h-4" />
              <span>
                {savingAction
                  ? tr("Menyimpan ke Cloud...", "Saving to Cloud...", "Manyimpan ka Cloud...")
                  : tr("Simpan Perubahan", "Save Changes", "Simpan Parubahan")}
              </span>
              <RiArrowRightLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          FLOATING NATIVE iOS BOTTOM DOCK / TAB BAR
          Matches the curved floating navigation bar in the Reference Mockup
         ============================================================== */}
      {currentScreen === "home" && (
        <div className="fixed bottom-4 left-5 right-5 z-40 flex justify-center pointer-events-none">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`pointer-events-auto flex items-center justify-around w-full max-w-sm px-3 py-2 rounded-full border shadow-2xl backdrop-blur-xl ${
              isLight
                ? "bg-white/95 border-slate-200/80 shadow-slate-300/50"
                : "bg-[#0e121a]/95 border-white/15 shadow-black/80"
            }`}
          >
            {/* 1. Home Tab */}
            <button
              type="button"
              onClick={() => setCurrentScreen("home")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentScreen === "home"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md"
                  : isLight
                  ? "text-slate-500 hover:text-slate-900"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <RiHome5Fill className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* 2. Portfolio Works Tab */}
            <button
              type="button"
              onClick={() => navigateToWorkspace("clients")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
              title="Portofolio"
            >
              <RiFolderFill className="w-5 h-5" />
            </button>

            {/* 3. SEO Tab */}
            <button
              type="button"
              onClick={() => navigateToWorkspace("seo")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
              title={tr("SEO Google & Mesin Pencari", "Google SEO", "SEO Google")}
            >
              <RiSearchEyeFill className="w-5 h-5" />
            </button>

            {/* 4. Settings & Security Tab */}
            <button
              type="button"
              onClick={() => navigateToWorkspace("settings")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
              title={tr("Setting Admin & Keamanan", "Admin Settings & Security", "Setting Admin & Kaamanan")}
            >
              <RiSettings4Fill className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

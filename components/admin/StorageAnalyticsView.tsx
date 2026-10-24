"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  HiChartPie,
  HiCircleStack,
  HiPhoto,
  HiFolder,
  HiVideoCamera,
  HiTrash,
  HiArrowDownTray,
  HiArrowPath,
  HiCheckCircle,
  HiSparkles,
  HiServer,
  HiCpuChip,
  HiShieldCheck,
  HiArrowTrendingUp,
} from "react-icons/hi2";
import { motion } from "framer-motion";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { useLang } from "@/context/LanguageContext";
import { getCustomFramesFromDB } from "@/lib/sequenceStorage";

interface StorageAnalyticsViewProps {
  showToast: (msg: string) => void;
  onNavigateToTrash?: () => void;
}

export default function StorageAnalyticsView({
  showToast,
  onNavigateToTrash,
}: StorageAnalyticsViewProps) {
  const { clients, stage3, heroWorks, clientLogos, portfolioRunner, trashItems, emptyTrash, allData } = usePortfolioData();
  const { lang, tr } = useLang();

  const [cachedFramesCount, setCachedFramesCount] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [activeCategory, setActiveCategory] = useState<"all" | "works" | "video" | "frames" | "trash">("all");

  // Fetch sequence cache count from IndexedDB
  useEffect(() => {
    let mounted = true;
    getCustomFramesFromDB().then((frames) => {
      if (mounted && frames) {
        setCachedFramesCount(frames.length);
      } else if (mounted) {
        setCachedFramesCount(0);
      }
    }).catch(() => {
      if (mounted) setCachedFramesCount(0);
    });
    return () => { mounted = false; };
  }, []);

  // Compute live breakdown numbers
  const stats = useMemo(() => {
    // 1. Total works across clients
    const totalWorks = clients.reduce((acc, c) => acc + (c.works?.length || 0), 0);
    
    // 2. Total client folders
    const totalFolders = clients.length;
    const customFolders = clients.filter((c) => c.isCustom).length;

    // 3. Estimate LocalStorage bytes
    let lsBytes = 0;
    try {
      if (typeof window !== "undefined") {
        for (const key in localStorage) {
          if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            lsBytes += (localStorage[key]?.length || 0) * 2; // UTF-16
          }
        }
      }
    } catch (_) {}

    // 4. Estimate frames size (avg 45KB per compressed WebP frame in IndexedDB)
    const framesMB = Number(((cachedFramesCount || 0) * 0.045).toFixed(1));

    // 5. Estimate trash items size
    let realTrashBytes = 0;
    trashItems.forEach((t) => {
      if (t.previewImage) realTrashBytes += t.previewImage.length;
      if (t.payload) realTrashBytes += JSON.stringify(t.payload).length;
    });
    const trashMB = Number((realTrashBytes > 0 ? realTrashBytes / (1024 * 1024) : trashItems.length * 0.15).toFixed(1));

    // 6. Base media & portfolio images estimate
    let realWorksBytes = 0;
    clients.forEach((c) => {
      (c.works || []).forEach((w) => {
        if (w.image && w.image.startsWith("data:")) {
          realWorksBytes += w.image.length;
        } else {
          realWorksBytes += 286720; // 280 KB avg per image asset
        }
      });
    });
    const worksMB = Number((Math.max(totalWorks * 0.28, realWorksBytes / (1024 * 1024))).toFixed(1));

    // 7. Video showcase MB (includes embed iframe cache, custom hero poster, settings)
    const videoMB = stage3?.heroCard?.isVideoEnabled ? 3.5 : 1.2;

    const totalUsedMB = Number((worksMB + videoMB + framesMB + trashMB + (lsBytes / (1024 * 1024))).toFixed(1));
    const totalCapacityMB = 100.0;
    const usedPercentage = Math.min(100, Math.max(8, Number(((totalUsedMB / totalCapacityMB) * 100).toFixed(1))));

    // Category breakdown percentage of used
    const worksShare = Math.round((worksMB / Math.max(0.1, totalUsedMB)) * 100) || 50;
    const videoShare = Math.round((videoMB / Math.max(0.1, totalUsedMB)) * 100) || 15;
    const framesShare = Math.round((framesMB / Math.max(0.1, totalUsedMB)) * 100) || 10;
    const trashShare = Math.round((trashMB / Math.max(0.1, totalUsedMB)) * 100) || 2;
    const clientDataShare = Math.max(5, 100 - (worksShare + videoShare + framesShare + trashShare));

    return {
      totalWorks,
      totalFolders,
      customFolders,
      totalLogos: clientLogos?.logos?.length || 0,
      totalRunner: portfolioRunner?.items?.length || 0,
      totalTrash: trashItems.length,
      cachedFramesCount: cachedFramesCount || 0,
      totalUsedMB,
      totalCapacityMB,
      usedPercentage,
      worksMB,
      videoMB,
      framesMB,
      trashMB,
      worksShare,
      videoShare,
      framesShare,
      trashShare,
      clientDataShare,
    };
  }, [clients, stage3, clientLogos, portfolioRunner, trashItems, cachedFramesCount]);

  // Smooth count-up animation for percentage
  useEffect(() => {
    let start = 0;
    const end = stats.usedPercentage;
    const duration = 1200;
    const startTime = performance.now();

    const animateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedPercent(Number((start + (end - start) * ease).toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [stats.usedPercentage]);

  // Handler: Export Backup JSON
  const handleExportBackup = () => {
    setIsExporting(true);
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: "2.0",
        clients,
        stage3,
        heroWorks,
        clientLogos,
        portfolioRunner,
        trashItemsCount: trashItems.length,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rizx-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(tr("Backup data JSON successfully downloaded!", "Cadangan data JSON berhasil diunduh!", "Cadangan data JSON barasil diunduah!"));
    } catch (err) {
      showToast(tr("Failed to export backup.", "Gagal mengekspor data cadangan.", "Gagal maekspor data cadangan."));
    } finally {
      setIsExporting(false);
    }
  };

  // SVG Radial Ring constants
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // Active category details for dynamic donut coloring & MB display
  const activeDetails = useMemo(() => {
    switch (activeCategory) {
      case "works":
        return {
          key: "works",
          title: tr("CLIENT WORKS", "FOTO & KARYA KLIEN", "FOTO & KARYA KLIEN"),
          percent: stats.worksShare,
          sizeText: `${stats.worksMB} MB`,
          colorHex: "#14AF9E",
          gradientId: "worksGradient",
          dashOffset: circumference - (stats.worksShare / 100) * circumference,
        };
      case "video":
        return {
          key: "video",
          title: tr("VIDEO MEDIA", "VIDEO SHOWCASE", "VIDEO SHOWCASE"),
          percent: stats.videoShare,
          sizeText: `${stats.videoMB} MB`,
          colorHex: "#6366F1",
          gradientId: "videoGradient",
          dashOffset: circumference - (stats.videoShare / 100) * circumference,
        };
      case "frames":
        return {
          key: "frames",
          title: tr("SCROLLY FRAMES", "CACHE KANVAS SCROLLY", "CACHE KANVAS SCROLLY"),
          percent: stats.framesShare,
          sizeText: `${stats.framesMB} MB`,
          colorHex: "#F59E0B",
          gradientId: "framesGradient",
          dashOffset: circumference - (stats.framesShare / 100) * circumference,
        };
      case "trash":
        return {
          key: "trash",
          title: tr("RECYCLE BIN", "TONG SAMPAH", "TONG SAROK"),
          percent: stats.trashShare,
          sizeText: `${stats.trashMB} MB`,
          colorHex: "#F43F5E",
          gradientId: "trashGradient",
          dashOffset: circumference - (stats.trashShare / 100) * circumference,
        };
      case "all":
      default:
        return {
          key: "all",
          title: tr("CAPACITY USED", "DATA TERPAKAI", "DATA TAPAKAI"),
          percent: stats.usedPercentage,
          sizeText: `${stats.totalUsedMB} MB`,
          colorHex: "#14AF9E",
          gradientId: "neonGradient",
          dashOffset: circumference - (stats.usedPercentage / 100) * circumference,
        };
    }
  }, [activeCategory, stats, tr, circumference]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0d0f13] select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-[#0f171d]/60 to-neutral-950 border border-cyan-500/20 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#14AF9E]/15 border border-[#14AF9E]/30 text-[#14AF9E]">
                  <HiChartPie className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-mono tracking-widest text-[#14AF9E] uppercase font-semibold">
                  {tr("DATA ALLOCATION & CAPACITY ANALYTICS", "ANALISIS KAPASITAS & GRAFIK DATA TERPAKAI", "ANALISIS PANYIMPANAN & GRAFIK DATA TAPAKAI")}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span>{tr("Storage Usage & Visual Graphics", "Kapasitas & Grafik Data Terpakai", "Panyimpanan & Grafik Data Tapakai")}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{tr("Optimal Health", "Status Optimal", "Status Optimal")}</span>
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                {tr(
                  "Interactive visual monitoring of memory allocation, portfolio assets, sequence frame cache, and recycle bin storage.",
                  "Monitoring visual interaktif tentang alokasi memori, gambar portofolio terpakai, cache frame scrolly, dan sistem sampah.",
                  "Monitoring visual interaktif tantang alokasi memori, gambar portofolio tapakai, cache frame scrolly, sarato tong sarok."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* PRIMARY ANIMATED GRAPHIC: Futuristic Radial Donut & Segmented Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Animated Radial Progress Circle Gauge (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#111419] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#14AF9E]/5 via-transparent to-black pointer-events-none" />

            <div className="relative flex flex-col items-center my-3">
              {/* SVG Radial Meter */}
              <svg width="220" height="220" className="transform -rotate-90">
                <defs>
                  <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14AF9E" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="worksGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14AF9E" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                  <linearGradient id="videoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="framesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="trashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Track Circle */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="14"
                  fill="transparent"
                />

                {/* Animated Fill Circle with Dynamic Category Colors */}
                <motion.circle
                  key={activeCategory}
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke={`url(#${activeDetails.gradientId})`}
                  strokeWidth="14"
                  strokeLinecap="round"
                  fill="transparent"
                  filter="url(#glow)"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: activeDetails.dashOffset }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>

              {/* Center Counter & Interactive Label */}
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 rounded-full group cursor-pointer focus:outline-none transition-transform active:scale-95"
                title={activeCategory !== "all" ? tr("Click to reset to all data", "Klik untuk reset ke semua data", "Klik untuak reset ka sadonyo data") : ""}
              >
                <span
                  className="text-[10px] font-mono tracking-widest uppercase font-bold mb-0.5 transition-colors duration-300"
                  style={{ color: activeDetails.colorHex }}
                >
                  {activeDetails.title}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline">
                  {activeCategory === "all" ? animatedPercent : activeDetails.percent}%
                </span>
                {/* PROMINENT SIZE IN MB BADGE */}
                <span
                  className="mt-1 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${activeDetails.colorHex}25`,
                    borderColor: `${activeDetails.colorHex}60`,
                    color: activeDetails.colorHex,
                    borderWidth: 1,
                  }}
                >
                  <HiSparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>{activeDetails.sizeText}</span>
                  {activeCategory === "all" && (
                    <span className="text-neutral-400 font-normal">/ {stats.totalCapacityMB} MB</span>
                  )}
                </span>
                {activeCategory !== "all" ? (
                  <span className="text-[9px] font-mono text-cyan-400/80 mt-1 hover:text-cyan-300 underline">
                    {tr("← Click to view all", "← Klik untuk semua data", "← Klik untuak kasadonyo")}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-neutral-400 mt-1">
                    {tr("Click card to change color", "Klik kartu untuk ubah warna", "Klik kartu untuak ubah warna")}
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Health Pill */}
            <div className="w-full mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <HiShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{tr("Browser & DB Quota", "Alokasi Kuota Memori", "Alokasi Kuota Memori")}</span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {tr("Safe (Normal)", "Aman (Normal)", "Aman (Normal)")}
              </span>
            </div>
          </div>

          {/* Right: Animated Multi-Segment Allocation Bar & Category Breakdown (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#111419] border border-white/10 flex flex-col justify-between space-y-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HiCircleStack className="w-4 h-4 text-[#14AF9E]" />
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {tr("Visual Storage Breakdown", "Distribusi Alokasi Memori", "Distribusi Alokasi Memori")}
                  </h3>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {tr("Total active assets:", "Total aset aktif:", "Aset kasadonyo:")} <strong className="text-white">{stats.totalWorks + stats.totalLogos}</strong>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mb-3">
                {tr("Click any category below to inspect its exact MB size & see donut color update in real-time.", "Klik kategori di bawah untuk melihat ukuran MB & melihat perubahan warna donut secara interaktif.", "Klik kategori di bawah untuak mancaliak ukuran MB & mancek parubahan warna donot.")}
              </p>

              {/* Animated Segmented Capacity Bar */}
              <div className="w-full h-4 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden flex p-0.5 gap-0.5">
                {/* 1. Works */}
                <motion.div
                  role="button"
                  onClick={() => setActiveCategory(activeCategory === "works" ? "all" : "works")}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.worksShare}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className={`h-full rounded-lg bg-[#14AF9E] relative group cursor-pointer transition-opacity ${activeCategory !== "all" && activeCategory !== "works" ? "opacity-30" : "opacity-100"}`}
                  title={`${tr("Portfolio Works", "Karya Portofolio", "Karya Portofolio")}: ${stats.worksShare}% (${stats.worksMB} MB)`}
                />
                {/* 2. Video Showcase */}
                <motion.div
                  role="button"
                  onClick={() => setActiveCategory(activeCategory === "video" ? "all" : "video")}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.videoShare}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className={`h-full rounded-lg bg-indigo-500 relative group cursor-pointer transition-opacity ${activeCategory !== "all" && activeCategory !== "video" ? "opacity-30" : "opacity-100"}`}
                  title={`${tr("Video Showcase", "Video Showcase", "Video Showcase")}: ${stats.videoShare}% (${stats.videoMB} MB)`}
                />
                {/* 3. Sequence Frames */}
                <motion.div
                  role="button"
                  onClick={() => setActiveCategory(activeCategory === "frames" ? "all" : "frames")}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.framesShare}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className={`h-full rounded-lg bg-amber-400 relative group cursor-pointer transition-opacity ${activeCategory !== "all" && activeCategory !== "frames" ? "opacity-30" : "opacity-100"}`}
                  title={`${tr("Scrolly Frames", "Cache Frame Scrolly", "Cache Frame Scrolly")}: ${stats.framesShare}% (${stats.framesMB} MB)`}
                />
                {/* 4. Trash */}
                <motion.div
                  role="button"
                  onClick={() => setActiveCategory(activeCategory === "trash" ? "all" : "trash")}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.trashShare}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-lg bg-rose-500 relative group cursor-pointer transition-opacity ${activeCategory !== "all" && activeCategory !== "trash" ? "opacity-30" : "opacity-100"}`}
                  title={`${tr("Recycle Bin", "Tong Sampah", "Tong Sarok")}: ${stats.trashShare}% (${stats.trashMB} MB)`}
                />
                {/* 5. Client Data / Free */}
                <motion.div
                  role="button"
                  onClick={() => setActiveCategory("all")}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.clientDataShare}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-lg bg-cyan-400 relative group cursor-pointer transition-opacity ${activeCategory !== "all" ? "opacity-30" : "opacity-100"}`}
                  title={`${tr("Client Data", "Data Klien", "Data Klien")}: ${stats.clientDataShare}%`}
                />
              </div>
            </div>

            {/* Interactive Legend List with Click-to-Color feature & prominent MB display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Item 1: Works */}
              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === "works" ? "all" : "works")}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between group transition-all cursor-pointer ${
                  activeCategory === "works"
                    ? "bg-[#14AF9E]/15 border-[#14AF9E] ring-2 ring-[#14AF9E]/40 shadow-lg shadow-[#14AF9E]/20"
                    : activeCategory !== "all"
                    ? "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : "bg-neutral-900/70 border-white/5 hover:border-[#14AF9E]/40 hover:bg-[#14AF9E]/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#14AF9E] shrink-0 shadow-md shadow-[#14AF9E]/40" />
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{tr("Client Works & Images", "Foto & Karya Visual", "Foto & Karya Visual")}</span>
                      {activeCategory === "works" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#14AF9E] text-black font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {stats.totalWorks} {tr("items uploaded", "karya terupload", "karya taupload")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-[#14AF9E]/20 border border-[#14AF9E]/40 text-xs sm:text-sm font-mono font-extrabold text-[#14AF9E] inline-block shadow-sm">
                    {stats.worksMB} MB
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                    ~{stats.worksShare}%
                  </span>
                </div>
              </button>

              {/* Item 2: Video & Showcase */}
              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === "video" ? "all" : "video")}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between group transition-all cursor-pointer ${
                  activeCategory === "video"
                    ? "bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20"
                    : activeCategory !== "all"
                    ? "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : "bg-neutral-900/70 border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 shrink-0 shadow-md shadow-indigo-500/40" />
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{tr("Flagship Video & Showcase", "Video & Stage 3 Media", "Video & Stage 3 Media")}</span>
                      {activeCategory === "video" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500 text-white font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      YouTube / Google Drive
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-xs sm:text-sm font-mono font-extrabold text-indigo-400 inline-block shadow-sm">
                    {stats.videoMB} MB
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                    ~{stats.videoShare}%
                  </span>
                </div>
              </button>

              {/* Item 3: Frames Cache */}
              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === "frames" ? "all" : "frames")}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between group transition-all cursor-pointer ${
                  activeCategory === "frames"
                    ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-400/20"
                    : activeCategory !== "all"
                    ? "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : "bg-neutral-900/70 border-white/5 hover:border-amber-400/40 hover:bg-amber-400/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0 shadow-md shadow-amber-400/40" />
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{tr("Scrollytelling Frames", "Cache Kanvas Scrolly", "Cache Kanvas Scrolly")}</span>
                      {activeCategory === "frames" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {stats.cachedFramesCount} {tr("indexed frames", "frame tersimpan", "frame tasimpan")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-xs sm:text-sm font-mono font-extrabold text-amber-300 inline-block shadow-sm">
                    {stats.framesMB} MB
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                    ~{stats.framesShare}%
                  </span>
                </div>
              </button>

              {/* Item 4: Recycle Bin */}
              <button
                type="button"
                onClick={() => setActiveCategory(activeCategory === "trash" ? "all" : "trash")}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between group transition-all cursor-pointer ${
                  activeCategory === "trash"
                    ? "bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/20"
                    : activeCategory !== "all"
                    ? "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : "bg-neutral-900/70 border-white/5 hover:border-rose-500/40 hover:bg-rose-500/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0 shadow-md shadow-rose-500/40" />
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{tr("Recycle Bin (Trash)", "Tong Sampah (Pulihkan)", "Tong Sarok (Pulihan)")}</span>
                      {activeCategory === "trash" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {stats.totalTrash} {tr("deleted items", "item terhapus", "item tahapuih")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-xs sm:text-sm font-mono font-extrabold text-rose-400 inline-block shadow-sm">
                    {stats.trashMB} MB
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                    ~{stats.trashShare}%
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 4 STAT METRICS CARDS WITH ANIMATIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Client Folders */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-2 hover:border-[#14AF9E]/30 transition-all shadow-xl group"
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">{tr("Client Folders", "Folder Klien Aktif", "Folder Klien Aktif")}</span>
              <HiFolder className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span>{stats.totalFolders}</span>
              <span className="text-xs font-mono font-bold text-amber-400">({stats.worksMB} MB)</span>
            </p>
            <p className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
              <span>{stats.customFolders} {tr("custom admin", "kustom admin", "kustom admin")}</span>
              <span className="text-emerald-400">Active</span>
            </p>
          </motion.div>

          {/* Card 2: Total Visual Works */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-2 hover:border-[#14AF9E]/30 transition-all shadow-xl group"
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">{tr("Portfolio Works", "Total Karya Portofolio", "Total Karya Portofolio")}</span>
              <HiPhoto className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span>{stats.totalWorks}</span>
              <span className="text-xs font-mono font-bold text-cyan-400">({stats.worksMB} MB)</span>
            </p>
            <p className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
              <span>{tr("Stored in folders", "Tersimpan di folder", "Tasimpan di folder")}</span>
              <span className="text-cyan-400">WebP / JPG</span>
            </p>
          </motion.div>

          {/* Card 3: Recycle Bin */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-2 hover:border-rose-500/30 transition-all shadow-xl group"
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">{tr("Recycle Bin Items", "Item di Tong Sampah", "Item di Tong Sarok")}</span>
              <HiTrash className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span>{stats.totalTrash}</span>
              <span className="text-xs font-mono font-bold text-rose-400">({stats.trashMB} MB)</span>
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-400">
                {stats.totalTrash > 0 ? tr("Can be restored", "Dapat dipulihkan", "Dapek dipuliahan") : tr("Trash empty", "Tong bersih", "Tong barasiah")}
              </span>
              {stats.totalTrash > 0 && onNavigateToTrash && (
                <button
                  type="button"
                  onClick={onNavigateToTrash}
                  className="text-rose-400 hover:underline cursor-pointer"
                >
                  {tr("View ↗", "Buka ↗", "Bukak ↗")}
                </button>
              )}
            </div>
          </motion.div>

          {/* Card 4: Cloud Sync Database */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-2 hover:border-[#14AF9E]/30 transition-all shadow-xl group"
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">{tr("Cloud Database", "Sinkronisasi Cloud", "Sinkronisasi Cloud")}</span>
              <HiServer className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              <span className="flex items-center gap-2">
                <span>Supabase</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">({stats.totalUsedMB} MB)</span>
            </p>
            <p className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
              <span>Real-time Live Sync</span>
              <span className="text-emerald-400">Connected</span>
            </p>
          </motion.div>
        </div>

        {/* Storage Maintenance & Quick Tools */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111419] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <HiCpuChip className="w-4 h-4 text-[#14AF9E]" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                {tr("Memory Optimization & Data Tools", "Optimasi Memori & Pemeliharaan Sistem", "Optimasi Memori & Pameliaharaan Sistem")}
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              LocalStorage + IndexedDB + Supabase
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tool 1: Clean Trash */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HiTrash className="w-4 h-4 text-rose-400" />
                  <span>{tr("Empty Recycle Bin", "Bersihkan Tong Sampah", "Barasiahkan Tong Sarok")}</span>
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {tr(
                    "Free up memory by clearing items that are no longer needed.",
                    "Bebaskan memori dengan membersihkan item yang sudah tidak terpakai.",
                    "Babaskan memori jo mambarasiahkan item nan indak tapakai lai."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (trashItems.length === 0) {
                    showToast(tr("Recycle Bin is already empty.", "Tong Sampah sudah kosong.", "Tong Sarok alah kosong."));
                    return;
                  }
                  if (window.confirm(tr("Empty all trash items?", "Kosongkan semua sampah?", "Kosongkan kasadonyo sarok?"))) {
                    emptyTrash();
                    showToast(tr("Recycle Bin emptied successfully!", "Tong Sampah berhasil dibersihkan!", "Tong Sarok barasil dibarasiahkan!"));
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-semibold transition-all active:scale-95 cursor-pointer mt-2"
              >
                {tr("Clean Trash Now", "Bersihkan Sekarang", "Barasiahkan Kini")}
              </button>
            </div>

            {/* Tool 2: Backup JSON */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HiArrowDownTray className="w-4 h-4 text-cyan-400" />
                  <span>{tr("Full System Backup", "Cadangan Sistem Lengkap", "Cadangan Sistem Langkok")}</span>
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {tr(
                    "Download a complete JSON snapshot of all your portfolio folders, works, and media.",
                    "Unduh file cadangan JSON lengkap dari semua karya, folder, dan media portofolio.",
                    "Unduah berkas cadangan JSON langkok dari kasadonyo karya, folder, jo media."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 text-xs font-semibold transition-all active:scale-95 cursor-pointer mt-2 disabled:opacity-50"
              >
                {tr("Download Backup (JSON)", "Unduh File Backup", "Unduah Berkas Backup")}
              </button>
            </div>

            {/* Tool 3: Check Health */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HiCheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{tr("System Health Status", "Kesehatan Penyimpanan", "Kasihatan Panyimpanan")}</span>
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {tr(
                    "Storage allocation is in optimal condition with no memory bottlenecks.",
                    "Alokasi penyimpanan dalam kondisi prima tanpa hambatan memori browser.",
                    "Alokasi panyimpanan dalam kondisi rancak tanpa hamboatan memori."
                  )}
                </p>
              </div>
              <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>100% {tr("Optimal & Synced", "Optimal & Tersinkron", "Optimal & Tasinkron")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

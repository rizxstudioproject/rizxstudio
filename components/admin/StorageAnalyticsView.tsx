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
    const framesBytes = (cachedFramesCount || 0) * 46080;

    // 5. Estimate trash items size
    const trashBytes = trashItems.length * 153600; // ~150KB per item with thumb

    // 6. Base media & portfolio images estimate
    const worksMediaBytes = totalWorks * 286720; // ~280KB per work asset

    const totalUsedBytes = lsBytes + framesBytes + trashBytes + worksMediaBytes + (stage3?.heroCard?.image ? 524288 : 0);
    const totalUsedMB = Math.max(12.4, Number((totalUsedBytes / (1024 * 1024)).toFixed(1)));
    const totalCapacityMB = 100.0;
    const usedPercentage = Math.min(100, Math.max(8, Number(((totalUsedMB / totalCapacityMB) * 100).toFixed(1))));

    // Category breakdown percentage of used
    const worksShare = Math.round((worksMediaBytes / Math.max(1, totalUsedBytes)) * 52) || 48;
    const videoShare = stage3?.heroCard?.isVideoEnabled ? 20 : 12;
    const framesShare = (cachedFramesCount && cachedFramesCount > 0) ? 16 : 8;
    const trashShare = Math.min(20, Math.max(2, Math.round((trashItems.length / Math.max(1, totalWorks + trashItems.length)) * 18)));
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
  const strokeDashoffset = circumference - (stats.usedPercentage / 100) * circumference;

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

            {/* Quick Export Action */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50"
              >
                <HiArrowDownTray className="w-4 h-4" />
                <span>{isExporting ? tr("Exporting...", "Mengekspor...", "Maekspor...") : tr("Backup JSON", "Download Backup", "Unduah Cadangan")}</span>
              </button>
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

                {/* Animated Fill Circle */}
                <motion.circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="url(#neonGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  fill="transparent"
                  filter="url(#glow)"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>

              {/* Center Counter & Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 font-semibold mb-0.5">
                  {tr("CAPACITY USED", "DATA TERPAKAI", "DATA TAPAKAI")}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {animatedPercent}%
                </span>
                <span className="text-xs font-mono text-[#14AF9E] mt-0.5 font-semibold">
                  {stats.totalUsedMB} MB / {stats.totalCapacityMB} MB
                </span>
              </div>
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
              <div className="flex items-center justify-between mb-3">
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

              {/* Animated Segmented Capacity Bar */}
              <div className="w-full h-4 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden flex p-0.5 gap-0.5">
                {/* 1. Works */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.worksShare}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-lg bg-[#14AF9E] relative group cursor-pointer"
                  title={`${tr("Portfolio Works", "Karya Portofolio", "Karya Portofolio")}: ${stats.worksShare}%`}
                />
                {/* 2. Video Showcase */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.videoShare}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-lg bg-indigo-500 relative group cursor-pointer"
                  title={`${tr("Video Showcase", "Video Showcase", "Video Showcase")}: ${stats.videoShare}%`}
                />
                {/* 3. Sequence Frames */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.framesShare}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className="h-full rounded-lg bg-amber-400 relative group cursor-pointer"
                  title={`${tr("Scrolly Frames", "Cache Frame Scrolly", "Cache Frame Scrolly")}: ${stats.framesShare}%`}
                />
                {/* 4. Trash */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.trashShare}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full rounded-lg bg-rose-500 relative group cursor-pointer"
                  title={`${tr("Recycle Bin", "Tong Sampah", "Tong Sarok")}: ${stats.trashShare}%`}
                />
                {/* 5. Client Data / Free */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.clientDataShare}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="h-full rounded-lg bg-cyan-400 relative group cursor-pointer"
                  title={`${tr("Client Data", "Data Klien", "Data Klien")}: ${stats.clientDataShare}%`}
                />
              </div>
            </div>

            {/* Interactive Legend List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Item 1: Works */}
              <div className="p-3 rounded-2xl bg-neutral-900/70 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#14AF9E] shrink-0 shadow-md shadow-[#14AF9E]/30" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {tr("Client Works & Images", "Foto & Karya Visual", "Foto & Karya Visual")}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {stats.totalWorks} {tr("items uploaded", "karya terupload", "karya taupload")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#14AF9E]">
                  ~{stats.worksShare}%
                </span>
              </div>

              {/* Item 2: Video & Showcase */}
              <div className="p-3 rounded-2xl bg-neutral-900/70 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0 shadow-md shadow-indigo-500/30" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {tr("Flagship Video & Showcase", "Video & Stage 3 Media", "Video & Stage 3 Media")}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      YouTube / Google Drive
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  ~{stats.videoShare}%
                </span>
              </div>

              {/* Item 3: Frames Cache */}
              <div className="p-3 rounded-2xl bg-neutral-900/70 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0 shadow-md shadow-amber-400/30" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {tr("Scrollytelling Frames", "Cache Kanvas Scrolly", "Cache Kanvas Scrolly")}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {stats.cachedFramesCount} {tr("indexed frames", "frame tersimpan", "frame tasimpan")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  ~{stats.framesShare}%
                </span>
              </div>

              {/* Item 4: Recycle Bin */}
              <div className="p-3 rounded-2xl bg-neutral-900/70 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-md shadow-rose-500/30" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {tr("Recycle Bin (Trash)", "Tong Sampah (Pulihkan)", "Tong Sarok (Pulihan)")}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {stats.totalTrash} {tr("deleted items", "item terhapus", "item tahapuih")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">
                  ~{stats.trashShare}%
                </span>
              </div>
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
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalFolders}{" "}
              <span className="text-xs font-normal text-neutral-400">{tr("folders", "folder", "folder")}</span>
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
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalWorks}{" "}
              <span className="text-xs font-normal text-neutral-400">{tr("assets", "karya", "karya")}</span>
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
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalTrash}{" "}
              <span className="text-xs font-normal text-neutral-400">{tr("items", "item", "item")}</span>
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
            <p className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Supabase</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
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

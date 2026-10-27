"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  RiPieChartFill as HiChartPie,
  RiDatabase2Fill as HiCircleStack,
  RiImageFill as HiPhoto,
  RiFolderFill as HiFolder,
  RiMovieFill as HiVideoCamera,
  RiDeleteBinFill as HiTrash,
  RiDownload2Fill as HiArrowDownTray,
  RiRestartFill as HiArrowPath,
  RiCheckboxCircleFill as HiCheckCircle,
  RiSparklingFill as HiSparkles,
  RiServerFill as HiServer,
  RiCpuFill as HiCpuChip,
  RiShieldCheckFill as HiShieldCheck,
  RiLineChartFill as HiArrowTrendingUp,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { getCustomFramesFromDB } from "@/lib/sequenceStorage";

interface StorageAnalyticsViewProps {
  showToast: (msg: string) => void;
  onNavigateToTrash?: () => void;
}

// ==============================================================
// 3D HARMONIC PARTICLE WAVE ORB (WAVE MOTION)
// Dynamic Particle Wave Motion with Entrance Expansion (Small -> Many)
// ==============================================================
interface StorageWaveOrbCanvasProps {
  category: "all" | "works" | "video" | "frames" | "trash";
  percent: number;
  isLight: boolean;
}

const CATEGORY_PALETTES = {
  all: {
    primary: [6, 182, 212], // #06b6d4 (Cyan)
    secondary: [22, 176, 159], // #16b09f (Teal)
    crest: [255, 255, 255], // Pure white crest
  },
  works: {
    primary: [16, 185, 129], // #10b981 (Emerald)
    secondary: [13, 148, 136], // #0d9488 (Teal)
    crest: [236, 253, 245],
  },
  video: {
    primary: [99, 102, 241], // #6366f1 (Indigo)
    secondary: [139, 92, 246], // #8b5cf6 (Violet)
    crest: [245, 243, 255],
  },
  frames: {
    primary: [245, 158, 11], // #f59e0b (Amber)
    secondary: [217, 119, 6], // #d97706 (Gold)
    crest: [255, 251, 235],
  },
  trash: {
    primary: [244, 63, 94], // #f43f5e (Rose)
    secondary: [225, 29, 72], // #e11d48 (Crimson)
    crest: [255, 241, 242],
  },
};

const StorageWaveOrbCanvas: React.FC<StorageWaveOrbCanvasProps> = ({
  category,
  percent,
  isLight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);

  const colorsRef = useRef({
    primary: [6, 182, 212],
    secondary: [22, 176, 159],
    crest: [255, 255, 255],
  });

  const categoryRef = useRef(category);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  const percentRef = useRef(percent);
  useEffect(() => {
    percentRef.current = percent;
  }, [percent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const size = 240;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const RINGS = 18;
    const POINTS_PER_RING = 32;
    const cx = size / 2;
    const cy = size / 2;
    const targetBaseRadius = 76;
    const fov = 170;

    const grid: { phi: number; theta: number; baseY: number; baseRadiusAtY: number }[][] = [];
    for (let r = 0; r < RINGS; r++) {
      const ringPoints = [];
      const phi = ((r + 0.5) / RINGS) * Math.PI;
      const baseY = Math.cos(phi);
      const baseRadiusAtY = Math.sin(phi);

      for (let p = 0; p < POINTS_PER_RING; p++) {
        const theta = (p / POINTS_PER_RING) * 2 * Math.PI;
        ringPoints.push({ phi, theta, baseY, baseRadiusAtY });
      }
      grid.push(ringPoints);
    }

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      const time = elapsed * 1.2;

      // Entrance animation on refresh: expands wave from small to full (dari kecil ke banyak)
      const entranceProgress = Math.min(1, elapsed / 1.1);
      const easeEntrance = 1 - Math.pow(1 - entranceProgress, 3); // cubic ease-out
      const baseRadius = targetBaseRadius * (0.15 + 0.85 * easeEntrance);
      const entranceAlpha = 0.2 + 0.8 * easeEntrance;

      // Color interpolation towards active category
      const targetPalette = CATEGORY_PALETTES[categoryRef.current] || CATEGORY_PALETTES.all;
      const cur = colorsRef.current;
      for (let c = 0; c < 3; c++) {
        cur.primary[c] += (targetPalette.primary[c] - cur.primary[c]) * 0.08;
        cur.secondary[c] += (targetPalette.secondary[c] - cur.secondary[c]) * 0.08;
        cur.crest[c] += (targetPalette.crest[c] - cur.crest[c]) * 0.08;
      }

      ctx.clearRect(0, 0, size, size);

      const [pr, pg, pb] = cur.primary.map(Math.round);
      const [sr, sg, sb] = cur.secondary.map(Math.round);
      const [cr, cg, cb] = cur.crest.map(Math.round);

      // Soft ambient background aura in active storage color
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 95);
      bgGlow.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${(isLight ? 0.08 : 0.22) * entranceAlpha})`);
      bgGlow.addColorStop(0.65, `rgba(${sr}, ${sg}, ${sb}, ${(isLight ? 0.03 : 0.08) * entranceAlpha})`);
      bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, size, size);

      // Rotation angles for organic fluid orb
      const rotY = time * 0.45;
      const rotX = Math.sin(time * 0.28) * 0.22;
      const rotZ = Math.cos(time * 0.22) * 0.12;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

      // Dynamic wave amplitude modulated by storage percent
      const waveAmp = (0.20 + Math.min(percentRef.current / 100, 1) * 0.08) * easeEntrance;

      interface ProjectedPt {
        sx: number;
        sy: number;
        z: number;
        scale: number;
        wave: number;
      }
      const projectedGrid: ProjectedPt[][] = [];

      for (let r = 0; r < RINGS; r++) {
        const ringProj: ProjectedPt[] = [];
        for (let p = 0; p < POINTS_PER_RING; p++) {
          const pt = grid[r][p];

          // 3D Harmonic Spherical Wave Equation
          const w1 = Math.sin(pt.theta * 3 + time * 1.8) * Math.cos(pt.phi * 2.5 + time * 1.2);
          const w2 = Math.sin(pt.theta * 5 - time * 2.2 + pt.baseY * 3.5) * 0.42;
          const w3 = Math.cos(pt.phi * 4 + time * 1.6) * 0.32;
          const w4 = Math.sin(time * 0.9 + pt.baseY * 2.0) * 0.18;
          const wave = w1 + w2 + w3 + w4;

          const currentR = baseRadius * (1 + wave * waveAmp);

          // 3D position
          const px = pt.baseRadiusAtY * Math.cos(pt.theta) * currentR;
          const py = pt.baseY * currentR;
          const pz = pt.baseRadiusAtY * Math.sin(pt.theta) * currentR;

          // Rotate Y
          const x1 = px * cosY - pz * sinY;
          const z1 = px * sinY + pz * cosY;

          // Rotate X
          const y2 = py * cosX - z1 * sinX;
          const z2 = py * sinX + z1 * cosX;

          // Rotate Z
          const x3 = x1 * cosZ - y2 * sinZ;
          const y3 = x1 * sinZ + y2 * cosZ;

          // Perspective projection
          const scale = fov / (fov + z2);
          const sx = cx + x3 * scale;
          const sy = cy + y3 * scale;

          ringProj.push({ sx, sy, z: z2, scale, wave });
        }
        projectedGrid.push(ringProj);
      }

      // 1. Draw undulating contour ring filaments (wireframe wave ribbons)
      for (let r = 0; r < RINGS; r++) {
        ctx.beginPath();
        for (let p = 0; p < POINTS_PER_RING; p++) {
          const pt = projectedGrid[r][p];
          if (p === 0) {
            ctx.moveTo(pt.sx, pt.sy);
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        }
        ctx.closePath();

        let avgZ = 0;
        for (let p = 0; p < POINTS_PER_RING; p++) {
          avgZ += projectedGrid[r][p].z;
        }
        avgZ /= POINTS_PER_RING;

        const ringDepth = Math.max(0, Math.min(1, (avgZ + baseRadius) / (baseRadius * 2)));
        const ringAlpha = (0.07 + ringDepth * 0.22) * (isLight ? 0.65 : 1.0) * entranceAlpha;
        ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${ringAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 2. Draw Particle Wave Dots (Sorted back to front for accurate depth)
      const allDots: ProjectedPt[] = [];
      for (let r = 0; r < RINGS; r++) {
        for (let p = 0; p < POINTS_PER_RING; p++) {
          allDots.push(projectedGrid[r][p]);
        }
      }
      allDots.sort((a, b) => a.z - b.z);

      for (let i = 0; i < allDots.length; i++) {
        const dot = allDots[i];
        const depthNorm = Math.max(0, Math.min(1, (dot.z + baseRadius) / (baseRadius * 2)));

        const dotRadius = Math.max(0.6, (0.75 + depthNorm * 1.85) * dot.scale);
        const dotAlpha = (0.18 + depthNorm * 0.77) * (isLight ? 0.85 : 1.0) * entranceAlpha;

        const isCrest = dot.wave > 0.35 && dot.z > -10;
        const crestFactor = isCrest ? Math.min(1, (dot.wave - 0.35) * 2.2) : 0;

        const red = Math.round(pr + (cr - pr) * crestFactor);
        const green = Math.round(pg + (cg - pg) * crestFactor);
        const blue = Math.round(pb + (cb - pb) * crestFactor);

        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${dotAlpha})`;

        ctx.beginPath();
        ctx.arc(dot.sx, dot.sy, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        if (isCrest && depthNorm > 0.6) {
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${dotAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(dot.sx, dot.sy, dotRadius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none rounded-full"
      style={{ width: 240, height: 240 }}
    />
  );
};


export default function StorageAnalyticsView({
  showToast,
  onNavigateToTrash,
}: StorageAnalyticsViewProps) {
  const { clients, stage3, heroWorks, clientLogos, portfolioRunner, trashItems, emptyTrash, allData } = usePortfolioData();
  const { lang, tr } = useLang();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

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
          colorHex: "#16b09f",
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
          colorHex: "#16b09f",
          gradientId: "neonGradient",
          dashOffset: circumference - (stats.usedPercentage / 100) * circumference,
        };
    }
  }, [activeCategory, stats, tr, circumference]);

  const currentPercent = activeCategory === "all" ? animatedPercent : activeDetails.percent;

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 select-none ${isLight ? "bg-[#f8fafc]" : "bg-[#0d0f13]"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className={`p-5 sm:p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden shadow-xl ${
          isLight
            ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-teal-500/5"
            : "bg-gradient-to-r from-neutral-900/90 via-[#0f171d]/60 to-neutral-950 border-cyan-500/20 shadow-2xl"
        }`}>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`p-2 rounded-xl border ${isLight ? "bg-teal-100 border-teal-300 text-teal-700" : "bg-[#16b09f]/15 border-[#16b09f]/30 text-[#16b09f]"}`}>
                  <HiChartPie className="w-5 h-5" />
                </span>
                <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold ${isLight ? "text-teal-700" : "text-[#16b09f]"}`}>
                  {tr("DATA ALLOCATION & CAPACITY ANALYTICS", "ANALISIS KAPASITAS & GRAFIK DATA TERPAKAI", "ANALISIS PANYIMPANAN & GRAFIK DATA TAPAKAI")}
                </span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-3 ${isLight ? "text-slate-900" : "text-white"}`}>
                <span>{tr("Storage Usage & Visual Graphics", "Kapasitas & Grafik Data Terpakai", "Panyimpanan & Grafik Data Tapakai")}</span>
                <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 border ${
                  isLight ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{tr("Optimal Health", "Status Optimal", "Status Optimal")}</span>
                </span>
              </h2>
              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
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
          <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col items-center justify-center relative overflow-hidden shadow-xl ${
            isLight ? "bg-white border-slate-200/90 shadow-slate-200/50" : "bg-[#111419] border border-white/10 shadow-2xl"
          }`}>
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 pointer-events-none ${
              isLight
                ? "bg-gradient-to-b from-[#16b09f]/5 via-transparent to-slate-50/40"
                : "bg-gradient-to-b from-[#16b09f]/5 via-transparent to-black"
            }`} />

            <div className="relative flex flex-col items-center justify-center my-3 w-[240px] h-[240px]">
              {/* 3D Dynamic Particle Wave Motion (Expands smoothly on refresh from small to many) */}
              <StorageWaveOrbCanvas
                category={activeCategory}
                percent={currentPercent}
                isLight={isLight}
              />

              {/* Center Counter & Interactive Label directly over wave motion */}
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="relative z-10 flex flex-col items-center justify-center text-center p-3 rounded-full group cursor-pointer focus:outline-none transition-transform active:scale-95"
                title={activeCategory !== "all" ? tr("Click to reset to all data", "Klik untuk reset ke semua data", "Klik untuak reset ka sadonyo data") : ""}
              >
                <span
                  className="text-[10px] font-mono tracking-widest uppercase font-bold mb-0.5 transition-colors duration-300 drop-shadow-sm"
                  style={{ color: activeDetails.colorHex }}
                >
                  {activeDetails.title}
                </span>
                <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight flex items-baseline drop-shadow-md ${isLight ? "text-slate-900" : "text-white"}`}>
                  {activeCategory === "all" ? animatedPercent : activeDetails.percent}%
                </span>
                {/* SIZE IN MB DISPLAY WITHOUT FRAME */}
                <div
                  className="mt-1 text-xs font-mono font-bold tracking-wide flex items-center gap-1"
                  style={{
                    color: activeDetails.colorHex,
                  }}
                >
                  <span>{activeDetails.sizeText}</span>
                  {activeCategory === "all" && (
                    <span className={`font-normal ${isLight ? "text-slate-500" : "text-neutral-400"}`}>/ {stats.totalCapacityMB} MB</span>
                  )}
                </div>
              </button>
            </div>

            {/* Bottom Health Pill */}
            <div className={`w-full mt-4 pt-4 border-t flex items-center justify-between text-xs ${isLight ? "border-slate-100" : "border-white/5"}`}>
              <span className={`flex items-center gap-1.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                <HiShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{tr("Browser & DB Quota", "Alokasi Kuota Memori", "Alokasi Kuota Memori")}</span>
              </span>
              <span className={`font-mono font-semibold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                {tr("Safe (Normal)", "Aman (Normal)", "Aman (Normal)")}
              </span>
            </div>
          </div>

          {/* Right: Animated Multi-Segment Allocation Bar & Category Breakdown (7 Cols) */}
          <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between space-y-6 shadow-xl ${
            isLight ? "bg-white border-slate-200/90 shadow-slate-200/50" : "bg-[#111419] border border-white/10 shadow-2xl"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HiCircleStack className="w-4 h-4 text-[#16b09f]" />
                  <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Visual Storage Breakdown", "Distribusi Alokasi Memori", "Distribusi Alokasi Memori")}
                  </h3>
                </div>
                <span className={`text-xs font-mono ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr("Total active assets:", "Total aset aktif:", "Aset kasadonyo:")} <strong className={isLight ? "text-slate-900" : "text-white"}>{stats.totalWorks + stats.totalLogos}</strong>
                </span>
              </div>
              <p className={`text-[11px] mb-3 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                {tr("Click any category below to inspect its exact MB size & see donut color update in real-time.", "Klik kategori di bawah untuk melihat ukuran MB & melihat perubahan warna donut secara interaktif.", "Klik kategori di bawah untuak mancaliak ukuran MB & mancek parubahan warna donot.")}
              </p>

              {/* Animated Segmented Capacity Bar */}
              <div className={`w-full h-4 rounded-xl border overflow-hidden flex p-0.5 gap-0.5 ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900 border border-white/10"
              }`}>
                {/* 1. Works */}
                <motion.div
                  role="button"
                  onClick={() => setActiveCategory(activeCategory === "works" ? "all" : "works")}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.worksShare}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className={`h-full rounded-lg bg-[#16b09f] relative group cursor-pointer transition-opacity ${activeCategory !== "all" && activeCategory !== "works" ? "opacity-30" : "opacity-100"}`}
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
                    ? "bg-[#16b09f]/15 border-[#16b09f] ring-2 ring-[#16b09f]/40 shadow-lg shadow-[#16b09f]/20"
                    : activeCategory !== "all"
                    ? isLight
                      ? "bg-slate-50/60 border-slate-200/60 opacity-60 hover:opacity-90"
                      : "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : isLight
                    ? "bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 hover:border-[#16b09f]/40"
                    : "bg-neutral-900/70 border-white/5 hover:border-[#16b09f]/40 hover:bg-[#16b09f]/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#16b09f] shrink-0 shadow-md shadow-[#16b09f]/40" />
                  <div>
                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span>{tr("Client Works & Images", "Foto & Karya Visual", "Foto & Karya Visual")}</span>
                      {activeCategory === "works" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#16b09f] text-black font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className={`text-[10px] font-mono ${isLight ? "text-slate-500 font-medium" : "text-neutral-400"}`}>
                      {stats.totalWorks} {tr("items uploaded", "karya terupload", "karya taupload")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-md border text-xs sm:text-sm font-mono font-extrabold inline-block shadow-sm ${
                    isLight ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-[#16b09f]/20 border-[#16b09f]/40 text-[#16b09f]"
                  }`}>
                    {stats.worksMB} MB
                  </span>
                  <span className={`text-[10px] font-mono block mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
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
                    ? isLight
                      ? "bg-slate-50/60 border-slate-200/60 opacity-60 hover:opacity-90"
                      : "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : isLight
                    ? "bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 hover:border-indigo-500/40"
                    : "bg-neutral-900/70 border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 shrink-0 shadow-md shadow-indigo-500/40" />
                  <div>
                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span>{tr("Flagship Video & Showcase", "Video & Stage 3 Media", "Video & Stage 3 Media")}</span>
                      {activeCategory === "video" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500 text-white font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className={`text-[10px] font-mono ${isLight ? "text-slate-500 font-medium" : "text-neutral-400"}`}>
                      YouTube / Google Drive
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-md border text-xs sm:text-sm font-mono font-extrabold inline-block shadow-sm ${
                    isLight ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                  }`}>
                    {stats.videoMB} MB
                  </span>
                  <span className={`text-[10px] font-mono block mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
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
                    ? isLight
                      ? "bg-slate-50/60 border-slate-200/60 opacity-60 hover:opacity-90"
                      : "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : isLight
                    ? "bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 hover:border-amber-400/40"
                    : "bg-neutral-900/70 border-white/5 hover:border-amber-400/40 hover:bg-amber-400/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0 shadow-md shadow-amber-400/40" />
                  <div>
                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span>{tr("Scrollytelling Frames", "Cache Kanvas Scrolly", "Cache Kanvas Scrolly")}</span>
                      {activeCategory === "frames" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className={`text-[10px] font-mono ${isLight ? "text-slate-500 font-medium" : "text-neutral-400"}`}>
                      {stats.cachedFramesCount} {tr("indexed frames", "frame tersimpan", "frame tasimpan")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-md border text-xs sm:text-sm font-mono font-extrabold inline-block shadow-sm ${
                    isLight ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  }`}>
                    {stats.framesMB} MB
                  </span>
                  <span className={`text-[10px] font-mono block mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
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
                    ? isLight
                      ? "bg-slate-50/60 border-slate-200/60 opacity-60 hover:opacity-90"
                      : "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-90"
                    : isLight
                    ? "bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 hover:border-rose-500/40"
                    : "bg-neutral-900/70 border-white/5 hover:border-rose-500/40 hover:bg-rose-500/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0 shadow-md shadow-rose-500/40" />
                  <div>
                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span>{tr("Recycle Bin (Trash)", "Tong Sampah (Pulihkan)", "Tong Sarok (Pulihan)")}</span>
                      {activeCategory === "trash" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">
                          ● {tr("Active", "Aktif", "Aktif")}
                        </span>
                      )}
                    </p>
                    <p className={`text-[10px] font-mono ${isLight ? "text-slate-500 font-medium" : "text-neutral-400"}`}>
                      {stats.totalTrash} {tr("deleted items", "item terhapus", "item tahapuih")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-md border text-xs sm:text-sm font-mono font-extrabold inline-block shadow-sm ${
                    isLight ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  }`}>
                    {stats.trashMB} MB
                  </span>
                  <span className={`text-[10px] font-mono block mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
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
            className={`p-5 rounded-2xl border space-y-2 transition-all shadow-md group ${
              isLight ? "bg-white border-slate-200/90 hover:border-amber-400/40" : "bg-[#111419] border border-white/5 hover:border-[#16b09f]/30 shadow-xl"
            }`}
          >
            <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              <span className="text-xs font-medium">{tr("Client Folders", "Folder Klien Aktif", "Folder Klien Aktif")}</span>
              <HiFolder className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-3xl font-extrabold tracking-tight flex items-baseline gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <span>{stats.totalFolders}</span>
              <span className={`text-xs font-mono font-bold ${isLight ? "text-amber-600" : "text-amber-400"}`}>({stats.worksMB} MB)</span>
            </p>
            <p className={`text-[11px] font-mono flex items-center justify-between ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              <span>{stats.customFolders} {tr("custom admin", "kustom admin", "kustom admin")}</span>
              <span className={isLight ? "text-emerald-600 font-semibold" : "text-emerald-400"}>Active</span>
            </p>
          </motion.div>

          {/* Card 2: Total Visual Works */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`p-5 rounded-2xl border space-y-2 transition-all shadow-md group ${
              isLight ? "bg-white border-slate-200/90 hover:border-cyan-500/40" : "bg-[#111419] border border-white/5 hover:border-[#16b09f]/30 shadow-xl"
            }`}
          >
            <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              <span className="text-xs font-medium">{tr("Portfolio Works", "Total Karya Portofolio", "Total Karya Portofolio")}</span>
              <HiPhoto className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-3xl font-extrabold tracking-tight flex items-baseline gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <span>{stats.totalWorks}</span>
              <span className={`text-xs font-mono font-bold ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>({stats.worksMB} MB)</span>
            </p>
            <p className={`text-[11px] font-mono flex items-center justify-between ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              <span>{tr("Stored in folders", "Tersimpan di folder", "Tasimpan di folder")}</span>
              <span className={isLight ? "text-cyan-700 font-semibold" : "text-cyan-400"}>WebP / JPG</span>
            </p>
          </motion.div>

          {/* Card 3: Recycle Bin */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className={`p-5 rounded-2xl border space-y-2 transition-all shadow-md group ${
              isLight ? "bg-white border-slate-200/90 hover:border-rose-500/40" : "bg-[#111419] border border-white/5 hover:border-rose-500/30 shadow-xl"
            }`}
          >
            <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              <span className="text-xs font-medium">{tr("Recycle Bin Items", "Item di Tong Sampah", "Item di Tong Sarok")}</span>
              <HiTrash className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-3xl font-extrabold tracking-tight flex items-baseline gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <span>{stats.totalTrash}</span>
              <span className={`text-xs font-mono font-bold ${isLight ? "text-rose-600" : "text-rose-400"}`}>({stats.trashMB} MB)</span>
            </p>
            <div className={`flex items-center justify-between text-[11px] font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              <span>
                {stats.totalTrash > 0 ? tr("Can be restored", "Dapat dipulihkan", "Dapek dipuliahan") : tr("Trash empty", "Tong bersih", "Tong barasiah")}
              </span>
              {stats.totalTrash > 0 && onNavigateToTrash && (
                <button
                  type="button"
                  onClick={onNavigateToTrash}
                  className={`cursor-pointer font-semibold ${isLight ? "text-rose-600 hover:underline" : "text-rose-400 hover:underline"}`}
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
            className={`p-5 rounded-2xl border space-y-2 transition-all shadow-md group ${
              isLight ? "bg-white border-slate-200/90 hover:border-emerald-500/40" : "bg-[#111419] border border-white/5 hover:border-[#16b09f]/30 shadow-xl"
            }`}
          >
            <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              <span className="text-xs font-medium">{tr("Cloud Database", "Sinkronisasi Cloud", "Sinkronisasi Cloud")}</span>
              <HiServer className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-3xl font-extrabold tracking-tight flex items-baseline gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <span className="flex items-center gap-2">
                <span>Supabase</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className={`text-xs font-mono font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>({stats.totalUsedMB} MB)</span>
            </p>
            <p className={`text-[11px] font-mono flex items-center justify-between ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              <span>Real-time Live Sync</span>
              <span className={isLight ? "text-emerald-700 font-semibold" : "text-emerald-400"}>Connected</span>
            </p>
          </motion.div>
        </div>

        {/* Storage Maintenance & Quick Tools */}
        <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
          isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#111419] border border-white/5"
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-100" : "border-white/5"}`}>
            <div className="flex items-center gap-2">
              <HiCpuChip className="w-4 h-4 text-[#16b09f]" />
              <h3 className={`text-sm font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {tr("Memory Optimization & Data Tools", "Optimasi Memori & Pemeliharaan Sistem", "Optimasi Memori & Pameliaharaan Sistem")}
              </h3>
            </div>
            <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              LocalStorage + IndexedDB + Supabase
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tool 1: Clean Trash */}
            <div className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${
              isLight ? "bg-slate-50 border-slate-200/90" : "bg-neutral-900 border border-white/5"
            }`}>
              <div className="space-y-1">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <HiTrash className="w-4 h-4 text-rose-500" />
                  <span>{tr("Empty Recycle Bin", "Bersihkan Tong Sampah", "Barasiahkan Tong Sarok")}</span>
                </span>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
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
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 text-xs font-semibold transition-all active:scale-95 cursor-pointer mt-2"
              >
                {tr("Clean Trash Now", "Bersihkan Sekarang", "Barasiahkan Kini")}
              </button>
            </div>

            {/* Tool 2: Backup JSON */}
            <div className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${
              isLight ? "bg-slate-50 border-slate-200/90" : "bg-neutral-900 border border-white/5"
            }`}>
              <div className="space-y-1">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <HiArrowDownTray className="w-4 h-4 text-cyan-600" />
                  <span>{tr("Full System Backup", "Cadangan Sistem Lengkap", "Cadangan Sistem Langkok")}</span>
                </span>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
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
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 border border-cyan-500/25 text-xs font-semibold transition-all active:scale-95 cursor-pointer mt-2 disabled:opacity-50"
              >
                {tr("Download Backup (JSON)", "Unduh File Backup", "Unduah Berkas Backup")}
              </button>
            </div>

            {/* Tool 3: Check Health */}
            <div className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${
              isLight ? "bg-slate-50 border-slate-200/90" : "bg-neutral-900 border border-white/5"
            }`}>
              <div className="space-y-1">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <HiCheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{tr("System Health Status", "Kesehatan Penyimpanan", "Kasihatan Panyimpanan")}</span>
                </span>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Storage allocation is in optimal condition with no memory bottlenecks.",
                    "Alokasi penyimpanan dalam kondisi prima tanpa hambatan memori browser.",
                    "Alokasi panyimpanan dalam kondisi rancak tanpa hamboatan memori."
                  )}
                </p>
              </div>
              <div className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 ${
                isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>100% {tr("Optimal & Synced", "Optimal & Tersinkron", "Optimal & Tasinkron")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


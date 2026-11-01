"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  HiXMark,
  HiMiniMagnifyingGlassPlus,
  HiMiniMagnifyingGlassMinus,
  HiArrowsPointingOut,
  HiArrowPath,
  HiShieldCheck,
  HiLockClosed,
  HiQuestionMarkCircle,
} from "react-icons/hi2";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { normalizeMediaUrl } from "@/lib/mediaService";
import { useLang } from "@/context/LanguageContext";

interface CanvasSheetItem {
  id: string;
  title: string;
  type?: string;
  image: string;
  aspect?: string;
  clientName: string;
  clientId: string;
  year?: string;
  isVideo?: boolean;
  tools?: string[];
}

interface CanvasBoardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CanvasBoard({ isOpen, onClose }: CanvasBoardProps) {
  const { clients, stage3, heroWorks, canvasItems, addCanvasItem } = usePortfolioData();
  const { t, tr } = useLang();

  // Viewport & Transform Engine State
  const [zoom, setZoom] = useState<number>(0.8);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  // Direct Drag & Drop state on Canvas Board
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
  const [droppedMedia, setDroppedMedia] = useState<{
    fileUrl: string;
    isVideo: boolean;
    title: string;
    aspect: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const boardContentRef = useRef<HTMLDivElement>(null);

  // Gather all works across client vaults into Canvas reference sheets
  const sheets: CanvasSheetItem[] = useMemo(() => {
    if (canvasItems && canvasItems.length > 0) {
      return canvasItems.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type || item.clientName || "Canvas Asset",
        image: normalizeMediaUrl(item.image || (item.videoId ? `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg` : "")),
        aspect: item.aspect || "4:5",
        clientName: item.clientName || "Selected Work",
        clientId: item.clientId || "canvas",
        year: item.year || "2026",
        isVideo: Boolean(item.isVideo || item.videoId || item.mediaType === "youtube" || item.mediaType === "gdrive"),
        tools: item.tools || ["digital", "visual"],
      }));
    }

    const list: CanvasSheetItem[] = [];

    // 1. Gather all client deliverables
    (clients || []).forEach((c) => {
      (c.works || []).forEach((w: any) => {
        if (w.image || w.gdriveUrl || w.videoId) {
          list.push({
            id: w.id || `${c.id}-${Math.random().toString(36).substr(2, 7)}`,
            title: w.title || "Deliverable",
            type: w.type || "Digital Asset",
            image: normalizeMediaUrl(w.image || (w.videoId ? `https://img.youtube.com/vi/${w.videoId}/maxresdefault.jpg` : "")),
            aspect: w.aspect || "4:5",
            clientName: c.clientName || "Client Vault",
            clientId: c.id,
            year: w.year || "2026",
            isVideo: Boolean(w.isVideo || w.videoId || w.mediaType === "video"),
            tools: w.tools || c.tools || [],
          });
        }
      });
    });

    // 2. If client works are few, append hero showcases
    if (list.length < 4 && heroWorks?.deckCards) {
      heroWorks.deckCards.forEach((c: any, idx: number) => {
        list.push({
          id: c.id || `hero-${idx}`,
          title: c.title || `Curated Asset ${idx + 1}`,
          type: c.category || "Selected Work",
          image: normalizeMediaUrl(c.image),
          aspect: "1:1",
          clientName: "Selected Works",
          clientId: "hero",
          year: "2026",
          isVideo: false,
          tools: ["figma", "photoshop", "magnific"],
        });
      });
    }

    return list;
  }, [clients, heroWorks]);

  // Center & Fit Canvas on mount / open
  const zoomToFit = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    // Board layout width & height estimate based on items
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(sheets.length || 6))));
    const approxBoardWidth = cols * 380 + (cols - 1) * 60;
    const approxBoardHeight = Math.ceil(sheets.length / cols) * 520 + 200;

    const scaleX = (clientWidth * 0.88) / approxBoardWidth;
    const scaleY = (clientHeight * 0.88) / approxBoardHeight;
    const fitScale = Math.min(1.1, Math.max(0.35, Math.min(scaleX, scaleY)));

    setZoom(Number(fitScale.toFixed(2)));
    setPan({
      x: (clientWidth - approxBoardWidth * fitScale) / 2,
      y: Math.max(60, (clientHeight - approxBoardHeight * fitScale) / 2),
    });
  }, [sheets.length]);

  // Handle Fullscreen Request on Open
  useEffect(() => {
    if (!isOpen) return;

    // Auto-enter browser fullscreen if supported and permitted
    if (typeof document !== "undefined" && document.fullscreenEnabled && !document.fullscreenElement) {
      try {
        document.documentElement.requestFullscreen().catch(() => {
          // Browser may block automatic fullscreen without direct tap; fallback to fixed inset-0 overlay
        });
      } catch (_) {}
    }

    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);

    // Initial positioning
    const timer = setTimeout(() => {
      zoomToFit();
    }, 100);

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      clearTimeout(timer);
    };
  }, [isOpen, zoomToFit]);

  // Anti-Screenshot Window Blur Shield (defeats snipping tools & screen captures)
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };
    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isOpen]);

  // Keyboard Shortcuts (Space for Pan, Esc to Close, Ctrl+S/Ctrl+P blocked)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Exit Canvas on Escape
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      // Spacebar for Pan Mode
      if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      }

      // 0 or F to Zoom to Fit
      if ((e.key === "0" || e.key.toLowerCase() === "f") && (e.ctrlKey || e.metaKey || !e.ctrlKey)) {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          zoomToFit();
        }
      }

      // Block Save (Ctrl+S), Print (Ctrl+P), View Source (Ctrl+U)
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && ["s", "p", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen, isSpacePressed, zoomToFit]);

  const handleClose = () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch (_) {}
    }
    onClose();
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Mouse Wheel Zoom centered at Cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is scrolling/pinching or panning with trackpad
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) {
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.min(5.5, Math.max(0.15, zoom * zoomFactor));

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Adjust pan so the point under cursor remains pinned
      const newPanX = cursorX - (cursorX - pan.x) * (newZoom / zoom);
      const newPanY = cursorY - (cursorY - pan.y) * (newZoom / zoom);

      setZoom(Number(newZoom.toFixed(3)));
      setPan({ x: newPanX, y: newPanY });
    }
  };

  // Pointer / Mouse Pan Events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Left click (0) or Middle click (1) initiates pan
    if (e.button === 0 || e.button === 1 || isSpacePressed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  // Touch Pinch-to-Zoom & Drag Pan Engine for Mobile / Tablet
  const touchStateRef = useRef<{
    initialDistance: number | null;
    initialZoom: number;
    initialPan: { x: number; y: number };
    startTouch: { x: number; y: number };
  }>({
    initialDistance: null,
    initialZoom: 1,
    initialPan: { x: 0, y: 0 },
    startTouch: { x: 0, y: 0 },
  });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // 2-Finger Pinch Zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current.initialDistance = dist;
      touchStateRef.current.initialZoom = zoom;
      touchStateRef.current.initialPan = { ...pan };
    } else if (e.touches.length === 1) {
      // 1-Finger Pan
      touchStateRef.current.startTouch = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStateRef.current.initialDistance !== null) {
      // Pinching
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStateRef.current.initialDistance;
      const newZoom = Math.min(5.5, Math.max(0.15, touchStateRef.current.initialZoom * scale));
      setZoom(Number(newZoom.toFixed(3)));
    } else if (e.touches.length === 1 && isDragging) {
      // Panning
      setPan({
        x: e.touches[0].clientX - touchStateRef.current.startTouch.x,
        y: e.touches[0].clientY - touchStateRef.current.startTouch.y,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current.initialDistance = null;
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCanvasDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCanvasDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCanvasDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const isVideo = file.type.startsWith("video/");
          const isImg = file.type.startsWith("image/");
          if (isImg || isVideo) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            const reader = new FileReader();
            reader.onload = (ev) => {
              const fileDataUrl = ev.target?.result as string;
              if (isImg) {
                const img = new Image();
                img.onload = () => {
                  const nw = img.naturalWidth;
                  const nh = img.naturalHeight;
                  let detectedAspect = "original";
                  if (nw && nh) {
                    const ratio = nw / nh;
                    if (Math.abs(ratio - 1) < 0.04) detectedAspect = "1:1";
                    else if (Math.abs(ratio - 16 / 9) < 0.05) detectedAspect = "16:9";
                    else if (Math.abs(ratio - 9 / 16) < 0.05) detectedAspect = "9:16";
                    else if (Math.abs(ratio - 4 / 5) < 0.05) detectedAspect = "4:5";
                    else detectedAspect = `${nw}:${nh}`;
                  }
                  setDroppedMedia({
                    fileUrl: fileDataUrl,
                    isVideo: false,
                    title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
                    aspect: detectedAspect,
                  });
                };
                img.src = fileDataUrl;
              } else {
                setDroppedMedia({
                  fileUrl: fileDataUrl,
                  isVideo: true,
                  title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
                  aspect: "16:9",
                });
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      className={`fixed inset-0 z-[99999] bg-[#0c0d11] text-white select-none overflow-hidden touch-none ${
        isDragging
          ? "cursor-grabbing"
          : isSpacePressed
          ? "cursor-grab"
          : "cursor-default"
      }`}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* ── Background: Infinite Figma Dot-Grid Pattern ────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.18) 1.2px, transparent 1.2px)",
          backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Subtle Coordinate Axis Ambient Glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[150px] pointer-events-none"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
        }}
      />

      {/* ── Anti-Screenshot Security Shield (Activated on Window Blur) ─────────── */}
      {isWindowBlurred && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center pointer-events-auto animate-fade-in text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
            <HiShieldCheck className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold tracking-tight text-white mb-2 font-mono">
            RIZX CANVAS // PROTECTED VIEW
          </h4>
          <p className="text-sm text-neutral-400 max-w-md font-mono">
            {tr(
              "Tampilan karya diamankan. Klik atau kembali ke jendela browser untuk melanjutkan eksplorasi canvas.",
              "Canvas view is protected. Return to this window to resume exploring."
            )}
          </p>
        </div>
      )}

      {/* ── Drag & Drop Overlay on Canvas ────────────────────────────────────────── */}
      {isCanvasDragOver && (
        <div className="absolute inset-0 z-[120] bg-teal-950/80 backdrop-blur-md border-4 border-dashed border-teal-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="w-20 h-20 rounded-3xl bg-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center justify-center mb-4 scale-110 animate-bounce">
            <span className="text-3xl">📥</span>
          </div>
          <h3 className="text-xl font-bold text-white font-mono tracking-tight">
            Lepaskan File ke Canvas
          </h3>
          <p className="text-sm text-teal-300 font-mono mt-1">
            Mendukung file Gambar (PNG, JPG, WEBP, GIF) dan Video (MP4, WEBM)
          </p>
        </div>
      )}

      {/* ── Dialog Konfirmasi Dropped Media ke Canvas (Atur Judul, Cancel & Save) ── */}
      {droppedMedia && (
        <div className="absolute inset-0 z-[130] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-teal-500/30 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold">
                  🎨
                </span>
                <h4 className="text-sm font-bold text-white">Tambahkan Karya ke Canvas</h4>
              </div>
              <button
                onClick={() => setDroppedMedia(null)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Media Preview */}
            <div className="w-full h-44 rounded-xl bg-black overflow-hidden border border-white/10 flex items-center justify-center">
              {droppedMedia.isVideo ? (
                <video src={droppedMedia.fileUrl} controls className="max-h-44 w-auto rounded" />
              ) : (
                <img src={droppedMedia.fileUrl} alt="Drop Preview" className="max-h-44 w-auto object-contain" />
              )}
            </div>

            {/* Judul Text */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Judul Text Karya <span className="text-teal-400">*</span>
              </label>
              <input
                type="text"
                value={droppedMedia.title}
                onChange={(e) => setDroppedMedia({ ...droppedMedia, title: e.target.value })}
                placeholder="Masukkan judul karya..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Aspect Ratio Frame
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: "original", label: "Original" },
                  { id: "4:5", label: "4:5" },
                  { id: "16:9", label: "16:9" },
                  { id: "1:1", label: "1:1" },
                  { id: "9:16", label: "9:16" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setDroppedMedia({ ...droppedMedia, aspect: r.id })}
                    className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      droppedMedia.aspect === r.id
                        ? "border-teal-400 bg-teal-500/20 text-teal-300"
                        : "border-white/10 bg-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cancel & Save Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDroppedMedia(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal (Cancel)
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!droppedMedia.title.trim()) return;
                  await addCanvasItem({
                    id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    title: droppedMedia.title.trim(),
                    type: "Canvas Drop Upload",
                    clientName: "Selected Works",
                    aspect: droppedMedia.aspect,
                    image: droppedMedia.fileUrl,
                    isVideo: droppedMedia.isVideo,
                    mediaType: droppedMedia.isVideo ? "upload" : "image",
                    year: new Date().getFullYear().toString(),
                    tools: ["digital", "visual"],
                  });
                  setDroppedMedia(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold transition-colors shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                Simpan ke Canvas (Save)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar: Branding, Live Statistics, Fullscreen & Close (X) ─────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 p-3 sm:p-5 flex items-center justify-between pointer-events-none">
        {/* Left: Rizx Canvas Header Pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#13151b]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-[#16b09f] flex items-center justify-center text-black font-black text-xs shadow-md">
              <span className="font-mono text-[11px] font-black">R</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-white">
                  RIZX CANVAS
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-mono text-[9px] font-semibold border border-cyan-400/30">
                  STUDIO BOARD
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400 hidden sm:block">
                {sheets.length} {tr("Lembaran Karya Tersedia", "Portfolio Sheets")} · {tr("Zoom & Pan Bebas", "Free Zoom & Pan")}
              </p>
            </div>
          </div>

          {/* DRM Anti-theft Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl text-[11px] font-mono text-neutral-400">
            <HiLockClosed className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr("Proteksi Anti-Save & Anti-Copy Aktif", "DRM Protected · No Right Click")}</span>
          </div>
        </div>

        {/* Right: Actions (Help, Fullscreen, Close X) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Shortcuts Help Toggle */}
          <button
            type="button"
            onClick={() => setShowShortcutsHelp((prev) => !prev)}
            aria-label="Keyboard Shortcuts"
            title="Navigasi Canvas: Scroll = Zoom, Drag = Pan, Space = Hand Tool"
            className="w-10 h-10 rounded-2xl bg-[#13151b]/90 hover:bg-[#1c1f28] border border-white/10 backdrop-blur-xl flex items-center justify-center text-neutral-300 hover:text-white transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            <HiQuestionMarkCircle className="w-5 h-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="w-10 h-10 rounded-2xl bg-[#13151b]/90 hover:bg-[#1c1f28] border border-white/10 backdrop-blur-xl flex items-center justify-center text-neutral-300 hover:text-white transition-all shadow-xl active:scale-95 cursor-pointer hidden sm:flex"
          >
            {isFullscreen ? (
              <RiFullscreenExitFill className="w-4 h-4 text-cyan-400" />
            ) : (
              <RiFullscreenFill className="w-4 h-4" />
            )}
          </button>

          {/* CLOSE (X) BUTTON — Prominent, Elegant, Figma Escape Style */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Canvas Board"
            title="Tutup Canvas (Esc)"
            className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-500/40 backdrop-blur-xl transition-all shadow-2xl active:scale-95 cursor-pointer group"
          >
            <HiXMark className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-mono font-bold tracking-wider hidden sm:inline">
              ESC
            </span>
          </button>
        </div>
      </header>

      {/* ── Shortcuts Help Card Popover ───────────────────────────────────────── */}
      {showShortcutsHelp && (
        <div className="absolute top-20 right-5 z-50 w-72 rounded-2xl bg-[#13151b]/95 border border-white/15 p-4 backdrop-blur-2xl shadow-2xl animate-fade-in font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
            <span className="font-bold text-cyan-400 tracking-wider">NAVIGASI CANVAS</span>
            <button
              onClick={() => setShowShortcutsHelp(false)}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-neutral-300">
            <div className="flex justify-between items-center">
              <span>Zoom In / Out</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">Scroll Wheel / Pinch</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pan / Geser</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">Klik & Drag / 2 Jari</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hand Tool</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">Space + Drag</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fit All / Reset</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">F / Tombol [ ]</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Keluar Canvas</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">Tombol X / Esc</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2D Infinite Transform Content Engine ───────────────────────────────── */}
      <div
        ref={boardContentRef}
        className={`absolute top-0 left-0 origin-top-left transition-transform duration-75 ${
          isDragging ? "will-change-transform" : ""
        }`}
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Grid Arrangement of Deliverable Sheets */}
        <div className="p-16 flex flex-wrap gap-12 sm:gap-14 max-w-[2800px] items-start select-none">
          {sheets.map((sheet, index) => {
            const isSelected = selectedSheetId === sheet.id;

            // Sheet dimensions strictly matching original aspect ratio without cropping
            let sheetWidthClass = "w-[440px] sm:w-[540px]";
            let sheetStyle: React.CSSProperties = { aspectRatio: "4 / 5" };

            if (sheet.aspect === "16:9") {
              sheetWidthClass = "w-[560px] sm:w-[720px]";
              sheetStyle = { aspectRatio: "16 / 9" };
            } else if (sheet.aspect === "9:16") {
              sheetWidthClass = "w-[320px] sm:w-[380px]";
              sheetStyle = { aspectRatio: "9 / 16" };
            } else if (sheet.aspect === "1:1") {
              sheetWidthClass = "w-[440px] sm:w-[540px]";
              sheetStyle = { aspectRatio: "1 / 1" };
            } else if (sheet.aspect === "4:5") {
              sheetWidthClass = "w-[440px] sm:w-[540px]";
              sheetStyle = { aspectRatio: "4 / 5" };
            } else if (sheet.aspect && sheet.aspect.includes(":")) {
              const [wStr, hStr] = sheet.aspect.split(":");
              const wNum = parseFloat(wStr);
              const hNum = parseFloat(hStr);
              if (wNum && hNum) {
                sheetStyle = { aspectRatio: `${wNum} / ${hNum}` };
                sheetWidthClass = wNum > hNum ? "w-[560px] sm:w-[720px]" : "w-[440px] sm:w-[540px]";
              }
            } else if (sheet.aspect === "original" || !sheet.aspect) {
              sheetStyle = { aspectRatio: "auto", minHeight: "340px" };
              sheetWidthClass = "w-[460px] sm:w-[580px]";
            }

            return (
              <div
                key={sheet.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSheetId(sheet.id);
                }}
                className={`group relative flex flex-col rounded-2xl transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-cyan-400 shadow-[0_20px_60px_rgba(22,176,159,0.35)] scale-[1.01]"
                    : "hover:ring-1 hover:ring-white/40 shadow-2xl"
                }`}
              >
                {/* Figma Frame Top Label */}
                <div className="flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono text-neutral-300">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span className="font-bold text-white truncate">{sheet.clientName}</span>
                    <span className="text-neutral-500">/</span>
                    <span className="truncate opacity-80">{sheet.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-cyan-300 font-bold border border-white/10">
                      {sheet.aspect === "original" ? "ORIGINAL" : sheet.aspect}
                    </span>
                    {sheet.isVideo && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 uppercase">
                        VIDEO
                      </span>
                    )}
                  </div>
                </div>

                {/* Sheet Visual Container */}
                <div
                  className={`relative ${sheetWidthClass} rounded-2xl overflow-hidden bg-neutral-950 border border-white/15 shadow-2xl flex items-center justify-center`}
                  style={sheetStyle}
                >
                  {/* Visual Artwork - 100% Original Resolution & Razor-Sharp when Zoomed */}
                  <img
                    src={sheet.image}
                    alt={sheet.title}
                    draggable={false}
                    decoding="sync"
                    loading="eager"
                    className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 group-hover:scale-102"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "translateZ(0)",
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />

                  {/* Anti-theft Transparent Shield Layer (Interception Layer) */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-auto cursor-grab"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }}
                    draggable={false}
                  />

                  {/* Corner Accent */}
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    #{index + 1}
                  </div>

                  {/* Bottom Vignette with Deliverable Info */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end">
                    <h5 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-md">
                      {sheet.title}
                    </h5>
                    <p className="text-[10px] font-mono text-cyan-400/90 truncate mt-0.5">
                      {sheet.type || "Digital Asset"} · {sheet.year}
                    </p>
                  </div>
                </div>

                {/* Selection Corners (shown when clicked / focused) */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-cyan-400 border border-black rounded-xs shadow-sm pointer-events-none" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-black rounded-xs shadow-sm pointer-events-none" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-cyan-400 border border-black rounded-xs shadow-sm pointer-events-none" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-black rounded-xs shadow-sm pointer-events-none" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating Bottom Dock (Zoom Controls, Fit, Shortcuts) ───────────────── */}
      <footer className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#13151b]/95 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] font-mono text-xs">
        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={() => {
            const newZ = Math.max(0.18, zoom * 0.85);
            setZoom(Number(newZ.toFixed(2)));
          }}
          aria-label="Zoom Out"
          title="Zoom Out (-)"
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-neutral-300 hover:text-white transition-all active:scale-90 cursor-pointer"
        >
          <HiMiniMagnifyingGlassMinus className="w-4 h-4" />
        </button>

        {/* Zoom Percentage Pill (Click to reset 100%) */}
        <button
          type="button"
          onClick={() => setZoom(1.0)}
          aria-label="Reset Zoom 100%"
          title="Klik untuk Reset Zoom ke 100%"
          className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-cyan-400 hover:text-cyan-300 transition-all text-xs cursor-pointer min-w-[56px] text-center"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom In Button */}
        <button
          type="button"
          onClick={() => {
            const newZ = Math.min(5.5, zoom * 1.15);
            setZoom(Number(newZ.toFixed(2)));
          }}
          aria-label="Zoom In"
          title="Zoom In (+)"
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-neutral-300 hover:text-white transition-all active:scale-90 cursor-pointer"
        >
          <HiMiniMagnifyingGlassPlus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/15 mx-1" />

        {/* Zoom to Fit */}
        <button
          type="button"
          onClick={zoomToFit}
          aria-label="Zoom to Fit All"
          title="Zoom to Fit All (F)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-neutral-300 hover:text-cyan-300 transition-all active:scale-90 cursor-pointer text-xs"
        >
          <HiArrowsPointingOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit All</span>
        </button>

        {/* Reset Pan Position */}
        <button
          type="button"
          onClick={() => setPan({ x: 0, y: 0 })}
          aria-label="Center Origin"
          title="Kembali ke Titik Awal"
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90 cursor-pointer hidden sm:flex"
        >
          <HiArrowPath className="w-3.5 h-3.5" />
        </button>
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiTrash,
  HiArrowPath,
  HiCheckCircle,
  HiXMark,
  HiCloudArrowUp,
  HiLink,
  HiPhoto,
  HiFilm,
  HiPencilSquare,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
  HiMiniMagnifyingGlassPlus,
  HiMiniMagnifyingGlassMinus,
  HiFolder,
  HiRectangleGroup,
  HiLanguage,
  HiCursorArrowRays,
  HiHandRaised,
} from "react-icons/hi2";
import { SiYoutube, SiGoogledrive } from "react-icons/si";
import { usePortfolioData, extractYouTubeId, CanvasItem } from "@/context/PortfolioDataContext";
import { extractGoogleDriveFileId, normalizeMediaUrl } from "@/lib/mediaService";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

interface CanvasWorkspaceProps {
  onOpenCanvasPreview?: () => void;
}

type CanvasTool = "select" | "hand" | "section" | "folder" | "text" | "media";

export default function CanvasWorkspace({ onOpenCanvasPreview }: CanvasWorkspaceProps) {
  const { clients, heroWorks, canvasItems, updateCanvasItems } = usePortfolioData();
  const { tr } = useLang();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

  // Canvas Viewport Transform Engine (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Selected element & dragging on canvas
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragItemOffset, setDragItemOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas items state
  const [items, setItems] = useState<CanvasItem[]>([]);
  const initialItemsRef = useRef<CanvasItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Drag & drop file overlay state
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // Modal / Quick Link input state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [modalLinkUrl, setModalLinkUrl] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalAspect, setModalAspect] = useState("original");

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize items from context or layout initial client works
  useEffect(() => {
    if (canvasItems && canvasItems.length > 0) {
      setItems(canvasItems);
      initialItemsRef.current = JSON.parse(JSON.stringify(canvasItems));
      setHasChanges(false);
      return;
    }

    // Default: Seed initial layout with sections, folders, and client deliverables
    const initialList: CanvasItem[] = [];

    // 1. Initial Sections
    initialList.push({
      id: "section-commercial",
      title: "Commercial & Video Advertising",
      type: "section",
      mediaType: "section",
      x: 40,
      y: 40,
      width: 1400,
      height: 720,
      color: "#00A389",
    });

    initialList.push({
      id: "section-identity",
      title: "Brand Identity & Graphic Assets",
      type: "section",
      mediaType: "section",
      x: 40,
      y: 800,
      width: 1400,
      height: 720,
      color: "#3b82f6",
    });

    // 2. Initial Folders from clients
    (clients || []).slice(0, 3).forEach((c, idx) => {
      initialList.push({
        id: `folder-${c.id}`,
        title: c.clientName,
        type: "folder",
        mediaType: "folder",
        clientName: c.clientName,
        clientId: c.id,
        x: 80 + idx * 320,
        y: 110,
        color: c.color || "#00A389",
      });
    });

    // 3. Client Deliverables
    let cardX = 80;
    let cardY = 220;
    let countInRow = 0;

    (clients || []).forEach((c) => {
      (c.works || []).forEach((w: any) => {
        if (w.image || w.gdriveUrl || w.videoId) {
          initialList.push({
            id: w.id || `canvas-${c.id}-${Math.random().toString(36).substr(2, 6)}`,
            title: w.title || "Deliverable",
            type: "media",
            mediaType: w.videoId ? "youtube" : w.gdriveUrl ? "gdrive" : "image",
            image: normalizeMediaUrl(
              w.image || (w.videoId ? `https://img.youtube.com/vi/${w.videoId}/maxresdefault.jpg` : "")
            ),
            aspect: w.aspect || "4:5",
            clientName: c.clientName,
            clientId: c.id,
            x: cardX,
            y: cardY,
            isVideo: Boolean(w.isVideo || w.videoId),
            youtubeUrl: w.youtubeUrl,
            videoId: w.videoId,
            gdriveUrl: w.gdriveUrl,
          });

          cardX += 380;
          countInRow++;
          if (countInRow >= 3) {
            countInRow = 0;
            cardX = 80;
            cardY += 460;
          }
        }
      });
    });

    setItems(initialList);
    initialItemsRef.current = JSON.parse(JSON.stringify(initialList));
    setHasChanges(false);
  }, [canvasItems, clients]);

  // Update items helper with tracking
  const updateItemsWithTracking = useCallback((newItems: CanvasItem[]) => {
    setItems(newItems);
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  // Keyboard Shortcuts (Space for Pan, Delete to Remove)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      }
      if (e.key === "v" || e.key === "V") {
        setActiveTool("select");
      }
      if (e.key === "h" || e.key === "H") {
        setActiveTool("hand");
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        handleDeleteItem(selectedId);
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
  }, [isSpacePressed, selectedId]);

  // Wheel Zoom centered at Cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(5.5, Math.max(0.18, zoom * zoomFactor));

    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const newPanX = cursorX - (cursorX - pan.x) * (newZoom / zoom);
    const newPanY = cursorY - (cursorY - pan.y) * (newZoom / zoom);

    setZoom(Number(newZoom.toFixed(3)));
    setPan({ x: newPanX, y: newPanY });
  };

  // Canvas Mouse Down (Panning or Selecting background)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on canvas background directly
    if (e.target === e.currentTarget || isSpacePressed || activeTool === "hand" || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      if (activeTool === "select" && !isSpacePressed) {
        setSelectedId(null);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingItemId) {
      // Calculate canvas coordinates based on zoom and pan
      const currentX = (e.clientX - pan.x) / zoom - dragItemOffset.x;
      const currentY = (e.clientY - pan.y) / zoom - dragItemOffset.y;

      setItems((prev) =>
        prev.map((it) => (it.id === draggingItemId ? { ...it, x: Math.round(currentX), y: Math.round(currentY) } : it))
      );
      setHasChanges(true);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingItemId(null);
  };

  // Start dragging an individual canvas item
  const handleItemMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    setSelectedId(item.id);

    if (activeTool === "hand" || isSpacePressed) return;

    setDraggingItemId(item.id);
    const itemCanvasX = (e.clientX - pan.x) / zoom;
    const itemCanvasY = (e.clientY - pan.y) / zoom;
    setDragItemOffset({
      x: itemCanvasX - (item.x || 0),
      y: itemCanvasY - (item.y || 0),
    });
  };

  // Add Tools Directly on Canvas
  const handleAddSection = () => {
    const newSection: CanvasItem = {
      id: `section-${Date.now()}`,
      title: "New Section Frame",
      type: "section",
      mediaType: "section",
      x: Math.round((-pan.x + 120) / zoom),
      y: Math.round((-pan.y + 120) / zoom),
      width: 1100,
      height: 600,
      color: "#00A389",
    };
    updateItemsWithTracking([...items, newSection]);
    setSelectedId(newSection.id);
  };

  const handleAddFolder = () => {
    const newFolder: CanvasItem = {
      id: `folder-${Date.now()}`,
      title: "New Client Folder",
      type: "folder",
      mediaType: "folder",
      clientName: "Client Project",
      x: Math.round((-pan.x + 160) / zoom),
      y: Math.round((-pan.y + 160) / zoom),
      color: "#00A389",
    };
    updateItemsWithTracking([...items, newFolder]);
    setSelectedId(newFolder.id);
  };

  const handleAddText = () => {
    const newText: CanvasItem = {
      id: `text-${Date.now()}`,
      title: "Add Title / Sticky Note",
      type: "text",
      mediaType: "text",
      content: "Tuliskan keterangan karya atau catatan arahan visual...",
      x: Math.round((-pan.x + 200) / zoom),
      y: Math.round((-pan.y + 200) / zoom),
      color: "#f59e0b",
    };
    updateItemsWithTracking([...items, newText]);
    setSelectedId(newText.id);
  };

  // Process Dropped or Uploaded File
  const handleProcessDroppedFile = (file: File, dropCanvasX?: number, dropCanvasY?: number) => {
    const isVideo = file.type.startsWith("video/");
    const isImg = file.type.startsWith("image/");
    if (!isImg && !isVideo) return;

    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const reader = new FileReader();

    reader.onload = (ev) => {
      const result = ev.target?.result as string;

      const placeX = dropCanvasX ?? Math.round((-pan.x + 200) / zoom);
      const placeY = dropCanvasY ?? Math.round((-pan.y + 200) / zoom);

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

          const newItem: CanvasItem = {
            id: `media-${Date.now()}`,
            title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            type: "media",
            mediaType: "image",
            image: result,
            aspect: detectedAspect,
            clientName: "Selected Work",
            x: placeX,
            y: placeY,
            isVideo: false,
          };
          updateItemsWithTracking([newItem, ...items]);
          setSelectedId(newItem.id);
        };
        img.src = result;
      } else {
        const newItem: CanvasItem = {
          id: `media-${Date.now()}`,
          title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          type: "media",
          mediaType: "upload",
          image: result,
          aspect: "16:9",
          clientName: "Selected Work",
          x: placeX,
          y: placeY,
          isVideo: true,
        };
        updateItemsWithTracking([newItem, ...items]);
        setSelectedId(newItem.id);
      }
    };

    reader.readAsDataURL(file);
  };

  // Direct Drag & Drop on Canvas
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      const dropClientX = rect ? e.clientX - rect.left : e.clientX;
      const dropClientY = rect ? e.clientY - rect.top : e.clientY;
      const dropCanvasX = Math.round((dropClientX - pan.x) / zoom);
      const dropCanvasY = Math.round((dropClientY - pan.y) / zoom);

      handleProcessDroppedFile(e.dataTransfer.files[0], dropCanvasX, dropCanvasY);
    }
  };

  // Delete an Item
  const handleDeleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    updateItemsWithTracking(updated);
    if (selectedId === id) setSelectedId(null);
  };

  // Update item inline text/title
  const handleUpdateItemTitle = (id: string, newTitle: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, title: newTitle } : it)));
    setHasChanges(true);
  };

  const handleUpdateItemContent = (id: string, newContent: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, content: newContent } : it)));
    setHasChanges(true);
  };

  // Zoom to Fit All Elements
  const zoomToFitAll = () => {
    if (!canvasContainerRef.current || items.length === 0) return;
    const { clientWidth, clientHeight } = canvasContainerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    items.forEach((it) => {
      const x = it.x || 0;
      const y = it.y || 0;
      const w = it.width || 380;
      const h = it.height || 480;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const contentW = maxX - minX + 200;
    const contentH = maxY - minY + 200;

    const scaleX = (clientWidth * 0.9) / contentW;
    const scaleY = (clientHeight * 0.9) / contentH;
    const fitScale = Math.min(1.2, Math.max(0.25, Math.min(scaleX, scaleY)));

    setZoom(Number(fitScale.toFixed(2)));
    setPan({
      x: Math.round((clientWidth - contentW * fitScale) / 2 - minX * fitScale + 100 * fitScale),
      y: Math.round((clientHeight - contentH * fitScale) / 2 - minY * fitScale + 100 * fitScale),
    });
  };

  // Cancel & Save actions
  const handleCancelChanges = () => {
    setItems(JSON.parse(JSON.stringify(initialItemsRef.current)));
    setHasChanges(false);
    setSelectedId(null);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateCanvasItems(items);
      initialItemsRef.current = JSON.parse(JSON.stringify(items));
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (_) {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  // Add Media from Modal Link
  const handleAddMediaFromLink = () => {
    if (!modalLinkUrl.trim()) return;

    const ytId = extractYouTubeId(modalLinkUrl);
    const driveId = extractGoogleDriveFileId(modalLinkUrl);

    let imgPreview = modalLinkUrl;
    let isVideo = false;

    if (ytId) {
      imgPreview = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      isVideo = true;
    } else if (driveId) {
      imgPreview = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
      isVideo = true;
    }

    const newItem: CanvasItem = {
      id: `media-${Date.now()}`,
      title: modalTitle.trim() || (ytId ? "YouTube Video" : "Digital Asset"),
      type: "media",
      mediaType: ytId ? "youtube" : driveId ? "gdrive" : isVideo ? "upload" : "image",
      image: imgPreview,
      aspect: modalAspect,
      clientName: "Selected Work",
      x: Math.round((-pan.x + 200) / zoom),
      y: Math.round((-pan.y + 200) / zoom),
      isVideo,
      youtubeUrl: ytId ? modalLinkUrl : undefined,
      videoId: ytId || undefined,
      gdriveUrl: driveId ? modalLinkUrl : undefined,
      gdriveId: driveId || undefined,
    };

    updateItemsWithTracking([newItem, ...items]);
    setSelectedId(newItem.id);
    setIsLinkModalOpen(false);
    setModalLinkUrl("");
    setModalTitle("");
  };

  // Fullscreen Mode Toggle & Listeners
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRootRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (typeof document !== "undefined" && document.fullscreenEnabled && !document.fullscreenElement) {
        try {
          document.documentElement.requestFullscreen().catch(() => {});
        } catch (_) {}
      }
    } else {
      setIsFullscreen(false);
      if (typeof document !== "undefined" && document.fullscreenElement) {
        try {
          document.exitFullscreen().catch(() => {});
        } catch (_) {}
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <div
      ref={workspaceRootRef}
      className={`${
        isFullscreen
          ? "fixed inset-0 z-[999999] w-screen h-screen"
          : "flex-1 w-full h-full relative min-w-0"
      } flex flex-col select-none overflow-hidden touch-none transition-colors duration-200 ${
        isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#0a0b0e] text-white"
      }`}
    >
      {/* ── Top Bar: Figma Style Toolbar & Global Actions ─────────────────────── */}
      <header className={`h-14 shrink-0 px-4 flex items-center justify-between z-30 shadow-md border-b transition-colors ${
        isLight ? "bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50" : "bg-[#0f1115] border-white/10 text-white"
      }`}>
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold shadow-xs">
              🎨
            </span>
            <span className={`font-bold text-xs sm:text-sm tracking-tight font-mono ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              RIZX CANVAS EDITOR
            </span>
          </div>

          <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full border text-[10px] font-mono ${
            isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-neutral-400"
          }`}>
            {items.length} Elements
          </span>
        </div>

        {/* Center: Tools (Select, Hand, + Section, + Folder, + Text, + Media) */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border shadow-inner ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-black/60 border-white/10"
        }`}>
          {/* Select Tool */}
          <button
            type="button"
            onClick={() => setActiveTool("select")}
            title="Select & Move (V)"
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === "select"
                ? "bg-teal-500 text-black shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-950 hover:bg-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <HiCursorArrowRays className="w-4 h-4" />
            <span className="hidden md:inline">Select</span>
          </button>

          {/* Hand Tool */}
          <button
            type="button"
            onClick={() => setActiveTool("hand")}
            title="Hand Tool / Pan (H)"
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === "hand"
                ? "bg-teal-500 text-black shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-950 hover:bg-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <HiHandRaised className="w-4 h-4" />
            <span className="hidden md:inline">Pan</span>
          </button>

          <div className={`w-[1px] h-4 mx-1 ${isLight ? "bg-slate-300" : "bg-white/15"}`} />

          {/* + Section */}
          <button
            type="button"
            onClick={handleAddSection}
            title="Tambahkan Section Pembatas Baru"
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? "text-slate-700 hover:text-slate-950 hover:bg-white" : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiRectangleGroup className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">+ Section</span>
          </button>

          {/* + Folder */}
          <button
            type="button"
            onClick={handleAddFolder}
            title="Tambahkan Folder Client Baru"
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? "text-slate-700 hover:text-slate-950 hover:bg-white" : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiFolder className="w-4 h-4 text-teal-500" />
            <span className="hidden sm:inline">+ Folder</span>
          </button>

          {/* + Text */}
          <button
            type="button"
            onClick={handleAddText}
            title="Tambahkan Teks / Catatan Langsung di Canvas"
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? "text-slate-700 hover:text-slate-950 hover:bg-white" : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiLanguage className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">+ Text</span>
          </button>

          {/* + Media (Drop or Link) */}
          <button
            type="button"
            onClick={() => setIsLinkModalOpen(true)}
            title="Tambahkan Media via Link (YouTube / Drive) atau File"
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? "text-slate-700 hover:text-slate-950 hover:bg-white" : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiPhoto className="w-4 h-4 text-cyan-500" />
            <span className="hidden sm:inline">+ Media</span>
          </button>

          {/* Hidden File Picker Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleProcessDroppedFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>

        {/* Right: Fullscreen, Save / Cancel Controls */}
        <div className="flex items-center gap-2">
          {/* Fullscreen Mode Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh (Esc)" : "Layar Penuh / Fullscreen"}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? "bg-teal-500 text-black border-teal-400 font-bold shadow-sm"
                : isLight
                ? "border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-950"
                : "border-white/10 hover:bg-white/10 text-neutral-200 hover:text-white"
            }`}
          >
            {isFullscreen ? (
              <>
                <HiArrowsPointingIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <HiArrowsPointingOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>

          {hasChanges && (
            <button
              type="button"
              onClick={handleCancelChanges}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-white/10 hover:bg-white/5 text-neutral-300"
              }`}
            >
              Batal
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || !hasChanges}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              hasChanges
                ? "bg-teal-500 hover:bg-teal-400 text-black shadow-teal-500/20"
                : isLight
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <HiCheckCircle className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Success Notification Bar */}
      {saveSuccess && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl backdrop-blur-md">
          <HiCheckCircle className="w-4 h-4 text-emerald-400" />
          <span>✓ Perubahan Canvas Berhasil Disimpan & Live di Web!</span>
        </div>
      )}

      {/* ── Main Canvas Viewport (Infinite 2D Workspace) ───────────────────────── */}
      <div
        ref={canvasContainerRef}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
        className={`flex-1 relative w-full h-full overflow-hidden ${
          isPanning || activeTool === "hand" || isSpacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        }`}
      >
        {/* Background Dot Grid Pattern */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
            isLight ? "opacity-60" : "opacity-40"
          }`}
          style={{
            backgroundImage: isLight
              ? "radial-gradient(rgba(15, 23, 42, 0.16) 1.2px, transparent 1.2px)"
              : "radial-gradient(rgba(255, 255, 255, 0.22) 1.2px, transparent 1.2px)",
            backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        {/* Drag & Drop Visual Overlay */}
        {isDragOverCanvas && (
          <div className="absolute inset-0 z-50 bg-teal-950/70 border-4 border-dashed border-teal-400 flex flex-col items-center justify-center pointer-events-none backdrop-blur-xs">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center justify-center text-3xl mb-3 animate-bounce">
              📥
            </div>
            <p className="text-lg font-bold text-white font-mono">Lepaskan File di Sini ke Canvas</p>
            <p className="text-xs text-teal-300 font-mono mt-0.5">Mendukung Gambar (PNG, JPG, WEBP) & Video (MP4)</p>
          </div>
        )}

        {/* ── Transform Content Engine (Scales and Pans Elements) ──────────────── */}
        <div
          className={`absolute top-0 left-0 origin-top-left transition-transform duration-75 ${
            isPanning ? "will-change-transform" : ""
          }`}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            const x = item.x || 0;
            const y = item.y || 0;

            // 1. SECTION FRAME (Figma Style Boundary Section)
            if (item.type === "section" || item.mediaType === "section") {
              const secWidth = item.width || 1200;
              const secHeight = item.height || 600;

              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    width: `${secWidth}px`,
                    height: `${secHeight}px`,
                  }}
                  className={`absolute rounded-3xl border-2 border-dashed transition-all duration-150 p-4 flex flex-col justify-between ${
                    isSelected
                      ? "border-teal-400 bg-teal-500/[0.04] shadow-[0_0_30px_rgba(20,184,166,0.15)] ring-2 ring-teal-400/50"
                      : "border-white/15 bg-white/[0.015] hover:border-white/30"
                  }`}
                >
                  {/* Section Top Header Pill */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-teal-400 text-sm font-bold text-white font-mono focus:outline-none px-1 py-0.5 rounded"
                      />
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">SECTION</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Hapus Section"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right text-[11px] font-mono text-neutral-500 select-none">
                    {secWidth} × {secHeight}
                  </div>
                </div>
              );
            }

            // 2. FOLDER CLIENT (Folder Card directly on Canvas)
            if (item.type === "folder" || item.mediaType === "folder") {
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    width: "280px",
                  }}
                  className={`absolute rounded-2xl bg-[#111318]/95 border backdrop-blur-xl p-3.5 transition-all shadow-xl flex flex-col gap-2.5 cursor-grab active:cursor-grabbing ${
                    isSelected
                      ? "border-teal-400 shadow-[0_15px_40px_rgba(20,184,166,0.3)] ring-2 ring-teal-400/40"
                      : "border-white/15 hover:border-white/30 hover:bg-[#14171f]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold shrink-0">
                        📁
                      </span>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-teal-400 text-xs font-bold text-white focus:outline-none w-36"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1 rounded"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-white/5">
                    <span>Folder Client</span>
                    <span className="text-teal-400">Direct Vault Link</span>
                  </div>
                </div>
              );
            }

            // 3. TEXT / STICKY NOTE (Direct Typography on Canvas)
            if (item.type === "text" || item.mediaType === "text") {
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    width: "320px",
                  }}
                  className={`absolute rounded-2xl bg-[#15171e]/95 border p-4 transition-all shadow-xl flex flex-col gap-2 cursor-grab active:cursor-grabbing ${
                    isSelected
                      ? "border-amber-400 shadow-[0_15px_40px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/40"
                      : "border-white/15 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 text-sm font-bold text-amber-300 focus:outline-none w-full"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    value={item.content || ""}
                    onChange={(e) => handleUpdateItemContent(item.id, e.target.value)}
                    rows={3}
                    placeholder="Tuliskan catatan arahan visual..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
                </div>
              );
            }

            // 4. MEDIA ARTBOARD (Gambar & Video) - 100% Original Resolution & Aspect Ratio
            let cardWidth = 440;
            let cardAspect = "4 / 5";

            if (item.aspect === "16:9") {
              cardWidth = 560;
              cardAspect = "16 / 9";
            } else if (item.aspect === "9:16") {
              cardWidth = 320;
              cardAspect = "9 / 16";
            } else if (item.aspect === "1:1") {
              cardWidth = 440;
              cardAspect = "1 / 1";
            } else if (item.aspect && item.aspect.includes(":")) {
              const [wStr, hStr] = item.aspect.split(":");
              const wNum = parseFloat(wStr);
              const hNum = parseFloat(hStr);
              if (wNum && hNum) {
                cardAspect = `${wNum} / ${hNum}`;
                cardWidth = wNum > hNum ? 560 : 440;
              }
            } else if (item.aspect === "original") {
              cardAspect = "auto";
              cardWidth = 460;
            }

            return (
              <div
                key={item.id}
                onMouseDown={(e) => handleItemMouseDown(e, item)}
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0)`,
                  width: `${cardWidth}px`,
                }}
                className={`group absolute rounded-2xl flex flex-col transition-all duration-150 select-none cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? "ring-2 ring-teal-400 shadow-[0_25px_60px_rgba(20,184,166,0.35)] scale-[1.01]"
                    : "hover:ring-1 hover:ring-white/40 shadow-2xl"
                }`}
              >
                {/* Header Label (Editable Title & Actions) */}
                <div className="flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-neutral-300">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-teal-400 text-white font-bold truncate focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-teal-300 font-bold border border-white/10">
                      {item.aspect === "original" ? "ORIGINAL" : item.aspect}
                    </span>
                    {item.isVideo && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 uppercase">
                        VIDEO
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors"
                      title="Hapus Media"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Media Container - High-DPI Sharp Rendering */}
                <div
                  className="relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/15 shadow-2xl flex items-center justify-center"
                  style={{
                    aspectRatio: cardAspect,
                    minHeight: item.aspect === "original" ? "320px" : undefined,
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      decoding="sync"
                      loading="eager"
                      className="w-full h-full object-contain pointer-events-none select-none"
                      style={{
                        imageRendering: "-webkit-optimize-contrast",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "translateZ(0)",
                      }}
                    />
                  ) : (
                    <div className="text-neutral-600 text-xs font-mono">No Media</div>
                  )}

                  {/* Corner Drag Indicator */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating Bottom Dock (Zoom Controls, Fit, Quick Add) ─────────────── */}
      <footer className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-2xl font-mono text-xs border ${
        isLight
          ? "bg-white/95 border-slate-300 text-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
          : "bg-[#13151b]/95 border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      }`}>
        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => {
            const newZ = Math.max(0.18, zoom * 0.85);
            setZoom(Number(newZ.toFixed(2)));
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950"
              : "bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
          }`}
          title="Zoom Out (-)"
        >
          <HiMiniMagnifyingGlassMinus className="w-4 h-4" />
        </button>

        {/* Reset 100% */}
        <button
          type="button"
          onClick={() => setZoom(1.0)}
          className={`px-3 py-1 rounded-xl font-bold text-xs cursor-pointer min-w-[56px] text-center transition-all ${
            isLight
              ? "bg-teal-50 hover:bg-teal-100 text-teal-700"
              : "bg-white/5 hover:bg-white/10 text-teal-400 hover:text-teal-300"
          }`}
          title="Reset Zoom ke 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => {
            const newZ = Math.min(5.5, zoom * 1.15);
            setZoom(Number(newZ.toFixed(2)));
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950"
              : "bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
          }`}
          title="Zoom In (+)"
        >
          <HiMiniMagnifyingGlassPlus className="w-4 h-4" />
        </button>

        <div className={`w-[1px] h-4 mx-1 ${isLight ? "bg-slate-200" : "bg-white/15"}`} />

        {/* Zoom to Fit All */}
        <button
          type="button"
          onClick={zoomToFitAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
            isLight
              ? "bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800"
              : "bg-white/5 hover:bg-teal-500/20 text-neutral-300 hover:text-teal-300"
          }`}
          title="Fit All Elements (F)"
        >
          <HiArrowsPointingOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit All</span>
        </button>

        {/* Center Pan Origin */}
        <button
          type="button"
          onClick={() => setPan({ x: 80, y: 80 })}
          className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-[11px] ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
              : "bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white"
          }`}
          title="Reset Posisi Pan"
        >
          Reset Pan
        </button>

        <div className={`w-[1px] h-4 mx-1 ${isLight ? "bg-slate-200" : "bg-white/15"}`} />

        {/* Fullscreen Dock Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
            isFullscreen
              ? "bg-teal-500 text-black font-bold shadow-sm"
              : isLight
              ? "bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800"
              : "bg-white/5 hover:bg-teal-500/20 text-neutral-300 hover:text-teal-300"
          }`}
          title={isFullscreen ? "Keluar Fullscreen (Esc)" : "Layar Penuh / Fullscreen"}
        >
          {isFullscreen ? <HiArrowsPointingIn className="w-3.5 h-3.5" /> : <HiArrowsPointingOut className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
        </button>
      </footer>

      {/* ── Modal: Add Media via Link (YouTube / Drive) or Upload ─────────────── */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1115] border border-white/15 p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold">
                  🖼️
                </span>
                <h3 className="font-bold text-sm text-white">Tambahkan Media ke Canvas</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Upload from Device */}
            <div
              onClick={() => {
                fileInputRef.current?.click();
                setIsLinkModalOpen(false);
              }}
              className="p-4 rounded-xl border border-dashed border-teal-500/40 bg-teal-500/5 hover:bg-teal-500/10 flex items-center justify-center gap-2 text-xs font-bold text-teal-300 cursor-pointer transition-all"
            >
              <HiCloudArrowUp className="w-5 h-5 text-teal-400" />
              <span>Upload Gambar atau Video dari Device</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span>ATAU MASUKKAN LINK</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Link URL Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Link YouTube atau Google Drive
              </label>
              <input
                type="text"
                value={modalLinkUrl}
                onChange={(e) => setModalLinkUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... atau link Drive"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Judul Text */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Judul Karya
              </label>
              <input
                type="text"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="Contoh: Byru HRIS - Reel 2026"
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
                    onClick={() => setModalAspect(r.id)}
                    className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      modalAspect === r.id
                        ? "border-teal-400 bg-teal-500/20 text-teal-300"
                        : "border-white/10 bg-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddMediaFromLink}
                disabled={!modalLinkUrl.trim()}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-black text-xs font-bold transition-colors shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                + Tambah ke Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

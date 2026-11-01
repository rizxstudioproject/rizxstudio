"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  HiPlus,
  HiTrash,
  HiArrowPath,
  HiCheckCircle,
  HiCheck,
  HiXMark,
  HiCloudArrowUp,
  HiLink,
  HiPhoto,
  HiFilm,
  HiPencilSquare,
  HiPencil,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
  HiMiniMagnifyingGlassPlus,
  HiMiniMagnifyingGlassMinus,
  HiFolder,
  HiRectangleGroup,
  HiLanguage,
  HiCursorArrowRays,
  HiHandRaised,
  HiHashtag,
  HiScissors,
  HiSquare2Stack,
  HiChatBubbleBottomCenterText,
  HiCodeBracket,
  HiCodeBracketSquare,
  HiPlay,
  HiChevronDown,
  HiChevronRight,
  HiSparkles,
  HiLockClosed,
  HiLockOpen,
  HiEye,
  HiEyeSlash,
  HiBars3BottomLeft,
  HiEllipsisHorizontal,
  HiMinus,
  HiQuestionMarkCircle,
  HiAdjustmentsHorizontal,
} from "react-icons/hi2";
import { SiYoutube, SiGoogledrive } from "react-icons/si";
import { usePortfolioData, extractYouTubeId, CanvasItem } from "@/context/PortfolioDataContext";
import { extractGoogleDriveFileId, normalizeMediaUrl } from "@/lib/mediaService";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import AspectRatioPicker, { RatioWireframeIcon, AspectPreset } from "./AspectRatioPicker";

interface CanvasWorkspaceProps {
  onOpenCanvasPreview?: () => void;
  hideTopHeader?: boolean;
  isMobile?: boolean;
}

type CanvasTool = "select" | "hand" | "scale" | "frame" | "section" | "slice" | "shape" | "pen" | "pencil" | "text" | "folder" | "media" | "comment";

export default function CanvasWorkspace({
  onOpenCanvasPreview,
  hideTopHeader = false,
  isMobile = false,
}: CanvasWorkspaceProps) {
  const { clients, heroWorks, canvasItems, updateCanvasItems } = usePortfolioData();
  const { tr } = useLang();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

  // Canvas Viewport Transform Engine (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [showMeasureTool, setShowMeasureTool] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Studio UI Layout State (Figma-style Collapsible Panels & Pill)
  const [isUiExpanded, setIsUiExpanded] = useState<boolean>(!isMobile);
  const [isPillMenuOpen, setIsPillMenuOpen] = useState<boolean>(false);
  const [showExpandTooltip, setShowExpandTooltip] = useState<boolean>(false);
  const [activeClientFilter, setActiveClientFilter] = useState<string | null>(null);
  const [showFramePresetsPicker, setShowFramePresetsPicker] = useState(false);

  // Layers Tree State (Expanded folders/groups, item lock and visibility toggles)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [lockedItemIds, setLockedItemIds] = useState<Set<string>>(new Set());
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set());

  const toggleFolderExpanded = (key: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const toggleExpandAll = () => {
    const isAnyCollapsed = Object.values(expandedFolders).some((v) => v === false);
    const nextState: Record<string, boolean> = {};
    clients.forEach((c) => {
      nextState[c.clientName] = isAnyCollapsed ? true : false;
    });
    setExpandedFolders(nextState);
  };

  const toggleItemLock = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLockedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItemVisibility = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHiddenItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Close submenus on clicking outside toolbar or pill menu
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.(".figma-toolbar-dock") && !target.closest?.(".figma-toolbar-submenu")) {
        setActiveSubmenu(null);
      }
      if (!target.closest?.(".figma-pill-menu")) {
        setIsPillMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("touchstart", handleGlobalClick, { passive: true });
    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
    };
  }, []);

  // Selected element & dragging on canvas
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Context Menu State (Figma Right Click Popup Menu)
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    item?: CanvasItem | null;
  } | null>(null);
  const [contextSubmenu, setContextSubmenu] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const copiedItemRef = useRef<CanvasItem | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragItemOffset, setDragItemOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRafRef = useRef<number | null>(null);
  const pendingPanRef = useRef<{ x: number; y: number } | null>(null);
  const pendingItemDragRef = useRef<{ id: string; x: number; y: number } | null>(null);

  // Canvas items state
  const [items, setItems] = useState<CanvasItem[]>([]);
  const initialItemsRef = useRef<CanvasItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Right Inspector Sidebar State (Images 1, 2, 3)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [inspectorTab, setInspectorTab] = useState<"design" | "prototype">("design");
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState<boolean>(false);

  const selectedItem = useMemo(() => items.find((it) => it.id === selectedId) || null, [items, selectedId]);

  const updateSelectedItem = useCallback((updater: Partial<CanvasItem>) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((it) => (it.id === selectedId ? { ...it, ...updater } : it))
    );
    setHasChanges(true);
  }, [selectedId]);

  const handleShareCanvas = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/canvas` : "/canvas";
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch (_) {}
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  }, []);

  // Alignment Handler
  const handleAlign = useCallback(
    (alignment: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom" | "distribute") => {
      if (!selectedItem) return;
      const curW = selectedItem.width || 440;
      const curH = selectedItem.height || 400;

      const container = canvasContainerRef.current;
      const cw = container?.clientWidth || 800;
      const ch = container?.clientHeight || 600;
      const viewCenterX = Math.round((cw / 2 - pan.x) / zoom);
      const viewCenterY = Math.round((ch / 2 - pan.y) / zoom);

      if (alignment === "left") {
        updateSelectedItem({ x: 0 });
      } else if (alignment === "hcenter") {
        updateSelectedItem({ x: Math.round(viewCenterX - curW / 2) });
      } else if (alignment === "right") {
        updateSelectedItem({ x: 1000 });
      } else if (alignment === "top") {
        updateSelectedItem({ y: 0 });
      } else if (alignment === "vcenter") {
        updateSelectedItem({ y: Math.round(viewCenterY - curH / 2) });
      } else if (alignment === "bottom") {
        updateSelectedItem({ y: 800 });
      } else if (alignment === "distribute") {
        updateSelectedItem({ x: Math.round(selectedItem.x || 0), y: Math.round(selectedItem.y || 0) });
      }
    },
    [selectedItem, pan, zoom, updateSelectedItem]
  );

  // Selection Colors (Matches Image 2)
  const selectionColors = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.color) set.add(it.color.toUpperCase());
    });
    // Add iconic Figma preset colors matching screenshot 2
    const defaultColors = ["#E5BF00", "#F9FAEF", "#FDD835", "#000000", "#5B502B", "#00A389", "#0C8CE9", "#FFFFFF"];
    defaultColors.forEach((c) => set.add(c));
    return Array.from(set);
  }, [items]);

  const handleExportSelection = useCallback((format = "png") => {
    if (!selectedItem) return;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(selectedItem, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedItem.title || "canvas-item"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (selectedItem.image) {
      const a = document.createElement("a");
      a.href = selectedItem.image;
      a.download = `${selectedItem.title || "export"}.${format}`;
      a.click();
    } else {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  }, [selectedItem]);

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

    // 1. Initial Sections (Spacious boundaries so cards never crowd together)
    initialList.push({
      id: "section-commercial",
      title: "Commercial & Video Advertising",
      type: "section",
      mediaType: "section",
      x: 40,
      y: 40,
      width: 2000,
      height: 940,
      color: "#00A389",
    });

    initialList.push({
      id: "section-identity",
      title: "Brand Identity & Graphic Assets",
      type: "section",
      mediaType: "section",
      x: 40,
      y: 1040,
      width: 2000,
      height: 940,
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

          cardX += 580; // Spacious 580px spacing so 440px/560px cards NEVER overlap
          countInRow++;
          if (countInRow >= 3) {
            countInRow = 0;
            cardX = 80;
            cardY += 760; // Clean vertical breathing room
          }
        }
      });
    });

    setItems(initialList);
    initialItemsRef.current = JSON.parse(JSON.stringify(initialList));
    setHasChanges(false);
  }, [canvasItems, clients]);

  // Context Menu & Figma Action Handlers
  const handleItemContextMenu = useCallback((e: React.MouseEvent, item: CanvasItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);

    const menuWidth = 245;
    const menuHeight = 540;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(e.clientY, Math.max(12, window.innerHeight - menuHeight - 12));
    const canvasX = (e.clientX - pan.x) / zoom;
    const canvasY = (e.clientY - pan.y) / zoom;

    setContextMenu({
      isOpen: true,
      x,
      y,
      canvasX,
      canvasY,
      item,
    });
    setContextSubmenu(null);
  }, [pan, zoom]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    // If clicked on input or textarea, let default context menu appear
    if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
    e.preventDefault();

    const menuWidth = 245;
    const menuHeight = 540;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(e.clientY, Math.max(12, window.innerHeight - menuHeight - 12));
    const canvasX = (e.clientX - pan.x) / zoom;
    const canvasY = (e.clientY - pan.y) / zoom;

    const currentItem = selectedId ? items.find((i) => i.id === selectedId) || null : null;
    setContextMenu({
      isOpen: true,
      x,
      y,
      canvasX,
      canvasY,
      item: currentItem,
    });
    setContextSubmenu(null);
  }, [pan, zoom, selectedId, items]);

  const handleCopy = useCallback((itemToCopy?: CanvasItem) => {
    const target = itemToCopy || items.find((i) => i.id === selectedId);
    if (!target) return;
    copiedItemRef.current = JSON.parse(JSON.stringify(target));
    try {
      navigator.clipboard.writeText(JSON.stringify(target, null, 2));
    } catch {}
  }, [items, selectedId]);

  const handlePaste = useCallback((atCanvasPos?: { x: number; y: number }) => {
    if (!copiedItemRef.current) return;
    const source = copiedItemRef.current;
    const newId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const posX = atCanvasPos ? atCanvasPos.x : (source.x || 0) + 40;
    const posY = atCanvasPos ? atCanvasPos.y : (source.y || 0) + 40;

    const newItem: CanvasItem = {
      ...source,
      id: newId,
      title: `${source.title} (Copy)`,
      x: posX,
      y: posY,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newId);
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const handlePasteToReplace = useCallback((targetItem: CanvasItem) => {
    if (!copiedItemRef.current) return;
    const source = copiedItemRef.current;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === targetItem.id) {
          return {
            ...i,
            title: source.title,
            image: source.image,
            aspect: source.aspect,
            type: source.type,
            mediaType: source.mediaType,
            isVideo: source.isVideo,
            youtubeUrl: source.youtubeUrl,
            videoId: source.videoId,
            gdriveUrl: source.gdriveUrl,
            color: source.color,
          };
        }
        return i;
      })
    );
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const handleBringToFront = useCallback((itemId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (!target) return prev;
      return [...prev.filter((i) => i.id !== itemId), target];
    });
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const handleSendToBack = useCallback((itemId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (!target) return prev;
      return [target, ...prev.filter((i) => i.id !== itemId)];
    });
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const handleConvertSection = useCallback((item: CanvasItem) => {
    const isSec = item.type === "section" || item.mediaType === "section";
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          return {
            ...i,
            type: isSec ? ("media" as const) : ("section" as const),
            mediaType: isSec ? ("image" as const) : ("section" as const),
          };
        }
        return i;
      })
    );
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const handleToggleHide = useCallback((itemId: string) => {
    setHiddenItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const handleToggleLock = useCallback((itemId: string) => {
    setLockedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const handleFlipHorizontal = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, flipX: !i.flipX } : i))
    );
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  const handleFlipVertical = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, flipY: !i.flipY } : i))
    );
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

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

      // Toggle UI Panels (Ctrl+Shift+\ or Ctrl+\)
      if ((e.ctrlKey || e.metaKey) && (e.key === "\\" || e.code === "Backslash")) {
        e.preventDefault();
        setIsUiExpanded((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleSaveChanges();
      }
      if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      }
      if (e.key === "v" || e.key === "V") {
        setActiveTool("select");
      }
      if (e.key === "h" || e.key === "H") {
        setActiveTool("hand");
      }
      if (e.key === "k" || e.key === "K") {
        setActiveTool("scale");
      }
      if (e.key === "f" || e.key === "F") {
        handleAddFrame("4:5");
      }
      if (e.key === "s" || e.key === "S") {
        if (e.shiftKey) {
          handleAddSection();
        } else {
          handleAddSlice();
        }
      }
      if (e.key === "t" || e.key === "T") {
        handleAddText();
      }
      if (e.key === "r" || e.key === "R") {
        handleAddShape("rectangle");
      }
      if (e.key === "c" || e.key === "C") {
        handleAddComment();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        handleDeleteItem(selectedId);
      }
      // Figma shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C") && selectedId) {
        handleCopy();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        handlePaste();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "r" || e.key === "R") && selectedId) {
        e.preventDefault();
        const target = items.find((i) => i.id === selectedId);
        if (target) handlePasteToReplace(target);
      }
      if (e.key === "]" && selectedId) {
        e.preventDefault();
        handleBringToFront(selectedId);
      }
      if (e.key === "[" && selectedId) {
        e.preventDefault();
        handleSendToBack(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "h" || e.key === "H") && selectedId) {
        e.preventDefault();
        handleToggleHide(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "l" || e.key === "L") && selectedId) {
        e.preventDefault();
        handleToggleLock(selectedId);
      }
      if (e.shiftKey && (e.key === "h" || e.key === "H") && selectedId) {
        e.preventDefault();
        handleFlipHorizontal(selectedId);
      }
      if (e.shiftKey && (e.key === "v" || e.key === "V") && selectedId) {
        e.preventDefault();
        handleFlipVertical(selectedId);
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

  // Close context menu on outside click or Escape
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
        setContextSubmenu(null);
      }
    };
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        setContextSubmenu(null);
      }
    };
    if (contextMenu?.isOpen) {
      window.addEventListener("mousedown", handleGlobalClick);
      window.addEventListener("keydown", handleGlobalKey);
    }
    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalKey);
    };
  }, [contextMenu?.isOpen]);

  // Native non-passive event listeners: Completely isolates canvas zoom from browser webpage zoom
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    // Non-passive wheel: ALWAYS prevents browser page zoom when zooming canvas
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const currentZoom = zoomRef.current;
      const newZoom = Math.min(5.5, Math.max(0.18, currentZoom * zoomFactor));

      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const currentPan = panRef.current;
      const newPanX = cursorX - (cursorX - currentPan.x) * (newZoom / currentZoom);
      const newPanY = cursorY - (cursorY - currentPan.y) * (newZoom / currentZoom);

      setZoom(Number(newZoom.toFixed(3)));
      setPan({ x: newPanX, y: newPanY });
    };

    // Non-passive touchmove for mobile admin
    const onNativeTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const onGesture = (e: Event) => {
      e.preventDefault();
    };

    const onKeyBlock = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "+" || e.key === "=") {
          setZoom((prev) => Number(Math.min(5.5, prev * 1.15).toFixed(2)));
        } else if (e.key === "-") {
          setZoom((prev) => Number(Math.max(0.18, prev * 0.85).toFixed(2)));
        } else if (e.key === "0") {
          zoomToFitAll();
        }
      }
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    container.addEventListener("touchmove", onNativeTouchMove, { passive: false });
    container.addEventListener("gesturestart", onGesture, { passive: false });
    container.addEventListener("gesturechange", onGesture, { passive: false });
    window.addEventListener("keydown", onKeyBlock, { capture: true });

    return () => {
      container.removeEventListener("wheel", onNativeWheel);
      container.removeEventListener("touchmove", onNativeTouchMove);
      container.removeEventListener("gesturestart", onGesture);
      container.removeEventListener("gesturechange", onGesture);
      window.removeEventListener("keydown", onKeyBlock, { capture: true });
    };
  }, []);

  // Mobile Touch Engine Ref (Touch Hold, Hand Tool Panning, Pinch Zoom, and Dragging)
  const touchStateRef = useRef<{
    initialPinchDistance: number | null;
    initialZoom: number;
    startPan: { x: number; y: number };
    startTouch: { x: number; y: number };
    isTouchPanning: boolean;
    touchDraggingItemId: string | null;
    touchItemOffset: { x: number; y: number };
  }>({
    initialPinchDistance: null,
    initialZoom: 1,
    startPan: { x: 0, y: 0 },
    startTouch: { x: 0, y: 0 },
    isTouchPanning: false,
    touchDraggingItemId: null,
    touchItemOffset: { x: 0, y: 0 },
  });

  // Helper: Get center coordinate of current viewport converted to canvas space
  const getViewportCenter = useCallback((itemWidth = 480, itemHeight = 360) => {
    const container = canvasContainerRef.current;
    const cw = container?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 800);
    const ch = container?.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 600);
    const curZoom = zoomRef.current || zoom;
    const curPan = panRef.current || pan;
    const cx = (cw / 2 - curPan.x) / curZoom - itemWidth / 2;
    const cy = (ch / 2 - curPan.y) / curZoom - itemHeight / 2;
    return {
      x: Math.round(cx),
      y: Math.round(cy),
    };
  }, [pan, zoom]);

  // Canvas Mouse Down (Panning or Selecting background)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on canvas background directly or with hand tool / spacebar
    if (e.target === e.currentTarget || isSpacePressed || activeTool === "hand" || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      if (activeTool === "select" && !isSpacePressed) {
        setSelectedId(null);
      }
    }
  };

  // High-performance 0ms-latency window mouse tracking for pan and drag
  useEffect(() => {
    if (!isPanning && !draggingItemId) return;

    const onWindowMove = (e: MouseEvent) => {
      if (isPanning) {
        pendingPanRef.current = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        };
        if (!dragRafRef.current) {
          dragRafRef.current = requestAnimationFrame(() => {
            dragRafRef.current = null;
            if (pendingPanRef.current) {
              setPan(pendingPanRef.current);
            }
          });
        }
      } else if (draggingItemId) {
        const curX = Math.round((e.clientX - pan.x) / zoom - dragItemOffset.x);
        const curY = Math.round((e.clientY - pan.y) / zoom - dragItemOffset.y);
        pendingItemDragRef.current = { id: draggingItemId, x: curX, y: curY };

        if (!dragRafRef.current) {
          dragRafRef.current = requestAnimationFrame(() => {
            dragRafRef.current = null;
            if (pendingItemDragRef.current) {
              const info = pendingItemDragRef.current;
              setItems((prev) =>
                prev.map((it) => (it.id === info.id ? { ...it, x: info.x, y: info.y } : it))
              );
              setHasChanges(true);
            }
          });
        }
      }
    };

    const onWindowUp = () => {
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      if (pendingItemDragRef.current) {
        const info = pendingItemDragRef.current;
        setItems((prev) =>
          prev.map((it) => (it.id === info.id ? { ...it, x: info.x, y: info.y } : it))
        );
        pendingItemDragRef.current = null;
      }
      setIsPanning(false);
      setDraggingItemId(null);
    };

    window.addEventListener("mousemove", onWindowMove, { passive: true });
    window.addEventListener("mouseup", onWindowUp);

    return () => {
      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("mouseup", onWindowUp);
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
    };
  }, [isPanning, draggingItemId, panStart, pan.x, pan.y, zoom, dragItemOffset.x, dragItemOffset.y]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Window listener handles mousemove with passive 0ms latency; kept for fallback
  };

  const handleCanvasMouseUp = () => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    setIsPanning(false);
    setDraggingItemId(null);
  };

  // Start dragging an individual canvas item with mouse
  const handleItemMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.closest("button")) {
      return;
    }

    e.stopPropagation();
    setSelectedId(item.id);

    if (activeTool === "hand" || isSpacePressed) return;
    if (lockedItemIds.has(item.id)) return; // Locked items cannot be dragged

    setDraggingItemId(item.id);
    const itemCanvasX = (e.clientX - pan.x) / zoom;
    const itemCanvasY = (e.clientY - pan.y) / zoom;
    setDragItemOffset({
      x: itemCanvasX - (item.x || 0),
      y: itemCanvasY - (item.y || 0),
    });
  };

  // Mobile Touch Handlers on Canvas Viewport
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // 2-finger pinch-to-zoom
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStateRef.current.initialPinchDistance = dist;
      touchStateRef.current.initialZoom = zoomRef.current;
      touchStateRef.current.isTouchPanning = false;
      touchStateRef.current.touchDraggingItemId = null;
      return;
    }

    // 1-finger touch
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStateRef.current.startTouch = { x: t.clientX, y: t.clientY };
      touchStateRef.current.startPan = { ...panRef.current };
      touchStateRef.current.initialPinchDistance = null;

      // If active tool is hand, or touching canvas background directly
      if (activeTool === "hand" || e.target === e.currentTarget) {
        touchStateRef.current.isTouchPanning = true;
        setIsPanning(true);
        if (activeTool === "select") {
          setSelectedId(null);
        }
      }
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // 2-finger pinch-to-zoom
    if (e.touches.length === 2 && touchStateRef.current.initialPinchDistance) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (currentDist > 5) {
        const scale = currentDist / touchStateRef.current.initialPinchDistance;
        const targetZoom = Number(Math.min(5.5, Math.max(0.18, touchStateRef.current.initialZoom * scale)).toFixed(3));

        const container = canvasContainerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
          const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
          const currentPan = touchStateRef.current.startPan;
          const currentZoom = touchStateRef.current.initialZoom;
          const newPanX = midX - (midX - currentPan.x) * (targetZoom / currentZoom);
          const newPanY = midY - (midY - currentPan.y) * (targetZoom / currentZoom);
          setZoom(targetZoom);
          setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
        } else {
          setZoom(targetZoom);
        }
      }
      return;
    }

    // 1-finger drag item or pan
    if (e.touches.length === 1) {
      const t = e.touches[0];

      // Dragging item across canvas
      if (touchStateRef.current.touchDraggingItemId) {
        const itemId = touchStateRef.current.touchDraggingItemId;
        const currentX = (t.clientX - panRef.current.x) / zoomRef.current - touchStateRef.current.touchItemOffset.x;
        const currentY = (t.clientY - panRef.current.y) / zoomRef.current - touchStateRef.current.touchItemOffset.y;

        setItems((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, x: Math.round(currentX), y: Math.round(currentY) } : it))
        );
        setHasChanges(true);
        return;
      }

      // Panning canvas (hand tool or hold canvas)
      if (touchStateRef.current.isTouchPanning || activeTool === "hand") {
        const deltaX = t.clientX - touchStateRef.current.startTouch.x;
        const deltaY = t.clientY - touchStateRef.current.startTouch.y;
        setPan({
          x: Math.round(touchStateRef.current.startPan.x + deltaX),
          y: Math.round(touchStateRef.current.startPan.y + deltaY),
        });
      }
    }
  };

  const handleCanvasTouchEnd = () => {
    touchStateRef.current.isTouchPanning = false;
    touchStateRef.current.touchDraggingItemId = null;
    touchStateRef.current.initialPinchDistance = null;
    setIsPanning(false);
    setDraggingItemId(null);
  };

  // Start touch dragging an item on mobile
  const handleItemTouchStart = (e: React.TouchEvent, item: CanvasItem) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.closest("button")) {
      return;
    }

    e.stopPropagation();
    setSelectedId(item.id);

    // If Hand tool is active, touch pans the canvas instead of dragging item
    if (activeTool === "hand") {
      const t = e.touches[0];
      if (t) {
        touchStateRef.current.isTouchPanning = true;
        touchStateRef.current.startTouch = { x: t.clientX, y: t.clientY };
        touchStateRef.current.startPan = { ...panRef.current };
        setIsPanning(true);
      }
      return;
    }

    if (lockedItemIds.has(item.id)) return; // Locked items cannot be dragged

    if (e.touches.length === 1) {
      const t = e.touches[0];
      const itemCanvasX = (t.clientX - panRef.current.x) / zoomRef.current;
      const itemCanvasY = (t.clientY - panRef.current.y) / zoomRef.current;
      touchStateRef.current.touchDraggingItemId = item.id;
      touchStateRef.current.touchItemOffset = {
        x: itemCanvasX - (item.x || 0),
        y: itemCanvasY - (item.y || 0),
      };
      setDraggingItemId(item.id);
    }
  };

  // Add Tools Directly on Canvas (Centered to current viewport)
  const handleAddSection = () => {
    const center = getViewportCenter(1100, 600);
    const newSection: CanvasItem = {
      id: `section-${Date.now()}`,
      title: "New Section Frame",
      type: "section",
      mediaType: "section",
      x: center.x,
      y: center.y,
      width: 1100,
      height: 600,
      color: "#00A389",
    };
    updateItemsWithTracking([...items, newSection]);
    setSelectedId(newSection.id);
  };

  const handleAddFrame = (aspect = "4:5") => {
    const isWidescreen = aspect === "16:9";
    const w = isWidescreen ? 720 : aspect === "9:16" ? 360 : 480;
    const h = isWidescreen ? 405 : aspect === "9:16" ? 640 : 600;
    const center = getViewportCenter(w, h);
    const newFrame: CanvasItem = {
      id: `frame-${Date.now()}`,
      title: "New Deliverable Frame",
      type: "media",
      mediaType: "frame",
      aspect,
      x: center.x,
      y: center.y,
      width: w,
      height: h,
      color: "#0c8ce9",
    };
    updateItemsWithTracking([...items, newFrame]);
    setSelectedId(newFrame.id);
  };

  const handleSelectFramePreset = (ratio: string, preset?: AspectPreset) => {
    let w = 480;
    let h = 600;
    if (preset?.width && preset?.height) {
      const maxDim = 640;
      if (preset.width >= preset.height) {
        w = maxDim;
        h = Math.round((maxDim * preset.height) / preset.width);
      } else {
        h = maxDim;
        w = Math.round((maxDim * preset.width) / preset.height);
      }
    } else {
      if (ratio === "16:9") { w = 720; h = 405; }
      else if (ratio === "9:16") { w = 360; h = 640; }
      else if (ratio === "1:1") { w = 480; h = 480; }
      else if (ratio === "21:9") { w = 750; h = 320; }
    }

    const center = getViewportCenter(w, h);
    const newFrame: CanvasItem = {
      id: `frame-${Date.now()}`,
      title: preset ? `${preset.name} (${ratio})` : `Frame ${ratio}`,
      type: "media",
      mediaType: "frame",
      aspect: ratio,
      x: center.x,
      y: center.y,
      width: w,
      height: h,
      color: "#0c8ce9",
    };
    updateItemsWithTracking([...items, newFrame]);
    setSelectedId(newFrame.id);
    setShowFramePresetsPicker(false);
  };

  const handleAddSlice = () => {
    const center = getViewportCenter(500, 380);
    const newSlice: CanvasItem = {
      id: `slice-${Date.now()}`,
      title: "Slice Export Area",
      type: "section",
      mediaType: "slice",
      x: center.x,
      y: center.y,
      width: 500,
      height: 380,
      color: "#f43f5e",
    };
    updateItemsWithTracking([...items, newSlice]);
    setSelectedId(newSlice.id);
  };

  const handleAddShape = (shape: "rectangle" | "ellipse") => {
    const center = getViewportCenter(440, 320);
    const newShape: CanvasItem = {
      id: `shape-${Date.now()}`,
      title: shape === "ellipse" ? "Ellipse Shape" : "Rectangle Shape",
      type: "section",
      mediaType: shape === "ellipse" ? "ellipse" : "shape",
      x: center.x,
      y: center.y,
      width: 440,
      height: 320,
      color: "#3b82f6",
    };
    updateItemsWithTracking([...items, newShape]);
    setSelectedId(newShape.id);
  };

  const handleAddComment = () => {
    const center = getViewportCenter(320, 160);
    const newComment: CanvasItem = {
      id: `comment-${Date.now()}`,
      title: "Comment / Feedback",
      type: "text",
      mediaType: "comment",
      content: "Tuliskan catatan arahan visual atau feedback desain...",
      x: center.x,
      y: center.y,
      color: "#ec4899",
    };
    updateItemsWithTracking([...items, newComment]);
    setSelectedId(newComment.id);
  };

  const handleAddTextPath = () => {
    const center = getViewportCenter(360, 160);
    const newTextPath: CanvasItem = {
      id: `text-path-${Date.now()}`,
      title: "Curved Text on Path",
      type: "text",
      mediaType: "text",
      content: "Text on Path ~ Visual Design Line",
      x: center.x,
      y: center.y,
      color: "#06b6d4",
    };
    updateItemsWithTracking([...items, newTextPath]);
    setSelectedId(newTextPath.id);
  };

  const handleAddFolder = () => {
    const center = getViewportCenter(280, 160);
    const newFolder: CanvasItem = {
      id: `folder-${Date.now()}`,
      title: "New Client Folder",
      type: "folder",
      mediaType: "folder",
      clientName: "Client Project",
      x: center.x,
      y: center.y,
      color: "#00A389",
    };
    updateItemsWithTracking([...items, newFolder]);
    setSelectedId(newFolder.id);
  };

  const handleAddText = () => {
    const center = getViewportCenter(320, 160);
    const newText: CanvasItem = {
      id: `text-${Date.now()}`,
      title: "Add Title / Sticky Note",
      type: "text",
      mediaType: "text",
      content: "Tuliskan keterangan karya atau catatan arahan visual...",
      x: center.x,
      y: center.y,
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

      const center = getViewportCenter(460, 460);
      const placeX = dropCanvasX ?? center.x;
      const placeY = dropCanvasY ?? center.y;

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

  const [fittedItemId, setFittedItemId] = useState<string | null>(null);
  const lastTouchTapRef = useRef<{ time: number; id: string; x: number; y: number }>({
    time: 0,
    id: "",
    x: 0,
    y: 0,
  });

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
    setFittedItemId(null);
  };

  // Fit specific item (image / artboard) automatically to screen on double-click / double-tap
  const fitItemToScreen = useCallback(
    (item: CanvasItem, targetEl?: HTMLElement) => {
      if (!canvasContainerRef.current) return;
      const { clientWidth, clientHeight } = canvasContainerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      // Toggle: if already fitted to this item, return to full fit
      if (fittedItemId === item.id) {
        setFittedItemId(null);
        zoomToFitAll();
        return;
      }

      let w = item.width || 440;
      let h = item.height || 550;

      if (item.aspect === "16:9") {
        w = 560;
        h = Math.round(560 * (9 / 16)) + 40;
      } else if (item.aspect === "9:16") {
        w = 320;
        h = Math.round(320 * (16 / 9)) + 40;
      } else if (item.aspect === "1:1") {
        w = 440;
        h = 440 + 40;
      } else if (item.aspect === "4:5") {
        w = 440;
        h = Math.round(440 * (5 / 4)) + 40;
      } else if (item.aspect && item.aspect.includes(":")) {
        const [wStr, hStr] = item.aspect.split(":");
        const wNum = parseFloat(wStr);
        const hNum = parseFloat(hStr);
        if (wNum && hNum) {
          w = wNum > hNum ? 560 : 440;
          h = Math.round(w * (hNum / wNum)) + 40;
        }
      }

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          w = Math.round(rect.width / zoomRef.current);
          h = Math.round(rect.height / zoomRef.current);
        }
      }

      const itemX = item.x || 0;
      const itemY = item.y || 0;

      // Optimal scale to fit comfortably in viewport (95% width, 93% height for prominence)
      const targetScaleX = (clientWidth * 0.95) / w;
      const targetScaleY = (clientHeight * 0.93) / h;
      const targetZoom = Number(
        Math.min(3.8, Math.max(0.25, Math.min(targetScaleX, targetScaleY))).toFixed(2)
      );

      // Pan to center the item directly on screen
      const targetPanX = Math.round((clientWidth - w * targetZoom) / 2 - itemX * targetZoom);
      const targetPanY = Math.round((clientHeight - h * targetZoom) / 2 - itemY * targetZoom);

      setZoom(targetZoom);
      setPan({ x: targetPanX, y: targetPanY });
      setFittedItemId(item.id);
      setSelectedId(item.id);
    },
    [fittedItemId]
  );

  const handleItemTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>, item: CanvasItem, targetEl?: HTMLElement) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const now = Date.now();

      // If an item is currently staying fitted, single tap (1x) immediately zooms out to view all!
      if (fittedItemId) {
        e.preventDefault();
        e.stopPropagation();
        setFittedItemId(null);
        zoomToFitAll();
        lastTouchTapRef.current = { time: 0, id: "", x: 0, y: 0 };
        return;
      }

      const timeSinceLast = now - lastTouchTapRef.current.time;
      const dist = Math.hypot(
        touch.clientX - lastTouchTapRef.current.x,
        touch.clientY - lastTouchTapRef.current.y
      );

      if (timeSinceLast < 450 && dist < 35 && lastTouchTapRef.current.id === item.id) {
        // Confirmed double-tap on touch screen: Fit to screen & STAY
        e.preventDefault();
        e.stopPropagation();
        fitItemToScreen(item, targetEl);
        lastTouchTapRef.current = { time: 0, id: "", x: 0, y: 0 };
      } else {
        lastTouchTapRef.current = {
          time: now,
          id: item.id,
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    },
    [fittedItemId, fitItemToScreen, zoomToFitAll]
  );

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

    const center = getViewportCenter(440, 400);

    const newItem: CanvasItem = {
      id: `media-${Date.now()}`,
      title: modalTitle.trim() || (ytId ? "YouTube Video" : "Digital Asset"),
      type: "media",
      mediaType: ytId ? "youtube" : driveId ? "gdrive" : isVideo ? "upload" : "image",
      image: imgPreview,
      aspect: modalAspect,
      clientName: "Selected Work",
      x: center.x,
      y: center.y,
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

  // Calculate Client Works counts
  const clientCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      if (item.clientName) {
        counts[item.clientName] = (counts[item.clientName] || 0) + 1;
      }
    });
    return counts;
  }, [items]);

  const handleFocusClientFolder = (clientName: string) => {
    const clientItems = items.filter((it) => it.clientName === clientName);
    if (clientItems.length > 0) {
      const minX = Math.min(...clientItems.map((it) => it.x || 0));
      const minY = Math.min(...clientItems.map((it) => it.y || 0));
      setPan({
        x: -minX * zoom + 160,
        y: -minY * zoom + 160,
      });
      setSelectedId(clientItems[0].id);
    }
  };

  const handleSelectLayer = (item: CanvasItem) => {
    setSelectedId(item.id);
    if (item.x !== undefined && item.y !== undefined) {
      setPan({
        x: -(item.x) * zoom + 240,
        y: -(item.y) * zoom + 200,
      });
    }
  };

  // ── Figma Design Inspector Right Sidebar (Images 1, 2, 3) ──────────────────
  const renderRightInspector = () => {
    const isTextSelected = selectedItem?.type === "text" || selectedItem?.mediaType === "text";
    const itemColor = selectedItem?.color || "#F9FAEF";
    const itemOpacity = selectedItem?.opacity !== undefined ? selectedItem.opacity : 100;
    const itemRadius = selectedItem?.cornerRadius !== undefined ? selectedItem.cornerRadius : 0;
    const itemRotation = selectedItem?.rotation !== undefined ? selectedItem.rotation : 0;
    const itemWidth = selectedItem?.width || (selectedItem?.aspect === "16:9" ? 560 : selectedItem?.aspect === "9:16" ? 320 : 440);
    const itemHeight = selectedItem?.height || (selectedItem?.aspect === "16:9" ? 315 : selectedItem?.aspect === "9:16" ? 568 : 550);
    const itemX = selectedItem?.x !== undefined ? selectedItem.x : 0;
    const itemY = selectedItem?.y !== undefined ? selectedItem.y : 0;

    return (
      <aside
        aria-label="Figma Design Inspector"
        className={`w-64 sm:w-72 shrink-0 h-full border-l flex flex-col z-30 transition-all select-none overflow-y-auto no-scrollbar font-sans ${
          isLight
            ? "bg-white/95 border-slate-200 text-slate-800"
            : "bg-[#1e1e1e] border-white/10 text-[#d4d4d4]"
        }`}
      >
        {/* Top Action Bar (Avatar, Play, Share - Image 1) */}
        <div className="p-2.5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 text-black flex items-center justify-center font-bold text-xs shadow-sm">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <HiChevronDown className="w-3 h-3 text-neutral-400" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenCanvasPreview) onOpenCanvasPreview();
                else if (typeof window !== "undefined") window.open("/canvas", "_blank");
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
              title="Present / Live Canvas"
            >
              <HiPlay className="w-3.5 h-3.5" />
              <HiChevronDown className="w-2.5 h-2.5 text-neutral-400" />
            </button>

            <button
              type="button"
              onClick={handleShareCanvas}
              className="px-3 py-1 rounded-lg bg-[#0c8ce9] hover:bg-[#0b78c7] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Design vs Prototype + Zoom Indicator (Image 1) */}
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setInspectorTab("design")}
              className={`font-semibold pb-1 transition-colors cursor-pointer ${
                inspectorTab === "design"
                  ? "text-white border-b-2 border-[#0c8ce9]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Design
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab("prototype")}
              className={`font-semibold pb-1 transition-colors cursor-pointer ${
                inspectorTab === "prototype"
                  ? "text-white border-b-2 border-[#0c8ce9]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Prototype
            </button>
          </div>

          <button
            type="button"
            onClick={zoomToFitAll}
            className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom percentage (click to fit)"
          >
            <span>{Math.round(zoom * 100)}%</span>
            <HiChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Sub-header: Element Category Header & Top Tools (Image 1) */}
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1 font-semibold text-white">
            <span>
              {selectedItem
                ? selectedItem.type === "section"
                  ? "Section"
                  : selectedItem.type === "folder"
                  ? "Folder Client"
                  : selectedItem.type === "text"
                  ? "Text"
                  : selectedItem.mediaType === "frame"
                  ? "Frame"
                  : "Media"
                : "Canvas Page"}
            </span>
            <HiChevronDown className="w-3 h-3 text-neutral-400" />
          </div>

          <div className="flex items-center gap-1 text-neutral-400">
            <button
              type="button"
              onClick={() => setShowDevMode(true)}
              className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer"
              title="Dev Mode (Inspect Code)"
            >
              <span className="font-mono text-[11px] font-bold">{"</>"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFramePresetsPicker(true)}
              className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer"
              title="Presets & Components"
            >
              <span className="text-xs">❖</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedItem) {
                  updateSelectedItem({ color: itemColor === "#0c8ce9" ? "#00A389" : "#0c8ce9" });
                }
              }}
              className="p-1 rounded hover:bg-white/10 hover:text-white cursor-pointer"
              title="Toggle Theme / Fill"
            >
              <span className="text-xs">◐</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedItem) handleDeleteItem(selectedItem.id);
              }}
              className="p-1 rounded hover:bg-white/10 hover:text-red-400 cursor-pointer"
              title="Delete Element"
            >
              <HiEllipsisHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Inspector Sections ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/10 text-xs">
          {/* 1. POSITION SECTION (Image 1) */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Position</span>
            </div>

            {/* Alignment Row (7 buttons) */}
            <div className="flex items-center justify-between p-1 rounded-lg bg-[#2c2c2c]/80 border border-white/5 text-neutral-300">
              <button
                type="button"
                onClick={() => handleAlign("left")}
                title="Align Left"
                className="p-1 rounded hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 1h1.5v14H2V1zm3 3h8v3H5V4zm0 5h6v3H5V9z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("hcenter")}
                title="Align Horizontal Centers"
                className="p-1 rounded hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M7.25 1h1.5v3H13v3H8.75v2H11v3H8.75v3h-1.5v-3H5V9h2.25V7H3V4h4.25V1z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("right")}
                title="Align Right"
                className="p-1 rounded hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14 1h-1.5v14H14V1zm-3 3H3v3h8V4zm0 5H5v3h6V9z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("top")}
                title="Align Top"
                className="p-1 rounded hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 2v1.5h14V2H1zm3 3v8h3V5H4zm5 0v6h3V5H9z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("vcenter")}
                title="Align Vertical Centers"
                className="p-1 rounded hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 7.25v1.5h3V13h3V8.75h2V11h3V8.75h3v-1.5h-3V5H9v2.25H7V3H4v4.25H1z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("bottom")}
                title="Align Bottom"
                className="p-1 rounded hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 14v-1.5h14V14H1zm3-3V3h3v8H4zm5 0V5h3v6H9z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("distribute")}
                title="Tidy Up / Distribute"
                className="p-1 rounded hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 3h3v3H1V3zm5 0h4v3H6V3zm6 0h3v3h-3V3zM1 9h3v4H1V9zm5 0h4v4H6V9zm6 0h3v4h-3V9z" />
                </svg>
              </button>
            </div>

            {/* Position Coordinates (X, Y) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                <span className="font-mono text-neutral-400 select-none">X</span>
                <input
                  type="number"
                  value={selectedItem ? itemX : ""}
                  placeholder="Mixed"
                  onChange={(e) => updateSelectedItem({ x: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                <span className="font-mono text-neutral-400 select-none">Y</span>
                <input
                  type="number"
                  value={selectedItem ? itemY : ""}
                  placeholder="Mixed"
                  onChange={(e) => updateSelectedItem({ y: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Rotation & Flip */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                <span className="font-mono text-neutral-400 select-none">∠</span>
                <input
                  type="number"
                  value={selectedItem ? itemRotation : 0}
                  onChange={(e) => updateSelectedItem({ rotation: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                />
                <span className="text-[10px] text-neutral-500">°</span>
              </div>
              <div className="flex items-center justify-around rounded-lg bg-[#2c2c2c] p-1 text-neutral-400">
                <button
                  type="button"
                  onClick={() => updateSelectedItem({ rotation: ((selectedItem?.rotation || 0) + 90) % 360 })}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Rotate 90°"
                >
                  <HiArrowPath className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedItem({ rotation: (selectedItem?.rotation || 0) === 180 ? 0 : 180 })}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Flip Horizontal / 180°"
                >
                  <HiArrowsPointingOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. LAYOUT SECTION (Dimensions, Flow, Spacing - Image 1) */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Layout</span>
              <div className="flex items-center gap-1 text-neutral-400">
                <HiArrowsPointingIn className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                <span className="text-xs cursor-pointer hover:text-white">❖</span>
              </div>
            </div>

            {/* Flow Buttons */}
            <div className="flex items-center justify-between p-1 rounded-lg bg-[#2c2c2c]/80 border border-white/5 text-neutral-400">
              <button
                type="button"
                onClick={() => updateSelectedItem({ aspect: "4:5" })}
                className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Grid Flow"
              >
                <HiRectangleGroup className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateSelectedItem({ aspect: "9:16" })}
                className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Vertical Flow"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M7 2v9.5H4.5L8 15l3.5-3.5H9V2H7z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => updateSelectedItem({ aspect: "16:9" })}
                className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Horizontal Flow"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 7h9.5V4.5L15 8l-3.5 3.5V9H2V7z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => updateSelectedItem({ aspect: "1:1" })}
                className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Wrap Flow"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 4h10v2H3V4zm0 4h7v2H3V8zm0 4h10v2H3v-2z" />
                </svg>
              </button>
            </div>

            {/* Dimensions (W, H) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                <span className="font-mono text-neutral-400 select-none">W</span>
                <input
                  type="number"
                  value={selectedItem ? itemWidth : 1080}
                  onChange={(e) => updateSelectedItem({ width: Number(e.target.value) || 100 })}
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                <span className="font-mono text-neutral-400 select-none">H</span>
                <input
                  type="number"
                  value={selectedItem ? itemHeight : 1350}
                  onChange={(e) => updateSelectedItem({ height: Number(e.target.value) || 100 })}
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Spacing & Padding */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent">
                <span className="font-mono text-neutral-400 select-none">⦀</span>
                <input
                  type="text"
                  defaultValue="24"
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent">
                <span className="font-mono text-neutral-400 select-none">吕</span>
                <input
                  type="text"
                  defaultValue="16"
                  className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Clip content Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-neutral-300 text-[11px]">
              <input
                type="checkbox"
                checked={selectedItem?.clipContent !== false}
                onChange={(e) => updateSelectedItem({ clipContent: e.target.checked })}
                className="rounded bg-[#2c2c2c] border-white/20 text-[#0c8ce9] focus:ring-0"
              />
              <span>Clip content</span>
            </label>
          </div>

          {/* 3. APPEARANCE SECTION (Image 1) */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Appearance</span>
              <div className="flex items-center gap-1 text-neutral-400">
                <HiEye className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                <span className="text-xs cursor-pointer hover:text-white">💧</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Opacity */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400">Opacity</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                  <span className="text-neutral-400 text-xs">▦</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={itemOpacity}
                    onChange={(e) => updateSelectedItem({ opacity: Math.min(100, Math.max(0, Number(e.target.value))) })}
                    className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                  />
                  <span className="text-[10px] text-neutral-500">%</span>
                </div>
              </div>

              {/* Corner radius */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400">Corner radius</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                  <span className="text-neutral-400 text-xs">⛶</span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={itemRadius}
                    onChange={(e) => updateSelectedItem({ cornerRadius: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. TYPOGRAPHY SECTION (Matches Screenshot 3) */}
          {(isTextSelected || selectedItem?.content || selectedItem?.type === "text") && (
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
                <span>Typography</span>
                <span className="text-xs text-neutral-400 cursor-pointer hover:text-white">❖</span>
              </div>

              {/* Font Family Dropdown */}
              <div className="relative">
                <select
                  value={selectedItem?.fontFamily || "Noto Serif"}
                  onChange={(e) => updateSelectedItem({ fontFamily: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] text-white border border-transparent focus:border-[#0c8ce9] text-xs font-serif appearance-none cursor-pointer"
                >
                  <option value="Noto Serif">Noto Serif</option>
                  <option value="Cinzel">Cinzel (Luxury Serif)</option>
                  <option value="Inter">Inter (Clean Sans)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Geist Sans">Geist Sans</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Courier New">Courier New (Mono)</option>
                </select>
                <HiChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Font Weight & Size */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="relative">
                  <select
                    value={selectedItem?.fontWeight || "Bold"}
                    onChange={(e) => updateSelectedItem({ fontWeight: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] text-white border border-transparent focus:border-[#0c8ce9] text-xs appearance-none cursor-pointer"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Medium">Medium</option>
                    <option value="SemiBold">SemiBold</option>
                    <option value="Bold">Bold</option>
                    <option value="Black">Black</option>
                  </select>
                  <HiChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-2 pointer-events-none" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]">
                  <input
                    type="number"
                    value={selectedItem?.fontSize || 129}
                    onChange={(e) => updateSelectedItem({ fontSize: Number(e.target.value) || 16 })}
                    className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                  />
                  <HiChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </div>
              </div>

              {/* Line height & Letter spacing */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400">Line height</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent">
                    <span className="text-neutral-400 text-xs">A</span>
                    <input
                      type="text"
                      value={selectedItem?.lineHeight || "100%"}
                      onChange={(e) => updateSelectedItem({ lineHeight: e.target.value })}
                      className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400">Letter spacing</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] border border-transparent">
                    <span className="text-neutral-400 text-xs">|A|</span>
                    <input
                      type="text"
                      value={selectedItem?.letterSpacing || "-3%"}
                      onChange={(e) => updateSelectedItem({ letterSpacing: e.target.value })}
                      className="w-full bg-transparent text-white font-mono focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Text Alignments */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400">Alignment</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center p-0.5 rounded-lg bg-[#2c2c2c] text-neutral-300">
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ textAlign: "left" })}
                      className={`p-1 rounded ${selectedItem?.textAlign === "left" ? "bg-white/20 text-white" : "hover:text-white"}`}
                      title="Align Left"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 3h12v1.5H2V3zm0 4h8v1.5H2V7zm0 4h12v1.5H2V11z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ textAlign: "center" })}
                      className={`p-1 rounded ${selectedItem?.textAlign === "center" ? "bg-white/20 text-white" : "hover:text-white"}`}
                      title="Align Center"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 3h12v1.5H2V3zm2 4h8v1.5H4V7zm-2 4h12v1.5H2V11z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ textAlign: "right" })}
                      className={`p-1 rounded ${selectedItem?.textAlign === "right" ? "bg-white/20 text-white" : "hover:text-white"}`}
                      title="Align Right"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 3h12v1.5H2V3zm4 4h8v1.5H6V7zm-4 4h12v1.5H2V11z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center p-0.5 rounded-lg bg-[#2c2c2c] text-neutral-300">
                    <button type="button" className="p-1 rounded hover:text-white" title="Align Top">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 2h12v1.5H2V2zm6 3l3 3H9v6H7V8H5l3-3z" />
                      </svg>
                    </button>
                    <button type="button" className="p-1 rounded bg-white/20 text-white" title="Align Middle">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 7.25h12v1.5H2V7.25zm6-5l2.5 2.5H9v2H7v-2H5.5L8 2.25zm0 11.5L5.5 11.25H7v-2h2v2h1.5L8 13.75z" />
                      </svg>
                    </button>
                    <button type="button" className="p-1 rounded hover:text-white" title="Align Bottom">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 12.5h12V14H2v-1.5zm6-3l-3-3h2V2h2v4.5h2l-3 3z" />
                      </svg>
                    </button>
                  </div>

                  <button type="button" className="p-1 text-neutral-400 hover:text-white">
                    <HiAdjustmentsHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. FILL SECTION (Matches Screenshot 1 & 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Fill</span>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="text-xs cursor-pointer hover:text-white">❖</span>
                <button
                  type="button"
                  onClick={() => updateSelectedItem({ color: "#00A389" })}
                  className="hover:text-white cursor-pointer"
                  title="Add Fill"
                >
                  <HiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Color Swatch & Hex input */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#2c2c2c]">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <label className="relative cursor-pointer shrink-0">
                  <span
                    className="w-4 h-4 rounded-xs border border-white/20 inline-block shadow-sm"
                    style={{ backgroundColor: itemColor }}
                  />
                  <input
                    type="color"
                    value={itemColor.startsWith("#") ? itemColor.slice(0, 7) : "#f9faef"}
                    onChange={(e) => updateSelectedItem({ color: e.target.value.toUpperCase() })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
                <input
                  type="text"
                  value={itemColor.replace("#", "")}
                  onChange={(e) => updateSelectedItem({ color: `#${e.target.value}` })}
                  className="w-20 bg-transparent text-white font-mono text-xs uppercase focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-mono text-neutral-300">100%</span>
                <button type="button" className="hover:text-white cursor-pointer">
                  <HiEye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedItem({ color: undefined })}
                  className="hover:text-red-400 cursor-pointer"
                  title="Remove Fill"
                >
                  <HiMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 6. STROKE SECTION (Matches Screenshot 1 & 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Stroke</span>
              <button
                type="button"
                onClick={() => updateSelectedItem({ strokeColor: "#ffffff", strokeWidth: 1 })}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
            {selectedItem?.strokeColor && (
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#2c2c2c] text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-xs border border-white/30"
                    style={{ backgroundColor: selectedItem.strokeColor }}
                  />
                  <span className="font-mono text-neutral-200">{selectedItem.strokeColor}</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-400">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={selectedItem.strokeWidth || 1}
                    onChange={(e) => updateSelectedItem({ strokeWidth: Number(e.target.value) || 1 })}
                    className="w-8 bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                  />
                  <span>px</span>
                </div>
              </div>
            )}
          </div>

          {/* 7. EFFECTS SECTION (Matches Screenshot 1 & 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Effects</span>
              <button
                type="button"
                onClick={() => updateSelectedItem({ effects: "drop-shadow" })}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
            {selectedItem?.effects && (
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#2c2c2c] text-xs">
                <span className="text-neutral-300">Drop shadow</span>
                <span className="text-[10px] text-teal-400 font-mono">25% 0 10px</span>
              </div>
            )}
          </div>

          {/* 8. SELECTION COLORS (Matches Screenshot 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Selection colors</span>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="text-xs cursor-pointer hover:text-white">❖</span>
                <span className="text-xs cursor-pointer hover:text-white">🎯</span>
              </div>
            </div>

            {/* List of Swatches matching Screenshot 2 */}
            <div className="space-y-1">
              {selectionColors.map((colorHex, idx) => (
                <div
                  key={`${colorHex}-${idx}`}
                  onClick={() => updateSelectedItem({ color: colorHex })}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#2c2c2c] hover:bg-[#343434] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-xs border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="font-mono text-xs text-white uppercase">{colorHex.replace("#", "")}</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 group-hover:text-white">100 %</span>
                </div>
              ))}
            </div>
          </div>

          {/* 9. LAYOUT GUIDE SECTION (Matches Screenshot 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Layout guide</span>
              <button type="button" className="text-neutral-400 hover:text-white cursor-pointer">
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 10. EXPORT SECTION (Matches Screenshot 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Export</span>
              <button
                type="button"
                onClick={() => handleExportSelection("png")}
                className="text-neutral-400 hover:text-white cursor-pointer"
                title="Quick Export"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
              {["PNG", "JPG", "SVG", "PDF"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleExportSelection(fmt.toLowerCase())}
                  className="py-1 rounded bg-[#2c2c2c] hover:bg-white/10 text-neutral-300 hover:text-white text-center cursor-pointer transition-colors"
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Floating Help Question Button (?) (Matches Screenshot 1 & 2) ───── */}
        <div className="p-3 flex items-center justify-end border-t border-white/10 bg-[#1e1e1e]/90">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-7 h-7 rounded-full bg-[#2c2c2c] hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-xs shadow-lg transition-all cursor-pointer"
            title="Help & Shortcuts (?)"
          >
            ?
          </button>
        </div>
      </aside>
    );
  };

  // Render Studio Top Pill Menu [Logo] [Portfolio] [Free] [◫]
  const renderPillMenu = () => (
    <div className="relative figma-pill-menu inline-flex items-center">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-2xl transition-all shadow-xl ${
          isLight
            ? "bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/40"
            : "bg-[#222222]/95 border-white/10 text-white shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
        }`}
      >
        {/* Studio Monogram Logo */}
        <button
          type="button"
          onClick={() => setIsPillMenuOpen((prev) => !prev)}
          title="Rizx Studio Canvas Menu"
          className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </button>

        {/* Title: Portfolio (with subtle dropdown caret) */}
        <button
          type="button"
          onClick={() => setIsPillMenuOpen((prev) => !prev)}
          className="flex items-center gap-1 font-bold text-xs sm:text-sm text-white hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <span>Portfolio</span>
          <HiChevronDown className="w-3 h-3 text-neutral-400" />
        </button>

        {/* Plan Badge: Free */}
        <span className="px-2 py-0.5 rounded-full bg-[#182635] text-[#38bdf8] font-mono text-[10px] font-bold border border-[#38bdf8]/25 tracking-wide">
          Free
        </span>

        {/* Sidebar / UI Toggle Icon [◫] */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsUiExpanded((prev) => !prev);
              setShowExpandTooltip(false);
            }}
            onMouseEnter={() => setShowExpandTooltip(true)}
            onMouseLeave={() => setShowExpandTooltip(false)}
            title={isUiExpanded ? "Collapse UI (Ctrl+Shift+\\)" : "Expand UI (Ctrl+Shift+\\)"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              isUiExpanded
                ? "text-neutral-300 hover:text-white hover:bg-white/10"
                : "text-[#38bdf8] bg-white/10 hover:bg-white/20"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2.5" width="12" height="11" rx="2" />
              <line x1="6" y1="2.5" x2="6" y2="13.5" />
            </svg>
          </button>

          {/* Popover / Tooltip: Expand UI / Collapse UI Ctrl+Shift+\ */}
          {showExpandTooltip && (
            <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-[#1e1e1e] border border-white/15 text-white text-[11px] font-mono shadow-2xl flex items-center gap-3 whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
              <span className="font-semibold text-neutral-200">
                {isUiExpanded ? "Collapse UI" : "Expand UI"}
              </span>
              <span className="text-neutral-400 text-[10px]">Ctrl+Shift+\</span>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Menu on clicking Logo or Portfolio */}
      {isPillMenuOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 rounded-2xl bg-[#181a20]/95 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl z-50 text-xs font-mono text-neutral-300 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-[11px] text-neutral-400 border-b border-white/10 flex items-center justify-between">
            <span className="font-bold text-white">Rizx Canvas Studio</span>
            <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">v2.4</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsUiExpanded((prev) => !prev);
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2.5" width="12" height="11" rx="2" />
                <line x1="6" y1="2.5" x2="6" y2="13.5" />
              </svg>
              {isUiExpanded ? "Collapse UI" : "Expand UI"}
            </span>
            <span className="text-[10px] text-neutral-500">Ctrl+Shift+\</span>
          </button>

          <div className="w-full h-[1px] bg-white/10 my-1" />

          <button
            type="button"
            onClick={() => {
              handleAddFrame("4:5");
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <HiHashtag className="w-3.5 h-3.5 text-cyan-400" />
              New Frame
            </span>
            <span className="text-[10px] text-neutral-500">F</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleAddSection();
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <HiSquare2Stack className="w-3.5 h-3.5 text-emerald-400" />
              New Section
            </span>
            <span className="text-[10px] text-neutral-500">Shift+S</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleAddText();
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <HiLanguage className="w-3.5 h-3.5 text-amber-400" />
              New Text Box
            </span>
            <span className="text-[10px] text-neutral-500">T</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <HiPhoto className="w-3.5 h-3.5 text-teal-400" />
              Upload Image/Media
            </span>
            <span className="text-[10px] text-neutral-500">Drop</span>
          </button>

          <div className="w-full h-[1px] bg-white/10 my-1" />

          <button
            type="button"
            onClick={() => {
              zoomToFitAll();
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <HiArrowsPointingOut className="w-3.5 h-3.5 text-purple-400" />
              Fit All Elements
            </span>
            <span className="text-[10px] text-neutral-500">F</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMeasureTool((prev) => !prev);
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <span>📐</span>
              Toggle Dimensions
            </span>
            <span className="text-[10px] text-neutral-500">{showMeasureTool ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowDevMode(true);
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <HiCodeBracket className="w-3.5 h-3.5 text-cyan-400" />
              Dev Mode (JSON)
            </span>
            <span className="text-[10px] text-neutral-500">{"</>"}</span>
          </button>

          <div className="w-full h-[1px] bg-white/10 my-1" />

          <button
            type="button"
            onClick={() => {
              handleSaveChanges();
              setIsPillMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-black font-bold transition-colors cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <HiCheckCircle className="w-3.5 h-3.5" />
              Save Changes
            </span>
            <span className="text-[10px]">Ctrl+S</span>
          </button>
        </div>
      )}
    </div>
  );

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

  // Group canvas items into Client Folders (Folder > Group, Frame, Section, Text) and Root items
  const { folderGroups, rootItems } = useMemo(() => {
    const foldersMap: Record<string, CanvasItem[]> = {};
    const roots: CanvasItem[] = [];

    // Initialize all client folders from clients data
    clients.forEach((c) => {
      foldersMap[c.clientName] = [];
    });

    items.forEach((it) => {
      if (it.clientName && foldersMap[it.clientName] !== undefined) {
        foldersMap[it.clientName].push(it);
      } else {
        roots.push(it);
      }
    });

    return {
      folderGroups: Object.entries(foldersMap),
      rootItems: roots,
    };
  }, [clients, items]);

  const renderLayerRow = (it: CanvasItem, depth: number = 0) => {
    const isSel = selectedId === it.id;
    const isLocked = lockedItemIds.has(it.id);
    const isHidden = hiddenItemIds.has(it.id);

    // Determine icon based on item type
    let TypeIcon = HiPhoto;
    let iconColor = "text-neutral-400";

    if (it.type === "section" || it.mediaType === "section") {
      TypeIcon = HiRectangleGroup;
      iconColor = "text-teal-400";
    } else if (it.type === "folder" || it.mediaType === "folder") {
      TypeIcon = HiFolder;
      iconColor = "text-amber-400";
    } else if (it.mediaType === "frame" || (it.aspect && it.aspect !== "original")) {
      TypeIcon = HiHashtag;
      iconColor = "text-neutral-400";
    } else if (it.type === "group" || it.mediaType === "group") {
      TypeIcon = HiSquare2Stack;
      iconColor = "text-indigo-400";
    }

    const paddingLeft = depth === 0 ? "pl-2" : depth === 1 ? "pl-5" : "pl-8";

    return (
      <div
        key={it.id}
        onClick={() => handleSelectLayer(it)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          fitItemToScreen(it);
        }}
        className={`w-full ${paddingLeft} pr-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer group text-left ${
          isSel
            ? "bg-[#0c8ce9] text-white font-medium shadow-xs"
            : isLight
            ? "text-slate-700 hover:bg-slate-100"
            : "text-neutral-300 hover:bg-white/8 hover:text-white"
        } ${isHidden ? "opacity-40" : ""}`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
          {/* Item Type Icon */}
          {it.type === "text" || it.mediaType === "text" ? (
            <span className="font-mono font-bold text-xs text-amber-300 w-3.5 text-center shrink-0">T</span>
          ) : (
            <TypeIcon className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : iconColor}`} />
          )}
          <span className="truncate text-xs font-sans tracking-tight">{it.title}</span>
        </div>

        {/* Action icons: Lock, Eye, Delete (Visible on Hover or when active - Matches Figma Image 1) */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Lock Button */}
          <button
            type="button"
            onClick={(e) => toggleItemLock(it.id, e)}
            className={`p-1 rounded transition-opacity cursor-pointer ${
              isLocked
                ? "opacity-100 text-amber-400"
                : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
            }`}
            title={isLocked ? "Buka Kunci Layer" : "Kunci Layer (Cegah Geser)"}
          >
            {isLocked ? <HiLockClosed className="w-3.5 h-3.5" /> : <HiLockOpen className="w-3.5 h-3.5" />}
          </button>

          {/* Eye / Visibility Button */}
          <button
            type="button"
            onClick={(e) => toggleItemVisibility(it.id, e)}
            className={`p-1 rounded transition-opacity cursor-pointer ${
              isHidden
                ? "opacity-100 text-rose-400"
                : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
            }`}
            title={isHidden ? "Tampilkan Layer di Kanvas" : "Sembunyikan Layer di Kanvas"}
          >
            {isHidden ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteItem(it.id);
            }}
            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 text-neutral-400 cursor-pointer"
            title="Hapus Layer"
          >
            <HiTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderFolder = (clientName: string, childItems: CanvasItem[]) => {
    const isExpanded = expandedFolders[clientName] !== false; // default expanded
    const isFolderSelected = activeClientFilter === clientName;

    return (
      <div key={`folder-${clientName}`} className="space-y-0.5">
        <div
          onClick={() => {
            setActiveClientFilter(clientName);
            handleFocusClientFolder(clientName);
          }}
          className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer group text-left ${
            isFolderSelected
              ? "bg-white/10 text-white font-semibold"
              : isLight
              ? "text-slate-800 hover:bg-slate-100"
              : "text-neutral-200 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
            {/* Expand / Collapse Chevron */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolderExpanded(clientName);
              }}
              className="p-0.5 text-neutral-400 hover:text-white rounded cursor-pointer"
            >
              <HiChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>
            <span className="text-xs">📁</span>
            <span className="truncate text-xs font-bold tracking-tight font-sans">{clientName}</span>
          </div>

          <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.2 rounded bg-black/30 shrink-0">
            {childItems.length}
          </span>
        </div>

        {/* Child items inside this folder: groups, frames, sections, text, images */}
        {isExpanded && childItems.length > 0 && (
          <div className="space-y-0.5 pl-2 border-l border-white/5 ml-3">
            {childItems.map((child) => renderLayerRow(child, 1))}
          </div>
        )}
      </div>
    );
  };

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
      {/* Hidden File Picker Input for Canvas Media Upload */}
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

      {/* Success Notification Bar */}
      {saveSuccess && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl backdrop-blur-md">
          <HiCheckCircle className="w-4 h-4 text-emerald-400" />
          <span>✓ Perubahan Canvas Berhasil Disimpan & Live di Web!</span>
        </div>
      )}

      {/* ── Workspace Body: Left Studio Sidebar + Infinite Canvas Viewport ── */}
      <div className="flex-1 relative w-full h-full flex overflow-hidden">
        {/* Left Studio Sidebar (Pure Layers Tree matching Figma: Folder > Group, Frame, Section, Text) */}
        {isUiExpanded && (
          <aside
            className={`w-64 sm:w-72 shrink-0 h-full border-r flex flex-col z-30 transition-all select-none ${
              isLight ? "bg-white/95 border-slate-200 text-slate-800" : "bg-[#14161e] border-white/10 text-white"
            }`}
          >
            {/* Layers Header (Matches Figma Image 1) */}
            <div
              className={`px-3 py-2.5 border-b flex items-center justify-between shrink-0 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#161822] border-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight font-sans text-neutral-100">
                  Layers
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-400">
                  {items.length}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleExpandAll}
                title="Expand / Collapse Semua Layer"
                className="p-1 hover:text-white rounded hover:bg-white/10 text-neutral-400 transition-colors cursor-pointer"
              >
                <HiBars3BottomLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Hierarchical Layers Tree (Folder > Group, Frame, Section, Text) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs no-scrollbar">
              {/* Client Folders & their child frames, sections, text, media */}
              {folderGroups.map(([clientName, childItems]) =>
                renderFolder(clientName, childItems)
              )}

              {/* Root / Standalone Layers (Not in any client folder) */}
              {rootItems.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 tracking-wider uppercase flex items-center justify-between">
                    <span>Root Canvas</span>
                    <span className="text-[9px] text-neutral-500">{rootItems.length}</span>
                  </div>
                  {rootItems.map((rootIt) => renderLayerRow(rootIt, 0))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ── Main Canvas Viewport (Infinite 2D Workspace) ───────────────────────── */}
        <div
          ref={canvasContainerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onContextMenu={handleCanvasContextMenu}
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          onTouchCancel={handleCanvasTouchEnd}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
          style={{
            touchAction: "none",
            overscrollBehavior: "none",
          }}
          className={`flex-1 relative w-full h-full overflow-hidden ${
            isPanning || activeTool === "hand" || isSpacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          }`}
        >
          {/* Floating Studio Pill Menu (matches Figma reference) */}
          <div className="absolute top-4 left-4 z-40">
            {renderPillMenu()}
          </div>

          {/* Quick Floating Actions (Save changes, Fullscreen, Inspector toggle) */}
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2 font-mono">
            {hasChanges && (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <HiCheckCircle className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#1e1e1e]/90 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 text-xs shadow-lg cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <HiArrowsPointingIn className="w-4 h-4" /> : <HiArrowsPointingOut className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 640) {
                  setIsMobileInspectorOpen((prev) => !prev);
                } else {
                  setIsRightSidebarOpen((prev) => !prev);
                }
              }}
              className={`p-2 rounded-xl backdrop-blur-md border text-xs shadow-lg cursor-pointer transition-colors ${
                isRightSidebarOpen || isMobileInspectorOpen
                  ? "bg-[#0c8ce9] border-[#0c8ce9] text-white"
                  : "bg-[#1e1e1e]/90 border-white/10 text-white hover:bg-white/20"
              }`}
              title="Design Inspector (Right Menu)"
            >
              <HiAdjustmentsHorizontal className="w-4 h-4" />
            </button>
          </div>

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
          className={`absolute top-0 left-0 origin-top-left ${
            isPanning || draggingItemId ? "!transition-none will-change-transform" : "transition-transform duration-75"
          }`}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {items.map((item) => {
            if (hiddenItemIds.has(item.id)) return null;
            const isSelected = selectedId === item.id;
            const isLocked = lockedItemIds.has(item.id);
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
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    width: `${item.width || secWidth}px`,
                    height: `${item.height || secHeight}px`,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : undefined,
                    borderColor: item.color || undefined,
                  }}
                  className={`absolute rounded-3xl border-2 border-dashed p-4 flex flex-col justify-between ${
                    draggingItemId === item.id ? "!transition-none will-change-transform z-30" : "transition-colors duration-150"
                  } ${
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
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    width: `${item.width || 280}px`,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : undefined,
                  }}
                  className={`absolute rounded-2xl bg-[#111318]/95 border backdrop-blur-xl p-3.5 shadow-xl flex flex-col gap-2.5 cursor-grab active:cursor-grabbing ${
                    draggingItemId === item.id ? "!transition-none will-change-transform z-40 cursor-grabbing scale-102" : "transition-colors duration-150"
                  } ${
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
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    width: `${item.width || 320}px`,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : undefined,
                    fontFamily: item.fontFamily || undefined,
                    fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
                    fontWeight: item.fontWeight || undefined,
                    textAlign: item.textAlign || undefined,
                    color: item.color || undefined,
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

            const currentWidth = item.width || cardWidth;
            const currentHeight = item.height || (item.aspect === "16:9" ? Math.round(currentWidth * (9 / 16)) : item.aspect === "1:1" ? currentWidth : item.aspect === "9:16" ? Math.round(currentWidth * (16 / 9)) : Math.round(currentWidth * (5 / 4)));

            return (
              <div
                key={item.id}
                onMouseDown={(e) => handleItemMouseDown(e, item)}
                onTouchStart={(e) => handleItemTouchStart(e, item)}
                onContextMenu={(e) => handleItemContextMenu(e, item)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  fitItemToScreen(item, e.currentTarget);
                }}
                onTouchEnd={(e) => {
                  handleItemTouchEnd(e, item, e.currentTarget);
                }}
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                  width: `${item.width || cardWidth}px`,
                  height: item.height ? `${item.height}px` : undefined,
                  opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                  borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : undefined,
                }}
                className={`group absolute rounded-2xl flex flex-col select-none cursor-grab active:cursor-grabbing ${
                  draggingItemId === item.id
                    ? "!transition-none will-change-transform z-50 cursor-grabbing shadow-[0_30px_90px_rgba(0,0,0,0.85)] scale-[1.01]"
                    : "transition-colors duration-150"
                } ${
                  isSelected
                    ? "ring-2 ring-[#0c8ce9] shadow-[0_25px_60px_rgba(12,140,233,0.35)]"
                    : "hover:ring-1 hover:ring-white/40 shadow-2xl"
                }`}
              >
                {/* Figma Selection Frame Handles & Dimension Badge */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-30 pointer-events-none" />
                    <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-30 pointer-events-none" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-30 pointer-events-none" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-30 pointer-events-none" />
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#0c8ce9] text-white text-[11px] font-mono font-medium shadow-lg whitespace-nowrap pointer-events-none z-30">
                      {currentWidth} × {currentHeight}
                    </div>
                  </>
                )}

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
                    {isLocked && (
                      <span className="p-0.5 text-amber-400" title="Layer Terkunci">
                        <HiLockClosed className="w-3.5 h-3.5" />
                      </span>
                    )}
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
                  className="relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/15 shadow-2xl flex items-center justify-center cursor-pointer"
                  style={{
                    aspectRatio: cardAspect,
                    minHeight: item.aspect === "original" ? "320px" : undefined,
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    const card = e.currentTarget.parentElement as HTMLElement;
                    fitItemToScreen(item, card);
                  }}
                  onTouchEnd={(e) => {
                    const card = e.currentTarget.parentElement as HTMLElement;
                    handleItemTouchEnd(e, item, card);
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

      {/* Figma Design Inspector / Right Sidebar (Images 1, 2, 3) */}
      {isUiExpanded && isRightSidebarOpen && renderRightInspector()}
      </div>

      {/* ── Figma Floating Studio Toolbar Dock (Images 1, 2, 3, 4, 5) ─────────── */}
      <nav
        aria-label="Figma Studio Toolbar"
        className="figma-toolbar-dock fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 px-2 py-1.5 sm:px-2.5 rounded-2xl bg-[#1e1e1e]/98 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white select-none max-w-[96vw] overflow-x-auto no-scrollbar touch-manipulation"
      >
        {/* 1. MOVE / CURSOR TOOL (With Submenu: Move V, Hand tool H, Scale K - Image 3) */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              setActiveTool("select");
              setActiveSubmenu(null);
            }}
            title="Move (V)"
            className={`p-2 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTool === "select"
                ? "bg-[#0c8ce9] text-white shadow-sm"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiCursorArrowRays className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSubmenu(activeSubmenu === "move" ? null : "move");
            }}
            title="Move Tools Menu"
            className={`px-1 py-2 rounded-r-xl transition-colors cursor-pointer ${
              activeTool === "select" || activeTool === "hand" || activeTool === "scale"
                ? "bg-[#0c8ce9] text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiChevronDown className="w-3 h-3" />
          </button>

          {/* Move Submenu Dropdown (Image 3) */}
          {activeSubmenu === "move" && (
            <div className="figma-toolbar-submenu absolute bottom-full mb-2 left-0 min-w-[170px] bg-[#222222]/98 border border-white/15 backdrop-blur-2xl rounded-xl p-1 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  setActiveTool("select");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "select"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "select" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiCursorArrowRays className="w-4 h-4" />
                  <span>Move</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">V</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool("hand");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "hand"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "hand" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiHandRaised className="w-4 h-4" />
                  <span>Hand tool</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">H</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool("scale");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "scale"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "scale" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiArrowsPointingOut className="w-4 h-4" />
                  <span>Scale</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">K</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. FRAME / SECTION TOOL (With Submenu: Frame F, Section Shift+S, Slice S - Image 2) */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              handleAddFrame("4:5");
              setActiveTool("frame");
              setActiveSubmenu(null);
            }}
            title="Frame (F)"
            className={`p-2 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTool === "frame"
                ? "bg-[#0c8ce9] text-white shadow-sm"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiHashtag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSubmenu(activeSubmenu === "frame" ? null : "frame");
            }}
            title="Frame Tools Menu"
            className={`px-1 py-2 rounded-r-xl transition-colors cursor-pointer ${
              activeTool === "frame" || activeTool === "section" || activeTool === "slice"
                ? "bg-[#0c8ce9] text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiChevronDown className="w-3 h-3" />
          </button>

          {/* Frame Submenu Dropdown (Image 2) */}
          {activeSubmenu === "frame" && (
            <div className="figma-toolbar-submenu absolute bottom-full mb-2 left-0 min-w-[170px] bg-[#222222]/98 border border-white/15 backdrop-blur-2xl rounded-xl p-1 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  handleAddFrame("4:5");
                  setActiveTool("frame");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "frame"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "frame" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiHashtag className="w-4 h-4" />
                  <span>Frame</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">F</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddSection();
                  setActiveTool("section");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "section"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "section" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiRectangleGroup className="w-4 h-4" />
                  <span>Section</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">Shift+S</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddSlice();
                  setActiveTool("slice");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "slice"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "slice" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiScissors className="w-4 h-4" />
                  <span>Slice</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">S</span>
              </button>

              <div className="w-full h-[1px] bg-white/10 my-1" />

              <button
                type="button"
                onClick={() => {
                  setShowFramePresetsPicker(true);
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RatioWireframeIcon ratio="16:9" className="text-cyan-400" />
                  <span>Preset Rasio & Ukuran...</span>
                </div>
                <span className="text-[10px] text-teal-400 font-mono">All</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. SHAPE TOOL (With Submenu: Rectangle R, Ellipse O, Folder Alt+F, Place Media Ctrl+Shift+K) */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              handleAddShape("rectangle");
              setActiveTool("shape");
              setActiveSubmenu(null);
            }}
            title="Rectangle (R)"
            className={`p-2 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTool === "shape"
                ? "bg-[#0c8ce9] text-white shadow-sm"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiSquare2Stack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSubmenu(activeSubmenu === "shape" ? null : "shape");
            }}
            title="Shapes Menu"
            className={`px-1 py-2 rounded-r-xl transition-colors cursor-pointer ${
              activeTool === "shape"
                ? "bg-[#0c8ce9] text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiChevronDown className="w-3 h-3" />
          </button>

          {/* Shape Submenu Dropdown */}
          {activeSubmenu === "shape" && (
            <div className="figma-toolbar-submenu absolute bottom-full mb-2 left-0 min-w-[200px] bg-[#222222]/98 border border-white/15 backdrop-blur-2xl rounded-xl p-1 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  handleAddShape("rectangle");
                  setActiveTool("shape");
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer hover:bg-white/10 text-neutral-200 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "shape" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiSquare2Stack className="w-4 h-4" />
                  <span>Rectangle</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">R</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddShape("ellipse");
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer hover:bg-white/10 text-neutral-200 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5" />
                  <span className="w-3.5 h-3.5 rounded-full border border-current inline-block" />
                  <span>Ellipse</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">O</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddFolder();
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer hover:bg-white/10 text-neutral-200 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5" />
                  <HiFolder className="w-4 h-4 text-teal-400" />
                  <span>Folder Client</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">Alt+F</span>
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer hover:bg-white/10 text-neutral-200 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5" />
                  <HiPhoto className="w-4 h-4 text-cyan-400" />
                  <span>Place Image / Video...</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">Ctrl+Shift+K</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. PEN / DRAW TOOL (With Submenu: Pen P, Pencil Shift+P) */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              setActiveTool("pen");
              setActiveSubmenu(null);
            }}
            title="Pen (P)"
            className={`p-2 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTool === "pen"
                ? "bg-[#0c8ce9] text-white shadow-sm"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSubmenu(activeSubmenu === "pen" ? null : "pen");
            }}
            title="Pen Tools Menu"
            className={`px-1 py-2 rounded-r-xl transition-colors cursor-pointer ${
              activeTool === "pen" || activeTool === "pencil"
                ? "bg-[#0c8ce9] text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiChevronDown className="w-3 h-3" />
          </button>

          {/* Pen Submenu Dropdown */}
          {activeSubmenu === "pen" && (
            <div className="figma-toolbar-submenu absolute bottom-full mb-2 left-0 min-w-[170px] bg-[#222222]/98 border border-white/15 backdrop-blur-2xl rounded-xl p-1 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  setActiveTool("pen");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "pen"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "pen" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiPencil className="w-4 h-4" />
                  <span>Pen</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">P</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool("pencil");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "pencil"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "pencil" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <HiPencilSquare className="w-4 h-4" />
                  <span>Pencil</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">Shift+P</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. TEXT TOOL (With Submenu: Text T, Text on Path, Sticky Note N - Image 4) */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              handleAddText();
              setActiveTool("text");
              setActiveSubmenu(null);
            }}
            title="Text (T)"
            className={`p-2 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer font-serif font-bold text-sm ${
              activeTool === "text"
                ? "bg-[#0c8ce9] text-white shadow-sm"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            T
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSubmenu(activeSubmenu === "text" ? null : "text");
            }}
            title="Text Tools Menu"
            className={`px-1 py-2 rounded-r-xl transition-colors cursor-pointer ${
              activeTool === "text"
                ? "bg-[#0c8ce9] text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiChevronDown className="w-3 h-3" />
          </button>

          {/* Text Submenu Dropdown (Image 4) */}
          {activeSubmenu === "text" && (
            <div className="figma-toolbar-submenu absolute bottom-full mb-2 left-0 min-w-[170px] bg-[#222222]/98 border border-white/15 backdrop-blur-2xl rounded-xl p-1 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  handleAddText();
                  setActiveTool("text");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "text"
                    ? "bg-[#0c8ce9] text-white font-medium"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    {activeTool === "text" && <HiCheck className="w-3.5 h-3.5" />}
                  </span>
                  <span className="font-serif font-bold text-sm leading-none">T</span>
                  <span>Text</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">T</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddTextPath();
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer hover:bg-white/10 text-neutral-200 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5" />
                  <span className="text-sm leading-none">⌢</span>
                  <span>Text on path</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddComment();
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer hover:bg-white/10 text-neutral-200 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5" />
                  <span>📝</span>
                  <span>Sticky Note</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">N</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. RESOURCES / CODE BRACKETS {} */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "resources" ? null : "resources")}
            title="Resources / Components ({})"
            className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer font-mono font-bold text-sm ${
              activeSubmenu === "resources"
                ? "bg-[#0c8ce9] text-white"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {"{ }"}
          </button>

          {activeSubmenu === "resources" && (
            <div className="figma-toolbar-submenu absolute bottom-full mb-2 left-0 min-w-[210px] bg-[#222222]/98 border border-white/15 backdrop-blur-2xl rounded-xl p-1 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  handleAddFolder();
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              >
                <HiFolder className="w-4 h-4 text-teal-400" />
                <span>Folder Klien Vault</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              >
                <HiPhoto className="w-4 h-4 text-cyan-400" />
                <span>Upload File Media</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(true);
                  setActiveSubmenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              >
                <HiLink className="w-4 h-4 text-amber-400" />
                <span>Link (YouTube / Drive)</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. COMMENT BUBBLE (💬) */}
        <button
          type="button"
          onClick={handleAddComment}
          title="Add Comment / Annotation (C)"
          className="p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-white hover:bg-white/10"
        >
          <HiChatBubbleBottomCenterText className="w-4 h-4" />
        </button>

        {/* 8. WIDGETS / ASSETS (❖+) */}
        <button
          type="button"
          onClick={() => {
            handleAddFrame("16:9");
            setActiveSubmenu(null);
          }}
          title="Widgets & Presets (❖+)"
          className="p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-white hover:bg-white/10"
        >
          <HiSparkles className="w-4 h-4 text-amber-400" />
        </button>

        {/* Toolbar Vertical Separator */}
        <div className="w-[1px] h-5 bg-white/15 mx-1" />

        {/* 9. PENCIL / SCRIBBLER */}
        <button
          type="button"
          onClick={() => {
            setActiveTool(activeTool === "pencil" ? "select" : "pencil");
          }}
          title="Pencil / Draw"
          className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            activeTool === "pencil"
              ? "bg-[#0c8ce9] text-white shadow-sm"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <HiPencilSquare className="w-4 h-4" />
        </button>

        {/* 10. MEASURE / RULER (Highlighted in Image 1!) */}
        <button
          type="button"
          onClick={() => setShowMeasureTool(!showMeasureTool)}
          title="Measure / Dimension Inspect (Ruler)"
          className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            showMeasureTool
              ? "bg-[#0c8ce9] text-white shadow-sm"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <span className="text-sm leading-none font-bold">📐</span>
        </button>

        {/* 11. PRESENT / PREVIEW WEB */}
        <button
          type="button"
          onClick={() => {
            if (onOpenCanvasPreview) {
              onOpenCanvasPreview();
            } else if (typeof window !== "undefined") {
              window.open("/canvas", "_blank");
            }
          }}
          title="Present / Live Canvas View (▷)"
          className="p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-teal-400 hover:bg-white/10"
        >
          <HiPlay className="w-4 h-4" />
        </button>

        {/* 12. CODE / DEV MODE (</>) */}
        <button
          type="button"
          onClick={() => setShowDevMode(true)}
          title="Dev Mode / Inspect Code (</>)"
          className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer font-mono font-bold text-xs ${
            showDevMode
              ? "bg-[#0c8ce9] text-white shadow-sm"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {"</>"}
        </button>
      </nav>

      

      {/* ── Modal: Dev Mode / Code Inspect (</>) ───────────────────────────────── */}
      {showDevMode && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#14161d] border border-white/15 p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#0c8ce9] text-white font-mono text-xs font-bold">
                  {"</>"}
                </span>
                <h3 className="font-bold text-sm text-white font-mono">Dev Mode // Canvas JSON Data</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDevMode(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 font-mono">
              Total {items.length} elemen pada infinite canvas. Struktur data JSON dapat disalin untuk keperluan integrasi atau backup.
            </p>

            <pre className="flex-1 overflow-auto p-4 rounded-xl bg-black/60 border border-white/10 text-teal-300 font-mono text-xs max-h-[400px] select-all">
              {JSON.stringify(items, null, 2)}
            </pre>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(items, null, 2));
                  alert("JSON berhasil disalin ke clipboard!");
                }}
                className="px-4 py-2 rounded-xl bg-[#0c8ce9] hover:bg-blue-500 text-white font-bold text-xs font-mono transition-colors cursor-pointer"
              >
                Copy JSON Data
              </button>
              <button
                type="button"
                onClick={() => setShowDevMode(false)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-mono cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Figma Right-Click Context Menu Popup ──────────────────────────────── */}
      {contextMenu?.isOpen && (
        <div
          ref={contextMenuRef}
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 99999,
          }}
          className="w-[245px] py-1.5 px-1 rounded-xl bg-[#222222]/98 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl select-none animate-in fade-in zoom-in-95 duration-100 text-[12.5px] font-sans text-[#e6e6e6] max-h-[88vh] overflow-y-auto"
        >
          {/* Section 1: Clipboard & Actions */}
          <button
            type="button"
            onClick={() => {
              handleCopy(contextMenu.item || undefined);
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Copy</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+C</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handlePaste({ x: contextMenu.canvasX, y: contextMenu.canvasY });
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Paste here</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+V</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handlePasteToReplace(contextMenu.item);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item || !copiedItemRef.current}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item || !copiedItemRef.current
                ? "text-neutral-500 cursor-not-allowed"
                : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Paste to replace</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+Shift+R</span>
          </button>

          {/* Copy/Paste as Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setContextSubmenu("copy_as")}
            onMouseLeave={() => setContextSubmenu(null)}
          >
            <div className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group">
              <span>Copy/Paste as</span>
              <HiChevronRight className="w-3.5 h-3.5 text-[#8e8e8e] group-hover:text-white" />
            </div>

            {contextSubmenu === "copy_as" && (
              <div className="absolute left-full top-0 ml-1 w-[180px] py-1 px-1 rounded-xl bg-[#222222]/98 border border-white/10 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-75">
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.item) handleCopy(contextMenu.item);
                    alert("Data elemen disalin!");
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                >
                  Copy as PNG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.item) {
                      navigator.clipboard.writeText(`<div class="figma-frame" style="width:${contextMenu.item.width || 1080}px;height:${contextMenu.item.height || 1350}px"></div>`);
                    }
                    alert("SVG / Frame snippet disalin!");
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                >
                  Copy as SVG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.item) {
                      navigator.clipboard.writeText(`width: ${contextMenu.item.width || 1080}px;\nheight: ${contextMenu.item.height || 1350}px;`);
                    }
                    alert("CSS styles disalin!");
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                >
                  Copy as CSS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link canvas disalin!");
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                >
                  Copy link
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowDevMode(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Build this with code</span>
            <span className="text-[10px] text-teal-400 font-mono font-bold">{"</>"}</span>
          </button>

          {/* Add motion Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setContextSubmenu("motion")}
            onMouseLeave={() => setContextSubmenu(null)}
          >
            <div className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group">
              <span>Add motion</span>
              <HiChevronRight className="w-3.5 h-3.5 text-[#8e8e8e] group-hover:text-white" />
            </div>

            {contextSubmenu === "motion" && (
              <div className="absolute left-full top-0 ml-1 w-[160px] py-1 px-1 rounded-xl bg-[#222222]/98 border border-white/10 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-75">
                {["Fade in", "Scale up", "Slide up", "Spring bounce"].map((mot) => (
                  <button
                    key={mot}
                    type="button"
                    onClick={() => {
                      alert(`Motion '${mot}' diterapkan ke elemen!`);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                  >
                    {mot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-[1px] bg-white/[0.08] my-1 mx-1.5" />

          {/* Section 2: Ordering & Navigation */}
          {/* Move to page Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setContextSubmenu("move_page")}
            onMouseLeave={() => setContextSubmenu(null)}
          >
            <div className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group">
              <span>Move to page</span>
              <HiChevronRight className="w-3.5 h-3.5 text-[#8e8e8e] group-hover:text-white" />
            </div>

            {contextSubmenu === "move_page" && (
              <div className="absolute left-full top-0 ml-1 w-[170px] py-1 px-1 rounded-xl bg-[#222222]/98 border border-white/10 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-75">
                <button
                  type="button"
                  onClick={() => setContextMenu(null)}
                  className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors font-medium flex items-center justify-between"
                >
                  <span>Page 1 (Active)</span>
                  <HiCheck className="w-3.5 h-3.5 text-teal-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Halaman baru dibuat!");
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12px] text-teal-300 hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                >
                  + Create new page
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleBringToFront(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item ? "text-neutral-500 cursor-not-allowed" : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Bring to front</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleSendToBack(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item ? "text-neutral-500 cursor-not-allowed" : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Send to back</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">[</span>
          </button>

          <div className="h-[1px] bg-white/[0.08] my-1 mx-1.5" />

          {/* Section 3: Grouping & Structure */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleConvertSection(contextMenu.item);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item ? "text-neutral-500 cursor-not-allowed" : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>{contextMenu.item?.type === "section" ? "Convert to frame" : "Convert to section"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              alert("Elemen digabungkan ke Group");
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Group selection</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+G</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleAddFrame("4:5");
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Frame selection</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+Alt+G</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Ungroup</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+⌫</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) {
                setItems((prev) => prev.map((i) => ({ ...i, isThumbnail: i.id === contextMenu.item?.id })));
                setHasChanges(true);
                alert(`'${contextMenu.item.title}' disetel sebagai thumbnail!`);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Set as thumbnail</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) {
                setItems((prev) => prev.map((i) => i.id === contextMenu.item?.id ? { ...i, isMask: !i.isMask } : i));
                setHasChanges(true);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Use as mask</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+Alt+M</span>
          </button>

          <div className="h-[1px] bg-white/[0.08] my-1 mx-1.5" />

          {/* Section 4: Layout & Components */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) {
                setItems((prev) => prev.map((i) => i.id === contextMenu.item?.id ? { ...i, isAutoLayout: !i.isAutoLayout } : i));
                setHasChanges(true);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Add auto layout</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Shift+A</span>
          </button>

          {/* More layout options Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setContextSubmenu("more_layout")}
            onMouseLeave={() => setContextSubmenu(null)}
          >
            <div className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group">
              <span>More layout options</span>
              <HiChevronRight className="w-3.5 h-3.5 text-[#8e8e8e] group-hover:text-white" />
            </div>

            {contextSubmenu === "more_layout" && (
              <div className="absolute left-full top-0 ml-1 w-[180px] py-1 px-1 rounded-xl bg-[#222222]/98 border border-white/10 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-75">
                {["Horizontal pack", "Vertical pack", "Distribute horizontal", "Distribute vertical"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      alert(`Layout: ${opt}`);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) {
                setItems((prev) => prev.map((i) => i.id === contextMenu.item?.id ? { ...i, isComponent: !i.isComponent } : i));
                setHasChanges(true);
                alert("Master Component dibuat!");
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group text-left"
          >
            <span>Create component</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+Alt+K</span>
          </button>

          {/* Plugins Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setContextSubmenu("plugins")}
            onMouseLeave={() => setContextSubmenu(null)}
          >
            <div className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group">
              <span>Plugins</span>
              <HiChevronRight className="w-3.5 h-3.5 text-[#8e8e8e] group-hover:text-white" />
            </div>

            {contextSubmenu === "plugins" && (
              <div className="absolute left-full top-0 ml-1 w-[160px] py-1 px-1 rounded-xl bg-[#222222]/98 border border-white/10 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-75">
                {["Unsplash Image", "Remove BG AI", "Iconify Icons", "Content Reel"].map((plg) => (
                  <button
                    key={plg}
                    type="button"
                    onClick={() => {
                      alert(`Plugin ${plg} diaktifkan`);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                  >
                    {plg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Widgets Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setContextSubmenu("widgets")}
            onMouseLeave={() => setContextSubmenu(null)}
          >
            <div className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] hover:bg-[#0c8ce9] hover:text-white rounded-md transition-colors cursor-pointer group">
              <span>Widgets</span>
              <HiChevronRight className="w-3.5 h-3.5 text-[#8e8e8e] group-hover:text-white" />
            </div>

            {contextSubmenu === "widgets" && (
              <div className="absolute left-full top-0 ml-1 w-[160px] py-1 px-1 rounded-xl bg-[#222222]/98 border border-white/10 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-75">
                {["Sticky Note", "Voting Poll", "Jira Tracker", "Clock Timer"].map((wgt) => (
                  <button
                    key={wgt}
                    type="button"
                    onClick={() => {
                      alert(`Widget ${wgt} ditambahkan ke canvas`);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#0c8ce9] hover:text-white rounded-md cursor-pointer transition-colors"
                  >
                    {wgt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-[1px] bg-white/[0.08] my-1 mx-1.5" />

          {/* Section 5: Visibility & Lock */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleToggleHide(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item ? "text-neutral-500 cursor-not-allowed" : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>{contextMenu.item && hiddenItemIds.has(contextMenu.item.id) ? "Show" : "Hide"}</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+Shift+H</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleToggleLock(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item ? "text-neutral-500 cursor-not-allowed" : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>{contextMenu.item && lockedItemIds.has(contextMenu.item.id) ? "Unlock" : "Lock"}</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Ctrl+Shift+L</span>
          </button>

          <div className="h-[1px] bg-white/[0.08] my-1 mx-1.5" />

          {/* Section 6: Transformations & Delete */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleFlipHorizontal(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item ? "text-neutral-500 cursor-not-allowed" : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Flip horizontal</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Shift+H</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleFlipVertical(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item ? "text-neutral-500 cursor-not-allowed" : "hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Flip vertical</span>
            <span className="text-[11px] text-[#8e8e8e] group-hover:text-white/90 font-mono">Shift+V</span>
          </button>

          {contextMenu.item && (
            <>
              <div className="h-[1px] bg-white/[0.08] my-1 mx-1.5" />
              <button
                type="button"
                onClick={() => {
                  if (contextMenu.item) handleDeleteItem(contextMenu.item.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors cursor-pointer group text-left font-medium"
              >
                <span>Delete</span>
                <span className="text-[11px] text-red-400/80 group-hover:text-white font-mono">Del</span>
              </button>
            </>
          )}
        </div>
      )}

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
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Aspect Ratio Frame
              </label>
              <AspectRatioPicker
                value={modalAspect}
                onChange={(ratio) => setModalAspect(ratio)}
                maxHeight="160px"
              />
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

      {/* ── Modal: Frame Presets & Aspect Ratios (Screenshot Reference) ───────── */}
      {showFramePresetsPicker && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#14161d] border border-white/15 p-5 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#0c8ce9] text-white font-mono text-xs font-bold">
                  #
                </span>
                <h3 className="font-bold text-sm text-white font-mono">Preset Rasio & Format Ukuran</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFramePresetsPicker(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Pilih format ukuran rasio frame (Ratios, Social, Video, Print, Wallpaper) untuk ditambahkan langsung ke canvas.
            </p>

            <AspectRatioPicker
              value="16:9"
              onChange={handleSelectFramePreset}
              maxHeight="380px"
            />
          </div>
        </div>
      )}

      {/* Mobile Design Inspector Drawer */}
      {isMobileInspectorOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-80 max-w-[85vw] h-full shadow-2xl relative animate-in slide-in-from-right duration-200">
            <button
              type="button"
              onClick={() => setIsMobileInspectorOpen(false)}
              className="absolute top-2.5 right-2.5 z-50 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Close Inspector"
            >
              <HiXMark className="w-4 h-4" />
            </button>
            {renderRightInspector()}
          </div>
        </div>
      )}

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-teal-500 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-150">
          <HiCheckCircle className="w-4 h-4 text-black" />
          <span>✨ Link Rizx Canvas disalin ke clipboard!</span>
        </div>
      )}

      {/* Help & Shortcuts Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1e1e1e] border border-white/15 p-5 shadow-2xl text-xs space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-white text-sm">Figma Studio Shortcuts</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-neutral-300 font-mono text-[11px]">
              <div className="flex justify-between"><span>Move tool</span><span className="text-white">V</span></div>
              <div className="flex justify-between"><span>Hand tool (Pan)</span><span className="text-white">H / Space+Drag</span></div>
              <div className="flex justify-between"><span>Frame</span><span className="text-white">F</span></div>
              <div className="flex justify-between"><span>Section</span><span className="text-white">Shift+S</span></div>
              <div className="flex justify-between"><span>Rectangle</span><span className="text-white">R</span></div>
              <div className="flex justify-between"><span>Text</span><span className="text-white">T</span></div>
              <div className="flex justify-between"><span>Zoom In / Out</span><span className="text-white">+ / -</span></div>
              <div className="flex justify-between"><span>Zoom to Fit</span><span className="text-white">Shift+1</span></div>
              <div className="flex justify-between"><span>Expand / Collapse UI</span><span className="text-white">Ctrl+Shift+\</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

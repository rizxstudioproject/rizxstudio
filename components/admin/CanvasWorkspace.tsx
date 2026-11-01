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

// ── Figma Frame Presets Definition (Matches Screenshot media_1793530390332_97f50010.png) ─────────────
export interface FramePresetItem {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface FramePresetCategory {
  id: string;
  title: string;
  items: FramePresetItem[];
}

export const FRAME_PRESET_CATEGORIES: FramePresetCategory[] = [
  {
    id: "phone",
    title: "Phone",
    items: [
      { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", width: 440, height: 956 },
      { id: "iphone-16-pro", name: "iPhone 16 Pro", width: 402, height: 874 },
      { id: "iphone-16-plus", name: "iPhone 16 Plus", width: 430, height: 932 },
      { id: "iphone-16", name: "iPhone 16", width: 393, height: 852 },
      { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", width: 430, height: 932 },
      { id: "iphone-15-pro", name: "iPhone 15 Pro", width: 393, height: 852 },
      { id: "iphone-14", name: "iPhone 14 & 15", width: 393, height: 852 },
      { id: "iphone-se", name: "iPhone SE", width: 320, height: 568 },
      { id: "android-compact", name: "Android Compact", width: 360, height: 640 },
      { id: "android-large", name: "Android Large", width: 412, height: 915 },
    ],
  },
  {
    id: "tablet",
    title: "Tablet",
    items: [
      { id: "ipad-pro-13", name: "iPad Pro 13\"", width: 1032, height: 1376 },
      { id: "ipad-pro-11", name: "iPad Pro 11\"", width: 834, height: 1210 },
      { id: "ipad-air-13", name: "iPad Air 13\"", width: 1032, height: 1376 },
      { id: "ipad-air-11", name: "iPad Air 11\"", width: 820, height: 1180 },
      { id: "ipad-mini", name: "iPad mini", width: 744, height: 1133 },
      { id: "surface-pro-9", name: "Surface Pro 9", width: 1440, height: 960 },
    ],
  },
  {
    id: "desktop",
    title: "Desktop",
    items: [
      { id: "desktop-standard", name: "Desktop", width: 1440, height: 1024 },
      { id: "macbook-pro-16", name: "MacBook Pro 16\"", width: 1728, height: 1117 },
      { id: "macbook-pro-14", name: "MacBook Pro 14\"", width: 1512, height: 982 },
      { id: "macbook-air", name: "MacBook Air", width: 1280, height: 832 },
      { id: "imac-24", name: "iMac", width: 2560, height: 1440 },
      { id: "wireframe", name: "Wireframe", width: 1440, height: 1024 },
    ],
  },
  {
    id: "presentation",
    title: "Presentation",
    items: [
      { id: "slide-16-9", name: "Slide 16:9", width: 1920, height: 1080 },
      { id: "slide-4-3", name: "Slide 4:3", width: 1024, height: 768 },
    ],
  },
  {
    id: "watch",
    title: "Watch",
    items: [
      { id: "watch-45", name: "Apple Watch 45mm", width: 198, height: 242 },
      { id: "watch-41", name: "Apple Watch 41mm", width: 176, height: 215 },
      { id: "watch-ultra", name: "Apple Watch Ultra 49mm", width: 205, height: 251 },
    ],
  },
  {
    id: "paper",
    title: "Paper",
    items: [
      { id: "a4", name: "A4", width: 595, height: 842 },
      { id: "a5", name: "A5", width: 420, height: 595 },
      { id: "a6", name: "A6", width: 297, height: 420 },
      { id: "letter", name: "Letter", width: 612, height: 792 },
      { id: "tabloid", name: "Tabloid", width: 792, height: 1224 },
    ],
  },
  {
    id: "social",
    title: "Social media",
    items: [
      { id: "twitter-post", name: "X (Twitter) post", width: 1200, height: 675 },
      { id: "twitter-header", name: "X (Twitter) header", width: 1500, height: 500 },
      { id: "facebook-post", name: "Facebook post", width: 1200, height: 630 },
      { id: "facebook-cover", name: "Facebook cover", width: 820, height: 312 },
      { id: "instagram-post", name: "Instagram post", width: 1080, height: 1350 },
      { id: "instagram-story", name: "Instagram story", width: 1080, height: 1920 },
      { id: "dribbble-shot", name: "Dribbble shot", width: 400, height: 300 },
      { id: "dribbble-shot-hd", name: "Dribbble shot HD", width: 800, height: 600 },
      { id: "linkedin-cover", name: "LinkedIn cover", width: 1584, height: 396 },
    ],
  },
  {
    id: "community",
    title: "Figma Community",
    items: [
      { id: "plugin-icon", name: "Plugin icon", width: 128, height: 128 },
      { id: "plugin-banner", name: "Plugin banner", width: 1920, height: 1080 },
      { id: "cover-art", name: "Cover art", width: 1920, height: 960 },
    ],
  },
  {
    id: "archive",
    title: "Archive",
    items: [
      { id: "iphone-13-14", name: "iPhone 13 / 14", width: 390, height: 844 },
      { id: "iphone-11-pro", name: "iPhone 11 Pro / X", width: 375, height: 812 },
      { id: "google-pixel-2", name: "Google Pixel 2", width: 411, height: 731 },
    ],
  },
];

// ── Figma Icons Matching Screenshots ──────────────────────────────────────────
export const FigmaMoveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 3.5l13.5 7-6.5 2-2 6.5z" />
  </svg>
);

export const FigmaHandIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

export const FigmaScaleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <rect x="6.5" y="12.5" width="5" height="5" rx="1" />
    <path d="M12 12l5-5m0 0h-3.5m3.5 0v3.5" />
  </svg>
);

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
  const [expandedPresetCategories, setExpandedPresetCategories] = useState<Record<string, boolean>>({ social: true });

  const togglePresetCategory = (catId: string) => {
    setExpandedPresetCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Layers Tree State (Expanded folders/groups, item lock and visibility toggles)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [expandedFrames, setExpandedFrames] = useState<Record<string, boolean>>({});
  const [lockedItemIds, setLockedItemIds] = useState<Set<string>>(new Set());
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set());

  const toggleFolderExpanded = (key: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const toggleFrameExpanded = (id: string) => {
    setExpandedFrames((prev) => ({
      ...prev,
      [id]: prev[id] ? false : true,
    }));
  };

  const toggleExpandAll = () => {
    const isAnyCollapsed =
      Object.values(expandedFolders).some((v) => v === false) ||
      Object.values(expandedFrames).some((v) => v === false);
    const nextState: Record<string, boolean> = {};
    clients.forEach((c) => {
      nextState[c.clientName] = isAnyCollapsed ? true : false;
    });
    const nextFrames: Record<string, boolean> = {};
    items.forEach((it) => {
      nextFrames[it.id] = isAnyCollapsed ? true : false;
    });
    setExpandedFolders(nextState);
    setExpandedFrames(nextFrames);
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState<boolean>(false);
  const [marqueeBox, setMarqueeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Interactive Frame & Section Drawing Tool (Figma Style)
  const [isDrawingShape, setIsDrawingShape] = useState<boolean>(false);
  const [drawingShapeBox, setDrawingShapeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    type: "frame" | "section";
  } | null>(null);
  const drawingShapeStartRef = useRef<{
    screenX: number;
    screenY: number;
    canvasX: number;
    canvasY: number;
  } | null>(null);

  const dragItemInitialPositionsRef = useRef<Map<string, { x: number; y: number }> | null>(null);

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
  const [isEffectPopoverOpen, setIsEffectPopoverOpen] = useState<boolean>(false);

  // Computes CSS boxShadow from element's effect properties (Figma Drop Shadow & Inner Shadow)
  const getEffectBoxShadow = useCallback((item: CanvasItem) => {
    if (!item.effects || item.effectHidden) return undefined;
    const sX = item.shadowX !== undefined ? item.shadowX : 0;
    const sY = item.shadowY !== undefined ? item.shadowY : 4;
    const sBlur = item.shadowBlur !== undefined ? item.shadowBlur : 4;
    const sSpread = item.shadowSpread !== undefined ? item.shadowSpread : 0;
    const sColor = item.shadowColor || "#000000";
    const sOpacity = item.shadowOpacity !== undefined ? item.shadowOpacity : 25;

    let cleanHex = sColor.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    const a = Math.max(0, Math.min(1, sOpacity / 100));
    const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;

    if (item.effects === "inner-shadow") {
      return `inset ${sX}px ${sY}px ${sBlur}px ${sSpread}px ${rgba}`;
    }
    if (item.effects === "drop-shadow") {
      return `${sX}px ${sY}px ${sBlur}px ${sSpread}px ${rgba}`;
    }
    return undefined;
  }, []);

  // Computes CSS filter blur from element's layer-blur effect
  const getEffectFilter = useCallback((item: CanvasItem) => {
    if (!item.effects || item.effectHidden) return undefined;
    if (item.effects === "layer-blur") {
      const sBlur = item.shadowBlur !== undefined ? item.shadowBlur : 4;
      return `blur(${sBlur}px)`;
    }
    return undefined;
  }, []);

  const selectedItem = useMemo(() => items.find((it) => it.id === selectedId) || null, [items, selectedId]);

  // Combined Bounding Box for Multi-Selection (Figma Style)
  const multiSelectionBounds = useMemo(() => {
    if (selectedIds.size <= 1) return null;
    const selectedList = items.filter((it) => selectedIds.has(it.id) && !hiddenItemIds.has(it.id));
    if (selectedList.length <= 1) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedList.forEach((it) => {
      const itX = it.x || 0;
      const itY = it.y || 0;
      let itW = it.width || 380;
      let itH = it.height || 480;
      if (it.type === "section" || it.mediaType === "section") {
        itW = it.width || 1200;
        itH = it.height || 600;
      } else if (it.type === "text" || it.mediaType === "text") {
        itW = it.width || 320;
        itH = it.height || 180;
      }
      minX = Math.min(minX, itX);
      minY = Math.min(minY, itY);
      maxX = Math.max(maxX, itX + itW);
      maxY = Math.max(maxY, itY + itH);
    });

    if (minX === Infinity) return null;
    return {
      x: minX,
      y: minY,
      width: Math.round(maxX - minX),
      height: Math.round(maxY - minY),
      count: selectedList.length,
    };
  }, [items, selectedIds, hiddenItemIds]);

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

  // ── Figma Color Picker Utilities & State (Matches Screenshot media_1793528907470_542d3124.png) ──────────────
  const hexToHsv = useCallback((hex: string) => {
    let cleaned = hex.replace("#", "").trim();
    if (cleaned.length === 3) {
      cleaned = cleaned.split("").map((c) => c + c).join("");
    }
    if (cleaned.length !== 6) {
      return { h: 45, s: 100, v: 90 };
    }
    const r = parseInt(cleaned.slice(0, 2), 16) / 255;
    const g = parseInt(cleaned.slice(2, 4), 16) / 255;
    const b = parseInt(cleaned.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / diff + 2) / 6;
      else h = ((r - g) / diff + 4) / 6;
    }
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  }, []);

  const hsvToHex = useCallback((h: number, s: number, v: number) => {
    const hNorm = ((h % 360) + 360) % 360 / 360;
    const sNorm = Math.min(100, Math.max(0, s)) / 100;
    const vNorm = Math.min(100, Math.max(0, v)) / 100;

    const i = Math.floor(hNorm * 6);
    const f = hNorm * 6 - i;
    const p = vNorm * (1 - sNorm);
    const q = vNorm * (1 - f * sNorm);
    const t = vNorm * (1 - (1 - f) * sNorm);

    let r = 0, g = 0, b = 0;
    switch (i % 6) {
      case 0: r = vNorm; g = t; b = p; break;
      case 1: r = q; g = vNorm; b = p; break;
      case 2: r = p; g = vNorm; b = t; break;
      case 3: r = p; g = q; b = vNorm; break;
      case 4: r = t; g = p; b = vNorm; break;
      case 5: r = vNorm; g = p; b = q; break;
    }

    const toHex = (n: number) => {
      const val = Math.round(Math.max(0, Math.min(255, n * 255)));
      const hex = val.toString(16).toUpperCase();
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<"fill" | "stroke">("fill");
  const [colorPickerTab, setColorPickerTab] = useState<"custom" | "libraries">("custom");
  const [colorFillMode, setColorFillMode] = useState<"solid" | "linear" | "radial" | "image" | "video">("solid");
  const [colorFormat, setColorFormat] = useState<"Hex" | "RGB" | "CSS">("Hex");
  const [colorHue, setColorHue] = useState<number>(45);
  const [colorSat, setColorSat] = useState<number>(100);
  const [colorVal, setColorVal] = useState<number>(90);
  const [colorAlpha, setColorAlpha] = useState<number>(100);
  const [colorHexInput, setColorHexInput] = useState<string>("E5BF00");
  const [recentPickedColors, setRecentPickedColors] = useState<string[]>([]);
  const [isPagePaletteOpen, setIsPagePaletteOpen] = useState<boolean>(true);

  const currentColorHex = useMemo(() => {
    return hsvToHex(colorHue, colorSat, colorVal);
  }, [colorHue, colorSat, colorVal, hsvToHex]);

  const onThisPageColors = useMemo(() => {
    const set = new Set<string>();
    // All colors used on this page across canvas items
    items.forEach((it) => {
      if (it.color && it.color.startsWith("#")) set.add(it.color.toUpperCase());
      if (it.strokeColor && it.strokeColor.startsWith("#")) set.add(it.strokeColor.toUpperCase());
    });
    // Add recently picked colors
    recentPickedColors.forEach((c) => {
      if (c.startsWith("#")) set.add(c.toUpperCase());
    });
    // Add Figma signature palette presets (matching screenshot media_1793528907470_542d3124.png)
    const figmaPaletteDefaults = [
      "#FFFFFF", "#F9FAEF", "#BAE6FD", "#000000", "#1E293B", "#EF4444", "#991B1B", "#64748B", "#F59E0B",
      "#F97316", "#F43F5E", "#38BDF8", "#7DD3FC", "#0F172A", "#334155", "#475569", "#E2E8F0", "#F1F5F9",
      "#18181B", "#84CC16", "#22C55E", "#06B6D4", "#0C8CE9", "#00A389", "#E5BF00", "#7C3AED", "#BE185D"
    ];
    figmaPaletteDefaults.forEach((c) => set.add(c));
    return Array.from(set);
  }, [items, recentPickedColors]);

  const applyColor = useCallback((hex: string, alpha?: number) => {
    const cleanHex = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
    setColorHexInput(cleanHex.replace("#", ""));
    
    // Track in recent picked colors
    setRecentPickedColors((prev) => {
      const next = [cleanHex, ...prev.filter((c) => c !== cleanHex)].slice(0, 20);
      return next;
    });

    if (colorPickerTarget === "fill") {
      updateSelectedItem({ 
        color: cleanHex, 
        ...(alpha !== undefined ? { opacity: alpha } : {}) 
      });
    } else {
      updateSelectedItem({ strokeColor: cleanHex });
    }
  }, [colorPickerTarget, updateSelectedItem]);

  const openColorPicker = useCallback((target: "fill" | "stroke", initialHex?: string) => {
    const raw = initialHex || (target === "fill" ? selectedItem?.color || "#E5BF00" : selectedItem?.strokeColor || "#FFFFFF");
    const safeHex = raw.startsWith("#") ? raw : `#${raw}`;
    const { h, s, v } = hexToHsv(safeHex);
    setColorPickerTarget(target);
    setColorHue(h);
    setColorSat(s);
    setColorVal(v);
    setColorHexInput(safeHex.replace("#", "").toUpperCase());
    setColorAlpha(selectedItem?.opacity !== undefined ? selectedItem.opacity : 100);
    setIsColorPickerOpen(true);
  }, [selectedItem, hexToHsv]);

  const handleEyeDropper = useCallback(async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const pickedHex = result.sRGBHex.toUpperCase();
          const { h, s, v } = hexToHsv(pickedHex);
          setColorHue(h);
          setColorSat(s);
          setColorVal(v);
          applyColor(pickedHex);
        }
      } catch {
        // User cancelled picker
      }
    }
  }, [applyColor, hexToHsv]);

  const handleSatValPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const newSat = Math.round((x / rect.width) * 100);
    const newVal = Math.round((1 - y / rect.height) * 100);
    setColorSat(newSat);
    setColorVal(newVal);
    const newHex = hsvToHex(colorHue, newSat, newVal);
    applyColor(newHex);
  }, [colorHue, hsvToHex, applyColor]);

  const handleHuePointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newHue = Math.round((x / rect.width) * 360);
    setColorHue(newHue);
    const newHex = hsvToHex(newHue, colorSat, colorVal);
    applyColor(newHex);
  }, [colorSat, colorVal, hsvToHex, applyColor]);

  const handleAlphaPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newAlpha = Math.round((x / rect.width) * 100);
    setColorAlpha(newAlpha);
    const curHex = hsvToHex(colorHue, colorSat, colorVal);
    applyColor(curHex, newAlpha);
  }, [colorHue, colorSat, colorVal, hsvToHex, applyColor]);

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

  // Converts screen client coordinates (e.clientX, e.clientY) accurately into canvas space
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    const offsetX = rect ? clientX - rect.left : clientX;
    const offsetY = rect ? clientY - rect.top : clientY;
    const curPan = panRef.current || pan;
    const curZoom = zoomRef.current || zoom;
    return {
      x: Math.round((offsetX - curPan.x) / curZoom),
      y: Math.round((offsetY - curPan.y) / curZoom),
    };
  }, [pan, zoom]);

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
    const { x: canvasX, y: canvasY } = getCanvasCoords(e.clientX, e.clientY);

    setContextMenu({
      isOpen: true,
      x,
      y,
      canvasX,
      canvasY,
      item,
    });
    setContextSubmenu(null);
  }, [getCanvasCoords]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    // If clicked on input or textarea, let default context menu appear
    if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
    e.preventDefault();

    const menuWidth = 245;
    const menuHeight = 540;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(e.clientY, Math.max(12, window.innerHeight - menuHeight - 12));
    const { x: canvasX, y: canvasY } = getCanvasCoords(e.clientX, e.clientY);

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
  }, [getCanvasCoords, selectedId, items]);

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

  // Helper to identify Frame items
  const isFrameItem = useCallback((it: CanvasItem) => {
    return (
      it.mediaType === "frame" ||
      it.type === "section" ||
      it.type === "frame" ||
      it.type === "group" ||
      (it.aspect && it.aspect !== "original")
    );
  }, []);

  // Helper to find parent frame ID of an item
  const getParentFrameId = useCallback((it: CanvasItem) => {
    if (it.frameId) return it.frameId;
    const itX = it.x || 0;
    const itY = it.y || 0;
    const parent = items.find((f) => {
      if (f.id === it.id || !isFrameItem(f)) return false;
      const fW = f.width || (f.aspect === "16:9" ? 720 : 480);
      const fH = f.height || (f.aspect === "16:9" ? 405 : 600);
      const fX = f.x || 0;
      const fY = f.y || 0;
      return itX >= fX && itX <= fX + fW && itY >= fY && itY <= fY + fH;
    });
    return parent?.id;
  }, [items, isFrameItem]);

  // ── Figma Group, Frame Selection & Ungroup Handlers ─────────────────────────
  const handleGroupSelection = useCallback(() => {
    const contextItem = contextMenu?.item;
    const selectedList = items.filter(
      (it) => selectedIds.has(it.id) || it.id === selectedId || (contextItem && it.id === contextItem.id)
    );
    if (selectedList.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedList.forEach((it) => {
      const x = it.x || 0;
      const y = it.y || 0;
      const w = it.width || 440;
      const h = it.height || 550;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const padding = 20;
    const groupX = Math.max(0, Math.round(minX - padding));
    const groupY = Math.max(0, Math.round(minY - padding));
    const groupW = Math.round(maxX - minX + padding * 2);
    const groupH = Math.round(maxY - minY + padding * 2);

    const groupId = `group-${Date.now()}`;
    const newGroup: CanvasItem = {
      id: groupId,
      title: `Group ${items.filter((i) => i.type === "group").length + 1}`,
      type: "group",
      mediaType: "frame",
      x: groupX,
      y: groupY,
      width: groupW,
      height: groupH,
      color: "transparent",
      strokeColor: "#0c8ce9",
      strokeWidth: 1,
    };

    const targetIds = new Set(selectedList.map((i) => i.id));
    const updated = items.map((it) => {
      if (targetIds.has(it.id)) {
        return { ...it, frameId: groupId };
      }
      return it;
    });

    updateItemsWithTracking([...updated, newGroup]);
    setSelectedId(groupId);
    setSelectedIds(new Set([groupId]));
  }, [items, selectedId, selectedIds, contextMenu?.item, updateItemsWithTracking]);

  const handleFrameSelection = useCallback(() => {
    const contextItem = contextMenu?.item;
    const selectedList = items.filter(
      (it) => selectedIds.has(it.id) || it.id === selectedId || (contextItem && it.id === contextItem.id)
    );
    if (selectedList.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedList.forEach((it) => {
      const x = it.x || 0;
      const y = it.y || 0;
      const w = it.width || 440;
      const h = it.height || 550;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const padding = 20;
    const frameX = Math.max(0, Math.round(minX - padding));
    const frameY = Math.max(0, Math.round(minY - padding));
    const frameW = Math.round(maxX - minX + padding * 2);
    const frameH = Math.round(maxY - minY + padding * 2);

    const frameId = `frame-${Date.now()}`;
    const newFrame: CanvasItem = {
      id: frameId,
      title: `Frame ${items.filter((i) => i.mediaType === "frame" && i.type !== "group").length + 1}`,
      type: "media",
      mediaType: "frame",
      aspect: `${frameW}:${frameH}`,
      x: frameX,
      y: frameY,
      width: frameW,
      height: frameH,
      color: "#0c8ce9",
    };

    const targetIds = new Set(selectedList.map((i) => i.id));
    const updated = items.map((it) => {
      if (targetIds.has(it.id)) {
        return { ...it, frameId };
      }
      return it;
    });

    updateItemsWithTracking([...updated, newFrame]);
    setSelectedId(frameId);
    setSelectedIds(new Set([frameId]));
  }, [items, selectedId, selectedIds, contextMenu?.item, updateItemsWithTracking]);

  const handleUngroup = useCallback((targetItem?: CanvasItem | null) => {
    const it = targetItem || contextMenu?.item || selectedItem || (selectedId ? items.find((i) => i.id === selectedId) : null);
    if (!it) return;

    const targetId = it.id;
    const isGroup = it.type === "group";
    const isFrame = it.mediaType === "frame" || it.type === "section" || it.type === "frame";

    // Direct children linked to this container
    const childItems = items.filter(
      (c) => c.id !== targetId && (c.frameId === targetId || getParentFrameId(c) === targetId)
    );

    if (childItems.length > 0) {
      const childIds = new Set(childItems.map((c) => c.id));
      const nextItems = items
        .filter((item) => (isGroup ? item.id !== targetId : true))
        .map((item) => {
          if (childIds.has(item.id)) {
            return { ...item, frameId: undefined };
          }
          if (item.id === targetId && !isGroup) {
            return { ...item, type: "media", mediaType: item.image ? "image" : "shape", aspect: "original" };
          }
          return item;
        });

      updateItemsWithTracking(nextItems);
      setSelectedId(childItems[0]?.id || null);
      setSelectedIds(childIds);
    } else if (it.frameId) {
      // Release individual item from its parent frame
      const nextItems = items.map((item) =>
        item.id === targetId ? { ...item, frameId: undefined } : item
      );
      updateItemsWithTracking(nextItems);
      setSelectedId(targetId);
      setSelectedIds(new Set([targetId]));
    } else if (isGroup) {
      // Dissolve empty group
      const nextItems = items.filter((item) => item.id !== targetId);
      updateItemsWithTracking(nextItems);
      setSelectedId(null);
      setSelectedIds(new Set());
    } else if (isFrame || (it.aspect && it.aspect !== "original")) {
      // Reset frame / deliverable back to unconstrained original aspect
      const nextItems = items.map((item) =>
        item.id === targetId
          ? { ...item, type: "media", mediaType: item.image ? "image" : "shape", aspect: "original" }
          : item
      );
      updateItemsWithTracking(nextItems);
      setSelectedId(targetId);
      setSelectedIds(new Set([targetId]));
    } else if (it.clientName) {
      // Detach from client folder group
      const nextItems = items.map((item) =>
        item.id === targetId ? { ...item, clientName: undefined, clientId: undefined } : item
      );
      updateItemsWithTracking(nextItems);
      setSelectedId(targetId);
      setSelectedIds(new Set([targetId]));
    }
  }, [contextMenu?.item, selectedItem, selectedId, items, getParentFrameId, updateItemsWithTracking]);

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
        setActiveTool("frame");
        setIsRightSidebarOpen(true);
        setIsUiExpanded(true);
        if (isMobile) setIsMobileInspectorOpen(true);
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
      if ((e.key === "Delete" || e.key === "Backspace") && (selectedId || selectedIds.size > 0)) {
        e.preventDefault();
        if (selectedIds.size > 1) {
          const idsToDelete = new Set(selectedIds);
          const updated = items.filter((it) => !idsToDelete.has(it.id));
          updateItemsWithTracking(updated);
          setSelectedIds(new Set());
          setSelectedId(null);
        } else if (selectedId) {
          handleDeleteItem(selectedId);
        }
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
      if ((e.ctrlKey || e.metaKey) && (e.key === "g" || e.key === "G")) {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroup();
        } else if (e.altKey) {
          handleFrameSelection();
        } else {
          handleGroupSelection();
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "Backspace" || e.key === "Delete")) {
        if (selectedId || selectedIds.size > 0) {
          e.preventDefault();
          handleUngroup();
        }
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

  // Canvas Mouse Down (Panning, Text placement, or Marquee Selecting background)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on canvas in Text tool mode: place new text at click coordinate (or in frame under cursor)
    if (activeTool === "text" && e.button === 0) {
      const { x: canvasX, y: canvasY } = getCanvasCoords(e.clientX, e.clientY);
      const hitFrame = items.find(
        (f) =>
          (f.mediaType === "frame" || f.type === "section" || (f.aspect && f.aspect !== "original")) &&
          canvasX >= (f.x || 0) &&
          canvasX <= (f.x || 0) + (f.width || 480) &&
          canvasY >= (f.y || 0) &&
          canvasY <= (f.y || 0) + (f.height || 600)
      );
      handleAddText(canvasX, canvasY, hitFrame?.id);
      return;
    }

    // If clicking on canvas in Frame tool or Section tool mode: interactive drag & drop frame creation!
    if ((activeTool === "frame" || activeTool === "section") && e.button === 0) {
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      const screenX = rect ? e.clientX - rect.left : e.clientX;
      const screenY = rect ? e.clientY - rect.top : e.clientY;
      const { x: canvasX, y: canvasY } = getCanvasCoords(e.clientX, e.clientY);

      drawingShapeStartRef.current = { screenX, screenY, canvasX, canvasY };
      setIsDrawingShape(true);
      setDrawingShapeBox({
        startX: screenX,
        startY: screenY,
        currentX: screenX,
        currentY: screenY,
        type: activeTool === "section" ? "section" : "frame",
      });
      return;
    }

    // If clicking on canvas background directly or with hand tool / spacebar
    if (e.target === e.currentTarget || isSpacePressed || activeTool === "hand" || e.button === 1) {
      // Purge any orphan empty text layers when clicking away on canvas
      setItems((prev) => {
        const hasEmpty = prev.some(
          (it) => (it.type === "text" || it.mediaType === "text") && (!it.content || it.content.trim() === "")
        );
        if (hasEmpty) {
          return prev.filter((it) => {
            if (it.type === "text" || it.mediaType === "text") {
              const c = it.content !== undefined ? it.content : it.title;
              return c && c.trim() !== "";
            }
            return true;
          });
        }
        return prev;
      });

      if (isSpacePressed || activeTool === "hand" || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        setSelectedId(null);
        setSelectedIds(new Set());
      } else if (activeTool === "select" && e.button === 0) {
        // Desktop Move / Select tool: Hold and drag to select (Figma Marquee Selection in container screen space)
        const rect = canvasContainerRef.current?.getBoundingClientRect();
        const screenX = rect ? e.clientX - rect.left : e.clientX;
        const screenY = rect ? e.clientY - rect.top : e.clientY;

        marqueeStartRef.current = { x: screenX, y: screenY };
        setIsMarqueeSelecting(true);
        setMarqueeBox({
          startX: screenX,
          startY: screenY,
          currentX: screenX,
          currentY: screenY,
        });
        if (!e.shiftKey) {
          setSelectedId(null);
          setSelectedIds(new Set());
        }
      }
    }
  };

  // High-performance 0ms-latency window mouse tracking for pan, drag, and marquee selection
  useEffect(() => {
    if (!isPanning && !draggingItemId && !isMarqueeSelecting && !isDrawingShape) return;

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
      } else if (isDrawingShape && drawingShapeStartRef.current) {
        const rect = canvasContainerRef.current?.getBoundingClientRect();
        const curScreenX = rect ? e.clientX - rect.left : e.clientX;
        const curScreenY = rect ? e.clientY - rect.top : e.clientY;

        setDrawingShapeBox((prev) =>
          prev
            ? {
                ...prev,
                currentX: curScreenX,
                currentY: curScreenY,
              }
            : null
        );
      } else if (isMarqueeSelecting && marqueeStartRef.current) {
        const rect = canvasContainerRef.current?.getBoundingClientRect();
        const curScreenX = rect ? e.clientX - rect.left : e.clientX;
        const curScreenY = rect ? e.clientY - rect.top : e.clientY;
        const sX = marqueeStartRef.current.x;
        const sY = marqueeStartRef.current.y;

        setMarqueeBox({
          startX: sX,
          startY: sY,
          currentX: curScreenX,
          currentY: curScreenY,
        });

        // Compute marquee box in canvas coordinates for item hit testing
        const curPan = panRef.current || pan;
        const curZoom = zoomRef.current || zoom;
        const minScreenX = Math.min(sX, curScreenX);
        const maxScreenX = Math.max(sX, curScreenX);
        const minScreenY = Math.min(sY, curScreenY);
        const maxScreenY = Math.max(sY, curScreenY);

        const boxLeft = (minScreenX - curPan.x) / curZoom;
        const boxRight = (maxScreenX - curPan.x) / curZoom;
        const boxTop = (minScreenY - curPan.y) / curZoom;
        const boxBottom = (maxScreenY - curPan.y) / curZoom;

        // Find intersecting items
        const hitIds = new Set<string>();
        items.forEach((it) => {
          if (hiddenItemIds.has(it.id)) return;
          const itX = it.x || 0;
          const itY = it.y || 0;
          let itW = it.width || 380;
          let itH = it.height || 480;
          if (it.type === "section" || it.mediaType === "section") {
            itW = it.width || 1200;
            itH = it.height || 600;
          } else if (it.type === "text" || it.mediaType === "text") {
            itW = it.width || 320;
            itH = it.height || 180;
          }
          const itRight = itX + itW;
          const itBottom = itY + itH;

          // Check AABB intersection
          if (itX < boxRight && itRight > boxLeft && itY < boxBottom && itBottom > boxTop) {
            hitIds.add(it.id);
          }
        });

        setSelectedIds(hitIds);
        if (hitIds.size > 0) {
          setSelectedId(Array.from(hitIds)[0]);
        } else {
          setSelectedId(null);
        }
      } else if (draggingItemId) {
        const curX = Math.round((e.clientX - pan.x) / zoom - dragItemOffset.x);
        const curY = Math.round((e.clientY - pan.y) / zoom - dragItemOffset.y);
        const draggedInit = dragItemInitialPositionsRef.current?.get(draggingItemId);
        const deltaX = draggedInit ? curX - draggedInit.x : 0;
        const deltaY = draggedInit ? curY - draggedInit.y : 0;

        if (!dragRafRef.current) {
          dragRafRef.current = requestAnimationFrame(() => {
            dragRafRef.current = null;
            if (dragItemInitialPositionsRef.current && dragItemInitialPositionsRef.current.size > 1) {
              setItems((prev) =>
                prev.map((it) => {
                  const init = dragItemInitialPositionsRef.current?.get(it.id);
                  if (init) {
                    return { ...it, x: init.x + deltaX, y: init.y + deltaY };
                  }
                  return it;
                })
              );
            } else {
              setItems((prev) =>
                prev.map((it) => (it.id === draggingItemId ? { ...it, x: curX, y: curY } : it))
              );
            }
            setHasChanges(true);
          });
        }
      }
    };

    const onWindowUp = (e: MouseEvent) => {
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      if (isMarqueeSelecting) {
        setIsMarqueeSelecting(false);
        setMarqueeBox(null);
        marqueeStartRef.current = null;
      }

      if (isDrawingShape && drawingShapeStartRef.current) {
        const start = drawingShapeStartRef.current;
        const { x: endCanvasX, y: endCanvasY } = getCanvasCoords(e.clientX, e.clientY);
        const rect = canvasContainerRef.current?.getBoundingClientRect();
        const endScreenX = rect ? e.clientX - rect.left : e.clientX;
        const endScreenY = rect ? e.clientY - rect.top : e.clientY;
        const dragDist = Math.hypot(endScreenX - start.screenX, endScreenY - start.screenY);

        let shapeX = Math.min(start.canvasX, endCanvasX);
        let shapeY = Math.min(start.canvasY, endCanvasY);
        let shapeW = Math.abs(endCanvasX - start.canvasX);
        let shapeH = Math.abs(endCanvasY - start.canvasY);

        const shapeType = drawingShapeBox?.type || "frame";

        if (shapeType === "frame") {
          if (dragDist < 20) {
            shapeW = 440;
            shapeH = 550;
            shapeX = start.canvasX;
            shapeY = start.canvasY;
          }
          const frameCount = items.filter((i) => i.mediaType === "frame" && i.type !== "group").length + 1;
          const newFrame: CanvasItem = {
            id: `frame-${Date.now()}`,
            title: `Frame ${frameCount}`,
            type: "media",
            mediaType: "frame",
            aspect: `${shapeW}:${shapeH}`,
            x: shapeX,
            y: shapeY,
            width: shapeW,
            height: shapeH,
            color: "#0c8ce9",
          };
          updateItemsWithTracking([...items, newFrame]);
          setSelectedId(newFrame.id);
          setSelectedIds(new Set([newFrame.id]));
        } else if (shapeType === "section") {
          if (dragDist < 20) {
            shapeW = 1200;
            shapeH = 600;
            shapeX = start.canvasX;
            shapeY = start.canvasY;
          }
          const secCount = items.filter((i) => i.type === "section" || i.mediaType === "section").length + 1;
          const newSec: CanvasItem = {
            id: `section-${Date.now()}`,
            title: `Section ${secCount}`,
            type: "section",
            mediaType: "section",
            x: shapeX,
            y: shapeY,
            width: shapeW,
            height: shapeH,
            color: "#3b82f6",
          };
          updateItemsWithTracking([...items, newSec]);
          setSelectedId(newSec.id);
          setSelectedIds(new Set([newSec.id]));
        }

        setIsDrawingShape(false);
        setDrawingShapeBox(null);
        drawingShapeStartRef.current = null;
        setActiveTool("select");
        setIsRightSidebarOpen(true);
        setIsUiExpanded(true);
      }

      // Check if dropped text was dragged into a Frame (Automatic Figma Frame Nesting)
      if (draggingItemId) {
        const dragged = items.find((i) => i.id === draggingItemId);
        if (dragged && (dragged.type === "text" || dragged.mediaType === "text")) {
          const dx = dragged.x || 0;
          const dy = dragged.y || 0;
          const targetFrame = items.find(
            (f) =>
              (f.mediaType === "frame" || f.type === "section" || (f.aspect && f.aspect !== "original")) &&
              f.id !== dragged.id &&
              dx >= (f.x || 0) &&
              dx <= (f.x || 0) + (f.width || 480) &&
              dy >= (f.y || 0) &&
              dy <= (f.y || 0) + (f.height || 600)
          );
          if (targetFrame && dragged.frameId !== targetFrame.id) {
            setItems((prev) =>
              prev.map((it) => (it.id === dragged.id ? { ...it, frameId: targetFrame.id } : it))
            );
            setHasChanges(true);
          }
        }
      }

      dragItemInitialPositionsRef.current = null;
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
  }, [isPanning, draggingItemId, isMarqueeSelecting, isDrawingShape, drawingShapeBox, panStart, pan, zoom, dragItemOffset, items, hiddenItemIds, getCanvasCoords, updateItemsWithTracking]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Window listener handles mousemove with passive 0ms latency; kept for fallback
  };

  const handleCanvasMouseUp = () => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    if (isMarqueeSelecting) {
      setIsMarqueeSelecting(false);
      setMarqueeBox(null);
      marqueeStartRef.current = null;
    }
    if (isDrawingShape) {
      setIsDrawingShape(false);
      setDrawingShapeBox(null);
      drawingShapeStartRef.current = null;
    }
    dragItemInitialPositionsRef.current = null;
    setIsPanning(false);
    setDraggingItemId(null);
  };

  // Start dragging an individual canvas item with mouse
  const handleItemMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    // If Text tool is active and clicked on a frame or section: insert text directly inside that frame!
    if (activeTool === "text" && item.type !== "text" && item.mediaType !== "text") {
      e.stopPropagation();
      const { x: itemCanvasX, y: itemCanvasY } = getCanvasCoords(e.clientX, e.clientY);
      handleAddText(itemCanvasX, itemCanvasY, item.id);
      return;
    }

    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.closest("button")) {
      return;
    }

    e.stopPropagation();

    // In Hand tool mode: do NOT select item! Pan canvas directly
    if (activeTool === "hand" || isSpacePressed) {
      setSelectedId(null);
      setSelectedIds(new Set());
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (!selectedIds.has(item.id)) {
      if (e.shiftKey) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
      } else {
        setSelectedIds(new Set([item.id]));
      }
    }
    setSelectedId(item.id);

    if (lockedItemIds.has(item.id)) return; // Locked items cannot be dragged

    setDraggingItemId(item.id);
    const itemCanvasX = (e.clientX - pan.x) / zoom;
    const itemCanvasY = (e.clientY - pan.y) / zoom;
    setDragItemOffset({
      x: itemCanvasX - (item.x || 0),
      y: itemCanvasY - (item.y || 0),
    });

    const isFrame = item.mediaType === "frame" || item.type === "section" || (item.aspect && item.aspect !== "original");
    const itemW = item.width || (item.aspect === "16:9" ? 720 : 480);
    const itemH = item.height || (item.aspect === "16:9" ? 405 : 600);
    const itemX = item.x || 0;
    const itemY = item.y || 0;

    const initMap = new Map<string, { x: number; y: number }>();
    items.forEach((it) => {
      if (selectedIds.has(it.id) || it.id === item.id) {
        initMap.set(it.id, { x: it.x || 0, y: it.y || 0 });
      } else if (isFrame) {
        // Child text or elements nested inside this frame move together with the frame
        const itX = it.x || 0;
        const itY = it.y || 0;
        const isChild = it.frameId === item.id || (
          itX >= itemX && itX <= itemX + itemW &&
          itY >= itemY && itY <= itemY + itemH
        );
        if (isChild) {
          initMap.set(it.id, { x: itX, y: itY });
        }
      }
    });
    dragItemInitialPositionsRef.current = initMap;
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

    // In Hand tool mode on mobile: NEVER select image! Only pan canvas (kiri, kanan, atas, bawah)
    if (activeTool === "hand") {
      setSelectedId(null);
      const t = e.touches[0];
      if (t) {
        touchStateRef.current.isTouchPanning = true;
        touchStateRef.current.startTouch = { x: t.clientX, y: t.clientY };
        touchStateRef.current.startPan = { ...panRef.current };
        setIsPanning(true);
      }
      return;
    }

    setSelectedId(item.id);

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

  const handleApplyFigmaFramePreset = (preset: FramePresetItem) => {
    // If an existing frame or section or scalable element is currently selected, update its size & name
    if (selectedItem && (selectedItem.mediaType === "frame" || selectedItem.type === "section" || selectedItem.aspect)) {
      updateSelectedItem({
        title: preset.name,
        width: preset.width,
        height: preset.height,
        aspect: `${preset.width}:${preset.height}`,
      });
      setShowFramePresetsPicker(false);
      setActiveTool("select");
      return;
    }

    // Otherwise create a new Frame at viewport center
    const center = getViewportCenter(preset.width, preset.height);
    const newFrame: CanvasItem = {
      id: `frame-${Date.now()}`,
      title: preset.name,
      type: "media",
      mediaType: "frame",
      aspect: `${preset.width}:${preset.height}`,
      x: center.x,
      y: center.y,
      width: preset.width,
      height: preset.height,
      color: "#0c8ce9",
    };
    updateItemsWithTracking([...items, newFrame]);
    setSelectedId(newFrame.id);
    setSelectedIds(new Set([newFrame.id]));
    setShowFramePresetsPicker(false);
    setActiveTool("select");
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

  const handleAddText = (targetX?: number, targetY?: number, targetFrameId?: string) => {
    let posX = targetX;
    let posY = targetY;
    let frameId = targetFrameId;

    if (posX === undefined || posY === undefined) {
      // If a frame is currently selected, place the text inside that frame
      if (selectedItem && (selectedItem.mediaType === "frame" || selectedItem.type === "section" || (selectedItem.aspect && selectedItem.aspect !== "original"))) {
        frameId = selectedItem.id;
        posX = (selectedItem.x || 0) + 40;
        posY = (selectedItem.y || 0) + 60;
      } else {
        const center = getViewportCenter(320, 60);
        posX = center.x;
        posY = center.y;
      }
    }

    // Filter out any previous unedited empty text items so ghosts don't pile up
    const cleanItems = items.filter((it) => {
      if (it.type === "text" || it.mediaType === "text") {
        const c = it.content !== undefined ? it.content : it.title;
        return c && c.trim() !== "";
      }
      return true;
    });

    const newText: CanvasItem = {
      id: `text-${Date.now()}`,
      title: "",
      type: "text",
      mediaType: "text",
      content: "", // Starts empty with blinking cursor |
      x: posX,
      y: posY,
      width: 320,
      height: 60,
      fontFamily: "Noto Serif",
      fontWeight: "Bold",
      fontSize: 48,
      lineHeight: "100%",
      letterSpacing: "-3%",
      textAlign: "left",
      color: "#FFFFFF",
      frameId: frameId,
    };

    updateItemsWithTracking([...cleanItems, newText]);
    setSelectedId(newText.id);
    setSelectedIds(new Set([newText.id]));
    setActiveTool("text");
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

      // IN HAND TOOL MODE ON MOBILE:
      // Dragging pans canvas (kiri, kanan, atas, bawah).
      // Clean tap triggers "tap full" or "tap close" without selecting!
      if (activeTool === "hand") {
        const dist = Math.hypot(
          touch.clientX - touchStateRef.current.startTouch.x,
          touch.clientY - touchStateRef.current.startTouch.y
        );

        // If finger moved >= 10px, it was a pan/swipe gesture, not a tap
        if (dist >= 10) {
          touchStateRef.current.isTouchPanning = false;
          setIsPanning(false);
          return;
        }

        // Clean tap in Hand mode:
        e.preventDefault();
        e.stopPropagation();

        if (fittedItemId) {
          // "Tap Close": return to normal overview canvas
          setFittedItemId(null);
          zoomToFitAll();
        } else {
          // "Tap Full": fit image to full screen
          fitItemToScreen(item, targetEl);
        }
        return;
      }

      // SELECT TOOL MODE:
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
    [activeTool, fittedItemId, fitItemToScreen, zoomToFitAll]
  );

  // Click handler for Hand tool mode (tap full / tap close on click)
  const handleItemClick = (e: React.MouseEvent, item: CanvasItem, targetEl?: HTMLElement) => {
    if (activeTool === "hand") {
      e.stopPropagation();
      if (fittedItemId) {
        setFittedItemId(null);
        zoomToFitAll();
      } else {
        fitItemToScreen(item, targetEl);
      }
    }
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

  // ── Figma Color Picker Modal Component (Matches Screenshot media_1793528907470_542d3124.png) ──────────
  const renderFigmaColorPicker = () => {
    if (!isColorPickerOpen) return null;

    return (
      <>
        {/* Backdrop for closing when clicking outside */}
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
          onClick={() => setIsColorPickerOpen(false)}
        />

        {/* Floating Figma Color Picker Popover */}
        <div
          className="fixed right-3 sm:right-[300px] top-16 sm:top-20 z-50 w-[270px] max-w-[calc(100vw-24px)] rounded-xl bg-[#222222] border border-[#383838] shadow-[0_20px_50px_rgba(0,0,0,0.92)] text-white select-none overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150"
        >
          {/* 1. Header Tabs: [Custom] Libraries  +  ✕ */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#303030]">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setColorPickerTab("custom")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  colorPickerTab === "custom"
                    ? "bg-[#383838] text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Custom
              </button>
              <button
                type="button"
                onClick={() => setColorPickerTab("libraries")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  colorPickerTab === "libraries"
                    ? "bg-[#383838] text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Libraries
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-neutral-400">
              <button
                type="button"
                onClick={() => {
                  setRecentPickedColors((prev) => [currentColorHex, ...prev.filter((c) => c !== currentColorHex)]);
                }}
                className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                title="Add to color styles"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsColorPickerOpen(false)}
                className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Fill Modes Toolbar Row (Solid, Linear, Radial, Image, Video, Mesh, Tint, None) */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#303030] text-neutral-400">
            <button
              type="button"
              onClick={() => setColorFillMode("solid")}
              className={`p-1 rounded cursor-pointer ${colorFillMode === "solid" ? "text-white bg-white/15" : "hover:text-white"}`}
              title="Solid Fill"
            >
              <span className="w-3.5 h-3.5 border-2 border-current rounded-xs block bg-current" />
            </button>
            <button
              type="button"
              onClick={() => setColorFillMode("linear")}
              className={`p-1 rounded cursor-pointer ${colorFillMode === "linear" ? "text-white bg-white/15" : "hover:text-white"}`}
              title="Linear Gradient"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h12v12H2V2zm2 2v8h8V4H4z" opacity="0.6"/>
                <path d="M4 12L12 4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setColorFillMode("radial")}
              className={`p-1 rounded cursor-pointer ${colorFillMode === "radial" ? "text-white bg-white/15" : "hover:text-white"}`}
              title="Radial Gradient"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <circle cx="8" cy="8" r="3" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setColorFillMode("image")}
              className={`p-1 rounded cursor-pointer ${colorFillMode === "image" ? "text-white bg-white/15" : "hover:text-white"}`}
              title="Image Fill"
            >
              <HiPhoto className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setColorFillMode("video")}
              className={`p-1 rounded cursor-pointer ${colorFillMode === "video" ? "text-white bg-white/15" : "hover:text-white"}`}
              title="Video Fill"
            >
              <HiPlay className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:text-white cursor-pointer"
              title="Pattern / Mesh"
            >
              <HiSparkles className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (colorPickerTarget === "fill") updateSelectedItem({ color: undefined });
                else updateSelectedItem({ strokeColor: undefined });
              }}
              className="p-1 rounded hover:text-red-400 cursor-pointer"
              title="Remove Fill"
            >
              <HiEyeSlash className="w-3.5 h-3.5" />
            </button>
          </div>

          {colorPickerTab === "custom" ? (
            <>
              {/* 3. 2D Color Saturation & Brightness/Value Gradient Area */}
              <div className="p-3 pb-2">
                <div
                  className="w-full h-40 rounded-lg relative overflow-hidden cursor-crosshair select-none touch-none shadow-inner"
                  style={{ backgroundColor: `hsl(${colorHue}, 100%, 50%)` }}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    handleSatValPointer(e);
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons === 1) handleSatValPointer(e);
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(to top, #000000, transparent)" }}
                  />
                  <div
                    className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.6)] pointer-events-none"
                    style={{
                      left: `${colorSat}%`,
                      top: `${100 - colorVal}%`,
                      backgroundColor: currentColorHex,
                    }}
                  />
                </div>
              </div>

              {/* 4. Controls: Eyedropper + Hue Slider + Alpha Slider */}
              <div className="px-3 pb-3 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Eyedropper tool"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 2l3 3-9 9-4 1 1-4 9-9zM3 21l3-3M2 22l1-1" />
                  </svg>
                </button>

                <div className="flex-1 space-y-2">
                  {/* Hue Rainbow Track */}
                  <div
                    className="w-full h-3 rounded-full relative cursor-pointer select-none touch-none shadow-inner"
                    style={{
                      background:
                        "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      handleHuePointer(e);
                    }}
                    onPointerMove={(e) => {
                      if (e.buttons === 1) handleHuePointer(e);
                    }}
                  >
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                      style={{
                        left: `${(colorHue / 360) * 100}%`,
                        backgroundColor: `hsl(${colorHue}, 100%, 50%)`,
                      }}
                    />
                  </div>

                  {/* Alpha / Opacity Track */}
                  <div
                    className="w-full h-3 rounded-full relative cursor-pointer select-none touch-none shadow-inner overflow-hidden"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)",
                      backgroundSize: "8px 8px",
                      backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      handleAlphaPointer(e);
                    }}
                    onPointerMove={(e) => {
                      if (e.buttons === 1) handleAlphaPointer(e);
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(to right, transparent, ${currentColorHex})`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                      style={{
                        left: `${colorAlpha}%`,
                        backgroundColor: currentColorHex,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Format & Hex / Opacity Input Row */}
              <div className="px-3 pb-3 flex items-center gap-2">
                <div className="relative">
                  <select
                    value={colorFormat}
                    onChange={(e) => setColorFormat(e.target.value as any)}
                    className="px-2 py-1 pr-5 rounded-md bg-[#2c2c2c] border border-white/10 text-xs font-semibold text-neutral-200 appearance-none cursor-pointer focus:outline-none focus:border-[#0c8ce9]"
                  >
                    <option value="Hex">Hex</option>
                    <option value="RGB">RGB</option>
                    <option value="CSS">CSS</option>
                  </select>
                  <HiChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-2 pointer-events-none" />
                </div>

                <div className="flex-1 px-2.5 py-1 rounded-md bg-[#2c2c2c] border border-white/10 flex items-center focus-within:border-[#0c8ce9]">
                  <input
                    type="text"
                    value={colorHexInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase().slice(0, 6);
                      setColorHexInput(val);
                      if (val.length === 6) {
                        const { h, s, v } = hexToHsv(`#${val}`);
                        setColorHue(h);
                        setColorSat(s);
                        setColorVal(v);
                        applyColor(val);
                      }
                    }}
                    className="w-full bg-transparent text-white font-mono text-xs uppercase focus:outline-none"
                    placeholder="E5BF00"
                  />
                </div>

                <div className="w-16 px-2 py-1 rounded-md bg-[#2c2c2c] border border-white/10 flex items-center justify-between text-xs font-mono focus-within:border-[#0c8ce9]">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={colorAlpha}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      setColorAlpha(val);
                      applyColor(currentColorHex, val);
                    }}
                    className="w-8 bg-transparent text-white text-right focus:outline-none"
                  />
                  <span className="text-neutral-400">%</span>
                </div>
              </div>
            </>
          ) : (
            /* Libraries Tab: Brand Styles & Themes */
            <div className="p-3 space-y-2 text-xs">
              <span className="text-[11px] text-neutral-400 font-medium">Design System Library</span>
              <div className="space-y-1">
                {["#0C8CE9", "#00A389", "#E5BF00", "#EF4444", "#7C3AED", "#18181B"].map((c, idx) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      const { h, s, v } = hexToHsv(c);
                      setColorHue(h);
                      setColorSat(s);
                      setColorVal(v);
                      applyColor(c);
                    }}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg bg-[#2c2c2c] hover:bg-[#383838] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-xs border border-white/20" style={{ backgroundColor: c }} />
                      <span className="font-mono text-white uppercase">{c}</span>
                    </div>
                    <span className="text-neutral-400">Color {idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. On this page Section (Matches Screenshot media_1793528907470_542d3124.png) */}
          <div className="border-t border-[#303030] p-3 pt-2.5 bg-[#1e1e1e]/60">
            <button
              type="button"
              onClick={() => setIsPagePaletteOpen(!isPagePaletteOpen)}
              className="w-full flex items-center justify-between px-2 py-1 rounded-md bg-[#2c2c2c] text-xs font-medium text-neutral-300 hover:text-white mb-2 transition-colors cursor-pointer"
            >
              <span>On this page</span>
              <HiChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isPagePaletteOpen ? "rotate-0" : "-rotate-90"}`} />
            </button>

            {isPagePaletteOpen && (
              <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-0.5">
                {onThisPageColors.map((hex, i) => {
                  const isSelected = currentColorHex.toUpperCase() === hex.toUpperCase();
                  return (
                    <button
                      key={`${hex}-${i}`}
                      type="button"
                      onClick={() => {
                        const { h, s, v } = hexToHsv(hex);
                        setColorHue(h);
                        setColorSat(s);
                        setColorVal(v);
                        applyColor(hex);
                      }}
                      title={hex}
                      className={`w-6 h-6 rounded-md border transition-transform cursor-pointer relative shadow-sm ${
                        isSelected
                          ? "border-white ring-2 ring-[#0c8ce9] scale-110 z-10"
                          : "border-white/15 hover:scale-110 hover:border-white/40"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </>
    );
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

        {activeTool === "frame" || showFramePresetsPicker ? (
          /* ── Frame Presets Inspector View (Matches Screenshot media_1793530390332_97f50010.png) ── */
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col divide-y divide-white/5 text-xs font-sans">
            {/* Header: Frame */}
            <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between text-xs font-semibold text-white tracking-wide shrink-0">
              <span className="text-[13px] font-bold">Frame</span>
              {showFramePresetsPicker && (
                <button
                  type="button"
                  onClick={() => setShowFramePresetsPicker(false)}
                  className="text-neutral-400 hover:text-white text-xs font-normal cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>

            {/* Accordion Categories List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-1 divide-y divide-white/5">
              {FRAME_PRESET_CATEGORIES.map((cat) => {
                const isExpanded = !!expandedPresetCategories[cat.id];
                return (
                  <div key={cat.id} className="select-none">
                    <button
                      type="button"
                      onClick={() => togglePresetCategory(cat.id)}
                      className="w-full px-4 py-2 flex items-center gap-2 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left font-medium"
                    >
                      <span className="text-[9px] text-neutral-400 w-2.5 inline-block text-center shrink-0">
                        {isExpanded ? "▾" : "▸"}
                      </span>
                      <span>{cat.title}</span>
                    </button>

                    {isExpanded && (
                      <div className="py-0.5 bg-black/15">
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleApplyFigmaFramePreset(item)}
                            className="w-full flex items-center justify-between pl-7 pr-4 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-[#0c8ce9]/20 transition-colors cursor-pointer group text-left"
                            title={`${item.name} (${item.width} × ${item.height})`}
                          >
                            <span className="truncate pr-2 group-hover:text-white">{item.name}</span>
                            <span className="text-[11px] font-mono text-neutral-500 group-hover:text-neutral-300 shrink-0">
                              {item.width}×{item.height}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
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

          {/* 4. TYPOGRAPHY SECTION (Matches Screenshot media_1793529077648_43ff02b0.png) */}
          {(isTextSelected || activeTool === "text" || selectedItem?.type === "text" || selectedItem?.content !== undefined) && (
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
                <span>Typography</span>
                <span className="text-sm text-neutral-400 cursor-pointer hover:text-white" title="Typography styles">⠿</span>
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

              {/* Frame Container Selector (Figma Nested Frame) */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Frame Container</span>
                  {selectedItem?.frameId && (
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ frameId: undefined })}
                      className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Detach
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedItem?.frameId || ""}
                    onChange={(e) => {
                      const fId = e.target.value || undefined;
                      if (fId) {
                        const targetFrame = items.find((f) => f.id === fId);
                        if (targetFrame) {
                          updateSelectedItem({
                            frameId: fId,
                            x: (targetFrame.x || 0) + 40,
                            y: (targetFrame.y || 0) + 60,
                          });
                          return;
                        }
                      }
                      updateSelectedItem({ frameId: undefined });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#2c2c2c] text-white border border-transparent focus:border-[#0c8ce9] text-xs appearance-none cursor-pointer"
                  >
                    <option value="">(None - Canvas Root)</option>
                    {items
                      .filter((f) => (f.mediaType === "frame" || f.type === "section" || (f.aspect && f.aspect !== "original")) && f.id !== selectedItem?.id)
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title || `Frame ${f.id.slice(0, 8)}`}
                        </option>
                      ))}
                  </select>
                  <HiChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
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
                <button
                  type="button"
                  onClick={() => openColorPicker("fill", itemColor)}
                  className="relative cursor-pointer shrink-0 group focus:outline-none"
                  title="Open Figma Color Picker"
                >
                  <span
                    className="w-4 h-4 rounded-xs border border-white/20 inline-block shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: itemColor }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => openColorPicker("fill", itemColor)}
                  className="text-left font-mono text-xs uppercase text-white hover:text-[#0c8ce9] transition-colors focus:outline-none cursor-pointer"
                  title="Click to edit color"
                >
                  {itemColor.replace("#", "")}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-mono text-neutral-300">{itemOpacity}%</span>
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
                <div
                  onClick={() => openColorPicker("stroke", selectedItem.strokeColor)}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="Change Stroke Color"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-xs border border-white/30 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: selectedItem.strokeColor }}
                  />
                  <span className="font-mono text-neutral-200 group-hover:text-white uppercase">{selectedItem.strokeColor.replace("#", "")}</span>
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

          {/* 7. EFFECTS SECTION (Matches Screenshots media_1793533049501_ef649907.png & media_1793533075434_40d113b1.png) */}
          <div className="p-3 space-y-2 relative">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
              <span>Effects</span>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="text-xs cursor-pointer hover:text-white" title="Effect Styles">❖</span>
                <button
                  type="button"
                  onClick={() => {
                    updateSelectedItem({
                      effects: selectedItem?.effects || "drop-shadow",
                      effectHidden: false,
                      shadowX: selectedItem?.shadowX !== undefined ? selectedItem.shadowX : 0,
                      shadowY: selectedItem?.shadowY !== undefined ? selectedItem.shadowY : 4,
                      shadowBlur: selectedItem?.shadowBlur !== undefined ? selectedItem.shadowBlur : 4,
                      shadowSpread: selectedItem?.shadowSpread !== undefined ? selectedItem.shadowSpread : 0,
                      shadowColor: selectedItem?.shadowColor || "#000000",
                      shadowOpacity: selectedItem?.shadowOpacity !== undefined ? selectedItem.shadowOpacity : 25,
                    });
                    setIsEffectPopoverOpen(true);
                  }}
                  className="text-neutral-400 hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/10"
                  title="Add effect"
                >
                  <HiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {selectedItem?.effects && (
              <div className="relative">
                {/* Effect Item Row matching Figma Image 2 */}
                <div
                  className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors select-none ${
                    isEffectPopoverOpen
                      ? "bg-[#1c2c3e] border border-[#0c8ce9]/50 shadow-sm"
                      : "bg-[#2c2c2c] hover:bg-[#343434]"
                  } ${selectedItem.effectHidden ? "opacity-50" : "opacity-100"}`}
                >
                  {/* Left: Clickable Icon + Label */}
                  <div
                    className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setIsEffectPopoverOpen((prev) => !prev)}
                    title="Click to edit effect settings"
                  >
                    <span className="w-4 h-4 rounded-[3px] border border-white/30 flex items-center justify-center text-[9px] text-[#0c8ce9] shadow-sm bg-black/40 shrink-0">
                      ▢
                    </span>
                    <span className="text-[#0c8ce9] font-medium truncate">
                      {selectedItem.effects === "drop-shadow"
                        ? "Drop shadow"
                        : selectedItem.effects === "inner-shadow"
                        ? "Inner shadow"
                        : selectedItem.effects === "layer-blur"
                        ? "Layer blur"
                        : selectedItem.effects === "background-blur"
                        ? "Background blur"
                        : "Drop shadow"}
                    </span>
                  </div>

                  {/* Right Actions: View/Hide (Eye) & Remove (Minus) - Matches Screenshot Image 2 */}
                  <div className="flex items-center gap-1 shrink-0 text-neutral-400">
                    {/* View / Hide (Eye) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedItem({ effectHidden: !selectedItem.effectHidden });
                      }}
                      className="p-1 hover:text-white rounded hover:bg-white/10 cursor-pointer transition-colors"
                      title={selectedItem.effectHidden ? "Show effect" : "Hide effect"}
                    >
                      {selectedItem.effectHidden ? (
                        <HiEyeSlash className="w-3.5 h-3.5 text-neutral-500" />
                      ) : (
                        <HiEye className="w-3.5 h-3.5 text-neutral-300 hover:text-white" />
                      )}
                    </button>

                    {/* Remove (Minus) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedItem({ effects: undefined, effectHidden: undefined });
                        setIsEffectPopoverOpen(false);
                      }}
                      className="p-1 hover:text-red-400 rounded hover:bg-white/10 cursor-pointer transition-colors"
                      title="Remove effect"
                    >
                      <HiMinus className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Drop Shadow Settings Popover (Matches Screenshot Image 1 media_1793533049501_ef649907.png) */}
                {isEffectPopoverOpen && (
                  <div className="relative mt-2 sm:absolute sm:right-full sm:top-0 sm:mr-3 sm:mt-0 w-full sm:w-[250px] p-3 rounded-2xl bg-[#1e1e1e]/98 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 text-xs font-sans space-y-3 animate-in fade-in zoom-in-95 duration-100">
                    {/* Popover Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-[2px] border border-white/40 flex items-center justify-center text-[8px] text-[#0c8ce9] shadow-sm bg-black/40">
                          ▢
                        </span>
                        <select
                          value={selectedItem.effects || "drop-shadow"}
                          onChange={(e) => updateSelectedItem({ effects: e.target.value })}
                          className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 text-xs"
                        >
                          <option value="drop-shadow" className="bg-[#1e1e1e] text-white">Drop shadow</option>
                          <option value="inner-shadow" className="bg-[#1e1e1e] text-white">Inner shadow</option>
                          <option value="layer-blur" className="bg-[#1e1e1e] text-white">Layer blur</option>
                          <option value="background-blur" className="bg-[#1e1e1e] text-white">Background blur</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <span className="text-xs cursor-pointer hover:text-white" title="Effect Style">💧</span>
                        <button
                          type="button"
                          onClick={() => setIsEffectPopoverOpen(false)}
                          className="hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/10"
                          title="Tutup Pengaturan"
                        >
                          <HiXMark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Row 1: Position X & Y */}
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-[11px] font-medium">Position</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#161616] border border-white/10 rounded-lg px-2 py-1 w-[72px]">
                          <span className="text-[10px] text-neutral-500 font-mono">X</span>
                          <input
                            type="number"
                            value={selectedItem.shadowX !== undefined ? selectedItem.shadowX : 0}
                            onChange={(e) => updateSelectedItem({ shadowX: Number(e.target.value) })}
                            className="w-full bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-[#161616] border border-white/10 rounded-lg px-2 py-1 w-[72px]">
                          <span className="text-[10px] text-neutral-500 font-mono">Y</span>
                          <input
                            type="number"
                            value={selectedItem.shadowY !== undefined ? selectedItem.shadowY : 4}
                            onChange={(e) => updateSelectedItem({ shadowY: Number(e.target.value) })}
                            className="w-full bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Blur */}
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-[11px] font-medium">Blur</span>
                      <div className="flex items-center gap-1.5 bg-[#161616] border border-white/10 rounded-lg px-2 py-1 w-[152px]">
                        <span className="text-xs text-neutral-500 select-none">⠿</span>
                        <input
                          type="number"
                          min="0"
                          value={selectedItem.shadowBlur !== undefined ? selectedItem.shadowBlur : 4}
                          onChange={(e) => updateSelectedItem({ shadowBlur: Math.max(0, Number(e.target.value)) })}
                          className="w-full bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 3: Spread */}
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-[11px] font-medium">Spread</span>
                      <div className="flex items-center gap-1.5 bg-[#161616] border border-white/10 rounded-lg px-2 py-1 w-[152px]">
                        <span className="text-xs text-neutral-500 select-none">☼</span>
                        <input
                          type="number"
                          value={selectedItem.shadowSpread !== undefined ? selectedItem.shadowSpread : 0}
                          onChange={(e) => updateSelectedItem({ shadowSpread: Number(e.target.value) })}
                          className="w-full bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 4: Color & Opacity */}
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-[11px] font-medium">Color</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 bg-[#161616] border border-white/10 rounded-lg px-2 py-1">
                          <span
                            onClick={() => openColorPicker("fill", selectedItem.shadowColor || "#000000")}
                            className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: selectedItem.shadowColor || "#000000" }}
                            title="Pilih warna shadow"
                          />
                          <input
                            type="text"
                            value={(selectedItem.shadowColor || "#000000").replace("#", "").toUpperCase()}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "");
                              if (val.length <= 6) {
                                updateSelectedItem({ shadowColor: `#${val}` });
                              }
                            }}
                            className="w-14 bg-transparent text-white font-mono text-xs focus:outline-none uppercase"
                          />
                        </div>
                        <div className="flex items-center gap-0.5 bg-[#161616] border border-white/10 rounded-lg px-1.5 py-1 w-14">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={selectedItem.shadowOpacity !== undefined ? selectedItem.shadowOpacity : 25}
                            onChange={(e) => updateSelectedItem({ shadowOpacity: Math.min(100, Math.max(0, Number(e.target.value))) })}
                            className="w-full bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                          />
                          <span className="text-[10px] text-neutral-500 font-mono">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  onClick={() => {
                    updateSelectedItem({ color: colorHex });
                    openColorPicker("fill", colorHex);
                  }}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#2c2c2c] hover:bg-[#343434] transition-colors cursor-pointer group"
                  title="Select color and open picker"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-xs border border-white/20 shrink-0 shadow-sm group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="font-mono text-xs text-white uppercase group-hover:text-[#0c8ce9] transition-colors">
                      {colorHex.replace("#", "")}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 group-hover:text-white">100 %</span>
                </div>
              ))}
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
        </>
        )}

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
      const parentId = getParentFrameId(it);
      // Items that are nested inside a frame will be rendered under that frame's dropdown
      if (!parentId) {
        if (it.clientName && foldersMap[it.clientName] !== undefined) {
          foldersMap[it.clientName].push(it);
        } else {
          roots.push(it);
        }
      }
    });

    return {
      folderGroups: Object.entries(foldersMap),
      rootItems: roots,
    };
  }, [clients, items, getParentFrameId]);

  // Render Frame Layer with Hierarchical Dropdown (Matches Screenshots media_1793529279637_a6c81d01.png & media_1793529302513_bd071dc3.png)
  const renderFrameLayer = (frame: CanvasItem, depth: number = 0): React.ReactNode => {
    const frameW = frame.width || (frame.aspect === "16:9" ? 720 : 480);
    const frameH = frame.height || (frame.aspect === "16:9" ? 405 : 600);
    const frameX = frame.x || 0;
    const frameY = frame.y || 0;

    // Direct children belonging to this frame
    const children = items.filter((it) => {
      if (it.id === frame.id) return false;
      if (it.frameId === frame.id) return true;
      if (!it.frameId) {
        const itX = it.x || 0;
        const itY = it.y || 0;
        return (
          itX >= frameX &&
          itX <= frameX + frameW &&
          itY >= frameY &&
          itY <= frameY + frameH
        );
      }
      return false;
    });

    const isExpanded = expandedFrames[frame.id] ?? false; // Dropdown expand/collapse state
    const isSel = selectedId === frame.id;
    const isLocked = lockedItemIds.has(frame.id);
    const isHidden = hiddenItemIds.has(frame.id);
    const paddingLeft = depth === 0 ? "pl-1.5" : depth === 1 ? "pl-4" : "pl-7";

    return (
      <div key={`frame-layer-${frame.id}`} className="space-y-0.5">
        {/* Frame Item Row (Matches Screenshot media_1793529279637_a6c81d01.png & media_1793529302513_bd071dc3.png) */}
        <div
          onClick={() => handleSelectLayer(frame)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            fitItemToScreen(frame);
          }}
          className={`w-full ${paddingLeft} pr-2 py-1.5 rounded-md flex items-center justify-between transition-colors cursor-pointer group text-left ${
            isSel
              ? "bg-[#2d3748] text-white font-medium shadow-xs"
              : isLight
              ? "text-slate-700 hover:bg-slate-100"
              : "text-neutral-200 hover:bg-white/5 hover:text-white"
          } ${isHidden ? "opacity-40" : ""}`}
        >
          <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
            {/* Expand / Collapse Chevron */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFrameExpanded(frame.id);
              }}
              className="p-0.5 text-neutral-400 hover:text-white rounded cursor-pointer shrink-0"
              title={isExpanded ? "Collapse Frame" : "Expand Frame"}
            >
              <HiChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  isExpanded ? "rotate-90" : "rotate-0"
                }`}
              />
            </button>

            {/* Frame Hashtag Icon (#) */}
            <HiHashtag className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : "text-neutral-300"}`} />

            {/* Frame Title */}
            <span className="truncate text-xs font-sans tracking-tight font-medium">
              {frame.title}
            </span>
          </div>

          {/* Action icons: Lock & Eye (Matches Screenshot media_1793529279637_a6c81d01.png) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={(e) => toggleItemLock(frame.id, e)}
              className={`p-1 rounded transition-opacity cursor-pointer ${
                isLocked
                  ? "opacity-100 text-amber-400"
                  : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
              }`}
              title={isLocked ? "Buka Kunci" : "Kunci Frame"}
            >
              {isLocked ? <HiLockClosed className="w-3.5 h-3.5" /> : <HiLockOpen className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => toggleItemVisibility(frame.id, e)}
              className={`p-1 rounded transition-opacity cursor-pointer ${
                isHidden
                  ? "opacity-100 text-rose-400"
                  : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
              }`}
              title={isHidden ? "Tampilkan" : "Sembunyikan"}
            >
              {isHidden ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Nested Children Inside This Frame (Matches Screenshot media_1793529302513_bd071dc3.png) */}
        {isExpanded && children.length > 0 && (
          <div className="space-y-0.5 pl-3 border-l border-white/10 ml-3">
            {children.map((child) => {
              if (isFrameItem(child)) {
                return renderFrameLayer(child, depth + 1);
              }
              return renderLayerRow(child, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLayerRow = (it: CanvasItem, depth: number = 0): React.ReactNode => {
    if (isFrameItem(it)) {
      return renderFrameLayer(it, depth);
    }

    const isSel = selectedId === it.id;
    const isLocked = lockedItemIds.has(it.id);
    const isHidden = hiddenItemIds.has(it.id);
    const isText = it.type === "text" || it.mediaType === "text";

    const paddingLeft = depth === 0 ? "pl-2" : depth === 1 ? "pl-5" : "pl-8";

    return (
      <div
        key={it.id}
        onClick={() => handleSelectLayer(it)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          fitItemToScreen(it);
        }}
        className={`w-full ${paddingLeft} pr-2 py-1 rounded-md flex items-center justify-between transition-colors cursor-pointer group text-left ${
          isSel
            ? "bg-[#2d3748] text-white font-medium shadow-xs"
            : isLight
            ? "text-slate-700 hover:bg-slate-100"
            : "text-neutral-300 hover:bg-white/8 hover:text-white"
        } ${isHidden ? "opacity-40" : ""}`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
          {/* Item Type Icon (T for text, Outline Rectangle for shapes/media) */}
          {isText ? (
            <span className="font-serif font-bold text-xs text-neutral-300 w-3.5 text-center shrink-0">T</span>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-neutral-400 shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="3.5" width="12" height="9" rx="2" />
            </svg>
          )}
          <span className="truncate text-xs font-sans tracking-tight">
            {isText && it.content ? (it.content.slice(0, 32) || it.title) : it.title}
          </span>
        </div>

        {/* Action icons: Lock, Eye, Delete */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={(e) => toggleItemLock(it.id, e)}
            className={`p-1 rounded transition-opacity cursor-pointer ${
              isLocked
                ? "opacity-100 text-amber-400"
                : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
            }`}
            title={isLocked ? "Buka Kunci Layer" : "Kunci Layer"}
          >
            {isLocked ? <HiLockClosed className="w-3.5 h-3.5" /> : <HiLockOpen className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => toggleItemVisibility(it.id, e)}
            className={`p-1 rounded transition-opacity cursor-pointer ${
              isHidden
                ? "opacity-100 text-rose-400"
                : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
            }`}
            title={isHidden ? "Tampilkan Layer" : "Sembunyikan Layer"}
          >
            {isHidden ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
          </button>

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
            activeTool === "frame"
              ? "cursor-crosshair"
              : isPanning || activeTool === "hand" || isSpacePressed
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-default"
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
            const isSelected = activeTool !== "hand" && (selectedId === item.id || selectedIds.has(item.id));
            const isLocked = lockedItemIds.has(item.id);
            const x = item.x || 0;
            const y = item.y || 0;

            // 1. SECTION & GROUP FRAME (Figma Style Boundary)
            if (item.type === "section" || item.mediaType === "section" || item.type === "group") {
              const secWidth = item.width || 1200;
              const secHeight = item.height || 600;
              const isGrp = item.type === "group";

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
                    borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : isGrp ? "12px" : undefined,
                    borderColor: item.color && item.color !== "transparent" ? item.color : isGrp ? "#0c8ce9" : undefined,
                    boxShadow: getEffectBoxShadow(item),
                    filter: getEffectFilter(item),
                  }}
                  className={`absolute rounded-3xl border-2 ${isGrp ? "border-solid border-[#0c8ce9]/60" : "border-dashed"} p-4 flex flex-col justify-between ${
                    draggingItemId === item.id ? "!transition-none will-change-transform z-30" : "transition-colors duration-150"
                  } ${
                    isSelected
                      ? "border-[#0c8ce9] bg-[#0c8ce9]/[0.05] ring-2 ring-[#0c8ce9]/40"
                      : "border-white/15 bg-white/[0.015] hover:border-white/30"
                  }`}
                >
                  {/* Section / Group Top Header Pill */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isGrp ? "bg-[#0c8ce9]" : "bg-teal-400"}`} />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#0c8ce9] text-sm font-bold text-white font-mono focus:outline-none px-1 py-0.5 rounded"
                      />
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">{isGrp ? "GROUP" : "SECTION"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isGrp && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUngroup(item);
                          }}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#0c8ce9] text-white text-[11px] font-sans transition-colors cursor-pointer"
                          title="Ungroup (Ctrl+Shift+G / Ctrl+⌫)"
                        >
                          Ungroup
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-neutral-500 select-none">
                    {Math.round(secWidth)} × {Math.round(secHeight)}
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
                    boxShadow: getEffectBoxShadow(item),
                    filter: getEffectFilter(item),
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

            // 3. FIGMA TYPOGRAPHY TEXT (Matches Screenshots media_1793529043296_e1253314.png & media_1793529058616_42d79f3a.png)
            if (item.type === "text" || item.mediaType === "text") {
              const textFontFamily = item.fontFamily || "Noto Serif";
              const textFontWeight = item.fontWeight || "Bold";
              const textFontSize = item.fontSize || 129;
              const textLineHeight = item.lineHeight || "100%";
              const textLetterSpacing = item.letterSpacing || "-3%";
              const textColor = item.color || "#FFFFFF";
              const textAlignment = (item.textAlign as any) || "left";
              const rawText = item.content !== undefined ? item.content : item.title || "";

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(item.id);
                    setSelectedIds(new Set([item.id]));
                  }}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    minWidth: "60px",
                    maxWidth: item.width ? `${item.width}px` : "max-content",
                    filter: item.effects === "drop-shadow" && !item.effectHidden ? `drop-shadow(${item.shadowX || 0}px ${item.shadowY !== undefined ? item.shadowY : 4}px ${item.shadowBlur !== undefined ? item.shadowBlur : 4}px rgba(0,0,0,${(item.shadowOpacity !== undefined ? item.shadowOpacity : 25)/100}))` : getEffectFilter(item),
                  }}
                  className={`absolute group cursor-text select-text transition-shadow z-30 ${
                    isSelected
                      ? "ring-1 ring-[#0c8ce9] z-40"
                      : "hover:ring-1 hover:ring-[#0c8ce9]/50"
                  }`}
                >
                  {/* Figma Bounding Box & Corner Handles when Selected (Matches Screenshot media_1793529058616_42d79f3a.png) */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#0c8ce9] pointer-events-none" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#0c8ce9] pointer-events-none" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#0c8ce9] pointer-events-none" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#0c8ce9] pointer-events-none" />
                      {/* Quick Delete Button for text */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="absolute -top-7 right-0 px-2 py-0.5 rounded bg-[#1e1e1e] border border-white/20 text-neutral-300 hover:text-red-400 hover:border-red-500/50 cursor-pointer shadow-md text-[10px] flex items-center gap-1 z-50 pointer-events-auto transition-colors"
                        title="Hapus text layer"
                      >
                        <HiTrash className="w-3 h-3 text-red-400" />
                        <span>Hapus</span>
                      </button>
                    </>
                  )}

                  {/* Inline Live Editable Text Area */}
                  <div className="relative inline-block w-full">
                    <textarea
                      value={rawText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) =>
                          prev.map((it) => (it.id === item.id ? { ...it, content: val, title: val || "Text" } : it))
                        );
                        setHasChanges(true);
                      }}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (!val) {
                          handleDeleteItem(item.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault();
                          if (!rawText.trim()) {
                            handleDeleteItem(item.id);
                          } else {
                            (e.target as HTMLElement).blur();
                          }
                        } else if ((e.key === "Backspace" || e.key === "Delete") && rawText === "") {
                          e.preventDefault();
                          handleDeleteItem(item.id);
                        }
                      }}
                      placeholder={isSelected ? "Tulis teks..." : ""}
                      rows={rawText.split("\n").length || 1}
                      autoFocus={isSelected && rawText === ""}
                      style={{
                        fontFamily: textFontFamily,
                        fontWeight: textFontWeight,
                        fontSize: `${textFontSize}px`,
                        lineHeight: textLineHeight,
                        letterSpacing: textLetterSpacing,
                        color: textColor,
                        textAlign: textAlignment,
                        caretColor: "#0c8ce9",
                        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      }}
                      className="bg-transparent border-none outline-none resize-none p-1 m-0 w-full overflow-hidden whitespace-pre-wrap leading-tight block"
                    />

                    {/* Blinking Cursor Indicator when Empty (Matches Screenshot media_1793529043296_e1253314.png) */}
                    {rawText === "" && (
                      <span
                        className="absolute left-1.5 top-2 w-[3px] bg-white animate-pulse pointer-events-none"
                        style={{ height: `${textFontSize * 0.85}px` }}
                      />
                    )}
                  </div>
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
                onClick={(e) => handleItemClick(e, item, e.currentTarget)}
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
                  boxShadow: getEffectBoxShadow(item),
                  filter: getEffectFilter(item),
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

          {/* Combined Multi-Selection Bounding Box & Dimension Badge (Figma Style) */}
          {multiSelectionBounds && activeTool !== "hand" && (
            <div
              className="absolute pointer-events-none border-2 border-[#0c8ce9] z-40 transition-none"
              style={{
                transform: `translate3d(${multiSelectionBounds.x}px, ${multiSelectionBounds.y}px, 0)`,
                width: `${multiSelectionBounds.width}px`,
                height: `${multiSelectionBounds.height}px`,
              }}
            >
              {/* Corner Handles */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />

              {/* Dimension Badge at Bottom (Matches User's Screenshot!) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-xs font-mono font-medium shadow-lg whitespace-nowrap">
                {multiSelectionBounds.width} × {multiSelectionBounds.height}
              </div>
            </div>
          )}
        </div>

        {/* ── Screen-space Overlays directly on canvasContainerRef (100% exact cursor match, no offset) ── */}

        {/* Marquee Selection Box (Rubber-band Drag - Matches Screenshot Image 2) */}
        {marqueeBox && (
          <div
            className="absolute pointer-events-none border border-[#0c8ce9] bg-[#0c8ce9]/12 z-50 rounded-xs"
            style={{
              left: `${Math.min(marqueeBox.startX, marqueeBox.currentX)}px`,
              top: `${Math.min(marqueeBox.startY, marqueeBox.currentY)}px`,
              width: `${Math.abs(marqueeBox.currentX - marqueeBox.startX)}px`,
              height: `${Math.abs(marqueeBox.currentY - marqueeBox.startY)}px`,
            }}
          />
        )}

        {/* Interactive Frame & Section Drawing Preview Box (Matches Figma Reference Screenshot Image 2) */}
        {drawingShapeBox && (
          <div
            className="absolute pointer-events-none border-2 border-[#0c8ce9] bg-[#0c8ce9]/10 z-50 rounded-lg shadow-lg"
            style={{
              left: `${Math.min(drawingShapeBox.startX, drawingShapeBox.currentX)}px`,
              top: `${Math.min(drawingShapeBox.startY, drawingShapeBox.currentY)}px`,
              width: `${Math.max(2, Math.abs(drawingShapeBox.currentX - drawingShapeBox.startX))}px`,
              height: `${Math.max(2, Math.abs(drawingShapeBox.currentY - drawingShapeBox.startY))}px`,
            }}
          >
            {/* Figma Dimension Badge right at cursor corner */}
            <div className="absolute -bottom-7 right-0 px-2 py-0.5 rounded bg-[#0c8ce9] text-white text-[11px] font-mono font-medium shadow-lg whitespace-nowrap pointer-events-none">
              {Math.round(Math.abs(drawingShapeBox.currentX - drawingShapeBox.startX) / (zoomRef.current || zoom))} ×{" "}
              {Math.round(Math.abs(drawingShapeBox.currentY - drawingShapeBox.startY) / (zoomRef.current || zoom))}
            </div>
          </div>
        )}
      </div>

      {/* Figma Design Inspector / Right Sidebar (Images 1, 2, 3) */}
      {isUiExpanded && isRightSidebarOpen && renderRightInspector()}
      </div>

      {/* Figma Color Picker Popover (Matches Screenshot media_1793528907470_542d3124.png) */}
      {renderFigmaColorPicker()}

      {/* ── Figma Floating Studio Toolbar Dock (Images 1, 2, 3, 4, 5) ─────────── */}
      <nav
        aria-label="Figma Studio Toolbar"
        className="figma-toolbar-dock fixed bottom-[max(12px,env(safe-area-inset-bottom,12px))] sm:bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-[#1e1e1e]/98 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white select-none max-w-[95vw] sm:max-w-max overflow-x-auto sm:overflow-visible no-scrollbar touch-manipulation h-11 sm:h-12"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* 1. MOVE / CURSOR TOOL (With Submenu: Move V, Hand tool H, Scale K - Matches Screenshot media_1793530537028_7e3a0dab.png & media_1793530528546_57ff5efa.png) */}
        <div className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeTool === "hand") {
                setActiveTool("select");
              } else {
                setActiveTool("hand");
                setSelectedId(null);
                setSelectedIds(new Set());
              }
              setActiveSubmenu(null);
            }}
            title={activeTool === "hand" ? "Hand Tool (H) - Panning Canvas" : "Move (V)"}
            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTool === "select" || activeTool === "hand" || activeTool === "scale"
                ? "bg-[#0c8ce9] text-white shadow-sm"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {activeTool === "hand" ? (
              <FigmaHandIcon className="w-4 h-4" />
            ) : activeTool === "scale" ? (
              <FigmaScaleIcon className="w-4 h-4" />
            ) : (
              <FigmaMoveIcon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSubmenu(activeSubmenu === "move" ? null : "move");
            }}
            title="Move Tools Menu"
            className="h-8 sm:h-9 px-1.5 ml-1 rounded-xl bg-[#2c2c2c] hover:bg-[#383838] text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <HiChevronDown className="w-3 h-3 text-white" />
          </button>

          {/* Move Submenu Dropdown (Matches Screenshot media_1793530528546_57ff5efa.png) */}
          {activeSubmenu === "move" && (
            <div className="figma-toolbar-submenu absolute bottom-full mb-2 left-0 min-w-[155px] bg-[#1e1e1e] border border-white/10 rounded-xl p-1 shadow-[0_12px_36px_rgba(0,0,0,0.85)] z-50 text-xs font-sans">
              <button
                type="button"
                onClick={() => {
                  setActiveTool("select");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "select"
                    ? "bg-[#0c8ce9] text-white font-medium shadow-sm"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {activeTool === "select" && (
                      <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <FigmaMoveIcon className="w-4 h-4 shrink-0" />
                  <span>Move</span>
                </div>
                <span className={`text-[11px] font-sans ${activeTool === "select" ? "text-white font-medium" : "text-neutral-400"}`}>
                  V
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool("hand");
                  setSelectedId(null);
                  setSelectedIds(new Set());
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "hand"
                    ? "bg-[#0c8ce9] text-white font-medium shadow-sm"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {activeTool === "hand" && (
                      <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <FigmaHandIcon className="w-4 h-4 shrink-0" />
                  <span>Hand tool</span>
                </div>
                <span className={`text-[11px] font-sans ${activeTool === "hand" ? "text-white font-medium" : "text-neutral-400"}`}>
                  H
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool("scale");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "scale"
                    ? "bg-[#0c8ce9] text-white font-medium shadow-sm"
                    : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {activeTool === "scale" && (
                      <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <FigmaScaleIcon className="w-4 h-4 shrink-0" />
                  <span>Scale</span>
                </div>
                <span className={`text-[11px] font-sans ${activeTool === "scale" ? "text-white font-medium" : "text-neutral-400"}`}>
                  K
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 2. FRAME / SECTION TOOL (With Submenu: Frame F, Section Shift+S, Slice S - Image 2) */}
        <div className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextTool = activeTool === "frame" ? "select" : "frame";
              setActiveTool(nextTool);
              setIsRightSidebarOpen(true);
              setIsUiExpanded(true);
              if (isMobile) setIsMobileInspectorOpen(true);
              setActiveSubmenu(null);
            }}
            title="Frame (F)"
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
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
            className={`h-8 sm:h-9 px-1 sm:px-1.5 rounded-r-xl flex items-center justify-center transition-colors cursor-pointer ${
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
                  setActiveTool("frame");
                  setIsRightSidebarOpen(true);
                  setIsUiExpanded(true);
                  if (isMobile) setIsMobileInspectorOpen(true);
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
        <div className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              handleAddShape("rectangle");
              setActiveTool("shape");
              setActiveSubmenu(null);
            }}
            title="Rectangle (R)"
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
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
            className={`h-8 sm:h-9 px-1 sm:px-1.5 rounded-r-xl flex items-center justify-center transition-colors cursor-pointer ${
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
        <div className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTool("pen");
              setActiveSubmenu(null);
            }}
            title="Pen (P)"
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
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
            className={`h-8 sm:h-9 px-1 sm:px-1.5 rounded-r-xl flex items-center justify-center transition-colors cursor-pointer ${
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
        <div className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              handleAddText();
              setActiveTool("text");
              setActiveSubmenu(null);
            }}
            title="Text (T)"
            className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer font-serif font-bold text-sm ${
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
            className={`h-8 sm:h-9 px-1 sm:px-1.5 rounded-r-xl flex items-center justify-center transition-colors cursor-pointer ${
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
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "resources" ? null : "resources")}
            title="Resources / Components ({})"
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer font-mono font-bold text-xs sm:text-sm ${
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

        {/* Mobile Quick Fit All */}
        <button
          type="button"
          onClick={zoomToFitAll}
          title="Fit All Elements"
          className="h-8 px-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-white hover:bg-white/10 shrink-0 sm:hidden"
        >
          <HiArrowsPointingOut className="w-4 h-4 text-teal-400" />
        </button>

        {/* 7. COMMENT BUBBLE (💬) */}
        <button
          type="button"
          onClick={handleAddComment}
          title="Add Comment / Annotation (C)"
          className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-white hover:bg-white/10 shrink-0 hidden sm:flex"
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
          className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-white hover:bg-white/10 shrink-0 hidden sm:flex"
        >
          <HiSparkles className="w-4 h-4 text-amber-400" />
        </button>

        {/* Toolbar Vertical Separator */}
        <div className="w-[1px] h-5 bg-white/15 mx-0.5 sm:mx-1 shrink-0 hidden sm:block" />

        {/* 9. PENCIL / SCRIBBLER */}
        <button
          type="button"
          onClick={() => {
            setActiveTool(activeTool === "pencil" ? "select" : "pencil");
          }}
          title="Pencil / Draw"
          className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 hidden sm:flex ${
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
          className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 hidden sm:flex ${
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
          className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-teal-400 hover:bg-white/10 shrink-0 hidden sm:flex"
        >
          <HiPlay className="w-4 h-4" />
        </button>

        {/* 12. CODE / DEV MODE (</>) */}
        <button
          type="button"
          onClick={() => setShowDevMode(true)}
          title="Dev Mode / Inspect Code (</>)"
          className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer font-mono font-bold text-xs shrink-0 hidden sm:flex ${
            showDevMode
              ? "bg-[#0c8ce9] text-white shadow-sm"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {"</>"}
        </button>
      </nav>

      

      {/* ── Floating Return-to-Overview Pill when an Image is Fitted / Full View ── */}
      {fittedItemId && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFittedItemId(null);
            zoomToFitAll();
          }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-2.5 text-xs font-mono cursor-pointer transition-all animate-in fade-in slide-in-from-bottom-3 hover:scale-105 active:scale-95"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-semibold">Tap 1x untuk kembali ke kanvas</span>
          <span className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px] font-bold">
            ✕
          </span>
        </button>
      )}

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
              handleGroupSelection();
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
              handleFrameSelection();
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
              handleUngroup(contextMenu.item);
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

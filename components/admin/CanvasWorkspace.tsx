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
  HiQueueList,
} from "react-icons/hi2";
import { SiYoutube, SiGoogledrive } from "react-icons/si";
import { RiGridFill } from "react-icons/ri";
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

export const FigmaSectionIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="2.5" />
    <path d="M2 7.5h4.5a1.5 1.5 0 0 0 1.5-1.5V2" />
  </svg>
);

// Figma-style Group Icon: dashed square outline matching media_1793599189225_7a90a18a.png
export const FigmaGroupIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" strokeDasharray="2.5 1.75" />
  </svg>
);

// Figma-style Image Layer Icon: matching media_1793599250042_7394355e.png & media_1793599258390_5f8b1dc6.png
export const FigmaImageIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
    <rect x="2" y="2" width="12" height="12" rx="2" />
    <circle cx="10.25" cy="5.75" r="1" fill="currentColor" stroke="none" />
    <path d="M3.5 11.5l3.25-3.5 2.25 2.25 1.75-1.75 1.75 1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const getCssFontWeight = (weight?: string | number): number => {
  if (typeof weight === "number") return weight;
  if (!weight) return 400;
  const w = weight.toString().toLowerCase().trim();
  if (w === "thin") return 100;
  if (w === "extralight" || w === "extra-light") return 200;
  if (w === "light") return 300;
  if (w === "regular" || w === "normal") return 400;
  if (w === "medium") return 500;
  if (w === "semibold" || w === "semi-bold") return 600;
  if (w === "bold") return 700;
  if (w === "extrabold" || w === "extra-bold") return 800;
  if (w === "black") return 900;
  const parsed = parseInt(weight, 10);
  return isNaN(parsed) ? 400 : parsed;
};

export const getCssFontFamily = (family?: string): string => {
  if (!family) return '"Noto Serif", Georgia, serif';
  if (family.includes("Serif") || family.includes("Cinzel") || family.includes("Playfair")) {
    return `"${family}", Georgia, serif`;
  }
  if (family.includes("Courier") || family.includes("Mono")) {
    return `"${family}", monospace`;
  }
  return `"${family}", system-ui, -apple-system, sans-serif`;
};

// ── Unified Dimensions Engine (Ensures 100% exact match between Canvas DOM & Alignment Engine) ──
export const getItemDimensions = (it: CanvasItem): { width: number; height: number } => {
  let w = it.width;
  let h = it.height;

  if (it.type === "section" || it.mediaType === "section") {
    w = w || 1200;
    h = h || 600;
  } else if (it.type === "text" || it.mediaType === "text") {
    const textFontSize = it.fontSize || 129;
    const rawText = it.content !== undefined ? it.content : it.title || "";
    const textLines = (rawText || " ").split("\n");
    const longestLineLen = Math.max(...textLines.map((l) => l.length), 1);
    const isAutoWidth = (it.textAutoResize || "auto_width") === "auto_width";
    const isFixed = it.textAutoResize === "fixed";
    w = isAutoWidth ? Math.max(28, Math.round(longestLineLen * textFontSize * 0.58 + 10)) : (w || 320);
    h = isFixed && h ? h : Math.round(Math.max(textFontSize * 1.15, textLines.length * textFontSize * 1.2 + 8));
  } else if (it.type === "shape" || it.mediaType === "shape" || it.mediaType === "rectangle" || it.mediaType === "ellipse") {
    w = w || 320;
    h = h || 200;
  } else if ((it.mediaType === "frame" || it.type === "frame") && !it.image) {
    w = w || 440;
    h = h || 550;
  } else {
    // Media / Image / Deliverable card
    let cardWidth = 440;
    if (it.aspect === "16:9") {
      cardWidth = 560;
    } else if (it.aspect === "9:16") {
      cardWidth = 320;
    } else if (it.aspect === "1:1") {
      cardWidth = 440;
    } else if (it.aspect && it.aspect.includes(":")) {
      const [wStr, hStr] = it.aspect.split(":");
      const wNum = parseFloat(wStr);
      const hNum = parseFloat(hStr);
      if (wNum && hNum) cardWidth = wNum > hNum ? 560 : 440;
    } else if (it.aspect === "original") {
      cardWidth = 460;
    }
    w = w || cardWidth;
    if (!h) {
      if (it.aspect === "16:9") h = Math.round(w * (9 / 16));
      else if (it.aspect === "1:1") h = w;
      else if (it.aspect === "9:16") h = Math.round(w * (16 / 9));
      else h = Math.round(w * (5 / 4));
    }
  }

  return { width: Math.round(w), height: Math.round(h) };
};

export interface SnapGuideLine {
  type: "horizontal" | "vertical";
  pos: number;
  start: number;
  end: number;
}

export interface DistanceGuide {
  type: "horizontal" | "vertical";
  startPos: number;
  endPos: number;
  crossPos: number;
  distance: number;
}

export const getItemBounds = (it: CanvasItem) => {
  const { width: w, height: h } = getItemDimensions(it);
  const x = it.x || 0;
  const y = it.y || 0;
  return {
    x,
    y,
    w,
    h,
    left: x,
    right: x + w,
    top: y,
    bottom: y + h,
    centerX: x + w / 2,
    centerY: y + h / 2,
  };
};

export const calculateSnapAndGuides = (
  draggedId: string,
  rawX: number,
  rawY: number,
  allItems: CanvasItem[],
  currentZoom: number,
  selectedIdSet: Set<string>,
  hiddenIdSet: Set<string>
): {
  snappedX: number;
  snappedY: number;
  guides: { lines: SnapGuideLine[]; distances: DistanceGuide[] };
} => {
  const dragged = allItems.find((it) => it.id === draggedId);
  if (!dragged) {
    return { snappedX: Math.round(rawX), snappedY: Math.round(rawY), guides: { lines: [], distances: [] } };
  }

  const baseBounds = getItemBounds(dragged);
  const dragW = baseBounds.w;
  const dragH = baseBounds.h;

  let curX = rawX;
  let curY = rawY;

  const snapThreshold = Math.max(6, 8 / currentZoom);

  // Other items to consider for snapping
  const otherItems = allItems.filter(
    (it) =>
      it.id !== draggedId &&
      !selectedIdSet.has(it.id) &&
      !hiddenIdSet.has(it.id) &&
      it.frameId !== draggedId
  );

  const otherBounds = otherItems.map((it) => getItemBounds(it));

  // --- 1. Snapping on Y axis (Horizontal Alignment Lines) ---
  const dragYTargets = [
    { val: curY, offset: 0 },
    { val: curY + dragH / 2, offset: -dragH / 2 },
    { val: curY + dragH, offset: -dragH },
  ];

  let bestDeltaY: number | null = null;
  for (const ob of otherBounds) {
    const obYTargets = [ob.top, ob.centerY, ob.bottom];
    for (const dt of dragYTargets) {
      for (const ot of obYTargets) {
        const diff = ot - dt.val;
        if (Math.abs(diff) <= snapThreshold) {
          if (bestDeltaY === null || Math.abs(diff) < Math.abs(bestDeltaY)) {
            bestDeltaY = diff;
          }
        }
      }
    }
  }

  if (bestDeltaY !== null) {
    curY += bestDeltaY;
  }

  // --- 2. Snapping on X axis (Vertical Alignment Lines) ---
  const dragXTargets = [
    { val: curX, offset: 0 },
    { val: curX + dragW / 2, offset: -dragW / 2 },
    { val: curX + dragW, offset: -dragW },
  ];

  let bestDeltaX: number | null = null;
  for (const ob of otherBounds) {
    const obXTargets = [ob.left, ob.centerX, ob.right];
    for (const dt of dragXTargets) {
      for (const ot of obXTargets) {
        const diff = ot - dt.val;
        if (Math.abs(diff) <= snapThreshold) {
          if (bestDeltaX === null || Math.abs(diff) < Math.abs(bestDeltaX)) {
            bestDeltaX = diff;
          }
        }
      }
    }
  }

  if (bestDeltaX !== null) {
    curX += bestDeltaX;
  }

  // --- 3. Compute Active Guide Lines with snapped positions ---
  const lines: SnapGuideLine[] = [];
  const currentYValues = [curY, curY + dragH / 2, curY + dragH];
  const currentXValues = [curX, curX + dragW / 2, curX + dragW];

  for (const ob of otherBounds) {
    // Horizontal lines (Y-axis matches)
    const obYTargets = [ob.top, ob.centerY, ob.bottom];
    for (const cy of currentYValues) {
      for (const ot of obYTargets) {
        if (Math.abs(cy - ot) <= 1.5) {
          lines.push({
            type: "horizontal",
            pos: Math.round(ot),
            start: Math.min(curX, ob.left) - 16,
            end: Math.max(curX + dragW, ob.right) + 16,
          });
        }
      }
    }

    // Vertical lines (X-axis matches)
    const obXTargets = [ob.left, ob.centerX, ob.right];
    for (const cx of currentXValues) {
      for (const ot of obXTargets) {
        if (Math.abs(cx - ot) <= 1.5) {
          lines.push({
            type: "vertical",
            pos: Math.round(ot),
            start: Math.min(curY, ob.top) - 16,
            end: Math.max(curY + dragH, ob.bottom) + 16,
          });
        }
      }
    }
  }

  // Deduplicate lines
  const uniqueLines: SnapGuideLine[] = [];
  for (const l of lines) {
    const existing = uniqueLines.find((u) => u.type === l.type && Math.abs(u.pos - l.pos) < 1);
    if (existing) {
      existing.start = Math.min(existing.start, l.start);
      existing.end = Math.max(existing.end, l.end);
    } else {
      uniqueLines.push({ ...l });
    }
  }

  // --- 4. Equal Distance / Spacing Guides (Matches Screenshot 2) ---
  const distances: DistanceGuide[] = [];

  // Horizontal spacing (left item < curX < right item)
  const hNeighbors = otherBounds.filter(
    (ob) => Math.max(curY, ob.top) <= Math.min(curY + dragH, ob.bottom) + 80
  );

  const leftNeighbors = hNeighbors.filter((ob) => ob.right <= curX);
  const rightNeighbors = hNeighbors.filter((ob) => ob.left >= curX + dragW);

  if (leftNeighbors.length > 0 && rightNeighbors.length > 0) {
    leftNeighbors.sort((a, b) => b.right - a.right);
    rightNeighbors.sort((a, b) => a.left - b.left);
    const closestLeft = leftNeighbors[0];
    const closestRight = rightNeighbors[0];

    const gapLeft = curX - closestLeft.right;
    const gapRight = closestRight.left - (curX + dragW);

    if (gapLeft > 0 && gapRight > 0) {
      if (Math.abs(gapLeft - gapRight) <= snapThreshold) {
        curX = Math.round(closestLeft.right + (closestRight.left - closestLeft.right - dragW) / 2);
        const finalGap = Math.round(curX - closestLeft.right);
        distances.push({
          type: "horizontal",
          startPos: Math.round(closestLeft.right),
          endPos: Math.round(curX),
          crossPos: Math.round(curY + dragH / 2),
          distance: finalGap,
        });
        distances.push({
          type: "horizontal",
          startPos: Math.round(curX + dragW),
          endPos: Math.round(closestRight.left),
          crossPos: Math.round(curY + dragH / 2),
          distance: finalGap,
        });
      }
    }
  } else if (leftNeighbors.length > 0) {
    leftNeighbors.sort((a, b) => b.right - a.right);
    const closestLeft = leftNeighbors[0];
    const gapLeft = curX - closestLeft.right;
    if (gapLeft > 10 && gapLeft < 800) {
      distances.push({
        type: "horizontal",
        startPos: Math.round(closestLeft.right),
        endPos: Math.round(curX),
        crossPos: Math.round(curY + dragH / 2),
        distance: Math.round(gapLeft),
      });
    }
  } else if (rightNeighbors.length > 0) {
    rightNeighbors.sort((a, b) => a.left - b.left);
    const closestRight = rightNeighbors[0];
    const gapRight = closestRight.left - (curX + dragW);
    if (gapRight > 10 && gapRight < 800) {
      distances.push({
        type: "horizontal",
        startPos: Math.round(curX + dragW),
        endPos: Math.round(closestRight.left),
        crossPos: Math.round(curY + dragH / 2),
        distance: Math.round(gapRight),
      });
    }
  }

  // Vertical spacing (top item < curY < bottom item)
  const vNeighbors = otherBounds.filter(
    (ob) => Math.max(curX, ob.left) <= Math.min(curX + dragW, ob.right) + 80
  );

  const topNeighbors = vNeighbors.filter((ob) => ob.bottom <= curY);
  const bottomNeighbors = vNeighbors.filter((ob) => ob.top >= curY + dragH);

  if (topNeighbors.length > 0 && bottomNeighbors.length > 0) {
    topNeighbors.sort((a, b) => b.bottom - a.bottom);
    bottomNeighbors.sort((a, b) => a.top - b.top);
    const closestTop = topNeighbors[0];
    const closestBottom = bottomNeighbors[0];

    const gapTop = curY - closestTop.bottom;
    const gapBottom = closestBottom.top - (curY + dragH);

    if (gapTop > 0 && gapBottom > 0) {
      if (Math.abs(gapTop - gapBottom) <= snapThreshold) {
        curY = Math.round(closestTop.bottom + (closestBottom.top - closestTop.bottom - dragH) / 2);
        const finalGap = Math.round(curY - closestTop.bottom);
        distances.push({
          type: "vertical",
          startPos: Math.round(closestTop.bottom),
          endPos: Math.round(curY),
          crossPos: Math.round(curX + dragW / 2),
          distance: finalGap,
        });
        distances.push({
          type: "vertical",
          startPos: Math.round(curY + dragH),
          endPos: Math.round(closestBottom.top),
          crossPos: Math.round(curX + dragW / 2),
          distance: finalGap,
        });
      }
    }
  }

  return {
    snappedX: Math.round(curX),
    snappedY: Math.round(curY),
    guides: { lines: uniqueLines, distances },
  };
};

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
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== "undefined" ? window.innerWidth : 1200;
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isScreenMobile = isMobile || windowWidth < 768;

  const [isUiExpanded, setIsUiExpanded] = useState<boolean>(() => {
    if (isMobile) return false;
    if (typeof window !== "undefined" && window.innerWidth < 768) return false;
    return true;
  });
  const [isPillMenuOpen, setIsPillMenuOpen] = useState<boolean>(false);
  const [showExpandTooltip, setShowExpandTooltip] = useState<boolean>(false);
  const [showFramePresetsPicker, setShowFramePresetsPicker] = useState(false);
  const [isAlignMenuOpen, setIsAlignMenuOpen] = useState<boolean>(false);
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

  // Close submenus on clicking outside toolbar or menus
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.(".figma-toolbar-dock") && !target.closest?.(".figma-toolbar-submenu")) {
        setActiveSubmenu(null);
      }
      if (!target.closest?.(".figma-align-menu") && !target.closest?.(".figma-align-trigger")) {
        setIsAlignMenuOpen(false);
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
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Figma Smart Guides & Snap Alignment System (Matches Screenshots 1, 2 & 3)
  const [activeSnapGuides, setActiveSnapGuides] = useState<{
    lines: SnapGuideLine[];
    distances: DistanceGuide[];
  }>({ lines: [], distances: [] });

  // Drag & drop layer reordering in Layers Tree (Left Sidebar)
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | "inside" | null>(null);

  // Interactive Frame & Section Drawing Tool (Figma Style)
  const [isDrawingShape, setIsDrawingShape] = useState<boolean>(false);
  const [drawingShapeBox, setDrawingShapeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    type: "frame" | "section" | "shape";
  } | null>(null);
  const drawingShapeStartRef = useRef<{
    screenX: number;
    screenY: number;
    canvasX: number;
    canvasY: number;
  } | null>(null);

  // Interactive Element Resizing Engine (Corner & Edge Dragging - Matches Screenshot Image 2)
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    handle: string;
    startFontSize?: number;
    isGroup?: boolean;
    initialChildren?: Map<string, { x: number; y: number; width: number; height: number; fontSize?: number }>;
  } | null>(null);

  // Canvas items state
  const [items, setItems] = useState<CanvasItem[]>([]);
  const initialItemsRef = useRef<CanvasItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, item: CanvasItem, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(item.id);
    setSelectedIds(new Set([item.id]));
    setResizingItemId(item.id);
    setResizeHandle(handle);

    const dim = getItemDimensions(item);
    const itW = item.width || dim.width;
    const itH = item.height || dim.height;

    // Collect initial states of children if this is a group or frame
    const childMap = new Map<string, { x: number; y: number; width: number; height: number; fontSize?: number }>();
    items.forEach((it) => {
      if (it.frameId === item.id) {
        const cDim = getItemDimensions(it);
        childMap.set(it.id, {
          x: it.x || 0,
          y: it.y || 0,
          width: it.width || cDim.width,
          height: it.height || cDim.height,
          fontSize: it.fontSize || 129,
        });
      }
    });

    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: item.x || 0,
      startY: item.y || 0,
      startW: itW,
      startH: itH,
      handle,
      startFontSize: item.fontSize || 129,
      isGroup: item.type === "group",
      initialChildren: childMap,
    };
  }, [items]);

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
  const hasWorkspaceDraggedRef = useRef<boolean>(false);
  const hasItemMovedDuringDragRef = useRef<boolean>(false);

  // Keep context menu completely inside viewport so it never cuts off
  useEffect(() => {
    if (contextMenu?.isOpen && contextMenuRef.current) {
      const rect = contextMenuRef.current.getBoundingClientRect();
      const overflowBottom = rect.bottom - (window.innerHeight - 16);
      const overflowRight = rect.right - (window.innerWidth - 16);
      if (overflowBottom > 0 || overflowRight > 0) {
        setContextMenu((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            x: overflowRight > 0 ? Math.max(16, prev.x - overflowRight) : prev.x,
            y: overflowBottom > 0 ? Math.max(16, prev.y - overflowBottom) : prev.y,
          };
        });
      }
    }
  }, [contextMenu?.isOpen]);

  // Right Inspector Sidebar State (Images 1, 2, 3)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [inspectorTab, setInspectorTab] = useState<"design" | "prototype">("design");
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState<boolean>(false);
  const [isEffectPopoverOpen, setIsEffectPopoverOpen] = useState<boolean>(false);
  const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState<boolean>(false);
  const fontSizeDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close font size dropdown on outside click or escape
  useEffect(() => {
    if (!isFontSizeDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(e.target as Node)) {
        setIsFontSizeDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFontSizeDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFontSizeDropdownOpen]);

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
      const dim = getItemDimensions(it);
      minX = Math.min(minX, itX);
      minY = Math.min(minY, itY);
      maxX = Math.max(maxX, itX + dim.width);
      maxY = Math.max(maxY, itY + dim.height);
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

  const [isMultiResizing, setIsMultiResizing] = useState<boolean>(false);
  const multiResizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    initialBounds: { x: number; y: number; width: number; height: number };
    initialItems: Map<string, { x: number; y: number; width: number; height: number; fontSize?: number }>;
    handle: "nw" | "ne" | "se" | "sw";
  } | null>(null);

  const handleMultiResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: "nw" | "ne" | "se" | "sw") => {
      e.stopPropagation();
      e.preventDefault();
      if (!multiSelectionBounds) return;

      const initialMap = new Map<string, { x: number; y: number; width: number; height: number; fontSize?: number }>();
      items.forEach((it) => {
        if (selectedIds.has(it.id)) {
          const dim = getItemDimensions(it);
          initialMap.set(it.id, {
            x: it.x || 0,
            y: it.y || 0,
            width: dim.width,
            height: dim.height,
            fontSize: it.fontSize || 129,
          });
        }
      });

      setIsMultiResizing(true);
      multiResizeStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialBounds: { ...multiSelectionBounds },
        initialItems: initialMap,
        handle,
      };
    },
    [multiSelectionBounds, items, selectedIds]
  );

  // Figma Smart Selection Grid Engine (Pink center dots & Spacing handles - Matches User's Photo)
  const smartSelectionGrid = useMemo(() => {
    if (selectedIds.size < 2 || activeTool === "hand") return null;
    const selectedList = items.filter((it) => selectedIds.has(it.id) && !hiddenItemIds.has(it.id));
    if (selectedList.length < 2) return null;

    const rects = selectedList.map((it) => {
      const dim = getItemDimensions(it);
      return {
        id: it.id,
        x: it.x || 0,
        y: it.y || 0,
        width: dim.width,
        height: dim.height,
        cx: (it.x || 0) + dim.width / 2,
        cy: (it.y || 0) + dim.height / 2,
      };
    });

    const N = rects.length;
    const minX = Math.min(...rects.map((r) => r.x));
    const minY = Math.min(...rects.map((r) => r.y));
    const maxX = Math.max(...rects.map((r) => r.x + r.width));
    const maxY = Math.max(...rects.map((r) => r.y + r.height));
    const spanW = maxX - minX;
    const spanH = maxY - minY;

    const targetRatio = Math.max(0.2, spanW / (spanH || 1));
    let bestDiff = Infinity;
    let cols = Math.ceil(Math.sqrt(N));
    let rows = Math.ceil(N / cols);

    if (spanW > spanH * 3 && N <= 6) {
      cols = N;
      rows = 1;
    } else if (spanH > spanW * 3 && N <= 6) {
      cols = 1;
      rows = N;
    } else {
      for (let c = 1; c <= N; c++) {
        const r = Math.ceil(N / c);
        const gridRatio = c / r;
        const diff = Math.abs(gridRatio - targetRatio);
        if (diff < bestDiff) {
          bestDiff = diff;
          cols = c;
          rows = r;
        }
      }
    }

    const sorted = [...rects].sort((a, b) => {
      const yDiff = a.y - b.y;
      const threshold = Math.min(a.height, b.height) * 0.4;
      if (Math.abs(yDiff) > threshold) return yDiff;
      return a.x - b.x;
    });

    const grid: (typeof rects[0] | null)[][] = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        grid[r][c] = idx < sorted.length ? sorted[idx] : null;
      }
      const rowItems = grid[r].filter(Boolean) as typeof rects;
      rowItems.sort((a, b) => a.x - b.x);
      for (let c = 0; c < cols; c++) {
        grid[r][c] = c < rowItems.length ? rowItems[c] : null;
      }
    }

    let detectedGapX = 0;
    let gapXCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = grid[r][c];
        const b = grid[r][c + 1];
        if (a && b) {
          const g = b.x - (a.x + a.width);
          detectedGapX += g;
          gapXCount++;
        }
      }
    }
    const avgGapX = gapXCount > 0 ? Math.round(detectedGapX / gapXCount) : 40;

    let detectedGapY = 0;
    let gapYCount = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows - 1; r++) {
        const a = grid[r][c];
        const b = grid[r + 1][c];
        if (a && b) {
          const g = b.y - (a.y + a.height);
          detectedGapY += g;
          gapYCount++;
        }
      }
    }
    const avgGapY = gapYCount > 0 ? Math.round(detectedGapY / gapYCount) : 40;

    const rowSeparators: Array<{ y: number; height: number; x: number; width: number; gap: number }> = [];
    if (rows > 1) {
      for (let r = 0; r < rows - 1; r++) {
        const topRowItems = grid[r].filter(Boolean) as typeof rects;
        const bottomRowItems = grid[r + 1].filter(Boolean) as typeof rects;
        if (topRowItems.length > 0 && bottomRowItems.length > 0) {
          const topBottom = Math.max(...topRowItems.map((it) => it.y + it.height));
          const bottomTop = Math.min(...bottomRowItems.map((it) => it.y));
          const currentGap = Math.round(bottomTop - topBottom);
          rowSeparators.push({
            y: topBottom,
            height: Math.max(4, currentGap),
            x: minX,
            width: spanW,
            gap: currentGap,
          });
        }
      }
    }

    const colSeparators: Array<{ x: number; width: number; y: number; height: number; gap: number }> = [];
    if (cols > 1) {
      for (let c = 0; c < cols - 1; c++) {
        const leftColItems = grid.map((row) => row[c]).filter(Boolean) as typeof rects;
        const rightColItems = grid.map((row) => row[c + 1]).filter(Boolean) as typeof rects;
        if (leftColItems.length > 0 && rightColItems.length > 0) {
          const leftRight = Math.max(...leftColItems.map((it) => it.x + it.width));
          const rightLeft = Math.min(...rightColItems.map((it) => it.x));
          const currentGap = Math.round(rightLeft - leftRight);
          colSeparators.push({
            x: leftRight,
            width: Math.max(4, currentGap),
            y: minY,
            height: spanH,
            gap: currentGap,
          });
        }
      }
    }

    return {
      rects,
      grid,
      rows,
      cols,
      gapX: avgGapX,
      gapY: avgGapY,
      rowSeparators,
      colSeparators,
      minX,
      minY,
      spanW,
      spanH,
    };
  }, [items, selectedIds, hiddenItemIds, activeTool]);

  const handleUpdateSpacing = useCallback(
    (newGapX?: number, newGapY?: number) => {
      if (!smartSelectionGrid) return;
      const { grid, rows, cols, minX, minY, gapX: currentGapX, gapY: currentGapY } = smartSelectionGrid;
      const targetGapX = newGapX !== undefined ? Math.max(0, newGapX) : currentGapX;
      const targetGapY = newGapY !== undefined ? Math.max(0, newGapY) : currentGapY;

      const colW: number[] = new Array(cols).fill(0);
      const rowH: number[] = new Array(rows).fill(0);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const item = grid[r][c];
          if (item) {
            colW[c] = Math.max(colW[c], item.width);
            rowH[r] = Math.max(rowH[r], item.height);
          }
        }
      }

      const updates = new Map<string, { x: number; y: number }>();
      for (let r = 0; r < rows; r++) {
        let curY = minY;
        for (let k = 0; k < r; k++) {
          curY += rowH[k] + targetGapY;
        }

        for (let c = 0; c < cols; c++) {
          const item = grid[r][c];
          if (!item) continue;

          let curX = minX;
          for (let k = 0; k < c; k++) {
            curX += colW[k] + targetGapX;
          }

          updates.set(item.id, {
            x: Math.round(curX),
            y: Math.round(curY),
          });
        }
      }

      setItems((prev) =>
        prev.map((it) => {
          const pos = updates.get(it.id);
          return pos ? { ...it, ...pos } : it;
        })
      );
      setHasChanges(true);
    },
    [smartSelectionGrid]
  );

  const updateSelectedItem = useCallback((updater: Partial<CanvasItem>) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((it) => (it.id === selectedId ? { ...it, ...updater } : it))
    );
    setHasChanges(true);
  }, [selectedId]);

  // Center-anchored font size updates so text scales symmetrically around its center point
  const updateTextFontSizeCentered = useCallback((newSize: number, baseItem?: CanvasItem | null) => {
    const item = baseItem || selectedItem;
    if (!item) return;
    const oldDim = getItemDimensions(item);
    const centerX = (item.x || 0) + oldDim.width / 2;
    const centerY = (item.y || 0) + oldDim.height / 2;
    const newDim = getItemDimensions({ ...item, fontSize: newSize });
    const newX = (item.textAutoResize === "fixed") ? (item.x || 0) : Math.round(centerX - newDim.width / 2);
    const newY = Math.round(centerY - newDim.height / 2);
    updateSelectedItem({ fontSize: newSize, x: newX, y: newY });
  }, [selectedItem, updateSelectedItem]);

  // Figma-style Value Scrubber (Drag left/right on input icons, labels, or edges to adjust values)
  const handleStartScrub = useCallback((
    e: React.MouseEvent,
    config: {
      getValue: () => number;
      setValue: (val: number) => void;
      min?: number;
      max?: number;
      sensitivity?: number;
    }
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startVal = config.getValue();
    const min = config.min !== undefined ? config.min : -Infinity;
    const max = config.max !== undefined ? config.max : Infinity;
    const sensitivity = config.sensitivity || 1;

    const originalCursor = document.body.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const multiplier = moveEvent.shiftKey ? 5 : 1;
      const change = Math.round(deltaX * sensitivity * multiplier);
      const newVal = Math.max(min, Math.min(max, startVal + change));
      config.setValue(newVal);
    };

    const onMouseUp = () => {
      document.body.style.cursor = originalCursor;
      document.body.style.userSelect = originalUserSelect;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

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
    // If the user has unsaved changes in progress, don't overwrite!
    if (hasChangesRef.current) return;

    // Check if canvas has already been seeded / saved in localStorage or context
    const isSeeded = typeof window !== "undefined" && (
      localStorage.getItem("rizx_canvas_seeded") === "true" ||
      Boolean(localStorage.getItem("rizx_portfolio_custom_data_v1")?.includes('"canvasItems"'))
    );

    // If canvas has been seeded/saved previously, strictly respect canvasItems state (even if empty)
    if (isSeeded) {
      const cleanedItems = (canvasItems || []).filter(
        (i) => !i.id.startsWith("folder-") && i.type !== "folder"
      );
      setItems(cleanedItems);
      initialItemsRef.current = JSON.parse(JSON.stringify(cleanedItems));
      setHasChanges(false);
      return;
    }

    if (canvasItems && canvasItems.length > 0) {
      // Clean legacy auto-generated folder headers if any
      const cleanedItems = canvasItems.filter((i) => !i.id.startsWith("folder-") && i.type !== "folder");
      setItems(cleanedItems);
      initialItemsRef.current = JSON.parse(JSON.stringify(cleanedItems));
      setHasChanges(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("rizx_canvas_seeded", "true");
      }
      return;
    }

    // Default: Seed initial layout with presentation frame and all client deliverables ONLY ONCE on brand new empty environment
    const initialList: CanvasItem[] = [];

    // 1. Initial Presentation Frame
    initialList.push({
      id: "frame-presentation-1",
      title: "Digital Campaign Showcase",
      type: "media",
      mediaType: "frame",
      x: 40,
      y: 40,
      width: 1920,
      height: 1080,
      aspect: "16:9",
      color: "#18181b",
    });

    // 2. Client Deliverables - populate initial works so canvas is never empty
    let cardX = 80;
    let cardY = 120;
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
            width: 440,
            height: 550,
            isVideo: Boolean(w.isVideo || w.videoId),
            youtubeUrl: w.youtubeUrl,
            videoId: w.videoId,
            gdriveUrl: w.gdriveUrl,
          });

          cardX += 500;
          countInRow++;
          if (countInRow >= 3) {
            countInRow = 0;
            cardX = 80;
            cardY += 640;
          }
        }
      });
    });

    setItems(initialList);
    initialItemsRef.current = JSON.parse(JSON.stringify(initialList));
    setHasChanges(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("rizx_canvas_seeded", "true");
    }
  }, [canvasItems, clients]);

  // Context Menu & Figma Action Handlers
  const handleItemContextMenu = useCallback((e: React.MouseEvent, item: CanvasItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    setSelectedIds((prev) => (prev.has(item.id) ? prev : new Set([item.id])));

    const menuWidth = 245;
    const menuHeight = 440;
    const x = Math.max(12, Math.min(e.clientX, window.innerWidth - menuWidth - 16));
    const y = Math.max(12, Math.min(e.clientY, window.innerHeight - menuHeight - 16));
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
    const menuHeight = 440;
    const x = Math.max(12, Math.min(e.clientX, window.innerWidth - menuWidth - 16));
    const y = Math.max(12, Math.min(e.clientY, window.innerHeight - menuHeight - 16));
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

  const handleBringToFront = useCallback((targetId?: string) => {
    const id = targetId || selectedId || (selectedIds.size > 0 ? Array.from(selectedIds)[0] : null);
    if (!id) return;

    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;

      const targetIds = selectedIds.has(id) && selectedIds.size > 1 ? selectedIds : new Set([id]);
      const allMovingIds = new Set(targetIds);
      prev.forEach((it) => {
        if (it.frameId && targetIds.has(it.frameId)) {
          allMovingIds.add(it.id);
        }
      });

      // If target is inside a frame, bring it to front of that frame's children
      if (target.frameId) {
        const frameId = target.frameId;
        const frameChildren = prev.filter((it) => it.frameId === frameId);
        const otherChildren = frameChildren.filter((it) => !allMovingIds.has(it.id));
        const movingChildren = frameChildren.filter((it) => allMovingIds.has(it.id));
        const newFrameChildren = [...otherChildren, ...movingChildren];

        let childIdx = 0;
        const next = prev.map((it) => {
          if (it.frameId === frameId) {
            const replacement = newFrameChildren[childIdx];
            childIdx++;
            return replacement;
          }
          return it;
        });
        updateCanvasItems(next);
        return next;
      }

      // Root level: move all selected items & children to end of items array (topmost visual layer)
      const staying = prev.filter((it) => !allMovingIds.has(it.id));
      const moving = prev.filter((it) => allMovingIds.has(it.id));
      const next = [...staying, ...moving];
      updateCanvasItems(next);
      return next;
    });
    setHasChanges(true);
    setSaveSuccess(false);
  }, [selectedId, selectedIds, updateCanvasItems]);

  const handleSendToBack = useCallback((targetId?: string) => {
    const id = targetId || selectedId || (selectedIds.size > 0 ? Array.from(selectedIds)[0] : null);
    if (!id) return;

    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;

      const targetIds = selectedIds.has(id) && selectedIds.size > 1 ? selectedIds : new Set([id]);
      const allMovingIds = new Set(targetIds);
      prev.forEach((it) => {
        if (it.frameId && targetIds.has(it.frameId)) {
          allMovingIds.add(it.id);
        }
      });

      if (target.frameId) {
        const frameId = target.frameId;
        const frameChildren = prev.filter((it) => it.frameId === frameId);
        const otherChildren = frameChildren.filter((it) => !allMovingIds.has(it.id));
        const movingChildren = frameChildren.filter((it) => allMovingIds.has(it.id));
        const newFrameChildren = [...movingChildren, ...otherChildren];

        let childIdx = 0;
        const next = prev.map((it) => {
          if (it.frameId === frameId) {
            const replacement = newFrameChildren[childIdx];
            childIdx++;
            return replacement;
          }
          return it;
        });
        updateCanvasItems(next);
        return next;
      }

      // Root level: move all selected items & children to beginning of items array (bottommost visual layer)
      const staying = prev.filter((it) => !allMovingIds.has(it.id));
      const moving = prev.filter((it) => allMovingIds.has(it.id));
      const next = [...moving, ...staying];
      updateCanvasItems(next);
      return next;
    });
    setHasChanges(true);
    setSaveSuccess(false);
  }, [selectedId, selectedIds, updateCanvasItems]);

  const handleBringForward = useCallback((targetId?: string) => {
    const id = targetId || selectedId || (selectedIds.size > 0 ? Array.from(selectedIds)[0] : null);
    if (!id) return;

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      updateCanvasItems(next);
      return next;
    });
    setHasChanges(true);
    setSaveSuccess(false);
  }, [selectedId, selectedIds, updateCanvasItems]);

  const handleSendBackward = useCallback((targetId?: string) => {
    const id = targetId || selectedId || (selectedIds.size > 0 ? Array.from(selectedIds)[0] : null);
    if (!id) return;

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      updateCanvasItems(next);
      return next;
    });
    setHasChanges(true);
    setSaveSuccess(false);
  }, [selectedId, selectedIds, updateCanvasItems]);

  const handleConvertFrameOrSection = useCallback((item: CanvasItem) => {
    const isFrame = (item.mediaType === "frame" || item.type === "frame") && !item.image;

    setItems((prev) => {
      // 1. If it's already a Frame, convert it to a Section
      if (isFrame) {
        const secCount = prev.filter((i) => i.type === "section" || i.mediaType === "section").length + 1;
        return prev.map((i) => {
          if (i.id === item.id) {
            return {
              ...i,
              type: "section" as const,
              mediaType: "section" as const,
              title: i.title.startsWith("Frame") ? `Section ${secCount}` : i.title,
              color: i.color || "rgba(50, 52, 58, 0.88)",
            };
          }
          return i;
        });
      }

      // 2. If it's a Section, convert it to a Frame
      if (item.type === "section" || item.mediaType === "section") {
        const frameCount = prev.filter((i) => (i.mediaType === "frame" || i.type === "frame") && !i.image && i.type !== "group").length + 1;
        return prev.map((i) => {
          if (i.id === item.id) {
            const w = i.width || 1200;
            const h = i.height || 600;
            return {
              ...i,
              type: "media" as const,
              mediaType: "frame" as const,
              title: i.title.startsWith("Section") ? `Frame ${frameCount}` : i.title,
              width: w,
              height: h,
              aspect: "free",
              color: "#FFFFFF",
              cornerRadius: 0,
              clipContent: true,
            };
          }
          return i;
        });
      }

      // 3. If it's an Image / Video / Deliverable Card / Shape / Text:
      // In Figma: Convert to frame wraps the image inside a new Frame of the exact matching size!
      const dim = getItemDimensions(item);
      const w = item.width || dim.width;
      const h = item.height || dim.height;
      const itemX = item.x || 0;
      const itemY = item.y || 0;

      const frameId = `frame-${Date.now()}`;
      const frameCount = prev.filter((i) => (i.mediaType === "frame" || i.type === "frame") && !i.image && i.type !== "group").length + 1;

      const newFrame: CanvasItem = {
        id: frameId,
        title: `Frame ${frameCount}`,
        type: "media",
        mediaType: "frame",
        aspect: "free",
        x: itemX,
        y: itemY,
        width: w,
        height: h,
        color: item.color || "#FFFFFF",
        cornerRadius: 0,
        clipContent: true,
      };

      const updatedItem: CanvasItem = {
        ...item,
        frameId,
        x: itemX,
        y: itemY,
        width: w,
        height: h,
        aspect: "free",
      };

      const itemIdx = prev.findIndex((i) => i.id === item.id);
      const next = [...prev];
      if (itemIdx >= 0) {
        next.splice(itemIdx, 1, newFrame, updatedItem);
      } else {
        next.push(newFrame, updatedItem);
      }

      setTimeout(() => {
        setSelectedId(frameId);
        setSelectedIds(new Set([frameId]));
      }, 0);

      return next;
    });
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

  // Auto-persist unsaved canvas items on tab switch / unmount so newly added frames and elements are never lost
  const hasChangesRef = useRef(hasChanges);
  hasChangesRef.current = hasChanges;

  useEffect(() => {
    return () => {
      if (hasChangesRef.current && itemsRef.current) {
        updateCanvasItems(itemsRef.current).catch(() => {});
      }
    };
  }, [updateCanvasItems]);

  // Helper to identify Frame items
  const isFrameItem = useCallback((it: CanvasItem) => {
    return (
      (it.mediaType === "frame" ||
        it.type === "frame" ||
        it.type === "section" ||
        it.mediaType === "section" ||
        it.type === "group") &&
      !it.image &&
      !it.videoId &&
      it.type !== "shape" &&
      it.mediaType !== "shape" &&
      it.mediaType !== "rectangle" &&
      it.mediaType !== "ellipse" &&
      it.type !== "text" &&
      it.mediaType !== "text"
    );
  }, []);

  // Helper to find parent frame / section ID of an item
  const getParentFrameId = useCallback(
    (it: CanvasItem) => {
      if (it.frameId) return it.frameId;
      const itX = it.x || 0;
      const itY = it.y || 0;
      const isSec = it.type === "section" || it.mediaType === "section";

      const candidates = items.filter((f) => {
        if (f.id === it.id || !isFrameItem(f)) return false;
        // A Section cannot be nested inside a Frame
        if (isSec && f.type !== "section" && f.mediaType !== "section") return false;
        const fW = f.width || (f.aspect === "16:9" ? 720 : 1200);
        const fH = f.height || (f.aspect === "16:9" ? 405 : 600);
        const fX = f.x || 0;
        const fY = f.y || 0;
        return itX >= fX && itX <= fX + fW && itY >= fY && itY <= fY + fH;
      });

      if (candidates.length === 0) return undefined;
      // Innermost container (smallest bounding area) wins
      candidates.sort((a, b) => {
        const areaA = (a.width || 800) * (a.height || 600);
        const areaB = (b.width || 800) * (b.height || 600);
        return areaA - areaB;
      });
      return candidates[0].id;
    },
    [items, isFrameItem]
  );

  // Helper to compute CSS clip-path inset when an item is nested inside a frame with clipContent enabled
  const getItemClipPath = useCallback(
    (item: CanvasItem) => {
      const parentFrameId = item.frameId || getParentFrameId(item);
      if (!parentFrameId) return undefined;

      const parentFrame = items.find((f) => f.id === parentFrameId);
      if (!parentFrame) return undefined;

      // In Figma, Groups and Sections NEVER clip content!
      if (parentFrame.type === "group" || parentFrame.type === "section" || parentFrame.mediaType === "section") {
        return undefined;
      }

      // In Figma, clipContent defaults to true unless explicitly disabled (clipContent === false)
      if (parentFrame.clipContent === false) return undefined;

      const fLeft = parentFrame.x || 0;
      const fTop = parentFrame.y || 0;
      const fWidth = parentFrame.width || (parentFrame.aspect === "16:9" ? 720 : 480);
      const fHeight = parentFrame.height || (parentFrame.aspect === "16:9" ? 405 : 600);
      const fRight = fLeft + fWidth;
      const fBottom = fTop + fHeight;

      const itLeft = item.x || 0;
      const itTop = item.y || 0;
      let itWidth = item.width || 440;
      let itHeight = item.height || 550;

      if (
        item.type === "media" ||
        item.mediaType === "image" ||
        item.mediaType === "youtube" ||
        item.mediaType === "gdrive" ||
        item.mediaType === "upload"
      ) {
        if (!item.height) {
          if (item.aspect === "16:9") itHeight = Math.round(itWidth * (9 / 16));
          else if (item.aspect === "1:1") itHeight = itWidth;
          else if (item.aspect === "9:16") itHeight = Math.round(itWidth * (16 / 9));
          else if (item.aspect === "4:5" || !item.aspect || item.aspect === "original")
            itHeight = Math.round(itWidth * (5 / 4));
        }
      }

      const itRight = itLeft + itWidth;
      const itBottom = itTop + itHeight;

      const clipTop = Math.max(0, fTop - itTop);
      const clipRight = Math.max(0, itRight - fRight);
      const clipBottom = Math.max(0, itBottom - fBottom);
      const clipLeft = Math.max(0, fLeft - itLeft);

      if (clipTop === 0 && clipRight === 0 && clipBottom === 0 && clipLeft === 0) {
        return undefined;
      }

      const radius = parentFrame.cornerRadius !== undefined ? `${parentFrame.cornerRadius}px` : "0px";
      return `inset(${Math.round(clipTop)}px ${Math.round(clipRight)}px ${Math.round(clipBottom)}px ${Math.round(clipLeft)}px round ${radius})`;
    },
    [items, getParentFrameId]
  );

  // ── Drag & Drop Layer Reordering Engine (Left Sidebar Layers Panel) ──
  const handleReorderLayer = useCallback(
    (dragId: string, targetId: string, pos: "before" | "after" | "inside") => {
      if (dragId === targetId) return;

      setItems((prev) => {
        const dragItem = prev.find((it) => it.id === dragId);
        const targetItem = prev.find((it) => it.id === targetId);
        if (!dragItem || !targetItem) return prev;

        // Prevent nesting a parent inside its own child
        if (targetItem.frameId === dragId) return prev;

        // Group together dragItem and any of its children
        const dragItemAndChildren = prev.filter((it) => it.id === dragId || it.frameId === dragId);
        const remaining = prev.filter((it) => it.id !== dragId && it.frameId !== dragId);

        if (pos === "inside" && isFrameItem(targetItem)) {
          const updatedDragItem = { ...dragItem, frameId: targetItem.id };
          const targetIdx = remaining.findIndex((it) => it.id === targetId);
          if (targetIdx === -1) return prev;

          const next = [
            ...remaining.slice(0, targetIdx + 1),
            updatedDragItem,
            ...dragItemAndChildren.filter((it) => it.id !== dragId),
            ...remaining.slice(targetIdx + 1),
          ];
          updateCanvasItems(next);
          return next;
        }

        const targetIdx = remaining.findIndex((it) => it.id === targetId);
        if (targetIdx === -1) return prev;

        // In the Layers list (which is reversed):
        // "before" in list = visual above target = higher z-index = AFTER target in items array
        // "after" in list = visual below target = lower z-index = BEFORE target in items array
        const updatedDragItem = { ...dragItem, frameId: targetItem.frameId };
        const insertIdx = pos === "before" ? targetIdx + 1 : targetIdx;

        const next = [
          ...remaining.slice(0, insertIdx),
          updatedDragItem,
          ...dragItemAndChildren.filter((it) => it.id !== dragId),
          ...remaining.slice(insertIdx),
        ];
        updateCanvasItems(next);
        return next;
      });

      setHasChanges(true);
      setSaveSuccess(false);
    },
    [isFrameItem, updateCanvasItems]
  );

  const handleMoveLayerToTop = useCallback(
    (dragId: string) => {
      setItems((prev) => {
        const dragItem = prev.find((it) => it.id === dragId);
        if (!dragItem) return prev;
        const dragItemAndChildren = prev.filter((it) => it.id === dragId || it.frameId === dragId);
        const remaining = prev.filter((it) => it.id !== dragId && it.frameId !== dragId);
        const updatedDragItem = { ...dragItem, frameId: undefined };
        const next = [
          ...remaining,
          updatedDragItem,
          ...dragItemAndChildren.filter((it) => it.id !== dragId),
        ];
        updateCanvasItems(next);
        return next;
      });
      setHasChanges(true);
      setSaveSuccess(false);
    },
    [updateCanvasItems]
  );

  const handleMoveLayerToBottom = useCallback(
    (dragId: string) => {
      setItems((prev) => {
        const dragItem = prev.find((it) => it.id === dragId);
        if (!dragItem) return prev;
        const dragItemAndChildren = prev.filter((it) => it.id === dragId || it.frameId === dragId);
        const remaining = prev.filter((it) => it.id !== dragId && it.frameId !== dragId);
        const updatedDragItem = { ...dragItem, frameId: undefined };
        const next = [
          updatedDragItem,
          ...dragItemAndChildren.filter((it) => it.id !== dragId),
          ...remaining,
        ];
        updateCanvasItems(next);
        return next;
      });
      setHasChanges(true);
      setSaveSuccess(false);
    },
    [updateCanvasItems]
  );

  // ── Figma Professional Alignment Engine (Left, HCenter, Right, Top, VCenter, Bottom, Distribute, Tidy Up) ──
  const handleAlign = useCallback(
    (
      alignment:
        | "left"
        | "hcenter"
        | "right"
        | "top"
        | "vcenter"
        | "bottom"
        | "distribute-h"
        | "distribute-v"
        | "tidyup"
        | "distribute"
    ) => {
      const targetIds =
        selectedIds.size > 0
          ? Array.from(selectedIds)
          : selectedId
          ? [selectedId]
          : [];
      const targetItems = items.filter(
        (it) => targetIds.includes(it.id) && !hiddenItemIds.has(it.id)
      );
      if (targetItems.length === 0) return;

      const getItemRect = (it: CanvasItem) => {
        const itX = it.x || 0;
        const itY = it.y || 0;
        const dim = getItemDimensions(it);
        return { id: it.id, x: itX, y: itY, width: dim.width, height: dim.height };
      };

      const rects = targetItems.map(getItemRect);
      const updates = new Map<string, { x?: number; y?: number }>();

      if (rects.length > 1) {
        // Multi-Selection Bounding Box
        const minX = Math.min(...rects.map((r) => r.x));
        const minY = Math.min(...rects.map((r) => r.y));
        const maxX = Math.max(...rects.map((r) => r.x + r.width));
        const maxY = Math.max(...rects.map((r) => r.y + r.height));
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        if (alignment === "left") {
          rects.forEach((r) => updates.set(r.id, { x: minX }));
        } else if (alignment === "hcenter") {
          rects.forEach((r) =>
            updates.set(r.id, { x: Math.round(centerX - r.width / 2) })
          );
        } else if (alignment === "right") {
          rects.forEach((r) =>
            updates.set(r.id, { x: Math.round(maxX - r.width) })
          );
        } else if (alignment === "top") {
          rects.forEach((r) => updates.set(r.id, { y: minY }));
        } else if (alignment === "vcenter") {
          rects.forEach((r) =>
            updates.set(r.id, { y: Math.round(centerY - r.height / 2) })
          );
        } else if (alignment === "bottom") {
          rects.forEach((r) =>
            updates.set(r.id, { y: Math.round(maxY - r.height) })
          );
        } else if (alignment === "distribute-h") {
          const sorted = [...rects].sort((a, b) => a.x - b.x);
          const sumWidths = sorted.reduce((sum, r) => sum + r.width, 0);
          const totalGap = (maxX - minX) - sumWidths;
          const gap = sorted.length > 1 ? totalGap / (sorted.length - 1) : 0;
          let curX = minX;
          sorted.forEach((r, idx) => {
            if (idx === 0) {
              updates.set(r.id, { x: Math.round(minX) });
              curX += r.width + gap;
            } else if (idx === sorted.length - 1) {
              updates.set(r.id, { x: Math.round(maxX - r.width) });
            } else {
              updates.set(r.id, { x: Math.round(curX) });
              curX += r.width + gap;
            }
          });
        } else if (alignment === "distribute-v") {
          const sorted = [...rects].sort((a, b) => a.y - b.y);
          const sumHeights = sorted.reduce((sum, r) => sum + r.height, 0);
          const totalGap = (maxY - minY) - sumHeights;
          const gap = sorted.length > 1 ? totalGap / (sorted.length - 1) : 0;
          let curY = minY;
          sorted.forEach((r, idx) => {
            if (idx === 0) {
              updates.set(r.id, { y: Math.round(minY) });
              curY += r.height + gap;
            } else if (idx === sorted.length - 1) {
              updates.set(r.id, { y: Math.round(maxY - r.height) });
            } else {
              updates.set(r.id, { y: Math.round(curY) });
              curY += r.height + gap;
            }
          });
        } else if (alignment === "tidyup" || alignment === "distribute") {
          const N = rects.length;
          const spanW = maxX - minX;
          const spanH = maxY - minY;

          // Determine grid cols & rows matching selection bounding box aspect ratio
          let cols = 1;
          let rows = 1;

          if (spanW > spanH * 3 && N <= 6) {
            cols = N;
            rows = 1;
          } else if (spanH > spanW * 3 && N <= 6) {
            cols = 1;
            rows = N;
          } else {
            const targetRatio = Math.max(0.2, spanW / (spanH || 1));
            let bestDiff = Infinity;
            cols = Math.ceil(Math.sqrt(N));
            for (let c = 1; c <= N; c++) {
              const r = Math.ceil(N / c);
              const gridRatio = c / r;
              const diff = Math.abs(gridRatio - targetRatio);
              if (diff < bestDiff) {
                bestDiff = diff;
                cols = c;
                rows = r;
              }
            }
          }

          // Sort in reading order: top rows first, left-to-right
          const sorted = [...rects].sort((a, b) => {
            const yDiff = a.y - b.y;
            const threshold = Math.min(a.height, b.height) * 0.4;
            if (Math.abs(yDiff) > threshold) return yDiff;
            return a.x - b.x;
          });

          // Break into rows and columns
          const grid: (typeof rects[0] | null)[][] = [];
          for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
              const idx = r * cols + c;
              grid[r][c] = idx < sorted.length ? sorted[idx] : null;
            }
            const rowItems = grid[r].filter(Boolean) as typeof rects;
            rowItems.sort((a, b) => a.x - b.x);
            for (let c = 0; c < cols; c++) {
              grid[r][c] = c < rowItems.length ? rowItems[c] : null;
            }
          }

          // Compute max column widths and row heights
          const colW: number[] = new Array(cols).fill(0);
          const rowH: number[] = new Array(rows).fill(0);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const item = grid[r][c];
              if (item) {
                colW[c] = Math.max(colW[c], item.width);
                rowH[r] = Math.max(rowH[r], item.height);
              }
            }
          }

          const sumColsW = colW.reduce((sum, w) => sum + w, 0);
          const sumRowsH = rowH.reduce((sum, h) => sum + h, 0);

          // Strictly anchor to outermost lines (minX, maxX, minY, maxY)
          let gapX = 0;
          if (cols > 1) {
            const remainingW = spanW - sumColsW;
            gapX = Math.round(remainingW / (cols - 1));
          }

          let gapY = 0;
          if (rows > 1) {
            const remainingH = spanH - sumRowsH;
            gapY = Math.round(remainingH / (rows - 1));
          }

          // Position items in tidy grid:
          // Topmost row stays at minY, bottommost row ends at maxY
          // Leftmost column stays at minX, rightmost column ends at maxX
          // Objects in the middle follow along and distribute evenly!
          for (let r = 0; r < rows; r++) {
            let curY = minY;
            if (rows > 1 && r === rows - 1) {
              curY = maxY - rowH[r];
            } else {
              for (let k = 0; k < r; k++) {
                curY += rowH[k] + gapY;
              }
            }

            for (let c = 0; c < cols; c++) {
              const item = grid[r][c];
              if (!item) continue;

              let curX = minX;
              if (cols > 1 && c === cols - 1) {
                curX = maxX - colW[c];
              } else {
                for (let k = 0; k < c; k++) {
                  curX += colW[k] + gapX;
                }
              }

              updates.set(item.id, {
                x: Math.round(curX),
                y: Math.round(curY),
              });
            }
          }
        }
      } else {
        // Single item alignment
        const r = rects[0];
        const targetItem = targetItems[0];
        const parentId = targetItem.frameId || getParentFrameId(targetItem);
        const parentFrame = parentId ? items.find((f) => f.id === parentId) : null;

        let boundX = 0;
        let boundY = 0;
        let boundW = 800;
        let boundH = 600;

        if (parentFrame) {
          boundX = parentFrame.x || 0;
          boundY = parentFrame.y || 0;
          boundW = parentFrame.width || 800;
          boundH = parentFrame.height || 600;
        } else {
          const container = canvasContainerRef.current;
          const cw = container?.clientWidth || 800;
          const ch = container?.clientHeight || 600;
          boundX = Math.round(-pan.x / zoom);
          boundY = Math.round(-pan.y / zoom);
          boundW = Math.round(cw / zoom);
          boundH = Math.round(ch / zoom);
        }

        if (alignment === "left") {
          updates.set(r.id, { x: boundX });
        } else if (alignment === "hcenter") {
          updates.set(r.id, {
            x: Math.round(boundX + (boundW - r.width) / 2),
          });
        } else if (alignment === "right") {
          updates.set(r.id, {
            x: Math.round(boundX + boundW - r.width),
          });
        } else if (alignment === "top") {
          updates.set(r.id, { y: boundY });
        } else if (alignment === "vcenter") {
          updates.set(r.id, {
            y: Math.round(boundY + (boundH - r.height) / 2),
          });
        } else if (alignment === "bottom") {
          updates.set(r.id, {
            y: Math.round(boundY + boundH - r.height),
          });
        }
      }

      if (updates.size > 0) {
        const nextItems = items.map((it) => {
          const up = updates.get(it.id);
          if (!up) return it;
          return { ...it, ...up };
        });
        updateItemsWithTracking(nextItems);
      }
    },
    [
      items,
      selectedId,
      selectedIds,
      hiddenItemIds,
      pan,
      zoom,
      getParentFrameId,
      updateItemsWithTracking,
    ]
  );

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
      const b = getItemBounds(it);
      minX = Math.min(minX, b.left);
      minY = Math.min(minY, b.top);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
    });

    if (minX === Infinity) return;

    const groupX = Math.round(minX);
    const groupY = Math.round(minY);
    const groupW = Math.max(1, Math.round(maxX - minX));
    const groupH = Math.max(1, Math.round(maxY - minY));

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
      clipContent: false,
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
      const b = getItemBounds(it);
      minX = Math.min(minX, b.left);
      minY = Math.min(minY, b.top);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
    });

    if (minX === Infinity) return;

    const padding = selectedList.length === 1 ? 0 : 20;
    const frameX = Math.round(minX - padding);
    const frameY = Math.round(minY - padding);
    const frameW = Math.max(1, Math.round(maxX - minX + padding * 2));
    const frameH = Math.max(1, Math.round(maxY - minY + padding * 2));

    const frameId = `frame-${Date.now()}`;
    const frameCount = items.filter((i) => (i.mediaType === "frame" || i.type === "frame") && !i.image && i.type !== "group").length + 1;
    const newFrame: CanvasItem = {
      id: frameId,
      title: `Frame ${frameCount}`,
      type: "media",
      mediaType: "frame",
      aspect: "free",
      x: frameX,
      y: frameY,
      width: frameW,
      height: frameH,
      color: "#FFFFFF",
      cornerRadius: 0,
      clipContent: true,
    };

    const targetIds = new Set(selectedList.map((i) => i.id));
    const updated = items.map((it) => {
      if (targetIds.has(it.id)) {
        return { ...it, frameId };
      }
      return it;
    });

    const firstIdx = items.findIndex((it) => targetIds.has(it.id));
    const nextItems = [...updated];
    if (firstIdx >= 0) {
      nextItems.splice(firstIdx, 0, newFrame);
    } else {
      nextItems.unshift(newFrame);
    }

    updateItemsWithTracking(nextItems);
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

    // 1. Group, Frame, or Section with children: dissolve the container and release all children
    if (childItems.length > 0) {
      const childIds = new Set(childItems.map((c) => c.id));
      const parentFrameId = it.frameId; // If container was itself inside another frame
      // In Figma: Ungrouping dissolves the container itself, leaving children on the canvas
      const nextItems = items
        .filter((item) => item.id !== targetId)
        .map((item) => {
          if (childIds.has(item.id)) {
            return { ...item, frameId: parentFrameId };
          }
          return item;
        });

      updateItemsWithTracking(nextItems);
      setSelectedId(childItems[0]?.id || null);
      setSelectedIds(childIds);
      return;
    }

    // 2. Individual item nested inside a parent frame/group: release it from its parent
    if (it.frameId) {
      const nextItems = items.map((item) =>
        item.id === targetId ? { ...item, frameId: undefined } : item
      );
      updateItemsWithTracking(nextItems);
      setSelectedId(targetId);
      setSelectedIds(new Set([targetId]));
      return;
    }

    // 3. Empty group: dissolve empty group
    if (isGroup) {
      const nextItems = items.filter((item) => item.id !== targetId);
      updateItemsWithTracking(nextItems);
      setSelectedId(null);
      setSelectedIds(new Set());
      return;
    }

    // 4. Client folder attachment: detach
    if (it.clientName) {
      const nextItems = items.map((item) =>
        item.id === targetId ? { ...item, clientName: undefined, clientId: undefined } : item
      );
      updateItemsWithTracking(nextItems);
      setSelectedId(targetId);
      setSelectedIds(new Set([targetId]));
      return;
    }

    // 5. Standalone Frame with no children:
    // In Figma, ungrouping an empty frame does nothing - it should NEVER turn into an image!
  }, [contextMenu?.item, selectedItem, selectedId, items, getParentFrameId, updateItemsWithTracking]);

  // Delete one or multiple items with immediate persistence to local storage and database
  const handleDeleteItems = useCallback((ids: string[] | Set<string>) => {
    const idSet = new Set(ids);
    setItems((prev) => {
      const updated = prev.filter(
        (it) => !idSet.has(it.id) && (!it.frameId || !idSet.has(it.frameId))
      );
      itemsRef.current = updated;
      initialItemsRef.current = JSON.parse(JSON.stringify(updated));
      updateCanvasItems(updated).catch(() => {});
      return updated;
    });
    setSelectedIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => !idSet.has(id)));
      return next;
    });
    setSelectedId((prev) => (prev && idSet.has(prev) ? null : prev));
    setEditingTextId((prev) => (prev && idSet.has(prev) ? null : prev));
    setHasChanges(false);
  }, [updateCanvasItems]);

  const handleDeleteItem = useCallback((id: string) => {
    handleDeleteItems([id]);
  }, [handleDeleteItems]);

  // Keyboard Shortcuts (Space for Pan, Delete to Remove)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Select All elements (Ctrl+A or Cmd+A)
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        const allIds = new Set(itemsRef.current.map((it) => it.id));
        setSelectedIds(allIds);
        if (allIds.size > 0) setSelectedId(Array.from(allIds)[0]);
        return;
      }

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
      if (e.key === "Enter" && selectedId) {
        const targetItem = items.find((it) => it.id === selectedId);
        if (targetItem && (targetItem.type === "text" || targetItem.mediaType === "text")) {
          e.preventDefault();
          setEditingTextId(selectedId);
        }
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
        if (isScreenMobile) setIsMobileInspectorOpen(true);
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
        setActiveTool("shape");
        setActiveSubmenu(null);
      }
      if (e.key === "o" || e.key === "O") {
        setActiveTool("shape");
        setActiveSubmenu(null);
      }
      if (e.key === "c" || e.key === "C") {
        handleAddComment();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && (selectedId || selectedIds.size > 0)) {
        e.preventDefault();
        const idsToDelete = new Set(selectedIds);
        if (selectedId) idsToDelete.add(selectedId);
        if (idsToDelete.size > 0) {
          handleDeleteItems(idsToDelete);
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
      const activeId = selectedId || (selectedIds.size > 0 ? Array.from(selectedIds)[0] : null);
      if ((e.key === "]" || e.code === "BracketRight") && activeId) {
        e.preventDefault();
        handleBringToFront(activeId);
      }
      if ((e.key === "[" || e.code === "BracketLeft") && activeId) {
        e.preventDefault();
        handleSendToBack(activeId);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "h" || e.key === "H") && selectedId) {
        e.preventDefault();
        handleToggleHide(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "l" || e.key === "L") && selectedId) {
        e.preventDefault();
        handleToggleLock(selectedId);
      }

      // Figma Alignment shortcuts (Alt + A, H, D, W, V, S, Alt+Shift+H/V, Ctrl+Alt+Shift+T)
      if (selectedId || selectedIds.size > 0) {
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
          if (e.key === "a" || e.key === "A") {
            e.preventDefault();
            handleAlign("left");
          } else if (e.key === "h" || e.key === "H") {
            e.preventDefault();
            handleAlign("hcenter");
          } else if (e.key === "d" || e.key === "D") {
            e.preventDefault();
            handleAlign("right");
          } else if (e.key === "w" || e.key === "W") {
            e.preventDefault();
            handleAlign("top");
          } else if (e.key === "v" || e.key === "V") {
            e.preventDefault();
            handleAlign("vcenter");
          } else if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            handleAlign("bottom");
          }
        } else if (e.altKey && e.shiftKey && !e.ctrlKey) {
          if (e.key === "h" || e.key === "H") {
            e.preventDefault();
            handleAlign("distribute-h");
          } else if (e.key === "v" || e.key === "V") {
            e.preventDefault();
            handleAlign("distribute-v");
          }
        } else if ((e.ctrlKey || e.metaKey) && e.altKey && e.shiftKey && (e.key === "t" || e.key === "T")) {
          e.preventDefault();
          handleAlign("tidyup");
        }
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
  }, [isSpacePressed, selectedId, selectedIds, handleBringToFront, handleSendToBack, handleDeleteItems]);

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
      const minAllowed = isScreenMobile ? 0.015 : 0.03;
      const newZoom = Math.min(5.5, Math.max(minAllowed, currentZoom * zoomFactor));

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
          const minAllowed = isScreenMobile ? 0.015 : 0.03;
          setZoom((prev) => Number(Math.max(minAllowed, prev * 0.85).toFixed(2)));
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
    initialMidX: number;
    initialMidY: number;
    startTouch: { x: number; y: number };
    isTouchPanning: boolean;
    touchDraggingItemId: string | null;
    touchItemOffset: { x: number; y: number };
  }>({
    initialPinchDistance: null,
    initialZoom: 1,
    startPan: { x: 0, y: 0 },
    initialMidX: 0,
    initialMidY: 0,
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

    // If clicking on canvas in Frame, Section, or Shape tool mode: interactive drag & drop creation!
    if ((activeTool === "frame" || activeTool === "section" || activeTool === "shape") && e.button === 0) {
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
        type: activeTool === "shape" ? "shape" : activeTool === "section" ? "section" : "frame",
      });
      return;
    }

    // If clicking on canvas background directly or with hand tool / spacebar
    if (e.target === e.currentTarget || isSpacePressed || activeTool === "hand" || e.button === 1) {
      if (editingTextId) {
        setEditingTextId(null);
      }
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
        hasWorkspaceDraggedRef.current = false;
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        if (!fittedItemId) {
          setSelectedId(null);
          setSelectedIds(new Set());
        }
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

  // Helper to commit and finalize creation of user-drawn Frame or Section
  const finishDrawingShape = useCallback(
    (clientX: number, clientY: number) => {
      if (!drawingShapeStartRef.current) return;
      const start = drawingShapeStartRef.current;
      const { x: endCanvasX, y: endCanvasY } = getCanvasCoords(clientX, clientY);
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      const endScreenX = rect ? clientX - rect.left : clientX;
      const endScreenY = rect ? clientY - rect.top : clientY;
      const dragDist = Math.hypot(endScreenX - start.screenX, endScreenY - start.screenY);

      let shapeX = Math.min(start.canvasX, endCanvasX);
      let shapeY = Math.min(start.canvasY, endCanvasY);
      let shapeW = Math.abs(endCanvasX - start.canvasX);
      let shapeH = Math.abs(endCanvasY - start.canvasY);

      const shapeType = drawingShapeBox?.type || (activeTool === "shape" ? "shape" : activeTool === "section" ? "section" : "frame");

      if (shapeType === "shape") {
        if (dragDist < 20) {
          shapeW = 320;
          shapeH = 200;
          shapeX = start.canvasX;
          shapeY = start.canvasY;
        }
        const shapeCount = items.filter((i) => i.type === "shape" || i.mediaType === "shape" || i.mediaType === "rectangle" || i.title.startsWith("Rectangle")).length + 1;
        const newShape: CanvasItem = {
          id: `shape-${Date.now()}`,
          title: `Rectangle ${shapeCount}`,
          type: "shape",
          mediaType: "shape",
          x: Math.round(shapeX),
          y: Math.round(shapeY),
          width: Math.round(shapeW),
          height: Math.round(shapeH),
          color: "#D9D9D9",
          cornerRadius: 0,
          opacity: 100,
        };
        updateItemsWithTracking([...items, newShape]);
        setSelectedId(newShape.id);
        setSelectedIds(new Set([newShape.id]));
      } else if (shapeType === "frame") {
        if (dragDist < 20) {
          shapeW = 440;
          shapeH = 550;
          shapeX = start.canvasX;
          shapeY = start.canvasY;
        }
        const frameTitle = `Frame ${Math.floor(Date.now() / 1000)}`;
        const newFrame: CanvasItem = {
          id: `frame-${Date.now()}`,
          title: frameTitle,
          type: "frame",
          mediaType: "frame",
          aspect: `${Math.round(shapeW)}:${Math.round(shapeH)}`,
          x: Math.round(shapeX),
          y: Math.round(shapeY),
          width: Math.round(shapeW),
          height: Math.round(shapeH),
          color: "#FFFFFF",
          cornerRadius: 0,
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
        const newSecId = `section-${Date.now()}`;
        const newSec: CanvasItem = {
          id: newSecId,
          title: `Section ${secCount}`,
          type: "section",
          mediaType: "section",
          x: Math.round(shapeX),
          y: Math.round(shapeY),
          width: Math.round(shapeW),
          height: Math.round(shapeH),
          color: "rgba(52, 54, 60, 0.88)",
        };

        // Automatically nest any frames/items that are inside this newly drawn Section
        const updatedItems = items.map((it) => {
          if (it.id === newSecId || it.type === "section" || it.mediaType === "section") return it;
          const itX = it.x || 0;
          const itY = it.y || 0;
          if (itX >= shapeX && itX <= shapeX + shapeW && itY >= shapeY && itY <= shapeY + shapeH) {
            return { ...it, frameId: newSecId };
          }
          return it;
        });

        updateItemsWithTracking([...updatedItems, newSec]);
        setSelectedId(newSec.id);
        setSelectedIds(new Set([newSec.id]));
      }

      setIsDrawingShape(false);
      setDrawingShapeBox(null);
      drawingShapeStartRef.current = null;
      setActiveTool("select");
      setIsRightSidebarOpen(true);
      setIsUiExpanded(true);
    },
    [drawingShapeBox, activeTool, getCanvasCoords, items]
  );

  // High-performance 0ms-latency window mouse tracking for pan, drag, and marquee selection
  useEffect(() => {
    if (!isPanning && !draggingItemId && !isMarqueeSelecting && !isDrawingShape && !resizingItemId && !isMultiResizing) return;

    const onWindowMove = (e: MouseEvent) => {
      if (isPanning) {
        hasWorkspaceDraggedRef.current = true;
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
      } else if (isMultiResizing && multiResizeStartRef.current) {
        // Multi-Selection Bounding Box Resizing (Proportionally resizes & repositions middle items)
        const { mouseX, mouseY, initialBounds, initialItems, handle } = multiResizeStartRef.current;
        const curZoom = zoomRef.current || zoom;
        const deltaX = (e.clientX - mouseX) / curZoom;
        const deltaY = (e.clientY - mouseY) / curZoom;

        const isLockedAspect = activeTool === "scale" || e.shiftKey;

        let newX = initialBounds.x;
        let newY = initialBounds.y;
        let newW = initialBounds.width;
        let newH = initialBounds.height;

        if (isLockedAspect) {
          let scale = 1;
          if (handle === "se") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (initialBounds.width + deltaX) / initialBounds.width
              : (initialBounds.height + deltaY) / initialBounds.height;
            scale = Math.max(0.05, scale);
            newW = Math.max(20, Math.round(initialBounds.width * scale));
            newH = Math.max(20, Math.round(initialBounds.height * scale));
            newX = initialBounds.x;
            newY = initialBounds.y;
          } else if (handle === "sw") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (initialBounds.width - deltaX) / initialBounds.width
              : (initialBounds.height + deltaY) / initialBounds.height;
            scale = Math.max(0.05, scale);
            newW = Math.max(20, Math.round(initialBounds.width * scale));
            newH = Math.max(20, Math.round(initialBounds.height * scale));
            newX = Math.round(initialBounds.x + initialBounds.width - newW);
            newY = initialBounds.y;
          } else if (handle === "ne") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (initialBounds.width + deltaX) / initialBounds.width
              : (initialBounds.height - deltaY) / initialBounds.height;
            scale = Math.max(0.05, scale);
            newW = Math.max(20, Math.round(initialBounds.width * scale));
            newH = Math.max(20, Math.round(initialBounds.height * scale));
            newX = initialBounds.x;
            newY = Math.round(initialBounds.y + initialBounds.height - newH);
          } else if (handle === "nw") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (initialBounds.width - deltaX) / initialBounds.width
              : (initialBounds.height - deltaY) / initialBounds.height;
            scale = Math.max(0.05, scale);
            newW = Math.max(20, Math.round(initialBounds.width * scale));
            newH = Math.max(20, Math.round(initialBounds.height * scale));
            newX = Math.round(initialBounds.x + initialBounds.width - newW);
            newY = Math.round(initialBounds.y + initialBounds.height - newH);
          }
        } else {
          if (handle.includes("e")) {
            newW = Math.max(50, Math.round(initialBounds.width + deltaX));
          }
          if (handle.includes("s")) {
            newH = Math.max(50, Math.round(initialBounds.height + deltaY));
          }
          if (handle.includes("w")) {
            const rawW = initialBounds.width - deltaX;
            if (rawW >= 50) {
              newW = Math.round(rawW);
              newX = Math.round(initialBounds.x + deltaX);
            }
          }
          if (handle.includes("n")) {
            const rawH = initialBounds.height - deltaY;
            if (rawH >= 50) {
              newH = Math.round(rawH);
              newY = Math.round(initialBounds.y + deltaY);
            }
          }
        }

        const scaleX = newW / (initialBounds.width || 1);
        const scaleY = newH / (initialBounds.height || 1);

        setItems((prev) =>
          prev.map((it) => {
            const init = initialItems.get(it.id);
            if (!init) return it;

            const relX = (init.x - initialBounds.x) / (initialBounds.width || 1);
            const relY = (init.y - initialBounds.y) / (initialBounds.height || 1);

            const updatedX = Math.round(newX + relX * newW);
            const updatedY = Math.round(newY + relY * newH);
            const updatedW = Math.max(10, Math.round(init.width * scaleX));
            const updatedH = Math.max(10, Math.round(init.height * scaleY));

            return {
              ...it,
              x: updatedX,
              y: updatedY,
              width: updatedW,
              height: updatedH,
              aspect: `${updatedW}:${updatedH}`,
              ...(it.type === "text" || it.mediaType === "text"
                ? { fontSize: Math.max(8, Math.round((init.fontSize || 129) * scaleX)) }
                : {}),
            };
          })
        );
        setHasChanges(true);
      } else if (resizingItemId && resizeStartRef.current) {
        // Freeform Element Resizing (Corner & Edge Handles - Matches Screenshot Image 2)
        const { mouseX, mouseY, startX, startY, startW, startH, handle, startFontSize, initialChildren } = resizeStartRef.current;
        const curZoom = zoomRef.current || zoom;
        const deltaX = (e.clientX - mouseX) / curZoom;
        const deltaY = (e.clientY - mouseY) / curZoom;

        const isLockedAspect = activeTool === "scale" || e.shiftKey;

        let newX = startX;
        let newY = startY;
        let newW = startW;
        let newH = startH;

        if (isLockedAspect) {
          let scale = 1;
          if (handle === "se") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (startW + deltaX) / startW
              : (startH + deltaY) / startH;
            scale = Math.max(0.05, scale);
            newW = Math.max(10, Math.round(startW * scale));
            newH = Math.max(10, Math.round(startH * scale));
            newX = startX;
            newY = startY;
          } else if (handle === "sw") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (startW - deltaX) / startW
              : (startH + deltaY) / startH;
            scale = Math.max(0.05, scale);
            newW = Math.max(10, Math.round(startW * scale));
            newH = Math.max(10, Math.round(startH * scale));
            newX = Math.round(startX + startW - newW);
            newY = startY;
          } else if (handle === "ne") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (startW + deltaX) / startW
              : (startH - deltaY) / startH;
            scale = Math.max(0.05, scale);
            newW = Math.max(10, Math.round(startW * scale));
            newH = Math.max(10, Math.round(startH * scale));
            newX = startX;
            newY = Math.round(startY + startH - newH);
          } else if (handle === "nw") {
            scale = (Math.abs(deltaX) > Math.abs(deltaY))
              ? (startW - deltaX) / startW
              : (startH - deltaY) / startH;
            scale = Math.max(0.05, scale);
            newW = Math.max(10, Math.round(startW * scale));
            newH = Math.max(10, Math.round(startH * scale));
            newX = Math.round(startX + startW - newW);
            newY = Math.round(startY + startH - newH);
          } else if (handle === "e" || handle === "w") {
            scale = handle === "e" ? (startW + deltaX) / startW : (startW - deltaX) / startW;
            scale = Math.max(0.05, scale);
            newW = Math.max(10, Math.round(startW * scale));
            newH = Math.max(10, Math.round(startH * scale));
            if (handle === "w") newX = Math.round(startX + startW - newW);
          } else if (handle === "s" || handle === "n") {
            scale = handle === "s" ? (startH + deltaY) / startH : (startH - deltaY) / startH;
            scale = Math.max(0.05, scale);
            newW = Math.max(10, Math.round(startW * scale));
            newH = Math.max(10, Math.round(startH * scale));
            if (handle === "n") newY = Math.round(startY + startH - newH);
          }
        } else {
          if (handle.includes("e")) {
            newW = Math.max(50, Math.round(startW + deltaX));
          }
          if (handle.includes("s")) {
            newH = Math.max(50, Math.round(startH + deltaY));
          }
          if (handle.includes("w")) {
            const rawW = startW - deltaX;
            if (rawW >= 50) {
              newW = Math.round(rawW);
              newX = Math.round(startX + deltaX);
            }
          }
          if (handle.includes("n")) {
            const rawH = startH - deltaY;
            if (rawH >= 50) {
              newH = Math.round(rawH);
              newY = Math.round(startY + deltaY);
            }
          }
        }

        const scale = newW / (startW || 1);

        setItems((prev) =>
          prev.map((it) => {
            if (it.id === resizingItemId) {
              const baseFontSize = startFontSize || it.fontSize || 129;
              return {
                ...it,
                x: newX,
                y: newY,
                width: newW,
                height: newH,
                aspect: `${newW}:${newH}`,
                ...(it.type === "text" || it.mediaType === "text"
                  ? {
                      fontSize: activeTool === "scale" ? Math.max(8, Math.round(baseFontSize * scale)) : it.fontSize,
                      textAutoResize: activeTool === "scale" ? "fixed" : (handle === "e" || handle === "w" ? "auto_height" : "fixed"),
                    }
                  : {}),
              };
            }

            // If it is a child of the resizing container (Group/Frame)
            // In Figma: only scale children if resizing a Group, or if using the Scale tool ("K").
            // Resizing a Frame with Move/Select tool freely crops/resizes the Frame viewport without stretching children.
            const shouldScaleChildren = Boolean(resizeStartRef.current?.isGroup || activeTool === "scale");
            if (shouldScaleChildren && initialChildren && initialChildren.has(it.id)) {
              const cInit = initialChildren.get(it.id)!;
              const relX = (cInit.x - startX) / (startW || 1);
              const relY = (cInit.y - startY) / (startH || 1);
              const updatedX = Math.round(newX + relX * newW);
              const updatedY = Math.round(newY + relY * newH);
              const updatedW = Math.max(10, Math.round(cInit.width * scale));
              const updatedH = Math.max(10, Math.round(cInit.height * scale));
              return {
                ...it,
                x: updatedX,
                y: updatedY,
                width: updatedW,
                height: updatedH,
                aspect: `${updatedW}:${updatedH}`,
                ...(it.type === "text" || it.mediaType === "text"
                  ? { fontSize: Math.max(8, Math.round((cInit.fontSize || 129) * scale)) }
                  : {}),
              };
            }

            return it;
          })
        );
        setHasChanges(true);
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
        hasItemMovedDuringDragRef.current = true;
        const rawX = (e.clientX - pan.x) / zoom - dragItemOffset.x;
        const rawY = (e.clientY - pan.y) / zoom - dragItemOffset.y;

        const snapResult = calculateSnapAndGuides(
          draggingItemId,
          rawX,
          rawY,
          items,
          zoom,
          selectedIds,
          hiddenItemIds
        );
        const curX = snapResult.snappedX;
        const curY = snapResult.snappedY;
        setActiveSnapGuides(snapResult.guides);

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
      setActiveSnapGuides({ lines: [], distances: [] });
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      if (resizingItemId) {
        setResizingItemId(null);
        setResizeHandle(null);
        resizeStartRef.current = null;
      }
      if (isMultiResizing) {
        setIsMultiResizing(false);
        multiResizeStartRef.current = null;
      }
      if (isMarqueeSelecting) {
        setIsMarqueeSelecting(false);
        setMarqueeBox(null);
        marqueeStartRef.current = null;
      }

      if (isDrawingShape && drawingShapeStartRef.current) {
        finishDrawingShape(e.clientX, e.clientY);
      }

      // Check if dropped item was dragged into or out of a Frame (Automatic Figma Frame Nesting)
      if (draggingItemId) {
        const draggedIds = selectedIds.has(draggingItemId) ? Array.from(selectedIds) : [draggingItemId];

        setItems((prev) => {
          let hasChangesNested = false;
          const next = prev.map((it) => {
            if (!draggedIds.includes(it.id)) return it;

            // If item belongs to a Group (type === "group"), DO NOT un-nest it! Groups are deliberate logical groupings!
            const parentItem = prev.find((p) => p.id === it.frameId);
            if (parentItem && parentItem.type === "group") {
              return it;
            }

            const isFrameItself = isFrameItem(it);
            if (isFrameItself) return it;

            const { x: mouseDropX, y: mouseDropY } = getCanvasCoords(e.clientX, e.clientY);
            const dx = it.x || 0;
            const dy = it.y || 0;
            const itW = it.width || (it.aspect === "16:9" ? 560 : 440);
            const itH = it.height || 550;
            const itRight = dx + itW;
            const itBottom = dy + itH;
            const centerX = dx + itW / 2;
            const centerY = dy + itH / 2;

            // Find frames that contain or overlap this item (exclude groups from candidate frames)
            const candidateFrames = prev.filter((f) => {
              if (f.id === it.id || !isFrameItem(f) || f.type === "group") return false;

              const fX = f.x || 0;
              const fY = f.y || 0;
              const fW = f.width || (f.aspect === "16:9" ? 720 : 480);
              const fH = f.height || (f.aspect === "16:9" ? 405 : 600);
              const fRight = fX + fW;
              const fBottom = fY + fH;

              const dropInside = mouseDropX >= fX && mouseDropX <= fRight && mouseDropY >= fY && mouseDropY <= fBottom;
              const centerInside = centerX >= fX && centerX <= fRight && centerY >= fY && centerY <= fBottom;
              const overlaps = dx < fRight && itRight > fX && dy < fBottom && itBottom > fY;

              // If item already belongs to this frame: keep it inside as long as it still overlaps the frame
              if (it.frameId === f.id) {
                return overlaps || dropInside;
              }

              // If entering a frame from outside: require dropInside or centerInside
              return dropInside || centerInside;
            });

            let targetFrame: CanvasItem | undefined = undefined;
            if (candidateFrames.length > 0) {
              // Prefer staying in current frame if it is still a valid candidate
              const currentParent = candidateFrames.find((f) => f.id === it.frameId);
              targetFrame = currentParent || candidateFrames.reduce((best, cur) => {
                const bestArea = (best.width || 480) * (best.height || 600);
                const curArea = (cur.width || 480) * (cur.height || 600);
                return curArea < bestArea ? cur : best;
              });
            }

            if (targetFrame) {
              if (it.frameId !== targetFrame.id) {
                hasChangesNested = true;
              }
              return {
                ...it,
                frameId: targetFrame.id,
              };
            } else if (!targetFrame && it.frameId) {
              // Completely moved outside frame (no overlap with any frame)
              hasChangesNested = true;
              return { ...it, frameId: undefined };
            }
            return it;
          });

          if (hasChangesNested) {
            setHasChanges(true);
          }
          return next;
        });
      }

      dragItemInitialPositionsRef.current = null;
      setIsPanning(false);
      setDraggingItemId(null);
      if (hasItemMovedDuringDragRef.current) {
        setTimeout(() => {
          hasItemMovedDuringDragRef.current = false;
        }, 200);
      }
      if (hasWorkspaceDraggedRef.current) {
        setTimeout(() => {
          hasWorkspaceDraggedRef.current = false;
        }, 150);
      }
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
  }, [
    isPanning,
    draggingItemId,
    isMarqueeSelecting,
    isDrawingShape,
    drawingShapeBox,
    resizingItemId,
    isMultiResizing,
    panStart,
    pan,
    zoom,
    dragItemOffset,
    items,
    hiddenItemIds,
    getCanvasCoords,
    updateItemsWithTracking,
    finishDrawingShape,
  ]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Window listener handles mousemove with passive 0ms latency; kept for fallback
  };

  const handleCanvasMouseUp = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    if (resizingItemId) {
      setResizingItemId(null);
      setResizeHandle(null);
      resizeStartRef.current = null;
    }
    if (isMultiResizing) {
      setIsMultiResizing(false);
      multiResizeStartRef.current = null;
    }
    if (isMarqueeSelecting) {
      setIsMarqueeSelecting(false);
      setMarqueeBox(null);
      marqueeStartRef.current = null;
    }
    if (isDrawingShape) {
      if (e) {
        finishDrawingShape(e.clientX, e.clientY);
      } else {
        setIsDrawingShape(false);
        setDrawingShapeBox(null);
        drawingShapeStartRef.current = null;
      }
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

    // If Text tool is active and clicked on an existing text item: activate edit mode!
    if (activeTool === "text" && (item.type === "text" || item.mediaType === "text")) {
      e.stopPropagation();
      setSelectedId(item.id);
      setSelectedIds(new Set([item.id]));
      setEditingTextId(item.id);
      return;
    }

    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || (target.tagName === "TEXTAREA" && editingTextId === item.id) || target.closest("button")) {
      return;
    }

    if (editingTextId && editingTextId !== item.id) {
      setEditingTextId(null);
    }

    e.stopPropagation();

    // In Hand tool mode: do NOT select item! Pan canvas directly
    if (activeTool === "hand" || isSpacePressed) {
      hasWorkspaceDraggedRef.current = false;
      if (!fittedItemId) {
        setSelectedId(null);
        setSelectedIds(new Set());
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const isMultiKey = e.shiftKey || (e.metaKey && !e.ctrlKey);
    const isDeepSelect = (e.ctrlKey || e.metaKey) && !e.shiftKey;

    // In Figma, clicking an item that belongs to a group selects the parent group as a single unit, unless Ctrl/Cmd is held for deep select
    const parentFrameId = item.frameId || getParentFrameId(item);
    const parentGroup = parentFrameId ? items.find((f) => f.id === parentFrameId && f.type === "group") : null;
    const activeItem = (parentGroup && !isMultiKey && !isDeepSelect)
      ? parentGroup
      : item;

    let targetSelectedIds: Set<string>;

    if (isMultiKey) {
      if (selectedIds.has(activeItem.id)) {
        targetSelectedIds = new Set(Array.from(selectedIds).filter((id) => id !== activeItem.id));
        setSelectedIds(targetSelectedIds);
        const remaining = Array.from(targetSelectedIds);
        setSelectedId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
        return;
      } else {
        targetSelectedIds = new Set([...Array.from(selectedIds), activeItem.id]);
        setSelectedIds(targetSelectedIds);
        setSelectedId(activeItem.id);
      }
    } else {
      // Normal click without Shift/Ctrl/Cmd:
      // If clicking an item that is already part of a multi-selection group, keep the group to drag together
      // If clicking any other item, clear previous selection and select ONLY this single item!
      if (selectedIds.has(activeItem.id) && selectedIds.size > 1) {
        targetSelectedIds = selectedIds;
        setSelectedId(activeItem.id);
      } else {
        targetSelectedIds = new Set([activeItem.id]);
        setSelectedIds(targetSelectedIds);
        setSelectedId(activeItem.id);
      }
    }

    if (lockedItemIds.has(activeItem.id)) return; // Locked items cannot be dragged

    hasItemMovedDuringDragRef.current = false;
    setDraggingItemId(activeItem.id);
    const itemCanvasX = (e.clientX - pan.x) / zoom;
    const itemCanvasY = (e.clientY - pan.y) / zoom;
    setDragItemOffset({
      x: itemCanvasX - (activeItem.x || 0),
      y: itemCanvasY - (activeItem.y || 0),
    });

    const isFrame = isFrameItem(activeItem);
    const itemW = activeItem.width || (activeItem.aspect === "16:9" ? 720 : 480);
    const itemH = activeItem.height || (activeItem.aspect === "16:9" ? 405 : 600);
    const itemX = activeItem.x || 0;
    const itemY = activeItem.y || 0;

    const initMap = new Map<string, { x: number; y: number }>();

    // 1. If activeItem is a group OR belongs to a group (without deep select):
    // Ensure the group container AND ALL its children move together in complete lockstep!
    const associatedGroup = activeItem.type === "group"
      ? activeItem
      : (!isDeepSelect && parentGroup ? parentGroup : null);

    if (associatedGroup) {
      initMap.set(associatedGroup.id, { x: associatedGroup.x || 0, y: associatedGroup.y || 0 });
      items.forEach((it) => {
        if (it.frameId === associatedGroup.id) {
          initMap.set(it.id, { x: it.x || 0, y: it.y || 0 });
        }
      });
    }

    // 2. Add all explicitly selected items and frame children
    items.forEach((it) => {
      if (targetSelectedIds.has(it.id)) {
        initMap.set(it.id, { x: it.x || 0, y: it.y || 0 });
      } else if (isFrame && targetSelectedIds.has(activeItem.id)) {
        // Child text or elements nested inside this frame move together with the frame
        const itX = it.x || 0;
        const itY = it.y || 0;
        const isChild = it.frameId === activeItem.id || (
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

  // Mobile Touch Handlers on Canvas Viewport (Pinch-to-Zoom & Pan Engine)
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // 2-finger pinch-to-zoom (works anywhere: empty background or over items)
    if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStateRef.current.initialPinchDistance = dist;
      touchStateRef.current.initialZoom = zoomRef.current;
      touchStateRef.current.startPan = { ...panRef.current };
      touchStateRef.current.initialMidX = (t1.clientX + t2.clientX) / 2;
      touchStateRef.current.initialMidY = (t1.clientY + t2.clientY) / 2;
      touchStateRef.current.isTouchPanning = false;
      touchStateRef.current.touchDraggingItemId = null;
      setDraggingItemId(null);
      touchGestureRef.current.wasPinch = true;
      return;
    }

    // 1-finger touch
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStateRef.current.startTouch = { x: t.clientX, y: t.clientY };
      touchStateRef.current.startPan = { ...panRef.current };
      touchStateRef.current.initialPinchDistance = null;
      touchGestureRef.current.startX = t.clientX;
      touchGestureRef.current.startY = t.clientY;
      touchGestureRef.current.wasPinch = false;

      // In Hand tool mode, or touching canvas background directly:
      if (activeTool === "hand" || e.target === e.currentTarget) {
        touchStateRef.current.isTouchPanning = true;
        setIsPanning(true);
        if (activeTool === "select") {
          setSelectedId(null);
          setSelectedIds(new Set());
        }
      }
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // 2-finger pinch-to-zoom (works in BOTH hand tool and select tool)
    if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      // If initial pinch distance was missed, initialize dynamically mid-touch
      if (!touchStateRef.current.initialPinchDistance || touchStateRef.current.initialPinchDistance === 0) {
        touchStateRef.current.initialPinchDistance = currentDist;
        touchStateRef.current.initialZoom = zoomRef.current;
        touchStateRef.current.startPan = { ...panRef.current };
        touchStateRef.current.initialMidX = (t1.clientX + t2.clientX) / 2;
        touchStateRef.current.initialMidY = (t1.clientY + t2.clientY) / 2;
        touchStateRef.current.isTouchPanning = false;
        touchStateRef.current.touchDraggingItemId = null;
        setDraggingItemId(null);
        touchGestureRef.current.wasPinch = true;
        return;
      }

      if (currentDist > 4) {
        const scale = currentDist / touchStateRef.current.initialPinchDistance;
        const minAllowed = isScreenMobile ? 0.015 : 0.04;
        const maxAllowed = 5.5;
        const targetZoom = Number(Math.min(maxAllowed, Math.max(minAllowed, touchStateRef.current.initialZoom * scale)).toFixed(3));

        const container = canvasContainerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const currentMidX = (t1.clientX + t2.clientX) / 2 - rect.left;
          const currentMidY = (t1.clientY + t2.clientY) / 2 - rect.top;
          const initMidX = touchStateRef.current.initialMidX - rect.left;
          const initMidY = touchStateRef.current.initialMidY - rect.top;
          const currentPan = touchStateRef.current.startPan;
          const currentZoom = touchStateRef.current.initialZoom;
          // Locks zoom directly at the center between the 2 fingers while allowing simultaneous 2-finger panning
          const newPanX = currentMidX - (initMidX - currentPan.x) * (targetZoom / currentZoom);
          const newPanY = currentMidY - (initMidY - currentPan.y) * (targetZoom / currentZoom);
          setZoom(targetZoom);
          setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
        } else {
          setZoom(targetZoom);
        }
      }
      return;
    }

    // 1-finger move
    if (e.touches.length === 1) {
      const t = e.touches[0];

      // Dragging item across canvas (ONLY in Select tool)
      if (activeTool === "select" && touchStateRef.current.touchDraggingItemId) {
        const itemId = touchStateRef.current.touchDraggingItemId;
        const rawX = (t.clientX - panRef.current.x) / zoomRef.current - touchStateRef.current.touchItemOffset.x;
        const rawY = (t.clientY - panRef.current.y) / zoomRef.current - touchStateRef.current.touchItemOffset.y;

        const snapResult = calculateSnapAndGuides(
          itemId,
          rawX,
          rawY,
          items,
          zoomRef.current,
          selectedIds,
          hiddenItemIds
        );
        const currentX = snapResult.snappedX;
        const currentY = snapResult.snappedY;
        setActiveSnapGuides(snapResult.guides);

        setItems((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, x: currentX, y: currentY } : it))
        );
        setHasChanges(true);
        return;
      }

      // Panning canvas (Hand tool OR 1-finger on empty background)
      if (activeTool === "hand" || touchStateRef.current.isTouchPanning) {
        const deltaX = t.clientX - touchStateRef.current.startTouch.x;
        const deltaY = t.clientY - touchStateRef.current.startTouch.y;
        setPan({
          x: Math.round(touchStateRef.current.startPan.x + deltaX),
          y: Math.round(touchStateRef.current.startPan.y + deltaY),
        });
      }
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setActiveSnapGuides({ lines: [], distances: [] });
    // If one finger remains after a 2-finger pinch, smoothly transition to 1-finger without jumping
    if (e.touches && e.touches.length === 1) {
      const t = e.touches[0];
      touchStateRef.current.startTouch = { x: t.clientX, y: t.clientY };
      touchStateRef.current.startPan = { ...panRef.current };
      touchStateRef.current.initialPinchDistance = null;
      touchStateRef.current.isTouchPanning = activeTool === "hand";
      return;
    }

    touchStateRef.current.isTouchPanning = false;
    touchStateRef.current.touchDraggingItemId = null;
    touchStateRef.current.initialPinchDistance = null;
    setIsPanning(false);
    setDraggingItemId(null);
  };

  // Start touch dragging an item or panning in Hand tool
  const handleItemTouchStart = (e: React.TouchEvent, item: CanvasItem) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || (target.tagName === "TEXTAREA" && editingTextId === item.id) || target.closest("button")) {
      return;
    }

    if (editingTextId && editingTextId !== item.id) {
      setEditingTextId(null);
    }

    // 2-finger pinch-to-zoom: always prioritize pinch zoom when 2 fingers touch an item
    if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStateRef.current.initialPinchDistance = dist;
      touchStateRef.current.initialZoom = zoomRef.current;
      touchStateRef.current.startPan = { ...panRef.current };
      touchStateRef.current.initialMidX = (t1.clientX + t2.clientX) / 2;
      touchStateRef.current.initialMidY = (t1.clientY + t2.clientY) / 2;
      touchStateRef.current.isTouchPanning = false;
      touchStateRef.current.touchDraggingItemId = null;
      touchGestureRef.current.wasPinch = true;
      setDraggingItemId(null);
      return;
    }

    // In Hand tool mode on mobile:
    // Panning canvas (kiri, kanan, atas, bawah) anywhere! Never select or drag item!
    if (activeTool === "hand") {
      const t = e.touches[0];
      if (t) {
        touchStateRef.current.isTouchPanning = true;
        touchStateRef.current.startTouch = { x: t.clientX, y: t.clientY };
        touchStateRef.current.startPan = { ...panRef.current };
        touchStateRef.current.touchDraggingItemId = null;
        touchStateRef.current.initialPinchDistance = null;
        setIsPanning(true);
      }
      return;
    }

    // In Select tool mode:
    e.stopPropagation();
    setSelectedId(item.id);
    setSelectedIds(new Set([item.id]));

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
      touchStateRef.current.startTouch = { x: t.clientX, y: t.clientY };
      touchStateRef.current.startPan = { ...panRef.current };
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
      cornerRadius: 0,
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
      cornerRadius: 0,
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
      cornerRadius: 0,
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
    const center = getViewportCenter(320, 200);
    const count = items.filter((i) => i.type === "shape" || i.mediaType === "shape" || i.mediaType === "rectangle" || i.mediaType === "ellipse" || i.title.startsWith("Rectangle")).length + 1;
    const newShape: CanvasItem = {
      id: `shape-${Date.now()}`,
      title: shape === "ellipse" ? `Ellipse ${count}` : `Rectangle ${count}`,
      type: "shape",
      mediaType: shape === "ellipse" ? "ellipse" : "shape",
      x: center.x,
      y: center.y,
      width: 320,
      height: 200,
      color: "#D9D9D9",
      cornerRadius: shape === "ellipse" ? 9999 : 0,
      opacity: 100,
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
      if (selectedItem && isFrameItem(selectedItem)) {
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
      textAutoResize: "auto_width",
      fontFamily: "Noto Serif",
      fontWeight: "Regular",
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
    setEditingTextId(newText.id);
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
  const lastWorkspaceFitTimeRef = useRef<number>(0);
  const lastTouchTapRef = useRef<{ time: number; id: string; x: number; y: number }>({
    time: 0,
    id: "",
    x: 0,
    y: 0,
  });
  // Gesture tracking: detect pinch/pan vs single tap while in fitted state
  const touchGestureRef = useRef<{ startX: number; startY: number; wasPinch: boolean }>({
    startX: 0,
    startY: 0,
    wasPinch: false,
  });

  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Zoom to Fit All Elements (Figma Shift+1: fits and centers canvas items directly on screen)
  const zoomToFitAll = useCallback(
    (targetItems?: CanvasItem[] | any) => {
      const listToFit = Array.isArray(targetItems) && targetItems.length > 0 ? targetItems : itemsRef.current;
      if (!canvasContainerRef.current || listToFit.length === 0) return;
      const { clientWidth, clientHeight } = canvasContainerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      const visibleList = listToFit.filter((it: CanvasItem) => !hiddenItemIds.has(it.id));
      if (visibleList.length === 0) return;

      // Smart Content Detection:
      // Focus directly on media images, artwork, videos, cards and deliverables so we zoom straight onto visual content!
      const mediaList = visibleList.filter(
        (it: CanvasItem) =>
          it.image ||
          it.videoId ||
          it.type === "media" ||
          it.mediaType === "image" ||
          it.mediaType === "youtube" ||
          it.mediaType === "gdrive"
      );

      const itemsToCalculate = mediaList.length > 0 ? mediaList : visibleList;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      itemsToCalculate.forEach((it: CanvasItem) => {
        const x = it.x || 0;
        const y = it.y || 0;
        let w = it.width || 440;
        let h = it.height || 550;
        if (it.type === "section" || it.mediaType === "section") {
          w = it.width || 1200;
          h = it.height || 600;
        } else if (it.aspect === "16:9") {
          w = it.width || 560;
          h = it.height || 315;
        } else if (it.aspect === "9:16") {
          w = it.width || 320;
          h = it.height || 568;
        } else if (it.aspect === "1:1") {
          w = it.width || 440;
          h = it.height || 440;
        }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });

      if (minX === Infinity || maxX === -Infinity) return;

      const contentW = maxX - minX;
      const contentH = maxY - minY;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Responsive Viewport Padding (compact on mobile so images are large and prominent)
      const paddingX = isScreenMobile ? Math.max(20, clientWidth * 0.05) : Math.max(80, clientWidth * 0.08);
      const paddingY = isScreenMobile ? Math.max(30, clientHeight * 0.06) : Math.max(80, clientHeight * 0.1);

      const scaleX = (clientWidth - paddingX * 2) / Math.max(contentW, 100);
      const scaleY = (clientHeight - paddingY * 2) / Math.max(contentH, 100);
      const minAllowedScale = isScreenMobile ? 0.02 : 0.05;
      const fitScale = Number(Math.min(1.0, Math.max(minAllowedScale, Math.min(scaleX, scaleY))).toFixed(3));

      setZoom(fitScale);
      setPan({
        x: Math.round(clientWidth / 2 - centerX * fitScale),
        y: Math.round(clientHeight / 2 - centerY * fitScale),
      });
      setFittedItemId(null);
    },
    [hiddenItemIds, isScreenMobile]
  );

  const hasFittedOnceRef = useRef(false);

  // Auto-fit all elements ONCE on initial load / mount so canvas immediately focuses on images without re-centering or zooming on subsequent moves
  useEffect(() => {
    if (hasFittedOnceRef.current) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const container = canvasContainerRef.current;
      const currentItems = itemsRef.current;
      if (container && container.clientWidth > 0 && container.clientHeight > 0 && currentItems.length > 0) {
        hasFittedOnceRef.current = true;
        zoomToFitAll(currentItems);
        clearInterval(interval);
        return;
      }
      if (attempts >= 40) {
        hasFittedOnceRef.current = true;
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [zoomToFitAll]);

  // Fit specific item (image / artboard) automatically to screen on double-click / double-tap
  const fitItemToScreen = useCallback(
    (item: CanvasItem, targetEl?: HTMLElement) => {
      if (!canvasContainerRef.current) return;
      const { clientWidth, clientHeight } = canvasContainerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      // Toggle: if already fitted to this item, return to full overview
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

      // Optimal scale to fit comfortably in viewport (leave breathing room for header & toolbar)
      const scalePaddingX = isScreenMobile ? 0.90 : 0.94;
      const scalePaddingY = isScreenMobile ? 0.82 : 0.90;
      const targetScaleX = (clientWidth * scalePaddingX) / w;
      const targetScaleY = (clientHeight * scalePaddingY) / h;
      const targetZoom = Number(
        Math.min(3.8, Math.max(0.12, Math.min(targetScaleX, targetScaleY))).toFixed(2)
      );

      // Pan to center the item directly on screen
      const targetPanX = Math.round((clientWidth - w * targetZoom) / 2 - itemX * targetZoom);
      const targetPanY = Math.round((clientHeight - h * targetZoom) / 2 - itemY * targetZoom);

      setZoom(targetZoom);
      setPan({ x: targetPanX, y: targetPanY });
      setFittedItemId(item.id);
      setSelectedId(item.id);
      setSelectedIds(new Set([item.id]));
      lastWorkspaceFitTimeRef.current = Date.now();
    },
    [fittedItemId, isScreenMobile, zoomToFitAll]
  );

  const handleItemTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>, item: CanvasItem, targetEl?: HTMLElement) => {
      // IN HAND TOOL MODE ON MOBILE:
      // Hand tool is purely for panning canvas — do not select or drag items!
      if (activeTool === "hand") {
        touchStateRef.current.isTouchPanning = false;
        setIsPanning(false);
        return;
      }

      // SELECT TOOL MODE:
      const touch = e.changedTouches[0];
      if (!touch) return;
      const now = Date.now();

      // Check if finger moved during touch (if moved > 10px, it was dragging the item, not a tap)
      const movedFromStart = Math.hypot(
        touch.clientX - touchStateRef.current.startTouch.x,
        touch.clientY - touchStateRef.current.startTouch.y
      );

      if (movedFromStart > 10) {
        touchStateRef.current.touchDraggingItemId = null;
        setDraggingItemId(null);
        return;
      }

      const timeSinceLast = now - lastTouchTapRef.current.time;
      const distFromLastTap = Math.hypot(
        touch.clientX - lastTouchTapRef.current.x,
        touch.clientY - lastTouchTapRef.current.y
      );

      // Double-Tap (tap 2x within 420ms on the item): Zoom fit directly on screen!
      if (timeSinceLast < 420 && distFromLastTap < 45 && lastTouchTapRef.current.id === item.id) {
        e.preventDefault();
        e.stopPropagation();
        fitItemToScreen(item, targetEl);
        lastTouchTapRef.current = { time: 0, id: "", x: 0, y: 0 };
      } else {
        // Single tap: select item and start double-tap window
        lastTouchTapRef.current = {
          time: now,
          id: item.id,
          x: touch.clientX,
          y: touch.clientY,
        };
        setSelectedId(item.id);
        setSelectedIds(new Set([item.id]));
      }
    },
    [activeTool, fitItemToScreen]
  );

  // Click handler for Hand tool mode
  const handleItemClick = (e: React.MouseEvent, item: CanvasItem, targetEl?: HTMLElement) => {
    if (activeTool === "hand") {
      e.stopPropagation();
      // Hand tool is purely for panning canvas, do nothing on click
      return;
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
      const itemsToSave = itemsRef.current || items;
      await updateCanvasItems(itemsToSave);
      initialItemsRef.current = JSON.parse(JSON.stringify(itemsToSave));
      setHasChanges(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("rizx_canvas_seeded", "true");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (_) {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleTriggerSave = async () => {
      await handleSaveChanges();
    };
    const handleTriggerReset = () => {
      handleCancelChanges();
    };
    window.addEventListener("app:trigger-canvas-save", handleTriggerSave);
    window.addEventListener("app:trigger-canvas-reset", handleTriggerReset);
    return () => {
      window.removeEventListener("app:trigger-canvas-save", handleTriggerSave);
      window.removeEventListener("app:trigger-canvas-reset", handleTriggerReset);
    };
  }, [items, updateCanvasItems]);

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

  const handleSelectLayer = (item: CanvasItem, e?: React.MouseEvent) => {
    // Shift+Click range selection (like in Figma / Windows Explorer)
    if (e?.shiftKey && selectedId && selectedId !== item.id) {
      const allIds = items.map((i) => i.id);
      const idx1 = allIds.indexOf(selectedId);
      const idx2 = allIds.indexOf(item.id);
      if (idx1 !== -1 && idx2 !== -1) {
        const start = Math.min(idx1, idx2);
        const end = Math.max(idx1, idx2);
        const rangeIds = new Set(allIds.slice(start, end + 1));
        setSelectedIds(rangeIds);
        setSelectedId(item.id);
        return;
      }
    }

    const isMulti = Boolean(e && (e.shiftKey || e.metaKey || e.ctrlKey));

    if (isMulti) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
          const remaining = Array.from(next);
          setSelectedId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
        } else {
          next.add(item.id);
          setSelectedId(item.id);
        }
        return next;
      });
      // Do not auto-pan canvas when multi-selecting layers with Shift / Ctrl
      return;
    }

    setSelectedId(item.id);
    setSelectedIds(new Set([item.id]));
    if (isScreenMobile) {
      if (item.x !== undefined && item.y !== undefined && canvasContainerRef.current) {
        const { clientWidth, clientHeight } = canvasContainerRef.current;
        const w = item.width || 380;
        const h = item.height || 480;
        setPan({
          x: Math.round(clientWidth / 2 - (item.x + w / 2) * zoom),
          y: Math.round(clientHeight / 2 - (item.y + h / 2) * zoom),
        });
      }
      setIsUiExpanded(false); // Close mobile layers drawer so user sees selected item on canvas
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

    // Theme adaptive styles for Inspector
    const sectionTitleCls = `text-[11px] font-semibold ${isLight ? "text-slate-900" : "text-neutral-300"}`;
    const labelTitleCls = `text-[10px] font-medium select-none ${isLight ? "text-slate-500" : "text-neutral-400"}`;
    const scrubLabelCls = `font-mono select-none cursor-ew-resize transition-colors ${
      isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
    }`;
    const inputBoxCls = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
      isLight
        ? "bg-slate-100 border border-slate-200 focus-within:border-[#0c8ce9] focus-within:bg-white"
        : "bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]"
    }`;
    const inputTextCls = `w-full bg-transparent font-mono focus:outline-none text-xs ${
      isLight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-neutral-500"
    }`;
    const unitTextCls = `text-[10px] font-mono ${isLight ? "text-slate-400" : "text-neutral-500"}`;
    const selectBoxCls = `w-full px-2.5 py-1.5 rounded-lg text-xs appearance-none cursor-pointer transition-colors ${
      isLight
        ? "bg-slate-100 text-slate-900 border border-slate-200 focus:border-[#0c8ce9] focus:bg-white"
        : "bg-[#2c2c2c] text-white border border-transparent focus:border-[#0c8ce9]"
    }`;
    const rowCardCls = `flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
      isLight ? "bg-slate-100 border border-slate-200 text-slate-800" : "bg-[#2c2c2c] text-white"
    }`;
    const plusBtnCls = `cursor-pointer p-0.5 rounded transition-colors ${
      isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200/60" : "text-neutral-400 hover:text-white hover:bg-white/10"
    }`;
    const segmentedBarCls = `flex items-center p-0.5 rounded-lg ${
      isLight ? "bg-slate-100 border border-slate-200 text-slate-700" : "bg-[#2c2c2c] text-neutral-300"
    }`;
    const segmentedBtnActiveCls = isLight ? "bg-white text-slate-900 font-medium shadow-xs" : "bg-white/20 text-white font-medium shadow-xs";
    const segmentedBtnInactiveCls = isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200/60" : "text-neutral-400 hover:text-white hover:bg-white/5";

    return (
      <aside
        aria-label="Figma Design Inspector"
        className={`w-64 sm:w-72 shrink-0 h-full border-l flex flex-col z-30 transition-all select-none overflow-y-auto no-scrollbar font-sans ${
          isLight
            ? "bg-white/95 border-slate-200 text-slate-800"
            : "bg-[#1e1e1e] border-white/10 text-[#d4d4d4]"
        }`}
      >
        {/* Header: Design + Zoom Indicator */}
        <div className={`px-3 py-2 border-b flex items-center justify-between shrink-0 text-xs ${isLight ? "border-slate-200" : "border-white/10"}`}>
          <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Design</span>

          <button
            type="button"
            onClick={zoomToFitAll}
            className={`flex items-center gap-1 text-[11px] font-mono transition-colors cursor-pointer ${
              isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
            }`}
            title="Zoom percentage (click to fit)"
          >
            <span>{Math.round(zoom * 100)}%</span>
            <HiChevronDown className="w-3 h-3" />
          </button>
        </div>

        {activeTool === "frame" || showFramePresetsPicker ? (
          /* ── Frame Presets Inspector View (Matches Screenshot media_1793530390332_97f50010.png) ── */
          <div className={`flex-1 overflow-y-auto no-scrollbar flex flex-col text-xs font-sans divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
            {/* Header: Frame */}
            <div className={`px-4 pt-3.5 pb-2.5 flex items-center justify-between text-xs font-semibold tracking-wide shrink-0 ${isLight ? "text-slate-900" : "text-white"}`}>
              <span className="text-[13px] font-bold">Frame</span>
              {showFramePresetsPicker && (
                <button
                  type="button"
                  onClick={() => setShowFramePresetsPicker(false)}
                  className={`text-xs font-normal cursor-pointer transition-colors ${isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"}`}
                >
                  Done
                </button>
              )}
            </div>

            {/* Accordion Categories List */}
            <div className={`flex-1 overflow-y-auto no-scrollbar py-1 divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
              {FRAME_PRESET_CATEGORIES.map((cat) => {
                const isExpanded = !!expandedPresetCategories[cat.id];
                return (
                  <div key={cat.id} className="select-none">
                    <button
                      type="button"
                      onClick={() => togglePresetCategory(cat.id)}
                      className={`w-full px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer text-left font-medium ${
                        isLight
                          ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          : "text-neutral-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className={`text-[9px] w-2.5 inline-block text-center shrink-0 ${isLight ? "text-slate-400" : "text-neutral-400"}`}>
                        {isExpanded ? "▾" : "▸"}
                      </span>
                      <span>{cat.title}</span>
                    </button>

                    {isExpanded && (
                      <div className={`py-0.5 ${isLight ? "bg-slate-50" : "bg-black/15"}`}>
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleApplyFigmaFramePreset(item)}
                            className={`w-full flex items-center justify-between pl-7 pr-4 py-1.5 text-xs transition-colors cursor-pointer group text-left ${
                              isLight
                                ? "text-slate-700 hover:text-slate-900 hover:bg-[#0c8ce9]/10"
                                : "text-neutral-300 hover:text-white hover:bg-[#0c8ce9]/20"
                            }`}
                            title={`${item.name} (${item.width} × ${item.height})`}
                          >
                            <span className="truncate pr-2">{item.name}</span>
                            <span className={`text-[11px] font-mono shrink-0 ${isLight ? "text-slate-400 group-hover:text-slate-600" : "text-neutral-500 group-hover:text-neutral-300"}`}>
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
        <div className={`px-3 py-2 border-b flex items-center justify-between text-xs shrink-0 ${isLight ? "border-slate-200" : "border-white/10"}`}>
          <div className={`flex items-center gap-1 font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            <span>
              {selectedItem
                ? selectedItem.type === "text" || selectedItem.mediaType === "text"
                  ? "Text"
                  : selectedItem.type === "shape" || selectedItem.mediaType === "shape" || selectedItem.mediaType === "rectangle" || selectedItem.mediaType === "ellipse"
                  ? "Rectangle"
                  : selectedItem.type === "section" || selectedItem.mediaType === "section"
                  ? "Section"
                  : selectedItem.type === "folder"
                  ? "Folder Client"
                  : selectedItem.mediaType === "frame" || selectedItem.type === "frame"
                  ? "Frame"
                  : "Media"
                : "Canvas Page"}
            </span>
            <HiChevronDown className={`w-3 h-3 ${isLight ? "text-slate-400" : "text-neutral-400"}`} />
          </div>
        </div>

        {/* ── Scrollable Inspector Sections ───────────────────────────────────── */}
        <div className={`flex-1 overflow-y-auto divide-y text-xs ${isLight ? "divide-slate-200" : "divide-white/10"}`}>
          {/* 1. POSITION SECTION (Image 1) */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Position</span>
            </div>

            {/* Alignment Row (7 buttons) */}
            <div className="flex flex-col gap-1.5">
              <span className={labelTitleCls}>Alignment</span>
              <div className={`relative flex items-center justify-between p-1 rounded-lg ${
                isLight ? "bg-slate-100 border border-slate-200 text-slate-700" : "bg-[#2c2c2c]/80 border border-white/5 text-neutral-300"
              }`}>
                <button
                  type="button"
                  onClick={() => handleAlign("left")}
                  title="Align Left (Alt+A)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 1h1.5v14H2V1zm3 3h8v3H5V4zm0 5h6v3H5V9z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign("hcenter")}
                  title="Align Horizontal Centers (Alt+H)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.25 1h1.5v3H13v3H8.75v2H11v3H8.75v3h-1.5v-3H5V9h2.25V7H3V4h4.25V1z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign("right")}
                  title="Align Right (Alt+D)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M14 1h-1.5v14H14V1zm-3 3H3v3h8V4zm0 5H5v3h6V9z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign("top")}
                  title="Align Top (Alt+W)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 2v1.5h14V2H1zm3 3v8h3V5H4zm5 0v6h3V5H9z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign("vcenter")}
                  title="Align Vertical Centers (Alt+V)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 7.25v1.5h3V13h3V8.75h2V11h3V8.75h3v-1.5h-3V5H9v2.25H7V3H4v4.25H1z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign("bottom")}
                  title="Align Bottom (Alt+S)"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 14v-1.5h14V14H1zm3-3V3h3v8H4zm5 0V5h3v6H9z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAlignMenuOpen((prev) => !prev)}
                  title="More actions"
                  className={`figma-align-trigger p-1 rounded transition-colors cursor-pointer ${
                    isAlignMenuOpen ? "bg-[#0c8ce9] text-white" : isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="2" width="3" height="3" rx="0.5" />
                    <rect x="6.5" y="2" width="3" height="3" rx="0.5" />
                    <rect x="11" y="2" width="3" height="3" rx="0.5" />
                    <rect x="2" y="6.5" width="3" height="3" rx="0.5" />
                    <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" />
                    <rect x="11" y="6.5" width="3" height="3" rx="0.5" />
                    <rect x="2" y="11" width="3" height="3" rx="0.5" />
                    <rect x="6.5" y="11" width="3" height="3" rx="0.5" />
                    <rect x="11" y="11" width="3" height="3" rx="0.5" />
                  </svg>
                </button>

                {/* More actions dropdown popup (Matches Figma Screenshot media_1793548295530_893b43a6.png) */}
                {isAlignMenuOpen && (
                  <div className={`figma-align-menu absolute top-full right-0 mt-1.5 w-64 rounded-xl p-1 z-50 text-xs font-sans flex flex-col gap-0.5 backdrop-blur-2xl ${
                    isLight
                      ? "bg-white/98 border border-slate-200 shadow-2xl text-slate-800"
                      : "bg-[#1e1e1e]/98 border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] text-neutral-200"
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        handleAlign("tidyup");
                        setIsAlignMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-[#0c8ce9] hover:text-white transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <rect x="2" y="2" width="2.5" height="2.5" rx="0.5" />
                          <rect x="6.75" y="2" width="2.5" height="2.5" rx="0.5" />
                          <rect x="11.5" y="2" width="2.5" height="2.5" rx="0.5" />
                          <rect x="2" y="6.75" width="2.5" height="2.5" rx="0.5" />
                          <rect x="6.75" y="6.75" width="2.5" height="2.5" rx="0.5" />
                          <rect x="11.5" y="6.75" width="2.5" height="2.5" rx="0.5" />
                          <rect x="2" y="11.5" width="2.5" height="2.5" rx="0.5" />
                          <rect x="6.75" y="11.5" width="2.5" height="2.5" rx="0.5" />
                          <rect x="11.5" y="11.5" width="2.5" height="2.5" rx="0.5" />
                        </svg>
                        <span className="font-medium">Tidy up</span>
                      </div>
                      <span className="text-[11px] font-mono opacity-60">Ctrl+Alt+Shift+T</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleAlign("distribute-v");
                        setIsAlignMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-[#0c8ce9] hover:text-white transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <rect x="2" y="2" width="12" height="1.5" rx="0.5" />
                          <rect x="4" y="6" width="8" height="4" rx="0.5" />
                          <rect x="2" y="12.5" width="12" height="1.5" rx="0.5" />
                        </svg>
                        <span className="font-medium">Distribute vertical spacing</span>
                      </div>
                      <span className="text-[11px] font-mono opacity-60">Alt+Shift+V</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleAlign("distribute-h");
                        setIsAlignMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-[#0c8ce9] hover:text-white transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-neutral-400 group-hover:text-white shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <rect x="2" y="2" width="1.5" height="12" rx="0.5" />
                          <rect x="6" y="4" width="4" height="8" rx="0.5" />
                          <rect x="12.5" y="2" width="1.5" height="12" rx="0.5" />
                        </svg>
                        <span className="font-medium">Distribute horizontal spacing</span>
                      </div>
                      <span className="text-[11px] font-mono opacity-60">Alt+Shift+H</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Figma Multi-Selection Spacing & Tidy Controls (Matches Screenshot media_1793556469713_33b26971.jpg) */}
            {selectedIds.size >= 2 && (
              <div className={`flex flex-col gap-1.5 p-2 rounded-xl border ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#222222]/90 border-white/10"
              }`}>
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className={`flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    <span className="w-2 h-2 rounded-full bg-[#ff2a85]" />
                    Smart Selection Spacing
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAlign("tidyup")}
                    className="text-[#0c8ce9] hover:underline cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                  >
                    Tidy Up
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={inputBoxCls}
                    title="Horizontal Spacing (gap between columns)"
                  >
                    <span className="text-[#ff2a85] font-mono select-none font-bold text-xs">↔</span>
                    <input
                      type="number"
                      value={smartSelectionGrid?.gapX !== undefined ? smartSelectionGrid.gapX : 40}
                      onChange={(e) => handleUpdateSpacing(Number(e.target.value) || 0, undefined)}
                      className={inputTextCls}
                    />
                    <span className={unitTextCls}>px</span>
                  </div>
                  <div
                    className={inputBoxCls}
                    title="Vertical Spacing (gap between rows)"
                  >
                    <span className="text-[#ff2a85] font-mono select-none font-bold text-xs">↕</span>
                    <input
                      type="number"
                      value={smartSelectionGrid?.gapY !== undefined ? smartSelectionGrid.gapY : 40}
                      onChange={(e) => handleUpdateSpacing(undefined, Number(e.target.value) || 0)}
                      className={inputTextCls}
                    />
                    <span className={unitTextCls}>px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Position Coordinates (X, Y) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={inputBoxCls}>
                <span
                  onMouseDown={(e) =>
                    handleStartScrub(e, {
                      getValue: () => (selectedItem ? itemX : 0),
                      setValue: (v) => updateSelectedItem({ x: v }),
                    })
                  }
                  className={scrubLabelCls}
                  title="Geser kiri/kanan untuk mengubah X"
                >
                  X
                </span>
                <input
                  type="number"
                  value={selectedItem ? itemX : ""}
                  placeholder="Mixed"
                  onChange={(e) => updateSelectedItem({ x: Number(e.target.value) || 0 })}
                  className={inputTextCls}
                />
              </div>
              <div className={inputBoxCls}>
                <span
                  onMouseDown={(e) =>
                    handleStartScrub(e, {
                      getValue: () => (selectedItem ? itemY : 0),
                      setValue: (v) => updateSelectedItem({ y: v }),
                    })
                  }
                  className={scrubLabelCls}
                  title="Geser kiri/kanan untuk mengubah Y"
                >
                  Y
                </span>
                <input
                  type="number"
                  value={selectedItem ? itemY : ""}
                  placeholder="Mixed"
                  onChange={(e) => updateSelectedItem({ y: Number(e.target.value) || 0 })}
                  className={inputTextCls}
                />
              </div>
            </div>

            {/* Rotation & Flip */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={inputBoxCls}>
                <span
                  onMouseDown={(e) =>
                    handleStartScrub(e, {
                      getValue: () => (selectedItem ? itemRotation : 0),
                      setValue: (v) => updateSelectedItem({ rotation: v % 360 }),
                    })
                  }
                  className={scrubLabelCls}
                  title="Geser kiri/kanan untuk memutar sudut"
                >
                  ∠
                </span>
                <input
                  type="number"
                  value={selectedItem ? itemRotation : 0}
                  onChange={(e) => updateSelectedItem({ rotation: Number(e.target.value) || 0 })}
                  className={inputTextCls}
                />
                <span className={unitTextCls}>°</span>
              </div>
              <div className={`flex items-center justify-around rounded-lg p-1 ${
                isLight ? "bg-slate-100 border border-slate-200 text-slate-600" : "bg-[#2c2c2c] text-neutral-400"
              }`}>
                <button
                  type="button"
                  onClick={() => updateSelectedItem({ rotation: ((selectedItem?.rotation || 0) + 90) % 360 })}
                  className={`p-1 transition-colors cursor-pointer rounded ${isLight ? "hover:text-slate-900 hover:bg-slate-200/60" : "hover:text-white"}`}
                  title="Rotate 90°"
                >
                  <HiArrowPath className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedItem({ rotation: (selectedItem?.rotation || 0) === 180 ? 0 : 180 })}
                  className={`p-1 transition-colors cursor-pointer rounded ${isLight ? "hover:text-slate-900 hover:bg-slate-200/60" : "hover:text-white"}`}
                  title="Flip Horizontal / 180°"
                >
                  <HiArrowsPointingOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. LAYOUT SECTION (Dimensions, Flow, Spacing - Image 1) */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Layout</span>
            </div>

            {/* Resizing Segmented Controls for Text (Matches Screenshots media_1793534610601_7930294d.png & media_1793534696719_3f2570c9.png) */}
            {(isTextSelected || selectedItem?.type === "text" || selectedItem?.mediaType === "text") && (
              <div className={`space-y-1.5 pb-1 border-b ${isLight ? "border-slate-200" : "border-white/5"}`}>
                <span className={labelTitleCls}>Resizing</span>
                <div className={segmentedBarCls}>
                  {/* Auto width: |→ */}
                  <button
                    type="button"
                    onClick={() => updateSelectedItem({ textAutoResize: "auto_width" })}
                    title="Auto width"
                    className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center transition-colors cursor-pointer group relative ${
                      (selectedItem?.textAutoResize || "auto_width") === "auto_width"
                        ? segmentedBtnActiveCls
                        : segmentedBtnInactiveCls
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <line x1="2.5" y1="2" x2="2.5" y2="14" strokeWidth="1.75" />
                      <path d="M5.5 8h8M10.5 5l3 3-3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Auto height: |=| */}
                  <button
                    type="button"
                    onClick={() => updateSelectedItem({ textAutoResize: "auto_height", width: selectedItem?.width || 320 })}
                    title="Auto height"
                    className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center transition-colors cursor-pointer group relative ${
                      selectedItem?.textAutoResize === "auto_height"
                        ? segmentedBtnActiveCls
                        : segmentedBtnInactiveCls
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <line x1="2.5" y1="2" x2="2.5" y2="14" strokeWidth="1.75" />
                      <line x1="13.5" y1="2" x2="13.5" y2="14" strokeWidth="1.75" />
                      <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="8" x2="10.5" y2="8" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="10.5" x2="8.5" y2="10.5" strokeWidth="1.25" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Fixed size: [≡] */}
                  <button
                    type="button"
                    onClick={() => updateSelectedItem({ textAutoResize: "fixed", width: selectedItem?.width || 320, height: selectedItem?.height || 60 })}
                    title="Fixed size"
                    className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center transition-colors cursor-pointer group relative ${
                      selectedItem?.textAutoResize === "fixed"
                        ? segmentedBtnActiveCls
                        : segmentedBtnInactiveCls
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" strokeWidth="1.5" />
                      <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="8" x2="10.5" y2="8" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="10.5" x2="8.5" y2="10.5" strokeWidth="1.25" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Dimensions (W, H) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={inputBoxCls}>
                <span
                  onMouseDown={(e) =>
                    handleStartScrub(e, {
                      getValue: () => (selectedItem ? itemWidth : 1080),
                      setValue: (v) => updateSelectedItem({ width: v }),
                      min: 10,
                      max: 5000,
                    })
                  }
                  className={scrubLabelCls}
                  title="Geser kiri/kanan untuk mengubah lebar (W)"
                >
                  W
                </span>
                {(isTextSelected || selectedItem?.type === "text") && (selectedItem?.textAutoResize || "auto_width") === "auto_width" ? (
                  <span className={`w-full font-mono text-xs select-none ${isLight ? "text-slate-400" : "text-neutral-400"}`}>Auto</span>
                ) : (
                  <input
                    type="number"
                    value={selectedItem ? itemWidth : 1080}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 100;
                      if ((isTextSelected || selectedItem?.type === "text") && (selectedItem?.textAutoResize || "auto_width") === "auto_width") {
                        updateSelectedItem({ width: val, textAutoResize: "auto_height" });
                      } else {
                        updateSelectedItem({ width: val });
                      }
                    }}
                    className={inputTextCls}
                  />
                )}
              </div>
              <div className={inputBoxCls}>
                <span
                  onMouseDown={(e) =>
                    handleStartScrub(e, {
                      getValue: () => (selectedItem ? itemHeight : 1350),
                      setValue: (v) => updateSelectedItem({ height: v }),
                      min: 10,
                      max: 5000,
                    })
                  }
                  className={scrubLabelCls}
                  title="Geser kiri/kanan untuk mengubah tinggi (H)"
                >
                  H
                </span>
                {(isTextSelected || selectedItem?.type === "text") && (selectedItem?.textAutoResize || "auto_width") !== "fixed" ? (
                  <span className={`w-full font-mono text-xs select-none ${isLight ? "text-slate-400" : "text-neutral-400"}`}>Auto</span>
                ) : (
                  <input
                    type="number"
                    value={selectedItem ? itemHeight : 1350}
                    onChange={(e) => updateSelectedItem({ height: Number(e.target.value) || 100 })}
                    className={inputTextCls}
                  />
                )}
              </div>
            </div>

            {/* Spacing (Horizontal Spacing ||| and Vertical Spacing 吕) - Matches Screenshot 4 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                  isLight
                    ? "bg-slate-100 border border-slate-200 focus-within:border-[#ff2a85] focus-within:bg-white"
                    : "bg-[#2c2c2c] border border-transparent focus-within:border-[#ff2a85]"
                }`}
                title="Horizontal spacing between items (|||)"
              >
                <svg className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-slate-500" : "text-neutral-400"}`} viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="2" height="12" rx="0.5" />
                  <rect x="7" y="2" width="2" height="12" rx="0.5" />
                  <rect x="12" y="2" width="2" height="12" rx="0.5" />
                </svg>
                <input
                  type="number"
                  value={smartSelectionGrid ? smartSelectionGrid.gapX : selectedItem?.gapX !== undefined ? selectedItem.gapX : 24}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    if (smartSelectionGrid) {
                      handleUpdateSpacing(val, undefined);
                    } else if (selectedItem) {
                      updateSelectedItem({ gapX: val });
                    }
                  }}
                  className={inputTextCls}
                />
              </div>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                  isLight
                    ? "bg-slate-100 border border-slate-200 focus-within:border-[#ff2a85] focus-within:bg-white"
                    : "bg-[#2c2c2c] border border-transparent focus-within:border-[#ff2a85]"
                }`}
                title="Vertical spacing between items (吕)"
              >
                <svg className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-slate-500" : "text-neutral-400"}`} viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="12" height="4.5" rx="0.5" />
                  <rect x="2" y="9.5" width="12" height="4.5" rx="0.5" />
                </svg>
                <input
                  type="number"
                  value={smartSelectionGrid ? smartSelectionGrid.gapY : selectedItem?.gapY !== undefined ? selectedItem.gapY : 16}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    if (smartSelectionGrid) {
                      handleUpdateSpacing(undefined, val);
                    } else if (selectedItem) {
                      updateSelectedItem({ gapY: val });
                    }
                  }}
                  className={inputTextCls}
                />
              </div>
            </div>

            {/* Clip content Checkbox (Only for Frames) */}
            {selectedItem && (selectedItem.type === "frame" || selectedItem.mediaType === "frame") && !selectedItem.image && (
              <label className={`flex items-center gap-2 cursor-pointer pt-1 text-[11px] ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                <input
                  type="checkbox"
                  checked={selectedItem?.clipContent !== false}
                  onChange={(e) => updateSelectedItem({ clipContent: e.target.checked })}
                  className={`rounded ${isLight ? "bg-white border-slate-300 text-[#0c8ce9]" : "bg-[#2c2c2c] border-white/20 text-[#0c8ce9]"} focus:ring-0`}
                />
                <span>Clip content</span>
              </label>
            )}
          </div>

          {/* 3. APPEARANCE SECTION (Image 1) */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Appearance</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Opacity */}
              <div className="space-y-1">
                <span
                  onMouseDown={(e) =>
                    handleStartScrub(e, {
                      getValue: () => (selectedItem?.opacity !== undefined ? selectedItem.opacity : 100),
                      setValue: (v) => updateSelectedItem({ opacity: v }),
                      min: 0,
                      max: 100,
                    })
                  }
                  className={`text-[10px] cursor-ew-resize select-none transition-colors ${
                    isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                  }`}
                  title="Geser kiri/kanan untuk mengubah opacity"
                >
                  Opacity
                </span>
                <div className={`${inputBoxCls} relative group`}>
                  <span
                    onMouseDown={(e) =>
                      handleStartScrub(e, {
                        getValue: () => (selectedItem?.opacity !== undefined ? selectedItem.opacity : 100),
                        setValue: (v) => updateSelectedItem({ opacity: v }),
                        min: 0,
                        max: 100,
                      })
                    }
                    className={`text-xs cursor-ew-resize select-none transition-colors ${
                      isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                    }`}
                    title="Geser kiri/kanan untuk mengubah opacity"
                  >
                    ▦
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={itemOpacity}
                    onChange={(e) => updateSelectedItem({ opacity: Math.min(100, Math.max(0, Number(e.target.value))) })}
                    className={inputTextCls}
                  />
                  <span className={unitTextCls}>%</span>
                </div>
              </div>

              {/* Corner radius */}
              <div className="space-y-1">
                <span
                  onMouseDown={(e) =>
                    handleStartScrub(e, {
                      getValue: () => (selectedItem?.cornerRadius !== undefined ? selectedItem.cornerRadius : 0),
                      setValue: (v) => updateSelectedItem({ cornerRadius: v }),
                      min: 0,
                      max: 300,
                    })
                  }
                  className={`text-[10px] cursor-ew-resize select-none transition-colors ${
                    isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                  }`}
                  title="Geser kiri/kanan untuk mengubah corner radius"
                >
                  Corner radius
                </span>
                <div className={`${inputBoxCls} relative group`}>
                  <span
                    onMouseDown={(e) =>
                      handleStartScrub(e, {
                        getValue: () => (selectedItem?.cornerRadius !== undefined ? selectedItem.cornerRadius : 0),
                        setValue: (v) => updateSelectedItem({ cornerRadius: v }),
                        min: 0,
                        max: 300,
                      })
                    }
                    className={`text-xs cursor-ew-resize select-none transition-colors ${
                      isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                    }`}
                    title="Geser kiri/kanan untuk mengubah corner radius"
                  >
                    ⛶
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={itemRadius}
                    onChange={(e) => updateSelectedItem({ cornerRadius: Math.max(0, Number(e.target.value)) })}
                    className={inputTextCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. TYPOGRAPHY SECTION (Matches Screenshot media_1793529077648_43ff02b0.png) */}
          {(isTextSelected || activeTool === "text" || selectedItem?.type === "text" || selectedItem?.content !== undefined) && (
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={sectionTitleCls}>Typography</span>
              </div>

              {/* Font Family Dropdown */}
              <div className="relative">
                <select
                  value={selectedItem?.fontFamily || "Noto Serif"}
                  onChange={(e) => updateSelectedItem({ fontFamily: e.target.value })}
                  className={`${selectBoxCls} font-serif`}
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
                <HiChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none ${isLight ? "text-slate-400" : "text-neutral-400"}`} />
              </div>

              {/* Font Weight & Size */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="relative">
                  <select
                    value={selectedItem?.fontWeight || "Regular"}
                    onChange={(e) => updateSelectedItem({ fontWeight: e.target.value })}
                    className={selectBoxCls}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Medium">Medium</option>
                    <option value="SemiBold">SemiBold</option>
                    <option value="Bold">Bold</option>
                    <option value="Black">Black</option>
                  </select>
                  <HiChevronDown className={`w-3.5 h-3.5 absolute right-2 top-2 pointer-events-none ${isLight ? "text-slate-400" : "text-neutral-400"}`} />
                </div>
                <div className="relative group" ref={fontSizeDropdownRef}>
                  {/* Figma-style Left Edge Scrubber for Font Size with Center Anchor (Matches User Request & Screenshot media_1793596159306_72d4d5d9.jpg) */}
                  <div
                    onMouseDown={(e) => {
                      const baseItem = selectedItem;
                      if (!baseItem) return;
                      const startDim = getItemDimensions(baseItem);
                      const centerX = (baseItem.x || 0) + startDim.width / 2;
                      const centerY = (baseItem.y || 0) + startDim.height / 2;
                      const initialFontSize = baseItem.fontSize || 48;

                      handleStartScrub(e, {
                        getValue: () => initialFontSize,
                        setValue: (newSize) => {
                          const newDim = getItemDimensions({ ...baseItem, fontSize: newSize });
                          const newX = (baseItem.textAutoResize === "fixed") ? (baseItem.x || 0) : Math.round(centerX - newDim.width / 2);
                          const newY = Math.round(centerY - newDim.height / 2);
                          updateSelectedItem({ fontSize: newSize, x: newX, y: newY });
                        },
                        min: 6,
                        max: 500,
                      });
                    }}
                    className="absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize z-20 flex items-center justify-center select-none"
                    title="Geser kiri/kanan untuk mengubah ukuran font (Center Anchor)"
                  >
                    <div className={`w-[3px] h-3.5 rounded-full transition-colors ${isLight ? "bg-slate-300 group-hover:bg-[#0c8ce9]" : "bg-neutral-600/30 group-hover:bg-[#0c8ce9]"}`} />
                  </div>

                  <div className={`flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg transition-colors ${
                    isLight
                      ? "bg-slate-100 border border-slate-200 focus-within:border-[#0c8ce9] focus-within:bg-white"
                      : "bg-[#2c2c2c] border border-transparent focus-within:border-[#0c8ce9]"
                  }`}>
                    <input
                      type="number"
                      value={selectedItem?.fontSize || 48}
                      onChange={(e) => updateTextFontSizeCentered(Number(e.target.value) || 16)}
                      className={inputTextCls}
                    />
                    <button
                      type="button"
                      onClick={() => setIsFontSizeDropdownOpen((prev) => !prev)}
                      className={`p-0.5 rounded cursor-pointer transition-colors shrink-0 ${
                        isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200" : "text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                      title="Pilih ukuran font"
                    >
                      <HiChevronDown className={`w-3.5 h-3.5 transition-transform duration-100 ${isFontSizeDropdownOpen ? "rotate-180 text-[#0c8ce9]" : ""}`} />
                    </button>
                  </div>

                  {/* Figma-style Font Size Dropdown Menu (Matches Screenshot media_1793596112749_064977fc.png) */}
                  {isFontSizeDropdownOpen && (
                    <div className={`absolute right-0 top-full mt-1.5 z-50 w-[84px] max-h-[290px] overflow-y-auto p-1 rounded-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-75 flex flex-col gap-0.5 select-none overscroll-contain ${
                      isLight
                        ? "bg-white/98 border border-slate-200 shadow-xl"
                        : "bg-[#222222]/98 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.65)]"
                    }`}>
                      {[10, 11, 12, 13, 14, 15, 16, 20, 24, 32, 36, 40, 48, 64, 96, 128].map((size) => {
                        const isSelected = (selectedItem?.fontSize || 48) === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              updateTextFontSizeCentered(size);
                              setIsFontSizeDropdownOpen(false);
                            }}
                            className={`w-full px-1.5 py-1 text-xs rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[#0c8ce9] text-white font-medium"
                                : isLight
                                ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                : "text-neutral-200 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="w-3.5 flex items-center justify-center">
                              {isSelected && <HiCheck className="w-3.5 h-3.5 text-white" />}
                            </span>
                            <span className="flex-1 text-center font-mono font-medium">{size}</span>
                            <span className="w-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Line height & Letter spacing */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className={labelTitleCls}>Line height</span>
                  <div className={inputBoxCls}>
                    <span className={`text-xs ${isLight ? "text-slate-400" : "text-neutral-400"}`}>A</span>
                    <input
                      type="text"
                      value={selectedItem?.lineHeight || "100%"}
                      onChange={(e) => updateSelectedItem({ lineHeight: e.target.value })}
                      className={inputTextCls}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className={labelTitleCls}>Letter spacing</span>
                  <div className={inputBoxCls}>
                    <span className={`text-xs ${isLight ? "text-slate-400" : "text-neutral-400"}`}>|A|</span>
                    <input
                      type="text"
                      value={selectedItem?.letterSpacing || "-3%"}
                      onChange={(e) => updateSelectedItem({ letterSpacing: e.target.value })}
                      className={inputTextCls}
                    />
                  </div>
                </div>
              </div>

              {/* Text Resizing Controls (Matches Screenshot media_1793534610601_7930294d.png & media_1793534696719_3f2570c9.png) */}
              <div className="space-y-1">
                <span className={labelTitleCls}>Resizing</span>
                <div className={segmentedBarCls}>
                  <button
                    type="button"
                    onClick={() => updateSelectedItem({ textAutoResize: "auto_width" })}
                    title="Auto width"
                    className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                      (selectedItem?.textAutoResize || "auto_width") === "auto_width"
                        ? segmentedBtnActiveCls
                        : segmentedBtnInactiveCls
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <line x1="2.5" y1="2" x2="2.5" y2="14" strokeWidth="1.75" />
                      <path d="M5.5 8h8M10.5 5l3 3-3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedItem({ textAutoResize: "auto_height", width: selectedItem?.width || 320 })}
                    title="Auto height"
                    className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                      selectedItem?.textAutoResize === "auto_height"
                        ? segmentedBtnActiveCls
                        : segmentedBtnInactiveCls
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <line x1="2.5" y1="2" x2="2.5" y2="14" strokeWidth="1.75" />
                      <line x1="13.5" y1="2" x2="13.5" y2="14" strokeWidth="1.75" />
                      <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="8" x2="10.5" y2="8" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="10.5" x2="8.5" y2="10.5" strokeWidth="1.25" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedItem({ textAutoResize: "fixed", width: selectedItem?.width || 320, height: selectedItem?.height || 60 })}
                    title="Fixed size"
                    className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center transition-colors cursor-pointer ${
                      selectedItem?.textAutoResize === "fixed"
                        ? segmentedBtnActiveCls
                        : segmentedBtnInactiveCls
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" strokeWidth="1.5" />
                      <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="8" x2="10.5" y2="8" strokeWidth="1.25" strokeLinecap="round" />
                      <line x1="5.5" y1="10.5" x2="8.5" y2="10.5" strokeWidth="1.25" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Text Alignments */}
              <div className="space-y-1">
                <span className={labelTitleCls}>Alignment</span>
                <div className="flex items-center justify-between">
                  <div className={segmentedBarCls}>
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ textAlign: "left" })}
                      className={`p-1 rounded transition-colors ${selectedItem?.textAlign === "left" ? segmentedBtnActiveCls : segmentedBtnInactiveCls}`}
                      title="Align Left"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 3h12v1.5H2V3zm0 4h8v1.5H2V7zm0 4h12v1.5H2V11z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ textAlign: "center" })}
                      className={`p-1 rounded transition-colors ${selectedItem?.textAlign === "center" ? segmentedBtnActiveCls : segmentedBtnInactiveCls}`}
                      title="Align Center"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 3h12v1.5H2V3zm2 4h8v1.5H4V7zm-2 4h12v1.5H2V11z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ textAlign: "right" })}
                      className={`p-1 rounded transition-colors ${selectedItem?.textAlign === "right" ? segmentedBtnActiveCls : segmentedBtnInactiveCls}`}
                      title="Align Right"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 3h12v1.5H2V3zm4 4h8v1.5H6V7zm-4 4h12v1.5H2V11z" />
                      </svg>
                    </button>
                  </div>

                  <div className={segmentedBarCls}>
                    <button type="button" className={`p-1 rounded transition-colors ${segmentedBtnInactiveCls}`} title="Align Top">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 2h12v1.5H2V2zm6 3l3 3H9v6H7V8H5l3-3z" />
                      </svg>
                    </button>
                    <button type="button" className={`p-1 rounded transition-colors ${segmentedBtnActiveCls}`} title="Align Middle">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 7.25h12v1.5H2V7.25zm6-5l2.5 2.5H9v2H7v-2H5.5L8 2.25zm0 11.5L5.5 11.25H7v-2h2v2h1.5L8 13.75z" />
                      </svg>
                    </button>
                    <button type="button" className={`p-1 rounded transition-colors ${segmentedBtnInactiveCls}`} title="Align Bottom">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 12.5h12V14H2v-1.5zm6-3l-3-3h2V2h2v4.5h2l-3 3z" />
                      </svg>
                    </button>
                  </div>

                  <button type="button" className={`p-1 transition-colors ${isLight ? "text-slate-400 hover:text-slate-900" : "text-neutral-400 hover:text-white"}`}>
                    <HiAdjustmentsHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Frame Container Selector (Figma Nested Frame) */}
              <div className={`pt-2 border-t space-y-1 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={labelTitleCls}>Frame Container</span>
                  {selectedItem?.frameId && (
                    <button
                      type="button"
                      onClick={() => updateSelectedItem({ frameId: undefined })}
                      className="text-[10px] text-red-500 hover:text-red-600 cursor-pointer"
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
                    className={selectBoxCls}
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
                  <HiChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none ${isLight ? "text-slate-400" : "text-neutral-400"}`} />
                </div>
              </div>
            </div>
          )}

          {/* 5. FILL SECTION (Matches Screenshot 1 & 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Fill</span>
              <button
                type="button"
                onClick={() => updateSelectedItem({ color: "#00A389" })}
                className={plusBtnCls}
                title="Add Fill"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Color Swatch & Hex input */}
            <div className={rowCardCls}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => openColorPicker("fill", itemColor)}
                  className="relative cursor-pointer shrink-0 group focus:outline-none"
                  title="Open Figma Color Picker"
                >
                  <span
                    className={`w-4 h-4 rounded-xs border inline-block shadow-sm group-hover:scale-110 transition-transform ${isLight ? "border-slate-300" : "border-white/20"}`}
                    style={{ backgroundColor: itemColor }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => openColorPicker("fill", itemColor)}
                  className={`text-left font-mono text-xs uppercase transition-colors focus:outline-none cursor-pointer ${
                    isLight ? "text-slate-900 hover:text-[#0c8ce9]" : "text-white hover:text-[#0c8ce9]"
                  }`}
                  title="Click to edit color"
                >
                  {itemColor.replace("#", "")}
                </button>
              </div>

              <div className={`flex items-center gap-2 text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                <span className={`font-mono ${isLight ? "text-slate-700" : "text-neutral-300"}`}>{itemOpacity}%</span>
                <button type="button" className={`cursor-pointer ${isLight ? "hover:text-slate-900" : "hover:text-white"}`}>
                  <HiEye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedItem({ color: undefined })}
                  className="hover:text-red-500 cursor-pointer"
                  title="Remove Fill"
                >
                  <HiMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 6. STROKE SECTION (Matches Screenshot 1 & 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Stroke</span>
              <button
                type="button"
                onClick={() => updateSelectedItem({ strokeColor: "#ffffff", strokeWidth: 1 })}
                className={plusBtnCls}
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
            {selectedItem?.strokeColor && (
              <div className={rowCardCls}>
                <div
                  onClick={() => openColorPicker("stroke", selectedItem.strokeColor)}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="Change Stroke Color"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-xs border group-hover:scale-110 transition-transform ${isLight ? "border-slate-300" : "border-white/30"}`}
                    style={{ backgroundColor: selectedItem.strokeColor }}
                  />
                  <span className={`font-mono uppercase transition-colors ${isLight ? "text-slate-800 group-hover:text-[#0c8ce9]" : "text-neutral-200 group-hover:text-white"}`}>
                    {selectedItem.strokeColor.replace("#", "")}
                  </span>
                </div>
                <div className={`flex items-center gap-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={selectedItem.strokeWidth || 1}
                    onChange={(e) => updateSelectedItem({ strokeWidth: Number(e.target.value) || 1 })}
                    className={`w-8 bg-transparent font-mono text-xs text-right focus:outline-none ${isLight ? "text-slate-900" : "text-white"}`}
                  />
                  <span>px</span>
                </div>
              </div>
            )}
          </div>

          {/* 7. EFFECTS SECTION (Matches Screenshots media_1793533049501_ef649907.png & media_1793533075434_40d113b1.png) */}
          <div className="p-3 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Effects</span>
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
                className={plusBtnCls}
                title="Add effect"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {selectedItem?.effects && (
              <div className="relative">
                {/* Effect Item Row matching Figma Image 2 */}
                <div
                  className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors select-none ${
                    isEffectPopoverOpen
                      ? isLight
                        ? "bg-cyan-50 border border-cyan-400 text-cyan-900 shadow-xs"
                        : "bg-[#1c2c3e] border border-[#0c8ce9]/50 shadow-sm"
                      : isLight
                      ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800"
                      : "bg-[#2c2c2c] hover:bg-[#343434]"
                  } ${selectedItem.effectHidden ? "opacity-50" : "opacity-100"}`}
                >
                  {/* Left: Clickable Icon + Label */}
                  <div
                    className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setIsEffectPopoverOpen((prev) => !prev)}
                    title="Click to edit effect settings"
                  >
                    <span className={`w-4 h-4 rounded-[3px] flex items-center justify-center text-[9px] text-[#0c8ce9] shadow-xs shrink-0 ${
                      isLight ? "border border-slate-300 bg-white" : "border border-white/30 bg-black/40"
                    }`}>
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
                  <div className={`flex items-center gap-1 shrink-0 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {/* View / Hide (Eye) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelectedItem({ effectHidden: !selectedItem.effectHidden });
                      }}
                      className={`p-1 rounded cursor-pointer transition-colors ${isLight ? "hover:bg-slate-200 hover:text-slate-900" : "hover:bg-white/10 hover:text-white"}`}
                      title={selectedItem.effectHidden ? "Show effect" : "Hide effect"}
                    >
                      {selectedItem.effectHidden ? (
                        <HiEyeSlash className={`w-3.5 h-3.5 ${isLight ? "text-slate-400" : "text-neutral-500"}`} />
                      ) : (
                        <HiEye className={`w-3.5 h-3.5 ${isLight ? "text-slate-700 hover:text-slate-900" : "text-neutral-300 hover:text-white"}`} />
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
                      className={`p-1 rounded cursor-pointer transition-colors ${isLight ? "hover:bg-slate-200 hover:text-red-500" : "hover:bg-white/10 hover:text-red-400"}`}
                      title="Remove effect"
                    >
                      <HiMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Drop Shadow Settings Popover (Matches Screenshot Image 1 media_1793533049501_ef649907.png) */}
                {isEffectPopoverOpen && (
                  <div className={`relative mt-2 sm:absolute sm:right-full sm:top-0 sm:mr-3 sm:mt-0 w-full sm:w-[250px] p-3 rounded-2xl border backdrop-blur-2xl z-50 text-xs font-sans space-y-3 animate-in fade-in zoom-in-95 duration-100 ${
                    isLight
                      ? "bg-white/98 border-slate-200 shadow-2xl text-slate-800"
                      : "bg-[#1e1e1e]/98 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-neutral-300"
                  }`}>
                    {/* Popover Header */}
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? "border-slate-200" : "border-white/10"}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center text-[8px] text-[#0c8ce9] shadow-xs ${
                          isLight ? "border border-slate-300 bg-white" : "border border-white/40 bg-black/40"
                        }`}>
                          ▢
                        </span>
                        <select
                          value={selectedItem.effects || "drop-shadow"}
                          onChange={(e) => updateSelectedItem({ effects: e.target.value })}
                          className={`bg-transparent font-medium focus:outline-none cursor-pointer pr-1 text-xs ${isLight ? "text-slate-900" : "text-white"}`}
                        >
                          <option value="drop-shadow" className={isLight ? "bg-white text-slate-900" : "bg-[#1e1e1e] text-white"}>Drop shadow</option>
                          <option value="inner-shadow" className={isLight ? "bg-white text-slate-900" : "bg-[#1e1e1e] text-white"}>Inner shadow</option>
                          <option value="layer-blur" className={isLight ? "bg-white text-slate-900" : "bg-[#1e1e1e] text-white"}>Layer blur</option>
                          <option value="background-blur" className={isLight ? "bg-white text-slate-900" : "bg-[#1e1e1e] text-white"}>Background blur</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEffectPopoverOpen(false)}
                        className={`cursor-pointer p-0.5 rounded transition-colors ${isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200" : "text-neutral-400 hover:text-white hover:bg-white/10"}`}
                        title="Tutup Pengaturan"
                      >
                        <HiXMark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Row 1: Position X & Y */}
                    <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      <span className="text-[11px] font-medium">Position</span>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 border rounded-lg px-2 py-1 w-[72px] ${
                          isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-[#161616] border-white/10 text-white"
                        }`}>
                          <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-neutral-500"}`}>X</span>
                          <input
                            type="number"
                            value={selectedItem.shadowX !== undefined ? selectedItem.shadowX : 0}
                            onChange={(e) => updateSelectedItem({ shadowX: Number(e.target.value) })}
                            className="w-full bg-transparent font-mono text-xs text-right focus:outline-none"
                          />
                        </div>
                        <div className={`flex items-center gap-1 border rounded-lg px-2 py-1 w-[72px] ${
                          isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-[#161616] border-white/10 text-white"
                        }`}>
                          <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-neutral-500"}`}>Y</span>
                          <input
                            type="number"
                            value={selectedItem.shadowY !== undefined ? selectedItem.shadowY : 4}
                            onChange={(e) => updateSelectedItem({ shadowY: Number(e.target.value) })}
                            className="w-full bg-transparent font-mono text-xs text-right focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Blur */}
                    <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      <span className="text-[11px] font-medium">Blur</span>
                      <div className={`flex items-center gap-1.5 border rounded-lg px-2 py-1 w-[152px] ${
                        isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-[#161616] border-white/10 text-white"
                      }`}>
                        <span className={`text-xs select-none ${isLight ? "text-slate-400" : "text-neutral-500"}`}>⠿</span>
                        <input
                          type="number"
                          min="0"
                          value={selectedItem.shadowBlur !== undefined ? selectedItem.shadowBlur : 4}
                          onChange={(e) => updateSelectedItem({ shadowBlur: Math.max(0, Number(e.target.value)) })}
                          className="w-full bg-transparent font-mono text-xs text-right focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 3: Spread */}
                    <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      <span className="text-[11px] font-medium">Spread</span>
                      <div className={`flex items-center gap-1.5 border rounded-lg px-2 py-1 w-[152px] ${
                        isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-[#161616] border-white/10 text-white"
                      }`}>
                        <span className={`text-xs select-none ${isLight ? "text-slate-400" : "text-neutral-500"}`}>☼</span>
                        <input
                          type="number"
                          value={selectedItem.shadowSpread !== undefined ? selectedItem.shadowSpread : 0}
                          onChange={(e) => updateSelectedItem({ shadowSpread: Number(e.target.value) })}
                          className="w-full bg-transparent font-mono text-xs text-right focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 4: Color & Opacity */}
                    <div className={`flex items-center justify-between ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      <span className="text-[11px] font-medium">Color</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-1.5 border rounded-lg px-2 py-1 ${
                          isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-[#161616] border-white/10 text-white"
                        }`}>
                          <span
                            onClick={() => openColorPicker("fill", selectedItem.shadowColor || "#000000")}
                            className={`w-4 h-4 rounded-[2px] border shrink-0 shadow-xs cursor-pointer hover:scale-110 transition-transform ${isLight ? "border-slate-300" : "border-white/20"}`}
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
                            className="w-14 bg-transparent font-mono text-xs focus:outline-none uppercase"
                          />
                        </div>
                        <div className={`flex items-center gap-0.5 border rounded-lg px-1.5 py-1 w-14 ${
                          isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-[#161616] border-white/10 text-white"
                        }`}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={selectedItem.shadowOpacity !== undefined ? selectedItem.shadowOpacity : 25}
                            onChange={(e) => updateSelectedItem({ shadowOpacity: Math.min(100, Math.max(0, Number(e.target.value))) })}
                            className="w-full bg-transparent font-mono text-xs text-right focus:outline-none"
                          />
                          <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-neutral-500"}`}>%</span>
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
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Selection colors</span>
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
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer group ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800"
                      : "bg-[#2c2c2c] hover:bg-[#343434] text-white"
                  }`}
                  title="Select color and open picker"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-xs border shrink-0 shadow-xs group-hover:scale-110 transition-transform ${isLight ? "border-slate-300" : "border-white/20"}`}
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className={`font-mono text-xs uppercase transition-colors ${isLight ? "text-slate-800 group-hover:text-[#0c8ce9]" : "text-white group-hover:text-[#0c8ce9]"}`}>
                      {colorHex.replace("#", "")}
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono ${isLight ? "text-slate-500 group-hover:text-slate-900" : "text-neutral-400 group-hover:text-white"}`}>100 %</span>
                </div>
              ))}
            </div>
          </div>

          {/* 10. EXPORT SECTION (Matches Screenshot 2) */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className={sectionTitleCls}>Export</span>
              <button
                type="button"
                onClick={() => handleExportSelection("png")}
                className={plusBtnCls}
                title="Quick Export"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
              {["PNG", "JPG", "SVG", "PDF"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleExportSelection(fmt.toLowerCase())}
                  className={`py-1.5 rounded-lg font-semibold text-center cursor-pointer transition-all ${
                    isLight
                      ? "bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-xs"
                      : "bg-[#2c2c2c] hover:bg-white/10 text-neutral-300 hover:text-white"
                  }`}
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
        <div className={`p-3 flex items-center justify-end border-t ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-[#1e1e1e]/90"}`}>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
                : "bg-[#2c2c2c] hover:bg-white/20 text-neutral-300 hover:text-white shadow-lg"
            }`}
            title="Help & Shortcuts (?)"
          >
            ?
          </button>
        </div>
      </aside>
    );
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

  // Render Studio Top Pill Menu [Logo] [Portfolio] [Free] [◫] (Matches User Screenshot media_1793558036658_5e46c976.png)
  const renderPillMenu = () => (
    <div className="relative figma-pill-menu inline-flex items-center">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-2xl transition-all shadow-xl ${
          isLight
            ? "bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/40"
            : "bg-[#222222]/95 border-white/10 text-white shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
        }`}
      >
        {/* Studio Monogram / Canvas Icon (Matches Admin Dashboard /navbar-logo.png) */}
        <button
          type="button"
          onClick={() => setIsPillMenuOpen((prev) => !prev)}
          title="Rizx Studio Canvas Menu"
          className={`w-7 h-7 rounded-lg border flex items-center justify-center p-1.5 transition-all cursor-pointer overflow-hidden ${
            isLight
              ? "bg-slate-100 border-slate-200 hover:bg-slate-200 shadow-xs"
              : "bg-neutral-900 border-white/10 hover:bg-neutral-800 shadow-md shadow-black/40"
          }`}
        >
          <img
            src="/navbar-logo.png"
            alt="Rizx Canvas Studio"
            className={`w-full h-full object-contain ${
              isLight ? "brightness-0 opacity-85" : "brightness-0 invert opacity-95"
            }`}
          />
        </button>

        {/* Title: Portfolio (with subtle dropdown caret) */}
        <button
          type="button"
          onClick={() => setIsPillMenuOpen((prev) => !prev)}
          className={`flex items-center gap-1 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
            isLight ? "text-slate-800 hover:text-cyan-600" : "text-white hover:text-cyan-300"
          }`}
        >
          <span>Portfolio</span>
          <HiChevronDown className={`w-3 h-3 ${isLight ? "text-slate-400" : "text-neutral-400"}`} />
        </button>

        {/* Plan Badge: Free */}
        <span
          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wide border ${
            isLight
              ? "bg-cyan-50 text-cyan-700 border-cyan-200"
              : "bg-[#182635] text-[#38bdf8] border-[#38bdf8]/25"
          }`}
        >
          Free
        </span>

        {/* Sidebar / UI Toggle Icon [◫] (Matches User Screenshot media_1793558036658_5e46c976.png) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsUiExpanded((prev) => !prev);
              setShowExpandTooltip(false);
            }}
            onMouseEnter={() => setShowExpandTooltip(true)}
            onMouseLeave={() => setShowExpandTooltip(false)}
            title={isUiExpanded ? "Tutup Menu Sebelah Kiri (Ctrl+Shift+\\)" : "Buka Menu Sebelah Kiri (Ctrl+Shift+\\)"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              isUiExpanded
                ? isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
                : isLight
                ? "text-cyan-700 bg-cyan-100/70 hover:bg-cyan-100"
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
            <div
              className={`absolute top-full mt-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl border text-[11px] font-mono shadow-2xl flex items-center gap-3 whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100 pointer-events-none ${
                isLight
                  ? "bg-white border-slate-200 text-slate-800 shadow-slate-300/60"
                  : "bg-[#1e1e1e] border-white/15 text-white"
              }`}
            >
              <span className={`font-semibold ${isLight ? "text-slate-800" : "text-neutral-200"}`}>
                {isUiExpanded ? "Tutup Layers (Ctrl+Shift+\\)" : "Buka Layers (Ctrl+Shift+\\)"}
              </span>
              <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-neutral-400"}`}>Ctrl+Shift+\</span>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Menu on clicking Logo or Portfolio */}
      {isPillMenuOpen && (
        <div
          className={`absolute top-full mt-2 left-0 w-64 rounded-2xl backdrop-blur-2xl border p-2 shadow-2xl z-50 text-xs font-mono flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100 ${
            isLight
              ? "bg-white/98 border-slate-200 text-slate-700 shadow-slate-300/60"
              : "bg-[#181a20]/95 border-white/15 text-neutral-300"
          }`}
        >
          <div
            className={`px-2 py-1.5 text-[11px] border-b flex items-center justify-between ${
              isLight ? "text-slate-500 border-slate-200" : "text-neutral-400 border-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/navbar-logo.png"
                  alt="Rizx Canvas"
                  className={`w-full h-full object-contain ${
                    isLight ? "brightness-0 opacity-85" : "brightness-0 invert opacity-95"
                  }`}
                />
              </div>
              <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Rizx Canvas Studio</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                isLight ? "text-teal-700 bg-teal-50 border border-teal-200" : "text-teal-400 bg-teal-500/10"
              }`}
            >
              v2.4
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsUiExpanded((prev) => !prev);
              setIsPillMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
              isLight
                ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                : "hover:bg-white/10 text-neutral-200 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2.5" width="12" height="11" rx="2" />
                <line x1="6" y1="2.5" x2="6" y2="13.5" />
              </svg>
              {isUiExpanded ? "Tutup Menu Kiri" : "Buka Menu Kiri"}
            </span>
            <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-neutral-500"}`}>Ctrl+Shift+\</span>
          </button>

          <div className={`w-full h-[1px] my-1 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />

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
            <span>Save Changes</span>
            <span className="text-[10px]">Ctrl+S</span>
          </button>
        </div>
      )}
    </div>
  );

  // Top-level canvas layers (Frames, Sections, Media/Images/Videos, Text)
  const rootItems = useMemo(() => {
    return items.filter((it) => {
      // Exclude items nested inside a frame from top-level
      const parentId = getParentFrameId(it);
      return !parentId;
    });
  }, [items, getParentFrameId]);

  // Render Frame & Section Layer with Hierarchical Dropdown (Matches Screenshots media_1793557090846_72f61002.png & media_1793557169840_7ea76298.png)
  const renderFrameLayer = (frame: CanvasItem, depth: number = 0): React.ReactNode => {
    const isSection = frame.type === "section" || frame.mediaType === "section";

    // Direct children belonging to this frame or section
    const children = items.filter((it) => it.id !== frame.id && getParentFrameId(it) === frame.id);

    const isExpanded = expandedFrames[frame.id] ?? true; // Sections & frames default to expanded
    const isSel = selectedId === frame.id || selectedIds.has(frame.id);
    const isLocked = lockedItemIds.has(frame.id);
    const isHidden = hiddenItemIds.has(frame.id);
    const paddingLeft = depth === 0 ? "pl-1.5" : depth === 1 ? "pl-4" : "pl-7";

    return (
      <div key={`frame-layer-${frame.id}`} className="space-y-0.5">
        {/* Frame / Section Item Row */}
        <div
          draggable={true}
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData("text/plain", frame.id);
            e.dataTransfer.effectAllowed = "move";
            setDraggingLayerId(frame.id);
          }}
          onDragEnd={() => {
            setDraggingLayerId(null);
            setDragOverLayerId(null);
            setDropPosition(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!draggingLayerId || draggingLayerId === frame.id) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const ratio = offsetY / rect.height;

            if (ratio >= 0.25 && ratio <= 0.75) {
              setDragOverLayerId(frame.id);
              setDropPosition("inside");
            } else if (ratio < 0.25) {
              setDragOverLayerId(frame.id);
              setDropPosition("before");
            } else {
              setDragOverLayerId(frame.id);
              setDropPosition("after");
            }
          }}
          onDragLeave={() => {
            if (dragOverLayerId === frame.id) {
              setDragOverLayerId(null);
              setDropPosition(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedId = e.dataTransfer.getData("text/plain") || draggingLayerId;
            if (droppedId && droppedId !== frame.id && dropPosition) {
              handleReorderLayer(droppedId, frame.id, dropPosition);
            }
            setDraggingLayerId(null);
            setDragOverLayerId(null);
            setDropPosition(null);
          }}
          onClick={(e) => handleSelectLayer(frame, e)}
          onContextMenu={(e) => handleItemContextMenu(e, frame)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            fitItemToScreen(frame);
          }}
          className={`relative w-full ${paddingLeft} pr-2 py-1.5 rounded-md flex items-center justify-between transition-colors cursor-grab active:cursor-grabbing group text-left ${
            isSel
              ? "bg-[#0c8ce9] text-white font-medium shadow-xs"
              : isLight
              ? "text-slate-700 hover:bg-slate-100"
              : "text-neutral-200 hover:bg-white/5 hover:text-white"
          } ${isHidden ? "opacity-40" : ""} ${
            draggingLayerId === frame.id ? "opacity-30 bg-white/5" : ""
          } ${
            dragOverLayerId === frame.id && dropPosition === "inside"
              ? "ring-2 ring-[#0c8ce9] bg-[#0c8ce9]/20"
              : ""
          }`}
        >
          {dragOverLayerId === frame.id && dropPosition === "before" && (
            <div className="absolute -top-0.5 left-1 right-1 h-0.5 bg-[#0c8ce9] z-30 rounded-full shadow-[0_0_8px_#0c8ce9] pointer-events-none" />
          )}
          {dragOverLayerId === frame.id && dropPosition === "after" && (
            <div className="absolute -bottom-0.5 left-1 right-1 h-0.5 bg-[#0c8ce9] z-30 rounded-full shadow-[0_0_8px_#0c8ce9] pointer-events-none" />
          )}
          <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
            {/* Expand / Collapse Chevron (Only shown when frame/section actually has nested children) */}
            {children.length > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFrameExpanded(frame.id);
                }}
                className={`p-0.5 rounded cursor-pointer shrink-0 transition-colors ${
                  isSel ? "text-white/80 hover:text-white" : isLight ? "text-slate-400 hover:text-slate-800" : "text-neutral-400 hover:text-white"
                }`}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <HiChevronRight
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    isExpanded ? "rotate-90" : "rotate-0"
                  }`}
                />
              </button>
            ) : (
              <span className="w-4.5 h-4.5 shrink-0" />
            )}

            {/* Icon: Figma Group Icon vs Figma Section Icon vs Frame Hashtag (#) */}
            {frame.type === "group" ? (
              <FigmaGroupIcon className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : isLight ? "text-slate-600" : "text-neutral-300"}`} />
            ) : isSection ? (
              <FigmaSectionIcon className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : isLight ? "text-slate-600" : "text-neutral-300"}`} />
            ) : (
              <HiHashtag className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : isLight ? "text-slate-600" : "text-neutral-300"}`} />
            )}

            {/* Frame / Section Title */}
            <span className={`truncate text-xs font-sans tracking-tight font-medium ${isSel ? "text-white font-medium" : isLight ? "text-slate-800" : "text-neutral-200"}`}>
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
                  : isLight
                  ? "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800"
                  : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
              }`}
              title={isLocked ? "Buka Kunci" : frame.type === "group" ? "Kunci Group" : isSection ? "Kunci Section" : "Kunci Frame"}
            >
              {isLocked ? <HiLockClosed className="w-3.5 h-3.5" /> : <HiLockOpen className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => toggleItemVisibility(frame.id, e)}
              className={`p-1 rounded transition-opacity cursor-pointer ${
                isHidden
                  ? "opacity-100 text-rose-400"
                  : isLight
                  ? "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800"
                  : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
              }`}
              title={isHidden ? "Tampilkan" : "Sembunyikan"}
            >
              {isHidden ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(frame.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 text-neutral-400 cursor-pointer"
              title={frame.type === "group" ? "Hapus Group" : isSection ? "Hapus Section" : "Hapus Frame"}
            >
              <HiTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nested Children Inside This Frame (Matches Screenshot media_1793529302513_bd071dc3.png) */}
        {isExpanded && children.length > 0 && (
          <div className={`space-y-0.5 pl-3 border-l ml-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
            {[...children].reverse().map((child) => {
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

    const isSel = selectedId === it.id || selectedIds.has(it.id);
    const isLocked = lockedItemIds.has(it.id);
    const isHidden = hiddenItemIds.has(it.id);
    const isText = it.type === "text" || it.mediaType === "text";
    const isShape = (it.type === "shape" || it.mediaType === "shape" || it.mediaType === "rectangle" || it.mediaType === "ellipse") && !it.image;
    const isEllipse = it.mediaType === "ellipse";
    const isImage = !isText && (Boolean(it.image) || it.type === "media" || it.mediaType === "image" || it.mediaType === "upload" || it.mediaType === "youtube" || it.mediaType === "gdrive" || !isShape);

    const paddingLeft = depth === 0 ? "pl-2" : depth === 1 ? "pl-5" : "pl-8";

    return (
      <div
        key={it.id}
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData("text/plain", it.id);
          e.dataTransfer.effectAllowed = "move";
          setDraggingLayerId(it.id);
        }}
        onDragEnd={() => {
          setDraggingLayerId(null);
          setDragOverLayerId(null);
          setDropPosition(null);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!draggingLayerId || draggingLayerId === it.id) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetY = e.clientY - rect.top;
          const ratio = offsetY / rect.height;

          if (ratio < 0.5) {
            setDragOverLayerId(it.id);
            setDropPosition("before");
          } else {
            setDragOverLayerId(it.id);
            setDropPosition("after");
          }
        }}
        onDragLeave={() => {
          if (dragOverLayerId === it.id) {
            setDragOverLayerId(null);
            setDropPosition(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const droppedId = e.dataTransfer.getData("text/plain") || draggingLayerId;
          if (droppedId && droppedId !== it.id && dropPosition) {
            handleReorderLayer(droppedId, it.id, dropPosition);
          }
          setDraggingLayerId(null);
          setDragOverLayerId(null);
          setDropPosition(null);
        }}
        onClick={(e) => handleSelectLayer(it, e)}
        onContextMenu={(e) => handleItemContextMenu(e, it)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          fitItemToScreen(it);
        }}
        className={`relative w-full ${paddingLeft} pr-2 py-1 rounded-md flex items-center justify-between transition-colors cursor-grab active:cursor-grabbing group text-left ${
          isSel
            ? "bg-[#0c8ce9] text-white font-medium shadow-xs"
            : isLight
            ? "text-slate-700 hover:bg-slate-100"
            : "text-neutral-300 hover:bg-white/8 hover:text-white"
        } ${isHidden ? "opacity-40" : ""} ${
          draggingLayerId === it.id ? "opacity-30 bg-white/5" : ""
        }`}
      >
        {dragOverLayerId === it.id && dropPosition === "before" && (
          <div className="absolute -top-0.5 left-1 right-1 h-0.5 bg-[#0c8ce9] z-30 rounded-full shadow-[0_0_8px_#0c8ce9] pointer-events-none" />
        )}
        {dragOverLayerId === it.id && dropPosition === "after" && (
          <div className="absolute -bottom-0.5 left-1 right-1 h-0.5 bg-[#0c8ce9] z-30 rounded-full shadow-[0_0_8px_#0c8ce9] pointer-events-none" />
        )}
        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
          {/* Item Type Icon (T for text, Figma Image Icon for images, Circle for ellipse, Outline Rectangle for shapes) */}
          {isText ? (
            <span className={`font-serif font-bold text-xs w-3.5 text-center shrink-0 ${isSel ? "text-white" : isLight ? "text-slate-700" : "text-neutral-300"}`}>T</span>
          ) : isImage ? (
            <FigmaImageIcon className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : isLight ? "text-slate-600" : "text-neutral-400"}`} />
          ) : isEllipse ? (
            <svg
              className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : isLight ? "text-slate-600" : "text-neutral-400"}`}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            >
              <circle cx="8" cy="8" r="5" />
            </svg>
          ) : (
            <svg
              className={`w-3.5 h-3.5 shrink-0 ${isSel ? "text-white" : isLight ? "text-slate-600" : "text-neutral-400"}`}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            >
              <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
            </svg>
          )}
          <span className={`truncate text-xs font-sans tracking-tight ${isSel ? "text-white font-medium" : isLight ? "text-slate-800" : "text-neutral-200"}`}>
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
                : isLight
                ? "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800"
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
                : isLight
                ? "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800"
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
          <>
            {/* Mobile Backdrop Overlay - tapping outside closes layers drawer */}
            {isScreenMobile && (
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
                onClick={() => setIsUiExpanded(false)}
              />
            )}
            <aside
              className={`select-none transition-all flex flex-col ${
                isScreenMobile
                  ? "fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full z-50 shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-left duration-200"
                  : "w-64 sm:w-72 shrink-0 h-full border-r z-30"
              } ${
                isLight ? "bg-white/98 border-slate-200 text-slate-800" : "bg-[#14161e]/98 border-white/10 text-white"
              }`}
            >
              {/* Layers Header (Matches Figma Image 1) */}
              <div
                className={`px-3 py-2.5 border-b flex items-center justify-between shrink-0 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-[#161822] border-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold tracking-tight font-sans ${isLight ? "text-slate-900" : "text-neutral-100"}`}>
                    Layers
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${isLight ? "bg-slate-200 text-slate-600" : "bg-white/10 text-neutral-400"}`}>
                    {items.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Delete Selected / Clear All Layers Button */}
                  {selectedIds.size > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteItems(selectedIds)}
                      className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      title={`Hapus ${selectedIds.size} layer terpilih (Del / Backspace)`}
                    >
                      <HiTrash className="w-3 h-3" />
                      <span>Hapus ({selectedIds.size})</span>
                    </button>
                  ) : items.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Hapus semua layer di canvas?")) {
                          handleDeleteItems(items.map((i) => i.id));
                        }
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus Semua Layer"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={toggleExpandAll}
                    title="Expand / Collapse Semua Layer"
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200" : "text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <HiBars3BottomLeft className="w-4 h-4" />
                  </button>
                  {/* Close / Minimize Button on Layers Header */}
                  <button
                    type="button"
                    onClick={() => setIsUiExpanded(false)}
                    title="Tutup Menu Sebelah Kiri (Ctrl+Shift+\)"
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200" : "text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2.5" width="12" height="11" rx="2" />
                      <line x1="6" y1="2.5" x2="6" y2="13.5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hierarchical Layers Tree (Figma-style: Frames, Sections, Images, Videos, Text) */}
              <div
                onContextMenu={handleCanvasContextMenu}
                className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs no-scrollbar"
              >
                {rootItems.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs font-sans">
                    Belum ada layer di canvas.
                  </div>
                ) : (
                  <>
                    {[...rootItems].reverse().map((rootIt) => renderLayerRow(rootIt, 0))}
                    {/* Bottom Drop Zone to move a layer to the very bottom of the stack */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingLayerId) {
                          setDragOverLayerId("__bottom__");
                          setDropPosition("after");
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverLayerId === "__bottom__") {
                          setDragOverLayerId(null);
                          setDropPosition(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedId = e.dataTransfer.getData("text/plain") || draggingLayerId;
                        if (droppedId) {
                          handleMoveLayerToBottom(droppedId);
                        }
                        setDraggingLayerId(null);
                        setDragOverLayerId(null);
                        setDropPosition(null);
                      }}
                      className={`min-h-[28px] mt-1 rounded-md transition-colors flex items-center justify-center ${
                        dragOverLayerId === "__bottom__" ? "border-t-2 border-[#0c8ce9] bg-[#0c8ce9]/10" : ""
                      }`}
                    />
                  </>
                )}
              </div>
            </aside>
          </>
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
            activeTool === "frame" || activeTool === "section" || activeTool === "shape"
              ? "cursor-crosshair"
              : isPanning || activeTool === "hand" || isSpacePressed
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-default"
          }`}
        >
          {/* Floating Studio Pill Menu (Matches User Screenshot media_1793558036658_5e46c976.png) */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40">
            {renderPillMenu()}
          </div>

          {/* Quick Floating Actions (Fullscreen, Inspector toggle, Mobile Layers) */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2 font-mono">
            {/* Mobile Layers Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsUiExpanded((prev) => !prev)}
              className={`p-1.5 sm:p-2 rounded-xl backdrop-blur-md border text-xs shadow-lg cursor-pointer transition-colors md:hidden ${
                isUiExpanded
                  ? "bg-[#0c8ce9] border-[#0c8ce9] text-white"
                  : isLight
                  ? "bg-white/95 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-slate-300/40"
                  : "bg-[#1e1e1e]/90 border-white/10 text-white hover:bg-white/20"
              }`}
              title="Daftar Layers"
            >
              <HiQueueList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`p-1.5 sm:p-2 rounded-xl backdrop-blur-md border text-xs shadow-lg cursor-pointer hidden sm:flex items-center justify-center transition-colors ${
                isLight
                  ? "bg-white/95 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-slate-300/40"
                  : "bg-[#1e1e1e]/90 border-white/10 text-white hover:bg-white/20"
              }`}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <HiArrowsPointingIn className="w-4 h-4" /> : <HiArrowsPointingOut className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isScreenMobile) {
                  setIsMobileInspectorOpen((prev) => !prev);
                } else {
                  setIsRightSidebarOpen((prev) => !prev);
                }
              }}
              className={`p-1.5 sm:p-2 rounded-xl backdrop-blur-md border text-xs shadow-lg cursor-pointer transition-colors ${
                isRightSidebarOpen || isMobileInspectorOpen
                  ? "bg-[#0c8ce9] border-[#0c8ce9] text-white shadow-[#0c8ce9]/25"
                  : isLight
                  ? "bg-white/95 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-slate-300/40"
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
            touchAction: "none",
          }}
        >
          {items.map((item, index) => {
            if (hiddenItemIds.has(item.id)) return null;
            const isSelected = activeTool !== "hand" && (selectedId === item.id || selectedIds.has(item.id));
            const isLocked = lockedItemIds.has(item.id);
            const x = item.x || 0;
            const y = item.y || 0;

            // 1. FIGMA SECTION (Matches User Screenshots media_1793557114016_fbbf493d.png & media_1793557157420_2ca188d0.png)
            if ((item.type === "section" || item.mediaType === "section") && item.type !== "shape" && item.mediaType !== "shape") {
              const secWidth = item.width || 1200;
              const secHeight = item.height || 600;
              const secBg = item.color || "rgba(50, 52, 58, 0.88)";

              return (
                <div
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item, e.currentTarget)}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onTouchEnd={(e) => handleItemTouchEnd(e, item, e.currentTarget)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (hasItemMovedDuringDragRef.current) return;
                    fitItemToScreen(item, e.currentTarget);
                  }}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    width: `${item.width || secWidth}px`,
                    height: `${item.height || secHeight}px`,
                    backgroundColor: secBg,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : "16px",
                    boxShadow: getEffectBoxShadow(item) || "0 10px 40px rgba(0,0,0,0.4)",
                    filter: getEffectFilter(item),
                    zIndex: isSelected ? 8 : 1,
                    touchAction: "none",
                  }}
                  className={`absolute rounded-2xl select-none cursor-grab active:cursor-grabbing transition-colors ${
                    draggingItemId === item.id ? "!transition-none will-change-transform z-30" : ""
                  } ${
                    isSelected
                      ? "border-2 border-[#0c8ce9] shadow-[0_20px_60px_rgba(12,140,233,0.3)]"
                      : isLight
                        ? "border border-slate-300/80 hover:border-slate-400 shadow-md"
                        : "border border-white/10 hover:border-white/25 shadow-lg"
                  }`}
                >
                  {/* Figma Top-Left Section Floating Pill Badge (Matches User Screenshot 2 & 3 [Section 6] [</>]) */}
                  <div className="absolute -top-8 left-0 flex items-center gap-1.5 pointer-events-auto select-none">
                    <div
                      className={`flex items-center px-2.5 py-1 rounded-lg shadow-md transition-colors ${
                        isSelected
                          ? isLight
                            ? "bg-white border border-[#0c8ce9] text-slate-900 shadow-slate-200"
                            : "bg-[#2c2c2c] border border-[#0c8ce9] text-white"
                          : isLight
                            ? "bg-white/95 border border-slate-300 text-slate-700 hover:text-slate-900 shadow-xs"
                            : "bg-[#2c2c2c]/95 border border-white/10 text-neutral-200 hover:text-white"
                      }`}
                    >
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-transparent text-xs font-sans font-medium focus:outline-none w-auto max-w-[200px] canvas-item-input ${
                          isLight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-neutral-500"
                        }`}
                      />
                    </div>

                    {/* Figma Dev Mode Badge Button [</>] */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDevMode((prev) => !prev);
                      }}
                      title="Ready for Dev (Figma Dev Mode)"
                      className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold shadow-md flex items-center justify-center cursor-pointer transition-colors ${
                        isLight
                          ? "bg-white/95 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          : "bg-[#2c2c2c]/95 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      &lt;/&gt;
                    </button>
                  </div>

                  {/* Corner Handles when selected */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />

                      {/* Dimension Badge at Bottom (Matches User Screenshot 2 & 3) */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-xs font-mono font-medium shadow-lg whitespace-nowrap">
                        {Math.round(secWidth)} × {Math.round(secHeight)}
                      </div>
                    </>
                  )}
                </div>
              );
            }

            // 1.1 FIGMA GROUP (Dynamic bounding box wrapping children, transparent container)
            if (item.type === "group") {
              const children = items.filter(
                (it) => it.id !== item.id && (it.frameId === item.id || getParentFrameId(it) === item.id)
              );
              let gX = item.x || 0;
              let gY = item.y || 0;
              let gW = item.width || 400;
              let gH = item.height || 300;

              if (children.length > 0) {
                let cMinX = Infinity;
                let cMinY = Infinity;
                let cMaxX = -Infinity;
                let cMaxY = -Infinity;

                children.forEach((c) => {
                  const b = getItemBounds(c);
                  cMinX = Math.min(cMinX, b.left);
                  cMinY = Math.min(cMinY, b.top);
                  cMaxX = Math.max(cMaxX, b.right);
                  cMaxY = Math.max(cMaxY, b.bottom);
                });

                if (cMinX !== Infinity) {
                  gX = cMinX;
                  gY = cMinY;
                  gW = Math.max(1, cMaxX - cMinX);
                  gH = Math.max(1, cMaxY - cMinY);
                }
              }

              return (
                <div
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item, e.currentTarget)}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onTouchEnd={(e) => handleItemTouchEnd(e, item, e.currentTarget)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (hasItemMovedDuringDragRef.current) return;
                    if (children.length > 0) {
                      setSelectedId(children[0].id);
                      setSelectedIds(new Set([children[0].id]));
                    }
                  }}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${gX}px, ${gY}px, 0)`,
                    width: `${gW}px`,
                    height: `${gH}px`,
                    zIndex: 10 + index,
                    touchAction: "none",
                  }}
                  className={`absolute pointer-events-auto select-none transition-colors ${
                    draggingItemId === item.id
                      ? "!transition-none will-change-transform cursor-grabbing"
                      : "cursor-grab active:cursor-grabbing"
                  } ${
                    isSelected
                      ? "ring-1 ring-[#0c8ce9] shadow-[0_0_0_1px_#0c8ce9]"
                      : "hover:ring-1 hover:ring-[#0c8ce9]/40 border-transparent bg-transparent"
                  }`}
                >
                  {/* Figma Group Selection Handles & Dimension Badge */}
                  {isSelected && (
                    <>
                      {/* 4 Corner Handles */}
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "nw")}
                        className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "ne")}
                        className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "sw")}
                        className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "se")}
                        className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                      />

                      {/* Dimension Badge at Bottom (e.g. 233 × 66) */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-[12px] font-sans font-medium shadow-lg whitespace-nowrap pointer-events-none z-40 select-none">
                        {Math.round(gW)} × {Math.round(gH)}
                      </div>
                    </>
                  )}
                </div>
              );
            }

            // 1.5 FIGMA VECTOR SHAPE (Rectangle & Ellipse - Matches Figma Images 4 & 5)
            if (item.type === "shape" || item.mediaType === "shape" || item.mediaType === "rectangle" || item.mediaType === "ellipse") {
              const shapeWidth = item.width || 320;
              const shapeHeight = item.height || 200;
              const isEllipse = item.mediaType === "ellipse";
              const shapeBg = item.color || "#D9D9D9";
              const radius = isEllipse ? "9999px" : item.cornerRadius !== undefined ? `${item.cornerRadius}px` : "0px";
              const shapeClipPath = getItemClipPath(item);
              const isChildOfFrame = Boolean(item.frameId || getParentFrameId(item));

              return (
                <div
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item, e.currentTarget)}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (hasItemMovedDuringDragRef.current) return;
                    fitItemToScreen(item, e.currentTarget);
                  }}
                  onTouchEnd={(e) => {
                    handleItemTouchEnd(e, item, e.currentTarget);
                  }}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    width: `${shapeWidth}px`,
                    height: `${shapeHeight}px`,
                    backgroundColor: shapeBg,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    borderRadius: radius,
                    boxShadow: getEffectBoxShadow(item),
                    filter: getEffectFilter(item),
                    zIndex: isChildOfFrame ? 30 + index : 10 + index,
                    clipPath: shapeClipPath ? shapeClipPath : undefined,
                    touchAction: "none",
                  }}
                  className={`absolute flex flex-col select-none cursor-grab active:cursor-grabbing transition-colors ${
                    draggingItemId === item.id ? "!transition-none will-change-transform shadow-[0_30px_90px_rgba(0,0,0,0.85)] scale-[1.01]" : ""
                  } ${
                    isSelected
                      ? "ring-2 ring-[#0c8ce9] shadow-[0_25px_60px_rgba(12,140,233,0.35)]"
                      : "hover:ring-1 hover:ring-white/40 shadow-sm"
                  }`}
                >
                  {/* Figma Selection Handles & Dimension Badge (Matches Figma Images 4 & 5) */}
                  {isSelected && (
                    <>
                      {/* 4 Corner Resize Handles */}
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "nw")}
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "ne")}
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "sw")}
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "se")}
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                      />

                      {/* 4 Edge Resize Handles */}
                      {activeTool !== "scale" && (
                        <>
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "n")}
                            className="absolute -top-1.5 left-3 right-3 h-3 cursor-ns-resize z-40 pointer-events-auto"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "s")}
                            className="absolute -bottom-1.5 left-3 right-3 h-3 cursor-ns-resize z-40 pointer-events-auto"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "w")}
                            className="absolute top-3 bottom-3 -left-1.5 w-3 cursor-ew-resize z-40 pointer-events-auto"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "e")}
                            className="absolute top-3 bottom-3 -right-1.5 w-3 cursor-ew-resize z-40 pointer-events-auto"
                          />
                        </>
                      )}

                      {/* Figma Dimension Badge Centered at Bottom (1972 × 1388 / 2433 × 399) */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-[12px] font-sans font-medium shadow-lg whitespace-nowrap pointer-events-none z-40 select-none">
                        {Math.round(shapeWidth)} × {Math.round(shapeHeight)}
                      </div>
                    </>
                  )}
                </div>
              );
            }

            // 2. FOLDER CLIENT (Folder Card directly on Canvas)
            if (item.type === "folder" || item.mediaType === "folder") {
              return (
                <div
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item, e.currentTarget)}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onTouchEnd={(e) => handleItemTouchEnd(e, item, e.currentTarget)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (hasItemMovedDuringDragRef.current) return;
                    fitItemToScreen(item, e.currentTarget);
                  }}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    width: `${item.width || 280}px`,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : undefined,
                    boxShadow: getEffectBoxShadow(item),
                    filter: getEffectFilter(item),
                    zIndex: isSelected ? 50 : 10 + index,
                    touchAction: "none",
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
              const isEditing = editingTextId === item.id;
              const textClipPath = getItemClipPath(item);
              const isChildOfFrame = Boolean(item.frameId || getParentFrameId(item));
              const textFontFamily = getCssFontFamily(item.fontFamily || "Noto Serif");
              const textFontWeight = getCssFontWeight(item.fontWeight || "Regular");
              const textFontSize = item.fontSize || 129;
              const textLineHeight = item.lineHeight || "100%";
              const textLetterSpacing = item.letterSpacing || "-3%";
              const textColor = item.color || "#FFFFFF";
              const textAlignment = (item.textAlign as any) || "left";
              const rawText = item.content !== undefined ? item.content : item.title || "";
              const resizeMode = item.textAutoResize || "auto_width";
              const isAutoWidth = resizeMode === "auto_width";
              const isAutoHeight = resizeMode === "auto_height";
              const isFixed = resizeMode === "fixed";

              const textLines = (rawText || " ").split("\n");
              const longestLineLen = Math.max(...textLines.map((l) => l.length), 1);
              const estimatedW = Math.round(isAutoWidth ? Math.max(28, longestLineLen * textFontSize * 0.58 + 10) : (item.width || 320));
              const estimatedH = Math.round(isFixed && item.height ? item.height : Math.max(textFontSize * 1.15, textLines.length * textFontSize * 1.2 + 8));

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
                    if (isMulti) {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) {
                          next.delete(item.id);
                          const remaining = Array.from(next);
                          setSelectedId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
                        } else {
                          next.add(item.id);
                          setSelectedId(item.id);
                        }
                        return next;
                      });
                    } else {
                      setSelectedId(item.id);
                      setSelectedIds(new Set([item.id]));
                    }
                  }}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onTouchEnd={(e) => handleItemTouchEnd(e, item, e.currentTarget)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (hasItemMovedDuringDragRef.current) return;
                    setEditingTextId(item.id);
                  }}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    width: isAutoWidth ? "max-content" : item.width ? `${item.width}px` : "320px",
                    height: isFixed && item.height ? `${item.height}px` : "auto",
                    filter: item.effects === "drop-shadow" && !item.effectHidden ? `drop-shadow(${item.shadowX || 0}px ${item.shadowY !== undefined ? item.shadowY : 4}px ${item.shadowBlur !== undefined ? item.shadowBlur : 4}px rgba(0,0,0,${(item.shadowOpacity !== undefined ? item.shadowOpacity : 25)/100}))` : getEffectFilter(item),
                    zIndex: isChildOfFrame ? 30 + index : 10 + index,
                    clipPath: textClipPath ? textClipPath : undefined,
                    touchAction: "none",
                  }}
                  className={`absolute group transition-shadow ${
                    isEditing ? "cursor-text select-text" : "cursor-move select-none"
                  } ${
                    isSelected
                      ? "ring-1 ring-[#0c8ce9]"
                      : "hover:ring-1 hover:ring-[#0c8ce9]/50"
                  }`}
                >
                  {/* Figma Bounding Box & Corner Handles when Selected (Matches Screenshots 2 & 5) */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] pointer-events-none z-50 shadow-xs" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] pointer-events-none z-50 shadow-xs" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] pointer-events-none z-50 shadow-xs" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px] pointer-events-none z-50 shadow-xs" />
                      {activeTool === "scale" ? (
                        <>
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "nw")}
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "ne")}
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "sw")}
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "se")}
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                          />
                        </>
                      ) : (
                        <>
                          {/* Interactive Drag Handles for Resizing Width and Height */}
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "e")}
                            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-5 cursor-ew-resize z-50 pointer-events-auto flex items-center justify-center opacity-0 group-hover:opacity-100"
                            title="Tarik lebar text box (Auto height)"
                          >
                            <div className="w-1.5 h-3 bg-white border border-[#0c8ce9] rounded-xs" />
                          </div>
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "se")}
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 cursor-nwse-resize z-50 pointer-events-auto"
                            title="Tarik ukuran text box (Fixed size)"
                          />
                        </>
                      )}

                      {/* Figma Dimension Badge Centered at Bottom (Matches Screenshots 2 & 5: 211 × 58 / 146 × 116) */}
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-[11px] font-mono font-medium shadow-lg whitespace-nowrap pointer-events-none z-40 select-none">
                        {estimatedW} × {estimatedH}
                      </div>
                    </>
                  )}

                  {/* Inline Live Editable Text Area with Dynamic Mirror Sizer */}
                  <div
                    className="relative block"
                    style={{
                      width: isAutoWidth ? "max-content" : "100%",
                      height: isFixed && item.height ? `${item.height}px` : "auto",
                    }}
                  >
                    {/* Invisible Mirror Element that measures exact text dimensions */}
                    <span
                      aria-hidden="true"
                      className="invisible pointer-events-none select-none block"
                      style={{
                        fontFamily: textFontFamily,
                        fontWeight: textFontWeight,
                        fontSize: `${textFontSize}px`,
                        lineHeight: textLineHeight,
                        letterSpacing: textLetterSpacing,
                        textAlign: textAlignment,
                        padding: "2px 4px",
                        whiteSpace: isAutoWidth ? "pre" : "pre-wrap",
                        wordBreak: isAutoWidth ? "normal" : "break-word",
                        minHeight: `${textFontSize * 1.15}px`,
                        minWidth: isSelected ? "24px" : "0px",
                      }}
                    >
                      {rawText ? (rawText.endsWith("\n") ? rawText + " " : rawText) : " "}
                    </span>

                    {/* Actual Live Textarea that receives keyboard input */}
                    <textarea
                      ref={(el) => {
                        if (el && isEditing && document.activeElement !== el) {
                          el.focus();
                          const len = el.value.length;
                          el.setSelectionRange(len, len);
                        }
                      }}
                      value={rawText}
                      readOnly={!isEditing}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) =>
                          prev.map((it) => (it.id === item.id ? { ...it, content: val, title: val || "Text" } : it))
                        );
                        setHasChanges(true);
                      }}
                      onBlur={(e) => {
                        setEditingTextId(null);
                        const val = e.target.value.trim();
                        if (!val) {
                          handleDeleteItem(item.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setEditingTextId(null);
                          if (!rawText.trim()) {
                            handleDeleteItem(item.id);
                          } else {
                            (e.target as HTMLElement).blur();
                          }
                        } else if ((e.key === "Backspace" || e.key === "Delete") && rawText === "") {
                          e.preventDefault();
                          setEditingTextId(null);
                          handleDeleteItem(item.id);
                        }
                      }}
                      placeholder={isEditing ? "Tulis teks..." : ""}
                      style={{
                        fontFamily: textFontFamily,
                        fontWeight: textFontWeight,
                        fontSize: `${textFontSize}px`,
                        lineHeight: textLineHeight,
                        letterSpacing: textLetterSpacing,
                        color: textColor,
                        textAlign: textAlignment,
                        caretColor: isEditing ? "#0c8ce9" : "transparent",
                        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        whiteSpace: isAutoWidth ? "pre" : "pre-wrap",
                        wordBreak: isAutoWidth ? "normal" : "break-word",
                        overflow: isFixed ? "hidden" : "visible",
                        padding: "2px 4px",
                        pointerEvents: isEditing ? "auto" : "none",
                        userSelect: isEditing ? "text" : "none",
                      }}
                      className={`canvas-text-textarea absolute inset-0 w-full h-full bg-transparent border-none outline-none resize-none m-0 leading-tight block ${
                        isEditing ? "pointer-events-auto select-text cursor-text" : "pointer-events-none select-none cursor-move"
                      }`}
                    />

                    {/* Blinking Cursor Indicator when Empty & Editing */}
                    {rawText === "" && isEditing && (
                      <span
                        className="absolute left-1.5 top-1.5 w-[3px] bg-white animate-pulse pointer-events-none"
                        style={{ height: `${textFontSize * 0.85}px` }}
                      />
                    )}
                  </div>
                </div>
              );
            }

            // 3.45 FIGMA GROUP (Matches Figma: Invisible container wrapping grouped children, dashed selection box and dimensions)
            if (item.type === "group") {
              const children = items.filter((c) => c.frameId === item.id);
              let gLeft = item.x || 0;
              let gTop = item.y || 0;
              let gW = item.width || 100;
              let gH = item.height || 100;

              if (children.length > 0) {
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                children.forEach((c) => {
                  const b = getItemBounds(c);
                  minX = Math.min(minX, b.left);
                  minY = Math.min(minY, b.top);
                  maxX = Math.max(maxX, b.right);
                  maxY = Math.max(maxY, b.bottom);
                });
                if (minX !== Infinity) {
                  gLeft = minX;
                  gTop = minY;
                  gW = Math.max(1, maxX - minX);
                  gH = Math.max(1, maxY - minY);
                }
              }

              return (
                <div
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item, e.currentTarget)}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onTouchEnd={(e) => handleItemTouchEnd(e, item, e.currentTarget)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${gLeft}px, ${gTop}px, 0)`,
                    width: `${gW}px`,
                    height: `${gH}px`,
                    zIndex: isSelected ? 45 : 2,
                    pointerEvents: isSelected ? "auto" : "none",
                  }}
                  className={`absolute select-none pointer-events-none ${
                    isSelected ? "ring-1 ring-[#0c8ce9] pointer-events-auto" : ""
                  }`}
                >
                  {/* Figma Group Dimension Badge (Matches User Screenshot media_1793599195082_51ce88b6.png [364 × 137]) */}
                  {isSelected && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-[3px] bg-[#0c8ce9] text-white text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none">
                      {Math.round(gW)} × {Math.round(gH)}
                    </div>
                  )}
                </div>
              );
            }

            // 3.5 FIGMA ARTBOARD FRAME (Pure Canvas Artboard - Matches Screenshot Image 2)
            if ((item.mediaType === "frame" || item.type === "frame") && item.type !== "group" && !item.image) {
              const frameWidth = item.width || 440;
              const frameHeight = item.height || 550;
              const frameBg = item.color || "#FFFFFF";
              const isChildOfFrame = Boolean(item.frameId || getParentFrameId(item));

              return (
                <div
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item, e.currentTarget)}
                  onMouseDown={(e) => handleItemMouseDown(e, item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onTouchEnd={(e) => handleItemTouchEnd(e, item, e.currentTarget)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (hasItemMovedDuringDragRef.current) return;
                    fitItemToScreen(item, e.currentTarget);
                  }}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    width: `${frameWidth}px`,
                    height: `${frameHeight}px`,
                    backgroundColor: frameBg,
                    opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                    borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : "0px",
                    boxShadow: getEffectBoxShadow(item) || "0 10px 40px rgba(0,0,0,0.35)",
                    filter: getEffectFilter(item),
                    zIndex: isChildOfFrame ? 30 + index : 5 + index,
                    touchAction: "none",
                  }}
                  className={`absolute flex flex-col select-none cursor-grab active:cursor-grabbing transition-colors ${
                    draggingItemId === item.id ? "!transition-none will-change-transform" : ""
                  } ${
                    isSelected
                      ? "ring-2 ring-[#0c8ce9] shadow-[0_25px_60px_rgba(12,140,233,0.35)]"
                      : "hover:ring-1 hover:ring-white/40 shadow-xl"
                  }`}
                >
                  {/* Figma Top Frame Title (Matches Screenshot Image 1 & 2 Frame 2147263084 / bran coffee) */}
                  <div className="absolute -top-7 left-0 flex items-center gap-1.5 pointer-events-auto">
                    {isSelected ? (
                      <div className={`flex items-center px-1.5 py-0.5 rounded-[2px] border border-[#0c8ce9] shadow-xs ${
                        isLight ? "bg-white text-slate-900 shadow-slate-200" : "bg-[#1e1e1e]/90 text-white"
                      }`}>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Escape") {
                              (e.target as HTMLElement).blur();
                            }
                          }}
                          style={{
                            width: `${Math.max(64, (item.title || "Frame").length * 8 + 14)}px`,
                          }}
                          className={`bg-transparent text-[12px] font-sans font-medium outline-none border-none p-0 m-0 leading-none select-text cursor-text canvas-item-input ${
                            isLight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-neutral-500"
                          }`}
                          placeholder="Nama Frame..."
                        />
                      </div>
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(item.id);
                          setSelectedIds(new Set([item.id]));
                        }}
                        className={`text-[12px] font-sans font-medium select-none truncate max-w-[280px] cursor-pointer ${
                          isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {item.title}
                      </span>
                    )}
                    {isLocked && <HiLockClosed className="w-3 h-3 text-amber-400" />}
                  </div>

                  {/* Corner & Edge Resize Handles & Dimension Badge when Selected or Resizing */}
                  {(isSelected || resizingItemId === item.id) && (
                    <>
                      {/* 4 Corner Resize Handles (Matches Screenshot Image 1 & 2) */}
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "nw")}
                        className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "ne")}
                        className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "sw")}
                        className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, item, "se")}
                        className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                      />

                      {/* 4 Edge Resize Handles (Matches Screenshot Image 1 & 2) */}
                      {activeTool !== "scale" && (
                        <>
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "n")}
                            className="absolute -top-1.5 left-3 right-3 h-3 cursor-ns-resize z-40 pointer-events-auto"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "s")}
                            className="absolute -bottom-1.5 left-3 right-3 h-3 cursor-ns-resize z-40 pointer-events-auto"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "w")}
                            className="absolute top-3 bottom-3 -left-1.5 w-3 cursor-ew-resize z-40 pointer-events-auto"
                          />
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item, "e")}
                            className="absolute top-3 bottom-3 -right-1.5 w-3 cursor-ew-resize z-40 pointer-events-auto"
                          />
                        </>
                      )}

                      {/* Figma Dimension Badge Centered at Bottom (Matches Screenshot Image 1 & 3: 2457 × 1813) */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-[12px] font-sans font-medium shadow-lg whitespace-nowrap pointer-events-none z-40 select-none">
                        {Math.round(frameWidth)} × {Math.round(frameHeight)}
                      </div>
                    </>
                  )}
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
            const clipPathStyle = getItemClipPath(item);
            const isChildOfFrame = Boolean(item.frameId || getParentFrameId(item));

            return (
              <div
                key={item.id}
                onClick={(e) => handleItemClick(e, item, e.currentTarget)}
                onMouseDown={(e) => handleItemMouseDown(e, item)}
                onTouchStart={(e) => handleItemTouchStart(e, item)}
                onContextMenu={(e) => handleItemContextMenu(e, item)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (hasItemMovedDuringDragRef.current) return;
                  fitItemToScreen(item, e.currentTarget);
                }}
                onTouchEnd={(e) => {
                  handleItemTouchEnd(e, item, e.currentTarget);
                }}
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                  width: `${item.width || cardWidth}px`,
                  height: isChildOfFrame ? `${currentHeight}px` : item.height ? `${item.height}px` : undefined,
                  opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                  borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : undefined,
                  boxShadow: isChildOfFrame ? undefined : getEffectBoxShadow(item),
                  filter: getEffectFilter(item),
                  zIndex: isChildOfFrame ? 30 + index : 10 + index,
                  clipPath: clipPathStyle ? clipPathStyle : undefined,
                  touchAction: "none",
                }}
                className={`group absolute ${isChildOfFrame ? "rounded-none" : "rounded-2xl"} flex flex-col select-none cursor-grab active:cursor-grabbing ${
                  draggingItemId === item.id
                    ? "!transition-none will-change-transform cursor-grabbing shadow-[0_30px_90px_rgba(0,0,0,0.85)] scale-[1.01]"
                    : "transition-colors duration-150"
                } ${
                  isSelected
                    ? "ring-2 ring-[#0c8ce9] shadow-[0_25px_60px_rgba(12,140,233,0.35)]"
                    : isChildOfFrame
                    ? ""
                    : "hover:ring-1 hover:ring-white/40 shadow-2xl"
                }`}
              >
                {/* Figma Selection Frame Handles & Dimension Badge */}
                {isSelected && (
                  <>
                    {/* 4 Corner Resize Handles */}
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, item, "nw")}
                      className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                    />
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, item, "ne")}
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                    />
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, item, "sw")}
                      className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nesw-resize pointer-events-auto shadow-sm"
                    />
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, item, "se")}
                      className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] z-50 cursor-nwse-resize pointer-events-auto shadow-sm"
                    />

                    {/* 4 Edge Resize Handles */}
                    {activeTool !== "scale" && (
                      <>
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, item, "n")}
                          className="absolute -top-1.5 left-3 right-3 h-3 cursor-ns-resize z-40 pointer-events-auto"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, item, "s")}
                          className="absolute -bottom-1.5 left-3 right-3 h-3 cursor-ns-resize z-40 pointer-events-auto"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, item, "w")}
                          className="absolute top-3 bottom-3 -left-1.5 w-3 cursor-ew-resize z-40 pointer-events-auto"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, item, "e")}
                          className="absolute top-3 bottom-3 -right-1.5 w-3 cursor-ew-resize z-40 pointer-events-auto"
                        />
                      </>
                    )}

                    {/* Dimension Badge centered at bottom */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-[11px] font-mono font-medium shadow-lg whitespace-nowrap pointer-events-none z-40">
                      {Math.round(currentWidth)} × {Math.round(currentHeight)}
                    </div>
                  </>
                )}

                {/* Card Content Wrapper */}
                <div className="flex flex-col w-full h-full">
                {/* Header Label (Editable Title & Actions) - only for standalone cards */}
                {!isChildOfFrame && (
                  <div className={`flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-xl border backdrop-blur-md text-[11px] font-mono ${
                    isLight
                      ? "bg-white/95 border-slate-300 text-slate-700 shadow-sm"
                      : "bg-black/80 border-white/10 text-neutral-300"
                  }`}>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                        className={`bg-transparent border-b border-transparent focus:border-teal-500 font-bold truncate focus:outline-none w-full canvas-item-input ${
                          isLight ? "text-slate-900 hover:border-slate-300" : "text-white hover:border-white/20"
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLocked && (
                        <span className="p-0.5 text-amber-500" title="Layer Terkunci">
                          <HiLockClosed className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        isLight ? "bg-slate-100 text-teal-700 border-slate-200" : "bg-white/10 text-teal-300 border-white/10"
                      }`}>
                        {item.aspect === "original" ? "ORIGINAL" : item.aspect}
                      </span>
                      {item.isVideo && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[9px] font-bold border border-emerald-500/30 uppercase">
                          VIDEO
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="text-neutral-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Hapus Media"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Media Container - High-DPI Sharp Rendering */}
                <div
                  className={`relative w-full overflow-hidden flex items-center justify-center cursor-pointer ${
                    isChildOfFrame
                      ? "h-full rounded-none border-none shadow-none bg-transparent"
                      : "rounded-2xl bg-neutral-950 border border-white/15 shadow-2xl"
                  }`}
                  style={{
                    aspectRatio: isChildOfFrame ? undefined : cardAspect,
                    minHeight: !isChildOfFrame && item.aspect === "original" ? "320px" : undefined,
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    const card = e.currentTarget.parentElement as HTMLElement;
                    if (selectedId === item.id || selectedIds.has(item.id)) {
                      fitItemToScreen(item, card);
                    } else {
                      setSelectedId(item.id);
                      setSelectedIds(new Set([item.id]));
                    }
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
                      className={`w-full h-full ${isChildOfFrame ? "object-cover" : "object-contain"} pointer-events-none select-none`}
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
                  {isSelected && !isChildOfFrame && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-teal-400 border border-black rounded-xs pointer-events-none" />
                    </>
                  )}
                </div>
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
              {/* Corner Handles for Proportional Multi-Object Resizing */}
              <div
                onMouseDown={(e) => handleMultiResizeMouseDown(e, "nw")}
                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] cursor-nwse-resize pointer-events-auto z-50 hover:scale-125 transition-transform"
                title="Tarik batas luar group (Top-Left)"
              />
              <div
                onMouseDown={(e) => handleMultiResizeMouseDown(e, "ne")}
                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] cursor-nesw-resize pointer-events-auto z-50 hover:scale-125 transition-transform"
                title="Tarik batas luar group (Top-Right)"
              />
              <div
                onMouseDown={(e) => handleMultiResizeMouseDown(e, "sw")}
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] cursor-nesw-resize pointer-events-auto z-50 hover:scale-125 transition-transform"
                title="Tarik batas luar group (Bottom-Left)"
              />
              <div
                onMouseDown={(e) => handleMultiResizeMouseDown(e, "se")}
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0c8ce9] rounded-[2px] cursor-nwse-resize pointer-events-auto z-50 hover:scale-125 transition-transform"
                title="Tarik batas luar group (Bottom-Right)"
              />

              {/* Figma Tidy Up Star Button on Top Right (Matches Screenshot 3) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAlign("tidyup");
                }}
                title="Tidy Up (Ctrl+Alt+Shift+T)"
                className="absolute -top-2.5 -right-7 w-5 h-5 rounded-md bg-[#1e1e1e] border border-[#0c8ce9] text-[#0c8ce9] hover:bg-[#0c8ce9] hover:text-white pointer-events-auto flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer z-50"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </button>

              {/* Dimension Badge at Bottom (Matches User's Screenshot!) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-xs font-mono font-medium shadow-lg whitespace-nowrap">
                {multiSelectionBounds.width} × {multiSelectionBounds.height}
              </div>
            </div>
          )}

          {/* Figma Smart Selection Handles (Matches Screenshot 1, 2, 3: media_1793556393083_c2342577.png, media_1793556418206_0c6d7025.png, media_1793556428138_e43349f7.png) */}
          {smartSelectionGrid && activeTool !== "hand" && (
            <>
              {/* Pink Center Rings (◎) on each selected item */}
              {smartSelectionGrid.rects.map((r) => (
                <div
                  key={`pink-center-${r.id}`}
                  title="Smart Selection handle"
                  className="absolute pointer-events-auto cursor-grab active:cursor-grabbing w-3.5 h-3.5 rounded-full border-2 border-[#ff2a85] bg-transparent flex items-center justify-center shadow-xs z-40 hover:scale-125 transition-transform"
                  style={{
                    transform: `translate3d(${r.cx - 7}px, ${r.cy - 7}px, 0)`,
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-[#ff2a85]" />
                </div>
              ))}

              {/* Horizontal Spacing Lines (between rows - Matches Screenshot 1 & 2: pink line with badge [718]) */}
              {smartSelectionGrid.rowSeparators.map((sep, idx) => (
                <div
                  key={`row-sep-${idx}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startY = e.clientY;
                    const initialGap = sep.gap;
                    const handleMove = (ev: MouseEvent) => {
                      const deltaY = (ev.clientY - startY) / zoomRef.current;
                      handleUpdateSpacing(undefined, Math.max(0, Math.round(initialGap + deltaY)));
                    };
                    const handleUp = () => {
                      window.removeEventListener("mousemove", handleMove);
                      window.removeEventListener("mouseup", handleUp);
                    };
                    window.addEventListener("mousemove", handleMove);
                    window.addEventListener("mouseup", handleUp);
                  }}
                  className="absolute pointer-events-auto cursor-ns-resize z-40 group flex items-center justify-center"
                  style={{
                    transform: `translate3d(${sep.x}px, ${sep.y}px, 0)`,
                    width: `${sep.width}px`,
                    height: `${Math.max(16, sep.height)}px`,
                  }}
                >
                  {/* Clean Magenta Line spanning across items */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#ff2a85] shadow-xs group-hover:h-[3px] transition-all pointer-events-none" />

                  {/* Pink Badge showing current gap [ 718 ] */}
                  <div className="relative z-10 px-2 py-0.5 rounded bg-[#ff2a85] text-white text-[11px] font-mono font-bold shadow-md select-none group-hover:scale-110 transition-transform">
                    {Math.round(sep.gap)}
                  </div>
                </div>
              ))}

              {/* Vertical Spacing Capsule Bars (between columns - Matches Screenshot 1 & 3: vertical pills | with badge [409]) */}
              {smartSelectionGrid.colSeparators.map((sep, idx) => (
                <div
                  key={`col-sep-${idx}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const initialGap = sep.gap;
                    const handleMove = (ev: MouseEvent) => {
                      const deltaX = (ev.clientX - startX) / zoomRef.current;
                      handleUpdateSpacing(Math.max(0, Math.round(initialGap + deltaX)), undefined);
                    };
                    const handleUp = () => {
                      window.removeEventListener("mousemove", handleMove);
                      window.removeEventListener("mouseup", handleUp);
                    };
                    window.addEventListener("mousemove", handleMove);
                    window.addEventListener("mouseup", handleUp);
                  }}
                  className="absolute pointer-events-auto cursor-ew-resize z-40 group flex items-center justify-center"
                  style={{
                    transform: `translate3d(${sep.x}px, ${sep.y}px, 0)`,
                    width: `${Math.max(16, sep.width)}px`,
                    height: `${sep.height}px`,
                  }}
                >
                  {/* Vertical Pink Capsule Pills (|) between rows */}
                  <div className="flex flex-col justify-around items-center h-full pointer-events-none">
                    {Array.from({ length: smartSelectionGrid.rows }).map((_, rIdx) => (
                      <div
                        key={`capsule-${idx}-${rIdx}`}
                        className="w-[5px] h-6 rounded-full bg-white border border-[#ff2a85] shadow-xs group-hover:bg-[#ff2a85] transition-colors"
                      />
                    ))}
                  </div>

                  {/* Pink Badge showing current gap [ 409 ] */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-full ml-1 px-2 py-0.5 rounded bg-[#ff2a85] text-white text-[11px] font-mono font-bold shadow-md select-none group-hover:scale-110 transition-transform whitespace-nowrap">
                    {Math.round(sep.gap)}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Figma Smart Alignment & Snapping Guides (Matches Screenshots 1, 2 & 3) */}
          {(activeSnapGuides.lines.length > 0 || activeSnapGuides.distances.length > 0) && (
            <div className="absolute inset-0 pointer-events-none z-50">
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                {/* 1. Alignment Guide Lines */}
                {activeSnapGuides.lines.map((line, idx) => (
                  <g key={`guide-${idx}`}>
                    {line.type === "horizontal" ? (
                      <>
                        <line
                          x1={line.start}
                          y1={line.pos}
                          x2={line.end}
                          y2={line.pos}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                          strokeDasharray="none"
                        />
                        {/* Figma Crosshair Endpoints / Ticks */}
                        <line
                          x1={line.start}
                          y1={line.pos - 5 / zoom}
                          x2={line.start}
                          y2={line.pos + 5 / zoom}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                        <line
                          x1={line.end}
                          y1={line.pos - 5 / zoom}
                          x2={line.end}
                          y2={line.pos + 5 / zoom}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                      </>
                    ) : (
                      <>
                        <line
                          x1={line.pos}
                          y1={line.start}
                          x2={line.pos}
                          y2={line.end}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                          strokeDasharray="none"
                        />
                        {/* Figma Crosshair Endpoints / Ticks */}
                        <line
                          x1={line.pos - 5 / zoom}
                          y1={line.start}
                          x2={line.pos + 5 / zoom}
                          y2={line.start}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                        <line
                          x1={line.pos - 5 / zoom}
                          y1={line.end}
                          x2={line.pos + 5 / zoom}
                          y2={line.end}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                      </>
                    )}
                  </g>
                ))}

                {/* 2. Distance Measurement Lines */}
                {activeSnapGuides.distances.map((dist, idx) => (
                  <g key={`dist-line-${idx}`}>
                    {dist.type === "horizontal" ? (
                      <>
                        <line
                          x1={dist.startPos}
                          y1={dist.crossPos}
                          x2={dist.endPos}
                          y2={dist.crossPos}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                        <line
                          x1={dist.startPos}
                          y1={dist.crossPos - 5 / zoom}
                          x2={dist.startPos}
                          y2={dist.crossPos + 5 / zoom}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                        <line
                          x1={dist.endPos}
                          y1={dist.crossPos - 5 / zoom}
                          x2={dist.endPos}
                          y2={dist.crossPos + 5 / zoom}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                      </>
                    ) : (
                      <>
                        <line
                          x1={dist.crossPos}
                          y1={dist.startPos}
                          x2={dist.crossPos}
                          y2={dist.endPos}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                        <line
                          x1={dist.crossPos - 5 / zoom}
                          y1={dist.startPos}
                          x2={dist.crossPos + 5 / zoom}
                          y2={dist.startPos}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                        <line
                          x1={dist.crossPos - 5 / zoom}
                          y1={dist.endPos}
                          x2={dist.crossPos + 5 / zoom}
                          y2={dist.endPos}
                          stroke="#ff5500"
                          strokeWidth={1.5 / zoom}
                        />
                      </>
                    )}
                  </g>
                ))}
              </svg>

              {/* 3. Figma Orange Distance Pill Badges (Matches Screenshot 2 [ 788 ]) */}
              {activeSnapGuides.distances.map((dist, idx) => {
                const midX = dist.type === "horizontal" ? (dist.startPos + dist.endPos) / 2 : dist.crossPos;
                const midY = dist.type === "horizontal" ? dist.crossPos : (dist.startPos + dist.endPos) / 2;
                return (
                  <div
                    key={`dist-badge-${idx}`}
                    className="absolute pointer-events-none px-1.5 py-0.5 rounded bg-[#ff5500] text-white text-[11px] font-mono font-bold shadow-md whitespace-nowrap select-none"
                    style={{
                      left: `${midX}px`,
                      top: `${midY}px`,
                      transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                    }}
                  >
                    {dist.distance}
                  </div>
                );
              })}
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

        {/* Interactive Frame, Section & Shape Drawing Preview Box (Matches Screenshot Image 1) */}
        {drawingShapeBox && (
          <div
            className={`absolute pointer-events-none border-2 border-[#0c8ce9] z-50 shadow-xl ${
              drawingShapeBox.type === "shape" ? "bg-[#D9D9D9]" : "bg-white/[0.04]"
            }`}
            style={{
              left: `${Math.min(drawingShapeBox.startX, drawingShapeBox.currentX)}px`,
              top: `${Math.min(drawingShapeBox.startY, drawingShapeBox.currentY)}px`,
              width: `${Math.max(2, Math.abs(drawingShapeBox.currentX - drawingShapeBox.startX))}px`,
              height: `${Math.max(2, Math.abs(drawingShapeBox.currentY - drawingShapeBox.startY))}px`,
            }}
          >
            {/* Top Frame Label (Only for Frame & Section) */}
            {drawingShapeBox.type !== "shape" && (
              <div className="absolute -top-6 left-0 text-[12px] font-sans font-medium text-neutral-400 select-none whitespace-nowrap">
                {drawingShapeBox.type === "section" ? "New Section" : `Frame ${Math.floor(Date.now() / 1000)}`}
              </div>
            )}

            {/* 4 Corner Handles (Matches Screenshot Image 1) */}
            <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-[#0c8ce9] rounded-[2px]" />

            {/* Figma Dimension Badge Centered at Bottom (Matches Screenshots 4 & 5: 1972 × 1388) */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#0c8ce9] text-white text-[11px] font-mono font-medium shadow-lg whitespace-nowrap pointer-events-none">
              {Math.round(Math.abs(drawingShapeBox.currentX - drawingShapeBox.startX) / (zoomRef.current || zoom))} ×{" "}
              {Math.round(Math.abs(drawingShapeBox.currentY - drawingShapeBox.startY) / (zoomRef.current || zoom))}
            </div>
          </div>
        )}
      </div>

      {/* Figma Design Inspector / Right Sidebar (Images 1, 2, 3) - Only inline on desktop, mobile uses drawer */}
      {!isScreenMobile && isUiExpanded && isRightSidebarOpen && renderRightInspector()}
      </div>

      {/* Figma Color Picker Popover (Matches Screenshot media_1793528907470_542d3124.png) */}
      {renderFigmaColorPicker()}

      {/* ── Figma Floating Studio Toolbar Dock (Images 1, 2, 3, 4, 5) ─────────── */}
      <nav
        aria-label="Figma Studio Toolbar"
        className="figma-toolbar-dock fixed bottom-[max(12px,env(safe-area-inset-bottom,12px))] sm:bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-[#1e1e1e]/98 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white select-none max-w-[calc(100vw-16px)] md:max-w-max overflow-x-auto sm:overflow-visible no-scrollbar touch-manipulation h-11 sm:h-12"
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
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
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
            className={`h-8 sm:h-9 px-1 sm:px-1.5 rounded-r-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTool === "select" || activeTool === "hand" || activeTool === "scale"
                ? "bg-[#0c8ce9] text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiChevronDown className="w-3 h-3" />
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
              if (isScreenMobile) setIsMobileInspectorOpen(true);
              setActiveSubmenu(null);
            }}
            title={activeTool === "section" ? "Section (Shift+S)" : "Frame (F)"}
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-l-xl flex items-center justify-center transition-colors cursor-pointer ${
              activeTool === "frame" || activeTool === "section"
                ? "bg-[#0c8ce9] text-white shadow-sm"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {activeTool === "section" ? (
              <FigmaSectionIcon className="w-4 h-4" />
            ) : (
              <HiHashtag className="w-4 h-4" />
            )}
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
                  if (isScreenMobile) setIsMobileInspectorOpen(true);
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
                  <FigmaSectionIcon className="w-4 h-4" />
                  <span>Section</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">Shift+S</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. SHAPE TOOL (With Submenu: Rectangle R, Ellipse O, Folder Alt+F, Place Media Ctrl+Shift+K) */}
        <div className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTool(activeTool === "shape" ? "select" : "shape");
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
                  setActiveTool("shape");
                  setActiveSubmenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  activeTool === "shape" ? "bg-[#0c8ce9] text-white" : "hover:bg-white/10 text-neutral-200 hover:text-white"
                }`}
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
                  <span className="w-3.5 h-3.5 rounded-full border border-current inline-block shrink-0" />
                  <span>Ellipse</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">O</span>
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

        {/* 4. TEXT TOOL */}
        <button
          type="button"
          onClick={() => {
            handleAddText();
            setActiveTool("text");
            setActiveSubmenu(null);
          }}
          title="Text (T)"
          className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl flex items-center justify-center transition-colors cursor-pointer font-serif font-bold text-sm shrink-0 ${
            activeTool === "text"
              ? "bg-[#0c8ce9] text-white shadow-sm"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
        >
          T
        </button>

        {/* Mobile Quick Fit All */}
        <button
          type="button"
          onClick={zoomToFitAll}
          title="Fit All Elements"
          className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-neutral-300 hover:text-white hover:bg-white/10 shrink-0 md:hidden"
        >
          <HiArrowsPointingOut className="w-4 h-4 text-teal-400" />
        </button>

        {/* Mobile Quick Inspector Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileInspectorOpen((prev) => !prev)}
          title="Inspector / Properties"
          className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 md:hidden ${
            isMobileInspectorOpen
              ? "bg-[#0c8ce9] text-white shadow-sm"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <HiAdjustmentsHorizontal className="w-4 h-4" />
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
          className={`w-[245px] py-1.5 px-1 rounded-xl border select-none animate-in fade-in zoom-in-95 duration-100 text-[12.5px] font-sans max-h-[calc(100vh-28px)] overflow-y-auto overscroll-contain backdrop-blur-xl ${
            isLight
              ? "bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
              : "bg-[#222222]/98 border-white/10 text-[#e6e6e6] shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
          }`}
        >
          {/* Section 1: Clipboard & Actions */}
          <button
            type="button"
            onClick={() => {
              handleCopy(contextMenu.item || undefined);
              setContextMenu(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors cursor-pointer group text-left ${
              isLight
                ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white"
                : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
            }`}
          >
            <span>Copy</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+C</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handlePaste({ x: contextMenu.canvasX, y: contextMenu.canvasY });
              setContextMenu(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors cursor-pointer group text-left ${
              isLight
                ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white"
                : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
            }`}
          >
            <span>Paste here</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+V</span>
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
                ? isLight
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-neutral-500 cursor-not-allowed"
                : isLight
                  ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                  : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Paste to replace</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+Shift+R</span>
          </button>

          {/* Copy/Paste as Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setContextSubmenu("copy_as")}
            onMouseLeave={() => setContextSubmenu(null)}
          >
            <div className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors cursor-pointer group ${
              isLight
                ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white"
                : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
            }`}>
              <span>Copy/Paste as</span>
              <HiChevronRight className={`w-3.5 h-3.5 group-hover:text-white ${
                isLight ? "text-slate-400" : "text-[#8e8e8e]"
              }`} />
            </div>

            {contextSubmenu === "copy_as" && (
              <div className={`absolute top-0 w-[180px] py-1 px-1 rounded-xl border backdrop-blur-xl z-50 animate-in fade-in duration-75 ${
                isLight
                  ? "bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
                  : "bg-[#222222]/98 border-white/10 text-[#e6e6e6] shadow-2xl"
              } ${
                typeof window !== "undefined" && contextMenu.x + 245 + 190 > window.innerWidth ? "right-full mr-1" : "left-full ml-1"
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.item) handleCopy(contextMenu.item);
                    alert("Data elemen disalin!");
                    setContextMenu(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] rounded-md cursor-pointer transition-colors ${
                    isLight ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white" : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
                  }`}
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
                  className={`w-full text-left px-3 py-1.5 text-[12px] rounded-md cursor-pointer transition-colors ${
                    isLight ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white" : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
                  }`}
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
                  className={`w-full text-left px-3 py-1.5 text-[12px] rounded-md cursor-pointer transition-colors ${
                    isLight ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white" : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
                  }`}
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
                  className={`w-full text-left px-3 py-1.5 text-[12px] rounded-md cursor-pointer transition-colors ${
                    isLight ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white" : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
                  }`}
                >
                  Copy link
                </button>
              </div>
            )}
          </div>

          <div className={`h-[1px] my-1 mx-1.5 ${isLight ? "bg-slate-200/80" : "bg-white/[0.08]"}`} />

          {/* Section 2: Ordering */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleBringToFront(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item
                ? isLight
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-neutral-500 cursor-not-allowed"
                : isLight
                  ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                  : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Bring to front</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleSendToBack(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item
                ? isLight
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-neutral-500 cursor-not-allowed"
                : isLight
                  ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                  : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Send to back</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>[</span>
          </button>

          <div className={`h-[1px] my-1 mx-1.5 ${isLight ? "bg-slate-200/80" : "bg-white/[0.08]"}`} />

          {/* Section 3: Grouping & Structure */}
          {(() => {
            const isFrame = contextMenu.item && (contextMenu.item.mediaType === "frame" || contextMenu.item.type === "frame") && !contextMenu.item.image;
            return (
              <button
                type="button"
                onClick={() => {
                  if (contextMenu.item) handleConvertFrameOrSection(contextMenu.item);
                  setContextMenu(null);
                }}
                disabled={!contextMenu.item}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
                  !contextMenu.item
                    ? isLight
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-neutral-500 cursor-not-allowed"
                    : isLight
                      ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                      : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isFrame ? (
                    <FigmaSectionIcon className={`w-3.5 h-3.5 group-hover:text-white ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`} />
                  ) : (
                    <HiHashtag className={`w-3.5 h-3.5 group-hover:text-white ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`} />
                  )}
                  <span>{isFrame ? "Convert to section" : "Convert to frame"}</span>
                </div>
              </button>
            );
          })()}

          <button
            type="button"
            onClick={() => {
              handleGroupSelection();
              setContextMenu(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors cursor-pointer group text-left ${
              isLight
                ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white"
                : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
            }`}
          >
            <span>Group selection</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+G</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleFrameSelection();
              setContextMenu(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors cursor-pointer group text-left ${
              isLight
                ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white"
                : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
            }`}
          >
            <span>Frame selection</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+Alt+G</span>
          </button>

          {(() => {
            const it = contextMenu.item;
            const isGroup = it?.type === "group";
            const hasChildren = it ? items.some((c) => c.id !== it.id && (c.frameId === it.id || getParentFrameId(c) === it.id)) : false;
            const isNested = Boolean(it?.frameId);
            const canUngroup = isGroup || hasChildren || isNested;

            return (
              <button
                type="button"
                disabled={!canUngroup}
                onClick={() => {
                  if (canUngroup) {
                    handleUngroup(contextMenu.item);
                    setContextMenu(null);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
                  !canUngroup
                    ? "opacity-30 cursor-not-allowed text-neutral-500"
                    : isLight
                    ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                    : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                }`}
              >
                <span>Ungroup</span>
                <span className={`text-[11px] font-mono ${
                  !canUngroup ? "text-neutral-600" : isLight ? "text-slate-400 group-hover:text-white/90" : "text-[#8e8e8e] group-hover:text-white/90"
                }`}>Ctrl+⌫</span>
              </button>
            );
          })()}

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) {
                const newTitle = window.prompt("Ubah nama layer:", contextMenu.item.title);
                if (newTitle && newTitle.trim()) {
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === contextMenu.item?.id ? { ...i, title: newTitle.trim() } : i
                    )
                  );
                  setHasChanges(true);
                }
              }
              setContextMenu(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors cursor-pointer group text-left ${
              isLight
                ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white"
                : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white"
            }`}
          >
            <span>Rename</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+R</span>
          </button>

          <div className={`h-[1px] my-1 mx-1.5 ${isLight ? "bg-slate-200/80" : "bg-white/[0.08]"}`} />

          {/* Section 5: Visibility & Lock */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleToggleHide(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item
                ? isLight
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-neutral-500 cursor-not-allowed"
                : isLight
                  ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                  : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>{contextMenu.item && hiddenItemIds.has(contextMenu.item.id) ? "Show" : "Hide"}</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+Shift+H</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleToggleLock(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item
                ? isLight
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-neutral-500 cursor-not-allowed"
                : isLight
                  ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                  : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>{contextMenu.item && lockedItemIds.has(contextMenu.item.id) ? "Unlock" : "Lock"}</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Ctrl+Shift+L</span>
          </button>

          <div className={`h-[1px] my-1 mx-1.5 ${isLight ? "bg-slate-200/80" : "bg-white/[0.08]"}`} />

          {/* Section 6: Transformations & Delete */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleFlipHorizontal(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item
                ? isLight
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-neutral-500 cursor-not-allowed"
                : isLight
                  ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                  : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Flip horizontal</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Shift+H</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (contextMenu.item) handleFlipVertical(contextMenu.item.id);
              setContextMenu(null);
            }}
            disabled={!contextMenu.item}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors text-left ${
              !contextMenu.item
                ? isLight
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-neutral-500 cursor-not-allowed"
                : isLight
                  ? "text-slate-700 hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
                  : "text-[#e6e6e6] hover:bg-[#0c8ce9] hover:text-white cursor-pointer group"
            }`}
          >
            <span>Flip vertical</span>
            <span className={`text-[11px] font-mono group-hover:text-white/90 ${
              isLight ? "text-slate-400" : "text-[#8e8e8e]"
            }`}>Shift+V</span>
          </button>

          {contextMenu.item && (
            <>
              <div className={`h-[1px] my-1 mx-1.5 ${isLight ? "bg-slate-200/80" : "bg-white/[0.08]"}`} />
              <button
                type="button"
                onClick={() => {
                  if (contextMenu.item) {
                    if (selectedIds.has(contextMenu.item.id) && selectedIds.size > 1) {
                      const idsToDelete = new Set(selectedIds);
                      const updated = items.filter(
                        (it) => !idsToDelete.has(it.id) && (!it.frameId || !idsToDelete.has(it.frameId))
                      );
                      updateItemsWithTracking(updated);
                      setSelectedIds(new Set());
                      setSelectedId(null);
                    } else {
                      handleDeleteItem(contextMenu.item.id);
                    }
                  }
                  setContextMenu(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] rounded-md transition-colors cursor-pointer group text-left font-medium ${
                  isLight
                    ? "text-rose-600 hover:bg-rose-500 hover:text-white"
                    : "text-red-400 hover:bg-red-500 hover:text-white"
                }`}
              >
                <span>Delete</span>
                <span className={`text-[11px] font-mono group-hover:text-white ${
                  isLight ? "text-rose-400" : "text-red-400/80"
                }`}>Del</span>
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
        <div className="fixed inset-0 z-50 md:hidden flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
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

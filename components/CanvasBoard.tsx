"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  HiXMark,
  HiMiniMagnifyingGlassPlus,
  HiMiniMagnifyingGlassMinus,
  HiArrowsPointingOut,
  HiArrowPath,
  HiShieldCheck,
  HiQuestionMarkCircle,
} from "react-icons/hi2";
import { RiFullscreenFill, RiFullscreenExitFill, RiGridFill } from "react-icons/ri";
import { usePortfolioData, CanvasItem } from "@/context/PortfolioDataContext";
import { normalizeMediaUrl } from "@/lib/mediaService";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

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
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

  // Viewport & Transform Engine State
  const [zoom, setZoom] = useState<number>(0.8);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [fittedSheetId, setFittedSheetId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  // Double-tap tracking for mobile devices
  const lastTapRef = useRef<{ time: number; id: string }>({ time: 0, id: "" });
  const lastFitTimeRef = useRef<number>(0);

  // Gesture tracking: detect pinch vs single-tap while in fitted state
  const touchGestureRef = useRef<{ startX: number; startY: number; wasPinch: boolean }>({
    startX: 0,
    startY: 0,
    wasPinch: false,
  });

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

  const isCanvasCustomized = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("rizx_canvas_seeded") === "true" ||
      Boolean(localStorage.getItem("rizx_portfolio_custom_data_v1")?.includes('"canvasItems"'))
    );
  }, [canvasItems]);

  const hasFreeformLayout = useMemo(() => {
    if (canvasItems && canvasItems.length > 0) return true;
    if (isCanvasCustomized) return true;
    return false;
  }, [canvasItems, isCanvasCustomized]);

  // Gather all works across client vaults into Canvas reference sheets
  const sheets: CanvasSheetItem[] = useMemo(() => {
    if (isCanvasCustomized || (canvasItems && canvasItems.length > 0)) {
      const validCanvasMedia = (canvasItems || []).filter(
        (item) => item.type !== "section" && item.mediaType !== "section" && item.type !== "text" && item.mediaType !== "text" && (item.image || item.videoId)
      );

      return validCanvasMedia.map((item) => ({
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

    // Fallback ONLY when canvas was NEVER initialized or customized
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

    // If client works are few, append hero showcases
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
  }, [canvasItems, clients, heroWorks, isCanvasCustomized]);

  // Board layout 2D multi-column width calculation
  const gridCols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(sheets.length || 6))));
  const gridCardWidth = 480;
  const gridGap = 80;
  const gridPad = 100;
  const gridBoardWidth = gridCols * gridCardWidth + (gridCols - 1) * gridGap + gridPad * 2;
  const gridBoardHeight = Math.ceil(sheets.length / gridCols) * 660 + gridPad * 2;

  // Center & Fit Canvas on mount / open
  const zoomToFit = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    if (hasFreeformLayout) {
      if (!canvasItems || canvasItems.length === 0) {
        setZoom(0.8);
        setPan({
          x: Math.round(clientWidth / 2 - 480 * 0.8),
          y: Math.round(clientHeight / 2 - 320 * 0.8),
        });
        setFittedSheetId(null);
        return;
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      canvasItems.forEach((it) => {
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
        }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });

      if (minX !== Infinity && maxX !== -Infinity) {
        const contentW = maxX - minX;
        const contentH = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const paddingX = Math.max(60, clientWidth * 0.08);
        const paddingY = Math.max(60, clientHeight * 0.1);

        const scaleX = (clientWidth - paddingX * 2) / Math.max(contentW, 100);
        const scaleY = (clientHeight - paddingY * 2) / Math.max(contentH, 100);
        const fitScale = Number(Math.min(1.0, Math.max(0.08, Math.min(scaleX, scaleY))).toFixed(3));

        setZoom(fitScale);
        setPan({
          x: Math.round(clientWidth / 2 - centerX * fitScale),
          y: Math.round(clientHeight / 2 - centerY * fitScale),
        });
        setFittedSheetId(null);
        return;
      }
    }

    const scaleX = (clientWidth * 0.92) / gridBoardWidth;
    const scaleY = (clientHeight * 0.88) / gridBoardHeight;
    const fitScale = Math.min(1.0, Math.max(0.18, Math.min(scaleX, scaleY)));

    setZoom(Number(fitScale.toFixed(2)));
    setPan({
      x: (clientWidth - gridBoardWidth * fitScale) / 2,
      y: Math.max(70, (clientHeight - gridBoardHeight * fitScale) / 2),
    });
    setFittedSheetId(null);
  }, [hasFreeformLayout, canvasItems, gridBoardWidth, gridBoardHeight]);

  // Fit specific sheet image automatically to screen on double-click / double-tap (Stays until single-tap)
  const fitSheetToScreen = useCallback(
    (targetEl: HTMLElement, sheetId: string) => {
      if (!containerRef.current || !targetEl) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = targetEl.getBoundingClientRect();

      if (
        containerRect.width === 0 ||
        containerRect.height === 0 ||
        rect.width === 0 ||
        rect.height === 0
      )
        return;

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      // Convert current screen coordinates into unscaled canvas coordinate space
      const elLeft = rect.left - containerRect.left;
      const elTop = rect.top - containerRect.top;
      const canvasX = (elLeft - currentPan.x) / currentZoom;
      const canvasY = (elTop - currentPan.y) / currentZoom;
      const canvasW = rect.width / currentZoom;
      const canvasH = rect.height / currentZoom;

      // Calculate optimal scale to fit snugly in viewport (generous margin for mobile elegance)
      const viewportWidth = containerRect.width;
      const viewportHeight = containerRect.height;
      const isMobileScreen = viewportWidth < 640;
      const targetScaleX = (viewportWidth * (isMobileScreen ? 0.94 : 0.92)) / canvasW;
      const targetScaleY = (viewportHeight * (isMobileScreen ? 0.88 : 0.90)) / canvasH;
      const targetZoom = Number(
        Math.min(4.0, Math.max(0.25, Math.min(targetScaleX, targetScaleY))).toFixed(2)
      );

      // Center the target sheet directly on screen
      const targetPanX = Math.round((viewportWidth - canvasW * targetZoom) / 2 - canvasX * targetZoom);
      const targetPanY = Math.round((viewportHeight - canvasH * targetZoom) / 2 - canvasY * targetZoom);

      setZoom(targetZoom);
      setPan({ x: targetPanX, y: targetPanY });
      setFittedSheetId(sheetId);
      setSelectedSheetId(sheetId);
      lastFitTimeRef.current = Date.now();
    },
    [containerRef]
  );

  // High-reliability touch double-tap tracker (Mobile View UX)
  const lastTouchTapRef = useRef<{ time: number; id: string; x: number; y: number }>({
    time: 0,
    id: "",
    x: 0,
    y: 0,
  });

  const handleSheetTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>, targetEl: HTMLElement, sheetId: string) => {
      e.stopPropagation();
      const touch = e.changedTouches[0];
      if (!touch) return;
      const now = Date.now();

      // If an image is currently staying fitted:
      // A single tap (1x) immediately zooms out to view the entire portfolio!
      // Guarded by cooldown so the double-tap itself never causes an immediate close!
      if (fittedSheetId) {
        if (now - lastFitTimeRef.current < 450) {
          // Synthetic touch event from the double-tap gesture itself - DO NOT CLOSE!
          return;
        }

        // Allow pinch zoom & pan inside fitted state — only dismiss on a clean tap!
        const wasPinch = touchGestureRef.current.wasPinch;
        const movedDist = Math.hypot(
          touch.clientX - touchGestureRef.current.startX,
          touch.clientY - touchGestureRef.current.startY
        );
        // Reset wasPinch flag after read
        touchGestureRef.current.wasPinch = false;

        if (wasPinch || movedDist > 12) {
          // Was a gesture (pinch zoom or pan) — keep fitted state, do NOT dismiss!
          return;
        }

        e.preventDefault();
        setFittedSheetId(null);
        zoomToFit();
        lastTouchTapRef.current = { time: 0, id: "", x: 0, y: 0 };
        return;
      }

      // Requirement: Only an image/frame that is ALREADY selected can be double-tapped to fit screen!
      const isAlreadySelected = selectedSheetId === sheetId;
      const timeSinceLast = now - lastTouchTapRef.current.time;
      const dist = Math.hypot(
        touch.clientX - lastTouchTapRef.current.x,
        touch.clientY - lastTouchTapRef.current.y
      );

      if (isAlreadySelected && timeSinceLast < 450 && dist < 35 && lastTouchTapRef.current.id === sheetId) {
        // Confirmed double-tap (2x) on SELECTED item: Zoom in, fit to screen & STAY until next single tap
        e.preventDefault();
        fitSheetToScreen(targetEl, sheetId);
        lastTouchTapRef.current = { time: 0, id: "", x: 0, y: 0 };
      } else {
        // First tap / selecting an unselected image or frame
        lastTouchTapRef.current = {
          time: now,
          id: sheetId,
          x: touch.clientX,
          y: touch.clientY,
        };
        setSelectedSheetId(sheetId);
      }
    },
    [fittedSheetId, selectedSheetId, fitSheetToScreen, zoomToFit]
  );

  // Handle double-tap detection for pointer / mouse clicks
  const handleSheetTap = useCallback(
    (targetEl: HTMLElement, sheetId: string, e?: React.MouseEvent) => {
      const now = Date.now();
      // If currently fitted: a single click zooms back out to full portfolio view
      if (fittedSheetId) {
        if (now - lastFitTimeRef.current < 450) {
          // Synthetic click from the double-tap gesture itself - DO NOT CLOSE!
          return;
        }

        // Allow panning/dragging around image without closing!
        if (hasDraggedRef.current) {
          hasDraggedRef.current = false;
          return;
        }
        if (e) {
          const moveDist = Math.hypot(
            e.clientX - pointerDownPosRef.current.x,
            e.clientY - pointerDownPosRef.current.y
          );
          if (moveDist > 6) {
            return;
          }
        }

        setFittedSheetId(null);
        zoomToFit();
        lastTapRef.current = { time: 0, id: "" };
        return;
      }

      // Requirement: Only double-click if ALREADY selected!
      const isAlreadySelected = selectedSheetId === sheetId;
      const timeSinceLast = now - lastTapRef.current.time;

      if (isAlreadySelected && timeSinceLast < 380 && lastTapRef.current.id === sheetId) {
        // Double-click confirmed on SELECTED item: fit and stay
        fitSheetToScreen(targetEl, sheetId);
        lastTapRef.current = { time: 0, id: "" };
      } else {
        lastTapRef.current = { time: now, id: sheetId };
        setSelectedSheetId(sheetId);
      }
    },
    [fittedSheetId, selectedSheetId, fitSheetToScreen, zoomToFit]
  );

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

  const pointerDownPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Pointer / Mouse Pan Events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    hasDraggedRef.current = false;
    if (e.button === 0 || e.button === 1 || isSpacePressed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const moveDist = Math.hypot(e.clientX - pointerDownPosRef.current.x, e.clientY - pointerDownPosRef.current.y);
    if (moveDist > 6) {
      hasDraggedRef.current = true;
    }
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dist = Math.hypot(e.clientX - pointerDownPosRef.current.x, e.clientY - pointerDownPosRef.current.y);
    if (dist > 6) {
      hasDraggedRef.current = true;
    }

    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }

    // Check if this was a clean single tap (not a drag) on the canvas background
    const time = Date.now() - pointerDownPosRef.current.time;
    if (dist < 8 && time < 350 && !hasDraggedRef.current) {
      if (fittedSheetId && Date.now() - lastFitTimeRef.current >= 450) {
        setFittedSheetId(null);
        zoomToFit();
      }
    }
  };

  // Touch Pinch-to-Zoom & Drag Pan Engine for Mobile / Tablet
  const touchStateRef = useRef<{
    initialDistance: number | null;
    initialZoom: number;
    initialPan: { x: number; y: number };
    initialMidX: number;
    initialMidY: number;
    startTouch: { x: number; y: number };
  }>({
    initialDistance: null,
    initialZoom: 1,
    initialPan: { x: 0, y: 0 },
    initialMidX: 0,
    initialMidY: 0,
    startTouch: { x: 0, y: 0 },
  });

  // Native non-passive event listeners: Completely isolates canvas zoom from browser webpage zoom
  useEffect(() => {
    if (!isOpen) return;

    // Lock page background scrolling and zoom on document body
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    const container = containerRef.current;
    if (!container) return;

    // Non-passive wheel listener: ALWAYS prevents native browser webpage zoom (Ctrl+wheel / trackpad pinch)
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const currentZoom = zoomRef.current;
      const newZoom = Math.min(5.5, Math.max(0.15, currentZoom * zoomFactor));

      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const currentPan = panRef.current;
      const newPanX = cursorX - (cursorX - currentPan.x) * (newZoom / currentZoom);
      const newPanY = cursorY - (cursorY - currentPan.y) * (newZoom / currentZoom);

      setZoom(Number(newZoom.toFixed(3)));
      setPan({ x: newPanX, y: newPanY });
    };

    // Non-passive touchmove listener: ALWAYS prevents mobile browser webpage pinch zoom
    const onNativeTouchMove = (e: TouchEvent) => {
      // Prevent browser default gesture zoom or page pull
      e.preventDefault();

      if (e.touches.length === 2 && touchStateRef.current.initialDistance !== null) {
        // 2-Finger Pinch Zoom — anchored to the MIDPOINT between the two fingers
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        const scale = dist / touchStateRef.current.initialDistance;
        const newZoom = Math.min(5.5, Math.max(0.15, touchStateRef.current.initialZoom * scale));

        // Current midpoint between 2 fingers (relative to container)
        const container = containerRef.current;
        const rect = container?.getBoundingClientRect();
        const offsetX = rect?.left ?? 0;
        const offsetY = rect?.top ?? 0;

        const currentMidX = (t0.clientX + t1.clientX) / 2 - offsetX;
        const currentMidY = (t0.clientY + t1.clientY) / 2 - offsetY;

        const initMidX = touchStateRef.current.initialMidX - offsetX;
        const initMidY = touchStateRef.current.initialMidY - offsetY;

        const initPan = touchStateRef.current.initialPan;
        const initZoom = touchStateRef.current.initialZoom;

        // Perfectly locks the canvas point directly between the two fingers without drifting
        const newPanX = currentMidX - (initMidX - initPan.x) * (newZoom / initZoom);
        const newPanY = currentMidY - (initMidY - initPan.y) * (newZoom / initZoom);

        setZoom(Number(newZoom.toFixed(3)));
        setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
      } else if (e.touches.length === 1) {
        // 1-Finger Pan
        setPan({
          x: e.touches[0].clientX - touchStateRef.current.startTouch.x,
          y: e.touches[0].clientY - touchStateRef.current.startTouch.y,
        });
      }
    };

    const onNativeTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        touchStateRef.current.initialDistance = dist;
        touchStateRef.current.initialZoom = zoomRef.current;
        touchStateRef.current.initialPan = { ...panRef.current };
        // Capture absolute midpoint between 2 fingers as zoom anchor
        touchStateRef.current.initialMidX = (t0.clientX + t1.clientX) / 2;
        touchStateRef.current.initialMidY = (t0.clientY + t1.clientY) / 2;
        // Mark as pinch so handleSheetTouchEnd won't dismiss fitted state
        touchGestureRef.current.wasPinch = true;
      } else if (e.touches.length === 1) {
        touchStateRef.current.startTouch = {
          x: e.touches[0].clientX - panRef.current.x,
          y: e.touches[0].clientY - panRef.current.y,
        };
        // Track absolute start position for pan-distance check in fitted state
        touchGestureRef.current.startX = e.touches[0].clientX;
        touchGestureRef.current.startY = e.touches[0].clientY;
        // Only reset wasPinch if no prior pinch in flight (2→1 finger lift case)
        if (!touchStateRef.current.initialDistance) {
          touchGestureRef.current.wasPinch = false;
        }
      }
    };

    const onNativeTouchEnd = () => {
      touchStateRef.current.initialDistance = null;
    };

    // Prevent Safari iOS gesture zoom
    const onGesture = (e: Event) => {
      e.preventDefault();
    };

    // Prevent Ctrl + '+', Ctrl + '-', Ctrl + '0' browser zoom
    const onKeyBlock = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "+" || e.key === "=") {
          setZoom((prev) => Number(Math.min(5.5, prev * 1.15).toFixed(2)));
        } else if (e.key === "-") {
          setZoom((prev) => Number(Math.max(0.18, prev * 0.85).toFixed(2)));
        } else if (e.key === "0") {
          zoomToFit();
        }
      }
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    container.addEventListener("touchstart", onNativeTouchStart, { passive: false });
    container.addEventListener("touchmove", onNativeTouchMove, { passive: false });
    container.addEventListener("touchend", onNativeTouchEnd, { passive: false });
    container.addEventListener("gesturestart", onGesture, { passive: false });
    container.addEventListener("gesturechange", onGesture, { passive: false });
    window.addEventListener("keydown", onKeyBlock, { capture: true });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalOverscroll;

      container.removeEventListener("wheel", onNativeWheel);
      container.removeEventListener("touchstart", onNativeTouchStart);
      container.removeEventListener("touchmove", onNativeTouchMove);
      container.removeEventListener("touchend", onNativeTouchEnd);
      container.removeEventListener("gesturestart", onGesture);
      container.removeEventListener("gesturechange", onGesture);
      window.removeEventListener("keydown", onKeyBlock, { capture: true });
    };
  }, [isOpen, zoomToFit]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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
      className={`fixed inset-0 z-[99999] select-none overflow-hidden touch-none transition-colors duration-200 ${
        isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#0c0d11] text-white"
      } ${
        isDragging
          ? "cursor-grabbing"
          : isSpacePressed
          ? "cursor-grab"
          : "cursor-default"
      }`}
      style={{
        touchAction: "none",
        overscrollBehavior: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* ── Background: Infinite Figma Dot-Grid Pattern ────────────────────────── */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isLight ? "opacity-60" : "opacity-40"
        }`}
        style={{
          backgroundImage: isLight
            ? "radial-gradient(rgba(15, 23, 42, 0.16) 1.2px, transparent 1.2px)"
            : "radial-gradient(rgba(255, 255, 255, 0.18) 1.2px, transparent 1.2px)",
          backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Subtle Coordinate Axis Ambient Glow */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none ${
          isLight ? "bg-teal-500/[0.06]" : "bg-cyan-500/[0.04]"
        }`}
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
          <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border backdrop-blur-xl transition-colors ${
            isLight
              ? "bg-white/95 border-slate-300 text-slate-900 shadow-xl shadow-slate-200/60"
              : "bg-[#13151b]/90 border-white/10 text-white shadow-2xl"
          }`}>
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center p-1 shrink-0 ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-900 shadow-xs"
                : "bg-neutral-900 border-white/10 text-cyan-400 shadow-md shadow-black/40"
            }`}>
              <RiGridFill className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold tracking-wider ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  RIZX CANVAS
                </span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-semibold border ${
                  isLight
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-cyan-400/20 text-cyan-300 border-cyan-400/30"
                }`}>
                  STUDIO BOARD
                </span>
              </div>
              <p className={`text-[10px] font-mono hidden sm:block ${
                isLight ? "text-slate-500" : "text-neutral-400"
              }`}>
                {hasFreeformLayout
                  ? `${canvasItems?.length || 0} ${tr("Elemen Canvas", "Canvas Elements")}`
                  : `${sheets.length} ${tr("Lembaran Karya Tersedia", "Portfolio Sheets")}`
                } · {tr("Zoom & Pan Bebas", "Free Zoom & Pan")}
              </p>
            </div>
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
            className={`w-10 h-10 rounded-2xl border backdrop-blur-xl flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer ${
              isLight
                ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-950"
                : "bg-[#13151b]/90 hover:bg-[#1c1f28] border-white/10 text-neutral-300 hover:text-white"
            }`}
          >
            <HiQuestionMarkCircle className="w-5 h-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className={`w-10 h-10 rounded-2xl border backdrop-blur-xl flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer hidden sm:flex ${
              isLight
                ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-950"
                : "bg-[#13151b]/90 hover:bg-[#1c1f28] border-white/10 text-neutral-300 hover:text-white"
            }`}
          >
            {isFullscreen ? (
              <RiFullscreenExitFill className={`w-4 h-4 ${isLight ? "text-teal-600" : "text-cyan-400"}`} />
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
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-2xl border backdrop-blur-xl transition-all shadow-2xl active:scale-95 cursor-pointer group ${
              isLight
                ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 shadow-slate-200/50"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border-red-500/40"
            }`}
          >
            <HiXMark className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-mono font-bold tracking-wider hidden sm:inline">
              ESC
            </span>
          </button>
        </div>
      </header>

      {/* ── Shortcuts Help Card Popover ───────────────────────────────────────── */}
      {/* ── Floating Return-to-Overview Pill when an Image is Fitted / Staying ── */}
      {fittedSheetId && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFittedSheetId(null);
            zoomToFit();
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-2.5 text-xs font-mono cursor-pointer transition-all animate-in fade-in slide-in-from-bottom-3 hover:scale-105 active:scale-95"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-semibold">Tap 1x untuk lihat keseluruhan portfolio</span>
          <span className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px] font-bold">
            ✕
          </span>
        </button>
      )}

      {showShortcutsHelp && (
        <div className={`absolute top-20 right-5 z-50 w-72 rounded-2xl border p-4 backdrop-blur-2xl shadow-2xl animate-fade-in font-mono text-xs ${
          isLight
            ? "bg-white/98 border-slate-300 text-slate-800"
            : "bg-[#13151b]/95 border-white/15 text-neutral-300"
        }`}>
          <div className={`flex items-center justify-between pb-2 mb-2.5 border-b ${
            isLight ? "border-slate-200" : "border-white/10"
          }`}>
            <span className={`font-bold tracking-wider ${isLight ? "text-teal-700" : "text-cyan-400"}`}>
              NAVIGASI CANVAS
            </span>
            <button
              onClick={() => setShowShortcutsHelp(false)}
              className={`cursor-pointer ${isLight ? "text-slate-400 hover:text-slate-900" : "text-neutral-400 hover:text-white"}`}
            >
              ✕
            </button>
          </div>
          <div className={`space-y-2 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
            <div className="flex justify-between items-center">
              <span>Zoom In / Out</span>
              <span className={`px-2 py-0.5 rounded font-bold ${isLight ? "bg-slate-100 text-slate-800 border border-slate-300" : "bg-white/10 text-white"}`}>
                Scroll Wheel / Pinch
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pan / Geser</span>
              <span className={`px-2 py-0.5 rounded font-bold ${isLight ? "bg-slate-100 text-slate-800 border border-slate-300" : "bg-white/10 text-white"}`}>
                Klik & Drag / 2 Jari
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hand Tool</span>
              <span className={`px-2 py-0.5 rounded font-bold ${isLight ? "bg-slate-100 text-slate-800 border border-slate-300" : "bg-white/10 text-white"}`}>
                Space + Drag
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fit Gambar Layar</span>
              <span className={`px-2 py-0.5 rounded font-bold ${isLight ? "bg-teal-50 text-teal-800 border border-teal-200" : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"}`}>
                Tap 2x / Double Click
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fit All / Reset</span>
              <span className={`px-2 py-0.5 rounded font-bold ${isLight ? "bg-slate-100 text-slate-800 border border-slate-300" : "bg-white/10 text-white"}`}>
                F / Tombol [ ]
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Keluar Canvas</span>
              <span className={`px-2 py-0.5 rounded font-bold ${isLight ? "bg-slate-100 text-slate-800 border border-slate-300" : "bg-white/10 text-white"}`}>
                Tombol X / Esc
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2D Infinite Transform Content Engine ───────────────────────────────── */}
      <div
        ref={boardContentRef}
        className={`absolute top-0 left-0 origin-top-left transition-transform duration-300 ease-out ${
          isDragging ? "!transition-none will-change-transform" : ""
        }`}
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Canvas Elements: Either Freeform Figma-style coordinates or Flex-wrap Grid */}
        {hasFreeformLayout ? (
          <div className="relative w-[5000px] h-[4000px] select-none">
            {(!canvasItems || canvasItems.length === 0) ? (
              <div
                style={{
                  transform: "translate3d(320px, 240px, 0)",
                }}
                className={`absolute p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center max-w-sm pointer-events-none select-none backdrop-blur-md ${
                  isLight
                    ? "bg-white/70 border-slate-300 text-slate-700 shadow-sm"
                    : "bg-[#13151b]/70 border-white/15 text-neutral-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-2xl ${
                  isLight ? "bg-teal-50 text-teal-600 border border-teal-200" : "bg-teal-500/10 text-teal-400"
                }`}>
                  ✦
                </div>
                <h4 className={`text-base font-bold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {tr("Canvas Masih Kosong", "Canvas is Empty")}
                </h4>
                <p className={`text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  {tr(
                    "Belum ada elemen di canvas studio. Tambahkan karya atau frame melalui Dashboard Admin > Rizx Canvas.",
                    "No elements on the canvas studio yet. Add works or frames via Admin Dashboard > Rizx Canvas."
                  )}
                </p>
              </div>
            ) : null}
            {(() => {
              const getItemClipPath = (item: CanvasItem) => {
                if (!item.frameId) return undefined;
                const parentFrame = (canvasItems || []).find((f) => f.id === item.frameId);
                if (!parentFrame) return undefined;
                if (parentFrame.clipContent === false) return undefined;

                const fLeft = parentFrame.x || 0;
                const fTop = parentFrame.y || 0;
                const fWidth = parentFrame.width || 440;
                const fHeight = parentFrame.height || 550;
                const fRight = fLeft + fWidth;
                const fBottom = fTop + fHeight;

                const itLeft = item.x || 0;
                const itTop = item.y || 0;
                let itWidth = item.width || 440;
                let itHeight = item.height || 550;
                if (item.aspect === "16:9") itHeight = Math.round(itWidth * (9 / 16));
                else if (item.aspect === "1:1") itHeight = itWidth;
                else if (item.aspect === "9:16") itHeight = Math.round(itWidth * (16 / 9));
                else if (item.aspect === "4:5" || !item.aspect || item.aspect === "original") itHeight = Math.round(itWidth * (5 / 4));

                const clipTop = Math.max(0, fTop - itTop);
                const clipRight = Math.max(0, (itLeft + itWidth) - fRight);
                const clipBottom = Math.max(0, (itTop + itHeight) - fBottom);
                const clipLeft = Math.max(0, fLeft - itLeft);

                if (clipTop === 0 && clipRight === 0 && clipBottom === 0 && clipLeft === 0) {
                  return undefined;
                }

                const radius = parentFrame.cornerRadius !== undefined ? `${parentFrame.cornerRadius}px` : "0px";
                return `inset(${Math.round(clipTop)}px ${Math.round(clipRight)}px ${Math.round(clipBottom)}px ${Math.round(clipLeft)}px round ${radius})`;
              };

              return (canvasItems || []).map((item, index) => {
                const x = item.x ?? 80;
                const y = item.y ?? 80;
                const isSelected = selectedSheetId === item.id;

              // 1. SECTION BOUNDARY BOX
              if ((item.type === "section" || item.mediaType === "section") && item.type !== "shape" && item.mediaType !== "shape" && item.mediaType !== "rectangle" && item.mediaType !== "ellipse") {
                const secWidth = item.width || 1200;
                const secHeight = item.height || 680;
                const secColor = item.color || "#00A389";
                return (
                  <div
                    key={item.id}
                    style={{
                      transform: `translate3d(${x}px, ${y}px, 0)`,
                      width: `${secWidth}px`,
                      height: `${secHeight}px`,
                      borderColor: isLight ? `${secColor}70` : `${secColor}40`,
                      backgroundColor: isLight ? `${secColor}0c` : `${secColor}05`,
                    }}
                    className="absolute rounded-3xl border-2 border-dashed p-4 flex flex-col justify-between pointer-events-none"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider text-black uppercase shadow-sm"
                        style={{ backgroundColor: secColor }}
                      >
                        {item.title}
                      </span>
                    </div>
                    <div className={`text-right text-[11px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                      {secWidth} × {secHeight}
                    </div>
                  </div>
                );
              }

              // 2. FOLDER CLIENT CARD
              if (item.type === "folder" || item.mediaType === "folder") {
                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                      if (typeof window !== "undefined") {
                        const el = document.getElementById("client-productions");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    style={{
                      transform: `translate3d(${x}px, ${y}px, 0)`,
                      width: "280px",
                    }}
                    className={`absolute rounded-2xl border backdrop-blur-xl p-3.5 transition-all shadow-xl flex flex-col gap-2.5 cursor-pointer hover:scale-105 active:scale-95 group ${
                      isLight
                        ? "bg-white/95 border-slate-300 hover:border-teal-500 text-slate-900 shadow-slate-200/50"
                        : "bg-[#111318]/95 border-white/15 hover:border-teal-400 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 group-hover:scale-110 transition-transform ${
                        isLight ? "bg-teal-50 text-teal-600 border border-teal-200" : "bg-teal-500/20 text-teal-400"
                      }`}>
                        📁
                      </span>
                      <span className={`text-xs font-bold transition-colors ${
                        isLight ? "text-slate-900 group-hover:text-teal-700" : "text-white group-hover:text-teal-300"
                      }`}>
                        {item.title}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between text-[10px] font-mono pt-1 border-t ${
                      isLight ? "text-slate-500 border-slate-200" : "text-neutral-400 border-white/5"
                    }`}>
                      <span>Folder Client</span>
                      <span className={`font-semibold ${isLight ? "text-teal-700" : "text-teal-400"}`}>Buka Karya Vault →</span>
                    </div>
                  </div>
                );
              }

              // 3. FIGMA TYPOGRAPHY TEXT (Clean transparent background matching Canvas Studio)
              if (item.type === "text" || item.mediaType === "text") {
                const textColor = item.color || (isLight ? "#0f172a" : "#FFFFFF");
                const textFontSize = item.fontSize || 48;
                const rawText = item.content !== undefined && item.content !== "" ? item.content : item.title || "";
                return (
                  <div
                    key={item.id}
                    style={{
                      transform: `translate3d(${x}px, ${y}px, 0) rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                      width: item.textAutoResize === "auto_width" ? "max-content" : item.width ? `${item.width}px` : "auto",
                      height: item.textAutoResize === "fixed" && item.height ? `${item.height}px` : "auto",
                      opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                      fontFamily: item.fontFamily ? `"${item.fontFamily}", system-ui, sans-serif` : "inherit",
                      fontSize: `${textFontSize}px`,
                      lineHeight: item.lineHeight || "100%",
                      letterSpacing: item.letterSpacing || "-3%",
                      color: textColor,
                      textAlign: (item.textAlign as any) || "left",
                      whiteSpace: item.textAutoResize === "auto_width" ? "pre" : "pre-wrap",
                      wordBreak: item.textAutoResize === "auto_width" ? "normal" : "break-word",
                      zIndex: 10,
                    }}
                    className="absolute select-none pointer-events-none"
                  >
                    {rawText}
                  </div>
                );
              }

              // 3.5 FIGMA ARTBOARD FRAME
              if ((item.type === "frame" || item.mediaType === "frame") && !item.image) {
                const frameWidth = item.width || 440;
                const frameHeight = item.height || 550;
                const frameBg = item.color || (isLight ? "#FFFFFF" : "#18181b");
                return (
                  <div
                    key={item.id}
                    style={{
                      transform: `translate3d(${x}px, ${y}px, 0)`,
                      width: `${frameWidth}px`,
                      height: `${frameHeight}px`,
                      backgroundColor: frameBg,
                      borderRadius: item.cornerRadius !== undefined ? `${item.cornerRadius}px` : "0px",
                      zIndex: 5,
                    }}
                    className={`absolute shadow-xl border ${isLight ? "border-slate-300" : "border-white/10"}`}
                  >
                    <div className="absolute -top-7 left-0 text-[12px] font-sans font-medium text-neutral-400 select-none truncate">
                      {item.title}
                    </div>
                  </div>
                );
              }

              // 3.6 FIGMA SHAPE (Rectangle & Ellipse)
              if (item.type === "shape" || item.mediaType === "shape" || item.mediaType === "rectangle" || item.mediaType === "ellipse") {
                const shapeWidth = item.width || 320;
                const shapeHeight = item.height || 200;
                const isEllipse = item.mediaType === "ellipse";
                const shapeBg = item.color || "#D9D9D9";
                const radius = isEllipse ? "9999px" : item.cornerRadius !== undefined ? `${item.cornerRadius}px` : "0px";
                return (
                  <div
                    key={item.id}
                    style={{
                      transform: `translate3d(${x}px, ${y}px, 0)`,
                      width: `${shapeWidth}px`,
                      height: `${shapeHeight}px`,
                      backgroundColor: shapeBg,
                      opacity: item.opacity !== undefined ? item.opacity / 100 : 1,
                      borderRadius: radius,
                      zIndex: item.frameId ? 25 : 10,
                      clipPath: getItemClipPath(item),
                    }}
                    className="absolute shadow-sm"
                  />
                );
              }

              // 4. MEDIA SHEET
              const imgSrc = normalizeMediaUrl(item.image || (item.videoId ? `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg` : ""));
              let sheetWidthClass = "w-[440px] sm:w-[540px]";
              let sheetStyle: React.CSSProperties = { aspectRatio: "4 / 5" };
              if (item.aspect === "16:9") {
                sheetWidthClass = "w-[560px] sm:w-[720px]";
                sheetStyle = { aspectRatio: "16 / 9" };
              } else if (item.aspect === "9:16") {
                sheetWidthClass = "w-[320px] sm:w-[380px]";
                sheetStyle = { aspectRatio: "9 / 16" };
              } else if (item.aspect === "1:1") {
                sheetWidthClass = "w-[440px] sm:w-[540px]";
                sheetStyle = { aspectRatio: "1 / 1" };
              } else if (item.aspect === "4:5") {
                sheetWidthClass = "w-[440px] sm:w-[540px]";
                sheetStyle = { aspectRatio: "4 / 5" };
              } else if (item.aspect && item.aspect.includes(":")) {
                const [wStr, hStr] = item.aspect.split(":");
                const wNum = parseFloat(wStr);
                const hNum = parseFloat(hStr);
                if (wNum && hNum) {
                  sheetStyle = { aspectRatio: `${wNum} / ${hNum}` };
                  sheetWidthClass = wNum > hNum ? "w-[560px] sm:w-[720px]" : "w-[440px] sm:w-[540px]";
                }
              }

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSheetTap(e.currentTarget, item.id, e);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (selectedSheetId === item.id) {
                      fitSheetToScreen(e.currentTarget, item.id);
                    } else {
                      setSelectedSheetId(item.id);
                    }
                  }}
                  onTouchEnd={(e) => {
                    handleSheetTouchEnd(e, e.currentTarget, item.id);
                  }}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    zIndex: isSelected ? 40 : item.frameId ? 25 : 10,
                    clipPath: getItemClipPath(item),
                  }}
                  className={`canvas-sheet-item absolute group flex flex-col rounded-2xl transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "ring-2 ring-teal-500 shadow-[0_20px_60px_rgba(20,184,166,0.3)] scale-[1.01]"
                        : "ring-2 ring-cyan-400 shadow-[0_20px_60px_rgba(22,176,159,0.35)] scale-[1.01]"
                      : isLight
                      ? "hover:ring-1 hover:ring-slate-300 shadow-xl"
                      : "hover:ring-1 hover:ring-white/40 shadow-2xl"
                  }`}
                >
                  <div className={`flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono ${
                    isLight
                      ? "bg-white/95 border-slate-300 text-slate-800 shadow-xs"
                      : "bg-black/60 border-white/10 text-neutral-300"
                  }`}>
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isLight ? "bg-teal-500" : "bg-cyan-400"}`} />
                      <span className={`font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>{item.clientName || "Selected Work"}</span>
                      <span className={isLight ? "text-slate-400" : "text-neutral-500"}>/</span>
                      <span className={`truncate opacity-80 ${isLight ? "text-slate-700" : "text-neutral-200"}`}>{item.title}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                      isLight
                        ? "bg-slate-100 text-teal-700 border-slate-300"
                        : "bg-white/10 text-cyan-300 border-white/10"
                    }`}>
                      {item.aspect === "original" ? "ORIGINAL" : item.aspect || "4:5"}
                    </span>
                  </div>

                  <div
                    className={`relative ${sheetWidthClass} rounded-2xl overflow-hidden border flex items-center justify-center ${
                      isLight
                        ? "bg-white border-slate-300 shadow-xl shadow-slate-200/50"
                        : "bg-neutral-950 border-white/15 shadow-2xl"
                    }`}
                    style={sheetStyle}
                  >
                    <img
                      src={imgSrc}
                      alt={item.title}
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
                    <div
                      className="absolute inset-0 z-20 pointer-events-auto cursor-grab"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        const card = (e.currentTarget.closest(".canvas-sheet-item") as HTMLElement) || (e.currentTarget.parentElement?.parentElement as HTMLElement);
                        if (selectedSheetId === item.id) {
                          fitSheetToScreen(card, item.id);
                        } else {
                          setSelectedSheetId(item.id);
                        }
                      }}
                      onTouchEnd={(e) => {
                        const card = (e.currentTarget.closest(".canvas-sheet-item") as HTMLElement) || (e.currentTarget.parentElement?.parentElement as HTMLElement);
                        handleSheetTouchEnd(e, card, item.id);
                      }}
                      draggable={false}
                    />
                  </div>
                </div>
              );
            });
            })()}
          </div>
        ) : (
          /* Grid Arrangement of Deliverable Sheets in 2D Matrix - Generous Spacing */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, minmax(400px, 480px))`,
              gap: "80px",
              padding: "100px",
              width: "max-content",
            }}
            className="items-start select-none"
          >
            {sheets.map((sheet, index) => {
              const isSelected = selectedSheetId === sheet.id;

              // Sheet dimensions strictly matching original aspect ratio without cropping
              let sheetWidthClass = "w-full";
              let sheetStyle: React.CSSProperties = { aspectRatio: "4 / 5" };

              if (sheet.aspect === "16:9") {
                sheetStyle = { aspectRatio: "16 / 9" };
              } else if (sheet.aspect === "9:16") {
                sheetStyle = { aspectRatio: "9 / 16" };
              } else if (sheet.aspect === "1:1") {
                sheetStyle = { aspectRatio: "1 / 1" };
              } else if (sheet.aspect === "4:5") {
                sheetStyle = { aspectRatio: "4 / 5" };
              } else if (sheet.aspect && sheet.aspect.includes(":")) {
                const [wStr, hStr] = sheet.aspect.split(":");
                const wNum = parseFloat(wStr);
                const hNum = parseFloat(hStr);
                if (wNum && hNum) {
                  sheetStyle = { aspectRatio: `${wNum} / ${hNum}` };
                }
              } else if (sheet.aspect === "original" || !sheet.aspect) {
                sheetStyle = { aspectRatio: "auto", minHeight: "340px" };
              }

              return (
                <div
                  key={sheet.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSheetTap(e.currentTarget, sheet.id, e);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (selectedSheetId === sheet.id) {
                      fitSheetToScreen(e.currentTarget, sheet.id);
                    } else {
                      setSelectedSheetId(sheet.id);
                    }
                  }}
                  onTouchEnd={(e) => {
                    handleSheetTouchEnd(e, e.currentTarget, sheet.id);
                  }}
                  style={{ width: "460px" }}
                  className={`canvas-sheet-item group relative flex flex-col rounded-2xl transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "ring-2 ring-teal-500 shadow-[0_20px_60px_rgba(20,184,166,0.3)] scale-[1.01]"
                        : "ring-2 ring-cyan-400 shadow-[0_20px_60px_rgba(22,176,159,0.35)] scale-[1.01]"
                      : isLight
                      ? "hover:ring-1 hover:ring-slate-300 shadow-xl"
                      : "hover:ring-1 hover:ring-white/40 shadow-2xl"
                  }`}
                >
                  {/* Figma Frame Top Label */}
                  <div className={`flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono ${
                    isLight
                      ? "bg-white/95 border-slate-300 text-slate-800 shadow-xs"
                      : "bg-black/60 border-white/10 text-neutral-300"
                  }`}>
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isLight ? "bg-teal-500" : "bg-cyan-400"}`} />
                      <span className={`font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>{sheet.clientName}</span>
                      <span className={isLight ? "text-slate-400" : "text-neutral-500"}>/</span>
                      <span className={`truncate opacity-80 ${isLight ? "text-slate-700" : "text-neutral-200"}`}>{sheet.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        isLight
                          ? "bg-slate-100 text-teal-700 border-slate-300"
                          : "bg-white/10 text-cyan-300 border-white/10"
                      }`}>
                        {sheet.aspect === "original" ? "ORIGINAL" : sheet.aspect}
                      </span>
                      {sheet.isVideo && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                          isLight
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}>
                          VIDEO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sheet Visual Container */}
                  <div
                    className={`relative ${sheetWidthClass} rounded-2xl overflow-hidden border flex items-center justify-center ${
                      isLight
                        ? "bg-white border-slate-300 shadow-xl shadow-slate-200/50"
                        : "bg-neutral-950 border-white/15 shadow-2xl"
                    }`}
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
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        const card = (e.currentTarget.closest(".canvas-sheet-item") as HTMLElement) || (e.currentTarget.parentElement?.parentElement as HTMLElement);
                        if (selectedSheetId === sheet.id) {
                          fitSheetToScreen(card, sheet.id);
                        } else {
                          setSelectedSheetId(sheet.id);
                        }
                      }}
                      onTouchEnd={(e) => {
                        const card = (e.currentTarget.closest(".canvas-sheet-item") as HTMLElement) || (e.currentTarget.parentElement?.parentElement as HTMLElement);
                        handleSheetTouchEnd(e, card, sheet.id);
                      }}
                      draggable={false}
                    />

                    {/* Corner Accent */}
                    <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono border opacity-0 group-hover:opacity-100 transition-opacity ${
                      isLight
                        ? "bg-white/90 border-slate-300 text-slate-700 shadow-xs"
                        : "bg-black/75 border-white/10 text-neutral-300"
                    }`}>
                      #{index + 1}
                    </div>

                    {/* Bottom Vignette with Deliverable Info */}
                    <div className={`absolute inset-x-0 bottom-0 z-10 p-3 flex flex-col justify-end ${
                      isLight
                        ? "bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-transparent"
                        : "bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                    }`}>
                      <h5 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-md">
                        {sheet.title}
                      </h5>
                      <p className={`text-[10px] font-mono truncate mt-0.5 ${
                        isLight ? "text-teal-300" : "text-cyan-400/90"
                      }`}>
                        {sheet.type || "Digital Asset"} · {sheet.year}
                      </p>
                    </div>
                  </div>

                  {/* Selection Corners (shown when clicked / focused) */}
                  {isSelected && (
                    <>
                      <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 border border-black rounded-xs shadow-sm pointer-events-none ${isLight ? "bg-teal-500" : "bg-cyan-400"}`} />
                      <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 border border-black rounded-xs shadow-sm pointer-events-none ${isLight ? "bg-teal-500" : "bg-cyan-400"}`} />
                      <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 border border-black rounded-xs shadow-sm pointer-events-none ${isLight ? "bg-teal-500" : "bg-cyan-400"}`} />
                      <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 border border-black rounded-xs shadow-sm pointer-events-none ${isLight ? "bg-teal-500" : "bg-cyan-400"}`} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating Bottom Dock (Zoom Controls, Fit, Shortcuts) ───────────────── */}
      <footer className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-2xl font-mono text-xs border ${
        isLight
          ? "bg-white/95 border-slate-300 text-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
          : "bg-[#13151b]/95 border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      }`}>
        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={() => {
            const newZ = Math.max(0.18, zoom * 0.85);
            setZoom(Number(newZ.toFixed(2)));
          }}
          aria-label="Zoom Out"
          title="Zoom Out (-)"
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950"
              : "bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
          }`}
        >
          <HiMiniMagnifyingGlassMinus className="w-4 h-4" />
        </button>

        {/* Zoom Percentage Pill (Click to reset 100%) */}
        <button
          type="button"
          onClick={() => setZoom(1.0)}
          aria-label="Reset Zoom 100%"
          title="Klik untuk Reset Zoom ke 100%"
          className={`px-3 py-1 rounded-xl font-bold transition-all text-xs cursor-pointer min-w-[56px] text-center ${
            isLight
              ? "bg-teal-50 hover:bg-teal-100 text-teal-700"
              : "bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300"
          }`}
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
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950"
              : "bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white"
          }`}
        >
          <HiMiniMagnifyingGlassPlus className="w-4 h-4" />
        </button>

        <div className={`w-[1px] h-4 mx-1 ${isLight ? "bg-slate-200" : "bg-white/15"}`} />

        {/* Zoom to Fit */}
        <button
          type="button"
          onClick={zoomToFit}
          aria-label="Zoom to Fit All"
          title="Zoom to Fit All (F)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 cursor-pointer text-xs ${
            isLight
              ? "bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800"
              : "bg-white/5 hover:bg-cyan-500/20 text-neutral-300 hover:text-cyan-300"
          }`}
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
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer hidden sm:flex ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
              : "bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white"
          }`}
        >
          <HiArrowPath className="w-3.5 h-3.5" />
        </button>
      </footer>
    </div>
  );
}

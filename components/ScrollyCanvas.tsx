"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Overlay from "./Overlay";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { getCustomFramesFromDB } from "@/lib/sequenceStorage";

export default function ScrollyCanvas() {
  const { heroBanner } = usePortfolioData();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameIndexRef = useRef<number>(0);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [idbFrames, setIdbFrames] = useState<string[] | null>(null);

  // Mouse tracking parameters from context
  const mouseTracking = heroBanner?.sequenceMouseTracking ?? true;
  const mouseIntensity = heroBanner?.sequenceMouseIntensity ?? 26;

  const mouseStateRef = useRef({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });
  const scrollProgressRef = useRef<number>(0);
  const isInViewRef = useRef<boolean>(true);

  // Preload front.webp & mask.webp for Cursor Reveal effect after sequence finishes
  const frontImgRef = useRef<HTMLImageElement | null>(null);
  const maskImgRef = useRef<HTMLImageElement | null>(null);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Brush Reveal offscreen canvases & stroke state
  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastBrushPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasBrushedRef = useRef<boolean>(false);
  const isPointerInsideRef = useRef<boolean>(false);

  useEffect(() => {
    const front = new Image();
    front.src = "/front.webp";
    const mask = new Image();
    mask.src = "/mask.webp";

    frontImgRef.current = front;
    maskImgRef.current = mask;
  }, []);

  // Check IndexedDB on mount for cached custom sequence
  useEffect(() => {
    let isMounted = true;
    getCustomFramesFromDB().then((frames) => {
      if (isMounted && frames && frames.length > 0) {
        setIdbFrames(frames);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const sequenceMode = heroBanner?.sequenceMode || "default";
  const customFrames = useMemo(() => {
    if (heroBanner?.sequenceCustomFrames && heroBanner.sequenceCustomFrames.length > 0) {
      return heroBanner.sequenceCustomFrames;
    }
    return idbFrames || [];
  }, [heroBanner?.sequenceCustomFrames, idbFrames]);

  const totalFrames = useMemo(() => {
    if (sequenceMode === "custom") {
      return customFrames.length > 0 ? customFrames.length : (heroBanner?.sequenceTotalFrames || 108);
    }
    if (sequenceMode === "folder") {
      return Math.max(1, heroBanner?.sequenceTotalFrames || 108);
    }
    return heroBanner?.sequenceTotalFrames || 108;
  }, [sequenceMode, customFrames.length, heroBanner?.sequenceTotalFrames]);

  const getFramePath = useCallback(
    (index: number) => {
      if (sequenceMode === "custom" && customFrames.length > 0) {
        const clamped = Math.max(0, Math.min(customFrames.length - 1, index));
        return customFrames[clamped];
      }

      if (sequenceMode === "folder") {
        let folder = (heroBanner?.sequenceFolder || "").replace(/\/$/, "");
        if (!folder) {
          folder = "/sequence";
        }
        const pattern = heroBanner?.sequencePattern || "frame_{padded}.webp";
        const padding = heroBanner?.sequencePadding ?? 6;
        const startIdx = heroBanner?.sequenceStartIndex ?? 0;
        const actualIdx = startIdx + index;
        const padded = String(actualIdx).padStart(padding, "0");
        const filename = pattern.replace("{padded}", padded).replace("{index}", String(actualIdx));
        return `${folder}/${filename}`;
      }

      // Default local 108-frame WebP sequence from /sequence/
      const padded = String(index).padStart(6, "0");
      return `/sequence/frame_${padded}.webp`;
    },
    [
      sequenceMode,
      customFrames,
      heroBanner?.sequenceFolder,
      heroBanner?.sequencePattern,
      heroBanner?.sequencePadding,
      heroBanner?.sequenceStartIndex,
    ]
  );

  // Smooth brush painting onto offscreen brushCanvas
  const paintStroke = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width <= 0 || height <= 0) return;

    if (!brushCanvasRef.current) {
      brushCanvasRef.current = document.createElement("canvas");
      brushCanvasRef.current.width = width;
      brushCanvasRef.current.height = height;
    }
    const bCanvas = brushCanvasRef.current;
    const bCtx = bCanvas.getContext("2d");
    if (!bCtx) return;

    const radius = width < 640 ? 46 : 64;

    bCtx.save();
    bCtx.lineCap = "round";
    bCtx.lineJoin = "round";
    bCtx.lineWidth = radius * 2;
    bCtx.strokeStyle = "rgba(255, 255, 255, 1)";
    bCtx.fillStyle = "rgba(255, 255, 255, 1)";
    bCtx.shadowColor = "rgba(255, 255, 255, 1)";
    bCtx.shadowBlur = 16;

    if (lastBrushPosRef.current) {
      bCtx.beginPath();
      bCtx.moveTo(lastBrushPosRef.current.x, lastBrushPosRef.current.y);
      bCtx.lineTo(x, y);
      bCtx.stroke();
    }

    bCtx.beginPath();
    bCtx.arc(x, y, radius, 0, Math.PI * 2);
    bCtx.fill();
    bCtx.restore();

    lastBrushPosRef.current = { x, y };
    hasBrushedRef.current = true;
  }, []);

  // Listen for reset brush request from HUD / controls
  useEffect(() => {
    const handleResetBrush = () => {
      if (brushCanvasRef.current) {
        const bCtx = brushCanvasRef.current.getContext("2d");
        if (bCtx) {
          bCtx.clearRect(0, 0, brushCanvasRef.current.width, brushCanvasRef.current.height);
        }
      }
      if (tempCanvasRef.current) {
        const tCtx = tempCanvasRef.current.getContext("2d");
        if (tCtx) {
          tCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
        }
      }
      hasBrushedRef.current = false;
      lastBrushPosRef.current = null;
    };

    window.addEventListener("rizx_reset_brush", handleResetBrush);
    return () => {
      window.removeEventListener("rizx_reset_brush", handleResetBrush);
    };
  }, []);

  const renderFrame = useCallback(
    (
      index: number,
      parallaxX: number = 0,
      parallaxY: number = 0,
      revealActive: boolean = false,
      revealFactor: number = 0,
      cursorNormX: number = 0.5,
      cursorNormY: number = 0.5
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // Base image: use front.webp when reveal is active and ready, otherwise fallback to sequence frame
      let baseImg: HTMLImageElement | null = null;
      if (
        revealActive &&
        frontImgRef.current &&
        frontImgRef.current.complete &&
        frontImgRef.current.naturalWidth > 0
      ) {
        baseImg = frontImgRef.current;
      } else {
        baseImg = imagesRef.current[index] || null;
        if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) {
          for (let offset = 1; offset < totalFrames; offset++) {
            const prev = index - offset;
            const next = index + offset;
            if (
              prev >= 0 &&
              imagesRef.current[prev]?.complete &&
              (imagesRef.current[prev]?.naturalWidth ?? 0) > 0
            ) {
              baseImg = imagesRef.current[prev];
              break;
            }
            if (
              next < totalFrames &&
              imagesRef.current[next]?.complete &&
              (imagesRef.current[next]?.naturalWidth ?? 0) > 0
            ) {
              baseImg = imagesRef.current[next];
              break;
            }
          }
        }
      }

      if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const targetWidth = Math.floor(width * dpr);
      const targetHeight = Math.floor(height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // High performance object-cover math with mobile head/face framing
      const imgWidth = baseImg.naturalWidth;
      const imgHeight = baseImg.naturalHeight;
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = width / imgRatio;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
        // On narrow mobile screens, bias slightly so the subject's face is centered and prominent
        if (width < 640) {
          offsetY = -height * 0.02;
        }
      }

      // Fill background with deep space dark before drawing
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Draw base image (front character)
      ctx.drawImage(baseImg, offsetX - parallaxX, offsetY - parallaxY, drawWidth, drawHeight);

      // ==========================================
      // BRUSH REVEAL: Offscreen canvas revealing mask.webp
      // ==========================================
      // Ensure offscreen brush & temp canvases match display width & height
      if (!brushCanvasRef.current) {
        brushCanvasRef.current = document.createElement("canvas");
        brushCanvasRef.current.width = width;
        brushCanvasRef.current.height = height;
      } else if (brushCanvasRef.current.width !== width || brushCanvasRef.current.height !== height) {
        const oldC = brushCanvasRef.current;
        const newC = document.createElement("canvas");
        newC.width = width;
        newC.height = height;
        const nCtx = newC.getContext("2d");
        if (nCtx && oldC.width > 0 && oldC.height > 0) {
          nCtx.drawImage(oldC, 0, 0, width, height);
        }
        brushCanvasRef.current = newC;
      }

      if (!tempCanvasRef.current) {
        tempCanvasRef.current = document.createElement("canvas");
        tempCanvasRef.current.width = width;
        tempCanvasRef.current.height = height;
      } else if (tempCanvasRef.current.width !== width || tempCanvasRef.current.height !== height) {
        tempCanvasRef.current.width = width;
        tempCanvasRef.current.height = height;
      }

      // If user has brushed, composite the mask.webp layer only over the brushed regions
      if (
        revealActive &&
        hasBrushedRef.current &&
        maskImgRef.current &&
        maskImgRef.current.complete &&
        maskImgRef.current.naturalWidth > 0 &&
        brushCanvasRef.current &&
        tempCanvasRef.current
      ) {
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.clearRect(0, 0, width, height);
          tempCtx.drawImage(maskImgRef.current, offsetX - parallaxX, offsetY - parallaxY, drawWidth, drawHeight);
          tempCtx.globalCompositeOperation = "destination-in";
          tempCtx.drawImage(brushCanvasRef.current, 0, 0, width, height);
          tempCtx.globalCompositeOperation = "source-over";

          ctx.drawImage(tempCanvas, 0, 0, width, height);
        }
      }

      // In reveal mode, render a sleek brush tip indicator around cursor position
      if (revealActive && isPointerInsideRef.current) {
        const cx = cursorNormX * width;
        const cy = cursorNormY * height;
        const brushRadius = width < 640 ? 46 : 64;

        ctx.save();
        // Dashed glowing brush tip ring
        ctx.beginPath();
        ctx.arc(cx - parallaxX, cy - parallaxY, brushRadius, 0, Math.PI * 2);
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.75;
        ctx.strokeStyle = "rgba(45, 212, 191, 0.85)"; // Teal-400
        ctx.shadowColor = "rgba(45, 212, 191, 0.6)";
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Inner soft accent ring
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(cx - parallaxX, cy - parallaxY, brushRadius - 4, 0, Math.PI * 2);
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)"; // Subtle neon red
        ctx.stroke();

        // Glowing center brush dot
        ctx.beginPath();
        ctx.arc(cx - parallaxX, cy - parallaxY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(45, 212, 191, 0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
      currentFrameIndexRef.current = index;
    },
    [totalFrames]
  );

  // Preload all frames whenever sequence configuration changes
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];
    setIsLoaded(false);
    setLoadProgress(0);

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        if (isCancelled) return;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / totalFrames) * 100));

        // When active frame loads or first frame loads, render immediately
        if (
          i === currentFrameIndexRef.current ||
          (currentFrameIndexRef.current === 0 && i === 0)
        ) {
          renderFrame(currentFrameIndexRef.current, 0, 0, false, 0, 0.5, 0.5);
        }

        if (loadedCount === totalFrames) {
          setIsLoaded(true);
          renderFrame(currentFrameIndexRef.current, 0, 0, false, 0, 0.5, 0.5);
        }
      };

      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / totalFrames) * 100));
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    // Handle viewport resize smoothly
    const handleResize = () => {
      const p = scrollProgressRef.current;
      const isReveal = p >= 0.80;
      const revealFactor = isReveal ? Math.min(1, Math.max(0, (p - 0.80) / 0.05)) : 0;
      renderFrame(
        currentFrameIndexRef.current,
        0,
        0,
        isReveal,
        revealFactor,
        mouseStateRef.current.x,
        mouseStateRef.current.y
      );
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      isCancelled = true;
      window.removeEventListener("resize", handleResize);
    };
  }, [totalFrames, getFramePath, renderFrame]);

  // Track mouse and touch movements across screen
  useEffect(() => {
    if (!mouseTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      isPointerInsideRef.current = true;
      lastInteractionTimeRef.current = Date.now();
      const nx = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const ny = Math.max(0, Math.min(1, e.clientY / window.innerHeight));
      mouseStateRef.current.targetX = nx;
      mouseStateRef.current.targetY = ny;

      if (scrollProgressRef.current >= 0.78) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          paintStroke(cx, cy);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isPointerInsideRef.current = true;
        lastInteractionTimeRef.current = Date.now();
        const touch = e.touches[0];
        const nx = Math.max(0, Math.min(1, touch.clientX / window.innerWidth));
        const ny = Math.max(0, Math.min(1, touch.clientY / window.innerHeight));
        mouseStateRef.current.targetX = nx;
        mouseStateRef.current.targetY = ny;

        if (scrollProgressRef.current >= 0.78) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const cx = touch.clientX - rect.left;
            const cy = touch.clientY - rect.top;
            paintStroke(cx, cy);
          }
        }
      }
    };

    const handlePointerEnd = () => {
      lastBrushPosRef.current = null;
    };

    const handleMouseLeave = () => {
      isPointerInsideRef.current = false;
      lastBrushPosRef.current = null;
      mouseStateRef.current.targetX = 0.5;
      mouseStateRef.current.targetY = 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseup", handlePointerEnd, { passive: true });
    window.addEventListener("touchend", handlePointerEnd, { passive: true });
    window.addEventListener("touchcancel", handlePointerEnd, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handlePointerEnd);
      window.removeEventListener("touchend", handlePointerEnd);
      window.removeEventListener("touchcancel", handlePointerEnd);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseTracking, paintStroke]);

  // Smooth fluid LERP animation loop that binds mouse movement + scroll to frame turning and cursor reveal
  useEffect(() => {
    let animId: number;
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const ms = mouseStateRef.current;
      const dx = ms.targetX - ms.x;
      const dy = ms.targetY - ms.y;

      const p = scrollProgressRef.current;
      const isReveal = p >= 0.80;

      // Smooth organic easing towards cursor target
      if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
        ms.x += dx * 0.085;
        ms.y += dy * 0.07;
      }

      if (isInViewRef.current) {
        // Sequence plays across 0.00 to 0.80
        const seqP = Math.min(1, p / 0.80);
        const baseScrollFrame = seqP * (totalFrames - 1);

        // When in first hero stage, head turns with boosted range following the cursor
        const factor = p < 0.25 ? 1.4 : 0.8;
        const mouseFrameOffset = mouseTracking ? (ms.x - 0.5) * mouseIntensity * factor : 0;

        const finalFrame = Math.min(
          totalFrames - 1,
          Math.max(0, Math.round(baseScrollFrame + mouseFrameOffset))
        );

        // Subtle 3D camera pan / stereoscopic shift
        const parallaxX = mouseTracking ? (ms.x - 0.5) * 16 : 0;
        const parallaxY = mouseTracking ? (ms.y - 0.5) * 12 : 0;

        // Reveal factor: smoothly eases in between 0.80 and 0.85
        const revealFactor = isReveal ? Math.min(1, Math.max(0, (p - 0.80) / 0.05)) : 0;

        renderFrame(
          finalFrame,
          parallaxX,
          parallaxY,
          isReveal,
          revealFactor,
          ms.x,
          ms.y
        );
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [totalFrames, mouseTracking, mouseIntensity, renderFrame]);

  // Accurate progress calculator via viewport-relative bounds
  const updateProgress = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const maxScrollable = container.offsetHeight - window.innerHeight;
    if (maxScrollable <= 0) return;

    // Check if hero container is within visible window
    isInViewRef.current = rect.bottom > 0 && rect.top < window.innerHeight;

    const currentScroll = -rect.top;
    const progress = Math.max(0, Math.min(1, currentScroll / maxScrollable));

    // When scrolling back up away from reveal zone, reset brush canvas
    if (progress < 0.72 && hasBrushedRef.current) {
      if (brushCanvasRef.current) {
        const bCtx = brushCanvasRef.current.getContext("2d");
        if (bCtx) {
          bCtx.clearRect(0, 0, brushCanvasRef.current.width, brushCanvasRef.current.height);
        }
      }
      hasBrushedRef.current = false;
      lastBrushPosRef.current = null;
    }

    scrollProgressRef.current = progress;
    setScrollProgress(progress);
  }, []);

  // Real-time tracking on both scroll and touch drag
  useEffect(() => {
    const handleScrollOrTouch = () => {
      updateProgress();
    };

    window.addEventListener("scroll", handleScrollOrTouch, { passive: true });
    window.addEventListener("touchmove", handleScrollOrTouch, { passive: true });
    updateProgress(); // initial frame

    return () => {
      window.removeEventListener("scroll", handleScrollOrTouch);
      window.removeEventListener("touchmove", handleScrollOrTouch);
    };
  }, [updateProgress]);

  return (
    <div
      ref={containerRef}
      className="relative h-[500vh] w-full bg-[#0a0a0a]"
      id="hero-scrolly"
    >
      <div
        className="sticky top-0 h-screen h-[100dvh] w-full overflow-hidden bg-[#0a0a0a]"
        style={{ willChange: "transform" }}
      >
        {/* Canvas for image sequence */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-75 ease-out"
        />

        {/* Ambient radial vignette for cinematic depth */}
        <div className="hero-vignette absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,10,10,0.7)_100%)] z-[5]" />

        {/* Subtle gradient edges */}
        <div className="hero-gradient-bottom absolute inset-x-0 bottom-0 h-44 sm:h-56 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-[10]" />
        <div className="hero-gradient-top absolute inset-x-0 top-0 h-32 sm:h-44 bg-gradient-to-b from-[#0a0a0a]/80 to-transparent pointer-events-none z-[10]" />

        {/* Weightless Parallax Sweeps Overlay */}
        <Overlay progress={scrollProgress} />

        {/* Subtle Preloading Indicator */}
        {!isLoaded && (
          <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-xs font-mono text-neutral-400 shadow-xl transition-opacity duration-700">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>CACHING FRAMES: {loadProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

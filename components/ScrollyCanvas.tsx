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
      return customFrames.length > 0 ? customFrames.length : (heroBanner?.sequenceTotalFrames || 121);
    }
    if (sequenceMode === "folder") {
      return Math.max(1, heroBanner?.sequenceTotalFrames || 121);
    }
    return 121;
  }, [sequenceMode, customFrames.length, heroBanner?.sequenceTotalFrames]);

  const getFramePath = useCallback(
    (index: number) => {
      if (sequenceMode === "custom" && customFrames.length > 0) {
        const clamped = Math.max(0, Math.min(customFrames.length - 1, index));
        return customFrames[clamped];
      }

      if (sequenceMode === "folder") {
        let folder = (heroBanner?.sequenceFolder || "").replace(/\/$/, "");
        if (!folder || folder === "/sequence") {
          folder = "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/sequence";
        }
        const pattern = heroBanner?.sequencePattern || "frame_{padded}.webp";
        const padding = heroBanner?.sequencePadding ?? 6;
        const startIdx = heroBanner?.sequenceStartIndex ?? 0;
        const actualIdx = startIdx + index;
        const padded = String(actualIdx).padStart(padding, "0");
        const filename = pattern.replace("{padded}", padded).replace("{index}", String(actualIdx));
        return `${folder}/${filename}`;
      }

      // Default built-in 121-frame WebP sequence from Supabase Storage CDN
      const padded = String(index).padStart(6, "0");
      return `https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/sequence/frame_${padded}.webp`;
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

  const renderFrame = useCallback(
    (index: number, parallaxX: number = 0, parallaxY: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // Retrieve requested frame, or fallback to closest loaded frame to avoid flickering
      let img = imagesRef.current[index];
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let offset = 1; offset < totalFrames; offset++) {
          const prev = index - offset;
          const next = index + offset;
          if (
            prev >= 0 &&
            imagesRef.current[prev]?.complete &&
            (imagesRef.current[prev]?.naturalWidth ?? 0) > 0
          ) {
            img = imagesRef.current[prev];
            break;
          }
          if (
            next < totalFrames &&
            imagesRef.current[next]?.complete &&
            (imagesRef.current[next]?.naturalWidth ?? 0) > 0
          ) {
            img = imagesRef.current[next];
            break;
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

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
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
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

      // Draw image with subtle 3D stereoscopic parallax offset following the cursor
      ctx.drawImage(img, offsetX - parallaxX, offsetY - parallaxY, drawWidth, drawHeight);
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
          renderFrame(currentFrameIndexRef.current);
        }

        if (loadedCount === totalFrames) {
          setIsLoaded(true);
          renderFrame(currentFrameIndexRef.current);
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
      renderFrame(currentFrameIndexRef.current);
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
      const nx = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const ny = Math.max(0, Math.min(1, e.clientY / window.innerHeight));
      mouseStateRef.current.targetX = nx;
      mouseStateRef.current.targetY = ny;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const nx = Math.max(0, Math.min(1, touch.clientX / window.innerWidth));
        const ny = Math.max(0, Math.min(1, touch.clientY / window.innerHeight));
        mouseStateRef.current.targetX = nx;
        mouseStateRef.current.targetY = ny;
      }
    };

    const handleMouseLeave = () => {
      // Return smoothly to center when mouse leaves viewport
      mouseStateRef.current.targetX = 0.5;
      mouseStateRef.current.targetY = 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseTracking]);

  // Smooth fluid LERP animation loop that binds mouse movement + scroll to frame turning
  useEffect(() => {
    let animId: number;
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const ms = mouseStateRef.current;
      const dx = ms.targetX - ms.x;
      const dy = ms.targetY - ms.y;

      // Smooth organic easing towards cursor target
      if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
        ms.x += dx * 0.085;
        ms.y += dy * 0.07;
      }

      if (isInViewRef.current) {
        const p = scrollProgressRef.current;
        const baseScrollFrame = p * (totalFrames - 1);

        // When in first hero stage, head turns with boosted range following the cursor
        const factor = p < 0.25 ? 1.4 : 0.9;
        const mouseFrameOffset = mouseTracking ? (ms.x - 0.5) * mouseIntensity * factor : 0;

        const finalFrame = Math.min(
          totalFrames - 1,
          Math.max(0, Math.round(baseScrollFrame + mouseFrameOffset))
        );

        // Subtle 3D camera pan / stereoscopic shift
        const parallaxX = mouseTracking ? (ms.x - 0.5) * 16 : 0;
        const parallaxY = mouseTracking ? (ms.y - 0.5) * 12 : 0;

        renderFrame(finalFrame, parallaxX, parallaxY);
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

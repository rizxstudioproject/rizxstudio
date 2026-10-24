"use client";

import React, { useEffect, useRef } from "react";
import { useMotionTheme, CursorEffectType } from "@/context/MotionThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  color: string;
}

interface InkDrop {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
  points: { angle: number; dist: number }[];
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export default function CanvasMouseFollower() {
  const { cursorEffect, comboMode, disableOnMobile, primaryColor, accentColor } = useMotionTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (cursorEffect === "off" && !comboMode) return;

    // Check if device is touch/mobile
    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        window.innerWidth < 768);

    if (disableOnMobile && isTouchDevice) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    let mouseX = -100;
    let mouseY = -100;
    let targetX = -100;
    let targetY = -100;
    let isMoving = false;
    let idleTimer: NodeJS.Timeout | null = null;
    let lastTime = performance.now();

    // Magnetism target
    let isMagnetic = false;
    let magneticTargetX = 0;
    let magneticTargetY = 0;
    let magneticWidth = 40;
    let magneticHeight = 40;

    // Entity pools
    const particles: Particle[] = [];
    const inkDrops: InkDrop[] = [];
    const trailPoints: TrailPoint[] = [];
    let hologramAngle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handlePointerAction = (clientX: number, clientY: number, isTouch = false) => {
      targetX = clientX;
      targetY = clientY;
      isMoving = true;

      // On touch or if cursor was offscreen, snap immediately to touch position
      if (isTouch && (mouseX < 0 || mouseY < 0 || Math.hypot(targetX - mouseX, targetY - mouseY) > 180)) {
        mouseX = clientX;
        mouseY = clientY;
      }

      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isMoving = false;
      }, isTouch ? 1200 : 2500);

      // Check magnetic hover over interactive targets
      const targetEl = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      if (targetEl) {
        const interactive = targetEl.closest(
          'a, button, input, textarea, select, [role="button"], .magnetic-hover'
        ) as HTMLElement | null;

        if (interactive) {
          const rect = interactive.getBoundingClientRect();
          isMagnetic = true;
          magneticTargetX = rect.left + rect.width / 2;
          magneticTargetY = rect.top + rect.height / 2;
          magneticWidth = rect.width;
          magneticHeight = rect.height;
        } else {
          isMagnetic = false;
        }
      } else {
        isMagnetic = false;
      }

      // Add ink drops
      if (cursorEffect === "ink" || comboMode) {
        if (Math.random() < 0.45) {
          const numSpikes = 6 + Math.floor(Math.random() * 6);
          const points = [];
          for (let i = 0; i < numSpikes; i++) {
            points.push({
              angle: (i / numSpikes) * Math.PI * 2,
              dist: 0.7 + Math.random() * 0.6,
            });
          }
          inkDrops.push({
            x: targetX + (Math.random() - 0.5) * 8,
            y: targetY + (Math.random() - 0.5) * 8,
            radius: 4 + Math.random() * 6,
            maxRadius: 16 + Math.random() * 20,
            alpha: 0.65,
            decay: 0.012 + Math.random() * 0.015,
            points,
          });
          if (inkDrops.length > 50) inkDrops.shift();
        }
      }

      // Add particles
      if (cursorEffect === "particles" || comboMode) {
        const count = comboMode ? 2 : 3;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 2.5;
          particles.push({
            x: targetX,
            y: targetY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed + (Math.random() - 0.3) * 0.5,
            size: 1.5 + Math.random() * 3,
            alpha: 1,
            maxAlpha: 0.7 + Math.random() * 0.3,
            decay: 0.018 + Math.random() * 0.025,
            color: Math.random() > 0.4 ? primaryColor : accentColor,
          });
        }
        if (particles.length > 90) particles.splice(0, particles.length - 90);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerAction(e.clientX, e.clientY, false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      handlePointerAction(t.clientX, t.clientY, true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      handlePointerAction(t.clientX, t.clientY, true);
    };

    const handleTouchEnd = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isMoving = false;
      }, 800);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    // Animation Loop (60 FPS)
    const render = () => {
      animId = requestAnimationFrame(render);

      // Smooth coordinate interpolation (lerp)
      const lerpFactor = isMagnetic ? 0.22 : 0.18;
      const destX = isMagnetic ? magneticTargetX : targetX;
      const destY = isMagnetic ? magneticTargetY : targetY;

      mouseX += (destX - mouseX) * lerpFactor;
      mouseY += (destY - mouseY) * lerpFactor;

      // Trail recording for Ghost / Shadow effect
      if (cursorEffect === "ghost" || comboMode) {
        trailPoints.push({ x: mouseX, y: mouseY, age: 0 });
        if (trailPoints.length > 32) trailPoints.shift();
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // If offscreen or cursor hasn't moved yet, don't draw
      if (mouseX < 0 || mouseY < 0) return;

      // 1. INK SPLASH EFFECT
      if (cursorEffect === "ink" || comboMode) {
        for (let i = inkDrops.length - 1; i >= 0; i--) {
          const drop = inkDrops[i];
          drop.alpha -= drop.decay;
          if (drop.radius < drop.maxRadius) {
            drop.radius += (drop.maxRadius - drop.radius) * 0.08;
          }

          if (drop.alpha <= 0) {
            inkDrops.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = drop.alpha * 0.7;

          // Draw organic blob shape
          const len = drop.points.length;
          for (let p = 0; p < len; p++) {
            const pt = drop.points[p];
            const r = drop.radius * pt.dist;
            const px = drop.x + Math.cos(pt.angle) * r;
            const py = drop.y + Math.sin(pt.angle) * r;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // 2. GHOST / SHADOW MOTION
      if (cursorEffect === "ghost" || comboMode) {
        if (trailPoints.length > 2) {
          ctx.save();
          for (let i = 1; i < trailPoints.length; i++) {
            const p1 = trailPoints[i - 1];
            const p2 = trailPoints[i];
            const ratio = i / trailPoints.length;
            const lineWidth = ratio * 18;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = primaryColor;
            ctx.globalAlpha = ratio * 0.28;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();

            // Inner core
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = accentColor;
            ctx.globalAlpha = ratio * 0.45;
            ctx.lineWidth = lineWidth * 0.35;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // 3. PARTICLES / STAR DUST
      if (cursorEffect === "particles" || comboMode) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (p.alpha / p.maxAlpha), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. HOLOGRAM / CYBERPUNK SCAN
      if (cursorEffect === "hologram" || comboMode) {
        hologramAngle += 0.025;
        ctx.save();
        ctx.translate(mouseX, mouseY);

        // Outer rotating dashed aura
        ctx.save();
        ctx.rotate(hologramAngle);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.shadowBlur = 10;
        ctx.shadowColor = primaryColor;
        ctx.stroke();
        ctx.restore();

        // Inner counter-rotating ring
        ctx.save();
        ctx.rotate(-hologramAngle * 1.5);
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
        ctx.restore();

        // Crosshairs / Tech reticle
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(-20, 0);
        ctx.moveTo(20, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, -30);
        ctx.lineTo(0, -20);
        ctx.moveTo(0, 20);
        ctx.lineTo(0, 30);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.9;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ffffff";
        ctx.fill();

        ctx.restore();
      }

      // 5. MAGNETIC FLUID / BLOB
      if (cursorEffect === "fluid" || comboMode) {
        ctx.save();
        ctx.translate(mouseX, mouseY);

        if (isMagnetic) {
          // Magnetically expanded pill/box highlight
          const targetW = Math.max(magneticWidth + 16, 44);
          const targetH = Math.max(magneticHeight + 12, 44);
          const r = 12;

          ctx.beginPath();
          ctx.roundRect(-targetW / 2, -targetH / 2, targetW, targetH, r);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.6;
          ctx.shadowBlur = 14;
          ctx.shadowColor = primaryColor;
          ctx.stroke();

          // Ambient subtle background tint
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = 0.08;
          ctx.fill();
        } else {
          // Fluid organic cursor follower
          const pulse = Math.sin(performance.now() * 0.005) * 1.5;
          const baseRadius = 18 + pulse;

          // Outer glowing fluid aura
          const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, baseRadius * 1.4);
          grad.addColorStop(0, primaryColor);
          grad.addColorStop(0.6, accentColor);
          grad.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(0, 0, baseRadius * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.22;
          ctx.fill();

          // Smooth core circle
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = 0.85;
          ctx.shadowBlur = 8;
          ctx.shadowColor = primaryColor;
          ctx.fill();

          // Small white pinpoint center
          ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 1;
          ctx.fill();
        }
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [cursorEffect, comboMode, disableOnMobile, primaryColor, accentColor]);

  if (cursorEffect === "off" && !comboMode) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[85] transition-opacity duration-300"
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}

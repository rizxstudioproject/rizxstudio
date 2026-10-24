"use client";

import { useEffect } from "react";

/**
 * ContentGuard — Multi-layer anti-theft protection for portfolio content.
 * Layers:
 * 1. Disable right-click context menu sitewide
 * 2. Block keyboard shortcuts: Ctrl+S, Ctrl+U, Ctrl+P, F12, Ctrl+Shift+I/J/C
 * 3. Blur images when window loses focus (defeats snipping tool / screen capture apps)
 * 4. Block drag-and-drop of images
 * 5. Block 3-finger mobile screenshot gesture (instant blackout shield + heavy blur)
 */
export default function ContentGuard() {
  useEffect(() => {
    // ── 1. Disable right-click context menu ──────────────────────────────────
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // ── 2. Block DevTools & save shortcuts ───────────────────────────────────
    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Ctrl+S (Save), Ctrl+U (View Source), Ctrl+P (Print), Ctrl+A (Select All)
      if (ctrl && (key === "s" || key === "u" || key === "p")) {
        e.preventDefault();
        return false;
      }

      // F12 (DevTools), Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspector)
      if (
        key === "f12" ||
        (ctrl && shift && (key === "i" || key === "j" || key === "c"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // ── Shared Security Shield DOM Element ──────────────────────────────────
    let multiTouchTimer: NodeJS.Timeout | null = null;

    const createShield = () => {
      let shield = document.getElementById("anti-screenshot-shield");
      if (!shield) {
        shield = document.createElement("div");
        shield.id = "anti-screenshot-shield";
        shield.style.cssText =
          "position:fixed;inset:0;z-index:99999999;background:#050505;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#ffffff;font-family:monospace;pointer-events:none;opacity:0;transition:opacity 0.05s ease;";
        shield.innerHTML = `
          <div style="text-align:center;padding:24px;border:1px solid rgba(20,175,158,0.3);border-radius:12px;background:rgba(10,10,10,0.85);backdrop-filter:blur(10px);max-width:320px;">
            <div style="width:40px;height:40px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(20,175,158,0.15);color:#16b09f;font-size:20px;font-weight:bold;">
              !
            </div>
            <div style="font-size:18px;font-weight:900;letter-spacing:0.25em;color:#16b09f;margin-bottom:6px;">RIZX STUDIO</div>
            <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:#f87171;margin-bottom:4px;">SCREENSHOT / RECORDING BLOCKED</div>
            <div style="font-size:9px;letter-spacing:0.15em;color:#888888;text-transform:uppercase;">Protected Artwork & Proprietary Design</div>
          </div>
        `;
        document.body.appendChild(shield);
      }
      return shield;
    };

    // ── 3. Blur & Shield when window loses focus or page is hidden ──────────
    // Defeats screen-recorder floating widgets, notification drawer pulls, snipping tools
    const blurOnHide = () => {
      const shield = createShield();
      shield.style.opacity = "1";
      shield.style.pointerEvents = "auto";
      document.body.style.filter = "blur(32px) brightness(0.1)";
      document.body.style.transition = "filter 0.05s ease";
    };

    const unblurOnShow = () => {
      const shield = document.getElementById("anti-screenshot-shield");
      if (shield) {
        shield.style.opacity = "0";
        shield.style.pointerEvents = "none";
      }
      document.body.style.filter = "none";
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurOnHide();
      } else {
        unblurOnShow();
      }
    };

    // ── 4. Block image drag ───────────────────────────────────────────────────
    const blockDrag = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    };

    // ── 5. Block 3-Finger Mobile Screenshot Gesture ───────────────────────────
    // Detects multi-touch swipe down/tap used by Android (Xiaomi, Oppo, Vivo, Samsung, etc.)
    const triggerBlackout = () => {
      if (multiTouchTimer) {
        clearTimeout(multiTouchTimer);
        multiTouchTimer = null;
      }
      const shield = createShield();
      shield.style.opacity = "1";
      shield.style.pointerEvents = "auto";
      document.body.style.filter = "blur(40px) brightness(0.1)";
    };

    const releaseBlackout = () => {
      if (multiTouchTimer) clearTimeout(multiTouchTimer);
      multiTouchTimer = setTimeout(() => {
        const shield = document.getElementById("anti-screenshot-shield");
        if (shield) {
          shield.style.opacity = "0";
          shield.style.pointerEvents = "none";
        }
        document.body.style.filter = "none";
      }, 1000);
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        // Prevent default browser multi-touch actions and instantly blind the screen
        try {
          if (e.cancelable) e.preventDefault();
        } catch {
          // ignore
        }
        triggerBlackout();
      }
    };

    // ── Register all listeners ────────────────────────────────────────────────
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);
    window.addEventListener("blur", blurOnHide);
    window.addEventListener("focus", unblurOnShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("dragstart", blockDrag);

    // Multi-touch screenshot detection
    window.addEventListener("touchstart", handleTouch, { passive: false });
    window.addEventListener("touchmove", handleTouch, { passive: false });
    window.addEventListener("touchend", releaseBlackout);
    window.addEventListener("touchcancel", releaseBlackout);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
      window.removeEventListener("blur", blurOnHide);
      window.removeEventListener("focus", unblurOnShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("dragstart", blockDrag);

      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchend", releaseBlackout);
      window.removeEventListener("touchcancel", releaseBlackout);

      if (multiTouchTimer) clearTimeout(multiTouchTimer);
      const shield = document.getElementById("anti-screenshot-shield");
      if (shield) shield.remove();
    };
  }, []);

  return null;
}


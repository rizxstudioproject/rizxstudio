"use client";

import { useEffect } from "react";

/**
 * ContentGuard — Multi-layer anti-theft protection for portfolio content.
 * Layers:
 * 1. Disable right-click context menu sitewide
 * 2. Block keyboard shortcuts: Ctrl+S, Ctrl+U, Ctrl+P, F12, Ctrl+Shift+I/J/C
 * 3. Blur images when window loses focus (defeats snipping tool / screen capture apps)
 * 4. Block drag-and-drop of images
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

    // ── 3. Blur portfolio images when window loses focus or page is hidden ───
    // Defeats screen-recorder apps, snipping tools, and mobile control center recordings
    const blurOnHide = () => {
      document.body.style.filter = "blur(16px)";
      document.body.style.transition = "filter 0.15s ease";
    };

    const unblurOnShow = () => {
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

    // ── Register all listeners ────────────────────────────────────────────────
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);
    window.addEventListener("blur", blurOnHide);
    window.addEventListener("focus", unblurOnShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("dragstart", blockDrag);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
      window.removeEventListener("blur", blurOnHide);
      window.removeEventListener("focus", unblurOnShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("dragstart", blockDrag);
    };
  }, []);

  return null;
}

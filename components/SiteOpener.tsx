"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __siteReady?: Promise<void>;
    __resolveSiteReady?: () => void;
  }
}

/* ✏️ KONFIGURASI OPENER */
const WORDMARK = "RIZXSTUDIO";
const SLOT_INDEX = 9; // huruf ke-berapa (mulai 0) yang jadi kotak gambar → "O" terakhir
const CYCLE_MS = 130; // kecepatan ganti gambar (~130ms per gambar)
export const ONCE_PER_SESSION = false; // default: tampil setiap kunjungan baru ke "/"

// 6 gambar terbaik dari aset portofolio project ini
const PORTFOLIO_IMAGES = [
  {
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-brand-identity.jpg",
    fallback: "linear-gradient(135deg,#ff7a18,#af002d)",
  },
  {
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-KIA/KIA%20EV2_B.jpg",
    fallback: "linear-gradient(135deg,#2193b0,#6dd5ed)",
  },
  {
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-campaign-visuals.jpg",
    fallback: "linear-gradient(135deg,#f5af19,#f12711)",
  },
  {
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Burger%20King/Burger_ads04.jpg",
    fallback: "linear-gradient(135deg,#7f00ff,#e100ff)",
  },
  {
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-motion-graphics.jpg",
    fallback: "linear-gradient(135deg,#11998e,#38ef7d)",
  },
  {
    url: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-3d-design.jpg",
    fallback: "linear-gradient(135deg,#fc466b,#3f5efb)",
  },
];

function preloadOpenerImages(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const promises = PORTFOLIO_IMAGES.map(
    (item) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (typeof img.decode === "function") {
            img.decode().catch(() => {}).finally(() => resolve());
          } else {
            resolve();
          }
        };
        img.onerror = () => resolve();
        img.src = item.url;
      })
  );
  return Promise.all(promises).then(() => {});
}

export default function SiteOpener() {
  const pathname = usePathname();
  const [removed, setRemoved] = useState(false);
  const [markState, setMarkState] = useState<"" | "in" | "out">("");
  const [slotSwapped, setSlotSwapped] = useState(false);
  const [activeTile, setActiveTile] = useState<number>(-1);
  const [openerHidden, setOpenerHidden] = useState(false);

  const openerRef = useRef<HTMLDivElement>(null);
  const imgsBoxRef = useRef<HTMLSpanElement>(null);
  const finishedRef = useRef(false);

  const cleanupDOM = useCallback(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("is-loading");
    document.querySelectorAll(".op-grow").forEach((node) => node.remove());
  }, []);

  const finishNow = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.add("has-opener", "is-ready");
      root.classList.remove("is-loading");
    }
    cleanupDOM();
    setRemoved(true);
    try {
      if (ONCE_PER_SESSION) {
        sessionStorage.setItem("opener-seen", "1");
      }
    } catch {
      // ignore storage errors
    }
  }, [cleanupDOM]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Hanya tampil di halaman utama "/"
    if (pathname && pathname !== "/") {
      finishNow();
      return;
    }

    const root = document.documentElement;
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seen = false;
    try {
      seen = Boolean(ONCE_PER_SESSION && sessionStorage.getItem("opener-seen"));
    } catch {
      seen = false;
    }

    if (reduceMotion || seen) {
      finishNow();
      return;
    }

    let cancelled = false;
    root.classList.add("has-opener", "is-loading");
    root.classList.remove("is-ready");

    // Preload semua gambar opener segera supaya tidak berkedip
    const imagesReadyPromise = preloadOpenerImages();

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

    // Menunggu preloader frame website ("CACHING FRAMES") selesai sebelum langkah 3
    const waitForSite = () => {
      const sitePromise = window.__siteReady || Promise.resolve();
      // Safety fallback 10s supaya tidak hang jika koneksi terputus
      return Promise.race([sitePromise, wait(10000)]);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finishNow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    async function run() {
      // Mulai setelah document.fonts.ready
      try {
        if (document.fonts && document.fonts.ready) {
          await Promise.race([document.fonts.ready, wait(1500)]);
        }
      } catch {
        // ignore font ready error
      }
      if (cancelled || finishedRef.current) return;

      // 1. Wordmark "RIZXSTUDIO" muncul (fade + naik + blur hilang)
      await wait(150);
      if (cancelled || finishedRef.current) return;
      setMarkState("in");

      await wait(1100);
      if (cancelled || finishedRef.current) return;

      // Pastikan gambar opener sudah siap (maksimal tunggu tambahan 600ms jika belum selesai)
      await Promise.race([imagesReadyPromise, wait(600)]);
      if (cancelled || finishedRef.current) return;

      // 2. Huruf "O" terakhir berubah jadi kotak kecil berganti-ganti gambar (~130ms per gambar)
      setSlotSwapped(true);
      for (let n = 0; n < PORTFOLIO_IMAGES.length; n++) {
        if (cancelled || finishedRef.current) return;
        setActiveTile(n);
        await wait(CYCLE_MS);
        if (cancelled || finishedRef.current) return;
      }

      // Tunggu preloader frame web selesai sebelum langkah 3
      await waitForSite();
      if (cancelled || finishedRef.current) return;

      // 3. Kotak "O" langsung membuka portal ke website asli (tanpa gambar portofolio lagi)
      //    dan website melakukan zoom-out halus ke ukuran penuh (~0.9s, cubic-bezier(.76,0,.24,1))
      const boxEl = imgsBoxRef.current;
      const rect = boxEl
        ? boxEl.getBoundingClientRect()
        : {
            top: window.innerHeight / 2 - 24,
            left: window.innerWidth / 2 - 24,
            width: 48,
            height: 48,
          };

      const growEl = document.createElement("div");
      growEl.className = "op-grow";
      growEl.style.top = `${rect.top}px`;
      growEl.style.left = `${rect.left}px`;
      growEl.style.width = `${rect.width}px`;
      growEl.style.height = `${rect.height}px`;
      document.body.appendChild(growEl);

      // Paksa reflow pada kondisi awal kotak "O"
      growEl.getBoundingClientRect();

      // Transparankan background #opener & sembunyikan gambar slot supaya di dalam kotak
      // langsung terlihat website asli, sementara area luar ditutup oleh box-shadow .op-grow
      if (openerRef.current) {
        openerRef.current.classList.add("portal-open");
      }
      if (boxEl) {
        boxEl.style.opacity = "0";
      }

      setMarkState("out");
      root.classList.add("is-ready");
      root.classList.remove("is-loading");
      growEl.classList.add("full");

      await wait(950);
      if (cancelled || finishedRef.current) return;

      // 4. Setelah portal penuh, bersihkan seluruh elemen opener dari DOM
      setOpenerHidden(true);
      finishedRef.current = true;
      cleanupDOM();
      setRemoved(true);
      try {
        if (ONCE_PER_SESSION) {
          sessionStorage.setItem("opener-seen", "1");
        }
      } catch {
        // ignore
      }
    }

    run();

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", handleKeyDown);
      if (!finishedRef.current) {
        cleanupDOM();
      }
    };
  }, [pathname, finishNow, cleanupDOM]);

  if (removed || (pathname && pathname !== "/")) {
    return null;
  }

  return (
    <>
      <div
        id="opener"
        ref={openerRef}
        aria-hidden="true"
        style={openerHidden ? { display: "none" } : undefined}
      >
        <div
          className={`op-mark${markState === "in" ? " in" : ""}${
            markState === "out" ? " out" : ""
          }`}
        >
          {Array.from(WORDMARK).map((char, idx) => {
            if (idx === SLOT_INDEX) {
              return (
                <span
                  key={idx}
                  className={`op-slot${slotSwapped ? " swap" : ""}`}
                >
                  <span className="op-glyph">{char}</span>
                  <span className="op-imgs" ref={imgsBoxRef}>
                    {PORTFOLIO_IMAGES.map((item, tileIdx) => (
                      <i
                        key={tileIdx}
                        className={activeTile === tileIdx ? "on" : ""}
                        style={{
                          backgroundImage: `url('${item.url}'), ${item.fallback}`,
                        }}
                      />
                    ))}
                  </span>
                </span>
              );
            }
            return (
              <span key={idx} className="op-letter">
                {char}
              </span>
            );
          })}
        </div>
      </div>
      <button
        className="op-skip"
        type="button"
        onClick={finishNow}
        aria-label="Skip intro animation"
      >
        Skip
      </button>
    </>
  );
}

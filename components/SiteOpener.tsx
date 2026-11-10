"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __siteReady?: Promise<void>;
    __resolveSiteReady?: () => void;
  }
}

export interface OpenerRuntimeConfig {
  words: [string, string][];
  final: [string, string];
  images: string[];
  imageItems?: { id: string; url: string; active?: boolean }[];
}

const LOCAL_STORAGE_KEY = "rizx_opener_config";

/* ✏️ KONFIGURASI CADANGAN (dipakai jika fetch /api/opener-config gagal/timeout) */
const CONFIG_URL = "/api/opener-config";
export const OPENER_DEFAULTS: OpenerRuntimeConfig = {
  words: [
    ["Motion", "Graphics"],
    ["Branding", "Identity"],
    ["UI/UX", "Design"],
    ["Digital", "Advertising"],
    ["Video", "Production"],
    ["Vibe", "Coding"],
  ],
  final: ["Rizx", "Studio"],
  images: [
    "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-motion-graphics.jpg",
    "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-brand-identity.jpg",
    "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-uiux-design.jpg",
    "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Burger%20King/Burger_ads04.jpg",
    "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-KIA/KIA%20EV2_B.jpg",
    "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-3d-design.jpg",
    "/sequence/frame_000000.webp",
  ],
};

const PHASE_MS = 460; // durasi tiap pasang kata + gambar (~460ms per tahap)
const SIDE_DELAY = 110; // jeda kiri → kanan (~110ms)
const FINAL_HOLD = 950; // lama "Rizx Studio" bertahan (~950ms)
export const ONCE_PER_SESSION = false; // default: tampil setiap kunjungan baru ke "/"

const bgCss = (x: string) =>
  /^(https?:|\/|\.\/|\.\.\/|data:)/.test(x)
    ? `url("${x}") center/cover no-repeat`
    : x;

export default function SiteOpener() {
  const pathname = usePathname();
  const [removed, setRemoved] = useState(false);
  const [replayTrigger, setReplayTrigger] = useState(0);

  const openerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const previewConfigRef = useRef<OpenerRuntimeConfig | null>(null);

  const cleanup = useCallback(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("is-loading");
    document.querySelectorAll(".op-grow").forEach((n) => n.remove());
  }, []);

  const finishNow = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.add("is-ready");
      root.classList.remove("is-loading");
    }
    cleanup();
    setRemoved(true);
    try {
      if (ONCE_PER_SESSION) {
        sessionStorage.setItem("opener-seen", "1");
      }
    } catch {
      // ignore storage errors
    }
  }, [cleanup]);

  // Listener untuk Preview Opener langsung dari Admin Panel
  useEffect(() => {
    const handleReplay = (e: Event) => {
      const customEvent = e as CustomEvent<OpenerRuntimeConfig | undefined>;
      if (customEvent.detail) {
        previewConfigRef.current = customEvent.detail;
      } else {
        previewConfigRef.current = null;
      }
      finishedRef.current = false;
      setRemoved(false);
      setReplayTrigger((c) => c + 1);
    };
    window.addEventListener("replay-site-opener", handleReplay);
    return () => window.removeEventListener("replay-site-opener", handleReplay);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Opener hanya untuk halaman utama "/", bukan /products atau /tracking
    if (pathname && pathname !== "/") {
      finishNow();
      return;
    }

    const root = document.documentElement;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seen = false;
    try {
      seen = Boolean(
        replayTrigger === 0 &&
          ONCE_PER_SESSION &&
          sessionStorage.getItem("opener-seen")
      );
    } catch {
      seen = false;
    }

    if (reduce || seen) {
      finishNow();
      return;
    }

    let cancelled = false;
    finishedRef.current = false;
    root.classList.add("has-opener", "is-loading");
    root.classList.remove("is-ready", "is-settled");

    const wait = (ms: number) =>
      new Promise<void>((r) => {
        setTimeout(r, ms);
      });

    const nextFrame = () =>
      new Promise<void>((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => r());
        });
      });

    const waitForSite = () => {
      const p = window.__siteReady || Promise.resolve();
      return Promise.race([p, wait(10000)]);
    };

    async function loadConfig(): Promise<OpenerRuntimeConfig> {
      if (previewConfigRef.current) {
        const override = previewConfigRef.current;
        previewConfigRef.current = null;
        return override;
      }

      // Cek cache lokal terlebih dahulu agar pembukaan instan tanpa delay
      let cachedConfig: OpenerRuntimeConfig | null = null;
      try {
        const rawCache = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (rawCache) {
          const parsed = JSON.parse(rawCache);
          if (
            parsed &&
            Array.isArray(parsed.words) &&
            parsed.words.length > 0 &&
            Array.isArray(parsed.images) &&
            parsed.images.length > 0
          ) {
            cachedConfig = {
              words: parsed.words,
              final:
                Array.isArray(parsed.final) && parsed.final.length >= 2
                  ? [parsed.final[0], parsed.final[1]]
                  : OPENER_DEFAULTS.final,
              images: parsed.images,
              imageItems: parsed.imageItems,
            };
          }
        }
      } catch {
        // ignore localStorage error
      }

      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 3500);
        const r = await fetch(`${CONFIG_URL}?t=${Date.now()}`, {
          signal: ctl.signal,
          cache: "no-store",
        });
        clearTimeout(t);
        if (!r.ok) throw new Error("Fetch failed");
        const c = await r.json();
        if (
          c &&
          Array.isArray(c.words) &&
          c.words.length > 0 &&
          Array.isArray(c.images) &&
          c.images.length > 0
        ) {
          const freshConfig: OpenerRuntimeConfig = {
            words: c.words,
            final:
              Array.isArray(c.final) && c.final.length >= 2
                ? [c.final[0], c.final[1]]
                : OPENER_DEFAULTS.final,
            images: c.images,
            imageItems: c.imageItems,
          };
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshConfig));
          } catch {
            // ignore
          }
          return freshConfig;
        }
      } catch (err) {
        // jika fetch gagal atau timeout, gunakan cache lokal jika ada
      }

      return cachedConfig || OPENER_DEFAULTS;
    }

    function preload(urls: string[]) {
      const uniqueUrls = Array.from(
        new Set(
          urls.filter((u) => /^(https?:|\/|\.\/|\.\.\/|data:)/.test(u))
        )
      );
      const jobs = uniqueUrls.map(
        (u) =>
          new Promise<void>((res) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () => {
              if (typeof img.decode === "function") {
                img.decode().catch(() => {}).finally(() => res());
              } else {
                res();
              }
            };
            img.onerror = () => res();
            img.src = u;
          })
      );
      return Promise.race([Promise.all(jobs), wait(2500)]);
    }

    function setWord(side: HTMLDivElement | null, text: string) {
      if (!side) return;
      const oldWords = side.querySelectorAll(".op-w.in");
      const w = document.createElement("span");
      w.className = "op-w";
      w.textContent = text;
      side.appendChild(w);
      w.getBoundingClientRect();
      w.classList.add("in");
      oldWords.forEach((old) => {
        old.classList.remove("in");
        old.classList.add("leave");
        setTimeout(() => {
          old.remove();
        }, 450);
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finishNow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    async function run() {
      const opener = openerRef.current;
      const mark = markRef.current;
      const L = leftSideRef.current;
      const R = rightSideRef.current;
      const box = boxRef.current;
      if (!opener || !mark || !L || !R || !box) return;

      // Bersihkan state jika replay
      opener.style.display = "";
      opener.classList.remove("portal-open", "fade");
      mark.className = "op-mark";
      box.style.visibility = "";
      box.innerHTML = "";
      L.innerHTML = "";
      R.innerHTML = "";

      const cfg = await loadConfig();
      if (cancelled || finishedRef.current) return;

      const phases: [string, string][] = [...cfg.words, cfg.final];
      const sourceImages =
        cfg.images && cfg.images.length > 0
          ? cfg.images
          : OPENER_DEFAULTS.images;

      // Ambil gambar untuk setiap tahap: prioritaskan slot imageItems dari admin dashboard
      const imgs = phases.map((_, i) => {
        if (cfg.imageItems && cfg.imageItems[i]?.url) {
          return cfg.imageItems[i].url;
        }
        return sourceImages[i % sourceImages.length] || OPENER_DEFAULTS.images[i % OPENER_DEFAULTS.images.length];
      });

      // Untuk tahap akhir ("Rizx Studio"), gunakan gambar yang ditentukan admin di tahap terakhir,
      // atau fallback ke /sequence/frame_000000.webp
      const finalHeroImg =
        imgs[imgs.length - 1] || "/sequence/frame_000000.webp";
      imgs[imgs.length - 1] = finalHeroImg;

      await Promise.all([
        document.fonts
          ? Promise.race([document.fonts.ready, wait(1500)])
          : Promise.resolve(),
        preload(imgs),
      ]);
      if (cancelled || finishedRef.current) return;

      const tiles = imgs.map((x) => {
        const tile = document.createElement("i");
        tile.style.background = bgCss(x);
        box.appendChild(tile);
        return tile;
      });

      await wait(150);
      if (cancelled || finishedRef.current) return;
      mark.classList.add("in");

      await wait(350);
      if (cancelled || finishedRef.current) return;

      // 2 & 3. Teks kiri & kanan bergantian (~110ms), kotak gambar di tengah berganti sesuai tahap (~460ms)
      for (let n = 0; n < phases.length; n++) {
        if (cancelled || finishedRef.current) return;
        tiles.forEach((t, k) => t.classList.toggle("on", k === n));
        setWord(L, phases[n][0]); // kiri berganti dulu...
        await wait(SIDE_DELAY);
        if (cancelled || finishedRef.current) return;
        setWord(R, phases[n][1]); // ...~110ms kemudian kanan
        await wait(
          n === phases.length - 1 ? FINAL_HOLD : PHASE_MS - SIDE_DELAY
        );
      }

      // Tunggu preloader frame website ("CACHING FRAMES") selesai sebelum langkah 4
      await waitForSite();
      if (cancelled || finishedRef.current) return;

      // 4. Pure GPU-accelerated FLIP: dari ukuran kotak tengah ke layar penuh (scale 1.08)
      //    tanpa layout reflow (hanya transform & opacity) sehingga 100% mulus 60/120fps
      const r = box.getBoundingClientRect();
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const dx = r.left + r.width / 2 - vw / 2;
      const dy = r.top + r.height / 2 - vh / 2;
      const sx = Math.max(0.01, r.width / vw);
      const sy = Math.max(0.01, r.height / vh);
      const boxRadiusPx =
        parseFloat(getComputedStyle(box).borderRadius || "6") || 6;
      const scaledRx = Math.round(boxRadiusPx / sx);
      const scaledRy = Math.round(boxRadiusPx / sy);

      const g = document.createElement("div");
      g.className = "op-grow";
      g.style.background = bgCss(finalHeroImg);
      g.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale3d(${sx}, ${sy}, 1)`;
      g.style.borderRadius = `${scaledRx}px / ${scaledRy}px`;
      document.body.appendChild(g);

      // Pastikan layer awal sudah di-commit ke GPU sebelum memulai animasi ekspansi
      await nextFrame();
      if (cancelled || finishedRef.current) return;

      box.style.visibility = "hidden";
      mark.classList.add("split");
      g.classList.add("full");

      // Tunggu ekspansi FLIP mencapai layar penuh (~920ms), lalu jalankan zoom-out sinkron
      await wait(920);
      if (cancelled || finishedRef.current) return;

      // 5. Layar penuh memudar & baik layer opener maupun hero web melakukan zoom-out sinkron (1.08 → 1.0)
      opener.classList.add("fade");
      g.classList.add("settle");
      root.classList.add("is-ready");
      root.classList.remove("is-loading");

      await wait(900);
      if (cancelled || finishedRef.current) return;

      opener.style.display = "none";
      finishedRef.current = true;
      cleanup();
      setRemoved(true);
      try {
        if (ONCE_PER_SESSION) {
          sessionStorage.setItem("opener-seen", "1");
        }
      } catch {
        // ignore
      }

      // Setelah efek zoom-out selesai, bersihkan transform wrapper supaya sticky canvas optimal
      setTimeout(() => {
        root.classList.add("is-settled");
      }, 650);
    }

    run();

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", handleKeyDown);
      if (!finishedRef.current) {
        cleanup();
      }
    };
  }, [pathname, replayTrigger, finishNow, cleanup]);

  if (removed || (pathname && pathname !== "/")) {
    return null;
  }

  return (
    <>
      <div id="opener" ref={openerRef} aria-hidden="true">
        <div className="op-mark" ref={markRef}>
          <div className="op-side l" ref={leftSideRef} />
          <div className="op-box" ref={boxRef} />
          <div className="op-side r" ref={rightSideRef} />
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

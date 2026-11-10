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
}

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
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 900);
        const r = await fetch(CONFIG_URL, {
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
          return {
            words: c.words,
            final:
              Array.isArray(c.final) && c.final.length >= 2
                ? [c.final[0], c.final[1]]
                : OPENER_DEFAULTS.final,
            images: c.images,
          };
        }
      } catch {
        // fallback ke OPENER_DEFAULTS
      }
      return OPENER_DEFAULTS;
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
      opener.classList.remove("portal-open");
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

      // Jika gambar kurang dari jumlah tahap, ulangi dari awal;
      // gambar terakhir untuk tahap "Rizx Studio" adalah tampilan hero web (/sequence/frame_000000.webp)
      const imgs = phases.map(
        (_, i) => sourceImages[i % sourceImages.length]
      );
      imgs[imgs.length - 1] = "/sequence/frame_000000.webp";

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

      // 4 & 5. Kotak di tengah (yang menampilkan preview web) langsung membesar jadi layar penuh
      //        membuka website asli (tanpa bayangan gambar portofolio menumpuk) sementara
      //        teks kiri/kanan bergeser keluar dan web melakukan zoom-out (scale 1.12 → 1, ~1.4s)
      const r = box.getBoundingClientRect();
      const g = document.createElement("div");
      g.className = "op-grow";
      const boxRadius = getComputedStyle(box).borderRadius || "4px";
      g.style.cssText = `top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;border-radius:${boxRadius}`;
      document.body.appendChild(g);

      // Paksa reflow pada ukuran kotak awal sebelum membuka portal ke web
      g.getBoundingClientRect();

      opener.classList.add("portal-open");
      mark.classList.add("split");
      box.style.visibility = "hidden";
      root.classList.add("is-ready");
      root.classList.remove("is-loading");
      g.classList.add("full");

      await wait(1000);
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

      // Setelah efek zoom-out 1.4s selesai, bersihkan transform wrapper supaya sticky canvas optimal
      setTimeout(() => {
        root.classList.add("is-settled");
      }, 500);
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

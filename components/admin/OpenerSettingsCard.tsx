"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RiSparklingFill,
  RiUpload2Fill,
  RiDeleteBinFill,
  RiAddFill,
  RiRestartFill,
  RiSave3Fill,
  RiCheckFill,
  RiArrowUpLine,
  RiArrowDownLine,
  RiPlayFill,
  RiDraggable,
  RiEyeFill,
  RiEyeOffFill,
  RiImageAddLine,
} from "react-icons/ri";
import { OPENER_DEFAULTS, OpenerRuntimeConfig } from "@/components/SiteOpener";
import { normalizeMediaUrl } from "@/lib/mediaService";

export interface AdminOpenerImageItem {
  id: string;
  url: string;
  active: boolean;
}

interface OpenerSettingsCardProps {
  isLight: boolean;
  tx: (id: string, en: string) => string;
  showToast: (msg: string) => void;
  onPreviewOpener?: () => void;
}

const DEFAULT_IMAGE_ITEMS: AdminOpenerImageItem[] = OPENER_DEFAULTS.images.map(
  (url, idx) => ({
    id: `img-${idx + 1}`,
    url,
    active: true,
  })
);

export default function OpenerSettingsCard({
  isLight,
  tx,
  showToast,
  onPreviewOpener,
}: OpenerSettingsCardProps) {
  const [words, setWords] = useState<[string, string][]>(OPENER_DEFAULTS.words);
  const [finalPair, setFinalPair] = useState<[string, string]>(
    OPENER_DEFAULTS.final
  );
  const [imageItems, setImageItems] =
    useState<AdminOpenerImageItem[]>(DEFAULT_IMAGE_ITEMS);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Drag & Drop state for images & words
  const [dragImgIdx, setDragImgIdx] = useState<number | null>(null);
  const [dragOverImgIdx, setDragOverImgIdx] = useState<number | null>(null);
  const [dragWordIdx, setDragWordIdx] = useState<number | null>(null);
  const [dragOverWordIdx, setDragOverWordIdx] = useState<number | null>(null);

  // Interactive In-Panel Preview Player state
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const inlineOpenerRef = useRef<HTMLDivElement>(null);
  const inlineMarkRef = useRef<HTMLDivElement>(null);
  const inlineLeftRef = useRef<HTMLDivElement>(null);
  const inlineRightRef = useRef<HTMLDivElement>(null);
  const inlineBoxRef = useRef<HTMLDivElement>(null);
  const inlineCancelRef = useRef(false);

  // Fetch current config from GET /api/opener-config
  useEffect(() => {
    let mounted = true;
    async function fetchOpenerConfig() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/opener-config?admin=1&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          if (Array.isArray(data.words) && data.words.length > 0) {
            setWords(
              data.words.map((p: any) => [
                String(p?.[0] ?? ""),
                String(p?.[1] ?? ""),
              ])
            );
          }
          if (Array.isArray(data.final) && data.final.length >= 2) {
            setFinalPair([String(data.final[0]), String(data.final[1])]);
          }
          if (Array.isArray(data.imageItems) && data.imageItems.length > 0) {
            setImageItems(
              data.imageItems.map((it: any, idx: number) => ({
                id: String(it.id || `img-${idx + 1}`),
                url: String(it.url || ""),
                active: it.active !== false,
              }))
            );
          } else if (Array.isArray(data.images) && data.images.length > 0) {
            setImageItems(
              data.images.map((u: string, idx: number) => ({
                id: `img-${idx + 1}`,
                url: u,
                active: true,
              }))
            );
          }
        }
      } catch {
        // use defaults
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchOpenerConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const activeImages = imageItems.filter((i) => i.active && i.url.trim());

  const saveConfigToServer = async (
    nextWords = words,
    nextFinal = finalPair,
    nextImageItems = imageItems,
    silent = false
  ) => {
    setIsSaving(true);
    try {
      const cleanedWords: [string, string][] = nextWords
        .map(
          (w) =>
            [w[0].trim() || "Motion", w[1].trim() || "Graphics"] as [
              string,
              string,
            ]
        )
        .filter((w) => w[0] || w[1]);

      const cleanedFinal: [string, string] = [
        nextFinal[0].trim() || "Rizx",
        nextFinal[1].trim() || "Studio",
      ];

      const cleanedImages = nextImageItems
        .filter((i) => i.url.trim())
        .map((i, idx) => ({
          id: i.id || `img-${idx + 1}`,
          url: normalizeMediaUrl(i.url.trim()),
          active: i.active !== false,
        }));

      const activeUrls = cleanedImages
        .filter((i) => i.active)
        .map((i) => i.url);

      const res = await fetch("/api/opener-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-auth": "rizx-admin",
        },
        body: JSON.stringify({
          words: cleanedWords.length > 0 ? cleanedWords : OPENER_DEFAULTS.words,
          final: cleanedFinal,
          images: activeUrls.length > 0 ? activeUrls : OPENER_DEFAULTS.images,
          imageItems: cleanedImages,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menyimpan konfigurasi Opener");
      }

      setWords(cleanedWords);
      setFinalPair(cleanedFinal);
      setImageItems(cleanedImages);

      if (!silent) {
        showToast(
          tx(
            "Berhasil: Konfigurasi Opener disimpan ke database Supabase!",
            "Opener configuration saved to Supabase database!"
          )
        );
      }
    } catch (err: any) {
      showToast(
        tx(
          `Gagal menyimpan Opener: ${err.message}`,
          `Failed to save Opener: ${err.message}`
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Upload Gambar Baru ke Supabase Storage
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedItems: AdminOpenerImageItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "opener");
        const res = await fetch("/api/admin/media-upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Upload gagal");
        }
        const data = await res.json();
        if (data.url) {
          uploadedItems.push({
            id: `img-${Date.now()}-${i}`,
            url: data.url,
            active: true,
          });
        }
      }

      if (uploadedItems.length > 0) {
        const nextItems = [...imageItems, ...uploadedItems];
        setImageItems(nextItems);
        await saveConfigToServer(words, finalPair, nextItems, true);
        showToast(
          tx(
            `${uploadedItems.length} gambar berhasil diupload ke Supabase Storage & disimpan!`,
            `${uploadedItems.length} image(s) uploaded to Supabase Storage & saved!`
          )
        );
      }
    } catch (err: any) {
      showToast(
        tx(
          `Gagal upload gambar: ${err.message}`,
          `Failed to upload image: ${err.message}`
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageByUrl = () => {
    const trimmed = normalizeMediaUrl(newImageUrl.trim());
    if (!trimmed) return;
    const nextItems = [
      ...imageItems,
      { id: `img-${Date.now()}`, url: trimmed, active: true },
    ];
    setImageItems(nextItems);
    setNewImageUrl("");
  };

  const handleToggleImageActive = (idx: number) => {
    setImageItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, active: !item.active } : item
      )
    );
  };

  const handleDeleteImage = (idx: number) => {
    if (imageItems.length <= 1) {
      showToast(
        tx(
          "Minimal harus ada 1 gambar dalam daftar Opener.",
          "At least 1 image is required in the Opener list."
        )
      );
      return;
    }
    setImageItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= imageItems.length) return;
    setImageItems((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleDropImage = (targetIdx: number) => {
    if (dragImgIdx === null || dragImgIdx === targetIdx) {
      setDragImgIdx(null);
      setDragOverImgIdx(null);
      return;
    }
    setImageItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(dragImgIdx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
    setDragImgIdx(null);
    setDragOverImgIdx(null);
  };

  // Word pairs handlers
  const handleWordChange = (
    idx: number,
    side: 0 | 1,
    val: string
  ) => {
    setWords((prev) =>
      prev.map((pair, i) => {
        if (i !== idx) return pair;
        return side === 0 ? [val, pair[1]] : [pair[0], val];
      })
    );
  };

  const handleAddWordPair = () => {
    setWords((prev) => [...prev, ["Creative", "Studio"]]);
  };

  const handleRemoveWordPair = (idx: number) => {
    if (words.length <= 1) {
      showToast(
        tx(
          "Minimal harus ada 1 pasang kata pembuka.",
          "At least 1 opening word pair is required."
        )
      );
      return;
    }
    setWords((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveWordPair = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= words.length) return;
    setWords((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleDropWordPair = (targetIdx: number) => {
    if (dragWordIdx === null || dragWordIdx === targetIdx) {
      setDragWordIdx(null);
      setDragOverWordIdx(null);
      return;
    }
    setWords((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(dragWordIdx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
    setDragWordIdx(null);
    setDragOverWordIdx(null);
  };

  const handleResetDefaults = async () => {
    setWords(OPENER_DEFAULTS.words);
    setFinalPair(OPENER_DEFAULTS.final);
    setImageItems(DEFAULT_IMAGE_ITEMS);
    await saveConfigToServer(
      OPENER_DEFAULTS.words,
      OPENER_DEFAULTS.final,
      DEFAULT_IMAGE_ITEMS,
      true
    );
    showToast(
      tx(
        "Opener dikembalikan ke susunan default!",
        "Opener restored to default configuration!"
      )
    );
  };

  // ==============================================================
  // INLINE FULL-EFFECT PREVIEW PLAYER DI DALAM PANEL ADMIN
  // ==============================================================
  const playInlinePreview = async () => {
    inlineCancelRef.current = false;
    setIsPlayingInline(true);

    const wait = (ms: number) =>
      new Promise<void>((r) => {
        setTimeout(r, ms);
      });

    await wait(60);
    const mark = inlineMarkRef.current;
    const L = inlineLeftRef.current;
    const R = inlineRightRef.current;
    const box = inlineBoxRef.current;
    if (!mark || !L || !R || !box) return;

    mark.className = "op-mark";
    box.style.visibility = "";
    box.innerHTML = "";
    L.innerHTML = "";
    R.innerHTML = "";

    const activeUrls =
      activeImages.length > 0
        ? activeImages.map((i) => i.url)
        : OPENER_DEFAULTS.images;

    const phases: [string, string][] = [...words, finalPair];
    const imgs = phases.map((_, i) => activeUrls[i % activeUrls.length]);
    imgs[imgs.length - 1] = activeUrls[activeUrls.length - 1];

    const tiles = imgs.map((u) => {
      const tile = document.createElement("i");
      tile.style.background = `url("${u}") center/cover no-repeat`;
      box.appendChild(tile);
      return tile;
    });

    const setWord = (side: HTMLDivElement, text: string) => {
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
        setTimeout(() => old.remove(), 450);
      });
    };

    await wait(120);
    if (inlineCancelRef.current) return;
    mark.classList.add("in");
    await wait(300);

    for (let n = 0; n < phases.length; n++) {
      if (inlineCancelRef.current) return;
      tiles.forEach((t, k) => t.classList.toggle("on", k === n));
      setWord(L, phases[n][0]);
      await wait(110);
      if (inlineCancelRef.current) return;
      setWord(R, phases[n][1]);
      await wait(n === phases.length - 1 ? 950 : 350);
    }

    if (inlineCancelRef.current) return;
    mark.classList.add("split");
    await wait(950);
    if (!inlineCancelRef.current) {
      setIsPlayingInline(false);
    }
  };

  const stopInlinePreview = () => {
    inlineCancelRef.current = true;
    setIsPlayingInline(false);
  };

  const handleTriggerLivePreview = () => {
    const activeUrls =
      activeImages.length > 0
        ? activeImages.map((i) => i.url)
        : OPENER_DEFAULTS.images;
    const payload: OpenerRuntimeConfig = {
      words,
      final: finalPair,
      images: activeUrls,
    };
    if (onPreviewOpener) {
      onPreviewOpener();
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("replay-site-opener", { detail: payload })
        );
      }, 150);
    } else {
      playInlinePreview();
    }
  };

  const phasesCount = words.length + 1;

  return (
    <div
      className={`p-5 sm:p-7 rounded-2xl border space-y-6 ${
        isLight
          ? "bg-white border-slate-200/90 shadow-sm"
          : "bg-[#0e0f14] border border-white/10"
      }`}
    >
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          isLight ? "border-slate-100" : "border-white/10"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <RiSparklingFill className="w-4 h-4 text-[#16b09f]" />
            <span
              className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}
            >
              {tx(
                "OPENER (INTRO ANIMATION) — SUPABASE CONFIG",
                "OPENER (INTRO ANIMATION) — SUPABASE CONFIG"
              )}
            </span>
          </div>
          <h3
            className={`text-base sm:text-lg font-bold mt-1 ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            {tx(
              "Pengaturan Opener Website ([Teks Kiri] [Kotak Gambar] [Teks Kanan])",
              "Website Opener Configuration ([Left Word] [Image Box] [Right Word])"
            )}
          </h3>
          <p
            className={`text-xs mt-0.5 ${
              isLight ? "text-slate-500" : "text-neutral-400"
            }`}
          >
            {tx(
              "Kelola pasangan kata kiri/kanan, teks akhir (Rizx | Studio), serta daftar gambar di tengah (drag-and-drop urutan, aktif/nonaktif, upload ke Supabase Storage).",
              "Manage left/right word pairs, final words (Rizx | Studio), and center images (drag-and-drop reorder, enable/disable, upload to Supabase Storage)."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={playInlinePreview}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] border border-[#16b09f]/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RiPlayFill className="w-4 h-4" />
            <span>{tx("Preview di Panel", "Preview in Panel")}</span>
          </button>

          {onPreviewOpener && (
            <button
              type="button"
              onClick={handleTriggerLivePreview}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RiPlayFill className="w-3.5 h-3.5 text-[#16b09f]" />
              <span>{tx("Preview Full di Web", "Preview Full on Site")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Interactive Preview Stage */}
      {isPlayingInline && (
        <div
          ref={inlineOpenerRef}
          className="relative w-full h-[260px] sm:h-[320px] rounded-2xl bg-[#0a0a0c] border border-white/15 overflow-hidden grid place-items-center shadow-2xl"
        >
          <div className="absolute top-3 left-4 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            LIVE OPENER PREVIEW
          </div>
          <button
            type="button"
            onClick={stopInlinePreview}
            className="absolute top-3 right-4 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono uppercase tracking-wider text-white cursor-pointer z-20"
          >
            {tx("Tutup Preview", "Close Preview")}
          </button>

          <div
            ref={inlineMarkRef}
            className="op-mark"
            style={
              {
                "--fs": "clamp(16px, 3.2vw, 44px)",
                width: "92%",
              } as React.CSSProperties
            }
          >
            <div ref={inlineLeftRef} className="op-side l" />
            <div ref={inlineBoxRef} className="op-box" />
            <div ref={inlineRightRef} className="op-side r" />
          </div>
        </div>
      )}

      {/* ==============================================================
          BAGIAN 1: PASANGAN KATA KIRI | KANAN & TEKS AKHIR (RIZX | STUDIO)
         ============================================================== */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4
              className={`text-sm font-bold ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {tx(
                "1. Urutan Pasangan Kata (Kiri | Kanan) & Teks Akhir",
                "1. Word Pairs Sequence (Left | Right) & Final Text"
              )}
            </h4>
            <p
              className={`text-xs ${
                isLight ? "text-slate-500" : "text-neutral-400"
              }`}
            >
              {tx(
                "Kata kiri muncul lebih dulu, lalu ~110ms kemudian kata kanan. Tarik (drag) atau gunakan panah untuk mengubah urutan.",
                "Left word enters first, followed ~110ms later by right word. Drag or use arrows to reorder."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddWordPair}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] border border-[#16b09f]/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RiAddFill className="w-4 h-4" />
            <span>{tx("Tambah Pasang Kata", "Add Word Pair")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {words.map((pair, idx) => {
            const assignedImg =
              activeImages.length > 0
                ? activeImages[idx % activeImages.length]?.url
                : "";
            return (
              <div
                key={idx}
                draggable
                onDragStart={() => setDragWordIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverWordIdx(idx);
                }}
                onDragLeave={() => setDragOverWordIdx(null)}
                onDrop={() => handleDropWordPair(idx)}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  dragOverWordIdx === idx
                    ? "border-[#16b09f] ring-2 ring-[#16b09f]/30"
                    : isLight
                    ? "bg-slate-50 border-slate-200"
                    : "bg-neutral-900/60 border-white/10"
                }`}
              >
                <div
                  className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-[#16b09f] shrink-0"
                  title="Drag to reorder"
                >
                  <RiDraggable className="w-4 h-4" />
                </div>

                <span className="px-2 py-0.5 rounded bg-[#16b09f]/15 text-[#16b09f] font-mono text-[10px] font-bold shrink-0">
                  #{idx + 1}
                </span>

                {/* Left Word */}
                <input
                  type="text"
                  value={pair[0]}
                  onChange={(e) => handleWordChange(idx, 0, e.target.value)}
                  placeholder="Kiri (mis. Motion)"
                  className={`w-full min-w-0 px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-right focus:outline-none focus:border-[#16b09f] ${
                    isLight
                      ? "bg-white border-slate-200 text-slate-900"
                      : "bg-neutral-950 border-white/10 text-white"
                  }`}
                />

                {/* Mini Center Image Preview */}
                <div
                  className="w-9 h-7 rounded bg-neutral-800 border border-white/15 shrink-0 bg-cover bg-center"
                  style={{
                    backgroundImage: assignedImg
                      ? `url("${assignedImg}")`
                      : undefined,
                  }}
                  title={tx(
                    `Gambar tahap #${idx + 1}`,
                    `Stage #${idx + 1} image`
                  )}
                />

                {/* Right Word */}
                <input
                  type="text"
                  value={pair[1]}
                  onChange={(e) => handleWordChange(idx, 1, e.target.value)}
                  placeholder="Kanan (mis. Graphics)"
                  className={`w-full min-w-0 px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-left focus:outline-none focus:border-[#16b09f] ${
                    isLight
                      ? "bg-white border-slate-200 text-slate-900"
                      : "bg-neutral-950 border-white/10 text-white"
                  }`}
                />

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveWordPair(idx, -1)}
                    disabled={idx === 0}
                    className={`p-1 rounded border text-xs cursor-pointer disabled:opacity-30 ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700"
                        : "bg-neutral-800 border-white/10 text-neutral-300"
                    }`}
                  >
                    <RiArrowUpLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveWordPair(idx, 1)}
                    disabled={idx === words.length - 1}
                    className={`p-1 rounded border text-xs cursor-pointer disabled:opacity-30 ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700"
                        : "bg-neutral-800 border-white/10 text-neutral-300"
                    }`}
                  >
                    <RiArrowDownLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveWordPair(idx)}
                    className="p-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                  >
                    <RiDeleteBinFill className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Word Pair ("Rizx" | "Studio") */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight
              ? "bg-teal-50/60 border-teal-200"
              : "bg-[#16b09f]/10 border-[#16b09f]/30"
          }`}
        >
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#16b09f] block">
              {tx(
                `TAHAP TERAKHIR (#${phasesCount}) — BERTAHAN ~950MS & MEMBESAR FULLSCREEN`,
                `FINAL STAGE (#${phasesCount}) — HOLDS ~950MS & EXPANDS FULLSCREEN`
              )}
            </span>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? "text-slate-600" : "text-neutral-300"
              }`}
            >
              {tx(
                "Teks penutup utama (default: Rizx | Studio). Selalu memakai gambar aktif paling akhir.",
                "Final closing word pair (default: Rizx | Studio). Always uses the last active image."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={finalPair[0]}
              onChange={(e) => setFinalPair([e.target.value, finalPair[1]])}
              placeholder="Rizx"
              className={`w-28 sm:w-36 px-3 py-1.5 rounded-lg border text-xs font-bold text-right focus:outline-none focus:border-[#16b09f] ${
                isLight
                  ? "bg-white border-slate-200 text-slate-900"
                  : "bg-neutral-950 border-white/15 text-white"
              }`}
            />
            <div
              className="w-10 h-7 rounded bg-neutral-900 border border-[#16b09f] shrink-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  activeImages.length > 0
                    ? `url("${activeImages[activeImages.length - 1].url}")`
                    : undefined,
              }}
            />
            <input
              type="text"
              value={finalPair[1]}
              onChange={(e) => setFinalPair([finalPair[0], e.target.value])}
              placeholder="Studio"
              className={`w-28 sm:w-36 px-3 py-1.5 rounded-lg border text-xs font-bold text-left focus:outline-none focus:border-[#16b09f] ${
                isLight
                  ? "bg-white border-slate-200 text-slate-900"
                  : "bg-neutral-950 border-white/15 text-white"
              }`}
            />
          </div>
        </div>
      </div>

      {/* ==============================================================
          BAGIAN 2: DAFTAR GAMBAR OPENER (UPLOAD, DRAG & DROP, AKTIF/NONAKTIF, HAPUS)
         ============================================================== */}
      <div className="space-y-4 pt-2 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4
              className={`text-sm font-bold ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {tx(
                `2. Galeri Gambar Opener (${activeImages.length} Aktif dari ${imageItems.length} Gambar)`,
                `2. Opener Images Gallery (${activeImages.length} Active of ${imageItems.length} Images)`
              )}
            </h4>
            <p
              className={`text-xs ${
                isLight ? "text-slate-500" : "text-neutral-400"
              }`}
            >
              {tx(
                "Tarik (drag & drop) kartu gambar untuk mengubah urutan. Jika gambar aktif lebih sedikit dari tahap kata, gambar diulang dari awal; gambar aktif terakhir selalu dipakai untuk tahap 'Rizx Studio'.",
                "Drag & drop cards to reorder. If fewer active images than word stages, images repeat from start; the last active image is always used for 'Rizx Studio'."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3.5 py-2 rounded-xl bg-[#16b09f] hover:bg-[#139b8c] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#16b09f]/20 transition-all">
              <RiUpload2Fill className="w-4 h-4" />
              <span>
                {isUploading
                  ? tx("Mengupload...", "Uploading...")
                  : tx("Upload Gambar ke Supabase", "Upload Image to Supabase")}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                className="hidden"
                onChange={(e) => {
                  handleUploadFiles(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>

        {/* Add by URL input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder={tx(
              "Atau tempel URL gambar / link Google Drive di sini...",
              "Or paste image URL / Google Drive link here..."
            )}
            className={`flex-1 min-w-0 px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#16b09f] ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-800"
                : "bg-neutral-950 border-white/10 text-neutral-200"
            }`}
          />
          <button
            type="button"
            onClick={handleAddImageByUrl}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                : "bg-neutral-800 hover:bg-neutral-700 text-white border-white/10"
            }`}
          >
            <RiImageAddLine className="w-4 h-4 text-[#16b09f]" />
            <span>{tx("Tambah URL", "Add URL")}</span>
          </button>
        </div>

        {/* Grid Gambar Drag & Drop */}
        {isLoading ? (
          <div className="py-8 text-center text-xs font-mono text-neutral-400">
            {tx("Memuat konfigurasi Opener...", "Loading Opener configuration...")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {imageItems.map((item, idx) => {
              const activeOrder = activeImages.findIndex(
                (a) => a.id === item.id
              );
              const isLastActive =
                item.active &&
                activeOrder !== -1 &&
                activeOrder === activeImages.length - 1;

              return (
                <div
                  key={item.id || idx}
                  draggable
                  onDragStart={() => setDragImgIdx(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverImgIdx(idx);
                  }}
                  onDragLeave={() => setDragOverImgIdx(null)}
                  onDrop={() => handleDropImage(idx)}
                  className={`p-3 rounded-xl border flex flex-col gap-2.5 transition-all ${
                    dragOverImgIdx === idx
                      ? "border-[#16b09f] ring-2 ring-[#16b09f]/30"
                      : !item.active
                      ? isLight
                        ? "bg-slate-100/60 border-slate-200 opacity-60"
                        : "bg-neutral-950/50 border-white/5 opacity-55"
                      : isLight
                      ? "bg-slate-50 border-slate-200"
                      : "bg-neutral-900/70 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-[#16b09f]"
                        title="Drag to reorder"
                      >
                        <RiDraggable className="w-4 h-4" />
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#16b09f]/15 text-[#16b09f] font-mono text-[10px] font-bold">
                        #{idx + 1}
                      </span>
                      {isLastActive ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[9px] font-bold truncate">
                          FINAL ({finalPair[0]} {finalPair[1]})
                        </span>
                      ) : item.active && words[activeOrder] ? (
                        <span className="text-[10px] font-mono text-neutral-400 truncate">
                          {words[activeOrder][0]} {words[activeOrder][1]}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleImageActive(idx)}
                        title={
                          item.active
                            ? tx("Nonaktifkan gambar", "Disable image")
                            : tx("Aktifkan gambar", "Enable image")
                        }
                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                          item.active
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-400 border-white/10"
                        }`}
                      >
                        {item.active ? (
                          <>
                            <RiEyeFill className="w-3 h-3" />
                            <span>ON</span>
                          </>
                        ) : (
                          <>
                            <RiEyeOffFill className="w-3 h-3" />
                            <span>OFF</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, -1)}
                        disabled={idx === 0}
                        className={`p-1 rounded border text-xs cursor-pointer disabled:opacity-30 ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-700"
                            : "bg-neutral-800 border-white/10 text-neutral-300"
                        }`}
                      >
                        <RiArrowUpLine className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 1)}
                        disabled={idx === imageItems.length - 1}
                        className={`p-1 rounded border text-xs cursor-pointer disabled:opacity-30 ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-700"
                            : "bg-neutral-800 border-white/10 text-neutral-300"
                        }`}
                      >
                        <RiArrowDownLine className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="p-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      >
                        <RiDeleteBinFill className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div
                    className="w-full h-32 rounded-lg bg-neutral-950 border border-white/10 bg-cover bg-center relative overflow-hidden"
                    style={{
                      backgroundImage: item.url
                        ? `url("${item.url}")`
                        : undefined,
                    }}
                  />

                  {/* Editable URL */}
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const val = e.target.value;
                      setImageItems((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, url: val } : it
                        )
                      );
                    }}
                    className={`w-full px-2.5 py-1 rounded-lg border text-[10px] font-mono focus:outline-none focus:border-[#16b09f] ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700"
                        : "bg-neutral-950 border-white/10 text-neutral-400"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Save & Reset Actions */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${
          isLight ? "border-slate-100" : "border-white/10"
        }`}
      >
        <button
          type="button"
          onClick={handleResetDefaults}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
              : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-white/10"
          }`}
        >
          <RiRestartFill className="w-3.5 h-3.5" />
          <span>{tx("Reset ke Default", "Reset to Default")}</span>
        </button>

        <button
          type="button"
          onClick={() => saveConfigToServer()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#16b09f] hover:bg-[#139b8c] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#16b09f]/25 transition-all cursor-pointer flex items-center gap-2"
        >
          {isSaving ? (
            <RiCheckFill className="w-4 h-4 animate-spin" />
          ) : (
            <RiSave3Fill className="w-4 h-4" />
          )}
          <span>
            {tx(
              "Simpan Konfigurasi Opener",
              "Save Opener Configuration"
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

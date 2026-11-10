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
  RiEditFill,
  RiCloseLine,
  RiDriveFill,
  RiComputerLine,
  RiImageEditFill,
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
  onClosePanel?: () => void;
}

const DEFAULT_IMAGE_ITEMS: AdminOpenerImageItem[] = OPENER_DEFAULTS.images.map(
  (url, idx) => ({
    id: `img-${idx + 1}`,
    url,
    active: true,
  })
);

interface EditingModalState {
  mode: "edit-stage" | "add-stage" | "edit-final" | "edit-gallery";
  index: number;
  leftWord: string;
  rightWord: string;
  imageUrl: string;
  sourceTab: "device" | "gdrive";
  gdriveInput: string;
}

export default function OpenerSettingsCard({
  isLight,
  tx,
  showToast,
  onPreviewOpener,
  onClosePanel,
}: OpenerSettingsCardProps) {
  const [words, setWords] = useState<[string, string][]>(OPENER_DEFAULTS.words);
  const [finalPair, setFinalPair] = useState<[string, string]>(
    OPENER_DEFAULTS.final
  );
  const [imageItems, setImageItems] =
    useState<AdminOpenerImageItem[]>(DEFAULT_IMAGE_ITEMS);

  // Snapshot data tersimpan untuk tombol Cancel
  const [savedSnapshot, setSavedSnapshot] = useState<{
    words: [string, string][];
    finalPair: [string, string];
    imageItems: AdminOpenerImageItem[];
  }>({
    words: OPENER_DEFAULTS.words,
    finalPair: OPENER_DEFAULTS.final,
    imageItems: DEFAULT_IMAGE_ITEMS,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Modal Edit / Tambah (Upload via Device / Google Drive, Hapus, Tambah, Cancel, Close)
  const [modalState, setModalState] = useState<EditingModalState | null>(null);
  const [modalUploading, setModalUploading] = useState(false);

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
          const loadedWords: [string, string][] =
            Array.isArray(data.words) && data.words.length > 0
              ? data.words.map((p: any) => [
                  String(p?.[0] ?? ""),
                  String(p?.[1] ?? ""),
                ])
              : OPENER_DEFAULTS.words;

          const loadedFinal: [string, string] =
            Array.isArray(data.final) && data.final.length >= 2
              ? [String(data.final[0]), String(data.final[1])]
              : OPENER_DEFAULTS.final;

          let loadedImages: AdminOpenerImageItem[] = DEFAULT_IMAGE_ITEMS;
          if (Array.isArray(data.imageItems) && data.imageItems.length > 0) {
            loadedImages = data.imageItems.map((it: any, idx: number) => ({
              id: String(it.id || `img-${idx + 1}`),
              url: String(it.url || ""),
              active: it.active !== false,
            }));
          } else if (Array.isArray(data.images) && data.images.length > 0) {
            loadedImages = data.images.map((u: string, idx: number) => ({
              id: `img-${idx + 1}`,
              url: u,
              active: true,
            }));
          }

          setWords(loadedWords);
          setFinalPair(loadedFinal);
          setImageItems(loadedImages);
          setSavedSnapshot({
            words: loadedWords,
            finalPair: loadedFinal,
            imageItems: loadedImages,
          });
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

  // Pastikan setiap tahap memiliki slot gambar di imageItems
  const ensureImageSlotAt = (
    items: AdminOpenerImageItem[],
    stageIdx: number,
    newUrl: string
  ): AdminOpenerImageItem[] => {
    const copy = [...items];
    while (copy.length <= stageIdx) {
      const fallbackUrl =
        OPENER_DEFAULTS.images[copy.length % OPENER_DEFAULTS.images.length];
      copy.push({
        id: `img-${Date.now()}-${copy.length}`,
        url: fallbackUrl,
        active: true,
      });
    }
    copy[stageIdx] = {
      ...copy[stageIdx],
      url: normalizeMediaUrl(newUrl.trim()),
      active: true,
    };
    return copy;
  };

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
      setSavedSnapshot({
        words: cleanedWords,
        finalPair: cleanedFinal,
        imageItems: cleanedImages,
      });

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

  // ==============================================================
  // MODAL HANDLERS: EDIT, UPLOAD (DEVICE / GOOGLE DRIVE), TAMBAH, HAPUS, CANCEL, CLOSE
  // ==============================================================
  const openEditStageModal = (idx: number) => {
    const pair = words[idx] || ["Motion", "Graphics"];
    const currentImg =
      imageItems[idx]?.url ||
      activeImages[idx % Math.max(1, activeImages.length)]?.url ||
      OPENER_DEFAULTS.images[idx % OPENER_DEFAULTS.images.length];
    const isGdrive =
      currentImg.includes("drive.google.com") ||
      currentImg.includes("googleusercontent.com");
    setModalState({
      mode: "edit-stage",
      index: idx,
      leftWord: pair[0],
      rightWord: pair[1],
      imageUrl: currentImg,
      sourceTab: isGdrive ? "gdrive" : "device",
      gdriveInput: currentImg,
    });
  };

  const openAddStageModal = () => {
    const defaultImg =
      OPENER_DEFAULTS.images[words.length % OPENER_DEFAULTS.images.length];
    setModalState({
      mode: "add-stage",
      index: words.length,
      leftWord: "",
      rightWord: "",
      imageUrl: defaultImg,
      sourceTab: "device",
      gdriveInput: "",
    });
  };

  const openEditFinalModal = () => {
    const lastImg =
      imageItems[imageItems.length - 1]?.url || "/sequence/frame_000000.webp";
    setModalState({
      mode: "edit-final",
      index: imageItems.length - 1,
      leftWord: finalPair[0],
      rightWord: finalPair[1],
      imageUrl: lastImg,
      sourceTab: "device",
      gdriveInput: lastImg,
    });
  };

  const openEditGalleryImageModal = (idx: number) => {
    const item = imageItems[idx];
    if (!item) return;
    const pairedWord = words[idx] || finalPair;
    setModalState({
      mode: "edit-gallery",
      index: idx,
      leftWord: pairedWord[0],
      rightWord: pairedWord[1],
      imageUrl: item.url,
      sourceTab:
        item.url.includes("drive.google") ||
        item.url.includes("googleusercontent")
          ? "gdrive"
          : "device",
      gdriveInput: item.url,
    });
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  const handleModalDeviceUpload = async (file?: File | null) => {
    if (!file || !modalState) return;
    setModalUploading(true);
    try {
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
        setModalState((prev) =>
          prev
            ? {
                ...prev,
                imageUrl: data.url,
                gdriveInput: data.url,
              }
            : null
        );
        showToast(
          tx(
            "Gambar berhasil diupload dari perangkat! Klik Simpan untuk menerapkan.",
            "Image uploaded from device! Click Save to apply."
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
      setModalUploading(false);
    }
  };

  const handleApplyModalSave = async () => {
    if (!modalState) return;
    const finalImgUrl = normalizeMediaUrl(
      (modalState.sourceTab === "gdrive"
        ? modalState.gdriveInput
        : modalState.imageUrl
      ).trim()
    );

    if (modalState.mode === "add-stage") {
      const left = modalState.leftWord.trim() || "Creative";
      const right = modalState.rightWord.trim() || "Design";
      const img =
        finalImgUrl ||
        OPENER_DEFAULTS.images[words.length % OPENER_DEFAULTS.images.length];

      const nextWords: [string, string][] = [...words, [left, right]];
      const nextImages: AdminOpenerImageItem[] = [
        ...imageItems.slice(0, words.length),
        { id: `img-${Date.now()}`, url: img, active: true },
        ...imageItems.slice(words.length),
      ];

      setWords(nextWords);
      setImageItems(nextImages);
      setModalState(null);
      await saveConfigToServer(nextWords, finalPair, nextImages);
      return;
    }

    if (modalState.mode === "edit-stage") {
      const idx = modalState.index;
      const left = modalState.leftWord.trim() || words[idx]?.[0] || "Motion";
      const right =
        modalState.rightWord.trim() || words[idx]?.[1] || "Graphics";
      const nextWords = words.map((pair, i) =>
        i === idx ? ([left, right] as [string, string]) : pair
      );
      const nextImages = finalImgUrl
        ? ensureImageSlotAt(imageItems, idx, finalImgUrl)
        : imageItems;

      setWords(nextWords);
      setImageItems(nextImages);
      setModalState(null);
      await saveConfigToServer(nextWords, finalPair, nextImages);
      return;
    }

    if (modalState.mode === "edit-final") {
      const left = modalState.leftWord.trim() || "Rizx";
      const right = modalState.rightWord.trim() || "Studio";
      const nextFinal: [string, string] = [left, right];
      let nextImages = [...imageItems];
      if (finalImgUrl) {
        if (nextImages.length === 0) {
          nextImages = [{ id: `img-final`, url: finalImgUrl, active: true }];
        } else {
          nextImages[nextImages.length - 1] = {
            ...nextImages[nextImages.length - 1],
            url: finalImgUrl,
            active: true,
          };
        }
      }
      setFinalPair(nextFinal);
      setImageItems(nextImages);
      setModalState(null);
      await saveConfigToServer(words, nextFinal, nextImages);
      return;
    }

    if (modalState.mode === "edit-gallery") {
      const idx = modalState.index;
      const nextImages = imageItems.map((it, i) =>
        i === idx && finalImgUrl ? { ...it, url: finalImgUrl } : it
      );
      setImageItems(nextImages);
      setModalState(null);
      await saveConfigToServer(words, finalPair, nextImages);
    }
  };

  const handleModalDelete = async () => {
    if (!modalState) return;
    if (modalState.mode === "edit-stage") {
      if (words.length <= 1) {
        showToast(
          tx(
            "Minimal harus ada 1 pasang kata pembuka.",
            "At least 1 opening word pair is required."
          )
        );
        return;
      }
      const idx = modalState.index;
      const nextWords = words.filter((_, i) => i !== idx);
      const nextImages =
        imageItems.length > 1
          ? imageItems.filter((_, i) => i !== idx)
          : imageItems;
      setWords(nextWords);
      setImageItems(nextImages);
      setModalState(null);
      await saveConfigToServer(nextWords, finalPair, nextImages);
      return;
    }

    if (modalState.mode === "edit-gallery") {
      if (imageItems.length <= 1) {
        showToast(
          tx(
            "Minimal harus ada 1 gambar dalam daftar Opener.",
            "At least 1 image is required in the Opener list."
          )
        );
        return;
      }
      const idx = modalState.index;
      const nextImages = imageItems.filter((_, i) => i !== idx);
      setImageItems(nextImages);
      setModalState(null);
      await saveConfigToServer(words, finalPair, nextImages);
    }
  };

  // Upload beberapa gambar ke galeri sekaligus
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
  const handleWordChange = (idx: number, side: 0 | 1, val: string) => {
    setWords((prev) =>
      prev.map((pair, i) => {
        if (i !== idx) return pair;
        return side === 0 ? [val, pair[1]] : [pair[0], val];
      })
    );
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

  const handleCancelChanges = () => {
    setWords(savedSnapshot.words);
    setFinalPair(savedSnapshot.finalPair);
    setImageItems(savedSnapshot.imageItems);
    setModalState(null);
    showToast(
      tx(
        "Perubahan dibatalkan — dikembalikan ke data tersimpan terakhir.",
        "Changes cancelled — restored to last saved state."
      )
    );
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
    imgs[imgs.length - 1] = "/sequence/frame_000000.webp";

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
  const resolvedModalPreviewUrl = modalState
    ? normalizeMediaUrl(
        (modalState.sourceTab === "gdrive"
          ? modalState.gdriveInput
          : modalState.imageUrl
        ).trim()
      )
    : "";

  return (
    <div
      className={`p-5 sm:p-7 rounded-2xl border space-y-6 relative ${
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
              "Klik tombol Edit atau thumbnail gambar pada setiap baris untuk mengganti/upload gambar melalui Device atau Google Drive, menambah, menghapus, atau membatalkan perubahan.",
              "Click Edit or the image thumbnail on any row to upload/replace images via Device or Google Drive, add, delete, or cancel changes."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openAddStageModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#16b09f] hover:bg-[#139b8c] text-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#16b09f]/20"
          >
            <RiAddFill className="w-4 h-4" />
            <span>{tx("Tambah", "Add")}</span>
          </button>

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

          {onClosePanel && (
            <button
              type="button"
              onClick={onClosePanel}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10"
              }`}
            >
              <RiCloseLine className="w-4 h-4" />
              <span>{tx("Close", "Close")}</span>
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
            className="absolute top-3 right-4 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono uppercase tracking-wider text-white cursor-pointer z-20 flex items-center gap-1"
          >
            <RiCloseLine className="w-3.5 h-3.5" />
            <span>{tx("Close Preview", "Close Preview")}</span>
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
          BAGIAN 1: PASANGAN KATA KIRI | GAMBAR | KANAN (KLIK EDIT / UPLOAD / HAPUS / TAMBAH)
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
                "1. Daftar Tahap Kata & Gambar ([Kiri] [Gambar] [Kanan])",
                "1. Word & Image Stages ([Left] [Image] [Right])"
              )}
            </h4>
            <p
              className={`text-xs ${
                isLight ? "text-slate-500" : "text-neutral-400"
              }`}
            >
              {tx(
                "Klik tombol Edit atau klik gambar kecil di tengah untuk mengupload gambar via Device / Google Drive.",
                "Click Edit or click the center thumbnail to upload an image via Device / Google Drive."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddStageModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] border border-[#16b09f]/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RiAddFill className="w-4 h-4" />
              <span>{tx("Tambah Tahap", "Add Stage")}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {words.map((pair, idx) => {
            const assignedImg =
              imageItems[idx]?.url ||
              (activeImages.length > 0
                ? activeImages[idx % activeImages.length]?.url
                : "");
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
                className={`p-3.5 rounded-xl border flex items-center gap-2 transition-all ${
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

                {/* Clickable Center Image Thumbnail (Opens Edit/Upload Modal) */}
                <button
                  type="button"
                  onClick={() => openEditStageModal(idx)}
                  title={tx(
                    "Klik untuk Edit / Upload Gambar (Device / Google Drive)",
                    "Click to Edit / Upload Image (Device / Google Drive)"
                  )}
                  className="group relative w-11 h-8 rounded-md bg-neutral-800 border border-white/20 hover:border-[#16b09f] shrink-0 bg-cover bg-center overflow-hidden cursor-pointer transition-all"
                  style={{
                    backgroundImage: assignedImg
                      ? `url("${assignedImg}")`
                      : undefined,
                  }}
                >
                  <span className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <RiImageEditFill className="w-3.5 h-3.5 text-[#16b09f]" />
                  </span>
                </button>

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

                {/* Action Buttons: Edit (Upload Device/GDrive), Up, Down, Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditStageModal(idx)}
                    title={tx(
                      "Edit & Upload Gambar (Device / Google Drive)",
                      "Edit & Upload Image (Device / Google Drive)"
                    )}
                    className="px-2 py-1 rounded-lg border border-[#16b09f]/40 bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RiEditFill className="w-3 h-3" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveWordPair(idx, -1)}
                    disabled={idx === 0}
                    title={tx("Geser naik", "Move up")}
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
                    title={tx("Geser turun", "Move down")}
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
                    title={tx("Hapus tahap", "Delete stage")}
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
                `TAHAP TERAKHIR (#${phasesCount}) — RIZX | STUDIO (PREVIEW WEB & ZOOM-OUT)`,
                `FINAL STAGE (#${phasesCount}) — RIZX | STUDIO (WEB PREVIEW & ZOOM-OUT)`
              )}
            </span>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? "text-slate-600" : "text-neutral-300"
              }`}
            >
              {tx(
                "Teks penutup utama (default: Rizx | Studio) sebelum kotak tengah membesar membuka website.",
                "Final closing word pair (default: Rizx | Studio) before the center box expands into the website."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={finalPair[0]}
              onChange={(e) => setFinalPair([e.target.value, finalPair[1]])}
              placeholder="Rizx"
              className={`w-24 sm:w-32 px-3 py-1.5 rounded-lg border text-xs font-bold text-right focus:outline-none focus:border-[#16b09f] ${
                isLight
                  ? "bg-white border-slate-200 text-slate-900"
                  : "bg-neutral-950 border-white/15 text-white"
              }`}
            />
            <button
              type="button"
              onClick={openEditFinalModal}
              title={tx("Edit tahap akhir", "Edit final stage")}
              className="group relative w-11 h-8 rounded bg-neutral-900 border border-[#16b09f] shrink-0 bg-cover bg-center overflow-hidden cursor-pointer"
              style={{
                backgroundImage: `url("/sequence/frame_000000.webp")`,
              }}
            >
              <span className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <RiEditFill className="w-3.5 h-3.5 text-[#16b09f]" />
              </span>
            </button>
            <input
              type="text"
              value={finalPair[1]}
              onChange={(e) => setFinalPair([finalPair[0], e.target.value])}
              placeholder="Studio"
              className={`w-24 sm:w-32 px-3 py-1.5 rounded-lg border text-xs font-bold text-left focus:outline-none focus:border-[#16b09f] ${
                isLight
                  ? "bg-white border-slate-200 text-slate-900"
                  : "bg-neutral-950 border-white/15 text-white"
              }`}
            />
            <button
              type="button"
              onClick={openEditFinalModal}
              className="px-2.5 py-1.5 rounded-lg border border-[#16b09f]/40 bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            >
              <RiEditFill className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==============================================================
          BAGIAN 2: GALERI GAMBAR OPENER (EDIT, UPLOAD DEVICE/GDRIVE, HAPUS, TAMBAH)
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
                "Kelola semua gambar: klik Edit pada kartu gambar untuk mengganti via Device / Google Drive, ubah urutan (drag & drop), aktif/nonaktifkan, atau hapus.",
                "Manage all images: click Edit on any card to replace via Device / Google Drive, drag & drop to reorder, enable/disable, or delete."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddStageModal}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] border border-[#16b09f]/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RiAddFill className="w-4 h-4" />
              <span>
                {tx(
                  "Tambah via Device / Google Drive",
                  "Add via Device / Google Drive"
                )}
              </span>
            </button>

            <label className="px-3.5 py-2 rounded-xl bg-[#16b09f] hover:bg-[#139b8c] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#16b09f]/20 transition-all">
              <RiUpload2Fill className="w-4 h-4" />
              <span>
                {isUploading
                  ? tx("Mengupload...", "Uploading...")
                  : tx("Upload Cepat (Device)", "Quick Upload (Device)")}
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
                      {item.active && words[activeOrder] ? (
                        <span className="text-[10px] font-mono text-neutral-400 truncate">
                          {words[activeOrder][0]} {words[activeOrder][1]}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditGalleryImageModal(idx)}
                        className="px-2 py-1 rounded-lg border border-[#16b09f]/40 bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RiEditFill className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleImageActive(idx)}
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
                        onClick={() => handleDeleteImage(idx)}
                        title={tx("Hapus gambar", "Delete image")}
                        className="p-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      >
                        <RiDeleteBinFill className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Preview (Clickable to open Edit Modal) */}
                  <div
                    onClick={() => openEditGalleryImageModal(idx)}
                    className="group w-full h-32 rounded-lg bg-neutral-950 border border-white/10 bg-cover bg-center relative overflow-hidden cursor-pointer"
                    style={{
                      backgroundImage: item.url
                        ? `url("${item.url}")`
                        : undefined,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <span className="px-3 py-1.5 rounded-lg bg-[#16b09f] text-black font-bold text-xs flex items-center gap-1">
                        <RiEditFill className="w-3.5 h-3.5" />
                        {tx("Ganti Gambar", "Replace Image")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==============================================================
          BOTTOM BAR: TAMBAH, RESET, CANCEL, CLOSE, SIMPAN
         ============================================================== */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${
          isLight ? "border-slate-100" : "border-white/10"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openAddStageModal}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] border border-[#16b09f]/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RiAddFill className="w-4 h-4" />
            <span>{tx("Tambah", "Add")}</span>
          </button>

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
            <span>{tx("Reset Default", "Reset Default")}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCancelChanges}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10"
            }`}
          >
            {tx("Cancel", "Cancel")}
          </button>

          {onClosePanel && (
            <button
              type="button"
              onClick={onClosePanel}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10"
              }`}
            >
              <RiCloseLine className="w-4 h-4" />
              <span>{tx("Close", "Close")}</span>
            </button>
          )}

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
              {tx("Simpan Konfigurasi Opener", "Save Opener Configuration")}
            </span>
          </button>
        </div>
      </div>

      {/* ==============================================================
          MODAL POPUP: EDIT / TAMBAH ITEM & UPLOAD GAMBAR (DEVICE / GOOGLE DRIVE)
          DILENGKAPI TOMBOL HAPUS, TAMBAH/SIMPAN, CANCEL, DAN CLOSE
         ============================================================== */}
      {modalState && (
        <div
          className="fixed inset-0 z-[10050] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-5 ${
              isLight
                ? "bg-white border-slate-200 text-slate-900"
                : "bg-[#11131a] border-white/15 text-white"
            }`}
          >
            {/* Modal Top Bar with Close Button */}
            <div className="flex items-center justify-between gap-3 border-b pb-3.5 border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#16b09f] font-bold block">
                  {modalState.mode === "add-stage"
                    ? tx("TAMBAH TAHAP OPENER BARU", "ADD NEW OPENER STAGE")
                    : modalState.mode === "edit-final"
                    ? tx("EDIT TAHAP AKHIR (RIZX STUDIO)", "EDIT FINAL STAGE")
                    : tx(
                        `EDIT TAHAP #${modalState.index + 1}`,
                        `EDIT STAGE #${modalState.index + 1}`
                      )}
                </span>
                <h4 className="text-base font-bold mt-0.5">
                  {modalState.mode === "add-stage"
                    ? tx(
                        "Tambah Kata & Upload Gambar",
                        "Add Words & Upload Image"
                      )
                    : tx(
                        "Edit Kata & Upload Gambar (Device / Google Drive)",
                        "Edit Words & Upload Image (Device / Google Drive)"
                      )}
                </h4>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                title="Close"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10"
                }`}
              >
                <RiCloseLine className="w-4 h-4" />
                <span>{tx("Close", "Close")}</span>
              </button>
            </div>

            {/* Word Inputs (Left | Right) */}
            {modalState.mode !== "edit-gallery" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                      isLight ? "text-slate-600" : "text-neutral-400"
                    }`}
                  >
                    {tx("Kata Kiri", "Left Word")}
                  </label>
                  <input
                    type="text"
                    value={modalState.leftWord}
                    onChange={(e) =>
                      setModalState({
                        ...modalState,
                        leftWord: e.target.value,
                      })
                    }
                    placeholder="Mis. Motion"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#16b09f] ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900"
                        : "bg-neutral-950 border-white/10 text-white"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                      isLight ? "text-slate-600" : "text-neutral-400"
                    }`}
                  >
                    {tx("Kata Kanan", "Right Word")}
                  </label>
                  <input
                    type="text"
                    value={modalState.rightWord}
                    onChange={(e) =>
                      setModalState({
                        ...modalState,
                        rightWord: e.target.value,
                      })
                    }
                    placeholder="Mis. Graphics"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#16b09f] ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900"
                        : "bg-neutral-950 border-white/10 text-white"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Source Selector Tabs: Upload Device vs Google Drive */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-black/30 border border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    setModalState({ ...modalState, sourceTab: "device" })
                  }
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    modalState.sourceTab === "device"
                      ? "bg-[#16b09f] text-black font-bold shadow"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <RiComputerLine className="w-4 h-4" />
                  <span>{tx("Upload dari Device", "Upload from Device")}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModalState({ ...modalState, sourceTab: "gdrive" })
                  }
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    modalState.sourceTab === "gdrive"
                      ? "bg-[#16b09f] text-black font-bold shadow"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <RiDriveFill className="w-4 h-4" />
                  <span>{tx("Google Drive / URL", "Google Drive / URL")}</span>
                </button>
              </div>

              {/* Tab 1: Upload Device */}
              {modalState.sourceTab === "device" && (
                <div className="space-y-2.5">
                  <label className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-[#16b09f]/40 hover:border-[#16b09f] bg-[#16b09f]/5 hover:bg-[#16b09f]/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                    <RiUpload2Fill className="w-6 h-6 text-[#16b09f]" />
                    <span className="text-xs font-bold text-[#16b09f]">
                      {modalUploading
                        ? tx(
                            "Sedang Mengupload ke Supabase Storage...",
                            "Uploading to Supabase Storage..."
                          )
                        : tx(
                            "Klik untuk Pilih Gambar dari Perangkat (HP / PC)",
                            "Click to Choose Image from Device (Phone / PC)"
                          )}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      JPG, PNG, WEBP — Tersimpan otomatis di Supabase Storage
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={modalUploading}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleModalDeviceUpload(f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Tab 2: Google Drive / Direct URL */}
              {modalState.sourceTab === "gdrive" && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {tx(
                      "Tempel Link Google Drive atau URL Gambar",
                      "Paste Google Drive Link or Image URL"
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={modalState.gdriveInput}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          gdriveInput: e.target.value,
                          imageUrl: normalizeMediaUrl(e.target.value),
                        })
                      }
                      placeholder="https://drive.google.com/file/d/.../view"
                      className={`flex-1 min-w-0 px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#16b09f] ${
                        isLight
                          ? "bg-slate-50 border-slate-200 text-slate-900"
                          : "bg-neutral-950 border-white/10 text-white"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-neutral-400">
                    {tx(
                      "Mendukung link share Google Drive (otomatis dikonversi ke direct CDN gambar resolusi penuh).",
                      "Supports Google Drive share links (automatically converted to direct full-res image CDN)."
                    )}
                  </p>
                </div>
              )}

              {/* Live Preview inside Modal */}
              <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center gap-3">
                <span className="keep-white text-sm sm:text-base font-bold text-white">
                  {modalState.leftWord || "Motion"}
                </span>
                <div
                  className="w-20 h-14 rounded-lg bg-neutral-900 border border-white/20 bg-cover bg-center shrink-0"
                  style={{
                    backgroundImage: resolvedModalPreviewUrl
                      ? `url("${resolvedModalPreviewUrl}")`
                      : undefined,
                  }}
                />
                <span className="keep-white text-sm sm:text-base font-bold text-white">
                  {modalState.rightWord || "Graphics"}
                </span>
              </div>
            </div>

            {/* Modal Bottom Action Bar: Hapus, Cancel, Close, Tambah/Simpan */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
              <div>
                {(modalState.mode === "edit-stage" ||
                  modalState.mode === "edit-gallery") && (
                  <button
                    type="button"
                    onClick={handleModalDelete}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RiDeleteBinFill className="w-4 h-4" />
                    <span>{tx("Hapus", "Delete")}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10"
                  }`}
                >
                  {tx("Cancel", "Cancel")}
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer flex items-center gap-1 transition-all ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10"
                  }`}
                >
                  <RiCloseLine className="w-4 h-4" />
                  <span>{tx("Close", "Close")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyModalSave}
                  disabled={modalUploading || isSaving}
                  className="px-4 py-2 rounded-xl bg-[#16b09f] hover:bg-[#139b8c] text-black font-bold text-xs shadow-lg shadow-[#16b09f]/25 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {modalState.mode === "add-stage" ? (
                    <>
                      <RiAddFill className="w-4 h-4" />
                      <span>{tx("Tambah & Simpan", "Add & Save")}</span>
                    </>
                  ) : (
                    <>
                      <RiSave3Fill className="w-4 h-4" />
                      <span>{tx("Simpan Perubahan", "Save Changes")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiTrash,
  HiArrowPath,
  HiCheckCircle,
  HiXMark,
  HiCloudArrowUp,
  HiLink,
  HiPhoto,
  HiFilm,
  HiPencilSquare,
  HiArrowUp,
  HiArrowDown,
  HiExclamationCircle,
  HiEye,
} from "react-icons/hi2";
import { SiFigma, SiYoutube, SiGoogledrive } from "react-icons/si";
import { usePortfolioData, extractYouTubeId, CanvasItem } from "@/context/PortfolioDataContext";
import { extractGoogleDriveFileId, normalizeMediaUrl } from "@/lib/mediaService";
import { useLang } from "@/context/LanguageContext";

interface CanvasWorkspaceProps {
  onOpenCanvasPreview?: () => void;
}

export default function CanvasWorkspace({ onOpenCanvasPreview }: CanvasWorkspaceProps) {
  const { clients, heroWorks, canvasItems, updateCanvasItems } = usePortfolioData();
  const { tr } = useLang();

  // Local state for editing sheets before saving
  const [items, setItems] = useState<CanvasItem[]>([]);
  const initialItemsRef = useRef<CanvasItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Adding / Editing Canvas Item
  const [mediaMode, setMediaMode] = useState<"upload" | "link">("upload");
  const [titleInput, setTitleInput] = useState("");
  const [subtitleInput, setSubtitleInput] = useState("");
  const [clientNameInput, setClientNameInput] = useState("");
  const [aspectInput, setAspectInput] = useState<string>("4:5");
  const [linkInput, setLinkInput] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [isVideoMedia, setIsVideoMedia] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Drag & drop state for the upload zone
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize items from context or fallback to client works
  useEffect(() => {
    let sourceItems: CanvasItem[] = [];

    if (canvasItems && canvasItems.length > 0) {
      sourceItems = [...canvasItems];
    } else {
      // Collect initial items from client deliverables
      (clients || []).forEach((c) => {
        (c.works || []).forEach((w: any) => {
          if (w.image || w.gdriveUrl || w.videoId) {
            sourceItems.push({
              id: w.id || `canvas-${c.id}-${Math.random().toString(36).substr(2, 6)}`,
              title: w.title || "Client Deliverable",
              type: w.type || c.category || "Digital Asset",
              image: normalizeMediaUrl(
                w.image || (w.videoId ? `https://img.youtube.com/vi/${w.videoId}/maxresdefault.jpg` : "")
              ),
              aspect: w.aspect || "4:5",
              clientName: c.clientName || "Client Vault",
              clientId: c.id,
              year: w.year || "2026",
              isVideo: Boolean(w.isVideo || w.videoId || w.mediaType === "video"),
              youtubeUrl: w.youtubeUrl || (w.videoId ? `https://www.youtube.com/watch?v=${w.videoId}` : ""),
              videoId: w.videoId,
              gdriveUrl: w.gdriveUrl,
              gdriveId: w.gdriveId,
              tools: w.tools || c.tools || [],
            });
          }
        });
      });

      // Append hero showcases if fewer than 4
      if (sourceItems.length < 4 && heroWorks?.deckCards) {
        heroWorks.deckCards.forEach((c: any, idx: number) => {
          sourceItems.push({
            id: c.id || `canvas-hero-${idx}`,
            title: c.title || `Curated Asset ${idx + 1}`,
            type: c.category || "Selected Work",
            image: normalizeMediaUrl(c.image),
            aspect: "1:1",
            clientName: "Selected Works",
            clientId: "hero",
            year: "2026",
            isVideo: false,
            tools: ["figma", "photoshop"],
          });
        });
      }
    }

    setItems(sourceItems);
    initialItemsRef.current = JSON.parse(JSON.stringify(sourceItems));
    setHasChanges(false);
  }, [canvasItems, clients, heroWorks]);

  // Mark changes when items differ from snapshot
  const updateItemsWithTracking = useCallback((newItems: CanvasItem[]) => {
    setItems(newItems);
    setHasChanges(true);
    setSaveSuccess(false);
  }, []);

  // Process and preview dropped or chosen media file
  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      setErrorMsg("Format file tidak didukung. Mohon gunakan gambar (PNG, JPG, WEBP, GIF) atau video (MP4, WEBM).");
      return;
    }

    // Auto-populate title if empty from clean file name
    if (!titleInput.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitleInput(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    setIsVideoMedia(isVideo);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setMediaPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag Over / Leave / Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Process Link input (YouTube, Google Drive, or Image URL)
  const handleLinkChange = (url: string) => {
    setLinkInput(url);
    setErrorMsg(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setMediaPreview("");
      setIsVideoMedia(false);
      return;
    }

    // 1. YouTube Link
    const ytId = extractYouTubeId(trimmed);
    if (ytId) {
      setIsVideoMedia(true);
      setMediaPreview(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`);
      if (!titleInput.trim()) setTitleInput("YouTube Video Reel");
      if (!aspectInput) setAspectInput("16:9");
      return;
    }

    // 2. Google Drive Link
    const driveId = extractGoogleDriveFileId(trimmed);
    if (driveId) {
      setIsVideoMedia(true);
      setMediaPreview(`https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`);
      if (!titleInput.trim()) setTitleInput("Google Drive Showcase");
      return;
    }

    // 3. Direct Image or Video Link
    if (trimmed.match(/\.(mp4|webm|mov)(\?.*)?$/i)) {
      setIsVideoMedia(true);
      setMediaPreview(trimmed);
    } else {
      setIsVideoMedia(false);
      setMediaPreview(trimmed);
    }
  };

  // Reset Add/Edit Form
  const resetForm = () => {
    setTitleInput("");
    setSubtitleInput("");
    setClientNameInput("");
    setAspectInput("4:5");
    setLinkInput("");
    setMediaPreview("");
    setIsVideoMedia(false);
    setEditingItemId(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Save new item or update existing item
  const handleSaveItem = () => {
    if (!titleInput.trim()) {
      setErrorMsg("Mohon masukkan Judul Text untuk karya canvas.");
      return;
    }

    if (!mediaPreview && !linkInput) {
      setErrorMsg("Mohon upload file gambar/video atau masukkan link.");
      return;
    }

    const ytId = extractYouTubeId(linkInput);
    const gdriveId = extractGoogleDriveFileId(linkInput);

    if (editingItemId) {
      // Update existing item
      const updated = items.map((item) => {
        if (item.id === editingItemId) {
          return {
            ...item,
            title: titleInput.trim(),
            type: subtitleInput.trim() || item.type,
            clientName: clientNameInput.trim() || item.clientName,
            aspect: aspectInput,
            image: mediaPreview || item.image,
            isVideo: isVideoMedia,
            youtubeUrl: ytId ? linkInput : item.youtubeUrl,
            videoId: ytId || item.videoId,
            gdriveUrl: gdriveId ? linkInput : item.gdriveUrl,
            gdriveId: gdriveId || item.gdriveId,
          };
        }
        return item;
      });
      updateItemsWithTracking(updated);
    } else {
      // Add new item to beginning of canvas
      const newItem: CanvasItem = {
        id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: titleInput.trim(),
        type: subtitleInput.trim() || "Canvas Showcase",
        clientName: clientNameInput.trim() || "Studio Work",
        aspect: aspectInput,
        image: mediaPreview,
        isVideo: isVideoMedia,
        mediaType: ytId ? "youtube" : gdriveId ? "gdrive" : isVideoMedia ? "upload" : "image",
        youtubeUrl: ytId ? linkInput : undefined,
        videoId: ytId || undefined,
        gdriveUrl: gdriveId ? linkInput : undefined,
        gdriveId: gdriveId || undefined,
        year: new Date().getFullYear().toString(),
        tools: ["figma", "pure-ref"],
      };
      updateItemsWithTracking([newItem, ...items]);
    }

    resetForm();
  };

  // Open Edit Mode for an existing item
  const handleEditItem = (item: CanvasItem) => {
    setEditingItemId(item.id);
    setTitleInput(item.title);
    setSubtitleInput(item.type || "");
    setClientNameInput(item.clientName || "");
    setAspectInput(item.aspect || "4:5");
    setMediaPreview(item.image);
    setIsVideoMedia(Boolean(item.isVideo));
    setLinkInput(item.youtubeUrl || item.gdriveUrl || "");
    if (item.youtubeUrl || item.gdriveUrl) {
      setMediaMode("link");
    } else {
      setMediaMode("upload");
    }
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete an item from canvas
  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    updateItemsWithTracking(updated);
    if (editingItemId === id) resetForm();
  };

  // Move item up / down
  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    updateItemsWithTracking(newItems);
  };

  // Cancel action: Discard uncommitted changes
  const handleCancelChanges = () => {
    setItems(JSON.parse(JSON.stringify(initialItemsRef.current)));
    setHasChanges(false);
    resetForm();
    setErrorMsg(null);
  };

  // Save changes action: Persist to Supabase & localStorage
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateCanvasItems(items);
      initialItemsRef.current = JSON.parse(JSON.stringify(items));
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg("Gagal menyimpan data canvas. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090a] text-white overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
      {/* ── Top Header & Global Actions ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-black flex items-center justify-center text-sm font-black shadow-md">
              🎨
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Canvas Board Manager</h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              PureRef & Figma Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Kelola lembaran karya pada canvas (zoom & pan infinite board). Masukkan foto/video via drag & drop atau link YouTube/Drive.
          </p>
        </div>

        {/* Global Save / Cancel Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {hasChanges && (
            <button
              type="button"
              onClick={handleCancelChanges}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <HiXMark className="w-4 h-4 text-neutral-400" />
              <span>Batal (Cancel)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || !hasChanges}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              hasChanges
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:opacity-95 shadow-teal-500/20 scale-100"
                : "bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <HiArrowPath className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <HiCheckCircle className="w-4 h-4" />
                <span>Save Changes & Update Web</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {saveSuccess && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <HiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>✓ Perubahan Canvas Berhasil Disimpan & Live di Website!</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <HiExclamationCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Section 1: Add / Edit Canvas Sheet Form ────────────────────────────── */}
      <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#0f1115] border border-white/10 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
              {editingItemId ? "✎" : "+"}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {editingItemId ? "Edit Judul & Media Lembaran Canvas" : "Tambah Lembaran Karya ke Canvas"}
            </h2>
          </div>
          {editingItemId && (
            <button
              onClick={resetForm}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Batalkan Edit (Kembali ke Tambah Baru)
            </button>
          )}
        </div>

        {/* Input Mode Selector: Upload Drag & Drop vs Link */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5 max-w-md mb-5">
          <button
            type="button"
            onClick={() => setMediaMode("upload")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mediaMode === "upload"
                ? "bg-white/10 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <HiCloudArrowUp className="w-4 h-4 text-teal-400" />
            <span>Upload / Drag & Drop</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaMode("link")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mediaMode === "link"
                ? "bg-white/10 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <HiLink className="w-4 h-4 text-teal-400" />
            <span>Link (YouTube / Drive)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Media Drop Area / Link Input & Live Preview */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {mediaMode === "upload" ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group ${
                  isDragOver
                    ? "border-teal-400 bg-teal-500/10 scale-[1.01]"
                    : mediaPreview
                    ? "border-white/20 bg-black/50"
                    : "border-white/15 bg-white/[0.02] hover:border-teal-400/50 hover:bg-white/[0.04]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleProcessFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {mediaPreview ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <div className="w-full max-h-48 overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
                      {isVideoMedia ? (
                        <div className="relative w-full flex items-center justify-center">
                          {mediaPreview.startsWith("data:video") || mediaPreview.endsWith(".mp4") ? (
                            <video src={mediaPreview} controls className="max-h-48 w-auto rounded-lg" />
                          ) : (
                            <img src={mediaPreview} alt="Preview" className="max-h-48 w-auto object-contain" />
                          )}
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-teal-400 text-[10px] font-mono font-bold flex items-center gap-1">
                            <HiFilm className="w-3 h-3" /> VIDEO
                          </span>
                        </div>
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="max-h-48 w-auto object-contain" />
                      )}
                    </div>
                    <p className="text-[11px] text-teal-400 mt-2 font-mono">
                      Klik atau Drag file baru untuk mengganti media
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <HiCloudArrowUp className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white mb-1">
                      Drag & Drop File Gambar atau Video ke Sini
                    </p>
                    <p className="text-[11px] text-neutral-400 mb-3">
                      Mendukung PNG, JPG, WEBP, GIF, atau MP4/MOV
                    </p>
                    <span className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors">
                      Pilih File dari Device
                    </span>
                  </>
                )}
              </div>
            ) : (
              /* Link Mode */
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <HiLink className="w-4 h-4 text-teal-400" />
                    <span>URL / Link YouTube atau Google Drive</span>
                  </label>
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    placeholder="Contoh: https://www.youtube.com/watch?v=... atau link Drive"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <SiYoutube className="w-3 h-3 text-red-500" /> YouTube
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <SiGoogledrive className="w-3 h-3 text-emerald-400" /> Google Drive
                    </span>
                  </div>
                </div>

                {mediaPreview && (
                  <div className="relative w-full h-44 overflow-hidden rounded-2xl border border-white/10 bg-black flex items-center justify-center">
                    <img src={mediaPreview} alt="Link Preview" className="max-h-44 w-auto object-contain" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono border border-white/10">
                      Thumbnail Preview
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Title, Subtitle, Aspect Ratio, Client & Add Button */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            <div className="space-y-3.5">
              {/* Judul Text Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Judul Text Karya <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Contoh: Byru HRIS - Mobile App 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              {/* Subtitle / Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Kategori / Sub-judul
                  </label>
                  <input
                    type="text"
                    value={subtitleInput}
                    onChange={(e) => setSubtitleInput(e.target.value)}
                    placeholder="Contoh: Digital Product Advertising"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Nama Klien / Tag
                  </label>
                  <input
                    type="text"
                    value={clientNameInput}
                    onChange={(e) => setClientNameInput(e.target.value)}
                    placeholder="Contoh: BYRU - HRIS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Format Ukuran Frame (Aspect Ratio)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "4:5", name: "Poster" },
                    { label: "16:9", name: "Landscape" },
                    { label: "1:1", name: "Square" },
                    { label: "9:16", name: "Story/Reel" },
                  ].map((ratio) => (
                    <button
                      key={ratio.label}
                      type="button"
                      onClick={() => setAspectInput(ratio.label)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        aspectInput === ratio.label
                          ? "border-teal-400 bg-teal-500/15 text-white shadow-sm"
                          : "border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{ratio.label}</div>
                      <div className="text-[10px] text-neutral-400">{ratio.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: Add Item & Reset */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10"
              >
                <HiPlus className="w-4 h-4" />
                <span>{editingItemId ? "Perbarui Lembaran Canvas" : "+ Tambah Lembaran ke Canvas"}</span>
              </button>

              {(titleInput || mediaPreview || linkInput || editingItemId) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Reset Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Canvas Sheets Gallery (List, Reorder, Delete, Inline Edit) ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white">
              Daftar Lembaran Karya di Canvas ({items.length} Sheets)
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {hasChanges ? "⚠️ Perubahan belum disimpan" : "✓ Tersinkronisasi"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0f1115] border border-white/5 text-center flex flex-col items-center">
            <span className="text-4xl mb-3">🎨</span>
            <p className="text-sm font-semibold text-white">Belum Ada Lembaran di Canvas</p>
            <p className="text-xs text-neutral-400 max-w-sm mt-1">
              Gunakan form di atas untuk memasukkan karya pertama melalui upload file drag & drop atau link.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#0f1115] border border-white/10 hover:border-teal-400/40 transition-all flex flex-col overflow-hidden shadow-md"
              >
                {/* Media Thumbnail Container with Chosen Aspect Ratio */}
                <div
                  className="relative w-full overflow-hidden bg-black/60 flex items-center justify-center"
                  style={{
                    aspectRatio:
                      item.aspect === "16:9"
                        ? "16/9"
                        : item.aspect === "1:1"
                        ? "1/1"
                        : item.aspect === "9:16"
                        ? "9/16"
                        : "4/5",
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-neutral-600 text-xs font-mono">No Media</div>
                  )}

                  {/* Badges on Top */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-mono text-[9px] font-bold border border-white/10">
                      {item.aspect || "4:5"}
                    </span>
                    {item.isVideo && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-500/80 backdrop-blur-md text-black font-mono text-[9px] font-black flex items-center gap-1">
                        <HiFilm className="w-2.5 h-2.5" /> VIDEO
                      </span>
                    )}
                  </div>

                  {/* Reorder and Delete Quick Floating Toolbar */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-xl p-1 border border-white/10 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => handleMoveItem(idx, "up")}
                      disabled={idx === 0}
                      title="Geser ke Kiri/Atas"
                      className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <HiArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveItem(idx, "down")}
                      disabled={idx === items.length - 1}
                      title="Geser ke Kanan/Bawah"
                      className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <HiArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Hapus Lembaran Ini"
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Info & Inline Actions */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-xs text-white line-clamp-1 group-hover:text-teal-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                      {item.type || item.clientName || "Canvas Asset"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-neutral-500">
                      #{idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditItem(item)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 cursor-pointer"
                      >
                        <HiPencilSquare className="w-3.5 h-3.5" />
                        <span>Edit Judul</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-[11px] font-semibold text-neutral-500 hover:text-red-400 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar when changes exist */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#0f1115]/95 border border-teal-500/40 shadow-2xl backdrop-blur-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Ada perubahan canvas yang belum disimpan</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelChanges}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

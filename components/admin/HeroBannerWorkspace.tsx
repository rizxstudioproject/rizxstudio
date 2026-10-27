"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSparklingFill,
  RiMovieFill,
  RiFolderMusicFill,
  RiYoutubeFill,
  RiDriveFill,
  RiImageFill,
  RiAddLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiCheckLine,
  RiPlayFill,
  RiPauseFill,
  RiUpload2Line,
  RiExchangeLine,
  RiEyeLine,
  RiSpeedUpLine,
  RiCompass3Fill,
  RiEditLine,
  RiLink,
  RiCloseLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import {
  usePortfolioData,
  defaultHeroBannerData,
  defaultPortfolioRunnerData,
  extractYouTubeId,
  extractGoogleDriveId,
  PortfolioRunnerItem,
} from "@/context/PortfolioDataContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";
import { normalizeMediaUrl, getMediaFallbackUrls } from "@/lib/mediaService";
import {
  saveCustomFramesToDB,
  clearCustomFramesFromDB,
} from "@/lib/sequenceStorage";

interface HeroBannerWorkspaceProps {
  initialTab?: "hero" | "showcase" | "reels";
  showToast?: (type: "success" | "error" | "info", title: string, message: string) => void;
}

export default function HeroBannerWorkspace({
  initialTab = "hero",
  showToast,
}: HeroBannerWorkspaceProps) {
  const { lang, tr } = useLang();
  const { themeMode, primaryColor } = useMotionTheme();
  const isLight = themeMode === "light";

  const {
    heroBanner,
    updateHeroBannerData,
    stage3,
    updateStage3Video,
    portfolioRunner,
    updatePortfolioRunnerData,
    addPortfolioRunnerItem,
    editPortfolioRunnerItem,
    deletePortfolioRunnerItem,
    resetPortfolioRunner,
  } = usePortfolioData();

  // Active Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<"hero" | "showcase" | "reels">(initialTab);

  // Sync initialTab if changed
  useEffect(() => {
    if (initialTab) setActiveSubTab(initialTab);
  }, [initialTab]);

  // Toast helper
  const notify = (type: "success" | "error" | "info", title: string, msg: string) => {
    if (showToast) {
      showToast(type, title, msg);
    }
  };

  // ==============================================================
  // 1. HERO BANNER & 3D SEQUENCE STATES
  // ==============================================================
  const [hbName, setHbName] = useState(heroBanner?.name || defaultHeroBannerData.name);
  const [hbNameColor, setHbNameColor] = useState(heroBanner?.nameColor || defaultHeroBannerData.nameColor || "#ffffff");
  const [hbRole, setHbRole] = useState(heroBanner?.role || defaultHeroBannerData.role);
  const [hbRoleColor, setHbRoleColor] = useState(heroBanner?.roleColor || defaultHeroBannerData.roleColor || "#16b09f");
  const [hbScrollText, setHbScrollText] = useState(heroBanner?.scrollText || defaultHeroBannerData.scrollText);
  const [hbScrollTextColor, setHbScrollTextColor] = useState(heroBanner?.scrollTextColor || defaultHeroBannerData.scrollTextColor || "#a3a3a3");

  const [hbSeqMode, setHbSeqMode] = useState<"default" | "folder" | "custom">(heroBanner?.sequenceMode || "default");
  const [hbSeqTotal, setHbSeqTotal] = useState(heroBanner?.sequenceTotalFrames || 108);
  const [hbSeqFolder, setHbSeqFolder] = useState(heroBanner?.sequenceFolder || "/sequence");
  const [hbSeqPattern, setHbSeqPattern] = useState(heroBanner?.sequencePattern || "frame_{padded}.webp");
  const [hbSeqPadding, setHbSeqPadding] = useState(heroBanner?.sequencePadding || 6);
  const [hbSeqMouseTracking, setHbSeqMouseTracking] = useState(heroBanner?.sequenceMouseTracking !== false);
  const [hbSeqMouseIntensity, setHbSeqMouseIntensity] = useState(heroBanner?.sequenceMouseIntensity || 26);

  // Interactive sequence scrubber in Admin
  const [seqScrubIdx, setSeqScrubIdx] = useState(0);
  const [seqIsAutoPlaying, setSeqIsAutoPlaying] = useState(false);
  const [seqSelectedFiles, setSeqSelectedFiles] = useState<File[]>([]);
  const [seqPreviewUrls, setSeqPreviewUrls] = useState<string[]>([]);
  const [seqIsUploading, setSeqIsUploading] = useState(false);
  const seqFileInputRef = useRef<HTMLInputElement>(null);

  // Sync heroBanner context changes
  useEffect(() => {
    if (heroBanner) {
      setHbName(heroBanner.name || defaultHeroBannerData.name);
      setHbNameColor(heroBanner.nameColor || "#ffffff");
      setHbRole(heroBanner.role || defaultHeroBannerData.role);
      setHbRoleColor(heroBanner.roleColor || "#16b09f");
      setHbScrollText(heroBanner.scrollText || defaultHeroBannerData.scrollText);
      setHbScrollTextColor(heroBanner.scrollTextColor || "#a3a3a3");
      setHbSeqMode(heroBanner.sequenceMode || "default");
      setHbSeqTotal(heroBanner.sequenceTotalFrames || 108);
      setHbSeqFolder(heroBanner.sequenceFolder || "/sequence");
      setHbSeqPattern(heroBanner.sequencePattern || "frame_{padded}.webp");
      setHbSeqPadding(heroBanner.sequencePadding || 6);
      setHbSeqMouseTracking(heroBanner.sequenceMouseTracking !== false);
      setHbSeqMouseIntensity(heroBanner.sequenceMouseIntensity || 26);
    }
  }, [heroBanner]);

  // Compute active preview frames
  const activeScrubberFrames = React.useMemo(() => {
    if (seqPreviewUrls.length > 0) return seqPreviewUrls;
    if (heroBanner?.sequenceCustomFrames && heroBanner.sequenceCustomFrames.length > 0) {
      return heroBanner.sequenceCustomFrames;
    }
    const frames: string[] = [];
    const total = Math.min(hbSeqTotal || 108, 150);
    const folder = hbSeqFolder || "/sequence";
    const pattern = hbSeqPattern || "frame_{padded}.webp";
    const pad = hbSeqPadding || 6;
    for (let i = 0; i < total; i++) {
      const padded = String(i).padStart(pad, "0");
      frames.push(`${folder}/${pattern.replace("{padded}", padded).replace("{index}", String(i))}`);
    }
    return frames;
  }, [seqPreviewUrls, heroBanner?.sequenceCustomFrames, hbSeqTotal, hbSeqFolder, hbSeqPattern, hbSeqPadding]);

  // Autoplay effect for Scrubber
  useEffect(() => {
    if (!seqIsAutoPlaying || activeScrubberFrames.length === 0) return;
    const interval = setInterval(() => {
      setSeqScrubIdx((prev) => (prev + 1) % activeScrubberFrames.length);
    }, 60);
    return () => clearInterval(interval);
  }, [seqIsAutoPlaying, activeScrubberFrames]);

  const handleSaveHeroBannerText = async () => {
    try {
      await updateHeroBannerData({
        name: hbName.trim() || defaultHeroBannerData.name,
        nameColor: hbNameColor,
        role: hbRole.trim() || defaultHeroBannerData.role,
        roleColor: hbRoleColor,
        scrollText: hbScrollText.trim() || defaultHeroBannerData.scrollText,
        scrollTextColor: hbScrollTextColor,
        sequenceMouseTracking: hbSeqMouseTracking,
        sequenceMouseIntensity: hbSeqMouseIntensity,
      });
      notify("success", tr("Tersimpan!", "Saved!", "Tasimpan!"), tr("Identitas Hero Banner berhasil diperbarui.", "Hero Banner details updated successfully.", "Identitas Hero Banner barasil dipabarui."));
    } catch (e) {
      notify("error", tr("Gagal", "Failed", "Gagal"), tr("Gagal menyimpan Hero Banner.", "Failed to save Hero Banner.", "Gagal manyimpan Hero Banner."));
    }
  };

  const handleSelectBatchFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    const sorted = [...files].sort((a, b) => collator.compare(a.name, b.name));

    seqPreviewUrls.forEach((u) => {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    });

    const objectUrls = sorted.map((f) => URL.createObjectURL(f));
    setSeqSelectedFiles(sorted);
    setSeqPreviewUrls(objectUrls);
    setSeqScrubIdx(0);
    notify("info", tr("File Dipilih", "Files Selected", "File Dipiliah"), tr(`${sorted.length} frame dipilih. Silakan coba slider lalu klik Terapkan.`, `${sorted.length} frames selected. Review via slider, then click Apply.`, `${sorted.length} frame dipiliah.`));
  };

  const handleApplyCustomBatch = async () => {
    if (seqSelectedFiles.length === 0) return;
    setSeqIsUploading(true);
    try {
      const formData = new FormData();
      seqSelectedFiles.forEach((f) => formData.append("files", f));
      const res = await fetch("/api/admin/sequence-upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.urls) {
        await saveCustomFramesToDB(data.urls);
        await updateHeroBannerData({
          sequenceMode: "custom",
          sequenceTotalFrames: data.totalFrames,
          sequenceFolder: data.folder,
          sequencePattern: data.pattern,
          sequenceCustomFrames: data.urls,
        });
        setHbSeqMode("custom");
        notify("success", tr("Sequence Berhasil!", "Sequence Applied!", "Sequence Barasil!"), tr(`${data.totalFrames} frame sequence aktif.`, `${data.totalFrames} frames active in sequence.`, `${data.totalFrames} frame sequence aktif.`));
      }
    } catch (err) {
      notify("error", tr("Upload Gagal", "Upload Failed", "Upload Gagal"), tr("Gagal mengupload file sequence.", "Failed to upload sequence frames.", "Gagal mengupload file sequence."));
    } finally {
      setSeqIsUploading(false);
    }
  };

  // ==============================================================
  // 2. STAGE 3 (FLAGSHIP MEDIA SHOWCASE) STATES
  // ==============================================================
  const [flagshipMediaType, setFlagshipMediaType] = useState<"youtube" | "gdrive" | "image">(
    stage3?.heroCard?.mediaType ||
      (stage3?.heroCard?.gdriveId || stage3?.heroCard?.gdriveUrl
        ? "gdrive"
        : stage3?.heroCard?.videoId || stage3?.heroCard?.youtubeUrl
        ? "youtube"
        : "image")
  );

  const [videoUrlInput, setVideoUrlInput] = useState(
    stage3?.heroCard?.youtubeUrl || (stage3?.heroCard?.videoId ? `https://www.youtube.com/watch?v=${stage3.heroCard.videoId}` : "")
  );
  const [flagshipGDriveUrl, setFlagshipGDriveUrl] = useState(
    stage3?.heroCard?.gdriveUrl || (stage3?.heroCard?.gdriveId ? `https://drive.google.com/file/d/${stage3.heroCard.gdriveId}/view` : "")
  );
  const [flagshipImageUrl, setFlagshipImageUrl] = useState(stage3?.heroCard?.image || "");
  const [videoTitle, setVideoTitle] = useState(stage3?.heroCard?.title || "From Visual Craft to Technology");
  const [videoCategory, setVideoCategory] = useState(stage3?.heroCard?.category || "VISUAL CRAFT | DIGITAL | AI");
  const [videoHeadline, setVideoHeadline] = useState(stage3?.headline || "A journey shaped by creativity and change.");
  const [videoClassTag, setVideoClassTag] = useState(stage3?.classTag || "CREATIVE JOURNEY | 2012 TO PRESENT");
  const [videoDescription, setVideoDescription] = useState(
    stage3?.heroCard?.description ||
      "A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology."
  );
  const [videoEnabled, setVideoEnabled] = useState(stage3?.heroCard?.isVideoEnabled !== false);

  const previewYouTubeId = extractYouTubeId(videoUrlInput);
  const previewGDriveId = extractGoogleDriveId(flagshipGDriveUrl);

  const handleSaveShowcase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const ytId = extractYouTubeId(videoUrlInput);
      const gdId = extractGoogleDriveId(flagshipGDriveUrl);

      await updateStage3Video({
        mediaType: flagshipMediaType,
        youtubeUrl: videoUrlInput.trim(),
        videoId: ytId,
        gdriveUrl: flagshipGDriveUrl.trim(),
        gdriveId: gdId,
        image: flagshipImageUrl.trim(),
        title: videoTitle.trim(),
        category: videoCategory.trim(),
        description: videoDescription.trim(),
        headline: videoHeadline.trim(),
        classTag: videoClassTag.trim(),
        isVideoEnabled: videoEnabled,
      });

      notify(
        "success",
        tr("Showcase Tersimpan!", "Showcase Saved!", "Showcase Tasimpan!"),
        tr("Pengaturan Media Showcase Stage 3 berhasil diperbarui.", "Media Showcase Stage 3 updated successfully.", "Pengaturan Media Showcase Stage 3 barasil diperbarui.")
      );
    } catch (err) {
      notify("error", tr("Gagal", "Failed", "Gagal"), tr("Gagal menyimpan showcase.", "Failed to save showcase.", "Gagal manyimpan showcase."));
    }
  };

  // ==============================================================
  // 3. MEDIA REELS (RUNNING PORTOFOLIO) STATES
  // ==============================================================
  const [runnerTitle, setRunnerTitle] = useState(portfolioRunner?.title || "SELECTED WORKS");
  const [runnerSpeedRow1, setRunnerSpeedRow1] = useState(portfolioRunner?.speedRow1 || 85);
  const [runnerSpeedRow2, setRunnerSpeedRow2] = useState(portfolioRunner?.speedRow2 || 95);
  const [runnerPauseOnHover, setRunnerPauseOnHover] = useState(portfolioRunner?.pauseOnHover !== false);

  // New item form
  const [newRunnerTitle, setNewRunnerTitle] = useState("");
  const [newRunnerCategory, setNewRunnerCategory] = useState("");
  const [newRunnerImage, setNewRunnerImage] = useState("");
  const [newRunnerLink, setNewRunnerLink] = useState("");
  const [newRunnerRow, setNewRunnerRow] = useState<1 | 2>(1);
  const [editingRunnerItem, setEditingRunnerItem] = useState<PortfolioRunnerItem | null>(null);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [filterRunnerRow, setFilterRunnerRow] = useState<0 | 1 | 2>(0); // 0 = all

  const handleSaveRunnerSettings = async () => {
    try {
      await updatePortfolioRunnerData({
        title: runnerTitle.trim() || "SELECTED WORKS",
        speedRow1: runnerSpeedRow1,
        speedRow2: runnerSpeedRow2,
        pauseOnHover: runnerPauseOnHover,
      });
      notify("success", tr("Tersimpan!", "Saved!", "Tasimpan!"), tr("Kecepatan & setelan Media Reels berhasil disimpan.", "Media Reels settings saved successfully.", "Setelan Media Reels barasil disimpan."));
    } catch (e) {
      notify("error", tr("Gagal", "Failed", "Gagal"), tr("Gagal menyimpan Media Reels.", "Failed to save Media Reels.", "Gagal manyimpan Media Reels."));
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleAddRunnerItem = async () => {
    const finalTitle = newRunnerTitle.trim() || newRunnerCategory.trim() || "Creative Work";
    const finalImage = normalizeMediaUrl(newRunnerImage.trim());

    if (!finalImage) {
      notify(
        "error",
        tr("Gambar Belum Dipilih", "Image Required", "Gambar Balun Dipiliah"),
        tr("Mohon pilih atau upload gambar karya terlebih dahulu.", "Please select or upload a work image.", "Pilih atau upload gambar karya talabiah dahulu.")
      );
      return;
    }
    try {
      await addPortfolioRunnerItem({
        title: finalTitle,
        category: newRunnerCategory.trim() || "Creative Work",
        image: finalImage,
        row: newRunnerRow,
        link: newRunnerLink.trim() || undefined,
      });
      setNewRunnerTitle("");
      setNewRunnerCategory("");
      setNewRunnerImage("");
      setNewRunnerLink("");
      notify(
        "success",
        tr("Karya Ditambahkan!", "Item Added!", "Karya Ditambah!"),
        tr(`"${finalTitle}" berhasil masuk ke strip Running Portofolio Baris ${newRunnerRow} & langsung aktif di web!`, `"${finalTitle}" added to Running Portfolio Row ${newRunnerRow} & live on public web!`, `"${finalTitle}" barasil masuak ka Running Portofolio!`)
      );
    } catch (e) {
      notify("error", tr("Gagal", "Failed", "Gagal"), tr("Gagal menambahkan karya.", "Failed to add item.", "Gagal manambah karya."));
    }
  };

  const handleUploadSingleImage = async (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-fill title if empty from filename
    if (!newRunnerTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewRunnerTitle(nameWithoutExt);
    }

    // 1. Try direct upload to Supabase Storage via /api/admin/media-upload for a permanent CDN link
    try {
      setIsUploadingImage(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "works/runner");
      const res = await fetch("/api/admin/media-upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        cb(data.url);
        setIsUploadingImage(false);
        notify("success", tr("Upload Berhasil", "Upload Success", "Upload Barasil"), tr("Gambar berhasil di-upload ke Supabase CDN.", "Image uploaded to CDN.", "Gambar di-upload."));
        return;
      }
    } catch (err) {
      console.warn("Storage upload fallback to compressed canvas:", err);
    } finally {
      setIsUploadingImage(false);
    }

    // 2. Fallback: Compress via Canvas to max 1000px, WebP quality 0.82 to avoid localStorage quota overflow
    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = event.target?.result as string;
      if (!raw) return;
      const img = new Image();
      img.onload = () => {
        const maxW = 1000;
        const maxH = 1250;
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/webp", 0.82);
          cb(compressed);
        } else {
          cb(raw);
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  };

  const runnerItems = portfolioRunner?.items || defaultPortfolioRunnerData.items;
  const filteredRunnerItems = runnerItems.filter((i) => {
    if (filterRunnerRow === 0) return true;
    return i.row === filterRunnerRow;
  });

  return (
    <div className="px-4 sm:px-6 py-6 pb-32 max-w-5xl mx-auto space-y-6">
      {/* ==============================================================
          SEGMENTED SUB-TABS: HERO BANNER | MEDIA SHOWCASE | MEDIA REELS
         ============================================================== */}
      <div
        className={`p-1.5 rounded-2xl border backdrop-blur-xl flex items-center gap-1.5 overflow-x-auto shadow-sm select-none ${
          isLight ? "bg-white/90 border-slate-200" : "bg-neutral-900/80 border-white/10"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab("hero")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "hero"
              ? "bg-[#16b09f] text-black font-bold shadow-md shadow-[#16b09f]/25"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <RiSparklingFill className="w-4 h-4" />
          <span>{tr("Hero Banner", "Hero Banner", "Hero Banner")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("showcase")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "showcase"
              ? "bg-[#16b09f] text-black font-bold shadow-md shadow-[#16b09f]/25"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <RiMovieFill className="w-4 h-4" />
          <span>{tr("Media Showcase", "Media Showcase", "Media Showcase")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("reels")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "reels"
              ? "bg-[#16b09f] text-black font-bold shadow-md shadow-[#16b09f]/25"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <RiFolderMusicFill className="w-4 h-4" />
          <span>{tr("Media Reels (4:5)", "Media Reels (4:5)", "Media Reels (4:5)")}</span>
        </button>
      </div>

      {/* ==============================================================
          TAB 1: HERO BANNER & 3D CANVAS SCROLLYTELLING
         ============================================================== */}
      {activeSubTab === "hero" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Header Explainer Card */}
          <div
            className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}
          >
            <span
              className={`text-[10px] sm:text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}
            >
              SECTION CONTROL: HERO BANNER (3D CANVAS SCROLLYTELLING)
            </span>
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {tr("Editor Teks & Foto Hero Banner", "Hero Banner Text & Photo Sequence Editor", "Editor Teks & Foto Hero Banner")}
            </h2>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              {tr(
                "Sesuaikan nama utama, subtitle peran, warna, serta rangkaian foto 3D canvas scrollytelling yang berputar saat pengunjung menggulir website.",
                "Customize main name, role subtitle, colors, and 3D canvas sequence photo frames that rotate as visitors scroll.",
                "Atua namo utamo, subtitle peran, warna, jo sequence foto 3D canvas."
              )}
            </p>
          </div>

          {/* Live Visual Preview Mockup */}
          <div
            className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[190px] shadow-xl relative overflow-hidden ${
              isLight
                ? "bg-gradient-to-b from-slate-100 via-white to-slate-50 border-slate-200 shadow-slate-200/60"
                : "bg-gradient-to-b from-neutral-950 via-neutral-900 to-black border-white/15"
            }`}
          >
            <div
              className={`absolute top-3 left-4 text-[9px] font-mono uppercase tracking-widest ${
                isLight ? "text-slate-500" : "text-neutral-500"
              }`}
            >
              {tr("Live Preview Hero", "Live Preview Hero", "Live Preview Hero")}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1" style={{ color: hbNameColor }}>
              {hbName || "Fomy R"}
              <span className={isLight ? "text-slate-400 font-normal" : "text-neutral-500 font-normal"}>.</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono tracking-widest mt-1" style={{ color: hbRoleColor }}>
              {hbRole || "AI-Powered Creative Designer"}
            </p>

            <div className="flex flex-col items-center gap-1.5 mt-5">
              <div
                className={`w-4 h-6 rounded-full border flex justify-center pt-1 ${
                  isLight ? "border-slate-400" : "border-neutral-500"
                }`}
              >
                <span
                  className={`w-1 h-1.5 rounded-full animate-bounce ${
                    isLight ? "bg-slate-500" : "bg-neutral-400"
                  }`}
                />
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: hbScrollTextColor }}>
                {hbScrollText || "SCROLL"}
              </span>
            </div>
          </div>

          {/* Identitas Teks & Warna */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <RiSparklingFill className="w-4 h-4 text-[#16b09f]" />
                <span>{tr("Identitas Hero Utama", "Primary Hero Identity", "Identitas Hero Utamo")}</span>
              </h3>
              <button
                type="button"
                onClick={handleSaveHeroBannerText}
                className="px-3 py-1 rounded-lg bg-[#16b09f] hover:bg-[#119889] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RiCheckLine className="w-3.5 h-3.5" />
                <span>{tr("Simpan Teks", "Save Texts", "Simpan Teks")}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Main Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-mono font-semibold ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    {tr("Nama Utama", "Main Name", "Namo Utamo")} *
                  </label>
                  <label className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono cursor-pointer">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: hbNameColor }} />
                    <input
                      type="color"
                      value={hbNameColor}
                      onChange={(e) => setHbNameColor(e.target.value)}
                      className="sr-only"
                    />
                    <span>{hbNameColor}</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={hbName}
                  onChange={(e) => setHbName(e.target.value)}
                  placeholder="Contoh: Fomy R"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] ${
                    isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-950 border-white/15 text-white"
                  }`}
                />
              </div>

              {/* Role Subtitle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-mono font-semibold ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    {tr("Peran / Profesi", "Role / Profession", "Peran / Profesi")} *
                  </label>
                  <label className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono cursor-pointer">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: hbRoleColor }} />
                    <input
                      type="color"
                      value={hbRoleColor}
                      onChange={(e) => setHbRoleColor(e.target.value)}
                      className="sr-only"
                    />
                    <span>{hbRoleColor}</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={hbRole}
                  onChange={(e) => setHbRole(e.target.value)}
                  placeholder="Contoh: AI-Powered Creative Designer"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] ${
                    isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-950 border-white/15 text-white"
                  }`}
                />
              </div>
            </div>

            {/* Scroll Indicator Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-mono font-semibold ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    {tr("Teks Tombol Scroll", "Scroll Indicator Label", "Teks Tombol Scroll")}
                  </label>
                  <label className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono cursor-pointer">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: hbScrollTextColor }} />
                    <input
                      type="color"
                      value={hbScrollTextColor}
                      onChange={(e) => setHbScrollTextColor(e.target.value)}
                      className="sr-only"
                    />
                    <span>{hbScrollTextColor}</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={hbScrollText}
                  onChange={(e) => setHbScrollText(e.target.value)}
                  placeholder="SCROLL"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] ${
                    isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-950 border-white/15 text-white"
                  }`}
                />
              </div>

              {/* Mouse Tracking Toggle */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-neutral-950/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      {tr("Follow Kursor Mouse", "Follow Mouse Cursor", "Follow Kursor")}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {tr("Parallax 3D saat mouse bergerak", "3D parallax on cursor move", "Parallax 3D")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHbSeqMouseTracking(!hbSeqMouseTracking)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      hbSeqMouseTracking
                        ? "bg-[#16b09f] text-black shadow-sm"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {hbSeqMouseTracking ? tr("Aktif", "ON", "Aktif") : tr("Nonaktif", "OFF", "Mati")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sequence Foto Hero Scroller & Uploader */}
          <div
            className={`p-5 rounded-2xl border space-y-5 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10 flex-wrap gap-2">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <RiCompass3Fill className="w-4 h-4 text-[#16b09f]" />
                  <span>{tr("Sequence Foto Hero (121 Frame 3D)", "Hero Sequence (121 3D Frames)", "Sequence Foto Hero")}</span>
                </h3>
                <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                  {hbSeqMode === "default"
                    ? tr("Mode: Bawaan (121 Frame WebP)", "Mode: Default (121 WebP Frames)", "Mode: Default (121 Frame)")
                    : tr(`Mode: Kustom (${activeScrubberFrames.length} Frame)`, `Mode: Custom (${activeScrubberFrames.length} Frames)`, `Mode: Kustom (${activeScrubberFrames.length} Frame)`)}
                </span>
              </div>
            </div>

            {/* Visual Frame Scrubber */}
            <div className="space-y-3">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/15 flex items-center justify-center shadow-lg">
                {activeScrubberFrames.length > 0 ? (
                  <img
                    src={activeScrubberFrames[Math.min(seqScrubIdx, Math.max(0, activeScrubberFrames.length - 1))]}
                    alt="Sequence preview"
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  <span className="text-xs font-mono text-neutral-500">No frames loaded</span>
                )}

                {/* Frame Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
                  <span>FRAME {Math.min(seqScrubIdx + 1, activeScrubberFrames.length)} / {activeScrubberFrames.length}</span>
                </div>

                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={() => setSeqIsAutoPlaying(!seqIsAutoPlaying)}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/75 hover:bg-neutral-800 text-white text-[10px] font-mono font-semibold border border-white/20 backdrop-blur-md flex items-center gap-1 transition-all cursor-pointer"
                >
                  {seqIsAutoPlaying ? (
                    <>
                      <RiPauseFill className="w-3 h-3 text-[#16b09f]" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <RiPlayFill className="w-3 h-3 text-[#16b09f]" />
                      <span>PLAY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scrubber slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, activeScrubberFrames.length - 1)}
                  value={seqScrubIdx}
                  onChange={(e) => {
                    setSeqScrubIdx(Number(e.target.value));
                    setSeqIsAutoPlaying(false);
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#16b09f] bg-neutral-800"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>0% Awal</span>
                  <span className="text-[#16b09f]">Geser untuk scrub frame</span>
                  <span>100% Akhir</span>
                </div>
              </div>

              {/* Batch Upload trigger */}
              <div className="pt-2">
                <input
                  ref={seqFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleSelectBatchFiles}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => seqFileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-white/25 hover:border-[#16b09f] bg-neutral-900/60 hover:bg-neutral-900 text-xs font-mono text-neutral-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RiUpload2Line className="w-4 h-4 text-[#16b09f]" />
                    <span>
                      {seqSelectedFiles.length > 0
                        ? `${seqSelectedFiles.length} file dipilih (klik untuk ganti)`
                        : tr("Pilih File Batch Foto Sequence Baru", "Select Batch Photo Sequence Files", "Pilih Batch Foto Sequence")}
                    </span>
                  </button>

                  {seqSelectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyCustomBatch}
                      disabled={seqIsUploading}
                      className="py-2.5 px-4 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {seqIsUploading ? (
                        <span>Mengupload...</span>
                      ) : (
                        <>
                          <RiCheckLine className="w-4 h-4" />
                          <span>Terapkan ({seqSelectedFiles.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==============================================================
          TAB 2: MEDIA SHOWCASE (STAGE 3)
         ============================================================== */}
      {activeSubTab === "showcase" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Header Explainer Card */}
          <div
            className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <span
                className={`text-[10px] sm:text-[11px] font-mono tracking-widest uppercase font-semibold ${
                  isLight ? "text-teal-700" : "text-[#16b09f]"
                }`}
              >
                SECTION CONTROL: STAGE 3 (MEDIA SHOWCASE)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 ${
                  flagshipMediaType === "youtube" && previewYouTubeId
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : flagshipMediaType === "gdrive" && previewGDriveId
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : "bg-emerald-500/15 text-[#16b09f] border border-[#16b09f]/30"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>
                  {flagshipMediaType === "youtube"
                    ? previewYouTubeId
                      ? videoEnabled ? "YouTube Aktif" : "YouTube Siap (Nonaktif)"
                      : "Menunggu URL"
                    : flagshipMediaType === "gdrive"
                    ? previewGDriveId
                      ? videoEnabled ? "GDrive Embed Aktif" : "GDrive Siap (Nonaktif)"
                      : "Menunggu URL"
                    : "Mode Poster Statis"}
                </span>
              </span>
            </div>
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {tr("Flagship Media Showcase", "Flagship Media Showcase", "Flagship Media Showcase")}
            </h2>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              {tr(
                "Integrasi video sinematik YouTube atau Google Drive khusus di section Projects (Stage 3). Langsung tayang di layar penuh web publik.",
                "Cinematic video integration for YouTube or Google Drive embedded in Stage 3 projects section.",
                "Integrasi video sinematik YouTube atau Google Drive di section Projects (Stage 3)."
              )}
            </p>
          </div>

          {/* Form & Live Media Preview */}
          <div
            className={`p-5 rounded-2xl border space-y-5 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <RiMovieFill className="w-4 h-4 text-[#16b09f]" />
                <span>{tr("Pengaturan Showcase", "Showcase Settings", "Pengaturan Showcase")}</span>
              </h3>
              <button
                type="button"
                onClick={() => handleSaveShowcase()}
                className="px-3.5 py-1 rounded-lg bg-[#16b09f] hover:bg-[#119889] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RiCheckLine className="w-3.5 h-3.5" />
                <span>{tr("Simpan Showcase", "Save Showcase", "Simpan Showcase")}</span>
              </button>
            </div>

            {/* Media Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-neutral-300">
                {tr("Pilih Tipe Media Pemutar", "Select Media Player Type", "Pilih Tipe Media")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFlagshipMediaType("youtube")}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    flagshipMediaType === "youtube"
                      ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-sm"
                      : "bg-neutral-900 border-white/10 text-neutral-400"
                  }`}
                >
                  <RiYoutubeFill className="w-4 h-4 text-red-400" />
                  <span>YouTube</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlagshipMediaType("gdrive")}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    flagshipMediaType === "gdrive"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-sm"
                      : "bg-neutral-900 border-white/10 text-neutral-400"
                  }`}
                >
                  <RiDriveFill className="w-4 h-4 text-blue-400" />
                  <span>Google Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlagshipMediaType("image")}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    flagshipMediaType === "image"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm"
                      : "bg-neutral-900 border-white/10 text-neutral-400"
                  }`}
                >
                  <RiImageFill className="w-4 h-4 text-emerald-400" />
                  <span>Gambar Poster</span>
                </button>
              </div>
            </div>

            {/* Media URL Input */}
            {flagshipMediaType === "youtube" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    URL Video YouTube *
                  </label>
                  {previewYouTubeId && (
                    <span className="text-[10px] font-mono text-cyan-400">ID: {previewYouTubeId}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ atau ID"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                />
              </div>
            )}

            {flagshipMediaType === "gdrive" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    URL Embed Google Drive *
                  </label>
                  {previewGDriveId && (
                    <span className="text-[10px] font-mono text-cyan-400">ID: {previewGDriveId}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={flagshipGDriveUrl}
                  onChange={(e) => setFlagshipGDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                />
              </div>
            )}

            {flagshipMediaType === "image" && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-neutral-300">
                  URL Gambar Poster *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flagshipImageUrl}
                    onChange={(e) => setFlagshipImageUrl(e.target.value)}
                    placeholder="/assets/showcase.jpg atau URL online"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer hover:bg-neutral-800">
                    <RiUpload2Line className="w-3.5 h-3.5 text-[#16b09f]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadSingleImage(e, (url) => setFlagshipImageUrl(url))}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Public Video Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-neutral-950/60">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">
                  {tr("Status Pemutar Video Publik", "Public Video Status", "Status Video")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {videoEnabled ? "Video langsung autoplay/aktif di web" : "Video nonaktif sementara"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  videoEnabled
                    ? "bg-[#16b09f] text-black shadow-sm"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {videoEnabled ? tr("Aktif", "Active", "Aktif") : tr("Nonaktif", "Disabled", "Mati")}
              </button>
            </div>

            {/* Titles & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-neutral-300">
                  Judul Headline Section
                </label>
                <input
                  type="text"
                  value={videoHeadline}
                  onChange={(e) => setVideoHeadline(e.target.value)}
                  placeholder="A journey shaped by creativity and change."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#16b09f]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-neutral-300">
                  Kategori Card
                </label>
                <input
                  type="text"
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value)}
                  placeholder="VISUAL CRAFT | DIGITAL | AI"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#16b09f]"
                />
              </div>
            </div>

            {/* Cinematic Live Preview Player */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>{tr("Live Preview Pemutar", "Live Player Preview", "Live Preview")}</span>
                <span className="text-cyan-400 font-semibold">16:9 Cinema View</span>
              </div>
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-white/15 shadow-xl">
                {flagshipMediaType === "youtube" && previewYouTubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${previewYouTubeId}?rel=0&modestbranding=1`}
                    title="YouTube Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : flagshipMediaType === "gdrive" && previewGDriveId ? (
                  <iframe
                    src={`https://drive.google.com/file/d/${previewGDriveId}/preview`}
                    title="GDrive Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : flagshipImageUrl ? (
                  <img
                    src={flagshipImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500 font-mono text-xs">
                    <RiMovieFill className="w-8 h-8 mb-2 opacity-50" />
                    <span>Belum ada video atau gambar terpasang</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==============================================================
          TAB 3: MEDIA REELS (RUNNING PORTOFOLIO 4:5)
         ============================================================== */}
      {activeSubTab === "reels" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Header Explainer Card */}
          <div
            className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}
          >
            <span
              className={`text-[10px] sm:text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}
            >
              SECTION CONTROL: MEDIA REELS (RUNNING PORTOFOLIO 4:5)
            </span>
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {tr("Strip Marquee Berjalan (Rasio 4:5)", "Running Portfolio Marquee (4:5 Ratio)", "Strip Marquee Baguliah (4:5)")}
            </h2>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              {tr(
                "Kelola kartu karya yang berjalan tanpa henti (infinite loop) di 2 baris strip di atas footer. Semua kartu memiliki proporsi 4:5 seragam.",
                "Manage continuous marquee cards running across 2 rows above the footer with uniform 4:5 aspect ratio.",
                "Atua kartu karya nan bajalan tanpa henti (infinite loop) di 2 baris strip."
              )}
            </p>
          </div>

          {/* Speed & Direction Controls */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <RiSpeedUpLine className="w-4 h-4 text-[#16b09f]" />
                <span>{tr("Pengaturan Kecepatan Marquee", "Marquee Speed Controls", "Kecepatan Marquee")}</span>
              </h3>
              <button
                type="button"
                onClick={handleSaveRunnerSettings}
                className="px-3 py-1 rounded-lg bg-[#16b09f] hover:bg-[#119889] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RiCheckLine className="w-3.5 h-3.5" />
                <span>{tr("Simpan Setelan", "Save Settings", "Simpan")}</span>
              </button>
            </div>

            {/* Section Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-neutral-300">
                Judul Label Section
              </label>
              <input
                type="text"
                value={runnerTitle}
                onChange={(e) => setRunnerTitle(e.target.value)}
                placeholder="SELECTED WORKS"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
              />
            </div>

            {/* Speed Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 rounded-xl border border-white/10 bg-neutral-950/50">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300 font-semibold">Baris 1 (Atas)</span>
                  <span className="text-[#16b09f] font-bold">{runnerSpeedRow1} detik/putaran</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={140}
                  step={5}
                  value={runnerSpeedRow1}
                  onChange={(e) => setRunnerSpeedRow1(Number(e.target.value))}
                  className="w-full accent-[#16b09f] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                  <span>Cepat (35s)</span>
                  <span>Lambat (140s)</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl border border-white/10 bg-neutral-950/50">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300 font-semibold">Baris 2 (Bawah)</span>
                  <span className="text-[#16b09f] font-bold">{runnerSpeedRow2} detik/putaran</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={140}
                  step={5}
                  value={runnerSpeedRow2}
                  onChange={(e) => setRunnerSpeedRow2(Number(e.target.value))}
                  className="w-full accent-[#16b09f] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                  <span>Cepat (35s)</span>
                  <span>Lambat (140s)</span>
                </div>
              </div>
            </div>

            {/* Pause on hover */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-neutral-950/50">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Pause saat Disentuh / Hover</span>
                <span className="text-[10px] text-neutral-400">Marquee berhenti sementara saat jari menyentuh kartu</span>
              </div>
              <button
                type="button"
                onClick={() => setRunnerPauseOnHover(!runnerPauseOnHover)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  runnerPauseOnHover ? "bg-[#16b09f] text-black" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {runnerPauseOnHover ? "Aktif" : "Nonaktif"}
              </button>
            </div>
          </div>

          {/* Form Tambah Karya Baru 4:5 */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <RiAddLine className="w-4 h-4 text-[#16b09f]" />
                <span>{tr("Tambah Karya Baru (Rasio 4:5)", "Add New Card (4:5 Ratio)", "Tambah Karya (4:5)")}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#16b09f]/15 text-[#16b09f] border border-[#16b09f]/30">
                4:5 Card
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Inputs */}
              <div className="md:col-span-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-neutral-300">
                      Judul Karya *
                    </label>
                    <input
                      type="text"
                      value={newRunnerTitle}
                      onChange={(e) => setNewRunnerTitle(e.target.value)}
                      placeholder="KIA EV2 Concept"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#16b09f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-neutral-300">
                      Kategori
                    </label>
                    <input
                      type="text"
                      value={newRunnerCategory}
                      onChange={(e) => setNewRunnerCategory(e.target.value)}
                      placeholder="Automotive, Branding"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#16b09f]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Posisi Baris
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRunnerRow(1)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                        newRunnerRow === 1
                          ? "bg-[#16b09f] text-black font-bold border-[#16b09f]"
                          : "bg-neutral-900 text-neutral-400 border-white/10"
                      }`}
                    >
                      Baris 1 (Atas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRunnerRow(2)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                        newRunnerRow === 2
                          ? "bg-[#16b09f] text-black font-bold border-[#16b09f]"
                          : "bg-neutral-900 text-neutral-400 border-white/10"
                      }`}
                    >
                      Baris 2 (Bawah)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Gambar Karya (Rasio 4:5 Disarankan) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRunnerImage}
                      onChange={(e) => setNewRunnerImage(e.target.value)}
                      onBlur={() => setNewRunnerImage((prev) => normalizeMediaUrl(prev))}
                      placeholder="/works/... atau Link Google Drive / URL online"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                    />
                    <label className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer hover:bg-neutral-800">
                      <RiUpload2Line className="w-3.5 h-3.5 text-[#16b09f]" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadSingleImage(e, (url) => setNewRunnerImage(url))}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-neutral-300 flex items-center gap-1.5">
                    <RiLink className="w-3.5 h-3.5 text-[#16b09f]" />
                    <span>Link Tujuan Kartu (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={newRunnerLink}
                    onChange={(e) => setNewRunnerLink(e.target.value)}
                    placeholder="https://... atau #projects (Kosongkan jika hanya preview foto)"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                  />
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Jika diisi, pengunjung yang mengklik kartu di running portofolio akan langsung diarahkan ke link ini.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={handleAddRunnerItem}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#16b09f]/20 active:scale-95 disabled:opacity-50"
                >
                  <RiAddLine className="w-4 h-4" />
                  <span>{isUploadingImage ? "Mengupload Gambar..." : "Tambahkan ke Running Portofolio"}</span>
                </button>
              </div>

              {/* 4:5 Card Preview */}
              <div className="md:col-span-4 flex flex-col items-center">
                <span className="text-[10px] font-mono text-neutral-400 mb-2">Preview 4:5</span>
                <div className="relative w-32 aspect-[4/5] rounded-xl overflow-hidden border border-white/15 bg-neutral-950 shadow-xl flex items-center justify-center">
                  {newRunnerImage ? (
                    <img
                      src={normalizeMediaUrl(newRunnerImage)}
                      alt="Preview"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fbs = getMediaFallbackUrls(newRunnerImage);
                        if (fbs[1] && target.src !== fbs[1]) target.src = fbs[1];
                        else if (fbs[2] && target.src !== fbs[2]) target.src = fbs[2];
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-600 text-center p-2">Rasio 4:5</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
                    <span className="text-[9px] font-mono text-[#16b09f] uppercase">{newRunnerCategory || "Category"}</span>
                    <span className="text-[10px] font-bold text-white leading-tight truncate">{newRunnerTitle || "Title"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daftar Karya Running Portofolio */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {tr("Daftar Karya Aktif", "Active Running Items", "Daftar Karya")} ({runnerItems.length})
                </h3>
              </div>

              {/* Filter Row */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-white/10 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setFilterRunnerRow(0)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterRunnerRow === 0 ? "bg-[#16b09f] text-black font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Semua ({runnerItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRunnerRow(1)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterRunnerRow === 1 ? "bg-[#16b09f] text-black font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Baris 1 ({runnerItems.filter((i) => i.row === 1).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRunnerRow(2)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterRunnerRow === 2 ? "bg-[#16b09f] text-black font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Baris 2 ({runnerItems.filter((i) => i.row === 2).length})
                </button>
              </div>
            </div>

            {/* Grid of 4:5 Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredRunnerItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 bg-neutral-950 flex flex-col shadow-md"
                >
                  {/* Thumbnail 4:5 */}
                  <div className="relative aspect-[4/5] w-full bg-neutral-900 overflow-hidden">
                    <img
                      src={normalizeMediaUrl(item.image)}
                      alt={item.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fbs = getMediaFallbackUrls(item.image);
                        if (fbs[1] && target.src !== fbs[1]) target.src = fbs[1];
                        else if (fbs[2] && target.src !== fbs[2]) target.src = fbs[2];
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Row badge */}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-mono text-[#16b09f] border border-white/10">
                      R{item.row}
                    </span>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setEditingRunnerItem({ ...item })}
                      className="absolute top-2 right-9 p-1.5 rounded-lg bg-black/75 hover:bg-[#16b09f] text-neutral-300 hover:text-black border border-white/10 transition-colors cursor-pointer z-10"
                      title="Edit karya ini"
                    >
                      <RiEditLine className="w-3 h-3" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Hapus "${item.title}" dari running portfolio?`)) {
                          await deletePortfolioRunnerItem(item.id);
                          notify("info", "Dihapus", `"${item.title}" dihapus.`);
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-red-600 text-neutral-400 hover:text-white border border-white/10 transition-colors cursor-pointer z-10"
                      title="Hapus karya"
                    >
                      <RiDeleteBinLine className="w-3 h-3" />
                    </button>

                    {/* Link badge if set */}
                    {item.link && (
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[8px] font-mono text-cyan-300 border border-white/10 flex items-center gap-1 max-w-[85px] truncate" title={item.link}>
                        <RiLink className="w-2.5 h-2.5 shrink-0 text-[#16b09f]" />
                        <span className="truncate">{item.link}</span>
                      </span>
                    )}

                    {/* Switch row button */}
                    <button
                      type="button"
                      onClick={async () => {
                        const newRow: 1 | 2 = item.row === 1 ? 2 : 1;
                        await editPortfolioRunnerItem(item.id, { row: newRow });
                        notify("info", "Pindah Baris", `Dipindah ke Baris ${newRow}`);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-[#16b09f] text-neutral-300 hover:text-black border border-white/10 transition-colors cursor-pointer"
                      title="Pindahkan ke baris lain"
                    >
                      <RiExchangeLine className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2 flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono text-[#16b09f] uppercase truncate">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-white truncate" title={item.title}>
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal Edit Karya Running Portofolio */}
      {editingRunnerItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setEditingRunnerItem(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-neutral-950 border border-white/15 p-5 sm:p-7 space-y-4 shadow-2xl overflow-y-auto max-h-[92vh] no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RiEditLine className="w-5 h-5 text-[#16b09f]" />
                <span>Edit Karya Running Portofolio</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingRunnerItem(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-neutral-300">
                  Judul Karya
                </label>
                <input
                  type="text"
                  value={editingRunnerItem.title}
                  onChange={(e) =>
                    setEditingRunnerItem({ ...editingRunnerItem, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-neutral-300">
                  Kategori
                </label>
                <input
                  type="text"
                  value={editingRunnerItem.category}
                  onChange={(e) =>
                    setEditingRunnerItem({ ...editingRunnerItem, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-neutral-300">
                  Posisi Baris
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRunnerItem({ ...editingRunnerItem, row: 1 })}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                      editingRunnerItem.row === 1
                        ? "bg-[#16b09f] text-black font-bold border-[#16b09f]"
                        : "bg-neutral-900 text-neutral-400 border-white/10"
                    }`}
                  >
                    Baris 1 (Atas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRunnerItem({ ...editingRunnerItem, row: 2 })}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                      editingRunnerItem.row === 2
                        ? "bg-[#16b09f] text-black font-bold border-[#16b09f]"
                        : "bg-neutral-900 text-neutral-400 border-white/10"
                    }`}
                  >
                    Baris 2 (Bawah)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-neutral-300">
                  Gambar Karya (Rasio 4:5)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingRunnerItem.image}
                    onChange={(e) =>
                      setEditingRunnerItem({ ...editingRunnerItem, image: e.target.value })
                    }
                    placeholder="/works/... atau URL online"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-neutral-800 border border-white/15 text-neutral-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer hover:bg-neutral-700">
                    <RiUpload2Line className="w-3.5 h-3.5 text-[#16b09f]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setIsUploadingEditImage(true);
                          const fd = new FormData();
                          fd.append("file", file);
                          fd.append("folder", "works/runner");
                          const res = await fetch("/api/admin/media-upload", {
                            method: "POST",
                            body: fd,
                          });
                          const data = await res.json();
                          if (res.ok && data.url) {
                            setEditingRunnerItem((prev) => prev ? { ...prev, image: data.url } : null);
                            setIsUploadingEditImage(false);
                            return;
                          }
                        } catch (_) {}
                        finally {
                          setIsUploadingEditImage(false);
                        }

                        // Fallback canvas compression
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const raw = ev.target?.result as string;
                          if (!raw) return;
                          const img = new Image();
                          img.onload = () => {
                            const maxW = 1000;
                            const maxH = 1250;
                            let { width, height } = img;
                            if (width > maxW || height > maxH) {
                              const ratio = Math.min(maxW / width, maxH / height);
                              width = Math.round(width * ratio);
                              height = Math.round(height * ratio);
                            }
                            const canvas = document.createElement("canvas");
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.drawImage(img, 0, 0, width, height);
                              const comp = canvas.toDataURL("image/webp", 0.82);
                              setEditingRunnerItem((prev) => prev ? { ...prev, image: comp } : null);
                            }
                          };
                          img.src = raw;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-neutral-300 flex items-center gap-1.5">
                  <RiLink className="w-3.5 h-3.5 text-[#16b09f]" />
                  <span>Link Tujuan Kartu (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={editingRunnerItem.link || ""}
                  onChange={(e) =>
                    setEditingRunnerItem({ ...editingRunnerItem, link: e.target.value })
                  }
                  placeholder="https://... atau #projects"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                />
              </div>

              {/* Live Preview 4:5 */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-900/60 border border-white/10">
                <div className="relative w-16 aspect-[4/5] rounded-lg overflow-hidden bg-neutral-950 border border-white/10 shrink-0">
                  {editingRunnerItem.image ? (
                    <img
                      src={normalizeMediaUrl(editingRunnerItem.image)}
                      alt="Preview"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fbs = getMediaFallbackUrls(editingRunnerItem.image);
                        if (fbs[1] && target.src !== fbs[1]) target.src = fbs[1];
                        else if (fbs[2] && target.src !== fbs[2]) target.src = fbs[2];
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-neutral-600 font-mono">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 truncate">
                  <span className="text-[10px] font-mono text-[#16b09f] uppercase truncate">
                    {editingRunnerItem.category || "Creative"}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {editingRunnerItem.title || "Untitled"}
                  </span>
                  {editingRunnerItem.link && (
                    <span className="text-[10px] text-cyan-300 font-mono truncate flex items-center gap-1">
                      <RiLink className="w-2.5 h-2.5" />
                      {editingRunnerItem.link}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingRunnerItem(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-mono transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isUploadingEditImage}
                onClick={async () => {
                  if (!editingRunnerItem) return;
                  const finalTitle = editingRunnerItem.title.trim() || editingRunnerItem.category.trim() || "Creative Work";
                  const finalImg = normalizeMediaUrl(editingRunnerItem.image.trim());
                  if (!finalImg) {
                    notify("error", "Gambar Kosong", "Mohon isi atau upload gambar karya.");
                    return;
                  }
                  try {
                    await editPortfolioRunnerItem(editingRunnerItem.id, {
                      title: finalTitle,
                      category: editingRunnerItem.category.trim() || "Creative Work",
                      image: finalImg,
                      row: editingRunnerItem.row,
                      link: editingRunnerItem.link?.trim() || "",
                    });
                    notify("success", "Tersimpan!", `Karya "${finalTitle}" berhasil diperbarui & langsung aktif di web!`);
                    setEditingRunnerItem(null);
                  } catch (e) {
                    notify("error", "Gagal", "Gagal memperbarui karya.");
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black text-xs font-bold transition-all shadow-md shadow-[#16b09f]/20 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isUploadingEditImage ? "Mengupload..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

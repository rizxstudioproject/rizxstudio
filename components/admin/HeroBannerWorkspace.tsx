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
  const [hbSeqStart, setHbSeqStart] = useState(heroBanner?.sequenceStartIndex ?? 0);
  const [hbSeqMouseTracking, setHbSeqMouseTracking] = useState(heroBanner?.sequenceMouseTracking !== false);
  const [hbSeqMouseIntensity, setHbSeqMouseIntensity] = useState(heroBanner?.sequenceMouseIntensity || 26);

  const [hbSeqFrontImage, setHbSeqFrontImage] = useState(heroBanner?.sequenceFrontImage || "/front.webp");
  const [hbSeqMaskImage, setHbSeqMaskImage] = useState(heroBanner?.sequenceMaskImage || "/mask.webp");
  const [hbSeqRevealRadius, setHbSeqRevealRadius] = useState(heroBanner?.sequenceRevealRadius || 270);
  const [hbSeqRevealSpread, setHbSeqRevealSpread] = useState(heroBanner?.sequenceRevealSpread ?? 30);
  const [hbSeqRevealFade, setHbSeqRevealFade] = useState(heroBanner?.sequenceRevealFade ?? 60);
  const spotlightSliderTapRef = React.useRef<{ radius: number; spread: number; fade: number }>({ radius: 0, spread: 0, fade: 0 });
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingMask, setIsUploadingMask] = useState(false);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const maskFileInputRef = useRef<HTMLInputElement>(null);

  const [seqActiveTab, setSeqActiveTab] = useState<"folder" | "frontmask" | "upload">("folder");
  const [seqPreviewMode, setSeqPreviewMode] = useState<"sequence" | "front" | "mask" | "reveal">("sequence");
  const [mobileRevealPos, setMobileRevealPos] = useState<{ x: number; y: number; isHovering: boolean }>({
    x: 0.5,
    y: 0.5,
    isHovering: false,
  });

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
      const isLegacy =
        heroBanner.sequenceTotalFrames === 121 ||
        (heroBanner.sequenceMode === "default" && heroBanner.sequenceFolder?.includes("supabase.co")) ||
        (!heroBanner.sequenceMode && heroBanner.sequenceFolder?.includes("supabase.co"));
      setHbSeqMode(isLegacy ? "default" : (heroBanner.sequenceMode || "default"));
      setHbSeqTotal(isLegacy ? 108 : (heroBanner.sequenceTotalFrames || 108));
      setHbSeqFolder(isLegacy ? "/sequence" : (heroBanner.sequenceFolder || "/sequence"));
      setHbSeqPattern(isLegacy ? "frame_{padded}.webp" : (heroBanner.sequencePattern || "frame_{padded}.webp"));
      setHbSeqPadding(heroBanner.sequencePadding || 6);
      setHbSeqStart(heroBanner.sequenceStartIndex ?? 0);
      setHbSeqMouseTracking(heroBanner.sequenceMouseTracking !== false);
      setHbSeqMouseIntensity(heroBanner.sequenceMouseIntensity || 26);
      setHbSeqFrontImage(heroBanner.sequenceFrontImage || "/front.webp");
      setHbSeqMaskImage(heroBanner.sequenceMaskImage || "/mask.webp");
      setHbSeqRevealRadius(heroBanner.sequenceRevealRadius || 270);
      setHbSeqRevealSpread(heroBanner.sequenceRevealSpread ?? 30);
      setHbSeqRevealFade(heroBanner.sequenceRevealFade ?? 60);
    }
  }, [heroBanner]);

  // Compute active preview frames
  const activeScrubberFrames = React.useMemo(() => {
    if (seqPreviewUrls.length > 0) return seqPreviewUrls;
    if (hbSeqMode === "custom" && heroBanner?.sequenceCustomFrames && heroBanner.sequenceCustomFrames.length > 0) {
      return heroBanner.sequenceCustomFrames;
    }
    if (hbSeqMode === "folder") {
      const folder = (hbSeqFolder || "/sequence").replace(/\/$/, "");
      const pattern = hbSeqPattern || "frame_{padded}.webp";
      const pad = hbSeqPadding ?? 6;
      const start = hbSeqStart ?? 0;
      const total = Math.max(1, Math.min(hbSeqTotal || 108, 200));
      const list: string[] = [];
      for (let i = 0; i < total; i++) {
        const actual = start + i;
        const padded = String(actual).padStart(pad, "0");
        list.push(`${folder}/${pattern.replace("{padded}", padded).replace("{index}", String(actual))}`);
      }
      return list;
    }
    // Default sequence mode: always load the 108 local frames from /sequence
    const frames: string[] = [];
    for (let i = 0; i < 108; i++) {
      frames.push(`/sequence/frame_${String(i).padStart(6, "0")}.webp`);
    }
    return frames;
  }, [
    seqPreviewUrls,
    heroBanner?.sequenceCustomFrames,
    hbSeqMode,
    hbSeqTotal,
    hbSeqFolder,
    hbSeqPattern,
    hbSeqPadding,
    hbSeqStart,
  ]);

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

  const handleApplyFolderConfig = async () => {
    setHbSeqMode("folder");
    setSeqPreviewUrls([]);
    await updateHeroBannerData({
      sequenceMode: "folder",
      sequenceFolder: hbSeqFolder.trim() || "/sequence",
      sequencePattern: hbSeqPattern.trim() || "frame_{padded}.webp",
      sequenceTotalFrames: Number(hbSeqTotal) || 108,
      sequencePadding: Number(hbSeqPadding) ?? 6,
      sequenceStartIndex: Number(hbSeqStart) ?? 0,
      sequenceCustomFrames: [],
    });
    notify(
      "success",
      tr("Folder Diterapkan!", "Folder Applied!", "Folder Diterapkan!"),
      tr("Pengaturan folder sequence foto berhasil diterapkan.", "Folder sequence settings applied successfully.", "Folder sequence barasil disimpan.")
    );
  };

  const handleUploadFrontImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFront(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero-sequence");
      const res = await fetch("/api/admin/media-upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setHbSeqFrontImage(data.url);
        await updateHeroBannerData({ sequenceFrontImage: data.url });
        notify(
          "success",
          tr("Upload Berhasil", "Upload Success", "Upload Barasil"),
          tr("Foto Front (Potret Utama) berhasil diupload & diganti!", "Front portrait photo successfully updated!", "Foto Front barasil diupload!")
        );
      } else {
        throw new Error(data.error || "Upload gagal");
      }
    } catch (err: any) {
      notify("error", tr("Upload Gagal", "Upload Failed", "Upload Gagal"), err.message || "Gagal upload foto front");
    } finally {
      setIsUploadingFront(false);
      if (frontFileInputRef.current) frontFileInputRef.current.value = "";
    }
  };

  const handleUploadMaskImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMask(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero-sequence");
      const res = await fetch("/api/admin/media-upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setHbSeqMaskImage(data.url);
        await updateHeroBannerData({ sequenceMaskImage: data.url });
        notify(
          "success",
          tr("Upload Berhasil", "Upload Success", "Upload Barasil"),
          tr("Foto Mask (Cyber Suit / Spotlight Reveal) berhasil diupload & diganti!", "Mask reveal photo successfully updated!", "Foto Mask barasil diupload!")
        );
      } else {
        throw new Error(data.error || "Upload gagal");
      }
    } catch (err: any) {
      notify("error", tr("Upload Gagal", "Upload Failed", "Upload Gagal"), err.message || "Gagal upload foto mask");
    } finally {
      setIsUploadingMask(false);
      if (maskFileInputRef.current) maskFileInputRef.current.value = "";
    }
  };

  const handleApplyFrontMaskConfig = async () => {
    await updateHeroBannerData({
      sequenceFrontImage: hbSeqFrontImage.trim() || "/front.webp",
      sequenceMaskImage: hbSeqMaskImage.trim() || "/mask.webp",
      sequenceRevealRadius: Number(hbSeqRevealRadius) || 270,
      sequenceRevealSpread: Number(hbSeqRevealSpread) ?? 30,
      sequenceRevealFade: Number(hbSeqRevealFade) ?? 60,
    });
    notify(
      "success",
      tr("Tersimpan!", "Saved!", "Tasimpan!"),
      tr("File Foto Front, Mask & Parameter Spotlight berhasil disimpan.", "Front, Mask & Spotlight parameters saved successfully.", "Foto Front, Mask & Spotlight barasil disimpan.")
    );
  };

  const handleResetSequenceDefault = async () => {
    if (window.confirm(tr("Kembalikan sequence foto Hero ke default (108 Frame & file bawaan)?", "Reset Hero sequence to default (108 frames & default files)?", "Kembalikan sequence ka default?"))) {
      setHbSeqMode("default");
      setHbSeqTotal(108);
      setHbSeqFolder("/sequence");
      setHbSeqPattern("frame_{padded}.webp");
      setHbSeqPadding(6);
      setHbSeqStart(0);
      setHbSeqFrontImage("/front.webp");
      setHbSeqMaskImage("/mask.webp");
      setHbSeqRevealRadius(270);
      setHbSeqRevealSpread(30);
      setHbSeqRevealFade(60);
      setSeqSelectedFiles([]);
      setSeqPreviewUrls([]);
      setSeqScrubIdx(0);
      setSeqIsAutoPlaying(false);
      await clearCustomFramesFromDB();
      fetch("/api/admin/sequence-upload", { method: "DELETE" }).catch(() => {});
      await updateHeroBannerData({
        sequenceMode: "default",
        sequenceTotalFrames: 108,
        sequenceFolder: "/sequence",
        sequencePattern: "frame_{padded}.webp",
        sequencePadding: 6,
        sequenceStartIndex: 0,
        sequenceCustomFrames: [],
        sequenceFrontImage: "/front.webp",
        sequenceMaskImage: "/mask.webp",
        sequenceRevealRadius: 270,
        sequenceRevealSpread: 30,
        sequenceRevealFade: 60,
      });
      notify(
        "info",
        tr("Reset Default", "Reset to Default", "Reset Default"),
        tr("Sequence foto Hero & file Front/Mask dikembalikan ke bawaan.", "Hero photo sequence & Front/Mask reset to default.", "Sequence dikembalikan ka default.")
      );
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

          {/* Sequence Foto Hero Scroller & Uploader (Mobile & Responsive) */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}
          >
            {/* Header & Reset Button */}
            <div className="flex items-center justify-between border-b pb-3 border-white/10 flex-wrap gap-2">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <RiCompass3Fill className="w-4 h-4 text-[#16b09f]" />
                  <span>{tr("Sequence Foto Hero & Front-Mask", "Hero Sequence & Front-Mask", "Sequence Foto Hero & Front-Mask")}</span>
                </h3>
                <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                  {hbSeqMode === "default"
                    ? tr("Mode: Bawaan (108 Frame WebP)", "Mode: Default (108 WebP Frames)", "Mode: Default (108 Frame)")
                    : tr(`Mode: Folder / Kustom (${activeScrubberFrames.length} Frame)`, `Mode: Folder / Custom (${activeScrubberFrames.length} Frames)`, `Mode: Kustom (${activeScrubberFrames.length} Frame)`)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetSequenceDefault}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <RiRefreshLine className="w-3 h-3" />
                <span>{tr("Reset Default", "Reset Default", "Reset")}</span>
              </button>
            </div>

            {/* Preview Mode Switcher */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-950 border border-white/10"
            }`}>
              <button
                type="button"
                onClick={() => setSeqPreviewMode("sequence")}
                className={`flex-1 min-w-[95px] py-1.5 px-2 text-[11px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                  seqPreviewMode === "sequence"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                <RiImageFill className="w-3.5 h-3.5" />
                <span>Sequence (108)</span>
              </button>
              <button
                type="button"
                onClick={() => setSeqPreviewMode("front")}
                className={`flex-1 min-w-[70px] py-1.5 px-2 text-[11px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                  seqPreviewMode === "front"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>Front</span>
              </button>
              <button
                type="button"
                onClick={() => setSeqPreviewMode("mask")}
                className={`flex-1 min-w-[75px] py-1.5 px-2 text-[11px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                  seqPreviewMode === "mask"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>Mask (Suit)</span>
              </button>
              <button
                type="button"
                onClick={() => setSeqPreviewMode("reveal")}
                className={`flex-1 min-w-[85px] py-1.5 px-2 text-[11px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                  seqPreviewMode === "reveal"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                <RiEyeLine className="w-3.5 h-3.5" />
                <span>{tr("Uji Reveal", "Test Reveal", "Uji Reveal")}</span>
              </button>
            </div>

            {/* Visual Screen Box (Supports Mouse & Mobile Touch Drag) */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/15 flex items-center justify-center shadow-lg select-none">
              {/* MODE 1: SEQUENCE SCRUBBER */}
              {seqPreviewMode === "sequence" && (
                <>
                  {activeScrubberFrames.length > 0 ? (
                    <img
                      src={activeScrubberFrames[Math.min(seqScrubIdx, Math.max(0, activeScrubberFrames.length - 1))]}
                      alt="Sequence preview"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  ) : (
                    <span className="text-xs font-mono text-neutral-500">No frames loaded</span>
                  )}

                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex items-center gap-1 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
                    <span>FRAME {Math.min(seqScrubIdx + 1, activeScrubberFrames.length)} / {activeScrubberFrames.length}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSeqIsAutoPlaying(!seqIsAutoPlaying)}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/75 hover:bg-neutral-800 text-white text-[10px] font-mono font-semibold border border-white/20 backdrop-blur-md flex items-center gap-1 transition-all cursor-pointer active:scale-95"
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
                </>
              )}

              {/* MODE 2: FRONT IMAGE */}
              {seqPreviewMode === "front" && (
                <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
                  <img
                    src={hbSeqFrontImage || "/front.webp"}
                    alt="Front Portrait Preview"
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/front.webp";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex items-center gap-1 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f]" />
                    <span>FOTO FRONT (POTRET UTAMA)</span>
                  </div>

                </div>
              )}

              {/* MODE 3: MASK IMAGE */}
              {seqPreviewMode === "mask" && (
                <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
                  <img
                    src={hbSeqMaskImage || "/mask.webp"}
                    alt="Mask Cyber Suit Preview"
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/mask.webp";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex items-center gap-1 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>FOTO MASK (CYBER SUIT REVEAL)</span>
                  </div>

                </div>
              )}

              {/* MODE 4: INTERACTIVE REVEAL TEST (TOUCH & MOUSE ENABLED) */}
              {seqPreviewMode === "reveal" && (
                <div
                  className="relative w-full h-full overflow-hidden cursor-crosshair bg-neutral-950 touch-none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMobileRevealPos({
                      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
                      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
                      isHovering: true,
                    });
                  }}
                  onMouseLeave={() => setMobileRevealPos((prev) => ({ ...prev, isHovering: false }))}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    if (!touch) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMobileRevealPos({
                      x: Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)),
                      y: Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height)),
                      isHovering: true,
                    });
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    if (!touch) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMobileRevealPos({
                      x: Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)),
                      y: Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height)),
                      isHovering: true,
                    });
                  }}
                  onTouchEnd={() => setMobileRevealPos((prev) => ({ ...prev, isHovering: false }))}
                >
                  <img
                    src={hbSeqFrontImage || "/front.webp"}
                    alt="Front Base"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  {mobileRevealPos.isHovering && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        maskImage: `radial-gradient(circle ${hbSeqRevealRadius}px at ${mobileRevealPos.x * 100}% ${mobileRevealPos.y * 100}%, black 0%, black ${hbSeqRevealSpread}%, rgba(0,0,0,${Math.max(0.05, 1 - hbSeqRevealFade / 100).toFixed(2)}) ${Math.min(95, hbSeqRevealSpread + (100 - hbSeqRevealSpread) * 0.55)}%, transparent 100%)`,
                        WebkitMaskImage: `radial-gradient(circle ${hbSeqRevealRadius}px at ${mobileRevealPos.x * 100}% ${mobileRevealPos.y * 100}%, black 0%, black ${hbSeqRevealSpread}%, rgba(0,0,0,${Math.max(0.05, 1 - hbSeqRevealFade / 100).toFixed(2)}) ${Math.min(95, hbSeqRevealSpread + (100 - hbSeqRevealSpread) * 0.55)}%, transparent 100%)`,
                      }}
                    >
                      <img
                        src={hbSeqMaskImage || "/mask.webp"}
                        alt="Mask Overlay"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
                    <span>{tr("SENTUH & GESER JARI UNTUK SPOTLIGHT REVEAL", "TOUCH & DRAG TO TEST SPOTLIGHT REVEAL", "SENTUH UNTUK REVEAL")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scrubber Range Slider Control (Only for Sequence mode) */}
            {seqPreviewMode === "sequence" && (
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
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#16b09f] bg-neutral-800"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                  <span>0% Awal</span>
                  <span className="text-[#16b09f]">Geser untuk memutar frame</span>
                  <span>100% Akhir</span>
                </div>
              </div>
            )}

            {/* Mobile Sub-Tabs: 1. Folder | 2. Front & Mask | 3. Batch Upload */}
            <div className={`flex p-1 rounded-xl border ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-950 border border-white/10"
            }`}>
              <button
                type="button"
                onClick={() => setSeqActiveTab("folder")}
                className={`flex-1 py-1.5 text-[11px] sm:text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  seqActiveTab === "folder"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr("1. Folder", "1. Folder", "1. Folder")}
              </button>
              <button
                type="button"
                onClick={() => setSeqActiveTab("frontmask")}
                className={`flex-1 py-1.5 text-[11px] sm:text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  seqActiveTab === "frontmask"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr("2. Front & Mask", "2. Front & Mask", "2. Front & Mask")}
              </button>
              <button
                type="button"
                onClick={() => setSeqActiveTab("upload")}
                className={`flex-1 py-1.5 text-[11px] sm:text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                  seqActiveTab === "upload"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr("3. Batch Upload", "3. Batch Upload", "3. Batch Upload")}
              </button>
            </div>

            {/* TAB 1: FOLDER & PATTERN CONFIGURATION */}
            {seqActiveTab === "folder" && (
              <div className={`p-3.5 sm:p-4 rounded-xl border space-y-3 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-950/70 border-white/10"
              }`}>
                <div>
                  <span className={`text-xs font-semibold block ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Konfigurasi Path Folder / URL Sequence", "Sequence Folder Path / URL", "Path Folder Sequence")}
                  </span>
                  <p className={`text-[10px] sm:text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {tr("Arahkan ke folder static atau CDN hosting rangkaian frame foto.", "Point to static folder or CDN hosting image sequence frames.", "Arahkan ka folder static.")}
                  </p>
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-1">
                  <span className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {tr("Preset Cepat:", "Quick Presets:", "Preset:")}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={async () => {
                        setHbSeqFolder("/sequence");
                        setHbSeqPattern("frame_{padded}.webp");
                        setHbSeqTotal(108);
                        setHbSeqPadding(6);
                        setHbSeqStart(0);
                        setHbSeqMode("default");
                        await updateHeroBannerData({
                          sequenceMode: "default",
                          sequenceFolder: "/sequence",
                          sequencePattern: "frame_{padded}.webp",
                          sequenceTotalFrames: 108,
                          sequencePadding: 6,
                          sequenceStartIndex: 0,
                          sequenceCustomFrames: [],
                        });
                        notify("success", "Preset Aktif!", "Folder Lokal (/sequence - 108 Frame) berhasil diterapkan dan disimpan!");
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] border border-[#16b09f]/40 transition-all cursor-pointer active:scale-95"
                    >
                      📁 Folder Lokal (/sequence)
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const cdnFolder = "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/sequence";
                        setHbSeqFolder(cdnFolder);
                        setHbSeqPattern("frame_{padded}.webp");
                        setHbSeqTotal(108);
                        setHbSeqPadding(6);
                        setHbSeqStart(0);
                        setHbSeqMode("folder");
                        await updateHeroBannerData({
                          sequenceMode: "folder",
                          sequenceFolder: cdnFolder,
                          sequencePattern: "frame_{padded}.webp",
                          sequenceTotalFrames: 108,
                          sequencePadding: 6,
                          sequenceStartIndex: 0,
                        });
                        notify("info", "Preset Dipilih", "Supabase CDN Sequence aktif & tersimpan.");
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium border transition-all cursor-pointer active:scale-95 ${
                        isLight ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300" : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10"
                      }`}
                    >
                      ☁️ Supabase CDN
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className={`text-[10px] sm:text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      Folder / Base URL
                    </label>
                    <input
                      type="text"
                      value={hbSeqFolder}
                      onChange={(e) => setHbSeqFolder(e.target.value)}
                      placeholder="/sequence"
                      className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                        isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-[10px] sm:text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        File Pattern
                      </label>
                      <input
                        type="text"
                        value={hbSeqPattern}
                        onChange={(e) => setHbSeqPattern(e.target.value)}
                        placeholder="frame_{padded}.webp"
                        className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-[10px] sm:text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        Total Frame
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={300}
                        value={hbSeqTotal}
                        onChange={(e) => setHbSeqTotal(Number(e.target.value))}
                        className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-[10px] sm:text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        Zero Padding
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={hbSeqPadding}
                        onChange={(e) => setHbSeqPadding(Number(e.target.value))}
                        placeholder="6"
                        className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-[10px] sm:text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        Start Index
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        value={hbSeqStart}
                        onChange={(e) => setHbSeqStart(Number(e.target.value))}
                        placeholder="0"
                        className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyFolderConfig}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isLight
                      ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm"
                      : "bg-neutral-800 hover:bg-neutral-700 text-white border-white/15 shadow-sm"
                  }`}
                >
                  <RiCheckLine className="w-4 h-4 text-[#16b09f]" />
                  <span>{tr("Terapkan Folder & Muat Sequence", "Apply Folder & Load Sequence", "Terapkan Folder")}</span>
                </button>
              </div>
            )}

            {/* TAB 2: FILE FRONT & MASK (CAN BE REPLACED / UPLOADED DIRECTLY ON MOBILE) */}
            {seqActiveTab === "frontmask" && (
              <div className={`p-3.5 sm:p-4 rounded-xl border space-y-3 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-950/70 border-white/10"
              }`}>
                <div>
                  <span className={`text-xs font-semibold block ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("File Front & Mask (Motion Mouse Reveal)", "Front & Mask Files", "File Front & Mask")}
                  </span>
                  <p className={`text-[10px] sm:text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {tr("Ganti foto potret normal dan foto efek reveal cyber suit.", "Replace normal portrait and cyber suit reveal photos.", "Ganti foto potret jo cyber suit.")}
                  </p>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={frontFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFrontImage}
                  className="hidden"
                />
                <input
                  ref={maskFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadMaskImage}
                  className="hidden"
                />

                {/* Card 1: Front Photo */}
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isLight ? "bg-white border-slate-200 shadow-2xs" : "bg-neutral-900/60 border-white/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span className="w-2 h-2 rounded-full bg-[#16b09f]" />
                      {tr("1. Foto Front (Potret Utama)", "1. Front Photo (Normal Portrait)", "1. Foto Front")}
                    </span>
                    <span className="text-[9px] font-mono text-[#16b09f] font-semibold">
                      {hbSeqFrontImage.startsWith("/") ? "Lokal" : "CDN / Cloud"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10 relative">
                      <img
                        src={hbSeqFrontImage || "/front.webp"}
                        alt="Front thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/front.webp";
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => frontFileInputRef.current?.click()}
                          disabled={isUploadingFront}
                          className="px-2 py-1 rounded-lg bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-[10px] font-mono flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isUploadingFront ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <RiUpload2Line className="w-3 h-3" />
                              <span>{tr("Ganti Foto Front", "Replace Front", "Ganti Foto Front")}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setHbSeqFrontImage("/front.webp")}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                            isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                          }`}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Mask Photo */}
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isLight ? "bg-white border-slate-200 shadow-2xs" : "bg-neutral-900/60 border-white/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {tr("2. Foto Mask (Cyber Suit Reveal)", "2. Mask Photo (Cyber Suit)", "2. Foto Mask")}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 font-semibold">
                      {hbSeqMaskImage.startsWith("/") ? "Lokal" : "CDN / Cloud"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10 relative">
                      <img
                        src={hbSeqMaskImage || "/mask.webp"}
                        alt="Mask thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/mask.webp";
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => maskFileInputRef.current?.click()}
                          disabled={isUploadingMask}
                          className="px-2 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-black font-bold text-[10px] font-mono flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isUploadingMask ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <RiUpload2Line className="w-3 h-3" />
                              <span>{tr("Ganti Foto Mask", "Replace Mask", "Ganti Foto Mask")}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setHbSeqMaskImage("/mask.webp")}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                            isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                          }`}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Spotlight Controls (Radius, Sebaran, Fade) */}
                <div className={`p-3 rounded-xl border space-y-3 ${
                  isLight ? "bg-white border-slate-200 shadow-2xs" : "bg-neutral-900/60 border-white/10"
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 border-white/10">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <RiSparklingFill className="w-3.5 h-3.5 text-[#16b09f]" />
                      {tr("3. Parameter Sorotan Mouse (Radius, Sebaran, Fade)", "3. Mouse Spotlight Settings (Radius, Spread, Fade)", "3. Parameter Sorotan Mouse")}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setHbSeqRevealRadius(270);
                        setHbSeqRevealSpread(30);
                        setHbSeqRevealFade(60);
                        notify("info", "Reset", "Parameter spotlight di-reset ke default.");
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                        isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Reset
                    </button>
                  </div>

                  {/* Control 1: Radius / Lebar Spotlight */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                      <span className={isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}>
                        {tr("Radius / Lebar Spotlight:", "Spotlight Radius / Width:", "Radius / Lebar:")}
                      </span>
                      <span className="font-bold text-[#16b09f]">{hbSeqRevealRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={600}
                      step={5}
                      value={hbSeqRevealRadius}
                      onChange={(e) => setHbSeqRevealRadius(Number(e.target.value))}
                      onDoubleClick={() => {
                        setHbSeqRevealRadius(270);
                        notify("info", "Reset Radius", "Radius di-reset ke default 270px.");
                      }}
                      onTouchEnd={() => {
                        const now = Date.now();
                        if (now - spotlightSliderTapRef.current.radius < 350) {
                          setHbSeqRevealRadius(270);
                          notify("info", "Reset Radius", "Radius di-reset ke default 270px.");
                        }
                        spotlightSliderTapRef.current.radius = now;
                      }}
                      title={tr("Klik 2x pada garis untuk reset ke default (270px)", "Double-click slider to reset to default (270px)", "Klik 2x untuak reset")}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#16b09f] bg-neutral-800"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                      <span>100px (Kecil)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setHbSeqRevealRadius(270);
                          notify("info", "Reset Radius", "Radius di-reset ke default 270px.");
                        }}
                        className="hover:text-[#16b09f] transition-colors cursor-pointer underline decoration-dotted"
                        title="Klik untuk reset ke default 270px"
                      >
                        Default: 270px
                      </button>
                      <span>600px (Lebar)</span>
                    </div>
                  </div>

                  {/* Control 2: Besaran Sebaran Inti / Spread */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                      <span className={isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}>
                        {tr("Besaran Sebaran Inti (Solid Core):", "Inner Spread (Solid Core):", "Besaran Sebaran:")}
                      </span>
                      <span className="font-bold text-cyan-400">{hbSeqRevealSpread}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={80}
                      step={1}
                      value={hbSeqRevealSpread}
                      onChange={(e) => setHbSeqRevealSpread(Number(e.target.value))}
                      onDoubleClick={() => {
                        setHbSeqRevealSpread(30);
                        notify("info", "Reset Sebaran", "Sebaran di-reset ke default 30%.");
                      }}
                      onTouchEnd={() => {
                        const now = Date.now();
                        if (now - spotlightSliderTapRef.current.spread < 350) {
                          setHbSeqRevealSpread(30);
                          notify("info", "Reset Sebaran", "Sebaran di-reset ke default 30%.");
                        }
                        spotlightSliderTapRef.current.spread = now;
                      }}
                      title={tr("Klik 2x pada garis untuk reset ke default (30%)", "Double-click slider to reset to default (30%)", "Klik 2x untuak reset")}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-400 bg-neutral-800"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                      <span>5% (Titik)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setHbSeqRevealSpread(30);
                          notify("info", "Reset Sebaran", "Sebaran di-reset ke default 30%.");
                        }}
                        className="hover:text-cyan-400 transition-colors cursor-pointer underline decoration-dotted"
                        title="Klik untuk reset ke default 30%"
                      >
                        Default: 30%
                      </button>
                      <span>80% (Luas)</span>
                    </div>
                  </div>

                  {/* Control 3: Besaran Fade / Kelembutan Gradasi */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                      <span className={isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}>
                        {tr("Besaran Fade / Kelembutan Gradasi:", "Fade Softness / Feathering:", "Besaran Fade:")}
                      </span>
                      <span className="font-bold text-emerald-400">{hbSeqRevealFade}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      step={1}
                      value={hbSeqRevealFade}
                      onChange={(e) => setHbSeqRevealFade(Number(e.target.value))}
                      onDoubleClick={() => {
                        setHbSeqRevealFade(60);
                        notify("info", "Reset Fade", "Fade di-reset ke default 60%.");
                      }}
                      onTouchEnd={() => {
                        const now = Date.now();
                        if (now - spotlightSliderTapRef.current.fade < 350) {
                          setHbSeqRevealFade(60);
                          notify("info", "Reset Fade", "Fade di-reset ke default 60%.");
                        }
                        spotlightSliderTapRef.current.fade = now;
                      }}
                      title={tr("Klik 2x pada garis untuk reset ke default (60%)", "Double-click slider to reset to default (60%)", "Klik 2x untuak reset")}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-neutral-800"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                      <span>10% (Tegas)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setHbSeqRevealFade(60);
                          notify("info", "Reset Fade", "Fade di-reset ke default 60%.");
                        }}
                        className="hover:text-emerald-400 transition-colors cursor-pointer underline decoration-dotted"
                        title="Klik untuk reset ke default 60%"
                      >
                        Default: 60%
                      </button>
                      <span>95% (Ultra Pudar)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyFrontMaskConfig}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isLight
                      ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm"
                      : "bg-neutral-800 hover:bg-neutral-700 text-white border-white/15 shadow-sm"
                  }`}
                >
                  <RiCheckLine className="w-4 h-4 text-[#16b09f]" />
                  <span>{tr("Apply Brush", "Apply Brush", "Apply Brush")}</span>
                </button>
              </div>
            )}

            {/* TAB 3: BATCH UPLOAD */}
            {seqActiveTab === "upload" && (
              <div className={`p-3.5 sm:p-4 rounded-xl border space-y-3 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-950/70 border-white/10"
              }`}>
                <div>
                  <span className={`text-xs font-semibold block ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Upload Batch File Foto Sequence", "Batch Sequence Photo Upload", "Upload Batch Foto Sequence")}
                  </span>
                  <p className={`text-[10px] sm:text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {tr("Pilih banyak file foto sekaligus (frame_000, frame_001, dst).", "Select multiple frame files naturally sorted.", "Pilih banyak file foto sakaligus.")}
                  </p>
                </div>

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
            )}
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
            <div className="flex items-center justify-end pt-2 border-t border-white/10">
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

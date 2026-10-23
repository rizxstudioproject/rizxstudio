"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  HiSquare3Stack3D,
  HiPhoto,
  HiMagnifyingGlass,
  HiArrowDownTray,
  HiClipboardDocument,
  HiEye,
  HiTrash,
  HiArrowTopRightOnSquare,
  HiXMark,
  HiTag,
  HiSparkles,
  HiCheck,
  HiPlus,
} from "react-icons/hi2";
import { ClientItem, ClientLogoItem } from "@/context/PortfolioDataContext";
import { useLang } from "@/context/LanguageContext";
import { getCustomFramesFromDB, clearCustomFramesFromDB } from "@/lib/sequenceStorage";

interface ResourceLibraryProps {
  clients: ClientItem[];
  clLogos?: ClientLogoItem[];
  onSelectClientFolder?: (clientId: string) => void;
  onOpenUploadWork?: () => void;
  onDeleteWork?: (clientId: string, workId: string, workTitle: string) => void;
  showToast: (msg: string) => void;
  onViewWebsite?: () => void;
}

interface FlattenedAsset {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  image: string;
  aspect: string;
  year?: string;
  type?: string;
  category: "work" | "logo";
}

export default function ResourceLibrary({
  clients,
  clLogos = [],
  onSelectClientFolder,
  onOpenUploadWork,
  onDeleteWork,
  showToast,
  onViewWebsite,
}: ResourceLibraryProps) {
  const { lang, tr } = useLang();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>("all");
  const [selectedAspectFilter, setSelectedAspectFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "works" | "logos" | "frames">("all");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  // Lightbox Modal state
  const [lightboxAsset, setLightboxAsset] = useState<FlattenedAsset | null>(null);

  // IndexedDB Frames state
  const [cachedFramesCount, setCachedFramesCount] = useState<number | null>(null);
  const [isClearingFrames, setIsClearingFrames] = useState(false);

  useEffect(() => {
    getCustomFramesFromDB().then((frames) => {
      setCachedFramesCount(frames ? frames.length : 0);
    });
  }, []);

  // Flatten all works from all clients
  const allWorkAssets: FlattenedAsset[] = useMemo(() => {
    return clients.flatMap((client) =>
      (client.works || []).map((work) => ({
        id: work.id,
        clientId: client.id,
        clientName: client.clientName,
        title: work.title || "Untitled Artwork",
        image: work.image,
        aspect: work.aspect || "4:5",
        year: work.year,
        type: work.type,
        category: "work" as const,
      }))
    );
  }, [clients]);

  // Flatten all partner logos
  const allLogoAssets: FlattenedAsset[] = useMemo(() => {
    return clLogos.map((logo) => ({
      id: logo.id,
      clientId: "partner-logos",
      clientName: `Row ${logo.row}`,
      title: logo.name,
      image: logo.file,
      aspect: "16:9",
      category: "logo" as const,
    }));
  }, [clLogos]);

  // Combined and filtered assets
  const filteredAssets = useMemo(() => {
    let list: FlattenedAsset[] = [];
    if (activeTab === "all") {
      list = [...allWorkAssets, ...allLogoAssets];
    } else if (activeTab === "works") {
      list = [...allWorkAssets];
    } else if (activeTab === "logos") {
      list = [...allLogoAssets];
    }

    if (selectedClientFilter !== "all") {
      list = list.filter((item) => item.clientId === selectedClientFilter);
    }

    if (selectedAspectFilter !== "all") {
      list = list.filter((item) => item.aspect === selectedAspectFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          (item.year && item.year.includes(q))
      );
    }

    return list;
  }, [allWorkAssets, allLogoAssets, activeTab, selectedClientFilter, selectedAspectFilter, searchQuery]);

  // Copy Image Link to Clipboard
  const handleCopyLink = async (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      showToast(tr("Asset URL copied to clipboard!", "Link gambar berhasil disalin ke clipboard!", "Link gambar barasil disalin ka clipboard!"));
    } catch {
      showToast(tr("Failed to copy link.", "Gagal menyalin link.", "Gagal manyalin link."));
    }
  };

  // Download Image File
  const handleDownload = (asset: FlattenedAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const a = document.createElement("a");
      a.href = asset.image;
      a.download = `${asset.clientName.replace(/\s+/g, "_")}_${asset.title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(tr(`Downloading ${asset.title}...`, `Mengunduh ${asset.title}...`, `Maunduah ${asset.title}...`));
    } catch {
      showToast(tr("Failed to download file.", "Gagal mengunduh file.", "Gagal maunduah file."));
    }
  };

  // Clear Sequence Cache
  const handleClearSequenceCache = async () => {
    if (!confirm(tr("Clear sequence cache from IndexedDB?", "Hapus cache sequence frame dari IndexedDB?", "Hapuih cache sequence frame dari IndexedDB?"))) return;
    setIsClearingFrames(true);
    try {
      await clearCustomFramesFromDB();
      setCachedFramesCount(0);
      showToast(tr("Sequence cache cleared!", "Cache sequence berhasil dibersihkan!", "Cache sequence barasil dibarasiahkan!"));
    } catch {
      showToast(tr("Failed to clear cache.", "Gagal membersihkan cache.", "Gagal mambarasiahkan cache."));
    } finally {
      setIsClearingFrames(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#0d0f13] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#14AF9E]/15 border border-[#14AF9E]/30 flex items-center justify-center text-[#14AF9E] shrink-0 shadow-lg shadow-[#14AF9E]/10">
            <HiSquare3Stack3D className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Resource Library
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#14AF9E]/15 border border-[#14AF9E]/30 text-[#14AF9E] font-semibold">
                {allWorkAssets.length + allLogoAssets.length} Assets
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {tr(
                "Central visual media explorer, client portfolio works, partner logos, and cache vault.",
                "Pusat eksplorasi media visual, karya portofolio, logo partner, dan cache storage.",
                "Pusek eksplorasi media visual, karya portofolio, logo partner, sarato cache storage."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenUploadWork && (
            <button
              type="button"
              onClick={onOpenUploadWork}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-bold text-xs transition-all shadow-md shadow-[#14AF9E]/20 cursor-pointer active:scale-95"
            >
              <HiPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{tr("Upload Asset", "Upload Aset Baru", "Upload Aset Baru")}</span>
            </button>
          )}
          {onViewWebsite && (
            <button
              type="button"
              onClick={onViewWebsite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              <span>{tr("View web", "Lihat Web", "Caliak Web")}</span>
              <HiArrowTopRightOnSquare className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics / Storage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Works */}
        <div className="p-4 rounded-2xl bg-[#111419] border border-white/5 space-y-1.5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">{tr("Client Works", "Karya Klien", "Karya Klien")}</span>
            <HiPhoto className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {allWorkAssets.length}{" "}
            <span className="text-xs font-normal text-neutral-400">{tr("photos & works", "foto & karya", "foto & karya")}</span>
          </p>
          <p className="text-[10px] text-neutral-500 font-mono">
            {tr(`Stored in ${clients.length} client folders`, `Tersimpan di ${clients.length} folder klien`, `Tasimpan di ${clients.length} folder klien`)}
          </p>
        </div>

        {/* Card 2: Partner Logos */}
        <div className="p-4 rounded-2xl bg-[#111419] border border-white/5 space-y-1.5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">{tr("Partner Logos", "Logo Brand Marquee", "Logo Brand Marquee")}</span>
            <HiTag className="w-4 h-4 text-[#14AF9E]" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {clLogos.length}{" "}
            <span className="text-xs font-normal text-neutral-400">brand SVG/PNG</span>
          </p>
          <p className="text-[10px] text-neutral-500 font-mono">
            {tr("Running 2-row website marquee", "Running 2 baris marquee website", "Bajalan 2 barih marquee website")}
          </p>
        </div>

        {/* Card 3: Hero Scrollytelling Frames */}
        <div className="p-4 rounded-2xl bg-[#111419] border border-white/5 space-y-1.5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">{tr("Sequence Frames", "Cache Frame Scrolly", "Cache Frame Scrolly")}</span>
            <HiSparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {cachedFramesCount !== null ? cachedFramesCount : "..."}{" "}
            <span className="text-xs font-normal text-neutral-400">frames DB</span>
          </p>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-emerald-400 font-mono">IndexedDB Ready</span>
            {cachedFramesCount && cachedFramesCount > 0 ? (
              <button
                type="button"
                onClick={handleClearSequenceCache}
                disabled={isClearingFrames}
                className="text-[10px] text-rose-400 hover:underline cursor-pointer"
              >
                {tr("Clear", "Bersihkan", "Barasiahkan")}
              </button>
            ) : null}
          </div>
        </div>

        {/* Card 4: Cloud Sync Status */}
        <div className="p-4 rounded-2xl bg-[#111419] border border-white/5 space-y-1.5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">{tr("Cloud Storage", "Status Sinkronisasi", "Status Sinkronisasi")}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            Supabase <span className="text-xs font-normal text-emerald-400">Live</span>
          </p>
          <p className="text-[10px] text-neutral-500 font-mono truncate">
            Auto-compressed WebP & Canvas CDN
          </p>
        </div>
      </div>

      {/* Filter, Tabs, and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111419] border border-white/5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Tabs: All, Works, Logos */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-neutral-900 border border-white/5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#14AF9E] text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tr(`All (${allWorkAssets.length + allLogoAssets.length})`, `Semua (${allWorkAssets.length + allLogoAssets.length})`, `Kasadonyo (${allWorkAssets.length + allLogoAssets.length})`)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("works")}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "works"
                  ? "bg-[#14AF9E] text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tr(`Client Works (${allWorkAssets.length})`, `Karya Klien (${allWorkAssets.length})`, `Karya Klien (${allWorkAssets.length})`)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logos")}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "logos"
                  ? "bg-[#14AF9E] text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tr(`Marquee Logos (${allLogoAssets.length})`, `Logo Marquee (${allLogoAssets.length})`, `Logo Marquee (${allLogoAssets.length})`)}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr("Search assets by title, client, year...", "Cari nama karya, brand, atau tahun...", "Cari namo karya, brand, atau tahun...")}
              className="w-full bg-[#141820] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filters: Client Folder & Aspect Ratio */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-[11px] text-neutral-500 font-mono">Filter:</span>

          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-xs text-neutral-300 outline-none focus:border-[#14AF9E] cursor-pointer"
          >
            <option value="all">{tr("All Client Folders", "Semua Folder Klien", "Kasadonyo Folder Klien")}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.clientName} ({c.works?.length || 0})
              </option>
            ))}
          </select>

          <select
            value={selectedAspectFilter}
            onChange={(e) => setSelectedAspectFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-xs text-neutral-300 outline-none focus:border-[#14AF9E] cursor-pointer"
          >
            <option value="all">{tr("All Aspect Ratios", "Semua Rasio", "Kasadonyo Rasio")}</option>
            <option value="4:5">{tr("Portrait (4:5)", "Potret (4:5)", "Potret (4:5)")}</option>
            <option value="16:9">{tr("Landscape (16:9)", "Lanskap (16:9)", "Lanskap (16:9)")}</option>
            <option value="1:1">{tr("Square (1:1)", "Persegi (1:1)", "Pasegi (1:1)")}</option>
          </select>

          {(selectedClientFilter !== "all" || selectedAspectFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedClientFilter("all");
                setSelectedAspectFilter("all");
                setSearchQuery("");
              }}
              className="text-[11px] text-[#14AF9E] hover:underline cursor-pointer ml-auto font-mono"
            >
              {tr("Reset Filters", "Reset Filter", "Reset Filter")}
            </button>
          )}
        </div>
      </div>

      {/* Media Assets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono">
            {tr(
              `Showing ${filteredAssets.length} visual assets`,
              `Menampilkan ${filteredAssets.length} aset media`,
              `Manampilkan ${filteredAssets.length} aset media`
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredAssets.map((asset) => (
            <div
              key={`${asset.clientId}-${asset.id}`}
              onClick={() => setLightboxAsset(asset)}
              className="group relative rounded-xl overflow-hidden bg-neutral-950 border border-white/10 hover:border-[#14AF9E]/50 transition-all cursor-pointer shadow-md flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="aspect-[4/5] w-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                <img
                  src={asset.image}
                  alt={asset.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                    asset.category === "logo" ? "object-contain p-3 invert brightness-0" : ""
                  }`}
                />

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {asset.aspect}
                  </span>
                  {asset.category === "logo" && (
                    <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#14AF9E]/20 text-[#14AF9E] font-bold border border-[#14AF9E]/30">
                      Logo
                    </span>
                  )}
                </div>

                {/* Hover Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    title={tr("View Lightbox", "Lihat Preview Besar", "Caliak Preview Gadang")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxAsset(asset);
                    }}
                    className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                  >
                    <HiEye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title={tr("Copy URL", "Salin Link Gambar", "Salin Link Gambar")}
                    onClick={(e) => handleCopyLink(asset.image, e)}
                    className="w-8 h-8 rounded-full bg-[#14AF9E] hover:bg-[#119889] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                  >
                    <HiClipboardDocument className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title={tr("Download File", "Unduh File", "Unduah File")}
                    onClick={(e) => handleDownload(asset, e)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                  >
                    <HiArrowDownTray className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Caption Footer */}
              <div className="p-2.5 bg-neutral-950 border-t border-white/5 space-y-0.5">
                <p className="text-[10px] font-mono text-[#14AF9E] truncate uppercase font-semibold">
                  {asset.clientName}
                </p>
                <p className="text-xs font-semibold text-white truncate">
                  {asset.title}
                </p>
                {asset.year && (
                  <p className="text-[10px] text-neutral-500 font-mono">
                    {asset.year}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#111419] border border-white/5 space-y-2">
            <HiPhoto className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-white">
              {tr("No visual assets found.", "Tidak ada aset yang ditemukan.", "Indak ado aset nan basuo.")}
            </p>
            <p className="text-xs text-neutral-400">
              {tr("Try adjusting your search query or filters.", "Coba ubah kata kunci pencarian atau filter rasio/folder.", "Cubolah ubah kato kunci pancarian atau filter rasio/folder.")}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          LIGHTBOX MODAL FOR HIGH-RES PREVIEW
         ======================================================== */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-[#0e1116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-[#14AF9E] uppercase font-bold">
                  {lightboxAsset.clientName}
                </p>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {lightboxAsset.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(lightboxAsset.image)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <HiClipboardDocument className="w-3.5 h-3.5 text-[#14AF9E]" />
                  <span>{tr("Copy URL", "Salin Link", "Salin Link")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(lightboxAsset)}
                  className="px-3 py-1.5 rounded-lg bg-[#14AF9E] hover:bg-[#119889] text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HiArrowDownTray className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{tr("Download", "Unduh", "Unduah")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxAsset(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* High-res Image Canvas */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/90 min-h-[300px]">
              <img
                src={lightboxAsset.image}
                alt={lightboxAsset.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer Info */}
            <div className="p-3 border-t border-white/10 bg-neutral-950 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>Format: {lightboxAsset.aspect}</span>
                {lightboxAsset.year && <span>Year: {lightboxAsset.year}</span>}
                <span>Category: {lightboxAsset.category}</span>
              </div>
              {lightboxAsset.clientId && lightboxAsset.clientId !== "partner-logos" && onSelectClientFolder && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectClientFolder(lightboxAsset.clientId);
                    setLightboxAsset(null);
                  }}
                  className="text-xs text-[#14AF9E] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>{tr("Open in Client Folder →", "Buka di Folder Klien →", "Bukak di Folder Klien →")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

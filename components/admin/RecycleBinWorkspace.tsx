"use client";

import React, { useState, useMemo } from "react";
import {
  RiDeleteBinFill as HiTrash,
  RiRestartFill as HiArrowPath,
  RiSearchFill as HiMagnifyingGlass,
  RiImageFill as HiPhoto,
  RiFolderFill as HiFolder,
  RiMovieFill as HiVideoCamera,
  RiSparklingFill as HiSparkles,
  RiPriceTag3Fill as HiTag,
  RiCheckFill as HiCheck,
  RiAlertFill as HiExclamationTriangle,
  RiArrowGoBackFill as HiArrowUturnLeft,
  RiInformationFill as HiInformationCircle,
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolioData, TrashItem } from "@/context/PortfolioDataContext";
import { useLang } from "@/context/LanguageContext";

interface RecycleBinWorkspaceProps {
  showToast: (msg: string) => void;
}

export default function RecycleBinWorkspace({ showToast }: RecycleBinWorkspaceProps) {
  const { trashItems, restoreFromTrash, permanentDeleteFromTrash, emptyTrash } = usePortfolioData();
  const { lang, tr } = useLang();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "client-work" | "client-folder" | "flagship-video" | "other">("all");
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Grouping counts
  const counts = useMemo(() => {
    return {
      all: trashItems.length,
      works: trashItems.filter((t) => t.type === "client-work").length,
      folders: trashItems.filter((t) => t.type === "client-folder").length,
      videos: trashItems.filter((t) => t.type === "flagship-video").length,
      other: trashItems.filter((t) => t.type !== "client-work" && t.type !== "client-folder" && t.type !== "flagship-video").length,
    };
  }, [trashItems]);

  // Filtered trash items
  const filteredItems = useMemo(() => {
    return trashItems.filter((item) => {
      // Type filter
      if (activeFilter === "client-work" && item.type !== "client-work") return false;
      if (activeFilter === "client-folder" && item.type !== "client-folder") return false;
      if (activeFilter === "flagship-video" && item.type !== "flagship-video") return false;
      if (activeFilter === "other" && (item.type === "client-work" || item.type === "client-folder" || item.type === "flagship-video")) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchSub = item.subtitle?.toLowerCase().includes(q);
        return matchTitle || matchSub;
      }
      return true;
    });
  }, [trashItems, activeFilter, searchQuery]);

  // Handler: Restore single item
  const handleRestore = (item: TrashItem) => {
    setRestoringId(item.id);
    setTimeout(() => {
      const success = restoreFromTrash(item.id);
      setRestoringId(null);
      if (success) {
        showToast(
          tr(
            `"${item.title}" successfully restored back to its original location!`,
            `"${item.title}" berhasil dipulihkan kembali ke tempat asalnya!`,
            `"${item.title}" barasil dipuliahan babaliak ka tampek asanyo!`
          )
        );
      } else {
        showToast(tr("Failed to restore item.", "Gagal memulihkan item.", "Gagal mamuliahan item."));
      }
    }, 250);
  };

  // Handler: Restore all items
  const handleRestoreAll = () => {
    if (trashItems.length === 0) return;
    const confirmMsg = tr(
      "Restore all items from the Recycle Bin back to their original places?",
      "Pulihkan semua item dari Tong Sampah kembali ke tempat asalnya?",
      "Pulihan kasadonyo item dari Tong Sarok babaliak ka tampek asanyo?"
    );
    if (window.confirm(confirmMsg)) {
      const allIds = trashItems.map((t) => t.id);
      allIds.forEach((id) => restoreFromTrash(id));
      showToast(
        tr(
          "All items have been restored!",
          "Semua item telah berhasil dipulihkan kembali!",
          "Kasadonyo item lah barasil dipuliahan!"
        )
      );
    }
  };

  // Handler: Delete single item permanently
  const handlePermanentDelete = (item: TrashItem) => {
    const confirmMsg = tr(
      `Permanently delete "${item.title}"? This action cannot be undone.`,
      `Hapus permanen "${item.title}"? Item ini tidak akan dapat dikembalikan lagi.`,
      `Hapuih permanen "${item.title}"? Tindakan ko indak dapek dibaliakan lai.`
    );
    if (window.confirm(confirmMsg)) {
      permanentDeleteFromTrash(item.id);
      showToast(
        tr(
          `"${item.title}" permanently deleted.`,
          `"${item.title}" dihapus permanen dari sistem.`,
          `"${item.title}" dihapuih salamo-lamonyo.`
        )
      );
    }
  };

  // Handler: Empty entire trash
  const handleEmptyTrash = () => {
    emptyTrash();
    setConfirmEmptyOpen(false);
    showToast(
      tr(
        "Recycle Bin has been emptied.",
        "Tong Sampah telah dibersihkan sepenuhnya.",
        "Tong Sarok lah dibarasiahkan kasadonyo."
      )
    );
  };

  // Helper for human-readable relative time
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return tr("Just now", "Baru saja", "Baru se");
      if (diffMins < 60) return `${diffMins} ${tr("minutes ago", "menit yang lalu", "minik nan lalu")}`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ${tr("hours ago", "jam yang lalu", "jam nan lalu")}`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${tr("days ago", "hari yang lalu", "ari nan lalu")}`;
    } catch (_) {
      return dateStr;
    }
  };

  // Helper for item badge styling
  const getItemTypeBadge = (type: TrashItem["type"]) => {
    switch (type) {
      case "client-work":
        return {
          label: tr("Portfolio Work", "Karya Klien", "Karya Klien"),
          icon: HiPhoto,
          color: "bg-[#16b09f]/15 text-[#16b09f] border-[#16b09f]/30",
        };
      case "client-folder":
        return {
          label: tr("Client Folder", "Folder Klien", "Folder Klien"),
          icon: HiFolder,
          color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        };
      case "flagship-video":
        return {
          label: tr("Flagship Video", "Video Showcase", "Video Showcase"),
          icon: HiVideoCamera,
          color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
        };
      case "runner-item":
        return {
          label: tr("Runner Card", "Kartu Runner", "Kartu Runner"),
          icon: HiSparkles,
          color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
        };
      case "client-logo":
        return {
          label: tr("Partner Logo", "Logo Brand", "Logo Brand"),
          icon: HiTag,
          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      default:
        return {
          label: tr("Item", "Item", "Item"),
          icon: HiPhoto,
          color: "bg-neutral-800 text-neutral-300 border-white/10",
        };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0d0f13] select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-[#181216]/60 to-neutral-950 border border-rose-500/20 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <HiTrash className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-mono tracking-widest text-rose-400 uppercase font-semibold">
                  {tr("SYSTEM RESTORE & RECYCLE BIN", "SISTEM PEMULIHAN & TONG SAMPAH", "SISTEM PAMULIAHAN & TONG SAROK")}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span>{tr("Recycle Bin & Safe Recovery", "Tong Sampah & Pemulihan Aman", "Tong Sarok & Pamuliahan Aman")}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  {trashItems.length} {tr("items", "item", "item")}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                {tr(
                  "Items deleted by mistake are safely held here. You can restore them back to their exact original folder or delete them permanently.",
                  "Item yang tidak sengaja terhapus tersimpan dengan aman di sini. Anda dapat memulihkannya kembali ke foldernya masing-masing dalam 1-klik, atau menghapusnya permanen.",
                  "Item nan indak sangajo tahapuih tasimpan aman di siko. Sanak dapek mamuliahan babaliak ka foldernyo masiang-masiang dalam 1-klik, atau mahapuih salamo-lamonyo."
                )}
              </p>
            </div>

            {/* Quick Action Buttons */}
            {trashItems.length > 0 && (
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <HiArrowUturnLeft className="w-4 h-4" />
                  <span>{tr("Restore All", "Pulihkan Semua", "Puliahan Kasadonyo")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmEmptyOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-500/10"
                >
                  <HiTrash className="w-4 h-4" />
                  <span>{tr("Empty Trash", "Kosongkan Sampah", "Kosongkan Sarok")}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3.5 rounded-2xl bg-[#111419] border border-white/5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-neutral-900 border border-white/5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr(`All (${counts.all})`, `Semua (${counts.all})`, `Kasadonyo (${counts.all})`)}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("client-work")}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === "client-work"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr(`Works (${counts.works})`, `Karya (${counts.works})`, `Karya (${counts.works})`)}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("client-folder")}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === "client-folder"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr(`Folders (${counts.folders})`, `Folder (${counts.folders})`, `Folder (${counts.folders})`)}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("flagship-video")}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === "flagship-video"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr(`Videos (${counts.videos})`, `Video (${counts.videos})`, `Video (${counts.videos})`)}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("other")}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === "other"
                    ? "bg-[#16b09f] text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr(`Others (${counts.other})`, `Lainnya (${counts.other})`, `Lainnyo (${counts.other})`)}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tr("Search deleted items...", "Cari item di tong sampah...", "Cari item di tong sarok...")}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder:text-neutral-600 text-xs focus:outline-none focus:border-[#16b09f] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="p-12 sm:p-16 rounded-3xl bg-[#111419]/70 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center shadow-xl">
              {trashItems.length === 0 ? (
                <HiCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
              ) : (
                <HiMagnifyingGlass className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-500" />
              )}
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {trashItems.length === 0
                  ? tr("Recycle Bin is Empty", "Tong Sampah Kosong", "Tong Sarok Kosong")
                  : tr("No Matching Deleted Items", "Tidak Ada Item yang Cocok", "Indak Ado Item Nan Sasuai")}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                {trashItems.length === 0
                  ? tr(
                      "All your works, folders, and showcase media are active and safe. Items you delete in the admin dashboard will appear here.",
                      "Semua karya, folder klien, dan video Anda aktif dan aman. Item yang dihapus di dashboard admin akan tersimpan sementara di sini.",
                      "Kasadonyo karya, folder klien, jo video Sanak aktif sarato aman. Item nan dihapuih di dashboard admin ka tasimpan samantaro di siko."
                    )
                  : tr(
                      "Try changing your search term or active category filter.",
                      "Coba ubah kata kunci pencarian atau ganti filter kategori.",
                      "Cuba ganti kato pancarian atau piliah filter kategori lain."
                    )}
              </p>
            </div>
          </div>
        )}

        {/* Grid of Deleted Items */}
        {filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredItems.map((item) => {
                const badge = getItemTypeBadge(item.type);
                const BadgeIcon = badge.icon;
                const isRestoring = restoringId === item.id;
                const itemBytes = (item.previewImage?.length || 0) + (item.payload ? JSON.stringify(item.payload).length : 0);
                const itemSizeStr = itemBytes > 1048576 ? `${(itemBytes / 1048576).toFixed(1)} MB` : `${Math.max(45, Math.round(itemBytes / 1024))} KB`;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl bg-[#111419] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Thumbnail Preview */}
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 flex items-center justify-center">
                        {item.previewImage ? (
                          <img
                            src={item.previewImage}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-600 gap-1.5 p-4">
                            <BadgeIcon className="w-8 h-8" />
                            <span className="text-[11px] font-mono">{badge.label}</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border backdrop-blur-md ${badge.color}`}>
                            <BadgeIcon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-neutral-300 text-[10px] font-mono flex items-center gap-1.5">
                            <span className="text-cyan-400 font-semibold">{itemSizeStr}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(item.deletedAt)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-[#16b09f] transition-colors">
                          {item.title || tr("Untitled Item", "Item Tanpa Judul", "Item Tanpa Judul")}
                        </h4>
                        {item.subtitle && (
                          <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5 font-light">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Restore & Delete Forever */}
                    <div className="pt-4 mt-3 border-t border-white/5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRestore(item)}
                        disabled={isRestoring}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/5"
                        title={tr("Restore back to original place", "Pulihkan kembali ke tempat asalnya", "Puliahan babaliak ka tampek asanyo")}
                      >
                        <HiArrowUturnLeft className={`w-3.5 h-3.5 ${isRestoring ? "animate-spin" : ""}`} />
                        <span>
                          {isRestoring
                            ? tr("Restoring...", "Memulihkan...", "Mamuliahan...")
                            : tr("Restore", "Pulihkan", "Puliahan")}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermanentDelete(item)}
                        className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                        title={tr("Delete permanently", "Hapus permanen", "Hapuih permanen")}
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{tr("Delete", "Hapus", "Hapuih")}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Modal Confirmation: Empty Trash */}
        {confirmEmptyOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setConfirmEmptyOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-neutral-950 border border-rose-500/30 p-6 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <HiExclamationTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {tr("Empty Recycle Bin?", "Kosongkan Tong Sampah?", "Kosongkan Tong Sarok?")}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {tr(
                      `Permanently delete all ${trashItems.length} items? This cannot be undone.`,
                      `Hapus permanen semua ${trashItems.length} item? Tindakan ini tidak dapat dibatalkan.`,
                      `Hapuih kasadonyo ${trashItems.length} item? Tindakan ko indak dapek dibaliakan.`
                    )}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-start gap-2.5 text-xs text-rose-300">
                <HiInformationCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>
                  {tr(
                    "All deleted images, folders, and videos in this trash will be permanently cleared from local storage.",
                    "Semua foto, folder, dan video yang ada di tong sampah akan dihapus bersih selamanya dari penyimpanan lokal.",
                    "Kasadonyo foto, folder, jo video di tong sarok ka dihapuih barasiah dari panyimpanan lokal."
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmEmptyOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  {tr("Cancel", "Batal", "Batal")}
                </button>
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  {tr("Yes, Empty Everything", "Ya, Kosongkan Semua", "Iyo, Kosongkan Kasadonyo")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  RiBox3Fill,
  RiBox3Line,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine,
  RiRefreshLine,
  RiLockLine,
  RiLockUnlockLine,
  RiEyeLine,
  RiStarFill,
  RiGlobalLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiFileList3Line,
  RiPaintLine,
  RiVideoLine,
  RiCompass3Line,
  RiRocketLine,
  RiTeamLine,
  RiCameraLine,
  RiMagicLine,
  RiSparklingLine,
  RiSave3Line,
  RiTranslate2,
  RiUserFollowLine,
  RiImageAddLine,
  RiUploadCloud2Line,
  RiImageLine,
  RiDriveLine,
  RiYoutubeFill,
  RiHardDrive2Line,
  RiInformationLine,
  RiCheckboxCircleFill,
  RiExternalLinkLine,
  RiAlertLine,
  RiBankCardLine,
} from "react-icons/ri";
import { parseMediaUrl, resolveThumbnailUrl } from "@/lib/mediaUrlHelper";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import {
  getAllProducts,
  saveAllProducts,
  updateProduct,
  addProduct,
  deleteProduct,
  toggleProductClosed,
  subscribeToProductsRealtime,
  ProductItem,
  ProductPackage,
  DEFAULT_CATEGORIES,
} from "@/lib/productsService";
import {
  getAllTrackedProjects,
  ProjectTrackingItem,
  subscribeToTrackerRealtime,
} from "@/lib/projectTrackerService";

const AVAILABLE_ICONS = [
  { name: "RiPaintLine", label: "Branding / Paint", icon: RiPaintLine },
  { name: "RiGlobalLine", label: "Web / Global", icon: RiGlobalLine },
  { name: "RiVideoLine", label: "Video", icon: RiVideoLine },
  { name: "RiBox3Line", label: "3D / Box", icon: RiBox3Line },
  { name: "RiMagicLine", label: "Digital Imaging", icon: RiMagicLine },
  { name: "RiCameraLine", label: "Photography", icon: RiCameraLine },
  { name: "RiTeamLine", label: "Team / Sosmed", icon: RiTeamLine },
  { name: "RiCompass3Line", label: "Drone / Compass", icon: RiCompass3Line },
  { name: "RiRocketLine", label: "Startup / Rocket", icon: RiRocketLine },
  { name: "RiSparklingLine", label: "Sparkles", icon: RiSparklingLine },
];


interface ProductThumbnailUploaderFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (val: string) => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  onClear: () => void;
  placeholder?: string;
}

function ProductThumbnailUploaderField({
  label,
  sublabel,
  value,
  onChange,
  onUploadFile,
  isUploading,
  onClear,
  placeholder,
}: ProductThumbnailUploaderFieldProps) {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseMediaUrl(value), [value]);
  const resolved = useMemo(() => resolveThumbnailUrl(value), [value]);

  useEffect(() => {
    setImageError(false);
  }, [value, resolved]);

  return (
    <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/10 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
          <RiImageLine className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{label}</span>
          {sublabel && (
            <span className="text-[11px] text-neutral-400 font-normal hidden sm:inline">
              — {sublabel}
            </span>
          )}
        </label>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-rose-400 hover:text-rose-300 transition cursor-pointer"
          >
            Hapus Gambar
          </button>
        )}
      </div>

      {/* Preset Source Quick Buttons (Upload Internal / Google Drive / YouTube / Web URL) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
            parsed.type === "direct" && value.includes("portfolio-media")
              ? "bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-sm"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
          }`}
        >
          <RiHardDrive2Line className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">Upload Internal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!value) onChange("https://drive.google.com/file/d/");
          }}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
            parsed.type === "gdrive"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
          }`}
        >
          <RiDriveLine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Google Drive</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!value) onChange("https://www.youtube.com/watch?v=");
          }}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
            parsed.type === "youtube"
              ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
          }`}
        >
          <RiYoutubeFill className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">Link YouTube</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!value) onChange("https://images.unsplash.com/");
          }}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
            parsed.type === "direct" && !value.includes("portfolio-media") && value
              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
          }`}
        >
          <RiGlobalLine className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">URL Web / CDN</span>
        </button>
      </div>

      {/* Hidden File Input for Internal Device Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={onUploadFile}
        className="hidden"
      />

      {/* Main Container: Preview & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Preview Box */}
        <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-black/80 border border-white/10 shrink-0 flex items-center justify-center">
          {resolved && !imageError ? (
            <>
              <img
                src={resolved}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover object-center"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Source Tag Badge */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                {parsed.type === "gdrive" && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono flex items-center gap-1 shadow-md">
                    <RiDriveLine className="w-3 h-3 text-emerald-400" />
                    Google Drive
                  </span>
                )}
                {parsed.type === "youtube" && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/50 text-rose-300 text-[10px] font-mono flex items-center gap-1 shadow-md">
                    <RiYoutubeFill className="w-3 h-3 text-rose-400" />
                    YouTube Cover
                  </span>
                )}
                {parsed.type === "direct" && value.includes("portfolio-media") && (
                  <span className="px-2 py-0.5 rounded-md bg-teal-950/90 border border-teal-500/50 text-teal-300 text-[10px] font-mono flex items-center gap-1 shadow-md">
                    <RiHardDrive2Line className="w-3 h-3 text-teal-400" />
                    Internal Storage
                  </span>
                )}
                {parsed.type === "direct" && !value.includes("portfolio-media") && (
                  <span className="px-2 py-0.5 rounded-md bg-neutral-900/90 border border-white/20 text-neutral-300 text-[10px] font-mono flex items-center gap-1 shadow-md">
                    <RiGlobalLine className="w-3 h-3 text-cyan-400" />
                    Web URL
                  </span>
                )}
              </div>
            </>
          ) : imageError ? (
            <div className="flex flex-col items-center justify-center text-amber-400 gap-1 text-center p-3">
              <RiAlertLine className="w-6 h-6 text-amber-400" />
              <span className="text-[10px] font-semibold">Gagal Memuat Gambar</span>
              <span className="text-[9px] text-neutral-400 leading-tight">
                {parsed.type === "gdrive"
                  ? "Pastikan izin Google Drive: 'Siapa saja yang memiliki link'"
                  : "Periksa kembali format URL gambar"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-500 gap-1 text-center p-2">
              <RiImageLine className="w-6 h-6 opacity-40" />
              <span className="text-[10px]">Belum Ada Gambar</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-teal-400 text-xs font-semibold gap-1.5 z-10">
              <RiRefreshLine className="w-5 h-5 animate-spin" />
              <span>Mengunggah File Internal...</span>
            </div>
          )}
        </div>

        {/* Input & Helper Area */}
        <div className="flex-1 space-y-2.5 w-full">
          {/* Quick upload button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
            >
              <RiUploadCloud2Line className="w-4 h-4" />
              <span>{isUploading ? "Mengunggah File..." : "Upload Gambar dari Internal (Komputer / HP)"}</span>
            </button>
          </div>

          {/* Unified URL input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>Link Google Drive / YouTube / URL Gambar:</span>
              {parsed.type === "youtube" && parsed.watchUrl && (
                <a
                  href={parsed.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Cek Video YouTube</span>
                  <RiExternalLinkLine className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={
                  placeholder ||
                  "Contoh: drive.google.com/file/d/... ATAU youtube.com/watch?v=... ATAU https://..."
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-black text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500 font-mono pr-8"
              />
              {value && (
                <button
                  type="button"
                  onClick={onClear}
                  className="absolute right-2.5 text-neutral-400 hover:text-white"
                  title="Kosongkan"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Live Dynamic Helper Tips */}
          {parsed.type === "gdrive" && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2 animate-fadeIn">
              <RiDriveLine className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold block">Link Google Drive Terdeteksi!</span>
                <span className="text-emerald-400/90 text-[10px]">
                  Otomatis dikonversi ke gambar langsung. Pastikan setelan berbagi di Google Drive diatur ke: <strong>"Siapa saja yang memiliki link" (Anyone with the link)</strong>.
                </span>
              </div>
            </div>
          )}

          {parsed.type === "youtube" && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-2 animate-fadeIn">
              <RiYoutubeFill className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold block">Video YouTube Terdeteksi!</span>
                <span className="text-rose-400/90 text-[10px]">
                  Cover thumbnail resolusi tinggi otomatis diambil dari video (ID: <code>{parsed.youtubeId}</code>).
                </span>
              </div>
            </div>
          )}

          {parsed.type === "direct" && value.includes("portfolio-media") && (
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-300 flex items-center gap-1.5">
              <RiCheckboxCircleFill className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Gambar tersimpan aman di internal storage Supabase CDN.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsWorkspace() {
  const { lang, tr, toMinang } = useLang();
  const { primaryColor } = useMotionTheme();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [trackedOrders, setTrackedOrders] = useState<ProjectTrackingItem[]>([]);

  // Modal edit states
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isNewProduct, setIsNewProduct] = useState<boolean>(false);
  const [activeEditTab, setActiveEditTab] = useState<"basic" | "features" | "packages">("basic");
  const [activeLangTab, setActiveLangTab] = useState<"id" | "en" | "min">("id");
  const [activePkgTab, setActivePkgTab] = useState<string>("pro");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadingThumb, setUploadingThumb] = useState<boolean>(false);

  // Upload thumbnail image directly to Supabase storage
  const handleUploadThumbnail = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isPackageLevel = false
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");
      const res = await fetch("/api/admin/media-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (isPackageLevel) {
          setEditingProduct({
            ...editingProduct,
            packages: editingProduct.packages.map((p) =>
              p.id === activePkgTab ? { ...p, thumbnailUrl: data.url } : p
            ),
          });
        } else {
          setEditingProduct({
            ...editingProduct,
            thumbnailUrl: data.url,
          });
        }
        showToast(
          tr(
            "Thumbnail berhasil diunggah!",
            "Thumbnail uploaded successfully!",
            "Thumbnail barasia diunggah!"
          )
        );
      } else {
        alert("Gagal mengunggah gambar: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Gagal mengunggah thumbnail: " + (err.message || err));
    } finally {
      setUploadingThumb(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  // New deliverable / feature inputs
  const [newKeyFeature, setNewKeyFeature] = useState<string>("");
  const [newPkgDeliverable, setNewPkgDeliverable] = useState<string>("");

  // Load products on mount
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Fetch tracked orders for badge
    const fetchOrders = async () => {
      try {
        const data = await getAllTrackedProjects();
        setTrackedOrders(data);
      } catch (err) {
        console.warn("Tracker badge fetch notice:", err);
      }
    };
    fetchOrders();

    // Realtime subscriptions across tabs and devices
    const unsubscribeProducts = subscribeToProductsRealtime((freshProducts) => {
      if (Array.isArray(freshProducts)) {
        setProducts(freshProducts);
      }
    });

    const unsubscribeTracker = subscribeToTrackerRealtime((freshOrders) => {
      if (Array.isArray(freshOrders)) {
        setTrackedOrders(freshOrders);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeTracker();
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 3500);
  };

  // Stats
  const totalCount = products.length;
  const activeCount = products.filter((p) => !p.isClosed).length;
  const closedCount = products.filter((p) => p.isClosed).length;
  const pendingOrdersCount = trackedOrders.filter((o) => o.currentStage === "queued").length;
  const totalOrdersCount = trackedOrders.length;

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Toggle quick open/closed
  const handleToggleClosed = async (product: ProductItem) => {
    const nextClosed = !product.isClosed;
    const defaultReason = nextClosed ? "Slot Penuh / Pesanan Ditutup Sementara" : "";
    try {
      await toggleProductClosed(product.id, nextClosed, defaultReason);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, isClosed: nextClosed, closeReason: defaultReason }
            : p
        )
      );
      showToast(
        nextClosed
          ? tr(
              `Product "${product.title}" is now CLOSED`,
              `Produk "${product.title}" berhasil DITUTUP`,
              `Produk "${product.title}" barasia DITUTUIK`
            )
          : tr(
              `Product "${product.title}" is now OPEN`,
              `Produk "${product.title}" berhasil DIBUKA KEMBALI`,
              `Produk "${product.title}" barasia DIBUKAK BALIAK`
            )
      );
    } catch (e) {
      console.error(e);
      showToast("Gagal mengubah status produk");
    }
  };

  // Delete product
  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        tr(
          `Are you sure you want to delete product "${title}"?`,
          `Apakah Anda yakin ingin menghapus produk "${title}"?`,
          `Apokah Sanak yakin nio mahapuih produk "${title}"?`
        )
      )
    ) {
      return;
    }
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(
        tr(
          `Product "${title}" deleted`,
          `Produk "${title}" berhasil dihapus`,
          `Produk "${title}" barasia tahapuih`
        )
      );
    } catch (e) {
      console.error(e);
      showToast("Gagal menghapus produk");
    }
  };

  // Open edit modal
  const handleStartEdit = (product: ProductItem) => {
    // Clone deeply to avoid mutation before save
    setEditingProduct(JSON.parse(JSON.stringify(product)));
    setIsNewProduct(false);
    setActiveEditTab("basic");
    setActiveLangTab("id");
    setActivePkgTab(product.packages?.[0]?.id || "pro");
  };

  // Open create new modal
  const handleStartCreate = () => {
    const newId = `product-${Date.now().toString(36)}`;
    const newTemplate: ProductItem = {
      id: newId,
      title: "Layanan Baru",
      titleEn: "New Creative Service",
      titleMin: "Jaso Baru",
      category: "branding",
      categoryLabel: "Branding & Identitas",
      categoryLabelEn: "Branding & Identity",
      categoryLabelMin: "Branding & Identitas",
      tagline: "Solusi kreatif inovatif untuk pertumbuhan bisnis modern.",
      taglineEn: "Innovative creative solution engineered for modern business scale.",
      taglineMin: "Solusi kreatif rancak untuak kamajuan usaho modern.",
      description:
        "Deskripsi mendalam mengenai lingkup layanan, proses kreatif, dan output bernilai tinggi yang dihasilkan.",
      descriptionEn:
        "Comprehensive description detailing service scope, strategic creative process, and high-value outputs.",
      descriptionMin:
        "Panjalehan mandalam tantang jaso, caro karajo kreatif, sarato hasil karya nan barago tinggi.",
      popular: false,
      isClosed: false,
      closeReason: "Slot Penuh",
      closeReasonEn: "Orders Closed",
      closeReasonMin: "Slot Panuah",
      iconName: "RiSparklingLine",
      keyFeatures: [
        "Konsep Orisinal & Strategis",
        "Master File Lengkap Siap Pakai",
        "Revisi Cepat & Terarah",
        "Hak Cipta Komersial Penuh",
      ],
      keyFeaturesEn: [
        "Strategic & Original Concept",
        "Complete Master Files Ready for Use",
        "Fast & Iterative Revision Sprints",
        "Full Commercial Ownership Rights",
      ],
      keyFeaturesMin: [
        "Konsep Asli & Strategis",
        "Berkas Master Lengkok Siap Pakai",
        "Revisi Lakeh & Tapek Sasaran",
        "Hak Cipta Panuah Rasmi",
      ],
      packages: [
        {
          id: "starter",
          name: "Starter Package",
          nameEn: "Starter Package",
          nameMin: "Paket Starter",
          badge: "Cocok untuk UMKM",
          badgeEn: "Great for Startups",
          badgeMin: "Cocok untuak UMKM",
          priceNote: "Sesuai Lingkup Proyek",
          priceNoteEn: "Scope Based",
          priceNoteMin: "Sasuai Lingkup Karajo",
          duration: "3 - 5 Hari Kerja",
          durationEn: "3 - 5 Business Days",
          durationMin: "3 - 5 Hari Karajo",
          revisions: "2x Revisi",
          revisionsEn: "2x Revisions",
          revisionsMin: "2x Revisi",
          description: "Fondasi layanan esensial untuk kebutuhan awal bisnis.",
          descriptionEn: "Essential package for early-stage business requirements.",
          descriptionMin: "Fondasi jaso utamo untuak kabutuhan awal usaho.",
          deliverables: [
            "Output Utama Resolusi Tinggi",
            "Format File Lengkap Siap Pakai",
            "Konsultasi Awal Proyek",
          ],
          deliverablesEn: [
            "High-Resolution Primary Output",
            "Complete Formats Ready for Use",
            "Initial Project Strategy Kickoff",
          ],
          deliverablesMin: [
            "Hasil Utamo Kualitas Tinggi",
            "Format Berkas Lengkok Siap Pakai",
            "Rundiang Awal Proyek",
          ],
          isClosed: false,
        },
        {
          id: "pro",
          name: "Professional System",
          nameEn: "Professional System",
          nameMin: "Paket Profesional",
          badge: "Paling Populer",
          badgeEn: "Most Popular",
          badgeMin: "Paliang Dipiliah",
          priceNote: "Standar Agensi",
          priceNoteEn: "Agency Standard",
          priceNoteMin: "Standar Agensi",
          duration: "7 - 12 Hari Kerja",
          durationEn: "7 - 12 Business Days",
          durationMin: "7 - 12 Hari Karajo",
          revisions: "4x Revisi",
          revisionsEn: "4x Revisions",
          revisionsMin: "4x Revisi",
          description: "Solusi komprehensif dengan hasil kerja matang untuk bisnis bertumbuh.",
          descriptionEn: "Comprehensive system with refined execution for scaling companies.",
          descriptionMin: "Solusi langkok jo hasil matang untuak usaho nan sadang bakambang.",
          deliverables: [
            "2-3 Eksplorasi Konsep Terarah",
            "Sistem Deliverables Lengkap",
            "Master File Resolusi Tinggi & Vector",
            "Panduan & Dukungan Implementasi",
          ],
          deliverablesEn: [
            "2-3 Directional Concept Explorations",
            "Comprehensive Deliverables Suite",
            "High-Res Master & Vector Files",
            "Implementation Support & Handoff",
          ],
          deliverablesMin: [
            "2-3 Pilihan Konsep Tapiliah",
            "Paket Hasil Karajo Langkok",
            "Berkas Master Kualitas Tinggi",
            "Panduan & Bantuan Pasang",
          ],
          isClosed: false,
        },
        {
          id: "enterprise",
          name: "Enterprise 360° Scale",
          nameEn: "Enterprise 360° Scale",
          nameMin: "Skala Parusahoan Gadang",
          badge: "Skala Korporasi",
          badgeEn: "Enterprise Grade",
          badgeMin: "Skala Parusahoan Gadang",
          priceNote: "Custom Project Scale",
          priceNoteEn: "Custom Scope",
          priceNoteMin: "Sasuai Ukuran Proyek",
          duration: "14 - 25 Hari Kerja",
          durationEn: "14 - 25 Business Days",
          durationMin: "14 - 25 Hari Karajo",
          revisions: "Revisi Dedicated Sprint",
          revisionsEn: "Dedicated Sprint Revisions",
          revisionsMin: "Revisi Khusus Panuah",
          description: "Solusi skala penuh ujung-ke-ujung untuk korporat atau kampanye besar.",
          descriptionEn: "End-to-end full-scale solution for corporate campaigns and flagship operations.",
          descriptionMin: "Solusi sabana komplit dari awal sampai akia untuak parusahoan gadang.",
          deliverables: [
            "Arsitektur Proyek Mendalam",
            "Deliverables Skala Penuh Terintegrasi",
            "Dokumentasi & Handoff Kepemilikan 100%",
            "Dedicated Project Director",
          ],
          deliverablesEn: [
            "Deep Project Architecture & Strategy",
            "Full-Scale Integrated Deliverables",
            "100% Intellectual Property Transfer",
            "Dedicated Project Director",
          ],
          deliverablesMin: [
            "Susunan Proyek Mandalam",
            "Hasil Karajo Skala Gadang Terpadu",
            "Panyarahan Hak Milik 100%",
            "Pangawas Proyek Khusus",
          ],
          isClosed: false,
        },
      ],
    };

    setEditingProduct(newTemplate);
    setIsNewProduct(true);
    setActiveEditTab("basic");
    setActiveLangTab("id");
    setActivePkgTab("pro");
  };

  // Auto-generate Minang from Indonesian fields
  const handleAutoTranslateMinang = () => {
    if (!editingProduct) return;
    const updated: ProductItem = {
      ...editingProduct,
      titleMin: toMinang(editingProduct.title),
      categoryLabelMin: toMinang(editingProduct.categoryLabel),
      taglineMin: toMinang(editingProduct.tagline),
      descriptionMin: toMinang(editingProduct.description),
      closeReasonMin: editingProduct.closeReason
        ? toMinang(editingProduct.closeReason)
        : "Slot Panuah / Ditutuik Samantaro",
      keyFeaturesMin: (editingProduct.keyFeatures || []).map((f) => toMinang(f)),
      packages: (editingProduct.packages || []).map((pkg) => ({
        ...pkg,
        nameMin: toMinang(pkg.name),
        badgeMin: pkg.badge ? toMinang(pkg.badge) : undefined,
        priceNoteMin: toMinang(pkg.priceNote),
        durationMin: toMinang(pkg.duration),
        revisionsMin: toMinang(pkg.revisions),
        descriptionMin: toMinang(pkg.description),
        deliverablesMin: (pkg.deliverables || []).map((d) => toMinang(d)),
      })),
    };
    setEditingProduct(updated);
    showToast(
      tr(
        "Minang translations generated automatically from Indonesian",
        "Terjemahan Bahasa Minang berhasil digenerate otomatis dari Bahasa Indonesia",
        "Bahaso Minang barasia dibuek otomatis dari Bahaso Indonesia"
      )
    );
  };

  // Save product changes
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.id.trim()) {
      alert("Product ID tidak boleh kosong");
      return;
    }
    if (!editingProduct.title.trim()) {
      alert("Judul produk tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    try {
      const productToSave: ProductItem = {
        ...editingProduct,
        titleEn: editingProduct.titleEn || editingProduct.title,
        titleMin: editingProduct.titleMin || toMinang(editingProduct.title),
        taglineEn: editingProduct.taglineEn || editingProduct.tagline,
        taglineMin: editingProduct.taglineMin || toMinang(editingProduct.tagline),
        descriptionEn: editingProduct.descriptionEn || editingProduct.description,
        descriptionMin: editingProduct.descriptionMin || toMinang(editingProduct.description),
      };

      if (isNewProduct) {
        await addProduct(productToSave);
        setProducts((prev) => [productToSave, ...prev]);
        showToast(
          tr(
            `Product "${productToSave.title}" created successfully!`,
            `Produk baru "${productToSave.title}" berhasil ditambahkan!`,
            `Produk baru "${productToSave.title}" barasia ditambahkan!`
          )
        );
      } else {
        await updateProduct(productToSave.id, productToSave);
        setProducts((prev) =>
          prev.map((p) => (p.id === productToSave.id ? productToSave : p))
        );
        showToast(
          tr(
            `Product "${productToSave.title}" updated successfully!`,
            `Perubahan produk "${productToSave.title}" berhasil disimpan secara realtime!`,
            `Parubahan produk "${productToSave.title}" barasia tasimpan sacaro realtime!`
          )
        );
      }
      setEditingProduct(null);
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menyimpan produk: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to add/remove key features
  const handleAddKeyFeature = () => {
    if (!newKeyFeature.trim() || !editingProduct) return;
    const feat = newKeyFeature.trim();
    const featEn = feat;
    const featMin = toMinang(feat);

    setEditingProduct({
      ...editingProduct,
      keyFeatures: [...(editingProduct.keyFeatures || []), feat],
      keyFeaturesEn: [...(editingProduct.keyFeaturesEn || []), featEn],
      keyFeaturesMin: [...(editingProduct.keyFeaturesMin || []), featMin],
    });
    setNewKeyFeature("");
  };

  const handleRemoveKeyFeature = (idx: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      keyFeatures: editingProduct.keyFeatures.filter((_, i) => i !== idx),
      keyFeaturesEn: editingProduct.keyFeaturesEn?.filter((_, i) => i !== idx),
      keyFeaturesMin: editingProduct.keyFeaturesMin?.filter((_, i) => i !== idx),
    });
  };

  // Helper to add/remove package deliverables
  const handleAddDeliverable = (pkgId: string) => {
    if (!newPkgDeliverable.trim() || !editingProduct) return;
    const del = newPkgDeliverable.trim();
    const delEn = del;
    const delMin = toMinang(del);

    setEditingProduct({
      ...editingProduct,
      packages: (editingProduct.packages || []).map((pkg) => {
        if (pkg.id !== pkgId) return pkg;
        return {
          ...pkg,
          deliverables: [...(pkg.deliverables || []), del],
          deliverablesEn: [...(pkg.deliverablesEn || []), delEn],
          deliverablesMin: [...(pkg.deliverablesMin || []), delMin],
        };
      }),
    });
    setNewPkgDeliverable("");
  };

  const handleRemoveDeliverable = (pkgId: string, idx: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      packages: (editingProduct.packages || []).map((pkg) => {
        if (pkg.id !== pkgId) return pkg;
        return {
          ...pkg,
          deliverables: pkg.deliverables.filter((_, i) => i !== idx),
          deliverablesEn: pkg.deliverablesEn?.filter((_, i) => i !== idx),
          deliverablesMin: pkg.deliverablesMin?.filter((_, i) => i !== idx),
        };
      }),
    });
  };

  const currentPkg = editingProduct?.packages?.find((p) => p.id === activePkgTab);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-[1600px] mx-auto">
      {/* Toast Alert */}
      {statusMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <RiCheckLine className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-black/80 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <RiBox3Fill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {tr(
                  "Products & Services Catalog",
                  "Katalog Produk & Layanan",
                  "Katalog Produk & Jaso"
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                  Live Cloud
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                {tr(
                  "Manage services, pricing packages, active/closed order status, and multilingual content (EN / ID / MIN).",
                  "Kelola produk, paket tier harga, status buka/tutup pesanan, dan sinkronisasi 3 bahasa (EN / ID / MIN).",
                  "Atua produk, paket harago, status bukak/tutuik pasan, sarato sinkron 3 bahaso (EN / ID / MIN)."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-black transition shadow-lg shadow-teal-500/20 active:scale-95 cursor-pointer"
          >
            <span>{tr("Add New Product", "Tambah Produk Baru", "Tambah Produk Baru")}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
              {tr("Total Products", "Total Produk", "Total Kasadonyo Produk")}
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300">
            <RiFileList3Line className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400 font-mono uppercase tracking-wider">
              {tr("Orders Open (Active)", "Pesanan Buka (Aktif)", "Pasan Dibukak (Aktif)")}
            </p>
            <h3 className="text-2xl font-bold text-emerald-300 mt-1">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <RiLockUnlockLine className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-rose-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-400 font-mono uppercase tracking-wider">
              {tr("Orders Closed (Full Slot)", "Pesanan Ditutup (Slot Penuh)", "Pasan Ditutuik (Slot Panuah)")}
            </p>
            <h3 className="text-2xl font-bold text-rose-300 mt-1">{closedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <RiLockLine className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/40 border border-white/5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {DEFAULT_CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const label =
              lang === "en"
                ? cat.labelEn || cat.label
                : lang === "min"
                ? cat.labelMin || cat.label
                : cat.label;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                  isCatActive
                    ? "bg-white text-black font-semibold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tr("Search products...", "Cari produk...", "Cari produk...")}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-neutral-950 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 text-sm">
          {tr("Loading products...", "Memuat data produk...", "Mambaco data produk...")}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 text-neutral-400 text-sm">
          {tr("No products found.", "Tidak ada produk yang cocok.", "Indak ado produk nan cocok.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isClosed = product.isClosed;
            const pkgCount = product.packages?.length || 0;

            return (
              <div
                key={product.id}
                className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isClosed
                    ? "bg-neutral-950/80 border-rose-500/20 hover:border-rose-500/40 opacity-80"
                    : "bg-neutral-900/60 border-white/10 hover:border-teal-500/40 hover:bg-neutral-900/90 shadow-xl"
                }`}
              >
                {/* Closed Overlay Ribbon if Closed */}
                {isClosed && (
                  <div className="bg-rose-500/15 border-b border-rose-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs text-rose-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <RiLockLine className="w-3.5 h-3.5" />
                      {product.closeReason || tr("Orders Closed", "Pesanan Ditutup", "Pasan Ditutuik")}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                      Closed
                    </span>
                  </div>
                )}

                {/* Thumbnail Preview on Top of Admin Card */}
                <div className="relative w-full h-32 overflow-hidden bg-black/60 border-b border-white/5">
                  <img
                    src={
                      resolveThumbnailUrl(product.thumbnailUrl) ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 border border-white/10 text-teal-300 backdrop-blur-md">
                      {product.categoryLabel}
                    </span>
                    {product.popular && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/90 text-black border border-amber-400 font-sans shadow-sm flex items-center gap-1">
                        <RiStarFill className="w-2.5 h-2.5" />
                        Popular
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-neutral-400 border border-white/5">
                      ID: {product.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isClosed
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {isClosed ? "TUTUP" : "BUKA"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                      {product.title}
                    </h3>
                    {product.titleEn && product.titleEn !== product.title && (
                      <p className="text-xs text-neutral-500 italic mt-0.5">
                        EN: {product.titleEn}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Packages Summary */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-neutral-300">
                    <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
                      <span>{tr("Package Tiers", "Tier Paket", "Tier Paket")}</span>
                      <span>{pkgCount} Paket</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(product.packages || []).map((pkg) => (
                        <span
                          key={pkg.id}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 text-[11px] border border-white/5"
                        >
                          {pkg.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Features Count */}
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <RiCheckLine className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>
                      {product.keyFeatures?.length || 0} {tr("deliverable highlights", "fitur utama", "fitur utamo")}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-black/60 border-t border-white/5 flex items-center justify-between gap-2">
                  {/* Quick Toggle Open/Closed */}
                  <button
                    onClick={() => handleToggleClosed(product)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                      isClosed
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                    title={isClosed ? "Buka pesanan produk ini" : "Tutup pesanan produk ini (slot penuh)"}
                  >
                    {isClosed ? (
                      <>
                        <RiLockUnlockLine className="w-3.5 h-3.5" />
                        <span>{tr("Open Order", "Buka Pesanan", "Bukak Pasan")}</span>
                      </>
                    ) : (
                      <>
                        <RiLockLine className="w-3.5 h-3.5" />
                        <span>{tr("Close Order", "Tutup Pesanan", "Tutuik Pasan")}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Full */}
                    <button
                      onClick={() => handleStartEdit(product)}
                      className="px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RiEditLine className="w-3.5 h-3.5" />
                      <span>{tr("Edit", "Edit", "Edit")}</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-white/5 transition"
                      title="Hapus produk"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL EDIT / CREATE MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#0e1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-neutral-900/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <RiEditLine className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {isNewProduct
                      ? tr("Create New Product", "Tambah Produk Baru", "Tambah Produk Baru")
                      : tr("Edit Product Details", "Edit Lengkap Produk", "Edit Lengkok Produk")}
                    <span className="text-xs font-mono text-neutral-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      ID: {editingProduct.id}
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {tr(
                      "Full customization of content, packages, deliverables, open/closed state, and 3 languages.",
                      "Kustomisasi penuh judul, kategori, paket harga, deliverables, status tutup, dan 3 bahasa.",
                      "Kustomisasi panuah namo, kategori, paket harago, status tutuik, sarato 3 bahaso."
                    )}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Header: Main Tabs + Multilingual Language Tabs */}
            <div className="px-5 py-3 border-b border-white/5 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-3">
              {/* Workspace Sections Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveEditTab("basic")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeEditTab === "basic"
                      ? "bg-teal-500 text-black shadow"
                      : "text-neutral-400 hover:text-white bg-white/5"
                  }`}
                >
                  1. {tr("Basic Info & Status", "Informasi & Status", "Informasi & Status")}
                </button>
                <button
                  onClick={() => setActiveEditTab("features")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeEditTab === "features"
                      ? "bg-teal-500 text-black shadow"
                      : "text-neutral-400 hover:text-white bg-white/5"
                  }`}
                >
                  2. {tr("Description & Features", "Deskripsi & Fitur", "Katarangan & Fitur")}
                </button>
                <button
                  onClick={() => setActiveEditTab("packages")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeEditTab === "packages"
                      ? "bg-teal-500 text-black shadow"
                      : "text-neutral-400 hover:text-white bg-white/5"
                  }`}
                >
                  3. {tr("Packages & Pricing (Tier)", "Paket & Harga (Tier)", "Paket & Harago (Tier)")}
                </button>
              </div>

              {/* Multilingual Switcher + Auto Translate button (Hidden on mobile) */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-lg bg-neutral-900 border border-white/10">
                  <button
                    onClick={() => setActiveLangTab("id")}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                      activeLangTab === "id"
                        ? "bg-white text-black shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    🇮🇩 ID
                  </button>
                  <button
                    onClick={() => setActiveLangTab("en")}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                      activeLangTab === "en"
                        ? "bg-white text-black shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                  <button
                    onClick={() => setActiveLangTab("min")}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                      activeLangTab === "min"
                        ? "bg-white text-black shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    🏴 MIN
                  </button>
                </div>

                <button
                  onClick={handleAutoTranslateMinang}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 flex items-center gap-1 transition"
                  title="Generate otomatis Bahasa Minang dari Bahasa Indonesia"
                >
                  <RiTranslate2 className="w-3.5 h-3.5" />
                  <span>Auto Minang</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: BASIC INFO & STATUS */}
              {activeEditTab === "basic" && (
                <div className="space-y-5">
                  {/* Status Order & Popular Banner */}
                  <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Close / Open Toggle */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-300 block">
                        {tr("Order Status", "Status Pesanan", "Status Pasan")}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              isClosed: !editingProduct.isClosed,
                            })
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                            editingProduct.isClosed
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {editingProduct.isClosed ? (
                            <>
                              <RiLockLine className="w-4 h-4 text-rose-400" />
                              <span>{tr("DITUTUP (Slot Penuh)", "DITUTUP (Slot Penuh)", "DITUTUIK (Slot Panuah)")}</span>
                            </>
                          ) : (
                            <>
                              <RiLockUnlockLine className="w-4 h-4 text-emerald-400" />
                              <span>{tr("BUKA PESANAN (Aktif)", "BUKA PESANAN (Aktif)", "BUKAK PASAN (Aktif)")}</span>
                            </>
                          )}
                        </button>
                        <span className="text-[11px] text-neutral-400">
                          {editingProduct.isClosed
                            ? "Klien tidak dapat memesan, muncul label Tutup/Slot Penuh."
                            : "Klien dapat bebas memilih paket & memesan."}
                        </span>
                      </div>
                    </div>

                    {/* Popular Checkbox */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-300 block">
                        {tr("Featured / Popular", "Tandai Populer", "Tandai Populer")}
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={!!editingProduct.popular}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              popular: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-teal-500 bg-neutral-900 border-white/20 focus:ring-teal-500"
                        />
                        <span className="text-xs text-neutral-300">
                          {tr(
                            "Highlight with 'Popular' badge on cards",
                            "Tampilkan badge 'Popular' di kartu produk",
                            "Tampilkan tando 'Popular' di kartu produk"
                          )}
                        </span>
                      </label>
                    </div>

                    {/* If Closed, Reason Input */}
                    {editingProduct.isClosed && (
                      <div className="sm:col-span-2 pt-2 border-t border-white/5 space-y-1">
                        <label className="text-xs font-medium text-rose-300 block">
                          {tr(
                            "Reason for Closing (Shown to Clients)",
                            "Alasan Penutupan (Muncul di Website)",
                            "Alasan Ditutuik (Nampak di Website)"
                          )}
                        </label>
                        <input
                          type="text"
                          value={
                            activeLangTab === "en"
                              ? editingProduct.closeReasonEn || ""
                              : activeLangTab === "min"
                              ? editingProduct.closeReasonMin || ""
                              : editingProduct.closeReason || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (activeLangTab === "en") {
                              setEditingProduct({ ...editingProduct, closeReasonEn: val });
                            } else if (activeLangTab === "min") {
                              setEditingProduct({ ...editingProduct, closeReasonMin: val });
                            } else {
                              setEditingProduct({ ...editingProduct, closeReason: val });
                            }
                          }}
                          placeholder={
                            activeLangTab === "en"
                              ? "e.g. Orders Temporarily Full until Next Week"
                              : "Contoh: Slot Penuh / Pesanan Ditutup Sementara"
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-black border border-rose-500/30 text-rose-200 placeholder-neutral-600 focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* ID & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        {tr("Product ID / Slug", "ID Produk / Slug", "ID Produk / Slug")}
                      </label>
                      <input
                        type="text"
                        value={editingProduct.id}
                        disabled={!isNewProduct}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, id: e.target.value })
                        }
                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-black font-mono ${
                          !isNewProduct
                            ? "border-white/5 text-neutral-500 cursor-not-allowed"
                            : "border-white/10 text-white focus:border-teal-500"
                        }`}
                      />
                      {!isNewProduct && (
                        <p className="text-[10px] text-neutral-500">
                          ID produk permanen untuk referensi tracking & database.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        {tr("Category", "Kategori", "Kategori")}
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => {
                          const catId = e.target.value;
                          const found = DEFAULT_CATEGORIES.find((c) => c.id === catId);
                          setEditingProduct({
                            ...editingProduct,
                            category: catId,
                            categoryLabel: found?.label || catId,
                            categoryLabelEn: found?.labelEn || catId,
                            categoryLabelMin: found?.labelMin || catId,
                          });
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-black text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="branding">Branding & Identitas</option>
                        <option value="web-app">Web & App Development</option>
                        <option value="video-motion">Video & Motion</option>
                        <option value="visual-craft">3D & Creative Imaging</option>
                        <option value="marketing">Marketing & Sosmed</option>
                        <option value="aerial">Drone & Pemetaan</option>
                      </select>
                    </div>
                  </div>

                  {/* Thumbnail Image Uploader (Google Drive, YouTube, Internal Storage, & URL) */}
                  <ProductThumbnailUploaderField
                    label={tr("Thumbnail Gambar Produk", "Thumbnail Gambar Produk", "Thumbnail Gambar Produk")}
                    sublabel="Tampil di atas setiap kartu paket di website"
                    value={editingProduct.thumbnailUrl || ""}
                    onChange={(val) => setEditingProduct({ ...editingProduct, thumbnailUrl: val })}
                    onUploadFile={(e) => handleUploadThumbnail(e, false)}
                    isUploading={uploadingThumb}
                    onClear={() => setEditingProduct({ ...editingProduct, thumbnailUrl: "" })}
                  />

                  {/* Title (Multilingual) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300">
                        {tr("Product Title", "Judul Produk", "Namo Produk")}{" "}
                        <span className="text-teal-400 font-mono text-[11px]">
                          [{activeLangTab.toUpperCase()}]
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={
                        activeLangTab === "en"
                          ? editingProduct.titleEn || ""
                          : activeLangTab === "min"
                          ? editingProduct.titleMin || ""
                          : editingProduct.title || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeLangTab === "en") {
                          setEditingProduct({ ...editingProduct, titleEn: val });
                        } else if (activeLangTab === "min") {
                          setEditingProduct({ ...editingProduct, titleMin: val });
                        } else {
                          // ID is primary: automatically sync to EN and Minang
                          setEditingProduct({
                            ...editingProduct,
                            title: val,
                            titleEn: val,
                            titleMin: toMinang(val),
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-black text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Tagline (Multilingual) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      {tr("Tagline / Short Summary", "Tagline / Ringkasan Singkat", "Tagline / Ringkasan Singkek")}{" "}
                      <span className="text-teal-400 font-mono text-[11px]">
                        [{activeLangTab.toUpperCase()}]
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={
                        activeLangTab === "en"
                          ? editingProduct.taglineEn || ""
                          : activeLangTab === "min"
                          ? editingProduct.taglineMin || ""
                          : editingProduct.tagline || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeLangTab === "en") {
                          setEditingProduct({ ...editingProduct, taglineEn: val });
                        } else if (activeLangTab === "min") {
                          setEditingProduct({ ...editingProduct, taglineMin: val });
                        } else {
                          // ID is primary: automatically sync to EN and Minang
                          setEditingProduct({
                            ...editingProduct,
                            tagline: val,
                            taglineEn: val,
                            taglineMin: toMinang(val),
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-black text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      {tr("Icon", "Ikon Produk", "Ikon Produk")}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {AVAILABLE_ICONS.map((ico) => {
                        const IconComp = ico.icon;
                        const isSelected = editingProduct.iconName === ico.name;
                        return (
                          <button
                            key={ico.name}
                            type="button"
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                iconName: ico.name,
                              })
                            }
                            className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition ${
                              isSelected
                                ? "bg-teal-500/20 text-teal-300 border-teal-500/50"
                                : "bg-black/40 text-neutral-400 border-white/5 hover:bg-white/5"
                            }`}
                          >
                            <IconComp className="w-4 h-4 shrink-0" />
                            <span className="truncate">{ico.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DESCRIPTION & KEY FEATURES */}
              {activeEditTab === "features" && (
                <div className="space-y-6">
                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      {tr("Full In-Depth Description", "Deskripsi Lengkap Produk", "Katarangan Mandalam Produk")}{" "}
                      <span className="text-teal-400 font-mono text-[11px]">
                        [{activeLangTab.toUpperCase()}]
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      value={
                        activeLangTab === "en"
                          ? editingProduct.descriptionEn || ""
                          : activeLangTab === "min"
                          ? editingProduct.descriptionMin || ""
                          : editingProduct.description || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeLangTab === "en") {
                          setEditingProduct({ ...editingProduct, descriptionEn: val });
                        } else if (activeLangTab === "min") {
                          setEditingProduct({ ...editingProduct, descriptionMin: val });
                        } else {
                          // ID is primary: automatically sync to EN and Minang
                          setEditingProduct({
                            ...editingProduct,
                            description: val,
                            descriptionEn: val,
                            descriptionMin: toMinang(val),
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black text-white focus:outline-none focus:border-teal-500 leading-relaxed"
                    />
                  </div>

                  {/* Key Features List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300">
                        {tr("Key Features / Highlights", "Fitur Utama & Keunggulan", "Fitur Utamo & Kaunggulan")}{" "}
                        <span className="text-teal-400 font-mono text-[11px]">
                          [{activeLangTab.toUpperCase()}]
                        </span>
                      </label>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {(editingProduct.keyFeatures || []).length} items
                      </span>
                    </div>

                    {/* Current Features List */}
                    <div className="space-y-2">
                      {(activeLangTab === "en"
                        ? editingProduct.keyFeaturesEn || editingProduct.keyFeatures
                        : activeLangTab === "min"
                        ? editingProduct.keyFeaturesMin || editingProduct.keyFeatures
                        : editingProduct.keyFeatures || []
                      ).map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/5"
                        >
                          <RiCheckLine className="w-4 h-4 text-teal-400 shrink-0" />
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (activeLangTab === "en") {
                                const arr = [...(editingProduct.keyFeaturesEn || editingProduct.keyFeatures)];
                                arr[idx] = val;
                                setEditingProduct({ ...editingProduct, keyFeaturesEn: arr });
                              } else if (activeLangTab === "min") {
                                const arr = [...(editingProduct.keyFeaturesMin || editingProduct.keyFeatures)];
                                arr[idx] = val;
                                setEditingProduct({ ...editingProduct, keyFeaturesMin: arr });
                              } else {
                                const arr = [...editingProduct.keyFeatures];
                                arr[idx] = val;
                                setEditingProduct({ ...editingProduct, keyFeatures: arr });
                              }
                            }}
                            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyFeature(idx)}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition"
                          >
                            <RiDeleteBinLine className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Feature Row */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newKeyFeature}
                        onChange={(e) => setNewKeyFeature(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyFeature())}
                        placeholder={tr("Add new key feature...", "Ketik fitur baru lalu enter / tambah...", "Ketik fitur baru...")}
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyFeature}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
                      >
                        <RiAddLine className="w-4 h-4" />
                        <span>{tr("Add", "Tambah", "Tambah")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PACKAGES & PRICING (TIER) */}
              {activeEditTab === "packages" && (
                <div className="space-y-6">
                  {/* Package Selector Tabs */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-black/60 border border-white/5">
                    {(editingProduct.packages || []).map((pkg) => {
                      const isPkgActive = activePkgTab === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setActivePkgTab(pkg.id)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                            isPkgActive
                              ? "bg-teal-500 text-black shadow-md"
                              : "text-neutral-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="uppercase">{pkg.id}</span>
                          <span className="text-[11px] font-normal opacity-80 truncate">
                            ({pkg.name})
                          </span>
                          {pkg.isClosed && (
                            <RiLockLine className="w-3 h-3 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Package Editor */}
                  {currentPkg && (
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                      {/* Package Name & Badge */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300">
                            {tr("Package Tier Name", "Nama Paket Tier", "Namo Paket Tier")}{" "}
                            <span className="text-teal-400 font-mono text-[11px]">
                              [{activeLangTab.toUpperCase()}]
                            </span>
                          </label>
                          <input
                            type="text"
                            value={
                              activeLangTab === "en"
                                ? currentPkg.nameEn || currentPkg.name
                                : activeLangTab === "min"
                                ? currentPkg.nameMin || currentPkg.name
                                : currentPkg.name
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingProduct({
                                ...editingProduct,
                                packages: editingProduct.packages.map((p) => {
                                  if (p.id !== currentPkg.id) return p;
                                  if (activeLangTab === "en") return { ...p, nameEn: val };
                                  if (activeLangTab === "min") return { ...p, nameMin: val };
                                  return { ...p, name: val, nameEn: val, nameMin: toMinang(val) };
                                }),
                              });
                            }}
                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300">
                            {tr("Badge / Highlight", "Badge / Sorotan", "Badge / Tando Khusus")}{" "}
                            <span className="text-teal-400 font-mono text-[11px]">
                              [{activeLangTab.toUpperCase()}]
                            </span>
                          </label>
                          <input
                            type="text"
                            value={
                              activeLangTab === "en"
                                ? currentPkg.badgeEn || currentPkg.badge || ""
                                : activeLangTab === "min"
                                ? currentPkg.badgeMin || currentPkg.badge || ""
                                : currentPkg.badge || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingProduct({
                                ...editingProduct,
                                packages: editingProduct.packages.map((p) => {
                                  if (p.id !== currentPkg.id) return p;
                                  if (activeLangTab === "en") return { ...p, badgeEn: val };
                                  if (activeLangTab === "min") return { ...p, badgeMin: val };
                                  return { ...p, badge: val };
                                }),
                              });
                            }}
                            placeholder="Contoh: Paling Populer / UMKM"
                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Optional Package-Specific Thumbnail (Google Drive, YouTube, Internal, etc.) */}
                      <ProductThumbnailUploaderField
                        label="Thumbnail Khusus Paket Ini (Opsional)"
                        sublabel="Kosongkan jika ingin memakai thumbnail produk di atas"
                        value={currentPkg.thumbnailUrl || ""}
                        onChange={(val) => {
                          setEditingProduct({
                            ...editingProduct,
                            packages: editingProduct.packages.map((p) =>
                              p.id === currentPkg.id ? { ...p, thumbnailUrl: val } : p
                            ),
                          });
                        }}
                        onUploadFile={(e) => handleUploadThumbnail(e, true)}
                        isUploading={uploadingThumb}
                        onClear={() => {
                          setEditingProduct({
                            ...editingProduct,
                            packages: editingProduct.packages.map((p) =>
                              p.id === currentPkg.id ? { ...p, thumbnailUrl: "" } : p
                            ),
                          });
                        }}
                        placeholder="Link Google Drive, YouTube, atau gambar khusus paket ini"
                      />

                      {/* Price Note, Duration, Revisions */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300">
                            {tr("Price Note / Budget", "Catatan Harga", "Catatan Harago")}{" "}
                            <span className="text-teal-400 font-mono text-[11px]">
                              [{activeLangTab.toUpperCase()}]
                            </span>
                          </label>
                          <input
                            type="text"
                            value={
                              activeLangTab === "en"
                                ? currentPkg.priceNoteEn || currentPkg.priceNote
                                : activeLangTab === "min"
                                ? currentPkg.priceNoteMin || currentPkg.priceNote
                                : currentPkg.priceNote
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingProduct({
                                ...editingProduct,
                                packages: editingProduct.packages.map((p) => {
                                  if (p.id !== currentPkg.id) return p;
                                  if (activeLangTab === "en") return { ...p, priceNoteEn: val };
                                  if (activeLangTab === "min") return { ...p, priceNoteMin: val };
                                  return { ...p, priceNote: val };
                                }),
                              });
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300">
                            {tr("Turnaround Duration", "Estimasi Waktu", "Waktu Pangarajoan")}{" "}
                            <span className="text-teal-400 font-mono text-[11px]">
                              [{activeLangTab.toUpperCase()}]
                            </span>
                          </label>
                          <input
                            type="text"
                            value={
                              activeLangTab === "en"
                                ? currentPkg.durationEn || currentPkg.duration
                                : activeLangTab === "min"
                                ? currentPkg.durationMin || currentPkg.duration
                                : currentPkg.duration
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingProduct({
                                ...editingProduct,
                                packages: editingProduct.packages.map((p) => {
                                  if (p.id !== currentPkg.id) return p;
                                  if (activeLangTab === "en") return { ...p, durationEn: val };
                                  if (activeLangTab === "min") return { ...p, durationMin: val };
                                  return { ...p, duration: val, durationEn: val, durationMin: toMinang(val) };
                                }),
                              });
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-300">
                            {tr("Revisions Allowance", "Kuota Revisi", "Banyak Revisi")}{" "}
                            <span className="text-teal-400 font-mono text-[11px]">
                              [{activeLangTab.toUpperCase()}]
                            </span>
                          </label>
                          <input
                            type="text"
                            value={
                              activeLangTab === "en"
                                ? currentPkg.revisionsEn || currentPkg.revisions
                                : activeLangTab === "min"
                                ? currentPkg.revisionsMin || currentPkg.revisions
                                : currentPkg.revisions
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingProduct({
                                ...editingProduct,
                                packages: editingProduct.packages.map((p) => {
                                  if (p.id !== currentPkg.id) return p;
                                  if (activeLangTab === "en") return { ...p, revisionsEn: val };
                                  if (activeLangTab === "min") return { ...p, revisionsMin: val };
                                  return { ...p, revisions: val };
                                }),
                              });
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Package Description */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">
                          {tr("Package Description", "Deskripsi Paket", "Katarangan Paket")}{" "}
                          <span className="text-teal-400 font-mono text-[11px]">
                            [{activeLangTab.toUpperCase()}]
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          value={
                            activeLangTab === "en"
                              ? currentPkg.descriptionEn || currentPkg.description
                              : activeLangTab === "min"
                              ? currentPkg.descriptionMin || currentPkg.description
                              : currentPkg.description
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingProduct({
                                ...editingProduct,
                                packages: editingProduct.packages.map((p) => {
                                  if (p.id !== currentPkg.id) return p;
                                  if (activeLangTab === "en") return { ...p, descriptionEn: val };
                                  if (activeLangTab === "min") return { ...p, descriptionMin: val };
                                  return { ...p, description: val, descriptionEn: val, descriptionMin: toMinang(val) };
                                }),
                              });
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      {/* Package Deliverables Items List */}
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-neutral-300">
                            {tr("Deliverables (Output yang didapat)", "Daftar Deliverables", "Daftar Hasil Karajo")}{" "}
                            <span className="text-teal-400 font-mono text-[11px]">
                              [{activeLangTab.toUpperCase()}]
                            </span>
                          </label>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {(currentPkg.deliverables || []).length} items
                          </span>
                        </div>

                        {/* Deliverables rows */}
                        <div className="space-y-2">
                          {(activeLangTab === "en"
                            ? currentPkg.deliverablesEn || currentPkg.deliverables
                            : activeLangTab === "min"
                            ? currentPkg.deliverablesMin || currentPkg.deliverables
                            : currentPkg.deliverables || []
                          ).map((del, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-center gap-2 p-2 rounded-xl bg-black/80 border border-white/5"
                            >
                              <span className="text-teal-400 font-mono text-[10px] w-5 text-center">
                                {dIdx + 1}.
                              </span>
                              <input
                                type="text"
                                value={del}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingProduct({
                                    ...editingProduct,
                                    packages: editingProduct.packages.map((p) => {
                                      if (p.id !== currentPkg.id) return p;
                                      if (activeLangTab === "en") {
                                        const arr = [...(p.deliverablesEn || p.deliverables)];
                                        arr[dIdx] = val;
                                        return { ...p, deliverablesEn: arr };
                                      } else if (activeLangTab === "min") {
                                        const arr = [...(p.deliverablesMin || p.deliverables)];
                                        arr[dIdx] = val;
                                        return { ...p, deliverablesMin: arr };
                                      } else {
                                        const arr = [...p.deliverables];
                                        arr[dIdx] = val;
                                        return { ...p, deliverables: arr };
                                      }
                                    }),
                                  });
                                }}
                                className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDeliverable(currentPkg.id, dIdx)}
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition"
                              >
                                <RiDeleteBinLine className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add deliverable row */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={newPkgDeliverable}
                            onChange={(e) => setNewPkgDeliverable(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && (e.preventDefault(), handleAddDeliverable(currentPkg.id))
                            }
                            placeholder={tr(
                              "Add deliverable item...",
                              "Ketik deliverable baru...",
                              "Ketik hasil karajo baru..."
                            )}
                            className="flex-1 px-3 py-2 text-xs rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddDeliverable(currentPkg.id)}
                            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
                          >
                            <RiAddLine className="w-4 h-4" />
                            <span>{tr("Add", "Tambah", "Tambah")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-neutral-900/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
              >
                {tr("Cancel", "Batal", "Batal")}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveProduct}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black transition flex items-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                <RiSave3Line className="w-4 h-4" />
                <span>
                  {isSaving
                    ? tr("Saving...", "Menyimpan ke Cloud...", "Manyimpan...")
                    : tr("Save Changes", "Simpan Perubahan", "Simpan Parubahan")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

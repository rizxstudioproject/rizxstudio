"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RiUserFollowLine,
  RiSearchLine,
  RiRefreshLine,
  RiCheckboxCircleFill,
  RiTimeLine,
  RiWhatsappLine,
  RiMailLine,
  RiFileCopyLine,
  RiCompass3Line,
  RiEditLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiSendPlaneFill,
  RiFileList3Line,
  RiCloseLine,
  RiCheckLine,
  RiAddLine,
  RiPlayCircleLine,
  RiEyeLine,
  RiShieldCheckLine,
  RiFlashlightFill,
  RiFolderZipLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import {
  ProjectTrackingItem,
  ProjectProgressStage,
  getAllTrackedProjects,
  saveAllTrackedProjects,
  updateProjectProgress,
  confirmProjectKickoff,
  deleteTrackedProject,
  getStageMetadata,
} from "@/lib/projectTrackerService";
import VisualOrderTracker from "@/components/VisualOrderTracker";

export default function ClientOrdersManager() {
  const { lang, tr } = useLang();
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";

  const [orders, setOrders] = useState<ProjectTrackingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string>("");

  // Modal: Update Progress Report
  const [reportingOrder, setReportingOrder] = useState<ProjectTrackingItem | null>(null);
  const [reportStage, setReportStage] = useState<ProjectProgressStage>("in_progress");
  const [reportPercent, setReportPercent] = useState<number>(50);
  const [reportNotes, setReportNotes] = useState<string>("");
  const [reportPreviewUrl, setReportPreviewUrl] = useState<string>("");
  const [isSavingReport, setIsSavingReport] = useState<boolean>(false);

  // Modal: Preview Client Tracking View
  const [previewingOrder, setPreviewingOrder] = useState<ProjectTrackingItem | null>(null);

  // Modal: Add Manual Client Order
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>("");
  const [newClientPhone, setNewClientPhone] = useState<string>("");
  const [newClientEmail, setNewClientEmail] = useState<string>("");
  const [newServiceTitle, setNewServiceTitle] = useState<string>("Logo Branding & Identity");
  const [newPackageName, setNewPackageName] = useState<string>("Professional Brand System");
  const [newBudget, setNewBudget] = useState<string>("15jt - 30jt IDR");
  const [newDeadline, setNewDeadline] = useState<string>("7 - 10 Hari Kerja");
  const [newBrief, setNewBrief] = useState<string>("");

  // Load orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllTrackedProjects();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load client orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<ProjectTrackingItem[]>;
      if (custom.detail) {
        setOrders(custom.detail);
      } else {
        loadOrders();
      }
    };
    window.addEventListener("rizx_tracker_updated", handleUpdate);
    return () => window.removeEventListener("rizx_tracker_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
    }
  };

  // Quick Action 1: Confirm Kickoff (Konfirmasi Pengerjaan)
  const handleConfirmKickoff = async (order: ProjectTrackingItem) => {
    try {
      const updated = await confirmProjectKickoff(
        order.refCode,
        30,
        "Pesanan telah dikonfirmasi oleh Studio Rizx. Proyek resmi dimulai & masuk tahap produksi kreatif."
      );
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.refCode === order.refCode ? updated : o))
        );
        showToast(
          tr(
            `Project "${order.refCode}" confirmed! Work in progress.`,
            `Pengerjaan proyek "${order.refCode}" berhasil DIKONFIRMASI! Status masuk produksi.`,
            `Karajoan proyek "${order.refCode}" barasia DIKONFIRMASI! Masuak proses produksi.`
          )
        );
      }
    } catch (err) {
      console.error("Failed to confirm kickoff:", err);
      showToast("Gagal mengonfirmasi pengerjaan.");
    }
  };

  // Quick Action 2: Open Report Modal
  const openReportModal = (order: ProjectTrackingItem) => {
    setReportingOrder(order);
    setReportStage(order.currentStage);
    setReportPercent(order.progressPercent);
    setReportNotes(order.notes || "");
    setReportPreviewUrl(order.previewUrl || "");
  };

  // Save Progress Report & Sync to Client Tracking
  const handleSaveReport = async () => {
    if (!reportingOrder) return;
    setIsSavingReport(true);
    try {
      const updated = await updateProjectProgress(
        reportingOrder.refCode,
        reportStage,
        reportPercent,
        reportNotes.trim(),
        reportPreviewUrl.trim()
      );
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.refCode === reportingOrder.refCode ? updated : o))
        );
        showToast(
          tr(
            `Progress report updated! Live tracking automatically synced.`,
            `Laporan progres tersimpan! Halaman live tracking klien otomatis ter-update.`,
            `Laporan progres tasimpan! Live tracking klien otomatis ta-update.`
          )
        );
        setReportingOrder(null);
      }
    } catch (err) {
      console.error("Failed to save progress report:", err);
      showToast("Gagal menyimpan laporan progres.");
    } finally {
      setIsSavingReport(false);
    }
  };

  // Quick Report Templates
  const applyReportTemplate = (text: string, stage: ProjectProgressStage, pct: number) => {
    setReportNotes(text);
    setReportStage(stage);
    setReportPercent(pct);
  };

  // Quick Action: Delete Order
  const handleDeleteOrder = async (order: ProjectTrackingItem) => {
    const confirmMsg = tr(
      `Delete order "${order.refCode}" for client ${order.clientName}?`,
      `Hapus pesanan "${order.refCode}" milik klien ${order.clientName}?`,
      `Hapuih pesanan "${order.refCode}" punyo klien ${order.clientName}?`
    );
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteTrackedProject(order.refCode);
      setOrders((prev) => prev.filter((o) => o.refCode !== order.refCode));
      showToast(
        tr(
          `Order "${order.refCode}" deleted.`,
          `Pesanan "${order.refCode}" berhasil dihapus.`,
          `Pesanan "${order.refCode}" barasia dihapuih.`
        )
      );
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  // Quick Action: Add Manual Order
  const handleAddManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      alert("Mohon masukkan nama klien.");
      return;
    }
    const randomCode = `RZX-PRJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: ProjectTrackingItem = {
      refCode: randomCode,
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim() || undefined,
      clientEmail: newClientEmail.trim() || undefined,
      serviceTitle: newServiceTitle,
      categoryLabel: "Layanan Kustom Studio",
      packageName: newPackageName,
      packageDuration: newDeadline,
      budget: newBudget,
      startDate: new Date().toISOString(),
      targetDeadline: newDeadline,
      currentStage: "queued",
      progressPercent: 15,
      notes: "Pesanan klien masuk ke sistem. Menunggu jadwal kickoff produksi.",
      brief: newBrief.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newOrder, ...orders];
    await saveAllTrackedProjects(updatedList);
    setOrders(updatedList);
    setIsAddModalOpen(false);
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewBrief("");
    showToast(
      tr(
        `New order "${randomCode}" added to database!`,
        `Pesanan baru "${randomCode}" berhasil ditambahkan ke database!`,
        `Pesanan baru "${randomCode}" barasia ditambahan ka database!`
      )
    );
  };

  // Stats calculation
  const totalCount = orders.length;
  const queuedCount = orders.filter((o) => o.currentStage === "queued").length;
  const inProgressCount = orders.filter((o) => o.currentStage === "in_progress").length;
  const reviewCount = orders.filter((o) => o.currentStage === "review").length;
  const completedCount = orders.filter((o) => o.currentStage === "completed").length;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStage = stageFilter === "all" || o.currentStage === stageFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.clientName.toLowerCase().includes(q) ||
        o.refCode.toLowerCase().includes(q) ||
        (o.clientPhone && o.clientPhone.toLowerCase().includes(q)) ||
        (o.clientEmail && o.clientEmail.toLowerCase().includes(q)) ||
        o.serviceTitle.toLowerCase().includes(q) ||
        o.packageName.toLowerCase().includes(q) ||
        (o.brief && o.brief.toLowerCase().includes(q));
      return matchesStage && matchesSearch;
    });
  }, [orders, stageFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-teal-500 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <RiCheckboxCircleFill className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* KPI Stats Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Incoming Clients */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {tr("Total Clients", "Total Klien Masuk", "Total Klien Masuak")}
            </span>
            <RiUserFollowLine className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{totalCount}</div>
          <div className="text-[10px] text-neutral-500 mt-1">Tersimpan di Supabase Cloud</div>
        </div>

        {/* Queued / Menunggu Konfirmasi */}
        <div
          onClick={() => setStageFilter("queued")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            stageFilter === "queued"
              ? "bg-amber-500/15 border-amber-500/50"
              : "bg-neutral-900/80 border-amber-500/20 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {tr("Pending Kickoff", "Menunggu Konfirmasi", "Manunggu Kickoff")}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
            {queuedCount}
          </div>
          <div className="text-[10px] text-amber-300/70 mt-1">Butuh konfirmasi pengerjaan</div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setStageFilter("in_progress")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            stageFilter === "in_progress"
              ? "bg-teal-500/15 border-teal-500/50"
              : "bg-neutral-900/80 border-teal-500/20 hover:border-teal-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-teal-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {tr("In Production", "Sedang Dikerjakan", "Sadang Dikarajoan")}
            </span>
            <RiPlayCircleLine className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-teal-400 font-mono">
            {inProgressCount}
          </div>
          <div className="text-[10px] text-teal-300/70 mt-1">Proses desain & produksi aktif</div>
        </div>

        {/* Review */}
        <div
          onClick={() => setStageFilter("review")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            stageFilter === "review"
              ? "bg-indigo-500/15 border-indigo-500/50"
              : "bg-neutral-900/80 border-indigo-500/20 hover:border-indigo-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {tr("Client Review", "Tahap Review", "Tahap Review")}
            </span>
            <RiEyeLine className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-400 font-mono">
            {reviewCount}
          </div>
          <div className="text-[10px] text-indigo-300/70 mt-1">Menunggu evaluasi & revisi</div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStageFilter("completed")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            stageFilter === "completed"
              ? "bg-emerald-500/15 border-emerald-500/50"
              : "bg-neutral-900/80 border-emerald-500/20 hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {tr("Completed", "Selesai / Finish", "Lah Selesai")}
            </span>
            <RiShieldCheckLine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            {completedCount}
          </div>
          <div className="text-[10px] text-emerald-300/70 mt-1">Aset master diserahkan 100%</div>
        </div>
      </div>

      {/* Control Bar: Search, Stage Filter, Add Order */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900/70 border border-white/10">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder={tr(
                "Cari nama, WA, email, ref code...",
                "Cari nama, WA, email, ref code...",
                "Cari namo, WA, email..."
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-teal-400 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {[
              { id: "all", label: "Semua" },
              { id: "queued", label: `Antrean (${queuedCount})` },
              { id: "in_progress", label: `Produksi (${inProgressCount})` },
              { id: "review", label: `Review (${reviewCount})` },
              { id: "completed", label: `Selesai (${completedCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStageFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                  stageFilter === f.id
                    ? "bg-teal-500 text-black font-semibold shadow-sm"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadOrders}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-black transition flex items-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer"
          >
            <RiAddLine className="w-4 h-4" />
            <span>{tr("Tambah Pesanan Manual", "Tambah Pesanan Manual", "Tambah Pesanan")}</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 text-xs flex flex-col items-center gap-3">
          <RiRefreshLine className="w-6 h-6 animate-spin text-teal-400" />
          <span>Memuat data klien masuk dari database Supabase...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-white/10 bg-neutral-900/50 p-8">
          <RiUserFollowLine className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-white font-semibold text-sm mb-1">Tidak Ada Pesanan Ditemukan</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {searchQuery
              ? `Tidak ada pesanan yang sesuai dengan kata kunci "${searchQuery}".`
              : "Belum ada pesanan klien pada filter ini. Formulir pesanan di halaman /products akan otomatis muncul di sini."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const meta = getStageMetadata(order.currentStage);
            const isQueued = order.currentStage === "queued";
            const cleanPhone = (order.clientPhone || "").replace(/[^0-9]/g, "");
            const formattedPhone = cleanPhone.startsWith("0")
              ? "62" + cleanPhone.slice(1)
              : cleanPhone;

            const waChatUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
              `Halo kak ${order.clientName}! 👋 Kami dari Rizx Studio ingin menyampaikan kabar terkait proyek *${order.serviceTitle}* (Kode Referensi: *${order.refCode}*). Status saat ini: *${meta.label}*.`
            )}`;

            return (
              <div
                key={order.refCode}
                className={`relative rounded-2xl border p-5 sm:p-6 transition-all ${
                  isQueued
                    ? "bg-gradient-to-br from-amber-500/[0.07] to-neutral-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5"
                    : "bg-neutral-900/80 border-white/10 hover:border-white/20"
                }`}
              >
                {/* Header Row: Client Info, Code, Stage */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {order.clientName}
                      </h3>
                      {/* Ref Code Pill with Copy */}
                      <button
                        onClick={() => handleCopyCode(order.refCode)}
                        title="Salin Kode Referensi"
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25 transition cursor-pointer"
                      >
                        <span>{order.refCode}</span>
                        <RiFileCopyLine className="w-3 h-3 text-teal-400" />
                        {copiedCode === order.refCode && (
                          <span className="text-[10px] text-teal-200 font-sans font-bold">
                            Tersalin!
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-neutral-300 font-medium">{order.serviceTitle}</span>
                      <span>•</span>
                      <span className="text-teal-400">{order.packageName}</span>
                      {order.budget && (
                        <>
                          <span>•</span>
                          <span className="text-neutral-300 font-mono">{order.budget}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stage Badge & Timestamp */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border"
                      style={{
                        backgroundColor: meta.badgeBg,
                        borderColor: meta.badgeBorder,
                        color: meta.color,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span>{meta.label}</span>
                    </div>

                    <div className="text-[11px] text-neutral-400 font-mono">
                      {new Date(order.startDate).toLocaleDateString(
                        lang === "id" ? "id-ID" : "en-US",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Details: Contact & Brief */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                  {/* Client Contact Info */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Kontak Klien
                    </div>
                    {order.clientPhone ? (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">WhatsApp:</span>
                        <a
                          href={waChatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <RiWhatsappLine className="w-3.5 h-3.5" />
                          <span>{order.clientPhone}</span>
                        </a>
                      </div>
                    ) : (
                      <div className="text-neutral-500">WhatsApp tidak dicantumkan</div>
                    )}

                    {order.clientEmail && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Email:</span>
                        <a
                          href={`mailto:${order.clientEmail}`}
                          className="text-neutral-200 hover:text-white flex items-center gap-1 truncate max-w-[180px]"
                        >
                          <RiMailLine className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{order.clientEmail}</span>
                        </a>
                      </div>
                    )}

                    {order.targetDeadline && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-neutral-400">Target Waktu:</span>
                        <span className="text-neutral-200 font-mono">{order.targetDeadline}</span>
                      </div>
                    )}
                  </div>

                  {/* Client Project Brief */}
                  <div className="lg:col-span-2 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5 text-xs">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <RiFileList3Line className="w-3.5 h-3.5" />
                      <span>Catatan / Brief Klien</span>
                    </div>
                    {order.brief ? (
                      <p className="text-neutral-300 text-xs italic leading-relaxed line-clamp-3">
                        &ldquo;{order.brief}&rdquo;
                      </p>
                    ) : (
                      <p className="text-neutral-500 text-xs italic">
                        Tidak ada catatan brief tertulis. Klien memilih paket standar langsung.
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Status Bar & Latest Report */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                        Progress Pengerjaan:
                      </span>
                      <span className="font-bold font-mono text-teal-400">
                        {order.progressPercent}%
                      </span>
                    </div>

                    {order.previewUrl && (
                      <a
                        href={order.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RiExternalLinkLine className="w-3.5 h-3.5" />
                        <span>Link Draft / Preview ↗</span>
                      </a>
                    )}
                  </div>

                  {/* Progress Bar Line */}
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${order.progressPercent}%`,
                        backgroundColor: meta.color,
                        boxShadow: `0 0 12px ${meta.color}66`,
                      }}
                    />
                  </div>

                  {/* Studio Report Notes */}
                  <div className="text-xs text-neutral-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                    <span className="text-neutral-400 font-semibold font-mono text-[10px] block mb-0.5">
                      LAPORAN TERAKHIR KE VIEW TRACKING:
                    </span>
                    <span className="text-neutral-200">
                      {order.notes || "Belum ada laporan catatan progres."}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Confirm Kickoff Button (Prominent for queued orders) */}
                    {isQueued && (
                      <button
                        onClick={() => handleConfirmKickoff(order)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer animate-pulse"
                      >
                        <RiFlashlightFill className="w-3.5 h-3.5" />
                        <span>Konfirmasi Pengerjaan (Kickoff 🚀)</span>
                      </button>
                    )}

                    {/* Update Progress Report Modal Trigger */}
                    <button
                      onClick={() => openReportModal(order)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-black transition flex items-center gap-1.5 shadow-md shadow-teal-500/15 cursor-pointer"
                    >
                      <RiEditLine className="w-3.5 h-3.5" />
                      <span>Update Laporan Progres</span>
                    </button>

                    {/* Preview Client Visual Tracking Modal */}
                    <button
                      onClick={() => setPreviewingOrder(order)}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RiCompass3Line className="w-3.5 h-3.5 text-teal-400" />
                      <span>Cek Tampilan Klien</span>
                    </button>

                    {/* Chat WhatsApp direct */}
                    {order.clientPhone && (
                      <a
                        href={waChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5"
                      >
                        <RiWhatsappLine className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteOrder(order)}
                    title="Hapus Pesanan"
                    className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: UPDATE LAPORAN PROGRES ── */}
      {reportingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/20 bg-[#111317] text-white p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setReportingOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 mb-2">
                <RiEditLine className="w-3 h-3" />
                <span>Input Laporan & Sinkronisasi Tracking</span>
              </div>
              <h3 className="text-xl font-bold">Update Laporan Progres Proyek</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Klien: <span className="text-white font-semibold">{reportingOrder.clientName}</span>{" "}
                (Kode: <span className="font-mono text-teal-400">{reportingOrder.refCode}</span>)
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Stage */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  1. Tahapan Pengerjaan Saat Ini
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: "queued", label: "Antrean (Belum)", color: "#f59e0b" },
                      { id: "in_progress", label: "Produksi (Proses)", color: "#16b09f" },
                      { id: "review", label: "Review Revisi", color: "#818cf8" },
                      { id: "completed", label: "Finish (Selesai)", color: "#10b981" },
                    ] as const
                  ).map((s) => {
                    const isSelected = reportStage === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setReportStage(s.id);
                          if (s.id === "queued" && reportPercent > 20) setReportPercent(15);
                          if (s.id === "in_progress" && (reportPercent < 20 || reportPercent > 70))
                            setReportPercent(45);
                          if (s.id === "review" && (reportPercent < 70 || reportPercent > 95))
                            setReportPercent(85);
                          if (s.id === "completed") setReportPercent(100);
                        }}
                        style={
                          isSelected
                            ? {
                                borderColor: s.color,
                                backgroundColor: `${s.color}22`,
                                color: s.color,
                              }
                            : undefined
                        }
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-medium ${
                          isSelected
                            ? "font-bold shadow-sm"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Percentage Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-300">
                    2. Persentase Selesai:
                  </label>
                  <span className="font-mono text-sm font-bold text-teal-400">
                    {reportPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={reportPercent}
                  onChange={(e) => setReportPercent(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                />
              </div>

              {/* Quick Template Buttons */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Template Cepat Laporan:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      applyReportTemplate(
                        "Pesanan telah dikonfirmasi oleh Studio Rizx. Proyek resmi masuk proses produksi kreatif sesuai brief yang disepakati.",
                        "in_progress",
                        30
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-[11px] transition"
                  >
                    ⚡ Kickoff Dimulai (30%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyReportTemplate(
                        "Eksplorasi konsep awal dan draft visual telah selesai disusun. Tim sedang mematangkan detail refining dan layout pendukung.",
                        "in_progress",
                        60
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-[11px] transition"
                  >
                    🎨 Draft Desain Siap (60%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyReportTemplate(
                        "Draft karya telah selesai dan diupload ke link staging/preview. Menunggu masukan evaluasi dan revisi dari klien.",
                        "review",
                        85
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-[11px] transition"
                  >
                    🔍 Review Klien (85%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyReportTemplate(
                        "Proyek telah selesai 100%. Seluruh file master deliverables dan aset akhir telah diserahkan penuh.",
                        "completed",
                        100
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] transition"
                  >
                    ✅ Serah Terima Final (100%)
                  </button>
                </div>
              </div>

              {/* Progress Report Notes */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  3. Laporan Catatan Progres (Tampil di View Tracking Klien)
                </label>
                <textarea
                  rows={4}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Tuliskan catatan progres terkini untuk klien. Tulisan ini otomatis langsung muncul di halaman live tracking klien..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-teal-400 text-xs leading-relaxed"
                />
              </div>

              {/* Preview Link URL */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  4. Link Draft / Preview Staging (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau https://figma.com/..."
                  value={reportPreviewUrl}
                  onChange={(e) => setReportPreviewUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-teal-400 text-xs font-mono"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReportingOrder(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isSavingReport}
                onClick={handleSaveReport}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black transition flex items-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
              >
                <RiSendPlaneFill className="w-4 h-4" />
                <span>
                  {isSavingReport ? "Menyimpan & Menyinkronkan..." : "Simpan & Update ke View Tracking 🚀"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CEK TAMPILAN KLIEN (VISUAL ORDER TRACKER PREVIEW) ── */}
      {previewingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/20 bg-[#0d0f14] text-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setPreviewingOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 mb-2">
                <RiEyeLine className="w-3 h-3" />
                <span>Live View Tampilan Klien</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Preview Live Visual Order Tracker</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Beginilah tampilan visual order tracker yang dilihat oleh klien saat membuka kode referensi{" "}
                <span className="font-mono text-teal-400">{previewingOrder.refCode}</span> di halaman /tracking.
              </p>
            </div>

            {/* Embedded Visual Order Tracker */}
            <div className="p-4 sm:p-6 rounded-2xl bg-black/50 border border-white/10">
              <VisualOrderTracker project={previewingOrder} />
            </div>

            <div className="flex justify-end pt-5">
              <button
                type="button"
                onClick={() => setPreviewingOrder(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: TAMBAH PESANAN MANUAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleAddManualOrder}
            className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#111317] text-white p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 mb-2">
                <RiAddLine className="w-3 h-3" />
                <span>Input Pesanan Baru</span>
              </div>
              <h3 className="text-xl font-bold">Tambah Klien & Pesanan Manual</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Catat pesanan dari WhatsApp / direct meeting ke database sistem tracking studio.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                  Nama Lengkap / Perusahaan Klien <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso / PT Maju Gemilang"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Email Klien (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="klien@gmail.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Layanan / Produk
                  </label>
                  <input
                    type="text"
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Nama Paket
                  </label>
                  <input
                    type="text"
                    value={newPackageName}
                    onChange={(e) => setNewPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Estimasi Budget
                  </label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Target Timeline
                  </label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1">
                  Catatan Brief Proyek
                </label>
                <textarea
                  rows={3}
                  value={newBrief}
                  onChange={(e) => setNewBrief(e.target.value)}
                  placeholder="Catatan kebutuhan klien, preferensi gaya visual, atau fitur..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black transition flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <RiAddLine className="w-4 h-4" />
                <span>Simpan Pesanan ke Database</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

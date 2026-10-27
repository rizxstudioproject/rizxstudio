"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCompass3Line,
  RiSearchLine,
  RiEditLine,
  RiDeleteBinLine,
  RiWhatsappLine,
  RiCloseLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiAddLine,
  RiTimeLine,
  RiCheckboxCircleFill,
  RiRefreshLine,
  RiSparklingFill,
  RiEyeLine,
  RiImageFill,
  RiAttachmentLine,
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiUser3Line,
  RiCheckDoubleLine,
  RiFlashlightFill,
  RiUserFollowLine,
  RiBankCardLine,
  RiTicket2Line,
} from "react-icons/ri";
import {
  getAllTrackedProjects,
  updateProjectProgress,
  deleteTrackedProject,
  registerTrackedProject,
  ProjectTrackingItem,
  ProjectProgressStage,
  getStageMetadata,
} from "@/lib/projectTrackerService";
import { getOrderReceipt } from "@/lib/paymentService";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";
import ProjectTrackerModal from "@/components/ProjectTrackerModal";
import ReceiptProofModal, { ReceiptProofData } from "./ReceiptProofModal";
import ClientOrdersManager from "./ClientOrdersManager";
import PaymentAccountsWorkspace from "./PaymentAccountsWorkspace";

const STUDIO_WORKFLOW_MILESTONES = [
  {
    stage: "queued" as ProjectProgressStage,
    step: 1,
    title: "1. Konseptualisasi & Riset Brief",
    desc: "Mempelajari brief kebutuhan klien, referensi visual, dan arahan kreatif.",
    pct: 15,
  },
  {
    stage: "in_progress" as ProjectProgressStage,
    step: 2,
    title: "2. Sketsa & Eksplorasi Konsep",
    desc: "Pembuatan draft alternatif, layout komposisi, dan moodboard visual.",
    pct: 50,
  },
  {
    stage: "review" as ProjectProgressStage,
    step: 3,
    title: "3. Eksekusi Digital & Detailing",
    desc: "Penyempurnaan aset digital, pemilihan warna, tipografi, dan polishing.",
    pct: 80,
  },
  {
    stage: "completed" as ProjectProgressStage,
    step: 4,
    title: "4. Review, Revisi & Final Handover",
    desc: "Pengecekan akhir bersama klien, export master file, dan serah terima aset.",
    pct: 100,
  },
];

const getMilestoneCompletion = (stage: ProjectProgressStage, pct: number) => {
  if (stage === "completed" || pct >= 100) return 4;
  if (stage === "review" || pct >= 80) return 3;
  if (stage === "in_progress" || pct >= 50) return 2;
  return 1;
};

interface ProjectTrackerWorkspaceProps {
  initialTab?: "tracking" | "orders" | "payments";
}

export default function ProjectTrackerWorkspace({
  initialTab = "tracking",
}: ProjectTrackerWorkspaceProps) {
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";
  const { tr } = useLang();

  const [activeMainTab, setActiveMainTab] = useState<"tracking" | "orders" | "payments">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  const [projects, setProjects] = useState<ProjectTrackingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Count pending kickoff orders
  const pendingOrdersCount = useMemo(() => {
    return projects.filter((p) => p.currentStage === "queued").length;
  }, [projects]);

  // Modals
  const [editingProject, setEditingProject] = useState<ProjectTrackingItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [clientPreviewCode, setClientPreviewCode] = useState<string | null>(null);
  const [selectedReceiptProof, setSelectedReceiptProof] = useState<ReceiptProofData | null>(null);
  const [drilldownProject, setDrilldownProject] = useState<ProjectTrackingItem | null>(null);

  // Edit form state
  const [editStage, setEditStage] = useState<ProjectProgressStage>("in_progress");
  const [editPercent, setEditPercent] = useState<number>(50);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editPreviewUrl, setEditPreviewUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // New project form state
  const [newClientName, setNewClientName] = useState<string>("");
  const [newClientPhone, setNewClientPhone] = useState<string>("");
  const [newServiceTitle, setNewServiceTitle] = useState<string>("Logo Branding & Identity");
  const [newPackageName, setNewPackageName] = useState<string>("Professional Brand System");
  const [newDeadline, setNewDeadline] = useState<string>("7 - 10 Hari Kerja");
  const [newBudget, setNewBudget] = useState<string>("5jt - 15jt IDR");
  const [newCustomRef, setNewCustomRef] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllTrackedProjects();
      setProjects(data);
    } catch (err) {
      console.warn("Failed to load tracked projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchStage = stageFilter === "ALL" || p.currentStage === stageFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.refCode.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.serviceTitle.toLowerCase().includes(q) ||
        (p.clientPhone && p.clientPhone.includes(q));
      return matchStage && matchSearch;
    });
  }, [projects, stageFilter, searchQuery]);

  // Active projects for Mobile Highlight Carousel
  const activeProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.currentStage === "in_progress" ||
        p.currentStage === "queued" ||
        p.currentStage === "review"
    );
  }, [projects]);

  // Keep drilldown modal synced when projects state updates
  useEffect(() => {
    if (drilldownProject) {
      const fresh = projects.find((p) => p.refCode === drilldownProject.refCode);
      if (fresh) setDrilldownProject(fresh);
    }
  }, [projects]);

  // Open Edit Modal
  const openEditModal = (item: ProjectTrackingItem) => {
    setEditingProject(item);
    setEditStage(item.currentStage);
    setEditPercent(item.progressPercent);
    setEditNotes(item.notes || "");
    setEditPreviewUrl(item.previewUrl || "");
  };

  // Save Progress Edits
  const handleSaveProgress = async () => {
    if (!editingProject) return;
    setIsSaving(true);
    try {
      const updated = await updateProjectProgress(
        editingProject.refCode,
        editStage,
        editPercent,
        editNotes,
        editPreviewUrl
      );
      if (updated) {
        setProjects((prev) =>
          prev.map((p) => (p.refCode === updated.refCode ? updated : p))
        );
        showToast(`Progres proyek ${updated.refCode} berhasil diperbarui (${editPercent}%)!`);
      }
      setEditingProject(null);
    } catch (e) {
      showToast("Gagal menyimpan progres.");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Stage Change
  const handleQuickStageChange = async (refCode: string, newStage: ProjectProgressStage) => {
    const defaultPct =
      newStage === "queued" ? 15 : newStage === "in_progress" ? 50 : newStage === "review" ? 80 : 100;
    try {
      const updated = await updateProjectProgress(refCode, newStage, defaultPct);
      if (updated) {
        setProjects((prev) =>
          prev.map((p) => (p.refCode === updated.refCode ? updated : p))
        );
        showToast(`Status ${refCode} diubah ke ${newStage.toUpperCase()} (${defaultPct}%)`);
      }
    } catch (e) {
      showToast("Gagal memperbarui status.");
    }
  };

  // Delete project
  const handleDelete = async (refCode: string) => {
    if (!confirm(`Hapus pelacakan proyek "${refCode}" secara permanen?`)) return;
    try {
      await deleteTrackedProject(refCode);
      setProjects((prev) => prev.filter((p) => p.refCode !== refCode));
      showToast(`Proyek ${refCode} berhasil dihapus.`);
    } catch (e) {
      showToast("Gagal menghapus proyek.");
    }
  };

  // Create new project
  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      alert("Nama klien wajib diisi");
      return;
    }
    const generatedRef =
      newCustomRef.trim().toUpperCase() ||
      `RZX-PRJ-${Math.floor(100000 + Math.random() * 900000)}`;

    const newItem: ProjectTrackingItem = {
      refCode: generatedRef,
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim() || undefined,
      serviceTitle: newServiceTitle,
      packageName: newPackageName,
      packageDuration: newDeadline,
      budget: newBudget,
      startDate: new Date().toISOString(),
      targetDeadline: newDeadline,
      currentStage: "queued",
      progressPercent: 15,
      notes: "Pesanan baru telah didaftarkan. Sedang dalam tahap persiapan brief dan kickoff.",
      deliverables: ["Hasil karya utama", "Revisi minor", "Master file final"],
      updatedAt: new Date().toISOString(),
    };

    try {
      await registerTrackedProject(newItem);
      setProjects((prev) => [newItem, ...prev.filter((p) => p.refCode !== newItem.refCode)]);
      showToast(`Proyek ${generatedRef} berhasil dibuat!`);
      setIsAddModalOpen(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewCustomRef("");
    } catch (err) {
      showToast("Gagal mendaftarkan proyek baru.");
    }
  };

  return (
    <div className={`p-4 md:p-8 space-y-6 min-h-screen ${isLight ? "bg-slate-50 text-slate-900" : "bg-[#0b0f19] text-white"}`}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#16b09f] text-black font-bold text-xs shadow-2xl backdrop-blur-md"
          >
            <RiCheckboxCircleFill className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Workspace View Switcher (Live Tracking Engine vs Incoming Orders vs Bank Accounts) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveMainTab("tracking")}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === "tracking"
              ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20 font-bold"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <RiCompass3Line className="w-4 h-4" />
          <span>{tr("Live Project Tracking", "Pelacakan Proyek (Live)", "Pelacakan Proyek (Live)")}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeMainTab === "tracking"
                ? "bg-black/25 text-black font-bold"
                : "bg-white/10 text-neutral-400"
            }`}
          >
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("orders")}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === "orders"
              ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20 font-bold"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <RiTicket2Line className="w-4 h-4" />
          <span>{tr("Task & Ticket", "Task & Ticket", "Task & Ticket")}</span>
          {pendingOrdersCount > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-400 text-black font-bold animate-pulse">
              {pendingOrdersCount}
            </span>
          ) : (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeMainTab === "orders"
                  ? "bg-black/25 text-black font-bold"
                  : "bg-white/10 text-neutral-400"
              }`}
            >
              0
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("payments")}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === "payments"
              ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20 font-bold"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <RiBankCardLine className="w-4 h-4" />
          <span>{tr("Bank & QRIS", "Bank & QRIS", "Bank & QRIS")}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeMainTab === "payments"
                ? "bg-black/25 text-black font-bold"
                : "bg-white/10 text-neutral-400"
            }`}
          >
            {tr("Published", "Publikasi", "Publikasi")}
          </span>
        </button>
      </div>

      {activeMainTab === "orders" ? (
        <ClientOrdersManager />
      ) : activeMainTab === "payments" ? (
        <PaymentAccountsWorkspace showToast={showToast} />
      ) : (
        <>
          {/* Mobile Top Header (Reference Screen 1 style) */}
          <div className="block md:hidden pb-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
              Live Progress Engine
            </span>
            <h1 className="text-2xl font-black tracking-tight flex items-baseline gap-2">
              <span className={isLight ? "text-slate-900" : "text-white"}>
                {tr("Project Dashboard", "Dashboard Proyek", "Dashboard Proyek")}
              </span>
              <span className="text-base font-semibold text-neutral-400 font-mono">
                ({projects.length})
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              style={{ backgroundColor: primaryColor, color: "#000000" }}
              className="px-3 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#16b09f]/20 cursor-pointer active:scale-95"
            >
              <span>{tr("Add", "Tambah", "Tambah")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Highlight Carousel: Active / Ongoing Projects (Reference Screen 1) */}
      {activeProjects.length > 0 && (
        <div className="block md:hidden space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-wider font-mono text-neutral-300">
                {tr("Ongoing Projects", "Proyek Berjalan", "Proyek Sadang Jalan")} ({activeProjects.length})
              </h2>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
            {activeProjects.map((p, idx) => {
              const meta = getStageMetadata(p.currentStage);
              const compCount = getMilestoneCompletion(p.currentStage, p.progressPercent);
              // Alternate gradient: amber for even, cyan for odd
              const isAmber = idx % 2 === 0;
              const gradientClass = isAmber
                ? "bg-gradient-to-br from-[#f8be14] via-[#f5b301] to-[#e59d00] text-neutral-950"
                : "bg-gradient-to-br from-[#1cdac5] via-[#16b09f] to-[#0ea5e9] text-neutral-950";

              return (
                <div
                  key={p.refCode}
                  onClick={() => setDrilldownProject(p)}
                  className={`p-4 rounded-3xl min-w-[270px] max-w-[300px] snap-center shrink-0 cursor-pointer overflow-hidden transition-all duration-300 active:scale-95 shadow-lg ${gradientClass}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/15 text-neutral-950 backdrop-blur-xs">
                      <RiSparklingFill className="w-3 h-3" />
                      <span>{meta.label.split(" ")[1] || "Ongoing"}</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold opacity-80">
                      {p.refCode}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base leading-snug line-clamp-2 text-neutral-950 mb-1">
                    {p.serviceTitle}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-900 line-clamp-1 mb-3">
                    {p.clientName} • {p.packageName}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-black/15 text-xs font-mono">
                    <span className="flex items-center gap-1 font-bold text-[11px] text-neutral-950">
                      <RiTimeLine className="w-3.5 h-3.5" />
                      {p.targetDeadline || p.packageDuration || "7-10 Hari"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/90 text-white font-bold text-[10px]">
                      {compCount} of 4 Tahap
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Header (Desktop View) */}
      <div className={`hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b ${isLight ? "border-slate-200" : "border-white/10"}`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <RiCompass3Line className="w-7 h-7 text-[#16b09f]" />
              <span className={isLight ? "text-slate-900" : "text-white"}>
                {tr("Project Tracking & Execution (Live)", "Tracking & Pengerjaan Proyek (Live)", "Tracking & Karajo Proyek (Live)")}
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Cloud Active
            </span>
          </div>
          <p className={`mt-1 text-xs md:text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            {tr(
              "Manage project stages from",
              "Kelola tahapan pengerjaan proyek dari",
              "Atua tahapan karajo proyek dari"
            )}{" "}
            <strong>
              {tr(
                "Not Started → In Progress → Review → Finished",
                "Belum Dikerjakan → Dalam Proses → Review → Selesai",
                "Alun Dikarajoan → Dalam Proses → Review → Salasa"
              )}
            </strong>
            .{" "}
            {tr(
              "Clients can check their reference code live on the website.",
              "Klien dapat mengecek kode referensi secara live di website.",
              "Klien dapek ngecek kode referensi sacaro live di website."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{ backgroundColor: primaryColor, color: "#000000" }}
            className="px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center hover:brightness-110 active:scale-95 shadow-md shadow-[#16b09f]/30 cursor-pointer"
          >
            <RiAddLine className="w-4 h-4 mr-1" />
            <span>{tr("Create New Project Code", "Buat Kode Proyek Baru", "Buek Kode Proyek Baru")}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Desktop View) */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            {tr("Total Projects", "Total Proyek", "Total Proyek")}
          </span>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>{projects.length}</div>
          <span className="text-[10px] text-slate-500 font-mono">
            {tr("Saved in Cloud", "Tersimpan di Cloud", "Tasimpan di Cloud")}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-amber-600" : "text-amber-400"}`}>
            {tr("Queued / Waiting", "Belum / Antrean", "Alun / Antrean")}
          </span>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isLight ? "text-amber-600" : "text-amber-300"}`}>
            {projects.filter((p) => p.currentStage === "queued").length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {tr("Waiting Kickoff", "Menunggu Kickoff", "Mananti Kickoff")}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-teal-600" : "text-[#16b09f]"}`}>
            {tr("In Progress / Review", "Sedang Proses / Review", "Sadang Proses / Review")}
          </span>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isLight ? "text-teal-600" : "text-[#16b09f]"}`}>
            {projects.filter((p) => p.currentStage === "in_progress" || p.currentStage === "review").length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {tr("Active Production", "Produksi Aktif", "Produksi Aktif")}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>
            {tr("Finished / Done", "Finish / Selesai", "Salasa / Tuntong")}
          </span>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>
            {projects.filter((p) => p.currentStage === "completed").length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">100% Handover</span>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: tr("All", "Semua", "Kasadonyo") },
            { id: "queued", label: `⏳ ${tr("Queued", "Belum (Antrean)", "Alun (Antrean)")}` },
            { id: "in_progress", label: `⚡ ${tr("In Progress", "Sedang Proses", "Sadang Proses")}` },
            { id: "review", label: `🔍 ${tr("Review & Revision", "Review & Revisi", "Review & Revisi")}` },
            { id: "completed", label: `✅ ${tr("Finished", "Finish / Selesai", "Salasa / Tuntong")}` },
          ].map((st) => {
            const isActive = stageFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStageFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#16b09f] text-black shadow-md font-bold"
                    : isLight
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={tr(
              "Search code (e.g. RZX-PRJ-632153) or name...",
              "Cari kode (misal: RZX-PRJ-632153) atau nama...",
              "Cari kode (misal: RZX-PRJ-632153) atau namo..."
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-[#16b09f] ${
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
            }`}
          />
        </div>
      </div>

      {/* Table of Tracked Projects (Desktop Only) */}
      <div className={`hidden md:block rounded-2xl border overflow-hidden shadow-xl ${isLight ? "bg-white border-slate-200" : "bg-neutral-950/90 border-white/10"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-mono uppercase tracking-wider ${isLight ? "bg-slate-50/90 border-slate-200 text-slate-600" : "bg-white/[0.04] border-white/10 text-slate-400"}`}>
              <tr>
                <th className="py-3 px-4">{tr("Reference Code", "Kode Referensi", "Kode Referensi")}</th>
                <th className="py-3 px-4">{tr("Client & Contact", "Klien & Kontak", "Klien & Kontak")}</th>
                <th className="py-3 px-4">{tr("Service & Package", "Layanan & Paket", "Jaso & Paket")}</th>
                <th className="py-3 px-4">{tr("Progress Stage", "Tahapan Pengerjaan", "Tahapan Karajo")}</th>
                <th className="py-3 px-4">{tr("Progress (%)", "Progres (%)", "Progres (%)")}</th>
                <th className="py-3 px-4">{tr("Latest Milestone Notes", "Catatan Milestone Terkini", "Catatan Milestone Kini")}</th>
                <th className="py-3 px-4 text-center">{tr("Actions", "Aksi", "Aksi")}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
              {filteredProjects.map((p) => {
                const meta = getStageMetadata(p.currentStage);
                const receiptInfo = getOrderReceipt(p.refCode);
                const proofUrl = p.paymentProofUrl || receiptInfo?.paymentProofUrl;
                const receiptNum = p.receiptNumber || receiptInfo?.receiptNumber;
                const paymentMethodName = p.paymentMethod || receiptInfo?.paymentMethod;
                const paymentPlanName = p.paymentPlan || receiptInfo?.paymentPlan;

                return (
                  <tr key={p.refCode} className={`transition-colors ${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"}`}>
                    {/* Ref Code */}
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-md border ${isLight ? "bg-teal-50 border-teal-200 text-teal-700 font-bold" : "bg-white/[0.06] border-white/10 text-[#16b09f]"}`}>
                          {p.refCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(p.refCode);
                              showToast(`Kode ${p.refCode} tersalin!`);
                            }
                          }}
                          className={`p-1 rounded transition-colors ${isLight ? "hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "hover:bg-white/10 text-slate-400 hover:text-white"}`}
                          title="Salin Kode"
                        >
                          <RiFileCopyLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <div className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{p.clientName}</div>
                      {p.clientPhone && (
                        <a
                          href={`https://wa.me/${p.clientPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[11px] font-mono flex items-center gap-1 mt-0.5 ${isLight ? "text-slate-500 hover:text-emerald-600" : "text-slate-400 hover:text-emerald-400"}`}
                        >
                          <RiWhatsappLine className="w-3 h-3 text-emerald-500" />
                          <span>{p.clientPhone}</span>
                        </a>
                      )}
                      {proofUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReceiptProof({
                              imageUrl: proofUrl,
                              clientName: p.clientName,
                              refCode: p.refCode,
                              receiptNumber: receiptNum,
                              budget: p.budget,
                              serviceTitle: p.serviceTitle,
                              packageName: p.packageName,
                              clientPhone: p.clientPhone,
                              paymentMethod: paymentMethodName,
                              paymentPlan: paymentPlanName,
                            })
                          }
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md cursor-pointer transition"
                          title="Lihat Bukti Resi Transfer"
                        >
                          <RiImageFill className="w-3 h-3 text-emerald-400" />
                          <span>Resi Transfer 📄</span>
                        </button>
                      )}
                    </td>

                    {/* Service & Package */}
                    <td className="py-3.5 px-4">
                      <div className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>{p.serviceTitle}</div>
                      <div className={`text-[11px] font-mono ${isLight ? "text-teal-600 font-semibold" : "text-[#16b09f]"}`}>{p.packageName}</div>
                    </td>

                    {/* Quick Stage Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={p.currentStage}
                        onChange={(e) =>
                          handleQuickStageChange(p.refCode, e.target.value as ProjectProgressStage)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${isLight ? "shadow-sm" : ""}`}
                        style={{
                          backgroundColor: meta.badgeBg,
                          borderColor: meta.badgeBorder,
                          color: meta.color,
                        }}
                      >
                        <option value="queued" className={isLight ? "bg-white text-amber-700" : "bg-neutral-900 text-amber-400"}>
                          ⏳ {tr("Queued", "Belum (Antrean)", "Alun (Antrean)")}
                        </option>
                        <option value="in_progress" className={isLight ? "bg-white text-teal-700" : "bg-neutral-900 text-[#16b09f]"}>
                          ⚡ {tr("In Progress", "Sedang Proses", "Sadang Proses")}
                        </option>
                        <option value="review" className={isLight ? "bg-white text-indigo-700" : "bg-neutral-900 text-indigo-400"}>
                          🔍 {tr("In Review", "Tahap Review", "Tahap Review")}
                        </option>
                        <option value="completed" className={isLight ? "bg-white text-emerald-700" : "bg-neutral-900 text-emerald-400"}>
                          ✅ {tr("Finished / Done", "Finish / Selesai", "Salasa / Tuntong")}
                        </option>
                      </select>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-20 h-2 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${p.progressPercent}%`,
                              backgroundColor: meta.color,
                            }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                          {p.progressPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Milestone Notes */}
                    <td className={`py-3.5 px-4 max-w-xs truncate font-light text-[11px] ${isLight ? "text-slate-600" : "text-slate-300"}`} title={p.notes}>
                      {p.notes || "-"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {proofUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedReceiptProof({
                                imageUrl: proofUrl,
                                clientName: p.clientName,
                                refCode: p.refCode,
                                receiptNumber: receiptNum,
                                budget: p.budget,
                                serviceTitle: p.serviceTitle,
                                packageName: p.packageName,
                                clientPhone: p.clientPhone,
                                paymentMethod: paymentMethodName,
                                paymentPlan: paymentPlanName,
                              })
                            }
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLight
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                            }`}
                            title="Lihat Foto Bukti Resi Transfer Klien"
                          >
                            <RiImageFill className="w-4 h-4 text-emerald-500" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setClientPreviewCode(p.refCode)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                              : "bg-white/[0.06] hover:bg-white/15 text-slate-300 hover:text-white"
                          }`}
                          title="Pratinjau Tampilan Klien"
                        >
                          <RiEyeLine className="w-4 h-4 text-[#16b09f]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight
                              ? "bg-slate-100 hover:bg-[#16b09f] hover:text-black text-slate-600 border border-slate-200"
                              : "bg-white/[0.06] hover:bg-[#16b09f] hover:text-black text-slate-300"
                          }`}
                          title="Edit Progres Detail"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.refCode)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight
                              ? "bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200"
                              : "bg-white/[0.06] hover:bg-rose-500 hover:text-white text-slate-400"
                          }`}
                          title="Hapus Proyek"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className={`py-10 text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {tr(
                      "No projects match your search.",
                      "Tidak ada proyek yang sesuai dengan pencarian.",
                      "Indak ado proyek nan sasuai jo pancarian."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE PROJECT TASK CARDS LIST (Reference Screen 1 Bottom) ── */}
      <div className="block md:hidden space-y-3">
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-400">
            {tr("Project Task List", "Daftar Tugas Proyek", "Daftar Tugas Proyek")} ({filteredProjects.length})
          </span>
          <span className="text-[10px] text-teal-400 font-mono font-semibold">
            {tr("Tap card for details", "Klik kartu untuk rincian", "Klik kartu untuak rincian")}
          </span>
        </div>

        {filteredProjects.map((p) => {
          const meta = getStageMetadata(p.currentStage);
          const receiptInfo = getOrderReceipt(p.refCode);
          const proofUrl = p.paymentProofUrl || receiptInfo?.paymentProofUrl;
          const receiptNum = p.receiptNumber || receiptInfo?.receiptNumber;
          const paymentMethodName = p.paymentMethod || receiptInfo?.paymentMethod;
          const paymentPlanName = p.paymentPlan || receiptInfo?.paymentPlan;
          const compCount = getMilestoneCompletion(p.currentStage, p.progressPercent);

          const cardBgClass = isLight
            ? p.currentStage === "in_progress"
              ? "bg-amber-50/70 border-amber-200"
              : p.currentStage === "review"
              ? "bg-indigo-50/70 border-indigo-200"
              : p.currentStage === "completed"
              ? "bg-emerald-50/70 border-emerald-200"
              : "bg-white border-slate-200 shadow-sm"
            : p.currentStage === "in_progress"
            ? "bg-amber-500/[0.04] border-amber-500/25"
            : p.currentStage === "review"
            ? "bg-indigo-500/[0.04] border-indigo-500/25"
            : p.currentStage === "completed"
            ? "bg-emerald-500/[0.04] border-emerald-500/25"
            : "bg-neutral-900/60 border-white/10";

          return (
            <div
              key={p.refCode}
              className={`p-4 rounded-2xl border transition-all shadow-sm space-y-3 ${cardBgClass}`}
            >
              {/* Card Header: Title & Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(p.refCode);
                        showToast(`Kode ${p.refCode} tersalin!`);
                      }
                    }}
                    className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded cursor-pointer hover:bg-teal-500/20 active:scale-95"
                    title="Klik untuk salin kode"
                  >
                    <span>{p.refCode}</span>
                    <RiFileCopyLine className="w-2.5 h-2.5" />
                  </span>
                  <h3
                    onClick={() => setDrilldownProject(p)}
                    className={`font-bold text-sm leading-snug cursor-pointer hover:underline ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {p.serviceTitle}
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-400">
                    {p.packageName}
                  </p>
                </div>

                {/* Status Pill Tag */}
                <div
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border shrink-0 text-right"
                  style={{
                    backgroundColor: meta.badgeBg,
                    borderColor: meta.badgeBorder,
                    color: meta.color,
                  }}
                >
                  {meta.label}
                </div>
              </div>

              {/* Client & Timeline Details */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 truncate">
                  <RiUser3Line className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className={`font-medium truncate ${isLight ? "text-slate-800" : "text-neutral-200"}`}>
                    {p.clientName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-end font-mono text-[11px] text-neutral-400">
                  <RiCalendarEventLine className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{p.targetDeadline || p.packageDuration || "7-10 Hari"}</span>
                </div>
              </div>

              {/* Progress Bar + Completion stats */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">
                    {tr("Progress", "Progres", "Progres")} ({compCount}/4 {tr("Stages", "Tahap", "Tahap")})
                  </span>
                  <span className="font-bold text-teal-400">{p.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${p.progressPercent}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>

              {/* Milestone Note bubble */}
              {p.notes && (
                <div className="text-[11px] text-neutral-300 bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                  <RiFileList3Line className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">
                    {p.notes}
                  </span>
                </div>
              )}

              {/* Proof Receipt Tag if exists */}
              {proofUrl && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReceiptProof({
                        imageUrl: proofUrl,
                        clientName: p.clientName,
                        refCode: p.refCode,
                        receiptNumber: receiptNum,
                        budget: p.budget,
                        serviceTitle: p.serviceTitle,
                        packageName: p.packageName,
                        clientPhone: p.clientPhone,
                        paymentMethod: paymentMethodName,
                        paymentPlan: paymentPlanName,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition cursor-pointer active:scale-95"
                  >
                    <RiImageFill className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr("View Transfer Receipt 📄", "Lihat Bukti Resi Transfer 📄", "Caliak Bukti Resi Transfer 📄")}</span>
                  </button>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  {/* Primary Drilldown button */}
                  <button
                    type="button"
                    onClick={() => setDrilldownProject(p)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16b09f] hover:bg-teal-400 text-black transition flex items-center gap-1 shadow-md shadow-[#16b09f]/15 cursor-pointer active:scale-95"
                  >
                    <span>{tr("Details & Milestones", "Detail & Milestone", "Rincian & Milestones")}</span>
                    <RiCompass3Line className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Progress button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer active:scale-95"
                    title={tr("Edit Progress", "Edit Progres", "Edit Progres")}
                  >
                    <RiEditLine className="w-3.5 h-3.5" />
                  </button>

                  {/* Client Preview */}
                  <button
                    type="button"
                    onClick={() => setClientPreviewCode(p.refCode)}
                    className="p-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 transition cursor-pointer active:scale-95"
                    title={tr("Client Preview", "Tampilan Klien", "Tampilan Klien")}
                  >
                    <RiEyeLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="py-12 text-center text-neutral-400 border border-white/10 rounded-2xl bg-white/[0.02]">
            <RiFileList3Line className="w-8 h-8 mx-auto text-neutral-500 mb-2 opacity-50" />
            <p className="text-xs">
              {tr(
                "No projects match the filter/search.",
                "Tidak ada proyek yang sesuai filter / pencarian.",
                "Indak ado proyek nan sasuai filter / pancarian."
              )}
            </p>
          </div>
        )}
      </div>

      {/* ── MOBILE DRILLDOWN MODAL (Reference Screen 2 & 3) ── */}
      {drilldownProject && (
        <div
          className="fixed inset-0 z-[125] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setDrilldownProject(null)}
        >
          <div
            className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#101319] text-white p-5 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl space-y-4`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Back Arrow */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setDrilldownProject(null)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <RiArrowLeftLine className="w-4 h-4 text-teal-400" />
                <span>{tr("Back to Dashboard", "Kembali ke Dashboard", "Baliak ka Dashboard")}</span>
              </button>
              <button
                type="button"
                onClick={() => setDrilldownProject(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Hero Card with Amber / Accent gradient (Screen 3 Top) */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#f8be14] via-[#f5b301] to-[#e59d00] text-neutral-950 shadow-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/15 text-neutral-950">
                  <RiSparklingFill className="w-3 h-3" />
                  <span>{getStageMetadata(drilldownProject.currentStage).label}</span>
                </span>
                <span className="font-mono text-xs font-bold opacity-80">
                  {drilldownProject.refCode}
                </span>
              </div>
              <h2 className="text-xl font-black leading-tight text-neutral-950">
                {drilldownProject.serviceTitle}
              </h2>
              <p className="text-xs font-semibold text-neutral-900">
                {drilldownProject.clientName} • {drilldownProject.packageName}
              </p>
            </div>

            {/* Task Details Card (Screen 3 Black Card style) */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                {tr("Project Details (Task Details)", "Rincian Proyek (Task Details)", "Rincian Proyek (Task Details)")}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-neutral-400 block font-mono">STATUS</span>
                  <span className="text-xs font-bold text-teal-400 capitalize truncate block mt-0.5">
                    {drilldownProject.currentStage.replace("_", " ")}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-neutral-400 block font-mono">TARGET</span>
                  <span className="text-xs font-bold text-neutral-200 truncate block mt-0.5">
                    {drilldownProject.targetDeadline || drilldownProject.packageDuration || "10 Hari"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-neutral-400 block font-mono">
                    {tr("STAGE", "TAHAP", "TAHAP")}
                  </span>
                  <span className="text-xs font-bold text-amber-400 block mt-0.5">
                    {getMilestoneCompletion(drilldownProject.currentStage, drilldownProject.progressPercent)}/4 {tr("Done", "Selesai", "Salasa")}
                  </span>
                </div>
              </div>

              {/* Client Contact Info */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <RiUser3Line className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-semibold">{drilldownProject.clientName}</span>
                </div>
                {drilldownProject.clientPhone && (
                  <a
                    href={`https://wa.me/${drilldownProject.clientPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                  >
                    <RiWhatsappLine className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr("Client WhatsApp", "WhatsApp Klien", "WhatsApp Klien")}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Subtasks & Milestones Checklist (Screen 3 Checklist style!) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-300">
                  {tr("Subtasks & Progress Stages", "Subtasks & Tahapan Pengerjaan", "Subtasks & Tahapan Karajo")}
                </h3>
                <span className="text-[10px] text-teal-400 font-mono">
                  {tr("Click to set stage", "Klik untuk set tahap", "Klik untuak set tahap")}
                </span>
              </div>

              <div className="space-y-2">
                {STUDIO_WORKFLOW_MILESTONES.map((m) => {
                  const currentComp = getMilestoneCompletion(
                    drilldownProject.currentStage,
                    drilldownProject.progressPercent
                  );
                  const isDone = m.step < currentComp || (m.step === 4 && drilldownProject.currentStage === "completed");
                  const isActive = m.stage === drilldownProject.currentStage && drilldownProject.currentStage !== "completed";

                  return (
                    <div
                      key={m.step}
                      onClick={() => handleQuickStageChange(drilldownProject.refCode, m.stage)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isActive
                          ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                          : isDone
                          ? "bg-teal-500/5 border-teal-500/20"
                          : "bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* Circular check indicator */}
                      <div className="pt-0.5 shrink-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-teal-500 text-black flex items-center justify-center font-bold text-xs shadow-sm">
                            ✓
                          </div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center bg-amber-400/20 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-neutral-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold leading-tight ${
                            isActive ? "text-amber-300" : isDone ? "text-teal-300" : "text-neutral-300"
                          }`}>
                            {m.title}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold shrink-0">
                              {tr("Active Now", "Aktif Sekarang", "Aktif Kini")}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Studio Notes & Latest Report */}
            {drilldownProject.notes && (
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                  {tr("Latest Milestone Notes (Client Facing)", "Catatan Milestone Terkini (Dibaca Klien)", "Catatan Milestone Kini (Dibaco Klien)")}
                </span>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {drilldownProject.notes}
                </p>
              </div>
            )}

            {/* Proof Receipt Photo if available */}
            {(() => {
              const receiptInfo = getOrderReceipt(drilldownProject.refCode);
              const proofUrl = drilldownProject.paymentProofUrl || receiptInfo?.paymentProofUrl;
              if (!proofUrl) return null;
              return (
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <RiImageFill className="w-4 h-4" />
                      {tr("Client Transfer Receipt Proof", "Bukti Resi Transfer Klien", "Bukti Resi Transfer Klien")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedReceiptProof({
                          imageUrl: proofUrl,
                          clientName: drilldownProject.clientName,
                          refCode: drilldownProject.refCode,
                          receiptNumber: drilldownProject.receiptNumber || receiptInfo?.receiptNumber,
                          budget: drilldownProject.budget,
                          serviceTitle: drilldownProject.serviceTitle,
                          packageName: drilldownProject.packageName,
                          clientPhone: drilldownProject.clientPhone,
                          paymentMethod: drilldownProject.paymentMethod || receiptInfo?.paymentMethod,
                          paymentPlan: drilldownProject.paymentPlan || receiptInfo?.paymentPlan,
                        })
                      }
                      className="text-xs underline text-emerald-300 cursor-pointer"
                    >
                      {tr("Enlarge Photo 🔍", "Perbesar Foto 🔍", "Pagadang Foto 🔍")}
                    </button>
                  </div>
                  <div
                    onClick={() =>
                      setSelectedReceiptProof({
                        imageUrl: proofUrl,
                        clientName: drilldownProject.clientName,
                        refCode: drilldownProject.refCode,
                        receiptNumber: drilldownProject.receiptNumber || receiptInfo?.receiptNumber,
                        budget: drilldownProject.budget,
                        serviceTitle: drilldownProject.serviceTitle,
                        packageName: drilldownProject.packageName,
                        clientPhone: drilldownProject.clientPhone,
                        paymentMethod: drilldownProject.paymentMethod || receiptInfo?.paymentMethod,
                        paymentPlan: drilldownProject.paymentPlan || receiptInfo?.paymentPlan,
                      })
                    }
                    className="h-28 rounded-xl overflow-hidden border border-white/10 bg-black cursor-pointer hover:opacity-90 transition relative flex items-center justify-center"
                  >
                    <img src={proofUrl} alt="Resi" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs font-bold text-white gap-1">
                      <RiEyeLine className="w-4 h-4" />
                      <span>{tr("Click to View Original Photo", "Klik untuk Lihat Foto Asli", "Klik untuak Caliak Foto Asli")}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom Actions Sticky Row */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  openEditModal(drilldownProject);
                }}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#16b09f] hover:bg-teal-400 text-black transition flex items-center justify-center gap-2 shadow-lg shadow-[#16b09f]/20 cursor-pointer active:scale-95"
              >
                <RiEditLine className="w-4 h-4" />
                <span>{tr("Update Progress Report", "Update Laporan Progres", "Update Laporan Progres")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(drilldownProject.refCode);
                  setDrilldownProject(null);
                }}
                className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition flex items-center justify-center cursor-pointer active:scale-95"
                title={tr("Delete Project", "Hapus Proyek", "Hapuih Proyek")}
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Progres Proyek */}
      {editingProject && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setEditingProject(null)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-950 border-white/20 text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
              <div>
                <span className="text-[10px] font-mono text-[#16b09f] uppercase tracking-wider block">
                  {tr("Update Project Progress", "Update Progres Proyek", "Update Progres Proyek")}
                </span>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <span>{editingProject.refCode}</span>
                  <span className={`text-xs font-normal ${isLight ? "text-slate-500" : "text-slate-400"}`}>({editingProject.serviceTitle})</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className={`p-1 rounded-lg ${isLight ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className={`block font-mono uppercase tracking-wider mb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {tr("1. Project Progress Stage:", "1. Tahapan Pengerjaan Proyek:", "1. Tahapan Karajo Proyek:")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "queued", label: `⏳ ${tr("Queued", "Belum (Antrean)", "Alun (Antrean)")}`, pct: 15 },
                    { id: "in_progress", label: `⚡ ${tr("In Progress", "Sedang Proses", "Sadang Proses")}`, pct: 50 },
                    { id: "review", label: `🔍 ${tr("Review & Revision", "Review & Revisi", "Review & Revisi")}`, pct: 80 },
                    { id: "completed", label: `✅ ${tr("Finished", "Finish / Selesai", "Salasa / Tuntong")}`, pct: 100 },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setEditStage(st.id as ProjectProgressStage);
                        setEditPercent(st.pct);
                      }}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                        editStage === st.id
                          ? "bg-[#16b09f]/20 border-[#16b09f] text-[#16b09f]"
                          : isLight
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 font-mono">
                  <label className={`uppercase tracking-wider ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {tr("2. Progress Percentage:", "2. Persentase Progres:", "2. Persentase Progres:")}
                  </label>
                  <span className="text-[#16b09f] font-bold text-sm">{editPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={editPercent}
                  onChange={(e) => setEditPercent(parseInt(e.target.value, 10))}
                  className="w-full accent-[#16b09f] cursor-pointer"
                />
              </div>

              <div>
                <label className={`block font-mono uppercase tracking-wider mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {tr("3. Latest Milestone Notes (Client Facing):", "3. Catatan Milestone Terkini (Dibaca Klien Saat Tracking):", "3. Catatan Milestone Kini (Dibaco Klien Wakatu Tracking):")}
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={tr("Describe current stage being worked on...", "Ceritakan tahap apa yang sedang dikerjakan saat ini...", "Citoan tahap apo nan sadang dikarajoan kini...")}
                  className={`w-full px-3 py-2 rounded-xl text-xs outline-none focus:border-[#16b09f] resize-y border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block font-mono uppercase tracking-wider mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {tr("4. Preview Draft / Artwork Link (Optional):", "4. Link Pratinjau Draft / Hasil Karya (Opsional):", "4. Link Pratinjau Draft / Hasiil Karya (Opsional):")}
                </label>
                <input
                  type="text"
                  value={editPreviewUrl}
                  onChange={(e) => setEditPreviewUrl(e.target.value)}
                  placeholder={tr("Google Drive, Figma, or Staging link...", "Link Google Drive, Figma, atau Staging...", "Link Google Drive, Figma, atau Staging...")}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none focus:border-[#16b09f] border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(editingProject.refCode);
                    setEditingProject(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title={tr("Delete Project", "Hapus Proyek", "Hapuih Proyek")}
                >
                  <RiDeleteBinLine className="w-3.5 h-3.5" />
                  <span>{tr("Delete", "Hapus", "Hapuih")}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-neutral-900 hover:bg-neutral-800 text-slate-300"
                    }`}
                  >
                    {tr("Cancel", "Batal", "Batal")}
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveProgress}
                    style={{ backgroundColor: primaryColor, color: "#000000" }}
                    className="px-5 py-2 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 shadow-md shadow-[#16b09f]/30 cursor-pointer"
                  >
                    {isSaving
                      ? tr("Saving...", "Menyimpan...", "Manyimpan...")
                      : tr("Save Progress & Sync", "Simpan Progres & Sinkronkan", "Simpan Progres & Sinkronkan")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Kode Proyek Baru */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-950 border-white/20 text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <RiAddLine className="w-5 h-5 text-[#16b09f]" />
                <span>{tr("Create New Project Code", "Buat Kode Proyek Baru", "Buek Kode Proyek Baru")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className={`p-1 rounded-lg ${isLight ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-mono uppercase mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {tr("Client / Company Name *", "Nama Klien / Perusahaan *", "Namo Klien / Parusahaan *")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={tr("Example: PT Kreatif Nusantara", "Contoh: PT Kreatif Nusantara", "Contoh: PT Kreatif Nusantara")}
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl outline-none focus:border-[#16b09f] border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block font-mono uppercase mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {tr("Client WhatsApp Number", "Nomor WhatsApp Klien", "Nomor WhatsApp Klien")}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl outline-none focus:border-[#16b09f] border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-mono uppercase mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {tr("Project Service", "Layanan Proyek", "Jaso Proyek")}
                  </label>
                  <input
                    type="text"
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl outline-none focus:border-[#16b09f] border ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-mono uppercase mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {tr("Package", "Paket", "Paket")}
                  </label>
                  <input
                    type="text"
                    value={newPackageName}
                    onChange={(e) => setNewPackageName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl outline-none focus:border-[#16b09f] border ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-mono uppercase mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {tr("Target Deadline", "Target Deadline", "Target Deadline")}
                  </label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl outline-none focus:border-[#16b09f] border ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-mono uppercase mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {tr("Custom Code (Optional)", "Kode Kustom (Opsional)", "Kode Kustom (Opsional)")}
                  </label>
                  <input
                    type="text"
                    placeholder={tr("Leave blank for auto", "Kosongkan jika ingin auto", "Kosongkan kok nio auto")}
                    value={newCustomRef}
                    onChange={(e) => setNewCustomRef(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl font-mono uppercase outline-none focus:border-[#16b09f] border ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-neutral-900 hover:bg-neutral-800 text-slate-300"
                  }`}
                >
                  {tr("Cancel", "Batal", "Batal")}
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryColor, color: "#000000" }}
                  className="px-5 py-2 rounded-xl font-bold text-xs hover:brightness-110 shadow-md shadow-[#16b09f]/30"
                >
                  {tr("Register Project", "Daftarkan Proyek", "Daftarkan Proyek")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Preview Modal */}
      {clientPreviewCode && (
        <ProjectTrackerModal
          isOpen={true}
          onClose={() => setClientPreviewCode(null)}
          initialCode={clientPreviewCode}
        />
      )}
        </>
      )}

      {/* High-Res Receipt Proof Viewer */}
      <ReceiptProofModal
        data={selectedReceiptProof}
        onClose={() => setSelectedReceiptProof(null)}
      />
    </div>
  );
}

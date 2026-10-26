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

export default function ProjectTrackerWorkspace() {
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";
  const { tr } = useLang();

  const [projects, setProjects] = useState<ProjectTrackingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingProject, setEditingProject] = useState<ProjectTrackingItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [clientPreviewCode, setClientPreviewCode] = useState<string | null>(null);
  const [selectedReceiptProof, setSelectedReceiptProof] = useState<ReceiptProofData | null>(null);

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

      {/* Top Header */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b ${isLight ? "border-slate-200" : "border-white/10"}`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <RiCompass3Line className="w-7 h-7 text-[#16b09f]" />
              <span className={isLight ? "text-slate-900" : "text-white"}>Tracking & Pengerjaan Proyek (Live)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Cloud Active
            </span>
          </div>
          <p className={`mt-1 text-xs md:text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            Kelola tahapan pengerjaan proyek dari <strong>Belum Dikerjakan → Dalam Proses → Review → Finish / Selesai</strong>. Klien dapat mengecek kode referensi secara live di website.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{ backgroundColor: primaryColor, color: "#000000" }}
            className="px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center hover:brightness-110 active:scale-95 shadow-md shadow-[#16b09f]/30 cursor-pointer"
          >
            <span>Buat Kode Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-slate-400"}`}>Total Proyek</span>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>{projects.length}</div>
          <span className="text-[10px] text-slate-500 font-mono">Tersimpan di Cloud</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-amber-600" : "text-amber-400"}`}>Belum / Antrean</span>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isLight ? "text-amber-600" : "text-amber-300"}`}>
            {projects.filter((p) => p.currentStage === "queued").length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Menunggu Kickoff</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-teal-600" : "text-[#16b09f]"}`}>Sedang Proses / Review</span>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isLight ? "text-teal-600" : "text-[#16b09f]"}`}>
            {projects.filter((p) => p.currentStage === "in_progress" || p.currentStage === "review").length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Produksi Aktif</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/10"}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>Finish / Selesai</span>
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
            { id: "ALL", label: "Semua" },
            { id: "queued", label: "⏳ Belum (Antrean)" },
            { id: "in_progress", label: "⚡ Sedang Proses" },
            { id: "review", label: "🔍 Review & Revisi" },
            { id: "completed", label: "✅ Finish / Selesai" },
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
            placeholder="Cari kode (misal: RZX-PRJ-632153) atau nama..."
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

      {/* Table of Tracked Projects */}
      <div className={`rounded-2xl border overflow-hidden shadow-xl ${isLight ? "bg-white border-slate-200" : "bg-neutral-950/90 border-white/10"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-mono uppercase tracking-wider ${isLight ? "bg-slate-50/90 border-slate-200 text-slate-600" : "bg-white/[0.04] border-white/10 text-slate-400"}`}>
              <tr>
                <th className="py-3 px-4">Kode Referensi</th>
                <th className="py-3 px-4">Klien & Kontak</th>
                <th className="py-3 px-4">Layanan & Paket</th>
                <th className="py-3 px-4">Tahapan Pengerjaan</th>
                <th className="py-3 px-4">Progres (%)</th>
                <th className="py-3 px-4">Catatan Milestone Terkini</th>
                <th className="py-3 px-4 text-center">Aksi</th>
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
                          ⏳ Belum (Antrean)
                        </option>
                        <option value="in_progress" className={isLight ? "bg-white text-teal-700" : "bg-neutral-900 text-[#16b09f]"}>
                          ⚡ Sedang Proses
                        </option>
                        <option value="review" className={isLight ? "bg-white text-indigo-700" : "bg-neutral-900 text-indigo-400"}>
                          🔍 Tahap Review
                        </option>
                        <option value="completed" className={isLight ? "bg-white text-emerald-700" : "bg-neutral-900 text-emerald-400"}>
                          ✅ Finish / Selesai
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
                    Tidak ada proyek yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  Update Progres Proyek
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
                  1. Tahapan Pengerjaan Proyek:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "queued", label: "⏳ Belum (Antrean)", pct: 15 },
                    { id: "in_progress", label: "⚡ Sedang Proses", pct: 50 },
                    { id: "review", label: "🔍 Review & Revisi", pct: 80 },
                    { id: "completed", label: "✅ Finish / Selesai", pct: 100 },
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
                    2. Persentase Progres:
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
                  3. Catatan Milestone Terkini (Dibaca Klien Saat Tracking):
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ceritakan tahap apa yang sedang dikerjakan saat ini..."
                  className={`w-full px-3 py-2 rounded-xl text-xs outline-none focus:border-[#16b09f] resize-y border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block font-mono uppercase tracking-wider mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  4. Link Pratinjau Draft / Hasil Karya (Opsional):
                </label>
                <input
                  type="text"
                  value={editPreviewUrl}
                  onChange={(e) => setEditPreviewUrl(e.target.value)}
                  placeholder="Link Google Drive, Figma, atau Staging..."
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none focus:border-[#16b09f] border ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-neutral-900 border-white/15 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-neutral-900 hover:bg-neutral-800 text-slate-300"
                  }`}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveProgress}
                  style={{ backgroundColor: primaryColor, color: "#000000" }}
                  className="px-5 py-2 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 shadow-md shadow-[#16b09f]/30 cursor-pointer"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Progres & Sinkronkan"}
                </button>
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
                <span>Buat Kode Proyek Baru</span>
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
                  Nama Klien / Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Kreatif Nusantara"
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
                  Nomor WhatsApp Klien
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
                    Layanan Proyek
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
                    Paket
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
                    Target Deadline
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
                    Kode Kustom (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Kosongkan jika ingin auto"
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
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryColor, color: "#000000" }}
                  className="px-5 py-2 rounded-xl font-bold text-xs hover:brightness-110 shadow-md shadow-[#16b09f]/30"
                >
                  Daftarkan Proyek
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

      {/* High-Res Receipt Proof Viewer */}
      <ReceiptProofModal
        data={selectedReceiptProof}
        onClose={() => setSelectedReceiptProof(null)}
      />
    </div>
  );
}

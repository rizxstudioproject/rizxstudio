"use client";

import React, { useState, useEffect } from "react";
import {
  RiSearchLine,
  RiCloseLine,
  RiCheckLine,
  RiTimeLine,
  RiFileCopyLine,
  RiWhatsappLine,
  RiExternalLinkLine,
  RiSparklingFill,
  RiRefreshLine,
  RiCheckboxCircleFill,
  RiCompass3Line,
} from "react-icons/ri";
import {
  ProjectTrackingItem,
  getProjectByRefCode,
  getStageMetadata,
} from "@/lib/projectTrackerService";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

interface ProjectTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export default function ProjectTrackerModal({
  isOpen,
  onClose,
  initialCode = "",
}: ProjectTrackerModalProps) {
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";
  const { tr } = useLang();

  const [inputCode, setInputCode] = useState<string>(initialCode || "RZX-PRJ-632153");
  const [loading, setLoading] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectTrackingItem | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-search if initialCode is provided
  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      handleSearch(initialCode);
    } else {
      handleSearch("RZX-PRJ-632153");
    }
  }, [initialCode]);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || inputCode).trim();
    if (!code) return;

    setLoading(true);
    setSearched(true);
    try {
      const found = await getProjectByRefCode(code);
      setProject(found);
    } catch (err) {
      console.warn("Tracking lookup error:", err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (project && navigator.clipboard) {
      navigator.clipboard.writeText(project.refCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const stageMeta = project ? getStageMetadata(project.currentStage) : null;

  const steps = [
    { id: "queued", num: 1, title: "Pesanan Diterima", desc: "Masuk Antrean & Verifikasi Brief" },
    { id: "in_progress", num: 2, title: "Proses Produksi", desc: "Pengerjaan Desain / Animasi / Tech" },
    { id: "review", num: 3, title: "Review & Revisi", desc: "Evaluasi Draft Bersama Klien" },
    { id: "completed", num: 4, title: "Finish / Selesai", desc: "Serah Terima Master Deliverables" },
  ];

  const currentStepNum = stageMeta ? stageMeta.step : 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border p-5 sm:p-8 max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl transition-all ${
          isLight
            ? "bg-white border-slate-200 text-slate-900"
            : "bg-[#0d0f14] border-white/15 text-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <RiCloseLine className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md mb-2 border"
            style={{
              color: primaryColor,
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}30`,
            }}
          >
            <RiCompass3Line className="w-3.5 h-3.5" />
            <span>Live Project Tracking Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {tr("Lacak Progres Proyek", "Lacak Progres Proyek", "Caliak Progres Proyek")}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {tr(
              "Masukkan kode referensi pesanan Anda untuk melihat status pengerjaan secara transparan.",
              "Masukkan kode referensi pesanan Anda untuk melihat status pengerjaan secara transparan.",
              "Masuak-an kode referensi untuak mancaliak status karajo sacaro lansuang."
            )}
          </p>
        </div>

        {/* Search Bar Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2.5 mb-6"
        >
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              required
              placeholder="Contoh: RZX-PRJ-632153"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono tracking-wider border outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                  : "bg-neutral-900/90 border-white/15 text-white placeholder-neutral-500 focus:border-[#16b09f]"
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: primaryColor,
              color: "#000000",
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md"
          >
            {loading ? (
              <RiRefreshLine className="w-4 h-4 animate-spin" />
            ) : (
              <RiSearchLine className="w-4 h-4" />
            )}
            <span>{loading ? "Mencari..." : "Lacak Status"}</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 mb-6 text-[11px] font-mono text-neutral-400 flex-wrap">
          <span>Kode Cepat:</span>
          <button
            type="button"
            onClick={() => {
              setInputCode("RZX-PRJ-632153");
              handleSearch("RZX-PRJ-632153");
            }}
            className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-[#16b09f] border border-[#16b09f]/30 transition-colors cursor-pointer"
          >
            RZX-PRJ-632153 (Sedang Proses)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputCode("RZX-PRJ-108420");
              handleSearch("RZX-PRJ-108420");
            }}
            className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors cursor-pointer"
          >
            RZX-PRJ-108420 (Review)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputCode("RZX-PRJ-992144");
              handleSearch("RZX-PRJ-992144");
            }}
            className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-emerald-400 border border-emerald-400/30 transition-colors cursor-pointer"
          >
            RZX-PRJ-992144 (Finish)
          </button>
        </div>

        {/* Tracking Result Card */}
        {project && stageMeta ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Project Summary Banner */}
            <div
              className="p-4 sm:p-5 rounded-2xl border"
              style={{
                backgroundColor: `${stageMeta.color}0d`,
                borderColor: `${stageMeta.color}35`,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400">KODE:</span>
                  <span className="text-sm font-bold font-mono text-white tracking-wider">
                    {project.refCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Salin Kode Referensi"
                    className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RiFileCopyLine className="w-3.5 h-3.5" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-400 font-mono">Tersalin!</span>}
                </div>

                {/* Status Badge */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: stageMeta.badgeBg,
                    borderColor: stageMeta.badgeBorder,
                    color: stageMeta.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: stageMeta.color }}
                  />
                  <span>{stageMeta.label}</span>
                </div>
              </div>

              {/* Project Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block">Layanan:</span>
                  <span className="font-bold text-white text-sm">{project.serviceTitle}</span>
                  <span className="text-[11px] text-[#16b09f] block">{project.packageName}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block">Pemesan:</span>
                  <span className="font-semibold text-white">{project.clientName}</span>
                  {project.targetDeadline && (
                    <span className="text-[11px] text-neutral-400 block font-mono">
                      Target: {project.targetDeadline}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Visual 4-Step Milestone Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-neutral-300 font-semibold uppercase tracking-wider">
                  Alur & Tahapan Proyek:
                </span>
                <span className="font-bold text-sm" style={{ color: stageMeta.color }}>
                  Progres: {project.progressPercent}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-6 relative">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${project.progressPercent}%`,
                    backgroundColor: stageMeta.color,
                    boxShadow: `0 0 12px ${stageMeta.color}88`,
                  }}
                />
              </div>

              {/* 4 Steps Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {steps.map((st) => {
                  const isDone = st.num < currentStepNum;
                  const isCurrent = st.num === currentStepNum;
                  const isPending = st.num > currentStepNum;

                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? "bg-white/[0.06] shadow-md"
                          : isDone
                          ? "bg-white/[0.02] border-white/10"
                          : "bg-white/[0.01] border-white/5 opacity-40"
                      }`}
                      style={
                        isCurrent
                          ? {
                              borderColor: stageMeta.color,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                            isDone
                              ? "bg-emerald-500 text-black"
                              : isCurrent
                              ? "text-black font-extrabold"
                              : "bg-white/10 text-neutral-400"
                          }`}
                          style={isCurrent ? { backgroundColor: stageMeta.color } : undefined}
                        >
                          {isDone ? <RiCheckLine className="w-3.5 h-3.5" /> : st.num}
                        </span>
                        {isCurrent && (
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold"
                            style={{
                              backgroundColor: `${stageMeta.color}25`,
                              color: stageMeta.color,
                            }}
                          >
                            AKTIF
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight mb-1">
                          {st.title}
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-light leading-snug">
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Studio Milestone Notes */}
            {project.notes && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                  📌 Catatan Progres Terkini Studio:
                </span>
                <p className="text-xs text-neutral-200 leading-relaxed font-light">
                  {project.notes}
                </p>
              </div>
            )}

            {/* Deliverables Checklist */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                  Daftar Deliverables Proyek:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-neutral-300"
                    >
                      <RiCheckboxCircleFill className="w-4 h-4 text-[#16b09f] shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {project.previewUrl && (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RiExternalLinkLine className="w-4 h-4 text-[#16b09f]" />
                  <span>Buka Hasil / Draft Karya ↗</span>
                </a>
              )}

              <a
                href={`https://wa.me/${socialContacts.whatsappNumber || "6282170214498"}?text=${encodeURIComponent(
                  `Halo Rizx Studio / FOMY! Saya ingin menanyakan update pengerjaan proyek dengan Kode Referensi: ${project.refCode} (${project.serviceTitle}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: primaryColor,
                  color: "#000000",
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RiWhatsappLine className="w-4 h-4" />
                <span>Tanyakan Update via WhatsApp</span>
              </a>
            </div>
          </div>
        ) : searched && !loading ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-lg">
              🔍
            </div>
            <h3 className="text-sm font-bold text-white">Kode Referensi Tidak Ditemukan</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Tidak ada data proyek untuk kode &ldquo;{inputCode}&rdquo;. Pastikan kode referensi yang dimasukkan sudah benar atau hubungi kami langsung via WhatsApp.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${socialContacts.whatsappNumber || "6282170214498"}?text=${encodeURIComponent(
                  `Halo Rizx Studio, saya ingin menanyakan kode referensi pesanan saya: ${inputCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-neutral-200 text-xs font-mono"
              >
                <RiWhatsappLine className="w-3.5 h-3.5 text-emerald-400" />
                <span>Konfirmasi Kode via WhatsApp</span>
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

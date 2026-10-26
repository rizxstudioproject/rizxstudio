"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import {
  RiCompass3Line,
  RiSearchLine,
  RiCheckLine,
  RiTimeLine,
  RiFileCopyLine,
  RiWhatsappLine,
  RiExternalLinkLine,
  RiRefreshLine,
  RiCheckboxCircleFill,
  RiArrowLeftLine,
  RiSparklingFill,
} from "react-icons/ri";
import {
  ProjectTrackingItem,
  getProjectByRefCode,
  getStageMetadata,
} from "@/lib/projectTrackerService";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function TrackingPage() {
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";
  const { tr } = useLang();

  const [inputCode, setInputCode] = useState<string>("RZX-PRJ-632153");
  const [loading, setLoading] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectTrackingItem | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-search if URL contains ?ref= or ?code= or ?track=
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryCode = params.get("ref") || params.get("code") || params.get("track");
      if (queryCode) {
        setInputCode(queryCode);
        handleSearch(queryCode);
      } else {
        // Pre-load default example project
        handleSearch("RZX-PRJ-632153");
      }
    }
  }, []);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || inputCode).trim();
    if (!code) return;

    setLoading(true);
    setSearched(true);
    try {
      const found = await getProjectByRefCode(code);
      setProject(found);
    } catch (err) {
      console.warn("Tracking error:", err);
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

  const stageMeta = project ? getStageMetadata(project.currentStage) : null;

  const steps = [
    { id: "queued", num: 1, title: "Pesanan Diterima", desc: "Masuk Antrean & Verifikasi Brief" },
    { id: "in_progress", num: 2, title: "Proses Produksi", desc: "Pengerjaan Desain / Animasi / Tech" },
    { id: "review", num: 3, title: "Review & Revisi", desc: "Evaluasi Draft Bersama Klien" },
    { id: "completed", num: 4, title: "Finish / Selesai", desc: "Serah Terima Master Deliverables" },
  ];

  const currentStepNum = stageMeta ? stageMeta.step : 1;

  return (
    <div className="relative min-h-screen max-w-full overflow-x-clip bg-[var(--background,#0a0a0a)] text-[var(--foreground,#d4d4d4)] selection:bg-[#16b09f] selection:text-black transition-colors duration-300">
      {/* Global Navbar */}
      <Navbar />

      <main className="relative z-20 pt-28 sm:pt-36 pb-20 px-4 sm:px-8 lg:px-16 max-w-5xl mx-auto">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors py-1 px-3 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25"
          >
            <RiArrowLeftLine className="w-3.5 h-3.5" />
            <span>{tr("Lihat Semua Layanan & Produk", "Lihat Semua Layanan & Produk", "Caliak Kasadonyo Produk")}</span>
          </Link>

          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Cloud Sync</span>
          </span>
        </div>

        {/* Hero Header */}
        <div className="relative mb-10 text-center max-w-3xl mx-auto">
          {/* Ambient Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] pointer-events-none rounded-full blur-[140px] opacity-20 transition-all duration-500"
            style={{ backgroundColor: primaryColor }}
          />

          <div
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-widest uppercase mb-3 px-3.5 py-1.5 rounded-full border shadow-sm"
            style={{
              color: primaryColor,
              backgroundColor: `${primaryColor}1f`,
              borderColor: `${primaryColor}4d`,
            }}
          >
            <RiCompass3Line className="w-4 h-4" />
            <span>{tr("LIVE PROJECT TRACKING ENGINE", "PELACAKAN STATUS PENGERJAAN PROYEK", "LACAK STATUS PROYEK")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            {tr("Lacak Progres Proyek", "Lacak Progres Proyek", "Lacak Progres Proyek")}{" "}
            <span className="font-light italic" style={{ color: primaryColor }}>
              {tr("Secara Transparan", "Secara Transparan", "Sacaro Tarang")}
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
            {tr(
              "Masukkan kode referensi pesanan Anda di bawah untuk memantau tahapan pengerjaan dari antrean hingga finish.",
              "Masukkan kode referensi pesanan Anda di bawah untuk memantau tahapan pengerjaan dari antrean hingga finish.",
              "Masuak-an kode referensi pasanan sanak untuak mancaliak status karajo dari awal sampai salasai."
            )}
          </p>
        </div>

        {/* ── CENTRAL SEARCH BOX (MASUKKAN KODE REFERENSI) ── */}
        <div className="mb-8 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-white/[0.03] border border-white/15 shadow-2xl backdrop-blur-xl"
          >
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                required
                autoFocus
                placeholder="Masukkan Kode Referensi Anda (misal: RZX-PRJ-632153)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm sm:text-base font-mono tracking-wider border-none outline-none ${
                  isLight
                    ? "bg-white text-slate-900 placeholder-slate-400"
                    : "bg-transparent text-white placeholder-neutral-500"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: primaryColor,
                color: "#000000",
                boxShadow: `0 0 20px ${primaryColor}40`,
              }}
              className="px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md"
            >
              {loading ? (
                <RiRefreshLine className="w-4 h-4 animate-spin" />
              ) : (
                <RiSearchLine className="w-4 h-4" />
              )}
              <span>{loading ? "Mengecek..." : "Lacak Status Proyek 🚀"}</span>
            </button>
          </form>

          {/* Quick example tags */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-400 flex-wrap">
            <span>Contoh Kode:</span>
            <button
              type="button"
              onClick={() => {
                setInputCode("RZX-PRJ-632153");
                handleSearch("RZX-PRJ-632153");
              }}
              className="px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-[#16b09f] border border-[#16b09f]/30 transition-colors cursor-pointer"
            >
              RZX-PRJ-632153 (Sedang Proses)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputCode("RZX-PRJ-108420");
                handleSearch("RZX-PRJ-108420");
              }}
              className="px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-indigo-300 border border-indigo-400/30 transition-colors cursor-pointer"
            >
              RZX-PRJ-108420 (Tahap Review)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputCode("RZX-PRJ-992144");
                handleSearch("RZX-PRJ-992144");
              }}
              className="px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-emerald-400 border border-emerald-400/30 transition-colors cursor-pointer"
            >
              RZX-PRJ-992144 (Finish)
            </button>
          </div>
        </div>

        {/* ── TRACKING STATUS DISPLAY RESULT ── */}
        {project && stageMeta ? (
          <div
            className={`rounded-3xl border p-6 sm:p-10 shadow-2xl transition-all animate-fadeIn ${
              isLight
                ? "bg-white border-slate-200"
                : "bg-[#0d1017]/90 border-white/15"
            }`}
          >
            {/* Top Project Banner */}
            <div
              className="p-5 sm:p-6 rounded-2xl border mb-8"
              style={{
                backgroundColor: `${stageMeta.color}0d`,
                borderColor: `${stageMeta.color}35`,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-neutral-400">KODE REFERENSI:</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-white tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    {project.refCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Salin Kode Referensi"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RiFileCopyLine className="w-4 h-4" />
                  </button>
                  {copied && <span className="text-[11px] text-emerald-400 font-mono">Tersalin!</span>}
                </div>

                {/* Status Badge with Live Pulse */}
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border self-start sm:self-auto shadow-sm"
                  style={{
                    backgroundColor: stageMeta.badgeBg,
                    borderColor: stageMeta.badgeBorder,
                    color: stageMeta.color,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: stageMeta.color }}
                  />
                  <span>{stageMeta.label}</span>
                </div>
              </div>

              {/* Project Headline & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs border-t border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-0.5">Layanan Proyek:</span>
                  <span className="font-bold text-white text-sm">{project.serviceTitle}</span>
                  <span className="text-[11px] text-[#16b09f] block mt-0.5">{project.packageName}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-0.5">Nama Pemesan / Klien:</span>
                  <span className="font-semibold text-white text-sm">{project.clientName}</span>
                  {project.clientPhone && (
                    <span className="text-[11px] text-neutral-400 block font-mono mt-0.5">
                      {project.clientPhone}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-0.5">Target Waktu Pengerjaan:</span>
                  <span className="font-semibold text-white text-sm">{project.targetDeadline || "Sesuai Kesepakatan"}</span>
                  <span className="text-[11px] text-neutral-400 block font-mono mt-0.5">
                    Dimulai: {new Date(project.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 4-STEP MILESTONE TIMELINE & PROGRESS BAR ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-mono">
                <span className="text-white font-semibold uppercase tracking-wider">
                  Alur & Tahapan Pengerjaan Proyek:
                </span>
                <span className="font-bold text-base" style={{ color: stageMeta.color }}>
                  Progres: {project.progressPercent}%
                </span>
              </div>

              {/* Animated Progress Bar Track */}
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-6 relative">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${project.progressPercent}%`,
                    backgroundColor: stageMeta.color,
                    boxShadow: `0 0 15px ${stageMeta.color}aa`,
                  }}
                />
              </div>

              {/* 4 Interactive Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {steps.map((st) => {
                  const isDone = st.num < currentStepNum;
                  const isCurrent = st.num === currentStepNum;

                  return (
                    <div
                      key={st.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? "bg-white/[0.07] shadow-lg"
                          : isDone
                          ? "bg-white/[0.02] border-white/10"
                          : "bg-white/[0.01] border-white/5 opacity-40"
                      }`}
                      style={
                        isCurrent
                          ? {
                              borderColor: stageMeta.color,
                              boxShadow: `0 0 20px ${stageMeta.color}22`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                            isDone
                              ? "bg-emerald-500 text-black font-extrabold"
                              : isCurrent
                              ? "text-black font-extrabold"
                              : "bg-white/10 text-neutral-400"
                          }`}
                          style={isCurrent ? { backgroundColor: stageMeta.color } : undefined}
                        >
                          {isDone ? <RiCheckLine className="w-4 h-4" /> : st.num}
                        </span>
                        {isCurrent && (
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${stageMeta.color}25`,
                              color: stageMeta.color,
                            }}
                          >
                            FASE AKTIF
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            SELESAI ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight mb-1">
                          {st.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-light leading-snug">
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── STUDIO MILESTONE NOTES (CATATAN DARI ADMIN) ── */}
            {project.notes && (
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5 flex items-center gap-1.5">
                  <RiSparklingFill className="w-3.5 h-3.5 text-[#16b09f]" />
                  <span>Catatan Progres Terkini Studio:</span>
                </span>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-light">
                  {project.notes}
                </p>
              </div>
            )}

            {/* Deliverables Checklist */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="mb-6">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2.5">
                  Rincian Deliverables Proyek Ini:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-xs text-neutral-300"
                    >
                      <RiCheckboxCircleFill className="w-4 h-4 text-[#16b09f] shrink-0" />
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ACTION BUTTONS ── */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {project.previewUrl && (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
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
                className="flex-1 py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#16b09f]/30"
              >
                <RiWhatsappLine className="w-4 h-4" />
                <span>Konsultasikan Progres via WhatsApp</span>
              </a>
            </div>
          </div>
        ) : searched && !loading ? (
          /* Error / Not Found Card */
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 max-w-xl mx-auto animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Kode Referensi Tidak Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Tidak ada data proyek untuk kode &ldquo;<strong className="text-white font-mono">{inputCode}</strong>&rdquo;. Pastikan kode referensi yang Anda ketik sudah sesuai format (contoh: <span className="font-mono text-[#16b09f]">RZX-PRJ-632153</span>).
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${socialContacts.whatsappNumber || "6282170214498"}?text=${encodeURIComponent(
                  `Halo Rizx Studio, saya ingin menanyakan kode referensi pesanan saya: ${inputCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-neutral-200 text-xs font-mono"
              >
                <RiWhatsappLine className="w-4 h-4 text-emerald-400" />
                <span>Tanyakan Kode ke Admin via WhatsApp</span>
              </a>
            </div>
          </div>
        ) : null}
      </main>

      {/* Global Contact Section */}
      <Contact />

      {/* Floating WhatsApp Popup */}
      <WhatsAppPopup />
    </div>
  );
}

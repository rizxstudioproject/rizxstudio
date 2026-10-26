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
  RiShieldCheckLine,
} from "react-icons/ri";
import {
  ProjectTrackingItem,
  getProjectByRefCode,
  getStageMetadata,
} from "@/lib/projectTrackerService";
import VisualOrderTracker from "@/components/VisualOrderTracker";
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

  const [inputCode, setInputCode] = useState<string>(initialCode || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectTrackingItem | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-search ONLY if initialCode is explicitly provided
  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      const clean = initialCode.trim().toUpperCase();
      setInputCode(clean);
      handleSearch(clean);
    } else {
      setInputCode("");
      setProject(null);
      setSearched(false);
    }
  }, [initialCode]);

  const handlePasteCode = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const clean = text.trim().toUpperCase();
        if (clean) {
          setInputCode(clean);
          handleSearch(clean);
        }
      } else {
        alert(tr("Fitur paste tidak didukung otomatis di browser ini. Silakan tempel secara manual.", "Fitur paste tidak didukung otomatis di browser ini. Silakan tempel secara manual.", "Paste manual se sanak."));
      }
    } catch (err) {
      console.warn("Clipboard paste permission error:", err);
    }
  };

  // Live auto-update when studio updates project progress
  useEffect(() => {
    const handleTrackerUpdate = () => {
      if (inputCode) {
        handleSearch(inputCode);
      }
    };
    window.addEventListener("rizx_tracker_updated", handleTrackerUpdate);
    return () => window.removeEventListener("rizx_tracker_updated", handleTrackerUpdate);
  }, [inputCode]);

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
          className="flex flex-col sm:flex-row gap-2.5 mb-4"
        >
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              required
              placeholder="Contoh: RZX-PRJ-XXXXXX"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className={`w-full pl-10 pr-24 py-2.5 rounded-xl text-xs sm:text-sm font-mono tracking-wider border outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                  : "bg-neutral-900/90 border-white/15 text-white placeholder-neutral-500 focus:border-[#16b09f]"
              }`}
            />
            <button
              type="button"
              onClick={handlePasteCode}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer border border-white/15 active:scale-95 shadow-sm"
              title="Tempel Kode dari Clipboard"
            >
              <RiFileCopyLine className="w-3 h-3 text-[#16b09f]" />
              <span className="font-semibold">Tempel</span>
            </button>
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

        {/* Privacy Protection Notice */}
        <div className="flex items-center justify-center gap-1.5 mb-6 text-[11px] font-mono text-neutral-400 text-center">
          <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {tr(
              "Privasi Terlindungi: Akses data proyek hanya melalui Kode Referensi resmi.",
              "Privasi Terlindungi: Akses data proyek hanya melalui Kode Referensi resmi.",
              "Privasi Tajago: Akses data proyek hanyo jo Kode Referensi resmi."
            )}
          </span>
        </div>

        {/* Tracking Result Card */}
        {project && stageMeta ? (
          <div className="animate-fadeIn">
            <VisualOrderTracker
              project={project}
              onCopyCode={handleCopyCode}
              copied={copied}
            />
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
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={handlePasteCode}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-neutral-200 text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RiFileCopyLine className="w-3.5 h-3.5 text-[#16b09f]" />
                <span>Tempel Ulang Kode</span>
              </button>
              <a
                href={`https://wa.me/${socialContacts.whatsappNumber || "6282170214498"}?text=${encodeURIComponent(
                  `Halo Rizx Studio, saya ingin menanyakan kode referensi pesanan saya: ${inputCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
              >
                <RiWhatsappLine className="w-3.5 h-3.5 text-emerald-400" />
                <span>Konfirmasi via WhatsApp</span>
              </a>
            </div>
          </div>
        ) : !searched && !loading ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 animate-fadeIn">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-lg border"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}35`,
                color: primaryColor,
              }}
            >
              <RiShieldCheckLine className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {tr("Pelacakan Proyek Terproteksi", "Pelacakan Proyek Terproteksi", "Pelacakan Proyek Tajago")}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {tr(
                "Silakan masukkan atau tempel Kode Referensi (contoh: RZX-PRJ-XXXXXX) yang Anda terima di WhatsApp saat pemesanan untuk melihat status pengerjaan.",
                "Silakan masukkan atau tempel Kode Referensi (contoh: RZX-PRJ-XXXXXX) yang Anda terima di WhatsApp saat pemesanan untuk melihat status pengerjaan.",
                "Masuak-an atau tempel Kode Referensi (RZX-PRJ-XXXXXX) nan ditarimo di WhatsApp untuak mancaliak status."
              )}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePasteCode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-neutral-200 text-xs font-mono transition-all cursor-pointer"
              >
                <RiFileCopyLine className="w-3.5 h-3.5 text-[#16b09f]" />
                <span>{tr("Tempel Kode dari Clipboard", "Tempel Kode dari Clipboard", "Tempel Kode")}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

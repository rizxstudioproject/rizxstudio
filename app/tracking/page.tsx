"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import VisualOrderTracker from "@/components/VisualOrderTracker";
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
  RiShieldCheckLine,
  RiCloseLine,
} from "react-icons/ri";
import {
  ProjectTrackingItem,
  getProjectByRefCode,
  getStageMetadata,
  subscribeToTrackerRealtime,
} from "@/lib/projectTrackerService";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function TrackingPage() {
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";
  const { tr } = useLang();

  const [inputCode, setInputCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectTrackingItem | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-search ONLY if URL explicitly contains ?ref= or ?code= or ?track=
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryCode = params.get("ref") || params.get("code") || params.get("track");
      if (queryCode && queryCode.trim()) {
        const clean = queryCode.trim().toUpperCase();
        setInputCode(clean);
        handleSearch(clean);
      }
    }
  }, []);

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

  // Live realtime auto-update when studio updates project progress
  useEffect(() => {
    const unsubscribe = subscribeToTrackerRealtime((records) => {
      if (inputCode) {
        const cleanCode = inputCode.trim().toUpperCase();
        const found = records.find(
          (r) =>
            r.refCode.toUpperCase() === cleanCode ||
            r.refCode.toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanCode.replace(/[^A-Z0-9]/g, "")
        );
        if (found) {
          setProject(found);
        }
      }
    });

    return () => unsubscribe();
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
        {/* Breadcrumb / Back Link + Close (X) Button */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors py-1.5 px-3.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25"
          >
            <RiArrowLeftLine className="w-3.5 h-3.5" />
            <span>{tr("View All Services & Products", "Lihat Semua Layanan & Produk", "Caliak Kasadonyo Produk")}</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Live Cloud Sync</span>
            </span>
            <Link
              href="/"
              title={tr("Close & Back to Home", "Tutup & Kembali ke Beranda", "Tutuik & Baliak ka Muko")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <RiCloseLine className="w-4 h-4" />
            </Link>
          </div>
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
            {tr("Track Project Progress", "Lacak Progres Proyek", "Lacak Progres Proyek")}{" "}
            <span className="font-light italic" style={{ color: primaryColor }}>
              {tr("With Full Transparency", "Secara Transparan", "Sacaro Tarang")}
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
            {tr(
              "Enter your official project reference code below to track production stages from queue to completion.",
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
                placeholder={tr("Enter Reference Code (e.g. RZX-PRJ-...)", "Masukkan Kode Referensi (Contoh: RZX-PRJ-...)", "Masuak-an Kode Referensi (Contoh: RZX-PRJ-...)")}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className={`w-full pl-12 pr-36 py-3.5 rounded-xl text-sm sm:text-base font-mono tracking-wider border-none outline-none ${
                  isLight
                    ? "bg-white text-slate-900 placeholder-slate-400"
                    : "bg-transparent text-white placeholder-neutral-500"
                }`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {inputCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputCode("");
                      setProject(null);
                      setSearched(false);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                    title={tr("Clear / Reset", "Hapus / Reset", "Hapuih / Reset")}
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePasteCode}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer border border-white/15 active:scale-95 shadow-sm"
                  title={tr("Paste Code from Clipboard", "Tempel Kode dari Clipboard", "Tempel Kode dari Clipboard")}
                >
                  <RiFileCopyLine className="w-3.5 h-3.5 text-[#16b09f]" />
                  <span className="font-semibold">{tr("Paste", "Tempel", "Tempel")}</span>
                </button>
              </div>
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
              <span>{loading ? tr("Checking...", "Mengecek...", "Sadang mangecek...") : tr("Track Project Status 🚀", "Lacak Status Proyek 🚀", "Lacak Status Proyek 🚀")}</span>
            </button>
          </form>

          {/* Privacy Protection Notice */}
          <div className="mt-3.5 flex items-center justify-center gap-2 text-xs font-mono text-neutral-400 text-center px-4">
            <RiShieldCheckLine className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {tr(
                "Privacy Protected: Project data is exclusively accessible via official Reference Code.",
                "Privasi Terlindungi: Data proyek hanya dapat diakses melalui Kode Referensi resmi.",
                "Privasi Tajago: Data proyek hanyo dapek diakses jo Kode Referensi resmi."
              )}
            </span>
          </div>
        </div>

        {/* ── TRACKING STATUS DISPLAY RESULT (VISUAL ORDER TRACKER) ── */}
        {project && stageMeta ? (
          <VisualOrderTracker
            project={project}
            onCopyCode={handleCopyCode}
            copied={copied}
            onClose={() => {
              setProject(null);
              setSearched(false);
              setInputCode("");
            }}
          />
        ) : searched && !loading ? (
          /* Error / Not Found Card */
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 max-w-xl mx-auto animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {tr("Reference Code Not Found", "Kode Referensi Tidak Ditemukan", "Kode Referensi Indak Ditamuan")}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
              {tr(
                "No project data found for reference code ",
                "Tidak ada data proyek untuk kode ",
                "Indak ado data proyek untuak kode "
              )}
              &ldquo;<strong className="text-white font-mono">{inputCode}</strong>&rdquo;.{" "}
              {tr(
                "Please make sure the reference code you typed or pasted matches your official booking confirmation from Rizx Studio.",
                "Pastikan kode referensi yang Anda ketik atau tempel sudah sesuai dengan konfirmasi pemesanan dari Rizx Studio.",
                "Pastikan kode referensi alah sasuai jo konfirmasi pasanan dari Rizx Studio."
              )}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePasteCode}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-neutral-200 text-xs font-mono transition-all cursor-pointer"
              >
                <RiFileCopyLine className="w-3.5 h-3.5 text-[#16b09f]" />
                <span>{tr("Re-paste Code", "Coba Tempel Ulang Kode", "Cubo Tempel Ulang")}</span>
              </button>
              <a
                href={`https://wa.me/${socialContacts.whatsappNumber || "6282170214498"}?text=${encodeURIComponent(
                  `Halo Rizx Studio, saya ingin menanyakan kode referensi pesanan saya: ${inputCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all"
              >
                <RiWhatsappLine className="w-4 h-4 text-emerald-400" />
                <span>{tr("Contact Studio via WhatsApp", "Hubungi Admin via WhatsApp", "Hubungi Admin via WhatsApp")}</span>
              </a>
            </div>
          </div>
        ) : null}
      </main>

      {/* Floating WhatsApp Popup */}
      <WhatsAppPopup />
    </div>
  );
}

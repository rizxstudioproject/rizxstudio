"use client";

import React, { useEffect, useState } from "react";
import {
  RiCloseLine,
  RiCheckboxCircleFill,
  RiCloseCircleLine,
  RiTimeLine,
  RiRefreshLine,
  RiSparklingFill,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiPriceTag3Line,
  RiInformationLine,
  RiCheckLine,
  RiLockLine,
  RiShareForwardLine,
} from "react-icons/ri";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";
import { ProductItem } from "@/lib/productsService";

interface ProductPackageCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null; // Can be ProductItem or localized product object
  onSelectPackage: (productId: string, packageId: string) => void;
}

export default function ProductPackageCompareModal({
  isOpen,
  onClose,
  product,
  onSelectPackage,
}: ProductPackageCompareModalProps) {
  const { primaryColor, themeMode } = useMotionTheme();
  const isLight = themeMode === "light";
  const { lang, tr } = useLang();

  // Mobile active tab: "all" | "starter" | "pro" | "enterprise"
  const [activeMobileTier, setActiveMobileTier] = useState<string>("all");
  const [shareToast, setShareToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => {
      setShareToast(null);
    }, 3000);
  };

  const handleShare = async (specificPkg?: any) => {
    if (!product) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/products#${product.id}`;
    const pkgText = specificPkg
      ? `Paket: ${specificPkg.name} (${specificPkg.price})`
      : `Layanan: ${product.title}`;
    const shareData = {
      title: `${product.title} - Rizx Studio`,
      text: `${product.title} — ${pkgText}\n${product.tagline || ""}`.trim(),
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast(tr("Berhasil dibagikan!", "Berhasil dibagikan!", "Lah dibagi-an!"));
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareUrl}`);
        triggerToast(
          tr(
            "Link paket disalin ke papan klip!",
            "Tautan paket berhasil disalin ke papan klip!",
            "Tautan paket lah disalin!"
          )
        );
      }
    } catch {
      triggerToast(tr("Gagal menyalin tautan", "Gagal menyalin tautan", "Gagal manyalin"));
    }
  };

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const packages = product.packages || [];

  // Helper to generate realistic pros (keunggulan) if not custom defined
  const getPackagePros = (pkg: any): string[] => {
    if (pkg.pros && pkg.pros.length > 0) return pkg.pros;

    const deliverables: string[] = pkg.deliverables || [];
    const isEn = lang === "en";
    const isMin = lang === "min";

    if (pkg.id === "starter") {
      return [
        isEn ? "Cost-effective investment for new businesses" : isMin ? "Biayo paliang hemat untuak usaha baru" : "Biaya paling hemat & ekonomis untuk bisnis baru",
        isEn ? `Quick delivery: ${pkg.duration}` : isMin ? `Pangarajoan lakeh: ${pkg.duration}` : `Pengerjaan ringkas & efisien (${pkg.duration})`,
        ...deliverables.slice(0, 3),
        isEn ? "Master files ready for print & digital" : isMin ? "File master langkok untuak cetak & digital" : "File master siap pakai untuk cetak & digital",
      ];
    } else if (pkg.id === "pro") {
      return [
        isEn ? "Best Value & Most Popular Choice" : isMin ? "Piliahan paliang populer & nilainyo tabaiak" : "Best Value: Pilihan paling ideal & komprehensif",
        isEn ? `Flexible revisions (${pkg.revisions})` : isMin ? `Revisi labiah leluasa (${pkg.revisions})` : `Revisi terarah & fleksibel (${pkg.revisions})`,
        ...deliverables.slice(0, 4),
        isEn ? "Complete brand guideline / specification included" : isMin ? "Tamasuk dokumen panduan/guideline langkok" : "Termasuk panduan penggunaan & spesifikasi detail",
        isEn ? "Priority production queue" : isMin ? "Antrean produksi prioritas" : "Prioritas antrean pengerjaan studio",
      ];
    } else {
      // Enterprise
      return [
        isEn ? "Comprehensive 360° corporate solution" : isMin ? "Solusi 360° komplit sakala korporasi" : "Solusi 360° komplit tanpa kompromi skala korporasi",
        isEn ? `Dedicated & intensive revisions (${pkg.revisions})` : isMin ? `Revisi intensif & tim tapiliah (${pkg.revisions})` : `Revisi intensif & dedicated support (${pkg.revisions})`,
        ...deliverables.slice(0, 5),
        isEn ? "Dedicated Creative Lead & direct consultation" : isMin ? "Didampingi lansuang dek Creative Lead" : "Didampingi langsung oleh Creative Lead Studio",
        isEn ? "Full commercial license & source assets" : isMin ? "Lisensi komersial panuah & sado master aset" : "Hak lisensi komersial penuh & seluruh master source",
      ];
    }
  };

  // Helper to generate realistic limitations/cons (kekurangan / batasan)
  const getPackageCons = (pkg: any): string[] => {
    if (pkg.cons && pkg.cons.length > 0) return pkg.cons;

    const isEn = lang === "en";
    const isMin = lang === "min";

    if (pkg.id === "starter") {
      return [
        isEn ? `Limited revisions: max ${pkg.revisions}` : isMin ? `Revisi tabateh: sakadar ${pkg.revisions}` : `Revisi dibatasi (maksimal ${pkg.revisions})`,
        isEn ? "Comprehensive brand guideline not included" : isMin ? "Indak tamasuak buku guideline langkok" : "Belum termasuk buku brand guideline / stationery lengkap",
        isEn ? "Standard queue (no rush / express slot)" : isMin ? "Antrean standar (indak ado slot ekspres)" : "Antrean standar tanpa opsi slot kilat/ekspres",
        isEn ? "No daily dedicated project manager" : isMin ? "Indak didampingi manajer khusus harian" : "Belum mencakup pendampingan dedicated PM harian",
      ];
    } else if (pkg.id === "pro") {
      return [
        isEn ? `Capped at ${pkg.revisions} (not unlimited revisions)` : isMin ? `Batasan ${pkg.revisions} (bukan revisi tanpa bateh)` : `Revisi terikat batas (${pkg.revisions}, bukan unlimited)`,
        isEn ? `Longer production time than Starter (${pkg.duration})` : isMin ? `Waktu labiah lamo dari Starter (${pkg.duration})` : `Durasi pengerjaan lebih panjang dari Starter (${pkg.duration})`,
        isEn ? "Custom corporate system integrations require extra scope" : isMin ? "Integrasi korporasi khusus paralu kasapakekan tambahan" : "Integrasi skala korporasi kompleks memerlukan add-on",
      ];
    } else {
      // Enterprise
      return [
        isEn ? "Requires higher custom project investment" : isMin ? "Investasi biayo labiah tinggi sakala korporasi" : "Alokasi anggaran lebih tinggi sesuai skala kompleksitas",
        isEn ? `Extended timeline (${pkg.duration}) requiring client review sessions` : isMin ? `Timeline pangarajoan labiah lamo (${pkg.duration})` : `Timeline pengerjaan mendalam (${pkg.duration}) & koordinasi intensif`,
        isEn ? "Limited monthly studio booking slots" : isMin ? "Slot booking tabateh per bulan" : "Kuota slot terbatas per bulan untuk menjaga standar kualitas",
      ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Window */}
      <div
        className={`relative z-10 w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900"
            : "bg-[#0c0e13] border-white/15 text-white"
        }`}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none rounded-full blur-[100px] opacity-25"
          style={{ backgroundColor: primaryColor }}
        />

        {/* ── STICKY MODAL HEADER ── */}
        <div
          className={`shrink-0 px-5 sm:px-8 py-5 border-b flex items-start justify-between gap-4 relative z-10 ${
            isLight ? "bg-white/90 border-slate-200" : "bg-[#0e1117]/95 border-white/10"
          } backdrop-blur-md`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className="text-[10px] sm:text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-semibold"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {product.categoryLabel || "Layanan Kreatif"}
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                • {tr("Perbandingan 3 Paket", "Perbandingan 3 Paket Lengkap", "Bandiang 3 Paket")}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{product.title}</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl line-clamp-2">
              {product.tagline || product.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleShare()}
              title={tr("Share package comparison", "Bagikan perbandingan paket ini", "Bagi-an bandiang paket ko")}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300 hover:text-white"
              }`}
            >
              <RiShareForwardLine className="w-5 h-5 text-[#16b09f]" />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300 hover:text-white"
              }`}
              title="Tutup (Esc)"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── MOBILE TIER FILTER TABS (Visible only on small screens) ── */}
        <div
          className={`md:hidden px-4 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-white/[0.02] border-white/10"
          }`}
        >
          <button
            onClick={() => setActiveMobileTier("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeMobileTier === "all"
                ? "bg-white text-black shadow-sm font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {tr("Bandingkan Semua", "Bandingkan Semua", "Caliak Kasadonyo")}
          </button>
          {packages.map((pkg: any) => (
            <button
              key={pkg.id}
              onClick={() => setActiveMobileTier(pkg.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeMobileTier === pkg.id
                  ? "bg-emerald-500 text-black shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {pkg.name.split(" ")[0]} ({pkg.id.toUpperCase()})
            </button>
          ))}
        </div>

        {/* ── SCROLLABLE PACKAGES COMPARISON BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-2">
            <p className="text-xs sm:text-sm text-neutral-400">
              {tr(
                "Tinjau detail harga, estimasi durasi, checklist keunggulan, serta batasan setiap paket sebelum melanjutkan ke formulir pemesanan.",
                "Tinjau detail harga, estimasi durasi, checklist keunggulan, serta batasan setiap paket sebelum melanjutkan ke formulir pemesanan.",
                "Tinjau detail harago, durasi karajo, kaunggulan sarato batasan tiok paket sabalun mangisi formulir."
              )}
            </p>
          </div>

          {/* 3-Column Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {packages.map((pkg: any) => {
              const isPro = pkg.id === "pro";
              const isStarter = pkg.id === "starter";
              const isEnterprise = pkg.id === "enterprise";
              const pros = getPackagePros(pkg);
              const cons = getPackageCons(pkg);

              // Filter out if user selected a single tier on mobile
              if (activeMobileTier !== "all" && activeMobileTier !== pkg.id) {
                return null;
              }

              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${
                    isPro
                      ? isLight
                        ? "bg-white border-[#16b09f] shadow-xl ring-2 ring-[#16b09f]/40 md:-translate-y-1.5"
                        : "bg-[#0f141a] border-[#16b09f] shadow-[0_0_40px_rgba(22,176,159,0.18)] ring-1 ring-[#16b09f]/60 md:-translate-y-1.5"
                      : isLight
                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      : "bg-[#0f1217] border-white/10 hover:border-white/20 shadow-lg"
                  }`}
                >
                  {/* Highlight Ribbon for Pro / Most Popular */}
                  {isPro && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 z-20"
                      style={{
                        backgroundColor: primaryColor,
                        color: "#000000",
                      }}
                    >
                      <RiSparklingFill className="w-3 h-3" />
                      <span>{tr("REKOMENDASI UTAMA / BEST VALUE", "REKOMENDASI UTAMA / BEST VALUE", "PILIHAN UTAMO")}</span>
                    </div>
                  )}

                  {/* Card Header & Price */}
                  <div className={`p-5 sm:p-6 border-b ${isLight ? "border-slate-100" : "border-white/[0.08]"}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-neutral-400">
                        Tier {pkg.id.toUpperCase()}
                      </span>
                      {pkg.badge && (
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                            isPro
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : "bg-white/5 text-neutral-400 border-white/10"
                          }`}
                        >
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
                      {pkg.name}
                    </h3>

                    <p className="text-xs text-neutral-400 min-h-[36px] line-clamp-2 leading-relaxed mb-4">
                      {pkg.description}
                    </p>

                    {/* Price Note Display */}
                    <div
                      className="p-3 rounded-xl border flex items-center justify-between gap-2 font-mono text-xs mb-3"
                      style={{
                        backgroundColor: isPro ? `${primaryColor}15` : isLight ? "#f8fafc" : "rgba(255,255,255,0.03)",
                        borderColor: isPro ? `${primaryColor}40` : isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <span className="text-neutral-400 flex items-center gap-1.5">
                        <RiPriceTag3Line className="w-3.5 h-3.5 text-[#16b09f]" />
                        <span>{tr("Estimasi Biaya", "Estimasi Biaya", "Perkiraan Biayo")}:</span>
                      </span>
                      <span className="font-bold text-sm text-white">
                        {pkg.priceNote}
                      </span>
                    </div>

                    {/* Specs Row: Duration & Revisions */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5">
                        <RiTimeLine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate text-neutral-300">{pkg.duration}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5">
                        <RiRefreshLine className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate text-neutral-300">{pkg.revisions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Keunggulan & Kekurangan */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col space-y-5">
                    {/* SECTION: CHECKLIST KEUNGGULAN (PROS) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-bold text-emerald-400 mb-2.5">
                        <RiCheckboxCircleFill className="w-4 h-4 text-emerald-400" />
                        <span>{tr("Keunggulan & Deliverables", "Keunggulan & Deliverables", "Kaunggulan & Hasil")}</span>
                      </div>
                      <ul className="space-y-2">
                        {pros.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300 leading-snug">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.08]" />

                    {/* SECTION: CHECKLIST KEKURANGAN / BATASAN (CONS) */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-bold text-amber-400 mb-2.5">
                        <RiCloseCircleLine className="w-4 h-4 text-amber-400" />
                        <span>{tr("Batasan / Catatan Paket", "Batasan / Catatan Paket", "Batasan / Catatan Paket")}</span>
                      </div>
                      <ul className="space-y-2">
                        {cons.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-neutral-400 leading-snug">
                            <span className="text-amber-400/80 font-bold shrink-0 mt-0.5">✕</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className={`p-5 sm:p-6 pt-0 border-t ${isLight ? "border-slate-100" : "border-white/[0.08]"}`}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectPackage(product.id, pkg.id)}
                        style={
                          isPro
                            ? {
                                backgroundColor: primaryColor,
                                color: "#000000",
                                boxShadow: `0 0 20px ${primaryColor}40`,
                              }
                            : undefined
                        }
                        className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isPro
                            ? "hover:brightness-110 active:scale-98"
                            : isLight
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                        }`}
                      >
                        <span>
                          {isPro
                            ? tr(`Pilih Paket Pro 🚀`, `Pilih Paket Pro 🚀`, `Pilih Paket Pro 🚀`)
                            : isStarter
                            ? tr(`Pilih Starter →`, `Pilih Starter →`, `Pilih Starter →`)
                            : tr(`Pilih Enterprise 💼`, `Pilih Enterprise 💼`, `Pilih Enterprise 💼`)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(pkg)}
                        title={tr("Share this tier", `Bagikan paket ${pkg.name}`, `Bagi-an paket ${pkg.name}`)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center ${
                          isLight
                            ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                            : "bg-white/5 hover:bg-white/15 border-white/15 text-neutral-300 hover:text-white"
                        }`}
                      >
                        <RiShareForwardLine className="w-4 h-4 text-[#16b09f]" />
                      </button>
                    </div>
                    <p className="text-[10px] text-center text-neutral-500 font-mono mt-2">
                      {tr("Lanjut ke formulir brief & estimasi", "Lanjut ke formulir brief & estimasi", "Lanjuik ka formulir brief")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Security & Transparency Notice */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
              isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-white/[0.03] border-white/10 text-neutral-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <RiShieldCheckLine className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {tr(
                  "Seluruh proyek diproses dengan perjanjian kesepakatan tertulis, tracking transparan, & hak komersial penuh.",
                  "Seluruh proyek diproses dengan perjanjian kesepakatan tertulis, tracking transparan, & hak komersial penuh.",
                  "Sadoalah proyek diproses jo kasapakekan jaleh sarato hak komersial panuah."
                )}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white underline text-left sm:text-right shrink-0 cursor-pointer"
            >
              {tr("Kembali ke Daftar Produk", "Kembali ke Daftar Produk", "Babaliak")}
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {shareToast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-neutral-900/95 border border-[#16b09f] text-white shadow-2xl flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom duration-300 text-xs font-medium">
            <RiCheckboxCircleFill className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{shareToast}</span>
          </div>
        )}
      </div>
    </div>
  );
}

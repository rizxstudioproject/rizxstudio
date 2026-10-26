"use client";

import React, { useState } from "react";
import {
  RiCloseLine,
  RiCheckLine,
  RiFileCopyLine,
  RiWhatsappLine,
  RiShareForwardLine,
  RiTimeLine,
  RiRefreshLine,
  RiArrowRightLine,
  RiSparklingFill,
  RiSendPlaneFill,
  RiExternalLinkLine,
} from "react-icons/ri";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";
import { resolveThumbnailUrl } from "@/lib/mediaUrlHelper";

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  pkg: any | null;
  onOrderPackage?: (product: any, pkg: any) => void;
}

export default function ProductShareModal({
  isOpen,
  onClose,
  product,
  pkg,
  onOrderPackage,
}: ProductShareModalProps) {
  const { primaryColor, themeMode } = useMotionTheme();
  const isLight = themeMode === "light";
  const { tr } = useLang();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || !product || !pkg) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://rizxstudio.com";
  const directUrl = `${origin}/products?product=${product.id}&package=${pkg.id}#${product.id}`;

  const resolvedThumb =
    resolveThumbnailUrl(pkg.thumbnailUrl || product.thumbnailUrl || "") ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

  // Build formatted text for WhatsApp or text copy
  const buildShareText = () => {
    const deliverablesList = Array.isArray(pkg.deliverables)
      ? pkg.deliverables.map((d: string) => `• ${d}`).join("\n")
      : "";

    return `✨ *RIZX STUDIO — REKOMENDASI PAKET LAYANAN*
📌 *Layanan:* ${product.title} (${product.categoryLabel || "Creative Service"})
📦 *Paket Pilihan:* ${pkg.name}
⏱️ *Durasi Pengerjaan:* ${pkg.duration || "Fleksibel"}
🔄 *Revisi:* ${pkg.revisions || "Sesuai paket"}

📋 *Rincian Deliverables yang Didapatkan:*
${deliverablesList}

🔗 *Buka Langsung Paket Ini di Website:*
${directUrl}`;
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const text = buildShareText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  // Copy Direct Link
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(directUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (_) {}
  };

  // Copy Full Text + Link
  const handleCopyAll = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(buildShareText());
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (_) {}
  };

  // Native Web Share Fallback
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} — Paket ${pkg.name} | Rizx Studio`,
          text: buildShareText(),
          url: directUrl,
        });
      } catch (_) {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0d1015] border-white/15 text-white"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
              }}
            >
              <RiShareForwardLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {tr("Bagikan Paket Layanan", "Bagikan Paket Layanan", "Bagi-an Paket Ko")}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {tr(
                  "Kirim rincian paket ini ke klien atau rekan Anda",
                  "Kirim rincian paket ini ke klien atau rekan Anda",
                  "Kirim rincian paket ko ka klien atau kawan sanak"
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Package Preview Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* ── PACKAGE PREVIEW CARD (Tampilan Paket yang Dibagikan) ── */}
          <div
            className={`rounded-2xl border overflow-hidden transition-all ${
              isLight
                ? "bg-slate-50 border-slate-200"
                : "bg-white/[0.03] border-white/10"
            }`}
          >
            {/* Thumbnail Header with Badges */}
            <div className="relative w-full h-32 sm:h-36 bg-neutral-900 overflow-hidden">
              <img
                src={resolvedThumb}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md"
                  style={{
                    color: primaryColor,
                    backgroundColor: "rgba(10, 12, 18, 0.8)",
                    borderColor: `${primaryColor}50`,
                  }}
                >
                  {product.categoryLabel}
                </span>

                <span
                  className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md text-black"
                  style={{ backgroundColor: primaryColor }}
                >
                  Paket {pkg.id?.toUpperCase() || "PRO"}
                </span>
              </div>

              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                <h4 className="font-bold text-base sm:text-lg leading-tight drop-shadow-md">
                  {product.title}
                </h4>
              </div>
            </div>

            {/* Package Details Content */}
            <div className="p-4 space-y-3">
              {/* Package Name & Badge */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                    {tr("Nama Paket:", "Nama Paket:", "Namo Paket:")}
                  </span>
                  <p className="font-bold text-sm sm:text-base text-white">
                    {pkg.name}
                  </p>
                </div>
                {pkg.badge && (
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium border"
                    style={{
                      color: primaryColor,
                      borderColor: `${primaryColor}40`,
                      backgroundColor: `${primaryColor}15`,
                    }}
                  >
                    {pkg.badge}
                  </span>
                )}
              </div>

              {/* Duration & Revisions */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-300 font-mono py-1.5 px-3 rounded-lg bg-black/30 border border-white/5">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <RiTimeLine className="w-3.5 h-3.5 text-[#16b09f]" />
                  <span>{pkg.duration}</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <RiRefreshLine className="w-3.5 h-3.5 text-[#16b09f]" />
                  <span>{pkg.revisions}</span>
                </span>
              </div>

              {/* Tagline / Brief */}
              {product.tagline && (
                <p className="text-[11px] text-neutral-400 italic font-light leading-relaxed">
                  &ldquo;{product.tagline}&rdquo;
                </p>
              )}

              {/* Deliverables Checklist */}
              {Array.isArray(pkg.deliverables) && pkg.deliverables.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                    {tr("Yang Didapatkan (Deliverables):", "Yang Didapatkan (Deliverables):", "Deliverables nan Didapek:")}
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {pkg.deliverables.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-neutral-300">
                        <RiCheckLine className="w-3.5 h-3.5 text-[#16b09f] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Direct Link Preview Box */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 text-[11px]">
            <div className="truncate font-mono text-neutral-400 select-all">
              {directUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              {copiedLink ? (
                <>
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin!</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] space-y-2.5 shrink-0">
          {/* Primary Action: Share directly to WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <RiWhatsappLine className="w-4 h-4" />
            <span>{tr("Bagikan ke WhatsApp 💬", "Bagikan ke WhatsApp 💬", "Bagi ka WhatsApp 💬")}</span>
          </button>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="py-2.5 px-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              {copiedAll ? (
                <>
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin Rapi!</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="w-3.5 h-3.5 text-[#16b09f]" />
                  <span>Salin Lengkap</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <RiShareForwardLine className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aplikasi Lain</span>
            </button>
          </div>

          {/* Quick CTA to jump to order form */}
          {onOrderPackage && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOrderPackage(product, pkg);
              }}
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
              className="w-full py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-125 transition-all cursor-pointer"
            >
              <RiSendPlaneFill className="w-3.5 h-3.5" />
              <span>
                {tr(
                  `Langsung Pesan Paket ${pkg.name} Ini 🚀`,
                  `Langsung Pesan Paket ${pkg.name} Ini 🚀`,
                  `Langsuang Pasan Paket ${pkg.name} Ko 🚀`
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

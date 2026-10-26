"use client";

import React, { useState } from "react";
import {
  RiCloseLine,
  RiExternalLinkLine,
  RiDownload2Line,
  RiWhatsappLine,
  RiShieldCheckLine,
  RiFileCopyLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiRestartLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

export interface ReceiptProofData {
  imageUrl: string;
  clientName: string;
  refCode: string;
  receiptNumber?: string;
  budget?: string;
  serviceTitle?: string;
  packageName?: string;
  clientPhone?: string;
  paymentMethod?: string;
  paymentPlan?: string;
  uploadedAt?: string;
}

interface ReceiptProofModalProps {
  data: ReceiptProofData | null;
  onClose: () => void;
  onConfirmKickoff?: (refCode: string) => void;
}

export default function ReceiptProofModal({
  data,
  onClose,
  onConfirmKickoff,
}: ReceiptProofModalProps) {
  const { tr, lang } = useLang();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

  const [zoom, setZoom] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!data) return null;

  const cleanPhone = (data.clientPhone || "").replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
  const waConfirmUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    `*Halo kak ${data.clientName}!* 👋\n\nTerima kasih, bukti pembayaran untuk pesanan *${data.serviceTitle || "Layanan Rizx Studio"}* (Kode: *${data.refCode}*) telah kami terima dan verifikasi.\n\nProyek resmi kami jadwalkan untuk segera dimulai. Anda dapat memantau progres langsung melalui link tracking:\nhttps://rizxstudio.com/tracking?code=${data.refCode}\n\nSalam,\n*Rizx Studio Team*`
  )}`;

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0c0e14] border-white/15 text-white"
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-900/60 border-white/10"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <RiShieldCheckLine className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  Bukti Pembayaran / Resi Transfer
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shrink-0">
                  Resi Klien
                </span>
              </div>
              <p className={`text-xs truncate ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                Klien: <span className="font-semibold text-teal-400">{data.clientName}</span> • Ref:{" "}
                <span className="font-mono">{data.refCode}</span>
                {data.receiptNumber && ` • No. Inv: ${data.receiptNumber}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight
                ? "bg-slate-200/80 hover:bg-slate-300 text-slate-700"
                : "bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white"
            }`}
            title="Tutup Modal"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Layout on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-6 items-start">
          {/* Left Column: Image Viewer Container with Zoom Controls */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <div
              className={`relative rounded-2xl border overflow-hidden flex items-center justify-center min-h-[320px] max-h-[520px] p-2 ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-black/60 border-white/10"
              }`}
            >
              {/* Zoom Buttons Bar */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white text-xs">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Perbesar"
                >
                  <RiZoomInLine className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Perkecil"
                >
                  <RiZoomOutLine className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer text-[10px] font-mono font-bold"
                  title="Reset Zoom"
                >
                  <RiRestartLine className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1.5 text-neutral-300">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Photo Image */}
              <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
                <img
                  src={data.imageUrl}
                  alt={`Bukti Resi ${data.refCode}`}
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                  className="max-h-[480px] w-auto max-w-full object-contain rounded-xl shadow-lg transition-transform duration-200 cursor-zoom-in"
                />
              </div>
            </div>

            {/* Quick Actions Under Image */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <a
                href={data.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
                }`}
              >
                <RiExternalLinkLine className="w-3.5 h-3.5" />
                <span>Buka Ukuran Asli ↗</span>
              </a>

              <a
                href={data.imageUrl}
                download={`Bukti-Resi-${data.refCode}.jpg`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
                }`}
              >
                <RiDownload2Line className="w-3.5 h-3.5" />
                <span>Download Foto Resi 💾</span>
              </a>
            </div>
          </div>

          {/* Right Column: Order & Client Summary */}
          <div className="md:col-span-5 space-y-4">
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-900/60 border-white/10"
              }`}
            >
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                Detail Transaksi & Pesanan
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-neutral-400 font-sans">Kode Referensi:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-teal-400">{data.refCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(data.refCode)}
                      className="p-1 rounded hover:bg-white/10 cursor-pointer"
                      title="Salin Kode"
                    >
                      <RiFileCopyLine className="w-3 h-3 text-neutral-400" />
                    </button>
                    {copiedCode && <span className="text-[10px] text-teal-300">OK!</span>}
                  </div>
                </div>

                {data.receiptNumber && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-neutral-400 font-sans">No. Resi / Invoice:</span>
                    <span className="font-bold text-neutral-200">{data.receiptNumber}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-neutral-400 font-sans">Nama Klien:</span>
                  <span className="font-bold text-neutral-100 font-sans truncate max-w-[160px]">
                    {data.clientName}
                  </span>
                </div>

                {data.serviceTitle && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-neutral-400 font-sans">Layanan:</span>
                    <span className="text-neutral-200 font-sans truncate max-w-[160px]">
                      {data.serviceTitle}
                    </span>
                  </div>
                )}

                {data.packageName && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-neutral-400 font-sans">Paket:</span>
                    <span className="text-teal-300 font-sans font-semibold">
                      {data.packageName}
                    </span>
                  </div>
                )}

                {data.budget && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-neutral-400 font-sans">Nominal Pesanan:</span>
                    <span className="font-bold text-amber-400">{data.budget}</span>
                  </div>
                )}

                {data.paymentMethod && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-sans">Metode Bayar:</span>
                    <span className="font-bold uppercase text-neutral-200">
                      {data.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5">
              {data.clientPhone && (
                <a
                  href={waConfirmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RiWhatsappLine className="w-4 h-4" />
                  <span>Kirim Konfirmasi Resi ke WhatsApp</span>
                </a>
              )}

              {onConfirmKickoff && (
                <button
                  type="button"
                  onClick={() => {
                    onConfirmKickoff(data.refCode);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-black font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RiShieldCheckLine className="w-4 h-4 text-black" />
                  <span>Verifikasi Pembayaran & Kickoff Proyek</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

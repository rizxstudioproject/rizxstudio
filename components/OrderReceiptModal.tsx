"use client";

import React, { useState, useRef } from "react";
import {
  RiCloseLine,
  RiCheckLine,
  RiFileCopyLine,
  RiWhatsappLine,
  RiPrinterLine,
  RiDownload2Line,
  RiUploadCloud2Line,
  RiTimeLine,
  RiShieldCheckLine,
  RiCheckboxCircleFill,
  RiBankCardLine,
  RiQrCodeLine,
  RiCompass3Line,
  RiExternalLinkLine,
  RiAlertLine,
  RiImageLine,
  RiCameraLine,
  RiImageAddLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import {
  OrderReceiptItem,
  saveOrderReceipt,
} from "@/lib/paymentService";

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: OrderReceiptItem | null;
  onOpenTracker?: (refCode: string) => void;
}

export default function OrderReceiptModal({
  isOpen,
  onClose,
  receipt,
  onOpenTracker,
}: OrderReceiptModalProps) {
  const { tr } = useLang();
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofUrl, setProofUrl] = useState<string>(receipt?.paymentProofUrl || "");
  const [activeReceipt, setActiveReceipt] = useState<OrderReceiptItem | null>(receipt);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setActiveReceipt(receipt);
    if (receipt?.paymentProofUrl) {
      setProofUrl(receipt.paymentProofUrl);
    }
  }, [receipt]);

  if (!isOpen || !activeReceipt) return null;

  const targetWaNumber = socialContacts.whatsappNumber || "6282170214498";

  // Copy Account Number
  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(activeReceipt.accountDetails.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch (_) {}
  };

  // Copy Receipt Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeReceipt.trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (_) {}
  };

  // Upload Payment Proof
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "receipts");

      const res = await fetch("/api/admin/media-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setProofUrl(data.url);
        const updated: OrderReceiptItem = {
          ...activeReceipt,
          paymentProofUrl: data.url,
          status: "verifying",
        };
        setActiveReceipt(updated);
        saveOrderReceipt(updated);
      } else {
        alert("Gagal mengunggah bukti pembayaran: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Gagal mengunggah bukti: " + (err.message || err));
    } finally {
      setIsUploadingProof(false);
      try {
        e.target.value = "";
      } catch (_) {}
    }
  };

  // Print Dedicated Official Single-Page Receipt
  const handlePrint = () => {
    if (!activeReceipt) return;
    const r = activeReceipt;

    const formattedDate = new Date(r.createdAt).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const isDone = r.status === "verifying" || r.status === "in_progress" || r.status === "completed";
    const statusText = isDone ? "BUKTI TERLAMPIR — SEDANG DIVERIFIKASI" : "MENUNGGU PEMBAYARAN / TRANSFER";

    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resi Pembayaran - ${r.receiptNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.5;
      padding: 10px 0;
    }
    .receipt-card {
      max-width: 680px;
      margin: 0 auto;
      border: 1.5px solid #1e293b;
      border-radius: 12px;
      padding: 24px 28px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-badge {
      display: inline-block;
      background: #0d9488;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
    }
    .invoice-num {
      font-size: 16px;
      font-weight: 800;
      font-family: monospace;
      color: #0d9488;
      margin: 2px 0;
    }
    .status-ribbon {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 11px;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 10.5px;
      font-family: monospace;
      text-transform: uppercase;
      background: ${isDone ? "#dcfce7" : "#fef3c7"};
      color: ${isDone ? "#166534" : "#92400e"};
      border: 1px solid ${isDone ? "#86efac" : "#fde68a"};
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }
    .box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      background: #f8fafc;
    }
    .box-title {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .box-main {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .table-order {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-order th {
      background: #f1f5f9;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #cbd5e1;
      color: #334155;
    }
    .table-order td {
      padding: 9px 10px;
      border: 1px solid #cbd5e1;
      font-size: 11.5px;
      color: #1e293b;
    }
    .amount-box {
      background: #f0fdfa;
      border: 1.5px solid #0d9488;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .amount-label {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f766e;
      text-transform: uppercase;
    }
    .amount-value {
      font-size: 17px;
      font-weight: 900;
      color: #0f766e;
      font-family: monospace;
    }
    .payment-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
      background: #ffffff;
    }
    .bank-name {
      font-weight: 800;
      font-size: 12.5px;
      color: #0f172a;
    }
    .bank-account {
      font-size: 14px;
      font-family: monospace;
      font-weight: 800;
      color: #0d9488;
      letter-spacing: 0.5px;
      margin: 2px 0;
    }
    .footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #64748b;
      font-family: monospace;
    }
    .seal {
      display: inline-block;
      border: 1.5px solid #0d9488;
      color: #0d9488;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 9px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div>
        <div class="brand-title">
          <span class="brand-badge">RZ</span> RIZX STUDIO
        </div>
        <div class="brand-sub">Creative Production & Digital Solutions • rizxstudio.com</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">NOMOR RESI INVOICE</div>
        <div class="invoice-num">${r.receiptNumber}</div>
        <div style="font-size: 10px; color: #64748b; font-family: monospace;">Ref: ${r.refCode}</div>
      </div>
    </div>

    <div class="status-ribbon">
      <div>
        <span style="color: #64748b;">Status: </span>
        <span class="status-badge">${statusText}</span>
      </div>
      <div style="color: #64748b; font-family: monospace;">${formattedDate}</div>
    </div>

    <div class="grid-2">
      <div class="box">
        <div class="box-title">DATA PEMESAN / KLIEN</div>
        <div class="box-main">${r.clientName}</div>
        <div style="color: #475569; font-size: 11px; margin-top: 2px;">${r.clientPhone}</div>
        ${r.clientEmail ? `<div style="color: #64748b; font-size: 10.5px;">${r.clientEmail}</div>` : ""}
      </div>
      <div class="box">
        <div class="box-title">RINCIAN LAYANAN & ESTIMASI</div>
        <div class="box-main" style="color: #0d9488;">${r.serviceTitle}</div>
        <div style="color: #334155; font-size: 11px; margin-top: 2px;">Paket: <strong>${r.packageName}</strong></div>
        ${r.packageDuration ? `<div style="color: #64748b; font-size: 10.5px;">Estimasi Durasi: ${r.packageDuration}</div>` : ""}
      </div>
    </div>

    <table class="table-order">
      <thead>
        <tr>
          <th>Deskripsi Pemesanan</th>
          <th style="width: 25%; text-align: center;">Skema Pembayaran</th>
          <th style="width: 25%; text-align: right;">Estimasi Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${r.serviceTitle}</strong><br>
            <span style="color: #64748b; font-size: 10.5px;">Paket ${r.packageName} (${r.packageDuration || "-"})</span>
          </td>
          <td style="text-align: center; font-weight: 600;">${r.paymentPlanLabel}</td>
          <td style="text-align: right; font-weight: 700; font-family: monospace;">${r.totalBudget}</td>
        </tr>
      </tbody>
    </table>

    <div class="amount-box">
      <div>
        <div class="amount-label">NOMINAL YANG HARUS DIBAYAR</div>
        <div style="font-size: 10px; color: #0f766e; margin-top: 1px;">Sesuai skema pembayaran yang dipilih</div>
      </div>
      <div class="amount-value">${r.amountToPay}</div>
    </div>

    <div class="payment-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="box-title" style="margin-bottom: 0;">REKENING TUJUAN TRANSFER RESMI</span>
        <span style="font-size: 9px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px;">AKUN RESMI</span>
      </div>
      <div class="bank-name">${r.accountDetails.name}</div>
      <div class="bank-account">${r.accountDetails.accountNumber}</div>
      <div style="font-size: 11px; color: #475569;">Atas Nama: <strong>${r.accountDetails.accountHolder}</strong></div>
      <div style="font-size: 10px; color: #64748b; font-style: italic; margin-top: 4px;">${r.accountDetails.instructions}</div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px; margin-bottom: 16px; font-size: 10.5px; font-family: monospace; color: #475569;">
      <strong>Link Tracking Proyek Online:</strong> <span style="color: #0d9488;">${r.trackingUrl}</span>
    </div>

    <div class="footer">
      <div>
        <div>Dokumen ini sah & diterbitkan secara otomatis oleh sistem Rizx Studio.</div>
        <div style="color: #94a3b8; margin-top: 2px;">Waktu cetak: ${new Date().toLocaleString("id-ID")}</div>
      </div>
      <div class="seal">
        ✓ OFFICIAL VERIFIED RECEIPT
      </div>
    </div>
  </div>
</body>
</html>`;

    // Create invisible iframe to trigger print without printing website pages
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 300);
    }
  };

  // WhatsApp Message
  const buildWhatsAppMessage = () => {
    const r = activeReceipt;
    return `*Halo Admin Rizx Studio!* 👋
Saya telah melakukan pemesanan dan ingin konfirmasi pembayaran untuk segera diproses:

🔖 *NO. RESI PEMESANAN:* ${r.receiptNumber}
📋 *KODE TRACKING:* ${r.refCode}
📌 *LAYANAN:* ${r.serviceTitle}
📦 *PAKET:* ${r.packageName} (${r.packageDuration || "-"})
💰 *TOTAL BUDGET:* ${r.totalBudget}
💳 *SKEMA PEMBAYARAN:* ${r.paymentPlanLabel}
🏦 *METODE TRANSFER:* ${r.accountDetails.name} (${r.accountDetails.accountNumber} a.n ${r.accountDetails.accountHolder})

👤 *DATA PEMESAN:*
- Nama: ${r.clientName}
- WhatsApp: ${r.clientPhone}
${r.clientEmail ? `- Email: ${r.clientEmail}` : ""}

🔗 *LINK RESI & TRACKING ONLINE:*
${r.trackingUrl}

${r.paymentProofUrl ? `📎 *BUKTI PEMBAYARAN:* ${r.paymentProofUrl}\n(Bukti transfer sudah saya lampirkan di sistem)` : "Mohon cek mutasi transfer atas nama saya agar proyek bisa segera dijadwalkan & diproses. Terima kasih!"}`;
  };

  const handleSendToWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
    const waUrl = `https://wa.me/${targetWaNumber.replace(/[^0-9]/g, "")}?text=${text}`;
    window.open(waUrl, "_blank");
  };

  const isVerified = activeReceipt.status === "verifying" || activeReceipt.status === "in_progress";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto receipt-modal-backdrop">
      {/* Modal Dialog Window */}
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 receipt-modal-window ${
          isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#0c0e13] border-white/15 text-white"
        }`}
      >
        {/* Top Header Controls (Print / Copy / Close) */}
        <div
          className={`shrink-0 px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-3 ${
            isLight ? "bg-white/90 border-slate-200" : "bg-[#0e1117]/95 border-white/10"
          } backdrop-blur-md no-print`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              {tr("Official Payment Receipt", "Resi Pembayaran Resmi", "Resi Pambayaran")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title={tr("Print Receipt / Save as PDF", "Cetak Resi / Simpan PDF", "Cetak Resi / Simpan PDF")}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5"
            >
              <RiPrinterLine className="w-4 h-4 text-emerald-400" />
              <span className="font-mono">{tr("Print Receipt", "Cetak Resi", "Cetak Resi")}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Tutup (Esc)"
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Slip Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 print-container">
          {/* Printable Receipt Paper Container */}
          <div
            className={`rounded-2xl border p-5 sm:p-7 space-y-5 transition-all print-receipt-paper ${
              isLight
                ? "bg-white border-slate-200/90 shadow-md"
                : "bg-[#11141b] border-white/10 shadow-2xl"
            }`}
          >
            {/* Studio Header Brand */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-xs">
                    RZ
                  </div>
                  <h3 className="text-lg font-black tracking-wider uppercase">
                    RIZX STUDIO
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Creative Production & Digital Solutions • rizxstudio.com
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                  NOMOR RESI INVOICE
                </span>
                <span className="text-sm sm:text-base font-extrabold font-mono text-[#16b09f]">
                  {activeReceipt.receiptNumber}
                </span>
              </div>
            </div>

            {/* Status Ribbon & Timestamp */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Status:</span>
                {isVerified ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                    <RiCheckboxCircleFill className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bukti Terlampir — Sedang Diverifikasi</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5">
                    <RiTimeLine className="w-3.5 h-3.5 text-amber-400" />
                    <span>Menunggu Pembayaran / Bukti Transfer</span>
                  </span>
                )}
              </div>

              <span className="text-neutral-400 text-[11px]">
                {new Date(activeReceipt.createdAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            {/* Client & Service Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {/* Client Info */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  DATA PEMESAN / KLIEN
                </span>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">{activeReceipt.clientName}</div>
                  <div className="text-neutral-300">{activeReceipt.clientPhone}</div>
                  {activeReceipt.clientEmail && (
                    <div className="text-neutral-400">{activeReceipt.clientEmail}</div>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  RINCIAN LAYANAN & PAKET
                </span>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#16b09f]">
                    {activeReceipt.serviceTitle}
                  </div>
                  <div className="text-neutral-200">
                    Paket: {activeReceipt.packageName}
                  </div>
                  {activeReceipt.packageDuration && (
                    <div className="text-neutral-400">
                      Estimasi: {activeReceipt.packageDuration}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method & Bank Destination */}
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <RiBankCardLine className="w-4 h-4 text-teal-400" />
                  REKENING TUJUAN PEMBAYARAN
                </span>
                {activeReceipt.accountDetails.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {activeReceipt.accountDetails.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-white">
                  {activeReceipt.accountDetails.name}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 font-mono font-bold text-sm text-teal-300 select-all">
                    {activeReceipt.accountDetails.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition active:scale-95 cursor-pointer flex items-center gap-1 font-mono"
                  >
                    <RiFileCopyLine className="w-3.5 h-3.5" />
                    <span>{copiedAccount ? "Tersalin!" : "Salin No. Rekening"}</span>
                  </button>
                </div>

                <div className="text-neutral-400 text-[11px] font-mono pt-1">
                  Atas Nama: <strong className="text-white">{activeReceipt.accountDetails.accountHolder}</strong>
                </div>

                <p className="text-[10px] text-neutral-400 italic pt-1 leading-relaxed">
                  {activeReceipt.accountDetails.instructions}
                </p>
              </div>

              {/* QR Image Preview if available (QRIS, DANA, GoPay, OVO, dll) */}
              {activeReceipt.accountDetails?.qrImageUrl && (
                <div className="pt-2 flex flex-col items-center justify-center p-3 rounded-xl bg-white text-black">
                  <img
                    src={activeReceipt.accountDetails.qrImageUrl}
                    alt={activeReceipt.accountDetails.name || "QR Payment"}
                    className="w-44 h-44 object-contain"
                  />
                  <span className="text-[10px] font-mono font-bold text-neutral-800 mt-1">
                    Scan Barcode {activeReceipt.accountDetails.name || "QRIS"}
                  </span>
                </div>
              )}
            </div>

            {/* Total Payment Breakdown */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                <span>Skema Pembayaran:</span>
                <span className="text-white font-semibold">{activeReceipt.paymentPlanLabel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                <span>Total Estimasi Proyek:</span>
                <span className="text-white">{activeReceipt.totalBudget}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-sm font-bold">
                <span className="text-teal-400">Nominal yang Harus Dibayar:</span>
                <span className="text-base text-teal-300 font-extrabold">{activeReceipt.amountToPay}</span>
              </div>
            </div>

            {/* ── INTERACTIVE LINK WHEN PAID (Tautan Resi & Tracking) ── */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <RiCompass3Line className="w-4 h-4 text-cyan-400" />
                  <span>Link Tracking & Resi Online:</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer text-[11px] underline"
                >
                  <RiFileCopyLine className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "Tersalin!" : "Salin Link Resi"}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 break-all flex items-center justify-between gap-2">
                <span className="truncate">{activeReceipt.trackingUrl}</span>
                <a
                  href={activeReceipt.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold shrink-0 flex items-center gap-1 transition"
                >
                  <span>Buka</span>
                  <RiExternalLinkLine className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono">
                Simpan link ini untuk memeriksa progres pengerjaan proyek secara transparan kapan saja.
              </p>
            </div>

            {/* ── UPLOAD BUKTI TRANSFER / RESI BAYAR ── */}
            <div className="p-4 rounded-2xl border border-white/10 bg-black/50 space-y-3 no-print">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-neutral-200 flex items-center gap-1.5">
                  <RiCameraLine className="w-4 h-4 text-teal-400" />
                  <span>{tr("Upload / Photo Payment Proof", "Upload / Foto Bukti Resi Transfer", "Upload / Foto Bukti Resi Transfer")}</span>
                </label>
                {proofUrl && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <RiCheckLine className="w-3.5 h-3.5" />
                    {tr("Attached", "Terlampir", "Talampia")}
                  </span>
                )}
              </div>

              {proofUrl ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={proofUrl}
                      alt="Bukti Transfer"
                      className="w-16 h-16 object-cover rounded-lg border border-white/10 shrink-0 shadow-md"
                    />
                    <div className="flex-1 min-w-0 text-xs font-mono">
                      <div className="text-emerald-300 font-bold truncate">
                        {tr("Payment Proof Attached", "Bukti Pembayaran Terunggah", "Bukti Pambayaran Taunggah")}
                      </div>
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline block truncate mt-0.5"
                      >
                        {tr("View Full Image ↗", "Lihat Gambar Penuh ↗", "Caliak Gambar Penuah ↗")}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <button
                      type="button"
                      disabled={isUploadingProof}
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                      title={tr("Retake with phone camera", "Foto ulang dengan kamera HP", "Foto ulang jo kamera HP")}
                    >
                      <RiCameraLine className="w-3.5 h-3.5 text-teal-400" />
                      <span>{tr("Camera Photo", "Foto Kamera", "Foto Kamera")}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUploadingProof}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] text-white transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                      title={tr("Select from gallery / files", "Pilih file dari galeri", "Piliaah file dari galeri")}
                    >
                      <RiImageAddLine className="w-3.5 h-3.5 text-neutral-300" />
                      <span>{tr("Change File", "Ganti File", "Ganti File")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Camera Button (Opens phone camera directly) */}
                    <button
                      type="button"
                      disabled={isUploadingProof}
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full px-3.5 py-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/45 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <RiCameraLine className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>
                        {isUploadingProof
                          ? tr("Uploading...", "Mengunggah...", "Mangupload...")
                          : tr("Take Photo with Camera", "Foto Kamera HP", "Foto Kamera HP")}
                      </span>
                    </button>

                    {/* File / Gallery Upload Button */}
                    <button
                      type="button"
                      disabled={isUploadingProof}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <RiUploadCloud2Line className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        {isUploadingProof
                          ? tr("Uploading...", "Mengunggah...", "Mangupload...")
                          : tr("Select from Gallery / File", "Pilih dari Galeri / File", "Piliaah dari Galeri / File")}
                      </span>
                    </button>
                  </div>

                  <p className="text-[10px] text-neutral-400 font-mono text-center">
                    {tr(
                      "Take photo directly with phone camera or select screenshot from gallery (JPG, PNG).",
                      "Bisa langsung foto struk fisik dengan kamera HP atau pilih screenshot struk dari galeri (JPG, PNG).",
                      "Bisa lansuang foto struk jo kamera HP atau piliah screenshot struk dari galeri (JPG, PNG)."
                    )}
                  </p>
                </div>
              )}

              {/* Direct Camera Input (capture='environment' triggers phone rear camera) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleUploadProof}
                className="hidden"
              />

              {/* File / Gallery Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadProof}
                className="hidden"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 no-print">
            <button
              type="button"
              onClick={handleSendToWhatsApp}
              className="w-full py-4 px-5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
            >
              <RiWhatsappLine className="w-5 h-5 text-black" />
              <span>Kirim Resi & Konfirmasi ke WhatsApp Admin untuk Segera Diproses 💬</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RiPrinterLine className="w-4 h-4 text-emerald-400" />
                <span>{tr("Print / PDF", "Cetak / Simpan PDF", "Cetak / Simpan PDF")}</span>
              </button>

              {onOpenTracker && (
                <button
                  type="button"
                  onClick={() => onOpenTracker(activeReceipt.refCode)}
                  className="py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RiCompass3Line className="w-4 h-4 text-cyan-400" />
                  <span>{tr("Live Tracker", `Tracker (${activeReceipt.refCode})`, `Tracker (${activeReceipt.refCode})`)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium transition cursor-pointer text-center"
              >
                {tr("Close", "Selesai / Tutup", "Salasai / Tutuik")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

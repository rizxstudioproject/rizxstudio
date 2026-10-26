"use client";

import React, { useState } from "react";
import {
  RiShoppingCart2Fill,
  RiCheckLine,
  RiFileList3Fill,
  RiInboxArchiveFill,
  RiTruckFill,
  RiHome4Fill,
  RiTimeLine,
  RiCalendarEventLine,
  RiExternalLinkLine,
  RiWhatsappLine,
  RiFileCopyLine,
  RiCheckboxCircleFill,
  RiSparklingLine,
  RiShieldCheckLine,
  RiEyeLine,
} from "react-icons/ri";
import { ProjectTrackingItem, getStageMetadata } from "@/lib/projectTrackerService";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { formatWhatsAppUrl } from "@/lib/socialService";

interface VisualOrderTrackerProps {
  project: ProjectTrackingItem;
  onCopyCode?: () => void;
  copied?: boolean;
}

export default function VisualOrderTracker({
  project,
  onCopyCode,
  copied = false,
}: VisualOrderTrackerProps) {
  const { lang, tr } = useLang();
  const { primaryColor, themeMode, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";

  const stageMeta = getStageMetadata(project.currentStage);
  const currentStepNum = stageMeta.step; // 1 | 2 | 3 | 4

  // Visual Stepper Steps definition (identical in structure to reference image)
  const visualSteps = [
    {
      id: "queued",
      stepNum: 1,
      topLabel: tr("Order", "Pesanan", "Pasan"),
      bottomLabel: tr("Confirmed", "Dikonfirmasi", "Dikonfirmasi"),
      subLabel: tr("Queue & Verification", "Masuk Antrean & Verifikasi", "Antrean & Pamarisoan"),
      iconColor: "#3b82f6", // Blue
      bgColor: "rgba(59, 130, 246, 0.12)",
      borderColor: "rgba(59, 130, 246, 0.35)",
      Icon: RiFileList3Fill,
    },
    {
      id: "in_progress",
      stepNum: 2,
      topLabel: tr("In Production", "Dalam Proses", "Dalam Karajo"),
      bottomLabel: tr("In Progress", "Pengerjaan", "Pangarajoan"),
      subLabel: tr("Design & Development", "Produksi Desain / Tech", "Produksi Desain"),
      iconColor: "#f59e0b", // Amber / Yellow
      bgColor: "rgba(245, 158, 11, 0.12)",
      borderColor: "rgba(245, 158, 11, 0.35)",
      Icon: RiInboxArchiveFill,
    },
    {
      id: "review",
      stepNum: 3,
      topLabel: tr("Client Review", "Tahap Review", "Tahap Review"),
      bottomLabel: tr("& Revisions", "& Revisi", "& Revisi"),
      subLabel: tr("Evaluation & Fine-tuning", "Evaluasi & Uji Coba Klien", "Caliak Hasil Karajo"),
      iconColor: "#06b6d4", // Cyan
      bgColor: "rgba(6, 182, 212, 0.12)",
      borderColor: "rgba(6, 182, 212, 0.35)",
      Icon: RiTruckFill,
    },
    {
      id: "completed",
      stepNum: 4,
      topLabel: tr("Order", "Selesai 100%", "Tuntong 100%"),
      bottomLabel: tr("Delivered", "Diserahkan", "Disarahkan"),
      subLabel: tr("Master Handoff & Done", "Serah Terima Berkas Master", "Sarahkan Berkas"),
      iconColor: "#22c55e", // Green
      bgColor: "rgba(34, 197, 94, 0.12)",
      borderColor: "rgba(34, 197, 94, 0.35)",
      Icon: RiHome4Fill,
    },
  ];

  // Helper date formatted
  const startDateStr = new Date(project.startDate).toLocaleDateString(
    lang === "en" ? "en-US" : "id-ID",
    { day: "numeric", month: "short", year: "numeric" }
  );

  const formattedTargetArrival = project.targetDeadline || tr("7 - 10 Days", "7 - 10 Hari Kerja", "7 - 10 Hari");

  // Mask client name for privacy (e.g. "Rizx Creative Partner" -> "Riz* Cre* Par*")
  const maskClientName = (name?: string) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    return words
      .map((w) => {
        if (w.length <= 2) return w[0] + "*";
        if (w.length <= 4) return w.slice(0, 2) + "*".repeat(w.length - 2);
        return w.slice(0, 3) + "*".repeat(Math.min(w.length - 3, 4));
      })
      .join(" ");
  };

  // Construct WhatsApp Inquiry Url
  const waTarget = socialContacts.whatsappNumber || "6282170214498";
  const waInquiryMsg = `Halo Rizx Studio! Saya ingin menanyakan pembaruan progres proyek dengan Kode Referensi: ${project.refCode} (${project.serviceTitle} - ${project.packageName}).`;
  const waUrl = formatWhatsAppUrl(waTarget, waInquiryMsg);

  return (
    <div
      className={`rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
        isLight
          ? "bg-white border-slate-200 text-slate-800"
          : "bg-[#0b0f17] border-white/15 text-neutral-100"
      }`}
    >
      {/* ── 1. TOP HEADER (BRAND, ORDER ID, PILLS) ── */}
      <div
        className={`p-4 sm:p-6 lg:p-8 border-b ${
          isLight ? "bg-slate-50/80 border-slate-200" : "bg-neutral-900/60 border-white/10"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          {/* Left: Brand + Order ID */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: stageMeta.color }}
                />
                Rizx Studio
              </span>
              <span className="text-xs text-neutral-500 font-mono">/</span>
              <span className="text-xs font-mono text-neutral-400">
                {project.categoryLabel || "Creative Project"}
              </span>
            </div>

            {/* Shopping Cart Icon + Order ID */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-blue-400 font-mono text-sm sm:text-base">
                <RiShoppingCart2Fill className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <span className="text-neutral-400 text-xs sm:text-sm font-sans font-medium">
                  {tr("Order ID :", "Order ID :", "Order ID :")}
                </span>
                <span className="font-bold text-emerald-400 font-mono tracking-wider text-sm sm:text-base md:text-lg">
                  #{project.refCode}
                </span>
              </div>

              {/* Copy button */}
              {onCopyCode && (
                <button
                  type="button"
                  onClick={onCopyCode}
                  title="Salin Kode Referensi"
                  className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition cursor-pointer text-[11px] sm:text-xs flex items-center gap-1"
                >
                  <RiFileCopyLine className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{copied ? "Tersalin!" : "Salin"}</span>
                </button>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-neutral-400 font-medium">
              {project.serviceTitle} —{" "}
              <span className="text-teal-400 font-semibold">{project.packageName}</span>{" "}
              <span className="text-neutral-500 font-mono text-[11px]">
                ({maskClientName(project.clientName)})
              </span>
            </p>
          </div>

          {/* Right: Expected Arrival Pill + Tracking ID Pill */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
            {/* Expected Arrival Pill */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider">
                {tr("Arrival", "Selesai", "Salasai")}:
              </span>
              <span className="px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold font-mono bg-blue-600 text-white shadow-sm shadow-blue-500/30">
                {formattedTargetArrival}
              </span>
            </div>

            {/* Tracking ID Pill */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider">
                {tr("Tracking ID", "ID", "ID")}:
              </span>
              <span className="px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold font-mono bg-rose-600 text-white shadow-sm shadow-rose-500/30">
                {project.refCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2A. MOBILE VERTICAL STEPPER (DARI ATAS KE BAWAH — SLIM, ELEGAN & PROFESSIONAL) ── */}
      <div className="block sm:hidden p-5 border-b border-white/5">
        <div className="relative pl-7 space-y-6">
          {/* Vertical Track Line Background */}
          <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-neutral-800" />

          {/* Active Vertical Green Line Progress */}
          <div
            className="absolute left-[13px] top-4 w-[2px] bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            style={{
              height:
                currentStepNum === 1
                  ? "0%"
                  : currentStepNum === 2
                  ? "33.3%"
                  : currentStepNum === 3
                  ? "66.6%"
                  : "100%",
            }}
          />

          {visualSteps.map((step) => {
            const StepIcon = step.Icon;
            const isCompleted = step.stepNum < currentStepNum || (currentStepNum === 4 && step.stepNum === 4);
            const isCurrent = step.stepNum === currentStepNum && currentStepNum !== 4;
            const isPending = step.stepNum > currentStepNum;

            return (
              <div
                key={step.id}
                className={`relative flex items-start gap-3 transition-all duration-300 ${
                  isPending ? "opacity-35" : "opacity-100"
                }`}
              >
                {/* Node Checkpoint on the Vertical Line */}
                <div
                  className={`absolute -left-[27px] top-1 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                    isCompleted
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                      : isCurrent
                      ? "bg-emerald-500 text-black ring-4 ring-emerald-500/25 shadow-md shadow-emerald-500/40 animate-pulse"
                      : "bg-neutral-900 border border-neutral-700 text-neutral-500"
                  }`}
                >
                  {isCompleted ? (
                    <RiCheckLine className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <RiCheckLine className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-600" />
                  )}
                </div>

                {/* Step Card Content */}
                <div
                  className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-neutral-900/90 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                      : isCompleted
                      ? "bg-neutral-900/40 border-white/5"
                      : "bg-transparent border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2.5">
                      {/* Slim Colored Thematic Icon */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          backgroundColor: step.bgColor,
                          borderColor: step.borderColor,
                          borderWidth: "1px",
                          color: step.iconColor,
                        }}
                      >
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>

                      {/* Step Title & Subtitle */}
                      <div>
                        <h4
                          className={`text-xs font-bold leading-tight ${
                            isCurrent
                              ? "text-emerald-400"
                              : isCompleted
                              ? "text-white"
                              : "text-neutral-400"
                          }`}
                        >
                          {step.topLabel} {step.bottomLabel}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-light block mt-0.5">
                          {step.subLabel}
                        </span>
                      </div>
                    </div>

                    {/* Status Indicator Pill */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                          {tr("Selesai", "Selesai", "Salasai")}
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold shadow-sm animate-pulse">
                          {tr("Aktif", "Aktif", "Aktif")}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-500 border border-white/5">
                          {tr("Menunggu", "Menunggu", "Mananti")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2B. DESKTOP / TABLET HORIZONTAL STEPPER (>= sm) ── */}
      <div className="hidden sm:block p-8 sm:p-10 border-b border-white/5 overflow-x-auto">
        <div className="max-w-4xl mx-auto py-2">
          {/* Horizontal Track Bar with Checkpoint Circles */}
          <div className="relative flex items-center justify-between mb-8 px-8 sm:px-12">
            {/* Background Full Track Line */}
            <div className="absolute left-8 sm:left-12 right-8 sm:right-12 top-1/2 -translate-y-1/2 h-2 bg-neutral-800 rounded-full z-0" />

            {/* Active Green Track Line Fill */}
            <div
              className="absolute left-8 sm:left-12 top-1/2 -translate-y-1/2 h-2 bg-emerald-500 rounded-full z-0 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              style={{
                width:
                  currentStepNum === 1
                    ? "0%"
                    : currentStepNum === 2
                    ? "33.3%"
                    : currentStepNum === 3
                    ? "66.6%"
                    : "100%",
              }}
            />

            {/* 4 Checkpoint Nodes */}
            {visualSteps.map((step) => {
              const isCompleted = step.stepNum < currentStepNum || (currentStepNum === 4 && step.stepNum === 4);
              const isCurrent = step.stepNum === currentStepNum && currentStepNum !== 4;
              const isPending = step.stepNum > currentStepNum;

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  {/* Circle Checkpoint Node */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                        : isCurrent
                        ? "bg-emerald-500 text-white shadow-[0_0_18px_rgba(34,197,94,0.7)] ring-4 ring-emerald-400/30 animate-pulse"
                        : "bg-neutral-800 border-2 border-neutral-700 text-neutral-500"
                    }`}
                  >
                    {isCompleted ? (
                      <RiCheckLine className="w-5 h-5 stroke-[3]" />
                    ) : isCurrent ? (
                      <RiCheckLine className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-neutral-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Icons + 2-Line Labels below the Checkpoints */}
          <div className="grid grid-cols-4 gap-2 px-2 sm:px-4">
            {visualSteps.map((step) => {
              const StepIcon = step.Icon;
              const isCompleted = step.stepNum < currentStepNum || (currentStepNum === 4 && step.stepNum === 4);
              const isCurrent = step.stepNum === currentStepNum && currentStepNum !== 4;
              const isPending = step.stepNum > currentStepNum;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-center transition-all duration-300 ${
                    isPending ? "opacity-40" : "opacity-100"
                  }`}
                >
                  {/* Colored Thematic Icon */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2.5 shadow-sm transition-transform hover:scale-105"
                    style={{
                      backgroundColor: step.bgColor,
                      borderColor: step.borderColor,
                      borderWidth: "1px",
                      color: step.iconColor,
                    }}
                  >
                    <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* 2-Line Bold Text */}
                  <div className="leading-tight">
                    <span
                      className={`block text-xs sm:text-sm font-bold ${
                        isCurrent
                          ? "text-emerald-400"
                          : isCompleted
                          ? "text-white"
                          : "text-neutral-400"
                      }`}
                    >
                      {step.topLabel}
                    </span>
                    <span
                      className={`block text-xs sm:text-sm font-bold ${
                        isCurrent
                          ? "text-emerald-400"
                          : isCompleted
                          ? "text-white"
                          : "text-neutral-400"
                      }`}
                    >
                      {step.bottomLabel}
                    </span>
                  </div>

                  {/* Subtle Sub-label */}
                  <span className="text-[10px] text-neutral-400 mt-1 hidden sm:block max-w-[120px]">
                    {step.subLabel}
                  </span>

                  {/* Status Indicator Pill */}
                  <div className="mt-2">
                    {isCompleted ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {tr("Selesai", "Selesai", "Salasai")}
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold shadow-sm animate-pulse">
                        {tr("Sedang Berjalan", "Sedang Berjalan", "Sadang Jalan")}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-500 border border-white/5">
                        {tr("Menunggu", "Menunggu", "Mananti")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. DETAILED PROGRESS GAUGE & MILESTONE NOTES ── */}
      <div
        className={`p-6 sm:p-8 border-t ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-950/90 border-white/10"
        } space-y-6`}
      >
        {/* Progress Bar with Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
            <span className="text-neutral-300 font-semibold flex items-center gap-2">
              <RiTimeLine className="w-4 h-4 text-teal-400" />
              {tr("Total Completion Progress", "Tingkat Penyelesaian Proyek", "Kamajuan Karajo Proyek")}
            </span>
            <span
              className="text-base font-extrabold font-mono"
              style={{ color: stageMeta.color }}
            >
              {project.progressPercent}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${project.progressPercent}%`,
                backgroundColor: stageMeta.color,
                boxShadow: `0 0 15px ${stageMeta.color}aa`,
              }}
            />
          </div>
        </div>

        {/* Milestone Notes from Studio */}
        {project.notes && (
          <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-teal-400 flex items-center gap-1.5 font-bold">
                <RiSparklingLine className="w-4 h-4" />
                {tr("Studio Milestone Notes", "Catatan Terbaru dari Studio", "Catatan Tabaru dari Studio")}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Update: {new Date(project.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
              &ldquo;{project.notes}&rdquo;
            </p>
          </div>
        )}

        {/* Deliverables Checklist (if present) */}
        {project.deliverables && project.deliverables.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              {tr("Project Deliverables Output", "Deliverables / Output Pekerjaan", "Hasil Karajo")}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-neutral-300"
                >
                  <RiCheckboxCircleFill className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons: Preview Link + WhatsApp Inquiry */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {project.previewUrl ? (
            <a
              href={project.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
            >
              <RiExternalLinkLine className="w-4 h-4" />
              <span>{tr("Open Work Preview Link", "Buka Preview Hasil Kerja", "Bukak Caliak Hasil Karajo")}</span>
            </a>
          ) : (
            <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5">
              <RiShieldCheckLine className="w-4 h-4 text-neutral-500" />
              <span>{tr("Draft previews are delivered as milestone progresses", "Preview draft akan dikirim seiring progres produksi", "Preview draft disarahkan sajalan progres")}</span>
            </div>
          )}

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-emerald-500/10 text-neutral-300 hover:text-emerald-300 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RiWhatsappLine className="w-4 h-4 text-emerald-400" />
            <span>{tr("Consult via WhatsApp", "Hubungi Studio via WhatsApp", "Hubungi Studio via WhatsApp")}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

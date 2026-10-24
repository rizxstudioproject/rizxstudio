"use client";

import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { HiXMark } from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { addRealLead } from "@/lib/crmService";

const DISMISS_KEY = "wa_popup_dismissed";
const SHOW_DELAY_MS = 3500; // show after 3.5s

export default function WhatsAppPopup() {
  const { lang } = useLang();
  const { socialContacts, primaryColor } = useMotionTheme();
  const isId = lang === "id";
  const isMin = lang === "min";

  const cleanWaNumber = (socialContacts.whatsappNumber || "6282381769146").replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    socialContacts.whatsappMessage || "Halo Fomy R / Rizx Studio, saya tertarik untuk berdiskusi proyek."
  )}`;

  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed in this session
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      // Small delay so CSS transition fires properly
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimIn(true));
      });
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setAnimIn(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
    setTimeout(() => setVisible(false), 350);
  };

  const handleChat = () => {
    try {
      addRealLead({
        name: "Pengunjung WhatsApp (Floating)",
        source: "WhatsApp Floating",
        service: "Konsultasi Kreatif Proyek",
        status: "New",
        value: 15000000,
        notes: "Mengklik pop-up WhatsApp mengambang di website.",
      }).catch((e) => console.warn("CRM auto-capture notice:", e));
    } catch (e) {
      console.warn("CRM auto-capture error:", e);
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
    handleDismiss();
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-24 right-5 sm:right-6 z-[90] w-[300px] sm:w-[320px] transition-all duration-350 ease-out ${
        animIn
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-6 scale-95"
      }`}
      role="dialog"
      aria-modal="false"
      aria-label="WhatsApp contact popup"
    >
      {/* Card */}
      <div className="relative rounded-2xl bg-neutral-900 border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden">
        {/* Top accent bar */}
        <div
          className="h-[3px] w-full"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, #22d3ee, transparent)`,
          }}
        />

        <div className="p-4 sm:p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Close popup"
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all"
          >
            <HiXMark className="w-4 h-4" />
          </button>

          {/* Avatars row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex -space-x-3">
              {/* Avatar 1 */}
              <div className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-neutral-900 overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                <img
                  src="/navbar-logo.png"
                  alt="Rizx Studio"
                  className="w-full h-full object-contain p-1.5 brightness-0 invert opacity-70"
                />
              </div>
              {/* Avatar 2 — WhatsApp icon circle */}
              <div
                className="w-10 h-10 rounded-full border-2 border-neutral-900 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}25` }}
              >
                <FaWhatsapp className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] border-2 border-neutral-900" />
            </div>

            {/* Status text */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {isId ? "Rizx Studio" : "Rizx Studio"}
              </span>
              <span
                className="text-[10px] font-mono flex items-center gap-1"
                style={{ color: primaryColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse inline-block" />
                {isMin ? "Online kini" : isId ? "Online sekarang" : "Online now"}
              </span>
            </div>
          </div>

          {/* Headline */}
          <p className="text-sm sm:text-[15px] font-semibold text-white leading-snug mb-1.5">
            {isMin
              ? "Ado nan nio ditanyokan? Chat langsuang di WhatsApp."
              : isId
              ? "Ada pertanyaan? Chat langsung via WhatsApp."
              : "A question? Message us on WhatsApp."}
          </p>

          {/* Body */}
          <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed mb-4">
            {isMin
              ? "Rizx Studio mambaleh langsuang — indak paralu antre."
              : isId
              ? "Rizx Studio membalas langsung — tanpa form, tanpa antre."
              : "Rizx Studio replies directly — no form, no switchboard."}
          </p>

          {/* CTA Button */}
          <button
            onClick={handleChat}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] active:scale-95 text-white font-semibold text-sm transition-all duration-200 shadow-[0_4px_16px_rgba(37,211,102,0.30)]"
          >
            <FaWhatsapp className="w-4.5 h-4.5" />
            <span>{isMin ? "Chat di WhatsApp" : isId ? "Chat di WhatsApp" : "Chat on WhatsApp"}</span>
          </button>

          {/* Secondary link */}
          <p className="text-center mt-2.5 text-[11px] text-neutral-600">
            {isMin ? "atau " : isId ? "atau " : "or "}
            <button
              onClick={handleDismiss}
              className="underline underline-offset-2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {isMin ? "tutuik" : isId ? "tutup" : "dismiss"}
            </button>
          </p>
        </div>
      </div>

      {/* Pointer / caret at bottom-right */}
      <div className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 bg-neutral-900 border-r border-b border-white/10" />
    </div>
  );
}

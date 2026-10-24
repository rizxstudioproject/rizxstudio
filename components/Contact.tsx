"use client";

import React, { useState, useRef, useEffect } from "react";
import SpotlightCard from "./SpotlightCard";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

export default function Contact() {
  const { t, lang, setLang } = useLang();
  const { themeMode, socialContacts, primaryColor } = useMotionTheme();
  const isLight = themeMode === "light";

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "EN" },
    { code: "id", label: "ID" },
    { code: "min", label: "MIN" },
  ] as const;
  const activeLangIndex = Math.max(0, languages.findIndex((l) => l.code === lang));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanWaNumber = (socialContacts.whatsappNumber || "6282381769146").replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    socialContacts.whatsappMessage || "Halo Fomy R / Rizx Studio, saya ingin berkonsultasi mengenai proyek."
  )}`;

  return (
    <footer id="contact" className="relative pt-20 pb-16 px-4 sm:px-12 lg:px-24 max-w-7xl mx-auto">
      {/* Subtle Ambient Brand Glow behind Footer Card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[360px] pointer-events-none rounded-full blur-[140px] opacity-15 transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />

      <SpotlightCard className="p-8 sm:p-14 lg:p-16 mb-16 sm:mb-20 relative overflow-hidden">
        {/* Top brand accent border */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${primaryColor} 50%, transparent 100%)`,
          }}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-10">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-widest uppercase mb-4 px-3 py-1 rounded-full border shadow-sm transition-colors duration-300"
              style={{
                color: primaryColor,
                backgroundColor: `${primaryColor}1f`,
                borderColor: `${primaryColor}4d`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 8px ${primaryColor}`,
                }}
              />
              <span>{t("contact.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4 sm:mb-6 leading-tight">
              {t("contact.headline1")} <br className="hidden sm:inline" />
              <span className="text-neutral-400 font-light italic">{t("contact.headline2")}</span> {t("contact.headline3")}
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
              {t("contact.body")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: primaryColor,
                color: "#000000",
                boxShadow: `0 0 28px ${primaryColor}55`,
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm hover:brightness-110 hover:scale-[1.03] active:scale-95 transition-all duration-300 text-center magnetic-hover cursor-pointer"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>WHATSAPP</span>
            </a>
            <a
              href={socialContacts.instagramUrl || "https://www.instagram.com/rizxstudio/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white/[0.04] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all duration-300 text-center magnetic-hover"
            >
              <FaInstagram className="w-4 h-4" />
              <span>INSTAGRAM</span>
            </a>
            <a
              href={socialContacts.linkedinUrl || "https://www.linkedin.com/in/rizxstudio/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white/[0.04] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all duration-300 text-center magnetic-hover"
            >
              <FaLinkedinIn className="w-4 h-4" />
              <span>LINKEDIN</span>
            </a>
          </div>
        </div>
      </SpotlightCard>

      {/* Footer Bottom Bar — Mobile: centered stack | Desktop: 3-column row */}
      <div className="pt-8 border-t border-white/5 text-xs text-neutral-500 font-mono">

        {/* ── DESKTOP LAYOUT (md and above) ── */}
        <div className="hidden md:flex items-center justify-between px-0">
          {/* Left: copyright */}
          <div>
            <span className="text-xs text-neutral-500 tracking-wider font-mono">
              &copy; {new Date().getFullYear()} FOMY R. — {t("contact.footer.rights")}
            </span>
          </div>

          {/* Center: Nav links */}
          <div className="flex items-center gap-7 text-neutral-400 text-xs">
            <a href="#clients" className="hover:text-white transition-colors uppercase tracking-widest">{t("contact.footer.clients")}</a>
            <a href="#projects" className="hover:text-white transition-colors uppercase tracking-widest">{t("contact.footer.work")}</a>
            <a href="#about" className="hover:text-white transition-colors uppercase tracking-widest">{t("contact.footer.about")}</a>
          </div>

          {/* Right: Language Switcher */}
          <div className="flex items-center">
            {/* Footer Language Toggle — Interactive Sliding Pill */}
            <div
              ref={langContainerRef}
              className={`relative flex items-center rounded-full border transition-all duration-300 ease-out overflow-hidden text-[11px] font-mono h-8 ${
                isLangOpen
                  ? `w-[108px] ${isLight ? "bg-white/95 border-slate-300 shadow-md" : "bg-[#0c0e12]/95 border-white/20 shadow-lg"}`
                  : `w-[36px] ${isLight ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs" : "bg-white/[0.04] border-white/10 hover:border-white/20"}`
              }`}
            >
              <div
                className="flex items-center w-[108px] h-full transition-transform duration-300 ease-out"
                style={{
                  transform: isLangOpen ? "translateX(0px)" : `translateX(-${activeLangIndex * 36}px)`,
                }}
              >
                {languages.map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLangOpen) {
                          setIsLangOpen(true);
                        } else {
                          setLang(l.code);
                          setIsLangOpen(false);
                        }
                      }}
                      style={isSelected ? { backgroundColor: primaryColor } : undefined}
                      className={`w-[36px] h-full shrink-0 flex items-center justify-center transition-colors cursor-pointer select-none rounded-full ${
                        isSelected
                          ? "text-white font-bold shadow-xs"
                          : isLight
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          : "text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                      aria-label={`Switch to ${l.label}`}
                      title={!isLangOpen ? "Klik untuk ganti bahasa" : l.label}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT (below md) ── */}
        <div className="flex md:hidden flex-col items-center justify-center gap-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-300 text-xs">
            <a href="#clients" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.clients")}</a>
            <a href="#projects" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.work")}</a>
            <a href="#about" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.about")}</a>

            {/* Mobile Footer Language Toggle — Interactive Sliding Pill sejajar di samping About Me */}
            <div
              className={`relative inline-flex items-center rounded-full border transition-all duration-300 ease-out overflow-hidden text-[11px] font-mono h-7 ml-1 shrink-0 ${
                isLangOpen
                  ? `w-[108px] ${isLight ? "bg-white/95 border-slate-300 shadow-md" : "bg-[#0c0e12]/95 border-white/20 shadow-lg"}`
                  : `w-[36px] ${isLight ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs" : "bg-white/[0.04] border-white/10 hover:border-white/20"}`
              }`}
            >
              <div
                className="flex items-center w-[108px] h-full transition-transform duration-300 ease-out"
                style={{
                  transform: isLangOpen ? "translateX(0px)" : `translateX(-${activeLangIndex * 36}px)`,
                }}
              >
                {languages.map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLangOpen) {
                          setIsLangOpen(true);
                        } else {
                          setLang(l.code);
                          setIsLangOpen(false);
                        }
                      }}
                      style={isSelected ? { backgroundColor: primaryColor } : undefined}
                      className={`w-[36px] h-full shrink-0 flex items-center justify-center transition-colors cursor-pointer select-none rounded-full ${
                        isSelected
                          ? "text-white font-bold shadow-xs"
                          : isLight
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          : "text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                      aria-label={`Switch to ${l.label}`}
                      title={!isLangOpen ? "Klik untuk ganti bahasa" : l.label}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-500 tracking-wider font-mono">
            &copy; {new Date().getFullYear()} FOMY R. — {t("contact.footer.rights")}
          </div>
        </div>

      </div>
    </footer>
  );
}

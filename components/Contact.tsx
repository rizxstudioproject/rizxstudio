"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

export default function Contact() {
  const { t, lang, setLang } = useLang();
  const { socialContacts, primaryColor } = useMotionTheme();

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
            {/* Footer Language Toggle (EN, ID, MIN) */}
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] overflow-hidden text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setLang("en")}
                style={lang === "en" ? { backgroundColor: primaryColor } : undefined}
                className={`px-2.5 py-1 transition-all cursor-pointer ${
                  lang === "en"
                    ? "text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("id")}
                style={lang === "id" ? { backgroundColor: primaryColor } : undefined}
                className={`px-2.5 py-1 transition-all cursor-pointer ${
                  lang === "id"
                    ? "text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Indonesia"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang("min")}
                style={lang === "min" ? { backgroundColor: primaryColor } : undefined}
                className={`px-2.5 py-1 transition-all cursor-pointer ${
                  lang === "min"
                    ? "text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Minang"
              >
                MIN
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT (below md) ── */}
        <div className="flex md:hidden flex-col items-center justify-center gap-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-5 text-neutral-300 text-xs">
            <a href="#clients" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.clients")}</a>
            <a href="#projects" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.work")}</a>
            <a href="#about" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.about")}</a>
          </div>

          {/* Mobile Footer Language Toggle */}
          <div className="flex items-center text-xs text-neutral-300 font-mono py-1">
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setLang("en")}
                style={lang === "en" ? { backgroundColor: primaryColor } : undefined}
                className={`px-3 py-1 transition-all ${
                  lang === "en"
                    ? "text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("id")}
                style={lang === "id" ? { backgroundColor: primaryColor } : undefined}
                className={`px-3 py-1 transition-all ${
                  lang === "id"
                    ? "text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang("min")}
                style={lang === "min" ? { backgroundColor: primaryColor } : undefined}
                className={`px-3 py-1 transition-all ${
                  lang === "min"
                    ? "text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                MIN
              </button>
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

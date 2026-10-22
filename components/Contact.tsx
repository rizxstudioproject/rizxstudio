"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { HiArrowUpRight } from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";

export default function Contact() {
  const { t, lang, setLang } = useLang();

  return (
    <footer id="contact" className="relative pt-20 pb-16 px-4 sm:px-12 lg:px-24 max-w-7xl mx-auto">
      <SpotlightCard className="p-8 sm:p-14 lg:p-16 mb-16 sm:mb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-widest uppercase text-emerald-400 mb-4 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
              href="https://wa.me/6282381769146"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.2)] text-center"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>WHATSAPP</span>
            </a>
            <a
              href="https://www.instagram.com/rizxstudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white/[0.04] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all duration-300 text-center"
            >
              <FaInstagram className="w-4 h-4" />
              <span>INSTAGRAM</span>
            </a>
            <a
              href="https://www.linkedin.com/in/rizxstudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white/[0.04] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all duration-300 text-center"
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
          {/* Left: Logo + copyright */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:opacity-70 transition-opacity text-left w-fit"
              aria-label="Back to top"
            >
              <img
                src="/logo-public.png"
                alt="Rizx Studio Logo"
                className="h-7 w-auto object-contain"
              />
            </button>
            <span className="text-[10px] text-neutral-600 tracking-wider">
              &copy; {new Date().getFullYear()} FOMY R. — {t("contact.footer.rights")}
            </span>
          </div>

          {/* Center: Nav links */}
          <div className="flex items-center gap-7 text-neutral-400 text-xs">
            <a href="#clients" className="hover:text-white transition-colors uppercase tracking-widest">{t("contact.footer.clients")}</a>
            <a href="#projects" className="hover:text-white transition-colors uppercase tracking-widest">{t("contact.footer.work")}</a>
            <a href="#about" className="hover:text-white transition-colors uppercase tracking-widest">{t("contact.footer.about")}</a>
            <a
              href="https://wa.me/6282381769146"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#14AF9E] text-neutral-300 transition-colors uppercase tracking-widest flex items-center gap-1 font-semibold"
            >
              <span>{t("contact.footer.contact")}</span>
              <span className="text-[10px] text-[#14AF9E]">↗</span>
            </a>
          </div>

          {/* Right: Language Switcher + Social icons */}
          <div className="flex items-center gap-4">
            {/* Footer Language Toggle */}
            <div className="flex items-center">
              <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] overflow-hidden text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2.5 py-1 transition-all cursor-pointer ${
                    lang === "en"
                      ? "bg-[#14AF9E] text-white font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("id")}
                  className={`px-2.5 py-1 transition-all cursor-pointer ${
                    lang === "id"
                      ? "bg-[#14AF9E] text-white font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  aria-label="Indonesia"
                >
                  ID
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-400 border-l border-white/10 pl-3">
              <a
                href="https://www.instagram.com/rizxstudio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="p-2 rounded-full hover:text-white hover:bg-white/5 transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/rizxstudio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="p-2 rounded-full hover:text-white hover:bg-white/5 transition-colors"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT (below md) ── */}
        <div className="flex md:hidden flex-col items-center justify-center gap-5 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hover:opacity-80 transition-opacity flex items-center justify-center"
            aria-label="Back to top"
          >
            <img
              src="/logo-public.png"
              alt="Rizx Studio Logo"
              className="h-8 w-auto object-contain"
            />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-5 text-neutral-300 text-xs">
            <a href="#clients" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.clients")}</a>
            <a href="#projects" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.work")}</a>
            <a href="#about" className="hover:text-white transition-colors uppercase tracking-wider">{t("contact.footer.about")}</a>
            <a
              href="https://wa.me/6282381769146"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#14AF9E] text-white transition-colors uppercase font-semibold tracking-wider"
            >
              {t("contact.footer.contact")} ↗
            </a>
          </div>

          {/* Mobile Footer Language Toggle */}
          <div className="flex items-center text-xs text-neutral-300 font-mono py-1">
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 transition-all ${
                  lang === "en"
                    ? "bg-[#14AF9E] text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`px-3 py-1 transition-all ${
                  lang === "id"
                    ? "bg-[#14AF9E] text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                ID
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <a
              href="https://www.instagram.com/rizxstudio/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="p-2 rounded-full hover:text-white hover:bg-white/5 transition-colors"
            >
              <FaInstagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/rizxstudio/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="p-2 rounded-full hover:text-white hover:bg-white/5 transition-colors"
            >
              <FaLinkedinIn className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs text-neutral-500 tracking-wider">
            &copy; {new Date().getFullYear()} FOMY R. — {t("contact.footer.rights")}
          </div>
        </div>

      </div>
    </footer>
  );
}

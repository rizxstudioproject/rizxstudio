"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { HiBars3, HiXMark, HiArrowUp } from "react-icons/hi2";
import { RiSunFill, RiMoonFill } from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { normalizeSocialUrl, formatWhatsAppUrl } from "@/lib/socialService";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isProductsPage = pathname === "/products";
  const isTrackingPage = pathname === "/tracking";
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgressPercent, setScrollProgressPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { lang, setLang, t } = useLang();
  const { themeMode, toggleThemeMode, socialContacts, primaryColor } = useMotionTheme();
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

  const waUrl = formatWhatsAppUrl(socialContacts.whatsappNumber, socialContacts.whatsappMessage);
  const instagramUrl = normalizeSocialUrl(socialContacts.instagramUrl, "instagram") || "https://www.instagram.com/rizxstudio/";
  const linkedinUrl = normalizeSocialUrl(socialContacts.linkedinUrl, "linkedin") || "https://www.linkedin.com/in/rizxstudio/";

  const resetHideTimer = useCallback(() => {
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2800);
  }, []);

  useEffect(() => {
    resetHideTimer();

    const handleUserActivity = () => {
      resetHideTimer();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 90) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [resetHideTimer]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(scrollY > 40);

      // Dynamic scroll progress calculation across the entire page
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgressPercent(Math.min(100, Math.max(0, (scrollY / docHeight) * 100)));
      }

      // Section order: clients -> about -> projects -> contact
      const sections = ["clients", "about", "projects", "contact"];
      const scrollPos = scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            return;
          }
        }
      }

      if (scrollY < 400) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const shouldShow = isVisible || isHovered || mobileMenuOpen;

  return (
    <>
      {/* Top Edge Hover/Touch Sensor to show navbar when cursor/touch is near top */}
      <div
        className="fixed top-0 left-0 right-0 h-5 z-[49] pointer-events-auto"
        onMouseEnter={() => {
          setIsVisible(true);
          resetHideTimer();
        }}
        onTouchStart={() => {
          setIsVisible(true);
          resetHideTimer();
        }}
      />

      {/* Top Scroll Speed / Progress Line Indicator */}
      <div
        className="navbar-progress-bar fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-[#16b09f] to-white z-[60] pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(22,176,159,0.8)]"
        style={{ width: `${scrollProgressPercent}%` }}
      />

      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          resetHideTimer();
        }}
        onTouchStart={() => {
          setIsVisible(true);
          resetHideTimer();
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          shouldShow
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          scrolled || mobileMenuOpen
            ? "bg-black/90 backdrop-blur-xl border-b border-white/10 py-3 px-4 sm:px-12"
            : "bg-transparent py-4 sm:py-5 px-4 sm:px-12"
        }`}
      >
        <nav
          className="w-full max-w-7xl mx-auto flex items-center justify-between"
          aria-label="Main Navigation"
        >
          {/* Left: Brand Logo */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (pathname !== "/") {
                router.push("/");
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Back to top"
          >
            <img
              src="/navbar-logo.png"
              alt="Rizx Studio Logo"
              className={`h-8 sm:h-9 w-auto object-contain ${isLight ? "" : "brightness-0 invert"}`}
            />
          </button>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium tracking-wide">
            <button
              onClick={() => scrollTo("clients")}
              className={`transition-colors duration-200 ${
                activeSection === "clients"
                  ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t("nav.clients")}
            </button>
            <button
              onClick={() => scrollTo("about")}
              className={`transition-colors duration-200 ${
                activeSection === "about"
                  ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t("nav.about")}
            </button>
            <button
              onClick={() => scrollTo("projects")}
              className={`transition-colors duration-200 cursor-pointer ${
                activeSection === "projects" && !isProductsPage
                  ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t("nav.work")}
            </button>
            <Link
              href="/products"
              className={`transition-colors duration-200 cursor-pointer ${
                isProductsPage
                  ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t("nav.products")}
            </Link>
            <Link
              href="/tracking"
              className={`transition-colors duration-200 cursor-pointer ${
                isTrackingPage
                  ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t("nav.tracking")}
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>{t("nav.contact")}</span>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: primaryColor }}
              />
            </a>
          </div>

          {/* Right: Theme Toggle + Language Switcher + Social Links (Desktop) & Hamburger Button (Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleThemeMode}
              aria-label="Toggle Dark and Light Mode"
              title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              {themeMode === "dark" ? (
                <RiSunFill className="w-4 h-4 text-amber-300" />
              ) : (
                <RiMoonFill className="w-4 h-4 text-[#16b09f]" />
              )}
            </button>

            {/* Language Toggle — Interactive Sliding Pill (1 compact pill -> slides open on click) */}
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

            {/* Desktop Socials - Icon only */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white transition-all"
              >
                <FaInstagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white transition-all"
              >
                <FaLinkedinIn className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobile Hamburger Toggle Button - Bare icon without circle frame */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className={`md:hidden p-2 transition-opacity shrink-0 cursor-pointer focus:outline-none ${
                isLight ? "text-slate-900 hover:text-slate-700" : "text-white hover:text-neutral-300"
              }`}
            >
              {mobileMenuOpen ? (
                <svg className={`w-6 h-6 ${isLight ? "text-slate-900" : "text-white"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg className={`w-6 h-6 ${isLight ? "text-slate-900" : "text-white"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="7" x2="20" y2="7"></line>
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="17" x2="20" y2="17"></line>
                </svg>
              )}
            </button>
          </div>
        </nav>

      {/* Mobile Drawer Menu Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[360px] opacity-100 pt-4 pb-2" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className={`flex flex-col gap-3.5 border-t pt-4 px-2 ${isLight ? "border-slate-200" : "border-white/10"}`}>
          <button
            onClick={() => scrollTo("clients")}
            className={`text-left py-1 text-sm font-medium transition-colors ${
              isLight ? "text-slate-800 hover:text-slate-950 font-semibold" : "text-neutral-300 hover:text-white"
            }`}
          >
            {t("nav.clients")}
          </button>
          <button
            onClick={() => scrollTo("about")}
            className={`text-left py-1 text-sm font-medium transition-colors ${
              isLight ? "text-slate-800 hover:text-slate-950 font-semibold" : "text-neutral-300 hover:text-white"
            }`}
          >
            {t("nav.about")}
          </button>
          <button
            onClick={() => scrollTo("projects")}
            className={`text-left py-1 text-sm font-medium transition-colors cursor-pointer ${
              activeSection === "projects" && !isProductsPage
                ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                : isLight ? "text-slate-800 hover:text-slate-950 font-semibold" : "text-neutral-300 hover:text-white"
            }`}
          >
            {t("nav.work")}
          </button>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-1 text-sm font-medium transition-colors cursor-pointer ${
              isProductsPage
                ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                : isLight ? "text-slate-800 hover:text-slate-950 font-semibold" : "text-neutral-300 hover:text-white"
            }`}
          >
            {t("nav.products")}
          </Link>
          <Link
            href="/tracking"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-left py-1 text-sm font-medium transition-colors cursor-pointer ${
              isTrackingPage
                ? isLight ? "text-slate-900 font-bold" : "text-white font-bold"
                : isLight ? "text-slate-800 hover:text-slate-950 font-semibold" : "text-neutral-300 hover:text-white"
            }`}
          >
            {t("nav.tracking")}
          </Link>

          {/* Contact Direct WhatsApp Link in Mobile Drawer */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border text-white font-medium text-sm transition-all mt-1"
            style={{
              backgroundColor: `${primaryColor}20`,
              borderColor: `${primaryColor}40`,
            }}
          >
            <span className="flex items-center gap-2">
              <FaWhatsapp className="w-4 h-4" style={{ color: primaryColor }} />
              <span>{t("nav.contact")} (WhatsApp)</span>
            </span>
            <span
              className="text-[11px] font-mono font-semibold"
              style={{ color: primaryColor }}
            >
              {t("nav.direct")}
            </span>
          </a>

          {/* Mobile Social Links in Drawer */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 text-xs"
            >
              <FaInstagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 text-xs"
            >
              <FaLinkedinIn className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Floating Back-to-Top Button (Matches reference Image 5 bottom-right) */}
    {scrolled && (
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll back to top"
        className="scroll-to-top-btn md:hidden fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-neutral-900/90 border border-white/20 text-white flex items-center justify-center shadow-2xl backdrop-blur-md active:scale-90 transition-all hover:border-[#00A389]/60"
      >
        <HiArrowUp className="w-5 h-5 text-white" />
      </button>
    )}
  </>
  );
}

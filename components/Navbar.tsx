"use client";

import React, { useState, useEffect } from "react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { HiBars3, HiXMark, HiArrowUp } from "react-icons/hi2";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgressPercent, setScrollProgressPercent] = useState(0);

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
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Top Scroll Speed / Progress Line Indicator */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-[#00A389] to-white z-[60] pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(0,163,137,0.8)]"
        style={{ width: `${scrollProgressPercent}%` }}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-lg sm:text-xl font-black tracking-widest text-white uppercase flex items-center hover:opacity-80 transition-opacity"
          >
            <span>FOMY</span>
            <span className="text-neutral-500">.</span>
          </button>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium tracking-wide">
            <button
              onClick={() => scrollTo("clients")}
              className={`transition-colors duration-200 hover:text-white ${
                activeSection === "clients" ? "text-white" : "text-neutral-400"
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => scrollTo("about")}
              className={`transition-colors duration-200 hover:text-white ${
                activeSection === "about" ? "text-white" : "text-neutral-400"
              }`}
            >
              About Me
            </button>
            <button
              onClick={() => scrollTo("projects")}
              className={`transition-colors duration-200 hover:text-white ${
                activeSection === "projects" ? "text-white" : "text-neutral-400"
              }`}
            >
              Work
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className={`transition-colors duration-200 hover:text-white ${
                activeSection === "contact" ? "text-white" : "text-neutral-400"
              }`}
            >
              Contact
            </button>
          </div>

          {/* Right: Social Links (Desktop) & Hamburger Button (Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Socials */}
            <div className="hidden md:flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/rizxstudio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white text-xs transition-all"
              >
                <FaInstagram className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">Instagram</span>
              </a>
              <a
                href="https://www.linkedin.com/in/rizxstudio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white text-xs transition-all"
              >
                <FaLinkedinIn className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">LinkedIn</span>
              </a>
            </div>

            {/* Mobile Hamburger Toggle Button - Bold & 100% Guaranteed Visible */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/30 text-white shadow-2xl backdrop-blur-md active:scale-90 transition-all shrink-0 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="flex flex-col gap-3.5 border-t border-white/10 pt-4 px-2">
          <button
            onClick={() => scrollTo("clients")}
            className="text-left py-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Clients
          </button>
          <button
            onClick={() => scrollTo("about")}
            className="text-left py-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            About Me
          </button>
          <button
            onClick={() => scrollTo("projects")}
            className="text-left py-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Work
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="text-left py-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Contact
          </button>

          {/* Mobile Social Links in Drawer */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <a
              href="https://www.instagram.com/rizxstudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 text-xs"
            >
              <FaInstagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.linkedin.com/in/rizxstudio/"
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
        className="md:hidden fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-neutral-900/90 border border-white/20 text-white flex items-center justify-center shadow-2xl backdrop-blur-md active:scale-90 transition-all hover:border-[#00A389]/60"
      >
        <HiArrowUp className="w-5 h-5 text-white" />
      </button>
    )}
  </>
  );
}

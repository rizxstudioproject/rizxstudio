"use client";

import React, { useState, useEffect } from "react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { HiBars3, HiXMark } from "react-icons/hi2";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ["clients", "projects", "about", "contact"];
      const scrollPos = window.scrollY + 200;

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

      if (window.scrollY < 400) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? "bg-black/85 backdrop-blur-xl border-b border-white/5 py-3 px-4 sm:px-12"
          : "bg-transparent py-4 sm:py-5 px-4 sm:px-12"
      }`}
    >
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between"
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
            onClick={() => scrollTo("projects")}
            className={`transition-colors duration-200 hover:text-white ${
              activeSection === "projects" ? "text-white" : "text-neutral-400"
            }`}
          >
            Work
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
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white text-xs transition-all"
            >
              <FaInstagram className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">Instagram</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white text-xs transition-all"
            >
              <FaLinkedinIn className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">LinkedIn</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="md:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            {mobileMenuOpen ? (
              <HiXMark className="w-5 h-5 text-neutral-200" />
            ) : (
              <HiBars3 className="w-5 h-5 text-neutral-200" />
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
            onClick={() => scrollTo("projects")}
            className="text-left py-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Work
          </button>
          <button
            onClick={() => scrollTo("about")}
            className="text-left py-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            About Me
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
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 text-xs"
            >
              <FaInstagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
            <a
              href="https://linkedin.com"
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
  );
}

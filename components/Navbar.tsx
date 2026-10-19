"use client";

import React, { useState, useEffect } from "react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa6";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

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
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/5 py-3.5 px-6 sm:px-12"
          : "bg-transparent py-5 px-6 sm:px-12"
      }`}
    >
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between"
        aria-label="Main Navigation"
      >
        {/* Left: Brand Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-lg sm:text-xl font-black tracking-widest text-white uppercase flex items-center hover:opacity-80 transition-opacity"
        >
          <span>FOMY</span>
          <span className="text-neutral-500">.</span>
        </button>

        {/* Center: Navigation Links */}
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

        {/* Right: Instagram & LinkedIn links (No download resume button) */}
        <div className="flex items-center gap-4 text-neutral-300">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Profile"
            className="p-2 rounded-full transition-colors hover:text-white hover:bg-white/5"
          >
            <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="p-2 rounded-full transition-colors hover:text-white hover:bg-white/5"
          >
            <FaLinkedinIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        </div>
      </nav>
    </header>
  );
}

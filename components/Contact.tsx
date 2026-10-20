"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { HiArrowUpRight } from "react-icons/hi2";

export default function Contact() {
  return (
    <footer id="contact" className="relative pt-20 pb-16 px-4 sm:px-12 lg:px-24 max-w-7xl mx-auto">
      <SpotlightCard className="p-8 sm:p-14 lg:p-16 mb-16 sm:mb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-widest uppercase text-emerald-400 mb-4 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Open to Creative Opportunities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4 sm:mb-6 leading-tight">
              Let&apos;s create something <br className="hidden sm:inline" />
              <span className="text-neutral-400 font-light italic">meaningful</span> together.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
              Have a project in mind? Let&apos;s connect and explore how design, motion, and AI-driven visuals can bring your ideas to life.
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

      {/* Footer Bottom Bar matching reference screenshot */}
      <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center gap-6 text-xs text-neutral-500 font-mono text-center">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-lg sm:text-xl font-black tracking-widest text-white uppercase hover:opacity-80 transition-opacity"
        >
          <span>FOMY</span>
          <span className="text-neutral-500">.</span>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-neutral-400 text-[11px] sm:text-xs">
          <a href="#clients" className="hover:text-white transition-colors uppercase">Clients</a>
          <a href="#projects" className="hover:text-white transition-colors uppercase">Work</a>
          <a href="#about" className="hover:text-white transition-colors uppercase">About Me</a>
          <a href="#contact" className="hover:text-white transition-colors uppercase">Contact</a>
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

        <div className="text-[10px] sm:text-xs text-neutral-600 tracking-wider">
          &copy; {new Date().getFullYear()} FOMY R. — ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}

"use client";

import React from "react";
import SpotlightCard from "./SpotlightCard";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { HiArrowUpRight, HiOutlineEnvelope } from "react-icons/hi2";

export default function Contact() {
  return (
    <footer id="contact" className="relative pt-24 pb-20 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
      <SpotlightCard className="p-10 sm:p-16 mb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-emerald-400 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for select commissions &amp; creative direction</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight mb-6 leading-tight">
              Let&apos;s build something <br className="hidden sm:inline" />
              <span className="text-neutral-500 font-extralight italic">extraordinary</span> together.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
              Whether you are launching an AI-powered advertising campaign, establishing a flagship brand identity,
              or engineering cinematic video and UI/UX—let&apos;s collaborate to realize your creative ambitions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <a
              href="mailto:contact@fomyr.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <HiOutlineEnvelope className="w-4 h-4" />
              <span>Get in Touch</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/[0.03] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all duration-300"
            >
              <FaInstagram className="w-4 h-4" />
              <span>Instagram</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/[0.03] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all duration-300"
            >
              <FaLinkedinIn className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </SpotlightCard>

      {/* Footer Bottom Bar */}
      <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-mono">
        <div className="flex items-center gap-3">
          <span>&copy; {new Date().getFullYear()} FOMY R.</span>
          <span>ALL RIGHTS RESERVED.</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            INSTAGRAM
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            LINKEDIN
          </a>
          <a
            href="#hero-scrolly"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>BACK TO TOP</span>
            <HiArrowUpRight className="w-3 h-3 -rotate-45" />
          </a>
        </div>
      </div>
    </footer>
  );
}

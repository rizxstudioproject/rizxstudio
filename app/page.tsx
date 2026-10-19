import React from "react";
import Navbar from "@/components/Navbar";
import ScrollyCanvas from "@/components/ScrollyCanvas";
import ClientLogos from "@/components/ClientLogos";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-neutral-300 selection:bg-white/20 selection:text-white">
      {/* Floating Header Navigation */}
      <Navbar />

      {/* 500vh Antigravity Scroller Engine with Sticky Canvas & Parallax Sweeps */}
      <ScrollyCanvas />

      {/* Standard Portfolio Sections below the 500vh sequence */}
      <main className="relative z-20 bg-[#0a0a0a]">
        {/* Subtle radial ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/[0.03] blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-purple-500/[0.02] blur-[150px] pointer-events-none rounded-full" />

        {/* 1. Running Client Logos */}
        <ClientLogos />

        {/* 2. Work / Selected Works */}
        <Projects />

        {/* 3. About Me / WHO AM I */}
        <About />

        {/* 4. Contact Footer */}
        <Contact />
      </main>
    </div>
  );
}

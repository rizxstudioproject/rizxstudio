"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import ScrollyCanvas from "@/components/ScrollyCanvas";
import ClientLogos from "@/components/ClientLogos";
import About from "@/components/About";
import CreativeJourney from "@/components/CreativeJourney";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import PortfolioRunner from "@/components/PortfolioRunner";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLogin from "@/components/AdminLogin";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { HiCog6Tooth } from "react-icons/hi2";

export default function Home() {
  const {
    isAdminMode,
    toggleAdminMode,
    setIsAdminMode,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    adminLogout,
  } = usePortfolioData();

  const [showAdminTrigger, setShowAdminTrigger] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setShowAdminTrigger(params.get("login") === "secret");
    }
  }, []);

  // Dynamic Browser Tab Logo (Favicon) & Title for Public vs Admin
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const updateFavicon = (url: string) => {
      const existingIcons = document.querySelectorAll(
        "link[rel*='icon'], link[rel='apple-touch-icon']"
      );
      if (existingIcons.length > 0) {
        existingIcons.forEach((el) => {
          (el as HTMLLinkElement).href = url;
        });
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = url;
        document.head.appendChild(link);
      }
    };

    if (isAdminMode) {
      document.title = "Rizx Studio — Admin Dashboard";
      updateFavicon("/logo-admin.png");
    } else {
      document.title = "Rizxstudio — Professional Creative, Motion & UI/UX Design Studio";
      updateFavicon("/logo-public.png");
    }
  }, [isAdminMode]);

  // Admin mode requested but not authenticated → show login page
  if (isAdminMode && !isAdminAuthenticated) {
    return (
      <AdminLogin
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          // isAdminMode stays true so we transition to dashboard
        }}
        onBack={() => {
          setIsAdminMode(false);
        }}
      />
    );
  }

  // Admin authenticated and in admin mode → show dashboard
  if (isAdminMode && isAdminAuthenticated) {
    return (
      <AdminDashboard
        onClose={() => {
          setIsAdminMode(false);
        }}
      />
    );
  }

  // Default: Public Portfolio View
  return (
    <div className="relative min-h-screen max-w-full overflow-x-clip bg-[#0a0a0a] text-neutral-300 selection:bg-white/20 selection:text-white">
      {/* Floating Header Navigation */}
      <Navbar />

      {/* 500vh Antigravity Scroller Engine with Sticky Canvas & Parallax Sweeps */}
      <ScrollyCanvas />

      {/* Standard Portfolio Sections below the 500vh sequence */}
      <main className="relative z-20 bg-[#0a0a0a] max-w-full overflow-x-clip">
        {/* Subtle radial ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-indigo-500/[0.03] blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-0 w-full max-w-[500px] h-[500px] bg-purple-500/[0.02] blur-[150px] pointer-events-none rounded-full" />

        {/* 1. Running Client Logos */}
        <ClientLogos />

        {/* 2. About Me / WHO AM I */}
        <About />

        {/* 3. Creative Journey Flagship Showcase */}
        <CreativeJourney />

        {/* 4. Work / Selected Works */}
        <Projects />

        {/* 4. Portfolio Runner — marquee above footer */}
        <PortfolioRunner />

        {/* 5. Contact Footer */}
        <Contact />
      </main>

      {/* Floating Admin Dashboard Trigger — only visible on localhost or if ?login=secret */}
      {showAdminTrigger && (
        <button
          type="button"
          onClick={toggleAdminMode}
          title="Buka Admin Dashboard Rizx Studio"
          aria-label="Open Admin Dashboard"
          className="fixed bottom-6 right-6 z-[80] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl text-xs font-mono transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#14AF9E] animate-pulse" />
          <span className="font-semibold tracking-wide">Admin</span>
          <HiCog6Tooth className="w-4 h-4 text-neutral-400 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      )}

      {/* WhatsApp Popup — shows after 3.5s on first visit */}
      <WhatsAppPopup />
    </div>
  );
}

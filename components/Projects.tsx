"use client";

import React, { useState, useRef, useEffect } from "react";
import { antigravityData } from "@/data/projectsData";
import { HiXMark, HiArrowUpRight } from "react-icons/hi2";

interface WorkItem {
  id: string;
  title: string;
  type: string;
  image: string;
  aspect: string;
}

export default function Projects() {
  const { stage1, stage2, stage3, stage4 } = antigravityData;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>(stage4.clients[0].id);

  // Modal Lightbox state
  const [activeModalWork, setActiveModalWork] = useState<{
    work: WorkItem;
    clientName: string;
  } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track scroll progress through this pinned container
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = rect.height - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalWork(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scrollToClientStage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const stageTop = rect.top + scrollTop;
    const totalHeight = rect.height - window.innerHeight;
    // Scroll directly to 0.88 progress where Client Folders are fully visible and centered
    const targetY = stageTop + totalHeight * 0.88;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const activeClientData = stage4.clients.find((c) => c.id === selectedClient) || stage4.clients[0];

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full h-[400vh] sm:h-[450vh] md:h-[500vh] bg-[#0a0a0a] text-white"
    >
      {/* Sticky Fullscreen Viewport Canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden select-none px-3 sm:px-6 md:px-8">
        
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[800px] h-[60vh] bg-gradient-to-r from-orange-500/[0.03] via-cyan-500/[0.03] to-purple-500/[0.03] blur-[140px] pointer-events-none rounded-full" />

        {/* ========================================================
            STAGE 1: 1 Card -> Fans out to 5 Cards + Badges
            (Active: 0.00 -> 0.28)
           ======================================================== */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-between py-16 sm:py-20 md:py-16 px-4 transition-all duration-700 ease-out"
          style={{
            opacity: scrollProgress < 0.25 ? 1 : Math.max(0, 1 - (scrollProgress - 0.25) / 0.05),
            transform: `translate3d(0, ${scrollProgress < 0.25 ? 0 : -(scrollProgress - 0.25) * 350}px, 0)`,
            pointerEvents: scrollProgress <= 0.28 ? "auto" : "none",
            visibility: scrollProgress > 0.3 ? "hidden" : "visible",
          }}
        >
          {/* Header */}
          <div className="relative z-30 flex flex-col items-center text-center mt-2 max-w-3xl px-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500 mb-2">
              {stage1.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              {stage1.headline}
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-neutral-400 font-light mt-2 max-w-md mx-auto leading-relaxed">
              {stage1.subheadline}
            </p>
          </div>

          {/* Cards Stage: Starts at center, fans out smoothly */}
          <div className="relative w-full max-w-5xl h-[260px] sm:h-[320px] md:h-[380px] flex items-center justify-center my-auto">
            {/* Floating Badges */}
            {stage1.floatingBadges.length > 0 && stage1.floatingBadges.map((badge: { id: number; text: string; color: string; top?: string; left?: string; right?: string }, bIdx: number) => {
              const badgeOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.1));
              return (
                <div
                  key={badge.id}
                  className="absolute z-40 transition-all duration-500"
                  style={{
                    top: isMobile ? (bIdx === 1 ? "2%" : "8%") : badge.top,
                    left: isMobile ? (bIdx === 0 ? "4%" : bIdx === 1 ? "40%" : "auto") : badge.left,
                    right: isMobile ? (bIdx === 2 ? "4%" : "auto") : badge.right,
                    opacity: badgeOpacity,
                    transform: `scale(${isMobile ? 0.85 : 1})`,
                  }}
                >
                  <div
                    className={`relative px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg border backdrop-blur-md ${badge.color}`}
                  >
                    <span>{badge.text}</span>
                    <div className="absolute -bottom-1 left-3 w-1.5 h-1.5 rotate-45 bg-inherit border-r border-b border-inherit" />
                  </div>
                </div>
              );
            })}

            {/* 5 Cards Fan-out with Mobile Safe Scaling */}
            {stage1.deckCards.map((card, i) => {
              const N = stage1.deckCards.length;
              const centerIndex = Math.floor(N / 2);
              const distFromCenter = i - centerIndex;
              
              const fanProgress = Math.max(0, Math.min(1, (scrollProgress - 0.03) / 0.18));
              
              const spreadMultiplier = isMobile ? 55 : 135;
              const rotateMultiplier = isMobile ? 4.5 : 7;
              const yMultiplier = isMobile ? 8 : 16;

              const targetX = distFromCenter * spreadMultiplier;
              const targetRotate = distFromCenter * rotateMultiplier;
              const targetY = Math.abs(distFromCenter) * yMultiplier;

              const currentX = targetX * fanProgress;
              const currentRotate = targetRotate * fanProgress;
              const currentY = targetY * fanProgress;

              const isHovered = hoveredCard === card.id;

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() =>
                    setActiveModalWork({
                      work: {
                        id: card.id,
                        title: card.title,
                        type: card.category,
                        image: card.image,
                        aspect: "1:1",
                      },
                      clientName: card.category,
                    })
                  }
                  className="absolute w-36 sm:w-48 md:w-60 aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-neutral-900/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer transition-transform duration-300 ease-out"
                  style={{
                    zIndex: isHovered ? 50 : 10 + i,
                    transform: `translate3d(${currentX}px, ${
                      currentY + (isHovered ? -16 : 0)
                    }px, 0) rotate(${isHovered ? 0 : currentRotate}deg) scale(${
                      isHovered ? 1.05 : 1
                    })`,
                  }}
                >
                  <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-950 flex flex-col justify-between p-2.5 sm:p-3.5 border border-white/5">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-neutral-300 border border-white/10 truncate max-w-[80px]">
                        {card.category}
                      </span>
                      <span className="w-4 h-4 rounded-full bg-black/50 text-[9px] flex items-center justify-center text-white">
                        ↗
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">{card.title}</h3>
                      <p className="text-[9px] text-neutral-400 font-mono">{card.category}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-30 text-[10px] sm:text-xs text-neutral-500 font-mono flex items-center gap-1.5 mb-2">
            <span>Scroll down</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>

        {/* ========================================================
            STAGE 2: Left Headline & Text + Right Dense Overlapping Cards
            (Active: 0.28 -> 0.52)
           ======================================================== */}
        <div
          className="absolute inset-0 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 sm:gap-10 px-4 sm:px-10 my-auto transition-all duration-700 ease-out"
          style={{
            opacity:
              scrollProgress < 0.28
                ? 0
                : scrollProgress > 0.5
                ? Math.max(0, 1 - (scrollProgress - 0.5) / 0.05)
                : Math.min(1, (scrollProgress - 0.28) / 0.05),
            transform: `translate3d(0, ${
              scrollProgress < 0.28
                ? 50
                : scrollProgress > 0.5
                ? -(scrollProgress - 0.5) * 300
                : 0
            }px, 0)`,
            pointerEvents: scrollProgress >= 0.28 && scrollProgress <= 0.52 ? "auto" : "none",
            visibility: scrollProgress < 0.25 || scrollProgress > 0.55 ? "hidden" : "visible",
          }}
        >
          {/* Text Block */}
          <div className="max-w-lg text-center lg:text-left pt-10 lg:pt-0">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#00A389] mb-3 block font-semibold">
              {stage2.categoryTag}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              {stage2.headline}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
              {stage2.description}
            </p>

            {/* Project Frame Labels / Skills: 5 Compact Tags */}
            {stage2.skillLabels && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {stage2.skillLabels.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-200 hover:border-[#00A389]/40 hover:text-white transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Single Primary CTA Button -> Scrolls directly to Client Productions stage */}
            <div className="flex items-center justify-center lg:justify-start">
              <button
                onClick={scrollToClientStage}
                className="px-7 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>{stage2.primaryButtonText || "Explore My Work"}</span>
                <HiArrowUpRight className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>

          {/* Overlapping Dense Deck with Badges */}
          <div className="relative w-full max-w-sm sm:max-w-md h-[220px] sm:h-[300px] md:h-[360px] flex items-center justify-center">
            {/* Badges */}
            <div className="absolute top-0 left-4 z-40 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#9A2D23] text-white border border-red-700 shadow-md">
              @howard
            </div>
            <div className="absolute top-4 right-4 z-40 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-neutral-800 text-white border border-neutral-700 shadow-md">
              @robin
            </div>

            {/* Overlapping Dense Cards */}
            {stage2.overlappingCards.map((card, idx) => {
              const offsetMultiplier = isMobile ? 32 : 55;
              const xPos = (idx - 1.5) * offsetMultiplier;

              return (
                <div
                  key={card.id}
                  onClick={() =>
                    setActiveModalWork({
                      work: {
                        id: card.id,
                        title: card.title,
                        type: "AI & Motion Visual",
                        image: card.image,
                        aspect: "1:1",
                      },
                      clientName: "Design & Motion Archive",
                    })
                  }
                  className="absolute w-36 sm:w-48 md:w-56 aspect-square rounded-2xl p-2.5 bg-neutral-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-3 cursor-pointer"
                  style={{
                    zIndex: 10 + idx,
                    transform: `translate3d(${xPos}px, ${idx * 4}px, 0) rotate(${card.rotate}deg)`,
                  }}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden bg-neutral-950 relative border border-white/5">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] sm:text-xs font-bold text-white truncate">
                      {card.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            STAGE 3: Full Wide Hero Showcase ("Gateway to artist people.")
            (Active: 0.52 -> 0.74)
           ======================================================== */}
        <div
          className="absolute inset-0 max-w-4xl mx-auto flex flex-col justify-center px-4 sm:px-8 my-auto transition-all duration-700 ease-out"
          style={{
            opacity:
              scrollProgress < 0.52
                ? 0
                : scrollProgress > 0.72
                ? Math.max(0, 1 - (scrollProgress - 0.72) / 0.05)
                : Math.min(1, (scrollProgress - 0.52) / 0.05),
            transform: `translate3d(0, ${
              scrollProgress < 0.52
                ? 50
                : scrollProgress > 0.72
                ? -(scrollProgress - 0.72) * 300
                : 0
            }px, 0)`,
            pointerEvents: scrollProgress >= 0.52 && scrollProgress <= 0.74 ? "auto" : "none",
            visibility: scrollProgress < 0.49 || scrollProgress > 0.76 ? "hidden" : "visible",
          }}
        >
          <div className="mb-4 sm:mb-6 text-center sm:text-left">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500 block mb-1">
              {stage3.classTag}
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              {stage3.headline}
            </h2>
          </div>

          {/* Large Aspect Card */}
          <div
            onClick={() =>
              setActiveModalWork({
                work: {
                  id: "hero-showcase",
                  title: stage3.heroCard.title,
                  type: stage3.heroCard.category,
                  image: stage3.heroCard.image,
                  aspect: "16:9",
                },
                clientName: "Flagship Showcase",
              })
            }
            className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 group cursor-pointer"
          >
            <img
              src={stage3.heroCard.image}
              alt={stage3.heroCard.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 flex flex-col">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400 mb-0.5">
                {stage3.heroCard.category}
              </span>
              <h3 className="text-sm sm:text-xl font-bold text-white">
                {stage3.heroCard.title}
              </h3>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8">
              <span className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-[11px] sm:text-xs flex items-center gap-1.5">
                <span>View Full</span>
                <HiArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            STAGE 4: Interactive Client Folders Showcase
            (Folders per client + karya di dalamnya)
            (Active: 0.74 -> 1.00)
           ======================================================== */}
        <div
          id="client-productions"
          className="absolute inset-0 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 sm:gap-10 px-4 sm:px-8 my-auto transition-all duration-700 ease-out"
          style={{
            opacity: scrollProgress < 0.74 ? 0 : Math.min(1, (scrollProgress - 0.74) / 0.05),
            transform: `translate3d(0, ${scrollProgress < 0.74 ? 50 : 0}px, 0)`,
            pointerEvents: scrollProgress >= 0.74 ? "auto" : "none",
            visibility: scrollProgress < 0.71 ? "hidden" : "visible",
          }}
        >
          {/* Left Text Block */}
          <div className="max-w-md text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] text-cyan-400 font-mono tracking-widest uppercase">PROFESSIONAL EXPERIENCE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3 leading-tight">
              {stage4.headline}
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-neutral-400 font-light leading-relaxed mb-4 line-clamp-3 sm:line-clamp-none">
              {stage4.description}
            </p>
            
            {/* Tool tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 sm:gap-2">
              {stage4.tools.map((tool, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-mono text-neutral-400">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Client Folder Interactive Vault */}
          <div className="w-full max-w-md sm:max-w-lg bg-neutral-900/95 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
            {/* Client Folder Pills Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-white/10">
              {stage4.clients.map((client) => {
                const isSelected = selectedClient === client.id;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap transition-all duration-300 ${
                      isSelected
                        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] font-bold scale-105"
                        : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
                    }`}
                  >
                    <span>📁</span>
                    <span>{client.clientName}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/10 text-neutral-800" : "bg-white/10 text-neutral-500"}`}>
                      {client.works.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Folder Header Info */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{activeClientData.clientName} Archive</span>
                </h4>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {activeClientData.category}
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                {activeClientData.works.length} deliverables
              </span>
            </div>

            {/* Client Works Grid within Active Folder -> CLICK TO POPUP MODAL */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1">
              {activeClientData.works.map((work) => (
                <div
                  key={work.id}
                  onClick={() =>
                    setActiveModalWork({
                      work,
                      clientName: activeClientData.clientName,
                    })
                  }
                  className="group relative rounded-xl overflow-hidden bg-neutral-950 border border-white/5 hover:border-cyan-400/50 transition-all cursor-pointer aspect-square hover:scale-[1.02]"
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* Aspect Badge */}
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-neutral-300 border border-white/10">
                    {work.aspect}
                  </div>

                  {/* Expand icon on hover */}
                  <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    ↗
                  </div>

                  {/* Work Title & Type */}
                  <div className="absolute bottom-2 left-2 right-2 z-10">
                    <h5 className="text-[11px] sm:text-xs font-bold text-white truncate drop-shadow-md">
                      {work.title}
                    </h5>
                    <p className="text-[9px] text-neutral-400 font-mono truncate">
                      {work.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          FULLSCREEN IMAGE LIGHTBOX MODAL POPUP
          (Opens when clicking any work/card)
         ======================================================== */}
      {activeModalWork && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-2xl animate-fade-in"
          onClick={() => setActiveModalWork(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveModalWork(null)}
            className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            aria-label="Close modal"
          >
            <HiXMark className="w-6 h-6" />
          </button>

          {/* Modal Container */}
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-neutral-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview Box */}
            <div className="relative w-full flex-1 max-h-[70vh] bg-black flex items-center justify-center p-2">
              <img
                src={activeModalWork.work.image}
                alt={activeModalWork.work.title}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </div>

            {/* Modal Footer Caption */}
            <div className="p-5 sm:p-6 bg-neutral-900 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400 block mb-1">
                  {activeModalWork.clientName} • {activeModalWork.work.aspect}
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white">
                  {activeModalWork.work.title}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {activeModalWork.work.type}
                </p>
              </div>

              <button
                onClick={() => setActiveModalWork(null)}
                className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

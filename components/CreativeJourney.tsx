"use client";

import React, { useState, useEffect } from "react";
import { HiArrowUpRight, HiXMark, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { usePortfolioData, extractYouTubeId, extractGoogleDriveId, Stage3HeroCard } from "@/context/PortfolioDataContext";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";

export default function CreativeJourney() {
  const { stage3 } = usePortfolioData();
  const { t, lang } = useLang();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";
  const isId = lang === "id";
  const isMin = lang === "min";
  const isLocalized = isId || isMin;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Multi-card list for Stage 3 Showreels
  const cards: Stage3HeroCard[] = (stage3?.cards && stage3.cards.length > 0)
    ? stage3.cards
    : (stage3?.heroCard ? [stage3.heroCard] : []);

  const safeIdx = Math.min(Math.max(0, activeCardIndex), Math.max(0, cards.length - 1));
  const currentCard = cards[safeIdx] || stage3?.heroCard;

  const displayTag = isLocalized
    ? t("projects.stage3.tag")
    : stage3?.classTag || t("projects.stage3.tag");

  const displayHeadline = isLocalized
    ? t("projects.stage3.headline")
    : stage3?.headline || t("projects.stage3.headline");

  const displayTitle = currentCard?.title || (
    isLocalized ? t("projects.stage3.card.title") : stage3?.heroCard?.title || t("projects.stage3.card.title")
  );

  const displayCategory = currentCard?.category || (
    isLocalized ? t("projects.stage3.card.category") : stage3?.heroCard?.category || t("projects.stage3.card.category")
  );

  const displayDescription = currentCard?.description || (
    isLocalized
      ? (isMin
        ? "Eksplorasi sinematik nan mangubuangakan labiah dari sapuluah taun karya visual, animasi motion 3D, sarato teknologi AI modern."
        : "Eksplorasi sinematik yang menghubungkan lebih dari satu dekade karya visual, desain animasi 3D, dan teknologi kecerdasan AI mutakhir.")
      : (stage3?.heroCard?.description ||
        "A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology — pushing the boundaries of creative digital experiences.")
  );

  const mediaType = currentCard?.mediaType || (
    currentCard?.gdriveId || currentCard?.gdriveUrl ? "gdrive" :
    (currentCard?.videoId || currentCard?.youtubeUrl ? "youtube" : "image")
  );

  const rawGdriveId = currentCard?.gdriveId || extractGoogleDriveId(currentCard?.gdriveUrl || "");
  const rawYoutubeId = currentCard?.videoId || extractYouTubeId(currentCard?.youtubeUrl || "");
  const isVideoOn = currentCard?.isVideoEnabled !== false;
  const youtubeId = (isVideoOn || (mediaType === "youtube" && !currentCard?.image)) ? rawYoutubeId : "";
  const gdriveId = (isVideoOn || (mediaType === "gdrive" && !currentCard?.image)) ? rawGdriveId : "";

  const isShowingYouTube = mediaType === "youtube" && Boolean(youtubeId);
  const isShowingGDrive = mediaType === "gdrive" && Boolean(gdriveId);
  const rawImage = currentCard?.image;
  const imageSrc = (rawImage && rawImage !== "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg") ? rawImage : "";

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="creative-journey" className="relative py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className={`text-xs font-mono uppercase tracking-[0.25em] block mb-2 font-semibold ${isLight ? "text-teal-700" : "text-[#16b09f]"}`}>
          {displayTag}
        </span>
        <h2 className={`text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {displayHeadline}
        </h2>
      </div>

      {/* Dossier / Folder Tabs Header (Berhimpitan & Overlapping) */}
      {cards.length > 0 && (
        <div className="relative px-3 sm:px-8 z-20">
          {/* Overlapping Folder Tabs */}
          <div className="relative flex items-end max-w-full overflow-x-auto scrollbar-none pt-2 z-10">
            {cards.map((c, idx) => {
              const isActive = idx === safeIdx;
              return (
                <button
                  key={c.id || idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardIndex(idx);
                  }}
                  className={`group relative h-9 sm:h-11 px-6 sm:px-9 text-xs sm:text-sm font-sans transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 select-none ${
                    idx > 0 ? "-ml-3 sm:-ml-5" : ""
                  } ${
                    isActive
                      ? "z-30 text-black font-extrabold"
                      : isLight
                      ? "z-10 text-slate-600 hover:text-slate-900 font-medium"
                      : "z-10 text-neutral-400 hover:text-white font-medium"
                  }`}
                  style={{
                    filter: isActive
                      ? isLight
                        ? "drop-shadow(0 -2px 6px rgba(20,175,158,0.25)) drop-shadow(2px 0 4px rgba(15,23,42,0.08)) drop-shadow(-2px 0 4px rgba(15,23,42,0.08))"
                        : "drop-shadow(0 -4px 14px rgba(22,176,159,0.35)) drop-shadow(4px 0 8px rgba(0,0,0,0.6)) drop-shadow(-4px 0 8px rgba(0,0,0,0.6))"
                      : isLight
                      ? "drop-shadow(1px 0 2px rgba(15,23,42,0.06))"
                      : "drop-shadow(2px 0 4px rgba(0,0,0,0.4))",
                  }}
                  title={c.title || `Showreel 0${idx + 1}`}
                >
                  {/* SVG Folder Tab Shape with Slanted Sides & Rounded Top Corners */}
                  <svg
                    className={`absolute inset-0 w-full h-full pointer-events-none transition-colors duration-300 ${
                      isActive
                        ? "text-[#16b09f]"
                        : isLight
                        ? "text-slate-200 hover:text-slate-300"
                        : "text-[#15181e] hover:text-[#1f232b]"
                    }`}
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,40 L 9,6 Q 12,0 18,0 L 82,0 Q 88,0 91,6 L 100,40 Z"
                      fill="currentColor"
                    />
                    {!isActive && (
                      <path
                        d="M 0,40 L 9,6 Q 12,0 18,0 L 82,0 Q 88,0 91,6 L 100,40"
                        fill="none"
                        stroke={isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.14)"}
                        strokeWidth="1.2"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                  </svg>
                  <span className="relative z-10 truncate max-w-[140px] sm:max-w-[220px] px-1 font-semibold">
                    {c.title || `Showreel 0${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Solid Teal Baseline extending across the card top */}
          <div className={`h-[2px] w-full bg-[#16b09f] -mt-[2px] relative z-20 ${
            isLight ? "" : "shadow-[0_0_12px_rgba(22,176,159,0.4)]"
          }`} />
        </div>
      )}

      {/* Large Showcase Card (Unified with Folder Tabs) */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-b-2xl sm:rounded-b-3xl rounded-t-none overflow-hidden border-x border-b bg-neutral-900 group cursor-pointer ${
          isLight
            ? "border-slate-300/80 shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
            : "border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
        }`}
      >
        {/* Background Media: YouTube, Google Drive, or Static Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          {isShowingYouTube ? (
            <iframe
              key={`yt-${youtubeId}`}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              title={displayTitle}
              className="w-full h-full object-cover scale-[1.18] border-0 pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : isShowingGDrive ? (
            <iframe
              key={`gd-${gdriveId}`}
              src={`https://drive.google.com/file/d/${gdriveId}/preview`}
              title={displayTitle}
              className="w-full h-full object-cover scale-[1.05] border-0 pointer-events-none"
              allow="autoplay; encrypted-media; fullscreen"
            />
          ) : mounted && imageSrc ? (
            <img
              key={`img-${imageSrc}`}
              src={imageSrc}
              alt={displayTitle}
              className="w-full h-full object-cover scale-[1.02] transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border border-white/10 animate-pulse bg-white/5" />
            </div>
          )}
        </div>

        {/* Center Play Button for Video Mode */}
        {(isShowingYouTube || isShowingGDrive) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#16b09f] group-hover:text-black group-hover:border-[#16b09f] transition-all duration-300 shadow-2xl">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

        {/* Prev / Next Navigation Arrows for Multi-Showreel */}
        {cards.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-[#16b09f] text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 shadow-2xl cursor-pointer"
              aria-label="Previous Showreel"
              title="Previous Showreel"
            >
              <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-[#16b09f] text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 shadow-2xl cursor-pointer"
              aria-label="Next Showreel"
              title="Next Showreel"
            >
              <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Top-Right Showreel Index Pill */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-8 z-20 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-medium flex items-center gap-1.5 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
                <span>Showreel {safeIdx + 1} / {cards.length}</span>
              </span>
            </div>
          </>
        )}

        {/* Bottom Left: Title & Category */}
        <div className="absolute bottom-4 sm:bottom-7 left-4 sm:left-8 right-36 flex flex-col pointer-events-none z-10">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1 font-semibold">
            {displayCategory}
          </span>
          <h3 className="creative-journey-title text-base sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg leading-snug">
            {displayTitle}
          </h3>
        </div>

        {/* Bottom Right: View Full Button */}
        <div className="absolute bottom-4 sm:bottom-7 right-4 sm:right-8 z-20">
          <span className="px-4 sm:px-5 py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-sm flex items-center gap-2 group-hover:bg-neutral-200 transition-all group-hover:scale-105 shadow-xl">
            <span>{t("projects.stage3.card.btn")}</span>
            <HiArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Fullview Modal Popup */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-fade-in ${
            isLight ? "bg-slate-900/50" : "bg-black/90"
          }`}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border ${
              isLight
                ? "bg-white border-slate-200"
                : "bg-neutral-950 border-white/15"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 right-4 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 border ${
                isLight
                  ? "bg-white/90 hover:bg-white text-slate-800 border-slate-200 shadow-md"
                  : "bg-black/70 hover:bg-black text-white border-white/20"
              }`}
              aria-label="Close modal"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            {/* Media Area */}
            <div className={`relative w-full aspect-video overflow-hidden flex items-center justify-center ${
              isLight ? "bg-slate-100" : "bg-black"
            }`}>
              {isShowingYouTube ? (
                <iframe
                  key={`modal-yt-${youtubeId}`}
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isShowingGDrive ? (
                <iframe
                  key={`modal-gd-${gdriveId}`}
                  src={`https://drive.google.com/file/d/${gdriveId}/preview`}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : (
                <img
                  key={`modal-img-${imageSrc}`}
                  src={imageSrc}
                  alt={displayTitle}
                  className="w-full h-full object-contain"
                />
              )}

              {/* Prev / Next inside Modal */}
              {cards.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/75 hover:bg-[#16b09f] text-white hover:text-black backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xl"
                    aria-label="Previous Video"
                    title="Previous Video"
                  >
                    <HiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/75 hover:bg-[#16b09f] text-white hover:text-black backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xl"
                    aria-label="Next Video"
                    title="Next Video"
                  >
                    <HiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Details Footer */}
            <div className={`p-5 sm:p-7 border-t flex flex-col gap-2 overflow-y-auto ${
              isLight
                ? "bg-white border-slate-200"
                : "bg-neutral-950 border-white/10"
            }`}>
              {/* Showreel Switcher Folder Tabs in Modal */}
              {cards.length > 1 && (
                <div className="relative mb-3">
                  <div className="relative flex items-end max-w-full overflow-x-auto scrollbar-none pt-2 z-10">
                    {cards.map((c, idx) => {
                      const isActive = idx === safeIdx;
                      return (
                        <button
                          key={c.id || idx}
                          type="button"
                          onClick={() => setActiveCardIndex(idx)}
                          className={`group relative h-8 sm:h-9 px-5 sm:px-7 text-xs font-sans transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 select-none ${
                            idx > 0 ? "-ml-3 sm:-ml-4" : ""
                          } ${
                            isActive
                              ? "z-30 text-black font-extrabold"
                              : isLight
                              ? "z-10 text-slate-600 hover:text-slate-900 font-medium"
                              : "z-10 text-neutral-400 hover:text-white font-medium"
                          }`}
                          style={{
                            filter: isActive
                              ? isLight
                                ? "drop-shadow(0 -2px 6px rgba(20,175,158,0.25)) drop-shadow(1px 0 3px rgba(15,23,42,0.08))"
                                : "drop-shadow(0 -3px 10px rgba(22,176,159,0.35)) drop-shadow(3px 0 6px rgba(0,0,0,0.5))"
                              : isLight
                              ? "drop-shadow(1px 0 2px rgba(15,23,42,0.05))"
                              : "none",
                          }}
                        >
                          <svg
                            className={`absolute inset-0 w-full h-full pointer-events-none transition-colors duration-300 ${
                              isActive
                                ? "text-[#16b09f]"
                                : isLight
                                ? "text-slate-200 hover:text-slate-300"
                                : "text-[#161920] hover:text-[#21252d]"
                            }`}
                            viewBox="0 0 100 40"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M 0,40 L 9,6 Q 12,0 18,0 L 82,0 Q 88,0 91,6 L 100,40 Z"
                              fill="currentColor"
                            />
                            {!isActive && (
                              <path
                                d="M 0,40 L 9,6 Q 12,0 18,0 L 82,0 Q 88,0 91,6 L 100,40"
                                fill="none"
                                stroke={isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}
                                strokeWidth="1.2"
                                vectorEffect="non-scaling-stroke"
                              />
                            )}
                          </svg>
                          <span className="relative z-10 truncate max-w-[130px] sm:max-w-[180px] font-semibold">
                            {c.title || `Showreel 0${idx + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className={`h-[2px] w-full bg-[#16b09f] -mt-[2px] relative z-20 ${
                    isLight ? "" : "shadow-[0_0_8px_rgba(22,176,159,0.4)]"
                  }`} />
                </div>
              )}

              <span className="text-xs font-mono uppercase tracking-widest text-[#16b09f] font-semibold">
                {displayCategory}
              </span>
              <h3 className={`text-xl sm:text-2xl font-bold ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                {displayTitle}
              </h3>
              <p className={`text-sm font-light leading-relaxed max-w-3xl whitespace-pre-line mt-1 ${
                isLight ? "text-slate-600" : "text-neutral-300"
              }`}>
                {displayDescription}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

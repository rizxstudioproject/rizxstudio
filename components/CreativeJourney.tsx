"use client";

import React, { useState, useEffect } from "react";
import { HiArrowUpRight, HiXMark } from "react-icons/hi2";
import { usePortfolioData, extractYouTubeId, extractGoogleDriveId } from "@/context/PortfolioDataContext";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTag = isLocalized
    ? t("projects.stage3.tag")
    : stage3?.classTag || t("projects.stage3.tag");

  const displayHeadline = isLocalized
    ? t("projects.stage3.headline")
    : stage3?.headline || t("projects.stage3.headline");

  const displayTitle = isLocalized
    ? t("projects.stage3.card.title")
    : stage3?.heroCard?.title || t("projects.stage3.card.title");

  const displayCategory = isLocalized
    ? t("projects.stage3.card.category")
    : stage3?.heroCard?.category || t("projects.stage3.card.category");

  const displayDescription = isLocalized
    ? (isMin
      ? "Eksplorasi sinematik nan mangubuangakan labiah dari sapuluah taun karya visual, animasi motion 3D, sarato teknologi AI modern."
      : "Eksplorasi sinematik yang menghubungkan lebih dari satu dekade karya visual, desain animasi 3D, dan teknologi kecerdasan AI mutakhir.")
    : (stage3?.heroCard?.description ||
      "A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology — pushing the boundaries of creative digital experiences.");

  const mediaType = stage3?.heroCard?.mediaType || (
    stage3?.heroCard?.gdriveId || stage3?.heroCard?.gdriveUrl ? "gdrive" :
    (stage3?.heroCard?.videoId || stage3?.heroCard?.youtubeUrl ? "youtube" : "image")
  );

  const rawGdriveId = stage3?.heroCard?.gdriveId || extractGoogleDriveId(stage3?.heroCard?.gdriveUrl || "");
  const rawYoutubeId = stage3?.heroCard?.videoId || extractYouTubeId(stage3?.heroCard?.youtubeUrl || "");
  const isVideoOn = stage3?.heroCard?.isVideoEnabled !== false;
  const youtubeId = (isVideoOn || (mediaType === "youtube" && !stage3?.heroCard?.image)) ? rawYoutubeId : "";
  const gdriveId = (isVideoOn || (mediaType === "gdrive" && !stage3?.heroCard?.image)) ? rawGdriveId : "";

  const isShowingYouTube = mediaType === "youtube" && Boolean(youtubeId);
  const isShowingGDrive = mediaType === "gdrive" && Boolean(gdriveId);
  const rawImage = stage3?.heroCard?.image;
  const imageSrc = (rawImage && rawImage !== "/assets/antigravity/hero-large.jpg") ? rawImage : "";

  return (
    <section id="creative-journey" className="relative py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#16b09f] block mb-2 font-semibold">
          {displayTag}
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          {displayHeadline}
        </h2>
      </div>

      {/* Large Showcase Card */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] bg-neutral-900 group cursor-pointer"
      >
        {/* Background Media: YouTube, Google Drive, or Static Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          {isShowingYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              title={displayTitle}
              className="w-full h-full object-cover scale-[1.18] border-0 pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : isShowingGDrive ? (
            <iframe
              src={`https://drive.google.com/file/d/${gdriveId}/preview`}
              title={displayTitle}
              className="w-full h-full object-cover scale-[1.05] border-0 pointer-events-none"
              allow="autoplay; encrypted-media; fullscreen"
            />
          ) : mounted && imageSrc ? (
            <img
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

        {/* Bottom Left: Title & Category */}
        <div className="absolute bottom-4 sm:bottom-7 left-4 sm:left-8 right-32 flex flex-col pointer-events-none z-10">
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
              className={`absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 border ${
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
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isShowingGDrive ? (
                <iframe
                  src={`https://drive.google.com/file/d/${gdriveId}/preview`}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : (
                <img
                  src={imageSrc}
                  alt={displayTitle}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Details Footer */}
            <div className={`p-5 sm:p-7 border-t flex flex-col gap-2 ${
              isLight
                ? "bg-white border-slate-200"
                : "bg-neutral-950 border-white/10"
            }`}>
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


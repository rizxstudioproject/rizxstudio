"use client";

import React, { useRef, useEffect } from "react";

interface OverlayProps {
  progress: number;
}

export default function Overlay({ progress }: OverlayProps) {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ==========================================
    // SECTION 1 (0% to 8% scroll):
    // "Fomy Rizky." + "<AI-Powered Creative Designer/>"
    // Fades out promptly so the user sees the portrait rotating
    // ==========================================
    if (section1Ref.current) {
      if (progress <= 0.08) {
        const factor = Math.max(0, Math.min(1, progress / 0.08));
        const opacity = (1 - factor).toFixed(4);
        const y = (-12 * factor).toFixed(2);
        section1Ref.current.style.opacity = opacity;
        section1Ref.current.style.transform = `translate3d(0, ${y}vh, 0)`;
        section1Ref.current.style.visibility = Number(opacity) <= 0.001 ? "hidden" : "visible";
      } else {
        section1Ref.current.style.opacity = "0";
        section1Ref.current.style.transform = `translate3d(0, -12vh, 0)`;
        section1Ref.current.style.visibility = "hidden";
      }
    }

    // ==========================================
    // SECTION 2 (10% to 45% scroll):
    // Left-aligned "Results-driven creative." (Matching reference Image 5)
    // ==========================================
    if (section2Ref.current) {
      if (progress >= 0.1 && progress <= 0.45) {
        let opacity = 0;
        let y = 0;

        if (progress < 0.18) {
          // Fade in and float up from +8vh to 0vh
          const factor = (progress - 0.1) / (0.18 - 0.1);
          opacity = factor;
          y = 8 * (1 - factor);
        } else if (progress <= 0.35) {
          // Pinned comfortably while portrait rotates
          opacity = 1;
          y = 0;
        } else {
          // Fade out and float up to -8vh
          const factor = (progress - 0.35) / (0.45 - 0.35);
          opacity = 1 - factor;
          y = -8 * factor;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        section2Ref.current.style.opacity = opacity.toFixed(4);
        section2Ref.current.style.transform = `translate3d(0, ${y.toFixed(2)}vh, 0)`;
        section2Ref.current.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
      } else {
        section2Ref.current.style.opacity = "0";
        section2Ref.current.style.transform =
          progress < 0.1 ? "translate3d(0, 8vh, 0)" : "translate3d(0, -8vh, 0)";
        section2Ref.current.style.visibility = "hidden";
      }
    }

    // ==========================================
    // SECTION 3 (50% to 85% scroll):
    // Right-aligned "Bridging design & intelligence."
    // ==========================================
    if (section3Ref.current) {
      if (progress >= 0.5 && progress <= 0.85) {
        let opacity = 0;
        let y = 0;

        if (progress < 0.58) {
          const factor = (progress - 0.5) / (0.58 - 0.5);
          opacity = factor;
          y = 8 * (1 - factor);
        } else if (progress <= 0.72) {
          opacity = 1;
          y = 0;
        } else {
          const factor = (progress - 0.72) / (0.85 - 0.72);
          opacity = 1 - factor;
          y = -8 * factor;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        section3Ref.current.style.opacity = opacity.toFixed(4);
        section3Ref.current.style.transform = `translate3d(0, ${y.toFixed(2)}vh, 0)`;
        section3Ref.current.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
      } else {
        section3Ref.current.style.opacity = "0";
        section3Ref.current.style.transform =
          progress < 0.5 ? "translate3d(0, 8vh, 0)" : "translate3d(0, -8vh, 0)";
        section3Ref.current.style.visibility = "hidden";
      }
    }
  }, [progress]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none">
      {/* SECTION 1: Centered across lower-middle/chest region (matching reference Shivam Kumar) */}
      <div
        ref={section1Ref}
        style={{
          opacity: 1,
          transform: "translate3d(0, 0vh, 0)",
          willChange: "transform, opacity",
        }}
        className="absolute inset-x-0 top-[48%] sm:top-[52%] -translate-y-1/2 flex flex-col items-center justify-center text-center px-4 transition-none"
      >
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white mb-2 leading-none">
          Fomy Rizky<span className="text-neutral-500 font-normal">.</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base font-mono tracking-widest text-neutral-400 mt-2 sm:mt-3">
          &lt;AI-Powered Creative Designer/&gt;
        </p>

        {/* Minimalist mouse scroll indicator matching reference */}
        <div className="flex flex-col items-center gap-2 mt-8 sm:mt-12">
          <div className="w-5 h-9 rounded-full border-2 border-neutral-400/50 flex justify-center pt-1.5">
            <span className="w-1 h-2 rounded-full bg-neutral-300 animate-bounce" />
          </div>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400">
            SCROLL
          </span>
        </div>
      </div>

      {/* SECTION 2: Left aligned (Matching reference Image 5 "Results-driven engineer.") */}
      <div
        ref={section2Ref}
        style={{
          opacity: 0,
          transform: "translate3d(0, 8vh, 0)",
          willChange: "transform, opacity",
          visibility: "hidden",
        }}
        className="absolute left-6 md:left-16 lg:left-24 top-[50%] -translate-y-1/2 max-w-2xl text-left flex flex-col justify-center transition-none px-4"
      >
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-4 leading-[1.05]">
          Results-driven<br />
          <span className="text-neutral-400">creative</span><span className="text-neutral-500 font-normal">.</span>
        </h2>
        <p className="text-base sm:text-xl text-neutral-300 font-light leading-relaxed max-w-lg">
          Combining 11 years of creative expertise with AI-powered workflows to produce impactful visuals, distinctive brand identities, and high-performing digital campaigns.
        </p>
      </div>

      {/* SECTION 3: Right aligned */}
      <div
        ref={section3Ref}
        style={{
          opacity: 0,
          transform: "translate3d(0, 8vh, 0)",
          willChange: "transform, opacity",
          visibility: "hidden",
        }}
        className="absolute right-6 md:right-16 lg:right-24 top-[50%] -translate-y-1/2 max-w-2xl text-right flex flex-col items-end justify-center transition-none px-4"
      >
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-4 leading-[1.05]">
          Creative<br />
          <span className="text-neutral-400">meets AI</span><span className="text-neutral-500 font-normal">.</span>
        </h2>
        <p className="text-base sm:text-xl text-neutral-300 font-light leading-relaxed max-w-lg">
          Where human creativity and intelligent technology converge — crafting visuals, brands, and campaigns that move people and perform at scale.
        </p>
      </div>
    </div>
  );
}

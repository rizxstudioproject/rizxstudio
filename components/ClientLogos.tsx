"use client";

import React from "react";
import {
  SiNike,
  SiSpotify,
  SiApple,
  SiNetflix,
  SiSony,
  SiSamsung,
  SiMeta,
  SiRedbull,
} from "react-icons/si";

interface Client {
  name: string;
  icon: React.ReactNode;
}

const CLIENTS: Client[] = [
  { name: "NIKE",     icon: <SiNike    size={28} /> },
  { name: "SPOTIFY",  icon: <SiSpotify size={26} /> },
  { name: "APPLE",    icon: <SiApple   size={24} /> },
  { name: "NETFLIX",  icon: <SiNetflix size={26} /> },
  { name: "SONY",     icon: <SiSony    size={28} /> },
  { name: "SAMSUNG",  icon: <SiSamsung size={28} /> },
  { name: "META",     icon: <SiMeta    size={26} /> },
  { name: "RED BULL", icon: <SiRedbull size={28} /> },
];

function LogoItem({ client }: { client: Client }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 mx-4 rounded-full bg-white/[0.03] border border-white/[0.07] hover:border-white/25 hover:bg-white/[0.07] transition-all duration-300 text-neutral-400 hover:text-white group cursor-default select-none shrink-0">
      <span className="opacity-60 group-hover:opacity-100 transition-opacity">
        {client.icon}
      </span>
      <span className="text-xs sm:text-sm font-semibold tracking-widest font-mono text-neutral-400 group-hover:text-white whitespace-nowrap">
        {client.name}
      </span>
    </div>
  );
}

export default function ClientLogos() {
  return (
    <section
      id="clients"
      className="relative py-16 bg-[#0a0a0a] overflow-hidden border-y border-white/5"
    >
      {/* Left / Right fade masks */}
      <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-[#0a0a0a] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-[#0a0a0a] to-transparent" />

      {/* Label */}
      <div className="mb-10 text-center">
        <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-600">
          Selected Clients &amp; Creative Collaborations
        </span>
      </div>

      {/* Marquee — outer wrapper scrolls, two identical rows create seamless loop */}
      <div className="flex w-full overflow-hidden">
        {/* Row A */}
        <div
          className="flex items-center py-2 shrink-0"
          style={{
            animation: "marquee-scroll 30s linear infinite",
            willChange: "transform",
          }}
        >
          {CLIENTS.map((c, i) => (
            <LogoItem key={`a-${i}`} client={c} />
          ))}
        </div>

        {/* Row B — duplicate for seamless loop */}
        <div
          className="flex items-center py-2 shrink-0"
          aria-hidden="true"
          style={{
            animation: "marquee-scroll 30s linear infinite",
            willChange: "transform",
          }}
        >
          {CLIENTS.map((c, i) => (
            <LogoItem key={`b-${i}`} client={c} />
          ))}
        </div>
      </div>

      {/* Inline keyframe — guaranteed to work regardless of Tailwind purge */}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  );
}

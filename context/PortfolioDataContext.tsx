"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { antigravityData } from "@/data/projectsData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { saveStage3ImageToDB, getStage3ImageFromDB, clearStage3ImageFromDB } from "@/lib/sequenceStorage";
import { getAdminCredentials, mergeAdminUserLists, clearActiveAdminUser } from "@/lib/adminAuth";
import { normalizeMediaUrl } from "@/lib/mediaService";

const STORAGE_KEY = "rizx_portfolio_custom_data_v1";
const SESSION_KEY = "rizx_admin_session";

export const SUPABASE_MEDIA_BASE = "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media";

export function migrateMediaPaths<T>(data: T): T {
  if (!data) return data;
  try {
    let str = typeof data === "string" ? data : JSON.stringify(data);
    if (
      str.includes("/works/") ||
      str.includes("/assets/") ||
      str.includes("/sequence/") ||
      str.includes('"/sequence"') ||
      str.includes("'/sequence'") ||
      str.includes("/logos/")
    ) {
      str = str.replace(/"\/sequence"/g, `"${SUPABASE_MEDIA_BASE}/sequence"`);
      str = str.replace(/'\/sequence'/g, `'${SUPABASE_MEDIA_BASE}/sequence'`);
      str = str.replace(/"\/(works|assets|sequence|logos)\/([^"]+)"/g, (_, folder, path) => {
        const encoded = `${folder}/${path}`
          .split("/")
          .map((s) => encodeURIComponent(decodeURIComponent(s)))
          .join("/");
        return `"${SUPABASE_MEDIA_BASE}/${encoded}"`;
      });
      return typeof data === "string" ? (str as unknown as T) : JSON.parse(str);
    }
  } catch {
    // fallback
  }
  return data;
}

export function safeJsonParseMedia<T = any>(jsonString: string): T {
  const parsed = JSON.parse(jsonString);
  return migrateMediaPaths(parsed);
}


export interface HeroBannerData {
  name: string;
  nameColor?: string;
  role: string;
  roleColor?: string;
  scrollText: string;
  scrollTextColor?: string;
  sec2Headline1: string;
  sec2Headline1Color?: string;
  sec2Headline2: string;
  sec2Headline2Color?: string;
  sec2Body: string;
  sec2BodyColor?: string;
  sec3Headline1: string;
  sec3Headline1Color?: string;
  sec3Headline2: string;
  sec3Headline2Color?: string;
  sec3Body: string;
  sec3BodyColor?: string;
  // Hero photo sequence controls
  sequenceMode?: "default" | "folder" | "custom";
  sequenceTotalFrames?: number;
  sequenceFolder?: string;
  sequencePattern?: string; // e.g. "frame_{padded}.webp"
  sequencePadding?: number; // e.g. 6
  sequenceStartIndex?: number; // e.g. 0
  sequenceCustomFrames?: string[]; // Array of frame URLs
  sequenceMouseTracking?: boolean; // Follow mouse cursor movement
  sequenceMouseIntensity?: number; // Number of frames influenced by cursor
  sequenceFrontImage?: string; // Front portrait photo, defaults to "/front.webp"
  sequenceMaskImage?: string; // Mask cyber suit photo, defaults to "/mask.webp"
  sequenceRevealRadius?: number; // Spotlight radius in pixels (100 - 600, default 270)
  sequenceRevealSpread?: number; // Inner solid core percentage (10 - 80, default 30)
  sequenceRevealFade?: number; // Fade softness / feathering percentage (10 - 90, default 60)
}

export const defaultHeroBannerData: HeroBannerData = {
  name: "Fomy R",
  nameColor: "#ffffff",
  role: "AI-Powered Creative Designer",
  roleColor: "#16b09f",
  scrollText: "SCROLL",
  scrollTextColor: "#a3a3a3",
  sec2Headline1: "Results-driven",
  sec2Headline1Color: "#ffffff",
  sec2Headline2: "creative",
  sec2Headline2Color: "#a3a3a3",
  sec2Body:
    "Combining 11+ years of creative expertise with modern workflows to produce impactful visuals, distinctive brand identities, and high-performing digital campaigns.",
  sec2BodyColor: "#d4d4d4",
  sec3Headline1: "Creative",
  sec3Headline1Color: "#ffffff",
  sec3Headline2: "meets AI",
  sec3Headline2Color: "#a3a3a3",
  sec3Body:
    "Where human creativity and modern creative workflows converge - crafting visuals, brands, and campaigns that move people and perform at scale.",
  sec3BodyColor: "#d4d4d4",
  sequenceMode: "default",
  sequenceTotalFrames: 108,
  sequenceFolder: "/sequence",
  sequencePattern: "frame_{padded}.webp",
  sequencePadding: 6,
  sequenceStartIndex: 0,
  sequenceCustomFrames: [],
  sequenceMouseTracking: true,
  sequenceMouseIntensity: 26,
  sequenceFrontImage: "/front.webp",
  sequenceMaskImage: "/mask.webp",
  sequenceRevealRadius: 270,
  sequenceRevealSpread: 30,
  sequenceRevealFade: 60,
};

export interface Stage3HeroCard {
  image: string;
  title: string;
  category: string;
  aspectRatio: string;
  mediaType?: "youtube" | "gdrive" | "image";
  youtubeUrl?: string;
  videoId?: string;
  gdriveUrl?: string;
  gdriveId?: string;
  description?: string;
  isVideoEnabled?: boolean;
}

export interface ClientItem {
  id: string;
  clientName: string;
  category: string;
  logo: string;
  color: string;
  itemsCount: number;
  description?: string;
  tools?: string[];
  works: any[];
  isCustom?: boolean; // true if admin-created folder
}

export interface AboutData {
  eyebrow: string;
  title: string;
  headline: string;
  bio: string;
  philosophyTitle: string;
  philosophyQuote: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;
  collabTitle: string;
  collabDesc: string;
  disciplinesTitle: string;
  disciplines: string[];
}

export const defaultAboutData: AboutData = {
  eyebrow: "WHO AM I",
  title: "About Me",
  headline: "Creative Designer & Motion Specialist | 11+ Years | Agency & Global Brands",
  bio: "With 11+ years in creative design, I’ve evolved alongside the industry, combining strong design fundamentals with modern creative workflows to deliver impactful visuals for agencies and global brands.",
  philosophyTitle: "CORE PHILOSOPHY",
  philosophyQuote: "A creative professional’s greatest advantage isn’t resisting change — it’s adapting faster.",
  stat1Num: "11+",
  stat1Label: "YEARS EXPERIENCE",
  stat2Num: "100+",
  stat2Label: "PROJECTS",
  stat3Num: "20+",
  stat3Label: "CLIENTS",
  collabTitle: "Global Collaboration",
  collabDesc: "Producing scalable visual content, high-performing ads, and campaign assets for international brands and agencies.",
  disciplinesTitle: "Disciplines",
  disciplines: [
    "Motion Graphics",
    "Branding & Identity",
    "UI/UX Design",
    "Digital Advertising",
    "Video Production",
    "Vibe Coding",
    "Logo Design",
  ],
};

export interface DeckCardItem {
  id: string;
  title: string;
  category: string;
  image: string;
  gradient?: string;
}

export interface OverlappingCardItem {
  id: string;
  title: string;
  image: string;
  rotate: number;
}

export interface HeroWorksData {
  stage1Badge: string;
  stage1Headline: string;
  stage1Subheadline: string;
  stage1ScrollText: string;
  deckCards: DeckCardItem[];

  stage2Tag: string;
  stage2Headline: string;
  stage2Desc: string;
  stage2BtnText: string;
  stage2Skills: string[];
  stage2Badges: Array<{ id: string | number; text: string; color?: string }>;
  overlappingCards: OverlappingCardItem[];
}

export const defaultHeroWorksData: HeroWorksData = {
  stage1Badge: "SELECTED WORKS",
  stage1Headline: "A Range of Work. One Creative Vision.",
  stage1Subheadline:
    "Explore selected projects across branding, motion, digital design, and AI-driven visuals, shaped by different briefs, teams, and creative challenges.",
  stage1ScrollText: "Scroll down ↓",
  deckCards: [
    {
      id: "d1",
      title: "Brand Identity",
      category: "Brand Identity",
      image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-brand-identity.jpg",
      gradient: "from-red-600/60 to-black",
    },
    {
      id: "d2",
      title: "Campaign Visuals",
      category: "Campaign Visuals",
      image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-campaign-visuals.jpg",
      gradient: "from-blue-600/60 to-black",
    },
    {
      id: "d3",
      title: "Motion Graphics",
      category: "Motion Graphics",
      image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-motion-graphics.jpg",
      gradient: "from-amber-500/60 to-black",
    },
    {
      id: "d4",
      title: "3D Design",
      category: "3D Design",
      image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-3d-design.jpg",
      gradient: "from-pink-500/60 to-black",
    },
    {
      id: "d5",
      title: "UI/UX Design",
      category: "UI/UX Design",
      image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-uiux-design.jpg",
      gradient: "from-cyan-500/60 to-black",
    },
  ],
  stage2Tag: "AI-DRIVEN CREATIVE",
  stage2Headline: "Design. Motion. AI.",
  stage2Desc:
    "Senior Graphic Designer & Digital Artist crafting impactful brand visuals, motion graphics, and digital experiences for global brands.",
  stage2BtnText: "Explore My Work",
  stage2Skills: ["Branding", "Motion", "3D Design", "UI/UX", "AI Visuals"],
  stage2Badges: [
    { id: 1, text: "@rizx", color: "bg-[#16b09f] text-white border-[#16b09f]" },
    { id: 2, text: "@malaka", color: "bg-neutral-800 text-white border-neutral-700" },
  ],
  overlappingCards: [
    { id: "o1", title: "Branding", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-brand-identity.jpg", rotate: -8 },
    { id: "o2", title: "Motion", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-motion-graphics.jpg", rotate: -3 },
    { id: "o3", title: "UI/UX", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-uiux-design.jpg", rotate: 3 },
    { id: "o4", title: "AI Visuals", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-3d-design.jpg", rotate: 7 },
  ],
};

export interface ClientLogoItem {
  id: string;
  name: string;
  file: string;
  row: 1 | 2;
  link?: string;
}

export interface ClientLogosData {
  subtitle: string;
  logos: ClientLogoItem[];
}

export const defaultClientLogosData: ClientLogosData = {
  subtitle: "Selected Clients & Creative Collaborations",
  logos: [
    { id: "cl-1", name: "Tokopedia", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_01.svg", row: 1 },
    { id: "cl-2", name: "11ST", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_02.svg", row: 1 },
    { id: "cl-3", name: "Samsung", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_03.svg", row: 1 },
    { id: "cl-4", name: "Nexon", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_04.svg", row: 1 },
    { id: "cl-5", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_05.svg", row: 1 },
    { id: "cl-6", name: "TruCarbon", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_06.svg", row: 1 },
    { id: "cl-7", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_07.svg", row: 1 },
    { id: "cl-8", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_07-1.svg", row: 1 },
    { id: "cl-9", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_08.svg", row: 1 },
    { id: "cl-10", name: "SuperSmart", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_09.svg", row: 1 },
    { id: "cl-11", name: "Asian Trust Capital", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_10.svg", row: 1 },
    { id: "cl-12", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_11.svg", row: 1 },
    { id: "cl-13", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_12.svg", row: 1 },
    { id: "cl-14", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_13.svg", row: 1 },
    { id: "cl-15", name: "EDUF", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_14.svg", row: 1 },
    { id: "cl-16", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_15.svg", row: 1 },
    { id: "cl-17", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_16.svg", row: 2 },
    { id: "cl-18", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_17.svg", row: 2 },
    { id: "cl-19", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_18.svg", row: 2 },
    { id: "cl-20", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_19.svg", row: 2 },
    { id: "cl-21", name: "KB Bukopin", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_20.svg", row: 2 },
    { id: "cl-22", name: "Burger King", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_21.svg", row: 2 },
    { id: "cl-23", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_22.svg", row: 2 },
    { id: "cl-24", name: "Withings", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_23.svg", row: 2 },
    { id: "cl-25", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_24.svg", row: 2 },
    { id: "cl-26", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_25.svg", row: 2 },
    { id: "cl-27", name: "LINE", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_26.svg", row: 2 },
    { id: "cl-28", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_26-1.svg", row: 2 },
    { id: "cl-29", name: "Kotra", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_27.svg", row: 2 },
    { id: "cl-30", name: "WebToon", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_28.svg", row: 2 },
    { id: "cl-31", name: "Shortiz", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_29.svg", row: 2 },
    { id: "cl-32", name: "iLOTTE", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_30.svg", row: 2 },
    { id: "cl-33", name: "Client", file: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/logos/logo_31.svg", row: 2 },
  ],
};

export interface PortfolioIntroData {
  badge: string;
  headline: string;
  description: string;
  tools: string[];
}

export const defaultPortfolioIntroData: PortfolioIntroData = {
  badge: "PROFESSIONAL EXPERIENCE",
  headline: "Creative Work. Real-World Thinking.",
  description:
    "From brand campaigns to digital experiences, I combine design, motion, and AI-driven workflows to create purposeful visuals for brands and businesses.",
  tools: ["Figma", "Photoshop", "Magnific AI", "GPT", "Gemini"],
};

export interface PortfolioRunnerItem {
  id: string;
  title: string;
  category: string;
  image: string;
  row: 1 | 2;
  link?: string;
}

export interface PortfolioRunnerData {
  title: string;
  items: PortfolioRunnerItem[];
  speedRow1?: number; // Duration in seconds (e.g. 85)
  speedRow2?: number; // Duration in seconds (e.g. 95)
  directionRow1?: "left" | "right";
  directionRow2?: "left" | "right";
  pauseOnHover?: boolean;
  waveEffectEnabled?: boolean;
  waveLift?: number; // Elevation in px (e.g. 22)
  waveScale?: number; // Scale ratio (e.g. 1.17)
  waveRadius?: number; // Wave radius in px (e.g. 240)
}

export const defaultPortfolioRunnerData: PortfolioRunnerData = {
  title: "SELECTED WORKS",
  items: [
    // Row 1
    { id: "pr-1", title: "KIA EV2 Concept", category: "Automotive", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-KIA/KIA%20EV2_B.jpg", row: 1 },
    { id: "pr-2", title: "Brand Identity", category: "Branding", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-brand-identity.jpg", row: 1 },
    { id: "pr-3", title: "Burger King Campaign", category: "Campaign", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Burger%20King/Burger_ads06.jpg", row: 1 },
    { id: "pr-4", title: "UI/UX Design Platform", category: "UI/UX", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-uiux-design.jpg", row: 1 },
    { id: "pr-5", title: "Xeilos Digital Ad", category: "Advertising", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Xeilos/ad01.jpg", row: 1 },
    { id: "pr-6", title: "KIA PBV Concept", category: "Automotive", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-KIA/KIA%20PBV_A.jpg", row: 1 },
    { id: "pr-7", title: "Motion Graphics Visual", category: "Motion", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-motion-graphics.jpg", row: 1 },
    { id: "pr-8", title: "Social Content Series", category: "Social Media", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Hyashop/01A.jpg", row: 1 },

    // Row 2
    { id: "pr-9", title: "Digital Campaign Suite", category: "Advertising", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Xeilos/ad07.jpg", row: 2 },
    { id: "pr-10", title: "Lifestyle Visuals", category: "Social Media", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Hyashop/1952.jpg", row: 2 },
    { id: "pr-11", title: "KIA EV2 Emerald Edition", category: "Automotive", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-KIA/KIA%20EV2_G.jpg", row: 2 },
    { id: "pr-12", title: "Burger King Visuals", category: "Campaign", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Burger%20King/Burger_ads07.jpg", row: 2 },
    { id: "pr-13", title: "Creative Flagship Banner", category: "Brand Vision", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg", row: 2 },
    { id: "pr-14", title: "Permifast Brand Campaign", category: "Brand Identity", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/works/client-Permifast/Permifast04.jpg", row: 2 },
    { id: "pr-15", title: "3D Spatial Design", category: "3D Design", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-3d-design.jpg", row: 2 },
    { id: "pr-16", title: "Campaign Motion Reel", category: "Visuals", image: "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/selected-campaign-visuals.jpg", row: 2 },
  ],
  speedRow1: 85,
  speedRow2: 95,
  directionRow1: "left",
  directionRow2: "right",
  pauseOnHover: false,
  waveEffectEnabled: true,
  waveLift: 22,
  waveScale: 1.17,
  waveRadius: 240,
};

export interface TrashItem {
  id: string;
  originalId: string;
  type: "client-work" | "client-folder" | "flagship-video" | "runner-item" | "hero-card" | "client-logo";
  title: string;
  subtitle?: string;
  previewImage?: string;
  mediaType?: "image" | "youtube" | "gdrive";
  deletedAt: string;
  payload: any;
}

interface PortfolioDataContextType {
  stage3: {
    classTag: string;
    headline: string;
    heroCard: Stage3HeroCard;
  };
  clients: ClientItem[];
  about: AboutData;
  heroWorks: HeroWorksData;
  clientLogos: ClientLogosData;
  portfolioIntro: PortfolioIntroData;
  portfolioRunner: PortfolioRunnerData;
  heroBanner: HeroBannerData;
  allData: typeof antigravityData;
  trashItems: TrashItem[];
  moveToTrash: (item: Omit<TrashItem, "id" | "deletedAt">) => string;
  restoreFromTrash: (trashId: string) => boolean;
  permanentDeleteFromTrash: (trashId: string) => void;
  emptyTrash: () => void;
  updateStage3Video: (params: {
    youtubeUrl?: string;
    videoId?: string;
    mediaType?: "youtube" | "gdrive" | "image";
    gdriveUrl?: string;
    gdriveId?: string;
    image?: string;
    title?: string;
    category?: string;
    description?: string;
    headline?: string;
    classTag?: string;
    isVideoEnabled?: boolean;
  }) => void;
  removeStage3Video: () => void;
  updateClientDescription: (clientId: string, description: string, tools?: string[]) => void;
  addClientWork: (clientId: string, newWork: any) => void;
  autoMigrateBase64Works: (clientObj: ClientItem) => Promise<void>;
  updateClientWork: (clientId: string, updatedWork: any) => void;
  deleteClientWork: (clientId: string, workId: string) => void;
  addClientFolder: (folder: { clientName: string; category: string; description?: string; tools?: string[] }) => void;
  updateClientFolder: (clientId: string, updates: { clientName?: string; category?: string; logo?: string; description?: string; tools?: string[] }) => void;
  deleteClientFolder: (clientId: string) => void;
  updateAboutData: (newData: Partial<AboutData>) => void;
  updateHeroWorksData: (newData: Partial<HeroWorksData>) => void;
  updateClientLogosData: (newData: Partial<ClientLogosData>) => void;
  updatePortfolioIntroData: (newData: Partial<PortfolioIntroData>) => void;
  updatePortfolioRunnerData: (newData: Partial<PortfolioRunnerData>) => void;
  updateHeroBannerData: (newData: Partial<HeroBannerData>) => void;
  addPortfolioRunnerItem: (item: Omit<PortfolioRunnerItem, "id">) => void;
  editPortfolioRunnerItem: (id: string, updated: Partial<PortfolioRunnerItem>) => void;
  deletePortfolioRunnerItem: (id: string) => void;
  resetPortfolioRunner: () => void;
  resetPortfolioData: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (open: boolean) => void;
  toggleAdminMode: () => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  adminLogout: () => void;
  isCloudSyncActive: boolean;
}

/**
 * Robust YouTube video ID parser for various URL structures
 */
export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();

  // If already an 11-char ID with valid characters
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Matches youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : "";
}

/**
 * Robust Google Drive file ID parser for Google Drive share / view / preview links
 */
export function extractGoogleDriveId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  // Support /file/d/ID, /d/ID, /file/u/0/d/ID, /drive/folders/ID, etc.
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return cleanDriveId(dMatch[1]);
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return cleanDriveId(idMatch[1]);
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(trimmed)) return cleanDriveId(trimmed);
  return "";
}

function cleanDriveId(id: string): string {
  // Auto-correct inadvertent typo OOo -> O0o for the user's flagship showcase video
  if (id === "1kxNHaYUOOoULDiMuq1IvZVk_JPsiZDKY") {
    return "1kxNHaYUO0oULDiMuq1IvZVk_JPsiZDKY";
  }
  return id;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export const isSystemConfigId = (id: string): boolean => {
  if (!id || typeof id !== "string") return false;
  return (
    id.startsWith("site-") ||
    id.startsWith("system-") ||
    id.startsWith("config-") ||
    id === "site-seo-settings" ||
    id === "site-crm-leads" ||
    id === "site-social-profiles" ||
    id === "site-admin-credentials" ||
    id === "site-about-section" ||
    id === "site-hero-works" ||
    id === "site-client-logos" ||
    id === "site-portfolio-intro" ||
    id === "site-portfolio-runner" ||
    id === "site-hero-banner" ||
    id === "site-stage3-showcase"
  );
};

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
  // Synchronous initial state from LocalStorage on client to eliminate SSR flash/glitch
  const [stage3, setStage3] = useState<{
    classTag: string;
    headline: string;
    heroCard: Stage3HeroCard;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = safeJsonParseMedia(stored);
          if (parsed.stage3) {
            const raw = parsed.stage3.heroCard?.image;
            const validImage = (raw && raw !== "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg") ? raw : "";
            const parsedHero = parsed.stage3.heroCard || {};
            const resolvedMediaType = parsedHero.mediaType || (
              parsedHero.gdriveId || parsedHero.gdriveUrl ? "gdrive" :
              parsedHero.videoId || parsedHero.youtubeUrl ? "youtube" : "image"
            );
            return {
              ...antigravityData.stage3,
              ...parsed.stage3,
              heroCard: {
                ...antigravityData.stage3.heroCard,
                ...parsedHero,
                mediaType: resolvedMediaType,
                image: validImage,
                isVideoEnabled: parsedHero.isVideoEnabled !== undefined
                  ? parsedHero.isVideoEnabled
                  : (resolvedMediaType !== "image"),
              },
            };
          }
        }
      } catch (_) {}
    }
    return {
      ...antigravityData.stage3,
      heroCard: {
        ...antigravityData.stage3.heroCard,
        image: "",
        mediaType: "youtube",
        gdriveUrl: "",
        gdriveId: "",
        isVideoEnabled: true,
      },
    };
  });
  const [clients, setClients] = useState<ClientItem[]>(antigravityData.stage4.clients as ClientItem[]);
  const [about, setAbout] = useState<AboutData>(defaultAboutData);
  const [heroWorks, setHeroWorks] = useState<HeroWorksData>(defaultHeroWorksData);
  const [clientLogos, setClientLogos] = useState<ClientLogosData>(defaultClientLogosData);
  const [portfolioIntro, setPortfolioIntro] = useState<PortfolioIntroData>(defaultPortfolioIntroData);
  const [portfolioRunner, setPortfolioRunner] = useState<PortfolioRunnerData>(defaultPortfolioRunnerData);
  const [heroBanner, setHeroBanner] = useState<HeroBannerData>(defaultHeroBannerData);
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("rizx_recycle_bin_items");
        if (stored) {
          const parsed = safeJsonParseMedia(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(isSupabaseConfigured);

  // Live state refs to prevent stale closure data loss across async calls and hydration
  const stage3Ref = useRef(stage3);
  const clientsRef = useRef(clients);
  const aboutRef = useRef(about);
  const heroWorksRef = useRef(heroWorks);
  const clientLogosRef = useRef(clientLogos);
  const portfolioIntroRef = useRef(portfolioIntro);
  const portfolioRunnerRef = useRef(portfolioRunner);
  const heroBannerRef = useRef(heroBanner);
  const trashItemsRef = useRef(trashItems);

  useEffect(() => { stage3Ref.current = stage3; }, [stage3]);
  useEffect(() => { clientsRef.current = clients; }, [clients]);
  useEffect(() => { aboutRef.current = about; }, [about]);
  useEffect(() => { heroWorksRef.current = heroWorks; }, [heroWorks]);
  useEffect(() => { clientLogosRef.current = clientLogos; }, [clientLogos]);
  useEffect(() => { portfolioIntroRef.current = portfolioIntro; }, [portfolioIntro]);
  useEffect(() => { portfolioRunnerRef.current = portfolioRunner; }, [portfolioRunner]);
  useEffect(() => { heroBannerRef.current = heroBanner; }, [heroBanner]);
  useEffect(() => { trashItemsRef.current = trashItems; }, [trashItems]);

  // Auto-detect environment:
  // On localhost -> Open Admin Login directly as requested.
  // On live domain (rizxstudio.com) -> NEVER show admin login by default (only via ?admin=true or shortcut).
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const params = new URLSearchParams(window.location.search);
      const loginVal = params.get("login");

      if (isLocal) {
        setIsAdminMode(true);
      } else if (loginVal) {
        getAdminCredentials().then((c) => {
          const expected = c.secretParam || "secret";
          if (loginVal === expected || loginVal === "secret") {
            setIsAdminMode(true);
          } else {
            setIsAdminMode(false);
          }
        });
      } else {
        setIsAdminMode(false);
      }
    }
  }, []);

  // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to toggle admin mode from any page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsAdminMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper to persist current state to LocalStorage
  const persistState = useCallback(
    (
      newStage3?: typeof stage3,
      newClients?: ClientItem[],
      newAbout?: AboutData,
      newHeroWorks?: HeroWorksData,
      newClientLogos?: ClientLogosData,
      newPortfolioIntro?: PortfolioIntroData,
      newPortfolioRunner?: PortfolioRunnerData,
      newHeroBanner?: HeroBannerData
    ) => {
      try {
        const targetStage3 = newStage3 || stage3Ref.current;
        const targetClients = newClients || clientsRef.current;
        const targetAbout = newAbout || aboutRef.current;
        const targetHeroWorks = newHeroWorks || heroWorksRef.current;
        const targetClientLogos = newClientLogos || clientLogosRef.current;
        const targetPortfolioIntro = newPortfolioIntro || portfolioIntroRef.current;
        const targetPortfolioRunner = newPortfolioRunner || portfolioRunnerRef.current;
        const targetHeroBanner = newHeroBanner || heroBannerRef.current;

        const payload = {
          stage3: targetStage3,
          about: targetAbout,
          heroWorks: targetHeroWorks,
          clientLogos: targetClientLogos,
          portfolioIntro: targetPortfolioIntro,
          portfolioRunner: targetPortfolioRunner,
          heroBanner: targetHeroBanner,
          clients: targetClients.map((c) => ({
            id: c.id,
            clientName: c.clientName,
            category: c.category,
            logo: c.logo || "",
            color: c.color || "",
            description: c.description || "",
            tools: c.tools || [],
            works: c.works || [],
            itemsCount: c.works ? c.works.length : c.itemsCount,
            isCustom: c.isCustom || false,
          })),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("rizx:data-updated", { detail: payload }));
        }
      } catch (err: any) {
        console.warn("Failed to persist portfolio overrides to localStorage:", err);
        // QuotaExceededError recovery: if raw base64 data URLs exceed 5MB quota,
        // sanitize only the heavy base64 strings so folder metadata, names, tools, and works are NEVER lost!
        if (
          typeof window !== "undefined" &&
          (err?.name === "QuotaExceededError" || err?.code === 22 || err?.number === -2147024882)
        ) {
          try {
            const targetClients = newClients || clientsRef.current;
            const strippedClients = targetClients.map((c) => ({
              ...c,
              works: (c.works || []).map((w: any) => ({
                ...w,
                image: w.image?.startsWith("data:image/") ? "" : w.image,
              })),
            }));
            const strippedPayload = {
              stage3: newStage3 || stage3Ref.current,
              about: newAbout || aboutRef.current,
              heroWorks: newHeroWorks || heroWorksRef.current,
              clientLogos: newClientLogos || clientLogosRef.current,
              portfolioIntro: newPortfolioIntro || portfolioIntroRef.current,
              portfolioRunner: newPortfolioRunner || portfolioRunnerRef.current,
              heroBanner: newHeroBanner || heroBannerRef.current,
              clients: strippedClients,
              updatedAt: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(strippedPayload));
            console.log("Recovered from localStorage QuotaExceededError by stripping base64 images.");
          } catch (retryErr) {
            console.error("Critical localStorage quota failure:", retryErr);
          }
        }
      }
    },
    []
  );

  // Initialize: First from LocalStorage for instant render, then from Supabase if configured
  useEffect(() => {
    // 1. Instant hydration from LocalStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = safeJsonParseMedia(stored);
        if (parsed.stage3) {
          const defaultHero = antigravityData.stage3.heroCard;
          const parsedHero = parsed.stage3.heroCard || {};
          const ytUrl = parsedHero.youtubeUrl ?? "";
          const vId = parsedHero.videoId ?? extractYouTubeId(ytUrl) ?? "";
          const gdUrl = parsedHero.gdriveUrl ?? "";
          const gdId = parsedHero.gdriveId ?? extractGoogleDriveId(gdUrl) ?? "";
          const resolvedMediaType = parsedHero.mediaType || (
            gdId || gdUrl ? "gdrive" :
            vId || ytUrl ? "youtube" : "image"
          );
          const vEnabled = parsedHero.isVideoEnabled !== undefined
            ? parsedHero.isVideoEnabled
            : (resolvedMediaType !== "image");
          const rawImg = parsedHero.image;
          const validImg = (rawImg && rawImg !== "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg") ? rawImg : "";

          const loadedStage3 = {
            ...antigravityData.stage3,
            ...parsed.stage3,
            heroCard: {
              ...defaultHero,
              ...parsedHero,
              mediaType: resolvedMediaType,
              image: validImg,
              youtubeUrl: ytUrl,
              videoId: vId,
              gdriveUrl: gdUrl,
              gdriveId: gdId,
              isVideoEnabled: vEnabled,
            },
          };
          stage3Ref.current = loadedStage3;
          setStage3(loadedStage3);
        }

        if (parsed.clients && Array.isArray(parsed.clients)) {
          const cleanSavedClients = parsed.clients.filter((c: any) => !isSystemConfigId(c.id));
          // Merge saved data onto default clients
          const mergedClients = antigravityData.stage4.clients.map((defaultClient) => {
            const saved = parsed.clients.find((c: any) => c.id === defaultClient.id);
            if (!saved) return defaultClient;
            return {
              ...defaultClient,
              clientName: saved.clientName || defaultClient.clientName,
              category: saved.category || defaultClient.category,
              description: saved.description !== undefined ? saved.description : defaultClient.description,
              tools: Array.isArray(saved.tools) ? saved.tools : (defaultClient as any).tools,
              works: Array.isArray(saved.works) && saved.works.length > 0 ? saved.works : defaultClient.works,
              itemsCount: Array.isArray(saved.works) && saved.works.length > 0 ? saved.works.length : defaultClient.itemsCount,
            };
          });

          // Also restore any admin-created custom folders
          const customFolders = (cleanSavedClients || parsed.clients).filter(
            (c: any) =>
              c.isCustom === true &&
              !isSystemConfigId(c.id) &&
              !antigravityData.stage4.clients.find((d: any) => d.id === c.id)
          );
          const customClientItems: ClientItem[] = customFolders.map((c: any) => ({
            id: c.id,
            clientName: c.clientName || c.id,
            category: c.category || `Portfolio — ${c.clientName || c.id}`,
            logo: c.logo || "",
            color: c.color || "from-[#16b09f]/20 via-neutral-900/40 to-neutral-900",
            itemsCount: Array.isArray(c.works) ? c.works.length : 0,
            description: c.description || "",
            tools: Array.isArray(c.tools) ? c.tools : [],
            works: Array.isArray(c.works) ? c.works : [],
            isCustom: true,
          }));

          const finalInitialClients = [...(mergedClients as ClientItem[]), ...customClientItems].filter((c) => !isSystemConfigId(c.id));
          setClients(finalInitialClients);
          clientsRef.current = finalInitialClients;
        }

        if (parsed.about) {
          const loadedAbout = { ...defaultAboutData, ...parsed.about };
          setAbout(loadedAbout);
          aboutRef.current = loadedAbout;
        }

        if (parsed.heroWorks) {
          const loadedHeroWorks = {
            ...defaultHeroWorksData,
            ...parsed.heroWorks,
          };
          setHeroWorks(loadedHeroWorks);
          heroWorksRef.current = loadedHeroWorks;
        }

        if (parsed.clientLogos) {
          const rawLogos = parsed.clientLogos.logos || defaultClientLogosData.logos;
          const normalizedLogos = rawLogos.map((l: any) => ({
            ...l,
            file: normalizeMediaUrl(l.file),
          }));
          const loadedClientLogos = {
            ...defaultClientLogosData,
            ...parsed.clientLogos,
            logos: normalizedLogos,
          };
          setClientLogos(loadedClientLogos);
          clientLogosRef.current = loadedClientLogos;
        }

        if (parsed.portfolioIntro) {
          const loadedPortfolioIntro = {
            ...defaultPortfolioIntroData,
            ...parsed.portfolioIntro,
          };
          setPortfolioIntro(loadedPortfolioIntro);
          portfolioIntroRef.current = loadedPortfolioIntro;
        }

        if (parsed.portfolioRunner) {
          const rawItems = parsed.portfolioRunner.items || defaultPortfolioRunnerData.items;
          const normalizedItems = rawItems.map((i: any) => ({
            ...i,
            image: normalizeMediaUrl(i.image),
          }));
          const loadedPortfolioRunner = {
            ...defaultPortfolioRunnerData,
            ...parsed.portfolioRunner,
            items: normalizedItems,
          };
          setPortfolioRunner(loadedPortfolioRunner);
          portfolioRunnerRef.current = loadedPortfolioRunner;
        }

        if (parsed.heroBanner) {
          const rawBanner = {
            ...defaultHeroBannerData,
            ...parsed.heroBanner,
          };
          if (
            rawBanner.sequenceTotalFrames === 121 ||
            (rawBanner.sequenceMode === "default" && rawBanner.sequenceFolder?.includes("supabase.co")) ||
            (!rawBanner.sequenceMode && rawBanner.sequenceFolder?.includes("supabase.co"))
          ) {
            rawBanner.sequenceMode = "default";
            rawBanner.sequenceTotalFrames = 108;
            rawBanner.sequenceFolder = "/sequence";
            rawBanner.sequencePattern = "frame_{padded}.webp";
            rawBanner.sequencePadding = 6;
            rawBanner.sequenceStartIndex = 0;
          }
          setHeroBanner(rawBanner);
          heroBannerRef.current = rawBanner;
        }
      }

      // Check IndexedDB backup for Stage 3 custom image ONLY IF not already loaded/configured from localStorage
      const hasLocalStorageData = localStorage.getItem(STORAGE_KEY) !== null;
      if (!hasLocalStorageData) {
        getStage3ImageFromDB().then((cachedImg) => {
          if (cachedImg) {
            setStage3((prev) => {
              if (!prev.heroCard.image || prev.heroCard.image === "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg") {
                const updated = {
                  ...prev,
                  heroCard: {
                    ...prev.heroCard,
                    image: cachedImg,
                  },
                };
                stage3Ref.current = updated;
                return updated;
              }
              return prev;
            });
          }
        });
      }

      const session = sessionStorage.getItem(SESSION_KEY);
      if (session === "authenticated") {
        setIsAdminAuthenticated(true);
      }
    } catch (err) {
      console.warn("LocalStorage hydration warning:", err);
    }
  }, []);

    // 2. Reusable live cloud sync from Supabase Cloud
    const fetchCloudData = useCallback(async () => {
      if (!isSupabaseConfigured || !supabase) return;
      const client = supabase;
      try {
        // Fetch Flagship Showcase
        const { data: heroData, error: heroError } = await client
          .from("flagship_showcase")
          .select("*")
          .eq("id", "default")
          .single();

        if (!heroError && heroData) {
          setStage3((prev) => {
            const cloudImg =
              !heroData.image_url || heroData.image_url === "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg"
                ? ""
                : heroData.image_url;
            const ytUrl = heroData.youtube_url ?? prev.heroCard.youtubeUrl;
            const gdUrl = heroData.gdrive_url ?? prev.heroCard.gdriveUrl;
            const gdId = heroData.gdrive_id ?? prev.heroCard.gdriveId;
            const resolvedMediaType = heroData.media_type ?? prev.heroCard.mediaType ?? (
              gdId || gdUrl ? "gdrive" :
              ytUrl ? "youtube" : "image"
            );
            const updated = {
              ...prev,
              headline: heroData.headline || prev.headline,
              classTag: heroData.class_tag || heroData.classTag || prev.classTag,
              heroCard: {
                ...prev.heroCard,
                title: heroData.title || prev.heroCard.title,
                category: heroData.category || prev.heroCard.category,
                description: heroData.description || prev.heroCard.description,
                youtubeUrl: ytUrl,
                videoId: heroData.video_id ?? prev.heroCard.videoId,
                gdriveUrl: gdUrl,
                gdriveId: gdId,
                mediaType: resolvedMediaType,
                image: cloudImg || prev.heroCard.image,
                isVideoEnabled: heroData.is_video_enabled ?? prev.heroCard.isVideoEnabled ?? (resolvedMediaType !== "image"),
              },
            };
            stage3Ref.current = updated;
            return updated;
          });
        }

        // Fetch Client Descriptions & custom works
        const { data: clientRows, error: clientsError } = await client
          .from("client_descriptions")
          .select("*");

        if (!clientsError && clientRows && Array.isArray(clientRows)) {
          // Stage 3 showcase override
          const stage3Row = clientRows.find((r) => r.client_id === "site-stage3-showcase");
          if (stage3Row && stage3Row.description) {
            try {
              const parsedStage3 = safeJsonParseMedia(stage3Row.description);
              setStage3((prev) => {
                const rawParsedImg = parsedStage3.heroCard?.image;
                const cloudImg =
                  !rawParsedImg || rawParsedImg === "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg"
                    ? ""
                    : rawParsedImg;
                const updated = {
                  ...prev,
                  ...parsedStage3,
                  heroCard: {
                    ...prev.heroCard,
                    ...(parsedStage3.heroCard || {}),
                    image: cloudImg,
                  },
                };
                stage3Ref.current = updated;
                return updated;
              });
            } catch (_) {}
          }

          // About section
          const aboutRow = clientRows.find((r) => r.client_id === "site-about-section");
          let latestAbout = aboutRef.current;
          if (aboutRow && aboutRow.description) {
            try {
              const parsedAbout = safeJsonParseMedia(aboutRow.description);
              latestAbout = { ...defaultAboutData, ...parsedAbout };
              setAbout(latestAbout);
              aboutRef.current = latestAbout;
            } catch (_) {}
          }

          // Hero & Works section
          const heroWorksRow = clientRows.find((r) => r.client_id === "site-hero-works");
          let latestHero = heroWorksRef.current;
          if (heroWorksRow && heroWorksRow.description) {
            try {
              const parsedHero = safeJsonParseMedia(heroWorksRow.description);
              latestHero = { ...defaultHeroWorksData, ...parsedHero };
              setHeroWorks(latestHero);
              heroWorksRef.current = latestHero;
            } catch (_) {}
          }

          // Client Logos
          const clientLogosRow = clientRows.find((r) => r.client_id === "site-client-logos");
          let latestLogos = clientLogosRef.current;
          if (clientLogosRow && clientLogosRow.description) {
            try {
              const parsedLogos = safeJsonParseMedia(clientLogosRow.description);
              latestLogos = { ...defaultClientLogosData, ...parsedLogos };
              setClientLogos(latestLogos);
              clientLogosRef.current = latestLogos;
            } catch (_) {}
          }

          // Portfolio Intro
          const portfolioIntroRow = clientRows.find((r) => r.client_id === "site-portfolio-intro");
          let latestIntro = portfolioIntroRef.current;
          if (portfolioIntroRow && portfolioIntroRow.description) {
            try {
              const parsedIntro = safeJsonParseMedia(portfolioIntroRow.description);
              latestIntro = { ...defaultPortfolioIntroData, ...parsedIntro };
              setPortfolioIntro(latestIntro);
              portfolioIntroRef.current = latestIntro;
            } catch (_) {}
          }

          // Portfolio Runner
          const portfolioRunnerRow = clientRows.find((r) => r.client_id === "site-portfolio-runner");
          let latestRunner = portfolioRunnerRef.current;
          if (portfolioRunnerRow && portfolioRunnerRow.description) {
            try {
              const parsedRunner = safeJsonParseMedia(portfolioRunnerRow.description);
              const rawItems = parsedRunner.items || defaultPortfolioRunnerData.items;
              const normalizedItems = rawItems.map((i: any) => ({
                ...i,
                image: normalizeMediaUrl(i.image),
              }));
              latestRunner = {
                ...defaultPortfolioRunnerData,
                ...parsedRunner,
                items: normalizedItems,
              };
              setPortfolioRunner(latestRunner);
              portfolioRunnerRef.current = latestRunner;
            } catch (_) {}
          }

          // Hero Banner
          const heroBannerRow = clientRows.find((r) => r.client_id === "site-hero-banner");
          let latestBanner = heroBannerRef.current;
          if (heroBannerRow && heroBannerRow.description) {
            try {
              const parsedHeroBanner = safeJsonParseMedia(heroBannerRow.description);
              const mergedBanner = { ...defaultHeroBannerData, ...parsedHeroBanner };
              if (
                mergedBanner.sequenceTotalFrames === 121 ||
                (mergedBanner.sequenceMode === "default" && mergedBanner.sequenceFolder?.includes("supabase.co")) ||
                (!mergedBanner.sequenceMode && mergedBanner.sequenceFolder?.includes("supabase.co"))
              ) {
                mergedBanner.sequenceMode = "default";
                mergedBanner.sequenceTotalFrames = 108;
                mergedBanner.sequenceFolder = "/sequence";
                mergedBanner.sequencePattern = "frame_{padded}.webp";
                mergedBanner.sequencePadding = 6;
                mergedBanner.sequenceStartIndex = 0;
              }
              latestBanner = mergedBanner;
              setHeroBanner(latestBanner);
              heroBannerRef.current = latestBanner;
            } catch (_) {}
          }

          // Admin Credentials
          const credsRow = clientRows.find((r) => r.client_id === "site-admin-credentials");
          if (credsRow && credsRow.description) {
            try {
              const parsedCreds = JSON.parse(credsRow.description);
              if (parsedCreds.username && parsedCreds.password && typeof window !== "undefined") {
                let mergedCreds = parsedCreds;
                try {
                  const currentLocal = localStorage.getItem("rizx_admin_credentials");
                  if (currentLocal) {
                    const parsedLocal = JSON.parse(currentLocal);
                    const mergedUsers = mergeAdminUserLists(
                      Array.isArray(parsedCreds.adminUsers) ? parsedCreds.adminUsers : [],
                      Array.isArray(parsedLocal.adminUsers) ? parsedLocal.adminUsers : []
                    );
                    mergedCreds = {
                      ...parsedLocal,
                      ...parsedCreds,
                      adminUsers: mergedUsers,
                    };
                  }
                } catch (_) {}
                localStorage.setItem("rizx_admin_credentials", JSON.stringify(mergedCreds));
                window.dispatchEvent(
                  new CustomEvent("rizx_admin_credentials_updated", { detail: mergedCreds })
                );
              }
            } catch (_) {}
          }

          // Regular Client folders & works
          const regularClientRows = clientRows.filter(
            (r) => !isSystemConfigId(r.client_id)
          );
          const defaultClients = antigravityData.stage4.clients;
          const defaultIds = new Set(defaultClients.map((d) => d.id));

          const parseRowData = (row: any, fallbackClient?: any) => {
            let text = "";
            let tools: string[] = fallbackClient?.tools || [];
            let works: any[] = fallbackClient?.works || [];
            let isCustom = fallbackClient?.isCustom || false;
            let logo = fallbackClient?.logo || "";

            if (row && row.description) {
              if (typeof row.description === "string" && row.description.startsWith("{")) {
                try {
                  const parsed = safeJsonParseMedia(row.description);
                  text = parsed.text !== undefined ? parsed.text : row.description;
                  if (Array.isArray(parsed.tools) && parsed.tools.length > 0) tools = parsed.tools;
                  if (Array.isArray(parsed.works) && parsed.works.length > 0) works = parsed.works;
                  if (parsed.isCustom !== undefined) isCustom = parsed.isCustom;
                  if (parsed.logo !== undefined) logo = parsed.logo;
                } catch (_) {
                  text = row.description;
                }
              } else {
                text = row.description;
              }
            }
            if (Array.isArray(row.tools) && row.tools.length > 0) tools = row.tools;
            if (Array.isArray(row.works) && row.works.length > 0) works = row.works;
            if (row.logo) logo = row.logo;

            return { text, tools, works, isCustom, logo };
          };

          const mergedDefaults = defaultClients.map((d) => {
            const match = regularClientRows.find((r) => r.client_id === d.id);
            if (!match) return d;
            const parsed = parseRowData(match, d);
            return {
              ...d,
              clientName: match.client_name || d.clientName,
              category: match.category || d.category,
              description: parsed.text,
              tools: parsed.tools,
              works: parsed.works,
              itemsCount: parsed.works.length,
              logo: parsed.logo || d.logo || "",
            };
          });

          const cloudCustoms: ClientItem[] = regularClientRows
            .filter((r) => !defaultIds.has(r.client_id))
            .map((r) => {
              const parsed = parseRowData(r);
              return {
                id: r.client_id,
                clientName: r.client_name || r.client_id,
                category: r.category || `Portfolio — ${r.client_name || r.client_id}`,
                logo: parsed.logo || "",
                color: "from-[#16b09f]/20 via-neutral-900/40 to-neutral-900",
                itemsCount: parsed.works.length,
                description: parsed.text,
                tools: parsed.tools,
                works: parsed.works,
                isCustom: true,
              };
            });

          const finalClients: ClientItem[] = [
            ...(mergedDefaults as ClientItem[]),
            ...cloudCustoms,
          ].filter((c) => !isSystemConfigId(c.id));
          setClients(finalClients);
          clientsRef.current = finalClients;
          try {
            persistState(
              stage3Ref.current,
              finalClients,
              latestAbout,
              latestHero,
              latestLogos,
              latestIntro,
              latestRunner,
              latestBanner
            );
          } catch (_) {}
        }

        setIsCloudSyncActive(true);
      } catch (err) {
        console.warn("Supabase fetchCloudData notice:", err);
      }
    }, [persistState]);

    // Multi-tab (storage event) & cross-device (Supabase Realtime) synchronization
    useEffect(() => {
      // 1. Cross-tab sync in the same browser via storage event
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = safeJsonParseMedia(e.newValue);
            if (parsed.clients && Array.isArray(parsed.clients)) {
              setClients(parsed.clients);
              clientsRef.current = parsed.clients;
            }
            if (parsed.stage3) {
              setStage3(parsed.stage3);
              stage3Ref.current = parsed.stage3;
            }
            if (parsed.about) {
              setAbout(parsed.about);
              aboutRef.current = parsed.about;
            }
            if (parsed.heroWorks) {
              setHeroWorks(parsed.heroWorks);
              heroWorksRef.current = parsed.heroWorks;
            }
            if (parsed.clientLogos) {
              setClientLogos(parsed.clientLogos);
              clientLogosRef.current = parsed.clientLogos;
            }
            if (parsed.portfolioIntro) {
              setPortfolioIntro(parsed.portfolioIntro);
              portfolioIntroRef.current = parsed.portfolioIntro;
            }
            if (parsed.portfolioRunner) {
              setPortfolioRunner(parsed.portfolioRunner);
              portfolioRunnerRef.current = parsed.portfolioRunner;
            }
            if (parsed.heroBanner) {
              setHeroBanner(parsed.heroBanner);
              heroBannerRef.current = parsed.heroBanner;
            }
          } catch (_) {}
        }
      };
      window.addEventListener("storage", handleStorageChange);

      // 2. Custom event sync for same-window notifications
      const handleCustomEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail) {
          const payload = customEvent.detail;
          if (payload.clients && Array.isArray(payload.clients)) {
            setClients(payload.clients);
            clientsRef.current = payload.clients;
          }
        }
      };
      window.addEventListener("rizx:data-updated", handleCustomEvent);

      // 3. Re-fetch freshest data on tab focus / visibility change
      const handleVisibilityOrFocus = () => {
        if (document.visibilityState === "visible") {
          fetchCloudData();
        }
      };
      window.addEventListener("focus", handleVisibilityOrFocus);
      document.addEventListener("visibilitychange", handleVisibilityOrFocus);

      // 4. Supabase Realtime across devices (phone <-> desktop)
      let realtimeChannel: any = null;
      if (isSupabaseConfigured && supabase) {
        try {
          realtimeChannel = supabase
            .channel("rizx-portfolio-realtime")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "client_descriptions" },
              (payload: any) => {
                const clientId = payload?.new?.client_id || payload?.old?.client_id;
                // Avoid refetching entire portfolio dataset if the change belongs to theme, seo, crm, etc.
                if (
                  clientId &&
                  (clientId === "site-theme-motion-config" ||
                    clientId === "site-seo-settings" ||
                    clientId === "site-crm-leads" ||
                    clientId === "site-social-profiles" ||
                    clientId === "site-admin-credentials" ||
                    clientId.startsWith("order_") ||
                    clientId.startsWith("quote_"))
                ) {
                  return;
                }
                fetchCloudData();
              }
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "flagship_showcase" },
              () => {
                fetchCloudData();
              }
            )
            .subscribe();
        } catch (err) {
          console.warn("Supabase Realtime subscribe notice:", err);
        }
      }

      // Initial fetch on mount
      fetchCloudData();

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("rizx:data-updated", handleCustomEvent);
        window.removeEventListener("focus", handleVisibilityOrFocus);
        document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
        if (realtimeChannel && supabase) {
          try {
            supabase.removeChannel(realtimeChannel);
          } catch (_) {}
        }
      };
    }, [fetchCloudData]);

  // Update Media Settings for Flagship Showcase (YouTube, Google Drive, or Custom Image)
  const updateStage3Video = useCallback(
    async (params: {
      youtubeUrl?: string;
      videoId?: string;
      mediaType?: "youtube" | "gdrive" | "image";
      gdriveUrl?: string;
      gdriveId?: string;
      image?: string;
      title?: string;
      category?: string;
      description?: string;
      headline?: string;
      classTag?: string;
      isVideoEnabled?: boolean;
    }) => {
      const currentStage3 = stage3Ref.current;
      const computedYtId = params.videoId !== undefined ? params.videoId : extractYouTubeId(params.youtubeUrl || "");
      const computedGdId = params.gdriveId !== undefined ? params.gdriveId : extractGoogleDriveId(params.gdriveUrl || "");
      const mediaType =
        params.mediaType ||
        (computedGdId ? "gdrive" : computedYtId ? "youtube" : "image");

      const finalYtUrl = mediaType === "youtube" ? (params.youtubeUrl ?? currentStage3.heroCard.youtubeUrl) : "";
      const finalYtId = mediaType === "youtube" ? (computedYtId || currentStage3.heroCard.videoId) : "";
      const finalGdUrl = mediaType === "gdrive" ? (params.gdriveUrl ?? currentStage3.heroCard.gdriveUrl) : "";
      const finalGdId = mediaType === "gdrive" ? (computedGdId || currentStage3.heroCard.gdriveId) : "";

      const newTitle = params.title !== undefined ? params.title : currentStage3.heroCard.title;
      const newCat = params.category !== undefined ? params.category : currentStage3.heroCard.category;
      const newDesc = params.description !== undefined ? params.description : currentStage3.heroCard.description;
      const newHeadline = params.headline !== undefined ? params.headline : currentStage3.headline;
      const newClassTag = params.classTag !== undefined ? params.classTag : currentStage3.classTag;
      const newImage = params.image !== undefined ? params.image : currentStage3.heroCard.image;
      const newEnabled = params.isVideoEnabled !== undefined ? params.isVideoEnabled : (mediaType !== "image");

      const updatedStage3 = {
        ...currentStage3,
        classTag: newClassTag,
        headline: newHeadline,
        heroCard: {
          ...currentStage3.heroCard,
          mediaType,
          youtubeUrl: finalYtUrl,
          videoId: finalYtId,
          gdriveUrl: finalGdUrl,
          gdriveId: finalGdId,
          image: newImage,
          title: newTitle,
          category: newCat,
          description: newDesc,
          isVideoEnabled: newEnabled,
        },
      };

      stage3Ref.current = updatedStage3;
      setStage3(updatedStage3);
      persistState(updatedStage3);

      // Save custom image to IndexedDB for high-capacity persistence
      if (newImage && newImage.startsWith("data:")) {
        await saveStage3ImageToDB(newImage);
      } else if (params.image === "" || newImage === "") {
        await clearStage3ImageFromDB();
      }

      // Async sync to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        // 1. Full Stage 3 JSON to client_descriptions
        try {
          await client.from("client_descriptions").upsert({
            client_id: "site-stage3-showcase",
            client_name: "Flagship Showcase Stage 3",
            category: "Site Section Config",
            description: JSON.stringify(updatedStage3),
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Supabase site-stage3-showcase sync notice:", err);
        }

        // 2. Also upsert flagship_showcase table
        try {
          await client.from("flagship_showcase").upsert({
            id: "default",
            title: newTitle || "From Visual Craft to Technology",
            category: newCat || "VISUAL CRAFT | DIGITAL | AI",
            description: newDesc || "",
            headline: newHeadline || "",
            class_tag: newClassTag || "",
            youtube_url: finalYtUrl,
            video_id: finalYtId,
            image_url: newImage || "",
            is_video_enabled: newEnabled,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Supabase flagship_showcase sync error:", err);
        }
      }
    },
    [persistState]
  );

  // Remove Video from Flagship Showcase (reset to image mode)
  const removeStage3Video = useCallback(async () => {
    const currentStage3 = stage3Ref.current;
    const updatedStage3 = {
      ...currentStage3,
      heroCard: {
        ...currentStage3.heroCard,
        mediaType: "image" as const,
        youtubeUrl: "",
        videoId: "",
        gdriveUrl: "",
        gdriveId: "",
        image: "",
        isVideoEnabled: false,
      },
    };

    stage3Ref.current = updatedStage3;
    setStage3(updatedStage3);
    persistState(updatedStage3);
    await clearStage3ImageFromDB();

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        await client.from("client_descriptions").upsert({
          client_id: "site-stage3-showcase",
          client_name: "Flagship Showcase Stage 3",
          category: "Site Section Config",
          description: JSON.stringify(updatedStage3),
          updated_at: new Date().toISOString(),
        });
      } catch (_) {}

      try {
        await client.from("flagship_showcase").upsert({
          id: "default",
          title: currentStage3.heroCard.title || "From Visual Craft to Technology",
          category: currentStage3.heroCard.category || "VISUAL CRAFT | DIGITAL | AI",
          description: currentStage3.heroCard.description || "",
          headline: currentStage3.headline || "",
          class_tag: currentStage3.classTag || "",
          youtube_url: "",
          video_id: "",
          image_url: "",
          is_video_enabled: false,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Supabase remove video error:", err);
      }
    }
  }, [persistState]);

  // Helper to sync client data to Supabase using only available columns
  const syncClientToCloud = useCallback(async (clientItem: ClientItem) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const descPayload = JSON.stringify({
        text: clientItem.description || "",
        tools: clientItem.tools || [],
        works: clientItem.works || [],
        isCustom: Boolean(clientItem.isCustom),
        logo: clientItem.logo || "",
      });
      const { error } = await supabase.from("client_descriptions").upsert({
        client_id: clientItem.id,
        client_name: clientItem.clientName,
        category: clientItem.category || `Portfolio — ${clientItem.clientName}`,
        description: descPayload,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Supabase client sync error:", error);
      }
    } catch (err) {
      console.warn("Supabase client sync error:", err);
    }
  }, []);

  // Background auto-migration of any legacy base64 images in client works to permanent Supabase Storage URLs
  const autoMigrateBase64Works = useCallback(
    async (clientObj: ClientItem) => {
      if (!clientObj.works || clientObj.works.length === 0) return;
      const hasBase64 = clientObj.works.some((w: any) => w.image?.startsWith("data:image/"));
      if (!hasBase64) return;

      let modified = false;
      const migratedWorks = await Promise.all(
        clientObj.works.map(async (work: any) => {
          if (work.image?.startsWith("data:image/")) {
            try {
              const res = await fetch("/api/admin/media-upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  base64: work.image,
                  folder: `works/${clientObj.id}`,
                  filename: work.title || "work_img",
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.url) {
                  modified = true;
                  return { ...work, image: data.url };
                }
              }
            } catch (e) {
              console.warn("Auto-migration of work image to storage failed:", e);
            }
          }
          return work;
        })
      );

      if (modified) {
        const currentList = clientsRef.current.length > 0 ? clientsRef.current : clients;
        const updatedClients = currentList.map((c) =>
          c.id === clientObj.id
            ? { ...c, works: migratedWorks, itemsCount: migratedWorks.length }
            : c
        );
        setClients(updatedClients);
        clientsRef.current = updatedClients;
        persistState(stage3Ref.current, updatedClients);
        const updated = updatedClients.find((c) => c.id === clientObj.id);
        if (updated) {
          syncClientToCloud(updated);
        }
        console.log(`Auto-migrated legacy base64 images in client "${clientObj.clientName}" to Cloud Storage CDN.`);
      }
    },
    [clients, persistState, syncClientToCloud]
  );

  // Update Client / Brand Description & Tools Used
  const updateClientDescription = useCallback(
    async (clientId: string, description: string, tools?: string[]) => {
      const currentList = clientsRef.current.length > 0 ? clientsRef.current : clients;
      const updatedClients = currentList.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            description,
            ...(tools !== undefined ? { tools } : {}),
          };
        }
        return client;
      });
      setClients(updatedClients);
      clientsRef.current = updatedClients;
      persistState(stage3, updatedClients);

      const clientObj = updatedClients.find((c) => c.id === clientId);
      if (clientObj) {
        syncClientToCloud(clientObj);
      }
    },
    [stage3, clients, persistState, syncClientToCloud]
  );

  // Add a new portfolio work item (or array of items) to a client folder
  const addClientWork = useCallback(
    async (clientId: string, newWorkOrWorks: any | any[]) => {
      const worksToAdd = Array.isArray(newWorkOrWorks) ? newWorkOrWorks : [newWorkOrWorks];
      const currentList = clientsRef.current.length > 0 ? clientsRef.current : clients;
      const updatedClients = currentList.map((client) => {
        if (client.id === clientId) {
          const updatedWorks = [...worksToAdd, ...(client.works || [])];
          return {
            ...client,
            works: updatedWorks,
            itemsCount: updatedWorks.length,
          };
        }
        return client;
      });

      setClients(updatedClients);
      clientsRef.current = updatedClients;
      persistState(stage3, updatedClients);

      const clientObj = updatedClients.find((c) => c.id === clientId);
      if (clientObj) {
        await syncClientToCloud(clientObj);
        // Also ensure any leftover base64 items in this client folder get migrated
        autoMigrateBase64Works(clientObj).catch(() => {});
      }
    },
    [stage3, clients, persistState, syncClientToCloud, autoMigrateBase64Works]
  );

  // Update an existing portfolio work item (case study details: brief, challenge, solution, role, tools, title, etc.)
  const updateClientWork = useCallback(
    async (clientId: string, updatedWork: any) => {
      const updatedClients = clients.map((client) => {
        if (client.id === clientId) {
          const updatedWorks = (client.works || []).map((w: any) =>
            w.id === updatedWork.id ? { ...w, ...updatedWork } : w
          );
          return {
            ...client,
            works: updatedWorks,
          };
        }
        return client;
      });

      setClients(updatedClients);
      persistState(stage3, updatedClients);

      const clientObj = updatedClients.find((c) => c.id === clientId);
      if (clientObj) {
        syncClientToCloud(clientObj);
      }
    },
    [stage3, clients, persistState, syncClientToCloud]
  );

  // Delete a portfolio work item from a client folder
  const deleteClientWork = useCallback(
    async (clientId: string, workId: string) => {
      const updatedClients = clients.map((client) => {
        if (client.id === clientId) {
          const updatedWorks = (client.works || []).filter((w: any) => w.id !== workId);
          return {
            ...client,
            works: updatedWorks,
            itemsCount: updatedWorks.length,
          };
        }
        return client;
      });

      setClients(updatedClients);
      persistState(stage3, updatedClients);

      const clientObj = updatedClients.find((c) => c.id === clientId);
      if (clientObj) {
        syncClientToCloud(clientObj);
      }
    },
    [stage3, clients, persistState, syncClientToCloud]
  );

  // Add a new custom client folder (admin-created)
  const addClientFolder = useCallback(
    async (folder: { clientName: string; category: string; description?: string; tools?: string[] }) => {
      const newId = `client-custom-${Date.now()}`;
      const newClient: ClientItem = {
        id: newId,
        clientName: folder.clientName,
        category: folder.category || `Portfolio — ${folder.clientName}`,
        logo: "",
        color: "from-[#16b09f]/20 via-neutral-900/40 to-neutral-900",
        itemsCount: 0,
        description: folder.description || "",
        tools: folder.tools || [],
        works: [],
        isCustom: true,
      };

      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      persistState(stage3, updatedClients);

      syncClientToCloud(newClient);
    },
    [stage3, clients, persistState, syncClientToCloud]
  );

  // Edit / Rename an existing client folder or update logo
  const updateClientFolder = useCallback(
    async (clientId: string, updates: { clientName?: string; category?: string; logo?: string; description?: string; tools?: string[] }) => {
      const updatedClients = clients.map((c) => {
        if (c.id === clientId) {
          const newName = updates.clientName !== undefined ? updates.clientName.trim() : c.clientName;
          const newCategory =
            updates.category !== undefined && updates.category.trim() !== ""
              ? updates.category.trim()
              : (updates.clientName ? `Portfolio — ${newName}` : c.category);
          const newLogo = updates.logo !== undefined ? updates.logo : (c.logo || "");
          const newDesc = updates.description !== undefined ? updates.description : (c.description || "");
          const newTools = updates.tools !== undefined ? updates.tools : (c.tools || []);
          return {
            ...c,
            clientName: newName,
            category: newCategory,
            logo: newLogo,
            description: newDesc,
            tools: newTools,
          };
        }
        return c;
      });

      setClients(updatedClients);
      persistState(stage3, updatedClients);

      const clientObj = updatedClients.find((c) => c.id === clientId);
      if (clientObj) {
        syncClientToCloud(clientObj);
      }
    },
    [stage3, clients, persistState, syncClientToCloud]
  );

  // Delete a client folder entirely (all folders can be deleted by admin)
  const deleteClientFolder = useCallback(
    async (clientId: string) => {
      const updatedClients = clients.filter((c) => c.id !== clientId);
      setClients(updatedClients);
      persistState(stage3, updatedClients);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").delete().eq("client_id", clientId);
        } catch (err) {
          console.warn("Supabase delete folder sync notice:", err);
        }
      }
    },
    [stage3, clients, persistState]
  );

  // Update About Me Section Content
  const updateAboutData = useCallback(
    async (newData: Partial<AboutData>) => {
      const updatedAbout: AboutData = {
        ...about,
        ...newData,
      };
      setAbout(updatedAbout);
      persistState(stage3, clients, updatedAbout, heroWorks, clientLogos, portfolioIntro);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-about-section",
            client_name: "About Section",
            category: "About Section Config",
            description: JSON.stringify(updatedAbout),
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Supabase about section update notice:", err);
        }
      }
    },
    [about, stage3, clients, heroWorks, clientLogos, portfolioIntro, persistState]
  );

  // Update Hero & Selected Works Section
  const updateHeroWorksData = useCallback(
    async (newData: Partial<HeroWorksData>) => {
      const updated: HeroWorksData = {
        ...heroWorks,
        ...newData,
      };
      setHeroWorks(updated);
      heroWorksRef.current = updated;
      persistState(stage3, clients, about, updated, clientLogos, portfolioIntro);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-hero-works",
            client_name: "Hero & Selected Works",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          }, { onConflict: "client_id" });
        } catch (err) {
          console.warn("Supabase hero works update notice:", err);
        }
      }
    },
    [heroWorks, stage3, clients, about, clientLogos, portfolioIntro, persistState]
  );

  // Update Client Logos Marquee Section
  const updateClientLogosData = useCallback(
    async (newData: Partial<ClientLogosData>) => {
      const normalizedLogos = (newData.logos || clientLogos.logos).map((l) => ({
        ...l,
        file: normalizeMediaUrl(l.file),
      }));
      const updated: ClientLogosData = {
        ...clientLogos,
        ...newData,
        logos: normalizedLogos,
      };
      setClientLogos(updated);
      clientLogosRef.current = updated;
      persistState(stage3, clients, about, heroWorks, updated, portfolioIntro);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-client-logos",
            client_name: "Client Logos Marquee",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          }, { onConflict: "client_id" });
        } catch (err) {
          console.warn("Supabase client logos update notice:", err);
        }
      }
    },
    [clientLogos, stage3, clients, about, heroWorks, portfolioIntro, persistState]
  );

  // Update Portfolio Section Intro Block (Badge, Headline, Description, Tool Tags)
  const updatePortfolioIntroData = useCallback(
    async (newData: Partial<PortfolioIntroData>) => {
      const updated: PortfolioIntroData = {
        ...portfolioIntro,
        ...newData,
      };
      setPortfolioIntro(updated);
      portfolioIntroRef.current = updated;
      persistState(stage3, clients, about, heroWorks, clientLogos, updated, portfolioRunner);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-portfolio-intro",
            client_name: "Portfolio Intro Header",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          }, { onConflict: "client_id" });
        } catch (err) {
          console.warn("Supabase portfolio intro update notice:", err);
        }
      }
    },
    [portfolioIntro, stage3, clients, about, heroWorks, clientLogos, portfolioRunner, persistState]
  );

  // Update Portfolio Runner Marquee Section
  const updatePortfolioRunnerData = useCallback(
    async (newData: Partial<PortfolioRunnerData>) => {
      const normalizedItems = (newData.items || portfolioRunner.items).map((item) => ({
        ...item,
        image: normalizeMediaUrl(item.image),
      }));
      const updated: PortfolioRunnerData = {
        ...portfolioRunner,
        ...newData,
        items: normalizedItems,
      };
      setPortfolioRunner(updated);
      portfolioRunnerRef.current = updated;
      persistState(stage3, clients, about, heroWorks, clientLogos, portfolioIntro, updated);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-portfolio-runner",
            client_name: "Portfolio Runner Marquee",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          }, { onConflict: "client_id" });
        } catch (err) {
          console.warn("Supabase portfolio runner update notice:", err);
        }
      }
    },
    [portfolioRunner, stage3, clients, about, heroWorks, clientLogos, portfolioIntro, persistState]
  );

  // Add Item to Portfolio Runner
  const addPortfolioRunnerItem = useCallback(
    async (item: Omit<PortfolioRunnerItem, "id">) => {
      const newItem: PortfolioRunnerItem = {
        ...item,
        image: normalizeMediaUrl(item.image),
        id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      const updated: PortfolioRunnerData = {
        ...portfolioRunner,
        items: [newItem, ...portfolioRunner.items],
      };
      await updatePortfolioRunnerData(updated);
    },
    [portfolioRunner, updatePortfolioRunnerData]
  );

  // Edit Item in Portfolio Runner
  const editPortfolioRunnerItem = useCallback(
    async (id: string, updatedFields: Partial<PortfolioRunnerItem>) => {
      const updated: PortfolioRunnerData = {
        ...portfolioRunner,
        items: portfolioRunner.items.map((i) =>
          i.id === id
            ? {
                ...i,
                ...updatedFields,
                image: updatedFields.image ? normalizeMediaUrl(updatedFields.image) : i.image,
              }
            : i
        ),
      };
      await updatePortfolioRunnerData(updated);
    },
    [portfolioRunner, updatePortfolioRunnerData]
  );

  // Delete Item from Portfolio Runner
  const deletePortfolioRunnerItem = useCallback(
    async (id: string) => {
      const updated: PortfolioRunnerData = {
        ...portfolioRunner,
        items: portfolioRunner.items.filter((i) => i.id !== id),
      };
      await updatePortfolioRunnerData(updated);
    },
    [portfolioRunner, updatePortfolioRunnerData]
  );

  // Reset Portfolio Runner
  const resetPortfolioRunner = useCallback(async () => {
    await updatePortfolioRunnerData(defaultPortfolioRunnerData);
  }, [updatePortfolioRunnerData]);

  // Update Hero Banner Section
  const updateHeroBannerData = useCallback(
    async (newData: Partial<HeroBannerData>) => {
      const updated: HeroBannerData = {
        ...heroBanner,
        ...newData,
      };
      setHeroBanner(updated);
      heroBannerRef.current = updated;
      persistState(stage3, clients, about, heroWorks, clientLogos, portfolioIntro, portfolioRunner, updated);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-hero-banner",
            client_name: "Hero Banner Section",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          }, { onConflict: "client_id" });
        } catch (err) {
          console.warn("Supabase hero banner update notice:", err);
        }
      }
    },
    [heroBanner, stage3, clients, about, heroWorks, clientLogos, portfolioIntro, portfolioRunner, persistState]
  );

  // Reset all overrides back to default projectsData
  const resetPortfolioData = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setStage3(antigravityData.stage3);
    setClients(antigravityData.stage4.clients as ClientItem[]);
    setAbout(defaultAboutData);
    setHeroWorks(defaultHeroWorksData);
    setClientLogos(defaultClientLogosData);
    setPortfolioIntro(defaultPortfolioIntroData);
    setPortfolioRunner(defaultPortfolioRunnerData);
    setHeroBanner(defaultHeroBannerData);

    // Reset cloud if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        await client.from("flagship_showcase").upsert({
          id: "default",
          title: antigravityData.stage3.heroCard.title,
          category: antigravityData.stage3.heroCard.category,
          description: antigravityData.stage3.heroCard.description,
          youtube_url: (antigravityData.stage3.heroCard as any).youtubeUrl || "",
          video_id: (antigravityData.stage3.heroCard as any).videoId || "",
          is_video_enabled: true,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn(err);
      }
    }
  }, []);

  // Move an item to trash
  const moveToTrash = useCallback((item: Omit<TrashItem, "id" | "deletedAt">) => {
    const trashId = `trash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTrashItem: TrashItem = {
      ...item,
      id: trashId,
      deletedAt: new Date().toISOString(),
    };
    setTrashItems((prev) => {
      const updated = [newTrashItem, ...prev];
      try {
        localStorage.setItem("rizx_recycle_bin_items", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    return trashId;
  }, []);

  // Restore item from trash back to its original location
  const restoreFromTrash = useCallback(
    (trashId: string): boolean => {
      const currentTrash = trashItemsRef.current;
      const target = currentTrash.find((t) => t.id === trashId);
      if (!target) return false;

      try {
        if (target.type === "client-work") {
          const { clientId, work } = target.payload;
          setClients((prev) => {
            let foundClient = false;
            const updated = prev.map((c) => {
              if (c.id === clientId) {
                foundClient = true;
                const existingWorks = c.works || [];
                if (existingWorks.some((w) => w.id === work.id)) return c;
                return {
                  ...c,
                  works: [work, ...existingWorks],
                  itemsCount: existingWorks.length + 1,
                };
              }
              return c;
            });

            if (!foundClient) {
              const restoredFolder: ClientItem = {
                id: clientId,
                clientName: target.subtitle?.replace(/^.*Folder:\s*/, "") || clientId,
                category: "Portfolio",
                logo: "",
                color: "from-[#16b09f]/20 via-neutral-900/40 to-neutral-900",
                itemsCount: 1,
                works: [work],
                tools: ["Figma", "Photoshop", "Magnific AI"],
                isCustom: true,
              };
              updated.push(restoredFolder);
            }

            clientsRef.current = updated;
            persistState(undefined, updated);
            const restoredClient = updated.find((c) => c.id === clientId);
            if (restoredClient) syncClientToCloud(restoredClient);
            return updated;
          });
        } else if (target.type === "client-folder") {
          const { client } = target.payload;
          setClients((prev) => {
            if (prev.some((c) => c.id === client.id)) return prev;
            const updated = [...prev, client];
            clientsRef.current = updated;
            persistState(undefined, updated);
            syncClientToCloud(client);
            return updated;
          });
        } else if (target.type === "flagship-video") {
          const { stage3: savedStage3 } = target.payload;
          if (savedStage3?.heroCard) {
            updateStage3Video({
              mediaType: savedStage3.heroCard.mediaType || "youtube",
              youtubeUrl: savedStage3.heroCard.youtubeUrl || "",
              videoId: savedStage3.heroCard.videoId || "",
              gdriveUrl: savedStage3.heroCard.gdriveUrl || "",
              gdriveId: savedStage3.heroCard.gdriveId || "",
              image: savedStage3.heroCard.image || "",
              title: savedStage3.heroCard.title,
              category: savedStage3.heroCard.category,
              description: savedStage3.heroCard.description,
              headline: savedStage3.headline,
              classTag: savedStage3.classTag,
              isVideoEnabled: true,
            });
          }
        } else if (target.type === "runner-item") {
          const { item } = target.payload;
          setPortfolioRunner((prev) => {
            if (prev.items.some((i) => i.id === item.id)) return prev;
            const updated = {
              ...prev,
              items: [...prev.items, item],
            };
            portfolioRunnerRef.current = updated;
            persistState(undefined, undefined, undefined, undefined, undefined, undefined, updated);
            return updated;
          });
        } else if (target.type === "hero-card") {
          const { card, cardType } = target.payload;
          setHeroWorks((prev) => {
            const updated = {
              ...prev,
              ...(cardType === "deck"
                ? { deckCards: [...prev.deckCards.filter((c) => c.id !== card.id), card] }
                : { overlappingCards: [...prev.overlappingCards.filter((c) => c.id !== card.id), card] }),
            };
            heroWorksRef.current = updated;
            persistState(undefined, undefined, undefined, updated);
            return updated;
          });
        } else if (target.type === "client-logo") {
          const { logo } = target.payload;
          setClientLogos((prev) => {
            if (prev.logos.some((l) => l.id === logo.id)) return prev;
            const updated = {
              ...prev,
              logos: [...prev.logos, logo],
            };
            clientLogosRef.current = updated;
            persistState(undefined, undefined, undefined, undefined, updated);
            return updated;
          });
        }

        setTrashItems((prev) => {
          const updated = prev.filter((t) => t.id !== trashId);
          try {
            localStorage.setItem("rizx_recycle_bin_items", JSON.stringify(updated));
          } catch (_) {}
          return updated;
        });
        return true;
      } catch (err) {
        console.error("Failed to restore from trash:", err);
        return false;
      }
    },
    [persistState, syncClientToCloud, updateStage3Video]
  );

  // Permanently delete an item from trash
  const permanentDeleteFromTrash = useCallback((trashId: string) => {
    setTrashItems((prev) => {
      const updated = prev.filter((t) => t.id !== trashId);
      try {
        localStorage.setItem("rizx_recycle_bin_items", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, []);

  // Empty all trash items
  const emptyTrash = useCallback(() => {
    setTrashItems([]);
    try {
      localStorage.removeItem("rizx_recycle_bin_items");
    } catch (_) {}
  }, []);

  const toggleAdminMode = useCallback(() => {
    setIsAdminMode((prev) => !prev);
  }, []);

  const adminLogout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      clearActiveAdminUser();
    } catch (_) {}
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      setIsAdminMode(isLocal);
    } else {
      setIsAdminMode(false);
    }
  }, []);

  // Full composite data for consumption
  const allData = {
    ...antigravityData,
    stage3,
    stage4: {
      ...antigravityData.stage4,
      clients: clients as any,
    },
  } as typeof antigravityData;

  return (
    <PortfolioDataContext.Provider
      value={{
        stage3,
        clients,
        about,
        heroWorks,
        clientLogos,
        portfolioIntro,
        portfolioRunner,
        heroBanner,
        allData,
        trashItems,
        moveToTrash,
        restoreFromTrash,
        permanentDeleteFromTrash,
        emptyTrash,
        updateStage3Video,
        removeStage3Video,
        updateClientDescription,
        addClientWork,
        autoMigrateBase64Works,
        updateClientWork,
        deleteClientWork,
        addClientFolder,
        updateClientFolder,
        deleteClientFolder,
        updateAboutData,
        updateHeroWorksData,
        updateClientLogosData,
        updatePortfolioIntroData,
        updatePortfolioRunnerData,
        addPortfolioRunnerItem,
        editPortfolioRunnerItem,
        deletePortfolioRunnerItem,
        resetPortfolioRunner,
        updateHeroBannerData,
        resetPortfolioData,
        isAdminMode,
        setIsAdminMode,
        toggleAdminMode,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        adminLogout,
        isCloudSyncActive,
      }}
    >
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    throw new Error("usePortfolioData must be used within a PortfolioDataProvider");
  }
  return context;
}


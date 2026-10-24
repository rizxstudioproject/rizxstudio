"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { antigravityData } from "@/data/projectsData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { saveStage3ImageToDB, getStage3ImageFromDB, clearStage3ImageFromDB } from "@/lib/sequenceStorage";
import { getAdminCredentials } from "@/lib/adminAuth";

const STORAGE_KEY = "rizx_portfolio_custom_data_v1";
const SESSION_KEY = "rizx_admin_session";

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
  sequenceTotalFrames: 121,
  sequenceFolder: "/sequence",
  sequencePattern: "frame_{padded}.webp",
  sequencePadding: 6,
  sequenceStartIndex: 0,
  sequenceCustomFrames: [],
  sequenceMouseTracking: true,
  sequenceMouseIntensity: 26,
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
    "Creative Direction",
    "Motion Graphics",
    "Branding & Identity",
    "UI/UX Design",
    "Digital Advertising",
    "Video Production",
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
      image: "/assets/antigravity/selected-brand-identity.jpg",
      gradient: "from-red-600/60 to-black",
    },
    {
      id: "d2",
      title: "Campaign Visuals",
      category: "Campaign Visuals",
      image: "/assets/antigravity/selected-campaign-visuals.jpg",
      gradient: "from-blue-600/60 to-black",
    },
    {
      id: "d3",
      title: "Motion Graphics",
      category: "Motion Graphics",
      image: "/assets/antigravity/selected-motion-graphics.jpg",
      gradient: "from-amber-500/60 to-black",
    },
    {
      id: "d4",
      title: "3D Design",
      category: "3D Design",
      image: "/assets/antigravity/selected-3d-design.jpg",
      gradient: "from-pink-500/60 to-black",
    },
    {
      id: "d5",
      title: "UI/UX Design",
      category: "UI/UX Design",
      image: "/assets/antigravity/selected-uiux-design.jpg",
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
    { id: "o1", title: "Branding", image: "/assets/antigravity/selected-brand-identity.jpg", rotate: -8 },
    { id: "o2", title: "Motion", image: "/assets/antigravity/selected-motion-graphics.jpg", rotate: -3 },
    { id: "o3", title: "UI/UX", image: "/assets/antigravity/selected-uiux-design.jpg", rotate: 3 },
    { id: "o4", title: "AI Visuals", image: "/assets/antigravity/selected-3d-design.jpg", rotate: 7 },
  ],
};

export interface ClientLogoItem {
  id: string;
  name: string;
  file: string;
  row: 1 | 2;
}

export interface ClientLogosData {
  subtitle: string;
  logos: ClientLogoItem[];
}

export const defaultClientLogosData: ClientLogosData = {
  subtitle: "Selected Clients & Creative Collaborations",
  logos: [
    { id: "cl-1", name: "Tokopedia", file: "/logos/logo_01.svg", row: 1 },
    { id: "cl-2", name: "11ST", file: "/logos/logo_02.svg", row: 1 },
    { id: "cl-3", name: "Samsung", file: "/logos/logo_03.svg", row: 1 },
    { id: "cl-4", name: "Nexon", file: "/logos/logo_04.svg", row: 1 },
    { id: "cl-5", name: "Client", file: "/logos/logo_05.svg", row: 1 },
    { id: "cl-6", name: "TruCarbon", file: "/logos/logo_06.svg", row: 1 },
    { id: "cl-7", name: "Client", file: "/logos/logo_07.svg", row: 1 },
    { id: "cl-8", name: "Client", file: "/logos/logo_07-1.svg", row: 1 },
    { id: "cl-9", name: "Client", file: "/logos/logo_08.svg", row: 1 },
    { id: "cl-10", name: "SuperSmart", file: "/logos/logo_09.svg", row: 1 },
    { id: "cl-11", name: "Asian Trust Capital", file: "/logos/logo_10.svg", row: 1 },
    { id: "cl-12", name: "Client", file: "/logos/logo_11.svg", row: 1 },
    { id: "cl-13", name: "Client", file: "/logos/logo_12.svg", row: 1 },
    { id: "cl-14", name: "Client", file: "/logos/logo_13.svg", row: 1 },
    { id: "cl-15", name: "EDUF", file: "/logos/logo_14.svg", row: 1 },
    { id: "cl-16", name: "Client", file: "/logos/logo_15.svg", row: 1 },
    { id: "cl-17", name: "Client", file: "/logos/logo_16.svg", row: 2 },
    { id: "cl-18", name: "Client", file: "/logos/logo_17.svg", row: 2 },
    { id: "cl-19", name: "Client", file: "/logos/logo_18.svg", row: 2 },
    { id: "cl-20", name: "Client", file: "/logos/logo_19.svg", row: 2 },
    { id: "cl-21", name: "KB Bukopin", file: "/logos/logo_20.svg", row: 2 },
    { id: "cl-22", name: "Burger King", file: "/logos/logo_21.svg", row: 2 },
    { id: "cl-23", name: "Client", file: "/logos/logo_22.svg", row: 2 },
    { id: "cl-24", name: "Withings", file: "/logos/logo_23.svg", row: 2 },
    { id: "cl-25", name: "Client", file: "/logos/logo_24.svg", row: 2 },
    { id: "cl-26", name: "Client", file: "/logos/logo_25.svg", row: 2 },
    { id: "cl-27", name: "LINE", file: "/logos/logo_26.svg", row: 2 },
    { id: "cl-28", name: "Client", file: "/logos/logo_26-1.svg", row: 2 },
    { id: "cl-29", name: "Kotra", file: "/logos/logo_27.svg", row: 2 },
    { id: "cl-30", name: "WebToon", file: "/logos/logo_28.svg", row: 2 },
    { id: "cl-31", name: "Shortiz", file: "/logos/logo_29.svg", row: 2 },
    { id: "cl-32", name: "iLOTTE", file: "/logos/logo_30.svg", row: 2 },
    { id: "cl-33", name: "Client", file: "/logos/logo_31.svg", row: 2 },
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
    { id: "pr-1", title: "KIA EV2 Concept", category: "Automotive", image: "/works/client-KIA/KIA EV2_B.jpg", row: 1 },
    { id: "pr-2", title: "Brand Identity", category: "Branding", image: "/assets/antigravity/selected-brand-identity.jpg", row: 1 },
    { id: "pr-3", title: "Burger King Campaign", category: "Campaign", image: "/works/client-Burger King/Burger_ads06.jpg", row: 1 },
    { id: "pr-4", title: "UI/UX Design Platform", category: "UI/UX", image: "/assets/antigravity/selected-uiux-design.jpg", row: 1 },
    { id: "pr-5", title: "Xeilos Digital Ad", category: "Advertising", image: "/works/client-Xeilos/ad01.jpg", row: 1 },
    { id: "pr-6", title: "KIA PBV Concept", category: "Automotive", image: "/works/client-KIA/KIA PBV_A.jpg", row: 1 },
    { id: "pr-7", title: "Motion Graphics Visual", category: "Motion", image: "/assets/antigravity/selected-motion-graphics.jpg", row: 1 },
    { id: "pr-8", title: "Social Content Series", category: "Social Media", image: "/works/client-Hyashop/01A.jpg", row: 1 },

    // Row 2
    { id: "pr-9", title: "Digital Campaign Suite", category: "Advertising", image: "/works/client-Xeilos/ad07.jpg", row: 2 },
    { id: "pr-10", title: "Lifestyle Visuals", category: "Social Media", image: "/works/client-Hyashop/1952.jpg", row: 2 },
    { id: "pr-11", title: "KIA EV2 Emerald Edition", category: "Automotive", image: "/works/client-KIA/KIA EV2_G.jpg", row: 2 },
    { id: "pr-12", title: "Burger King Visuals", category: "Campaign", image: "/works/client-Burger King/Burger_ads07.jpg", row: 2 },
    { id: "pr-13", title: "Creative Flagship Banner", category: "Brand Vision", image: "/assets/antigravity/hero-large.jpg", row: 2 },
    { id: "pr-14", title: "Permifast Brand Campaign", category: "Brand Identity", image: "/works/client-Permifast/Permifast04.jpg", row: 2 },
    { id: "pr-15", title: "3D Spatial Design", category: "3D Design", image: "/assets/antigravity/selected-3d-design.jpg", row: 2 },
    { id: "pr-16", title: "Campaign Motion Reel", category: "Visuals", image: "/assets/antigravity/selected-campaign-visuals.jpg", row: 2 },
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
  updateClientWork: (clientId: string, updatedWork: any) => void;
  deleteClientWork: (clientId: string, workId: string) => void;
  addClientFolder: (folder: { clientName: string; category: string; description?: string }) => void;
  updateClientFolder: (clientId: string, updates: { clientName?: string; category?: string; logo?: string }) => void;
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
          const parsed = JSON.parse(stored);
          if (parsed.stage3) {
            const raw = parsed.stage3.heroCard?.image;
            const validImage = (raw && raw !== "/assets/antigravity/hero-large.jpg") ? raw : "";
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
          const parsed = JSON.parse(stored);
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
      } catch (err) {
        console.warn("Failed to persist portfolio overrides to localStorage:", err);
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
        const parsed = JSON.parse(stored);
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
          const validImg = (rawImg && rawImg !== "/assets/antigravity/hero-large.jpg") ? rawImg : "";

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
          const customFolders = parsed.clients.filter(
            (c: any) =>
              c.isCustom === true &&
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

          const finalInitialClients = [...(mergedClients as ClientItem[]), ...customClientItems];
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
          const loadedClientLogos = {
            ...defaultClientLogosData,
            ...parsed.clientLogos,
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
          const loadedPortfolioRunner = {
            ...defaultPortfolioRunnerData,
            ...parsed.portfolioRunner,
          };
          setPortfolioRunner(loadedPortfolioRunner);
          portfolioRunnerRef.current = loadedPortfolioRunner;
        }

        if (parsed.heroBanner) {
          const loadedHeroBanner = {
            ...defaultHeroBannerData,
            ...parsed.heroBanner,
          };
          setHeroBanner(loadedHeroBanner);
          heroBannerRef.current = loadedHeroBanner;
        }
      }

      // Check IndexedDB backup for Stage 3 custom image ONLY IF not already loaded/configured from localStorage
      const hasLocalStorageData = localStorage.getItem(STORAGE_KEY) !== null;
      if (!hasLocalStorageData) {
        getStage3ImageFromDB().then((cachedImg) => {
          if (cachedImg) {
            setStage3((prev) => {
              if (!prev.heroCard.image || prev.heroCard.image === "/assets/antigravity/hero-large.jpg") {
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

    // 2. Fetch live data from Supabase Cloud if credentials are provided
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const fetchCloudData = async () => {
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
                !heroData.image_url || heroData.image_url === "/assets/antigravity/hero-large.jpg"
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
            // Extract Stage 3 Showcase config from Supabase if present
            const stage3Row = clientRows.find((r) => r.client_id === "site-stage3-showcase");
            if (stage3Row && stage3Row.description) {
              try {
                const parsedStage3 = JSON.parse(stage3Row.description);
                setStage3((prev) => {
                  const rawParsedImg = parsedStage3.heroCard?.image;
                  const cloudImg =
                    !rawParsedImg || rawParsedImg === "/assets/antigravity/hero-large.jpg"
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
                  persistState(updated);
                  return updated;
                });
              } catch (_) {}
            }

            // 0. Extract About Section config from Supabase if present
            const aboutRow = clientRows.find((r) => r.client_id === "site-about-section");
            let latestAbout = defaultAboutData;
            if (aboutRow && aboutRow.description) {
              try {
                const parsedAbout = JSON.parse(aboutRow.description);
                latestAbout = {
                  ...defaultAboutData,
                  ...parsedAbout,
                };
                setAbout(latestAbout);
                aboutRef.current = latestAbout;
              } catch (_) {}
            }

            // Extract Hero & Works Section config from Supabase
            const heroWorksRow = clientRows.find((r) => r.client_id === "site-hero-works");
            if (heroWorksRow && heroWorksRow.description) {
              try {
                const parsedHero = JSON.parse(heroWorksRow.description);
                const loadedHero = {
                  ...defaultHeroWorksData,
                  ...parsedHero,
                };
                setHeroWorks(loadedHero);
                heroWorksRef.current = loadedHero;
              } catch (_) {}
            }

            // Extract Client Logos config from Supabase
            const clientLogosRow = clientRows.find((r) => r.client_id === "site-client-logos");
            if (clientLogosRow && clientLogosRow.description) {
              try {
                const parsedLogos = JSON.parse(clientLogosRow.description);
                const loadedLogos = {
                  ...defaultClientLogosData,
                  ...parsedLogos,
                };
                setClientLogos(loadedLogos);
                clientLogosRef.current = loadedLogos;
              } catch (_) {}
            }

            // Extract Portfolio Intro config from Supabase
            const portfolioIntroRow = clientRows.find((r) => r.client_id === "site-portfolio-intro");
            if (portfolioIntroRow && portfolioIntroRow.description) {
              try {
                const parsedIntro = JSON.parse(portfolioIntroRow.description);
                const loadedIntro = {
                  ...defaultPortfolioIntroData,
                  ...parsedIntro,
                };
                setPortfolioIntro(loadedIntro);
                portfolioIntroRef.current = loadedIntro;
              } catch (_) {}
            }

            // Extract Portfolio Runner config from Supabase
            const portfolioRunnerRow = clientRows.find((r) => r.client_id === "site-portfolio-runner");
            if (portfolioRunnerRow && portfolioRunnerRow.description) {
              try {
                const parsedRunner = JSON.parse(portfolioRunnerRow.description);
                const loadedRunner = {
                  ...defaultPortfolioRunnerData,
                  ...parsedRunner,
                };
                setPortfolioRunner(loadedRunner);
                portfolioRunnerRef.current = loadedRunner;
              } catch (_) {}
            }

            // Extract Hero Banner config from Supabase
            const heroBannerRow = clientRows.find((r) => r.client_id === "site-hero-banner");
            if (heroBannerRow && heroBannerRow.description) {
              try {
                const parsedHeroBanner = JSON.parse(heroBannerRow.description);
                const loadedBanner = {
                  ...defaultHeroBannerData,
                  ...parsedHeroBanner,
                };
                setHeroBanner(loadedBanner);
                heroBannerRef.current = loadedBanner;
              } catch (_) {}
            }

            // Extract Admin Credentials config from Supabase
            const credsRow = clientRows.find((r) => r.client_id === "site-admin-credentials");
            if (credsRow && credsRow.description) {
              try {
                const parsedCreds = JSON.parse(credsRow.description);
                if (parsedCreds.username && parsedCreds.password && typeof window !== "undefined") {
                  localStorage.setItem("rizx_admin_credentials", JSON.stringify(parsedCreds));
                }
              } catch (_) {}
            }

            // Exclude system keys from regular client folders list
            const regularClientRows = clientRows.filter(
              (r) =>
                r.client_id !== "site-about-section" &&
                r.client_id !== "site-hero-works" &&
                r.client_id !== "site-client-logos" &&
                r.client_id !== "site-portfolio-intro" &&
                r.client_id !== "site-portfolio-runner" &&
                r.client_id !== "site-hero-banner" &&
                r.client_id !== "site-stage3-showcase" &&
                r.client_id !== "site-admin-credentials"
            );

            const defaultClients = antigravityData.stage4.clients;
            const defaultIds = new Set(defaultClients.map((d) => d.id));

            // Helper to parse description JSON or plain text
            const parseRowData = (row: any, fallbackClient?: any) => {
              let text = "";
              let tools: string[] = fallbackClient?.tools || [];
              let works: any[] = fallbackClient?.works || [];
              let isCustom = fallbackClient?.isCustom || false;
              let logo = fallbackClient?.logo || "";

              if (row && row.description) {
                if (typeof row.description === "string" && row.description.startsWith("{")) {
                  try {
                    const parsed = JSON.parse(row.description);
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

            // 1. Update existing default clients
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

            // 2. Extract cloud-only custom folders (rows not in defaultClients)
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
            ];
            setClients(finalClients);
            clientsRef.current = finalClients;
            try {
              persistState(undefined, finalClients);
            } catch (_) {}
          }

          setIsCloudSyncActive(true);
        } catch (err) {
          console.warn("Supabase initial fetch notice:", err);
        }
      };

      fetchCloudData();
    }
  }, []);

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
      await supabase.from("client_descriptions").upsert({
        client_id: clientItem.id,
        client_name: clientItem.clientName,
        category: clientItem.category || `Portfolio — ${clientItem.clientName}`,
        description: descPayload,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Supabase client sync error:", err);
    }
  }, []);

  // Update Client / Brand Description & Tools Used
  const updateClientDescription = useCallback(
    async (clientId: string, description: string, tools?: string[]) => {
      const updatedClients = clients.map((client) => {
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
      persistState(stage3, updatedClients);

      const clientObj = updatedClients.find((c) => c.id === clientId);
      if (clientObj) {
        syncClientToCloud(clientObj);
      }
    },
    [stage3, clients, persistState, syncClientToCloud]
  );

  // Add a new portfolio work item to a client folder
  const addClientWork = useCallback(
    async (clientId: string, newWork: any) => {
      const updatedClients = clients.map((client) => {
        if (client.id === clientId) {
          const updatedWorks = [newWork, ...(client.works || [])];
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
    async (folder: { clientName: string; category: string; description?: string }) => {
      const newId = `client-custom-${Date.now()}`;
      const newClient: ClientItem = {
        id: newId,
        clientName: folder.clientName,
        category: folder.category || `Portfolio — ${folder.clientName}`,
        logo: "",
        color: "from-[#16b09f]/20 via-neutral-900/40 to-neutral-900",
        itemsCount: 0,
        description: folder.description || "",
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
    async (clientId: string, updates: { clientName?: string; category?: string; logo?: string }) => {
      const updatedClients = clients.map((c) => {
        if (c.id === clientId) {
          const newName = updates.clientName !== undefined ? updates.clientName.trim() : c.clientName;
          const newCategory =
            updates.category !== undefined && updates.category.trim() !== ""
              ? updates.category.trim()
              : (updates.clientName ? `Portfolio — ${newName}` : c.category);
          const newLogo = updates.logo !== undefined ? updates.logo : (c.logo || "");
          return {
            ...c,
            clientName: newName,
            category: newCategory,
            logo: newLogo,
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
      const updated: ClientLogosData = {
        ...clientLogos,
        ...newData,
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
      const updated: PortfolioRunnerData = {
        ...portfolioRunner,
        ...newData,
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
        items: portfolioRunner.items.map((i) => (i.id === id ? { ...i, ...updatedFields } : i)),
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


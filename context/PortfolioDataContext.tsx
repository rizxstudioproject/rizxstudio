"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { antigravityData } from "@/data/projectsData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const STORAGE_KEY = "rizx_portfolio_custom_data_v1";
const SESSION_KEY = "rizx_admin_session";

export interface Stage3HeroCard {
  image: string;
  title: string;
  category: string;
  aspectRatio: string;
  youtubeUrl?: string;
  videoId?: string;
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
    { id: 1, text: "@rizx", color: "bg-[#14AF9E] text-white border-[#14AF9E]" },
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
  allData: typeof antigravityData;
  updateStage3Video: (params: {
    youtubeUrl: string;
    videoId?: string;
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
  updateClientFolder: (clientId: string, updates: { clientName: string; category?: string }) => void;
  deleteClientFolder: (clientId: string) => void;
  updateAboutData: (newData: Partial<AboutData>) => void;
  updateHeroWorksData: (newData: Partial<HeroWorksData>) => void;
  updateClientLogosData: (newData: Partial<ClientLogosData>) => void;
  updatePortfolioIntroData: (newData: Partial<PortfolioIntroData>) => void;
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

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
  const [stage3, setStage3] = useState(antigravityData.stage3);
  const [clients, setClients] = useState<ClientItem[]>(antigravityData.stage4.clients as ClientItem[]);
  const [about, setAbout] = useState<AboutData>(defaultAboutData);
  const [heroWorks, setHeroWorks] = useState<HeroWorksData>(defaultHeroWorksData);
  const [clientLogos, setClientLogos] = useState<ClientLogosData>(defaultClientLogosData);
  const [portfolioIntro, setPortfolioIntro] = useState<PortfolioIntroData>(defaultPortfolioIntroData);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(isSupabaseConfigured);

  // Auto-detect environment:
  // On localhost -> Open Admin Login directly as requested.
  // On live domain (rizxstudio.com) -> NEVER show admin login by default (only via ?admin=true or shortcut).
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const params = new URLSearchParams(window.location.search);
      const adminRequested = params.get("login") === "secret";

      if (isLocal || adminRequested) {
        setIsAdminMode(true);
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
      newStage3: typeof stage3,
      newClients: ClientItem[],
      newAbout?: AboutData,
      newHeroWorks?: HeroWorksData,
      newClientLogos?: ClientLogosData,
      newPortfolioIntro?: PortfolioIntroData
    ) => {
      try {
        const payload = {
          stage3: newStage3,
          about: newAbout || about,
          heroWorks: newHeroWorks || heroWorks,
          clientLogos: newClientLogos || clientLogos,
          portfolioIntro: newPortfolioIntro || portfolioIntro,
          clients: newClients.map((c) => ({
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
    [about, heroWorks, clientLogos, portfolioIntro]
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
          const vEnabled = parsedHero.isVideoEnabled ?? false;

          setStage3({
            ...antigravityData.stage3,
            ...parsed.stage3,
            heroCard: {
              ...defaultHero,
              ...parsedHero,
              youtubeUrl: ytUrl,
              videoId: vId,
              isVideoEnabled: vEnabled,
            },
          });
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
            color: c.color || "from-[#14AF9E]/20 via-neutral-900/40 to-neutral-900",
            itemsCount: Array.isArray(c.works) ? c.works.length : 0,
            description: c.description || "",
            tools: Array.isArray(c.tools) ? c.tools : [],
            works: Array.isArray(c.works) ? c.works : [],
            isCustom: true,
          }));

          setClients([...(mergedClients as ClientItem[]), ...customClientItems]);
        }

        if (parsed.about) {
          setAbout({
            ...defaultAboutData,
            ...parsed.about,
          });
        }

        if (parsed.heroWorks) {
          setHeroWorks({
            ...defaultHeroWorksData,
            ...parsed.heroWorks,
          });
        }

        if (parsed.clientLogos) {
          setClientLogos({
            ...defaultClientLogosData,
            ...parsed.clientLogos,
          });
        }

        if (parsed.portfolioIntro) {
          setPortfolioIntro({
            ...defaultPortfolioIntroData,
            ...parsed.portfolioIntro,
          });
        }
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
            setStage3((prev) => ({
              ...prev,
              headline: heroData.headline || prev.headline,
              classTag: heroData.class_tag || heroData.classTag || prev.classTag,
              heroCard: {
                ...prev.heroCard,
                title: heroData.title || prev.heroCard.title,
                category: heroData.category || prev.heroCard.category,
                description: heroData.description || prev.heroCard.description,
                youtubeUrl: heroData.youtube_url ?? prev.heroCard.youtubeUrl,
                videoId: heroData.video_id ?? prev.heroCard.videoId,
                isVideoEnabled: heroData.is_video_enabled ?? prev.heroCard.isVideoEnabled,
              },
            }));
          }

          // Fetch Client Descriptions & custom works
          const { data: clientRows, error: clientsError } = await client
            .from("client_descriptions")
            .select("*");

          if (!clientsError && clientRows && Array.isArray(clientRows)) {
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
              } catch (_) {}
            }

            // Extract Hero & Works Section config from Supabase
            const heroWorksRow = clientRows.find((r) => r.client_id === "site-hero-works");
            if (heroWorksRow && heroWorksRow.description) {
              try {
                const parsedHero = JSON.parse(heroWorksRow.description);
                setHeroWorks({
                  ...defaultHeroWorksData,
                  ...parsedHero,
                });
              } catch (_) {}
            }

            // Extract Client Logos config from Supabase
            const clientLogosRow = clientRows.find((r) => r.client_id === "site-client-logos");
            if (clientLogosRow && clientLogosRow.description) {
              try {
                const parsedLogos = JSON.parse(clientLogosRow.description);
                setClientLogos({
                  ...defaultClientLogosData,
                  ...parsedLogos,
                });
              } catch (_) {}
            }

            // Extract Portfolio Intro config from Supabase
            const portfolioIntroRow = clientRows.find((r) => r.client_id === "site-portfolio-intro");
            if (portfolioIntroRow && portfolioIntroRow.description) {
              try {
                const parsedIntro = JSON.parse(portfolioIntroRow.description);
                setPortfolioIntro({
                  ...defaultPortfolioIntroData,
                  ...parsedIntro,
                });
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

              if (row && row.description) {
                if (typeof row.description === "string" && row.description.startsWith("{")) {
                  try {
                    const parsed = JSON.parse(row.description);
                    text = parsed.text !== undefined ? parsed.text : row.description;
                    if (Array.isArray(parsed.tools) && parsed.tools.length > 0) tools = parsed.tools;
                    if (Array.isArray(parsed.works) && parsed.works.length > 0) works = parsed.works;
                    if (parsed.isCustom !== undefined) isCustom = parsed.isCustom;
                  } catch (_) {
                    text = row.description;
                  }
                } else {
                  text = row.description;
                }
              }
              if (Array.isArray(row.tools) && row.tools.length > 0) tools = row.tools;
              if (Array.isArray(row.works) && row.works.length > 0) works = row.works;

              return { text, tools, works, isCustom };
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
                  logo: "",
                  color: "from-[#14AF9E]/20 via-neutral-900/40 to-neutral-900",
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
            try {
              persistState(stage3, finalClients);
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

  // Update YouTube Video Settings for Flagship Showcase
  const updateStage3Video = useCallback(
    async (params: {
      youtubeUrl: string;
      videoId?: string;
      title?: string;
      category?: string;
      description?: string;
      headline?: string;
      classTag?: string;
      isVideoEnabled?: boolean;
    }) => {
      const computedId = params.videoId || extractYouTubeId(params.youtubeUrl);
      const newTitle = params.title !== undefined ? params.title : stage3.heroCard.title;
      const newCat = params.category !== undefined ? params.category : stage3.heroCard.category;
      const newDesc = params.description !== undefined ? params.description : stage3.heroCard.description;
      const newHeadline = params.headline !== undefined ? params.headline : stage3.headline;
      const newClassTag = params.classTag !== undefined ? params.classTag : stage3.classTag;
      const newEnabled = true;

      const updatedStage3 = {
        ...stage3,
        classTag: newClassTag,
        headline: newHeadline,
        heroCard: {
          ...stage3.heroCard,
          youtubeUrl: params.youtubeUrl,
          videoId: computedId,
          title: newTitle,
          category: newCat,
          description: newDesc,
          isVideoEnabled: newEnabled,
        },
      };

      setStage3(updatedStage3);
      persistState(updatedStage3, clients);

      // Async sync to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        try {
          await client.from("flagship_showcase").upsert({
            id: "default",
            title: newTitle,
            category: newCat,
            description: newDesc,
            headline: newHeadline,
            class_tag: newClassTag,
            youtube_url: params.youtubeUrl,
            video_id: computedId,
            is_video_enabled: newEnabled,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Supabase flagship_showcase sync error:", err);
        }
      }
    },
    [stage3, clients, persistState]
  );

  // Remove YouTube Video from Flagship Showcase
  const removeStage3Video = useCallback(async () => {
    const updatedStage3 = {
      ...stage3,
      heroCard: {
        ...stage3.heroCard,
        youtubeUrl: "",
        videoId: "",
        isVideoEnabled: false,
      },
    };

    setStage3(updatedStage3);
    persistState(updatedStage3, clients);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        await client.from("flagship_showcase").upsert({
          id: "default",
          youtube_url: "",
          video_id: "",
          is_video_enabled: false,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Supabase remove video error:", err);
      }
    }
  }, [stage3, clients, persistState]);

  // Helper to sync client data to Supabase using only available columns
  const syncClientToCloud = useCallback(async (clientItem: ClientItem) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const descPayload = JSON.stringify({
        text: clientItem.description || "",
        tools: clientItem.tools || [],
        works: clientItem.works || [],
        isCustom: Boolean(clientItem.isCustom),
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
        color: "from-[#14AF9E]/20 via-neutral-900/40 to-neutral-900",
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

  // Edit / Rename an existing client folder
  const updateClientFolder = useCallback(
    async (clientId: string, updates: { clientName: string; category?: string }) => {
      const updatedClients = clients.map((c) => {
        if (c.id === clientId) {
          const newName = updates.clientName.trim();
          const newCategory = updates.category !== undefined && updates.category.trim() !== ""
            ? updates.category.trim()
            : `Portfolio — ${newName}`;
          return {
            ...c,
            clientName: newName,
            category: newCategory,
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
      persistState(stage3, clients, about, updated, clientLogos, portfolioIntro);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-hero-works",
            client_name: "Hero & Selected Works",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          });
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
      persistState(stage3, clients, about, heroWorks, updated, portfolioIntro);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-client-logos",
            client_name: "Client Logos Marquee",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          });
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
      persistState(stage3, clients, about, heroWorks, clientLogos, updated);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("client_descriptions").upsert({
            client_id: "site-portfolio-intro",
            client_name: "Portfolio Intro Header",
            category: "Site Section Config",
            description: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Supabase portfolio intro update notice:", err);
        }
      }
    },
    [portfolioIntro, stage3, clients, about, heroWorks, clientLogos, persistState]
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
        allData,
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

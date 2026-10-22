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

interface PortfolioDataContextType {
  stage3: {
    classTag: string;
    headline: string;
    heroCard: Stage3HeroCard;
  };
  clients: ClientItem[];
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
  deleteClientWork: (clientId: string, workId: string) => void;
  addClientFolder: (folder: { clientName: string; category: string; description?: string }) => void;
  deleteClientFolder: (clientId: string) => void;
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
      const adminRequested = params.get("admin") === "true" || params.get("admin") === "1";

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
  const persistState = useCallback((newStage3: typeof stage3, newClients: ClientItem[]) => {
    try {
      const payload = {
        stage3: newStage3,
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
  }, []);

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
          const ytUrl = parsedHero.youtubeUrl || defaultHero.youtubeUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
          const vId = parsedHero.videoId || extractYouTubeId(ytUrl) || defaultHero.videoId || "dQw4w9WgXcQ";
          const vEnabled = true;

          setStage3({
            ...antigravityData.stage3,
            ...parsed.stage3,
            heroCard: {
              ...defaultHero,
              ...parsedHero,
              youtubeUrl: ytUrl,
              videoId: vId,
              isVideoEnabled: true,
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
                youtubeUrl: heroData.youtube_url || prev.heroCard.youtubeUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                videoId: heroData.video_id || extractYouTubeId(heroData.youtube_url || "") || prev.heroCard.videoId || "dQw4w9WgXcQ",
                isVideoEnabled: true,
              },
            }));
          }

          // Fetch Client Descriptions & custom works
          const { data: clientRows, error: clientsError } = await client
            .from("client_descriptions")
            .select("*");

          if (!clientsError && clientRows && Array.isArray(clientRows)) {
            setClients((prev) =>
              prev.map((c) => {
                const match = clientRows.find((r) => r.client_id === c.id);
                if (!match) return c;
                const cloudWorks = Array.isArray(match.works) && match.works.length > 0 ? match.works : c.works;
                return {
                  ...c,
                  description: match.description !== undefined ? match.description : c.description,
                  tools: Array.isArray(match.tools) && match.tools.length > 0 ? match.tools : c.tools,
                  works: cloudWorks,
                  itemsCount: cloudWorks.length,
                };
              })
            );
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

      // Async sync to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        try {
          const clientObj = updatedClients.find((c) => c.id === clientId);
          await client.from("client_descriptions").upsert({
            client_id: clientId,
            client_name: clientObj ? clientObj.clientName : clientId,
            category: clientObj ? clientObj.category : "",
            description: description,
            tools: clientObj?.tools || [],
            works: clientObj?.works || [],
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Supabase client_descriptions sync error:", err);
        }
      }
    },
    [stage3, clients, persistState]
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

      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        try {
          const clientObj = updatedClients.find((c) => c.id === clientId);
          await client.from("client_descriptions").upsert({
            client_id: clientId,
            client_name: clientObj ? clientObj.clientName : clientId,
            category: clientObj ? clientObj.category : "",
            description: clientObj?.description || "",
            works: clientObj?.works || [],
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Supabase add work sync notice:", err);
        }
      }
    },
    [stage3, clients, persistState]
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

      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        try {
          const clientObj = updatedClients.find((c) => c.id === clientId);
          await client.from("client_descriptions").upsert({
            client_id: clientId,
            client_name: clientObj ? clientObj.clientName : clientId,
            category: clientObj ? clientObj.category : "",
            description: clientObj?.description || "",
            works: clientObj?.works || [],
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Supabase delete work sync notice:", err);
        }
      }
    },
    [stage3, clients, persistState]
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

      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        try {
          await client.from("client_descriptions").upsert({
            client_id: newId,
            client_name: folder.clientName,
            category: folder.category || `Portfolio — ${folder.clientName}`,
            description: folder.description || "",
            works: [],
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Supabase add folder sync notice:", err);
        }
      }
    },
    [stage3, clients, persistState]
  );

  // Delete a client folder entirely (only admin-created ones are allowed to delete)
  const deleteClientFolder = useCallback(
    async (clientId: string) => {
      const updatedClients = clients.filter((c) => c.id !== clientId);
      setClients(updatedClients);
      persistState(stage3, updatedClients);

      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        try {
          await client.from("client_descriptions").delete().eq("client_id", clientId);
        } catch (err) {
          console.warn("Supabase delete folder sync notice:", err);
        }
      }
    },
    [stage3, clients, persistState]
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
        allData,
        updateStage3Video,
        removeStage3Video,
        updateClientDescription,
        addClientWork,
        deleteClientWork,
        addClientFolder,
        deleteClientFolder,
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

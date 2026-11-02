"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  RiAddFill as HiPlus,
  RiStarFill as HiStar,
  RiSearchFill as HiMagnifyingGlass,
  RiExternalLinkFill as HiArrowTopRightOnSquare,
  RiUpload2Fill as HiArrowUpTray,
  RiEditFill as HiPencilSquare,
  RiDeleteBinFill as HiTrash,
  RiGridFill as HiSquares2X2,
  RiMenu2Fill as HiBars3BottomLeft,
  RiCheckFill as HiCheck,
  RiCloseFill as HiXMark,
  RiSparklingFill as HiSparkles,
  RiFolderFill as HiFolder,
  RiPriceTag3Fill as HiTag,
  RiArrowLeftFill as HiArrowLeft,
  RiImageFill as HiPhoto,
  RiCameraFill as HiCamera,
} from "react-icons/ri";
import {
  SiFigma,
  SiBlender,
  SiCinema4D,
  SiGooglegemini,
} from "react-icons/si";
import { ClientItem, ClientLogoItem } from "@/context/PortfolioDataContext";
import { useLang } from "@/context/LanguageContext";
import { normalizeMediaUrl, getMediaFallbackUrls } from "@/lib/mediaService";
import { useMotionTheme } from "@/context/MotionThemeContext";

interface ClientsWorkspaceProps {
  clients: ClientItem[];
  searchQuery?: string;
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onOpenAddFolder: () => void;
  onOpenEditFolder: (client: ClientItem) => void;
  onDeleteFolder: (client: ClientItem) => void;
  onOpenUploadWork: (tools?: string[]) => void;
  onOpenEditWork: (work: any) => void;
  onDeleteWork: (clientId: string, workId: string, workTitle: string) => void;
  onSaveClientDescription: (clientId: string, desc: string, tools: string[], projectDesc?: string) => void;
  onUpdateClientFolder?: (clientId: string, updates: Partial<ClientItem>) => void;
  onReplaceCoverImage?: (clientId: string, file: File) => void;
  onViewWebsite?: () => void;
  showToast: (msg: string) => void;
  workspaceView?: "folders" | "logos";
  onWorkspaceViewChange?: (view: "folders" | "logos") => void;

  // Client Logos (Marquee) props
  clSubtitle?: string;
  setClSubtitle?: (val: string) => void;
  clLogos?: ClientLogoItem[];
  setClLogos?: React.Dispatch<React.SetStateAction<ClientLogoItem[]>>;
  newLogoName?: string;
  setNewLogoName?: (val: string) => void;
  newLogoRow?: 1 | 2;
  setNewLogoRow?: (val: 1 | 2) => void;
  newLogoFile?: string;
  setNewLogoFile?: (val: string) => void;
  onAddClientLogo?: () => void;
  onDeleteClientLogo?: (id: string) => void;
  onSaveClientLogos?: () => void;
  onCancelClientLogos?: () => void;
  onGenericImageFile?: (e: React.ChangeEvent<HTMLInputElement>, cb: (dataUrl: string) => void) => void;
}

export default function ClientsWorkspace({
  clients,
  searchQuery = "",
  selectedClientId,
  onSelectClient,
  onOpenAddFolder,
  onOpenEditFolder,
  onDeleteFolder,
  onOpenUploadWork,
  onOpenEditWork,
  onDeleteWork,
  onSaveClientDescription,
  onUpdateClientFolder,
  onReplaceCoverImage,
  onViewWebsite,
  showToast,
  clSubtitle = "SELECTED CLIENTS & CREATIVE COLLABORATIONS",
  setClSubtitle,
  clLogos = [],
  setClLogos,
  newLogoName = "",
  setNewLogoName,
  newLogoRow = 1,
  setNewLogoRow,
  newLogoFile = "",
  setNewLogoFile,
  onAddClientLogo,
  onDeleteClientLogo,
  onSaveClientLogos,
  onCancelClientLogos,
  onGenericImageFile,
  workspaceView: controlledWorkspaceView,
  onWorkspaceViewChange,
}: ClientsWorkspaceProps) {
  const { lang, tr } = useLang();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

  // Workspace subview: 'folders' (Client Folders & Works) | 'logos' (Client Logos Marquee)
  const [internalWorkspaceView, setInternalWorkspaceView] = useState<"folders" | "logos">("folders");
  const workspaceView = controlledWorkspaceView !== undefined ? controlledWorkspaceView : internalWorkspaceView;
  const setWorkspaceView = (v: "folders" | "logos") => {
    setInternalWorkspaceView(v);
    if (onWorkspaceViewChange) onWorkspaceViewChange(v);
  };

  // Mobile Master-Detail view: 'list' (Middle column list) | 'detail' (Main canvas workspace)
  const [mobileActiveView, setMobileActiveView] = useState<"list" | "detail">("list");

  // Logo panel filter & search
  const [logoRowTab, setLogoRowTab] = useState<"all" | "row1" | "row2">("all");
  const [logoSearch, setLogoSearch] = useState("");
  // Middle Column Filter Tab: 'all' | 'recent' | 'favorites'
  const [filterTab, setFilterTab] = useState<"all" | "recent" | "favorites">("all");
  const [clientSearch, setClientSearch] = useState("");

  // Favorites state (persisted locally)
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("rizx_admin_favorites");
      return saved ? JSON.parse(saved) : { "client-kia": true, "client-hyashop": true };
    } catch {
      return { "client-kia": true, "client-hyashop": true };
    }
  });

  const toggleFavorite = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [clientId]: !prev[clientId] };
      try {
        localStorage.setItem("rizx_admin_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Currently Selected Client
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  }, [clients, selectedClientId]);

  // Client initials for avatar badge (e.g. "KIA Dufour" -> "KD", "Hyashop" -> "HS")
  const clientInitials = useMemo(() => {
    if (!selectedClient?.clientName) return "RS";
    const parts = selectedClient.clientName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return selectedClient.clientName.slice(0, 2).toUpperCase();
  }, [selectedClient?.clientName]);

  // Form states for selected client detail
  const [categoryInput, setCategoryInput] = useState("");
  const [headlineInput, setHeadlineInput] = useState("PROFESSIONAL EXPERIENCE");
  const [projectDescInput, setProjectDescInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Mobile Text Edit Popup Modal State
  const [mobileTextModal, setMobileTextModal] = useState<{
    isOpen: boolean;
    title: string;
    value: string;
    maxLength?: number;
    isTextarea: boolean;
    onSave: (val: string) => void;
  }>({
    isOpen: false,
    title: "",
    value: "",
    isTextarea: false,
    onSave: () => {},
  });

  // Assets toolbar states
  const [assetSearch, setAssetSearch] = useState("");
  const [assetSort, setAssetSort] = useState<"newest" | "oldest" | "title">("newest");
  const [assetViewMode, setAssetViewMode] = useState<"grid" | "list">("grid");

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset immediately so selecting the exact same file again will always fire onChange
    e.target.value = "";
    if (!file || !selectedClient) return;

    const isSvg =
      file.type === "image/svg+xml" ||
      file.type.includes("svg") ||
      file.name.toLowerCase().endsWith(".svg");

    const isValidImage =
      file.type.startsWith("image/") ||
      file.type === "application/xml" ||
      file.type === "text/xml" ||
      isSvg;

    if (!isValidImage) {
      showToast(
        tr(
          "Harap pilih file gambar yang valid (PNG, JPG, SVG, WebP).",
          "Please choose a valid image file (PNG, JPG, SVG, WebP).",
          "Piliahlah file gambar nan valid (PNG, JPG, SVG, WebP)."
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let dataUrl = reader.result as string;
      if (!dataUrl) return;

      // Ensure SVG data URL always has the standard image/svg+xml MIME for reliable rendering
      if (isSvg && !dataUrl.startsWith("data:image/svg+xml") && dataUrl.startsWith("data:")) {
        dataUrl = dataUrl.replace(/^data:[^;]*;base64,/, "data:image/svg+xml;base64,");
      }

      if (onUpdateClientFolder) {
        onUpdateClientFolder(selectedClient.id, { logo: dataUrl });
        showToast(
          tr(
            `Foto profil / logo brand "${selectedClient.clientName}" berhasil diperbarui!`,
            `Brand profile / logo for "${selectedClient.clientName}" updated!`,
            `Foto profil / logo brand "${selectedClient.clientName}" barasil dipabarui!`
          )
        );
      }
    };
    reader.onerror = () => {
      showToast(
        tr(
          "Gagal membaca file gambar.",
          "Failed to read image file.",
          "Gagal mambaco file gambar."
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // Track last synced client ID so external data refreshes do NOT overwrite in-progress edits
  const lastSyncedClientIdRef = useRef<string | null>(null);

  // Sync inputs when the selected client ID switches or when client data hydrates from cloud/storage
  React.useEffect(() => {
    if (selectedClient) {
      if (selectedClient.id !== lastSyncedClientIdRef.current) {
        lastSyncedClientIdRef.current = selectedClient.id;
        setCategoryInput(selectedClient.category || `Digital Campaign - ${selectedClient.clientName}`);
        setProjectDescInput(selectedClient.projectDescription || "");
        setDescriptionInput(selectedClient.brandProfile || selectedClient.description || "");
        setSelectedTools(
          selectedClient.tools && selectedClient.tools.length > 0
            ? selectedClient.tools
            : ["Figma", "Photoshop", "Magnific AI"]
        );
      } else {
        // Hydrate if inputs were empty initially but arrived later from cloud/local storage
        if (!projectDescInput && selectedClient.projectDescription) {
          setProjectDescInput(selectedClient.projectDescription);
        }
        if (!descriptionInput && (selectedClient.brandProfile || selectedClient.description)) {
          setDescriptionInput(selectedClient.brandProfile || selectedClient.description || "");
        }
      }
    }
  }, [selectedClient?.id, selectedClient?.projectDescription, selectedClient?.brandProfile, selectedClient?.description]);

  // Filter clients for the middle column
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (
        !c.id ||
        c.id.startsWith("site-") ||
        c.id.startsWith("system-") ||
        c.id.startsWith("config-")
      ) {
        return false;
      }
      const matchSearch =
        !clientSearch ||
        c.clientName.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.category && c.category.toLowerCase().includes(clientSearch.toLowerCase()));

      if (!matchSearch) return false;

      if (filterTab === "favorites") {
        return !!favorites[c.id];
      }
      if (filterTab === "recent") {
        // First 3 clients as recent
        const idx = clients.findIndex((item) => item.id === c.id);
        return idx < 3;
      }
      return true;
    });
  }, [clients, clientSearch, filterTab, favorites]);

  // Count metrics for tabs (strictly genuine clients only)
  const validClientsCount = useMemo(() => {
    return clients.filter(
      (c) =>
        c.id &&
        !c.id.startsWith("site-") &&
        !c.id.startsWith("system-") &&
        !c.id.startsWith("config-")
    ).length;
  }, [clients]);

  const favoriteCount = useMemo(() => {
    return clients.filter(
      (c) =>
        c.id &&
        !c.id.startsWith("site-") &&
        !c.id.startsWith("system-") &&
        !c.id.startsWith("config-") &&
        favorites[c.id]
    ).length;
  }, [clients, favorites]);

  // Tools toggle helper
  const toggleTool = (toolName: string) => {
    const isAlreadySelected = selectedTools.some(
      (t) => t.toLowerCase() === toolName.toLowerCase()
    );
    let nextTools: string[];
    if (isAlreadySelected) {
      nextTools = selectedTools.filter(
        (t) => t.toLowerCase() !== toolName.toLowerCase()
      );
    } else {
      nextTools = [...selectedTools, toolName];
    }
    setSelectedTools(nextTools);

    if (selectedClient) {
      onSaveClientDescription(selectedClient.id, descriptionInput, nextTools, projectDescInput);
      if (onUpdateClientFolder) {
        onUpdateClientFolder(selectedClient.id, {
          tools: nextTools,
        });
      }
      showToast(`Updated tools: ${toolName}`);
    }
  };

  // Save Portfolio Information handler
  const handleSaveInfo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedClient) return;

    onSaveClientDescription(selectedClient.id, descriptionInput, selectedTools, projectDescInput);
    if (onUpdateClientFolder) {
      onUpdateClientFolder(selectedClient.id, {
        category: categoryInput.trim(),
        description: descriptionInput.trim(),
        brandProfile: descriptionInput.trim(),
        projectDescription: projectDescInput.trim(),
        tools: selectedTools,
      });
    }
    showToast(tr(
      `Informasi proyek & profil brand "${selectedClient.clientName}" berhasil disimpan!`,
      `Project & brand profile for "${selectedClient.clientName}" saved successfully!`,
      `Informasi proyek & profil brand "${selectedClient.clientName}" barasil disimpan!`
    ));
  };

  // Filter & sort assets
  const filteredWorks = useMemo(() => {
    if (!selectedClient?.works) return [];
    let list = [...selectedClient.works];

    if (assetSearch.trim()) {
      const q = assetSearch.toLowerCase();
      list = list.filter(
        (w) =>
          (w.title && w.title.toLowerCase().includes(q)) ||
          (w.type && w.type.toLowerCase().includes(q)) ||
          (w.year && String(w.year).includes(q))
      );
    }

    if (assetSort === "title") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (assetSort === "oldest") {
      list.reverse();
    }
    return list;
  }, [selectedClient?.works, assetSearch, assetSort]);

// Dynamic Tool Monogram & Palette Generator for any custom entered tools
function getToolMonogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const clean = name.trim().replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) {
    return clean[0].toUpperCase() + clean[1].toLowerCase();
  }
  return clean.toUpperCase() || "T";
}

const TOOL_PALETTES = [
  { bg: "bg-[#002B49]", border: "border-[#00D2FF]/40", text: "text-[#00D2FF]", badgeBg: "bg-[#00D2FF]", badgeText: "text-[#002B49]" },
  { bg: "bg-[#2A0E08]", border: "border-[#FF6B4A]/40", text: "text-[#FF6B4A]", badgeBg: "bg-gradient-to-br from-[#FF6B4A] to-[#FF3D00]", badgeText: "text-black" },
  { bg: "bg-[#1D0033]", border: "border-[#EA77FF]/40", text: "text-[#EA77FF]", badgeBg: "bg-[#EA77FF]", badgeText: "text-[#1D0033]" },
  { bg: "bg-[#00261A]", border: "border-[#10A37F]/40", text: "text-[#10A37F]", badgeBg: "bg-[#10A37F]", badgeText: "text-white" },
  { bg: "bg-[#2D0014]", border: "border-[#FF3366]/40", text: "text-[#FF3366]", badgeBg: "bg-[#FF3366]", badgeText: "text-[#2D0014]" },
  { bg: "bg-[#001E36]", border: "border-[#31A8FF]/40", text: "text-[#31A8FF]", badgeBg: "bg-[#31A8FF]", badgeText: "text-[#001E36]" },
  { bg: "bg-[#332005]", border: "border-[#F59E0B]/40", text: "text-[#F59E0B]", badgeBg: "bg-[#F59E0B]", badgeText: "text-black" },
  { bg: "bg-[#092E29]", border: "border-[#16b09f]/40", text: "text-[#16b09f]", badgeBg: "bg-[#16b09f]", badgeText: "text-black" },
];

function getToolPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TOOL_PALETTES[Math.abs(hash) % TOOL_PALETTES.length];
}

function ToolIcon({ name, isAi }: { name: string; isAi?: boolean }) {
  const n = name.toLowerCase().trim().replace(/\s+/g, "");

  if (n === "figma") {
    return <SiFigma className="w-3.5 h-3.5 text-[#F24E1E] shrink-0" />;
  }
  if (n === "photoshop" || n === "ps") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#31A8FF] text-[#001E36] font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        Ps
      </span>
    );
  }
  if (n === "illustrator" || n === "ai") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#FF9A00] text-[#330000] font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        Ai
      </span>
    );
  }
  if (n === "aftereffects" || n === "ae") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#9999FF] text-[#00005B] font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        Ae
      </span>
    );
  }
  if (n.includes("affinity")) {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#00D2FF] text-[#00223A] font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        Af
      </span>
    );
  }
  if (n === "indesign" || n === "id") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#FF3366] text-[#2D0014] font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        Id
      </span>
    );
  }
  if (n === "premiere" || n === "premierepro" || n === "pr") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#EA77FF] text-[#1D0033] font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        Pr
      </span>
    );
  }
  if (n === "digitalasset" || n === "digitalassets" || n === "asset" || n === "assets") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-[#10b981] to-[#0ea5e9] text-black font-black text-[8px] flex items-center justify-center font-mono shrink-0 shadow-sm leading-none">
        DA
      </span>
    );
  }
  if (n === "blender" || n === "blender3d") {
    return <SiBlender className="w-3.5 h-3.5 text-[#EA7600] shrink-0" />;
  }
  if (n === "cinema4d" || n === "c4d") {
    return <SiCinema4D className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />;
  }
  if (n.includes("higgsfield")) {
    return (
      <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-[#FF6B4A] to-[#FF3D00] text-black font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        H
      </span>
    );
  }
  if (n === "gpt" || n === "chatgpt" || n === "openai") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#10A37F] text-white font-black text-[8px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        GPT
      </span>
    );
  }
  if (n === "gemini" || n === "googlegemini") {
    return <SiGooglegemini className="w-3.5 h-3.5 text-[#799FFF] shrink-0" />;
  }
  if (n === "claude" || n === "claudeai") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#D97706] text-black font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        C
      </span>
    );
  }
  if (n.includes("runway")) {
    return (
      <span className="w-3.5 h-3.5 rounded bg-[#8B5CF6] text-white font-black text-[9px] flex items-center justify-center font-mono shrink-0 shadow-sm">
        R
      </span>
    );
  }
  if (n.includes("firefly")) {
    return <HiSparkles className="w-3.5 h-3.5 text-[#FF4081] shrink-0" />;
  }
  if (n.includes("magnific")) {
    return <HiSparkles className="w-3.5 h-3.5 text-[#16b09f] shrink-0" />;
  }
  if (n.includes("midjourney")) {
    return <HiSparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  }

  // Dynamic Monogram for custom tools (Affinity, TouchDesigner, etc.)
  const monogram = getToolMonogram(name);
  const palette = getToolPalette(name);

  return (
    <span
      className={`w-3.5 h-3.5 rounded ${palette.badgeBg} ${palette.badgeText} font-black text-[8.5px] flex items-center justify-center font-mono shrink-0 shadow-sm`}
    >
      {monogram}
    </span>
  );
}

  // Default Tools Catalog
  const DEFAULT_DESIGN_TOOLS = [
    "Figma",
    "Photoshop",
    "Illustrator",
    "After Effects",
    "Blender",
    "Digital Asset",
    "Cinema 4D",
    "InDesign",
  ];
  const DEFAULT_AI_TOOLS = [
    "Magnific AI",
    "Midjourney",
    "Higgsfield",
    "ChatGPT",
    "Gemini",
    "Firefly",
  ];

  // Persistent Tools Catalog with LocalStorage
  const [designTools, setDesignTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("rizx_custom_design_tools");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (!parsed.some((t: string) => t.toLowerCase() === "digital asset")) {
            parsed.push("Digital Asset");
            localStorage.setItem("rizx_custom_design_tools", JSON.stringify(parsed));
          }
          return parsed;
        }
      }
      return DEFAULT_DESIGN_TOOLS;
    } catch {
      return DEFAULT_DESIGN_TOOLS;
    }
  });

  const [aiTools, setAiTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("rizx_custom_ai_tools");
      return saved ? JSON.parse(saved) : DEFAULT_AI_TOOLS;
    } catch {
      return DEFAULT_AI_TOOLS;
    }
  });

  // Manage Tools Modal States
  const [isManageToolsOpen, setIsManageToolsOpen] = useState(false);
  const [tempDesignTools, setTempDesignTools] = useState<string[]>(DEFAULT_DESIGN_TOOLS);
  const [tempAiTools, setTempAiTools] = useState<string[]>(DEFAULT_AI_TOOLS);
  const [newToolName, setNewToolName] = useState("");
  const [newToolCategory, setNewToolCategory] = useState<"Design" | "AI">("Design");

  const openManageTools = () => {
    setTempDesignTools([...designTools]);
    setTempAiTools([...aiTools]);
    setNewToolName("");
    setNewToolCategory("Design");
    setIsManageToolsOpen(true);
  };

  const handleCancelManageTools = () => {
    setTempDesignTools([...designTools]);
    setTempAiTools([...aiTools]);
    setNewToolName("");
    setIsManageToolsOpen(false);
  };

  const handleAddTool = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newToolName.trim();
    if (!trimmed) {
      showToast(tr("Warning: Enter tool name first.", "Peringatan: Masukkan nama tool terlebih dahulu.", "Paringatan: Masuakkan namo tool talabiah dahulu."));
      return;
    }

    if (newToolCategory === "Design") {
      if (tempDesignTools.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        showToast(tr(`Tool "${trimmed}" already exists in Design.`, `Tool "${trimmed}" sudah ada di Design.`, `Tool "${trimmed}" lah ado di Design.`));
        return;
      }
      setTempDesignTools((prev) => [...prev, trimmed]);
    } else {
      if (tempAiTools.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        showToast(tr(`Tool "${trimmed}" already exists in AI.`, `Tool "${trimmed}" sudah ada di AI.`, `Tool "${trimmed}" lah ado di AI.`));
        return;
      }
      setTempAiTools((prev) => [...prev, trimmed]);
    }

    setNewToolName("");
    showToast(tr(`Added "${trimmed}" to ${newToolCategory}`, `Tool "${trimmed}" ditambahkan ke ${newToolCategory}`, `Tool "${trimmed}" ditambahkan ka ${newToolCategory}`));
  };

  const handleRemoveTempDesignTool = (toolName: string) => {
    setTempDesignTools((prev) => prev.filter((t) => t.toLowerCase() !== toolName.toLowerCase()));
  };

  const handleRemoveTempAiTool = (toolName: string) => {
    setTempAiTools((prev) => prev.filter((t) => t.toLowerCase() !== toolName.toLowerCase()));
  };

  const handleSaveManageTools = () => {
    setDesignTools(tempDesignTools);
    setAiTools(tempAiTools);

    try {
      localStorage.setItem("rizx_custom_design_tools", JSON.stringify(tempDesignTools));
      localStorage.setItem("rizx_custom_ai_tools", JSON.stringify(tempAiTools));
    } catch {}

    // Prune any selected tools that no longer exist
    const allAvailable = [...tempDesignTools, ...tempAiTools].map((t) => t.toLowerCase());
    const nextSelected = selectedTools.filter((t) => allAvailable.includes(t.toLowerCase()));
    if (nextSelected.length !== selectedTools.length) {
      setSelectedTools(nextSelected);
      if (selectedClient) {
        onSaveClientDescription(selectedClient.id, descriptionInput, nextSelected);
      }
    }

    setIsManageToolsOpen(false);
    showToast(tr("Tools catalog updated successfully!", "Katalog tool berhasil diperbarui!", "Katalog tool barasil dipabarui!"));
  };

  // Selected Cover Image: first work image or custom cover
  const coverImageUrl =
    selectedClient?.works?.[0]?.image ||
    "https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg";

  const handleCoverFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClient) return;
    if (onReplaceCoverImage) {
      onReplaceCoverImage(selectedClient.id, file);
    } else {
      // Fallback: trigger upload modal
      onOpenUploadWork(selectedTools);
    }
  };

  // Filtered logos for the middle column & canvas
  const filteredLogos = useMemo(() => {
    const term = (searchQuery || logoSearch).trim().toLowerCase();
    return clLogos.filter((l) => {
      if (logoRowTab === "row1" && l.row !== 1) return false;
      if (logoRowTab === "row2" && l.row !== 2) return false;
      if (term) {
        return l.name.toLowerCase().includes(term);
      }
      return true;
    });
  }, [clLogos, logoRowTab, logoSearch, searchQuery]);

  const row1Count = useMemo(() => clLogos.filter((l) => l.row === 1).length, [clLogos]);
  const row2Count = useMemo(() => clLogos.filter((l) => l.row === 2).length, [clLogos]);

  return (
    <div className={`flex-1 flex flex-col md:flex-row overflow-hidden transition-colors ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-[#0d0f13] text-white"
    }`}>
      {/* ========================================================
          MIDDLE COLUMN: CLIENTS PANEL (~300px)
         ======================================================== */}
      <aside
        className={`w-full md:w-[300px] shrink-0 border-r flex flex-col h-full overflow-hidden select-none transition-colors ${
          mobileActiveView === "detail" ? "hidden md:flex" : "flex"
        } ${
          isLight ? "bg-white border-slate-200" : "bg-[#090b0e] border-white/5"
        }`}
      >
        {/* Workspace Subview Switcher: Folders vs Marquee Logos */}
        <div className={`p-3 pb-2 border-b space-y-2.5 ${isLight ? "border-slate-200" : "border-white/5"}`}>
          <div className={`flex items-center gap-1 p-0.5 rounded-xl border ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900 border-white/10"
          }`}>
            <button
              type="button"
              onClick={() => {
                setWorkspaceView("folders");
                setMobileActiveView("list");
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                workspaceView === "folders"
                  ? "bg-[#16b09f] text-black shadow-md shadow-[#16b09f]/20"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <HiFolder className="w-3.5 h-3.5" />
              <span>{tr("Folders", "Folder Klien", "Folder Klien")}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  workspaceView === "folders"
                    ? "bg-black/20 text-black font-bold"
                    : isLight
                    ? "bg-slate-200 text-slate-700"
                    : "bg-white/10 text-neutral-300"
                }`}
              >
                {validClientsCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkspaceView("logos");
                setMobileActiveView("detail");
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                workspaceView === "logos"
                  ? "bg-[#16b09f] text-black shadow-md shadow-[#16b09f]/20"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <HiTag className="w-3.5 h-3.5" />
              <span>{tr("Logos", "Logo Klien", "Logo Mitra")}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  workspaceView === "logos"
                    ? "bg-black/20 text-black font-bold"
                    : isLight
                    ? "bg-slate-200 text-slate-700"
                    : "bg-white/10 text-neutral-300"
                }`}
              >
                {clLogos.length}
              </span>
            </button>
          </div>

          {/* Subview Controls */}
          {workspaceView === "folders" ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Client Folders", "Daftar Klien", "Daftar Klien")}
                  </h2>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {tr("Client folders & portfolios", "Folder karya & portofolio", "Folder karya & portofolio")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAddFolder}
                  className="flex items-center px-3 py-1.5 rounded-lg bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs transition-all active:scale-95 shadow-md shadow-[#16b09f]/20 cursor-pointer"
                >
                  <span>{tr("New folder", "Folder Baru", "Folder Baru")}</span>
                </button>
              </div>

              {/* Filter Tabs: All, Recent, Favorites */}
              <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900 border-white/5"
              }`}>
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                    filterTab === "all"
                      ? isLight
                        ? "bg-white text-[#16b09f] font-semibold shadow-xs"
                        : "bg-[#16b09f]/15 text-[#16b09f] font-semibold"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tr("All", "Semua", "Kasadonyo")} {validClientsCount}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("recent")}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                    filterTab === "recent"
                      ? isLight
                        ? "bg-white text-[#16b09f] font-semibold shadow-xs"
                        : "bg-[#16b09f]/15 text-[#16b09f] font-semibold"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tr("Recent", "Terkini", "Tabaru")} 3
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("favorites")}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                    filterTab === "favorites"
                      ? isLight
                        ? "bg-white text-[#16b09f] font-semibold shadow-xs"
                        : "bg-[#16b09f]/15 text-[#16b09f] font-semibold"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tr("Favorites", "Favorit", "Kaoetamoan")} {favoriteCount}
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <HiMagnifyingGlass className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isLight ? "text-slate-400" : "text-neutral-500"}`} />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder={tr("Search clients...", "Cari folder klien...", "Cari folder klien...")}
                  className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none transition-colors border ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#16b09f]"
                      : "bg-[#12151a] border-white/5 text-white placeholder-neutral-500 focus:border-[#16b09f]/60"
                  }`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Client Logos", "Logo Klien Marquee", "Logo Mitra Marquee")}
                  </h2>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {tr("Partner brands on website", "Brand partner running di web", "Brand mitra running di web")}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#16b09f] bg-[#16b09f]/10 border border-[#16b09f]/30 px-2 py-0.5 rounded-full font-semibold">
                  2 {tr("Rows", "Baris", "Barih")}
                </span>
              </div>

              {/* Row Filter Tabs: All, Row 1, Row 2 */}
              <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900 border-white/5"
              }`}>
                <button
                  type="button"
                  onClick={() => setLogoRowTab("all")}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                    logoRowTab === "all"
                      ? isLight
                        ? "bg-white text-[#16b09f] font-semibold shadow-xs"
                        : "bg-[#16b09f]/15 text-[#16b09f] font-semibold"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tr("All", "Semua", "Kasadonyo")} {clLogos.length}
                </button>
                <button
                  type="button"
                  onClick={() => setLogoRowTab("row1")}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                    logoRowTab === "row1"
                      ? isLight
                        ? "bg-white text-cyan-700 font-semibold shadow-xs"
                        : "bg-cyan-500/20 text-cyan-300 font-semibold"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tr("Row", "Baris", "Barih")} 1 ({row1Count})
                </button>
                <button
                  type="button"
                  onClick={() => setLogoRowTab("row2")}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                    logoRowTab === "row2"
                      ? isLight
                        ? "bg-white text-emerald-700 font-semibold shadow-xs"
                        : "bg-emerald-500/20 text-emerald-300 font-semibold"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tr("Row", "Baris", "Barih")} 2 ({row2Count})
                </button>
              </div>


            </div>
          )}
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {workspaceView === "folders" ? (
            <>
              {filteredClients.map((client) => {
                const isSelected = client.id === selectedClientId;
                const isFav = !!favorites[client.id];
                const worksCount = client.works?.length || 0;
                const thumbImage = client.logo || client.works?.[0]?.image;

                return (
                  <div
                    key={client.id}
                    onClick={() => {
                      onSelectClient(client.id);
                      setMobileActiveView("detail");
                    }}
                    className={`group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? "bg-teal-50 border border-teal-300 shadow-xs"
                          : "bg-[#151a21] border border-[#16b09f]/30 shadow-sm"
                        : isLight
                        ? "hover:bg-slate-100 border border-transparent"
                        : "hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Square Thumbnail */}
                      <div className={`w-10 h-10 rounded-lg overflow-hidden border shrink-0 flex items-center justify-center p-0.5 ${
                        isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-800 border-white/10"
                      }`}>
                        {thumbImage ? (
                          <img
                            src={thumbImage}
                            alt={client.clientName}
                            className={`w-full h-full ${client.logo && thumbImage === client.logo ? "object-contain" : "object-cover"} group-hover:scale-105 transition-transform`}
                          />
                        ) : (
                          <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                            {client.clientName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Title & Works count */}
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isSelected
                              ? isLight
                                ? "text-teal-900"
                                : "text-white"
                              : isLight
                              ? "text-slate-800 group-hover:text-teal-700"
                              : "text-neutral-200 group-hover:text-white"
                          }`}
                        >
                          {client.clientName}
                        </p>
                        <p className={`text-[11px] font-sans ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                          {worksCount} {worksCount === 1 ? "work" : "works"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quick Rename Folder Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditFolder(client);
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-cyan-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title={tr("Rename folder", "Ganti nama folder", "Ganti namo folder")}
                      >
                        <HiPencilSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Favorite Star Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(client.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isFav
                            ? "text-[#16b09f] hover:text-[#119889]"
                            : "text-neutral-600 hover:text-neutral-300 opacity-0 group-hover:opacity-100"
                        }`}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <HiStar className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredClients.length === 0 && (
                <div className="p-8 text-center text-xs text-neutral-500">
                  {tr("No clients found matching filter.", "Tidak ada klien yang cocok.", "Indak ado klien nan cocok.")}
                </div>
              )}
            </>
          ) : (
            /* Logos List in Middle Column */
            <div className="space-y-1.5">
              {filteredLogos.map((logo) => (
                <div
                  key={logo.id}
                  onClick={() => setMobileActiveView("detail")}
                  className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                    isLight
                      ? "bg-white hover:bg-slate-50 border-slate-200 hover:border-[#16b09f]/50 shadow-xs"
                      : "bg-neutral-900/60 hover:bg-neutral-900 border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-7 rounded border flex items-center justify-center p-1 shrink-0 ${
                      isLight
                        ? "bg-slate-50 border-slate-200/80"
                        : "bg-white border-white/20 shadow-xs"
                    }`}>
                      <img
                        src={normalizeMediaUrl(logo.file)}
                        alt={logo.name}
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fbs = getMediaFallbackUrls(logo.file);
                          if (fbs[1] && target.src !== fbs[1]) target.src = fbs[1];
                          else if (fbs[2] && target.src !== fbs[2]) target.src = fbs[2];
                        }}
                        className="max-h-5 max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}>
                        {logo.name}
                      </p>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          logo.row === 1
                            ? isLight
                              ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
                              : "bg-cyan-500/15 text-cyan-400"
                            : isLight
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {logo.row === 1
                          ? tr("Row 1 (Left)", "Baris 1 (Kiri)", "Barih 1 (Kida)")
                          : tr("Row 2 (Right)", "Baris 2 (Kanan)", "Barih 2 (Kanan)")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    title={tr("Delete Logo", "Hapus Logo", "Hapuih Logo")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClientLogo?.(logo.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                      isLight
                        ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        : "text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"
                    }`}
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {filteredLogos.length === 0 && (
                <div className={`p-8 text-center text-xs ${isLight ? "text-slate-400" : "text-neutral-500"}`}>
                  {tr("No logos found matching filter.", "Tidak ada logo yang cocok.", "Indak ado logo nan cocok.")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-center ${isLight ? "border-slate-200" : "border-white/5"}`}>
          {workspaceView === "folders" ? (
            <button
              type="button"
              onClick={() => {
                setFilterTab("all");
                setClientSearch("");
              }}
              className={`text-[11px] font-medium transition-colors cursor-pointer ${
                isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
              }`}
            >
              {tr(`View all ${validClientsCount} clients`, `Lihat semua ${validClientsCount} klien`, `Caliak kasadonyo ${validClientsCount} klien`)}
            </button>
          ) : (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setMobileActiveView("detail")}
                className="md:hidden w-full py-2.5 px-3 rounded-xl bg-[#16b09f] text-black font-bold text-xs shadow-md shadow-[#16b09f]/20 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <HiPencilSquare className="w-4 h-4" />
                <span>{tr("Open Editor & Add Logo →", "Buka Editor & Tambah Logo →", "Bukak Editor & Tambah Logo →")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoRowTab("all");
                  setLogoSearch("");
                }}
                className={`text-[11px] font-medium transition-colors cursor-pointer ${
                  isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tr(`View all ${clLogos.length} logos`, `Lihat semua ${clLogos.length} logo`, `Caliak kasadonyo ${clLogos.length} logo`)}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================
          RIGHT MAIN COLUMN: CLIENT DETAIL & ASSET WORKSPACE OR CLIENT LOGOS CANVAS
         ======================================================== */}
      {workspaceView === "logos" ? (
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 ${
            mobileActiveView === "list" ? "hidden md:block" : "block"
          }`}
        >
          {/* Mobile Back / Switch Button */}
          <div className="md:hidden flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setMobileActiveView("list")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold cursor-pointer active:scale-95"
            >
              <HiArrowLeft className="w-4 h-4 text-[#16b09f]" />
              <span>{tr("Logo List", "Daftar Logo", "Daftar Logo")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkspaceView("folders");
                setMobileActiveView("list");
              }}
              className="text-xs text-[#16b09f] hover:underline flex items-center gap-1 font-medium"
            >
              <HiFolder className="w-3.5 h-3.5" />
              <span>{tr("To Folders", "Ke Folder Klien", "Ka Folder Klien")}</span>
            </button>
          </div>

          {/* Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => setWorkspaceView("folders")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {tr("Clients", "Klien", "Klien")}
              </button>
              <span>/</span>
              <span className="text-white font-medium">
                {tr("Client Logos Marquee", "Logo Klien Marquee", "Logo Klien Marquee")}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#16b09f]/10 border border-[#16b09f]/30 text-[#16b09f] font-semibold ml-1">
                {clLogos.length} Logos Live
              </span>
            </div>


          </div>

          {/* Header Explainer Banner */}
          <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
            isLight
              ? "bg-gradient-to-r from-slate-100 via-white to-slate-100 border-slate-200 shadow-sm"
              : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
          }`}>
            <span className="text-[11px] font-mono tracking-widest text-[#16b09f] uppercase font-semibold block mb-1">
              SECTION CONTROL: LOGO KLIEN (MARQUEE)
            </span>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {tr("Client Logos & Marquee Editor", "Editor Logo Klien & Subtitle Marquee", "Editor Logo Klien & Subtitle Marquee")}
            </h2>
            <p className={`text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              {tr(
                "Manage title subtitle and partner brand logos scrolling in the public website marquee. Add new logos, rename, switch rows, or delete.",
                "Kelola tulisan judul serta logo-logo brand partner yang berjalan di marquee logo website publik. Anda bisa menambah logo baru, mengganti nama, memindahkan baris, atau menghapus logo.",
                "Kalola tulisan judul sarato logo-logo brand partner nan bajalan di marquee logo website publik. Sanak dapek manambah logo baru, mangganti namo, mamindahkan barih, atau mahapuih logo."
              )}
            </p>
          </div>

          {/* Subtitle Form */}
          <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <HiTag className="w-4 h-4 text-[#16b09f]" />
              <span>{tr("Marquee Subtitle / Section Title", "Tulisan Subtitle / Judul Marquee", "Tulisan Subtitle / Judul Marquee")}</span>
            </h3>
            <div className="space-y-1.5 max-w-xl">
              <input
                type="text"
                value={clSubtitle}
                onChange={(e) => setClSubtitle?.(e.target.value)}
                placeholder="SELECTED CLIENTS & CREATIVE COLLABORATIONS"
                className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors border ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#16b09f]"
                    : "bg-neutral-950 border-white/15 text-white focus:border-[#16b09f]"
                }`}
              />
              <p className={`text-[11px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                {tr(
                  "This text appears above the partner logos marquee on the public website.",
                  "Teks ini tampil di atas marquee logo di website publik.",
                  "Teks ko tampil di ateh marquee logo di website publik."
                )}
              </p>
            </div>
          </div>

          {/* Form Tambah Logo Klien Baru */}
          <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <HiPlus className="w-4 h-4 text-[#16b09f]" />
              <span>{tr("Add New Client Logo to Marquee", "Tambah Logo Klien Baru ke Marquee", "Tambah Logo Klien Baru ka Marquee")}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-mono font-semibold ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                  {tr("Client / Brand Name", "Nama Klien / Brand", "Namo Klien / Brand")}
                </label>
                <input
                  type="text"
                  value={newLogoName}
                  onChange={(e) => setNewLogoName?.(e.target.value)}
                  placeholder={tr("e.g. Apple, Google, Nike", "Contoh: Apple, Google, Nike", "Contoh: Apple, Google, Nike")}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors border ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#16b09f]"
                      : "bg-neutral-950 border-white/15 text-white focus:border-[#16b09f]"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-mono font-semibold ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                  {tr("Marquee Row Position", "Posisi Baris Marquee", "Posisi Barih Marquee")}
                </label>
                <select
                  value={newLogoRow}
                  onChange={(e) => setNewLogoRow?.(parseInt(e.target.value) as 1 | 2)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors border cursor-pointer ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#16b09f]"
                      : "bg-neutral-950 border-white/15 text-white focus:border-[#16b09f]"
                  }`}
                >
                  <option value={1}>{tr("Row 1 (Scroll Left)", "Baris 1 (Scroll ke Kiri)", "Barih 1 (Scroll ka Kida)")}</option>
                  <option value={2}>{tr("Row 2 (Scroll Right)", "Baris 2 (Scroll ke Kanan)", "Barih 2 (Scroll ka Kanan)")}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-mono font-semibold ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    {tr("Logo File (SVG / PNG / WebP)", "File Logo (SVG / PNG / WebP)", "File Logo (SVG / PNG / WebP)")}
                  </label>
                  <span className="text-[10px] font-mono text-[#16b09f] bg-[#16b09f]/10 border border-[#16b09f]/30 px-2 py-0.5 rounded-full font-semibold">
                    Frame: 160 × 56 px
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newLogoFile}
                    onChange={(e) => setNewLogoFile?.(normalizeMediaUrl(e.target.value))}
                    onBlur={() => setNewLogoFile?.(normalizeMediaUrl(newLogoFile))}
                    placeholder={tr("Paste link Google Drive atau URL online...", "Paste link Google Drive atau URL online...", "Paste link Google Drive atau URL online...")}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono outline-none transition-colors border ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#16b09f]"
                        : "bg-neutral-900 border-white/15 text-white focus:border-[#16b09f]"
                    }`}
                  />
                  <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition-colors shrink-0 ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-white/15"
                  }`}>
                    <HiPhoto className="w-4 h-4 text-[#16b09f]" />
                    <span className="truncate">
                      {newLogoFile
                        ? tr("✓ File Dipilih", "✓ File Dipilih", "✓ File Dipiliah")
                        : tr("Upload File", "Upload File", "Upload File")}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.svg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;

                        const isSvg =
                          file.type === "image/svg+xml" ||
                          file.type.includes("svg") ||
                          file.name.toLowerCase().endsWith(".svg");

                        if (onGenericImageFile) {
                          onGenericImageFile(e, (dataUrl) => {
                            let finalUrl = dataUrl;
                            if (isSvg && !finalUrl.startsWith("data:image/svg+xml") && finalUrl.startsWith("data:")) {
                              finalUrl = finalUrl.replace(/^data:[^;]*;base64,/, "data:image/svg+xml;base64,");
                            }
                            setNewLogoFile?.(finalUrl);
                          });
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          let dataUrl = ev.target?.result as string;
                          if (!dataUrl) return;
                          if (isSvg && !dataUrl.startsWith("data:image/svg+xml") && dataUrl.startsWith("data:")) {
                            dataUrl = dataUrl.replace(/^data:[^;]*;base64,/, "data:image/svg+xml;base64,");
                          }
                          setNewLogoFile?.(dataUrl);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <p className={`text-[11px] font-mono leading-relaxed mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  📌 <strong>{tr("Frame Display Size:", "Ukuran Frame Tampil:", "Ukuran Frame Tampil:")}</strong>{" "}
                  <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>160 × 56 pixel</span> ({tr("logo height:", "tinggi logo:", "tinggi logo:")} 28px).
                  <br />
                  ✨ <strong>{tr("Recommended File Size:", "Ukuran File Disarankan:", "Ukuran File Disarankan:")}</strong>{" "}
                  <span className="text-[#16b09f] font-semibold">200 × 60 px</span> {tr("to", "s/d", "s/d")}{" "}
                  <span className="text-[#16b09f] font-semibold">300 × 80 px</span> ({tr("Transparent SVG or PNG format", "Format SVG atau PNG Transparan", "Format SVG atau PNG Transparan")}).
                </p>
              </div>
            </div>

            {newLogoFile && (
              <div className="flex items-center gap-4 pt-2">
                <div className={`p-2 rounded-xl border flex items-center justify-center ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-white border-white/20 shadow-xs"
                }`}>
                  <img
                    src={normalizeMediaUrl(newLogoFile)}
                    alt="Preview"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fbs = getMediaFallbackUrls(newLogoFile);
                      if (fbs[1] && target.src !== fbs[1]) target.src = fbs[1];
                      else if (fbs[2] && target.src !== fbs[2]) target.src = fbs[2];
                    }}
                    className="h-8 max-w-[120px] object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={onAddClientLogo}
                  className="px-5 py-2.5 rounded-xl bg-[#16b09f] text-black font-bold text-xs hover:bg-[#119889] transition-all cursor-pointer shadow-md"
                >
                  {tr(`Add to Row ${newLogoRow}`, `Tambahkan ke Baris ${newLogoRow}`, `Tambahkan ka Barih ${newLogoRow}`)}
                </button>
              </div>
            )}
          </div>

          {/* List Logos: Baris 1 & Baris 2 */}
          <div className="space-y-6">
            {/* Row 1 */}
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>
                    {tr("Row 1 — Scroll Left Animation", "Baris 1 — Scroll Bergerak ke Kiri", "Barih 1 — Scroll Bagarak ka Kida")}
                  </span>
                </h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  isLight ? "text-cyan-800 bg-cyan-100 border border-cyan-200" : "text-cyan-400 bg-cyan-500/10"
                }`}>
                  {row1Count} Logo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {clLogos
                  .filter((l) => l.row === 1)
                  .map((logo) => (
                    <div
                      key={logo.id}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-2.5 group relative transition-colors ${
                        isLight
                          ? "bg-slate-50 hover:bg-white border-slate-200 hover:border-[#16b09f]/50 shadow-xs"
                          : "bg-neutral-950 border-white/10 hover:border-[#16b09f]/30"
                      }`}
                    >
                      <div className={`h-12 w-full rounded-lg border flex items-center justify-center p-2 transition-all ${
                        isLight
                          ? "bg-white border-slate-200/80 shadow-xs"
                          : "bg-white border-white/20 shadow-xs"
                      }`}>
                        <img
                          src={normalizeMediaUrl(logo.file)}
                          alt={logo.name}
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fbs = getMediaFallbackUrls(logo.file);
                            if (fbs[1] && target.src !== fbs[1]) target.src = fbs[1];
                            else if (fbs[2] && target.src !== fbs[2]) target.src = fbs[2];
                          }}
                          className="max-h-8 max-w-full object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        value={logo.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClLogos?.((prev) =>
                            prev.map((l) => (l.id === logo.id ? { ...l, name: val } : l))
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                            onSaveClientLogos?.();
                          }
                        }}
                        className={`w-full text-center px-1.5 py-1 rounded text-[11px] font-mono focus:outline-none focus:border-[#16b09f] border ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-800"
                            : "bg-neutral-900 border-white/10 text-white"
                        }`}
                      />
                      <div className={`flex items-center gap-1.5 w-full justify-between pt-1 border-t ${
                        isLight ? "border-slate-200" : "border-white/5"
                      }`}>
                        <button
                          type="button"
                          title={tr("Move to Row 2", "Pindah ke Baris 2", "Pindah ka Barih 2")}
                          onClick={() => {
                            setClLogos?.((prev) =>
                              prev.map((l) => (l.id === logo.id ? { ...l, row: 2 } : l))
                            );
                            showToast(tr(`Logo "${logo.name}" moved to Row 2.`, `Logo "${logo.name}" dipindah ke Baris 2.`, `Logo "${logo.name}" dipindah ka Barih 2.`));
                          }}
                          className={`text-[10px] font-mono transition-colors cursor-pointer ${
                            isLight ? "text-slate-500 hover:text-cyan-600" : "text-neutral-400 hover:text-cyan-400"
                          }`}
                        >
                          ↓ {tr("Row 2", "Baris 2", "Barih 2")}
                        </button>
                        <button
                          type="button"
                          title={tr("Delete Logo", "Hapus Logo", "Hapuih Logo")}
                          onClick={() => onDeleteClientLogo?.(logo.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Row 2 */}
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0e0f14] border-white/10"
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>
                    {tr("Row 2 — Scroll Right Animation", "Baris 2 — Scroll Bergerak ke Kanan", "Barih 2 — Scroll Bagarak ka Kanan")}
                  </span>
                </h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  isLight ? "text-emerald-800 bg-emerald-100 border border-emerald-200" : "text-emerald-400 bg-emerald-500/10"
                }`}>
                  {row2Count} Logo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {clLogos
                  .filter((l) => l.row === 2)
                  .map((logo) => (
                    <div
                      key={logo.id}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-2.5 group relative transition-colors ${
                        isLight
                          ? "bg-slate-50 hover:bg-white border-slate-200 hover:border-[#16b09f]/50 shadow-xs"
                          : "bg-neutral-950 border-white/10 hover:border-[#16b09f]/30"
                      }`}
                    >
                      <div className={`h-12 w-full rounded-lg border flex items-center justify-center p-2 transition-all ${
                        isLight
                          ? "bg-white border-slate-200/80 shadow-xs"
                          : "bg-white border-white/20 shadow-xs"
                      }`}>
                        <img
                          src={normalizeMediaUrl(logo.file)}
                          alt={logo.name}
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fbs = getMediaFallbackUrls(logo.file);
                            if (fbs[1] && target.src !== fbs[1]) target.src = fbs[1];
                            else if (fbs[2] && target.src !== fbs[2]) target.src = fbs[2];
                          }}
                          className="max-h-8 max-w-full object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        value={logo.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClLogos?.((prev) =>
                            prev.map((l) => (l.id === logo.id ? { ...l, name: val } : l))
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                            onSaveClientLogos?.();
                          }
                        }}
                        className={`w-full text-center px-1.5 py-1 rounded text-[11px] font-mono focus:outline-none focus:border-[#16b09f] border ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-800"
                            : "bg-neutral-900 border-white/10 text-white"
                        }`}
                      />
                      <div className={`flex items-center gap-1.5 w-full justify-between pt-1 border-t ${
                        isLight ? "border-slate-200" : "border-white/5"
                      }`}>
                        <button
                          type="button"
                          title={tr("Move to Row 1", "Pindah ke Baris 1", "Pindah ka Barih 1")}
                          onClick={() => {
                            setClLogos?.((prev) =>
                              prev.map((l) => (l.id === logo.id ? { ...l, row: 1 } : l))
                            );
                            showToast(tr(`Logo "${logo.name}" moved to Row 1.`, `Logo "${logo.name}" dipindah ke Baris 1.`, `Logo "${logo.name}" dipindah ka Barih 1.`));
                          }}
                          className={`text-[10px] font-mono transition-colors cursor-pointer ${
                            isLight ? "text-slate-500 hover:text-emerald-600" : "text-neutral-400 hover:text-emerald-400"
                          }`}
                        >
                          ↑ {tr("Row 1", "Baris 1", "Barih 1")}
                        </button>
                        <button
                          type="button"
                          title={tr("Delete Logo", "Hapus Logo", "Hapuih Logo")}
                          onClick={() => onDeleteClientLogo?.(logo.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      ) : selectedClient ? (
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 ${
            mobileActiveView === "list" ? "hidden md:block" : "block"
          }`}
        >
          {/* Mobile Back to List Button */}
          <div className="md:hidden flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setMobileActiveView("list")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold cursor-pointer active:scale-95"
            >
              <HiArrowLeft className="w-4 h-4 text-[#16b09f]" />
              <span>{tr("Back to Clients", "Daftar Klien", "Daftar Klien")}</span>
            </button>
            <span className="text-xs font-bold text-white truncate max-w-[170px]">
              {selectedClient.clientName}
            </span>
          </div>

          {/* Breadcrumb */}
          <div className={`hidden sm:flex items-center gap-2 text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
            <span>{tr("Clients", "Klien", "Klien")}</span>
            <span>/</span>
            <span className={`font-medium ${isLight ? "text-slate-900" : "text-white"}`}>{selectedClient.clientName}</span>
          </div>

          {/* Client Header Card */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
            isLight ? "border-slate-200" : "border-white/5"
          }`}>
            <div className="flex items-center gap-3.5">
              {/* Rounded Square Avatar [KD] with Click / Double Click to Upload Brand Profile Picture */}
              <div
                onClick={() => avatarInputRef.current?.click()}
                onDoubleClick={() => avatarInputRef.current?.click()}
                title={tr(
                  "Klik untuk ganti foto profil / logo brand",
                  "Click to change brand profile / logo",
                  "Klik untuak ganti foto profil / logo brand"
                )}
                className={`relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center font-bold text-base shadow-inner shrink-0 cursor-pointer overflow-hidden transition-all select-none p-1.5 ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-[#16b09f] text-slate-800"
                    : "bg-[#161a22] border-white/10 hover:border-[#16b09f]/60 text-white"
                }`}
              >
                {selectedClient.logo ? (
                  <img
                    src={selectedClient.logo}
                    alt={selectedClient.clientName}
                    className="w-full h-full object-contain rounded-xl transition-transform group-hover:scale-105"
                  />
                ) : (
                  <span className={`font-mono text-base tracking-wider ${isLight ? "text-slate-700" : "text-neutral-200 group-hover:text-white"}`}>
                    {clientInitials}
                  </span>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center backdrop-blur-[2px]">
                  <HiCamera className="w-4 h-4 text-[#16b09f] mb-0.5" />
                  <span className="text-[9px] font-mono font-semibold text-white leading-tight">
                    {tr("Ganti Logo", "Change Logo", "Ganti Logo")}
                  </span>
                  <span className="text-[8px] text-neutral-300 leading-tight">
                    {tr("Upload", "Upload", "Upload")}
                  </span>
                </div>
              </div>

              {/* Hidden File Input for Avatar / PP */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*,.svg,image/svg+xml,image/png,image/jpeg,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h1
                    onDoubleClick={() => onOpenEditFolder(selectedClient)}
                    className={`text-2xl font-bold tracking-tight cursor-pointer hover:text-cyan-600 transition-colors ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                    title={tr("Klik 2x untuk ganti nama folder", "Double-click to rename folder", "Klik 2x untuak ganti namo folder")}
                  >
                    {selectedClient.clientName}
                  </h1>
                  <button
                    type="button"
                    onClick={() => onOpenEditFolder(selectedClient)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isLight ? "text-slate-400 hover:text-cyan-600 hover:bg-slate-100" : "text-neutral-400 hover:text-cyan-400 hover:bg-white/10"
                    }`}
                    title={tr("Rename folder / edit brand name", "Ganti nama folder / edit brand", "Ganti namo folder / edit brand")}
                  >
                    <HiPencilSquare className="w-4 h-4" />
                  </button>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    isLight
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  {selectedClient.category || `Digital Campaign - ${selectedClient.clientName}`} • {selectedClient.works?.length || 0} {selectedClient.works?.length === 1 ? "work" : "works"}
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Information & Cover Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Portfolio Information Form */}
            <div className={`lg:col-span-7 p-5 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111419] border-white/5"
            }`}>
              <div className={`pb-2 border-b flex items-center justify-between ${
                isLight ? "border-slate-200" : "border-white/5"
              }`}>
                <div>
                  <h3 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Portfolio Information", "Informasi Portofolio", "Informasi Portofolio")}
                  </h3>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {tr("Category, headline & brand profile context", "Kategori, headline & profil brand", "Kategori, headline & profil brand")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveInfo}
                  className="flex items-center px-3.5 py-1.5 rounded-lg bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs transition-all active:scale-95 shadow-md shadow-[#16b09f]/20 cursor-pointer"
                >
                  <span>{tr("Save Info", "Simpan Info", "Simpan Info")}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLight ? "text-slate-700" : "text-neutral-400"}`}>
                    {tr("Category", "Kategori", "Kategori")}
                  </label>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onBlur={() => {
                      if (selectedClient && onUpdateClientFolder && categoryInput.trim() !== (selectedClient.category || "")) {
                        onUpdateClientFolder(selectedClient.id, { category: categoryInput.trim() });
                      }
                    }}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setMobileTextModal({
                          isOpen: true,
                          title: tr("Category", "Kategori", "Kategori"),
                          value: categoryInput,
                          isTextarea: false,
                          onSave: (val) => setCategoryInput(val),
                        });
                      }
                    }}
                    placeholder={tr("e.g. Digital Campaign", "Contoh: Digital Campaign", "Contoh: Digital Campaign")}
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-colors border ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#16b09f]"
                        : "bg-[#161a22] border-white/5 text-white placeholder-neutral-500 focus:border-[#16b09f]/60"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLight ? "text-slate-700" : "text-neutral-400"}`}>
                    {tr("Main Headline", "Headline Utama", "Judul Utamo")}
                  </label>
                  <input
                    type="text"
                    value={headlineInput}
                    onChange={(e) => setHeadlineInput(e.target.value)}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setMobileTextModal({
                          isOpen: true,
                          title: tr("Main Headline", "Headline Utama", "Judul Utamo"),
                          value: headlineInput,
                          isTextarea: false,
                          onSave: (val) => setHeadlineInput(val),
                        });
                      }
                    }}
                    placeholder="PROFESSIONAL EXPERIENCE"
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-colors border ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#16b09f]"
                        : "bg-[#161a22] border-white/5 text-white placeholder-neutral-500 focus:border-[#16b09f]/60"
                    }`}
                  />
                </div>
              </div>

              {/* Panel 1: PROJECT DESCRIPTION */}
              <div className={`p-3.5 rounded-xl space-y-2 border ${
                isLight
                  ? "bg-cyan-50/70 border-cyan-200 shadow-xs"
                  : "bg-[#161a22]/70 border-cyan-500/25"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <label className={`text-xs font-mono font-bold uppercase tracking-wide ${
                      isLight ? "text-cyan-800" : "text-cyan-300"
                    }`}>
                      PROJECT DESCRIPTION
                    </label>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      isLight
                        ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                        : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    }`}>
                      {tr("Overview Karya", "Project Overview", "Overview Karya")}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${isLight ? "text-cyan-700 font-semibold" : "text-cyan-400/80"}`}>
                    {projectDescInput.length} / 1000
                  </span>
                </div>
                <p className={`text-[11px] leading-snug ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "💡 Ditampilkan tepat di bawah judul karya pada preview modal (tujuan visual, ringkasan kampanye, atau konteks proyek).",
                    "💡 Displayed right below work title on preview modal (visual goal, campaign summary, or project context).",
                    "💡 Ditampilkan tapek di bawah judul karya pado preview modal."
                  )}
                </p>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={projectDescInput}
                  onChange={(e) => setProjectDescInput(e.target.value)}
                  onBlur={() => {
                    if (selectedClient && projectDescInput !== (selectedClient.projectDescription || "")) {
                      const trimmed = projectDescInput.trim();
                      if (onUpdateClientFolder) {
                        onUpdateClientFolder(selectedClient.id, { projectDescription: trimmed });
                      }
                      onSaveClientDescription(selectedClient.id, descriptionInput, selectedTools, trimmed);
                    }
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (text && projectDescInput.length + text.length > 1000) {
                      showToast(tr("Peringatan: Teks melebihi 1000 karakter dan dipotong otomatis.", "Warning: Text exceeds 1000 characters and was trimmed.", "Paringatan: Teks talampau 1000 karakter."));
                    }
                  }}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 768) {
                      setMobileTextModal({
                        isOpen: true,
                        title: "PROJECT DESCRIPTION",
                        value: projectDescInput,
                        maxLength: 1000,
                        isTextarea: true,
                        onSave: (val) => {
                          const trimmed = val.trim();
                          setProjectDescInput(trimmed);
                          if (selectedClient) {
                            if (onUpdateClientFolder) {
                              onUpdateClientFolder(selectedClient.id, { projectDescription: trimmed });
                            }
                            onSaveClientDescription(selectedClient.id, descriptionInput, selectedTools, trimmed);
                          }
                        },
                      });
                    }
                  }}
                  placeholder={tr(
                    `Contoh: Kampanye visual terpadu untuk ${selectedClient.clientName}, memadukan desain layout, art direction, dan aset promosi digital...`,
                    `Example: Integrated visual campaign for ${selectedClient.clientName}, blending layout design, art direction, and digital promotional assets...`,
                    `Contoh: Kampanye visual tapadu untuak ${selectedClient.clientName}...`
                  )}
                  className={`w-full rounded-xl p-3 text-xs outline-none transition-colors leading-relaxed resize-none cursor-text border ${
                    isLight
                      ? "bg-white border-cyan-200 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-xs"
                      : "bg-[#0e1015] border-cyan-500/20 text-white placeholder-neutral-500 focus:border-cyan-400"
                  }`}
                />
              </div>

              {/* Panel 2: BRAND PROFILE & CONTEXT */}
              <div className={`p-3.5 rounded-xl space-y-2 border ${
                isLight
                  ? "bg-teal-50/70 border-teal-200 shadow-xs"
                  : "bg-[#161a22]/70 border-[#16b09f]/25"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16b09f]" />
                    <label className={`text-xs font-mono font-bold uppercase tracking-wide ${
                      isLight ? "text-teal-800" : "text-[#16b09f]"
                    }`}>
                      BRAND PROFILE & CONTEXT
                    </label>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      isLight
                        ? "bg-teal-100 text-teal-800 border-teal-300"
                        : "bg-[#16b09f]/15 text-[#16b09f] border-[#16b09f]/30"
                    }`}>
                      {tr("Profil Klien", "Client Brand Context", "Profil Klien")}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${isLight ? "text-teal-700 font-semibold" : "text-[#16b09f]/80"}`}>
                    {descriptionInput.length} / 1000
                  </span>
                </div>
                <p className={`text-[11px] leading-snug ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "💡 Ditampilkan di box 'BRAND PROFILE & CONTEXT' di bagian paling bawah kartu case study (identitas & latar belakang brand klien).",
                    "💡 Displayed in the 'BRAND PROFILE & CONTEXT' box at the bottom of the case study card (company identity & background).",
                    "💡 Ditampilkan di box 'BRAND PROFILE & CONTEXT' di bagian paliang bawah."
                  )}
                </p>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  onBlur={() => {
                    if (selectedClient && descriptionInput !== (selectedClient.description || "")) {
                      onSaveClientDescription(selectedClient.id, descriptionInput, selectedTools, projectDescInput);
                    }
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (text && descriptionInput.length + text.length > 1000) {
                      showToast(tr("Peringatan: Teks melebihi 1000 karakter dan dipotong otomatis.", "Warning: Text exceeds 1000 characters and was trimmed.", "Paringatan: Teks talampau 1000 karakter."));
                    }
                  }}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 768) {
                      setMobileTextModal({
                        isOpen: true,
                        title: "BRAND PROFILE & CONTEXT",
                        value: descriptionInput,
                        maxLength: 1000,
                        isTextarea: true,
                        onSave: (val) => {
                          setDescriptionInput(val);
                          if (selectedClient) {
                            onSaveClientDescription(selectedClient.id, val, selectedTools, projectDescInput);
                          }
                        },
                      });
                    }
                  }}
                  placeholder={tr(
                    `Contoh: ${selectedClient.clientName} adalah brand terkemuka di bidangnya dengan visi modern dan inovatif...`,
                    `Example: ${selectedClient.clientName} is an industry-leading brand known for its forward-thinking visual identity...`,
                    `Contoh: ${selectedClient.clientName} adolah brand takamuko...`
                  )}
                  className={`w-full rounded-xl p-3 text-xs outline-none transition-colors leading-relaxed resize-none cursor-text border ${
                    isLight
                      ? "bg-white border-teal-200 text-slate-800 placeholder-slate-400 focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] shadow-xs"
                      : "bg-[#0e1015] border-[#16b09f]/20 text-white placeholder-neutral-500 focus:border-[#16b09f]"
                  }`}
                />
              </div>
            </div>

            {/* Right: Cover Card with Double Click to Replace */}
            <div className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111419] border-white/5"
            }`}>
              <div className={`pb-2 border-b ${isLight ? "border-slate-200" : "border-white/5"}`}>
                <h3 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {tr("Cover Image", "Gambar Sampul", "Gambar Muko")}
                </h3>
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileSelected}
                  className="hidden"
                />
              </div>

              {/* Cover Image Preview with Double Click to Replace */}
              <div
                onDoubleClick={() => coverFileInputRef.current?.click()}
                title={tr(
                  "Klik 2x untuk mengganti gambar sampul",
                  "Double-click to replace cover image",
                  "Klik 2x untuak mangganti gambar sampul"
                )}
                className={`relative aspect-[16/10] w-full rounded-xl overflow-hidden border shadow-md cursor-pointer group select-none hover:border-[#16b09f]/50 transition-all ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-black border-white/5"
                }`}
              >
                <img
                  src={coverImageUrl}
                  alt={selectedClient.clientName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center backdrop-blur-[1px] pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl bg-black/75 border border-white/20 text-white flex items-center gap-2 shadow-xl">
                    <HiPhoto className="w-4 h-4 text-[#16b09f]" />
                    <span className="text-xs font-semibold">
                      {tr("Klik 2x untuk ganti gambar", "Double-click to replace image", "Klik 2x untuak ganti gambar")}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-300 pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 backdrop-blur-sm truncate">
                    {categoryInput || "Automotive Dealer"}
                  </span>
                  <span className="font-semibold text-white uppercase tracking-wider truncate">
                    {headlineInput || "PROFESSIONAL EXPERIENCE"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Software & AI Tools Section */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111419] border-white/5"
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isLight ? "border-slate-200" : "border-white/5"
            }`}>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Software & AI tools</h3>
                <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  {selectedTools.length} selected
                </span>
              </div>
              <button
                type="button"
                onClick={openManageTools}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10"
                }`}
              >
                <span>{tr("Manage", "Kelola", "Kalola")}</span>
              </button>
            </div>

            {/* Design Tools Row */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-medium block ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Design</span>
              <div className="flex flex-wrap gap-2">
                {designTools.map((tool) => {
                  const isChecked = selectedTools.some(
                    (t) => t.toLowerCase() === tool.toLowerCase()
                  );
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isChecked
                          ? isLight
                            ? "bg-teal-50 text-teal-800 border border-teal-300 font-semibold shadow-xs"
                            : "bg-[#16b09f]/20 text-[#16b09f] border border-[#16b09f]/50 font-semibold shadow-sm"
                          : isLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          : "bg-white/[0.03] hover:bg-white/[0.07] text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      <ToolIcon name={tool} />
                      <span>{tool}</span>
                      {isChecked && <HiCheck className="w-3.5 h-3.5 stroke-[2.5] text-[#16b09f]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Tools Row */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-medium block ${isLight ? "text-slate-600" : "text-neutral-400"}`}>AI</span>
              <div className="flex flex-wrap gap-2">
                {aiTools.map((tool) => {
                  const isChecked = selectedTools.some(
                    (t) => t.toLowerCase() === tool.toLowerCase()
                  );
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isChecked
                          ? isLight
                            ? "bg-teal-50 text-teal-800 border border-teal-300 font-semibold shadow-xs"
                            : "bg-[#16b09f]/20 text-[#16b09f] border border-[#16b09f]/50 font-semibold shadow-sm"
                          : isLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          : "bg-white/[0.03] hover:bg-white/[0.07] text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      <ToolIcon name={tool} isAi />
                      <span>{tool}</span>
                      {isChecked && <HiCheck className="w-3.5 h-3.5 stroke-[2.5] text-[#16b09f]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="space-y-4">
            {/* Assets Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{tr("Assets", "Aset", "Aset")}</h3>
                <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  {selectedClient.works?.length || 0} {tr("items", "item", "item")}
                </span>
              </div>

              {/* Assets Toolbar: Search, Sort, View Mode */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <HiMagnifyingGlass className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isLight ? "text-slate-400" : "text-neutral-500"}`} />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder={tr("Search assets...", "Cari aset...", "Cari aset...")}
                    className={`border rounded-lg pl-8 pr-3 py-1 text-xs outline-none transition-colors w-40 sm:w-48 ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#16b09f]"
                        : "bg-[#12151a] border-white/5 text-white placeholder-neutral-500 focus:border-[#16b09f]/60"
                    }`}
                  />
                </div>

                <select
                  value={assetSort}
                  onChange={(e) => setAssetSort(e.target.value as any)}
                  className={`border rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#16b09f]"
                      : "bg-[#12151a] border-white/5 text-neutral-300 focus:border-[#16b09f]/60"
                  }`}
                >
                  <option value="newest">{tr("Newest first", "Terbaru", "Paliang baru")}</option>
                  <option value="oldest">{tr("Oldest first", "Terlama", "Paliang lamo")}</option>
                  <option value="title">{tr("Alphabetical", "Abjad A-Z", "Abjad A-Z")}</option>
                </select>

                <div className={`flex items-center p-0.5 rounded-lg border ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-[#12151a] border-white/5"
                }`}>
                  <button
                    type="button"
                    onClick={() => setAssetViewMode("grid")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      assetViewMode === "grid"
                        ? isLight
                          ? "bg-white text-slate-900 shadow-xs"
                          : "bg-white/10 text-white"
                        : isLight
                        ? "text-slate-400 hover:text-slate-900"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    <HiSquares2X2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetViewMode("list")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      assetViewMode === "list"
                        ? isLight
                          ? "bg-white text-slate-900 shadow-xs"
                          : "bg-white/10 text-white"
                        : isLight
                        ? "text-slate-400 hover:text-slate-900"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    <HiBars3BottomLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredWorks.map((work) => {
                return (
                  <div
                    key={work.id}
                    className={`group relative rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
                      isLight
                        ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                        : "bg-[#111419] border-white/5 hover:border-white/20"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                      <img
                        src={work.image}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {/* Edit Case Study Pencil */}
                        <button
                          type="button"
                          onClick={() => onOpenEditWork(work)}
                          className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                          title={tr("Edit case study", "Edit studi kasus", "Edit studi kasus")}
                        >
                          <HiPencilSquare className="w-4 h-4" />
                        </button>
                        {/* Delete Trash */}
                        <button
                          type="button"
                          onClick={() => onDeleteWork(selectedClient.id, work.id, work.title)}
                          className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                          title={tr("Delete image", "Hapus gambar", "Hapuih gambar")}
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2.5">
                      <h4 className={`text-xs font-semibold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                        {work.title}
                      </h4>
                      <p className={`text-[10px] mt-0.5 truncate flex items-center gap-1.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                        <span>{work.year || "2026"} · {work.aspect || "4:5"}</span>
                        {Boolean(
                          (work.isVideo === true ||
                           work.mediaType === "video" ||
                           work.mediaType === "youtube" ||
                           work.mediaType === "gdrive_video" ||
                           Boolean(work.videoId) ||
                           Boolean(work.youtubeUrl) ||
                           (work.gdriveUrl && /\.(mp4|mov|webm|mkv|avi|m4v)/i.test(work.gdriveUrl))) &&
                          work.mediaType !== "image" &&
                          work.isVideo !== false
                        ) && (
                          <span className={`px-1 py-0.2 rounded border text-[9px] font-mono font-bold leading-none ${
                            isLight
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}>
                            🎬 VIDEO
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Dashed "+ Add images" Card */}
              <button
                type="button"
                onClick={() => onOpenUploadWork(selectedTools)}
                className={`aspect-[16/10] sm:aspect-auto sm:min-h-[140px] rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group ${
                  isLight
                    ? "border-slate-300 hover:border-[#16b09f] bg-white hover:bg-[#16b09f]/5 text-slate-500 hover:text-slate-900 shadow-xs"
                    : "border-white/15 hover:border-[#16b09f] bg-white/[0.01] hover:bg-[#16b09f]/5 text-neutral-400 hover:text-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isLight
                    ? "bg-slate-100 group-hover:bg-[#16b09f] group-hover:text-black text-slate-600"
                    : "bg-white/5 group-hover:bg-[#16b09f] group-hover:text-black"
                }`}>
                  <HiPlus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs font-medium">{tr("Add images", "Tambah gambar", "Tambah gambar")}</span>
              </button>
            </div>
          </div>
        </main>
      ) : (
        <div
          className={`flex-1 flex items-center justify-center p-8 text-neutral-400 text-sm ${
            mobileActiveView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {tr("Select a client folder from the left list.", "Pilih folder klien dari daftar di sebelah kiri.", "Piliah folder klien dari daftar sabalah kida.")}
        </div>
      )}
      {/* ========================================================
          MANAGE SOFTWARE & AI TOOLS MODAL (ADD / REMOVE / CANCEL)
         ======================================================== */}
      {isManageToolsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0e1116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{tr("Manage Software & AI Tools", "Kelola Software & AI Tools", "Kalola Software & AI Tools")}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {tr(
                    "Add or remove tools from the client portfolio options.",
                    "Tambah atau kurangi tool dari daftar pilihan portofolio.",
                    "Tambah atau kurangi tool dari daftar piliahan portofolio."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelManageTools}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={tr("Cancel", "Batal", "Batal")}
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Add New Tool Form */}
              <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white block">
                  {tr("Add New Tool", "Tambah Tool Baru", "Tambah Tool Baru")}
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTool();
                      }
                    }}
                    placeholder={tr(
                      "Tool name (e.g. Premiere Pro, Spline, Claude...)",
                      "Nama tool (misal: Premiere Pro, Spline, Claude...)",
                      "Namo tool (misal: Premiere Pro, Spline, Claude...)"
                    )}
                    className="flex-1 bg-[#12151a] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#16b09f]"
                  />
                  <select
                    value={newToolCategory}
                    onChange={(e) => setNewToolCategory(e.target.value as "Design" | "AI")}
                    className="bg-[#12151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#16b09f] cursor-pointer"
                  >
                    <option value="Design">Design</option>
                    <option value="AI">AI</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddTool()}
                    className="px-4 py-2 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs transition-all active:scale-95 shadow-md shadow-[#16b09f]/20 cursor-pointer shrink-0"
                  >
                    {tr("Add", "Tambah", "Tambah")}
                  </button>
                </div>
              </div>

              {/* Design Tools List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    Design Tools ({tempDesignTools.length})
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {tr("Click ✕ to remove", "Klik ✕ untuk mengurangi/menghapus", "Klik ✕ untuak mangurangi/mahapuih")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-neutral-950/40 border border-white/5 min-h-[50px]">
                  {tempDesignTools.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-neutral-200 group hover:border-white/20 transition-all"
                    >
                      <ToolIcon name={tool} />
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTempDesignTool(tool)}
                        className="text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors p-0.5 rounded cursor-pointer ml-0.5"
                        title={tr(`Remove ${tool}`, `Hapus ${tool}`, `Hapuih ${tool}`)}
                      >
                        <HiXMark className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ))}
                  {tempDesignTools.length === 0 && (
                    <span className="text-xs text-neutral-500 italic p-1">
                      {tr("No design tools.", "Belum ada tool design.", "Alun ado tool design.")}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Tools List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    AI Tools ({tempAiTools.length})
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {tr("Click ✕ to remove", "Klik ✕ untuk mengurangi/menghapus", "Klik ✕ untuak mangurangi/mahapuih")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-neutral-950/40 border border-white/5 min-h-[50px]">
                  {tempAiTools.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-neutral-200 group hover:border-white/20 transition-all"
                    >
                      <ToolIcon name={tool} isAi />
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTempAiTool(tool)}
                        className="text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors p-0.5 rounded cursor-pointer ml-0.5"
                        title={tr(`Remove ${tool}`, `Hapus ${tool}`, `Hapuih ${tool}`)}
                      >
                        <HiXMark className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ))}
                  {tempAiTools.length === 0 && (
                    <span className="text-xs text-neutral-500 italic p-1">
                      {tr("No AI tools.", "Belum ada tool AI.", "Alun ado tool AI.")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-neutral-950/60 flex items-center justify-end gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelManageTools}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  {tr("Cancel", "Batal", "Batal")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveManageTools}
                  className="px-5 py-2 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black text-xs font-bold transition-all shadow-md shadow-[#16b09f]/20 cursor-pointer active:scale-95"
                >
                  {tr("Save Changes", "Simpan Perubahan", "Simpan Parubahan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Text Edit Popup Modal */}
      {mobileTextModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col justify-end md:hidden bg-black/80 backdrop-blur-md">
          <div
            className={`w-full border-t rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col ${
              isLight
                ? "bg-white border-slate-200 text-slate-800"
                : "bg-[#12161f] border-white/15 text-white"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b shrink-0 ${
                isLight ? "border-slate-200" : "border-white/10"
              }`}
            >
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                <HiPencilSquare className="w-4 h-4 text-[#16b09f]" />
                <span>{mobileTextModal.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setMobileTextModal((prev) => ({ ...prev, isOpen: false }))}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              {mobileTextModal.isTextarea ? (
                <>
                  <textarea
                    autoFocus
                    rows={8}
                    maxLength={mobileTextModal.maxLength}
                    value={mobileTextModal.value}
                    onChange={(e) =>
                      setMobileTextModal((prev) => ({ ...prev, value: e.target.value }))
                    }
                    style={{ color: isLight ? "#0f172a" : "#ffffff" }}
                    className={`w-full flex-1 border rounded-2xl p-4 text-sm outline-none focus:border-[#16b09f] transition-colors leading-relaxed resize-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 placeholder:text-slate-400"
                        : "bg-[#1a202c] border-white/15 placeholder:text-neutral-500"
                    }`}
                    placeholder="Ketik teks di sini..."
                  />
                  {mobileTextModal.maxLength && (
                    <div
                      className={`text-right text-[11px] font-mono ${
                        isLight ? "text-slate-500" : "text-neutral-400"
                      }`}
                    >
                      {mobileTextModal.value.length} / {mobileTextModal.maxLength}
                    </div>
                  )}
                </>
              ) : (
                <input
                  autoFocus
                  type="text"
                  maxLength={mobileTextModal.maxLength}
                  value={mobileTextModal.value}
                  onChange={(e) =>
                    setMobileTextModal((prev) => ({ ...prev, value: e.target.value }))
                  }
                  style={{ color: isLight ? "#0f172a" : "#ffffff" }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16b09f] transition-colors ${
                    isLight
                      ? "bg-slate-50 border-slate-300 placeholder:text-slate-400"
                      : "bg-[#1a202c] border-white/15 placeholder:text-neutral-500"
                  }`}
                  placeholder="Ketik teks di sini..."
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileTextModal((prev) => ({ ...prev, isOpen: false }))}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs transition-colors cursor-pointer text-center ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                }`}
              >
                {tr("Cancel", "Batal", "Batal")}
              </button>
              <button
                type="button"
                onClick={() => {
                  mobileTextModal.onSave(mobileTextModal.value);
                  setMobileTextModal((prev) => ({ ...prev, isOpen: false }));
                  showToast(tr("Teks berhasil diperbarui!", "Text updated successfully!", "Teks berhasil dipabarui!"));
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs transition-transform active:scale-95 shadow-md shadow-[#16b09f]/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <HiCheck className="w-4 h-4" />
                <span>{tr("Save / Done", "Selesai & Simpan", "Salasai")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



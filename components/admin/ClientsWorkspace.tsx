"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  HiPlus,
  HiStar,
  HiMagnifyingGlass,
  HiArrowTopRightOnSquare,
  HiEllipsisHorizontal,
  HiArrowUpTray,
  HiPencilSquare,
  HiTrash,
  HiSquares2X2,
  HiBars3BottomLeft,
  HiCheck,
  HiXMark,
  HiSparkles,
} from "react-icons/hi2";
import { ClientItem } from "@/context/PortfolioDataContext";

interface ClientsWorkspaceProps {
  clients: ClientItem[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onOpenAddFolder: () => void;
  onOpenEditFolder: (client: ClientItem) => void;
  onDeleteFolder: (client: ClientItem) => void;
  onOpenUploadWork: () => void;
  onOpenEditWork: (work: any) => void;
  onDeleteWork: (clientId: string, workId: string, workTitle: string) => void;
  onSaveClientDescription: (clientId: string, desc: string, tools: string[]) => void;
  onReplaceCoverImage?: (clientId: string, file: File) => void;
  onViewWebsite: () => void;
  showToast: (msg: string) => void;
}

export default function ClientsWorkspace({
  clients,
  selectedClientId,
  onSelectClient,
  onOpenAddFolder,
  onOpenEditFolder,
  onDeleteFolder,
  onOpenUploadWork,
  onOpenEditWork,
  onDeleteWork,
  onSaveClientDescription,
  onReplaceCoverImage,
  onViewWebsite,
  showToast,
}: ClientsWorkspaceProps) {
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
  const [descriptionInput, setDescriptionInput] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "tools" | "assets">("overview");

  // Assets toolbar states
  const [assetSearch, setAssetSearch] = useState("");
  const [assetSort, setAssetSort] = useState<"newest" | "oldest" | "title">("newest");
  const [assetViewMode, setAssetViewMode] = useState<"grid" | "list">("grid");

  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Sync inputs when selected client changes
  React.useEffect(() => {
    if (selectedClient) {
      setCategoryInput(selectedClient.category || "Automotive Dealer");
      setDescriptionInput(selectedClient.description || "");
      setSelectedTools(
        selectedClient.tools && selectedClient.tools.length > 0
          ? selectedClient.tools
          : ["Figma", "Photoshop", "Magnific AI"]
      );
    }
  }, [selectedClient]);

  // Filter clients for the middle column
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
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

  // Count metrics for tabs
  const favoriteCount = useMemo(() => {
    return clients.filter((c) => favorites[c.id]).length;
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
      onSaveClientDescription(selectedClient.id, descriptionInput, nextTools);
      showToast(`Updated tools: ${toolName}`);
    }
  };

  // Save Portfolio Information handler
  const handleSaveInfo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedClient) return;

    onSaveClientDescription(selectedClient.id, descriptionInput, selectedTools);
    showToast(`Saved portfolio info for ${selectedClient.clientName}!`);
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

  // Available Tools definition
  const designTools = [
    "Figma",
    "Photoshop",
    "Illustrator",
    "After Effects",
    "Blender",
    "Cinema 4D",
    "InDesign",
  ];
  const aiTools = [
    "Magnific AI",
    "Midjourney",
    "ChatGPT",
    "Gemini",
    "Firefly",
  ];

  // Selected Cover Image: first work image or custom cover
  const coverImageUrl =
    selectedClient?.works?.[0]?.image ||
    "/assets/antigravity/hero-large.jpg";

  const handleCoverFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClient) return;
    if (onReplaceCoverImage) {
      onReplaceCoverImage(selectedClient.id, file);
    } else {
      // Fallback: trigger upload modal
      onOpenUploadWork();
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0d0f13]">
      {/* ========================================================
          MIDDLE COLUMN: CLIENTS PANEL (~300px)
         ======================================================== */}
      <aside className="w-full md:w-[300px] shrink-0 bg-[#090b0e] border-r border-white/5 flex flex-col h-full overflow-hidden select-none">
        {/* Header */}
        <div className="p-4 pb-3 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Clients</h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Client folders and portfolios
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddFolder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14AF9E] hover:bg-[#119889] text-black font-semibold text-xs transition-all active:scale-95 shadow-md shadow-[#14AF9E]/20 cursor-pointer"
            >
              <HiPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New folder</span>
            </button>
          </div>

          {/* Filter Tabs: All, Recent, Favorites */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-900 border border-white/5">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                filterTab === "all"
                  ? "bg-[#14AF9E]/15 text-[#14AF9E] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All {clients.length}
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("recent")}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                filterTab === "recent"
                  ? "bg-[#14AF9E]/15 text-[#14AF9E] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Recent 3
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("favorites")}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                filterTab === "favorites"
                  ? "bg-[#14AF9E]/15 text-[#14AF9E] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Favorites {favoriteCount}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search clients"
              className="w-full bg-[#12151a] border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E]/60 transition-colors"
            />
          </div>
        </div>

        {/* Scrollable Client Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredClients.map((client) => {
            const isSelected = client.id === selectedClientId;
            const isFav = !!favorites[client.id];
            const worksCount = client.works?.length || 0;
            const thumbImage = client.works?.[0]?.image || client.logo;

            return (
              <div
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className={`group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#151a21] border border-[#14AF9E]/30 shadow-sm"
                    : "hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Square Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 border border-white/10 shrink-0 flex items-center justify-center">
                    {thumbImage ? (
                      <img
                        src={thumbImage}
                        alt={client.clientName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-xs font-bold text-neutral-300">
                        {client.clientName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Title & Works count */}
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isSelected ? "text-white" : "text-neutral-200 group-hover:text-white"
                      }`}
                    >
                      {client.clientName}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-sans">
                      {worksCount} {worksCount === 1 ? "work" : "works"}
                    </p>
                  </div>
                </div>

                {/* Favorite Star Button */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(client.id, e)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isFav
                      ? "text-[#14AF9E] hover:text-[#119889]"
                      : "text-neutral-600 hover:text-neutral-300 opacity-0 group-hover:opacity-100"
                  }`}
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <HiStar className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                </button>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-500">
              No clients found matching filter.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={() => {
              setFilterTab("all");
              setClientSearch("");
            }}
            className="text-[11px] text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer"
          >
            View all {clients.length} clients
          </button>
        </div>
      </aside>

      {/* ========================================================
          RIGHT MAIN COLUMN: CLIENT DETAIL & ASSET WORKSPACE
         ======================================================== */}
      {selectedClient ? (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Clients</span>
            <span>/</span>
            <span className="text-white font-medium">{selectedClient.clientName}</span>
          </div>

          {/* Client Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3.5">
              {/* Rounded Square Avatar [KD] */}
              <div className="w-12 h-12 rounded-xl bg-[#161a22] border border-white/10 flex items-center justify-center font-bold text-white text-base shadow-inner shrink-0">
                {clientInitials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {selectedClient.clientName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {selectedClient.category || "Automotive Dealer"} · {selectedClient.works?.length || 0} works · Updated Jan 15, 2026
                </p>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 shrink-0 relative">
              <button
                type="button"
                onClick={onViewWebsite}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>View website</span>
                <HiArrowTopRightOnSquare className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* More Menu Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="More actions"
                >
                  <HiEllipsisHorizontal className="w-4 h-4" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#14181f] border border-white/10 shadow-2xl p-1 z-30">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenEditFolder(selectedClient);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-white/5 rounded-lg text-left cursor-pointer"
                    >
                      <HiPencilSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rename folder</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenUploadWork();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-white/5 rounded-lg text-left cursor-pointer"
                    >
                      <HiArrowUpTray className="w-3.5 h-3.5 text-[#14AF9E]" />
                      <span>Add work</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onDeleteFolder(selectedClient);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left cursor-pointer"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                      <span>Delete folder</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-white/5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveSubTab("overview")}
              className={`pb-2.5 transition-colors cursor-pointer relative ${
                activeSubTab === "overview"
                  ? "text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Overview
              {activeSubTab === "overview" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14AF9E]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("tools")}
              className={`pb-2.5 transition-colors cursor-pointer relative ${
                activeSubTab === "tools"
                  ? "text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Tools {selectedTools.length}
              {activeSubTab === "tools" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14AF9E]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("assets")}
              className={`pb-2.5 transition-colors cursor-pointer relative ${
                activeSubTab === "assets"
                  ? "text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Assets {selectedClient.works?.length || 0}
              {activeSubTab === "assets" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14AF9E]" />
              )}
            </button>
          </div>

          {/* Portfolio Information & Cover Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Portfolio Information Form */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">Portfolio information</h3>
                <button
                  type="button"
                  onClick={handleSaveInfo}
                  className="px-3 py-1 rounded-lg bg-[#14AF9E] hover:bg-[#119889] text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save changes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="Automotive Dealer"
                    className="w-full bg-[#161a22] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E]/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                    Main headline
                  </label>
                  <input
                    type="text"
                    value={headlineInput}
                    onChange={(e) => setHeadlineInput(e.target.value)}
                    placeholder="PROFESSIONAL EXPERIENCE"
                    className="w-full bg-[#161a22] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E]/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-neutral-400 font-medium">
                    Description
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {descriptionInput.length} / 500
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="KIA Dufour is an authorized automotive dealership network in France..."
                  className="w-full bg-[#161a22] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E]/60 transition-colors leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Right: Cover Card with Replace Button */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111419] border border-white/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-semibold text-white">Cover</h3>
                <div>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                  >
                    <HiArrowUpTray className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                </div>
              </div>

              {/* Cover Image Preview */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-md">
                <img
                  src={coverImageUrl}
                  alt={selectedClient.clientName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-300">
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
          <div className="p-5 rounded-2xl bg-[#111419] border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Software & AI tools</h3>
                <span className="text-xs text-neutral-400 font-mono">
                  {selectedTools.length} selected
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allTools = [...designTools.slice(0, 2), ...aiTools.slice(0, 1)];
                  setSelectedTools(allTools);
                  if (selectedClient) {
                    onSaveClientDescription(selectedClient.id, descriptionInput, allTools);
                  }
                  showToast("Tools set to default selection");
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Manage
              </button>
            </div>

            {/* Design Tools Row */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-neutral-400 font-medium block">Design</span>
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#14AF9E]/20 text-[#14AF9E] border border-[#14AF9E]/50 font-semibold"
                          : "bg-white/[0.03] hover:bg-white/[0.07] text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {isChecked && <HiCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{tool}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Tools Row */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-neutral-400 font-medium block">AI</span>
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#14AF9E]/20 text-[#14AF9E] border border-[#14AF9E]/50 font-semibold"
                          : "bg-white/[0.03] hover:bg-white/[0.07] text-neutral-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {isChecked && <HiCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{tool}</span>
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
                <h3 className="text-sm font-semibold text-white">Assets</h3>
                <span className="text-xs text-neutral-400 font-mono">
                  {selectedClient.works?.length || 0} items
                </span>
              </div>

              {/* Assets Toolbar: Search, Sort, View Mode */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Search assets"
                    className="bg-[#12151a] border border-white/5 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#14AF9E]/60 transition-colors w-40 sm:w-48"
                  />
                </div>

                <select
                  value={assetSort}
                  onChange={(e) => setAssetSort(e.target.value as any)}
                  className="bg-[#12151a] border border-white/5 rounded-lg px-2.5 py-1 text-xs text-neutral-300 outline-none focus:border-[#14AF9E]/60 cursor-pointer"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Alphabetical</option>
                </select>

                <div className="flex items-center p-0.5 rounded-lg bg-[#12151a] border border-white/5">
                  <button
                    type="button"
                    onClick={() => setAssetViewMode("grid")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      assetViewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    <HiSquares2X2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetViewMode("list")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      assetViewMode === "list" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
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
                    className="group relative rounded-xl bg-[#111419] border border-white/5 hover:border-white/20 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] w-full bg-black overflow-hidden">
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
                          title="Edit case study"
                        >
                          <HiPencilSquare className="w-4 h-4" />
                        </button>
                        {/* Delete Trash */}
                        <button
                          type="button"
                          onClick={() => onDeleteWork(selectedClient.id, work.id, work.title)}
                          className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                          title="Delete image"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2.5">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {work.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        {work.year || "Jan 15, 2026"} · {work.aspect || "4:5"}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Dashed "+ Add images" Card */}
              <button
                type="button"
                onClick={onOpenUploadWork}
                className="aspect-[16/10] sm:aspect-auto sm:min-h-[140px] rounded-xl border border-dashed border-white/15 hover:border-[#14AF9E] bg-white/[0.01] hover:bg-[#14AF9E]/5 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#14AF9E] group-hover:text-black flex items-center justify-center transition-colors">
                  <HiPlus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs font-medium">Add images</span>
              </button>
            </div>
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 text-sm">
          Select a client folder from the left list.
        </div>
      )}
    </div>
  );
}

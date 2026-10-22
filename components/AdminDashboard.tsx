"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPlay,
  HiTrash,
  HiCheck,
  HiArrowPath,
  HiFolder,
  HiFolderPlus,
  HiEye,
  HiSparkles,
  HiXMark,
  HiVideoCamera,
  HiPencilSquare,
  HiPlus,
  HiArrowUpTray,
  HiPhoto,
  HiArrowRightOnRectangle,
  HiInformationCircle,
  HiTag,
} from "react-icons/hi2";
import {
  usePortfolioData,
  extractYouTubeId,
  ClientItem,
} from "@/context/PortfolioDataContext";
import { getCaseStudy } from "@/components/Projects";

export default function AdminDashboard({ onClose }: { onClose?: () => void }) {
  const {
    stage3,
    clients,
    updateStage3Video,
    removeStage3Video,
    updateClientDescription,
    addClientWork,
    updateClientWork,
    deleteClientWork,
    addClientFolder,
    deleteClientFolder,
    resetPortfolioData,
    setIsAdminMode,
    adminLogout,
    isCloudSyncActive,
  } = usePortfolioData();

  // Active Tab: 'flagship' (YouTube Embed) | 'clients' (Brand Descriptions & My Work Gallery)
  const [activeTab, setActiveTab] = useState<"flagship" | "clients">("clients");

  // Tab 1: Flagship Showcase Video State
  const [videoUrlInput, setVideoUrlInput] = useState(
    stage3.heroCard.youtubeUrl || (stage3.heroCard.videoId ? `https://www.youtube.com/watch?v=${stage3.heroCard.videoId}` : "")
  );
  const [videoTitle, setVideoTitle] = useState(stage3.heroCard.title || "From Visual Craft to Technology");
  const [videoCategory, setVideoCategory] = useState(stage3.heroCard.category || "VISUAL CRAFT | DIGITAL | AI");
  const [videoHeadline, setVideoHeadline] = useState(stage3.headline || "A journey shaped by creativity and change.");
  const [videoClassTag, setVideoClassTag] = useState(stage3.classTag || "CREATIVE JOURNEY | 2012 TO PRESENT");
  const [videoDescription, setVideoDescription] = useState(
    stage3.heroCard.description ||
      "A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology — pushing the boundaries of creative digital experiences."
  );
  const [videoEnabled, setVideoEnabled] = useState(stage3.heroCard.isVideoEnabled !== false);

  // Tab 2: Client Brand Description & Works State
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.length > 0 ? clients[0].id : "client-kia"
  );
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const [clientDescInput, setClientDescInput] = useState<string>("");
  const [clientToolsInput, setClientToolsInput] = useState<string>("Figma, Photoshop, Magnific AI, ChatGPT, Gemini");

  // Helper to toggle tools in clientToolsInput
  const toggleToolChip = (toolName: string) => {
    const currentList = clientToolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const exists = currentList.some((t) => t.toLowerCase() === toolName.toLowerCase());
    let nextList: string[];
    if (exists) {
      nextList = currentList.filter((t) => t.toLowerCase() !== toolName.toLowerCase());
    } else {
      nextList = [...currentList, toolName];
    }
    setClientToolsInput(nextList.join(", "));
  };

  // Add Folder Modal State
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderCategory, setNewFolderCategory] = useState("");
  const [newFolderYear, setNewFolderYear] = useState(new Date().getFullYear().toString());

  // Upload Form Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("Digital Campaign");
  const [uploadAspect, setUploadAspect] = useState<"4:5" | "1:1" | "16:9">("4:5");
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear().toString());
  // Tool tags for upload — comma-separated input
  const [uploadToolsInput, setUploadToolsInput] = useState("Figma, Photoshop, Magnific AI");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Work & Case Study Modal State
  const [editingWork, setEditingWork] = useState<any | null>(null);
  const [editWorkTitle, setEditWorkTitle] = useState("");
  const [editWorkType, setEditWorkType] = useState("");
  const [editWorkYear, setEditWorkYear] = useState("");
  const [editWorkAspect, setEditWorkAspect] = useState<"4:5" | "1:1" | "16:9">("4:5");
  const [editWorkBrief, setEditWorkBrief] = useState("");
  const [editWorkChallenge, setEditWorkChallenge] = useState("");
  const [editWorkSolution, setEditWorkSolution] = useState("");
  const [editWorkRole, setEditWorkRole] = useState("");
  const [editWorkToolsInput, setEditWorkToolsInput] = useState("");

  // Helper to open edit modal pre-filled with existing or default case study
  const handleOpenEditWork = (work: any) => {
    const defaultStudy = getCaseStudy(
      {
        ...work,
        clientName: selectedClient?.clientName || "Brand",
      },
      "en"
    );

    setEditingWork(work);
    setEditWorkTitle(work.title || defaultStudy.brand || "");
    setEditWorkType(work.type || "Digital Campaign");
    setEditWorkYear(work.year || defaultStudy.year || "2026");
    setEditWorkAspect(work.aspect || "4:5");
    setEditWorkBrief(work.brief || defaultStudy.brief || "");
    setEditWorkChallenge(work.challenge || defaultStudy.challenge || "");
    setEditWorkSolution(work.solution || defaultStudy.solution || "");
    setEditWorkRole(work.role || defaultStudy.role || "");

    const initialTools =
      work.tools && work.tools.length > 0
        ? work.tools
        : selectedClient?.tools && selectedClient.tools.length > 0
        ? selectedClient.tools
        : defaultStudy.tools || ["figma", "photoshop", "magnific", "gpt", "gemini"];

    setEditWorkToolsInput(Array.isArray(initialTools) ? initialTools.join(", ") : initialTools);
  };

  const toggleEditToolChip = (toolName: string) => {
    const currentList = editWorkToolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const exists = currentList.some((t) => t.toLowerCase() === toolName.toLowerCase());
    let nextList: string[];
    if (exists) {
      nextList = currentList.filter((t) => t.toLowerCase() !== toolName.toLowerCase());
    } else {
      nextList = [...currentList, toolName];
    }
    setEditWorkToolsInput(nextList.join(", "));
  };

  const handleSaveEditWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork || !selectedClient) return;

    const parsedTools = editWorkToolsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const updatedWork = {
      ...editingWork,
      title: editWorkTitle.trim(),
      type: editWorkType.trim(),
      year: editWorkYear.trim(),
      aspect: editWorkAspect,
      brief: editWorkBrief.trim(),
      challenge: editWorkChallenge.trim(),
      solution: editWorkSolution.trim(),
      role: editWorkRole.trim(),
      tools: parsedTools,
    };

    updateClientWork(selectedClient.id, updatedWork);
    showToast(`Detail karya & case study "${updatedWork.title}" berhasil disimpan & langsung aktif di web!`);
    setEditingWork(null);
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync client description & tools input when selected client changes
  useEffect(() => {
    if (selectedClient) {
      setClientDescInput(selectedClient.description || "");
      if (selectedClient.tools && selectedClient.tools.length > 0) {
        setClientToolsInput(selectedClient.tools.join(", "));
      } else {
        setClientToolsInput("Figma, Photoshop, Magnific AI, ChatGPT, Gemini");
      }
    }
  }, [selectedClientId, clients, selectedClient]);

  // Sync Flagship Video state whenever stage3 updates (e.g. from Supabase Cloud or localStorage)
  useEffect(() => {
    if (stage3) {
      if (stage3.headline) setVideoHeadline(stage3.headline);
      if (stage3.classTag) setVideoClassTag(stage3.classTag);
      if (stage3.heroCard) {
        const url =
          stage3.heroCard.youtubeUrl ||
          (stage3.heroCard.videoId ? `https://www.youtube.com/watch?v=${stage3.heroCard.videoId}` : "");
        if (url) setVideoUrlInput(url);
        if (stage3.heroCard.title) setVideoTitle(stage3.heroCard.title);
        if (stage3.heroCard.category) setVideoCategory(stage3.heroCard.category);
        if (stage3.heroCard.description) setVideoDescription(stage3.heroCard.description);
        if (stage3.heroCard.isVideoEnabled !== undefined) setVideoEnabled(stage3.heroCard.isVideoEnabled);
      }
    }
  }, [stage3]);

  // Jump straight to Stage 3 on Public Web
  const handleJumpToFlagshipWeb = () => {
    try {
      sessionStorage.setItem("rizx_scroll_to_flagship", "true");
    } catch (_) {}
    if (onClose) onClose();
    else setIsAdminMode(false);
  };

  // Derived YouTube ID for live preview
  const previewYouTubeId = extractYouTubeId(videoUrlInput);

  // Handlers for Flagship Video Showcase
  const handleSaveVideo = (e?: React.FormEvent, andJumpToWeb: boolean = false) => {
    if (e) e.preventDefault();
    const parsedId = extractYouTubeId(videoUrlInput);
    if (videoUrlInput.trim() && !parsedId) {
      showToast("Peringatan: Format URL YouTube tidak valid. Mohon periksa kembali.");
      return;
    }

    updateStage3Video({
      youtubeUrl: videoUrlInput.trim(),
      videoId: parsedId,
      title: videoTitle.trim(),
      category: videoCategory.trim(),
      description: videoDescription.trim(),
      headline: videoHeadline.trim(),
      classTag: videoClassTag.trim(),
      isVideoEnabled: videoEnabled,
    });

    if (andJumpToWeb) {
      handleJumpToFlagshipWeb();
    } else {
      showToast("Berhasil! Semua teks & video Flagship Showcase telah diperbarui dan langsung aktif.");
    }
  };

  const handleRemoveVideo = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus video embed dari Flagship Showcase?")) {
      removeStage3Video();
      setVideoUrlInput("");
      showToast("Video embed berhasil dihapus dari Flagship Showcase.");
    }
  };

  // Handlers for Client Brand Description & Tools
  const handleSaveClientDescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const parsedTools = clientToolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    updateClientDescription(selectedClient.id, clientDescInput.trim(), parsedTools);
    showToast(`Deskripsi & Tag Tools untuk "${selectedClient.clientName}" berhasil disimpan & langsung aktif di web!`);
  };

  const handleResetClientDescription = () => {
    if (selectedClient) {
      setClientDescInput(selectedClient.description || "");
      if (selectedClient.tools && selectedClient.tools.length > 0) {
        setClientToolsInput(selectedClient.tools.join(", "));
      } else {
        setClientToolsInput("Figma, Photoshop, Magnific AI, ChatGPT, Gemini");
      }
      showToast("Form dikembalikan ke data sebelumnya.");
    }
  };

  // Handlers for Uploading Portfolio Image
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    const defaultName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    if (!uploadTitle) {
      setUploadTitle(defaultName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview || !selectedClient) {
      showToast("Peringatan: Silakan pilih file gambar terlebih dahulu.");
      return;
    }

    const toolsArray = uploadToolsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newWork = {
      id: `${selectedClient.id}-${Date.now()}`,
      title: uploadTitle.trim() || "Creative Visual Deliverable",
      type: uploadType.trim() || "Digital Campaign",
      image: uploadPreview,
      aspect: uploadAspect,
      brand: selectedClient.clientName,
      year: uploadYear.trim() || new Date().getFullYear().toString(),
      brief: `Digital creative visual and commercial advertising asset produced for ${selectedClient.clientName}.`,
      approach: "Modern aesthetic composition combining sharp creative direction with AI-assisted digital production.",
      role: "Art direction, prompt engineering, visual creation, and digital asset layout.",
      challenge: "Aligning campaign specifications with brand guidelines while maintaining premier artistic standards.",
      solution: "Developed controlled prompts, tailored color palettes, and balanced typography for high-impact social reach.",
      tools: toolsArray.length > 0 ? toolsArray : ["figma", "photoshop"],
      isClientWork: true,
    };

    addClientWork(selectedClient.id, newWork);
    showToast(`Karya "${newWork.title}" berhasil diupload ke folder ${selectedClient.clientName}!`);

    // Reset Form Modal
    setUploadFile(null);
    setUploadPreview(null);
    setUploadTitle("");
    setUploadToolsInput("Figma, Photoshop, Magnific AI");
    setUploadYear(new Date().getFullYear().toString());
    setIsUploadModalOpen(false);
  };

  // Handlers for Deleting Portfolio Work Item
  const handleDeleteWork = (clientId: string, workId: string, workTitle: string) => {
    if (window.confirm(`Hapus gambar portofolio "${workTitle}" dari folder ini?`)) {
      deleteClientWork(clientId, workId);
      showToast(`Gambar "${workTitle}" berhasil dihapus dari portofolio.`);
    }
  };

  // Handler: Add new client folder
  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      showToast("Peringatan: Nama brand/klien tidak boleh kosong.");
      return;
    }
    addClientFolder({
      clientName: newFolderName.trim(),
      category: newFolderCategory.trim() || `Portfolio — ${newFolderName.trim()}`,
      description: "",
    });
    showToast(`Folder "client - ${newFolderName.trim()}" berhasil dibuat!`);
    setNewFolderName("");
    setNewFolderCategory("");
    setNewFolderYear(new Date().getFullYear().toString());
    setIsAddFolderOpen(false);
  };

  // Handler: Delete a client folder (all folders can be deleted)
  const handleDeleteFolder = (client: ClientItem) => {
    const msg = `Hapus folder "client - ${client.clientName}" beserta semua isinya secara permanen? Tindakan ini tidak bisa dibatalkan.`;
    if (window.confirm(msg)) {
      deleteClientFolder(client.id);
      if (selectedClientId === client.id && clients.length > 1) {
        setSelectedClientId(clients.find((c) => c.id !== client.id)?.id || clients[0].id);
      }
      showToast(`Folder "${client.clientName}" berhasil dihapus dari portofolio.`);
    }
  };

  const handleFullReset = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengembalikan seluruh data ke pengaturan awal (Factory Defaults)?"
      )
    ) {
      resetPortfolioData();
      showToast("Seluruh data berhasil dikembalikan ke default.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-200 selection:bg-[#14AF9E]/30 selection:text-white pb-24 font-sans">
      {/* Top Floating Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-[#0d0e12]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14AF9E] to-cyan-600 flex items-center justify-center text-black font-black text-sm shadow-[0_0_20px_rgba(20,175,158,0.4)]">
            RX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Rizx Studio — Admin Dashboard
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                  isCloudSyncActive
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-[#14AF9E]/20 text-[#14AF9E] border-[#14AF9E]/30"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{isCloudSyncActive ? "SUPABASE CLOUD" : "LOCAL STORAGE"}</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
              Setiap kali klik Simpan / Upload, data langsung otomatis update ke web publik rizxstudio.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleFullReset}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-white/10 text-xs font-mono transition-colors cursor-pointer"
            title="Reset seluruh modifikasi ke data default"
          >
            <HiArrowPath className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={adminLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
            title="Keluar dari sesi Admin"
          >
            <HiArrowRightOnRectangle className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          <button
            type="button"
            onClick={handleJumpToFlagshipWeb}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14AF9E]/15 hover:bg-[#14AF9E]/25 text-[#14AF9E] border border-[#14AF9E]/35 text-xs font-mono transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Lompat langsung ke pemutar video Flagship Showcase di web"
          >
            <HiVideoCamera className="w-4 h-4 text-[#14AF9E]" />
            <span className="hidden sm:inline font-semibold">Tonton Video di Web ↗</span>
            <span className="sm:hidden font-semibold">Video ↗</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              else setIsAdminMode(false);
            }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#14AF9E] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <HiEye className="w-4 h-4" />
            <span>Lihat Public Web</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-900/80 border border-white/10 max-w-xl mx-auto mb-8 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("clients")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "clients"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiFolder className="w-4 h-4" />
            <span>1. Manajemen Portofolio & Klien</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flagship")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "flagship"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiVideoCamera className="w-4 h-4" />
            <span>2. Embed Video YouTube</span>
          </button>
        </div>

        {/* TAB: CLIENT BRAND & PORTFOLIO WORKS MANAGEMENT (MY WORK PANEL) */}
        {activeTab === "clients" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header Explainer */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold block mb-1">
                FOLDER MANAGEMENT & MY WORK ASSETS
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Manajemen Folder & Portofolio (Format: client - [Nama Brand])
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl leading-relaxed">
                Pilih folder klien di bawah untuk mengupload gambar portofolio baru, menghapus karya (ikon silang X di sudut gambar), dan mengedit narasi brand. Perubahan langsung tersimpan dan tampil di public website.
              </p>
            </div>

            {/* Folder Grid Selector (Format: client - [Nama Brand]) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Daftar Folder Klien ({clients.length} Brand):
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddFolderOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14AF9E]/15 hover:bg-[#14AF9E]/25 text-[#14AF9E] border border-[#14AF9E]/35 text-xs font-mono font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <HiFolderPlus className="w-4 h-4" />
                  <span>+ Buat Folder Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {clients.map((client) => {
                  const isSelected = client.id === selectedClientId;
                  const formattedFolderTag = `client - ${client.clientName}`;

                  return (
                    <div key={client.id} className="relative group/folder">
                      <button
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 ${
                          isSelected
                            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-[1.02]"
                            : "bg-neutral-900/70 hover:bg-neutral-800/80 text-neutral-300 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-black/10 text-neutral-900 font-bold"
                                : "bg-white/5 text-neutral-400"
                            }`}
                          >
                            {client.works?.length || 0} Karya
                          </span>
                          <div className="flex items-center gap-1">
                            <HiFolder
                              className={`w-4 h-4 ${isSelected ? "text-[#14AF9E]" : "text-neutral-500"}`}
                            />
                          </div>
                        </div>

                        <div>
                          <p
                            className={`text-[11px] font-mono truncate font-semibold ${
                              isSelected ? "text-neutral-900" : "text-cyan-400"
                            }`}
                          >
                            {formattedFolderTag}
                          </p>
                          <p
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-black" : "text-white"
                            }`}
                          >
                            {client.clientName}
                          </p>
                        </div>
                      </button>

                      {/* Delete folder button — visible on hover for ALL folders */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(client);
                        }}
                        className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-all opacity-0 group-hover/folder:opacity-100 scale-75 group-hover/folder:scale-100 cursor-pointer"
                        title={`Hapus folder ${client.clientName}`}
                      >
                        <HiXMark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Client Control Section */}
            {selectedClient && (
              <div className="space-y-6 pt-2">
                {/* 1. Client Brand Description Editor */}
                <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm">
                  <form onSubmit={handleSaveClientDescription} className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-semibold">
                          FOLDER: client - {selectedClient.clientName}
                        </span>
                        <h3 className="text-base font-bold text-white">
                          Edit Deskripsi & Penjelasan Brand
                        </h3>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                        {selectedClient.works?.length || 0} Portofolio
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-mono text-neutral-300 font-medium">
                          Penjelasan / Deskripsi Klien & Brand <span className="text-cyan-400">*</span>
                        </label>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {clientDescInput.length} karakter
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={clientDescInput}
                        onChange={(e) => setClientDescInput(e.target.value)}
                        placeholder={`Tuliskan profil atau penjelasan brand ${selectedClient.clientName}, cakupan kampanye, atau nilai tambah kolaborasi...`}
                        className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-sans focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E] transition-all leading-relaxed"
                      />
                    </div>

                    {/* Tools Used / Software & AI yang Digunakan */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-mono text-neutral-300 font-medium">
                          Tools Used / Software & AI yang Digunakan
                        </label>
                        <span className="text-[11px] font-mono text-cyan-400">
                          Pisahkan dengan koma atau klik badge di bawah
                        </span>
                      </div>

                      <input
                        type="text"
                        value={clientToolsInput}
                        onChange={(e) => setClientToolsInput(e.target.value)}
                        placeholder="Figma, Photoshop, Magnific AI, ChatGPT, Gemini..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E] transition-all"
                      />

                      {/* Quick Select Tool Badges */}
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
                          Pilihan Cepat (Klik untuk Tambah / Hapus Tag):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Figma",
                            "Photoshop",
                            "Illustrator",
                            "After Effects",
                            "Blender",
                            "Cinema 4D",
                            "Magnific AI",
                            "Midjourney",
                            "ChatGPT",
                            "Gemini",
                          ].map((toolName) => {
                            const isIncluded = clientToolsInput
                              .toLowerCase()
                              .split(",")
                              .map((t) => t.trim())
                              .includes(toolName.toLowerCase());

                            return (
                              <button
                                key={toolName}
                                type="button"
                                onClick={() => toggleToolChip(toolName)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isIncluded
                                    ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/25 border border-[#14AF9E]"
                                    : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                                }`}
                              >
                                <span>{toolName}</span>
                                <span className="text-[10px] opacity-75">
                                  {isIncluded ? "✓" : "+"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <HiCheck className="w-4 h-4" />
                        <span>Simpan Deskripsi & Tag Tools (Auto-Update Web)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetClientDescription}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                      >
                        Reset Form
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Portfolio Works Gallery & Upload Section (My Work Panel) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                  {/* Gallery Header + Upload Trigger Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-mono text-[#14AF9E] uppercase tracking-widest font-semibold block">
                        MY WORK ASSETS · FOLDER {selectedClient.clientName.toUpperCase()}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>Galeri Gambar Portofolio</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                          {selectedClient.works?.length || 0} Item
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Klik tombol tanda silang (X) di sudut kanan atas pada gambar untuk menghapusnya langsung dari web portofolio.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#14AF9E] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      <HiArrowUpTray className="w-4 h-4" />
                      <span>+ Upload Gambar Portofolio Baru</span>
                    </button>
                  </div>

                  {/* Portfolio Grid with Delete (X) Button */}
                  {selectedClient.works && selectedClient.works.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                      {selectedClient.works.map((work: any) => {
                        return (
                          <div
                            key={work.id}
                            className="group relative rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 hover:border-cyan-400/50 transition-all shadow-lg flex flex-col"
                          >
                            {/* TOMBOL EDIT CASE STUDY: Icon Pensil di Sebelah Tombol X */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditWork(work);
                              }}
                              className="absolute top-2.5 right-11 z-20 w-7 h-7 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer"
                              title={`Edit detail & case study "${work.title}"`}
                            >
                              <HiPencilSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* TOMBOL HAPUS GAMBAR: Tanda X Silang di Pojok Kanan Atas */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWork(selectedClient.id, work.id, work.title);
                              }}
                              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer"
                              title={`Hapus gambar "${work.title}" dari folder`}
                              aria-label="Hapus karya"
                            >
                              <HiXMark className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            {/* Badges Top Left: Aspect Ratio & Year */}
                            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-black/75 border border-white/15 text-[10px] font-mono font-bold text-cyan-300 backdrop-blur-md">
                                {work.aspect || "4:5"}
                              </span>
                              {work.year && (
                                <span className="px-2 py-0.5 rounded-md bg-white/15 border border-white/20 text-[10px] font-mono font-semibold text-white backdrop-blur-md">
                                  {work.year}
                                </span>
                              )}
                            </div>

                            {/* Image Thumbnail Container */}
                            <div className="relative w-full aspect-[4/5] bg-black overflow-hidden">
                              <img
                                src={work.image}
                                alt={work.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                              {/* Bottom Caption Overlay inside image */}
                              <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider truncate">
                                  {work.type || "Digital Campaign"}
                                </p>
                                <h4 className="text-xs font-bold text-white truncate">
                                  {work.title}
                                </h4>
                              </div>
                            </div>

                            {/* Edit Case Study Action Bar at bottom of card */}
                            <div className="p-2 bg-neutral-900/90 border-t border-white/10 flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditWork(work)}
                                className="w-full py-1.5 px-2 text-[11px] font-mono font-semibold text-cyan-300 hover:text-white flex items-center justify-center gap-1.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                              >
                                <HiPencilSquare className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Edit Case Study</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-10 rounded-2xl bg-neutral-950/80 border border-dashed border-white/15 text-center flex flex-col items-center justify-center">
                      <HiPhoto className="w-12 h-12 text-neutral-600 mb-2" />
                      <p className="text-sm font-semibold text-neutral-300">
                        Belum ada gambar di folder {selectedClient.clientName}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                        Klik tombol "+ Upload Gambar Portofolio Baru" di atas untuk menambahkan visual kampanye ke folder ini.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: FLAGSHIP SHOWCASE YOUTUBE EMBED */}
        {activeTab === "flagship" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Section Explainer Banner */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-white/10 backdrop-blur-md">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-[#14AF9E] uppercase font-semibold block mb-1">
                    SECTION CONTROL: STAGE 3
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Flagship Showcase: From Visual Craft to Technology (VISUAL CRAFT | DIGITAL | AI)
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                    Kelola integrasi pemutar video YouTube sinematik khusus untuk section karya unggulan ini. Video langsung tayang di section Flagship Showcase pada web publik.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                      videoEnabled && previewYouTubeId
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {videoEnabled && previewYouTubeId ? "Video Embed Aktif" : "Mode Gambar Standar"}
                  </span>
                </div>
              </div>

              {/* Informational Position Note */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-3 text-xs text-neutral-300">
                <span className="p-1 rounded-md bg-[#14AF9E]/20 text-[#14AF9E] shrink-0 mt-0.5">
                  <HiInformationCircle className="w-4 h-4" />
                </span>
                <p className="text-neutral-400 leading-relaxed text-[11px] sm:text-xs">
                  <strong className="text-white">Lokasi di Web Publik:</strong> Section ini berada di dalam sekuens interaktif <em>Projects (Stage 3: ~60% scroll)</em>. Saat Anda klik tombol <strong>"Simpan & Buka Langsung di Web ↗"</strong> di bawah, sistem akan otomatis melakukan scroll halus langsung tepat ke depan video YouTube Anda.
                </p>
              </div>
            </div>

            {/* Form Controls & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <form
                  onSubmit={(e) => handleSaveVideo(e, false)}
                  className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <HiPencilSquare className="w-4 h-4 text-[#14AF9E]" />
                      Pengaturan Lengkap Section Flagship Showcase
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Semua Elemen Teks Dapat Diedit
                    </span>
                  </div>

                  {/* SECTION 1: HEADER SECTION (TEKS DI ATAS CARD) */}
                  <div className="p-4 rounded-xl bg-neutral-950/70 border border-white/10 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                      A. Header Section (Teks di Atas Card Showcase)
                    </span>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1">
                        Judul Utama / Headline Section <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={videoHeadline}
                        onChange={(e) => setVideoHeadline(e.target.value)}
                        placeholder="Contoh: A journey shaped by creativity and change."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-sans focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1">
                        Tagline / Badge Section (Di atas Headline) <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={videoClassTag}
                        onChange={(e) => setVideoClassTag(e.target.value)}
                        placeholder="Contoh: CREATIVE JOURNEY | 2012 TO PRESENT"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E] transition-all"
                      />
                    </div>
                  </div>

                  {/* SECTION 2: VIDEO MEDIA & KONTEN DALAM CARD */}
                  <div className="p-4 rounded-xl bg-neutral-950/70 border border-white/10 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#14AF9E] font-semibold block">
                      B. Media Player & Konten di Dalam Card Showcase
                    </span>

                    {/* YouTube URL or Video ID */}
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1">
                        URL Video atau Video ID YouTube <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ atau dQw4w9WgXcQ"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E] transition-all"
                      />
                      <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500 font-mono">
                        <span>Mendukung: youtube.com/watch?v=..., youtu.be/..., shorts, atau raw ID</span>
                        {previewYouTubeId && (
                          <span className="text-cyan-400 font-semibold">ID: {previewYouTubeId}</span>
                        )}
                      </div>
                    </div>

                    {/* Title & Category inside Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-neutral-300 font-medium mb-1">
                          Judul Dalam Card
                        </label>
                        <input
                          type="text"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          placeholder="From Visual Craft to Technology"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#14AF9E] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-neutral-300 font-medium mb-1">
                          Kategori / Tag Dalam Card
                        </label>
                        <input
                          type="text"
                          value={videoCategory}
                          onChange={(e) => setVideoCategory(e.target.value)}
                          placeholder="VISUAL CRAFT | DIGITAL | AI"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#14AF9E] transition-all"
                        />
                      </div>
                    </div>

                    {/* Video Description */}
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1">
                        Deskripsi / Narasi Modal Lightbox
                      </label>
                      <textarea
                        rows={3}
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        placeholder="Tuliskan deskripsi karya unggulan, teknologi yang digunakan, atau konsep kreatif..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#14AF9E] transition-all resize-y"
                      />
                    </div>

                    {/* Toggle Active Switch */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-white/10">
                      <div>
                        <p className="text-xs font-medium text-white">Tampilkan Pemutar Video Embed di Public Web</p>
                        <p className="text-[11px] text-neutral-400">
                          Jika dinonaktifkan, web akan kembali menampilkan gambar visual original
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          videoEnabled ? "bg-[#14AF9E]" : "bg-neutral-800"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                            videoEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveVideo(undefined, true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#14AF9E] to-cyan-400 hover:from-[#119889] hover:to-cyan-300 text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#14AF9E]/25 transition-all active:scale-95 cursor-pointer"
                    >
                      <HiCheck className="w-4 h-4" />
                      <span>Simpan & Buka Langsung di Web ↗</span>
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs sm:text-sm border border-white/10 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Simpan Saja</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                    >
                      <HiTrash className="w-4 h-4" />
                      <span>Hapus Video</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side: Live Video Player Preview in Admin */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <HiSparkles className="w-3.5 h-3.5" />
                      Live Web Stage 3 Preview
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
                      Rasio 21:9
                    </span>
                  </div>

                  {/* Section Top Header Preview */}
                  <div className="mb-3 px-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#14AF9E] block mb-0.5 font-semibold">
                      {videoClassTag || "CREATIVE JOURNEY | 2012 TO PRESENT"}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                      {videoHeadline || "A journey shaped by creativity and change."}
                    </h3>
                  </div>

                  {/* Cinematic Video Card Preview (Exact Image 1 layout) */}
                  <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl group">
                    {previewYouTubeId && videoEnabled ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${previewYouTubeId}?rel=0&modestbranding=1`}
                        title="YouTube Showcase Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
                        <img
                          src={stage3.heroCard.image || "/assets/antigravity/hero-large.jpg"}
                          alt="Fallback"
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                          <HiVideoCamera className="w-10 h-10 text-neutral-500 mb-2" />
                          <p className="text-xs text-neutral-300 font-mono">
                            Belum ada embed video aktif
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                    {/* Bottom Left: Title & Category */}
                    <div className="absolute bottom-3 left-3 z-20 max-w-[65%] pointer-events-none">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#14AF9E] block mb-0.5 font-semibold truncate">
                        {videoCategory || "VISUAL CRAFT | DIGITAL | AI"}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {videoTitle || "From Visual Craft to Technology"}
                      </h4>
                    </div>

                    {/* Bottom Right: View Full Pill */}
                    <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-white text-black font-semibold text-[10px] flex items-center gap-1 shadow-lg">
                        <span>View Full</span>
                        <span>↗</span>
                      </span>
                    </div>
                  </div>

                  {/* Modal Lightbox Description Preview */}
                  <div className="mt-3 p-3 rounded-xl bg-neutral-950/70 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-semibold">
                      Narasi Modal Lightbox:
                    </span>
                    <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                      {videoDescription || "Belum ada narasi."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* MODAL: UPLOAD GAMBAR PORTOFOLIO BARU */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#0e1015] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadPreview(null);
                  setUploadFile(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block mb-1">
                  FOLDER: client - {selectedClient?.clientName}
                </span>
                <h3 className="text-xl font-bold text-white">
                  Upload Gambar Portofolio
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Gambar yang diupload akan langsung tersimpan dan muncul di galeri publik folder klien ini.
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* File Dropzone / Selector */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    File Gambar (JPG, PNG, WEBP) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/20 hover:border-[#14AF9E] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-neutral-950/50 flex flex-col items-center justify-center group"
                  >
                    {uploadPreview ? (
                      <div className="space-y-2">
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="max-h-48 w-auto mx-auto rounded-xl object-contain border border-white/15 shadow-md"
                        />
                        <p className="text-xs text-cyan-400 font-mono">
                          Klik untuk mengganti gambar
                        </p>
                      </div>
                    ) : (
                      <div className="py-4 space-y-2">
                        <HiArrowUpTray className="w-10 h-10 text-neutral-500 group-hover:text-[#14AF9E] mx-auto transition-colors" />
                        <p className="text-xs sm:text-sm font-semibold text-neutral-300">
                          Klik untuk memilih file gambar
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Mendukung PNG, JPG, JPEG, WEBP
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Judul Portofolio / Karya <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Contoh: Digital Campaign Concept Visual A"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#14AF9E] transition-all"
                  />
                </div>

                {/* Deliverable Type & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Kategori / Tipe Karya
                    </label>
                    <input
                      type="text"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      placeholder="Contoh: Digital Campaign"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#14AF9E] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Tahun Karya <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#14AF9E] transition-all"
                    />
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Rasio Aspek Tampilan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["4:5", "1:1", "16:9"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setUploadAspect(ratio)}
                        className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          uploadAspect === ratio
                            ? "bg-[#14AF9E] text-black border-[#14AF9E] shadow-sm"
                            : "bg-neutral-950 text-neutral-400 border-white/10 hover:text-white"
                        }`}
                      >
                        {ratio}
                        <span className="block text-[10px] font-normal opacity-80">
                          {ratio === "4:5" ? "Portrait" : ratio === "1:1" ? "Square" : "Landscape"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tool Tags */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Tools Used <span className="text-neutral-500">(pisahkan dengan koma)</span>
                  </label>
                  <input
                    type="text"
                    value={uploadToolsInput}
                    onChange={(e) => setUploadToolsInput(e.target.value)}
                    placeholder="Figma, Photoshop, Magnific AI, GPT, Gemini"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E] transition-all"
                  />
                  {/* Tag preview */}
                  {uploadToolsInput.trim() && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {uploadToolsInput.split(",").map((t, i) => {
                        const tool = t.trim();
                        if (!tool) return null;
                        return (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-[#14AF9E]/15 border border-[#14AF9E]/30 text-[#14AF9E] text-[10px] font-mono font-semibold"
                          >
                            {tool}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={!uploadPreview}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>Upload & Tambahkan ke Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setUploadPreview(null);
                      setUploadFile(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT KARYA & DETAIL CASE STUDY */}
      <AnimatePresence>
        {editingWork && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#0e1015] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto max-h-[92vh] flex flex-col"
            >
              {/* Close Button (X) */}
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
                aria-label="Tutup form edit"
              >
                <HiXMark className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10 shrink-0">
                <div className="w-12 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-white/15 shrink-0">
                  <img
                    src={editingWork.image}
                    alt={editingWork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                    CASE STUDY & DETAIL EDITOR
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Edit Detail: {editingWork.title}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Folder: <span className="text-white font-mono">{selectedClient?.clientName}</span> · Perubahan langsung aktif di popup Case Study web publik.
                  </p>
                </div>
              </div>

              {/* Modal Body: Scrollable Form */}
              <form onSubmit={handleSaveEditWork} className="space-y-4 pt-4 overflow-y-auto pr-1">
                {/* 1. Judul & Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Judul Karya <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editWorkTitle}
                      onChange={(e) => setEditWorkTitle(e.target.value)}
                      placeholder="Contoh: Promo Visual 13"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Kategori / Format Karya
                    </label>
                    <input
                      type="text"
                      value={editWorkType}
                      onChange={(e) => setEditWorkType(e.target.value)}
                      placeholder="Contoh: Education Campaign Asset, 3D Key Visual"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* 2. Tahun & Rasio Aspek */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Tahun Rilis
                    </label>
                    <input
                      type="text"
                      value={editWorkYear}
                      onChange={(e) => setEditWorkYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Rasio Aspek Gambar
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["4:5", "1:1", "16:9"] as const).map((asp) => (
                        <button
                          key={asp}
                          type="button"
                          onClick={() => setEditWorkAspect(asp)}
                          className={`py-2 px-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                            editWorkAspect === asp
                              ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300"
                              : "bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {asp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Brief / Overview */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Brief / Ringkasan Deskripsi Karya
                  </label>
                  <textarea
                    rows={2}
                    value={editWorkBrief}
                    onChange={(e) => setEditWorkBrief(e.target.value)}
                    placeholder="Tuliskan gambaran umum kampanye atau tujuan visual ini..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* 4. Tantangan (Challenge) & Solusi (Solution) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-amber-400 font-medium mb-1.5 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Tantangan (Challenge)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editWorkChallenge}
                      onChange={(e) => setEditWorkChallenge(e.target.value)}
                      placeholder="Kesulitan atau tantangan teknis dalam proyek ini..."
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-amber-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#14AF9E] font-medium mb-1.5 flex items-center gap-1.5">
                      <span>✅</span>
                      <span>Solusi & Pendekatan (Solution)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editWorkSolution}
                      onChange={(e) => setEditWorkSolution(e.target.value)}
                      placeholder="Solusi kreatif atau teknis yang diimplementasikan..."
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-[#14AF9E]/30 text-white text-xs sm:text-sm focus:outline-none focus:border-[#14AF9E] transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 5. Role / Peran Kreatif */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Role / Peran Kreatif
                  </label>
                  <input
                    type="text"
                    value={editWorkRole}
                    onChange={(e) => setEditWorkRole(e.target.value)}
                    placeholder="Contoh: Creative visual direction, event promo design, AI art generation"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                {/* 6. Tools Used */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-neutral-300 font-medium">
                      Tools Digunakan (Pisahkan dengan koma)
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Klik tag di bawah untuk toggle
                    </span>
                  </div>

                  <input
                    type="text"
                    value={editWorkToolsInput}
                    onChange={(e) => setEditWorkToolsInput(e.target.value)}
                    placeholder="figma, photoshop, magnific, gpt, gemini"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 transition-all mb-2"
                  />

                  {/* Clickable Tool Tag Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "figma", label: "Figma" },
                      { name: "photoshop", label: "Photoshop" },
                      { name: "magnific", label: "Magnific AI" },
                      { name: "gpt", label: "ChatGPT" },
                      { name: "gemini", label: "Gemini" },
                      { name: "blender", label: "Blender 3D" },
                      { name: "illustrator", label: "Illustrator" },
                      { name: "aftereffects", label: "After Effects" },
                      { name: "midjourney", label: "Midjourney" },
                    ].map((tool) => {
                      const isSelected = editWorkToolsInput
                        .toLowerCase()
                        .includes(tool.name.toLowerCase());
                      return (
                        <button
                          key={tool.name}
                          type="button"
                          onClick={() => toggleEditToolChip(tool.name)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                            isSelected
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm"
                              : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                          }`}
                        >
                          {isSelected ? `✓ ${tool.label}` : `+ ${tool.label}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10 shrink-0">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#14AF9E] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>Simpan Perubahan & Update Web</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingWork(null)}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD FOLDER BARU */}
      <AnimatePresence>
        {isAddFolderOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#0e1015] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => {
                  setIsAddFolderOpen(false);
                  setNewFolderName("");
                  setNewFolderCategory("");
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#14AF9E] font-semibold block mb-1">
                  FOLDER MANAGEMENT
                </span>
                <h3 className="text-xl font-bold text-white">Buat Folder Klien Baru</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Folder baru akan langsung tampil di panel My Work & galeri publik website.
                </p>
              </div>

              <form onSubmit={handleAddFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Nama Brand / Klien <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Contoh: Nike, Samsung, Local Brand Co."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E] transition-all"
                    autoFocus
                  />
                  {newFolderName.trim() && (
                    <p className="text-[11px] text-neutral-400 font-mono mt-1">
                      Folder: <span className="text-cyan-400">client - {newFolderName.trim()}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Kategori / Tipe Kolaborasi
                  </label>
                  <input
                    type="text"
                    value={newFolderCategory}
                    onChange={(e) => setNewFolderCategory(e.target.value)}
                    placeholder="Contoh: Brand Visuals & Ads, Digital Campaign"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E] transition-all"
                  />
                </div>

                {/* Tahun kolaborasi */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Tahun Kolaborasi
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    value={newFolderYear}
                    onChange={(e) => setNewFolderYear(e.target.value)}
                    placeholder={new Date().getFullYear().toString()}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#14AF9E] transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiFolderPlus className="w-4 h-4" />
                    <span>Buat Folder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddFolderOpen(false);
                      setNewFolderName("");
                      setNewFolderCategory("");
                      setNewFolderYear(new Date().getFullYear().toString());
                    }}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[120] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900 border border-[#14AF9E]/50 text-white shadow-2xl backdrop-blur-xl text-xs sm:text-sm font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-[#14AF9E] text-black flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

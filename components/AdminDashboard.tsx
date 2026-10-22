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
  HiUser,
  HiKey,
  HiLockClosed,
  HiEnvelope,
} from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/adminAuth";
import {
  usePortfolioData,
  extractYouTubeId,
  ClientItem,
  defaultAboutData,
  defaultHeroWorksData,
  defaultClientLogosData,
  DeckCardItem,
  OverlappingCardItem,
  ClientLogoItem,
} from "@/context/PortfolioDataContext";
import { getCaseStudy } from "@/components/Projects";

export default function AdminDashboard({ onClose }: { onClose?: () => void }) {
  const {
    stage3,
    clients,
    about,
    heroWorks,
    clientLogos,
    updateHeroWorksData,
    updateClientLogosData,
    updateAboutData,
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

  // Active Tab: 'clients' | 'hero-works' | 'client-logos' | 'about' | 'flagship' | 'account'
  const [activeTab, setActiveTab] = useState<
    "clients" | "hero-works" | "client-logos" | "about" | "flagship" | "account"
  >("clients");

  // Admin Account & Password Management State
  const { lang, setLang } = useLang();
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("");
  const [adminConfirmPass, setAdminConfirmPass] = useState("");
  const [adminEmail, setAdminEmail] = useState("rizxstudioproject@gmail.com");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  useEffect(() => {
    getAdminCredentials().then((c) => {
      if (c.username) setAdminUser(c.username);
      if (c.email) setAdminEmail(c.email);
    });
  }, []);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass && adminPass !== adminConfirmPass) {
      showToast("Peringatan: Konfirmasi password tidak cocok!");
      return;
    }
    if (adminPass && adminPass.length < 6) {
      showToast("Peringatan: Password baru minimal harus 6 karakter!");
      return;
    }
    setIsSavingAccount(true);
    try {
      await saveAdminCredentials({
        username: adminUser.trim() || "admin",
        email: adminEmail.trim() || "rizxstudioproject@gmail.com",
        ...(adminPass ? { password: adminPass.trim() } : {}),
      });
      setAdminPass("");
      setAdminConfirmPass("");
      showToast("Berhasil: Pengaturan akun & password Admin berhasil disimpan ke Supabase Cloud!");
    } catch (err) {
      showToast("Gagal menyimpan perubahan akun.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  // ==========================================
  // Hero & Selected Works Form States
  // ==========================================
  const [hwStage1Badge, setHwStage1Badge] = useState(
    heroWorks?.stage1Badge || defaultHeroWorksData.stage1Badge
  );
  const [hwStage1Headline, setHwStage1Headline] = useState(
    heroWorks?.stage1Headline || defaultHeroWorksData.stage1Headline
  );
  const [hwStage1Subheadline, setHwStage1Subheadline] = useState(
    heroWorks?.stage1Subheadline || defaultHeroWorksData.stage1Subheadline
  );
  const [hwStage1ScrollText, setHwStage1ScrollText] = useState(
    heroWorks?.stage1ScrollText || defaultHeroWorksData.stage1ScrollText
  );
  const [hwDeckCards, setHwDeckCards] = useState<DeckCardItem[]>(
    heroWorks?.deckCards || defaultHeroWorksData.deckCards
  );

  const [hwStage2Tag, setHwStage2Tag] = useState(
    heroWorks?.stage2Tag || defaultHeroWorksData.stage2Tag
  );
  const [hwStage2Headline, setHwStage2Headline] = useState(
    heroWorks?.stage2Headline || defaultHeroWorksData.stage2Headline
  );
  const [hwStage2Desc, setHwStage2Desc] = useState(
    heroWorks?.stage2Desc || defaultHeroWorksData.stage2Desc
  );
  const [hwStage2BtnText, setHwStage2BtnText] = useState(
    heroWorks?.stage2BtnText || defaultHeroWorksData.stage2BtnText
  );
  const [hwStage2Skills, setHwStage2Skills] = useState(
    heroWorks?.stage2Skills
      ? heroWorks.stage2Skills.join(", ")
      : defaultHeroWorksData.stage2Skills.join(", ")
  );
  const [hwStage2Badges, setHwStage2Badges] = useState(
    heroWorks?.stage2Badges
      ? heroWorks.stage2Badges.map((b) => b.text).join(", ")
      : defaultHeroWorksData.stage2Badges.map((b) => b.text).join(", ")
  );
  const [hwOverlappingCards, setHwOverlappingCards] = useState<OverlappingCardItem[]>(
    heroWorks?.overlappingCards || defaultHeroWorksData.overlappingCards
  );

  // New Deck Card Inputs
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckCategory, setNewDeckCategory] = useState("");
  const [newDeckImage, setNewDeckImage] = useState("");

  // New Overlapping Card Inputs
  const [newOverTitle, setNewOverTitle] = useState("");
  const [newOverRotate, setNewOverRotate] = useState("-5");
  const [newOverImage, setNewOverImage] = useState("");

  // Sync Hero & Works when cloud data updates
  useEffect(() => {
    if (heroWorks) {
      setHwStage1Badge(heroWorks.stage1Badge || defaultHeroWorksData.stage1Badge);
      setHwStage1Headline(heroWorks.stage1Headline || defaultHeroWorksData.stage1Headline);
      setHwStage1Subheadline(heroWorks.stage1Subheadline || defaultHeroWorksData.stage1Subheadline);
      setHwStage1ScrollText(heroWorks.stage1ScrollText || defaultHeroWorksData.stage1ScrollText);
      setHwDeckCards(heroWorks.deckCards || defaultHeroWorksData.deckCards);

      setHwStage2Tag(heroWorks.stage2Tag || defaultHeroWorksData.stage2Tag);
      setHwStage2Headline(heroWorks.stage2Headline || defaultHeroWorksData.stage2Headline);
      setHwStage2Desc(heroWorks.stage2Desc || defaultHeroWorksData.stage2Desc);
      setHwStage2BtnText(heroWorks.stage2BtnText || defaultHeroWorksData.stage2BtnText);
      setHwStage2Skills(
        heroWorks.stage2Skills
          ? heroWorks.stage2Skills.join(", ")
          : defaultHeroWorksData.stage2Skills.join(", ")
      );
      setHwStage2Badges(
        heroWorks.stage2Badges
          ? heroWorks.stage2Badges.map((b) => b.text).join(", ")
          : defaultHeroWorksData.stage2Badges.map((b) => b.text).join(", ")
      );
      setHwOverlappingCards(heroWorks.overlappingCards || defaultHeroWorksData.overlappingCards);
    }
  }, [heroWorks]);

  // ==========================================
  // Client Logos Marquee Form States
  // ==========================================
  const [clSubtitle, setClSubtitle] = useState(
    clientLogos?.subtitle || defaultClientLogosData.subtitle
  );
  const [clLogos, setClLogos] = useState<ClientLogoItem[]>(
    clientLogos?.logos || defaultClientLogosData.logos
  );
  const [newLogoName, setNewLogoName] = useState("");
  const [newLogoRow, setNewLogoRow] = useState<1 | 2>(1);
  const [newLogoFile, setNewLogoFile] = useState("");

  useEffect(() => {
    if (clientLogos) {
      setClSubtitle(clientLogos.subtitle || defaultClientLogosData.subtitle);
      setClLogos(clientLogos.logos || defaultClientLogosData.logos);
    }
  }, [clientLogos]);

  // About Me Section Form States
  const [aboutEyebrow, setAboutEyebrow] = useState(about?.eyebrow || defaultAboutData.eyebrow);
  const [aboutTitle, setAboutTitle] = useState(about?.title || defaultAboutData.title);
  const [aboutHeadline, setAboutHeadline] = useState(about?.headline || defaultAboutData.headline);
  const [aboutBio, setAboutBio] = useState(about?.bio || defaultAboutData.bio);
  const [aboutPhilosophyTitle, setAboutPhilosophyTitle] = useState(about?.philosophyTitle || defaultAboutData.philosophyTitle);
  const [aboutPhilosophyQuote, setAboutPhilosophyQuote] = useState(about?.philosophyQuote || defaultAboutData.philosophyQuote);
  const [aboutStat1Num, setAboutStat1Num] = useState(about?.stat1Num || defaultAboutData.stat1Num);
  const [aboutStat1Label, setAboutStat1Label] = useState(about?.stat1Label || defaultAboutData.stat1Label);
  const [aboutStat2Num, setAboutStat2Num] = useState(about?.stat2Num || defaultAboutData.stat2Num);
  const [aboutStat2Label, setAboutStat2Label] = useState(about?.stat2Label || defaultAboutData.stat2Label);
  const [aboutStat3Num, setAboutStat3Num] = useState(about?.stat3Num || defaultAboutData.stat3Num);
  const [aboutStat3Label, setAboutStat3Label] = useState(about?.stat3Label || defaultAboutData.stat3Label);
  const [aboutCollabTitle, setAboutCollabTitle] = useState(about?.collabTitle || defaultAboutData.collabTitle);
  const [aboutCollabDesc, setAboutCollabDesc] = useState(about?.collabDesc || defaultAboutData.collabDesc);
  const [aboutDisciplinesTitle, setAboutDisciplinesTitle] = useState(about?.disciplinesTitle || defaultAboutData.disciplinesTitle);
  const [aboutDisciplinesInput, setAboutDisciplinesInput] = useState(
    about?.disciplines ? about.disciplines.join(", ") : defaultAboutData.disciplines.join(", ")
  );

  // Sync About Me form inputs whenever cloud data loads
  useEffect(() => {
    if (about) {
      setAboutEyebrow(about.eyebrow);
      setAboutTitle(about.title);
      setAboutHeadline(about.headline);
      setAboutBio(about.bio);
      setAboutPhilosophyTitle(about.philosophyTitle);
      setAboutPhilosophyQuote(about.philosophyQuote);
      setAboutStat1Num(about.stat1Num);
      setAboutStat1Label(about.stat1Label);
      setAboutStat2Num(about.stat2Num);
      setAboutStat2Label(about.stat2Label);
      setAboutStat3Num(about.stat3Num);
      setAboutStat3Label(about.stat3Label);
      setAboutCollabTitle(about.collabTitle);
      setAboutCollabDesc(about.collabDesc);
      setAboutDisciplinesTitle(about.disciplinesTitle);
      setAboutDisciplinesInput(about.disciplines ? about.disciplines.join(", ") : "");
    }
  }, [about]);

  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDisciplines = aboutDisciplinesInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    updateAboutData({
      eyebrow: aboutEyebrow.trim(),
      title: aboutTitle.trim(),
      headline: aboutHeadline.trim(),
      bio: aboutBio.trim(),
      philosophyTitle: aboutPhilosophyTitle.trim(),
      philosophyQuote: aboutPhilosophyQuote.trim(),
      stat1Num: aboutStat1Num.trim(),
      stat1Label: aboutStat1Label.trim(),
      stat2Num: aboutStat2Num.trim(),
      stat2Label: aboutStat2Label.trim(),
      stat3Num: aboutStat3Num.trim(),
      stat3Label: aboutStat3Label.trim(),
      collabTitle: aboutCollabTitle.trim(),
      collabDesc: aboutCollabDesc.trim(),
      disciplinesTitle: aboutDisciplinesTitle.trim(),
      disciplines: parsedDisciplines,
    });

    showToast("Seluruh teks Section About Me berhasil disimpan & langsung aktif di web publik!");
  };

  const handleResetAbout = () => {
    setAboutEyebrow(defaultAboutData.eyebrow);
    setAboutTitle(defaultAboutData.title);
    setAboutHeadline(defaultAboutData.headline);
    setAboutBio(defaultAboutData.bio);
    setAboutPhilosophyTitle(defaultAboutData.philosophyTitle);
    setAboutPhilosophyQuote(defaultAboutData.philosophyQuote);
    setAboutStat1Num(defaultAboutData.stat1Num);
    setAboutStat1Label(defaultAboutData.stat1Label);
    setAboutStat2Num(defaultAboutData.stat2Num);
    setAboutStat2Label(defaultAboutData.stat2Label);
    setAboutStat3Num(defaultAboutData.stat3Num);
    setAboutStat3Label(defaultAboutData.stat3Label);
    setAboutCollabTitle(defaultAboutData.collabTitle);
    setAboutCollabDesc(defaultAboutData.collabDesc);
    setAboutDisciplinesTitle(defaultAboutData.disciplinesTitle);
    setAboutDisciplinesInput(defaultAboutData.disciplines.join(", "));
  };

  // Helper file reader for image uploads
  const handleGenericImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      callback(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // Handlers for Hero & Selected Works
  // ==========================================
  const handleSaveHeroWorks = async () => {
    const parsedSkills = hwStage2Skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedBadges = hwStage2Badges
      .split(",")
      .map((b, i) => ({
        id: i + 1,
        text: b.trim(),
        color:
          i === 0
            ? "bg-[#14AF9E] text-white border-[#14AF9E]"
            : "bg-neutral-800 text-white border-neutral-700",
      }))
      .filter((b) => b.text.length > 0);

    await updateHeroWorksData({
      stage1Badge: hwStage1Badge.trim(),
      stage1Headline: hwStage1Headline.trim(),
      stage1Subheadline: hwStage1Subheadline.trim(),
      stage1ScrollText: hwStage1ScrollText.trim(),
      deckCards: hwDeckCards,
      stage2Tag: hwStage2Tag.trim(),
      stage2Headline: hwStage2Headline.trim(),
      stage2Desc: hwStage2Desc.trim(),
      stage2BtnText: hwStage2BtnText.trim(),
      stage2Skills: parsedSkills,
      stage2Badges: parsedBadges,
      overlappingCards: hwOverlappingCards,
    });
    showToast("Berhasil: Seluruh teks & gambar Hero serta Selected Works berhasil disimpan!");
  };

  const handleCancelHeroWorks = () => {
    if (heroWorks) {
      setHwStage1Badge(heroWorks.stage1Badge || defaultHeroWorksData.stage1Badge);
      setHwStage1Headline(heroWorks.stage1Headline || defaultHeroWorksData.stage1Headline);
      setHwStage1Subheadline(heroWorks.stage1Subheadline || defaultHeroWorksData.stage1Subheadline);
      setHwStage1ScrollText(heroWorks.stage1ScrollText || defaultHeroWorksData.stage1ScrollText);
      setHwDeckCards(heroWorks.deckCards || defaultHeroWorksData.deckCards);

      setHwStage2Tag(heroWorks.stage2Tag || defaultHeroWorksData.stage2Tag);
      setHwStage2Headline(heroWorks.stage2Headline || defaultHeroWorksData.stage2Headline);
      setHwStage2Desc(heroWorks.stage2Desc || defaultHeroWorksData.stage2Desc);
      setHwStage2BtnText(heroWorks.stage2BtnText || defaultHeroWorksData.stage2BtnText);
      setHwStage2Skills(
        heroWorks.stage2Skills
          ? heroWorks.stage2Skills.join(", ")
          : defaultHeroWorksData.stage2Skills.join(", ")
      );
      setHwStage2Badges(
        heroWorks.stage2Badges
          ? heroWorks.stage2Badges.map((b) => b.text).join(", ")
          : defaultHeroWorksData.stage2Badges.map((b) => b.text).join(", ")
      );
      setHwOverlappingCards(heroWorks.overlappingCards || defaultHeroWorksData.overlappingCards);
    }
    showToast("Perubahan dibatalkan â€” form dikembalikan ke data tersimpan.");
  };

  const handleAddDeckCard = () => {
    if (!newDeckImage) {
      showToast("Peringatan: Silakan pilih gambar untuk kartu terlebih dahulu.");
      return;
    }
    const newCard: DeckCardItem = {
      id: `d-${Date.now()}`,
      title: newDeckTitle.trim() || "Creative Visual",
      category: newDeckCategory.trim() || "Digital Design",
      image: newDeckImage,
    };
    setHwDeckCards((prev) => [...prev, newCard]);
    setNewDeckTitle("");
    setNewDeckCategory("");
    setNewDeckImage("");
    showToast("Kartu baru ditambahkan ke daftar Selected Works! Klik 'Simpan Update' untuk mengaktifkan.");
  };

  const handleDeleteDeckCard = (id: string) => {
    setHwDeckCards((prev) => prev.filter((c) => c.id !== id));
    showToast("Kartu dihapus dari daftar. Klik 'Simpan Update' untuk menerapkan.");
  };

  const handleAddOverlappingCard = () => {
    if (!newOverImage) {
      showToast("Peringatan: Silakan pilih gambar untuk kartu terlebih dahulu.");
      return;
    }
    const newCard: OverlappingCardItem = {
      id: `o-${Date.now()}`,
      title: newOverTitle.trim() || "Creative Design",
      image: newOverImage,
      rotate: parseFloat(newOverRotate) || 0,
    };
    setHwOverlappingCards((prev) => [...prev, newCard]);
    setNewOverTitle("");
    setNewOverRotate("0");
    setNewOverImage("");
    showToast("Kartu baru ditambahkan ke Hero! Klik 'Simpan Update' untuk mengaktifkan.");
  };

  const handleDeleteOverlappingCard = (id: string) => {
    setHwOverlappingCards((prev) => prev.filter((c) => c.id !== id));
    showToast("Kartu dihapus dari daftar. Klik 'Simpan Update' untuk menerapkan.");
  };

  // ==========================================
  // Handlers for Client Logos Marquee
  // ==========================================
  const handleSaveClientLogos = async () => {
    await updateClientLogosData({
      subtitle: clSubtitle.trim(),
      logos: clLogos,
    });
    showToast("Berhasil: Seluruh Logo Klien & Subtitle berhasil disimpan!");
  };

  const handleCancelClientLogos = () => {
    if (clientLogos) {
      setClSubtitle(clientLogos.subtitle || defaultClientLogosData.subtitle);
      setClLogos(clientLogos.logos || defaultClientLogosData.logos);
    }
    showToast("Perubahan dibatalkan â€” form dikembalikan ke data tersimpan.");
  };

  const handleAddClientLogo = () => {
    if (!newLogoFile) {
      showToast("Peringatan: Silakan pilih file gambar/logo terlebih dahulu.");
      return;
    }
    const newLogo: ClientLogoItem = {
      id: `cl-${Date.now()}`,
      name: newLogoName.trim() || "Client",
      file: newLogoFile,
      row: newLogoRow,
    };
    setClLogos((prev) => [...prev, newLogo]);
    setNewLogoName("");
    setNewLogoFile("");
    showToast(`Logo "${newLogo.name}" ditambahkan ke Baris ${newLogoRow}! Klik 'Simpan Update' untuk mengaktifkan.`);
  };

  const handleDeleteClientLogo = (id: string) => {
    setClLogos((prev) => prev.filter((l) => l.id !== id));
    showToast("Logo dihapus dari marquee. Klik 'Simpan Update' untuk menerapkan.");
  };

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
      "A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology â€” pushing the boundaries of creative digital experiences."
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
  // Tool tags for upload â€” comma-separated input
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
      category: newFolderCategory.trim() || `Portfolio â€” ${newFolderName.trim()}`,
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
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
            <img
              src="/navbar-logo.png"
              alt="Rizx Studio Admin"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Rizx Studio â€” Admin Dashboard
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
          {/* Icon-Only Language Switcher (EN / ID flags) */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setLang("en");
                showToast("Bahasa web diatur ke: English (Icon 🇺🇸)");
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-[#14AF9E]/25 text-[#14AF9E] border border-[#14AF9E]/50 shadow-sm"
                  : "opacity-45 hover:opacity-100 hover:bg-white/5"
              }`}
              title="English (🇺🇸)"
              aria-label="Switch to English"
            >
              🇺🇸
            </button>
            <button
              type="button"
              onClick={() => {
                setLang("id");
                showToast("Bahasa web diatur ke: Bahasa Indonesia (Icon 🇮🇩)");
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                lang === "id"
                  ? "bg-[#14AF9E]/25 text-[#14AF9E] border border-[#14AF9E]/50 shadow-sm"
                  : "opacity-45 hover:opacity-100 hover:bg-white/5"
              }`}
              title="Bahasa Indonesia (🇮🇩)"
              aria-label="Ganti ke Bahasa Indonesia"
            >
              🇮🇩
            </button>
          </div>

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
            <span className="hidden sm:inline font-semibold">Tonton Video di Web â†—</span>
            <span className="sm:hidden font-semibold">Video â†—</span>
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
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/80 border border-white/10 max-w-4xl mx-auto mb-8 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("clients")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "clients"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiFolder className="w-4 h-4 shrink-0" />
            <span>1. Portofolio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hero-works")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "hero-works"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiSparkles className="w-4 h-4 shrink-0" />
            <span>2. Hero & Works</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("client-logos")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "client-logos"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiTag className="w-4 h-4 shrink-0" />
            <span>3. Logo Klien</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "about"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiUser className="w-4 h-4 shrink-0" />
            <span>4. About Me</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flagship")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "flagship"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiVideoCamera className="w-4 h-4 shrink-0" />
            <span>5. Video YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "account"
                ? "bg-[#14AF9E] text-black font-bold shadow-md shadow-[#14AF9E]/30"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HiKey className="w-4 h-4 shrink-0" />
            <span>6. Sandi & Akun</span>
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

                      {/* Delete folder button â€” visible on hover for ALL folders */}
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
                                  {isIncluded ? "âœ“" : "+"}
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
                        MY WORK ASSETS Â· FOLDER {selectedClient.clientName.toUpperCase()}
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

        {/* ========================================================
            TAB 2: HERO & SELECTED WORKS SECTION MANAGEMENT
           ======================================================== */}
        {activeTab === "hero-works" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header Explainer */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-mono tracking-widest text-[#14AF9E] uppercase font-semibold block mb-1">
                SECTION CONTROL: HERO & SELECTED WORKS
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Editor Section Hero (Design. Motion. AI.) & Selected Works
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-3xl leading-relaxed">
                Edit seluruh teks headline, subheadline, tags, tombol CTA, serta tambah, ganti, atau hapus gambar kartu preview bertumpuk dan melengkung secara fleksibel.
              </p>
            </div>

            {/* SECTION 2: HERO ("Design. Motion. AI.") */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#14AF9E]/15 border border-[#14AF9E]/30 flex items-center justify-center text-[#14AF9E]">
                    <HiSparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      1. Section Hero (Overview & AI-Driven Creative)
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Teks dan kartu preview bertumpuk di layar Stage 2
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Category Tag (Atas)
                  </label>
                  <input
                    type="text"
                    value={hwStage2Tag}
                    onChange={(e) => setHwStage2Tag(e.target.value)}
                    placeholder="AI-DRIVEN CREATIVE"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Headline Utama
                  </label>
                  <input
                    type="text"
                    value={hwStage2Headline}
                    onChange={(e) => setHwStage2Headline(e.target.value)}
                    placeholder="Design. Motion. AI."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Deskripsi Hero
                  </label>
                  <textarea
                    rows={2}
                    value={hwStage2Desc}
                    onChange={(e) => setHwStage2Desc(e.target.value)}
                    placeholder="Senior Graphic Designer & Digital Artist..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Teks Tombol CTA
                  </label>
                  <input
                    type="text"
                    value={hwStage2BtnText}
                    onChange={(e) => setHwStage2BtnText(e.target.value)}
                    placeholder="Explore My Work"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Badge Pegangan / Handle (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={hwStage2Badges}
                    onChange={(e) => setHwStage2Badges(e.target.value)}
                    placeholder="@rizx, @malaka"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Daftar Pill / Skill Tags (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={hwStage2Skills}
                    onChange={(e) => setHwStage2Skills(e.target.value)}
                    placeholder="Branding, Motion, 3D Design, UI/UX, AI Visuals"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>
              </div>

              {/* Overlapping Cards Management */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Kartu Gambar Bertumpuk (Overlapping Cards)
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Tumpukan kartu yang tampil di samping kanan tulisan hero
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Total: {hwOverlappingCards.length} Kartu
                  </span>
                </div>

                {/* Grid Existing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hwOverlappingCards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className="p-3 rounded-xl bg-neutral-950 border border-white/10 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border border-white/10 group">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-xs text-white font-medium gap-1">
                          <HiArrowUpTray className="w-5 h-5 text-[#14AF9E]" />
                          <span>Ganti Gambar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleGenericImageFile(e, (dataUrl) => {
                                setHwOverlappingCards((prev) =>
                                  prev.map((c, i) => (i === idx ? { ...c, image: dataUrl } : c))
                                );
                                showToast(`Gambar kartu "${card.title}" diganti.`);
                              })
                            }
                          />
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHwOverlappingCards((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, title: val } : c))
                            );
                          }}
                          placeholder="Judul Kartu"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#14AF9E]"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-neutral-400">Rotasi (Â°):</span>
                          <input
                            type="number"
                            value={card.rotate}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setHwOverlappingCards((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, rotate: val } : c))
                              );
                            }}
                            className="w-16 px-2 py-1 rounded bg-neutral-900 border border-white/10 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteOverlappingCard(card.id)}
                        className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        <span>Hapus Kartu</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form Tambah Kartu Baru */}
                <div className="p-4 rounded-xl bg-neutral-900/50 border border-dashed border-white/20 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HiPlus className="w-4 h-4 text-[#14AF9E]" />
                    <span>Tambah Kartu Hero Baru</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newOverTitle}
                      onChange={(e) => setNewOverTitle(e.target.value)}
                      placeholder="Judul Kartu (contoh: 3D Visual)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#14AF9E]"
                    />
                    <input
                      type="number"
                      value={newOverRotate}
                      onChange={(e) => setNewOverRotate(e.target.value)}
                      placeholder="Rotasi derajat (contoh: 5)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#14AF9E]"
                    />
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer border border-white/10">
                      <HiPhoto className="w-4 h-4 text-[#14AF9E]" />
                      <span className="truncate">
                        {newOverImage ? "âœ“ Gambar Dipilih" : "Pilih File Gambar"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleGenericImageFile(e, (dataUrl) => setNewOverImage(dataUrl))
                        }
                      />
                    </label>
                  </div>
                  {newOverImage && (
                    <div className="flex items-center gap-3">
                      <img
                        src={newOverImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={handleAddOverlappingCard}
                        className="px-4 py-2 rounded-xl bg-[#14AF9E] text-black font-bold text-xs hover:bg-[#119889] transition-all cursor-pointer"
                      >
                        + Masukkan Kartu ke Hero
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 1: SELECTED WORKS ("A Range of Work. One Creative Vision.") */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#14AF9E]/15 border border-[#14AF9E]/30 flex items-center justify-center text-[#14AF9E]">
                    <HiFolder className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      2. Section Selected Works (Layar Awal & Fan-out Cards)
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Teks headline besar dan 5 kartu melengkung di Stage 1
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Badge Kecil (Atas)
                  </label>
                  <input
                    type="text"
                    value={hwStage1Badge}
                    onChange={(e) => setHwStage1Badge(e.target.value)}
                    placeholder="SELECTED WORKS"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Headline Besar
                  </label>
                  <input
                    type="text"
                    value={hwStage1Headline}
                    onChange={(e) => setHwStage1Headline(e.target.value)}
                    placeholder="A Range of Work. One Creative Vision."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Subheadline Paragraf
                  </label>
                  <textarea
                    rows={2}
                    value={hwStage1Subheadline}
                    onChange={(e) => setHwStage1Subheadline(e.target.value)}
                    placeholder="Explore selected projects across branding, motion..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Teks Hint Scroll (Bawah)
                  </label>
                  <input
                    type="text"
                    value={hwStage1ScrollText}
                    onChange={(e) => setHwStage1ScrollText(e.target.value)}
                    placeholder="Scroll down â†“"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>
              </div>

              {/* Deck Cards Management */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Kartu Preview Melengkung (Deck Cards Fan-out)
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Kartu-kartu yang mekar dan menyebar melengkung saat halaman di-scroll
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Total: {hwDeckCards.length} Kartu
                  </span>
                </div>

                {/* Grid Existing Deck Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {hwDeckCards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className="p-3 rounded-xl bg-neutral-950 border border-white/10 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border border-white/10 group">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-xs text-white font-medium gap-1">
                          <HiArrowUpTray className="w-5 h-5 text-[#14AF9E]" />
                          <span>Ganti Gambar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleGenericImageFile(e, (dataUrl) => {
                                setHwDeckCards((prev) =>
                                  prev.map((c, i) => (i === idx ? { ...c, image: dataUrl } : c))
                                );
                                showToast(`Gambar kartu "${card.title}" diganti.`);
                              })
                            }
                          />
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHwDeckCards((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, title: val } : c))
                            );
                          }}
                          placeholder="Judul"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#14AF9E]"
                        />
                        <input
                          type="text"
                          value={card.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHwDeckCards((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, category: val } : c))
                            );
                          }}
                          placeholder="Kategori"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#14AF9E]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteDeckCard(card.id)}
                        className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        <span>Hapus Kartu</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form Tambah Kartu Deck Baru */}
                <div className="p-4 rounded-xl bg-neutral-900/50 border border-dashed border-white/20 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HiPlus className="w-4 h-4 text-[#14AF9E]" />
                    <span>Tambah Kartu Deck Baru</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newDeckTitle}
                      onChange={(e) => setNewDeckTitle(e.target.value)}
                      placeholder="Judul (contoh: Motion Design)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#14AF9E]"
                    />
                    <input
                      type="text"
                      value={newDeckCategory}
                      onChange={(e) => setNewDeckCategory(e.target.value)}
                      placeholder="Kategori (contoh: 3D & AI)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#14AF9E]"
                    />
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer border border-white/10">
                      <HiPhoto className="w-4 h-4 text-[#14AF9E]" />
                      <span className="truncate">
                        {newDeckImage ? "âœ“ Gambar Dipilih" : "Pilih File Gambar"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleGenericImageFile(e, (dataUrl) => setNewDeckImage(dataUrl))
                        }
                      />
                    </label>
                  </div>
                  {newDeckImage && (
                    <div className="flex items-center gap-3">
                      <img
                        src={newDeckImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={handleAddDeckCard}
                        className="px-4 py-2 rounded-xl bg-[#14AF9E] text-black font-bold text-xs hover:bg-[#119889] transition-all cursor-pointer"
                      >
                        + Masukkan Kartu ke Selected Works
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BAR: BATAL & SIMPAN UPDATE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-white/15 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-30 shadow-2xl">
              <div>
                <p className="text-sm font-bold text-white">
                  Simpan Perubahan Hero & Selected Works
                </p>
                <p className="text-xs text-neutral-400">
                  Perubahan akan langsung aktif di web publik dan tersinkron ke cloud.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelHeroWorks}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Batal (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeroWorks}
                  className="px-6 py-2.5 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#14AF9E]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <HiCheck className="w-4 h-4" />
                  <span>Simpan Update</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 3: CLIENT LOGOS MARQUEE MANAGEMENT
           ======================================================== */}
        {activeTab === "client-logos" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header Explainer */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-mono tracking-widest text-[#14AF9E] uppercase font-semibold block mb-1">
                SECTION CONTROL: LOGO KLIEN (MARQUEE)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Editor Logo Klien & Subtitle Marquee
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-3xl leading-relaxed">
                Kelola tulisan judul serta logo-logo brand klien yang berjalan di section logo. Anda bisa menambah logo baru, mengganti nama, memindahkan baris, atau menghapus logo.
              </p>
            </div>

            {/* Subtitle Form */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HiTag className="w-4 h-4 text-[#14AF9E]" />
                <span>Tulisan Subtitle / Judul Marquee</span>
              </h3>
              <div className="space-y-1.5 max-w-xl">
                <input
                  type="text"
                  value={clSubtitle}
                  onChange={(e) => setClSubtitle(e.target.value)}
                  placeholder="SELECTED CLIENTS & CREATIVE COLLABORATIONS"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                />
                <p className="text-[11px] text-neutral-500 font-mono">
                  Teks ini tampil di atas marquee logo di website publik.
                </p>
              </div>
            </div>

            {/* Form Tambah Logo Klien Baru */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HiPlus className="w-4 h-4 text-[#14AF9E]" />
                <span>Tambah Logo Klien Baru ke Marquee</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Nama Klien / Brand
                  </label>
                  <input
                    type="text"
                    value={newLogoName}
                    onChange={(e) => setNewLogoName(e.target.value)}
                    placeholder="Contoh: Apple, Google, Nike"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-neutral-300">
                    Posisi Baris Marquee
                  </label>
                  <select
                    value={newLogoRow}
                    onChange={(e) => setNewLogoRow(parseInt(e.target.value) as 1 | 2)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                  >
                    <option value={1}>Baris 1 (Scroll ke Kiri)</option>
                    <option value={2}>Baris 2 (Scroll ke Kanan)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-semibold text-neutral-300">
                      File Logo (SVG / PNG / WebP)
                    </label>
                    <span className="text-[10px] font-mono text-[#14AF9E] bg-[#14AF9E]/10 border border-[#14AF9E]/30 px-2 py-0.5 rounded-full font-semibold">
                      Frame: 160 × 56 px
                    </span>
                  </div>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold cursor-pointer border border-white/15">
                    <HiPhoto className="w-4 h-4 text-[#14AF9E]" />
                    <span className="truncate">
                      {newLogoFile ? "✓ Logo Dipilih" : "Pilih File Logo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) =>
                        handleGenericImageFile(e, (dataUrl) => setNewLogoFile(dataUrl))
                      }
                    />
                  </label>
                  <p className="text-[11px] text-neutral-400 font-mono leading-relaxed mt-1">
                    📐 <strong>Ukuran Frame Tampil:</strong> <span className="text-white font-semibold">160 × 56 pixel</span> (tinggi logo: 28px).<br />
                    ✨ <strong>Ukuran File Disarankan:</strong> <span className="text-[#14AF9E] font-semibold">200 × 60 px</span> s/d <span className="text-[#14AF9E] font-semibold">300 × 80 px</span> (Format SVG atau PNG Transparan @2x).
                  </p>
                </div>
              </div>

              {newLogoFile && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <img
                      src={newLogoFile}
                      alt="Preview"
                      className="h-8 max-w-[120px] object-contain invert brightness-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddClientLogo}
                    className="px-5 py-2.5 rounded-xl bg-[#14AF9E] text-black font-bold text-xs hover:bg-[#119889] transition-all cursor-pointer shadow-md"
                  >
                    + Tambahkan ke Baris {newLogoRow}
                  </button>
                </div>
              )}
            </div>

            {/* List Logos: Baris 1 & Baris 2 */}
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Baris 1 — Scroll Bergerak ke Kiri</span>
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    {clLogos.filter((l) => l.row === 1).length} Logo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {clLogos
                    .filter((l) => l.row === 1)
                    .map((logo) => (
                      <div
                        key={logo.id}
                        className="p-3 rounded-xl bg-neutral-950 border border-white/10 flex flex-col items-center justify-between gap-2.5 group relative"
                      >
                        <div className="h-10 w-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity invert brightness-0">
                          <img
                            src={logo.file}
                            alt={logo.name}
                            className="max-h-7 max-w-full object-contain"
                          />
                        </div>
                        <input
                          type="text"
                          value={logo.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setClLogos((prev) =>
                              prev.map((l) => (l.id === logo.id ? { ...l, name: val } : l))
                            );
                          }}
                          className="w-full text-center px-1.5 py-1 rounded bg-neutral-900 border border-white/10 text-white text-[11px] font-mono focus:outline-none focus:border-[#14AF9E]"
                        />
                        <div className="flex items-center gap-1.5 w-full justify-between pt-1 border-t border-white/5">
                          <button
                            type="button"
                            title="Pindah ke Baris 2"
                            onClick={() => {
                              setClLogos((prev) =>
                                prev.map((l) => (l.id === logo.id ? { ...l, row: 2 } : l))
                              );
                              showToast(`Logo "${logo.name}" dipindah ke Baris 2.`);
                            }}
                            className="text-[10px] font-mono text-neutral-400 hover:text-cyan-400 transition-colors"
                          >
                            ↓ Baris 2
                          </button>
                          <button
                            type="button"
                            title="Hapus Logo"
                            onClick={() => handleDeleteClientLogo(logo.id)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <HiTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Row 2 */}
              <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Baris 2 — Scroll Bergerak ke Kanan</span>
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    {clLogos.filter((l) => l.row === 2).length} Logo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {clLogos
                    .filter((l) => l.row === 2)
                    .map((logo) => (
                      <div
                        key={logo.id}
                        className="p-3 rounded-xl bg-neutral-950 border border-white/10 flex flex-col items-center justify-between gap-2.5 group relative"
                      >
                        <div className="h-10 w-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity invert brightness-0">
                          <img
                            src={logo.file}
                            alt={logo.name}
                            className="max-h-7 max-w-full object-contain"
                          />
                        </div>
                        <input
                          type="text"
                          value={logo.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setClLogos((prev) =>
                              prev.map((l) => (l.id === logo.id ? { ...l, name: val } : l))
                            );
                          }}
                          className="w-full text-center px-1.5 py-1 rounded bg-neutral-900 border border-white/10 text-white text-[11px] font-mono focus:outline-none focus:border-[#14AF9E]"
                        />
                        <div className="flex items-center gap-1.5 w-full justify-between pt-1 border-t border-white/5">
                          <button
                            type="button"
                            title="Pindah ke Baris 1"
                            onClick={() => {
                              setClLogos((prev) =>
                                prev.map((l) => (l.id === logo.id ? { ...l, row: 1 } : l))
                              );
                              showToast(`Logo "${logo.name}" dipindah ke Baris 1.`);
                            }}
                            className="text-[10px] font-mono text-neutral-400 hover:text-cyan-400 transition-colors"
                          >
                            ↑ Baris 1
                          </button>
                          <button
                            type="button"
                            title="Hapus Logo"
                            onClick={() => handleDeleteClientLogo(logo.id)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <HiTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* ACTION BAR: BATAL & SIMPAN UPDATE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-white/15 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-30 shadow-2xl">
              <div>
                <p className="text-sm font-bold text-white">
                  Simpan Perubahan Logo Klien Marquee
                </p>
                <p className="text-xs text-neutral-400">
                  Perubahan akan langsung aktif di web publik dan tersinkron ke cloud.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelClientLogos}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Batal (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleSaveClientLogos}
                  className="px-6 py-2.5 rounded-xl bg-[#14AF9E] hover:bg-[#119889] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#14AF9E]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <HiCheck className="w-4 h-4" />
                  <span>Simpan Update</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: ABOUT ME SECTION MANAGEMENT */}
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header Explainer */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-mono tracking-widest text-[#14AF9E] uppercase font-semibold block mb-1">
                SECTION CONTROL: ABOUT ME (WHO AM I)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Kustomisasi Seluruh Teks Section About Me
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl leading-relaxed">
                Ubah headline, narasi profil, filosofi inti, 3 statistik pengalaman, teks kolaborasi global, dan disiplin keahlian. Setiap perubahan langsung disimpan ke Supabase Cloud & LocalStorage dan tayang langsung di web publik.
              </p>
            </div>

            <form onSubmit={handleSaveAbout} className="space-y-6">
              {/* 1. Main Headline & Bio */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#14AF9E] uppercase tracking-widest font-semibold block">
                    BAGIAN 1 Â· HEADER & NARASI UTAMA
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Judul & Deskripsi Utama Profil
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Sub-header / Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      value={aboutEyebrow}
                      onChange={(e) => setAboutEyebrow(e.target.value)}
                      placeholder="WHO AM I"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E] font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Judul Section (Title)
                    </label>
                    <input
                      type="text"
                      value={aboutTitle}
                      onChange={(e) => setAboutTitle(e.target.value)}
                      placeholder="About Me"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Headline Utama (Besar)
                  </label>
                  <input
                    type="text"
                    value={aboutHeadline}
                    onChange={(e) => setAboutHeadline(e.target.value)}
                    placeholder="Creative Designer & Motion Specialist | 11+ Years | Agency & Global Brands"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-semibold focus:outline-none focus:border-[#14AF9E] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Paragraf Narasi / Bio
                  </label>
                  <textarea
                    rows={4}
                    value={aboutBio}
                    onChange={(e) => setAboutBio(e.target.value)}
                    placeholder="With 11+ years in creative design, Iâ€™ve evolved alongside the industry..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm leading-relaxed focus:outline-none focus:border-[#14AF9E] transition-all resize-none"
                  />
                </div>
              </div>

              {/* 2. Filosofi Inti (Core Philosophy) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#14AF9E] uppercase tracking-widest font-semibold block">
                    BAGIAN 2 Â· FILOSOFI INTI
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Quote & Core Philosophy
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Label / Tag Box
                    </label>
                    <input
                      type="text"
                      value={aboutPhilosophyTitle}
                      onChange={(e) => setAboutPhilosophyTitle(e.target.value)}
                      placeholder="CORE PHILOSOPHY"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#14AF9E] transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                      Isi Kutipan / Quote Filosofi
                    </label>
                    <input
                      type="text"
                      value={aboutPhilosophyQuote}
                      onChange={(e) => setAboutPhilosophyQuote(e.target.value)}
                      placeholder="A creative professionalâ€™s greatest advantage isnâ€™t resisting change â€” itâ€™s adapting faster."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm italic focus:outline-none focus:border-[#14AF9E] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Tiga Statistik Utama (3 Key Stats) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#14AF9E] uppercase tracking-widest font-semibold block">
                    BAGIAN 3 Â· STATISTIK PENGALAMAN
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    3 Angka Prestasi & Pengalaman
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Stat 1 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                    <label className="block text-[11px] font-mono text-[#14AF9E] font-semibold uppercase">
                      Statistik 1 (Warna Aksen Hijau/Cyan)
                    </label>
                    <input
                      type="text"
                      value={aboutStat1Num}
                      onChange={(e) => setAboutStat1Num(e.target.value)}
                      placeholder="11+"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-base font-bold font-mono focus:outline-none focus:border-[#14AF9E]"
                    />
                    <input
                      type="text"
                      value={aboutStat1Label}
                      onChange={(e) => setAboutStat1Label(e.target.value)}
                      placeholder="YEARS EXPERIENCE"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-[#14AF9E]"
                    />
                  </div>

                  {/* Stat 2 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                    <label className="block text-[11px] font-mono text-neutral-400 font-semibold uppercase">
                      Statistik 2
                    </label>
                    <input
                      type="text"
                      value={aboutStat2Num}
                      onChange={(e) => setAboutStat2Num(e.target.value)}
                      placeholder="100+"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-base font-bold font-mono focus:outline-none focus:border-[#14AF9E]"
                    />
                    <input
                      type="text"
                      value={aboutStat2Label}
                      onChange={(e) => setAboutStat2Label(e.target.value)}
                      placeholder="PROJECTS"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-[#14AF9E]"
                    />
                  </div>

                  {/* Stat 3 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                    <label className="block text-[11px] font-mono text-neutral-400 font-semibold uppercase">
                      Statistik 3
                    </label>
                    <input
                      type="text"
                      value={aboutStat3Num}
                      onChange={(e) => setAboutStat3Num(e.target.value)}
                      placeholder="20+"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-base font-bold font-mono focus:outline-none focus:border-[#14AF9E]"
                    />
                    <input
                      type="text"
                      value={aboutStat3Label}
                      onChange={(e) => setAboutStat3Label(e.target.value)}
                      placeholder="CLIENTS"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-[#14AF9E]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Sidebar Cards (Global Collaboration & Disciplines) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#14AF9E] uppercase tracking-widest font-semibold block">
                    BAGIAN 4 Â· KARTU SAMPING (SIDEBAR CARDS)
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Kolaborasi Global & Disiplin Keahlian
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kolaborasi Global */}
                  <div className="space-y-3 p-4 rounded-xl bg-neutral-950 border border-white/10">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                        Judul Kartu Kolaborasi
                      </label>
                      <input
                        type="text"
                        value={aboutCollabTitle}
                        onChange={(e) => setAboutCollabTitle(e.target.value)}
                        placeholder="Global Collaboration"
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                        Deskripsi Kolaborasi
                      </label>
                      <textarea
                        rows={3}
                        value={aboutCollabDesc}
                        onChange={(e) => setAboutCollabDesc(e.target.value)}
                        placeholder="Producing scalable visual content, high-performing ads..."
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-[#14AF9E] resize-none"
                      />
                    </div>
                  </div>

                  {/* Disiplin Keahlian */}
                  <div className="space-y-3 p-4 rounded-xl bg-neutral-950 border border-white/10">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                        Judul Kartu Disiplin
                      </label>
                      <input
                        type="text"
                        value={aboutDisciplinesTitle}
                        onChange={(e) => setAboutDisciplinesTitle(e.target.value)}
                        placeholder="Disciplines"
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#14AF9E]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-mono text-neutral-300 font-medium">
                          Daftar Keahlian (Pisahkan dengan koma)
                        </label>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {aboutDisciplinesInput.split(",").filter((t) => t.trim()).length} Tags
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={aboutDisciplinesInput}
                        onChange={(e) => setAboutDisciplinesInput(e.target.value)}
                        placeholder="Creative Direction, Motion Graphics, Branding & Identity, UI/UX Design, Digital Advertising, Video Production"
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-[#14AF9E] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#14AF9E] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <HiCheck className="w-4 h-4" />
                  <span>Simpan Perubahan About Me & Update Web</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAbout}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Reset Form
                </button>
              </div>
            </form>
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
                  <strong className="text-white">Lokasi di Web Publik:</strong> Section ini berada di dalam sekuens interaktif <em>Projects (Stage 3: ~60% scroll)</em>. Saat Anda klik tombol <strong>"Simpan & Buka Langsung di Web â†—"</strong> di bawah, sistem akan otomatis melakukan scroll halus langsung tepat ke depan video YouTube Anda.
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
                      <span>Simpan & Buka Langsung di Web â†—</span>
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
                        <span>â†—</span>
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

        {/* TAB 6: PENGATURAN AKUN & SANDI ADMIN */}
        {activeTab === "account" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header Explainer */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-mono tracking-widest text-[#14AF9E] uppercase font-semibold block mb-1">
                ADMIN SECURITY & CREDENTIALS
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Pengaturan Akun, Ganti Password & Email Verifikasi
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl leading-relaxed">
                Kelola kredensial login Admin Panel. Perubahan langsung tersimpan di database Supabase Cloud dan LocalStorage sehingga Anda dapat login dengan akun baru di URL rahasia <code className="text-[#14AF9E] font-mono">?login=secret</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Kolom Kiri */}
              <div className="lg:col-span-7 bg-neutral-900/60 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-sm">
                <form onSubmit={handleSaveAccount} className="space-y-5">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5 tracking-wide">
                      USERNAME ADMIN <span className="text-[#14AF9E]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={adminUser}
                        onChange={(e) => setAdminUser(e.target.value)}
                        placeholder="admin"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E]"
                      />
                      <HiUser className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                      Username untuk login ke admin panel dashboard.
                    </span>
                  </div>

                  {/* Recovery Email */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5 tracking-wide">
                      EMAIL RECOVERY / VERIFIKASI <span className="text-[#14AF9E]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="rizxstudioproject@gmail.com"
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E]"
                      />
                      <HiEnvelope className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                      Kode OTP verifikasi saat lupa password akan dikirim ke email ini.
                    </span>
                  </div>

                  {/* Password Baru */}
                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5 tracking-wide">
                      GANTI PASSWORD BARU (KOSONGKAN JIKA TIDAK INGIN MENGUBAH)
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? "text" : "password"}
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        placeholder="Ketik password baru (minimal 6 karakter)"
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showAdminPass ? <HiXMark className="w-4 h-4" /> : <HiLockClosed className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password Baru */}
                  {adminPass && (
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5 tracking-wide">
                        KONFIRMASI PASSWORD BARU <span className="text-[#14AF9E]">*</span>
                      </label>
                      <input
                        type={showAdminPass ? "text" : "password"}
                        value={adminConfirmPass}
                        onChange={(e) => setAdminConfirmPass(e.target.value)}
                        placeholder="Ulangi password baru yang sama"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#14AF9E] focus:ring-1 focus:ring-[#14AF9E]"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={isSavingAccount}
                      className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#14AF9E] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <HiCheck className="w-4 h-4" />
                      <span>{isSavingAccount ? "Menyimpan ke Cloud…" : "Simpan Perubahan Akun"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Kolom Kanan: Panduan & Info Keamanan */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-3.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                    <HiInformationCircle className="w-4 h-4" />
                    <span>Informasi Akses Admin</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-neutral-300 font-mono leading-relaxed">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase block">URL Akses Rahasia</span>
                      <span className="text-[#14AF9E] font-bold block break-all">
                        https://rizxstudio.com/?login=secret
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase block">Email Verifikasi Pemulihan</span>
                      <span className="text-white font-bold block break-all">
                        rizxstudioproject@gmail.com
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase block">Shortcut Keyboard Cepat</span>
                      <span className="text-white block">
                        Tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-400 font-bold">Ctrl + Shift + A</kbd> dari halaman utama web.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase block">Sinkronisasi Cloud</span>
                      <span className="text-emerald-400 block font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Supabase Database Aktif
                      </span>
                    </div>
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
                    Folder: <span className="text-white font-mono">{selectedClient?.clientName}</span> Â· Perubahan langsung aktif di popup Case Study web publik.
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
                      <span>âš ï¸</span>
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
                      <span>âœ…</span>
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
                          {isSelected ? `âœ“ ${tool.label}` : `+ ${tool.label}`}
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
              âœ“
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

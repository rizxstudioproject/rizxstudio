"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiPlayFill as HiPlay,
  RiPauseFill as HiPause,
  RiDeleteBinFill as HiTrash,
  RiCheckFill as HiCheck,
  RiRestartFill as HiArrowPath,
  RiFolderFill as HiFolder,
  RiFolderAddFill as HiFolderPlus,
  RiEyeFill as HiEye,
  RiSparklingFill as HiSparkles,
  RiCloseFill as HiXMark,
  RiMovieFill as HiVideoCamera,
  RiEditFill as HiPencilSquare,
  RiAddFill as HiPlus,
  RiUpload2Fill as HiArrowUpTray,
  RiImageFill as HiPhoto,
  RiLogoutBoxRFill as HiArrowRightOnRectangle,
  RiInformationFill as HiInformationCircle,
  RiPriceTag3Fill as HiTag,
  RiUser3Fill as HiUser,
  RiKeyFill as HiKey,
  RiLockFill as HiLockClosed,
  RiMailFill as HiEnvelope,
  RiMenuFill as HiBars3,
  RiGridFill as HiSquares2X2,
  RiBookOpenFill as HiBookOpen,
  RiDatabase2Fill as HiCircleStack,
  RiStackFill as HiSquare3Stack3D,
  RiPieChartFill as HiChartPie,
  RiCursorFill,
  RiPaletteFill,
  RiChat3Fill,
  RiLineChartFill,
  RiSearchEyeFill,
  RiArrowLeftLine,
  RiSave3Fill,
  RiArrowRightLine,
} from "react-icons/ri";
import { useLang, toMinang } from "@/context/LanguageContext";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/adminAuth";
import {
  usePortfolioData,
  extractYouTubeId,
  extractGoogleDriveId,
  ClientItem,
  defaultAboutData,
  defaultHeroWorksData,
  defaultClientLogosData,
  defaultPortfolioIntroData,
  DeckCardItem,
  OverlappingCardItem,
  ClientLogoItem,
  PortfolioRunnerItem,
  defaultPortfolioRunnerData,
  HeroBannerData,
  defaultHeroBannerData,
} from "@/context/PortfolioDataContext";
import { getCaseStudy, getAspectClass } from "@/components/Projects";
import {
  saveCustomFramesToDB,
  getCustomFramesFromDB,
  clearCustomFramesFromDB,
  clearStage3ImageFromDB,
} from "@/lib/sequenceStorage";
import AdminSidebar, { AdminSidebarTab } from "./admin/AdminSidebar";
import AdminTopBar from "./admin/AdminTopBar";
import ClientsWorkspace from "./admin/ClientsWorkspace";
import ResourceLibrary from "./admin/ResourceLibrary";
import RecycleBinWorkspace from "./admin/RecycleBinWorkspace";
import StorageAnalyticsView from "./admin/StorageAnalyticsView";
import MotionEffectsWorkspace from "./admin/MotionEffectsWorkspace";
import ThemeColorWorkspace from "./admin/ThemeColorWorkspace";
import SocialContactsWorkspace from "./admin/SocialContactsWorkspace";
import CrmAnalyticsView from "./admin/CrmAnalyticsView";
import SeoWorkspace from "./admin/SeoWorkspace";
import MobileAdminApp from "./admin/MobileAdminApp";
import MetaSEO from "./MetaSEO";
import { saveSocialContacts } from "@/lib/socialService";
import { useMotionTheme } from "@/context/MotionThemeContext";

export default function AdminDashboard({ onClose }: { onClose?: () => void }) {
  const {
    stage3,
    clients,
    about,
    heroWorks,
    clientLogos,
    portfolioIntro,
    updateHeroWorksData,
    updateClientLogosData,
    updatePortfolioIntroData,
    portfolioRunner,
    updatePortfolioRunnerData,
    resetPortfolioRunner,
    heroBanner,
    updateHeroBannerData,
    updateAboutData,
    updateStage3Video,
    removeStage3Video,
    updateClientDescription,
    addClientWork,
    updateClientWork,
    deleteClientWork,
    addClientFolder,
    updateClientFolder,
    deleteClientFolder,
    resetPortfolioData,
    setIsAdminMode,
    adminLogout,
    isCloudSyncActive,
    trashItems,
    moveToTrash,
    restoreFromTrash,
  } = usePortfolioData();

  // Studio OS Sidebar Tab: 'dashboard' | 'clients' | 'portfolio' | 'ai-prompt' | 'brand' | 'resources' | 'settings'
  const [sidebarTab, setSidebarTab] = useState<AdminSidebarTab>("clients");
  const [mobileScreen, setMobileScreen] = useState<"home" | "workspace">("home");
  const [portfolioSubTab, setPortfolioSubTab] = useState<
    "hero-banner" | "hero-works" | "flagship" | "runner" | "about"
  >("hero-banner");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [clientsWorkspaceView, setClientsWorkspaceView] = useState<"folders" | "logos">("folders");
  const [storageSubTab, setStorageSubTab] = useState<"analytics" | "resources">("analytics");

  // Redirect legacy / external resources links into storage workspace
  useEffect(() => {
    if (sidebarTab === "resources") {
      setStorageSubTab("resources");
      setSidebarTab("storage");
    }
  }, [sidebarTab]);

  // Legacy activeTab support
  const [activeTab, setActiveTab] = useState<
    "hero-banner" | "clients" | "hero-works" | "runner" | "about" | "flagship" | "account"
  >("clients");

  // Mobile Navigation Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);

  // Auto-scroll focused inputs above mobile on-screen keyboard & adapt viewport
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    };

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const offset = Math.max(0, window.innerHeight - window.visualViewport.height);
        setViewportBottomOffset(offset);
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) {
          setTimeout(() => {
            active.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange);
        window.visualViewport.removeEventListener("scroll", handleViewportChange);
      }
    };
  }, []);

  // Admin Account & Password Management State
  const { lang, setLang } = useLang();
  const isId = lang === "id";
  const isMin = lang === "min";
  const tx = (idVal: string, enVal: string, minVal?: string) => {
    if (lang === "min") return minVal || toMinang(idVal);
    if (lang === "id") return idVal;
    return enVal;
  };
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("");
  const [adminConfirmPass, setAdminConfirmPass] = useState("");
  const [adminEmail, setAdminEmail] = useState("rizxstudioproject@gmail.com");
  const [adminSecretKey, setAdminSecretKey] = useState("secret");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  useEffect(() => {
    getAdminCredentials().then((c) => {
      if (c.username) setAdminUser(c.username);
      if (c.email) setAdminEmail(c.email);
      if (c.secretParam) setAdminSecretKey(c.secretParam);
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
      const cleanSecret = adminSecretKey.trim().replace(/^[\?&]?(login=)?/, "") || "secret";
      await saveAdminCredentials({
        username: adminUser.trim() || "admin",
        email: adminEmail.trim() || "rizxstudioproject@gmail.com",
        secretParam: cleanSecret,
        ...(adminPass ? { password: adminPass.trim() } : {}),
      });
      setAdminSecretKey(cleanSecret);
      setAdminPass("");
      setAdminConfirmPass("");
      showToast("Berhasil: Pengaturan akun, password & URL login rahasia berhasil disimpan ke Supabase Cloud!");
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

  // ==========================================
  // Portfolio Runner Marquee (4:5) Form States
  // ==========================================
  const [runnerTitle, setRunnerTitle] = useState(
    portfolioRunner?.title || defaultPortfolioRunnerData.title
  );
  const [runnerItems, setRunnerItems] = useState<PortfolioRunnerItem[]>(
    portfolioRunner?.items || defaultPortfolioRunnerData.items
  );
  const [runnerSpeedRow1, setRunnerSpeedRow1] = useState<number>(
    portfolioRunner?.speedRow1 ?? 85
  );
  const [runnerSpeedRow2, setRunnerSpeedRow2] = useState<number>(
    portfolioRunner?.speedRow2 ?? 95
  );
  const [runnerDirRow1, setRunnerDirRow1] = useState<"left" | "right">(
    portfolioRunner?.directionRow1 ?? "left"
  );
  const [runnerDirRow2, setRunnerDirRow2] = useState<"left" | "right">(
    portfolioRunner?.directionRow2 ?? "right"
  );
  const [runnerPauseOnHover, setRunnerPauseOnHover] = useState<boolean>(
    portfolioRunner?.pauseOnHover ?? false
  );
  const [runnerWaveEnabled, setRunnerWaveEnabled] = useState<boolean>(
    portfolioRunner?.waveEffectEnabled ?? true
  );
  const [runnerWaveLift, setRunnerWaveLift] = useState<number>(
    portfolioRunner?.waveLift ?? 22
  );
  const [runnerWaveScale, setRunnerWaveScale] = useState<number>(
    portfolioRunner?.waveScale ?? 1.17
  );
  const [runnerWaveRadius, setRunnerWaveRadius] = useState<number>(
    portfolioRunner?.waveRadius ?? 240
  );
  const [newRunnerTitle, setNewRunnerTitle] = useState("");
  const [newRunnerCategory, setNewRunnerCategory] = useState("");
  const [newRunnerImage, setNewRunnerImage] = useState("");
  const [newRunnerRow, setNewRunnerRow] = useState<1 | 2>(1);
  const [editingRunnerItem, setEditingRunnerItem] = useState<PortfolioRunnerItem | null>(null);
  const [runnerFilterRow, setRunnerFilterRow] = useState<"all" | 1 | 2>("all");

  useEffect(() => {
    if (portfolioRunner) {
      setRunnerTitle(portfolioRunner.title || defaultPortfolioRunnerData.title);
      setRunnerItems(portfolioRunner.items || defaultPortfolioRunnerData.items);
      setRunnerSpeedRow1(portfolioRunner.speedRow1 ?? 85);
      setRunnerSpeedRow2(portfolioRunner.speedRow2 ?? 95);
      setRunnerDirRow1(portfolioRunner.directionRow1 ?? "left");
      setRunnerDirRow2(portfolioRunner.directionRow2 ?? "right");
      setRunnerPauseOnHover(portfolioRunner.pauseOnHover ?? false);
      setRunnerWaveEnabled(portfolioRunner.waveEffectEnabled ?? true);
      setRunnerWaveLift(portfolioRunner.waveLift ?? 22);
      setRunnerWaveScale(portfolioRunner.waveScale ?? 1.17);
      setRunnerWaveRadius(portfolioRunner.waveRadius ?? 240);
    }
  }, [portfolioRunner]);

  // ==========================================
  // Hero Banner Scrollytelling Form States
  // ==========================================
  const [hbName, setHbName] = useState(heroBanner?.name || defaultHeroBannerData.name);
  const [hbNameColor, setHbNameColor] = useState(heroBanner?.nameColor || defaultHeroBannerData.nameColor || "#ffffff");
  const [hbRole, setHbRole] = useState(heroBanner?.role || defaultHeroBannerData.role);
  const [hbRoleColor, setHbRoleColor] = useState(heroBanner?.roleColor || defaultHeroBannerData.roleColor || "#16b09f");
  const [hbScrollText, setHbScrollText] = useState(heroBanner?.scrollText || defaultHeroBannerData.scrollText);
  const [hbScrollTextColor, setHbScrollTextColor] = useState(heroBanner?.scrollTextColor || defaultHeroBannerData.scrollTextColor || "#a3a3a3");
  const [hbSec2H1, setHbSec2H1] = useState(heroBanner?.sec2Headline1 || defaultHeroBannerData.sec2Headline1);
  const [hbSec2H1Color, setHbSec2H1Color] = useState(heroBanner?.sec2Headline1Color || defaultHeroBannerData.sec2Headline1Color || "#ffffff");
  const [hbSec2H2, setHbSec2H2] = useState(heroBanner?.sec2Headline2 || defaultHeroBannerData.sec2Headline2);
  const [hbSec2H2Color, setHbSec2H2Color] = useState(heroBanner?.sec2Headline2Color || defaultHeroBannerData.sec2Headline2Color || "#a3a3a3");
  const [hbSec2Body, setHbSec2Body] = useState(heroBanner?.sec2Body || defaultHeroBannerData.sec2Body);
  const [hbSec2BodyColor, setHbSec2BodyColor] = useState(heroBanner?.sec2BodyColor || defaultHeroBannerData.sec2BodyColor || "#d4d4d4");
  const [hbSec3H1, setHbSec3H1] = useState(heroBanner?.sec3Headline1 || defaultHeroBannerData.sec3Headline1);
  const [hbSec3H1Color, setHbSec3H1Color] = useState(heroBanner?.sec3Headline1Color || defaultHeroBannerData.sec3Headline1Color || "#ffffff");
  const [hbSec3H2, setHbSec3H2] = useState(heroBanner?.sec3Headline2 || defaultHeroBannerData.sec3Headline2);
  const [hbSec3H2Color, setHbSec3H2Color] = useState(heroBanner?.sec3Headline2Color || defaultHeroBannerData.sec3Headline2Color || "#a3a3a3");
  const [hbSec3Body, setHbSec3Body] = useState(heroBanner?.sec3Body || defaultHeroBannerData.sec3Body);
  const [hbSec3BodyColor, setHbSec3BodyColor] = useState(heroBanner?.sec3BodyColor || defaultHeroBannerData.sec3BodyColor || "#d4d4d4");

  // Hero Photo Sequence States
  const [hbSeqMode, setHbSeqMode] = useState<"default" | "folder" | "custom">(
    heroBanner?.sequenceMode || "default"
  );
  const [hbSeqTotal, setHbSeqTotal] = useState<number>(
    heroBanner?.sequenceTotalFrames || 121
  );
  const [hbSeqFolder, setHbSeqFolder] = useState<string>(
    heroBanner?.sequenceFolder || "/sequence"
  );
  const [hbSeqPattern, setHbSeqPattern] = useState<string>(
    heroBanner?.sequencePattern || "frame_{padded}.webp"
  );
  const [hbSeqPadding, setHbSeqPadding] = useState<number>(
    heroBanner?.sequencePadding ?? 6
  );
  const [hbSeqStart, setHbSeqStart] = useState<number>(
    heroBanner?.sequenceStartIndex ?? 0
  );
  const [hbSeqCustomFrames, setHbSeqCustomFrames] = useState<string[]>(
    heroBanner?.sequenceCustomFrames || []
  );
  const [hbSeqMouseTracking, setHbSeqMouseTracking] = useState<boolean>(
    heroBanner?.sequenceMouseTracking ?? true
  );
  const [hbSeqMouseIntensity, setHbSeqMouseIntensity] = useState<number>(
    heroBanner?.sequenceMouseIntensity ?? 26
  );

  // Scrubber & Batch Upload States
  const [seqSelectedFiles, setSeqSelectedFiles] = useState<File[]>([]);
  const [seqPreviewUrls, setSeqPreviewUrls] = useState<string[]>([]);
  const [seqScrubIdx, setSeqScrubIdx] = useState<number>(0);
  const [seqIsUploading, setSeqIsUploading] = useState<boolean>(false);
  const [seqUploadMsg, setSeqUploadMsg] = useState<string>("");
  const [seqIsAutoPlaying, setSeqIsAutoPlaying] = useState<boolean>(false);
  const [seqActiveTab, setSeqActiveTab] = useState<"upload" | "folder">("upload");
  const seqFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (heroBanner) {
      setHbName(heroBanner.name || defaultHeroBannerData.name);
      setHbNameColor(heroBanner.nameColor || defaultHeroBannerData.nameColor || "#ffffff");
      setHbRole(heroBanner.role || defaultHeroBannerData.role);
      setHbRoleColor(heroBanner.roleColor || defaultHeroBannerData.roleColor || "#16b09f");
      setHbScrollText(heroBanner.scrollText || defaultHeroBannerData.scrollText);
      setHbScrollTextColor(heroBanner.scrollTextColor || defaultHeroBannerData.scrollTextColor || "#a3a3a3");
      setHbSec2H1(heroBanner.sec2Headline1 || defaultHeroBannerData.sec2Headline1);
      setHbSec2H1Color(heroBanner.sec2Headline1Color || defaultHeroBannerData.sec2Headline1Color || "#ffffff");
      setHbSec2H2(heroBanner.sec2Headline2 || defaultHeroBannerData.sec2Headline2);
      setHbSec2H2Color(heroBanner.sec2Headline2Color || defaultHeroBannerData.sec2Headline2Color || "#a3a3a3");
      setHbSec2Body(heroBanner.sec2Body || defaultHeroBannerData.sec2Body);
      setHbSec2BodyColor(heroBanner.sec2BodyColor || defaultHeroBannerData.sec2BodyColor || "#d4d4d4");
      setHbSec3H1(heroBanner.sec3Headline1 || defaultHeroBannerData.sec3Headline1);
      setHbSec3H1Color(heroBanner.sec3Headline1Color || defaultHeroBannerData.sec3Headline1Color || "#ffffff");
      setHbSec3H2(heroBanner.sec3Headline2 || defaultHeroBannerData.sec3Headline2);
      setHbSec3H2Color(heroBanner.sec3Headline2Color || defaultHeroBannerData.sec3Headline2Color || "#a3a3a3");
      setHbSec3Body(heroBanner.sec3Body || defaultHeroBannerData.sec3Body);
      setHbSec3BodyColor(heroBanner.sec3BodyColor || defaultHeroBannerData.sec3BodyColor || "#d4d4d4");
      setHbSeqMode(heroBanner.sequenceMode || "default");
      setHbSeqTotal(heroBanner.sequenceTotalFrames || 121);
      setHbSeqFolder(heroBanner.sequenceFolder || "/sequence");
      setHbSeqPattern(heroBanner.sequencePattern || "frame_{padded}.webp");
      setHbSeqPadding(heroBanner.sequencePadding ?? 6);
      setHbSeqStart(heroBanner.sequenceStartIndex ?? 0);
      setHbSeqCustomFrames(heroBanner.sequenceCustomFrames || []);
      setHbSeqMouseTracking(heroBanner.sequenceMouseTracking ?? true);
      setHbSeqMouseIntensity(heroBanner.sequenceMouseIntensity ?? 26);
    }
  }, [heroBanner]);

  // Compute active preview frames for scrubber in admin
  const activeScrubberFrames = React.useMemo(() => {
    if (seqPreviewUrls.length > 0) return seqPreviewUrls;
    if (hbSeqMode === "custom" && hbSeqCustomFrames.length > 0) return hbSeqCustomFrames;
    if (hbSeqMode === "folder") {
      const folder = (hbSeqFolder || "/sequence").replace(/\/$/, "");
      const pattern = hbSeqPattern || "frame_{padded}.webp";
      const padding = hbSeqPadding ?? 6;
      const start = hbSeqStart ?? 0;
      const total = Math.max(1, Math.min(hbSeqTotal || 121, 200));
      const list: string[] = [];
      for (let i = 0; i < total; i++) {
        const actual = start + i;
        const padded = String(actual).padStart(padding, "0");
        list.push(`${folder}/${pattern.replace("{padded}", padded).replace("{index}", String(actual))}`);
      }
      return list;
    }
    // Default sequence
    const list: string[] = [];
    for (let i = 0; i < 121; i++) {
      list.push(`/sequence/frame_${String(i).padStart(6, "0")}.webp`);
    }
    return list;
  }, [
    seqPreviewUrls,
    hbSeqMode,
    hbSeqCustomFrames,
    hbSeqFolder,
    hbSeqPattern,
    hbSeqPadding,
    hbSeqStart,
    hbSeqTotal,
  ]);

  // Autoplay scrubber preview animation
  useEffect(() => {
    if (!seqIsAutoPlaying) return;
    const max = activeScrubberFrames.length;
    if (max <= 1) return;
    const interval = setInterval(() => {
      setSeqScrubIdx((prev) => (prev + 1) % max);
    }, 65);
    return () => clearInterval(interval);
  }, [seqIsAutoPlaying, activeScrubberFrames.length]);

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

  // Helper file reader for image uploads with high-res auto-compression to avoid LocalStorage quota overflow
  const handleGenericImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (dataUrl: string) => void,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting the same file again triggers change event
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Keep SVGs untouched
      if (file.type === "image/svg+xml") {
        callback(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
          const compressed = canvas.toDataURL(mime, quality);
          callback(compressed);
        } else {
          callback(rawDataUrl);
        }
      };
      img.onerror = () => callback(rawDataUrl);
      img.src = rawDataUrl;
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
            ? "bg-[#16b09f] text-white border-[#16b09f]"
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
    showToast("Perubahan dibatalkan — form dikembalikan ke data tersimpan.");
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
    const card = hwDeckCards.find((c) => c.id === id);
    if (card) {
      moveToTrash({
        originalId: id,
        type: "hero-card",
        title: card.title,
        subtitle: `Hero Deck Card • ${card.category}`,
        previewImage: card.image,
        payload: { card, cardType: "deck" },
      });
    }
    setHwDeckCards((prev) => prev.filter((c) => c.id !== id));
    showToast(tx("Kartu dipindahkan ke Tong Sampah. Klik 'Simpan Update' untuk menerapkan.", "Card moved to Recycle Bin. Click 'Save Update' to apply."));
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
    const card = hwOverlappingCards.find((c) => c.id === id);
    if (card) {
      moveToTrash({
        originalId: id,
        type: "hero-card",
        title: card.title,
        subtitle: "Hero Overlapping Visual",
        previewImage: card.image,
        payload: { card, cardType: "overlapping" },
      });
    }
    setHwOverlappingCards((prev) => prev.filter((c) => c.id !== id));
    showToast(tx("Kartu dipindahkan ke Tong Sampah. Klik 'Simpan Update' untuk menerapkan.", "Card moved to Recycle Bin. Click 'Save Update' to apply."));
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
    showToast("Perubahan dibatalkan — form dikembalikan ke data tersimpan.");
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
    const logo = clLogos.find((l) => l.id === id);
    if (logo) {
      moveToTrash({
        originalId: id,
        type: "client-logo",
        title: logo.name,
        subtitle: `Partner Logos (Row ${logo.row})`,
        previewImage: logo.file,
        payload: { logo },
      });
    }
    setClLogos((prev) => prev.filter((l) => l.id !== id));
    showToast(tx("Logo dipindahkan ke Tong Sampah. Klik 'Simpan Update' untuk menerapkan.", "Logo moved to Recycle Bin. Click 'Save Update' to apply."));
  };

  // ==========================================
  // Handlers for Portfolio Runner Marquee (4:5)
  // ==========================================
  const handleSavePortfolioRunner = async () => {
    await updatePortfolioRunnerData({
      title: runnerTitle.trim() || "SELECTED WORKS",
      items: runnerItems,
      speedRow1: Number(runnerSpeedRow1) || 85,
      speedRow2: Number(runnerSpeedRow2) || 95,
      directionRow1: runnerDirRow1,
      directionRow2: runnerDirRow2,
      pauseOnHover: runnerPauseOnHover,
      waveEffectEnabled: runnerWaveEnabled,
      waveLift: Number(runnerWaveLift) || 22,
      waveScale: Number(runnerWaveScale) || 1.17,
      waveRadius: Number(runnerWaveRadius) || 240,
    });
    showToast("Berhasil: Pengaturan, kecepatan, dan efek Running Portofolio berhasil disimpan!");
  };

  const handleCancelPortfolioRunner = () => {
    if (portfolioRunner) {
      setRunnerTitle(portfolioRunner.title || defaultPortfolioRunnerData.title);
      setRunnerItems(portfolioRunner.items || defaultPortfolioRunnerData.items);
      setRunnerSpeedRow1(portfolioRunner.speedRow1 ?? 85);
      setRunnerSpeedRow2(portfolioRunner.speedRow2 ?? 95);
      setRunnerDirRow1(portfolioRunner.directionRow1 ?? "left");
      setRunnerDirRow2(portfolioRunner.directionRow2 ?? "right");
      setRunnerPauseOnHover(portfolioRunner.pauseOnHover ?? false);
      setRunnerWaveEnabled(portfolioRunner.waveEffectEnabled ?? true);
      setRunnerWaveLift(portfolioRunner.waveLift ?? 22);
      setRunnerWaveScale(portfolioRunner.waveScale ?? 1.17);
      setRunnerWaveRadius(portfolioRunner.waveRadius ?? 240);
    }
    showToast("Perubahan dibatalkan — form dikembalikan ke data tersimpan.");
  };

  const handleAddRunnerItem = () => {
    if (!newRunnerImage) {
      showToast("Peringatan: Silakan pilih gambar karya terlebih dahulu.");
      return;
    }
    if (!newRunnerTitle.trim()) {
      showToast("Peringatan: Silakan isi judul karya.");
      return;
    }
    const newItem: PortfolioRunnerItem = {
      id: `pr-${Date.now()}`,
      title: newRunnerTitle.trim(),
      category: newRunnerCategory.trim() || "Creative Work",
      image: newRunnerImage,
      row: newRunnerRow,
    };
    setRunnerItems((prev) => [newItem, ...prev]);
    setNewRunnerTitle("");
    setNewRunnerCategory("");
    setNewRunnerImage("");
    showToast(`Karya "${newItem.title}" ditambahkan ke Baris ${newRunnerRow}! Klik 'Simpan Perubahan' untuk menerapkan.`);
  };

  const handleDeleteRunnerItem = (id: string) => {
    const item = runnerItems.find((item) => item.id === id);
    if (item) {
      moveToTrash({
        originalId: id,
        type: "runner-item",
        title: item.title,
        subtitle: `Baris ${item.row} • ${item.category}`,
        previewImage: item.image,
        payload: { item },
      });
    }
    setRunnerItems((prev) => prev.filter((item) => item.id !== id));
    showToast(tx("Kartu dipindahkan ke Tong Sampah. Klik 'Simpan Perubahan' untuk menerapkan.", "Card moved to Recycle Bin. Click 'Save Changes' to apply."));
  };

  const handleToggleRunnerRow = (id: string) => {
    setRunnerItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, row: item.row === 1 ? 2 : 1 } : item
      )
    );
    showToast("Posisi baris karya dipindahkan. Klik 'Simpan Perubahan' untuk menerapkan.");
  };

  const handleUpdateEditingRunnerItem = () => {
    if (!editingRunnerItem) return;
    if (!editingRunnerItem.title.trim()) {
      showToast("Peringatan: Judul karya tidak boleh kosong.");
      return;
    }
    setRunnerItems((prev) =>
      prev.map((i) => (i.id === editingRunnerItem.id ? editingRunnerItem : i))
    );
    setEditingRunnerItem(null);
    showToast("Karya berhasil diperbarui! Klik 'Simpan Perubahan' untuk menerapkan.");
  };

  const handleResetPortfolioRunnerDefault = async () => {
    if (confirm(tx("Reset Running Portofolio ke susunan default awal?", "Reset Running Portfolio to default?"))) {
      await resetPortfolioRunner();
      setRunnerTitle(defaultPortfolioRunnerData.title);
      setRunnerItems(defaultPortfolioRunnerData.items);
      setRunnerSpeedRow1(85);
      setRunnerSpeedRow2(95);
      setRunnerDirRow1("left");
      setRunnerDirRow2("right");
      setRunnerPauseOnHover(false);
      setRunnerWaveEnabled(true);
      setRunnerWaveLift(22);
      setRunnerWaveScale(1.17);
      setRunnerWaveRadius(240);
      showToast("Running Portofolio berhasil di-reset ke default!");
    }
  };

  // ==========================================
  // Handlers for Hero Banner & Sequence Photo
  // ==========================================
  const handleSelectSequenceFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    // Natural sort: frame_1, frame_2, ... frame_10 etc.
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    const sorted = [...files].sort((a, b) => collator.compare(a.name, b.name));

    // Revoke previous blob URLs if any
    seqPreviewUrls.forEach((u) => {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    });

    const objectUrls = sorted.map((f) => URL.createObjectURL(f));
    setSeqSelectedFiles(sorted);
    setSeqPreviewUrls(objectUrls);
    setSeqScrubIdx(0);
    setSeqUploadMsg(
      tx(`${sorted.length} frame foto dipilih. Silakan coba slider preview, lalu klik "Upload & Terapkan".`, `${sorted.length} frames selected. Review via preview slider, then click "Upload & Apply".`)
    );
  };

  const handleUploadSequenceBatch = async () => {
    if (seqSelectedFiles.length === 0) {
      showToast(tx("Pilih file foto sequence terlebih dahulu.", "Please select sequence photo files first."));
      return;
    }
    setSeqIsUploading(true);
    setSeqUploadMsg(tx("Mengupload dan memproses sequence foto...", "Uploading and processing sequence frames..."));

    try {
      const formData = new FormData();
      seqSelectedFiles.forEach((f) => {
        formData.append("files", f);
      });

      const res = await fetch("/api/admin/sequence-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Gagal mengupload sequence");
      }

      const data = await res.json();
      const urls: string[] = data.urls || [];

      // Update state
      setHbSeqMode("custom");
      setHbSeqTotal(data.totalFrames);
      setHbSeqFolder(data.folder);
      setHbSeqPattern(data.pattern);
      setHbSeqPadding(data.padding);
      setHbSeqStart(0);
      setHbSeqCustomFrames(urls);

      // Cache to IndexedDB
      await saveCustomFramesToDB(urls);

      // Persist to PortfolioData
      await updateHeroBannerData({
        ...heroBanner,
        sequenceMode: "custom",
        sequenceTotalFrames: data.totalFrames,
        sequenceFolder: data.folder,
        sequencePattern: data.pattern,
        sequencePadding: data.padding,
        sequenceStartIndex: 0,
        sequenceCustomFrames: urls,
      });

      setSeqSelectedFiles([]);
      setSeqPreviewUrls(urls);
      setSeqUploadMsg("");
      showToast(
        tx(`Sukses! ${data.totalFrames} frame foto hero sequence berhasil diperbarui & disimpan.`, `Success! ${data.totalFrames} hero sequence frames updated and saved.`)
      );
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err?.message || "Gagal upload sequence foto"}`);
      setSeqUploadMsg(tx(`Gagal: ${err?.message}`, `Failed: ${err?.message}`));
    } finally {
      setSeqIsUploading(false);
    }
  };

  const handleResetSequenceDefault = async () => {
    if (
      confirm(
        tx("Kembalikan sequence foto Hero ke default awal (121 Frame WebP)?", "Reset Hero photo sequence to default (121 WebP frames)?")
      )
    ) {
      setHbSeqMode("default");
      setHbSeqTotal(121);
      setHbSeqFolder("/sequence");
      setHbSeqPattern("frame_{padded}.webp");
      setHbSeqPadding(6);
      setHbSeqStart(0);
      setHbSeqCustomFrames([]);
      setHbSeqMouseTracking(true);
      setHbSeqMouseIntensity(26);
      setSeqSelectedFiles([]);
      setSeqPreviewUrls([]);
      setSeqScrubIdx(0);
      setSeqIsAutoPlaying(false);

      await clearCustomFramesFromDB();
      fetch("/api/admin/sequence-upload", { method: "DELETE" }).catch(() => {});

      await updateHeroBannerData({
        ...heroBanner,
        sequenceMode: "default",
        sequenceTotalFrames: 121,
        sequenceFolder: "/sequence",
        sequencePattern: "frame_{padded}.webp",
        sequencePadding: 6,
        sequenceStartIndex: 0,
        sequenceCustomFrames: [],
      });

      showToast(
        tx("Sequence foto Hero berhasil dikembalikan ke default bawaan!", "Hero photo sequence reset to default!")
      );
    }
  };

  const handleApplyFolderConfig = async () => {
    setHbSeqMode("folder");
    setSeqPreviewUrls([]);
    await updateHeroBannerData({
      ...heroBanner,
      sequenceMode: "folder",
      sequenceFolder: hbSeqFolder.trim(),
      sequencePattern: hbSeqPattern.trim(),
      sequenceTotalFrames: Number(hbSeqTotal) || 121,
      sequencePadding: Number(hbSeqPadding) || 6,
      sequenceStartIndex: Number(hbSeqStart) || 0,
      sequenceCustomFrames: [],
    });
    showToast(
      tx("Pengaturan folder sequence foto berhasil diterapkan!", "Folder sequence settings applied!")
    );
  };

  const handleSaveHeroBanner = async () => {
    await updateHeroBannerData({
      name: hbName.trim() || defaultHeroBannerData.name,
      nameColor: hbNameColor,
      role: hbRole.trim() || defaultHeroBannerData.role,
      roleColor: hbRoleColor,
      scrollText: hbScrollText.trim() || defaultHeroBannerData.scrollText,
      scrollTextColor: hbScrollTextColor,
      sec2Headline1: hbSec2H1.trim() || defaultHeroBannerData.sec2Headline1,
      sec2Headline1Color: hbSec2H1Color,
      sec2Headline2: hbSec2H2.trim() || defaultHeroBannerData.sec2Headline2,
      sec2Headline2Color: hbSec2H2Color,
      sec2Body: hbSec2Body.trim() || defaultHeroBannerData.sec2Body,
      sec2BodyColor: hbSec2BodyColor,
      sec3Headline1: hbSec3H1.trim() || defaultHeroBannerData.sec3Headline1,
      sec3Headline1Color: hbSec3H1Color,
      sec3Headline2: hbSec3H2.trim() || defaultHeroBannerData.sec3Headline2,
      sec3Headline2Color: hbSec3H2Color,
      sec3Body: hbSec3Body.trim() || defaultHeroBannerData.sec3Body,
      sec3BodyColor: hbSec3BodyColor,
      sequenceMode: hbSeqMode,
      sequenceTotalFrames: Number(hbSeqTotal) || 121,
      sequenceFolder: hbSeqFolder.trim(),
      sequencePattern: hbSeqPattern.trim(),
      sequencePadding: Number(hbSeqPadding) || 6,
      sequenceStartIndex: Number(hbSeqStart) || 0,
      sequenceCustomFrames: hbSeqCustomFrames,
      sequenceMouseTracking: hbSeqMouseTracking,
      sequenceMouseIntensity: Number(hbSeqMouseIntensity) || 26,
    });
    showToast(
      tx("Berhasil: Pengaturan & Teks Hero Banner berhasil disimpan!", "Hero Banner text and sequence settings saved successfully!")
    );
  };

  const handleCancelHeroBanner = () => {
    if (heroBanner) {
      setHbName(heroBanner.name || defaultHeroBannerData.name);
      setHbNameColor(heroBanner.nameColor || defaultHeroBannerData.nameColor || "#ffffff");
      setHbRole(heroBanner.role || defaultHeroBannerData.role);
      setHbRoleColor(heroBanner.roleColor || defaultHeroBannerData.roleColor || "#16b09f");
      setHbScrollText(heroBanner.scrollText || defaultHeroBannerData.scrollText);
      setHbScrollTextColor(heroBanner.scrollTextColor || defaultHeroBannerData.scrollTextColor || "#a3a3a3");
      setHbSec2H1(heroBanner.sec2Headline1 || defaultHeroBannerData.sec2Headline1);
      setHbSec2H1Color(heroBanner.sec2Headline1Color || defaultHeroBannerData.sec2Headline1Color || "#ffffff");
      setHbSec2H2(heroBanner.sec2Headline2 || defaultHeroBannerData.sec2Headline2);
      setHbSec2H2Color(heroBanner.sec2Headline2Color || defaultHeroBannerData.sec2Headline2Color || "#a3a3a3");
      setHbSec2Body(heroBanner.sec2Body || defaultHeroBannerData.sec2Body);
      setHbSec2BodyColor(heroBanner.sec2BodyColor || defaultHeroBannerData.sec2BodyColor || "#d4d4d4");
      setHbSec3H1(heroBanner.sec3Headline1 || defaultHeroBannerData.sec3Headline1);
      setHbSec3H1Color(heroBanner.sec3Headline1Color || defaultHeroBannerData.sec3Headline1Color || "#ffffff");
      setHbSec3H2(heroBanner.sec3Headline2 || defaultHeroBannerData.sec3Headline2);
      setHbSec3H2Color(heroBanner.sec3Headline2Color || defaultHeroBannerData.sec3Headline2Color || "#a3a3a3");
      setHbSec3Body(heroBanner.sec3Body || defaultHeroBannerData.sec3Body);
      setHbSec3BodyColor(heroBanner.sec3BodyColor || defaultHeroBannerData.sec3BodyColor || "#d4d4d4");
      setHbSeqMode(heroBanner.sequenceMode || "default");
      setHbSeqTotal(heroBanner.sequenceTotalFrames || 121);
      setHbSeqFolder(heroBanner.sequenceFolder || "/sequence");
      setHbSeqPattern(heroBanner.sequencePattern || "frame_{padded}.webp");
      setHbSeqPadding(heroBanner.sequencePadding ?? 6);
      setHbSeqStart(heroBanner.sequenceStartIndex ?? 0);
      setHbSeqCustomFrames(heroBanner.sequenceCustomFrames || []);
      setHbSeqMouseTracking(heroBanner.sequenceMouseTracking ?? true);
      setHbSeqMouseIntensity(heroBanner.sequenceMouseIntensity ?? 26);
      setSeqSelectedFiles([]);
      setSeqPreviewUrls([]);
    }
    showToast(
      tx("Perubahan dibatalkan — form dikembalikan ke data tersimpan.", "Changes cancelled — restored to saved data.")
    );
  };

  const handleResetHeroBannerDefault = async () => {
    if (
      confirm(
        tx("Reset seluruh teks dan sequence foto Hero Banner ke susunan default awal?", "Reset all Hero Banner text and photo sequence to default?")
      )
    ) {
      await updateHeroBannerData(defaultHeroBannerData);
      setHbName(defaultHeroBannerData.name);
      setHbNameColor(defaultHeroBannerData.nameColor || "#ffffff");
      setHbRole(defaultHeroBannerData.role);
      setHbRoleColor(defaultHeroBannerData.roleColor || "#16b09f");
      setHbScrollText(defaultHeroBannerData.scrollText);
      setHbScrollTextColor(defaultHeroBannerData.scrollTextColor || "#a3a3a3");
      setHbSec2H1(defaultHeroBannerData.sec2Headline1);
      setHbSec2H1Color(defaultHeroBannerData.sec2Headline1Color || "#ffffff");
      setHbSec2H2(defaultHeroBannerData.sec2Headline2);
      setHbSec2H2Color(defaultHeroBannerData.sec2Headline2Color || "#a3a3a3");
      setHbSec2Body(defaultHeroBannerData.sec2Body);
      setHbSec2BodyColor(defaultHeroBannerData.sec2BodyColor || "#d4d4d4");
      setHbSec3H1(defaultHeroBannerData.sec3Headline1);
      setHbSec3H1Color(defaultHeroBannerData.sec3Headline1Color || "#ffffff");
      setHbSec3H2(defaultHeroBannerData.sec3Headline2);
      setHbSec3H2Color(defaultHeroBannerData.sec3Headline2Color || "#a3a3a3");
      setHbSec3Body(defaultHeroBannerData.sec3Body);
      setHbSec3BodyColor(defaultHeroBannerData.sec3BodyColor || "#d4d4d4");
      setHbSeqMode("default");
      setHbSeqTotal(121);
      setHbSeqFolder("/sequence");
      setHbSeqPattern("frame_{padded}.webp");
      setHbSeqPadding(6);
      setHbSeqStart(0);
      setHbSeqCustomFrames([]);
      setHbSeqMouseTracking(true);
      setHbSeqMouseIntensity(26);
      setSeqSelectedFiles([]);
      setSeqPreviewUrls([]);
      setSeqScrubIdx(0);
      setSeqIsAutoPlaying(false);
      await clearCustomFramesFromDB();
      fetch("/api/admin/sequence-upload", { method: "DELETE" }).catch(() => {});
      showToast(
        tx("Hero Banner & sequence foto berhasil di-reset ke default!", "Hero Banner and sequence reset to default!")
      );
    }
  };

  // Tab 1: Flagship Showcase Video & Media State
  const [videoUrlInput, setVideoUrlInput] = useState(
    stage3.heroCard.youtubeUrl || (stage3.heroCard.videoId ? `https://www.youtube.com/watch?v=${stage3.heroCard.videoId}` : "")
  );
  const [flagshipMediaType, setFlagshipMediaType] = useState<"youtube" | "gdrive" | "image">(
    stage3.heroCard.mediaType || (
      stage3.heroCard.gdriveId || stage3.heroCard.gdriveUrl ? "gdrive" :
      (stage3.heroCard.videoId || stage3.heroCard.youtubeUrl ? "youtube" : "image")
    )
  );
  const [flagshipGDriveUrl, setFlagshipGDriveUrl] = useState<string>(
    stage3.heroCard.gdriveUrl || (stage3.heroCard.gdriveId ? `https://drive.google.com/file/d/${stage3.heroCard.gdriveId}/view` : "")
  );
  const [flagshipImageUrl, setFlagshipImageUrl] = useState<string>(
    stage3.heroCard.image || ""
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

  // Tab 1: Client Brand Description & Works State
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.length > 0 ? clients[0].id : "client-kia"
  );
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const [clientDescInput, setClientDescInput] = useState<string>("");
  const [clientToolsInput, setClientToolsInput] = useState<string>("Figma, Photoshop, Magnific AI, ChatGPT, Gemini");

  // Tab 1: Portfolio Section Header & Intro Block State (Left Block on Web)
  const [introBadgeInput, setIntroBadgeInput] = useState(
    portfolioIntro?.badge || "PROFESSIONAL EXPERIENCE"
  );
  const [introHeadlineInput, setIntroHeadlineInput] = useState(
    portfolioIntro?.headline || "Creative Work. Real-World Thinking."
  );
  const [introDescInput, setIntroDescInput] = useState(
    portfolioIntro?.description ||
      "From brand campaigns to digital experiences, I combine design, motion, and AI-driven workflows to create purposeful visuals for brands and businesses."
  );
  const [introToolsInput, setIntroToolsInput] = useState(
    portfolioIntro?.tools ? portfolioIntro.tools.join(", ") : "Figma, Photoshop, Magnific AI, GPT, Gemini"
  );

  // Sync intro fields whenever portfolioIntro in context changes
  useEffect(() => {
    if (portfolioIntro) {
      if (portfolioIntro.badge !== undefined) setIntroBadgeInput(portfolioIntro.badge);
      if (portfolioIntro.headline !== undefined) setIntroHeadlineInput(portfolioIntro.headline);
      if (portfolioIntro.description !== undefined) setIntroDescInput(portfolioIntro.description);
      if (portfolioIntro.tools && portfolioIntro.tools.length > 0) {
        setIntroToolsInput(portfolioIntro.tools.join(", "));
      }
    }
  }, [portfolioIntro]);

  const handleSavePortfolioIntro = async () => {
    const parsedTools = introToolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await updatePortfolioIntroData({
      badge: introBadgeInput.trim(),
      headline: introHeadlineInput.trim(),
      description: introDescInput.trim(),
      tools: parsedTools.length > 0 ? parsedTools : ["Figma", "Photoshop", "Magnific AI", "GPT", "Gemini"],
    });
    showToast(tx("Header & Intro Section Portofolio berhasil disimpan & tayang di web!", "Portfolio section header & intro saved & live on public web!"));
  };

  const handleResetPortfolioIntro = () => {
    setIntroBadgeInput(defaultPortfolioIntroData.badge);
    setIntroHeadlineInput(defaultPortfolioIntroData.headline);
    setIntroDescInput(defaultPortfolioIntroData.description);
    setIntroToolsInput(defaultPortfolioIntroData.tools.join(", "));
    showToast(tx("Form dikembalikan ke teks bawaan. Klik 'Simpan' untuk menerapkan ke web.", "Reset to default text. Click 'Save' to apply to web."));
  };

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

  // Edit Brand / Folder Name Modal State
  const [editingFolder, setEditingFolder] = useState<ClientItem | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderCategory, setEditFolderCategory] = useState("");
  const [editFolderLogo, setEditFolderLogo] = useState("");

  const handleOpenEditFolder = (folder: ClientItem) => {
    setEditingFolder(folder);
    setEditFolderName(folder.clientName);
    setEditFolderCategory(folder.category || `Portfolio — ${folder.clientName}`);
    setEditFolderLogo(folder.logo || "");
  };

  const handleSaveEditFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !editFolderName.trim()) return;

    updateClientFolder(editingFolder.id, {
      clientName: editFolderName.trim(),
      category: editFolderCategory.trim(),
      logo: editFolderLogo,
    });
    showToast(tx(`Nama brand berhasil diubah menjadi "${editFolderName.trim()}"!`, `Brand name updated to "${editFolderName.trim()}"!`));
    setEditingFolder(null);
  };

  // Upload Form Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("Digital Campaign");
  const [uploadAspect, setUploadAspect] = useState<"4:5" | "1:1" | "16:9" | "9:16">("4:5");
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear().toString());
  // Tool tags for upload — comma-separated input
  const [uploadToolsInput, setUploadToolsInput] = useState("Figma, Photoshop, Magnific AI");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Work & Case Study Modal State
  const [editingWork, setEditingWork] = useState<any | null>(null);
  const [editWorkTitle, setEditWorkTitle] = useState("");
  const [editWorkType, setEditWorkType] = useState("");
  const [editWorkYear, setEditWorkYear] = useState("");
  const [editWorkAspect, setEditWorkAspect] = useState<"4:5" | "1:1" | "16:9" | "9:16">("4:5");
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

  // Sync Flagship Media state whenever stage3 updates (e.g. from Supabase Cloud or localStorage)
  useEffect(() => {
    if (stage3) {
      if (stage3.headline) setVideoHeadline(stage3.headline);
      if (stage3.classTag) setVideoClassTag(stage3.classTag);
      if (stage3.heroCard) {
        setVideoUrlInput(
          stage3.heroCard.youtubeUrl ||
            (stage3.heroCard.videoId ? `https://www.youtube.com/watch?v=${stage3.heroCard.videoId}` : "")
        );
        const resolvedMediaType = stage3.heroCard.mediaType || (
          stage3.heroCard.gdriveId || stage3.heroCard.gdriveUrl ? "gdrive" :
          stage3.heroCard.videoId || stage3.heroCard.youtubeUrl ? "youtube" : "image"
        );
        setFlagshipMediaType(resolvedMediaType);
        setFlagshipGDriveUrl(
          stage3.heroCard.gdriveUrl ||
            (stage3.heroCard.gdriveId ? `https://drive.google.com/file/d/${stage3.heroCard.gdriveId}/view` : "")
        );
        setFlagshipImageUrl(stage3.heroCard.image || "");
        if (stage3.heroCard.title) setVideoTitle(stage3.heroCard.title);
        if (stage3.heroCard.category) setVideoCategory(stage3.heroCard.category);
        if (stage3.heroCard.description) setVideoDescription(stage3.heroCard.description);
        const resolvedEnabled = stage3.heroCard.isVideoEnabled !== undefined
          ? stage3.heroCard.isVideoEnabled
          : (resolvedMediaType !== "image");
        setVideoEnabled(resolvedEnabled);
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

  // Derived YouTube ID and Google Drive ID for live preview
  const previewYouTubeId = extractYouTubeId(videoUrlInput);
  const previewGDriveId = extractGoogleDriveId(flagshipGDriveUrl);

  // Handlers for Flagship Video Showcase
  const handleSaveVideo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let computedYtId = "";
    let computedGdId = "";

    if (flagshipMediaType === "youtube") {
      computedYtId = extractYouTubeId(videoUrlInput);
      if (videoUrlInput.trim() && !computedYtId) {
        showToast(
          tx(
            "Peringatan: Format URL YouTube tidak valid. Mohon periksa kembali.",
            "Warning: Invalid YouTube URL format. Please check again.",
            "Paringatan: Format URL YouTube indak sah. Tolong pareso baliak."
          )
        );
        return;
      }
    } else if (flagshipMediaType === "gdrive") {
      computedGdId = extractGoogleDriveId(flagshipGDriveUrl);
      if (flagshipGDriveUrl.trim() && !computedGdId) {
        showToast(
          tx(
            "Peringatan: Format Link Google Drive tidak valid. Mohon periksa kembali.",
            "Warning: Invalid Google Drive link format. Please check again.",
            "Paringatan: Format Tautan Google Drive indak sah. Tolong pareso baliak."
          )
        );
        return;
      }
    }

    const isVideoMode = flagshipMediaType === "youtube" || flagshipMediaType === "gdrive";
    const effectiveVideoEnabled = isVideoMode ? (videoEnabled || Boolean(computedGdId || computedYtId)) : false;
    if (isVideoMode && !videoEnabled) {
      setVideoEnabled(true);
    }

    await updateStage3Video({
      mediaType: flagshipMediaType,
      youtubeUrl: flagshipMediaType === "youtube" ? videoUrlInput.trim() : "",
      videoId: flagshipMediaType === "youtube" ? computedYtId : "",
      gdriveUrl: flagshipMediaType === "gdrive" ? flagshipGDriveUrl.trim() : "",
      gdriveId: flagshipMediaType === "gdrive" ? computedGdId : "",
      image: flagshipImageUrl.trim(),
      title: videoTitle.trim(),
      category: videoCategory.trim(),
      description: videoDescription.trim(),
      headline: videoHeadline.trim(),
      classTag: videoClassTag.trim(),
      isVideoEnabled: effectiveVideoEnabled,
    });

    showToast(
      tx(
        "Berhasil! Semua pengaturan Flagship Showcase telah disimpan dan aktif.",
        "Success! Flagship Showcase settings saved and live.",
        "Barasil! Kasadonyo pangaturan Flagship Showcase lah disimpan jo aktif."
      )
    );
  };

  const handleRemoveVideo = async () => {
    const confirmMsg = tx(
      "Apakah Anda yakin ingin menghapus media (video & gambar) dari Flagship Showcase?",
      "Are you sure you want to remove the media (video & image) from Flagship Showcase?",
      "Apakao Sanak yakin nio mahapuih media (video & gambar) dari Flagship Showcase?"
    );
    if (window.confirm(confirmMsg)) {
      moveToTrash({
        originalId: "stage3-flagship-video",
        type: "flagship-video",
        title: stage3.heroCard.title || "Flagship Showcase Media",
        subtitle: stage3.heroCard.category || "VISUAL CRAFT | DIGITAL | AI",
        previewImage: flagshipImageUrl || stage3.heroCard.image || "",
        mediaType: stage3.heroCard.mediaType || "image",
        payload: { stage3: JSON.parse(JSON.stringify(stage3)) },
      });
      await removeStage3Video();
      setVideoUrlInput("");
      setFlagshipGDriveUrl("");
      setFlagshipImageUrl("");
      setFlagshipMediaType("image");
      setVideoEnabled(false);
      await clearStage3ImageFromDB();
      showToast(
        tx(
          "Media Flagship Showcase berhasil dihapus dan dipindahkan ke Tong Sampah.",
          "Flagship Showcase media removed and moved to Recycle Bin.",
          "Media Flagship Showcase barasil dihapuih jo dipindahan ka Tong Sarok."
        )
      );
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
    const client = clients.find((c) => c.id === clientId);
    const work = client?.works?.find((w) => w.id === workId);
    const confirmMsg = tx(
      `Pindahkan karya "${workTitle}" ke Tong Sampah?`,
      `Move work "${workTitle}" to Recycle Bin?`,
      `Pindahkan karya "${workTitle}" ka Tong Sarok?`
    );
    if (window.confirm(confirmMsg)) {
      if (work) {
        moveToTrash({
          originalId: workId,
          type: "client-work",
          title: workTitle || work.title || "Untitled Work",
          subtitle: `${tx("Folder Klien", "Client Folder", "Folder Klien")}: ${client?.clientName || clientId}`,
          previewImage: work.image,
          mediaType: "image",
          payload: { clientId, work },
        });
      }
      deleteClientWork(clientId, workId);
      showToast(
        tx(
          `"${workTitle}" dipindahkan ke Tong Sampah. Bisa dipulihkan kapan saja.`,
          `"${workTitle}" moved to Recycle Bin. Can be restored anytime.`,
          `"${workTitle}" dipindahan ka Tong Sarok. Bisa dipuliahan bilo se.`
        )
      );
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
    const confirmMsg = tx(
      `Pindahkan folder "${client.clientName}" beserta semua isinya ke Tong Sampah?`,
      `Move folder "${client.clientName}" and all contents to Recycle Bin?`,
      `Pindahkan folder "${client.clientName}" sarato kasadonyo isinyo ka Tong Sarok?`
    );
    if (window.confirm(confirmMsg)) {
      moveToTrash({
        originalId: client.id,
        type: "client-folder",
        title: client.clientName,
        subtitle: `${client.works?.length || 0} ${tx("karya di dalamnya", "works inside", "karya di dalamnyo")}`,
        previewImage: client.works?.[0]?.image || client.logo || "",
        payload: { client },
      });
      deleteClientFolder(client.id);
      if (selectedClientId === client.id && clients.length > 1) {
        setSelectedClientId(clients.find((c) => c.id !== client.id)?.id || clients[0].id);
      }
      showToast(
        tx(
          `Folder "${client.clientName}" dipindahkan ke Tong Sampah. Bisa dipulihkan kapan saja.`,
          `Folder "${client.clientName}" moved to Recycle Bin. Can be restored anytime.`,
          `Folder "${client.clientName}" dipindahan ka Tong Sarok. Bisa dipuliahan bilo se.`
        )
      );
    }
  };

  // Handler: Replace cover image for client
  const handleReplaceCoverImage = (clientId: string, file: File) => {
    const targetClient = clients.find((c) => c.id === clientId);
    if (!targetClient) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (!raw) return;

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxW = 1920;
        const maxH = 1080;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/webp", 0.85);

          if (targetClient.works && targetClient.works.length > 0) {
            const firstWork = targetClient.works[0];
            updateClientWork(clientId, { ...firstWork, image: compressed });
          } else {
            addClientWork(clientId, {
              id: `${clientId}-cover-${Date.now()}`,
              title: `${targetClient.clientName} Cover`,
              type: "Brand Deliverable",
              image: compressed,
              aspect: "16:9",
              brand: targetClient.clientName,
              year: new Date().getFullYear().toString(),
            });
          }
          showToast(tx("Cover karya berhasil diperbarui!", "Cover replaced successfully!"));
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
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

  const { resetToDefaults: resetMotionTheme, themeMode, socialContacts, primaryColor } = useMotionTheme();
  const isLight = themeMode === "light";

  const handleTopBarSave = async () => {
    switch (sidebarTab) {
      case "hero-banner":
        await handleSaveHeroBanner();
        break;
      case "hero-works":
        await handleSaveHeroWorks();
        break;
      case "flagship":
        await handleSaveVideo();
        break;
      case "runner":
        await handleSavePortfolioRunner();
        break;
      case "about":
        handleSaveAbout({ preventDefault: () => {} } as any);
        break;
      case "clients":
        if (clientsWorkspaceView === "logos") {
          await handleSaveClientLogos();
        } else {
          showToast(tx("Data folder & portofolio berhasil disimpan & disinkronkan!", "Client folder & portfolio changes saved & synced!"));
        }
        break;
      case "social":
        await saveSocialContacts(socialContacts);
        showToast(tx("Pengaturan kontak & sosmed berhasil disimpan & disinkronkan ke Cloud!", "Contact & social settings saved & synced to Cloud!"));
        break;
      case "motion":
        showToast(tx("Pengaturan motion & kursor berhasil disimpan!", "Motion & cursor settings saved!"));
        break;
      case "theme":
        showToast(tx("Skema warna tampilan berhasil disimpan!", "Color scheme & theme saved!"));
        break;
      case "settings":
        await handleSaveAccount({ preventDefault: () => {} } as any);
        break;
      default:
        showToast(tx("Perubahan berhasil disimpan & disinkronkan ke web!", "Changes saved and synced to web!"));
    }
  };

  const handleTopBarReset = async () => {
    switch (sidebarTab) {
      case "hero-banner":
        await handleResetHeroBannerDefault();
        break;
      case "runner":
        await handleResetPortfolioRunnerDefault();
        break;
      case "about":
        handleResetAbout();
        break;
      case "hero-works":
        updateHeroWorksData(defaultHeroWorksData);
        showToast(tx("Hero & Selected Works dikembalikan ke default!", "Hero & Selected Works reset to default!"));
        break;
      case "motion":
      case "theme":
        resetMotionTheme();
        showToast(tx("Pengaturan berhasil dikembalikan ke default!", "Settings successfully reset to default!"));
        break;
      case "settings":
        handleFullReset();
        break;
      default:
        showToast(tx("Bagian ini sudah menggunakan konfigurasi aktif bawaan.", "This section is already using active default configuration."));
    }
  };

  const getMobileTabTitle = (tab: AdminSidebarTab) => {
    switch (tab) {
      case "hero-banner":
        return tx("Banner Utama (Scrolly)", "Hero Banner (Scrolly)", "Banner Utamo (Scrolly)");
      case "hero-works":
        return tx("Hero & Karya Unggulan", "Hero & Selected Works", "Hero & Karya Tapiliah");
      case "flagship":
        return tx("Pameran Media Reels", "Media Reels Showcase", "Pameran Media Reels");
      case "clients":
        return tx("Portofolio & Klien", "Portfolio & Clients", "Portofolio & Klien");
      case "crm":
        return tx("CRM & Prospek Leads", "CRM & Leads", "CRM & Prospek Leads");
      case "seo":
        return tx("SEO Google & Mesin Pencari", "Google SEO", "SEO Google");
      case "theme":
        return tx("Warna & Tema UI", "Theme & Colors", "Warna & Tema UI");
      case "social":
        return tx("Kontak WhatsApp & Sosmed", "Contacts & Socials", "Kontak WhatsApp & Sosmed");
      case "motion":
        return tx("Motion & Efek Gerak", "Motion Effects", "Motion & Garakan");
      case "trash":
        return tx("Tong Sampah (Recycle Bin)", "Recycle Bin", "Tong Sarok");
      case "storage":
        return tx("Penyimpanan & Kapasitas", "Storage & Analytics", "Panyimpanan & Kapasitas");
      case "runner":
        return tx("Portofolio Berjalan (4:5)", "Running Portfolio", "Portofolio Baguliah");
      case "about":
        return tx("Tentang Saya (About Me)", "About Me", "Tantang Ambo");
      case "settings":
        return tx("Setting Admin & Keamanan", "Admin Security & Settings", "Setting Admin & Kaamanan");
      default:
        return tab;
    }
  };

  return (
    <div
      id="admin-dashboard"
      style={viewportBottomOffset > 0 ? { bottom: `${viewportBottomOffset}px` } : undefined}
      className={`admin-dashboard-root fixed inset-0 z-50 flex h-screen w-screen overflow-hidden font-sans select-none ${
        isLight ? "bg-slate-50 text-slate-800" : "bg-[#08090a] text-neutral-200"
      }`}
    >
      <MetaSEO isAdmin={true} />
      {/* Desktop Far Left Sidebar (240px wide) */}
      <div className="hidden md:flex h-full shrink-0">
        <AdminSidebar
          activeTab={sidebarTab}
          onSelectTab={(tab) => {
            setSidebarTab(tab);
            setActiveTab(tab as any);
          }}
          storageUsed="18.4"
          storageTotal="100"
          adminName={adminUser === "admin" ? "Rizx Studio" : adminUser}
          totalWorks={clients.reduce((acc, c) => acc + (c.works?.length || 0), 0)}
          totalClients={clients.length}
          trashCount={trashItems.length}
          onOpenProfileMenu={() => setSidebarTab("settings")}
        />
      </div>

      {/* Mobile Native App Experience (< 768px, Reference Mockup UI/UX) */}
      <div className={`${mobileScreen === "home" ? "flex" : "hidden"} md:hidden h-full w-full overflow-hidden`}>
        <MobileAdminApp
          activeTab={sidebarTab}
          onSelectTab={(tab) => {
            setSidebarTab(tab);
            setActiveTab(tab as any);
            setMobileScreen("workspace");
          }}
          clients={clients}
          selectedClientId={selectedClientId}
          onSelectClient={(id) => setSelectedClientId(id)}
          clientsWorkspaceView={clientsWorkspaceView}
          onWorkspaceViewChange={setClientsWorkspaceView}
          totalWorks={clients.reduce((acc, c) => acc + (c.works?.length || 0), 0)}
          trashCount={trashItems.length}
          onLogout={adminLogout}
          onTopBarSave={handleTopBarSave}
          onTopBarReset={handleTopBarReset}
          isCloudSyncActive={isCloudSyncActive}
          adminUser={adminUser === "admin" ? "FOMY R" : adminUser}
          onOpenAddFolder={() => setIsAddFolderOpen(true)}
          onOpenEditFolder={handleOpenEditFolder}
          onDeleteFolder={handleDeleteFolder}
          onOpenUploadWork={() => setIsUploadModalOpen(true)}
          onOpenEditWork={handleOpenEditWork}
          onDeleteWork={handleDeleteWork}
          onSaveClientDescription={(id, desc, tools) => {
            updateClientDescription(id, desc, tools);
          }}
          onUpdateClientFolder={(id, updates) => {
            const c = clients.find((item) => item.id === id);
            if (c) {
              updateClientFolder(id, {
                clientName: updates.clientName || c.clientName,
                category: updates.category !== undefined ? updates.category : c.category,
                logo: updates.logo !== undefined ? updates.logo : (c.logo || ""),
              });
            }
          }}
          onReplaceCoverImage={handleReplaceCoverImage}
          showToast={showToast}
          clSubtitle={clSubtitle}
          setClSubtitle={setClSubtitle}
          clLogos={clLogos}
          setClLogos={setClLogos}
          newLogoName={newLogoName}
          setNewLogoName={setNewLogoName}
          newLogoRow={newLogoRow}
          setNewLogoRow={setNewLogoRow}
          newLogoFile={newLogoFile}
          setNewLogoFile={setNewLogoFile}
        />
      </div>

      {/* Main Workspace Column (Desktop & Tablet >= 768px, and Mobile when mobileScreen === "workspace") */}
      <div className={`${mobileScreen === "workspace" ? "flex" : "hidden md:flex"} flex-1 flex-col h-full min-w-0 overflow-hidden relative ${
        isLight ? "bg-slate-50 text-slate-800" : "bg-[#0d0f13] text-neutral-200"
      }`}>
        {/* Mobile Workspace Top Navigation Bar (Only visible on mobile when inside workspace) */}
        <div className={`flex md:hidden px-4 py-3 border-b items-center justify-between shrink-0 z-30 ${
          isLight ? "bg-white border-slate-200" : "bg-[#0d1017] border-white/10"
        }`}>
          <button
            type="button"
            onClick={() => setMobileScreen("home")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 text-white"
            }`}
          >
            <RiArrowLeftLine className="w-4 h-4" />
            <span>{tx("Beranda", "Home", "Barando")}</span>
          </button>

          <span className="text-xs font-bold tracking-tight truncate max-w-[170px]">
            {getMobileTabTitle(sidebarTab)}
          </span>

          <button
            type="button"
            onClick={handleTopBarSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <RiSave3Fill className="w-3.5 h-3.5" />
            <span>{tx("Simpan", "Save", "Simpan")}</span>
          </button>
        </div>

        {/* Desktop Top Header Bar (Only visible on md+) */}
        <div className="hidden md:block shrink-0">
          <AdminTopBar
            searchQuery={globalSearchQuery}
            onSearchChange={(q) => setGlobalSearchQuery(q)}
            onViewWebsite={() => {
              if (typeof window !== "undefined") {
                window.open("/", "_blank");
              }
            }}
            onLogout={adminLogout}
            isCloudSyncActive={isCloudSyncActive}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
            clients={clients}
            clLogos={clLogos}
            onSelectClient={(id) => {
              setSelectedClientId(id);
              setSidebarTab("clients");
              setClientsWorkspaceView("folders");
              showToast("Membuka folder klien");
            }}
            onSelectTab={(tab) => {
              setSidebarTab(tab);
            }}
            onOpenLogosTab={() => {
              setSidebarTab("clients");
              setClientsWorkspaceView("logos");
              showToast("Membuka Partner Logos Marquee");
            }}
            onResetDefault={handleTopBarReset}
            onSaveChanges={handleTopBarSave}
            showResetDefault={sidebarTab !== "trash" && sidebarTab !== "storage" && sidebarTab !== "crm"}
            showSaveChanges={sidebarTab !== "trash" && sidebarTab !== "storage"}
          />
        </div>

        {/* Dynamic Workspace Canvas */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative pb-20 md:pb-0">
          {/* 1. Clients Studio OS Workspace (Matches User's Mockup) */}
          {sidebarTab === "clients" && (
            <ClientsWorkspace
              clients={clients}
              selectedClientId={selectedClientId}
              workspaceView={clientsWorkspaceView}
              onWorkspaceViewChange={setClientsWorkspaceView}
              onSelectClient={(id) => setSelectedClientId(id)}
              onOpenAddFolder={() => setIsAddFolderOpen(true)}
              onOpenEditFolder={handleOpenEditFolder}
              onDeleteFolder={handleDeleteFolder}
              onOpenUploadWork={() => setIsUploadModalOpen(true)}
              onOpenEditWork={handleOpenEditWork}
              onDeleteWork={handleDeleteWork}
              onSaveClientDescription={(id, desc, tools) => {
                updateClientDescription(id, desc, tools);
              }}
              onUpdateClientFolder={(id, updates) => {
                const c = clients.find((item) => item.id === id);
                if (c) {
                  updateClientFolder(id, {
                    clientName: updates.clientName || c.clientName,
                    category: updates.category !== undefined ? updates.category : c.category,
                    logo: updates.logo !== undefined ? updates.logo : (c.logo || ""),
                  });
                }
              }}
              onReplaceCoverImage={handleReplaceCoverImage}
              onViewWebsite={() => {
                if (typeof window !== "undefined") {
                  window.open("/", "_blank");
                }
              }}
              showToast={showToast}
              clSubtitle={clSubtitle}
              setClSubtitle={setClSubtitle}
              clLogos={clLogos}
              setClLogos={setClLogos}
              newLogoName={newLogoName}
              setNewLogoName={setNewLogoName}
              newLogoRow={newLogoRow}
              setNewLogoRow={setNewLogoRow}
              newLogoFile={newLogoFile}
              setNewLogoFile={setNewLogoFile}
              onAddClientLogo={handleAddClientLogo}
              onDeleteClientLogo={handleDeleteClientLogo}
              onSaveClientLogos={handleSaveClientLogos}
              onCancelClientLogos={handleCancelClientLogos}
              onGenericImageFile={handleGenericImageFile}
            />
          )}

          {/* 3. Recycle Bin / Tong Sampah & System Restore */}
          {sidebarTab === "trash" && (
            <RecycleBinWorkspace showToast={showToast} />
          )}

          {/* 4. Storage Capacity, Animated Data Graphics & Resource Library */}
          {(sidebarTab === "storage" || sidebarTab === "resources") && (
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
              {/* Sub-view Switcher Header */}
              <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between gap-3 shrink-0 ${
                isLight ? "bg-white border-slate-200/90" : "bg-[#0a0c10] border-white/5"
              }`}>
                <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs font-mono ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900 border border-white/10"
                }`}>
                  <button
                    type="button"
                    onClick={() => setStorageSubTab("analytics")}
                    className={`py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      storageSubTab === "analytics"
                        ? "bg-[#16b09f] text-black shadow-md shadow-[#16b09f]/30"
                        : isLight
                          ? "text-slate-600 hover:text-slate-900"
                          : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <HiChartPie className="w-3.5 h-3.5" />
                    <span>{tx("Grafik & Alokasi Data", "Storage Analytics", "Grafik & Panyimpanan")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStorageSubTab("resources")}
                    className={`py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      storageSubTab === "resources"
                        ? "bg-[#16b09f] text-black shadow-md shadow-[#16b09f]/30"
                        : isLight
                          ? "text-slate-600 hover:text-slate-900"
                          : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <HiSquare3Stack3D className="w-3.5 h-3.5" />
                    <span>{tx("Resource Library", "Resource Library", "Gudang Aset Media")}</span>
                  </button>
                </div>

                <span className={`text-[11px] font-mono hidden sm:inline ${isLight ? "text-slate-500 font-medium" : "text-neutral-500"}`}>
                  {storageSubTab === "analytics"
                    ? tx("Visualisasi memori & donat interaktif", "Memory usage & interactive gauge", "Visualisasi memori & grafik donat")
                    : tx("Eksplorasi visual karya & logo partner", "Visual explorer for works & logos", "Eksplorasi karya & logo")}
                </span>
              </div>

              {/* View 1: Animated Storage Analytics */}
              {storageSubTab === "analytics" ? (
                <StorageAnalyticsView
                  showToast={showToast}
                  onNavigateToTrash={() => setSidebarTab("trash")}
                />
              ) : (
                /* View 2: Resource Library */
                <ResourceLibrary
                  clients={clients}
                  clLogos={clLogos}
                  onSelectClientFolder={(id) => {
                    setSelectedClientId(id);
                    setSidebarTab("clients");
                  }}
                  onOpenUploadWork={() => setIsUploadModalOpen(true)}
                  onDeleteWork={handleDeleteWork}
                  showToast={showToast}
                />
              )}
            </div>
          )}

          {/* 5. Motion Scroll & Mouse Follower Settings */}
          {sidebarTab === "motion" && (
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${
              isLight ? "bg-slate-50 text-slate-800" : "bg-[#0d0f13] text-neutral-200"
            }`}>
              <MotionEffectsWorkspace />
            </div>
          )}

          {/* 6. Dynamic Theme & Color Picker */}
          {sidebarTab === "theme" && (
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${
              isLight ? "bg-slate-50 text-slate-800" : "bg-[#0d0f13] text-neutral-200"
            }`}>
              <ThemeColorWorkspace />
            </div>
          )}

          {/* 7. Contact & Social Media Configuration */}
          {sidebarTab === "social" && (
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${
              isLight ? "bg-slate-50 text-slate-800" : "bg-[#0d0f13] text-neutral-200"
            }`}>
              <SocialContactsWorkspace />
            </div>
          )}

          {/* 8. CRM Telemetry & Leads Analytics */}
          {sidebarTab === "crm" && (
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${
              isLight ? "bg-slate-50 text-slate-800" : "bg-[#0d0f13] text-neutral-200"
            }`}>
              <CrmAnalyticsView />
            </div>
          )}

          {/* 8.5. SEO & Search Engine Management */}
          {sidebarTab === "seo" && (
            <div className={`flex-1 overflow-y-auto ${
              isLight ? "bg-slate-50 text-slate-800" : "bg-[#0b0f19] text-neutral-200"
            }`}>
              <SeoWorkspace />
            </div>
          )}

          {/* 9. All Other Real Portfolio Admin Sections */}
          {sidebarTab !== "clients" &&
            sidebarTab !== "resources" &&
            sidebarTab !== "trash" &&
            sidebarTab !== "storage" &&
            sidebarTab !== "motion" &&
            sidebarTab !== "theme" &&
            sidebarTab !== "social" &&
            sidebarTab !== "crm" &&
            sidebarTab !== "seo" && (
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${
              isLight ? "bg-slate-50 text-slate-800" : "bg-[#0d0f13] text-neutral-200"
            }`}>
              <div className="max-w-6xl mx-auto space-y-6">
                {/* ========================================================
                    TAB 1: HERO BANNER SCROLLYTELLING MANAGEMENT
                   ======================================================== */}
                {sidebarTab === "hero-banner" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header Explainer */}
            <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}>
              <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}>
                SECTION CONTROL: HERO BANNER UTAMA (CANVAS SCROLLYTELLING)
              </span>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {tx("Editor Teks Hero Banner & Scrollytelling", "Hero Banner & Scrollytelling Text Editor")}
              </h2>
              <p className={`text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                {tx("Sesuaikan nama utama, profesi/peran, serta teks narasi scrollytelling yang tampil saat pengunjung membuka website dan menggulir ke bawah.", "Customize the primary hero name, role/subtitle, and scrollytelling narrative paragraphs that appear as visitors scroll through the top section.")}
              </p>
            </div>

            {/* Live Visual Preview Mockup */}
            <div className={`hero-preview-mockup p-6 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[200px] shadow-2xl relative overflow-hidden ${
              isLight
                ? "bg-gradient-to-b from-slate-100 via-white to-slate-50 border-slate-200 shadow-slate-200/60"
                : "bg-gradient-to-b from-neutral-950 via-neutral-900 to-black border-white/15 shadow-2xl"
            }`}>
              <div className={`absolute top-3 left-4 text-[10px] font-mono uppercase tracking-widest ${
                isLight ? "text-slate-500" : "text-neutral-500"
              }`}>
                {tx("Live Preview Hero", "Hero Live Preview")}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-1" style={{ color: hbNameColor }}>
                {hbName || "Fomy R"}<span className={isLight ? "text-slate-400 font-normal" : "text-neutral-500 font-normal"}>.</span>
              </h1>
              <p className="text-xs sm:text-sm font-mono tracking-widest mt-1" style={{ color: hbRoleColor }}>
                {hbRole || "AI-Powered Creative Designer"}
              </p>
              <div className="flex flex-col items-center gap-1.5 mt-5">
                <div className={`w-4 h-6 rounded-full border flex justify-center pt-1 ${
                  isLight ? "border-slate-400" : "border-neutral-500"
                }`}>
                  <span className={`w-1 h-1.5 rounded-full animate-bounce ${
                    isLight ? "bg-slate-500" : "bg-neutral-400"
                  }`} />
                </div>
                <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: hbScrollTextColor }}>
                  {hbScrollText || "SCROLL"}
                </span>
              </div>
            </div>

            {/* ========================================================
                KONTROL SEQUENCE FOTO HERO (CANVAS SCROLLYTELLING)
               ======================================================== */}
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-6 ${
              isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0e0f14] border border-white/10"
            }`}>
              {/* Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                isLight ? "border-slate-100" : "border-white/10"
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <HiPhoto className="w-5 h-5 text-[#16b09f]" />
                    <h3 className={`text-base sm:text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {tx("Sequence Foto Hero Banner (3D Canvas Scrollytelling)", "Hero Banner Photo Sequence (3D Canvas Scrollytelling)")}
                    </h3>
                  </div>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {tx("Kelola dan update rangkaian foto portrait / visual hero yang berputar mulus saat pengunjung menggulir layar.", "Manage and update the sequence of portrait / visual photos that smoothly rotate as visitors scroll.")}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                      hbSeqMode === "default"
                        ? isLight
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : "bg-neutral-800 text-neutral-300 border border-white/10"
                        : "bg-[#16b09f]/20 text-[#16b09f] border border-[#16b09f]/40"
                    }`}
                  >
                    {hbSeqMode === "default"
                      ? tx("Mode: Bawaan (121 Frame)", "Mode: Default (121 Frames)")
                      : hbSeqMode === "custom"
                      ? tx(`Mode: Upload Kustom (${activeScrubberFrames.length} Frame)`, `Mode: Custom Upload (${activeScrubberFrames.length} Frames)`)
                      : tx(`Mode: Folder (${activeScrubberFrames.length} Frame)`, `Mode: Folder (${activeScrubberFrames.length} Frames)`)}
                  </span>

                  {hbSeqMode !== "default" && (
                    <button
                      type="button"
                      onClick={handleResetSequenceDefault}
                      className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <HiArrowPath className="w-3 h-3" />
                      <span>{tx("Reset ke Bawaan", "Reset Default")}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Scrubber & Frame Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left/Main: Visual Canvas Scrubber */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/15 flex items-center justify-center shadow-xl group">
                    {activeScrubberFrames.length > 0 ? (
                      <img
                        src={activeScrubberFrames[Math.min(seqScrubIdx, Math.max(0, activeScrubberFrames.length - 1))]}
                        alt="Sequence frame preview"
                        className="w-full h-full object-cover select-none"
                      />
                    ) : (
                      <div className="text-center p-6 text-neutral-500 font-mono text-xs">
                        {tx("Belum ada frame foto", "No frames loaded")}
                      </div>
                    )}

                    {/* Ambient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                    {/* Frame Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-1.5 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
                      <span>
                        FRAME {Math.min(seqScrubIdx + 1, activeScrubberFrames.length)} / {activeScrubberFrames.length}
                      </span>
                    </div>

                    {/* Play/Pause Autoplay Button */}
                    <button
                      type="button"
                      onClick={() => setSeqIsAutoPlaying(!seqIsAutoPlaying)}
                      className="absolute top-3 right-3 px-3 py-1 rounded-md bg-black/75 hover:bg-neutral-800 text-white text-[10px] font-mono font-semibold border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {seqIsAutoPlaying ? (
                        <>
                          <HiPause className="w-3.5 h-3.5 text-[#16b09f]" />
                          <span>PAUSE</span>
                        </>
                      ) : (
                        <>
                          <HiPlay className="w-3.5 h-3.5 text-[#16b09f]" />
                          <span>PLAY PREVIEW</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scrubber Range Slider Control */}
                  <div className={`flex flex-col gap-1.5 p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-900/60 border border-white/10"
                  }`}>
                    <div className={`flex items-center justify-between text-[10px] font-mono ${
                      isLight ? "text-slate-600" : "text-neutral-400"
                    }`}>
                      <span>0% (Awal)</span>
                      <span className="text-[#16b09f] font-semibold">
                        {tx("Geser slider untuk memutar preview sequence", "Scrub slider to rotate sequence preview")}
                      </span>
                      <span>100% (Akhir)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, activeScrubberFrames.length - 1)}
                      value={seqScrubIdx}
                      onChange={(e) => {
                        setSeqScrubIdx(Number(e.target.value));
                        setSeqIsAutoPlaying(false);
                      }}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#16b09f] ${
                        isLight ? "bg-slate-200" : "bg-neutral-800"
                      }`}
                    />
                  </div>
                </div>

                {/* Right: Upload & Setting Panel */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  {/* Mode Tabs */}
                  <div className={`flex p-1 rounded-xl border ${
                    isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-950 border border-white/10"
                  }`}>
                    <button
                      type="button"
                      onClick={() => setSeqActiveTab("upload")}
                      className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                        seqActiveTab === "upload"
                          ? "bg-[#16b09f] text-black font-bold shadow-sm"
                          : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {tx("1. Upload File Foto", "1. Batch File Upload")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeqActiveTab("folder")}
                      className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                        seqActiveTab === "folder"
                          ? "bg-[#16b09f] text-black font-bold shadow-sm"
                          : isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {tx("2. Folder & Pattern", "2. Folder & Pattern")}
                    </button>
                  </div>

                  {/* TAB 1: UPLOAD BATCH FOTO */}
                  {seqActiveTab === "upload" && (
                    <div className={`flex-1 flex flex-col justify-between p-4 rounded-xl border space-y-3 ${
                      isLight ? "bg-slate-50/90 border-slate-200" : "bg-neutral-950/70 border border-white/10"
                    }`}>
                      <div>
                        <span className={`text-xs font-semibold block ${isLight ? "text-slate-900" : "text-white"}`}>
                          {tx("Pilih Rangkaian Foto Sequence Baru", "Select Sequence Photo Frames")}
                        </span>
                        <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                          {tx("Pilih banyak file foto sekaligus (format JPG, PNG, atau WebP). Sistem akan otomatis mengurutkan nama file secara natural (frame_000, frame_001, dst).", "Select multiple image files (JPG, PNG, or WebP). Files will be naturally sorted by name.")}
                        </p>
                      </div>

                      <input
                        ref={seqFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleSelectSequenceFiles}
                        className="hidden"
                      />

                      <div
                        onClick={() => seqFileInputRef.current?.click()}
                        className={`p-4 rounded-xl border border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                          isLight
                            ? "border-slate-300 hover:border-[#16b09f] bg-white hover:bg-slate-50/80"
                            : "border-white/20 hover:border-[#16b09f]/60 bg-neutral-900/40 hover:bg-neutral-900/80"
                        }`}
                      >
                        <HiArrowUpTray className="w-6 h-6 text-[#16b09f] group-hover:scale-110 transition-transform" />
                        <div>
                          <span className={`text-xs font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                            {seqSelectedFiles.length > 0
                              ? tx(`${seqSelectedFiles.length} file dipilih (klik untuk ganti)`, `${seqSelectedFiles.length} files selected (click to change)`)
                              : tx("Klik untuk memilih file foto sequence", "Click to select sequence photos")}
                          </span>
                          <span className={`text-[10px] font-mono block mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                            {tx("Bisa pilih 10 s/d 121+ file foto", "Can select 10 to 121+ frames")}
                          </span>
                        </div>
                      </div>

                      {seqUploadMsg && (
                        <div className={`p-2.5 rounded-lg border text-[11px] font-mono ${
                          isLight ? "bg-slate-100 border-slate-200 text-teal-700" : "bg-neutral-900 border-white/10 text-[#16b09f]"
                        }`}>
                          {seqUploadMsg}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleUploadSequenceBatch}
                        disabled={seqSelectedFiles.length === 0 || seqIsUploading}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#16b09f] hover:bg-[#119889] disabled:opacity-40 disabled:hover:bg-[#16b09f] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#16b09f]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        {seqIsUploading ? (
                          <>
                            <HiArrowPath className="w-4 h-4 animate-spin" />
                            <span>{tx("Mengupload Sequence...", "Uploading Sequence...")}</span>
                          </>
                        ) : (
                          <>
                            <HiCheck className="w-4 h-4" />
                            <span>{tx("Upload & Terapkan Sequence Foto", "Upload & Apply Sequence")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* TAB 2: FOLDER & PATTERN CONFIGURATION */}
                  {seqActiveTab === "folder" && (
                    <div className={`flex-1 flex flex-col justify-between p-4 rounded-xl border space-y-3 ${
                      isLight ? "bg-slate-50/90 border-slate-200" : "bg-neutral-950/70 border border-white/10"
                    }`}>
                      <div>
                        <span className={`text-xs font-semibold block ${isLight ? "text-slate-900" : "text-white"}`}>
                          {tx("Konfigurasi Path Folder / URL", "Folder Path / URL Configuration")}
                        </span>
                        <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                          {tx("Arahkan ke folder static atau CDN hosting rangkaian frame foto.", "Point to a static folder or CDN hosting image sequence frames.")}
                        </p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className={`text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                            Folder / Base URL
                          </label>
                          <input
                            type="text"
                            value={hbSeqFolder}
                            onChange={(e) => setHbSeqFolder(e.target.value)}
                            placeholder="/sequence"
                            className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                              File Pattern
                            </label>
                            <input
                              type="text"
                              value={hbSeqPattern}
                              onChange={(e) => setHbSeqPattern(e.target.value)}
                              placeholder="frame_{padded}.webp"
                              className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                                isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                              Total Frame
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={300}
                              value={hbSeqTotal}
                              onChange={(e) => setHbSeqTotal(Number(e.target.value))}
                              className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                                isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                              Zero Padding
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={hbSeqPadding}
                              onChange={(e) => setHbSeqPadding(Number(e.target.value))}
                              placeholder="6"
                              className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                                isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`text-[11px] font-mono block mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                              Start Index
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={1}
                              value={hbSeqStart}
                              onChange={(e) => setHbSeqStart(Number(e.target.value))}
                              placeholder="0"
                              className={`w-full px-3 py-1.5 rounded-lg border font-mono text-xs focus:border-[#16b09f] focus:outline-none ${
                                isLight ? "bg-white border-slate-200 text-slate-900" : "bg-neutral-900 border-white/15 text-white"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyFolderConfig}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                          isLight
                            ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                            : "bg-neutral-800 hover:bg-neutral-700 text-white border-white/15"
                        }`}
                      >
                        <HiCheck className="w-4 h-4 text-[#16b09f]" />
                        <span>{tx("Terapkan Folder & Muat Sequence", "Apply Folder & Load Sequence")}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* MOUSE TRACKING TOGGLE & INTENSITY CONTROL */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isLight ? "bg-slate-50 border-slate-200/90" : "bg-neutral-900/50 border border-white/10"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#16b09f]/15 border border-[#16b09f]/30 flex items-center justify-center text-[#16b09f] shrink-0 mt-0.5">
                    <HiSparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                        {tx("Gerakan Mengikuti Kursor Mouse (Interactive Mouse Tracking)", "Interactive Mouse Tracking")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#16b09f]/20 text-[#16b09f] font-semibold">
                        {hbSeqMouseTracking ? (tx("AKTIF", "ENABLED")) : (tx("NONAKTIF", "DISABLED"))}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      {tx("Foto portrait di hero akan secara dinamis menoleh dan bergerak mengikuti arah gerakan kursor mouse dengan efek parallax 3D halus.", "Portrait photo smoothly turns and looks towards cursor movements with subtle 3D stereoscopic parallax.")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0 flex-wrap">
                  {hbSeqMouseTracking && (
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className={`text-[11px] ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        {tx("Sensitivitas:", "Sensitivity:")}
                      </span>
                      <select
                        value={hbSeqMouseIntensity}
                        onChange={(e) => setHbSeqMouseIntensity(Number(e.target.value))}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono focus:border-[#16b09f] focus:outline-none cursor-pointer ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-900"
                            : "bg-neutral-800 border-white/15 text-white"
                        }`}
                      >
                        <option value={14}>{tx("Halus (14 Frame)", "Subtle (14 Frames)")}</option>
                        <option value={26}>{tx("Sedang / Natural (26 Frame)", "Medium / Natural (26 Frames)")}</option>
                        <option value={38}>{tx("Lebar / Responsif (38 Frame)", "Wide / High (38 Frames)")}</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setHbSeqMouseTracking(!hbSeqMouseTracking)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      hbSeqMouseTracking
                        ? "bg-[#16b09f] text-black shadow-md shadow-[#16b09f]/30"
                        : isLight
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-white/10"
                    }`}
                  >
                    {hbSeqMouseTracking ? (tx("Aktif", "Enabled")) : (tx("Aktifkan", "Enable"))}
                  </button>
                </div>
              </div>
            </div>

            {/* Bagian 1: Identitas Hero Utama */}
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0e0f14] border border-white/10"
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isLight ? "border-slate-100" : "border-white/10"
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  <HiSparkles className="w-4 h-4 text-[#16b09f]" />
                  <span>{tx("Bagian 1: Identitas Hero Utama (Layar Pertama)", "Part 1: Primary Hero Identity (First Screen)")}</span>
                </h3>
                <span className={`text-[10px] font-mono uppercase ${
                  isLight ? "text-slate-500" : "text-neutral-500"
                }`}>Scroll 0% - 25%</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Main Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <label className={`text-xs font-mono font-semibold ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {tx("Nama Utama (Besar)", "Main Name (Large)")} *
                    </label>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                    }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                      <label
                        className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                          isLight ? "border-slate-300" : "border-white/30"
                        }`}
                        style={{ backgroundColor: hbNameColor }}
                        title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                      >
                        <input
                          type="color"
                          value={hbNameColor}
                          onChange={(e) => setHbNameColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={tx("Color Wheel", "Color Wheel")}
                        />
                      </label>
                      <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}>
                        {hbNameColor}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hbName}
                    onChange={(e) => setHbName(e.target.value)}
                    style={{ color: isLight ? "#0f172a" : hbNameColor }}
                    placeholder="Contoh: Fomy R"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] transition-colors ${
                      isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                    }`}
                  />
                  <p className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                    Tampil dengan ukuran font paling besar di tengah.
                  </p>
                </div>

                {/* 2. Role / Subtitle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <label className={`text-xs font-mono font-semibold ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {tx("Profesi / Subtitle Role", "Role / Subtitle")} *
                    </label>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                    }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                      <label
                        className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                          isLight ? "border-slate-300" : "border-white/30"
                        }`}
                        style={{ backgroundColor: hbRoleColor }}
                        title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                      >
                        <input
                          type="color"
                          value={hbRoleColor}
                          onChange={(e) => setHbRoleColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={tx("Color Wheel", "Color Wheel")}
                        />
                      </label>
                      <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}>
                        {hbRoleColor}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hbRole}
                    onChange={(e) => setHbRole(e.target.value)}
                    style={{ color: isLight ? "#0f172a" : hbRoleColor }}
                    placeholder="Contoh: AI-Powered Creative Designer"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] transition-colors ${
                      isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                    }`}
                  />
                  <p className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                    Teks di bawah nama utama dengan gaya font mono.
                  </p>
                </div>

                {/* 3. Scroll Indicator Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <label className={`text-xs font-mono font-semibold ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {tx("Teks Indikator Scroll", "Scroll Indicator Text")}
                    </label>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                    }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                      <label
                        className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                          isLight ? "border-slate-300" : "border-white/30"
                        }`}
                        style={{ backgroundColor: hbScrollTextColor }}
                        title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                      >
                        <input
                          type="color"
                          value={hbScrollTextColor}
                          onChange={(e) => setHbScrollTextColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={tx("Color Wheel", "Color Wheel")}
                        />
                      </label>
                      <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}>
                        {hbScrollTextColor}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hbScrollText}
                    onChange={(e) => setHbScrollText(e.target.value)}
                    style={{ color: isLight ? "#0f172a" : hbScrollTextColor }}
                    placeholder="Contoh: SCROLL atau GULIR"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] transition-colors ${
                      isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                    }`}
                  />
                  <p className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                    Teks di bawah ikon mouse berkedip.
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian 2: Teks Narasi Scroll Kiri (Fase 30% - 60%) */}
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0e0f14] border border-white/10"
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isLight ? "border-slate-100" : "border-white/10"
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  <HiTag className="w-4 h-4 text-cyan-400" />
                  <span>{tx("Bagian 2: Narasi Sisi Kiri (Fase Scroll 30% - 60%)", "Part 2: Left-Aligned Narrative (Scroll 30% - 60%)")}</span>
                </h3>
                <span className={`text-[10px] font-mono uppercase ${
                  isLight ? "text-slate-500" : "text-neutral-500"
                }`}>Scroll 30% - 60%</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sec 2 Headline Line 1 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <label className={`text-xs font-mono font-semibold ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {tx("Judul Baris 1", "Headline Line 1")}
                    </label>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                    }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                      <label
                        className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                          isLight ? "border-slate-300" : "border-white/30"
                        }`}
                        style={{ backgroundColor: hbSec2H1Color }}
                        title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                      >
                        <input
                          type="color"
                          value={hbSec2H1Color}
                          onChange={(e) => setHbSec2H1Color(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={tx("Color Wheel", "Color Wheel")}
                        />
                      </label>
                      <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}>
                        {hbSec2H1Color}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hbSec2H1}
                    onChange={(e) => setHbSec2H1(e.target.value)}
                    style={{ color: isLight ? "#0f172a" : hbSec2H1Color }}
                    placeholder="Contoh: Results-driven"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] transition-colors ${
                      isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                    }`}
                  />
                </div>

                {/* Sec 2 Headline Line 2 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <label className={`text-xs font-mono font-semibold ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {tx("Judul Baris 2 (Aksen)", "Headline Line 2 (Accent)")}
                    </label>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                    }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                      <label
                        className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                          isLight ? "border-slate-300" : "border-white/30"
                        }`}
                        style={{ backgroundColor: hbSec2H2Color }}
                        title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                      >
                        <input
                          type="color"
                          value={hbSec2H2Color}
                          onChange={(e) => setHbSec2H2Color(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={tx("Color Wheel", "Color Wheel")}
                        />
                      </label>
                      <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}>
                        {hbSec2H2Color}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hbSec2H2}
                    onChange={(e) => setHbSec2H2(e.target.value)}
                    style={{ color: isLight ? "#0f172a" : hbSec2H2Color }}
                    placeholder="Contoh: creative"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] transition-colors ${
                      isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                    }`}
                  />
                </div>
              </div>

              {/* Sec 2 Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <label className={`text-xs font-mono font-semibold ${
                    isLight ? "text-slate-700" : "text-neutral-300"
                  }`}>
                    {tx("Paragraf Deskripsi Sisi Kiri", "Left Description Paragraph")}
                  </label>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                    isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                  }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                    <label
                      className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                        isLight ? "border-slate-300" : "border-white/30"
                      }`}
                      style={{ backgroundColor: hbSec2BodyColor }}
                      title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                    >
                      <input
                        type="color"
                        value={hbSec2BodyColor}
                        onChange={(e) => setHbSec2BodyColor(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label={tx("Color Wheel", "Color Wheel")}
                      />
                    </label>
                    <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {hbSec2BodyColor}
                    </span>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={hbSec2Body}
                  onChange={(e) => setHbSec2Body(e.target.value)}
                  style={{ color: isLight ? "#0f172a" : hbSec2BodyColor }}
                  placeholder="Deskripsi keahlian dan pengalaman..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] leading-relaxed transition-colors ${
                    isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                  }`}
                />
              </div>
            </div>

            {/* Bagian 3: Teks Narasi Scroll Kanan (Fase 65% - 95%) */}
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0e0f14] border border-white/10"
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isLight ? "border-slate-100" : "border-white/10"
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  <HiTag className="w-4 h-4 text-purple-400" />
                  <span>{tx("Bagian 3: Narasi Sisi Kanan (Fase Scroll 65% - 95%)", "Part 3: Right-Aligned Narrative (Scroll 65% - 95%)")}</span>
                </h3>
                <span className={`text-[10px] font-mono uppercase ${
                  isLight ? "text-slate-500" : "text-neutral-500"
                }`}>Scroll 65% - 95%</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sec 3 Headline Line 1 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <label className={`text-xs font-mono font-semibold ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {tx("Judul Baris 1", "Headline Line 1")}
                    </label>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                    }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                      <label
                        className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                          isLight ? "border-slate-300" : "border-white/30"
                        }`}
                        style={{ backgroundColor: hbSec3H1Color }}
                        title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                      >
                        <input
                          type="color"
                          value={hbSec3H1Color}
                          onChange={(e) => setHbSec3H1Color(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={tx("Color Wheel", "Color Wheel")}
                        />
                      </label>
                      <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}>
                        {hbSec3H1Color}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hbSec3H1}
                    onChange={(e) => setHbSec3H1(e.target.value)}
                    style={{ color: isLight ? "#0f172a" : hbSec3H1Color }}
                    placeholder="Contoh: Creative"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] transition-colors ${
                      isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                    }`}
                  />
                </div>

                {/* Sec 3 Headline Line 2 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <label className={`text-xs font-mono font-semibold ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {tx("Judul Baris 2 (Aksen)", "Headline Line 2 (Accent)")}
                    </label>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                    }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                      <label
                        className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                          isLight ? "border-slate-300" : "border-white/30"
                        }`}
                        style={{ backgroundColor: hbSec3H2Color }}
                        title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                      >
                        <input
                          type="color"
                          value={hbSec3H2Color}
                          onChange={(e) => setHbSec3H2Color(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={tx("Color Wheel", "Color Wheel")}
                        />
                      </label>
                      <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                        isLight ? "text-slate-700" : "text-neutral-300"
                      }`}>
                        {hbSec3H2Color}
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hbSec3H2}
                    onChange={(e) => setHbSec3H2(e.target.value)}
                    style={{ color: isLight ? "#0f172a" : hbSec3H2Color }}
                    placeholder="Contoh: meets AI"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] transition-colors ${
                      isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                    }`}
                  />
                </div>
              </div>

              {/* Sec 3 Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <label className={`text-xs font-mono font-semibold ${
                    isLight ? "text-slate-700" : "text-neutral-300"
                  }`}>
                    {tx("Paragraf Deskripsi Sisi Kanan", "Right Description Paragraph")}
                  </label>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm ${
                    isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                  }`} title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}>
                    <label
                      className={`relative w-4 h-4 rounded-full border shadow-xs shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 ${
                        isLight ? "border-slate-300" : "border-white/30"
                      }`}
                      style={{ backgroundColor: hbSec3BodyColor }}
                      title={tx("Pilih warna dengan Color Wheel", "Choose color with Color Wheel")}
                    >
                      <input
                        type="color"
                        value={hbSec3BodyColor}
                        onChange={(e) => setHbSec3BodyColor(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label={tx("Color Wheel", "Color Wheel")}
                      />
                    </label>
                    <span className={`text-[10px] font-mono uppercase font-semibold select-all ${
                      isLight ? "text-slate-700" : "text-neutral-300"
                    }`}>
                      {hbSec3BodyColor}
                    </span>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={hbSec3Body}
                  onChange={(e) => setHbSec3Body(e.target.value)}
                  style={{ color: isLight ? "#0f172a" : hbSec3BodyColor }}
                  placeholder="Deskripsi AI workflow dan modern vision..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#16b09f] leading-relaxed transition-colors ${
                    isLight ? "bg-white border-slate-200 placeholder:text-slate-400" : "bg-neutral-950 border-white/15 placeholder:text-neutral-500"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: CLIENT BRAND & PORTFOLIO WORKS MANAGEMENT (SUPERSEDED BY STUDIO CLIENTS WORKSPACE) */}
        {false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header Explainer */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold block mb-1">
                {tx("MANAJEMEN FOLDER & PORTOFOLIO", "FOLDER MANAGEMENT & PORTFOLIO")}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {tx("Manajemen Folder & Portofolio (Format: client - [Nama Brand])", "Folder & Portfolio Management (Format: client - [Brand Name])")}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl leading-relaxed">
                {tx("Pilih folder klien di bawah untuk mengupload gambar portofolio baru, menghapus karya (ikon silang X di sudut gambar), dan mengedit narasi brand. Perubahan langsung tersimpan dan tampil di public website.", "Select a client folder below to upload new portfolio images, delete works (X icon on top-right), and edit brand stories. Changes are saved and updated live.")}
              </p>
            </div>

            {/* PORTFOLIO INTRO HEADER & TOOLS EDITOR (LEFT BLOCK IN WEB VIEW) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1219] via-neutral-900/80 to-neutral-950 border border-cyan-500/25 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <HiSparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{tx("Header & Teks Intro Section Portofolio (Sisi Kiri Web)", "Portfolio Section Header & Intro (Web Left Side)")}</span>
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {tx("Badge, Headline, Deskripsi, dan Tag Software di section portofolio web publik", "Badge, Headline, Description, and Software Tags on the public portfolio section")}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Live Public Sync
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Badge Input */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("Badge / Eyebrow (Teks Kecil)", "Badge / Eyebrow (Small Text)")}
                  </label>
                  <input
                    type="text"
                    value={introBadgeInput}
                    onChange={(e) => setIntroBadgeInput(e.target.value)}
                    placeholder="PROFESSIONAL EXPERIENCE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                {/* Headline Input */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("Headline Utama", "Main Headline")}
                  </label>
                  <input
                    type="text"
                    value={introHeadlineInput}
                    onChange={(e) => setIntroHeadlineInput(e.target.value)}
                    placeholder="Creative Work. Real-World Thinking."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                {/* Description Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("Deskripsi / Narasi Portofolio", "Portfolio Description / Narrative")}
                  </label>
                  <textarea
                    rows={2}
                    value={introDescInput}
                    onChange={(e) => setIntroDescInput(e.target.value)}
                    placeholder="From brand campaigns to digital experiences..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-all leading-relaxed"
                  />
                </div>

                {/* Tools Input */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-neutral-300 font-medium">
                      {tx("Tag Software / Alat Kerja (Pisahkan dengan koma)", "Software / Tool Tags (Comma-separated)")}
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {introToolsInput.split(",").filter((t) => t.trim()).length} Tags
                    </span>
                  </div>
                  <input
                    type="text"
                    value={introToolsInput}
                    onChange={(e) => setIntroToolsInput(e.target.value)}
                    placeholder="Figma, Photoshop, Magnific AI, GPT, Gemini"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 transition-all"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {introToolsInput
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Intro */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSavePortfolioIntro}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#16b09f] hover:from-cyan-400 hover:to-[#119889] text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <HiCheck className="w-4 h-4" />
                  <span>{tx("Simpan Header Portofolio", "Save Portfolio Header")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetPortfolioIntro}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  {tx("Reset ke Bawaan", "Reset to Default")}
                </button>
              </div>
            </div>

            {/* Folder Grid Selector (Format: client - [Nama Brand]) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  {tx(`Daftar Folder Klien (${clients.length} Brand):`, `Client Folder List (${clients.length} Brands):`)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddFolderOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16b09f]/15 hover:bg-[#16b09f]/25 text-[#16b09f] border border-[#16b09f]/35 text-xs font-mono font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <HiFolderPlus className="w-4 h-4" />
                  <span>{tx("Buat Folder Baru", "Create New Folder")}</span>
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
                            {client.works?.length || 0} {tx("Karya", "Works")}
                          </span>
                          <div className="flex items-center gap-1">
                            <HiFolder
                              className={`w-4 h-4 ${isSelected ? "text-[#16b09f]" : "text-neutral-500"}`}
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

                      {/* Action buttons: Edit brand name & Delete folder */}
                      <div className="absolute -top-2 -right-2 z-20 flex items-center gap-1 opacity-0 group-hover/folder:opacity-100 transition-all">
                        {/* Edit brand name button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditFolder(client);
                          }}
                          className="w-6 h-6 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg transition-all scale-75 group-hover/folder:scale-100 cursor-pointer"
                          title={tx(`Edit nama brand ${client.clientName}`, `Edit brand name ${client.clientName}`)}
                        >
                          <HiPencilSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete folder button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(client);
                          }}
                          className="w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-all scale-75 group-hover/folder:scale-100 cursor-pointer"
                          title={tx(`Hapus folder ${client.clientName}`, `Delete folder ${client.clientName}`)}
                        >
                          <HiXMark className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-semibold">
                            FOLDER: client - {selectedClient.clientName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditFolder(selectedClient)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/20 transition-colors cursor-pointer"
                            title={tx("Edit nama brand ini", "Edit this brand name")}
                          >
                            <HiPencilSquare className="w-3 h-3" />
                            <span>{tx("Ubah Nama Brand", "Rename Brand")}</span>
                          </button>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          {tx("Edit Deskripsi & Penjelasan Brand", "Edit Brand Description & Overview")}
                        </h3>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                        {selectedClient.works?.length || 0} {tx("Portofolio", "Portfolio")}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-mono text-neutral-300 font-medium">
                          {tx("Penjelasan / Deskripsi Klien & Brand", "Client & Brand Description")} <span className="text-cyan-400">*</span>
                        </label>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {clientDescInput.length} {tx("karakter", "characters")}
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={clientDescInput}
                        onChange={(e) => setClientDescInput(e.target.value)}
                        placeholder={
                          tx(`Tuliskan profil atau penjelasan brand ${selectedClient.clientName}, cakupan kampanye, atau nilai tambah kolaborasi...`, `Write brand profile or overview for ${selectedClient.clientName}, campaign scope, or creative collaboration value...`)
                        }
                        className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-sans focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all leading-relaxed"
                      />
                    </div>

                    {/* Tools Used / Software & AI yang Digunakan */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-mono text-neutral-300 font-medium">
                          {tx("Tools Used / Software & AI yang Digunakan", "Tools Used / Software & AI")}
                        </label>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {tx("Pisahkan dengan koma atau klik badge di bawah", "Separate with commas or click badges below")}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={clientToolsInput}
                        onChange={(e) => setClientToolsInput(e.target.value)}
                        placeholder="Figma, Photoshop, Magnific AI, ChatGPT, Gemini..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all"
                      />

                      {/* Quick Select Tool Badges */}
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
                          {tx("Pilihan Cepat (Klik untuk Tambah / Hapus Tag):", "Quick Select (Click to Add / Remove Tag):")}
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
                                    ? "bg-[#16b09f] text-black font-bold shadow-md shadow-[#16b09f]/25 border border-[#16b09f]"
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
                        className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <HiCheck className="w-4 h-4" />
                        <span>{tx("Simpan Deskripsi & Tag Tools (Auto-Update Web)", "Save Description & Tool Tags (Auto-Update Web)")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetClientDescription}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                      >
                        {tx("Reset Form", "Reset Form")}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Portfolio Works Gallery & Upload Section (My Work Panel) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                  {/* Gallery Header + Upload Trigger Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-mono text-[#16b09f] uppercase tracking-widest font-semibold block">
                        {tx("ASET PORTOFOLIO", "PORTFOLIO ASSETS")} · FOLDER {selectedClient.clientName.toUpperCase()}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>{tx("Galeri Gambar Portofolio", "Portfolio Image Gallery")}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                          {selectedClient.works?.length || 0} {tx("Item", "Items")}
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {tx("Klik tombol tanda silang (X) di sudut kanan atas pada gambar untuk menghapusnya langsung dari web portofolio.", "Click the (X) cross icon on top-right of an image to remove it directly from the portfolio.")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16b09f] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      <HiArrowUpTray className="w-4 h-4" />
                      <span>{tx("Tambah Gambar Portofolio", "Add New Portfolio Image")}</span>
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

                            {/* Image Thumbnail Container — matches work.aspect (16:9, 1:1, 4:5, etc) */}
                            <div className={`relative w-full ${getAspectClass(work.aspect)} bg-black overflow-hidden transition-all duration-300`}>
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
                        {tx(`Belum ada gambar di folder ${selectedClient.clientName}`, `No images yet in folder ${selectedClient.clientName}`)}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                        {tx(`Klik tombol "Tambah Gambar Portofolio" di atas untuk menambahkan visual kampanye ke folder ini.`, `Click "Add New Portfolio Image" above to add campaign visuals to this folder.`)}
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
        {sidebarTab === "hero-works" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header Explainer */}
            <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}>
              <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}>
                SECTION CONTROL: HERO & SELECTED WORKS
              </span>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Editor Section Hero (Design. Motion. AI.) & Selected Works
              </h2>
              <p className={`text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Edit seluruh teks headline, subheadline, tags, tombol CTA, serta tambah, ganti, atau hapus gambar kartu preview bertumpuk dan melengkung secara fleksibel.
              </p>
            </div>

            {/* SECTION 2: HERO ("Design. Motion. AI.") */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#16b09f]/15 border border-[#16b09f]/30 flex items-center justify-center text-[#16b09f]">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                          <HiArrowUpTray className="w-5 h-5 text-[#16b09f]" />
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#16b09f]"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-neutral-400">Rotasi (°):</span>
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
                        <span>{tx("Hapus Kartu", "Delete Card")}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form Tambah Kartu Baru */}
                <div className="p-4 rounded-xl bg-neutral-900/50 border border-dashed border-white/20 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HiPlus className="w-4 h-4 text-[#16b09f]" />
                    <span>{tx("Tambah Kartu Hero Baru", "Add New Hero Card")}</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newOverTitle}
                      onChange={(e) => setNewOverTitle(e.target.value)}
                      placeholder="Judul Kartu (contoh: 3D Visual)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#16b09f]"
                    />
                    <input
                      type="number"
                      value={newOverRotate}
                      onChange={(e) => setNewOverRotate(e.target.value)}
                      placeholder="Rotasi derajat (contoh: 5)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                    />
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer border border-white/10">
                      <HiPhoto className="w-4 h-4 text-[#16b09f]" />
                      <span className="truncate">
                        {newOverImage ? "✓ Gambar Dipilih" : "Pilih File Gambar"}
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
                        className="px-4 py-2 rounded-xl bg-[#16b09f] text-black font-bold text-xs hover:bg-[#119889] transition-all cursor-pointer"
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
                  <div className="w-8 h-8 rounded-lg bg-[#16b09f]/15 border border-[#16b09f]/30 flex items-center justify-center text-[#16b09f]">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                    placeholder="Scroll down ↓"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                          <HiArrowUpTray className="w-5 h-5 text-[#16b09f]" />
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#16b09f]"
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteDeckCard(card.id)}
                        className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        <span>{tx("Hapus Kartu", "Delete Card")}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form Tambah Kartu Deck Baru */}
                <div className="p-4 rounded-xl bg-neutral-900/50 border border-dashed border-white/20 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HiPlus className="w-4 h-4 text-[#16b09f]" />
                    <span>{tx("Tambah Kartu Deck Baru", "Add New Deck Card")}</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newDeckTitle}
                      onChange={(e) => setNewDeckTitle(e.target.value)}
                      placeholder="Judul (contoh: Motion Design)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs focus:outline-none focus:border-[#16b09f]"
                    />
                    <input
                      type="text"
                      value={newDeckCategory}
                      onChange={(e) => setNewDeckCategory(e.target.value)}
                      placeholder="Kategori (contoh: 3D & AI)"
                      className="px-3 py-2 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#16b09f]"
                    />
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer border border-white/10">
                      <HiPhoto className="w-4 h-4 text-[#16b09f]" />
                      <span className="truncate">
                        {newDeckImage ? "✓ Gambar Dipilih" : "Pilih File Gambar"}
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
                        className="px-4 py-2 rounded-xl bg-[#16b09f] text-black font-bold text-xs hover:bg-[#119889] transition-all cursor-pointer"
                      >
                        + Masukkan Kartu ke Selected Works
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 4: PORTFOLIO RUNNER (4:5 MARQUEE) CRUD MANAGEMENT
           ======================================================== */}
        {sidebarTab === "runner" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header Explainer */}
            <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}>
              <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}>
                SECTION CONTROL: RUNNING PORTOFOLIO (MARQUEE 4:5)
              </span>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {tx("Editor Running Portofolio (Rasio 4:5)", "Running Portfolio Editor (4:5 Ratio)")}
              </h2>
              <p className={`text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                {tx("Kelola kartu karya yang berjalan di strip 2 baris tepat di atas footer. Semua kartu memiliki rasio 4:5 seragam tanpa jeda atau putus. Anda bisa menambah karya baru, mengedit judul/kategori/gambar, memindahkan baris, atau menghapus karya.", "Manage the portfolio cards running in a 2-row strip above the footer. All cards have a uniform 4:5 aspect ratio with seamless infinite looping. You can create, edit, reorder rows, and delete items.")}
              </p>
            </div>

            {/* Section Header Title Editor */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HiTag className="w-4 h-4 text-[#16b09f]" />
                <span>{tx("Judul Label Section", "Section Header Label")}</span>
              </h3>
              <div className="space-y-1.5 max-w-xl">
                <input
                  type="text"
                  value={runnerTitle}
                  onChange={(e) => setRunnerTitle(e.target.value)}
                  placeholder="SELECTED WORKS"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                />
                <p className="text-[11px] text-neutral-500 font-mono">
                  {tx("Teks label kecil yang tampil di atas strip marquee running portofolio.", "Small label appearing above the running marquee strip.")}
                </p>
              </div>
            </div>

            {/* Kontrol Animasi, Kecepatan, Gerakan & Efek Gelombang */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HiSparkles className="w-4 h-4 text-[#16b09f]" />
                  <span>{tx("Pengaturan Gerakan, Kecepatan & Efek Gelombang", "Motion, Speed & Wave Effect Controls")}</span>
                </h3>
                <span className="text-[10px] font-mono text-[#16b09f] uppercase font-semibold">
                  {tx("Interaktif Real-Time", "Real-Time Interactive")}
                </span>
              </div>

              {/* 1. KONTROL KECEPATAN (SPEED) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-neutral-950/70 border border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300 font-semibold">{tx("Kecepatan Baris 1 (Atas)", "Row 1 Speed")}</span>
                    <span className="text-[#16b09f] font-bold">{runnerSpeedRow1} detik/putaran</span>
                  </div>
                  <input
                    type="range"
                    min={35}
                    max={140}
                    step={5}
                    value={runnerSpeedRow1}
                    onChange={(e) => setRunnerSpeedRow1(Number(e.target.value))}
                    className="w-full accent-[#16b09f] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Cepat (35s)</span>
                    <span>Ambient Lambat (140s)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300 font-semibold">{tx("Kecepatan Baris 2 (Bawah)", "Row 2 Speed")}</span>
                    <span className="text-[#16b09f] font-bold">{runnerSpeedRow2} detik/putaran</span>
                  </div>
                  <input
                    type="range"
                    min={35}
                    max={140}
                    step={5}
                    value={runnerSpeedRow2}
                    onChange={(e) => setRunnerSpeedRow2(Number(e.target.value))}
                    className="w-full accent-[#16b09f] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Cepat (35s)</span>
                    <span>Ambient Lambat (140s)</span>
                  </div>
                </div>
              </div>

              {/* 2. KONTROL ARAH GERAKAN (DIRECTION) & PAUSE ON HOVER */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-300 font-semibold block">
                    {tx("Arah Gerak Baris 1", "Row 1 Direction")}
                  </label>
                  <select
                    value={runnerDirRow1}
                    onChange={(e) => setRunnerDirRow1(e.target.value as "left" | "right")}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs font-mono focus:border-[#16b09f] focus:outline-none cursor-pointer"
                  >
                    <option value="left">{tx("Scroll ke Kiri ←", "Scroll Left ←")}</option>
                    <option value="right">{tx("Scroll ke Kanan →", "Scroll Right →")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-300 font-semibold block">
                    {tx("Arah Gerak Baris 2", "Row 2 Direction")}
                  </label>
                  <select
                    value={runnerDirRow2}
                    onChange={(e) => setRunnerDirRow2(e.target.value as "left" | "right")}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs font-mono focus:border-[#16b09f] focus:outline-none cursor-pointer"
                  >
                    <option value="right">{tx("Scroll ke Kanan →", "Scroll Right →")}</option>
                    <option value="left">{tx("Scroll ke Kiri ←", "Scroll Left ←")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-300 font-semibold block">
                    {tx("Jeda Saat Hover Mouse", "Pause on Hover")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setRunnerPauseOnHover(!runnerPauseOnHover)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-between border ${
                      runnerPauseOnHover
                        ? "bg-[#16b09f]/20 text-[#16b09f] border-[#16b09f]/50"
                        : "bg-neutral-900 text-neutral-400 border-white/15 hover:bg-neutral-800"
                    }`}
                  >
                    <span>{runnerPauseOnHover ? (tx("Jeda Aktif", "Pause On")) : (tx("Tetap Berjalan", "Keep Running"))}</span>
                    <span className="text-[10px] font-bold">{runnerPauseOnHover ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>

              {/* 3. KONTROL EFEK SENTUHAN & GELOMBANG (WAVE RIPPLE) */}
              <div className="p-4 sm:p-5 rounded-xl bg-neutral-950/70 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      {tx("Efek Gelombang Sentuhan Mouse (Proximity Wave Ripple)", "Touch / Mouse Proximity Wave Ripple Effect")}
                    </span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {tx("Saat kursor mendekati kartu, kartu terdekat akan melayang ke atas dan kartu sekitarnya ikut bergelombang halus.", "When mouse touches or hovers near cards, closest card lifts and neighboring cards ripple in a wave.")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRunnerWaveEnabled(!runnerWaveEnabled)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      runnerWaveEnabled
                        ? "bg-[#16b09f] text-black shadow-md shadow-[#16b09f]/30"
                        : "bg-neutral-800 text-neutral-400 border border-white/10"
                    }`}
                  >
                    {runnerWaveEnabled ? (tx("Efek Aktif", "Wave Enabled")) : (tx("Nonaktif", "Disabled"))}
                  </button>
                </div>

                {runnerWaveEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-400">{tx("Tinggi Melayang:", "Lift Height:")}</span>
                        <span className="text-[#16b09f] font-bold">-{runnerWaveLift}px</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={35}
                        value={runnerWaveLift}
                        onChange={(e) => setRunnerWaveLift(Number(e.target.value))}
                        className="w-full accent-[#16b09f] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-400">{tx("Skala Pembesaran:", "Card Scale:")}</span>
                        <span className="text-[#16b09f] font-bold">{runnerWaveScale}x</span>
                      </div>
                      <input
                        type="range"
                        min={1.05}
                        max={1.30}
                        step={0.01}
                        value={runnerWaveScale}
                        onChange={(e) => setRunnerWaveScale(Number(e.target.value))}
                        className="w-full accent-[#16b09f] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-400">{tx("Jangkauan Ombak:", "Wave Radius:")}</span>
                        <span className="text-[#16b09f] font-bold">{runnerWaveRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min={160}
                        max={360}
                        step={10}
                        value={runnerWaveRadius}
                        onChange={(e) => setRunnerWaveRadius(Number(e.target.value))}
                        className="w-full accent-[#16b09f] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form: Tambah Karya Baru ke Running Portofolio (4:5) */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HiPlus className="w-4 h-4 text-[#16b09f]" />
                  <span>{tx("Tambah Karya Baru ke Running Portofolio (4:5)", "Add New Item to Running Portfolio (4:5)")}</span>
                </h3>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#16b09f]/15 text-[#16b09f] border border-[#16b09f]/30 font-semibold">
                  Rasio 4:5
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Inputs: 8 cols */}
                <div className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-neutral-300">
                        {tx("Judul Karya", "Item Title")} *
                      </label>
                      <input
                        type="text"
                        value={newRunnerTitle}
                        onChange={(e) => setNewRunnerTitle(e.target.value)}
                        placeholder="Contoh: KIA EV2 Concept"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-neutral-300">
                        {tx("Kategori / Label", "Category / Label")}
                      </label>
                      <input
                        type="text"
                        value={newRunnerCategory}
                        onChange={(e) => setNewRunnerCategory(e.target.value)}
                        placeholder="Contoh: Automotive, Branding, UI/UX"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-neutral-300">
                      {tx("Posisi Baris Marquee", "Marquee Row Position")}
                    </label>
                    <select
                      value={newRunnerRow}
                      onChange={(e) => setNewRunnerRow(parseInt(e.target.value) as 1 | 2)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                    >
                      <option value={1}>{tx("Baris 1 (Scroll ke Kiri)", "Row 1 (Scrolls Left)")}</option>
                      <option value={2}>{tx("Baris 2 (Scroll ke Kanan)", "Row 2 (Scrolls Right)")}</option>
                    </select>
                  </div>

                  {/* Image input: URL or File */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-semibold text-neutral-300">
                      {tx("Pilih Gambar (Rasio 4:5 Disarankan)", "Select Image (4:5 Ratio Recommended)")} *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newRunnerImage}
                        onChange={(e) => setNewRunnerImage(e.target.value)}
                        placeholder="/works/client-KIA/KIA EV2_B.jpg atau URL online"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0">
                        <HiArrowUpTray className="w-4 h-4 text-[#16b09f]" />
                        <span>{tx("Upload File", "Upload File")}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleGenericImageFile(e, (dataUrl) => setNewRunnerImage(dataUrl))
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRunnerItem}
                    className="px-5 py-2.5 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#16b09f]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <HiPlus className="w-4 h-4" />
                    <span>Running</span>
                  </button>
                </div>

                {/* Live 4:5 Preview Card: 4 cols */}
                <div className="md:col-span-4 flex flex-col items-center">
                  <span className="text-[11px] font-mono text-neutral-400 mb-2">
                    {tx("Preview Kartu (4:5)", "Card Preview (4:5)")}
                  </span>
                  <div className="relative w-36 sm:w-44 aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 bg-neutral-950 shadow-2xl">
                    {newRunnerImage ? (
                      <img
                        src={newRunnerImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-neutral-600 bg-neutral-900/60">
                        <HiPhoto className="w-8 h-8 mb-1.5 opacity-40" />
                        <span className="text-[10px] font-mono">Belum ada gambar</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                      <p className="text-white text-xs font-bold truncate leading-tight">
                        {newRunnerTitle || (tx("Judul Karya", "Item Title"))}
                      </p>
                      <p className="text-[#16b09f] text-[10px] font-mono truncate">
                        {newRunnerCategory || "Category"}
                      </p>
                    </div>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-[9px] font-mono text-neutral-300">
                      Baris {newRunnerRow}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* List & CRUD Management of Running Portfolio Cards */}
            <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0f14] border border-white/10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HiFolder className="w-4 h-4 text-[#16b09f]" />
                    <span>{tx("Daftar Karya di Running Portofolio", "Running Portfolio Items List")}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-neutral-300">
                      {runnerItems.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {tx("Semua kartu ditampilkan dalam rasio seragam 4:5.", "All cards formatted in uniform 4:5 aspect ratio.")}
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setRunnerFilterRow("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      runnerFilterRow === "all"
                        ? "bg-[#16b09f] text-black font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Semua ({runnerItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRunnerFilterRow(1)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      runnerFilterRow === 1
                        ? "bg-[#16b09f] text-black font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Baris 1 ({runnerItems.filter((i) => i.row === 1).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRunnerFilterRow(2)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      runnerFilterRow === 2
                        ? "bg-[#16b09f] text-black font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Baris 2 ({runnerItems.filter((i) => i.row === 2).length})
                  </button>
                </div>
              </div>

              {/* Cards Grid: strictly 4:5 cards */}
              {(() => {
                const filtered =
                  runnerFilterRow === "all"
                    ? runnerItems
                    : runnerItems.filter((i) => i.row === runnerFilterRow);

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                      {tx("Tidak ada karya di baris ini.", "No items found in this row.")}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col rounded-2xl bg-neutral-950 border border-white/10 overflow-hidden shadow-lg hover:border-white/25 transition-all"
                      >
                        {/* 4:5 Aspect Ratio Image Box */}
                        <div className="relative w-full aspect-[4/5] bg-neutral-900 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />

                          {/* Row Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleRunnerRow(item.id)}
                            title="Klik untuk pindahkan ke baris lain"
                            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                              item.row === 1
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                                : "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
                            }`}
                          >
                            Baris {item.row} {item.row === 1 ? "←" : "→"}
                          </button>

                          {/* Quick Edit & Delete overlay buttons */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditingRunnerItem({ ...item })}
                              title="Edit Karya"
                              className="w-7 h-7 rounded-lg bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                            >
                              <HiPencilSquare className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRunnerItem(item.id)}
                              title="Hapus Karya"
                              className="w-7 h-7 rounded-lg bg-black/80 hover:bg-red-950/80 text-white flex items-center justify-center border border-white/20 hover:border-red-500/50 transition-all cursor-pointer"
                            >
                              <HiTrash className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>

                          {/* Title & Category Info at Bottom of Card */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                            <p className="text-white text-xs font-bold truncate leading-tight">
                              {item.title}
                            </p>
                            <p className="text-[#16b09f] text-[10px] font-mono font-medium truncate mt-0.5">
                              {item.category}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer Bar */}
                        <div className="p-2 bg-neutral-900/80 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                          <button
                            type="button"
                            onClick={() => handleToggleRunnerRow(item.id)}
                            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Pindah</span>
                            <span className="text-[#16b09f]">B{item.row === 1 ? 2 : 1}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRunnerItem({ ...item })}
                            className="text-[#16b09f] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>



            {/* Modal: Edit Existing Runner Item */}
            {editingRunnerItem && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="w-full max-w-lg rounded-2xl bg-neutral-950 border border-white/15 p-5 sm:p-7 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <HiPencilSquare className="w-5 h-5 text-[#16b09f]" />
                      <span>{tx("Edit Karya Running Portofolio", "Edit Running Portfolio Item")}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingRunnerItem(null)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                    >
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-neutral-300">
                        {tx("Judul Karya", "Item Title")}
                      </label>
                      <input
                        type="text"
                        value={editingRunnerItem.title}
                        onChange={(e) =>
                          setEditingRunnerItem({ ...editingRunnerItem, title: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-neutral-300">
                        {tx("Kategori / Subtitle", "Category / Subtitle")}
                      </label>
                      <input
                        type="text"
                        value={editingRunnerItem.category}
                        onChange={(e) =>
                          setEditingRunnerItem({ ...editingRunnerItem, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-neutral-300">
                        {tx("Posisi Baris", "Row Position")}
                      </label>
                      <select
                        value={editingRunnerItem.row}
                        onChange={(e) =>
                          setEditingRunnerItem({
                            ...editingRunnerItem,
                            row: parseInt(e.target.value) as 1 | 2,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                      >
                        <option value={1}>{tx("Baris 1 (Scroll ke Kiri)", "Row 1 (Scrolls Left)")}</option>
                        <option value={2}>{tx("Baris 2 (Scroll ke Kanan)", "Row 2 (Scrolls Right)")}</option>
                      </select>
                    </div>

                    {/* Image URL / Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-semibold text-neutral-300">
                        {tx("Gambar Karya (Rasio 4:5)", "Image (4:5 Ratio)")}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editingRunnerItem.image}
                          onChange={(e) =>
                            setEditingRunnerItem({ ...editingRunnerItem, image: e.target.value })
                          }
                          className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
                        />
                        <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0">
                          <HiArrowUpTray className="w-4 h-4 text-[#16b09f]" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleGenericImageFile(e, (dataUrl) =>
                                setEditingRunnerItem((prev) =>
                                  prev ? { ...prev, image: dataUrl } : null
                                )
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    {/* Preview 4:5 in modal */}
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-900 border border-white/10">
                      <div className="relative w-16 aspect-[4/5] rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                        <img
                          src={editingRunnerItem.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {editingRunnerItem.title}
                        </p>
                        <p className="text-[11px] text-[#16b09f] font-mono truncate">
                          {editingRunnerItem.category}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-1">
                          Baris {editingRunnerItem.row} ({editingRunnerItem.row === 1 ? "Scroll Kiri" : "Scroll Kanan"})
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingRunnerItem(null)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateEditingRunnerItem}
                      className="px-5 py-2 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs shadow-md shadow-[#16b09f]/30"
                    >
                      Update Karya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {/* ========================================================
            TAB 5: ABOUT ME SECTION MANAGEMENT
           ======================================================== */}
        {sidebarTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header Explainer */}
            <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}>
              <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}>
                SECTION CONTROL: ABOUT ME (WHO AM I)
              </span>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Kustomisasi Seluruh Teks Section About Me
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Ubah headline, narasi profil, filosofi inti, 3 statistik pengalaman, teks kolaborasi global, dan disiplin keahlian. Setiap perubahan langsung disimpan ke Supabase Cloud & LocalStorage dan tayang langsung di web publik.
              </p>
            </div>

            <form onSubmit={handleSaveAbout} className="space-y-6">
              {/* 1. Main Headline & Bio */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#16b09f] uppercase tracking-widest font-semibold block">
                    BAGIAN 1 · HEADER & NARASI UTAMA
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
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f] font-mono transition-all"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f] transition-all"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-semibold focus:outline-none focus:border-[#16b09f] transition-all"
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
                    placeholder="With 11+ years in creative design, I've evolved alongside the industry..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm leading-relaxed focus:outline-none focus:border-[#16b09f] transition-all resize-none"
                  />
                </div>
              </div>

              {/* 2. Filosofi Inti (Core Philosophy) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#16b09f] uppercase tracking-widest font-semibold block">
                    BAGIAN 2 · FILOSOFI INTI
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
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#16b09f] transition-all"
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
                      placeholder="A creative professional's greatest advantage isn't resisting change — it's adapting faster."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm italic focus:outline-none focus:border-[#16b09f] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Tiga Statistik Utama (3 Key Stats) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#16b09f] uppercase tracking-widest font-semibold block">
                    BAGIAN 3 · STATISTIK PENGALAMAN
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    3 Angka Prestasi & Pengalaman
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Stat 1 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                    <label className="block text-[11px] font-mono text-[#16b09f] font-semibold uppercase">
                      Statistik 1 (Warna Aksen Hijau/Cyan)
                    </label>
                    <input
                      type="text"
                      value={aboutStat1Num}
                      onChange={(e) => setAboutStat1Num(e.target.value)}
                      placeholder="11+"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-base font-bold font-mono focus:outline-none focus:border-[#16b09f]"
                    />
                    <input
                      type="text"
                      value={aboutStat1Label}
                      onChange={(e) => setAboutStat1Label(e.target.value)}
                      placeholder="YEARS EXPERIENCE"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-[#16b09f]"
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
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-base font-bold font-mono focus:outline-none focus:border-[#16b09f]"
                    />
                    <input
                      type="text"
                      value={aboutStat2Label}
                      onChange={(e) => setAboutStat2Label(e.target.value)}
                      placeholder="PROJECTS"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-[#16b09f]"
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
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-base font-bold font-mono focus:outline-none focus:border-[#16b09f]"
                    />
                    <input
                      type="text"
                      value={aboutStat3Label}
                      onChange={(e) => setAboutStat3Label(e.target.value)}
                      placeholder="CLIENTS"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-[#16b09f]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Sidebar Cards (Global Collaboration & Disciplines) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-[#16b09f] uppercase tracking-widest font-semibold block">
                    BAGIAN 4 · KARTU SAMPING (SIDEBAR CARDS)
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
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-[#16b09f] resize-none"
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
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f]"
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
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-[#16b09f] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Sidebar Cards (Global Collaboration & Disciplines) end */}
            </form>
          </motion.div>
        )}

        {/* TAB 6: FLAGSHIP SHOWCASE YOUTUBE / DRIVE / IMAGE EMBED */}
        {sidebarTab === "flagship" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Section Explainer Banner */}
            <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                    isLight ? "text-teal-700" : "text-[#16b09f]"
                  }`}>
                    SECTION CONTROL: STAGE 3
                  </span>
                  <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    Flagship Showcase: From Visual Craft to Technology (VISUAL CRAFT | DIGITAL | AI)
                  </h2>
                  <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    Kelola integrasi pemutar video YouTube sinematik khusus untuk section karya unggulan ini. Video langsung tayang di section Flagship Showcase pada web publik.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                      flagshipMediaType === "youtube" && previewYouTubeId
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : flagshipMediaType === "gdrive" && previewGDriveId
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        : "bg-emerald-500/10 text-[#16b09f] border border-[#16b09f]/30"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {flagshipMediaType === "youtube"
                      ? previewYouTubeId
                        ? (videoEnabled ? "YouTube Video Aktif" : "YouTube Siap (Nonaktif)")
                        : "Menunggu Link YouTube"
                      : flagshipMediaType === "gdrive"
                      ? previewGDriveId
                        ? (videoEnabled ? "Google Drive Embed Aktif" : "Google Drive Siap (Nonaktif)")
                        : "Menunggu Link Google Drive"
                      : "Mode Gambar Statis"}
                  </span>
                </div>
              </div>

              {/* Informational Position Note */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-3 text-xs text-neutral-300">
                <span className="p-1 rounded-md bg-[#16b09f]/20 text-[#16b09f] shrink-0 mt-0.5">
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
                  onSubmit={handleSaveVideo}
                  className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <HiPencilSquare className="w-4 h-4 text-[#16b09f]" />
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-sans focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all"
                      />
                    </div>
                  </div>

                  {/* SECTION 2: VIDEO MEDIA & KONTEN DALAM CARD */}
                  <div className="p-4 rounded-xl bg-neutral-950/70 border border-white/10 space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#16b09f] font-semibold block">
                      B. Media Player & Konten di Dalam Card Showcase
                    </span>

                    {/* MEDIA TYPE SELECTOR: YouTube, Google Drive, or Image */}
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                        {tx("Tipe Media Showcase", "Showcase Media Type")}
                      </label>
                      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-neutral-900 border border-white/10 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setFlagshipMediaType("youtube");
                            setVideoEnabled(true);
                          }}
                          className={`py-2 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            flagshipMediaType === "youtube"
                              ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                              : "text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>🔴 YouTube</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFlagshipMediaType("gdrive");
                            setVideoEnabled(true);
                          }}
                          className={`py-2 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            flagshipMediaType === "gdrive"
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>📁 Google Drive</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFlagshipMediaType("image");
                            setVideoEnabled(false);
                          }}
                          className={`py-2 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            flagshipMediaType === "image"
                              ? "bg-[#16b09f] text-black shadow-md shadow-[#16b09f]/30"
                              : "text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>🖼️ Gambar Kustom</span>
                        </button>
                      </div>
                    </div>

                    {/* MODE 1: YOUTUBE */}
                    {flagshipMediaType === "youtube" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-neutral-300 font-medium">
                          URL Video atau Video ID YouTube <span className="text-cyan-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={videoUrlInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVideoUrlInput(val);
                            if (extractYouTubeId(val)) {
                              setVideoEnabled(true);
                            }
                          }}
                          placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ atau dQw4w9WgXcQ"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all"
                        />
                        <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500 font-mono">
                          <span>Mendukung: youtube.com/watch?v=..., youtu.be/..., shorts, atau raw ID</span>
                          {previewYouTubeId && (
                            <span className="text-cyan-400 font-semibold">ID: {previewYouTubeId}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* MODE 2: GOOGLE DRIVE */}
                    {flagshipMediaType === "gdrive" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-neutral-300 font-medium">
                          {tx("Link File / Video Google Drive", "Google Drive File / Video Link", "Tautan File / Video Google Drive")} <span className="text-blue-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={flagshipGDriveUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFlagshipGDriveUrl(val);
                            if (extractGoogleDriveId(val)) {
                              setVideoEnabled(true);
                            }
                          }}
                          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-1 mt-1 text-[11px] text-neutral-400 font-mono">
                          <span>{tx("Akses file: 'Siapa saja yang memiliki link'", "Access: 'Anyone with the link'", "Akses file: 'Sia se nan punyo tautan'")}</span>
                          {previewGDriveId && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-semibold">Drive ID: {previewGDriveId}</span>
                              <a
                                href={`https://drive.google.com/file/d/${previewGDriveId}/view`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
                              >
                                {tx("↗ Tes Buka Link", "↗ Test Link", "↗ Uji Bukak Tautan")}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* MODE 3: CUSTOM IMAGE */}
                    {flagshipMediaType === "image" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-mono text-neutral-300 font-medium">
                            {tx("Gambar Showcase Statis", "Static Showcase Image", "Gambar Showcase Statis")} <span className="text-[#16b09f]">*</span>
                          </label>
                          {flagshipImageUrl && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              ● {tx("Gambar Aktif", "Image Active", "Gambar Aktif")}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={flagshipImageUrl.startsWith("data:") ? `[${tx("Gambar Terupload", "Uploaded Image", "Gambar Taupload")} - ${(flagshipImageUrl.length / 1024).toFixed(0)} KB]` : flagshipImageUrl}
                            onChange={(e) => setFlagshipImageUrl(e.target.value)}
                            placeholder="/assets/antigravity/hero-large.jpg atau URL gambar"
                            readOnly={flagshipImageUrl.startsWith("data:")}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#16b09f]"
                          />
                          <label className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-medium border border-white/15 cursor-pointer shrink-0 flex items-center gap-1.5 transition-all">
                            <HiArrowUpTray className="w-3.5 h-3.5 text-[#16b09f]" />
                            <span>{flagshipImageUrl ? tx("Ganti", "Replace", "Ganti") : "Upload"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleGenericImageFile(e, (dataUrl) => {
                                  setFlagshipImageUrl(dataUrl);
                                  updateStage3Video({ image: dataUrl });
                                })
                              }
                              className="hidden"
                            />
                          </label>
                          {flagshipImageUrl && (
                            <button
                              type="button"
                              onClick={async () => {
                                moveToTrash({
                                  originalId: "stage3-flagship-image",
                                  type: "flagship-video",
                                  title: stage3.heroCard.title || "Showcase Image",
                                  subtitle: tx("Gambar Showcase Statis", "Static Showcase Image", "Gambar Showcase Statis"),
                                  previewImage: flagshipImageUrl,
                                  mediaType: "image",
                                  payload: { stage3: JSON.parse(JSON.stringify(stage3)) },
                                });
                                setFlagshipImageUrl("");
                                await updateStage3Video({ image: "" });
                                await clearStage3ImageFromDB();
                                showToast(tx("Gambar showcase berhasil dihapus & dikosongkan.", "Showcase image deleted & cleared.", "Gambar showcase barasil dihapuih jo dikosongan."));
                              }}
                              className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-mono font-bold border border-rose-500/30 cursor-pointer shrink-0 flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-rose-500/10"
                              title={tx("Hapus gambar ini", "Delete this image", "Hapuih gambar ko")}
                            >
                              <HiTrash className="w-3.5 h-3.5 text-rose-400" />
                              <span>{tx("Hapus", "Delete", "Hapuih")}</span>
                            </button>
                          )}
                        </div>

                        {/* Visual Thumbnail Card for Uploaded Image */}
                        {flagshipImageUrl && (
                          <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                                <img
                                  src={flagshipImageUrl}
                                  alt="Showcase thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-white truncate">
                                  {tx("Thumbnail Showcase Terpasang", "Showcase Thumbnail Loaded", "Thumbnail Showcase Tapasang")}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-mono">
                                  {flagshipImageUrl.startsWith("data:") ? `${(flagshipImageUrl.length / 1024).toFixed(0)} KB WebP/JPG` : flagshipImageUrl}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                moveToTrash({
                                  originalId: "stage3-flagship-image",
                                  type: "flagship-video",
                                  title: stage3.heroCard.title || "Showcase Image",
                                  subtitle: tx("Gambar Showcase Statis", "Static Showcase Image", "Gambar Showcase Statis"),
                                  previewImage: flagshipImageUrl,
                                  mediaType: "image",
                                  payload: { stage3: JSON.parse(JSON.stringify(stage3)) },
                                });
                                setFlagshipImageUrl("");
                                await updateStage3Video({ image: "" });
                                await clearStage3ImageFromDB();
                                showToast(tx("Gambar showcase berhasil dihapus & dikosongkan.", "Showcase image deleted & cleared.", "Gambar showcase barasil dihapuih jo dikosongan."));
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-mono border border-rose-500/20 flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                            >
                              <HiTrash className="w-3 h-3" />
                              <span>{tx("Hapus Gambar", "Remove Image", "Hapuih Gambar")}</span>
                            </button>
                          </div>
                        )}

                        <p className="text-[11px] text-neutral-500 font-mono">
                          {tx("Format disarankan: 16:9 atau 21:9 lanskap resolusi tinggi (JPG, PNG, WebP).", "Recommended: 16:9 or 21:9 high-res landscape (JPG, PNG, WebP).", "Format nan dianjuaan: 16:9 atau 21:9 lanskap resolusi tinggi (JPG, PNG, WebP).")}
                        </p>
                      </div>
                    )}

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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f] transition-all"
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f] transition-all"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f] transition-all resize-y"
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
                          videoEnabled ? "bg-[#16b09f]" : "bg-neutral-800"
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

                  {/* Action Button: Remove / Delete Showcase */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer"
                    >
                      <HiTrash className="w-4 h-4" />
                      <span>{tx("Hapus Video/Media Showcase", "Delete Video/Media Showcase", "Hapuih Video/Media Showcase")}</span>
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
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#16b09f] block mb-0.5 font-semibold">
                      {videoClassTag || "CREATIVE JOURNEY | 2012 TO PRESENT"}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                      {videoHeadline || "A journey shaped by creativity and change."}
                    </h3>
                  </div>

                  {/* Cinematic Media Card Preview */}
                  <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl group">
                    {flagshipMediaType === "youtube" && previewYouTubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${previewYouTubeId}?rel=0&modestbranding=1`}
                        title="YouTube Showcase Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : flagshipMediaType === "gdrive" && previewGDriveId ? (
                      <iframe
                        src={`https://drive.google.com/file/d/${previewGDriveId}/preview`}
                        title="Google Drive Showcase Preview"
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
                        {(flagshipImageUrl || stage3.heroCard.image) ? (
                          <img
                            src={flagshipImageUrl || stage3.heroCard.image}
                            alt="Showcase Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-neutral-500 font-mono text-xs">Pilih atau upload gambar showcase</div>
                        )}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                    {/* Bottom Left: Title & Category */}
                    <div className="absolute bottom-3 left-3 z-20 max-w-[65%] pointer-events-none">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#16b09f] block mb-0.5 font-semibold truncate">
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

        {/* ========================================================
            TAB 7: SETTINGS & ADMIN ACCOUNT WORKSPACE
           ======================================================== */}
        {sidebarTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header Explainer */}
            <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-md ${
              isLight
                ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-sm"
                : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10"
            }`}>
              <span className={`text-[11px] font-mono tracking-widest uppercase font-semibold block mb-1 ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}>
                ADMIN SECURITY & CREDENTIALS
              </span>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {tx("Pengaturan Akun, Ganti Password & URL Login Rahasia", "Account Settings, Password Change & Secret Login URL")}
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                {tx("Kelola kredensial login Admin Panel dan parameter URL rahasia. Perubahan langsung tersimpan di database Supabase Cloud dan LocalStorage sehingga Anda dapat login dengan akun & tautan baru di ", "Manage Admin Panel credentials and secret login URL. Changes update live in Supabase Cloud & LocalStorage for logging in at ")}
                <code className={`font-mono font-bold ${isLight ? "text-teal-700" : "text-[#16b09f]"}`}>?login={adminSecretKey || "secret"}</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Kolom Kiri */}
              <div className={`lg:col-span-7 border rounded-2xl p-5 sm:p-7 backdrop-blur-sm ${
                isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/10"
              }`}>
                <form onSubmit={handleSaveAccount} className="space-y-5">
                  {/* Username */}
                  <div>
                    <label className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}`}>
                      {tx("USERNAME ADMIN", "ADMIN USERNAME")} <span className="text-[#16b09f]">*</span>
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
                        className={`w-full px-4 py-3 pl-10 rounded-xl border text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                          isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-neutral-950 border-white/15 text-white"
                        }`}
                      />
                      <HiUser className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-neutral-500"}`} />
                    </div>
                    <span className={`text-[11px] font-mono mt-1 block ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                      {tx("Username untuk login ke admin panel dashboard.", "Username for logging into the admin panel dashboard.")}
                    </span>
                  </div>

                  {/* Recovery Email */}
                  <div>
                    <label className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}`}>
                      {tx("EMAIL RECOVERY / VERIFIKASI", "RECOVERY / VERIFICATION EMAIL")} <span className="text-[#16b09f]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="rizxstudioproject@gmail.com"
                        className={`w-full px-4 py-3 pl-10 rounded-xl border text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                          isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-neutral-950 border-white/15 text-white"
                        }`}
                      />
                      <HiEnvelope className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-neutral-500"}`} />
                    </div>
                    <span className={`text-[11px] font-mono mt-1 block ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                      {tx("Kode OTP verifikasi saat lupa password akan dikirim ke email ini.", "Verification OTP codes for password recovery will be sent to this email.")}
                    </span>
                  </div>

                  {/* Secret URL Key Input */}
                  <div className={`pt-2 border-t ${isLight ? "border-slate-100" : "border-white/10"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs font-mono font-medium tracking-wide ${isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}`}>
                        {tx("KATA KUNCI URL LOGIN RAHASIA ADMIN", "SECRET ADMIN LOGIN URL PARAMETER")} <span className="text-[#16b09f]">*</span>
                      </label>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isLight ? "bg-teal-50 border-teal-200 text-teal-700 font-bold" : "bg-[#16b09f]/10 border-[#16b09f]/30 text-[#16b09f]"
                      }`}>
                        ?login={adminSecretKey || "secret"}
                      </span>
                    </div>
                    <div className={`relative flex rounded-xl border focus-within:border-[#16b09f] focus-within:ring-1 focus-within:ring-[#16b09f] transition-all overflow-hidden ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-950 border-white/15"
                    }`}>
                      <span className={`inline-flex items-center px-3.5 border-r font-mono text-xs select-none ${
                        isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-neutral-400"
                      }`}>
                        https://rizxstudio.com/?login=
                      </span>
                      <input
                        type="text"
                        value={adminSecretKey}
                        onChange={(e) => {
                          const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                          setAdminSecretKey(clean);
                        }}
                        placeholder="secret"
                        className={`flex-1 px-3.5 py-3 bg-transparent font-bold text-sm font-mono focus:outline-none ${
                          isLight ? "text-teal-700 placeholder:text-slate-400" : "text-[#16b09f] placeholder:text-neutral-600"
                        }`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono mt-1.5">
                      <span className={isLight ? "text-slate-500" : "text-neutral-400"}>
                        {tx("Hanya Anda yang tahu kata kunci ini untuk membuka popup login di domain publik.", "Only you know this key to trigger admin login on the public website.")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const fullUrl = `https://rizxstudio.com/?login=${adminSecretKey || "secret"}`;
                          navigator.clipboard.writeText(fullUrl);
                          showToast(tx("Link URL login rahasia berhasil disalin!", "Secret login URL copied to clipboard!"));
                        }}
                        className={`underline cursor-pointer font-semibold ${isLight ? "text-teal-700 hover:text-teal-800" : "text-cyan-400 hover:text-cyan-300"}`}
                      >
                        {tx("Salin Link 📋", "Copy URL 📋")}
                      </button>
                    </div>
                  </div>

                  {/* Password Baru */}
                  <div className={`pt-2 border-t ${isLight ? "border-slate-100" : "border-white/10"}`}>
                    <label className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}`}>
                      {tx("GANTI PASSWORD BARU (KOSONGKAN JIKA TIDAK INGIN MENGUBAH)", "CHANGE PASSWORD (LEAVE BLANK TO KEEP UNCHANGED)")}
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? "text" : "password"}
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        placeholder={tx("Ketik password baru (minimal 6 karakter)", "Enter new password (min. 6 characters)")}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                          isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-neutral-950 border-white/15 text-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer p-1 ${
                          isLight ? "text-slate-400 hover:text-slate-700" : "text-neutral-500 hover:text-white"
                        }`}
                        aria-label="Toggle password visibility"
                      >
                        {showAdminPass ? <HiXMark className="w-4 h-4" /> : <HiLockClosed className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password Baru */}
                  {adminPass && (
                    <div>
                      <label className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${isLight ? "text-slate-700 font-semibold" : "text-neutral-300"}`}>
                        {tx("KONFIRMASI PASSWORD BARU", "CONFIRM NEW PASSWORD")} <span className="text-[#16b09f]">*</span>
                      </label>
                      <input
                        type={showAdminPass ? "text" : "password"}
                        value={adminConfirmPass}
                        onChange={(e) => setAdminConfirmPass(e.target.value)}
                        placeholder={tx("Ulangi password baru yang sama", "Repeat the same new password")}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                          isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-neutral-950 border-white/15 text-white"
                        }`}
                      />
                    </div>
                  )}
                </form>
              </div>

              {/* Kolom Kanan: Panduan & Info Keamanan (Image 4) */}
              <div className="lg:col-span-5 space-y-4">
                <div className={`p-5 rounded-2xl border backdrop-blur-sm space-y-3.5 ${
                  isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-neutral-900/60 border-white/10"
                }`}>
                  <div className={`flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider ${
                    isLight ? "text-teal-700" : "text-cyan-400"
                  }`}>
                    <HiInformationCircle className="w-4 h-4" />
                    <span>Informasi Akses Admin</span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono leading-relaxed">
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      isLight ? "bg-slate-50 border-slate-200/90 shadow-2xs" : "bg-black/40 border-white/5"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-mono font-semibold ${isLight ? "text-slate-500" : "text-neutral-500"}`}>{tx("URL Akses Rahasia Saat Ini", "Active Secret Access URL")}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const fullUrl = `https://rizxstudio.com/?login=${adminSecretKey || "secret"}`;
                            navigator.clipboard.writeText(fullUrl);
                            showToast(tx("Link URL rahasia disalin!", "Secret URL copied!"));
                          }}
                          className={`text-[10px] underline font-mono cursor-pointer font-bold ${isLight ? "text-teal-700 hover:text-teal-800" : "text-cyan-400 hover:text-cyan-300"}`}
                        >
                          {tx("Salin 📋", "Copy 📋")}
                        </button>
                      </div>
                      <span className={`font-bold block break-all font-mono text-xs sm:text-sm ${isLight ? "text-teal-700" : "text-[#16b09f]"}`}>
                        https://rizxstudio.com/?login={adminSecretKey || "secret"}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border space-y-1 ${
                      isLight ? "bg-slate-50 border-slate-200/90 shadow-2xs" : "bg-black/40 border-white/5"
                    }`}>
                      <span className={`text-[10px] uppercase block font-semibold ${isLight ? "text-slate-500" : "text-neutral-500"}`}>Email Verifikasi Pemulihan</span>
                      <span className={`font-bold block break-all ${isLight ? "text-slate-900" : "text-white"}`}>
                        rizxstudioproject@gmail.com
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border space-y-1 ${
                      isLight ? "bg-slate-50 border-slate-200/90 shadow-2xs" : "bg-black/40 border-white/5"
                    }`}>
                      <span className={`text-[10px] uppercase block font-semibold ${isLight ? "text-slate-500" : "text-neutral-500"}`}>Shortcut Keyboard Cepat</span>
                      <span className={`block ${isLight ? "text-slate-700 font-medium" : "text-white"}`}>
                        Tekan <kbd className={`px-1.5 py-0.5 rounded font-bold border ${isLight ? "bg-slate-200 border-slate-300 text-teal-800" : "bg-white/10 text-cyan-400"}`}>Ctrl + Shift + A</kbd> dari halaman utama web.
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border space-y-1 ${
                      isLight ? "bg-slate-50 border-slate-200/90 shadow-2xs" : "bg-black/40 border-white/5"
                    }`}>
                      <span className={`text-[10px] uppercase block font-semibold ${isLight ? "text-slate-500" : "text-neutral-500"}`}>Sinkronisasi Cloud</span>
                      <span className={`block font-semibold flex items-center gap-1.5 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Supabase Database Aktif
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )}
</div>

        {/* Mobile Sticky Save Bar (Only visible on mobile when inside workspace) */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 p-3.5 border-t backdrop-blur-xl z-40 flex items-center justify-between gap-3 ${
          isLight ? "bg-white/95 border-slate-200" : "bg-[#090b10]/95 border-white/10"
        }`}>
          <div className="text-xs">
            <span className="text-neutral-400 block text-[10px]">
              {tx("Status Sinkronisasi", "Sync Status", "Status Sinkronisasi")}
            </span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{tx("Cloud Siap", "Cloud Ready", "Cloud Siap")}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleTopBarSave}
            className="flex-1 py-3 px-6 rounded-2xl text-xs font-bold text-white shadow-xl shadow-teal-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <RiSave3Fill className="w-4 h-4" />
            <span>{tx("Simpan Perubahan", "Save Changes", "Simpan Parubahan")}</span>
            <RiArrowRightLine className="w-4 h-4" />
          </button>
        </div>
</div>

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
                  {tx("Upload Gambar Portofolio", "Upload Portfolio Image")}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {tx("Gambar yang diupload akan langsung tersimpan dan muncul di galeri publik folder klien ini.", "Uploaded image will be saved and displayed live in this client folder's public gallery.")}
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* File Dropzone / Selector */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("File Gambar (JPG, PNG, WEBP)", "Image File (JPG, PNG, WEBP)")} <span className="text-cyan-400">*</span>
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
                    className="w-full border-2 border-dashed border-white/20 hover:border-[#16b09f] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-neutral-950/50 flex flex-col items-center justify-center group"
                  >
                    {uploadPreview ? (
                      <div className="space-y-2">
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="max-h-48 w-auto mx-auto rounded-xl object-contain border border-white/15 shadow-md"
                        />
                        <p className="text-xs text-cyan-400 font-mono">
                          {tx("Klik untuk mengganti gambar", "Click to replace image")}
                        </p>
                      </div>
                    ) : (
                      <div className="py-4 space-y-2">
                        <HiArrowUpTray className="w-10 h-10 text-neutral-500 group-hover:text-[#16b09f] mx-auto transition-colors" />
                        <p className="text-xs sm:text-sm font-semibold text-neutral-300">
                          {tx("Klik untuk memilih file gambar", "Click to select image file")}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          {tx("Mendukung PNG, JPG, JPEG, WEBP", "Supports PNG, JPG, JPEG, WEBP")}
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f] transition-all"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f] transition-all"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#16b09f] transition-all"
                    />
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    Rasio Aspek Tampilan
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["4:5", "1:1", "16:9", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setUploadAspect(ratio)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-center ${
                          uploadAspect === ratio
                            ? "bg-[#16b09f] text-black border-[#16b09f] shadow-sm"
                            : "bg-neutral-950 text-neutral-400 border-white/10 hover:text-white"
                        }`}
                      >
                        {ratio}
                        <span className="block text-[10px] font-normal opacity-85">
                          {ratio === "4:5"
                            ? "Portrait"
                            : ratio === "1:1"
                            ? "Square"
                            : ratio === "16:9"
                            ? "Landscape"
                            : "IG Story"}
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
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all"
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
                            className="px-2 py-0.5 rounded-full bg-[#16b09f]/15 border border-[#16b09f]/30 text-[#16b09f] text-[10px] font-mono font-semibold"
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
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>{tx("Upload & Tambahkan ke Web", "Upload & Add to Web")}</span>
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
                    {tx("Batal", "Cancel")}
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
                    Folder: <span className="text-white font-mono">{selectedClient?.clientName}</span> · {tx("Perubahan langsung aktif di popup Case Study web publik.", "Changes update live in public Case Study popup.")}
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                      {(["4:5", "1:1", "16:9", "9:16"] as const).map((asp) => (
                        <button
                          key={asp}
                          type="button"
                          onClick={() => setEditWorkAspect(asp)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer text-center ${
                            editWorkAspect === asp
                              ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300"
                              : "bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>{asp}</span>
                          <span className="block text-[9px] font-normal opacity-75">
                            {asp === "4:5"
                              ? "Portrait"
                              : asp === "1:1"
                              ? "Square"
                              : asp === "16:9"
                              ? "Landscape"
                              : "IG Story"}
                          </span>
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
                    <label className="block text-xs font-mono text-[#16b09f] font-medium mb-1.5 flex items-center gap-1.5">
                      <span>✅</span>
                      <span>Solusi & Pendekatan (Solution)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editWorkSolution}
                      onChange={(e) => setEditWorkSolution(e.target.value)}
                      placeholder="Solusi kreatif atau teknis yang diimplementasikan..."
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-[#16b09f]/30 text-white text-xs sm:text-sm focus:outline-none focus:border-[#16b09f] transition-all resize-none leading-relaxed"
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
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#16b09f] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>{tx("Simpan Perubahan & Update Web", "Save Changes & Update Web")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingWork(null)}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    {tx("Batal", "Cancel")}
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#16b09f] font-semibold block mb-1">
                  FOLDER MANAGEMENT
                </span>
                <h3 className="text-xl font-bold text-white">{tx("Buat Folder Klien Baru", "Create New Client Folder")}</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {tx("Folder baru akan langsung tampil di panel My Work & galeri publik website.", "New folder will immediately appear in the My Work panel & public gallery.")}
                </p>
              </div>

              <form onSubmit={handleAddFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("Nama Brand / Klien", "Brand / Client Name")} <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder={tx("Contoh: Nike, Samsung, Local Brand Co.", "Example: Nike, Samsung, Local Brand Co.")}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all"
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
                    {tx("Kategori / Tipe Kolaborasi", "Category / Collaboration Type")}
                  </label>
                  <input
                    type="text"
                    value={newFolderCategory}
                    onChange={(e) => setNewFolderCategory(e.target.value)}
                    placeholder={tx("Contoh: Brand Visuals & Ads, Digital Campaign", "Example: Brand Visuals & Ads, Digital Campaign")}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-[#16b09f] transition-all"
                  />
                </div>

                {/* Tahun kolaborasi */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("Tahun Kolaborasi", "Collaboration Year")}
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2099"
                    value={newFolderYear}
                    onChange={(e) => setNewFolderYear(e.target.value)}
                    placeholder={new Date().getFullYear().toString()}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-[#16b09f] transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiFolderPlus className="w-4 h-4" />
                    <span>{tx("Buat Folder", "Create Folder")}</span>
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
                    {tx("Batal", "Cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT NAMA BRAND / FOLDER */}
      <AnimatePresence>
        {editingFolder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#0e1015] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setEditingFolder(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block mb-1">
                  FOLDER: client - {editingFolder.clientName}
                </span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HiPencilSquare className="w-5 h-5 text-cyan-400" />
                  <span>{tx("Edit Nama Brand", "Edit Brand Name")}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {tx("Ubah nama brand ini. Nama baru akan otomatis diperbarui di kartu admin, tag folder (client - [Nama]), dan web publik.", "Update this brand name. The new name will reflect across admin cards, folder tags (client - [Name]), and public web.")}
                </p>
              </div>

              <form onSubmit={handleSaveEditFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("Nama Brand", "Brand Name")} <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value)}
                    placeholder="Contoh: Nike, Apple, dsb"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all font-semibold"
                  />
                  <span className="text-[11px] font-mono text-neutral-500 mt-1 block">
                    {tx("Format di kartu akan menjadi: ", "Card format will be: ")}
                    <code className="text-cyan-400">client - {editFolderName.trim() || editingFolder.clientName}</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-medium mb-1.5">
                    {tx("Kategori / Sub-judul Portfolio", "Category / Subtitle")}
                  </label>
                  <input
                    type="text"
                    value={editFolderCategory}
                    onChange={(e) => setEditFolderCategory(e.target.value)}
                    placeholder={`Portfolio — ${editFolderName.trim() || editingFolder.clientName}`}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!editFolderName.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-[#16b09f] hover:from-cyan-400 hover:to-[#119889] text-black font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>{tx("Simpan Perubahan Nama", "Save Brand Name")}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer Modal (Burger Menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-end sm:hidden bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className={`admin-mobile-drawer w-full border-t rounded-t-3xl p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto space-y-4 ${
                isLight
                  ? "bg-white border-slate-200 text-slate-800"
                  : "bg-[#0d0e14] border-white/15 text-white"
              }`}
            >
              {/* Drawer Header */}
              <div className={`flex items-center justify-between pb-3 border-b ${
                isLight ? "border-slate-100" : "border-white/10"
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`admin-drawer-logo w-8 h-8 rounded-lg border flex items-center justify-center p-1.5 shrink-0 ${
                    isLight ? "bg-slate-100 border-slate-200 shadow-sm" : "bg-neutral-900 border-white/10 shadow-md shadow-black/40"
                  }`}>
                    <img
                      src="/navbar-logo.png"
                      alt="Rizx Studio"
                      className={`w-full h-full object-contain ${isLight ? "" : "brightness-0 invert"}`}
                    />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Rizx Studio Admin</h3>
                    <p className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Creative Production Workspace</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`admin-drawer-close w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Action Buttons & Language Switcher */}
              <div className="space-y-2 pt-1 pb-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleTopBarSave();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#16b09f] hover:from-emerald-400 hover:to-[#119889] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    <HiCheck className="w-4 h-4" />
                    <span>{tx("Simpan Perubahan", "Save Changes", "Simpan Parubahan")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await handleTopBarReset();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`admin-drawer-reset py-2.5 px-3.5 rounded-xl border font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border-white/10"
                    }`}
                    title={tx("Kembalikan pengaturan ke default", "Reset to default settings", "Baliakkan ka setelan awal")}
                  >
                    <HiArrowPath className={`w-3.5 h-3.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`} />
                    <span>{tx("Reset", "Reset", "Reset")}</span>
                  </button>
                </div>

                <div className={`admin-drawer-lang-box flex items-center justify-between px-3 py-2 rounded-xl border ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/90 border-white/10"
                }`}>
                  <span className={`text-[11px] font-mono ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {tx("Bahasa UI", "Interface Language", "Bahaso UI")}:
                  </span>
                  <div className={`admin-drawer-lang-pill flex items-center gap-1 p-0.5 rounded-lg border ${
                    isLight ? "bg-white border-slate-200" : "bg-black/40 border-white/5"
                  }`}>
                    {(["id", "en", "min"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLang(l)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                          lang === l
                            ? "bg-[#16b09f] text-black shadow-sm shadow-[#16b09f]/30"
                            : isLight
                            ? "text-slate-600 hover:text-slate-900"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Items List — All 13 REAL Portfolio Admin Sections */}
              <div className="space-y-1.5 pt-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 block mb-1 ${
                  isLight ? "text-slate-500 font-semibold" : "text-neutral-500"
                }`}>
                  {tx("KONTROL PORTOFOLIO", "PORTFOLIO CONTROLS", "PANGATURAN PORTOFOLIO")}
                </span>

                {[
                  {
                    id: "clients" as AdminSidebarTab,
                    label: tx("Portfolio & Clients", "Portofolio & Klien", "Portofolio & Klien"),
                    sub: tx("Folder klien & logo partner marquee", "Client folders & partner logos", "Folder klien & logo partner marquee"),
                    icon: HiFolder,
                    badge: clients.length > 0 ? clients.length : undefined,
                  },
                  {
                    id: "hero-banner" as AdminSidebarTab,
                    label: tx("Hero Banner (Scrolly)", "Banner Utama (Scrolly)", "Banner Utamo (Scrolly)"),
                    sub: tx("Hero Banner & animasi scrolly", "Hero banner & scrolly motion", "Hero Banner & animasi scrolly"),
                    icon: HiSparkles,
                  },
                  {
                    id: "hero-works" as AdminSidebarTab,
                    label: tx("Hero & Selected Works", "Hero & Karya Unggulan", "Hero & Karya Tapiliah"),
                    sub: tx("3 karya sorotan utama", "3 top highlighted works", "3 karya sorotan utamo"),
                    icon: HiPhoto,
                  },
                  {
                    id: "flagship" as AdminSidebarTab,
                    label: tx("Media Showcase (Stage 3)", "Pameran Media (Stage 3)", "Pameran Media (Stage 3)"),
                    sub: tx("Stage 3 video & reels", "Stage 3 video & reels showcase"),
                    icon: HiVideoCamera,
                  },
                  {
                    id: "runner" as AdminSidebarTab,
                    label: tx("Running Portfolio (4:5)", "Portofolio Berjalan (4:5)", "Portofolio Baguliah (4:5)"),
                    sub: tx("Karya poster vertikal marquee", "Vertical marquee poster cards", "Karya poster tagak marquee"),
                    icon: HiSquares2X2,
                  },
                  {
                    id: "about" as AdminSidebarTab,
                    label: tx("About Me Section", "Tentang Saya", "Tantang Ambo"),
                    sub: tx("Profil, bio & kontak", "Profile bio & contacts", "Profil, biografi & kontak"),
                    icon: HiUser,
                  },
                  {
                    id: "motion" as AdminSidebarTab,
                    label: tx("Motion & Cursor", "Motion & Kursor", "Motion & Kursor"),
                    sub: tx("Efek gerak, scroll & kursor magnetik", "Motion effects, scroll & magnetic cursor", "Efek garak, scroll & kursor magnetik"),
                    icon: RiCursorFill,
                  },
                  {
                    id: "theme" as AdminSidebarTab,
                    label: tx("Theme & Colors", "Warna & Tema", "Warna & Tema"),
                    sub: tx("Skema warna aksen & kustomisasi UI", "Accent colors & UI themes", "Skema warna aksen & kustomisasi UI"),
                    icon: RiPaletteFill,
                  },
                  {
                    id: "social" as AdminSidebarTab,
                    label: tx("Contact & Socials", "Kontak & Sosmed", "Kontak & Sosmed"),
                    sub: tx("WhatsApp, email & tautan sosial", "WhatsApp, email & social links", "WhatsApp, email & tautan sosial"),
                    icon: RiChat3Fill,
                  },
                  {
                    id: "crm" as AdminSidebarTab,
                    label: tx("CRM & Analytics", "CRM & Prospek", "CRM & Prospek"),
                    sub: tx("Data telemetri pengunjung & prospek lead", "Visitor telemetry & leads analytics", "Data pangunjuang & prospek lead"),
                    icon: RiLineChartFill,
                  },
                  {
                    id: "seo" as AdminSidebarTab,
                    label: tx("SEO & Search Engine", "SEO & Mesin Pencari", "SEO & Masin Pancari"),
                    sub: tx("Meta tag Google, verifikasi & pratinjau medsos", "Google meta tags, verification & social previews", "Meta tag Google, verifikasi & pratinjau medsos"),
                    icon: RiSearchEyeFill,
                  },
                  {
                    id: "trash" as AdminSidebarTab,
                    label: tx("Recycle Bin", "Tong Sampah", "Tong Sarok"),
                    sub: tx("Item terhapus & pemulihan", "Deleted items & recovery", "Item tahapuih & pamuliahan"),
                    badge: trashItems.length > 0 ? trashItems.length : undefined,
                    icon: HiTrash,
                  },
                  {
                    id: "storage" as AdminSidebarTab,
                    label: tx("Storage & Analytics", "Kapasitas & Data", "Panyimpanan & Data"),
                    sub: tx("Grafik animasi & Resource Library", "Storage graphics & Resource Library", "Grafik visual & Resource Library"),
                    badge: clients.reduce((acc, c) => acc + (c.works?.length || 0), 0) > 0 ? clients.reduce((acc, c) => acc + (c.works?.length || 0), 0) : undefined,
                    icon: HiChartPie,
                  },
                  {
                    id: "settings" as AdminSidebarTab,
                    label: tx("Password & Security", "Sandi & Keamanan Akun", "Kunci & Kaamanan Akun"),
                    sub: tx("Sandi, verifikasi & keamanan", "Password & account security", "Kunci, verifikasi & kaamanan akun"),
                    icon: HiKey,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = sidebarTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSidebarTab(item.id);
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                        setMobileScreen("workspace");
                      }}
                      className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#16b09f] text-black border-[#16b09f] shadow-lg shadow-[#16b09f]/25 font-bold"
                          : isLight
                          ? "admin-drawer-nav-item bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                          : "admin-drawer-nav-item bg-neutral-900/60 hover:bg-neutral-900 text-neutral-300 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "admin-drawer-nav-icon bg-black/15 text-black"
                              : isLight
                              ? "admin-drawer-nav-icon bg-slate-200/80 text-teal-700"
                              : "admin-drawer-nav-icon bg-white/5 text-[#16b09f]"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                          <p
                            className={`text-[10px] mt-0.5 leading-tight truncate ${
                              isSelected
                                ? "text-neutral-900 font-medium"
                                : isLight
                                ? "text-slate-500 font-sans"
                                : "text-neutral-400 font-mono"
                            }`}
                          >
                            {item.sub}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isSelected
                                ? "bg-black/20 text-black"
                                : isLight
                                ? "bg-slate-200 text-slate-700"
                                : "bg-white/10 text-neutral-300"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-black shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View Public Web Shortcut & Logout in Mobile Drawer */}
              <div className={`pt-2 border-t space-y-2 ${isLight ? "border-slate-100" : "border-white/10"}`}>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#16b09f] to-cyan-500 hover:from-[#119889] hover:to-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer no-underline"
                >
                  <HiEye className="w-4 h-4" />
                  <span>{tx("Lihat Web Publik ↗", "View Public Web ↗")}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    adminLogout();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer transition-colors ${
                    isLight
                      ? "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700"
                      : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400"
                  }`}
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" />
                  <span>{tx("Keluar Admin (Logout)", "Logout Admin", "Kalua Admin")}</span>
                </button>
              </div>
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
            className="fixed bottom-6 right-6 z-[120] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900 border border-[#16b09f]/50 text-white shadow-2xl backdrop-blur-xl text-xs sm:text-sm font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-[#16b09f] text-black flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


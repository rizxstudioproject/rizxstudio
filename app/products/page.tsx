"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import ProjectTrackerModal from "@/components/ProjectTrackerModal";
import { registerTrackedProject } from "@/lib/projectTrackerService";
import {
  getAllProducts,
  DEFAULT_PRODUCTS,
  DEFAULT_CATEGORIES,
  getLocalizedProduct,
  ProductItem,
  ProductPackage,
} from "@/lib/productsService";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { addRealLead } from "@/lib/crmService";
import { formatWhatsAppUrl } from "@/lib/socialService";
import {
  RiPaintLine,
  RiBookOpenLine,
  RiGlobalLine,
  RiLayoutMasonryLine,
  RiVideoLine,
  RiSmartphoneLine,
  RiPlayCircleLine,
  RiBox3Line,
  RiMagicLine,
  RiCameraLine,
  RiTeamLine,
  RiCompass3Line,
  RiRocketLine,
  RiSparklingLine,
  RiCheckLine,
  RiArrowRightLine,
  RiWhatsappLine,
  RiTimeLine,
  RiRefreshLine,
  RiSearchLine,
  RiCloseLine,
  RiCheckboxCircleFill,
  RiSendPlaneFill,
  RiFileCopyLine,
  RiArrowLeftLine,
  RiFileList3Line,
  RiLockLine,
} from "react-icons/ri";

export default function ProductsPage() {
  const { lang, tr } = useLang();
  const { themeMode, primaryColor, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";

  // Dynamic products catalog state connected to Supabase & LocalStorage
  const [productsList, setProductsList] = useState<ProductItem[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    getAllProducts().then((data) => {
      if (isMounted && data && data.length > 0) {
        setProductsList(data);
      }
    });

    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<ProductItem[]>;
      if (custom.detail) {
        setProductsList(custom.detail);
      }
    };
    window.addEventListener("rizx_products_updated", handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener("rizx_products_updated", handleSync);
    };
  }, []);

  // Multilingual synchronized products
  const localizedProducts = useMemo(() => {
    return productsList.map((p) => getLocalizedProduct(p, lang));
  }, [productsList, lang]);

  // Dynamic category tabs with accurate counts
  const dynamicCategories = useMemo(() => {
    return DEFAULT_CATEGORIES.map((cat) => {
      const count =
        cat.id === "all"
          ? localizedProducts.length
          : localizedProducts.filter((p) => p.category === cat.id).length;
      const label =
        lang === "en"
          ? cat.labelEn || cat.label
          : lang === "min"
          ? cat.labelMin || cat.label
          : cat.label;
      return { id: cat.id, label, count };
    });
  }, [localizedProducts, lang]);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Package selection per card (defaults to "pro")
  const [activePackages, setActivePackages] = useState<Record<string, string>>({});

  // Form states
  const [formProduct, setFormProduct] = useState<string>("logo-branding");
  const [formPackage, setFormPackage] = useState<string>("pro");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientTimeline, setClientTimeline] = useState<string>("Standar (1-2 Minggu)");
  const [clientBudget, setClientBudget] = useState<string>("5jt - 15jt IDR");
  const [projectBrief, setProjectBrief] = useState<string>("");

  // Confirmation Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [orderRefId, setOrderRefId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);

  // Form highlight animation state
  const [formHighlighted, setFormHighlighted] = useState<boolean>(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState<boolean>(false);
  const [trackerInitialCode, setTrackerInitialCode] = useState<string>("RZX-PRJ-632153");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get("track") || params.get("ref");
      if (trackParam) {
        setTrackerInitialCode(trackParam);
        setIsTrackerModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = tr(
        "Services & Products — Rizx Studio | By-Project Creative Solutions",
        "Layanan & Produk — Rizx Studio | Solusi Kreatif Berbasis Proyek",
        "Layanan & Produk — Rizx Studio | Solusi Kreatif Proyek"
      );
    }
  }, [tr]);

  // Handle get card active package
  const getActivePackage = (productId: string): string => {
    return activePackages[productId] || "pro";
  };

  const handlePackageToggle = (productId: string, pkgId: string) => {
    setActivePackages((prev) => ({ ...prev, [productId]: pkgId }));
  };

  // Scroll to form and prefill product + package
  const handleSelectPackageCTA = (product: ProductItem, pkg: ProductPackage) => {
    setFormProduct(product.id);
    setFormPackage(pkg.id);
    if (formRef.current) {
      const yOffset = -90;
      const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setFormHighlighted(true);
      setTimeout(() => setFormHighlighted(false), 2400);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return localizedProducts.filter((item) => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.keyFeatures.some((f) => f.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [localizedProducts, selectedCategory, searchQuery]);

  // Icon Resolver
  const renderProductIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 shrink-0" };
    switch (iconName) {
      case "RiPaintLine":
        return <RiPaintLine {...props} />;
      case "RiBookOpenLine":
        return <RiBookOpenLine {...props} />;
      case "RiGlobalLine":
        return <RiGlobalLine {...props} />;
      case "RiLayoutMasonryLine":
        return <RiLayoutMasonryLine {...props} />;
      case "RiVideoLine":
        return <RiVideoLine {...props} />;
      case "RiSmartphoneLine":
        return <RiSmartphoneLine {...props} />;
      case "RiPlayCircleLine":
        return <RiPlayCircleLine {...props} />;
      case "RiBox3Line":
        return <RiBox3Line {...props} />;
      case "RiMagicLine":
        return <RiMagicLine {...props} />;
      case "RiCameraLine":
        return <RiCameraLine {...props} />;
      case "RiTeamLine":
        return <RiTeamLine {...props} />;
      case "RiCompass3Line":
        return <RiCompass3Line {...props} />;
      case "RiRocketLine":
        return <RiRocketLine {...props} />;
      default:
        return <RiSparklingLine {...props} />;
    }
  };

  // Resolved Current Selected Product & Package for the Form
  const selectedProductObj = useMemo(() => {
    return (
      localizedProducts.find((p) => p.id === formProduct) ||
      localizedProducts[0] ||
      getLocalizedProduct(DEFAULT_PRODUCTS[0], lang)
    );
  }, [localizedProducts, formProduct, lang]);

  const selectedPackageObj = useMemo(() => {
    return (
      selectedProductObj.packages.find((pkg) => pkg.id === formPackage) ||
      selectedProductObj.packages[1] ||
      selectedProductObj.packages[0]
    );
  }, [selectedProductObj, formPackage]);

  // Handle Form Submission -> Open Confirmation Modal
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert(tr("Mohon masukkan nama Anda.", "Mohon masukkan nama Anda.", "Mohon masuak-an namo sanak."));
      return;
    }
    if (!clientPhone.trim()) {
      alert(
        tr(
          "Mohon masukkan nomor WhatsApp untuk konfirmasi.",
          "Mohon masukkan nomor WhatsApp untuk konfirmasi.",
          "Mohon masuak-an nomor WhatsApp untuak konfirmasi."
        )
      );
      return;
    }

    // Generate random reference code
    const randomCode = `RZX-PRJ-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderRefId(randomCode);

    registerTrackedProject({
      refCode: randomCode,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      serviceTitle: selectedProductObj.title,
      categoryLabel: selectedProductObj.categoryLabel,
      packageName: selectedPackageObj.name,
      packageDuration: selectedPackageObj.duration,
      budget: clientBudget,
      startDate: new Date().toISOString(),
      targetDeadline: clientTimeline,
      currentStage: "queued",
      progressPercent: 15,
      notes: "Pesanan masuk dari formulir website. Menunggu konfirmasi & jadwal kickoff.",
      deliverables: selectedPackageObj.deliverables,
      updatedAt: new Date().toISOString(),
    }).catch(e => console.warn("Tracker registration notice:", e));

    setIsConfirmOpen(true);
  };

  // Construct Formatted WhatsApp Message
  const buildWhatsAppMessage = () => {
    return `*Halo Rizx Studio / FOMY!* 👋
Saya ingin konsultasi & memesan proyek kreatif dengan detail berikut:

📋 *KODE REFERENSI:* ${orderRefId}
📌 *LAYANAN:* ${selectedProductObj.title} (${selectedProductObj.categoryLabel})
📦 *PAKET PILIHAN:* ${selectedPackageObj.name} (${selectedPackageObj.duration})
💰 *ESTIMASI BUDGET:* ${clientBudget}
⏱️ *TARGET TIMELINE:* ${clientTimeline}

👤 *DATA KLIEN:*
- Nama / Brand: ${clientName}
- WhatsApp: ${clientPhone}
${clientEmail ? `- Email: ${clientEmail}` : ""}

📝 *DETAIL BRIEF & KEBUTUHAN PROYEK:*
${projectBrief ? `"${projectBrief}"` : "Saya ingin berdiskusi lebih lanjut mengenai detail kebutuhan proyek."}

Mohon informasi ketersediaan jadwal dan langkah selanjutnya. Terima kasih!`;
  };

  // Final Action: Send to WhatsApp + Auto Log to CRM
  const handleFinalConfirmWhatsApp = async () => {
    setIsSubmitting(true);
    try {
      // 1. Record lead in real CRM
      await addRealLead({
        name: clientName,
        phone: clientPhone,
        email: clientEmail || undefined,
        service: `${selectedProductObj.title} — ${selectedPackageObj.name}`,
        budget: clientBudget,
        source: "Product Page Form",
        notes: `Ref: ${orderRefId} | Timeline: ${clientTimeline} | Brief: ${projectBrief || "Tidak ada brief tertulis"}`,
        value:
          clientBudget.includes("30jt")
            ? 35000000
            : clientBudget.includes("15jt")
            ? 15000000
            : 7500000,
        status: "New",
      });
    } catch (err) {
      console.warn("CRM auto-logging notice:", err);
    } finally {
      setIsSubmitting(false);
      // 2. Open WhatsApp with formatted message
      const targetPhone = socialContacts.whatsappNumber || "6282170214498";
      const waUrl = formatWhatsAppUrl(targetPhone, buildWhatsAppMessage());
      window.open(waUrl, "_blank");
      setIsConfirmOpen(false);
    }
  };

  // Copy Brief to Clipboard
  const handleCopyBrief = () => {
    const message = buildWhatsAppMessage();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen max-w-full overflow-x-clip bg-[var(--background,#0a0a0a)] text-[var(--foreground,#d4d4d4)] selection:bg-[#16b09f] selection:text-black transition-colors duration-300">
      {/* Global Navbar */}
      <Navbar />

      <main className="relative z-20 pt-28 sm:pt-36 pb-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Breadcrumb / Back Link */}
        <div className="mb-8 flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors py-1 px-3 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25"
          >
            <RiArrowLeftLine className="w-3.5 h-3.5" />
            <span>{tr("Back to Main Portfolio", "Kembali ke Beranda Portofolio", "Babaliak ka Muko")}</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-14 sm:mb-20 text-center max-w-4xl mx-auto">
          {/* Ambient Glow */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[300px] pointer-events-none rounded-full blur-[140px] opacity-20 transition-all duration-500"
            style={{ backgroundColor: primaryColor }}
          />

          <div
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-widest uppercase mb-4 px-3.5 py-1.5 rounded-full border shadow-sm transition-colors duration-300"
            style={{
              color: primaryColor,
              backgroundColor: `${primaryColor}1f`,
              borderColor: `${primaryColor}4d`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}`,
              }}
            />
            <span>{tr("BY-PROJECT CREATIVE PRODUCTION & ENGINEERING", "LAYANAN & PRODUK KREATIF BERBASIS PROYEK", "LAYANAN & PRODUK KREATIF PROYEK")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-5">
            {tr("Transform Ideas into", "Wujudkan Ide Menjadi", "Mambuek Ide Jadi")}{" "}
            <span
              className="font-light italic"
              style={{ color: primaryColor }}
            >
              {tr("High-Impact", "Karya Berdampak", "Karya Rancak")}
            </span>{" "}
            {tr("Creative Projects.", "Secara Terukur.", "Bakasudahan.")}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            {tr(
              "Comprehensive creative services with transparent package tiers, delivered with 11+ years of industry experience across branding, digital imaging, 3D motion, video production, and scalable software engineering.",
              "Ragam layanan kreatif profesional dengan paket pengerjaan transparan. Dikerjakan dengan standar 11+ tahun pengalaman di bidang branding, animasi 3D, video sinematik, hingga rekayasa aplikasi startup.",
              "Ragam layanan kreatif jo paket karajo nan jaleh. Dikarajoan jo pangalaman 11+ taun untuak branding, animasi 3D, video sinematik, sarato aplikasi startup."
            )}
          </p>

          {/* Quick CTA to jump to order form */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (formRef.current) {
                  const yOffset = -90;
                  const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              style={{
                backgroundColor: primaryColor,
                color: "#000000",
                boxShadow: `0 0 25px ${primaryColor}40`,
              }}
              className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{tr("Start a Project / Consultation", "Mulai Konsultasi & Pesan Proyek", "Mulai Diskusi Proyek")}</span>
              <RiArrowRightLine className="w-4 h-4" />
            </button>
            <a
              href={`https://wa.me/${socialContacts.whatsappNumber || "6282170214498"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-white font-medium text-xs sm:text-sm hover:bg-white/[0.08] transition-all flex items-center gap-2"
            >
              <RiWhatsappLine className="w-4 h-4 text-emerald-400" />
              <span>{tr("Chat WhatsApp Direct", "Tanya Langsung via WhatsApp", "Hubungi di WhatsApp")}</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setTrackerInitialCode("RZX-PRJ-632153");
                setIsTrackerModalOpen(true);
              }}
              className="px-6 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-semibold text-xs sm:text-sm hover:bg-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              <RiCompass3Line className="w-4 h-4 text-cyan-400" />
              <span>{tr("Lacak Progres Proyek (Tracking)", "Lacak Progres Proyek (Tracking)", "Lacak Proyek (Tracking)")}</span>
            </button>
          </div>
        </div>

        {/* Category Pills & Search Filter */}
        <div className="mb-10 sm:mb-12 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              {dynamicCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={
                      isActive
                        ? {
                            backgroundColor: `${primaryColor}22`,
                            borderColor: primaryColor,
                            color: primaryColor,
                          }
                        : undefined
                    }
                    className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                      isActive
                        ? "shadow-sm font-semibold"
                        : isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        : "bg-neutral-900/80 border-white/10 text-neutral-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/[0.06] text-neutral-400"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder={tr("Cari layanan...", "Cari layanan...", "Cari layanan...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-9 py-2 rounded-full text-xs border outline-none transition-all ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-900 focus:border-[#16b09f]"
                    : "bg-neutral-900/90 border-white/10 text-white placeholder-neutral-500 focus:border-white/30"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                >
                  <RiCloseLine className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-24">
          {filteredProducts.map((product) => {
            const currentPkgId = getActivePackage(product.id);
            const currentPkg =
              product.packages.find((p) => p.id === currentPkgId) || product.packages[0];

            return (
              <div
                key={product.id}
                className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  product.isClosed
                    ? "bg-neutral-950/90 border-rose-500/30 opacity-90"
                    : isLight
                    ? "bg-white border-slate-200/90 shadow-lg hover:shadow-xl hover:border-slate-300"
                    : "bg-[#0f1115]/90 border-white/[0.09] shadow-2xl hover:border-white/25 hover:bg-[#12141a]"
                }`}
              >
                {/* Closed Order Ribbon */}
                {product.isClosed && (
                  <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <RiLockLine className="w-3.5 h-3.5" />
                      {product.closeReason || tr("Orders Closed / Full Capacity", "Slot Penuh / Pesanan Ditutup", "Slot Panuah / Pasan Ditutuik")}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                      Closed
                    </span>
                  </div>
                )}

                {/* Accent top gradient on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
                  }}
                />

                <div className="p-6 sm:p-7">
                  {/* Card Header: Category & Icon */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span
                      className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-md border"
                      style={{
                        color: primaryColor,
                        backgroundColor: `${primaryColor}15`,
                        borderColor: `${primaryColor}30`,
                      }}
                    >
                      {product.categoryLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      {product.popular && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <RiSparklingLine className="w-3 h-3" />
                          <span>Unggulan</span>
                        </span>
                      )}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center border text-white transition-colors"
                        style={{
                          backgroundColor: `${primaryColor}1a`,
                          borderColor: `${primaryColor}40`,
                          color: primaryColor,
                        }}
                      >
                        {renderProductIcon(product.iconName)}
                      </div>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#16b09f] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4 line-clamp-2">
                    {product.tagline}
                  </p>

                  {/* Key Highlights / Features */}
                  <div className="space-y-1.5 mb-5 pb-5 border-b border-white/[0.08]">
                    {product.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300 font-light">
                        <RiCheckLine className="w-3.5 h-3.5 text-[#16b09f] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Package Selector Tabs */}
                  <div className="mb-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
                      <span>{tr("PILIHAN PAKET:", "PILIHAN PAKET:", "PILIHAN PAKET:")}</span>
                      <span className="text-[10px] text-neutral-500 lowercase">{tr("klik untuk membandingkan", "klik untuk membandingkan", "klik untuak maninjau")}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10">
                      {(["starter", "pro", "enterprise"] as const).map((tierKey) => {
                        const isSelected = currentPkgId === tierKey;
                        const label =
                          tierKey === "starter"
                            ? "Starter"
                            : tierKey === "pro"
                            ? "Pro"
                            : "Enterprise";
                        return (
                          <button
                            key={tierKey}
                            type="button"
                            onClick={() => handlePackageToggle(product.id, tierKey)}
                            style={
                              isSelected
                                ? {
                                    backgroundColor: primaryColor,
                                    color: "#000000",
                                    boxShadow: `0 0 12px ${primaryColor}40`,
                                  }
                                : undefined
                            }
                            className={`py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? "shadow-sm font-bold"
                                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Package Details Box */}
                  <div
                    className="p-4 rounded-xl border transition-all text-xs mb-5"
                    style={{
                      backgroundColor: `${primaryColor}0d`,
                      borderColor: `${primaryColor}30`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-white text-sm">
                        {currentPkg.name}
                      </span>
                      {currentPkg.badge && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border"
                          style={{
                            color: primaryColor,
                            borderColor: `${primaryColor}40`,
                            backgroundColor: `${primaryColor}1a`,
                          }}
                        >
                          {currentPkg.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-300 mb-2.5 font-mono">
                      <span className="flex items-center gap-1 text-neutral-400">
                        <RiTimeLine className="w-3 h-3 text-[#16b09f]" />
                        <span>{currentPkg.duration}</span>
                      </span>
                      <span className="flex items-center gap-1 text-neutral-400">
                        <RiRefreshLine className="w-3 h-3 text-[#16b09f]" />
                        <span>{currentPkg.revisions}</span>
                      </span>
                    </div>

                    <p className="text-neutral-400 text-[11px] font-light mb-3 italic">
                      {currentPkg.description}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono tracking-wider text-neutral-400 block uppercase">
                        Deliverables:
                      </span>
                      {currentPkg.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-300">
                          <span className="text-[#16b09f] font-bold mt-0.5">•</span>
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA on each card */}
                <div className="p-6 pt-0">
                  {product.isClosed ? (
                    <button
                      onClick={() => {
                        const targetPhone = socialContacts.whatsappNumber || "6282170214498";
                        const inquiryMsg = `Halo Rizx Studio! Saya tertarik dengan layanan "${product.title}". Karena saat ini slot pemesanan sedang penuh, bisakah saya dimasukkan ke antrean / waiting list berikutnya? Terima kasih.`;
                        const waUrl = formatWhatsAppUrl(targetPhone, inquiryMsg);
                        window.open(waUrl, "_blank");
                      }}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RiLockLine className="w-3.5 h-3.5" />
                      <span>{tr("Orders Closed — Inquire Next Slot", "Slot Penuh — Tanya Antrean Berikutnya", "Slot Panuah — Tanyo Antrean")}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPackageCTA(product, currentPkg)}
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        borderColor: `${primaryColor}50`,
                        color: primaryColor,
                      }}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs border hover:brightness-125 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
                    >
                      <span>{tr("Select Package & Fill Brief", "Pilih Paket & Isi Brief Proyek", "Pilih Paket & Tulis Brief")}</span>
                      <RiArrowRightLine className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── PROJECT BRIEF & ORDER ESTIMATOR FORM ── */}
        <section
          ref={formRef}
          id="project-form"
          className={`relative rounded-3xl border p-6 sm:p-12 transition-all duration-500 overflow-hidden ${
            formHighlighted
              ? "border-[#16b09f] shadow-[0_0_50px_rgba(22,176,159,0.3)] scale-[1.005]"
              : isLight
              ? "bg-white border-slate-200 shadow-xl"
              : "bg-[#0c0e12] border-white/10 shadow-2xl"
          }`}
        >
          {/* Subtle Ambient Brand Glow behind Form */}
          <div
            className="absolute -top-32 right-0 w-[400px] h-[400px] pointer-events-none rounded-full blur-[140px] opacity-15"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="max-w-3xl mx-auto">
            {/* Header Form */}
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase mb-3 px-3 py-1 rounded-full border"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}1a`,
                  borderColor: `${primaryColor}40`,
                }}
              >
                <RiFileList3Line className="w-3.5 h-3.5" />
                <span>{tr("FORMULIR KONSULTASI & PEMESANAN PROYEK", "FORMULIR KONSULTASI & PEMESANAN PROYEK", "FORMULIR KONSULTASI & PESAN")}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                {tr("Mulai Proyek Anda Bersama Kami", "Mulai Proyek Anda Bersama Kami", "Mulai Proyek Sanak Basamo Ambo")}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-xl mx-auto">
                {tr(
                  "Pilih layanan, paket yang dibutuhkan, dan sampaikan ringkasan ide Anda. Kami akan mengonfirmasi ketersediaan jadwal serta langkah produksi selanjutnya.",
                  "Pilih layanan, paket yang dibutuhkan, dan sampaikan ringkasan ide Anda. Kami akan mengonfirmasi ketersediaan jadwal serta langkah produksi selanjutnya.",
                  "Pilih layanan, paket nan diparalukan, sarato tulih ringkasan ide sanak. Kito lanjuik-an langsuang di WhatsApp."
                )}
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* 1. Pilih Produk & Paket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    1. Layanan / Produk <span className="text-[#16b09f]">*</span>
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl text-sm border outline-none font-medium cursor-pointer transition-colors ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                        : "bg-neutral-900 border-white/15 text-white focus:border-[#16b09f]"
                    }`}
                  >
                    {dynamicCategories
                      .filter((cat) => cat.id !== "all")
                      .map((cat) => {
                        const catProducts = localizedProducts.filter(
                          (p) => p.category === cat.id
                        );
                        if (catProducts.length === 0) return null;
                        return (
                          <optgroup
                            key={cat.id}
                            label={cat.label}
                            className="bg-neutral-950 text-[#16b09f] font-bold py-1"
                          >
                            {catProducts.map((p) => (
                              <option
                                key={p.id}
                                value={p.id}
                                className="bg-neutral-900 text-white py-2"
                              >
                                {p.title} {p.isClosed ? `[${tr("Closed", "Slot Penuh", "Slot Panuah")}]` : ""}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    2. Pilihan Paket <span className="text-[#16b09f]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["starter", "pro", "enterprise"] as const).map((pkgKey) => {
                      const isSelected = formPackage === pkgKey;
                      const label =
                        pkgKey === "starter"
                          ? "Starter"
                          : pkgKey === "pro"
                          ? "Pro"
                          : "Enterprise";
                      return (
                        <button
                          key={pkgKey}
                          type="button"
                          onClick={() => setFormPackage(pkgKey)}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: primaryColor,
                                  color: "#000000",
                                  boxShadow: `0 0 14px ${primaryColor}40`,
                                }
                              : undefined
                          }
                          className={`py-3 px-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-transparent"
                              : "bg-white/[0.03] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.06]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Selected Package Snapshot Pill */}
              <div
                className="p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  borderColor: `${primaryColor}30`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                  <span className="text-white font-semibold leading-snug">
                    {selectedProductObj.title} — {selectedPackageObj.name}
                  </span>
                </div>
                <span className="text-neutral-400 text-[11px] sm:text-xs shrink-0">
                  {tr("Duration", "Estimasi", "Kiro-kiro")}: {selectedPackageObj.duration}
                </span>
              </div>

              {/* 2. Client Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    3. Nama Lengkap / Brand <span className="text-[#16b09f]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Alexander Vance / Nexus Tech"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                        : "bg-white/[0.04] border-white/10 text-white placeholder-neutral-500 focus:border-white/30"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    4. Nomor WhatsApp <span className="text-[#16b09f]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789 atau +62..."
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                        : "bg-white/[0.04] border-white/10 text-white placeholder-neutral-500 focus:border-white/30"
                    }`}
                  />
                </div>
              </div>

              {/* 3. Email & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    5. Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="klien@perusahaan.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                        : "bg-white/[0.04] border-white/10 text-white placeholder-neutral-500 focus:border-white/30"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    6. Target Timeline
                  </label>
                  <select
                    value={clientTimeline}
                    onChange={(e) => setClientTimeline(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                        : "bg-white/[0.04] border-white/10 text-white focus:border-white/30"
                    }`}
                  >
                    <option value="Urgen (< 1 Minggu)" className="bg-neutral-900 text-white">
                      Urgen (&lt; 1 Minggu)
                    </option>
                    <option value="Standar (1-2 Minggu)" className="bg-neutral-900 text-white">
                      Standar (1 - 2 Minggu)
                    </option>
                    <option value="Menengah (3-4 Minggu)" className="bg-neutral-900 text-white">
                      Menengah (3 - 4 Minggu)
                    </option>
                    <option value="Fleksibel / Sesuai Kesepakatan" className="bg-neutral-900 text-white">
                      Fleksibel / Sesuai Kesepakatan
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    7. Estimasi Budget
                  </label>
                  <select
                    value={clientBudget}
                    onChange={(e) => setClientBudget(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                        : "bg-white/[0.04] border-white/10 text-white focus:border-white/30"
                    }`}
                  >
                    <option value="< 5jt IDR" className="bg-neutral-900 text-white">
                      &lt; Rp 5.000.000
                    </option>
                    <option value="5jt - 15jt IDR" className="bg-neutral-900 text-white">
                      Rp 5.000.000 - Rp 15.000.000
                    </option>
                    <option value="15jt - 30jt IDR" className="bg-neutral-900 text-white">
                      Rp 15.000.000 - Rp 30.000.000
                    </option>
                    <option value="> 30jt IDR" className="bg-neutral-900 text-white">
                      &gt; Rp 30.000.000
                    </option>
                    <option value="Custom Project Scale" className="bg-neutral-900 text-white">
                      Kustom Sesuai Skala Proyek
                    </option>
                  </select>
                </div>
              </div>

              {/* 4. Project Brief */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                  8. Detail Kebutuhan / Brief Proyek (Opsional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Ceritakan tentang tujuan proyek Anda, referensi visual, target pasar, atau fitur khusus yang diinginkan..."
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none resize-y ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#16b09f]"
                      : "bg-white/[0.04] border-white/10 text-white placeholder-neutral-500 focus:border-white/30"
                  }`}
                />
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  style={{
                    backgroundColor: primaryColor,
                    color: "#000000",
                    boxShadow: `0 0 30px ${primaryColor}55`,
                  }}
                  className="w-full py-4 px-8 rounded-full font-bold text-sm sm:text-base hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  <RiSendPlaneFill className="w-5 h-5" />
                  <span>{tr("Tinjau Ringkasan & Konfirmasi Pesanan 🚀", "Tinjau Ringkasan & Konfirmasi Pesanan 🚀", "Tinjau & Konfirmasi Pesanan 🚀")}</span>
                </button>
                <p className="text-center text-[11px] text-neutral-500 font-mono mt-3">
                  🔒 Data Anda terlindungi. Langkah selanjutnya akan membuka ringkasan konfirmasi resmi.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* ── ORDER CONFIRMATION MODAL ── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className={`relative w-full max-w-lg rounded-2xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#111317] border-white/20 text-white"
            } shadow-2xl`}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div
                className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md mb-2"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                <RiCheckboxCircleFill className="w-3.5 h-3.5" />
                <span>Konfirmasi Rincian Proyek</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Ringkasan Pesanan Proyek</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Periksa kembali ringkasan pesanan sebelum diteruskan ke WhatsApp Rizx Studio.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between mb-5 font-mono text-xs">
              <span className="text-neutral-400">Nomor Referensi:</span>
              <span className="font-bold text-[#16b09f]">{orderRefId}</span>
            </div>

            {/* Summary Details */}
            <div className="space-y-3.5 text-xs mb-6">
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400 font-mono">Layanan:</span>
                <span className="font-bold text-right text-white">{selectedProductObj.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400 font-mono">Paket:</span>
                <span className="font-bold text-right text-[#16b09f]">
                  {selectedPackageObj.name} ({formPackage.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400 font-mono">Estimasi Durasi:</span>
                <span className="text-right text-neutral-200">{selectedPackageObj.duration}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400 font-mono">Nama / Klien:</span>
                <span className="font-semibold text-right text-white">{clientName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400 font-mono">WhatsApp:</span>
                <span className="font-mono text-right text-white">{clientPhone}</span>
              </div>
              {clientEmail && (
                <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                  <span className="text-neutral-400 font-mono">Email:</span>
                  <span className="text-right text-neutral-300">{clientEmail}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400 font-mono">Target Waktu:</span>
                <span className="text-right text-neutral-300">{clientTimeline}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400 font-mono">Estimasi Budget:</span>
                <span className="text-right text-neutral-300">{clientBudget}</span>
              </div>
              {projectBrief && (
                <div className="pt-2">
                  <span className="text-neutral-400 font-mono block mb-1">Catatan Brief:</span>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-neutral-300 text-[11px] leading-relaxed italic">
                    &ldquo;{projectBrief}&rdquo;
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setTrackerInitialCode(orderRefId);
                  setIsTrackerModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RiCompass3Line className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lihat Live Tracking Proyek ({orderRefId}) ↗</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalConfirmWhatsApp}
                style={{
                  backgroundColor: primaryColor,
                  color: "#000000",
                }}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <RiWhatsappLine className="w-4 h-4" />
                <span>
                  {isSubmitting ? "Menyiapkan..." : "Konfirmasi & Kirim via WhatsApp"}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyBrief}
                  className="py-2.5 px-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-neutral-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RiFileCopyLine className="w-3.5 h-3.5" />
                  <span>{copiedFeedback ? "Tersalin!" : "Salin Format"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-neutral-300 text-xs font-medium transition-all cursor-pointer text-center"
                >
                  Ubah Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Tracker Modal */}
      <ProjectTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        initialCode={trackerInitialCode}
      />

      {/* Global Contact Section */}
      <Contact />

      {/* Floating WhatsApp Popup */}
      <WhatsAppPopup />
    </div>
  );
}

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import ProjectTrackerModal from "@/components/ProjectTrackerModal";
import ProductPackageCompareModal from "@/components/ProductPackageCompareModal";
import ProductShareModal from "@/components/ProductShareModal";
import OrderReceiptModal from "@/components/OrderReceiptModal";
import { registerTrackedProject } from "@/lib/projectTrackerService";
import { broadcastNewIncomingOrder } from "@/lib/adminNotificationService";
import {
  PAYMENT_ACCOUNTS,
  createReceiptFromOrder,
  OrderReceiptItem,
} from "@/lib/paymentService";
import {
  getAllProducts,
  subscribeToProductsRealtime,
  getDeletedProductIds,
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
  RiFileList3Line,
  RiLockLine,
  RiArrowDownSLine,
  RiShareForwardLine,
  RiDriveLine,
  RiYoutubeFill,
  RiBankCardLine,
  RiShieldCheckLine,
  RiQrCodeLine,
} from "react-icons/ri";
import { parseMediaUrl, resolveThumbnailUrl } from "@/lib/mediaUrlHelper";

export default function ProductsPage() {
  const { lang, tr } = useLang();
  const { themeMode, primaryColor, socialContacts } = useMotionTheme();
  const isLight = themeMode === "light";

  // Dynamic products catalog state connected to Supabase & LocalStorage
  const [productsList, setProductsList] = useState<ProductItem[]>(() => {
    const deleted = getDeletedProductIds();
    return deleted.length > 0
      ? DEFAULT_PRODUCTS.filter((p) => !deleted.includes(p.id))
      : DEFAULT_PRODUCTS;
  });

  useEffect(() => {
    let isMounted = true;
    getAllProducts().then((data) => {
      if (isMounted && data && data.length > 0) {
        setProductsList(data);
      }
    });

    // 1. Supabase Realtime + Cross-tab BroadcastChannel + Storage listener
    const unsubscribe = subscribeToProductsRealtime((freshProducts) => {
      if (isMounted && Array.isArray(freshProducts)) {
        setProductsList(freshProducts);
      }
    });

    // 2. Gentle interval poller (8s) as mobile network fallback
    const intervalId = setInterval(() => {
      getAllProducts().then((data) => {
        if (isMounted && data && data.length > 0) {
          setProductsList(data);
        }
      });
    }, 8000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(intervalId);
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

  // Payment selection states
  const [paymentPlan, setPaymentPlan] = useState<"dp50" | "full">("dp50");
  const [paymentMethod, setPaymentMethod] = useState<"bca" | "mandiri" | "qris" | "dana">("bca");
  const [activeReceipt, setActiveReceipt] = useState<OrderReceiptItem | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [copiedFormAccount, setCopiedFormAccount] = useState<boolean>(false);

  // Confirmation Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [orderRefId, setOrderRefId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);

  // Form highlight animation state
  const [formHighlighted, setFormHighlighted] = useState<boolean>(false);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState<boolean>(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState<boolean>(false);
  const [trackerInitialCode, setTrackerInitialCode] = useState<string>("");

  // Package Comparison Modal state
  const [compareProduct, setCompareProduct] = useState<any | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Dedicated Product & Package Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareTargetProduct, setShareTargetProduct] = useState<any | null>(null);
  const [shareTargetPkg, setShareTargetPkg] = useState<any | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when product picker is open
  useEffect(() => {
    if (isProductPickerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isProductPickerOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProductPickerOpen) {
        setIsProductPickerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProductPickerOpen]);

  // Check URL params for tracking code, shared product, and shared package
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get("track") || params.get("ref");
      if (trackParam) {
        setTrackerInitialCode(trackParam);
        setIsTrackerModalOpen(true);
      }

      // Check for deep-linked shared product and package
      const productParam =
        params.get("product") ||
        (window.location.hash ? window.location.hash.replace("#", "") : null);
      const packageParam = params.get("package") || params.get("pkg");

      if (productParam) {
        if (packageParam) {
          setActivePackages((prev) => ({ ...prev, [productParam]: packageParam }));
        }
        setHighlightedCardId(productParam);

        // Smooth scroll to shared product card
        setTimeout(() => {
          const el = document.getElementById(productParam);
          if (el) {
            const yOffset = -90;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 400);

        setTimeout(() => setHighlightedCardId(null), 4500);
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

  // Open 3-Package comparison modal
  const handleOpenCompareModal = (product: any) => {
    setCompareProduct(product);
    setIsCompareModalOpen(true);
  };

  const handleSelectPackageFromCompare = (productId: string, pkgId: string) => {
    setIsCompareModalOpen(false);
    setFormProduct(productId);
    setFormPackage(pkgId);
    if (formRef.current) {
      const yOffset = -90;
      const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setFormHighlighted(true);
      setTimeout(() => setFormHighlighted(false), 2400);
    }
  };

  // Share Product & Package via dedicated Modal
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleShareProduct = (product: any, pkg?: any) => {
    const currentPkgId = getActivePackage(product.id);
    const activePkg =
      pkg ||
      product.packages?.find((p: any) => p.id === currentPkgId) ||
      product.packages?.[0];

    setShareTargetProduct(product);
    setShareTargetPkg(activePkg);
    setIsShareModalOpen(true);
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

  const selectedCategoryObj = useMemo(() => {
    return dynamicCategories.find((cat) => cat.id === selectedProductObj?.category);
  }, [dynamicCategories, selectedProductObj]);

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

    const newProjectData = {
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
      currentStage: "queued" as const,
      progressPercent: 15,
      notes: `Pesanan formulir website (${paymentPlan === "dp50" ? "DP 50%" : "Full 100%"} via ${paymentMethod.toUpperCase()}). Menunggu verifikasi pembayaran.`,
      deliverables: selectedPackageObj.deliverables,
      brief: projectBrief.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    registerTrackedProject(newProjectData).catch(e => console.warn("Tracker registration notice:", e));
    broadcastNewIncomingOrder(newProjectData);

    // Create official digital order receipt & slip
    const receiptObj = createReceiptFromOrder({
      refCode: randomCode,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      serviceTitle: selectedProductObj.title,
      categoryLabel: selectedProductObj.categoryLabel,
      packageName: selectedPackageObj.name,
      packageDuration: selectedPackageObj.duration,
      deliverables: selectedPackageObj.deliverables,
      budget: clientBudget,
      paymentPlan,
      paymentMethod,
      notes: projectBrief.trim() || undefined,
    });
    setActiveReceipt(receiptObj);
    setIsReceiptModalOpen(true);
  };

  // Construct Formatted WhatsApp Message
  const buildWhatsAppMessage = () => {
    const activeAcc = PAYMENT_ACCOUNTS.find((a) => a.id === paymentMethod) || PAYMENT_ACCOUNTS[0];
    const planText = paymentPlan === "dp50" ? "DP 50% (Uang Muka)" : "Pelunasan 100% (Full Payment)";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://rizxstudio.com";
    const trackingLink = `${origin}/tracking?code=${orderRefId}`;

    return `*Halo Rizx Studio / FOMY!* 👋
Saya ingin konsultasi & mengonfirmasi pesanan proyek kreatif dengan rincian berikut:

📋 *KODE RESI / INVOICE:* ${activeReceipt?.receiptNumber || `RZ-INV-${orderRefId}`}
🔑 *KODE TRACKING PROYEK:* ${orderRefId}
📌 *LAYANAN:* ${selectedProductObj.title} (${selectedProductObj.categoryLabel})
📦 *PAKET PILIHAN:* ${selectedPackageObj.name} (${selectedPackageObj.duration})
💰 *ESTIMASI BIAYA:* ${clientBudget}
💳 *SKEMA PEMBAYARAN:* ${planText}
🏦 *REKENING TUJUAN:* ${activeAcc.name} (${activeAcc.accountNumber})
⏱️ *TARGET WAKTU:* ${clientTimeline}
🔗 *LINK RESI & TRACKING:* ${trackingLink}

👤 *DATA KLIEN:*
- Nama / Brand: ${clientName}
- WhatsApp: ${clientPhone}
${clientEmail ? `- Email: ${clientEmail}` : ""}

📝 *DETAIL BRIEF & KEBUTUHAN PROYEK:*
${projectBrief ? `"${projectBrief}"` : "Saya ingin berdiskusi lebih lanjut mengenai detail kebutuhan proyek."}

Mohon verifikasi resi pembayaran & konfirmasi jadwal kickoff untuk diproses. Terima kasih!`;
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
        notes: `Ref: ${orderRefId} | Bayar: ${paymentPlan} via ${paymentMethod} | Timeline: ${clientTimeline} | Brief: ${projectBrief || "Tidak ada brief tertulis"}`,
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
          <div className="flex items-center justify-center">
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
              className="px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{tr("Consult Now", "Konsultasi Sekarang", "Konsultasi Kini")}</span>
              <RiArrowRightLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-24">
          {filteredProducts.map((product) => {
            const currentPkgId = getActivePackage(product.id);
            const currentPkg =
              product.packages.find((p) => p.id === currentPkgId) || product.packages[0];

            // Resolve media info (Google Drive, YouTube, Internal Storage, direct URL)
            const rawThumb = currentPkg.thumbnailUrl || product.thumbnailUrl || "";
            const parsedMedia = parseMediaUrl(rawThumb);
            const resolvedThumb =
              resolveThumbnailUrl(rawThumb) ||
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

            const isCardHighlighted = highlightedCardId === product.id;

            return (
              <div
                key={product.id}
                id={product.id}
                className={`group relative rounded-2xl border transition-all duration-500 flex flex-col justify-between overflow-hidden scroll-mt-28 ${
                  isCardHighlighted
                    ? "ring-2 ring-[#16b09f] shadow-[0_0_35px_rgba(22,176,159,0.35)] scale-[1.01]"
                    : product.isClosed
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
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
                  }}
                />

                {/* ── CARD THUMBNAIL ON TOP (Aku mau setiap paket ada thumbnail di atasnya) ── */}
                <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-neutral-900/80 border-b border-white/[0.08]">
                  <img
                    src={resolvedThumb}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback for Google Drive
                      if (parsedMedia.type === "gdrive" && parsedMedia.driveId) {
                        const fallbackDrive = `https://drive.google.com/thumbnail?id=${parsedMedia.driveId}&sz=w1000`;
                        if ((e.target as HTMLImageElement).src !== fallbackDrive) {
                          (e.target as HTMLImageElement).src = fallbackDrive;
                          return;
                        }
                      }
                      // Fallback for YouTube
                      if (parsedMedia.type === "youtube" && parsedMedia.youtubeId) {
                        const fallbackYt = `https://img.youtube.com/vi/${parsedMedia.youtubeId}/hqdefault.jpg`;
                        if ((e.target as HTMLImageElement).src !== fallbackYt) {
                          (e.target as HTMLImageElement).src = fallbackYt;
                          return;
                        }
                      }
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  {/* Subtle Dark Vignette at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/40 to-transparent pointer-events-none" />

                  {/* Badges Overlay on Thumbnail */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none z-10">
                    <span
                      className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md shadow-md"
                      style={{
                        color: primaryColor,
                        backgroundColor: "rgba(10, 12, 18, 0.8)",
                        borderColor: `${primaryColor}50`,
                      }}
                    >
                      {product.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      {/* YouTube Video Badge & Link */}
                      {parsedMedia.type === "youtube" && parsedMedia.watchUrl && (
                        <a
                          href={parsedMedia.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={tr("Tonton video demo di YouTube", "Tonton video demo di YouTube", "Tonton video demo")}
                          className="px-2 py-0.5 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-mono flex items-center gap-1 shadow-md backdrop-blur-md transition-all cursor-pointer"
                        >
                          <RiYoutubeFill className="w-3.5 h-3.5 text-white" />
                          <span>Video</span>
                        </a>
                      )}

                      {/* Google Drive Badge */}
                      {parsedMedia.type === "gdrive" && (
                        <span
                          title={tr("Media Google Drive", "Media Google Drive", "Media Google Drive")}
                          className="px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1 shadow-md backdrop-blur-md"
                        >
                          <RiDriveLine className="w-3 h-3 text-emerald-400" />
                          <span>Drive</span>
                        </span>
                      )}

                      {product.popular && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-black border border-amber-300 font-sans shadow-md flex items-center gap-1">
                          <RiSparklingLine className="w-3 h-3 text-black" />
                          <span>Unggulan</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareProduct(product, currentPkg);
                        }}
                        title={tr("Share package", "Bagikan paket layanan ini", "Bagi-an paket ko")}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border text-neutral-300 hover:text-white hover:scale-105 active:scale-90 transition-all backdrop-blur-md shadow-md cursor-pointer"
                        style={{
                          backgroundColor: "rgba(10, 12, 18, 0.8)",
                          borderColor: `${primaryColor}50`,
                          color: primaryColor,
                        }}
                      >
                        <RiShareForwardLine className="w-4 h-4" />
                      </button>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center border text-white backdrop-blur-md shadow-md"
                        style={{
                          backgroundColor: "rgba(10, 12, 18, 0.8)",
                          borderColor: `${primaryColor}50`,
                          color: primaryColor,
                        }}
                      >
                        {renderProductIcon(product.iconName)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCompareModal(product)}
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          borderColor: `${primaryColor}50`,
                          color: primaryColor,
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs border hover:brightness-125 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
                      >
                        <span>{tr("View Details", "Lihat Detailnya", "Caliak Detail Paket")}</span>
                        <RiArrowRightLine className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareProduct(product, currentPkg)}
                        title={tr("Share package", "Bagikan paket layanan ini", "Bagi-an paket ko")}
                        className={`py-2.5 px-3.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
                          isLight
                            ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                            : "bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300 hover:text-white"
                        }`}
                      >
                        <RiShareForwardLine className="w-3.5 h-3.5 text-[#16b09f]" />
                        <span className="text-[11px] font-semibold">{tr("Share", "Bagikan", "Bagi")}</span>
                      </button>
                    </div>
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
                    1. {tr("Layanan / Produk", "Layanan / Produk", "Layanan / Produk")} <span className="text-[#16b09f]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-xl text-left border outline-none font-medium transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 hover:border-[#16b09f] focus:border-[#16b09f]"
                        : "bg-neutral-900 border-white/15 text-white hover:border-white/30 focus:border-[#16b09f]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">
                          {selectedProductObj.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                          {selectedCategoryObj?.label || selectedProductObj.categoryLabel || selectedProductObj.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedProductObj.isClosed && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {tr("Slot Penuh", "Slot Penuh", "Slot Panuah")}
                        </span>
                      )}
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-white/20 transition-colors">
                        <RiArrowDownSLine className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
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

              {/* 5. Payment Scheme & Accounts Selection */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                      9. Skema & Metode Pembayaran Proyek
                    </label>
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <RiShieldCheckLine className="w-3.5 h-3.5" />
                      Resi Otomatis & Terverifikasi
                    </span>
                  </div>

                  {/* Payment Plan: DP 50% vs Lunas 100% */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentPlan("dp50")}
                      className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                        paymentPlan === "dp50"
                          ? "border-[#16b09f] bg-[#16b09f]/10 shadow-[0_0_15px_rgba(22,176,159,0.15)]"
                          : isLight
                          ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <RiBankCardLine className="w-4 h-4 text-[#16b09f]" />
                          DP 50% (Uang Muka)
                        </span>
                        {paymentPlan === "dp50" && (
                          <RiCheckboxCircleFill className="w-4 h-4 text-[#16b09f]" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Mulai pengerjaan dengan DP 50%. Pelunasan 50% setelah proyek selesai disetujui.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentPlan("full")}
                      className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                        paymentPlan === "full"
                          ? "border-[#16b09f] bg-[#16b09f]/10 shadow-[0_0_15px_rgba(22,176,159,0.15)]"
                          : isLight
                          ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <RiCheckboxCircleFill className="w-4 h-4 text-[#16b09f]" />
                          Bayar Lunas 100%
                        </span>
                        {paymentPlan === "full" && (
                          <RiCheckboxCircleFill className="w-4 h-4 text-[#16b09f]" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Pembayaran penuh di awal. Antrean prioritas tinggi dan serah terima file tanpa jeda termin.
                      </p>
                    </button>
                  </div>

                  {/* Payment Accounts Options */}
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    Pilih Rekening / Saluran Pembayaran:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {PAYMENT_ACCOUNTS.map((acc) => {
                      const isSelected = paymentMethod === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setPaymentMethod(acc.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-[#16b09f] bg-[#16b09f]/15"
                              : isLight
                              ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                              : "bg-white/[0.02] border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-white uppercase font-mono">
                              {acc.id === "qris" ? "QRIS" : acc.id.toUpperCase()}
                            </span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#16b09f] shadow-[0_0_8px_#16b09f]" />
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 truncate">
                            {acc.category === "qris" ? "Semua Bank & E-Wallet" : acc.accountHolder}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Account Detail Box with 1-click Copy */}
                  {(() => {
                    const activeAcc =
                      PAYMENT_ACCOUNTS.find((a) => a.id === paymentMethod) || PAYMENT_ACCOUNTS[0];
                    return (
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{activeAcc.name}</span>
                            {activeAcc.badge && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#16b09f]/20 text-[#16b09f] font-mono">
                                {activeAcc.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-white tracking-wider">
                              {activeAcc.accountNumber}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              a.n. <strong className="text-neutral-200">{activeAcc.accountHolder}</strong>
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            {activeAcc.instructions}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(activeAcc.accountNumber);
                              setCopiedFormAccount(true);
                              setTimeout(() => setCopiedFormAccount(false), 2000);
                            }
                          }}
                          className="self-start sm:self-center shrink-0 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                        >
                          <RiFileCopyLine className="w-3.5 h-3.5 text-[#16b09f]" />
                          <span>{copiedFormAccount ? "Tersalin!" : "Salin Rekening"}</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
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
                  <span>{tr("Confirm Order & View Receipt 🧾", "Konfirmasi Order & Terbitkan Resi 🧾", "Konfirmasi Order & Resi 🧾")}</span>
                </button>
                <p className="text-center text-[11px] text-neutral-500 font-mono mt-3">
                  🔒 Data Anda terlindungi. Resi digital resmi & link pembayaran akan langsung diterbitkan untuk konfirmasi langsung.
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
                  setIsConfirmOpen(false);
                  setIsReceiptModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RiFileList3Line className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka Resi & Panduan Bayar Digital 🧾</span>
              </button>

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

      {/* ── CUSTOM PRODUCT SELECTION BOTTOM SHEET / MODAL ── */}
      {isProductPickerOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsProductPickerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full sm:max-w-xl max-h-[85vh] sm:max-h-[82vh] flex flex-col rounded-t-3xl sm:rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 animate-slideUp ${
              isLight
                ? "bg-white border-slate-200 text-slate-900"
                : "bg-[#0d1117] border-white/15 text-white"
            }`}
          >
            {/* Mobile Top Drag Indicator */}
            <div className="w-12 h-1.5 bg-neutral-600/50 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    {tr("Pilih Layanan / Produk", "Pilih Layanan / Produk", "Pilih Layanan / Produk")}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1 font-light">
                  {tr(
                    "Tentukan layanan kreatif yang ingin Anda konsultasikan & pesan",
                    "Tentukan layanan kreatif yang ingin Anda konsultasikan & pesan",
                    "Pilih layanan kreatif untuak Sanak"
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Categories & Products Scroll Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 pb-6">
              {dynamicCategories
                .filter((cat) => cat.id !== "all")
                .map((cat) => {
                  const catProducts = localizedProducts.filter(
                    (p) => p.category === cat.id
                  );
                  if (catProducts.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-2.5">
                      {/* Category Header Badge */}
                      <div className="flex items-center gap-2 px-1">
                        <span
                          className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md border"
                          style={{
                            color: primaryColor,
                            backgroundColor: `${primaryColor}15`,
                            borderColor: `${primaryColor}30`,
                          }}
                        >
                          {cat.label}
                        </span>
                        <div className="h-[1px] flex-1 bg-white/10" />
                      </div>

                      {/* Product Options List */}
                      <div className="space-y-2">
                        {catProducts.map((p) => {
                          const isSelected = formProduct === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setFormProduct(p.id);
                                setIsProductPickerOpen(false);
                              }}
                              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group ${
                                isSelected
                                  ? isLight
                                    ? "bg-emerald-50/80 border-[#16b09f] shadow-sm"
                                    : "bg-[#16b09f]/10 border-[#16b09f] shadow-[0_0_20px_rgba(22,176,159,0.18)]"
                                  : isLight
                                  ? "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                                  : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-semibold text-sm sm:text-base leading-snug">
                                    {p.title}
                                  </span>
                                  {p.isClosed && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      {tr("Slot Penuh", "Slot Penuh", "Slot Panuah")}
                                    </span>
                                  )}
                                </div>
                                {p.tagline && (
                                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                                    {p.tagline}
                                  </p>
                                )}
                              </div>

                              {/* Custom Radio Button */}
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? "border-[#16b09f] bg-[#16b09f]"
                                    : "border-white/25 group-hover:border-white/40"
                                }`}
                              >
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-black shadow-sm" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer Info */}
            <div className="p-3.5 sm:p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-neutral-400 shrink-0">
              <span>{dynamicCategories.filter((c) => c.id !== "all").length} {tr("Kategori Layanan", "Kategori Layanan", "Kategori Layanan")}</span>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
              >
                {tr("Tutup", "Tutup", "Tutuik")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Package Comparison Modal (Perbandingan 3 Paket & Checklist) */}
      <ProductPackageCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        product={compareProduct}
        onSelectPackage={handleSelectPackageFromCompare}
        onSharePackage={(prod, pkg) => handleShareProduct(prod, pkg)}
      />

      {/* Dedicated In-App Package Share Modal (Menampilkan Paket yang Dibagikan) */}
      <ProductShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={shareTargetProduct}
        pkg={shareTargetPkg}
        onOrderPackage={(prod, pkg) => handleSelectPackageCTA(prod, pkg)}
      />

      {/* Project Tracker Modal */}
      <ProjectTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        initialCode={trackerInitialCode}
      />

      {/* Official Order Digital Receipt Modal with Proof Upload & Tracking Link */}
      <OrderReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
        onOpenTracker={(code) => {
          setIsReceiptModalOpen(false);
          setTrackerInitialCode(code);
          setIsTrackerModalOpen(true);
        }}
      />

      {/* Floating Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl bg-neutral-900/95 border border-[#16b09f] text-white shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom duration-300 max-w-md text-xs font-medium">
          <RiCheckboxCircleFill className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="leading-snug">{shareToast}</span>
        </div>
      )}

      {/* Floating WhatsApp Popup */}
      <WhatsAppPopup />
    </div>
  );
}

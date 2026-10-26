/**
 * Products & Services Service — Connected to Supabase Cloud & LocalStorage
 * Full CRUD (Create, Read, Update, Delete) + Open/Close Status
 * Synchronized across 3 languages: English, Bahasa Indonesia, Bahasa Minang
 */
import { supabase, isSupabaseConfigured } from "./supabase";
import { PRODUCTS_DATA as RAW_PRODUCTS, PRODUCT_CATEGORIES as RAW_CATEGORIES } from "@/data/productsData";
import { toMinang } from "@/context/LanguageContext";

export interface ProductPackage {
  id: "starter" | "pro" | "enterprise" | string;
  name: string;
  nameEn?: string;
  nameMin?: string;
  badge?: string;
  badgeEn?: string;
  badgeMin?: string;
  thumbnailUrl?: string; // Optional package-specific thumbnail
  priceNote: string;
  priceNoteEn?: string;
  priceNoteMin?: string;
  duration: string;
  durationEn?: string;
  durationMin?: string;
  revisions: string;
  revisionsEn?: string;
  revisionsMin?: string;
  description: string;
  descriptionEn?: string;
  descriptionMin?: string;
  deliverables: string[];
  deliverablesEn?: string[];
  deliverablesMin?: string[];
  pros?: string[];
  prosEn?: string[];
  prosMin?: string[];
  cons?: string[];
  consEn?: string[];
  consMin?: string[];
  isClosed?: boolean;
}

export interface ProductItem {
  id: string;
  title: string;
  titleEn?: string;
  titleMin?: string;
  category: "branding" | "web-app" | "video-motion" | "visual-craft" | "marketing" | "aerial" | string;
  categoryLabel: string;
  categoryLabelEn?: string;
  categoryLabelMin?: string;
  thumbnailUrl?: string; // High-impact thumbnail on top of product card
  tagline: string;
  taglineEn?: string;
  taglineMin?: string;
  description: string;
  descriptionEn?: string;
  descriptionMin?: string;
  popular?: boolean;
  isClosed?: boolean; // Close / Open order status
  closeReason?: string; // Reason e.g. "Slot Penuh", "Temporary Closed"
  closeReasonEn?: string;
  closeReasonMin?: string;
  iconName: string;
  keyFeatures: string[];
  keyFeaturesEn?: string[];
  keyFeaturesMin?: string[];
  packages: ProductPackage[];
  orderIndex?: number;
  updatedAt?: string;
}

export interface ProductCategory {
  id: string;
  label: string;
  labelEn?: string;
  labelMin?: string;
  count?: number;
}

const STORAGE_KEY = "rizx_products_catalog_custom";
const SUPABASE_PRODUCTS_KEY = "site-products-catalog";

// Pre-seeded comprehensive English, Indonesian, and Minang translations for all 13 products
export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "logo-branding",
    title: "Logo Branding",
    titleEn: "Brand Identity & Logo",
    titleMin: "Logo Branding & Identitas",
    category: "branding",
    categoryLabel: "Branding & Identitas",
    categoryLabelEn: "Branding & Identity",
    categoryLabelMin: "Branding & Identitas",
    thumbnailUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    tagline: "Identitas visual berkarakter kuat, relevan, dan dirancang untuk melekat di benak audiens.",
    taglineEn: "Bold, distinctive visual identity crafted to create an enduring impression.",
    taglineMin: "Identitas visual bakarakter kuek, relevan, sarato dirancang malakek di hati audiens.",
    description:
      "Perancangan identitas visual brand holistik mulai dari eksplorasi filosofis, sketsa konseptual, logo primer & sekunder, sistem warna, kurasi tipografi, hingga panduan brand (brand guideline) agar identitas Anda konsisten di seluruh media fisik maupun digital.",
    descriptionEn:
      "Holistic brand identity design spanning philosophical exploration, conceptual sketches, primary & secondary logos, color systems, typography curation, and complete brand guidelines for consistent cross-channel presence.",
    descriptionMin:
      "Parancangan identitas visual brand sacaro mendalam mulai dari filosofi, sketsa konsep, logo utamo & kaduo, susunan warna, piliahan huruf, sampai buku panduan brand supayo konsisten di sagalo media.",
    popular: true,
    isClosed: false,
    iconName: "RiPaintLine",
    keyFeatures: [
      "Filosofi & Konsep Orisinal",
      "Vector Master File (AI, SVG, EPS, PDF)",
      "Panduan Brand & Tipografi Lengkap",
      "Siap Pakai untuk Cetak & Digital",
    ],
    keyFeaturesEn: [
      "Original Concept & Philosophy",
      "Vector Master Files (AI, SVG, EPS, PDF)",
      "Complete Brand & Typography Guideline",
      "Print & Digital Ready Assets",
    ],
    keyFeaturesMin: [
      "Filosofi & Konsep Asli",
      "Berkas Master Vektor (AI, SVG, EPS, PDF)",
      "Panduan Brand & Huruf Lengkok",
      "Siap Pakai untuak Cetak & Digital",
    ],
    packages: [
      {
        id: "starter",
        name: "Starter Identity",
        nameEn: "Starter Identity",
        nameMin: "Starter Identity",
        badge: "Cocok untuk UMKM & Rintisan",
        badgeEn: "Great for Startups & Small Business",
        badgeMin: "Cocok untuak UMKM & Usaha Baru",
        priceNote: "Sesuai Lingkup Proyek",
        priceNoteEn: "Custom Project Scope",
        priceNoteMin: "Sasuai Lingkup Karajo",
        duration: "3 - 5 Hari Kerja",
        durationEn: "3 - 5 Business Days",
        durationMin: "3 - 5 Hari Karajo",
        revisions: "2x Revisi Mayor",
        revisionsEn: "2x Major Revisions",
        revisionsMin: "2x Revisi Gadang",
        description: "Fondasi identitas visual esensial untuk bisnis baru yang ingin tampil profesional sejak awal.",
        descriptionEn: "Essential visual identity foundation for emerging businesses seeking an immediate professional edge.",
        descriptionMin: "Fondasi visual utamo untuak usaha baru nan nio nampak rancak jo profesional dari awal.",
        deliverables: [
          "1 Konsep Logo Utama + Varian Sekunder / Submark",
          "Palet Warna Brand (HEX, RGB, CMYK)",
          "Pasangan Font Rekomendasi (Typography Pairing)",
          "Format File Lengkap: Vector AI, SVG, PNG High-Res Transparan, PDF",
          "Pratinjau Mockup Realistis (Kartu Nama & Avatar)",
        ],
        deliverablesEn: [
          "1 Primary Logo Concept + Secondary / Submark Variant",
          "Brand Color Palette (HEX, RGB, CMYK)",
          "Curated Typography Pairing Guide",
          "Complete Vector Files: AI, SVG, PNG High-Res Transparent, PDF",
          "Realistic Mockup Previews (Business Card & Avatar)",
        ],
        deliverablesMin: [
          "1 Konsep Logo Utamo + Varian Kaduo / Submark",
          "Susunan Warna Brand (HEX, RGB, CMYK)",
          "Piliahan Huruf Rekomendasi (Typography Pairing)",
          "Format Berkas Lengkok: AI, SVG, PNG Bapolos, PDF",
          "Caliak Mockup Nyato (Kartu Namo & Avatar)",
        ],
      },
      {
        id: "pro",
        name: "Professional Brand System",
        nameEn: "Professional Brand System",
        nameMin: "Professional Brand System",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Rame Dipiliah",
        priceNote: "Standar Agensi Profesional",
        priceNoteEn: "Agency Standard",
        priceNoteMin: "Standar Agensi Profesional",
        duration: "7 - 10 Hari Kerja",
        durationEn: "7 - 10 Business Days",
        durationMin: "7 - 10 Hari Karajo",
        revisions: "4x Revisi Fleksibel",
        revisionsEn: "4x Flexible Revisions",
        revisionsMin: "4x Revisi Leluasa",
        description: "Sistem identitas visual komprehensif dengan panduan guideline detail untuk pertumbuhan bisnis jangka panjang.",
        descriptionEn: "Comprehensive visual identity system with exhaustive brand guidelines engineered for long-term scalability.",
        descriptionMin: "Sistem identitas visual mandalam jo buku panduan lengkap untuak kamajuan usaha jangka panjang.",
        deliverables: [
          "2-3 Eksplorasi Konsep Logo Terarah",
          "Sistem Logo Lengkap (Primer, Sekunder, Monogram, Favicon)",
          "Buku Brand Guideline Lengkap (Logo Rules, Do's & Don'ts, Clear Space)",
          "Desain Stationery (Kartu Nama, Kop Surat, Amplop)",
          "Social Media Kit (Template Profile & Feed Starter)",
          "Master File Vector Terorganisir Siap Cetak & Web",
        ],
        deliverablesEn: [
          "2-3 Directional Logo Concept Explorations",
          "Full Logo Suite (Primary, Secondary, Monogram, Favicon)",
          "Comprehensive Brand Guideline (Logo Rules, Do's & Don'ts, Clear Space)",
          "Stationery Design Suite (Business Card, Letterhead, Envelope)",
          "Social Media Starter Kit (Profile & Feed Templates)",
          "Organized Vector Master Files Ready for Print & Web",
        ],
        deliverablesMin: [
          "2-3 Eksplorasi Konsep Logo Tapiliah",
          "Sistem Logo Lengkok (Utamo, Kaduo, Monogram, Favicon)",
          "Buku Panduan Brand Lengkok (Aturan Logo, Boleh & Pantang)",
          "Desain Berkas Kantor (Kartu Namo, Kop Surek, Amplop)",
          "Paket Sosmed (Template Profil & Feed Awal)",
          "Berkas Master Vektor Rapiah Siap Cetak & Web",
        ],
      },
      {
        id: "enterprise",
        name: "360° Corporate Identity",
        nameEn: "360° Corporate Identity",
        nameMin: "360° Corporate Identity",
        badge: "Skala Korporasi",
        badgeEn: "Enterprise Grade",
        badgeMin: "Skala Parusahoan Gadang",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Enterprise Quote",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "14 - 21 Hari Kerja",
        durationEn: "14 - 21 Business Days",
        durationMin: "14 - 21 Hari Karajo",
        revisions: "Revisi Intensif & Dedicated",
        revisionsEn: "Dedicated Sprint Revisions",
        revisionsMin: "Revisi Intensif Khusus",
        description: "Solusi identitas menyeluruh untuk perusahaan berskala besar, sub-brand, atau rebranding total.",
        descriptionEn: "End-to-end identity architecture for corporations, product ecosystems, and comprehensive rebrands.",
        descriptionMin: "Solusi identitas menyeluruh untuak parusahoan gadang, produk multi-lini, atau rebranding total.",
        deliverables: [
          "Arsitektur Brand & Filosofi Mendalam",
          "Sistem Visual Terintegrasi Multichannel",
          "Brand Book Interaktif & Digital PDF (40+ Halaman)",
          "Asset Supergrafis, Pola Brand (Pattern), & Ilustrasi Kustom",
          "Paket Merchandise & Signage Lingkungan Kantor",
          "Pendampingan Implementasi & Hak Cipta Penuh",
        ],
        deliverablesEn: [
          "Deep Brand Architecture & Strategic Philosophy",
          "Integrated Multichannel Visual Identity System",
          "Interactive Digital Brand Book PDF (40+ Pages)",
          "Supergraphics Assets, Custom Brand Patterns & Iconography",
          "Merchandise Suite & Environmental Signage Layouts",
          "Implementation Support & Full Copyright Transfer",
        ],
        deliverablesMin: [
          "Arsitektur Brand & Filosofi Mandalam",
          "Sistem Visual Terpadu Sagalo Media",
          "Buku Brand Digital Interaktif (40+ Hal)",
          "Aset Pola Khas Brand & Gambar Khusus",
          "Paket Merchandise & Tando Ruang Kantor",
          "Pangawalan Pasang & Hak Cipta Panuah",
        ],
      },
    ],
  },
  {
    id: "company-profile",
    title: "Company Profile",
    titleEn: "Company Profile",
    titleMin: "Company Profile Parusahoan",
    category: "branding",
    categoryLabel: "Branding & Identitas",
    categoryLabelEn: "Branding & Identity",
    categoryLabelMin: "Branding & Identitas",
    thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    tagline: "Profil bisnis representatif dalam format cetak mewah dan dokumen digital interaktif.",
    taglineEn: "High-impact corporate profile in luxury print layout and interactive digital format.",
    taglineMin: "Profil bisnis rancak dalam bantuak cetak elegan sarato berkas digital interaktif.",
    description:
      "Penyusunan profil perusahaan profesional dengan narasi bisnis meyakinkan, visual infografis elegan, dan struktur halaman terarah untuk memikat investor, klien korporasi, serta mitra strategis Anda.",
    descriptionEn:
      "Crafting persuasive corporate profile publications featuring executive narrative, refined infographics, and purposeful editorial hierarchy tailored for enterprise bids, investors, and strategic partners.",
    descriptionMin:
      "Panyusunan profil parusahoan profesional jo carito bisnis nan rancak, infografis ameh, sarato tata letak rapi untuak maetong investor jo kawan karajo.",
    popular: false,
    isClosed: false,
    iconName: "RiBookOpenLine",
    keyFeatures: [
      "Struktur Editorial Bisnis Berbobot",
      "Desain Visual & Infografis Kustom",
      "Siap Cetak High-Res (CMYK 300DPI)",
      "Versi Interaktif Digital PDF (Clickable Links)",
    ],
    keyFeaturesEn: [
      "Structured Executive Editorial Layout",
      "Bespoke Infographics & Financial Data Visuals",
      "High-Resolution Print-Ready (CMYK 300DPI)",
      "Interactive Digital PDF with Clickable Links",
    ],
    keyFeaturesMin: [
      "Susunan Tulisan Bisnis Mandalam",
      "Desain Infografis Khas & Elegan",
      "Siap Cetak Kualitas Tinggi (300 DPI)",
      "Versi Digital Interaktif jo Tautan Aktif",
    ],
    packages: [
      {
        id: "starter",
        name: "Executive Deck (4 - 8 Halaman)",
        nameEn: "Executive Deck (4 - 8 Pages)",
        nameMin: "Executive Deck (4 - 8 Hal)",
        badge: "Ringkas & Efektif",
        badgeEn: "Concise & High Impact",
        badgeMin: "Singkek & Tapek Sasaran",
        priceNote: "Sesuai Halaman Proyek",
        priceNoteEn: "Custom Scope",
        priceNoteMin: "Sasuai Jumlah Hal",
        duration: "4 - 6 Hari Kerja",
        durationEn: "4 - 6 Business Days",
        durationMin: "4 - 6 Hari Karajo",
        revisions: "2x Revisi",
        revisionsEn: "2x Revisions",
        revisionsMin: "2x Revisi",
        description: "Profil perusahaan ringkas untuk pengenalan cepat ke calon klien atau proposal kemitraan awal.",
        descriptionEn: "Compact company profile designed for fast stakeholder pitches and introductory bids.",
        descriptionMin: "Profil parusahoan singkek untuak panjalehan lakeh ka calon klien atau proposal awal.",
        deliverables: [
          "Tata Letak 4 - 8 Halaman Profesional",
          "Infografis Alur Kerja & Layanan Utama",
          "File PDF Digital Ringan Siap Kirim WhatsApp / Email",
          "Master File Siap Cetak (Bleed & Crop Marks)",
        ],
        deliverablesEn: [
          "4 - 8 Page Professional Layout",
          "Workflow & Core Service Infographics",
          "Lightweight Digital PDF Optimized for Email & WhatsApp",
          "Print-Ready Master PDF with Bleed & Crop Marks",
        ],
        deliverablesMin: [
          "Tata Letak 4 - 8 Halaman Profesional",
          "Infografis Alua Karajo & Jaso Utamo",
          "Berkas PDF Ringan Siap Kirim WhatsApp / Surek",
          "Berkas Master Siap Cetak Rapiah",
        ],
      },
      {
        id: "pro",
        name: "Corporate Standard (12 - 20 Halaman)",
        nameEn: "Corporate Standard (12 - 20 Pages)",
        nameMin: "Corporate Standard (12 - 20 Hal)",
        badge: "Paling Diminati",
        badgeEn: "Most Requested",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Korporasi",
        priceNoteEn: "Corporate Tier",
        priceNoteMin: "Standar Parusahoan",
        duration: "8 - 12 Hari Kerja",
        durationEn: "8 - 12 Business Days",
        durationMin: "8 - 12 Hari Karajo",
        revisions: "3x Revisi Detail",
        revisionsEn: "3x Detailed Revisions",
        revisionsMin: "3x Revisi Taratur",
        description: "Buku profil komprehensif mencakup visi-misi, sejarah, portofolio proyek, struktur tim, dan keunggulan kompetitif.",
        descriptionEn: "Comprehensive corporate publication detailing mission, heritage, project case studies, and capabilities.",
        descriptionMin: "Buku profil langkok mancakup visi-misi, sedjarah, contoh karya, susunan tim, sarato keunggulan.",
        deliverables: [
          "Editorial 12 - 20 Halaman Desain Eksklusif",
          "Bantuan Penyempurnaan Copywriting & Alur Cerita",
          "Visualisasi Data Keuangan & Statistik Portofolio",
          "Digital Interactive PDF (Daftar Isi & Link Web Aktif)",
          "Cover Eksklusif (Ready Spot UV / Foil Stamping Mockup)",
        ],
        deliverablesEn: [
          "12 - 20 Page Bespoke Editorial Layout",
          "Copywriting Refinement & Story Arc Structuring",
          "Financial Visuals & Portfolio Metric Charts",
          "Interactive Digital PDF with Clickable Navigation",
          "Finishing Spec Setup (Spot UV / Foil Stamping Ready)",
        ],
        deliverablesMin: [
          "Tata Letak 12 - 20 Halaman Eksklusif",
          "Bantuan Panyalasaian Tulisan & Carito Bisnis",
          "Visualisasi Data Angko & Grafik Hasil Karajo",
          "PDF Interaktif jo Navigasi Tautan Aktif",
          "Desain Muko Sampul Khusus Siap Cetak Mewah",
        ],
      },
      {
        id: "enterprise",
        name: "Annual Report & Master Profile",
        nameEn: "Annual Report & Master Profile",
        nameMin: "Annual Report & Master Profile",
        badge: "Skala Korporasi",
        badgeEn: "Enterprise Tier",
        badgeMin: "Skala Parusahoan Gadang",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Enterprise Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "15 - 25 Hari Kerja",
        durationEn: "15 - 25 Business Days",
        durationMin: "15 - 25 Hari Karajo",
        revisions: "Revisi Dedicated",
        revisionsEn: "Dedicated Sprint Revisions",
        revisionsMin: "Revisi Khusus Panuah",
        description: "Penyusunan laporan tahunan atau profil master skala korporat dengan standar publikasi internasional.",
        descriptionEn: "Enterprise annual report and master corporate profile publication adhering to global disclosure standards.",
        descriptionMin: "Panyusunan laporan tahunan atau profil induak skala gadang manuruik standar publikasi internasional.",
        deliverables: [
          "Halaman 24+ Sesuai Kebutuhan Laporan Korporat",
          "Infografis Kompleks, Grafik Finansial, & Peta Sebaran Bisnis",
          "Fotografi Aset & Retouching Khusus (Opsional)",
          "Paket Cetak Hardcover & E-Book Interaktif",
        ],
        deliverablesEn: [
          "24+ Pages Scaled to Corporate Needs",
          "Complex Infographics, Financial Charts & Geo-Distribution Maps",
          "Asset Photographic Retouching & Grading",
          "Hardcover Print Specs & Interactive E-Book Suite",
        ],
        deliverablesMin: [
          "24+ Halaman Manuruik Kabutuhan Laporan",
          "Infografis Komplit, Grafik Finansial & Peta Lokasi",
          "Pamelokan Foto Aset & Warna Khusus",
          "Paket Cetak Buku Taba & E-Book Interaktif",
        ],
      },
    ],
  },
  {
    id: "web-fullpage",
    title: "Web Fullpage Development",
    titleEn: "Full-Stack Web Development",
    titleMin: "Pambuekan Web Fullpage",
    category: "web-app",
    categoryLabel: "Web & App Development",
    categoryLabelEn: "Web & App Development",
    categoryLabelMin: "Web & App Development",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    tagline: "Website modern, super cepat, interaktif, responsif, dan siap melipatgandakan konversi bisnis.",
    taglineEn: "Modern, ultra-fast, responsive web experiences engineered for high conversion rates.",
    taglineMin: "Website modern, kancank bana, interaktif, sarato siap maningkek-an jualan bisnis.",
    description:
      "Pengembangan website ujung-ke-ujung berbasis Next.js, React, dan Tailwind CSS. Dibangun dengan standar performa skor 95+ Google Lighthouse, animasi interaktif fluid, SEO ramah mesin pencari, serta integrasi CMS / database cloud instan.",
    descriptionEn:
      "End-to-end web engineering powered by Next.js, React, and Tailwind CSS. Built with 95+ Google Lighthouse performance standards, fluid physics-based motion, robust technical SEO, and cloud CMS integrations.",
    descriptionMin:
      "Pangambangan website komplit mamakai Next.js, React, jo Tailwind CSS. Dibuat jo kacepatan 95+ Google Lighthouse, animasi lamah-gemulai, SEO rancak, sarato data cloud tapadukan.",
    popular: true,
    isClosed: false,
    iconName: "RiGlobalLine",
    keyFeatures: [
      "Performa 95+ Google Lighthouse",
      "Desain Responsif Mobile & Desktop",
      "Animasi Modern & Interactive Micro-interactions",
      "Setup Domain, SSL, Cloudflare, & Hosting Vercel",
    ],
    keyFeaturesEn: [
      "95+ Google Lighthouse Score",
      "Mobile-First Responsive Layouts",
      "Modern Motion & Fluid Micro-interactions",
      "Domain, SSL, Cloudflare & Vercel Deployment Setup",
    ],
    keyFeaturesMin: [
      "Kacepatan 95+ Google Lighthouse",
      "Responsif di Handphone jo Laptop",
      "Animasi Modern jo Garik Interaktif",
      "Pasang Domain, SSL, Cloudflare & Hosting Vercel",
    ],
    packages: [
      {
        id: "starter",
        name: "High-Converting Landing Page",
        nameEn: "High-Converting Landing Page",
        nameMin: "High-Converting Landing Page",
        badge: "Single Page / Promo",
        badgeEn: "Single Page / Promo",
        badgeMin: "Satu Halaman / Promo",
        priceNote: "Sesuai Lingkup Proyek",
        priceNoteEn: "Scope Based",
        priceNoteMin: "Sasuai Lingkup Proyek",
        duration: "5 - 7 Hari Kerja",
        durationEn: "5 - 7 Business Days",
        durationMin: "5 - 7 Hari Karajo",
        revisions: "2x Iterasi",
        revisionsEn: "2x Iterations",
        revisionsMin: "2x Iterasi",
        description: "Halaman pendaratan tunggal (landing page) terfokus untuk promosi produk, event, atau validasi startup.",
        descriptionEn: "Focused single-page web destination optimized for product launches, lead capture, and campaigns.",
        descriptionMin: "Laman website tunggal untuak promosi jualan, acara, atau pengenalan bisnis baru.",
        deliverables: [
          "Landing Page 5 - 7 Section (Hero, Value, Layanan, Testimoni, CTA)",
          "Integrasi Form Pemesanan WhatsApp & Email Lead",
          "Setup Domain & Hosting Gratis di Vercel Cloud",
          "Optimasi Loading Cepat (<1.2 detik)",
        ],
        deliverablesEn: [
          "5 - 7 Section Landing Page (Hero, Value, Services, Social Proof, CTA)",
          "WhatsApp Direct & Email Lead Capture Integration",
          "Custom Domain & Free Global Cloud Hosting Setup",
          "Ultra-Fast Load Optimization (<1.2s)",
        ],
        deliverablesMin: [
          "Laman 5 - 7 Bagian (Hero, Nilai Jual, Jaso, Testimoni, CTA)",
          "Sambungan Form Order ka WhatsApp & Surek Lead",
          "Setel Domain & Hosting Langsuang di Vercel",
          "Beban Loading Kancank (<1.2 datiak)",
        ],
      },
      {
        id: "pro",
        name: "Multi-Page Corporate & Portfolio",
        nameEn: "Multi-Page Corporate & Portfolio",
        nameMin: "Multi-Page Corporate & Portfolio",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Rame Dipiliah",
        priceNote: "Standar Agensi",
        priceNoteEn: "Agency Standard",
        priceNoteMin: "Standar Agensi",
        duration: "10 - 18 Hari Kerja",
        durationEn: "10 - 18 Business Days",
        durationMin: "10 - 18 Hari Karajo",
        revisions: "4x Iterasi Komprehensif",
        revisionsEn: "4x Comprehensive Iterations",
        revisionsMin: "4x Iterasi Taratur",
        description: "Situs web lengkap multipage untuk agensi, korporat, atau portofolio studio dengan animasi interaktif halus.",
        descriptionEn: "Full-scale multi-page website for studios, agencies, and corporations featuring rich animations.",
        descriptionMin: "Situs web langkok multi-halaman untuak agensi, usaho, atau portofolio jo animasi lamah-gemulai.",
        deliverables: [
          "Hingga 5-8 Halaman Kustom (Home, About, Services, Works, Contact, dll)",
          "Animasi Fluid (Framer Motion / Tailwind Smooth Transitions)",
          "Sistem Dark / Light Mode Otomatis",
          "Integrasi CMS Supabase / Database Cloud Realtime",
          "SEO On-Page Lengkap, Open Graph Meta, & Google Search Console",
        ],
        deliverablesEn: [
          "Up to 5-8 Custom Pages (Home, About, Services, Works, Contact, etc.)",
          "Fluid Animations & Transitions (Framer Motion / Tailwind)",
          "Dark / Light Mode System",
          "Supabase Cloud CMS / Realtime Data Store",
          "Complete On-Page SEO, Open Graph & Google Search Console Verification",
        ],
        deliverablesMin: [
          "Sampai 5-8 Halaman Kustom (Muko, Tantang, Jaso, Karya, Kontak)",
          "Animasi Lamah-Gemulai (Transitions Halus)",
          "Mode Gelap / Tarang Otomatis",
          "Tapadukan Database Supabase Cloud Realtime",
          "SEO Lengkok, Open Graph Meta & Google Search Console",
        ],
      },
      {
        id: "enterprise",
        name: "Custom Web Application & SaaS Portal",
        nameEn: "Custom Web Application & SaaS Portal",
        nameMin: "Custom Web Application & SaaS Portal",
        badge: "Skala Kompleks",
        badgeEn: "Complex Architecture",
        badgeMin: "Skala Kompleks",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Enterprise Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "20 - 45 Hari Kerja",
        durationEn: "20 - 45 Business Days",
        durationMin: "20 - 45 Hari Karajo",
        revisions: "Dedicated Sprint Support",
        revisionsEn: "Dedicated Sprint Support",
        revisionsMin: "Revisi Khusus Panuah",
        description: "Aplikasi web interaktif dengan portal pengguna, autentikasi aman, payment gateway, dan dashboard admin khusus.",
        descriptionEn: "Interactive web applications equipped with user auth, payment gateway integration, and tailored admin panels.",
        descriptionMin: "Aplikasi web interaktif langkok jo hak akses login, payment gateway, sarato dashboard admin.",
        deliverables: [
          "Arsitektur Web App Kompleks (Next.js App Router + TypeScript)",
          "Autentikasi Pengguna & Role Permission (Admin, Client, Member)",
          "Integrasi Payment Gateway (Midtrans, Xendit, atau Stripe)",
          "Dashboard Analitik & Manajemen Konten Realtime",
          "Dokumentasi Kode, Pengujian End-to-End, & Penyerahan Repository Git",
        ],
        deliverablesEn: [
          "Enterprise Next.js App Router Architecture with TypeScript",
          "Role-Based Access Control (Admin, Client, Member)",
          "Payment Gateway Integration (Midtrans, Xendit, Stripe)",
          "Realtime Analytics & Content Operations Dashboard",
          "Code Documentation, End-to-End Testing & Git Repository Handoff",
        ],
        deliverablesMin: [
          "Arsitektur Web App Mantap (Next.js + TypeScript)",
          "Sistem Login jo Tingkatan Hak Akses",
          "Sambungan Bayar Otomatis (Midtrans / Stripe)",
          "Dashboard Pantau Data & Pangalolaan Isi",
          "Buku Petunjuak Koding & Repository Git Lengkok",
        ],
      },
    ],
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    titleEn: "UI/UX Product Design",
    titleMin: "Desain UI/UX Produk",
    category: "web-app",
    categoryLabel: "Web & App Development",
    categoryLabelEn: "Web & App Development",
    categoryLabelMin: "Web & App Development",
    thumbnailUrl: "https://images.unsplash.com/photo-1581291518655-9523c932694b?auto=format&fit=crop&w=800&q=80",
    tagline: "Desain antarmuka aplikasi intuitif, estetis, dan teruji berdasarkan prinsip user psychology.",
    taglineEn: "Intuitive, aesthetic, user-tested digital product interfaces grounded in behavioral psychology.",
    taglineMin: "Desain aplikasi nan mudah dipahami, rancak di mato, sarato diuji sasuai kabutuhan pangguno.",
    description:
      "Perancangan antarmuka visual (UI) dan pengalaman pengguna (UX) berbasis Figma. Meliputi riset alur pengguna (user journey), wireframing, design system modular berbasis Auto-Layout & Variants, hingga prototipe interaktif siap uji coba dan siap diserahkan ke tim developer.",
    descriptionEn:
      "End-to-end Figma UI/UX product design covering user journey mapping, wireframing, modular design systems utilizing Auto-Layout and component tokens, through high-fidelity interactive prototypes ready for user testing and engineering handoff.",
    descriptionMin:
      "Parancangan antarmuka (UI) jo pangalaman pangguno (UX) mamakai Figma. Dari alua karajo, kakek-kakek desain, sistem desain modular, sampai contoh klik interaktif untuak tim programmer.",
    popular: false,
    isClosed: false,
    iconName: "RiLayoutMasonryLine",
    keyFeatures: [
      "Figma File Terorganisir (Auto-Layout 5.0 & Component Tokens)",
      "Design System Komprehensif (Warna, Tipografi, Elemen UI)",
      "Prototipe Interaktif Siap Presentasi & Demo",
      "Spesifikasi Developer Handoff Detail",
    ],
    keyFeaturesEn: [
      "Organized Figma Architecture (Auto-Layout 5.0 & Tokens)",
      "Comprehensive Design System (Color, Typography, Atoms)",
      "Interactive High-Fidelity Prototype for Stakeholder Demo",
      "Precise Developer Handoff Specifications",
    ],
    keyFeaturesMin: [
      "Berkas Figma Rapiah (Auto-Layout & Komponen)",
      "Sistem Desain Lengkok (Warna, Huruf, Tombol)",
      "Prototipe Interaktif Siap Demo",
      "Panduan Lengkok untuak Developer",
    ],
    packages: [
      {
        id: "starter",
        name: "UI Concept & Landing UI",
        nameEn: "UI Concept & Landing UI",
        nameMin: "UI Concept & Landing UI",
        badge: "Konsep & Validasi",
        badgeEn: "Concept Validation",
        badgeMin: "Konsep & Uji Coba",
        priceNote: "Sesuai Screen Proyek",
        priceNoteEn: "Per-Screen Scope",
        priceNoteMin: "Sasuai Banyak Layar",
        duration: "4 - 7 Hari Kerja",
        durationEn: "4 - 7 Business Days",
        durationMin: "4 - 7 Hari Karajo",
        revisions: "2x Putaran Revisi",
        revisionsEn: "2x Revision Rounds",
        revisionsMin: "2x Putaran Revisi",
        description: "Perancangan visual 1-3 halaman utama atau landing page interaktif untuk presentasi ide.",
        descriptionEn: "Visual craft for 1-3 hero screens or high-impact landing page design to pitch your concept.",
        descriptionMin: "Parancangan visual 1-3 layar utamo untuak presentasi ide bisnis ka kawan.",
        deliverables: [
          "Desain 1-3 Layar Utama Desktop & Mobile",
          "Style Guide Mini (Palet Warna & Pasangan Tipografi)",
          "Prototipe Klik Sederhana",
          "File Figma Terstruktur Siap Pakai",
        ],
        deliverablesEn: [
          "1-3 Core Desktop & Mobile Screen Layouts",
          "Mini Style Guide (Palette & Typography Pairing)",
          "Clickable Interaction Prototype",
          "Structured Clean Figma File",
        ],
        deliverablesMin: [
          "Desain 1-3 Layar Komputer & Handphone",
          "Panduan Gaya Singkek (Warna & Huruf)",
          "Prototipe Klik Sederhana",
          "Berkas Figma Rapiah Siap Pakai",
        ],
      },
      {
        id: "pro",
        name: "Complete App / Web UI/UX",
        nameEn: "Complete App / Web UI/UX",
        nameMin: "Complete App / Web UI/UX",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Proyek",
        priceNoteEn: "Standard Sprint",
        priceNoteMin: "Standar Proyek",
        duration: "10 - 16 Hari Kerja",
        durationEn: "10 - 16 Business Days",
        durationMin: "10 - 16 Hari Karajo",
        revisions: "4x Putaran Revisi",
        revisionsEn: "4x Revision Rounds",
        revisionsMin: "4x Putaran Revisi",
        description: "Alur aplikasi lengkap hingga 12-18 layar dari registrasi hingga alur transaksi utama.",
        descriptionEn: "Complete user flow up to 12-18 screens covering onboarding through checkout flows.",
        descriptionMin: "Alua aplikasi langkok sampai 12-18 layar dari daftar akun sampai proses bayar.",
        deliverables: [
          "Alur Pengguna Lengkap 12 - 18 Layar (Mobile / Web)",
          "Design System Terstruktur (Komponen, Varian, State)",
          "Prototipe Interaktif Kompleks (Micro-animations)",
          "Dokumentasi Handoff untuk Frontend Developer",
        ],
        deliverablesEn: [
          "Complete 12 - 18 Screen User Flows (Mobile / Web)",
          "Structured Design System (Components, Variants, States)",
          "Complex Interactive Prototype with Micro-interactions",
          "Frontend Developer Handoff Documentation",
        ],
        deliverablesMin: [
          "Alua Pengguna 12 - 18 Layar (HP / Web)",
          "Sistem Desain Rapiah jo Komponen Varian",
          "Prototipe Interaktif Hidup jo Animasi",
          "Catatan Lengkok untuak Programmer",
        ],
      },
      {
        id: "enterprise",
        name: "Full Product Design Suite",
        nameEn: "Full Product Design Suite",
        nameMin: "Full Product Design Suite",
        badge: "Skala Produk Penuh",
        badgeEn: "Full Product Suite",
        badgeMin: "Skala Produk Gadang",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Product Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "20 - 35 Hari Kerja",
        durationEn: "20 - 35 Business Days",
        durationMin: "20 - 35 Hari Karajo",
        revisions: "Revisi Dedicated Sprint",
        revisionsEn: "Dedicated Sprint Revisions",
        revisionsMin: "Revisi Khusus Panuah",
        description: "Pengembangan desain produk digital komprehensif, design system multi-platform, dan pengujian usabilitas.",
        descriptionEn: "End-to-end digital product design ecosystem, multi-platform design tokens, and usability testing.",
        descriptionMin: "Pangambangan desain produk digital skala gadang untuak iOS, Android, jo Web.",
        deliverables: [
          "Arsitektur Informasi & Pemetaan User Journey Mendalam",
          "30+ Layar Terintegrasi Multi-platform (iOS, Android, Web)",
          "Design System Skala Besar dengan Token CSS/JSON",
          "Uji Keterpakaian Pengguna (Usability Testing Session)",
          "Pendampingan Slicing UI Bersama Tim Engineer",
        ],
        deliverablesEn: [
          "Information Architecture & User Journey Ecosystem",
          "30+ Integrated Multi-Platform Screens (iOS, Android, Web)",
          "Enterprise Design System with Exported CSS/JSON Tokens",
          "Usability Testing Sessions & Analytical Report",
          "Continuous Slicing Guidance with Engineering Team",
        ],
        deliverablesMin: [
          "Arsitektur Informasi & Pemetaan Alua Mandalam",
          "30+ Layar Terpadu (iOS, Android, Web)",
          "Sistem Desain Skala Gadang jo Kode CSS/JSON",
          "Uji Langsuang ka Pengguna Asli",
          "Pangawalan Koding Basamo Tim Programmer",
        ],
      },
    ],
  },
  {
    id: "video-production",
    title: "Video Production",
    titleEn: "Cinematic Video Production",
    titleMin: "Produksi Video Sinematik",
    category: "video-motion",
    categoryLabel: "Video & Motion",
    categoryLabelEn: "Video & Motion",
    categoryLabelMin: "Video & Motion",
    thumbnailUrl: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=800&q=80",
    tagline: "Produksi video komersial sinematik dengan visual kelas bioskop dan narasi emosional.",
    taglineEn: "High-end commercial video production featuring cinematic visuals and compelling storytelling.",
    taglineMin: "Produksi video komersial rancak jo gambar kelas bioskop sarato narasi manggugah.",
    description:
      "Layanan produksi video berstandar tinggi mencakup pra-produksi (storyboard, konsep cerita), produksi (sinematografi 4K, tata cahaya profesional), hingga pasca-produksi (color grading teatrikal, editing dinamis, sound design 5.1).",
    descriptionEn:
      "Full-scale video production covering pre-production (storyboarding, concepting), production (cinema 4K shooting, lighting design), and post-production (theatrical color grading, dynamic editorial, 5.1 sound design).",
    descriptionMin:
      "Layanan produksi video standar tinggi dari konsep carito, pengambilan gambar 4K, tata lampu, sampai pamelokan warna rancak jo suaro mantap.",
    popular: true,
    isClosed: false,
    iconName: "RiVideoLine",
    keyFeatures: [
      "Kualitas Rekaman 4K Ultra HD & ProRes",
      "Color Grading Teatrikal DaVinci Resolve",
      "Sound Design & Lisensi Musik Komersial",
      "Format Output Multichannel (16:9, 9:16 Reels)",
    ],
    keyFeaturesEn: [
      "4K Ultra HD & ProRes Master Capture",
      "Theatrical Color Grading via DaVinci Resolve",
      "Custom Sound Design & Licensed Commercial Score",
      "Multichannel Aspect Ratios (16:9, 9:16 Reels)",
    ],
    keyFeaturesMin: [
      "Kualitas Rekaman 4K Ultra HD & ProRes",
      "Warna Teatrikal DaVinci Resolve",
      "Tata Suaro & Musik Komersial Rasmi",
      "Bantuak Format Layar Komplit (16:9, 9:16 Reels)",
    ],
    packages: [
      {
        id: "starter",
        name: "Product Reel & Short Ad (15 - 30 Detik)",
        nameEn: "Product Reel & Short Ad (15 - 30s)",
        nameMin: "Product Reel & Iklan Singkek (15 - 30 Dt)",
        badge: "Media Sosial & Ads",
        badgeEn: "Social Media & Ads",
        badgeMin: "Sosmed & Iklan",
        priceNote: "Sesuai Lingkup Proyek",
        priceNoteEn: "Scope Based",
        priceNoteMin: "Sasuai Lingkup Proyek",
        duration: "5 - 7 Hari Kerja",
        durationEn: "5 - 7 Business Days",
        durationMin: "5 - 7 Hari Karajo",
        revisions: "2x Revisi Editing",
        revisionsEn: "2x Editorial Revisions",
        revisionsMin: "2x Revisi Editing",
        description: "Video iklan vertikal pendek dinamis untuk TikTok, Instagram Reels, dan YouTube Shorts.",
        descriptionEn: "Dynamic vertical short-form video crafted for TikTok, Instagram Reels, and YouTube Shorts.",
        descriptionMin: "Video iklan pendek tagak untuak TikTok, Instagram Reels, jo Shorts.",
        deliverables: [
          "1x Master Video Durasi 15 - 30 Detik (Format Vertikal 9:16)",
          "Color Grading Sinematik & Musik Berlisensi",
          "Teks Animasi Dinamis / Subtitle Interaktif",
          "Format MP4 4K / 1080p Siap Tayang",
        ],
        deliverablesEn: [
          "1x Master Video 15 - 30s Duration (Vertical 9:16 Format)",
          "Cinematic Color Grading & Licensed Soundtrack",
          "Dynamic Motion Captions & Engaging Subtitles",
          "4K / 1080p MP4 Ready for Immediate Distribution",
        ],
        deliverablesMin: [
          "1x Master Video 15 - 30 Datiak (Format 9:16 Tagak)",
          "Pamelokan Warna Sinematik & Musik Rasmi",
          "Tulisan Animasi Hidup / Subtitle Interaktif",
          "Format MP4 Kualitas Tinggi Siap Posting",
        ],
      },
      {
        id: "pro",
        name: "Brand Commercial & Company Profile Film",
        nameEn: "Brand Commercial & Corporate Film",
        nameMin: "Brand Commercial & Film Profil Parusahoan",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Agensi",
        priceNoteEn: "Agency Standard",
        priceNoteMin: "Standar Agensi",
        duration: "10 - 18 Hari Kerja",
        durationEn: "10 - 18 Business Days",
        durationMin: "10 - 18 Hari Karajo",
        revisions: "3x Revisi",
        revisionsEn: "3x Revisions",
        revisionsMin: "3x Revisi",
        description: "Video profil perusahaan atau iklan brand berdurasi 1 - 3 menit dengan narasi emosional dan visual berkelas.",
        descriptionEn: "1 - 3 minute corporate film or brand commercial delivering emotional depth and executive prestige.",
        descriptionMin: "Video profil usaho atau iklan brand 1 - 3 minit nan manggugah jo rancak.",
        deliverables: [
          "1x Master Video Komersial 1 - 3 Menit (Format 16:9 Bioskop)",
          "2x Cutdown Khusus Medsos (Format 9:16 & 1:1)",
          "Voiceover Profesional (Bahasa Indonesia / English)",
          "Sound Design Lengkap & Lisensi Musik Komersial Penuh",
          "Master File ProRes 4K + File Distribusi Web",
        ],
        deliverablesEn: [
          "1x Master Video 1 - 3 Minutes (16:9 Cinema Aspect)",
          "2x Social Media Cutdowns (9:16 & 1:1 Formats)",
          "Professional Voiceover Talent (ID or EN)",
          "Bespoke Sound Design & Full Commercial Licensing",
          "Master ProRes 4K Delivery + Compressed Web Versions",
        ],
        deliverablesMin: [
          "1x Master Video Komersial 1 - 3 Minit (16:9 Bioskop)",
          "2x Potongan Singkek Sosmed (9:16 & 1:1)",
          "Suaro Pengisi Narasi Profesional (ID / EN)",
          "Tata Suaro Langkok & Lisensi Musik Komplit",
          "Master File ProRes 4K + Berkas Web Ringan",
        ],
      },
      {
        id: "enterprise",
        name: "Full Commercial Campaign & Multi-Episode",
        nameEn: "Full Commercial Campaign & Series",
        nameMin: "Kampanye Komersial Panuah & Serial",
        badge: "Skala Produksi Penuh",
        badgeEn: "Enterprise Production",
        badgeMin: "Skala Produksi Gadang",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Production Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "20 - 35 Hari Kerja",
        durationEn: "20 - 35 Business Days",
        durationMin: "20 - 35 Hari Karajo",
        revisions: "Dedicated Producer Support",
        revisionsEn: "Dedicated Producer Support",
        revisionsMin: "Revisi Didampingi Khusus",
        description: "Rangkaian serial video kampanye besar dengan konsep terpadu untuk TV, bioskop, billboard digital, dan seluruh lini internet.",
        descriptionEn: "Multi-asset national campaign production for television, cinema, digital OOH, and omnichannel distribution.",
        descriptionMin: "Sarangkaian video kampanye gadang untuak TV, bioskop, papan iklan digital, sarato internet.",
        deliverables: [
          "Konseptualisasi Kreatif & Treatment Naskah Lengkap",
          "Produksi Multi-Lokasi dengan Kru Sinema Lengkap",
          "Paket Master Kampanye Lengkap (Hero Film, Cutdowns, Teaser)",
          "VFX / 3D Element Compositing Halus",
          "Hak Siar Komersial Global Penuh Tanpa Batas Waktu",
        ],
        deliverablesEn: [
          "Creative Treatment, Scriptwriting & Storyboard Direction",
          "Multi-Location Cinema Crew On-Site Production",
          "Full Campaign Deliverables (Hero Film, Cutdowns, Teasers)",
          "Seamless Visual Effects & 3D CGI Compositing",
          "Unrestricted Global Commercial Broadcast Rights",
        ],
        deliverablesMin: [
          "Konsep Kreatif & Naskah Carito Lengkok",
          "Syuting di Banyak Tampek jo Kru Sinema",
          "Paket Lengkok (Film Utamo, Potongan Iklan, Teaser)",
          "Efek Visual VFX & Animasi 3D Haluih",
          "Hak Tayang Komersial Saluruah Dunia Sabana Panuah",
        ],
      },
    ],
  },
  {
    id: "ugc-content",
    title: "UGC Image & Video Content",
    titleEn: "UGC Image & Video Content",
    titleMin: "Konten UGC Gambar & Video",
    category: "marketing",
    categoryLabel: "Marketing & Sosmed",
    categoryLabelEn: "Marketing & Social",
    categoryLabelMin: "Marketing & Sosmed",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    tagline: "Konten otentik, bergaya User Generated Content untuk mendongkrak click-through dan penjualan.",
    taglineEn: "Authentic, high-converting User Generated Content that supercharges ROAS and engagement.",
    taglineMin: "Konten alami gaya review pangguno asli untuak mandongkrak panjualan produk.",
    description:
      "Pembuatan konten visual foto dan video bergaya natural yang terbukti menghasilkan CTR dan konversi iklan lebih tinggi dibanding konten studio kaku. Cocok untuk kampanye TikTok Shop, Shopee Video, Instagram Ads, dan Meta Ads.",
    descriptionEn:
      "Performance-focused photo and video assets styled as organic creator reviews proven to maximize CTR and ad conversion. Built for TikTok Shop, Shopee Video, Meta Ads, and influencer whitelisting.",
    descriptionMin:
      "Pambuekan konten foto jo video gaya review alami nan tabukti maningkek-an jualan dibandiang iklan kaku. Cocok untuak TikTok Shop, Shopee Video, jo Meta Ads.",
    popular: false,
    isClosed: false,
    iconName: "RiSmartphoneLine",
    keyFeatures: [
      "Gaya Alami & Hook 3 Detik Pertama Efektif",
      "Format Vertikal 9:16 Optimal Medsos",
      "Opsi Kreator Beragam (Pria / Wanita / Niche Khusus)",
      "Termasuk Lisensi Iklan Komersial Paid Ads",
    ],
    keyFeaturesEn: [
      "Organic Aesthetic with 3-Second Viral Hook",
      "Native 9:16 Vertical Mobile Aspect",
      "Diverse Creator Talent Network",
      "Included Commercial Paid Ads Whitelisting Rights",
    ],
    keyFeaturesMin: [
      "Gaya Alami jo Hook 3 Datiak Partamo Tapek Sasaran",
      "Format Layar HP 9:16",
      "Piliahan Kreator Baganti (Laki-laki / Padusi)",
      "Izin Iklan Berbayar Rasmi",
    ],
    packages: [
      {
        id: "starter",
        name: "UGC Starter Batch (3 Video)",
        nameEn: "UGC Starter Batch (3 Videos)",
        nameMin: "UGC Starter Batch (3 Video)",
        badge: "Validasi Winning Hook",
        badgeEn: "Winning Hook Test",
        badgeMin: "Uji Coba Iklan Awal",
        priceNote: "Sesuai Lingkup Batch",
        priceNoteEn: "Batch Pricing",
        priceNoteMin: "Sasuai Jumlah Batch",
        duration: "4 - 7 Hari Kerja",
        durationEn: "4 - 7 Business Days",
        durationMin: "4 - 7 Hari Karajo",
        revisions: "1x Revisi Minor",
        revisionsEn: "1x Minor Revision",
        revisionsMin: "1x Revisi Kaciak",
        description: "Paket pengujian iklan awal dengan 3 variasi hook pembuka untuk menemukan angle penjualan terbaik.",
        descriptionEn: "Early-stage testing package with 3 distinct hook variations to pinpoint top performing angles.",
        descriptionMin: "Paket uji iklan awal jo 3 variasi pambuko untuak mancaliak ma nan paliang rancak manjuanyo.",
        deliverables: [
          "3x Video UGC Pendek (15 - 45 detik) dengan 3 Angle Hook Berbeda",
          "Voiceover Asli Kreator & Caption Dinamis",
          "Format Siap Unggah TikTok / Reels (9:16 MP4)",
          "Hak Pakai Iklan Komersial 3 Bulan",
        ],
        deliverablesEn: [
          "3x Short-Form UGC Videos (15 - 45s) with 3 Unique Hook Angles",
          "Native Creator Voiceover & Dynamic On-Screen Captions",
          "9:16 MP4 Native Format Ready for TikTok / Meta Ads",
          "3-Month Commercial Paid Ads Usage Rights",
        ],
        deliverablesMin: [
          "3x Video UGC Singkek (15 - 45 dt) jo 3 Gaya Beda",
          "Suaro Asli Kreator & Tulisan Tajam",
          "Format Siap Posting di TikTok / Reels (9:16)",
          "Izin Pakai Iklan Salamo 3 Bulan",
        ],
      },
      {
        id: "pro",
        name: "UGC Scale Pack (8 Video + Foto)",
        nameEn: "UGC Scale Pack (8 Videos + Photos)",
        nameMin: "UGC Scale Pack (8 Video + Foto)",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Kampanye",
        priceNoteEn: "Campaign Tier",
        priceNoteMin: "Standar Kampanye",
        duration: "8 - 14 Hari Kerja",
        durationEn: "8 - 14 Business Days",
        durationMin: "8 - 14 Hari Karajo",
        revisions: "2x Revisi",
        revisionsEn: "2x Revisions",
        revisionsMin: "2x Revisi",
        description: "Paket scaling iklan lengkap untuk rotasi materi iklan sebulan penuh tanpa membuat audiens jenuh.",
        descriptionEn: "Full-scale advertising package providing enough creative variance for a month of non-fatiguing ad spend.",
        descriptionMin: "Paket langkok untuak ganti materi iklan sabulan panuah supayo urang indak bosan mancaliaknyo.",
        deliverables: [
          "8x Video UGC Variatif (Unboxing, Review, Problem-Solution, Tutorial)",
          "15x Foto High-Res Lifestyle Penggunaan Produk",
          "Riset Script Hook & Angle Penjualan oleh Tim Kreatif",
          "Hak Pakai Iklan Komersial 6 Bulan Penuh",
        ],
        deliverablesEn: [
          "8x UGC Videos (Unboxing, Honest Review, Problem-Solution, How-To)",
          "15x High-Res Lifestyle In-Use Product Photos",
          "Creative Team Hook Research & Angle Strategy",
          "6-Month Full Commercial Paid Ads Usage Rights",
        ],
        deliverablesMin: [
          "8x Video UGC Rame (Buka Paket, Ulasan, Solusi Masalah, Tutorial)",
          "15x Foto Jaleh Gaya Hidup mamakai produk",
          "Riset Naskah Pambuko nan Menarik oleh Tim",
          "Izin Pakai Iklan Salamo 6 Bulan Panuah",
        ],
      },
      {
        id: "enterprise",
        name: "Brand Ambassador & Ongoing UGC Retainer",
        nameEn: "Creator Retainer & Brand Ambassador",
        nameMin: "Brand Ambassador & Retainer UGC Bulanan",
        badge: "Retainer Bulanan",
        badgeEn: "Monthly Retainer",
        badgeMin: "Langganan Bulanan",
        priceNote: "Bulanan Berkelanjutan",
        priceNoteEn: "Monthly Retainer",
        priceNoteMin: "Langganan Sabulan",
        duration: "Kontrak 3 - 6 Bulan",
        durationEn: "3 - 6 Month Contract",
        durationMin: "Pajanjian 3 - 6 Bulan",
        revisions: "Revisi Tanpa Batas Wajar",
        revisionsEn: "Agile Continuous Revisions",
        revisionsMin: "Revisi Leluasa Sasamo Karajo",
        description: "Pasokan materi konten organik dan iklan berkesinambungan setiap bulan dengan kreator terpilih.",
        descriptionEn: "Continuous monthly stream of organic and paid video assets with dedicated creator ambassadors.",
        descriptionMin: "Panyadiokan video jo foto tiok bulan jo kreator tapiliah untuak mandukuang panjualan.",
        deliverables: [
          "20x Video UGC Segar Setiap Bulan",
          "30x Foto Lifestyle & Produk",
          "Manajemen Talenta Kreator & Pengiriman Produk",
          "Laporan Analisis Performa Kreatif Bulanan",
          "Hak Pakai Iklan Abadi (Perpetual Usage)",
        ],
        deliverablesEn: [
          "20x Fresh UGC Videos Delivered Every Month",
          "30x Lifestyle & Detail Product Photos",
          "Full Talent Management & Product Logistics Handling",
          "Monthly Creative Performance Audit & Optimization Report",
          "Perpetual Global Commercial Ad Usage Rights",
        ],
        deliverablesMin: [
          "20x Video UGC Baru Tiok Bulan",
          "30x Foto Produk & Lifestyle",
          "Pangalolaan Kreator & Pangiriman Barang",
          "Laporan Hasil Iklan Bulanan",
          "Hak Pakai Iklan Salamo-lamonyo",
        ],
      },
    ],
  },
  {
    id: "motion-graphic",
    title: "Motion Graphic",
    titleEn: "Motion Graphics & Animation",
    titleMin: "Motion Graphic & Animasi",
    category: "video-motion",
    categoryLabel: "Video & Motion",
    categoryLabelEn: "Video & Motion",
    categoryLabelMin: "Video & Motion",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    tagline: "Animasi visual 2D & 2.5D memukau untuk menyederhanakan ide kompleks menjadi tontonan menarik.",
    taglineEn: "Mesmerizing 2D & 2.5D animation transforming complex narratives into intuitive visual stories.",
    taglineMin: "Animasi visual 2D & 2.5D rancak untuak manjalehan ide rumit jadi tontonan mudah dipahami.",
    description:
      "Perancangan animasi grafis bergerak menggunakan After Effects dan Cinema 4D. Sempurna untuk video explainer produk teknologi, animasi bumper logo, visual display pameran, hingga visualisasi data animasi.",
    descriptionEn:
      "Dynamic motion design powered by After Effects and Cinema 4D. Ideal for tech explainer videos, logo stingers, exhibition visual installations, and animated data storytelling.",
    descriptionMin:
      "Pambuekan animasi grafis manggarik mamakai After Effects jo Cinema 4D. Rancak bana untuak video panjaleh teknologi, bumper logo, sampai tampilan visual pameran.",
    popular: false,
    isClosed: false,
    iconName: "RiPlayCircleLine",
    keyFeatures: [
      "Storyboard & Animatic Ilustrasi Kustom",
      "Gerakan Fluid & Timing Kurva Halus",
      "Sinkronisasi Sound FX & Musik Latar",
      "Format Render Master 4K / WebGL Lottie JSON",
    ],
    keyFeaturesEn: [
      "Custom Illustrated Storyboards & Animatics",
      "Fluid Physics & Tailored Easing Curves",
      "Synchronized Sound FX & Dynamic Score",
      "4K Master Video & Lightweight Lottie JSON Deliveries",
    ],
    keyFeaturesMin: [
      "Storyboard & Ilustrasi Khusus",
      "Garikan Haluih sarato Pas Waktunyo",
      "Tata Suaro FX jo Musik Sajalan",
      "Format Video 4K & Berkas Lottie JSON",
    ],
    packages: [
      {
        id: "starter",
        name: "Logo Stinger & UI Animation",
        nameEn: "Logo Stinger & UI Animation",
        nameMin: "Bumper Logo & Animasi UI",
        badge: "Cepat & Ikonik",
        badgeEn: "Iconic & Quick",
        badgeMin: "Singkek & Ikonik",
        priceNote: "Sesuai Kompleksitas",
        priceNoteEn: "Complexity Based",
        priceNoteMin: "Sasuai Kasulikan",
        duration: "3 - 5 Hari Kerja",
        durationEn: "3 - 5 Business Days",
        durationMin: "3 - 5 Hari Karajo",
        revisions: "2x Revisi",
        revisionsEn: "2x Revisions",
        revisionsMin: "2x Revisi",
        description: "Animasi logo berdurasi 3 - 7 detik untuk intro video YouTube, presentasi, atau website header.",
        descriptionEn: "3 - 7 second animated logo stinger for YouTube intros, presentations, and website heroes.",
        descriptionMin: "Animasi logo 3 - 7 datiak untuak pambuko video YouTube, presentasi, atau website.",
        deliverables: [
          "1x Animasi Logo Kustom (3 - 7 Detik)",
          "Sound FX Desain Audio Logo Khusus",
          "Format MP4 Transparan Alpha Channel & Format Lottie Web",
          "File Resolusi 4K UHD",
        ],
        deliverablesEn: [
          "1x Bespoke Animated Logo Stinger (3 - 7s)",
          "Tailored Audio Sonic Logo Sound FX",
          "Transparent Alpha Channel MP4 / MOV & Lottie Web JSON",
          "4K UHD Resolution Output",
        ],
        deliverablesMin: [
          "1x Animasi Logo Khusus (3 - 7 Datiak)",
          "Suaro Audio Khas Logo",
          "Format MP4 Transparan & Lottie Web",
          "Kualitas Video 4K UHD",
        ],
      },
      {
        id: "pro",
        name: "Animated Explainer Video (60 Detik)",
        nameEn: "Animated Explainer (60 Seconds)",
        nameMin: "Video Panjaleh Animasi (60 Datiak)",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Proyek",
        priceNoteEn: "Standard Tier",
        priceNoteMin: "Standar Proyek",
        duration: "10 - 15 Hari Kerja",
        durationEn: "10 - 15 Business Days",
        durationMin: "10 - 15 Hari Karajo",
        revisions: "3x Revisi Bertahap",
        revisionsEn: "3x Staged Revisions",
        revisionsMin: "3x Revisi Batahap",
        description: "Video explainer animasi 60 detik lengkap dengan naskah, ilustrasi karakter, dan pengisi suara profesional.",
        descriptionEn: "60-second animated explainer video complete with scriptwriting, custom artwork, and professional voiceover.",
        descriptionMin: "Video panjaleh animasi 60 datiak langkok jo naskah carito, gambar karakter, sarato suaro pangisi narasi.",
        deliverables: [
          "Naskah & Skrip Cerita Terarah",
          "Storyboard Penuh & Karakter Visual Orisinal",
          "Voiceover Profesional (Bahasa Indonesia / English)",
          "Sound Design Lengkap & Sinkronisasi Efek",
          "Master Video 4K & Format Khusus Medsos",
        ],
        deliverablesEn: [
          "Targeted Scriptwriting & Narrative Direction",
          "Full Storyboard & Original Illustrated Art Direction",
          "Professional Voiceover Talent (ID or EN)",
          "Complete Sound Design & Foley Synchronization",
          "4K Master Video + Tailored Social Media Formats",
        ],
        deliverablesMin: [
          "Naskah & Carito Nan Jaleh",
          "Storyboard Komplit & Desain Karakter Asli",
          "Pangisi Suaro Profesional (ID / EN)",
          "Tata Suaro Langkok & Efek Pas",
          "Video Master 4K & Format Sosmed",
        ],
      },
      {
        id: "enterprise",
        name: "Full 2D/3D Hybrid Motion System",
        nameEn: "Full 2D/3D Hybrid Motion System",
        nameMin: "Sistem Animasi Campua 2D/3D Panuah",
        badge: "Skala Produksi Tinggi",
        badgeEn: "High-End Production",
        badgeMin: "Skala Produksi Tinggi",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "20 - 30 Hari Kerja",
        durationEn: "20 - 30 Business Days",
        durationMin: "20 - 30 Hari Karajo",
        revisions: "Dedicated Motion Director",
        revisionsEn: "Dedicated Motion Director",
        revisionsMin: "Didampingi Sutradara Animasi",
        description: "Sistem motion komprehensif hybrid 2D dan 3D untuk pameran teknologi, peluncuran produk, atau broadcast TV.",
        descriptionEn: "Comprehensive hybrid 2D/3D motion package engineered for product reveals, broadcast, and tech keynotes.",
        descriptionMin: "Animasi gabungan 2D jo 3D untuak peluncuran produk gadang, acara pameran, atau siaran TV.",
        deliverables: [
          "Konseptualisasi Tingkat Tinggi & Direction Visual Kelas Dunia",
          "Kombinasi Animasi 2D Halus + Aset 3D Fotorealistik",
          "Desain Musik Orisinal (Original Score) & Mixing Audio 5.1",
          "Format Multi-Layar (Ultrawide LED, Video Wall, Interactive)",
          "Penyerahan File Proyek Master After Effects & Cinema 4D",
        ],
        deliverablesEn: [
          "High-Level Conceptualization & World-Class Art Direction",
          "Seamless Hybrid 2D Physics + Photorealistic 3D Assets",
          "Custom Original Musical Score & 5.1 Surround Mix",
          "Multi-Canvas Formats (Ultrawide LED, Video Walls, Curved Displays)",
          "Master Project Archive (After Effects & Cinema 4D Files)",
        ],
        deliverablesMin: [
          "Konsep Tingkat Tinggi & Visual Kelas Dunia",
          "Gabungan Animasi 2D Haluih jo Gambar 3D Nyato",
          "Musik Asli Khusus & Tata Suaro 5.1",
          "Format Multi-Layar (LED Leba, Dindiang Video)",
          "Berkas Master Proyek After Effects & Cinema 4D",
        ],
      },
    ],
  },
  {
    id: "3d-design",
    title: "3D Design & Product Rendering",
    titleEn: "3D Design & Product Rendering",
    titleMin: "Desain 3D & Render Produk",
    category: "visual-craft",
    categoryLabel: "3D & Creative Imaging",
    categoryLabelEn: "3D & Creative Imaging",
    categoryLabelMin: "3D & Creative Imaging",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tagline: "Visualisasi 3D produk fotorealistik tingkat tinggi untuk iklan, packaging, dan eksplorasi konsep.",
    taglineEn: "Hyper-realistic 3D product visualization engineered for luxury advertising, packaging, and digital retail.",
    taglineMin: "Gambar 3D produk mode aslinyo untuak iklan, kemasan, jo presentasi jualan.",
    description:
      "Pemodelan 3D presisi, texturing material tingkat mikroskopis, simulasi pencahayaan fisik (ray-tracing), dan rendering ultra-high resolution berbasis Blender dan Cinema 4D. Menggantikan sesi foto produk mahal dengan fleksibilitas sudut pandang tak terbatas.",
    descriptionEn:
      "Precision 3D modeling, microscopic material procedural texturing, physically-based ray-traced lighting, and ultra-high-resolution rendering in Blender and Cinema 4D. Eliminating costly physical shoots with boundless creative angle control.",
    descriptionMin:
      "Pambuekan model 3D sabana pas, bahan material jaleh, tata cahayo cando nyato, sarato render gambar rancak mamakai Blender jo Cinema 4D. Menggantian foto studio maha jo sudut pandang leluasa.",
    popular: true,
    isClosed: false,
    iconName: "RiBox3Line",
    keyFeatures: [
      "Pemodelan 3D Akurat CAD / Sketsa",
      "Material Fotorealistik (Kaca, Logam, Tekstil, Cairan)",
      "Resolusi Render 4K - 8K Ultra High-Res",
      "Aset 3D Siap Pakai untuk Web / AR (GLTF, USDZ)",
    ],
    keyFeaturesEn: [
      "CAD-Accurate / Sketch-Based 3D Modeling",
      "Procedural Photoreal Shaders (Glass, Brushed Metals, Fabrics, Fluids)",
      "4K to 8K Ultra High-Resolution Output",
      "Interactive WebGL / AR Ready Exports (GLTF, USDZ)",
    ],
    keyFeaturesMin: [
      "Model 3D Pas Manuruik Sketsa",
      "Bahan Kaco, Logam, Kain, sarato Aia Nyato",
      "Kualitas Render 4K - 8K Jaleh Bana",
      "Berkas 3D Siap Pakai di Web & AR",
    ],
    packages: [
      {
        id: "starter",
        name: "Single Product Hero Render (3 Sudut)",
        nameEn: "Single Product Hero Render (3 Angles)",
        nameMin: "Render Produk Tunggal (3 Suduik)",
        badge: "Katalog & Toko Online",
        badgeEn: "E-Commerce & Catalog",
        badgeMin: "Katalog & Jualan Online",
        priceNote: "Sesuai Model Proyek",
        priceNoteEn: "Model Based",
        priceNoteMin: "Sasuai Model Proyek",
        duration: "4 - 6 Hari Kerja",
        durationEn: "4 - 6 Business Days",
        durationMin: "4 - 6 Hari Karajo",
        revisions: "2x Putaran Revisi",
        revisionsEn: "2x Revision Rounds",
        revisionsMin: "2x Revisi",
        description: "Visualisasi 1 produk dengan 3 sudut pandang berbeda dengan latar belakang studio bersih atau transparan.",
        descriptionEn: "High-resolution visualization of 1 hero product captured across 3 studio angles with clean or transparent backgrounds.",
        descriptionMin: "Gambar 3D 1 produk jo 3 suduik caliak babeda jo latar balakang barasiah atau transparan.",
        deliverables: [
          "Pemodelan 3D Presisi 1 Objek Produk",
          "3x Render Resolusi Tinggi (4K PNG Transparan & Studio Background)",
          "Penyesuaian Pencahayaan Studio Elegan",
          "Aset Siap Pasang di Marketplace / Website",
        ],
        deliverablesEn: [
          "Precision 3D Geometry Modeling for 1 Product",
          "3x High-Resolution Renders (4K Transparent PNG & Studio Canvas)",
          "Refined Studio Lighting Setup",
          "E-Commerce & Digital Marketplace Ready Delivery",
        ],
        deliverablesMin: [
          "Model 3D Rapi untuak 1 Produk",
          "3x Gambar Resolusi Tinggi 4K PNG Transparan",
          "Tata Cahayo Studio Elegan",
          "Aset Siap Pasang di Marketplace jo Website",
        ],
      },
      {
        id: "pro",
        name: "Commercial Scene & Environment 3D",
        nameEn: "Commercial Scene & Environment 3D",
        nameMin: "Pemandangan Lingkungan 3D Komersial",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Agensi",
        priceNoteEn: "Agency Standard",
        priceNoteMin: "Standar Agensi",
        duration: "8 - 14 Hari Kerja",
        durationEn: "8 - 14 Business Days",
        durationMin: "8 - 14 Hari Karajo",
        revisions: "3x Putaran Revisi",
        revisionsEn: "3x Revision Rounds",
        revisionsMin: "3x Revisi",
        description: "Visualisasi produk di dalam lingkungan fotorealistik (interior, alam, atau panggung visual artistik).",
        descriptionEn: "Photorealistic product integration inside bespoke architectural, natural, or surreal artistic environments.",
        descriptionMin: "Gambar produk di dalam ruangan atau pemandangan alam fotorealistik nan rancak.",
        deliverables: [
          "Desain Lingkungan 3D Lengkap (Custom Set Dressing)",
          "5x Render Angle Sinematik (Resolusi 6K Siap Billboard)",
          "Tekstur Material Khusus & Simulasi Cahaya Alami",
          "1x Animasi Rotasi Turntable 360° (Looping MP4)",
        ],
        deliverablesEn: [
          "Complete Custom 3D Environment Architecture",
          "5x Cinematic Angle Renders (6K Billboard-Ready Files)",
          "Bespoke Procedural Materials & Daylight Simulation",
          "1x 360° Seamless Turntable Product Animation (MP4)",
        ],
        deliverablesMin: [
          "Desain Lingkuangan 3D Komplit (Custom Ruangan)",
          "5x Gambar Sinematik 6K Siap Dicetak Gadang",
          "Bahan Material Khusus jo Cahayo Alami",
          "1x Animasi Putar 360 Derajat Muta-muta (MP4)",
        ],
      },
      {
        id: "enterprise",
        name: "3D Product Animation & Motion Reveal",
        nameEn: "3D Product Animation & Motion Reveal",
        nameMin: "Animasi 3D Produk & Motion Reveal",
        badge: "Komersial Spektakuler",
        badgeEn: "Spectacular Commercial",
        badgeMin: "Komersial Spektakuler",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Production Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "18 - 30 Hari Kerja",
        durationEn: "18 - 30 Business Days",
        durationMin: "18 - 30 Hari Karajo",
        revisions: "Dedicated 3D Supervisor",
        revisionsEn: "Dedicated 3D Supervisor",
        revisionsMin: "Didampingi Ahli 3D Khusus",
        description: "Video animasi produk 3D tingkat lanjut dengan efek partikel, pembongkaran komponen (exploded view), dan gerakan kamera sinematik.",
        descriptionEn: "High-octane 3D product commercial featuring particle physics, exploded view mechanics, and cinematic camera choreography.",
        descriptionMin: "Video animasi 3D produk tingkat tinggi jo efek partikel, komponen tabongkar (exploded view), sarato garik kamera bioskop.",
        deliverables: [
          "1x Video Animasi 3D Komersial 30 - 60 Detik (4K UHD)",
          "Simulasi Dinamis (Cairan, Partikel, Pembongkaran Komponen)",
          "Sound FX Dinamis & Komposisi Musik Orisinal",
          "Penyerahan Model 3D Lengkap & Format WebGL Interaktif (GLTF)",
        ],
        deliverablesEn: [
          "1x 30 - 60s 3D Product Commercial Video (4K UHD)",
          "Dynamic Physics (Liquids, Explosions, Exploded Engineering Views)",
          "Spatial Sound Design & Bespoke Original Audio Mix",
          "Complete Geometry Handoff & WebGL Interactive Deliveries",
        ],
        deliverablesMin: [
          "1x Video Animasi 3D Komersial 30 - 60 Datiak (4K)",
          "Simulasi Garik Nyato (Aia, Partikel, Mesin Tabongkar)",
          "Tata Suaro Audio Mantap & Musik Asli",
          "Panyarahan Berkas 3D Komplit Siap Pakai di Web",
        ],
      },
    ],
  },
  {
    id: "digital-imaging",
    title: "Digital Imaging & Visual Manipulation",
    titleEn: "Digital Imaging & Key Visuals",
    titleMin: "Digital Imaging & Manipulasi Visual",
    category: "visual-craft",
    categoryLabel: "3D & Creative Imaging",
    categoryLabelEn: "3D & Creative Imaging",
    categoryLabelMin: "3D & Creative Imaging",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    tagline: "Karya manipulasi foto kreatif dan key visual imajinatif beresolusi super tinggi.",
    taglineEn: "Imaginative composite photo manipulation and master advertising key visuals in ultra-high resolution.",
    taglineMin: "Karya manipulasi foto kreatif jo key visual imajinatif resolusi tinggi untuak iklan.",
    description:
      "Penggabungan multi-elemen fotografi, 3D render, dan lukisan digital (matte painting) menjadi satu karya visual utuh yang memukau. Sangat cocok untuk kampanye Key Visual (KV), poster film, billboard megah, dan cover album musik.",
    descriptionEn:
      "Synthesizing multi-source photography, 3D geometry renders, and digital matte painting into seamless, breathtaking master visuals. Tailored for master advertising Key Visuals (KV), theatrical posters, massive billboards, and album covers.",
    descriptionMin:
      "Panggabuangan banyak foto, render 3D, jo lukisan digital manjadi satu karya visual utuah nan mangagumkan untuak Key Visual (KV), poster film, jo billboard gadang.",
    popular: false,
    isClosed: false,
    iconName: "RiMagicLine",
    keyFeatures: [
      "Teknik Seamless Multi-Photo Compositing",
      "Pewarnaan Teatrikal & Tata Cahaya Dramatis",
      "Resolusi Ekstrem (Siap Cetak Ukuran Billboard)",
      "Layering Terorganisir Non-Destructive di Photoshop",
    ],
    keyFeaturesEn: [
      "Seamless Multi-Photo Composite Synthesis",
      "Theatrical Color Grading & Dramatic Light Painting",
      "Ultra-High Pixel Density (Mega-Billboard Ready)",
      "Non-Destructive Organized Layer Hierarchy in Photoshop",
    ],
    keyFeaturesMin: [
      "Sambungan Foto Rapi Tanpo Bekas",
      "Warna Teatrikal & Cahayo Dramatis",
      "Resolusi Ekstrem Siap Cetak Billboard Gadang",
      "Susunan Lapisan Photoshop Rapiah",
    ],
    packages: [
      {
        id: "starter",
        name: "Creative Retouch & Color Grade",
        nameEn: "Creative Retouch & Color Grade",
        nameMin: "Retouch Kreatif & Pewarnaan",
        badge: "Foto Produk / Model",
        badgeEn: "Product / Model Focus",
        badgeMin: "Foto Produk / Model",
        priceNote: "Sesuai Jumlah Foto",
        priceNoteEn: "Per-Image Scope",
        priceNoteMin: "Sasuai Banyak Foto",
        duration: "2 - 4 Hari Kerja",
        durationEn: "2 - 4 Business Days",
        durationMin: "2 - 4 Hari Karajo",
        revisions: "2x Revisi",
        revisionsEn: "2x Revisions",
        revisionsMin: "2x Revisi",
        description: "Penyempurnaan 1 foto utama: pembersihan kulit/objek tingkat lanjut, perbaikan bentuk, dan pewarnaan dramatis.",
        descriptionEn: "High-end polish for 1 hero frame: advanced skin/surface cleanup, contour refinement, and tonal grade.",
        descriptionMin: "Pamelokan 1 foto utamo: mambarasiahan kulik/barang, rancak bantuak, sarato warna dramatis.",
        deliverables: [
          "Retouching Halus High-End (Dodge & Burn, Frequency Separation)",
          "Penataan Warna & Kontras Sinematik",
          "File Resolusi Penuh Master TIFF & JPEG High-Res",
        ],
        deliverablesEn: [
          "High-End Micro Retouching (Dodge & Burn, Frequency Separation)",
          "Cinematic Color Grading & Contrast Balance",
          "Master TIFF & High-Res JPEG Deliveries",
        ],
        deliverablesMin: [
          "Pamelokan Haluih Kualitas Tinggi (Frequency Separation)",
          "Warna Sinematik nan Mambangkik-an Gambar",
          "Berkas TIFF Master & JPEG Kualitas Tinggi",
        ],
      },
      {
        id: "pro",
        name: "Advertising Key Visual (KV)",
        nameEn: "Advertising Key Visual (KV)",
        nameMin: "Key Visual Iklan (KV)",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Agensi",
        priceNoteEn: "Agency Standard",
        priceNoteMin: "Standar Agensi",
        duration: "5 - 9 Hari Kerja",
        durationEn: "5 - 9 Business Days",
        durationMin: "5 - 9 Hari Karajo",
        revisions: "3x Revisi Komprehensif",
        revisionsEn: "3x Revisions",
        revisionsMin: "3x Revisi",
        description: "1 karya manipulasi visual master dengan penggabungan 5-15 aset foto, efek atmosferik, dan cahaya surealis.",
        descriptionEn: "1 master advertising visual synthesizing 5-15 photo assets, atmospheric effects, and surreal lighting.",
        descriptionMin: "1 karya visual induak nan manggabuang-an 5-15 foto, efek kabuik/cahayo, sarato suasananyo rancak.",
        deliverables: [
          "1 Master Key Visual Komposisi Penuh",
          "Resolusi Tinggi Siap Cetak (300 DPI, Dimensi Cetak s/d A1/A0)",
          "Adaptasi 2 Format (Horizontal Banner & Vertikal Poster)",
          "File Master PSD Terorganisir",
        ],
        deliverablesEn: [
          "1 Master Key Visual Composite Artwork",
          "High-Resolution Print Delivery (300 DPI up to A1/A0)",
          "2 Aspect Ratio Adaptations (Landscape Banner & Portrait Poster)",
          "Organized Master PSD with Named Layers",
        ],
        deliverablesMin: [
          "1 Karya Master Key Visual Utuah",
          "Resolusi Tinggi Siap Cetak Gadang (A1/A0 300 DPI)",
          "2 Format Layar (Mambantang jo Tagak)",
          "Berkas PSD Lengkok jo Lapisan Basusun Rapiah",
        ],
      },
      {
        id: "enterprise",
        name: "National Campaign Visual Ecosystem",
        nameEn: "National Campaign Visual Ecosystem",
        nameMin: "Ekosistem Visual Kampanye Nasional",
        badge: "Skala Billboard Nasional",
        badgeEn: "National Billboard Grade",
        badgeMin: "Skala Cetak Gadang Nasional",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Campaign Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "12 - 20 Hari Kerja",
        durationEn: "12 - 20 Business Days",
        durationMin: "12 - 20 Hari Karajo",
        revisions: "Dedicated Art Director",
        revisionsEn: "Dedicated Art Director",
        revisionsMin: "Didampingi Pengarah Seni Khusus",
        description: "Paket visual terpadu untuk kampanye nasional: master key visual billboard raksasa beserta turunan format ke seluruh media fisik dan digital.",
        descriptionEn: "Complete visual ecosystem for nationwide brand campaigns: massive billboard master and comprehensive media rollouts.",
        descriptionMin: "Paket visual terpadu untuak kampanye nasional: master billboard raksasa sarato turunan ka kasadonyo media.",
        deliverables: [
          "2 Master Key Visual Berbeda Tema",
          "Resolusi Raksasa (Skala Billboard Jalan Tol / OOH)",
          "Adaptasi Format ke 10+ Ukuran Medsos, POSM, Banner, & Media Cetak",
          "Hak Cipta Penuh & Penyerahan Master Layered Lengkap",
        ],
        deliverablesEn: [
          "2 Distinct Master Key Visual Artworks",
          "Gigapixel Ultra-Resolution Files (Highway Billboard / LED Spec)",
          "Adaptations across 10+ Formats (Social, POSM, Banners, Print)",
          "Complete Copyright Transfer & Layered Asset Package",
        ],
        deliverablesMin: [
          "2 Master Key Visual Babeda Tema",
          "Resolusi Sangaik Gadang (Untuak Billboard Jalan Tol)",
          "Turunan Format ka 10+ Ukuran Medsos jo Cetak",
          "Hak Cipta Panuah & Berkas Asli Langkok",
        ],
      },
    ],
  },
  {
    id: "photography",
    title: "Photography & Studio Production",
    titleEn: "Commercial Photography & Studio",
    titleMin: "Fotografi & Produksi Studio",
    category: "visual-craft",
    categoryLabel: "3D & Creative Imaging",
    categoryLabelEn: "3D & Creative Imaging",
    categoryLabelMin: "3D & Creative Imaging",
    thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    tagline: "Fotografi komersial bernilai estetika tinggi untuk produk, fashion, arsitektur, dan potret korporat.",
    taglineEn: "Commercial photography capturing product, fashion, architecture, and executive portraits.",
    taglineMin: "Fotografi komersial rancak untuak produk, fashion, bangunan, sarato potret pimpinan.",
    description:
      "Sesi pemotretan profesional menggunakan kamera sensor medium format / full-frame resolusi tinggi, tata lampu studio terkalibrasi warna akurat, serta pengarahan gaya (art direction) untuk menghasilkan foto yang siap memikat pasar.",
    descriptionEn:
      "Studio and on-location photographic production utilizing high-resolution full-frame systems, color-calibrated strobe lighting, and editorial art direction tailored to elevate premium brands.",
    descriptionMin:
      "Sesi foto profesional mamakai kamera sensor jaleh, tata lampu studio rancak, sarato panduan gaya supayo foto nampak mewah jo manggugah urang mambali.",
    popular: false,
    isClosed: false,
    iconName: "RiCameraLine",
    keyFeatures: [
      "Kamera Full-Frame / Medium Format Resolusi Tinggi",
      "Tata Lampu Studio Proffesional & Kalibrasi Warna",
      "Pengarahan Gaya & Moodboard Visual Terarah",
      "Retouching Warna & Pembersihan Detail Setiap Foto",
    ],
    keyFeaturesEn: [
      "High-Resolution Full-Frame Camera Systems",
      "Professional Studio Strobe Lighting & Color Calibration",
      "Editorial Moodboard & Creative Direction",
      "High-End Color Tonal Polish & Detail Retouching",
    ],
    keyFeaturesMin: [
      "Kamera Resolusi Tinggi Jaleh Bana",
      "Tata Lampu Studio Rasmi & Kalibrasi Warna",
      "Panduan Gaya & Contoh Visual Sajalan",
      "Pamelokan Warna jo Kabarasiahan Tiok Foto",
    ],
    packages: [
      {
        id: "starter",
        name: "Product Catalog Shoot (10 Produk)",
        nameEn: "Product Catalog Shoot (10 Items)",
        nameMin: "Foto Katalog Produk (10 Barang)",
        badge: "Katalog & Toko Online",
        badgeEn: "E-Commerce Ready",
        badgeMin: "Katalog & Toko Online",
        priceNote: "Sesuai Jumlah Item",
        priceNoteEn: "Item Based",
        priceNoteMin: "Sasuai Banyak Barang",
        duration: "3 - 5 Hari Kerja",
        durationEn: "3 - 5 Business Days",
        durationMin: "3 - 5 Hari Karajo",
        revisions: "1x Seleksi Tambahan",
        revisionsEn: "1x Extra Selection",
        revisionsMin: "1x Pilihan Tambahan",
        description: "Pemotretan katalog studio latar polos (putih / abu / warna brand) untuk 10 item produk.",
        descriptionEn: "Clean studio catalog photography on pure white, gray, or brand backdrop for 10 products.",
        descriptionMin: "Foto studio latar polos (putiah / abu / warna brand) untuak 10 barang produk.",
        deliverables: [
          "20 Foto Terpilih (2 Sudut per Produk)",
          "Retouching Dasar & Pembersihan Latar Bersih",
          "File JPEG High-Res Siap Toko Online & Website",
        ],
        deliverablesEn: [
          "20 Selected Deliverables (2 Angles per Product)",
          "High-End Retouch & Clean Clipping",
          "Web & Marketplace-Optimized High-Res JPEGs",
        ],
        deliverablesMin: [
          "20 Foto Tapiliah (2 Suduik per Barang)",
          "Pamelokan Dasa & Latar Barasiah",
          "Berkas JPEG Jaleh Siap Pakai di Web",
        ],
      },
      {
        id: "pro",
        name: "Editorial Lifestyle & Brand Campaign",
        nameEn: "Editorial Lifestyle & Campaign",
        nameMin: "Editorial Lifestyle & Kampanye Brand",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Sesi",
        priceNoteEn: "Session Tier",
        priceNoteMin: "Standar Sesi",
        duration: "7 - 10 Hari Kerja",
        durationEn: "7 - 10 Business Days",
        durationMin: "7 - 10 Hari Karajo",
        revisions: "2x Putaran Revisi Retouch",
        revisionsEn: "2x Retouch Revisions",
        revisionsMin: "2x Revisi Retouch",
        description: "Sesi foto tematik setengah hari (half-day) dengan model, set prop khusus, dan konsep storytelling.",
        descriptionEn: "Half-day narrative photoshoot with talent, custom props, and editorial storytelling art direction.",
        descriptionMin: "Sesi foto satangah hari jo model, dekorasi khusus, sarato konsep carito nan rancak.",
        deliverables: [
          "Sesi Pemotretan 4 - 5 Jam Studio / Lokasi Terpilih",
          "30 Foto Retouching Sempurna Resolusi Penuh",
          "Seluruh File RAW / Unedited Original",
          "Hak Penggunaan Komersial Penuh Tanpa Batas Waktu",
        ],
        deliverablesEn: [
          "4 - 5 Hour Studio or On-Location Shoot Session",
          "30 Full-Resolution Master Retouched Deliverables",
          "All Raw Original Camera Captures",
          "Perpetual Commercial Usage Rights",
        ],
        deliverablesMin: [
          "Sesi Foto 4 - 5 Jam di Studio / Tampek Tapiliah",
          "30 Foto Pamelokan Haluih Resolusi Panuah",
          "Kasadonyo Berkas Mentah Asli (RAW)",
          "Hak Pakai Komersial Salamo-lamonyo",
        ],
      },
      {
        id: "enterprise",
        name: "Full Commercial Production (Full Day)",
        nameEn: "Commercial Production (Full Day)",
        nameMin: "Produksi Komersial Panuah (Full Day)",
        badge: "Produksi Penuh",
        badgeEn: "Full Production",
        badgeMin: "Produksi Gadang",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Production Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "10 - 16 Hari Kerja",
        durationEn: "10 - 16 Business Days",
        durationMin: "10 - 16 Hari Karajo",
        revisions: "Dedicated Photographer Support",
        revisionsEn: "Dedicated Photographer Support",
        revisionsMin: "Didampingi Fotografer Utama",
        description: "Produksi skala penuh satu hari (full day) dengan tim pencahayaan lengkap, pengarah gaya, makeup artist, dan fotografer utama.",
        descriptionEn: "Full-day comprehensive commercial production with full lighting crew, art director, and hair & makeup talent.",
        descriptionMin: "Produksi saharian panuah jo kru lampu komplit, penata gaya, tukang rias, sarato fotografer induak.",
        deliverables: [
          "Sesi Penuh 8 Jam dengan Kru Lengkap",
          "60+ Foto Retouched Master Siap Iklan & Billboard",
          "Pengarahan Moodboard & Talent Scouting",
          "Hak Cipta & Lisensi Komersial Multichannel Global",
        ],
        deliverablesEn: [
          "8-Hour Full-Day Session with Lighting Crew",
          "60+ Master Retouched Billboard-Ready Photographs",
          "Pre-Production Moodboard & Talent Scouting",
          "Global Multichannel Commercial Licensing",
        ],
        deliverablesMin: [
          "Sesi 8 Jam jo Kru Lengkok",
          "60+ Foto Master Siap Dicetak di Billboard",
          "Riset Konsep Gambar & Piliah Model",
          "Lisensi Komersial Panuah Kasadonyo Media",
        ],
      },
    ],
  },
  {
    id: "sosmed-management",
    title: "Sosmed Management dengan Tim",
    titleEn: "Social Media Team Management",
    titleMin: "Pangalolaan Sosmed jo Tim",
    category: "marketing",
    categoryLabel: "Marketing & Sosmed",
    categoryLabelEn: "Marketing & Social",
    categoryLabelMin: "Marketing & Sosmed",
    thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    tagline: "Pengelolaan media sosial menyeluruh didukung tim desainer, copywriter, dan content strategist berdedikasi.",
    taglineEn: "Comprehensive social media management executed by a dedicated team of designers, copywriters, and strategists.",
    taglineMin: "Pangalolaan media sosial panuah dibantu dek tim desainer, panulih, sarato ahli strategi.",
    description:
      "Bukan sekadar posting, tetapi membangun audiens dan pertumbuhan penjualan. Tim kami menyusun kalender konten bulanan, riset tren terkini, desain visual feed & reels premium, penulisan copywriting persuasif, hingga interaksi engagement komunitas secara aktif.",
    descriptionEn:
      "Strategic social growth designed to compound loyal community and revenue. Our dedicated unit drives monthly content calendars, viral trend research, bespoke visual feed and reels production, persuasive copywriting, and community management.",
    descriptionMin:
      "Bukan hanyo sekedar posting, tapi mambangun pelanggan satia jo panjualan. Tim kami mangatur jadwal konten, riset nan viral, desain rancak, sarato mambaleh pasan klien.",
    popular: false,
    isClosed: false,
    iconName: "RiTeamLine",
    keyFeatures: [
      "Perencanaan Kalender Konten Bulanan Terstruktur",
      "Desain Feed, Carousel & Video Reels Terintegrasi",
      "Copywriting Penjualan & Caption Engaging",
      "Laporan Kinerja & Analisis Pertumbuhan Akun Bulanan",
    ],
    keyFeaturesEn: [
      "Structured Monthly Content Calendar Architecture",
      "Integrated Feeds, Dynamic Carousels & Reels Production",
      "Conversion Copywriting & Engaging Captions",
      "Monthly Growth Analytics & Strategy Optimization",
    ],
    keyFeaturesMin: [
      "Jadwal Konten Bulanan Nan Taratur",
      "Desain Feed, Gambar Gese & Video Reels",
      "Tulisan Caption nan Mambuek Urang Tertarik",
      "Laporan Hasil jo Kamajuan Akun Sabulan",
    ],
    packages: [
      {
        id: "starter",
        name: "Growth Starter (12 Konten/Bulan)",
        nameEn: "Growth Starter (12 Posts/Month)",
        nameMin: "Growth Starter (12 Konten/Bulan)",
        badge: "Konsistensi Akun",
        badgeEn: "Consistent Presence",
        badgeMin: "Jago Akun Tetap Aktif",
        priceNote: "Bulanan Berkelanjutan",
        priceNoteEn: "Monthly Retainer",
        priceNoteMin: "Langganan Sabulan",
        duration: "Siklus Bulanan (30 Hari)",
        durationEn: "Monthly Cycle (30 Days)",
        durationMin: "Putaran Sabulan (30 Hari)",
        revisions: "Revisi Sebelum Tayang",
        revisionsEn: "Pre-Publish Revisions",
        revisionsMin: "Revisi Sabalun Tayang",
        description: "Paket menjaga eksistensi dan konsistensi branding di Instagram & TikTok dengan 3 konten terarah per minggu.",
        descriptionEn: "Consistent branding foundation on Instagram & TikTok with 3 curated posts per week.",
        descriptionMin: "Paket manjago akun supayo tetap aktif di Instagram & TikTok jo 3 postingan sabaminggu.",
        deliverables: [
          "8x Desain Single Post / Carousel Edukasi",
          "4x Video Reels / TikTok Singkat",
          "Copywriting Caption & Riset Tagar Optimal",
          "Penjadwalan Otomatis & Laporan Bulanan Singkat",
        ],
        deliverablesEn: [
          "8x Single Post / Educational Carousel Designs",
          "4x Dynamic Short-Form Reels / TikToks",
          "Persuasive Captions & Targeted Hashtag Strategy",
          "Automated Scheduling & Monthly Performance Snapshot",
        ],
        deliverablesMin: [
          "8x Desain Postingan & Carousel",
          "4x Video Reels / TikTok Dinamis",
          "Tulisan Caption & Riset Tagar Pilihan",
          "Jadwal Tayang Otomatis & Laporan Bulanan",
        ],
      },
      {
        id: "pro",
        name: "Omnichannel Pro (24 Konten/Bulan)",
        nameEn: "Omnichannel Pro (24 Posts/Month)",
        nameMin: "Omnichannel Pro (24 Konten/Bulan)",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Agensi",
        priceNoteEn: "Agency Standard",
        priceNoteMin: "Standar Agensi",
        duration: "Siklus Bulanan (30 Hari)",
        durationEn: "Monthly Cycle (30 Days)",
        durationMin: "Putaran Sabulan (30 Hari)",
        revisions: "Revisi Fleksibel",
        revisionsEn: "Flexible Revisions",
        revisionsMin: "Revisi Leluasa",
        description: "Strategi pertumbuhan agresif dengan hampir setiap hari posting konten visual berkualitas tinggi dan interaksi aktif.",
        descriptionEn: "Aggressive growth retainer with near-daily high-fidelity content publishing and active community nurturing.",
        descriptionMin: "Strategi lakeh gadang jo postingan ampiang tiok hari sarato interaksi rame jo pangikuik.",
        deliverables: [
          "14x Desain Feed & Carousel Storytelling Mendalam",
          "10x Video Reels Beranimasi / Konten UGC Kreatif",
          "Story Harian (2-3 Story per hari kerja)",
          "Admin Komunitas (Membalas Komentar & DM Interaksi)",
          "Laporan Analitik Komprehensif & Rekomendasi Kampanye",
        ],
        deliverablesEn: [
          "14x Deep-Dive Feeds & Storytelling Carousels",
          "10x Animated Reels / Bespoke Creative Short Videos",
          "Daily Stories (2-3 Branded Stories per Business Day)",
          "Community Management (Replying to comments & DMs)",
          "Comprehensive Analytical Audit & Campaign Roadmap",
        ],
        deliverablesMin: [
          "14x Desain Feed & Carousel Carito Mandalam",
          "10x Video Reels Animasi / Video Kreatif",
          "Story Tiok Hari (2-3 Story di hari karajo)",
          "Admin Balas Komentar jo DM Pasan",
          "Laporan Lengkok & Saran Strategi Karajo",
        ],
      },
      {
        id: "enterprise",
        name: "Dedicated Creative Squad Retainer",
        nameEn: "Dedicated Creative Squad Retainer",
        nameMin: "Tim Kreatif Khusus Parusahoan",
        badge: "Tim Penuh Khusus",
        badgeEn: "Dedicated Unit",
        badgeMin: "Tim Khusus Panuah",
        priceNote: "Custom Scale Bulanan",
        priceNoteEn: "Custom Monthly Retainer",
        priceNoteMin: "Langganan Khusus",
        duration: "Kontrak Minimal 3 Bulan",
        durationEn: "Minimum 3-Month Term",
        durationMin: "Minimal Pajanjian 3 Bulan",
        revisions: "Sprint Tanpa Batas Wajar",
        revisionsEn: "Unlimited Sprint Iterations",
        revisionsMin: "Revisi Leluasa Sabananyo",
        description: "Menempatkan 1 tim kreatif khusus (Art Director, Content Creator, Copywriter, Ads Specialist) penuh untuk brand Anda.",
        descriptionEn: "Placing a dedicated embedded creative unit (Art Director, Content Producer, Copywriter, Media Buyer) strictly for your brand.",
        descriptionMin: "Mampunyoi 1 tim kreatif khusus (Pengarah Seni, Kreator Konten, Panulih, Ahli Iklan) fokus untuak parusahoan sanak.",
        deliverables: [
          "30+ Konten Multi-Platform (Instagram, TikTok, YouTube Shorts, LinkedIn)",
          "Sesi Syuting Rutin Setiap Bulan",
          "Optimasi & Pemasangan Iklan Berbayar (Meta Ads / TikTok Ads)",
          "Dedicated Project Manager & Rapat Evaluasi Mingguan",
        ],
        deliverablesEn: [
          "30+ Multichannel Content Pieces (IG, TikTok, Shorts, LinkedIn)",
          "Monthly Dedicated On-Site Production Shoot Days",
          "Paid Advertising Setup & Performance Optimization (Meta / TikTok)",
          "Dedicated Account Executive & Weekly Strategic Syncs",
        ],
        deliverablesMin: [
          "30+ Konten Kasadonyo Media (Instagram, TikTok, Shorts, LinkedIn)",
          "Sesi Syuting Rutin Tiok Bulan",
          "Pasang jo Atur Iklan Berbayar (Meta / TikTok Ads)",
          "Pangurus Khusus & Rapat Evaluasi Mingguan",
        ],
      },
    ],
  },
  {
    id: "drone-mapping",
    title: "Pemetaan Denah dengan Drone",
    titleEn: "Drone Aerial Mapping & Survey",
    titleMin: "Pametaan jo Drone Udara",
    category: "aerial",
    categoryLabel: "Drone & Pemetaan",
    categoryLabelEn: "Drone & Aerial",
    categoryLabelMin: "Drone & Pemetaan",
    thumbnailUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    tagline: "Fotogrametri udara, peta ortofoto presisi tinggi, dan survei kontur lahan untuk konstruksi dan properti.",
    taglineEn: "Precision drone photogrammetry, high-resolution orthomosaic mapping, and topographic contour surveys.",
    taglineMin: "Pametaan foto udaro presisi tinggi, survei tanah, sarato kontur untuak proyek jo properti.",
    description:
      "Layanan survei dan pemetaan topografi berbasis drone berlisensi resmi. Menghasilkan peta foto ortomosaik tergeoreferensi akurat, model elevasi digital (DEM/DSM), visualisasi 3D lahan, hingga rekaman udara 4K untuk presentasi kawasan industri dan real estate.",
    descriptionEn:
      "Certified drone aerial surveying and topographic mapping. Delivering sub-centimeter georeferenced orthomosaics, Digital Elevation Models (DEM/DSM), 3D volumetric landscape meshes, and 4K aerial footage for real estate and industrial zones.",
    descriptionMin:
      "Layanan survei sarato pametaan tanah mamakai drone rasmi balisensi. Mahasilan peta foto ortomosaik jaleh, peta kontur tanah, model 3D, sarato video 4K untuak kawasan perumahan jo industri.",
    popular: false,
    isClosed: false,
    iconName: "RiCompass3Line",
    keyFeatures: [
      "Pilot Drone Berlisensi Resmi Federasi & Asuransi",
      "Peta Ortomosaik Resolusi Tinggi (GSD < 2.5 cm/px)",
      "Model Digital Surface Model (DSM) & Digital Terrain Model (DTM)",
      "Termasuk Video Udara Sinematik 4K Landscape",
    ],
    keyFeaturesEn: [
      "Licensed Commercial Drone Pilots & Full Operational Insurance",
      "High-Resolution Orthomosaics (GSD < 2.5 cm/px)",
      "Digital Surface Models (DSM) & Digital Terrain Models (DTM)",
      "Included 4K Cinematic Aerial Showcase Footage",
    ],
    keyFeaturesMin: [
      "Pilot Drone Balisensi Rasmi & Baasuransi",
      "Peta Foto Jaleh Bana (GSD < 2.5 cm/px)",
      "Peta Katinggian Tanah Lengkok (DSM & DTM)",
      "Video Udaro Sinematik 4K Pemandangan",
    ],
    packages: [
      {
        id: "starter",
        name: "Aerial Showcase & Foto Kavling (< 5 Ha)",
        nameEn: "Aerial Showcase & Kavling (< 5 Ha)",
        nameMin: "Video Udaro & Foto Tanah (< 5 Ha)",
        badge: "Properti & Real Estate",
        badgeEn: "Property & Real Estate",
        badgeMin: "Properti & Real Estate",
        priceNote: "Sesuai Luas Lahan",
        priceNoteEn: "Area Based",
        priceNoteMin: "Sasuai Laweh Tanah",
        duration: "3 - 5 Hari Kerja",
        durationEn: "3 - 5 Business Days",
        durationMin: "3 - 5 Hari Karajo",
        revisions: "1x Editing Tambahan",
        revisionsEn: "1x Additional Edit",
        revisionsMin: "1x Pamelokan Tambahan",
        description: "Dokumentasi visual udara sinematik dan foto kavling lahan untuk promosi properti atau tinjauan awal.",
        descriptionEn: "Cinematic aerial survey and high-resolution lot captures for real estate marketing and site reconnaissance.",
        descriptionMin: "Video udaro sinematik sarato foto tanah untuak promosi jualan perumahan atau paninjauan lahan.",
        deliverables: [
          "Foto Udara Resolusi Tinggi 20+ Titik Sudut",
          "1x Video Sinematik Udara 4K (60 - 90 Detik) dengan Teks Lokasi",
          "Peta Garis Batas Lahan Sederhana (Overlay Google Earth KML)",
          "Penyerahan File Cepat via Cloud Storage",
        ],
        deliverablesEn: [
          "20+ High-Resolution Aerial Stills from Multiple Cardinal Angles",
          "1x 4K Cinematic Aerial Showcase Video (60 - 90s) with Graphic Overlays",
          "Property Boundary Cadastral Overlay (Google Earth KML / KMZ)",
          "Rapid Cloud Delivery Delivery",
        ],
        deliverablesMin: [
          "20+ Foto Udaro Resolusi Jaleh tiok suduik",
          "1x Video Sinematik Udaro 4K (60 - 90 dt) jo Tulisan Tando",
          "Peta Batas Tanah (Bisa Dibukak di Google Earth)",
          "Panyarahan Berkas Kancank di Cloud Storage",
        ],
      },
      {
        id: "pro",
        name: "Orthophoto Mapping & Topografi (5 - 30 Ha)",
        nameEn: "Orthophoto Mapping & Topo (5 - 30 Ha)",
        nameMin: "Peta Ortofoto & Topografi (5 - 30 Ha)",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Survei",
        priceNoteEn: "Standard Survey",
        priceNoteMin: "Standar Survei",
        duration: "6 - 10 Hari Kerja",
        durationEn: "6 - 10 Business Days",
        durationMin: "6 - 10 Hari Karajo",
        revisions: "2x Kalibrasi",
        revisionsEn: "2x Calibrations",
        revisionsMin: "2x Kalibrasi",
        description: "Pemetaan fotogrametri udara presisi dengan GCP (Ground Control Point) untuk perencanaan arsitektur dan cut-and-fill.",
        descriptionEn: "Precision photogrammetric mapping with Ground Control Points (GCPs) for civil engineering and cut-and-fill estimates.",
        descriptionMin: "Pametaan fotogrametri jaleh mamakai tando GCP untuak rancangan bangunan sarato itungan timbunan tanah.",
        deliverables: [
          "Peta Ortomosaik Tergeoreferensi Resolusi Tinggi (GeoTIFF / ECW)",
          "Garis Kontur Elevasi Interval 0.5 - 1 Meter (Format DXF / DWG / SHP)",
          "Peta Digital Elevation Model (DEM) & Digital Surface Model (DSM)",
          "Laporan Survei & Akurasi Pemetaan",
        ],
        deliverablesEn: [
          "Sub-Centimeter Georeferenced Orthomosaic (GeoTIFF / ECW)",
          "Topographic Contour Vectors at 0.5 - 1m Intervals (DXF, DWG, SHP)",
          "Digital Elevation Models (DEM) & Surface Models (DSM)",
          "Complete Engineering Survey Accuracy & Calibration Audit",
        ],
        deliverablesMin: [
          "Peta Ortomosaik Koordinat Jaleh (GeoTIFF / ECW)",
          "Garih Kontur Katinggian 0.5 - 1 Meter (Format AutoCAD DXF / DWG)",
          "Peta Katinggian Permukaan (DEM & DSM)",
          "Laporan Hasil Survei & Tingkat Akurasi",
        ],
      },
      {
        id: "enterprise",
        name: "Large Scale Survey & 3D Reality Mesh (> 30 Ha)",
        nameEn: "3D Reality Mesh & Scale Survey (> 30 Ha)",
        nameMin: "Survei Kawasan Gadang & 3D Reality (> 30 Ha)",
        badge: "Skala Infrastruktur",
        badgeEn: "Infrastructure Grade",
        badgeMin: "Skala Infrastruktur Gadang",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Survey Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "12 - 20 Hari Kerja",
        durationEn: "12 - 20 Business Days",
        durationMin: "12 - 20 Hari Karajo",
        revisions: "Dedicated Geodetic Team",
        revisionsEn: "Dedicated Geodetic Team",
        revisionsMin: "Didampingi Ahli Ukur Geodesi",
        description: "Pemetaan wilayah berskala masif dengan rekonstruksi model 3D fotorealistik (Reality Mesh) untuk perkebunan, pertambangan, dan infrastruktur.",
        descriptionEn: "Massive scale survey delivering photorealistic 3D reality meshes, volumetric analysis, and BIM/GIS infrastructure data.",
        descriptionMin: "Pametaan wilayah gadang jo rekonstruksi 3D nyato (Reality Mesh) untuak perkebunan, tambang, atau jalan tol.",
        deliverables: [
          "Model 3D Reality Mesh Kawasan Penuh (Format OBJ, FBX, 3MX)",
          "Perhitungan Volume Cut & Fill dan Stokpile Akurat",
          "Integrasi Data ke Software GIS (QGIS / ArcGIS) & CAD",
          "Video Animasi Flythrough 3D Lintasan Kawasan",
        ],
        deliverablesEn: [
          "Complete Photorealistic 3D Reality Mesh (OBJ, FBX, 3MX)",
          "Volumetric Cut & Fill and Stockpile Earthwork Computation",
          "Direct Integration to GIS (QGIS, ArcGIS) and BIM Platforms",
          "Cinematic 3D Flythrough Virtual Animation of the Territory",
        ],
        deliverablesMin: [
          "Model 3D Kawasan Panuah (Format OBJ, FBX, 3MX)",
          "Itungan Volume Timbunan jo Galian Tanah Pas",
          "Bisa Dimasuak-an ka QGIS, ArcGIS, jo AutoCAD",
          "Video Terbang Lintasan 3D Kawasan",
        ],
      },
    ],
  },
  {
    id: "build-app-startup",
    title: "Build App Startup MVP",
    titleEn: "Startup MVP & Mobile App",
    titleMin: "Bangun Aplikasi Startup MVP",
    category: "web-app",
    categoryLabel: "Web & App Development",
    categoryLabelEn: "Web & App Development",
    categoryLabelMin: "Web & App Development",
    thumbnailUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80",
    tagline: "Wujudkan ide startup menjadi produk digital nyata (MVP) yang siap diluncurkan dan diuji ke pasar.",
    taglineEn: "Transform visionary startup concepts into production-grade MVPs engineered for investor funding and market launch.",
    taglineMin: "Wujuikan ide startup jadi aplikasi nyato (MVP) nan siap diluncurkan sarato diuji ka pasar.",
    description:
      "Pengembangan aplikasi mobile & web Minimum Viable Product (MVP) secara kilat namun berskala enterprise. Meliputi arsitektur sistem, desain antarmuka, pembuatan frontend & backend, basis data realtime, integrasi pembayaran, hingga peluncuran ke App Store & Google Play Store.",
    descriptionEn:
      "Rapid, enterprise-grade engineering for mobile & web Minimum Viable Products (MVPs). Encompassing system architecture, UI/UX, fullstack frontend & backend, realtime cloud database, payments, and App Store / Google Play submissions.",
    descriptionMin:
      "Pambuekan aplikasi HP & web MVP lakeh namun bakualitas tinggi. Mencakup susunan sistem, desain antarmuka, frontend & backend, database realtime, sambungan bayar, sampai terbit di App Store & Play Store.",
    popular: true,
    isClosed: false,
    iconName: "RiRocketLine",
    keyFeatures: [
      "Teknologi Modern (React Native / Flutter / Next.js)",
      "Backend & Database Cloud Skala Tinggi (Supabase / Firebase)",
      "Integrasi Autentikasi & Payment Gateway Lengkap",
      "Bimbingan Handoff & Penyerahan Kepemilikan Kode 100%",
    ],
    keyFeaturesEn: [
      "Modern Stacks (React Native / Flutter / Next.js)",
      "High-Scalability Cloud Database (Supabase / Firebase)",
      "Secure Auth & Native Payment Gateway Integrations",
      "100% Source Code Ownership & Deployment Guidance",
    ],
    keyFeaturesMin: [
      "Teknologi Modern (React Native / Flutter / Next.js)",
      "Database Cloud Kancank (Supabase / Firebase)",
      "Sistem Login Aman jo Sambungan Pembayaran",
      "Panyarahan Koding Sabana Panuah 100%",
    ],
    packages: [
      {
        id: "starter",
        name: "Interactive MVP Prototype (No-Code / Low-Code)",
        nameEn: "Interactive MVP Prototype (Low-Code)",
        nameMin: "Prototipe MVP Interaktif (Low-Code)",
        badge: "Validasi Ide Cepat",
        badgeEn: "Rapid Validation",
        badgeMin: "Uji Coba Ide Cepat",
        priceNote: "Sesuai Lingkup Fitur",
        priceNoteEn: "Scope Based",
        priceNoteMin: "Sasuai Fitur",
        duration: "7 - 14 Hari Kerja",
        durationEn: "7 - 14 Business Days",
        durationMin: "7 - 14 Hari Karajo",
        revisions: "2x Putaran Iterasi",
        revisionsEn: "2x Iteration Sprints",
        revisionsMin: "2x Putaran Iterasi",
        description: "Aplikasi berfungsi nyata untuk validasi pasar awal kepada calon pengguna dan presentasi investor.",
        descriptionEn: "Working, functional digital product to validate product-market fit and pitch angel investors.",
        descriptionMin: "Aplikasi nan batua-batua jalan untuak uji coba ka calon pangguno jo presentasi ka investor.",
        deliverables: [
          "Aplikasi Web / Mobile Berfungsi (Alur Inti 3-5 Layar)",
          "Database Cloud Siap Tampung Registrasi Pengguna",
          "Integrasi Notifikasi Email / WhatsApp",
          "Hosting Live Siap Digunakan Publik",
        ],
        deliverablesEn: [
          "Functional Web / Mobile App (Core 3-5 Screen Workflow)",
          "Realtime Cloud Database Ready for User Registrations",
          "Automated Email / WhatsApp Notification Integrations",
          "Live Production Hosting Ready for Public Beta",
        ],
        deliverablesMin: [
          "Aplikasi Web / HP Jalan (Alua Utamo 3-5 Layar)",
          "Database Cloud Siap Tampuang Pendaftaran Urang",
          "Pasan Otomatis ka Surek / WhatsApp",
          "Hosting Live Siap Dipakai Urang Rami",
        ],
      },
      {
        id: "pro",
        name: "Full-Stack Custom App MVP",
        nameEn: "Full-Stack Custom App MVP",
        nameMin: "Full-Stack Custom App MVP",
        badge: "Paling Populer",
        badgeEn: "Most Popular",
        badgeMin: "Paliang Dipiliah",
        priceNote: "Standar Startup",
        priceNoteEn: "Startup Standard",
        priceNoteMin: "Standar Startup",
        duration: "20 - 35 Hari Kerja",
        durationEn: "20 - 35 Business Days",
        durationMin: "20 - 35 Hari Karajo",
        revisions: "4x Sprint Iterasi",
        revisionsEn: "4x Iteration Sprints",
        revisionsMin: "4x Sprint Iterasi",
        description: "Aplikasi custom lengkap dengan frontend native / web, backend API kustom, autentikasi aman, dan payment gateway.",
        descriptionEn: "Complete custom application with native/web frontend, bespoke API backend, secure auth, and payments.",
        descriptionMin: "Aplikasi langkok jo tampilan rancak, backend server aman, sistem login, sarato payment gateway.",
        deliverables: [
          "Frontend Mobile (iOS & Android) atau Web App Responsif",
          "Backend API REST / GraphQL dengan Autentikasi Pengguna",
          "Integrasi Pembayaran (Midtrans / Xendit / Stripe)",
          "Dashboard Admin untuk Pemilik Startup Memantau Transaksi",
          "Pendampingan Submit ke App Store & Google Play",
        ],
        deliverablesEn: [
          "Mobile Frontend (iOS & Android) or Responsive Web App",
          "Secure REST / GraphQL Backend API with JWT Auth",
          "Payment Gateway Integration (Midtrans / Xendit / Stripe)",
          "Executive Admin Operations Dashboard for Transaction Metrics",
          "App Store & Google Play Store Submission Assistance",
        ],
        deliverablesMin: [
          "Aplikasi HP (iOS & Android) atau Web Responsif",
          "Backend Server jo Sistem Login Aman",
          "Sambungan Bayar (Midtrans / Xendit / Stripe)",
          "Dashboard Admin untuak Caliak Transaksi",
          "Bantuan Mamasuakkan ka App Store & Google Play",
        ],
      },
      {
        id: "enterprise",
        name: "Scale-Ready Startup Tech Ecosystem",
        nameEn: "Scale-Ready Startup Ecosystem",
        nameMin: "Ekosistem Teknologi Startup Skala Gadang",
        badge: "Skala Pertumbuhan Masif",
        badgeEn: "Hyper-Growth Grade",
        badgeMin: "Skala Patumbuahan Gadang",
        priceNote: "Custom Project Scale",
        priceNoteEn: "Custom Production Scope",
        priceNoteMin: "Sasuai Ukuran Proyek",
        duration: "40 - 60 Hari Kerja",
        durationEn: "40 - 60 Business Days",
        durationMin: "40 - 60 Hari Karajo",
        revisions: "Dedicated Tech Lead & CTO Advisor",
        revisionsEn: "Dedicated Tech Lead & CTO Advisor",
        revisionsMin: "Didampingi Pimpinan Teknologi Khusus",
        description: "Solusi rekayasa perangkat lunak menyeluruh dengan arsitektur microservices, pengujian otomatis, dan pendampingan CTO.",
        descriptionEn: "Enterprise software engineering suite engineered with microservices, automated CI/CD, and advisory support.",
        descriptionMin: "Solusi pambuekan aplikasi skala gadang jo arsitektur tangguah, uji coba otomatis, sarato panduan ahli.",
        deliverables: [
          "Aplikasi Multi-Platform Terpadu (Mobile iOS + Android + Web Portal)",
          "Arsitektur Backend Skalabel Menampung Jutaan Pengguna",
          "Sistem Keamanan Tingkat Tinggi (Data Encryption & OWASP Standard)",
          "Setup CI/CD Pipeline Otomatis & Docker / Kubernetes",
          "Dokumentasi Teknis Lengkap & Handoff 100% Kepemilikan Kode",
        ],
        deliverablesEn: [
          "Unified Multi-Platform Suite (iOS + Android + Web Portal)",
          "High-Concurrency Scalable Architecture Built for Millions of Users",
          "Enterprise Security Setup (End-to-End Encryption, OWASP Compliance)",
          "Automated CI/CD DevOps Pipeline (Docker / Kubernetes)",
          "Complete Engineering Blueprint Documentation & 100% Code Handoff",
        ],
        deliverablesMin: [
          "Aplikasi Sarato Lini (HP iOS, Android, jo Web)",
          "Arsitektur Kancank Siap Tampuang Jutaan Pangguno",
          "Kaamanan Tingkat Tinggi (Enkripsi Data)",
          "Pangalolaan Server Otomatis CI/CD",
          "Buku Petunjuak Teknis Lengkok jo Hak Koding Panuah 100%",
        ],
      },
    ],
  },
];

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "all", label: "Semua Produk", labelEn: "All Products", labelMin: "Kasado Produk" },
  { id: "branding", label: "Branding & Identitas", labelEn: "Branding & Identity", labelMin: "Branding & Identitas" },
  { id: "web-app", label: "Web & App Development", labelEn: "Web & App Development", labelMin: "Web & App Development" },
  { id: "video-motion", label: "Video & Motion", labelEn: "Video & Motion", labelMin: "Video & Motion" },
  { id: "visual-craft", label: "3D & Creative Imaging", labelEn: "3D & Creative Imaging", labelMin: "3D & Creative Imaging" },
  { id: "marketing", label: "Marketing & Sosmed", labelEn: "Marketing & Social", labelMin: "Marketing & Sosmed" },
  { id: "aerial", label: "Drone & Pemetaan", labelEn: "Drone & Aerial", labelMin: "Drone & Pemetaan" },
];

/**
 * Get all products from Supabase Cloud + LocalStorage fallback
 */
export async function getAllProducts(): Promise<ProductItem[]> {
  let products: ProductItem[] | null = null;

  // 1. Try Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("client_descriptions")
        .select("description")
        .eq("client_id", SUPABASE_PRODUCTS_KEY)
        .single();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed) && parsed.length > 0) {
          products = parsed;
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
          }
        }
      }
    } catch (err) {
      console.warn("Supabase products read notice:", err);
    }
  }

  // 2. Try LocalStorage
  if (!products && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        products = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("LocalStorage products read notice:", e);
    }
  }

  // 3. Fallback to default products
  if (!products || products.length === 0) {
    products = [...DEFAULT_PRODUCTS];
  } else {
    // Reconcile with DEFAULT_PRODUCTS to guarantee thumbnails, pros, cons, and all 13 products
    const defaultMap = new Map(DEFAULT_PRODUCTS.map((dp) => [dp.id, dp]));
    const merged: ProductItem[] = products.map((item) => {
      const def = defaultMap.get(item.id);
      if (!def) return item;
      return {
        ...def,
        ...item,
        thumbnailUrl: item.thumbnailUrl || def.thumbnailUrl,
        packages: (item.packages && item.packages.length > 0 ? item.packages : def.packages).map((pkg, idx) => {
          const defPkg = def.packages?.[idx] || def.packages?.find((p) => p.id === pkg.id);
          return {
            ...defPkg,
            ...pkg,
            thumbnailUrl: pkg.thumbnailUrl || defPkg?.thumbnailUrl,
            pros: pkg.pros && pkg.pros.length > 0 ? pkg.pros : defPkg?.pros,
            cons: pkg.cons && pkg.cons.length > 0 ? pkg.cons : defPkg?.cons,
          };
        }),
      };
    });

    for (const def of DEFAULT_PRODUCTS) {
      if (!merged.some((p) => p.id === def.id)) {
        merged.push(def);
      }
    }
    products = merged;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  return products;
}

/**
 * Save all products to Supabase Cloud + LocalStorage & dispatch sync event
 */
export async function saveAllProducts(products: ProductItem[]): Promise<boolean> {
  // 1. Save LocalStorage & Broadcast across tabs
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent("rizx_products_updated", { detail: products }));
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("rizx_products_channel");
        bc.postMessage({ type: "SYNC", products });
        bc.close();
      }
    } catch (e) {
      console.warn("LocalStorage products save notice:", e);
    }
  }

  // 2. Save Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("client_descriptions").upsert(
        {
          client_id: SUPABASE_PRODUCTS_KEY,
          client_name: "Products & Services Catalog",
          category: "Products Catalog",
          description: JSON.stringify(products),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );
      if (error) {
        console.warn("Supabase products save notice:", error);
      }
      return true;
    } catch (err) {
      console.warn("Supabase products save exception:", err);
    }
  }

  return true;
}

/**
 * Subscribe to realtime product changes across tabs and devices
 */
export function subscribeToProductsRealtime(
  callback: (products: ProductItem[]) => void
): () => void {
  // 1. In-page custom event listener
  const handleLocal = (e: Event) => {
    const custom = e as CustomEvent<ProductItem[]>;
    if (custom.detail && Array.isArray(custom.detail)) {
      callback(custom.detail);
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("rizx_products_updated", handleLocal);
  }

  // 2. Cross-tab BroadcastChannel listener
  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel("rizx_products_channel");
      broadcastChannel.onmessage = (event) => {
        if (event.data && Array.isArray(event.data.products)) {
          callback(event.data.products);
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel notice:", e);
    }
  }

  // 3. Cross-tab Storage event fallback
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          callback(parsed);
        }
      } catch (err) {
        // ignore
      }
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  // 4. Supabase Cloud Realtime Channel (Cross-device, instant WebSocket)
  let supabaseChannel: any = null;
  if (isSupabaseConfigured && supabase) {
    try {
      supabaseChannel = supabase
        .channel(`realtime-products-${Math.random().toString(36).substring(7)}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "client_descriptions",
            filter: `client_id=eq.${SUPABASE_PRODUCTS_KEY}`,
          },
          (payload) => {
            if (payload.new && (payload.new as any).description) {
              try {
                const parsed = JSON.parse((payload.new as any).description);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  if (typeof window !== "undefined") {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                  }
                  callback(parsed);
                }
              } catch (err) {
                console.warn("Realtime products parse notice:", err);
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Supabase Realtime subscription notice:", err);
    }
  }

  // Return unsubscribe cleanup function
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("rizx_products_updated", handleLocal);
      window.removeEventListener("storage", handleStorage);
    }
    if (broadcastChannel) {
      broadcastChannel.close();
    }
    if (supabase && supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

/**
 * Add a new product to catalog
 */
export async function addProduct(newProduct: ProductItem): Promise<boolean> {
  const current = await getAllProducts();
  const exists = current.some((p) => p.id === newProduct.id);
  if (exists) {
    throw new Error(`Product with ID "${newProduct.id}" already exists`);
  }
  const updated = [newProduct, ...current];
  return saveAllProducts(updated);
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<ProductItem>): Promise<boolean> {
  const current = await getAllProducts();
  const idx = current.findIndex((p) => p.id === id);
  if (idx === -1) {
    throw new Error(`Product "${id}" not found`);
  }
  const updatedItem: ProductItem = {
    ...current[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  current[idx] = updatedItem;
  return saveAllProducts([...current]);
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const current = await getAllProducts();
  const filtered = current.filter((p) => p.id !== id);
  return saveAllProducts(filtered);
}

/**
 * Toggle product open/close status
 */
export async function toggleProductClosed(
  id: string,
  isClosed?: boolean,
  reason?: string
): Promise<boolean> {
  const current = await getAllProducts();
  const item = current.find((p) => p.id === id);
  if (!item) return false;

  const nextClosed = isClosed !== undefined ? isClosed : !item.isClosed;
  return updateProduct(id, {
    isClosed: nextClosed,
    closeReason: reason !== undefined ? reason : item.closeReason,
  });
}

/**
 * Reset products catalog to defaults
 */
export async function resetProductsToDefault(): Promise<boolean> {
  return saveAllProducts([...DEFAULT_PRODUCTS]);
}

/**
 * Get localized product representation based on active language ("en" | "id" | "min")
 */
export function getLocalizedProduct(
  item: ProductItem,
  lang: "en" | "id" | "min"
): {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  thumbnailUrl?: string;
  tagline: string;
  description: string;
  popular?: boolean;
  isClosed?: boolean;
  closeReason?: string;
  iconName: string;
  keyFeatures: string[];
  packages: {
    id: string;
    name: string;
    badge?: string;
    thumbnailUrl?: string;
    priceNote: string;
    duration: string;
    revisions: string;
    description: string;
    deliverables: string[];
    pros?: string[];
    cons?: string[];
    isClosed?: boolean;
  }[];
} {
  const isEn = lang === "en";
  const isMin = lang === "min";

  const title = isEn
    ? item.titleEn || item.title
    : isMin
    ? item.titleMin || toMinang(item.title)
    : item.title;

  const categoryLabel = isEn
    ? item.categoryLabelEn || item.categoryLabel
    : isMin
    ? item.categoryLabelMin || toMinang(item.categoryLabel)
    : item.categoryLabel;

  const tagline = isEn
    ? item.taglineEn || item.tagline
    : isMin
    ? item.taglineMin || toMinang(item.tagline)
    : item.tagline;

  const description = isEn
    ? item.descriptionEn || item.description
    : isMin
    ? item.descriptionMin || toMinang(item.description)
    : item.description;

  const closeReason = isEn
    ? item.closeReasonEn || item.closeReason || "Orders Temporarily Closed / Full Capacity"
    : isMin
    ? item.closeReasonMin || (item.closeReason ? toMinang(item.closeReason) : "Slot Panuah / Ditutuik Samantaro")
    : item.closeReason || "Slot Penuh / Pesanan Ditutup Sementara";

  let keyFeatures = item.keyFeatures;
  if (isEn && item.keyFeaturesEn && item.keyFeaturesEn.length > 0) {
    keyFeatures = item.keyFeaturesEn;
  } else if (isMin) {
    keyFeatures = item.keyFeaturesMin && item.keyFeaturesMin.length > 0
      ? item.keyFeaturesMin
      : item.keyFeatures.map((f) => toMinang(f));
  }

  const packages = (item.packages || []).map((pkg) => {
    const pkgName = isEn
      ? pkg.nameEn || pkg.name
      : isMin
      ? pkg.nameMin || toMinang(pkg.name)
      : pkg.name;

    const pkgBadge = isEn
      ? pkg.badgeEn || pkg.badge
      : isMin
      ? pkg.badgeMin || (pkg.badge ? toMinang(pkg.badge) : undefined)
      : pkg.badge;

    const pkgPriceNote = isEn
      ? pkg.priceNoteEn || pkg.priceNote
      : isMin
      ? pkg.priceNoteMin || toMinang(pkg.priceNote)
      : pkg.priceNote;

    const pkgDuration = isEn
      ? pkg.durationEn || pkg.duration
      : isMin
      ? pkg.durationMin || toMinang(pkg.duration)
      : pkg.duration;

    const pkgRevisions = isEn
      ? pkg.revisionsEn || pkg.revisions
      : isMin
      ? pkg.revisionsMin || toMinang(pkg.revisions)
      : pkg.revisions;

    const pkgDescription = isEn
      ? pkg.descriptionEn || pkg.description
      : isMin
      ? pkg.descriptionMin || toMinang(pkg.description)
      : pkg.description;

    let deliverables = pkg.deliverables;
    if (isEn && pkg.deliverablesEn && pkg.deliverablesEn.length > 0) {
      deliverables = pkg.deliverablesEn;
    } else if (isMin) {
      deliverables = pkg.deliverablesMin && pkg.deliverablesMin.length > 0
        ? pkg.deliverablesMin
        : pkg.deliverables.map((d) => toMinang(d));
    }

    let pros = pkg.pros;
    if (isEn && pkg.prosEn && pkg.prosEn.length > 0) {
      pros = pkg.prosEn;
    } else if (isMin && pkg.prosMin && pkg.prosMin.length > 0) {
      pros = pkg.prosMin;
    }

    let cons = pkg.cons;
    if (isEn && pkg.consEn && pkg.consEn.length > 0) {
      cons = pkg.consEn;
    } else if (isMin && pkg.consMin && pkg.consMin.length > 0) {
      cons = pkg.consMin;
    }

    return {
      id: pkg.id,
      name: pkgName,
      badge: pkgBadge,
      thumbnailUrl: pkg.thumbnailUrl,
      priceNote: pkgPriceNote,
      duration: pkgDuration,
      revisions: pkgRevisions,
      description: pkgDescription,
      deliverables,
      pros,
      cons,
      isClosed: pkg.isClosed,
    };
  });

  return {
    id: item.id,
    title,
    category: item.category,
    categoryLabel,
    thumbnailUrl: item.thumbnailUrl,
    tagline,
    description,
    popular: item.popular,
    isClosed: item.isClosed,
    closeReason,
    iconName: item.iconName,
    keyFeatures,
    packages,
  };
}

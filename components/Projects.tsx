"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { antigravityData } from "@/data/projectsData";
import {
  HiXMark,
  HiArrowUpRight,
  HiFolder,
  HiSparkles,
  HiExclamationTriangle,
  HiCheckCircle,
  HiPlay,
} from "react-icons/hi2";
import { SiBlender, SiFigma, SiCinema4D, SiGooglegemini } from "react-icons/si";
import { useLang } from "@/context/LanguageContext";
import { usePortfolioData, extractYouTubeId } from "@/context/PortfolioDataContext";

interface WorkItem {
  id: string;
  title: string;
  type: string;
  image: string;
  aspect: string;
  brand?: string;
  year?: string;
  brief?: string;
  approach?: string;
  role?: string;
  challenge?: string;
  solution?: string;
  tools?: string[];
  isClientWork?: boolean;
}

interface ModalItem extends WorkItem {
  clientName: string;
  videoId?: string;
  youtubeUrl?: string;
}

/**
 * ToolBadge — Visual icon badges for creative tools
 */
function ToolBadge({ tool }: { tool: string }) {
  const normalized = tool.toLowerCase().trim();

  if (normalized === "photoshop" || normalized === "ps") {
    return (
      <div
        title="Adobe Photoshop"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#001E36] border border-[#31A8FF]/40 text-[#31A8FF] shadow-sm select-none"
      >
        <span className="w-4 h-4 rounded bg-[#31A8FF] text-[#001E36] font-black text-[10px] flex items-center justify-center font-mono">
          Ps
        </span>
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Photoshop
        </span>
      </div>
    );
  }

  if (normalized === "illustrator" || normalized === "ai") {
    return (
      <div
        title="Adobe Illustrator"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#330000] border border-[#FF9A00]/40 text-[#FF9A00] shadow-sm select-none"
      >
        <span className="w-4 h-4 rounded bg-[#FF9A00] text-[#330000] font-black text-[10px] flex items-center justify-center font-mono">
          Ai
        </span>
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Illustrator
        </span>
      </div>
    );
  }

  if (normalized === "aftereffects" || normalized === "ae") {
    return (
      <div
        title="Adobe After Effects"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00005B] border border-[#9999FF]/40 text-[#9999FF] shadow-sm select-none"
      >
        <span className="w-4 h-4 rounded bg-[#9999FF] text-[#00005B] font-black text-[10px] flex items-center justify-center font-mono">
          Ae
        </span>
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          After Effects
        </span>
      </div>
    );
  }

  if (normalized === "blender") {
    return (
      <div
        title="Blender 3D"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EA7600]/15 border border-[#EA7600]/40 text-[#EA7600] shadow-sm select-none"
      >
        <SiBlender className="w-3.5 h-3.5 text-[#EA7600]" />
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Blender 3D
        </span>
      </div>
    );
  }

  if (normalized === "figma") {
    return (
      <div
        title="Figma"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-[#F24E1E] shadow-sm select-none"
      >
        <SiFigma className="w-3 h-3 text-[#F24E1E]" />
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Figma
        </span>
      </div>
    );
  }

  if (normalized === "cinema4d" || normalized === "c4d") {
    return (
      <div
        title="Cinema 4D"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-400/40 text-blue-300 shadow-sm select-none"
      >
        <SiCinema4D className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Cinema 4D
        </span>
      </div>
    );
  }

  if (normalized === "midjourney") {
    return (
      <div
        title="Midjourney AI"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 shadow-sm select-none"
      >
        <HiSparkles className="w-3 h-3 text-cyan-400" />
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Midjourney
        </span>
      </div>
    );
  }

  if (normalized === "magnific" || normalized === "magnific ai") {
    return (
      <div
        title="Magnific AI"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14AF9E]/10 border border-[#14AF9E]/40 text-[#14AF9E] shadow-sm select-none"
      >
        <HiSparkles className="w-3 h-3 text-[#14AF9E]" />
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Magnific AI
        </span>
      </div>
    );
  }

  if (normalized === "gpt" || normalized === "chatgpt" || normalized === "openai") {
    return (
      <div
        title="ChatGPT / GPT-4"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10A37F]/15 border border-[#10A37F]/40 text-[#10A37F] shadow-sm select-none"
      >
        <span className="w-4 h-4 rounded bg-[#10A37F] text-white font-black text-[8px] flex items-center justify-center font-mono">
          GPT
        </span>
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          ChatGPT
        </span>
      </div>
    );
  }

  if (normalized === "gemini" || normalized === "google gemini") {
    return (
      <div
        title="Google Gemini"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-400/40 text-indigo-300 shadow-sm select-none"
      >
        <SiGooglegemini className="w-3.5 h-3.5 text-[#799FFF]" />
        <span className="text-[10px] font-mono font-medium text-neutral-300">
          Gemini
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 select-none">
      <span className="text-[10px] font-mono capitalize">{tool}</span>
    </div>
  );
}

/**
 * Client Brand Description Translations (Bilingual Support)
 */
const clientBrandDescMap: Record<string, { en: string; id: string }> = {
  "kia dufour": {
    en: "KIA Dufour is an authorized automotive dealership network in France representing Kia's forward-thinking electric vehicle line-up. Our collaboration focuses on producing high-end digital advertising campaigns, 3D/AI concept automotive visualizations, and promotional marketing collateral for models including the EV2, Sportage, and PBV concepts.",
    id: "KIA Dufour adalah jaringan dealer resmi otomotif terkemuka di Prancis yang memasarkan lini kendaraan listrik inovatif Kia. Kolaborasi kami berfokus pada produksi kampanye iklan digital kelas atas, visualisasi konsep otomotif 3D/AI, dan materi promosi untuk model unggulan termasuk EV2, Sportage, dan PBV.",
  },
  "hyashop": {
    en: "HYASHOP is a premier curated fashion and footwear retail brand catering to contemporary urban demographics. We partnered to create elevated digital editorial campaigns, product lookbooks, and high-conversion social ad creatives blending commercial impact with modern aesthetic direction.",
    id: "HYASHOP adalah brand ritel fesyen dan alas kaki kurasi premium yang menyasar demografi urban modern. Kami berkolaborasi merancang kampanye editorial digital, lookbook produk, dan materi iklan media sosial berkonversi tinggi yang memadukan daya tarik komersial dengan estetika modern.",
  },
  "burger king": {
    en: "Burger King is a world-renowned global fast-food brand recognized for bold flavor and playful advertising. We engineered high-impact promotional digital ad suites, gamified campaign visuals, and localized social media creatives tailored for consumer engagement across Europe.",
    id: "Burger King adalah merek makanan cepat saji global ternama di dunia yang dikenal dengan cita rasa berani dan gaya periklanan yang menyenangkan. Kami merancang materi kampanye iklan digital interaktif, visual promosi bertema permainan, dan konten media sosial terarah.",
  },
  "permifast": {
    en: "Permifast is a French driver education platform simplifying access to driving licences through modern digital learning. We delivered conversion-driven digital ad campaigns, social proof creatives, and promotional giveaway collateral to maximize user acquisition.",
    id: "Permifast adalah platform edukasi pengemudi di Prancis yang mempermudah akses kepemilikan SIM melalui pembelajaran digital modern. Kami merancang kampanye iklan digital berorientasi konversi, aset promosi giveaway, dan materi kreatif media sosial.",
  },
  "xeilos": {
    en: "Xeilos is a high-growth crypto and algorithmic trading intelligence brand. We provided complete event visual identity design, Trading Summit promotional suites, speaker asset layouts, and social media ad production to establish market authority.",
    id: "Xeilos adalah brand analitik kripto dan kecerdasan trading algoritmik bereputasi tinggi. Kami menghadirkan identitas visual acara komprehensif, materi promosi Trading Summit, tata letak aset pembicara, dan produksi iklan media sosial futuristik.",
  },
  "adl - finance": {
    en: "ADL Finance is a modern financial consultancy and wealth management firm. We crafted corporate social advertising assets, structured wealth management campaign layouts, and clean financial visual communication tailored for high-net-worth investors.",
    id: "ADL Finance adalah firma konsultasi keuangan dan manajemen kekayaan modern. Kami merancang materi iklan korporat, tata letak kampanye manajemen aset yang terstruktur, dan komunikasi visual finansial yang elegan bagi para investor.",
  },
  "eduf - education": {
    en: "EDUF is an international education agency and student mobility consultancy. We developed vibrant student recruitment campaign visuals, university fair promotional collateral, and dynamic social media ad suites to drive event registrations globally.",
    id: "EDUF adalah agensi pendidikan internasional dan konsultan mobilitas pelajar global. Kami mengembangkan visual kampanye pendaftaran mahasiswa baru, materi promosi pameran universitas, dan rangkaian iklan media sosial yang energetik.",
  },
  "withings - health tech": {
    en: "Withings is a pioneer in connected health technology and medical-grade smart devices. We produced clean minimalist product campaign visuals, 1:1 lifestyle social media layouts, and smart device highlight cards reflecting Scandinavian elegance.",
    id: "Withings adalah pelopor teknologi kesehatan terhubung dan perangkat pintar berstandar medis. Kami memproduksi visual kampanye produk minimalis yang bersih, layout media sosial bertema gaya hidup modern, dan kartu sorotan fitur elegan.",
  },
};

/**
 * Intelligent AI Case Study Fallback with Bilingual Support (EN & ID)
 */
export function getCaseStudy(work: ModalItem, lang: "en" | "id" = "en") {
  const isId = lang === "id";

  // Priority 1: If in English, and work has explicit fields from Admin / data, return them directly
  if (!isId && (work.challenge || work.solution || work.brief || work.role)) {
    return {
      brand: work.brand || work.clientName || "Brand",
      year: work.year || "2026",
      brief: work.brief || "",
      approach: work.approach || work.solution || "",
      role: work.role || "",
      challenge: work.challenge || "",
      solution: work.solution || "",
      tools: work.tools && work.tools.length > 0 ? work.tools : ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  const title = (work.title || "").toLowerCase();
  const type = (work.type || "").toLowerCase();
  const brand = (work.brand || work.clientName || "").toLowerCase();

  if (title.includes("kia") || type.includes("automotive") || brand.includes("kia")) {
    return {
      brand: work.brand || work.clientName || "KIA Dufour",
      year: work.year || "2026",
      brief: isId
        ? "Pengembangan rangkaian kampanye digital untuk KIA Dufour, menampilkan EV2, PBV, dan Sportage melalui visual otomotif premium dan pesan promosi terarah."
        : "Develop a series of digital campaigns for KIA Dufour, showcasing the EV2, PBV, and Sportage through premium automotive visuals and promotional messaging.",
      approach: isId
        ? "Menggabungkan citra otomotif berbasis AI dengan arsitektur modern, pencahayaan sinematik, dan tipografi bersih."
        : "Combine AI-generated automotive imagery with modern architectural settings, cinematic lighting, and clean typography to create a cohesive campaign across multiple vehicle models.",
      role: isId
        ? "Pengarahan seni, perancangan prompt AI, pembuatan visual, dan desain tata letak kampanye di Photoshop & Figma."
        : "Art direction, AI prompt development, visual generation, and campaign layout design in Photoshop and Figma.",
      challenge: isId
        ? "Menerjemahkan referensi unit kendaraan dari klien menjadi visual suasana realistis berbasis AI dengan tetap menjaga keaslian detail khas tiap model."
        : "Translating client-provided vehicle references into realistic AI-generated scenes while preserving each model's defining details.",
      solution: isId
        ? "Mengembangkan prompt berbasis referensi presisi dan menyempurnakan hasil akhir untuk menjaga akurasi bentuk mobil, konsistensi visual, dan estetika otomotif mewah."
        : "Developed precise, reference-driven prompts and refined the outputs to maintain vehicle accuracy, visual consistency, and a premium automotive aesthetic.",
      tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  if (brand.includes("burger king") || title.includes("burger")) {
    return {
      brand: work.brand || work.clientName || "Burger King",
      year: work.year || "2026",
      brief: isId
        ? "Kampanye Back-to-School Burger King menampilkan koleksi Where's Charlie? — iklan digital bergaya bermain yang menggabungkan karakter ikonik dengan promosi menu pilihan."
        : "Back-to-school campaign for Burger King featuring the Where's Charlie? collection, blending playful character-driven visuals with menu promotions across digital ad formats.",
      approach: isId
        ? "Mengintegrasikan karakter Where's Charlie? ke dalam format iklan digital yang energetik dengan komposisi penuh warna, tipografi cerita, dan hierarki pesan promosi yang jelas."
        : "Integrated the Where's Charlie? character into energetic digital ad formats with vibrant compositions, story-driven typography, and a clear promotional messaging hierarchy.",
      role: isId
        ? "Pengarahan seni, desain layout iklan digital, integrasi karakter merek, dan produksi aset kampanye multi-format."
        : "Art direction, digital ad layout design, brand character integration, and multi-format campaign asset production.",
      challenge: isId
        ? "Menyeimbangkan daya tarik karakter bermain dengan pesan promosi menu yang kuat dalam satu layout iklan digital yang kohesif."
        : "Balancing playful character appeal with strong menu promotional messaging within a single cohesive digital ad layout.",
      solution: isId
        ? "Mendesain komposisi berlapis yang menempatkan karakter sebagai titik perhatian utama sambil memandu mata pemirsa menuju pesan promo secara alami."
        : "Designed layered compositions that placed the character as the primary focal point while naturally guiding the viewer's eye toward the promotional message.",
      tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  if (brand.includes("permifast") || title.includes("permifast")) {
    return {
      brand: work.brand || work.clientName || "Permifast",
      year: work.year || "2026",
      brief: isId
        ? "Kampanye digital giveaway SIM untuk Permifast — mempromosikan program pemberian SIM gratis melalui visual digital yang jelas, menarik, dan mendorong partisipasi audiens."
        : "Driving licence giveaway digital campaign for Permifast, promoting a free SIM card giveaway programme through clear, engaging visuals designed to drive audience participation.",
      approach: isId
        ? "Menggunakan visual berdaya tarik tinggi dengan tipografi besar yang menegaskan penawaran utama, layout bersih yang memandu pengguna, dan elemen visual yang menciptakan urgensi."
        : "Used high-impact visuals with bold typography emphasising the key offer, clean layouts guiding the user journey, and visual cues that create urgency and excitement.",
      role: isId
        ? "Desain kampanye digital, tata letak promosi giveaway, pengarahan seni, dan produksi aset iklan media sosial."
        : "Digital campaign design, giveaway promotional layout, art direction, and social media ad asset production.",
      challenge: isId
        ? "Mengkomunikasikan detail program giveaway secara akurat sambil tetap mempertahankan daya tarik visual yang kuat dan mendorong konversi audiens."
        : "Communicating the giveaway programme details accurately while maintaining strong visual appeal and driving audience conversion.",
      solution: isId
        ? "Merancang hierarki visual yang menonjolkan benefit utama di bagian atas, diikuti detail syarat yang ringkas dan CTA yang tegas."
        : "Crafted a visual hierarchy that surfaced the primary benefit upfront, followed by concise programme details and a strong call-to-action.",
      tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  if (brand.includes("xeilos") || title.includes("xeilos")) {
    return {
      brand: work.brand || work.clientName || "Xeilos",
      year: work.year || "2026",
      brief: isId
        ? "Kampanye iklan digital Trading Summit untuk Xeilos — membangun awareness acara dan mendorong pendaftaran melalui serangkaian aset visual media sosial bertema profesional dan futuristik."
        : "Trading Summit digital advertising campaign for Xeilos, building event awareness and driving registrations through a series of professional, forward-looking social media visual assets.",
      approach: isId
        ? "Menggabungkan estetika gelap premium dengan tipografi besar, visual data pasar, dan elemen desain acara untuk mengomunikasikan otoritas dan eksklusivitas Trading Summit."
        : "Combined premium dark aesthetics with bold typography, market data visuals, and event design elements to communicate the authority and exclusivity of the Trading Summit.",
      role: isId
        ? "Pengarahan kreatif, desain aset iklan acara, branding visual Trading Summit, dan produksi konten media sosial multi-format."
        : "Creative direction, event ad asset design, Trading Summit visual branding, and multi-format social media content production.",
      challenge: isId
        ? "Menyampaikan pesan profesional dan informatif tentang acara trading dengan tetap mempertahankan daya tarik visual yang kuat untuk menarik audiens trader dan investor."
        : "Conveying a professional and informative event message while maintaining strong visual appeal to attract a trader and investor audience.",
      solution: isId
        ? "Mendesain komposisi visual yang menempatkan identitas acara sebagai elemen dominan, didukung data dan informasi pembicara sebagai social proof yang memperkuat kepercayaan."
        : "Designed visual compositions placing the event identity as the dominant element, supported by speaker information and data-driven social proof to reinforce credibility.",
      tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  if (brand.includes("adl") || title.includes("adl")) {
    return {
      brand: work.brand || work.clientName || "ADL - Finance",
      year: work.year || "2026",
      brief: isId
        ? "Kampanye pemasaran digital strategis untuk ADL Finance, mengomunikasikan perencanaan keuangan, kepercayaan investasi, dan solusi pengelolaan kekayaan cerdas."
        : "Strategic digital marketing campaign for ADL Finance, communicating financial planning, investment trust, and smart wealth management solutions.",
      approach: isId
        ? "Estetika korporat modern menggabungkan tipografi tegas, palet gelap premium, dan data visual terstruktur untuk menyampaikan keamanan dan pertumbuhan finansial."
        : "Modern corporate aesthetics combining crisp typography, premium dark palettes, and structured visual data points to convey security and financial growth.",
      role: isId
        ? "Pengarahan seni, desain tata letak kampanye finansial, branding visual, dan produksi aset digital di Figma & Photoshop."
        : "Art direction, financial campaign layout design, visual branding, and multi-asset digital production in Figma & Photoshop.",
      challenge: isId
        ? "Menyajikan topik finansial yang kompleks secara jelas dan kredibel di berbagai penempatan iklan digital."
        : "Presenting complex financial topics with clarity and high visual trust across varied digital ad placements.",
      solution: isId
        ? "Mengembangkan sistem visual kredibel dengan hierarki headline yang bersih, warna aksen finansial, dan tata letak promosi yang terarah."
        : "Developed an authoritative visual system with clean headline hierarchies, financial accent colors, and focused promotional layouts.",
      tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  if (brand.includes("eduf") || title.includes("eduf")) {
    return {
      brand: work.brand || work.clientName || "EDUF - Education",
      year: work.year || "2026",
      brief: isId
        ? "Kampanye promosi digital multi-platform untuk EDUF, mendorong keterlibatan siswa dan partisipasi acara pendidikan internasional."
        : "Multi-platform digital promotional campaign for EDUF, driving student engagement and event participation for global education opportunities.",
      approach: isId
        ? "Tata letak dinamis dan ramah generasi muda dengan aksen gradasi cerah, tipografi energetik, dan ajakan bertindak yang jelas untuk audiens pelajar."
        : "Dynamic, youth-centric layouts featuring vibrant gradient treatments, energetic typography, and clear calls-to-action tailored for student demographics.",
      role: isId
        ? "Pengarahan visual kreatif, desain promosi acara, adaptasi iklan media sosial, dan produksi aset kampanye."
        : "Creative visual direction, event promo design, social media ad formatting, and campaign asset production.",
      challenge: isId
        ? "Menangkap antusiasme calon mahasiswa sembari menjaga informasi penting pendaftaran acara tetap mudah terbaca."
        : "Capturing the enthusiasm of prospective students while keeping essential event registration details readily legible.",
      solution: isId
        ? "Menciptakan titik fokus berdaya kontras tinggi dengan lencana acara yang menonjol dan blok teks terstruktur yang mendorong pendaftaran."
        : "Created high-contrast focal points with bold event badges and structured copy blocks that encourage immediate registration.",
      tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  if (brand.includes("withings") || title.includes("withings")) {
    return {
      brand: work.brand || work.clientName || "Withings - Health Tech",
      year: work.year || "2026",
      brief: isId
        ? "Kampanye media sosial elegan untuk Withings, menampilkan ekosistem kesehatan terhubung dan perangkat pintar melalui visual gaya hidup modern."
        : "Sleek social media campaign for Withings, showcasing its connected health ecosystem and precision smart devices through modern lifestyle visuals.",
      approach: isId
        ? "Prinsip desain Skandinavia minimalis dengan pembingkaian 1:1 bujur sangkar, overlay antarmuka halus, dan fokus fotografi produk premium."
        : "Minimalist Scandinavian design principles with clean 1:1 square framing, subtle interface overlays, and refined product photography focus.",
      role: isId
        ? "Desain periklanan digital, retouching visual produk, kurasi aset feed media sosial, dan pengelolaan konsistensi merek."
        : "Digital advertising design, product visual retouching, social feed asset curation, and brand consistency management.",
      challenge: isId
        ? "Menonjolkan teknologi medis mutakhir sekaligus keanggunan gaya hidup sehari-hari dalam format bujur sangkar media sosial."
        : "Highlighting both sophisticated medical-grade technology and everyday lifestyle elegance within compact square social formats.",
      solution: isId
        ? "Memanfaatkan ruang bernapas yang seimbang, bayangan halus, dan sorotan data ringkas yang menekankan kesehatan harian yang mudah."
        : "Utilized balanced breathing room, soft ambient shadows, and crisp data callouts emphasizing effortless everyday wellness.",
      tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
    };
  }

  return {
    brand: work.brand || work.clientName || "HYASHOP",
    year: work.year || "2026",
    brief: isId
      ? "Mengembangkan rangkaian kampanye digital yang menampilkan produk estetika dan kecantikan HYASHOP melalui visual premium dan profesional."
      : "Develop a series of digital campaigns showcasing HYASHOP's aesthetic and beauty products through premium, professional visuals.",
    approach: isId
      ? "Menggabungkan citra berbantuan AI dengan pengarahan seni yang matang, nuansa netral hangat, dan tipografi bersih untuk menciptakan identitas visual yang konsisten."
      : "Combine AI-assisted imagery with refined art direction, warm neutral tones, and clean typography to create a cohesive visual identity across product categories.",
    role: isId
      ? "Pengembangan visual, generasi citra AI, pengarahan seni, dan desain tata letak kampanye di Figma & Magnific AI."
      : "Visual development, AI image generation, art direction, and campaign layout design using Magnific AI and Figma.",
    challenge: isId
      ? "Menyeimbangkan beragam kategori produk dengan estetika merek yang konsisten sembari menjaga akurasi detail produk."
      : "Balance diverse product categories with a consistent brand aesthetic while maintaining product accuracy.",
    solution: isId
      ? "Menciptakan sistem kampanye terpadu melalui komposisi terkontrol, citra realistis, dan hierarki visual yang jelas."
      : "Created a cohesive campaign system through controlled compositions, realistic imagery, and clear visual hierarchy.",
    tools: ["figma", "photoshop", "magnific", "gpt", "gemini"],
  };
}

const getDeckCardInfo = (card: { id: string; title: string; category: string }, isId: boolean) => {
  if (!isId) return { title: card.title, category: card.category };
  const map: Record<string, { title: string; category: string }> = {
    d1: { title: "Identitas Merek", category: "Identitas Merek" },
    d2: { title: "Visual Kampanye", category: "Visual Kampanye" },
    d3: { title: "Motion Graphics", category: "Motion Graphics" },
    d4: { title: "Desain 3D", category: "Desain 3D" },
    d5: { title: "Desain UI/UX", category: "Desain UI/UX" },
  };
  return map[card.id] || { title: card.title, category: card.category };
};

const getStage2CardTitle = (card: { id: string; title: string }, isId: boolean) => {
  if (!isId) return card.title;
  const map: Record<string, string> = {
    o1: "Branding",
    o2: "Motion",
    o3: "UI/UX",
    o4: "Visual AI",
  };
  return map[card.id] || card.title;
};

const getClientCategory = (cat: string, isId: boolean) => {
  if (!isId) return cat;
  return cat
    .replace("Digital Campaign", "Kampanye Digital")
    .replace("Brand Visuals & Ads", "Visual Merek & Iklan");
};

const getWorkLocalized = (work: { title: string; type: string }, isId: boolean) => {
  if (!isId) return { title: work.title, type: work.type };
  let localizedTitle = work.title;
  if (localizedTitle.startsWith("Digital Campaign Editorial")) {
    localizedTitle = localizedTitle.replace("Digital Campaign Editorial", "Editorial Kampanye Digital");
  } else if (localizedTitle.startsWith("Digital Campaign Catalog")) {
    localizedTitle = localizedTitle.replace("Digital Campaign Catalog", "Katalog Kampanye Digital");
  } else if (localizedTitle.startsWith("Digital Campaign")) {
    localizedTitle = localizedTitle.replace("Digital Campaign", "Kampanye Digital");
  } else if (localizedTitle.startsWith("Burger King — Campaign Ad")) {
    localizedTitle = localizedTitle.replace("Campaign Ad", "Iklan Kampanye");
  } else if (localizedTitle.startsWith("Permifast — Promotional Visual")) {
    localizedTitle = localizedTitle.replace("Promotional Visual", "Visual Promosi");
  } else if (localizedTitle.startsWith("Xeilos — Campaign Asset")) {
    localizedTitle = localizedTitle.replace("Campaign Asset", "Aset Kampanye");
  } else if (localizedTitle.startsWith("Xeilos — Brand Visual")) {
    localizedTitle = localizedTitle.replace("Brand Visual", "Visual Merek");
  } else if (localizedTitle.startsWith("ADL Finance — Campaign")) {
    localizedTitle = localizedTitle.replace("Campaign", "Kampanye");
  } else if (localizedTitle.startsWith("EDUF — Promo Visual")) {
    localizedTitle = localizedTitle.replace("Promo Visual", "Visual Promosi");
  } else if (localizedTitle.startsWith("Withings — Smart Health")) {
    localizedTitle = localizedTitle.replace("Smart Health", "Kesehatan Pintar");
  }

  let localizedType = work.type;
  const typeMap: Record<string, string> = {
    "Digital Automotive Campaign": "Kampanye Otomotif Digital",
    "Digital Campaign": "Kampanye Digital",
    "Digital Campaign Editorial": "Editorial Kampanye Digital",
    "Campaign Catalog Asset": "Aset Katalog Kampanye",
    "Digital Advertising Campaign": "Kampanye Iklan Digital",
    "Digital Product Campaign": "Kampanye Produk Digital",
    "Social Media & Brand Ad": "Iklan Media Sosial & Merek",
    "Brand Identity Asset": "Aset Identitas Merek",
    "Digital Financial Campaign": "Kampanye Finansial Digital",
    "Education Campaign Asset": "Aset Kampanye Edukasi",
    "Social Media Health Ad": "Iklan Kesehatan Media Sosial",
  };
  if (typeMap[work.type]) {
    localizedType = typeMap[work.type];
  }
  return { title: localizedTitle, type: localizedType };
};

export const getAspectClass = (aspect?: string) => {
  const norm = (aspect || "").trim().toLowerCase();
  if (norm === "16:9" || norm === "16/9") return "aspect-[16/9]";
  if (norm === "1:1" || norm === "1/1" || norm === "square") return "aspect-square";
  if (norm === "9:16" || norm === "9/16") return "aspect-[9/16]";
  if (norm === "4:3" || norm === "4/3") return "aspect-[4/3]";
  if (norm === "3:4" || norm === "3/4") return "aspect-[3/4]";
  if (norm === "21:9" || norm === "21/9") return "aspect-[21/9]";
  // Default to 4:5
  return "aspect-[4/5]";
};

export default function Projects() {
  const { stage1: defaultStage1, stage2: defaultStage2 } = antigravityData;
  // Use context for live edits from Admin Dashboard
  const { stage3, clients: contextClients, allData, heroWorks, portfolioIntro } = usePortfolioData();
  const { t, lang } = useLang();
  const isId = lang === "id";

  const stage1Badge = isId ? t("projects.stage1.badge") : (heroWorks?.stage1Badge || defaultStage1.badge);
  const stage1Headline = isId ? t("projects.stage1.headline") : (heroWorks?.stage1Headline || defaultStage1.headline);
  const stage1Subheadline = isId ? t("projects.stage1.subheadline") : (heroWorks?.stage1Subheadline || defaultStage1.subheadline);
  const stage1Scroll = isId ? t("projects.stage1.scroll") : (heroWorks?.stage1ScrollText || "Scroll down ↓");

  const stage2Tag = isId ? t("projects.stage2.tag") : (heroWorks?.stage2Tag || defaultStage2.categoryTag);
  const stage2Headline = isId ? t("projects.stage2.headline") : (heroWorks?.stage2Headline || defaultStage2.headline);
  const stage2Desc = isId ? t("projects.stage2.desc") : (heroWorks?.stage2Desc || defaultStage2.description);
  const stage2BtnText = isId ? t("projects.stage2.btn") : (heroWorks?.stage2BtnText || defaultStage2.primaryButtonText);

  const fallbackSkills = {
    en: ["Branding", "Motion", "3D Design", "UI/UX", "AI Visuals"],
    id: ["Branding", "Animasi Motion", "Desain 3D", "UI/UX", "Visual AI"],
  };
  const stage2Skills = isId ? fallbackSkills.id : (heroWorks?.stage2Skills && heroWorks.stage2Skills.length > 0 ? heroWorks.stage2Skills : defaultStage2.skillLabels);

  const stage1 = {
    ...defaultStage1,
    badge: stage1Badge,
    headline: stage1Headline,
    subheadline: stage1Subheadline,
    scrollText: stage1Scroll,
    deckCards:
      heroWorks?.deckCards && heroWorks.deckCards.length > 0
        ? heroWorks.deckCards
        : defaultStage1.deckCards,
  };
  const stage2 = {
    ...defaultStage2,
    categoryTag: stage2Tag,
    headline: stage2Headline,
    description: stage2Desc,
    primaryButtonText: stage2BtnText,
    skillLabels: stage2Skills,
    badges:
      heroWorks?.stage2Badges && heroWorks.stage2Badges.length > 0
        ? heroWorks.stage2Badges
        : defaultStage2.badges,
    overlappingCards:
      heroWorks?.overlappingCards && heroWorks.overlappingCards.length > 0
        ? heroWorks.overlappingCards
        : defaultStage2.overlappingCards,
  };
  const stage4 = { ...allData.stage4, clients: contextClients };

  const stage4Tools =
    portfolioIntro?.tools && portfolioIntro.tools.length > 0
      ? portfolioIntro.tools
      : stage4.tools;

  const stage4Badge = isId
    ? t("projects.stage4.badge")
    : portfolioIntro?.badge || t("projects.stage4.badge");
  const stage4Headline = isId
    ? t("projects.stage4.headline")
    : portfolioIntro?.headline || t("projects.stage4.headline");
  const stage4Desc = isId
    ? t("projects.stage4.desc")
    : portfolioIntro?.description || t("projects.stage4.desc");

  const containerRef = useRef<HTMLDivElement>(null);
  const folderScrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>(stage4.clients[0].id);
  const [flagshipMode, setFlagshipMode] = useState<"video" | "image">("video");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track scroll and touch drag progress through this pinned container
  const updateProgress = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalScroll = rect.height - window.innerHeight;
    if (totalScroll <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
    setScrollProgress(progress);
  };

  useEffect(() => {
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("touchmove", updateProgress, { passive: true });
    updateProgress();
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("touchmove", updateProgress);
    };
  }, []);

  // Modal Lightbox state with multiple items & active index
  const [modalData, setModalData] = useState<{
    items: ModalItem[];
    currentIndex: number;
  } | null>(null);

  const touchStartXRef = useRef<number | null>(null);

  const handlePrevWork = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setModalData((prev) => {
      if (!prev || prev.items.length <= 1) return prev;
      const newIndex = (prev.currentIndex - 1 + prev.items.length) % prev.items.length;
      return { ...prev, currentIndex: newIndex };
    });
  }, []);

  const handleNextWork = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setModalData((prev) => {
      if (!prev || prev.items.length <= 1) return prev;
      const newIndex = (prev.currentIndex + 1) % prev.items.length;
      return { ...prev, currentIndex: newIndex };
    });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (diff > 50) {
      handlePrevWork();
    } else if (diff < -50) {
      handleNextWork();
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation: Escape to close, Left/Right arrows for before/after
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalData(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevWork();
      } else if (e.key === "ArrowRight") {
        handleNextWork();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevWork, handleNextWork]);

  // Lock body scroll and add modal-open class when modal is open to ensure clean viewport presentation
  useEffect(() => {
    if (modalData) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, [modalData]);

  const scrollToClientStage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const stageTop = rect.top + scrollTop;
    const totalHeight = rect.height - window.innerHeight;
    // Scroll directly to 0.88 progress where Client Folders are fully visible and centered
    const targetY = stageTop + totalHeight * 0.88;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  // Scroll directly to Stage 3 (Flagship Showcase: YouTube Video Embed)
  const scrollToFlagshipStage = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const stageTop = rect.top + scrollTop;
    const totalHeight = rect.height - window.innerHeight;
    // Progress 0.63 is exactly centered on Stage 3 Flagship Showcase
    const targetY = stageTop + totalHeight * 0.63;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, []);

  // Auto-scroll to Stage 3 if requested from Admin or URL hash
  useEffect(() => {
    const handleCheckDirectScroll = () => {
      if (typeof window === "undefined") return;
      const shouldScrollToFlagship =
        sessionStorage.getItem("rizx_scroll_to_flagship") === "true" ||
        window.location.hash === "#flagship-showcase";

      if (shouldScrollToFlagship) {
        try {
          sessionStorage.removeItem("rizx_scroll_to_flagship");
        } catch (_) {}

        // Small delay to allow DOM and pinned layout to settle
        setTimeout(() => {
          scrollToFlagshipStage();
        }, 180);
      }
    };

    handleCheckDirectScroll();
    window.addEventListener("hashchange", handleCheckDirectScroll);
    return () => window.removeEventListener("hashchange", handleCheckDirectScroll);
  }, [scrollToFlagshipStage]);

  const activeClientData = stage4.clients.find((c) => c.id === selectedClient) || stage4.clients[0];

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full h-[350vh] sm:h-[450vh] md:h-[500vh] bg-[#0a0a0a] text-white"
    >
      {/* Sticky Fullscreen Viewport Canvas */}
      <div className="sticky top-0 h-screen h-[100dvh] w-full flex items-center justify-center overflow-hidden select-none px-3 sm:px-6 md:px-8" style={{ willChange: "transform" }}>
        
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[800px] h-[60vh] bg-gradient-to-r from-orange-500/[0.03] via-cyan-500/[0.03] to-purple-500/[0.03] blur-[140px] pointer-events-none rounded-full" />

        {/* ========================================================
            STAGE 1: 1 Card -> Fans out to 5 Cards + Badges
            (Active: 0.00 -> 0.28)
           ======================================================== */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-between py-8 sm:py-14 md:py-12 pt-10 sm:pt-14 md:pt-14 px-4"
          style={{
            opacity: scrollProgress < 0.25 ? 1 : Math.max(0, 1 - (scrollProgress - 0.25) / 0.05),
            transform: `translate3d(0, ${scrollProgress < 0.25 ? 0 : -(scrollProgress - 0.25) * 350}px, 0)`,
            pointerEvents: scrollProgress <= 0.28 ? "auto" : "none",
            visibility: scrollProgress > 0.3 ? "hidden" : "visible",
          }}
        >
          {/* Header */}
          <div className="relative z-30 flex flex-col items-center text-center mt-1 sm:mt-2 max-w-4xl px-2 mb-2 sm:mb-4">
            <span className="text-xs sm:text-xs font-mono uppercase tracking-[0.25em] text-[#14AF9E] mb-2 font-semibold">
              {stage1.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
              {stage1.headline}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-300 font-light mt-3 sm:mt-4 max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed text-balance">
              {stage1.subheadline}
            </p>
          </div>

          {/* Cards Stage: Starts at center, fans out smoothly */}
          <div className="relative w-full max-w-5xl h-[220px] sm:h-[280px] md:h-[320px] flex items-center justify-center my-auto">
            {/* Floating Badges */}
            {stage1.floatingBadges.length > 0 && stage1.floatingBadges.map((badge: { id: number; text: string; color: string; top?: string; left?: string; right?: string }, bIdx: number) => {
              const badgeOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.1));
              return (
                <div
                  key={badge.id}
                  className="absolute z-40 transition-all duration-500"
                  style={{
                    top: isMobile ? (bIdx === 1 ? "2%" : "8%") : badge.top,
                    left: isMobile ? (bIdx === 0 ? "4%" : bIdx === 1 ? "40%" : "auto") : badge.left,
                    right: isMobile ? (bIdx === 2 ? "4%" : "auto") : badge.right,
                    opacity: badgeOpacity,
                    transform: `scale(${isMobile ? 0.85 : 1})`,
                  }}
                >
                  <div
                    className={`relative px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-lg border backdrop-blur-md ${badge.color}`}
                  >
                    <span>{badge.text}</span>
                    <div className="absolute -bottom-1 left-3 w-1.5 h-1.5 rotate-45 bg-inherit border-r border-b border-inherit" />
                  </div>
                </div>
              );
            })}

            {/* 5 Cards Fan-out with Mobile Safe Scaling */}
            {stage1.deckCards.map((card, i) => {
              const N = stage1.deckCards.length;
              const centerIndex = Math.floor(N / 2);
              const distFromCenter = i - centerIndex;
              
              const fanProgress = Math.max(0, Math.min(1, (scrollProgress - 0.03) / 0.18));
              
              const spreadMultiplier = isMobile ? 55 : 135;
              const rotateMultiplier = isMobile ? 4.5 : 7;
              const yMultiplier = isMobile ? 8 : 16;

              const targetX = distFromCenter * spreadMultiplier;
              const targetRotate = distFromCenter * rotateMultiplier;
              const targetY = Math.abs(distFromCenter) * yMultiplier;

              const currentX = targetX * fanProgress;
              const currentRotate = targetRotate * fanProgress;
              const currentY = targetY * fanProgress;

              const isHovered = hoveredCard === card.id;
              const cardInfo = getDeckCardInfo(card, isId);

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() =>
                    setModalData({
                      items: stage1.deckCards.map((c) => {
                        const info = getDeckCardInfo(c, isId);
                        return {
                          id: c.id,
                          title: info.title,
                          type: info.category,
                          image: c.image,
                          aspect: "1:1",
                          clientName: isId ? "Karya Terpilih" : "Selected Works",
                          isClientWork: false,
                        };
                      }),
                      currentIndex: i,
                    })
                  }
                  className={`absolute w-36 sm:w-44 md:w-52 aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 bg-neutral-900/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer ${
                    isHovered ? "transition-transform duration-200 ease-out" : ""
                  }`}
                  style={{
                    zIndex: isHovered ? 50 : 10 + i,
                    transform: `translate3d(${currentX}px, ${
                      currentY + (isHovered ? -16 : 0)
                    }px, 0) rotate(${isHovered ? 0 : currentRotate}deg) scale(${
                      isHovered ? 1.05 : 1
                    })`,
                  }}
                >
                  <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-950 flex flex-col justify-between p-2.5 sm:p-3 border border-white/5">
                    <img
                      src={card.image}
                      alt={cardInfo.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-mono uppercase tracking-wider text-neutral-200 border border-white/10 truncate max-w-[90px]">
                        {cardInfo.category}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-black/50 text-xs flex items-center justify-center text-white">
                        ↗
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xs sm:text-base font-bold text-white tracking-tight truncate">{cardInfo.title}</h3>
                      <p className="text-[11px] sm:text-xs text-neutral-300 font-mono">{cardInfo.category}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-30 text-xs sm:text-xs text-neutral-400 font-mono flex items-center gap-1.5 mb-2">
            <span>{stage1.scrollText || t("projects.stage1.scroll")}</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>

        {/* ========================================================
            STAGE 2: Left Headline & Text + Right Dense Overlapping Cards
            (Active: 0.28 -> 0.52)
           ======================================================== */}
        <div
          className="absolute inset-0 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 sm:gap-10 px-4 sm:px-10 my-auto"
          style={{
            opacity:
              scrollProgress < 0.28
                ? 0
                : scrollProgress > 0.5
                ? Math.max(0, 1 - (scrollProgress - 0.5) / 0.05)
                : Math.min(1, (scrollProgress - 0.28) / 0.05),
            transform: `translate3d(0, ${
              scrollProgress < 0.28
                ? 50
                : scrollProgress > 0.5
                ? -(scrollProgress - 0.5) * 300
                : 0
            }px, 0)`,
            pointerEvents: scrollProgress >= 0.28 && scrollProgress <= 0.52 ? "auto" : "none",
            visibility: scrollProgress < 0.25 || scrollProgress > 0.55 ? "hidden" : "visible",
          }}
        >
          {/* Text Block */}
          <div className="max-w-lg text-center lg:text-left pt-10 lg:pt-0">
            <span className="text-xs sm:text-xs font-mono uppercase tracking-[0.25em] text-[#00A389] mb-3 block font-semibold">
              {stage2.categoryTag}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              {(() => {
                const words = stage2.headline.split(" ");
                // If headline has "Motion" or multiple words, give "Motion" interactive breathing
                return words.map((word, wIdx) => {
                  const isMotion = word.toLowerCase().includes("motion");
                  const s2MotionProgress = Math.max(0, Math.min(1, (scrollProgress - 0.28) / 0.15));
                  const scaleAmount = 1 + s2MotionProgress * 0.08;

                  if (isMotion) {
                    return (
                      <span
                        key={wIdx}
                        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-[#14AF9E] transition-transform duration-300 ease-out font-black"
                        style={{
                          transform: `scale(${scaleAmount})`,
                          display: "inline-block",
                        }}
                      >
                        {word}{wIdx < words.length - 1 ? "\u00A0" : ""}
                      </span>
                    );
                  }
                  return (
                    <span key={wIdx} className="inline-block">
                      {word}{wIdx < words.length - 1 ? "\u00A0" : ""}
                    </span>
                  );
                });
              })()}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
              {stage2.description}
            </p>

            {/* Project Frame Labels / Skills: 5 Compact Tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
              {stage2.skillLabels.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-200 hover:border-[#00A389]/40 hover:text-white transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Single Primary CTA Button -> Scrolls directly to Client Productions stage */}
            <div className="flex items-center justify-center lg:justify-start">
              <button
                onClick={scrollToClientStage}
                className="px-7 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>{stage2.primaryButtonText}</span>
                <HiArrowUpRight className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>

          {/* Overlapping Dense Deck with Badges */}
          <div className="relative w-full max-w-sm sm:max-w-md h-[220px] sm:h-[300px] md:h-[360px] flex items-center justify-center">
            {/* Scroll-driven blooming / fan-out factor for stage 2 */}
            {(() => {
              // On mobile the section enters view sooner (stacked layout, less scroll room)
              // so we use a lower start threshold and wider window
              const bloomStart = isMobile ? 0.30 : 0.28;
              const bloomWindow = isMobile ? 0.12 : 0.14;

              // Blooming progress for Stage 2 (spreads gently as user reaches & scrolls stage 2)
              const bloomProgress = Math.max(0, Math.min(1, (scrollProgress - bloomStart) / bloomWindow));
              const bloomMultiplier = 1 + bloomProgress * (isMobile ? 0.35 : 0.45);
              const bloomRotateMultiplier = 1 + bloomProgress * 0.5;

              // Badges emerge from behind the cards
              // Mobile: container is 220px tall; start badges buried at ~90px, float to ~8px
              // Desktop: container is 360px tall; start at +23px above midpoint, float to -12px
              const b1Start = isMobile ? 90 : 23;
              const b1End = isMobile ? 8 : -12;
              const badge1Y = b1End + (1 - bloomProgress) * (b1Start - b1End);
              const badge1Scale = 0.6 + bloomProgress * 0.4;
              const badge1Opacity = Math.max(0, Math.min(1, (bloomProgress - 0.1) / 0.4));

              const b2Start = isMobile ? 95 : 30;
              const b2End = isMobile ? 10 : -10;
              const badge2Y = b2End + (1 - bloomProgress) * (b2Start - b2End);
              const badge2Scale = 0.6 + bloomProgress * 0.4;
              const badge2Opacity = Math.max(0, Math.min(1, (bloomProgress - 0.15) / 0.4));

              return (
                <>
                  {/* Badges emerging from behind the cards */}
                  {stage2.badges && stage2.badges.length > 0 && (
                    <>
                      {stage2.badges[0] && (
                        <div
                          className="absolute left-2 sm:left-4 z-0 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#14AF9E] text-white border border-[#14AF9E]/80 shadow-lg shadow-[#14AF9E]/30 pointer-events-none transition-transform duration-200"
                          style={{
                            top: `${badge1Y}px`,
                            transform: `scale(${badge1Scale}) rotate(-6deg)`,
                            opacity: badge1Opacity,
                            zIndex: isMobile ? 20 : 5, // On mobile show above cards; desktop behind front cards
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span>{stage2.badges[0].text}</span>
                          </span>
                        </div>
                      )}
                      {stage2.badges[1] && (
                        <div
                          className="absolute right-2 sm:right-4 z-0 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-neutral-800 text-white border border-neutral-700 shadow-lg pointer-events-none transition-transform duration-200"
                          style={{
                            top: `${badge2Y}px`,
                            transform: `scale(${badge2Scale}) rotate(6deg)`,
                            opacity: badge2Opacity,
                            zIndex: isMobile ? 20 : 5, // On mobile show above cards; desktop behind front cards
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            <span>{stage2.badges[1].text}</span>
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Overlapping Dense Cards — mekar / bloom on scroll */}
                  {stage2.overlappingCards.map((card, idx) => {
                    const baseOffset = isMobile ? 32 : 55;
                    const offsetMultiplier = baseOffset * bloomMultiplier;
                    const xPos = (idx - 1.5) * offsetMultiplier;
                    const dynamicRotate = card.rotate * bloomRotateMultiplier;
                    const cardTitle = getStage2CardTitle(card, isId);

                    return (
                      <div
                        key={card.id}
                        onClick={() =>
                          setModalData({
                            items: stage2.overlappingCards.map((c) => ({
                              id: c.id,
                              title: getStage2CardTitle(c, isId),
                              type: isId ? "Visual AI & Motion" : "AI & Motion Visual",
                              image: c.image,
                              aspect: "1:1",
                              clientName: isId ? "Arsip Desain & Motion" : "Design & Motion Archive",
                              isClientWork: false,
                            })),
                            currentIndex: idx,
                          })
                        }
                        className="absolute w-36 sm:w-48 md:w-56 aspect-square rounded-2xl p-2.5 bg-neutral-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-3 cursor-pointer"
                        style={{
                          zIndex: 10 + idx,
                          transform: `translate3d(${xPos}px, ${idx * 4 - bloomProgress * 6}px, 0) rotate(${dynamicRotate}deg)`,
                        }}
                      >
                        <div className="w-full h-full rounded-xl overflow-hidden bg-neutral-950 relative border border-white/5">
                          <img src={card.image} alt={cardTitle} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 text-xs sm:text-sm font-bold text-white truncate">
                            {cardTitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>

        {/* ========================================================
            STAGE 3: Flagship Showcase (From Visual Craft to Technology)
            (Active: 0.52 -> 0.74)
           ======================================================== */}
        <div
          id="flagship-showcase"
          className="absolute inset-0 max-w-4xl mx-auto flex flex-col justify-center px-4 sm:px-8 my-auto"
          style={{
            opacity:
              scrollProgress < 0.52
                ? 0
                : scrollProgress > 0.72
                ? Math.max(0, 1 - (scrollProgress - 0.72) / 0.04)
                : Math.min(1, (scrollProgress - 0.52) / 0.05),
            transform: `translate3d(0, ${
              scrollProgress < 0.52
                ? 50
                : scrollProgress > 0.72
                ? -(scrollProgress - 0.72) * 400
                : 0
            }px, 0)`,
            pointerEvents: scrollProgress >= 0.52 && scrollProgress <= 0.73 ? "auto" : "none",
            visibility: scrollProgress < 0.49 || scrollProgress > 0.75 ? "hidden" : "visible",
          }}
        >
          <div className="mb-4 sm:mb-6 text-center sm:text-left">
            <span className="text-xs sm:text-xs font-mono uppercase tracking-[0.25em] text-[#14AF9E] block mb-1.5 font-semibold">
              {isId ? t("projects.stage3.tag") : (stage3?.classTag || t("projects.stage3.tag"))}
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              {isId ? t("projects.stage3.headline") : (stage3?.headline || t("projects.stage3.headline"))}
            </h2>
          </div>

          {/* Large Aspect Card — Video Plays Inside the Card with View Full Button */}
          {(() => {
            const isVideoOn =
              stage3?.heroCard?.isVideoEnabled !== false &&
              (stage3?.heroCard?.videoId || extractYouTubeId(stage3?.heroCard?.youtubeUrl || ""));

            const computedVideoId = isVideoOn
              ? (stage3?.heroCard?.videoId || extractYouTubeId(stage3?.heroCard?.youtubeUrl || ""))
              : "";

            return (
              <div
                onClick={() =>
                  setModalData({
                    items: [
                      {
                        id: "hero-showcase",
                        title: isId ? t("projects.stage3.card.title") : (stage3?.heroCard?.title || t("projects.stage3.card.title")),
                        type: isId ? t("projects.stage3.card.category") : (stage3?.heroCard?.category || t("projects.stage3.card.category")),
                        image: stage3?.heroCard?.image || "/assets/antigravity/hero-large.jpg",
                        aspect: "16:9",
                        clientName: isId ? "Karya Unggulan" : "Flagship Showcase",
                        isClientWork: false,
                        videoId: computedVideoId || undefined,
                        youtubeUrl: stage3?.heroCard?.youtubeUrl,
                      },
                    ],
                    currentIndex: 0,
                  })
                }
                className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 group cursor-pointer"
              >
                {/* Content: Video or Static Image */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
                  {computedVideoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${computedVideoId}?autoplay=1&mute=1&loop=1&playlist=${computedVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                      title={stage3?.heroCard?.title || "Flagship Showcase Video"}
                      className="w-full h-full object-cover scale-[1.18] border-0 pointer-events-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <img
                      src={stage3?.heroCard?.image || "/assets/antigravity/hero-large.jpg"}
                      alt={stage3?.heroCard?.title || "Flagship Showcase"}
                      className="w-full h-full object-cover scale-[1.05] transition-transform duration-700 group-hover:scale-[1.1]"
                    />
                  )}
                </div>

                {/* Dark Vignette / Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom Left: Title & Category */}
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 flex flex-col pointer-events-none z-10">
                  <span className="text-xs sm:text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1 font-semibold">
                    {isId ? t("projects.stage3.card.category") : (stage3?.heroCard?.category || t("projects.stage3.card.category"))}
                  </span>
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white">
                    {isId ? t("projects.stage3.card.title") : (stage3?.heroCard?.title || t("projects.stage3.card.title"))}
                  </h3>
                </div>

                {/* Bottom Right: View Full Button */}
                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8 z-20">
                  <span className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs sm:text-xs flex items-center gap-1.5 group-hover:bg-neutral-200 transition-all group-hover:scale-105 shadow-xl">
                    <span>{t("projects.stage3.card.btn")}</span>
                    <HiArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ========================================================
            STAGE 4: Interactive Client Folders Showcase
            (Folders per client + karya di dalamnya)
            (Active: 0.74 -> 1.00)
           ======================================================== */}
        <div
          id="client-productions"
          className="absolute inset-0 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 sm:gap-10 px-4 sm:px-8 pt-16 sm:pt-20 lg:pt-14 pb-4 sm:pb-8 my-auto"
          style={{
            opacity: scrollProgress < 0.74 ? 0 : Math.min(1, (scrollProgress - 0.74) / 0.05),
            transform: `translate3d(0, ${scrollProgress < 0.74 ? 50 : 0}px, 0)`,
            pointerEvents: scrollProgress >= 0.74 ? "auto" : "none",
            visibility: scrollProgress < 0.71 ? "hidden" : "visible",
          }}
        >
          {/* Left Text Block */}
          <div className="max-w-md text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs sm:text-xs text-cyan-400 font-mono tracking-widest uppercase font-semibold">
                {stage4Badge}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3 leading-tight">
              {stage4Headline}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-4">
              {stage4Desc}
            </p>
            
            {/* Tool tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 sm:gap-2">
              {stage4Tools.map((tool, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-200">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Client Folder Interactive Vault */}
          <div className="w-full max-w-md sm:max-w-lg bg-neutral-900/95 border border-white/10 rounded-3xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl flex flex-col max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-120px)]">
            {/* Client Folder Pills Selector with Navigation Arrows & Horizontal Scroll */}
            <div className="mb-3 pb-2.5 border-b border-white/10">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <HiFolder className="w-3.5 h-3.5 text-[#14AF9E]" />
                  <span>{isId ? "Folder Klien" : "Client Folders"} ({stage4.clients.length})</span>
                  <span className="text-neutral-500 font-normal lowercase tracking-normal">• {isId ? "geser ↓" : "scroll ↓"}</span>
                </span>
                
                {/* Arrow buttons: Scroll to start / end of client folders */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (folderScrollRef.current) {
                        folderScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                      }
                    }}
                    className="p-1 px-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-mono flex items-center gap-0.5 cursor-pointer active:scale-95"
                    title={isId ? "Kembali ke awal folder" : "Scroll to start"}
                    aria-label="Scroll to first folder"
                  >
                    <span>←</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (folderScrollRef.current) {
                        folderScrollRef.current.scrollTo({
                          left: folderScrollRef.current.scrollWidth,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className="p-1 px-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-mono flex items-center gap-0.5 cursor-pointer active:scale-95"
                    title={isId ? "Langsung ke akhir folder" : "Scroll to end"}
                    aria-label="Scroll to last folder"
                  >
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Pills Row */}
              <div
                ref={folderScrollRef}
                onWheel={(e) => {
                  if (folderScrollRef.current && Math.abs(e.deltaY) > 0) {
                    folderScrollRef.current.scrollLeft += e.deltaY;
                  }
                }}
                className="flex items-center gap-2 overflow-x-auto pb-2.5 folder-scrollbar scroll-smooth select-none"
              >
                {stage4.clients.map((client) => {
                  const isSelected = selectedClient === client.id;
                  return (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] font-bold scale-105"
                          : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
                      }`}
                    >
                      <HiFolder className="w-3.5 h-3.5 text-[#14AF9E] shrink-0" />
                      <span>{client.clientName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-black/10 text-neutral-800 font-bold" : "bg-white/10 text-neutral-400"}`}>
                        {client.works.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Folder Header Info */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <HiFolder className="w-4 h-4 text-[#14AF9E] shrink-0" />
                  <span>{isId ? `Arsip ${activeClientData.clientName}` : `${activeClientData.clientName} Archive`}</span>
                </h4>
                <p className="text-xs text-neutral-300 font-mono">
                  {getClientCategory(activeClientData.category, isId)}
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                {activeClientData.works.length} {t("projects.stage4.deliverables")}
              </span>
            </div>

            {/* Brand Description Panel — REMOVED from folder view, shown only inside modal popup */}

            {/* Client Works Grid within Active Folder -> CLICK TO POPUP MODAL (Clean without right scrollbar) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-h-[220px] sm:max-h-[260px] md:max-h-[280px] overflow-y-auto no-scrollbar items-start">
              {activeClientData.works.map((work, wIdx) => {
                const localizedWork = getWorkLocalized(work, isId);
                const aspectClass = getAspectClass(work.aspect);
                return (
                  <div
                    key={work.id}
                    onClick={() =>
                      setModalData({
                        items: activeClientData.works.map((w) => {
                          const loc = getWorkLocalized(w, isId);
                          return {
                            ...w,
                            title: loc.title,
                            type: loc.type,
                            clientName: activeClientData.clientName,
                            isClientWork: true,
                            tools: (w as any).tools || (activeClientData as any).tools,
                          };
                        }),
                        currentIndex: wIdx,
                      })
                    }
                    className={`group relative rounded-xl overflow-hidden bg-neutral-950 border border-white/5 hover:border-cyan-400/50 transition-all cursor-pointer ${aspectClass} hover:scale-[1.02]`}
                  >
                    <img
                      src={work.image}
                      alt={localizedWork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Aspect Badge */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-mono text-neutral-200 border border-white/10">
                      {work.aspect}
                    </div>

                    {/* Expand icon on hover */}
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      ↗
                    </div>

                    {/* Work Title & Type */}
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <h5 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-md">
                        {localizedWork.title}
                      </h5>
                      <p className="text-[11px] sm:text-xs text-neutral-300 font-mono truncate">
                        {localizedWork.type}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          FULLSCREEN IMAGE LIGHTBOX MODAL POPUP
          (Opens when clicking any work/card with Before/After navigation)
         ======================================================== */}
      {mounted && modalData && modalData.items.length > 0 &&
        createPortal(
          (() => {
            const currentWork = modalData.items[modalData.currentIndex];
            const hasMultiple = modalData.items.length > 1;

            return (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/95 backdrop-blur-2xl animate-fade-in"
                onClick={() => setModalData(null)}
              >
                {/* Modal Container */}
                <div
                  className="relative max-w-5xl max-h-[92vh] w-full bg-neutral-950 border border-white/15 rounded-2xl sm:rounded-3xl overflow-y-auto shadow-2xl flex flex-col no-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Clean X Close on Top Right of Popup (Tanpa frame bulat, ukuran pas & elegan) */}
                  <button
                    type="button"
                    onClick={() => setModalData(null)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 p-2 text-white/70 hover:text-white transition-colors cursor-pointer group"
                    aria-label="Tutup popup"
                    title="Tutup (Esc)"
                  >
                    <HiXMark className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2] transition-transform duration-200 group-hover:scale-110" />
                  </button>

                  {/* Full-Scale Hero Image Preview Box (Artwork is never shrunk or cropped) */}
                  <div
                    className="relative w-full bg-black flex items-center justify-center p-3 sm:p-6 select-none shrink-0"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Before / Previous Arrow */}
                    {hasMultiple && (
                      <button
                        type="button"
                        onClick={handlePrevWork}
                        aria-label="Previous work (Before)"
                        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-2xl active:scale-90 hover:scale-105 cursor-pointer group"
                      >
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                    )}

                    {/* Main Large Visual Artwork or Interactive YouTube Player */}
                    {currentWork.id === "hero-showcase" || currentWork.videoId ? (
                      <div className="relative w-full max-w-4xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${currentWork.videoId || stage3?.heroCard?.videoId || "dQw4w9WgXcQ"}?autoplay=1&rel=0&modestbranding=1`}
                          title={currentWork.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="relative select-none flex items-center justify-center max-w-full">
                        <img
                          key={currentWork.id}
                          src={currentWork.image}
                          alt={currentWork.title}
                          className="max-h-[66vh] sm:max-h-[72vh] md:max-h-[74vh] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl transition-all duration-300 pointer-events-none shadow-2xl"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                        />
                        {/* Transparent shield: stops right-click "Save Image As" and drag */}
                        <div
                          className="absolute inset-0 rounded-xl sm:rounded-2xl z-10 cursor-default"
                          onContextMenu={(e) => e.preventDefault()}
                          draggable={false}
                        />
                      </div>
                    )}

                  {/* Scroll Down Indicator Cue (Only for client works that have case study details below) */}
                  {currentWork.isClientWork && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-400">
                      <span>{t("projects.scrollhint")}</span>
                      <span className="animate-bounce">↓</span>
                    </div>
                  )}

                  {/* After / Next Arrow */}
                  {hasMultiple && (
                    <button
                      type="button"
                      onClick={handleNextWork}
                      aria-label="Next work (After)"
                      className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-2xl active:scale-90 hover:scale-105 cursor-pointer group"
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Conditional Popup Footer: Full Case Study ONLY for Client Works; Clean Compact Caption for others */}
                {currentWork.isClientWork ? (
                  /* AI Project Case Study Brief (Only for Client Projects in Stage 4) */
                  (() => {
                    const caseStudy = getCaseStudy(currentWork, lang);

                    return (
                      <div className="p-5 sm:p-8 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-t border-white/10 space-y-5 shrink-0">
                        {/* Top Header: Brand Badge & Title */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#14AF9E]/15 text-[#14AF9E] border border-[#14AF9E]/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                                {caseStudy.brand}
                              </span>
                              {caseStudy.year && (
                                <span className="px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 text-[10px] font-mono">
                                  {caseStudy.year}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-neutral-400">
                                {currentWork.aspect} • {currentWork.type}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
                              {currentWork.title}
                            </h3>
                            {caseStudy.brief && (
                              <p className="text-xs text-neutral-400 font-sans mt-1 leading-relaxed max-w-2xl">
                                {caseStudy.brief}
                              </p>
                            )}
                          </div>

                          {/* Counter & Mini Navigation */}
                          {hasMultiple && (
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="text-xs font-mono text-neutral-400 px-3 py-1 rounded-full bg-white/[0.04] border border-white/5">
                                {modalData.currentIndex + 1} / {modalData.items.length}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={handlePrevWork}
                                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                                  aria-label="Previous work"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleNextWork}
                                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                                  aria-label="Next work"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2-Box Grid: Tantangan (Kesulitan) vs Jalan Keluar (Solusi) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Tantangan / Kesulitan */}
                          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-amber-500/20 transition-all">
                            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5">
                              <HiExclamationTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{t("casestudy.challenge.label")}</span>
                            </div>
                            <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed font-normal">
                              {caseStudy.challenge}
                            </p>
                          </div>

                          {/* Jalan Keluar / Solusi */}
                          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-[#14AF9E]/30 transition-all">
                            <div className="flex items-center gap-1.5 text-[#14AF9E] text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5">
                              <HiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{t("casestudy.solution.label")}</span>
                            </div>
                            <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed font-normal">
                              {caseStudy.solution}
                            </p>
                          </div>
                        </div>

                        {/* Role & Approach */}
                        {caseStudy.role && (
                          <div className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-white/5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-400">
                            <span className="text-[#14AF9E] font-mono font-semibold uppercase text-[10px] tracking-wider">
                              {t("projects.role")}
                            </span>
                            <span>{caseStudy.role}</span>
                          </div>
                        )}

                        {/* Tools Digunakan (Icon Tool Saja) & Close Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                              {t("projects.tools")}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(() => {
                                const clientMatch = contextClients.find(
                                  (c) => c.clientName === currentWork.clientName || c.clientName === currentWork.brand
                                );
                                const resolvedTools =
                                  (currentWork.tools && currentWork.tools.length > 0)
                                    ? currentWork.tools
                                    : (clientMatch?.tools && clientMatch.tools.length > 0)
                                    ? clientMatch.tools
                                    : caseStudy.tools;

                                return resolvedTools.map((toolItem: string, idx: number) => (
                                  <ToolBadge key={idx} tool={toolItem} />
                                ));
                              })()}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setModalData(null)}
                            className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer active:scale-95 shrink-0 self-end sm:self-auto"
                          >
                            {t("projects.close")}
                          </button>
                        </div>

                        {/* Brand Description — shown at bottom of case study if available */}
                        {(() => {
                          const clientData = contextClients.find(
                            (c) => c.clientName === currentWork.clientName
                          );
                          const rawDesc = (clientData as any)?.description || "";
                          const clientKey = (currentWork.clientName || "").toLowerCase().trim();
                          const brandDesc = isId
                            ? (clientBrandDescMap[clientKey]?.id || rawDesc)
                            : (rawDesc || clientBrandDescMap[clientKey]?.en);
                          if (!brandDesc) return null;
                          return (
                            <div className="mt-2 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block mb-1">
                                {isId ? "Profil & Deskripsi Brand" : "Brand Profile & Context"} — {currentWork.clientName}
                              </span>
                              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                                {brandDesc}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()
                ) : (
                  /* Compact Clean Caption for Non-Client Works (Stage 1, 2, 3) */
                  <div className="p-4 sm:p-6 bg-neutral-950 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                    <div>
                      <span className="text-[10px] font-mono text-[#14AF9E] tracking-widest uppercase block mb-1">
                        {currentWork.clientName}
                      </span>
                      <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
                        {currentWork.title}
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        {currentWork.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
                      {hasMultiple && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-400 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5">
                            {modalData.currentIndex + 1} / {modalData.items.length}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handlePrevWork}
                              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                              aria-label="Previous work"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={handleNextWork}
                              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                              aria-label="Next work"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setModalData(null)}
                        className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer active:scale-95 shrink-0"
                      >
                        {t("projects.close")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </section>
  );
}

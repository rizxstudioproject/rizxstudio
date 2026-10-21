"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Lang = "en" | "id";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navbar
    "nav.clients": "Clients",
    "nav.about": "About Me",
    "nav.work": "Work",
    "nav.contact": "Contact",
    "nav.direct": "Direct ↗",
    "nav.langLabel": "Language:",

    // Overlay / Hero
    "hero.role": "<Creative Designer & Motion Specialist/>",
    "hero.scroll": "SCROLL",
    "hero.section2.headline1": "Results-driven",
    "hero.section2.headline2": "creative",
    "hero.section2.body": "Combining 11+ years of creative expertise with modern workflows to produce impactful visuals, distinctive brand identities, and high-performing digital campaigns.",
    "hero.section3.headline1": "Creative",
    "hero.section3.headline2": "meets AI",
    "hero.section3.body": "Where human creativity and modern creative workflows converge — crafting visuals, brands, and campaigns that move people and perform at scale.",

    // Clients Section
    "clients.subtitle": "Selected Clients & Creative Collaborations",

    // About Me (User's Exact Copy)
    "about.eyebrow": "## WHO AM I",
    "about.title": "About Me",
    "about.headline": "Creative Designer & Motion Specialist | 11+ Years | Agency & Global Brands",
    "about.para1": "With 11+ years in creative design, I’ve evolved alongside the industry, combining strong design fundamentals with modern creative workflows to deliver impactful visuals for agencies and global brands.",
    "about.quote": "A creative professional’s greatest advantage isn’t resisting change — it’s adapting faster.",
    "about.stat1.num": "11+",
    "about.stat1.label": "Years Experience",
    "about.stat2.num": "100+",
    "about.stat2.label": "Projects",
    "about.stat3.num": "20+",
    "about.stat3.label": "Clients",
    "about.card1.title": "Core Philosophy",
    "about.card1.body": "A creative professional’s greatest advantage isn’t resisting change — it’s adapting faster.",
    "about.card2.title": "Global Collaboration",
    "about.card2.body": "Producing scalable visual content, high-performing ads, and campaign assets for international brands and agencies.",
    "about.card3.title": "Disciplines",

    // Projects / Works - Stage 1
    "projects.stage1.badge": "SELECTED WORKS",
    "projects.stage1.headline": "A Range of Work. One Creative Vision.",
    "projects.stage1.subheadline": "Explore selected projects across branding, motion, digital design, and AI-driven visuals—shaped by different briefs, teams, and creative challenges.",
    "projects.stage1.scroll": "Scroll down",

    // Projects / Works - Stage 2
    "projects.stage2.tag": "AI-DRIVEN CREATIVE",
    "projects.stage2.headline": "Design. Motion. AI.",
    "projects.stage2.desc": "Senior Graphic Designer & Digital Artist crafting impactful brand visuals, motion graphics, and digital experiences for global brands.",
    "projects.stage2.btn": "Explore My Work",

    // Projects / Works - Stage 3
    "projects.stage3.tag": "CLASS BY REATHA C. PHELAN",
    "projects.stage3.headline": "Gateway to artist people.",
    "projects.stage3.card.title": "Cinematic Visual Storytelling",
    "projects.stage3.card.category": "Creative Direction & AI Film",
    "projects.stage3.card.btn": "View Full",

    // Projects / Works - Stage 4
    "projects.stage4.badge": "PROFESSIONAL EXPERIENCE",
    "projects.stage4.headline": "Creative Work. Real-World Thinking.",
    "projects.stage4.desc": "From brand campaigns to digital experiences, I combine design, motion, and AI-driven workflows to create purposeful visuals for brands and businesses.",
    "projects.stage4.archive": "Archive",
    "projects.stage4.deliverables": "deliverables",

    // Lightbox Modal
    "projects.challenge": "Challenge",
    "projects.solution": "Solution",
    "projects.role": "Role:",
    "projects.tools": "Tools Used:",
    "projects.close": "Close Preview",
    "projects.scrollhint": "Project Brief & Details Below",
    "casestudy.challenge.label": "Challenge",
    "casestudy.solution.label": "Solution / Approach",

    // Contact
    "contact.badge": "Open to Creative Opportunities",
    "contact.headline1": "Let's create something",
    "contact.headline2": "meaningful",
    "contact.headline3": "together.",
    "contact.body": "Have a project in mind? Let's connect and explore how design, motion, and creative production can bring your ideas to life.",
    "contact.footer.rights": "ALL RIGHTS RESERVED.",
    "contact.footer.clients": "Clients",
    "contact.footer.work": "Work",
    "contact.footer.about": "About Me",
    "contact.footer.contact": "Contact",
    "contact.lang.label": "Language:",
  },

  id: {
    // Navbar
    "nav.clients": "Klien",
    "nav.about": "Tentang Saya",
    "nav.work": "Karya",
    "nav.contact": "Kontak",
    "nav.direct": "Langsung ↗",
    "nav.langLabel": "Pilihan Bahasa:",

    // Overlay / Hero
    "hero.role": "<Desainer Kreatif & Spesialis Motion/>",
    "hero.scroll": "GULIR",
    "hero.section2.headline1": "Kreatif yang",
    "hero.section2.headline2": "berorientasi hasil",
    "hero.section2.body": "Menggabungkan 11+ tahun keahlian kreatif dengan alur kerja modern untuk menghasilkan visual berdampak, identitas merek yang kuat, dan kampanye digital berkinerja tinggi.",
    "hero.section3.headline1": "Kreativitas",
    "hero.section3.headline2": "berpadu AI",
    "hero.section3.body": "Titik temu antara kreativitas manusia dan alur kerja kreatif modern — menciptakan visual, identitas merek, dan kampanye yang memukau serta berkinerja optimal dalam skala luas.",

    // Clients Section
    "clients.subtitle": "Klien Terpilih & Kolaborasi Kreatif",

    // About Me (User's Exact Copy in ID)
    "about.eyebrow": "## SIAPA SAYA",
    "about.title": "Tentang Saya",
    "about.headline": "Desainer Kreatif & Spesialis Motion | 11+ Tahun | Agensi & Brand Global",
    "about.para1": "Dengan 11+ tahun dalam desain kreatif, saya telah berkembang bersama industri, menggabungkan dasar-dasar desain yang kuat dengan alur kerja kreatif modern untuk menghadirkan visual yang berdampak bagi agensi dan brand global.",
    "about.quote": "Keunggulan terbesar seorang profesional kreatif bukanlah menolak perubahan — melainkan beradaptasi lebih cepat.",
    "about.stat1.num": "11+",
    "about.stat1.label": "Tahun Pengalaman",
    "about.stat2.num": "100+",
    "about.stat2.label": "Proyek Selesai",
    "about.stat3.num": "20+",
    "about.stat3.label": "Klien Global",
    "about.card1.title": "Filosofi Utama",
    "about.card1.body": "Keunggulan terbesar seorang profesional kreatif bukanlah menolak perubahan — melainkan beradaptasi lebih cepat.",
    "about.card2.title": "Kolaborasi Global",
    "about.card2.body": "Menghasilkan konten visual berskala besar, materi kampanye, dan aset kreatif berkinerja tinggi untuk brand dan agensi global.",
    "about.card3.title": "Disiplin Keahlian",

    // Projects / Works - Stage 1
    "projects.stage1.badge": "KARYA TERPILIH",
    "projects.stage1.headline": "Ragam Karya. Satu Visi Kreatif.",
    "projects.stage1.subheadline": "Jelajahi proyek pilihan di bidang branding, motion, desain digital, dan visual berbasis AI—yang dibentuk oleh beragam brief, tim, dan tantangan kreatif.",
    "projects.stage1.scroll": "Gulir ke bawah",

    // Projects / Works - Stage 2
    "projects.stage2.tag": "KREATIF BERBASIS AI",
    "projects.stage2.headline": "Desain. Motion. AI.",
    "projects.stage2.desc": "Desainer Grafis Senior & Seniman Digital yang menciptakan visual brand berdampak, motion graphics, dan pengalaman digital untuk brand global.",
    "projects.stage2.btn": "Jelajahi Karya Saya",

    // Projects / Works - Stage 3
    "projects.stage3.tag": "KELAS OLEH REATHA C. PHELAN",
    "projects.stage3.headline": "Gerbang menuju insan kreatif.",
    "projects.stage3.card.title": "Penceritaan Visual Sinematik",
    "projects.stage3.card.category": "Pengarahan Kreatif & Film AI",
    "projects.stage3.card.btn": "Lihat Penuh",

    // Projects / Works - Stage 4
    "projects.stage4.badge": "PENGALAMAN PROFESIONAL",
    "projects.stage4.headline": "Karya Kreatif. Solusi Nyata.",
    "projects.stage4.desc": "Dari kampanye brand hingga pengalaman digital, saya menggabungkan alur kerja desain, animasi motion, dan kecerdasan AI untuk menciptakan visual bermakna bagi brand dan bisnis.",
    "projects.stage4.archive": "Arsip",
    "projects.stage4.deliverables": "karya",

    // Lightbox Modal
    "projects.challenge": "Tantangan",
    "projects.solution": "Solusi",
    "projects.role": "Peran:",
    "projects.tools": "Tools Digunakan:",
    "projects.close": "Tutup Pratinjau",
    "projects.scrollhint": "Detail & Brief Proyek di Bawah",
    "casestudy.challenge.label": "Tantangan / Kesulitan",
    "casestudy.solution.label": "Solusi / Pendekatan",

    // Contact
    "contact.badge": "Terbuka untuk Peluang Kreatif",
    "contact.headline1": "Mari ciptakan sesuatu",
    "contact.headline2": "yang bermakna",
    "contact.headline3": "bersama.",
    "contact.body": "Punya ide proyek? Mari terhubung dan diskusikan bagaimana desain kreatif, animasi motion, dan produksi visual dapat mewujudkan ide Anda.",
    "contact.footer.rights": "SEMUA HAK CIPTA DILINDUNGI.",
    "contact.footer.clients": "Klien",
    "contact.footer.work": "Karya",
    "contact.footer.about": "Tentang Saya",
    "contact.footer.contact": "Kontak",
    "contact.lang.label": "Pilihan Bahasa:",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("rizx-lang") as Lang | null;
    if (saved === "en" || saved === "id") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("rizx-lang", l);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Lang = "en" | "id" | "min";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  tr: (en: string, id: string, min?: string) => string;
  toMinang: (text: string) => string;
}

// Protected terms that must never be altered (Software, AI, Brands, Social Media, Tech)
const PROTECTED_TERMS: string[] = [
  "Figma",
  "Photoshop",
  "Illustrator",
  "Blender",
  "After Effects",
  "Premiere Pro",
  "Cinema 4D",
  "DaVinci Resolve",
  "InDesign",
  "Lightroom",
  "Affinity",
  "Midjourney",
  "Magnific AI",
  "Magnific",
  "ChatGPT",
  "GPT",
  "Gemini",
  "Runway",
  "Higgsfield",
  "Leonardo AI",
  "Stable Diffusion",
  "Claude",
  "Sora",
  "Luma",
  "Kling",
  "Toyota",
  "Nike",
  "Dufour",
  "Hyashop",
  "Rizx Studio",
  "Rizx",
  "Instagram",
  "LinkedIn",
  "WhatsApp",
  "YouTube",
  "GitHub",
  "Supabase",
  "IndexedDB",
  "Next.js",
  "React",
  "Tailwind",
  "Vercel",
  "Behance",
  "Dribbble",
  "X",
];

// Minang replacement dictionary for natural, pure translations
const MINANG_REPLACEMENTS: [RegExp, string][] = [
  // Multi-word phrases
  [/\btidak ada\b/gi, "indak ado"],
  [/\btidak boleh\b/gi, "indak buliah"],
  [/\btidak bisa\b/gi, "indak dapek"],
  [/\btidak dapat\b/gi, "indak dapek"],
  [/\btidak pernah\b/gi, "indak panah"],
  [/\bapakah anda yakin\b/gi, "apokah sanak yakin"],
  [/\bapakah kamu yakin\b/gi, "apokah sanak yakin"],
  [/\btentang saya\b/gi, "tantang ambo"],
  [/\bhubungi saya\b/gi, "hubungi ambo"],
  [/\bkarya saya\b/gi, "karya ambo"],
  [/\bklien terpilih\b/gi, "klien tapiliah"],
  [/\bkarya terpilih\b/gi, "karya tapiliah"],
  [/\bkarya unggulan\b/gi, "karya tapiliah"],
  [/\bsemua hak cipta dilindungi\b/gi, "sagalo hak cipta talindungi"],
  [/\bsemua hak cipta\b/gi, "sagalo hak cipta"],
  [/\bhak cipta\b/gi, "hak cipta"],
  [/\bsimpan perubahan\b/gi, "simpan parubahan"],
  [/\bbatalkan perubahan\b/gi, "batalkan parubahan"],
  [/\bganti nama\b/gi, "ganti namo"],
  [/\bubah nama\b/gi, "ubah namo"],
  [/\blihat website\b/gi, "caliak website"],
  [/\blihat di web\b/gi, "caliak di web"],
  [/\blihat web\b/gi, "caliak web"],
  [/\btutup pratinjau\b/gi, "tutuik caliak"],
  [/\bgulir ke bawah\b/gi, "gulia ka bawah"],
  [/\bkeamanan akun\b/gi, "kaamanan akun"],
  [/\bsandi & keamanan\b/gi, "kunci & kaamanan"],
  [/\bsandi dan keamanan\b/gi, "kunci jo kaamanan"],
  [/\bkata sandi\b/gi, "kunci sandi"],
  [/\bmasukkan sandi\b/gi, "masuak-an kunci sandi"],
  [/\bkonfirmasi sandi\b/gi, "pastikan kunci sandi"],
  [/\bsandi baru\b/gi, "kunci sandi baru"],
  [/\bsandi lama\b/gi, "kunci sandi lamo"],
  [/\bsandi saat ini\b/gi, "kunci sandi kini"],
  [/\bdata berhasil\b/gi, "data barasia"],
  [/\bberhasil disimpan\b/gi, "barasia tasimpan"],
  [/\bberhasil dihapus\b/gi, "barasia tahapuih"],
  [/\bberhasil diperbarui\b/gi, "barasia tapabarui"],
  [/\bberhasil disalin\b/gi, "barasia tasalin"],
  [/\bberhasil diunduh\b/gi, "barasia taunduah"],
  [/\bgagal menyimpan\b/gi, "gagal manyimpan"],
  [/\bgagal menghapus\b/gi, "gagal mahapuih"],
  [/\bgagal menyalin\b/gi, "gagal manyalin"],
  [/\bgagal mengunduh\b/gi, "gagal ma-unduah"],
  [/\bgagal membersihkan\b/gi, "gagal mambarasiahan"],
  [/\bsalin link\b/gi, "salin tautan"],
  [/\bsalin tautan\b/gi, "salin tautan"],
  [/\bunduh file\b/gi, "unduah berkas"],
  [/\bunduh gambar\b/gi, "unduah gambar"],
  [/\bhapus folder\b/gi, "hapuih folder"],
  [/\bhapus karya\b/gi, "hapuih karya"],
  [/\bhapus logo\b/gi, "hapuih logo"],
  [/\bhapus gambar\b/gi, "hapuih gambar"],
  [/\btambah folder\b/gi, "tambah folder"],
  [/\btambah karya\b/gi, "tambah karya"],
  [/\btambah logo\b/gi, "tambah logo"],
  [/\bunggah karya\b/gi, "unggah karya"],
  [/\bunggah aset\b/gi, "unggah aset"],
  [/\bganti gambar\b/gi, "ganti gambar"],
  [/\bganti cover\b/gi, "ganti muko"],
  [/\bkeluar admin\b/gi, "kalua admin"],
  [/\bmasuk admin\b/gi, "masuak admin"],
  [/\bsudah benar\b/gi, "alah batua"],
  [/\bbelum ada\b/gi, "alun ado"],
  [/\bbelum disimpan\b/gi, "alun tasimpan"],
  [/\btulis deskripsi\b/gi, "tulih katarangan"],
  [/\btahun pengalaman\b/gi, "taun pangalaman"],
  [/\bproyek selesai\b/gi, "proyek tuntong"],
  [/\bkolaborasi global\b/gi, "karajosamo global"],
  [/\bdisiplin keahlian\b/gi, "kaoetamoan bidang"],
  [/\bfilosofi utama\b/gi, "prinsip utamo"],

  // Single common words
  [/\btidak\b/gi, "indak"],
  [/\bbukan\b/gi, "bukan"],
  [/\bsemua\b/gi, "kasadonyo"],
  [/\bseluruh\b/gi, "kasadonyo"],
  [/\bhapus\b/gi, "hapuih"],
  [/\btutup\b/gi, "tutuik"],
  [/\bbuka\b/gi, "bukak"],
  [/\blihat\b/gi, "caliak"],
  [/\bkembali\b/gi, "baliak"],
  [/\bsaya\b/gi, "ambo"],
  [/\banda\b/gi, "sanak"],
  [/\btentang\b/gi, "tantang"],
  [/\bberhasil\b/gi, "barasia"],
  [/\bunduh\b/gi, "unduah"],
  [/\bapakah\b/gi, "apokah"],
  [/\bsudah\b/gi, "alah"],
  [/\btelah\b/gi, "alah"],
  [/\bbelum\b/gi, "alun"],
  [/\bdengan\b/gi, "jo"],
  [/\buntuk\b/gi, "untuak"],
  [/\bke\b/gi, "ka"],
  [/\bpada\b/gi, "pado"],
  [/\bini\b/gi, "iko"],
  [/\bitu\b/gi, "itu"],
  [/\bbisa\b/gi, "dapek"],
  [/\bdapat\b/gi, "dapek"],
  [/\bhanya\b/gi, "hanyo"],
  [/\bdan\b/gi, "jo"],
  [/\bserta\b/gi, "sarato"],
  [/\batau\b/gi, "atau"],
  [/\bterbaru\b/gi, "tabaru"],
  [/\bterlama\b/gi, "talamo"],
  [/\bpertama\b/gi, "partamo"],
  [/\bkedua\b/gi, "kaduo"],
  [/\butama\b/gi, "utamo"],
  [/\bpilihan\b/gi, "piliahan"],
  [/\bterpilih\b/gi, "tapiliah"],
  [/\bsandi\b/gi, "kunci sandi"],
  [/\bmasuk\b/gi, "masuak"],
  [/\bkeluar\b/gi, "kalua"],
  [/\bpengaturan\b/gi, "pangaturan"],
  [/\bkeamanan\b/gi, "kaamanan"],
  [/\bnama\b/gi, "namo"],
  [/\bjudul\b/gi, "judul"],
  [/\bketerangan\b/gi, "katarangan"],
  [/\bdeskripsi\b/gi, "katarangan"],
  [/\bselesai\b/gi, "salasai"],
  [/\btersimpan\b/gi, "tasimpan"],
  [/\bsekarang\b/gi, "kini"],
  [/\btahun\b/gi, "taun"],
  [/\bpekan\b/gi, "pakan"],
  [/\bminggu\b/gi, "pakan"],
  [/\bpengalaman\b/gi, "pangalaman"],
  [/\bperjalanan\b/gi, "pajalanan"],
  [/\bbersama\b/gi, "basamo"],
  [/\bmembuat\b/gi, "mambuek"],
  [/\bmenciptakan\b/gi, "mambuek"],
  [/\bmenghasilkan\b/gi, "mahasiakan"],
  [/\bbermakna\b/gi, "bamakna"],
  [/\bterhubung\b/gi, "tahubuang"],
  [/\bperubahan\b/gi, "parubahan"],
  [/\bbaris\b/gi, "barih"],
  [/\bgagal\b/gi, "gagal"],
  [/\bsulit\b/gi, "sulik"],
  [/\bcepat\b/gi, "capek"],
  [/\blambat\b/gi, "lambek"],
  [/\bbanyak\b/gi, "banyak"],
  [/\bsedikit\b/gi, "saketek"],
  [/\bsangat\b/gi, "bana"],
  [/\blebih\b/gi, "labiah"],
  [/\bpaling\b/gi, "paliang"],
  [/\bhalaman\b/gi, "laman"],
  [/\bbagian\b/gi, "bagian"],
  [/\bgunakan\b/gi, "gunoan"],
  [/\bmenggunakan\b/gi, "manggunoan"],
  [/\bdigunakan\b/gi, "digunoan"],
  [/\btulis\b/gi, "tulih"],
  [/\bmenulis\b/gi, "manulih"],
  [/\bperingatan\b/gi, "paringatan"],
  [/\bperhatian\b/gi, "paratian"],
  [/\bbersihkan\b/gi, "barasiahan"],
  [/\bdibersihkan\b/gi, "dibarasiahan"],
  [/\bpenyimpanan\b/gi, "panyimpanan"],
  [/\bsinkron\b/gi, "sinkron"],
  [/\blangsung\b/gi, "langsuang"],
];

export function toMinang(text: string): string {
  if (!text || typeof text !== "string") return text;

  // Check known UI pair dictionary first for exact Minang translations
  const kp = getKnownPair(text);
  if (kp) {
    if (kp.min) return kp.min;
    text = kp.id;
  } else {
    // If text is predominantly English, translate to Indonesian first
    const sc = scoreText(text);
    if (sc.enScore > sc.idScore) {
      text = toIndonesian(text);
    }
  }

  // Protect brand, software, AI, and social media names
  const placeholders: { key: string; val: string }[] = [];
  let protectedText = text;

  PROTECTED_TERMS.forEach((term, idx) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    if (regex.test(protectedText)) {
      const key = `__PROTECTED_TERM_${idx}__`;
      placeholders.push({ key, val: term });
      protectedText = protectedText.replace(regex, key);
    }
  });

  // Apply Minang dictionary
  let result = protectedText;
  MINANG_REPLACEMENTS.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, (match) => {
      // Maintain First Letter Uppercase
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  });

  // Restore protected terms
  placeholders.forEach(({ key, val }) => {
    result = result.split(key).join(val);
  });

  return result;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  tr: (en) => en,
  toMinang: (txt) => txt,
});

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navbar
    "nav.clients": "Clients",
    "nav.about": "About Me",
    "nav.work": "Work",
    "nav.products": "Products",
    "nav.tracking": "Tracking",
    "nav.contact": "Contact",
    "nav.direct": "Direct ↗",
    "nav.langLabel": "Language:",

    // Overlay / Hero
    "hero.role": "AI-Powered Creative Designer",
    "hero.scroll": "SCROLL",
    "hero.section2.headline1": "Results-driven",
    "hero.section2.headline2": "creative",
    "hero.section2.body":
      "Combining 11+ years of creative expertise with modern workflows to produce impactful visuals, distinctive brand identities, and high-performing digital campaigns.",
    "hero.section3.headline1": "Creative",
    "hero.section3.headline2": "meets AI",
    "hero.section3.body":
      "Where human creativity and modern creative workflows converge — crafting visuals, brands, and campaigns that move people and perform at scale.",

    // Clients Section
    "clients.subtitle": "Selected Clients & Creative Collaborations",

    // About Me (User's Exact Copy)
    "about.eyebrow": "WHO AM I",
    "about.title": "About Me",
    "about.headline":
      "Creative Designer & Motion Specialist | 11+ Years | Agency & Global Brands",
    "about.para1":
      "With 11+ years in creative design, I’ve evolved alongside the industry, combining strong design fundamentals with modern creative workflows to deliver impactful visuals for agencies and global brands.",
    "about.quote":
      "A creative professional’s greatest advantage isn’t resisting change — it’s adapting faster.",
    "about.stat1.num": "11+",
    "about.stat1.label": "Years Experience",
    "about.stat2.num": "100+",
    "about.stat2.label": "Projects",
    "about.stat3.num": "20+",
    "about.stat3.label": "Clients",
    "about.card1.title": "Core Philosophy",
    "about.card1.body":
      "A creative professional’s greatest advantage isn’t resisting change — it’s adapting faster.",
    "about.card2.title": "Global Collaboration",
    "about.card2.body":
      "Producing scalable visual content, high-performing ads, and campaign assets for international brands and agencies.",
    "about.card3.title": "Disciplines",

    // Projects / Works - Stage 1
    "projects.stage1.badge": "SELECTED WORKS",
    "projects.stage1.headline": "A Range of Work. One Creative Vision.",
    "projects.stage1.subheadline":
      "Explore selected projects across branding, motion, digital design, and AI-driven visuals, shaped by different briefs, teams, and creative challenges.",
    "projects.stage1.scroll": "Scroll down",

    // Projects / Works - Stage 2
    "projects.stage2.tag": "AI-DRIVEN CREATIVE",
    "projects.stage2.headline": "Design. Motion. AI.",
    "projects.stage2.desc":
      "Senior Graphic Designer & Digital Artist crafting impactful brand visuals, motion graphics, and digital experiences for global brands.",
    "projects.stage2.btn": "Explore My Work",

    // Projects / Works - Stage 3
    "projects.stage3.tag": "CREATIVE JOURNEY | 2012 TO PRESENT",
    "projects.stage3.headline": "A journey shaped by creativity and change.",
    "projects.stage3.card.title": "From Visual Craft to Technology",
    "projects.stage3.card.category": "VISUAL CRAFT | DIGITAL | AI",
    "projects.stage3.card.btn": "View Full",

    // Projects / Works - Stage 4
    "projects.stage4.badge": "PROFESSIONAL EXPERIENCE",
    "projects.stage4.headline": "Creative Work. Real-World Thinking.",
    "projects.stage4.desc":
      "From brand campaigns to digital experiences, I combine design, motion, and AI-driven workflows to create purposeful visuals for brands and businesses.",
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
    "contact.body":
      "Have a project in mind? Let's connect and explore how design, motion, and creative production can bring your ideas to life.",
    "contact.footer.rights": "ALL RIGHTS RESERVED.",
    "contact.footer.clients": "Clients",
    "contact.footer.work": "Work",
    "contact.footer.products": "Products",
    "contact.footer.about": "About Me",
    "contact.footer.contact": "Contact",
    "contact.lang.label": "Language:",
  },

  id: {
    // Navbar
    "nav.clients": "Klien",
    "nav.about": "Tentang Saya",
    "nav.work": "Karya",
    "nav.products": "Produk",
    "nav.tracking": "Tracking",
    "nav.contact": "Kontak",
    "nav.direct": "Langsung ↗",
    "nav.langLabel": "Pilihan Bahasa:",

    // Overlay / Hero
    "hero.role": "Desainer Kreatif Berbasis AI",
    "hero.scroll": "GULIR",
    "hero.section2.headline1": "Kreatif yang",
    "hero.section2.headline2": "berorientasi hasil",
    "hero.section2.body":
      "Menggabungkan 11+ tahun keahlian kreatif dengan alur kerja modern untuk menghasilkan visual berdampak, identitas merek yang kuat, dan kampanye digital berkinerja tinggi.",
    "hero.section3.headline1": "Kreativitas",
    "hero.section3.headline2": "berpadu AI",
    "hero.section3.body":
      "Titik temu antara kreativitas manusia dan alur kerja kreatif modern — menciptakan visual, identitas merek, dan kampanye yang memukau serta berkinerja optimal dalam skala luas.",

    // Clients Section
    "clients.subtitle": "Klien Terpilih & Kolaborasi Kreatif",

    // About Me (User's Exact Copy in ID)
    "about.eyebrow": "SIAPA SAYA",
    "about.title": "Tentang Saya",
    "about.headline":
      "Desainer Kreatif & Spesialis Motion | 11+ Tahun | Agensi & Brand Global",
    "about.para1":
      "Dengan 11+ tahun dalam desain kreatif, saya telah berkembang bersama industri, menggabungkan dasar-dasar desain yang kuat dengan alur kerja kreatif modern untuk menghadirkan visual yang berdampak bagi agensi dan brand global.",
    "about.quote":
      "Keunggulan terbesar seorang profesional kreatif bukanlah menolak perubahan — melainkan beradaptasi lebih cepat.",
    "about.stat1.num": "11+",
    "about.stat1.label": "Tahun Pengalaman",
    "about.stat2.num": "100+",
    "about.stat2.label": "Proyek Selesai",
    "about.stat3.num": "20+",
    "about.stat3.label": "Klien Global",
    "about.card1.title": "Filosofi Utama",
    "about.card1.body":
      "Keunggulan terbesar seorang profesional kreatif bukanlah menolak perubahan — melainkan beradaptasi lebih cepat.",
    "about.card2.title": "Kolaborasi Global",
    "about.card2.body":
      "Menghasilkan konten visual berskala besar, materi kampanye, dan aset kreatif berkinerja tinggi untuk brand dan agensi global.",
    "about.card3.title": "Disiplin Keahlian",

    // Projects / Works - Stage 1
    "projects.stage1.badge": "KARYA TERPILIH",
    "projects.stage1.headline": "Ragam Karya. Satu Visi Kreatif.",
    "projects.stage1.subheadline":
      "Jelajahi proyek pilihan di bidang branding, motion, desain digital, dan visual berbasis AI, yang dibentuk oleh beragam brief, tim, dan tantangan kreatif.",
    "projects.stage1.scroll": "Gulir ke bawah",

    // Projects / Works - Stage 2
    "projects.stage2.tag": "KREATIF BERBASIS AI",
    "projects.stage2.headline": "Desain. Motion. AI.",
    "projects.stage2.desc":
      "Desainer Grafis Senior & Seniman Digital yang menciptakan visual brand berdampak, motion graphics, dan pengalaman digital untuk brand global.",
    "projects.stage2.btn": "Jelajahi Karya Saya",

    // Projects / Works - Stage 3
    "projects.stage3.tag": "PERJALANAN KREATIF | 2012 HINGGA SEKARANG",
    "projects.stage3.headline":
      "Perjalanan yang dibentuk oleh kreativitas dan perubahan.",
    "projects.stage3.card.title": "Dari Karya Visual Menuju Teknologi",
    "projects.stage3.card.category": "KARYA VISUAL | DIGITAL | AI",
    "projects.stage3.card.btn": "Lihat Penuh",

    // Projects / Works - Stage 4
    "projects.stage4.badge": "PENGALAMAN PROFESIONAL",
    "projects.stage4.headline": "Karya Kreatif. Solusi Nyata.",
    "projects.stage4.desc":
      "Dari kampanye brand hingga pengalaman digital, saya menggabungkan alur kerja desain, animasi motion, dan kecerdasan AI untuk menciptakan visual bermakna bagi brand dan bisnis.",
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
    "contact.body":
      "Punya ide proyek? Mari terhubung dan diskusikan bagaimana desain kreatif, animasi motion, dan produksi visual dapat mewujudkan ide Anda.",
    "contact.footer.rights": "SEMUA HAK CIPTA DILINDUNGI.",
    "contact.footer.clients": "Klien",
    "contact.footer.work": "Karya",
    "contact.footer.products": "Produk",
    "contact.footer.about": "Tentang Saya",
    "contact.footer.contact": "Kontak",
    "contact.lang.label": "Pilihan Bahasa:",
  },

  min: {
    // Navbar
    "nav.clients": "Klien",
    "nav.about": "Tantang Ambo",
    "nav.work": "Karya",
    "nav.products": "Produk",
    "nav.tracking": "Tracking",
    "nav.contact": "Hubungi",
    "nav.direct": "Langsuang ↗",
    "nav.langLabel": "Piliahan Bahaso:",

    // Overlay / Hero
    "hero.role": "Parancang Kreatif Barbasis AI",
    "hero.scroll": "GULIA KA BAWAH",
    "hero.section2.headline1": "Kreatif nan",
    "hero.section2.headline2": "baasia rancak",
    "hero.section2.body":
      "Manggabuangkan 11+ taun pangalaman kreatif jo alur karajo modern untuak mahasiakan visual nan padek, identitas merek nan kuaik, sarato kampanye digital bakarajo tinggi.",
    "hero.section3.headline1": "Kreativitas",
    "hero.section3.headline2": "bapadukan AI",
    "hero.section3.body":
      "Titik temu antaro kreativitas urang jo alur karajo modern — mambuek karya visual, identitas merek, jo kampanye nan manggariakkan ati sarato maagiah asia gadang.",

    // Clients Section
    "clients.subtitle": "Klien Tapiliah & Karajosamo Kreatif",

    // About Me (Bahaso Minang)
    "about.eyebrow": "SIA AMBO",
    "about.title": "Tantang Ambo",
    "about.headline":
      "Parancang Kreatif & Spesialis Motion | 11+ Taun | Agensi & Brand Dunia",
    "about.para1":
      "Alah 11+ taun dalam dunia desain kreatif, ambo bakambang sasuai kamajuan industri, mamadukan dasar-dasar desain nan kokoh jo alur karajo modern untuak mahasiakan visual nan padek ka agensi jo brand internasional.",
    "about.quote":
      "Kaoetamoan tagadang surang profesional kreatif indaklah manulak parubahan — tapi manyasuaikan diri labiah capek.",
    "about.stat1.num": "11+",
    "about.stat1.label": "Taun Pangalaman",
    "about.stat2.num": "100+",
    "about.stat2.label": "Proyek Tuntong",
    "about.stat3.num": "20+",
    "about.stat3.label": "Klien Dunia",
    "about.card1.title": "Prinsip Utamo",
    "about.card1.body":
      "Kaoetamoan tagadang surang profesional kreatif indaklah manulak parubahan — tapi manyasuaikan diri labiah capek.",
    "about.card2.title": "Karajosamo Global",
    "about.card2.body":
      "Mambuek konten visual skala gadang, iklan rancak, jo materi kampanye batingkek tinggi untuak brand jo agensi dunia.",
    "about.card3.title": "Kaoetamoan Bidang",

    // Projects / Works - Stage 1
    "projects.stage1.badge": "KARYA TAPILIAH",
    "projects.stage1.headline": "Bamacam Karya. Ciek Visi Kreatif.",
    "projects.stage1.subheadline":
      "Jelajahi proyek pilihan di bidang branding, animasi motion, rancangan digital, sarato visual barbasis AI, nan tabantuak dek baragam brief, tim, jo tantangan kreatif.",
    "projects.stage1.scroll": "Gulia ka bawah",

    // Projects / Works - Stage 2
    "projects.stage2.tag": "KREATIF BARBASIS AI",
    "projects.stage2.headline": "Desain. Motion. AI.",
    "projects.stage2.desc":
      "Desainer Grafis Senior & Saniman Digital nan marancang visual brand babobot, animasi motion, sarato pangalaman digital untuak brand global.",
    "projects.stage2.btn": "Jelajahi Karya Ambo",

    // Projects / Works - Stage 3
    "projects.stage3.tag": "PAJALANAN KREATIF | 2012 INGGA KINI",
    "projects.stage3.headline":
      "Pajalanan nan tabantuak dek kreativitas jo parubahan.",
    "projects.stage3.card.title": "Dari Karya Visual Manuju Teknologi",
    "projects.stage3.card.category": "KARYA VISUAL | DIGITAL | AI",
    "projects.stage3.card.btn": "Caliak Panuah",

    // Projects / Works - Stage 4
    "projects.stage4.badge": "PANGALAMAN PROFESIONAL",
    "projects.stage4.headline": "Karya Kreatif. Solusi Nyato.",
    "projects.stage4.desc":
      "Dari kampanye merek ingga pangalaman digital, ambo mamadukan alur karajo desain, animasi motion, sarato kacerdasan AI untuak mambuek karya nan baguno.",
    "projects.stage4.archive": "Arsip",
    "projects.stage4.deliverables": "karya",

    // Lightbox Modal
    "projects.challenge": "Tantangan",
    "projects.solution": "Solusi",
    "projects.role": "Tugeh / Peran:",
    "projects.tools": "Pakakeh / Tools:",
    "projects.close": "Tutuik Caliak",
    "projects.scrollhint": "Katarangan Proyek di Bawah",
    "casestudy.challenge.label": "Tantangan / Kasukaran",
    "casestudy.solution.label": "Solusi / Caro Karajo",

    // Contact
    "contact.badge": "Tabukak untuak Paluang Kreatif",
    "contact.headline1": "Mari kito buek",
    "contact.headline2": "nan bamakna",
    "contact.headline3": "basamo-samo.",
    "contact.body":
      "Ado ide rancangan atau proyek? Mari kito badiskusi baa desain kreatif, animasi motion, sarato produksi visual dapek mambuek ide sanak jadi kanyataan.",
    "contact.footer.rights": "SAGALO HAK CIPTA TALINDUNGI.",
    "contact.footer.clients": "Klien",
    "contact.footer.work": "Karya",
    "contact.footer.products": "Produk",
    "contact.footer.about": "Tantang Ambo",
    "contact.footer.contact": "Hubungi",
    "contact.lang.label": "Piliahan Bahaso:",
  },
};

export interface KnownPair {
  en: string;
  id: string;
  min: string;
}

export const KNOWN_UI_PAIRS: KnownPair[] = [
  // Actions & Controls
  { en: "Cancel", id: "Batal", min: "Batal" },
  { en: "Save", id: "Simpan", min: "Simpan" },
  { en: "Save & Apply", id: "Simpan & Terapkan", min: "Simpan & Terapkan" },
  { en: "Save Changes", id: "Simpan Perubahan", min: "Simpan Parubahan" },
  { en: "Create Folder", id: "Buat Folder", min: "Buek Folder" },
  { en: "Create New Folder", id: "Buat Folder Baru", min: "Buek Folder Baru" },
  { en: "Create New Client Folder", id: "Buat Folder Klien Baru", min: "Buek Folder Klien Baru" },
  { en: "Edit Name / Folder", id: "Ubah Nama / Folder", min: "Ganti Namo / Folder" },
  { en: "Delete Folder", id: "Hapus Folder", min: "Hapuih Folder" },
  { en: "Reset Default", id: "Reset Default", min: "Reset Samulo" },
  { en: "Reset Form", id: "Reset Formulir", min: "Reset Formulir" },
  { en: "Upload File", id: "Unggah Berkas", min: "Unggah Berkas" },
  { en: "Download File", id: "Unduh Berkas", min: "Unduah Berkas" },
  { en: "Copy Link", id: "Salin Link", min: "Salin Tautan" },
  { en: "Manage Figma / Canvas Links", id: "Kelola Link Figma / Canvas", min: "Atua Link Figma / Canvas" },
  { en: "Add Another Link", id: "Tambah Link Lain", min: "Tambah Link Lain" },
  { en: "Add Video Showreel", id: "Tambah Video Showreel", min: "Tambah Video Showreel" },
  { en: "View Full", id: "Lihat Penuh", min: "Caliak Panuah" },
  { en: "Close Preview", id: "Tutup Pratinjau", min: "Tutuik Caliak" },
  { en: "Close", id: "Tutup", min: "Tutuik" },
  { en: "Back", id: "Kembali", min: "Baliak" },
  { en: "Next", id: "Selanjutnya", min: "Salanjuiknyo" },
  { en: "Previous", id: "Sebelumnya", min: "Sabalunnyo" },
  { en: "Switch to Light Mode", id: "Beralih ke Mode Terang", min: "Ganti ka Mode Tarang" },
  { en: "Switch to Dark Mode", id: "Beralih ke Mode Gelap", min: "Ganti ka Mode Galok" },

  // Navigation & Sections
  { en: "Client Folders", id: "Folder Klien", min: "Folder Klien" },
  { en: "Clients", id: "Klien", min: "Klien" },
  { en: "Work", id: "Karya", min: "Karya" },
  { en: "Products", id: "Produk", min: "Produk" },
  { en: "Tracking", id: "Pelacakan", min: "Palacakan" },
  { en: "About Me", id: "Tentang Saya", min: "Tantang Ambo" },
  { en: "Contact", id: "Kontak", min: "Hubungi" },

  // Form Fields & Labels
  { en: "Brand / Client Name", id: "Nama Brand / Klien", min: "Namo Brand / Klien" },
  { en: "Category / Collaboration Type", id: "Kategori / Tipe Kolaborasi", min: "Kategori / Tipe Kolaborasi" },
  { en: "Project Description", id: "Deskripsi Proyek", min: "Deskripsi Proyek" },
  { en: "Brand Profile & Context", id: "Profil Brand & Konteks", min: "Profil Brand & Konteks" },
  { en: "Software & AI Tools Used", id: "Software & AI Tools yang Digunakan", min: "Software & AI Tools nan Digunokan" },
  { en: "Collaboration Year", id: "Tahun Kolaborasi", min: "Taun Kolaborasi" },
  { en: "Target Timeline", id: "Target Jadwal", min: "Target Jadwal" },
  { en: "Slots Full", id: "Slot Penuh", min: "Slot Penuah" },
  { en: "Order ID :", id: "ID Pesanan :", min: "ID Pasanan :" },
  { en: "Package Name:", id: "Nama Paket:", min: "Namo Paket:" },
  { en: "What's Included (Deliverables):", id: "Yang Didapatkan (Deliverables):", min: "Nan Didapekan (Deliverables):" },

  // Workspace & Media
  { en: "Device", id: "Perangkat", min: "Parangkek" },
  { en: "Color Wheel", id: "Roda Warna", min: "Roda Warono" },
  { en: "Apply Brush", id: "Terapkan Brush", min: "Terapkan Brush" },
  { en: "Resource Library", id: "Pustaka Sumber Daya", min: "Pustaka Sumber Daya" },
  { en: "Video & reels showcase", id: "Showcase video & reels", min: "Showcase video & reels" },
  { en: "Media Reels", id: "Media Reels", min: "Media Reels" },
  { en: "Watch demo video on YouTube", id: "Tonton video demo di YouTube", min: "Tonton video demo di YouTube" },
  { en: "Google Drive Media", id: "Media Google Drive", min: "Media Google Drive" },
  { en: "Showcase Headline", id: "Judul Utama Showcase", min: "Judul Utamo Showcase" },
  { en: "Class Tag", id: "Label Kategori", min: "Label Kategori" },
  { en: "YouTube Video URL or ID", id: "URL atau ID Video YouTube", min: "URL atau ID Video YouTube" },
  { en: "Google Drive File URL or ID", id: "URL atau ID File Google Drive", min: "URL atau ID Berkas Google Drive" },
  { en: "Direct Image Cover URL", id: "URL Gambar Sampul Langsung", min: "URL Gambar Sampua Langsuang" },
  { en: "Showcase Card Title", id: "Judul Kartu Showcase", min: "Judul Kartu Showcase" },
  { en: "Showcase Subtitle / Tag", id: "Subjudul / Tag Showcase", min: "Subjudul / Tag Showcase" },
  { en: "Showcase Description", id: "Deskripsi Showcase", min: "Katarangan Showcase" },
  { en: "Enable Embedded Video Player on Public Web", id: "Tampilkan Pemutar Video Embed di Public Web", min: "Tampilkan Pamuta Video Embed di Public Web" },

  // User prompts & feedback
  { en: "Please enter your name.", id: "Mohon masukkan nama Anda.", min: "Mohon masuak-an namo Sanak." },
  { en: "Please enter your WhatsApp number for confirmation.", id: "Mohon masukkan nomor WhatsApp untuk konfirmasi.", min: "Mohon masuak-an nomor WhatsApp untuak konfirmasi." },
  { en: "Share Service Package", id: "Bagikan Paket Layanan", min: "Bagian Paket Layanan" },
  { en: "Send this package details to your client or colleague", id: "Kirim rincian paket ini ke klien atau rekan Anda", min: "Kirim rincian paket ko ka klien atau kawan Sanak" },
  { en: "Share to WhatsApp 💬", id: "Bagikan ke WhatsApp 💬", min: "Bagian ka WhatsApp 💬" },
  { en: "Order This Package Directly 🚀", id: "Langsung Pesan Paket Ini 🚀", min: "Langsuang Pasan Paket Ko 🚀" },
  { en: "Close Results", id: "Tutup Hasil", min: "Tutuik Hasil" },
  { en: "Paste feature is not automatically supported in this browser. Please paste manually.", id: "Fitur paste tidak didukung otomatis di browser ini. Silakan tempel secara manual.", min: "Fitur paste indak didukuang otomatis di browser ko. Silakan tempel sacaro manual." },
  { en: "Review pricing details, estimated turnaround, feature highlights, and scope limits before proceeding to the order form.", id: "Tinjau detail harga, estimasi durasi, checklist keunggulan, serta batasan setiap paket sebelum melanjutkan ke formulir pemesanan.", min: "Tinjau detail arago, estimasi durasi, checklist kaunggulan, sarato batasan tiok paket sabalun malanjuikan ka formulir pamasanan." }
];

const KNOWN_PAIRS_MAP = new Map<string, KnownPair>();
KNOWN_UI_PAIRS.forEach((p) => {
  KNOWN_PAIRS_MAP.set(p.en.toLowerCase().trim(), p);
  KNOWN_PAIRS_MAP.set(p.id.toLowerCase().trim(), p);
  if (p.min) KNOWN_PAIRS_MAP.set(p.min.toLowerCase().trim(), p);
});

export function getKnownPair(text: string): KnownPair | undefined {
  if (!text || typeof text !== "string") return undefined;
  return KNOWN_PAIRS_MAP.get(text.toLowerCase().trim());
}

const ID_INDICATORS = [
  /^contoh\s*:/i,
  /^tuliskan\s+/i,
  /^masukkan\s+/i,
  /^mohon\s+/i,
  /^silakan\s+/i,
  /^harap\s+/i,
  /^apakah\s+/i,
  /^buat\s+/i,
  /^tambah\s+/i,
  /^hapus\s+/i,
  /^simpan\s+/i,
  /^kelola\s+/i,
  /^atur\s+/i,
  /^batal\b/i,
  /^ditampilkan\s+/i,
  /^beralih\s+/i,
  /^lihat\s+/i,
  /^kembalikan\s+/i,
  /^tutup\s+/i,
  /^bagikan\s+/i,
  /^kirim\s+/i,
  /^pesan\s+/i,
  /^pilih\s+/i
];

const EN_INDICATORS = [
  /^example\s*:/i,
  /^write\s+/i,
  /^enter\s+/i,
  /^please\s+/i,
  /^create\s+/i,
  /^add\s+/i,
  /^delete\s+/i,
  /^save\s+/i,
  /^manage\s+/i,
  /^cancel\b/i,
  /^displayed\s+/i,
  /^switch\s+/i,
  /^view\s+/i,
  /^reset\s+/i,
  /^close\s+/i,
  /^share\s+/i,
  /^send\s+/i,
  /^order\s+/i,
  /^select\s+/i
];

const EN_TO_ID_WORDS: [RegExp, string][] = [
  [/\bcreate folder\b/gi, "buat folder"],
  [/\bcreate new folder\b/gi, "buat folder baru"],
  [/\bcreate new client folder\b/gi, "buat folder klien baru"],
  [/\bcreate\b/gi, "buat"],
  [/\bcancel\b/gi, "batal"],
  [/\bsave changes\b/gi, "simpan perubahan"],
  [/\bsave & apply\b/gi, "simpan & terapkan"],
  [/\bsave\b/gi, "simpan"],
  [/\bdelete\b/gi, "hapus"],
  [/\bedit\b/gi, "ubah"],
  [/\bexample:\b/gi, "contoh:"],
  [/\bmanage\b/gi, "kelola"],
  [/\bselect\b/gi, "pilih"],
  [/\bview full\b/gi, "lihat penuh"],
  [/\bview\b/gi, "lihat"],
  [/\bclose\b/gi, "tutup"],
  [/\bback\b/gi, "kembali"],
  [/\bnext\b/gi, "selanjutnya"],
  [/\bprevious\b/gi, "sebelumnya"],
  [/\bupload\b/gi, "unggah"],
  [/\bdownload\b/gi, "unduh"],
  [/\bcopy\b/gi, "salin"],
  [/\bdevice\b/gi, "perangkat"],
  [/\bclient folders\b/gi, "folder klien"],
  [/\bclient\b/gi, "klien"],
  [/\bclients\b/gi, "klien"],
  [/\bwork\b/gi, "karya"],
  [/\bworks\b/gi, "karya"],
  [/\bprojects\b/gi, "proyek"],
  [/\bproject\b/gi, "proyek"],
  [/\bproducts\b/gi, "produk"],
  [/\bproduct\b/gi, "produk"],
  [/\bswitch to light mode\b/gi, "beralih ke mode terang"],
  [/\bswitch to dark mode\b/gi, "beralih ke mode gelap"]
];

const ID_TO_EN_WORDS: [RegExp, string][] = [
  [/\bbuat folder baru\b/gi, "create new folder"],
  [/\bbuat folder klien baru\b/gi, "create new client folder"],
  [/\bbuat folder\b/gi, "create folder"],
  [/\bbuat\b/gi, "create"],
  [/\bbatal\b/gi, "cancel"],
  [/\bsimpan perubahan\b/gi, "save changes"],
  [/\bsimpan & terapkan\b/gi, "save & apply"],
  [/\bsimpan\b/gi, "save"],
  [/\bhapus\b/gi, "delete"],
  [/\bubah\b/gi, "edit"],
  [/\bcontoh:\b/gi, "example:"],
  [/\bkelola\b/gi, "manage"],
  [/\bpilih\b/gi, "select"],
  [/\blihat penuh\b/gi, "view full"],
  [/\blihat\b/gi, "view"],
  [/\btutup\b/gi, "close"],
  [/\bkembali\b/gi, "back"],
  [/\bselanjutnya\b/gi, "next"],
  [/\bsebelumnya\b/gi, "previous"],
  [/\bunggah\b/gi, "upload"],
  [/\bunduh\b/gi, "download"],
  [/\bsalin\b/gi, "copy"],
  [/\bperangkat\b/gi, "device"],
  [/\bfolder klien\b/gi, "client folders"],
  [/\bklien\b/gi, "clients"],
  [/\bkarya\b/gi, "works"],
  [/\bproyek\b/gi, "projects"],
  [/\bproduk\b/gi, "products"],
  [/\bberalih ke mode terang\b/gi, "switch to light mode"],
  [/\bberalih ke mode gelap\b/gi, "switch to dark mode"]
];

export function toIndonesian(text: string): string {
  if (!text || typeof text !== "string") return "";
  const kp = getKnownPair(text);
  if (kp) return kp.id;
  let res = text;
  EN_TO_ID_WORDS.forEach(([pat, rep]) => {
    res = res.replace(pat, (m) => (m[0] === m[0].toUpperCase() ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep));
  });
  return res;
}

export function toEnglish(text: string): string {
  if (!text || typeof text !== "string") return "";
  const kp = getKnownPair(text);
  if (kp) return kp.en;
  let res = text;
  ID_TO_EN_WORDS.forEach(([pat, rep]) => {
    res = res.replace(pat, (m) => (m[0] === m[0].toUpperCase() ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep));
  });
  return res;
}

const ID_WORDS_SET = new Set([
  "dan", "yang", "di", "ke", "dari", "untuk", "dengan", "ini", "itu", "atau", "serta",
  "berhasil", "gagal", "simpan", "tersimpan", "parubahan", "perubahan", "hapus", "dihapus",
  "ubah", "diubah", "tambah", "ditambahkan", "pilih", "dipilih", "pengaturan", "warna", "tema",
  "kursor", "proyek", "karya", "klien", "portofolio", "selesai", "bahasa", "tentang", "saya",
  "anda", "sanak", "peringatan", "masukkan", "kembali", "tutup", "buka", "lihat", "gulir",
  "unduh", "diunduh", "unggah", "diunggah", "salin", "disalin", "tautan", "sampah", "kapasitas",
  "penyimpanan", "kontak", "keamanan", "sandi", "bawaan", "kustom", "aktif", "nonaktif",
  "baris", "kecepatan", "putaran", "detik", "gerakan", "efek", "gelombang", "sentuhan",
  "melayang", "koleksi", "pengunjung", "halaman", "tampilan", "layar", "kategori", "judul",
  "gambar", "keterangan", "deskripsi", "wajib", "silakan", "mohon", "harap", "apakah",
  "yakin", "semua", "seluruh", "tidak", "bukan", "sudah", "belum", "sedang", "akan",
  "dapat", "bisa", "hanya", "pada", "foto", "pratinjau", "unggul", "unggulan", "terpilih",
  "pilihan", "pulihkan", "bersihkan", "kuota", "ruang", "berkas", "keluar", "masuk",
  "sinkron", "sinkronisasi", "koneksi", "basis", "data", "pesan", "sosial", "media", "taun",
  "tahun", "pangalaman", "pengalaman", "kunci", "sesuaikan", "kelola", "rangkaian", "tuntong",
  "ambo", "kito", "bahaso", "tasimpan", "tapiliah", "tahapuih", "barasia", "tong", "sarok",
  "thema", "profil", "materi", "tata", "letak", "prospek", "selamat", "datang", "ringkasan",
  "layanan", "paket", "katalog", "memori", "berjalan", "antrean", "lacak", "pelacakan", "tahapan",
  "pengerjaan", "catatan", "terkini", "aksi", "kode", "referensi", "rekening", "metode", "pembayaran",
  "kartu", "terpakai", "alokasi", "distribusi", "optimal", "aman", "kosongkan", "sekarang", "cadangan",
  "kesehatan", "paling", "populer", "bebas", "biaya", "instan", "publikasi", "atas", "nama",
  "pemilik", "petunjuk", "singkat", "beralih", "gelap", "terang", "arsip", "pencari", "mesin",
  "buat", "batal", "contoh", "perangkat", "roda", "pustaka", "terapkan", "peninjauan", "diserahkan"
]);

const EN_WORDS_SET = new Set([
  "the", "and", "in", "to", "from", "for", "with", "this", "that", "or", "as",
  "success", "successfully", "failed", "save", "saved", "changes", "delete", "deleted",
  "edit", "edited", "add", "added", "select", "selected", "settings", "color", "colors",
  "theme", "cursor", "project", "projects", "work", "works", "client", "clients", "portfolio",
  "completed", "done", "language", "about", "me", "you", "your", "warning", "enter",
  "back", "close", "open", "view", "scroll", "download", "downloaded", "upload", "uploaded",
  "copy", "copied", "link", "trash", "bin", "recycle", "storage", "capacity", "analytics",
  "contact", "contacts", "security", "password", "default", "defaults", "custom", "active",
  "inactive", "enabled", "disabled", "row", "speed", "round", "seconds", "sec", "motion",
  "effect", "effects", "wave", "ripple", "floating", "collection", "visitor", "visitors",
  "page", "display", "screen", "category", "title", "image", "images", "description",
  "required", "please", "confirm", "are", "sure", "all", "not", "already", "will", "can",
  "only", "on", "photo", "photos", "preview", "top", "restore", "clean", "clear", "quota",
  "space", "file", "files", "logout", "login", "sync", "connection", "message", "social",
  "media", "years", "year", "experience", "key", "manage", "sequence", "frame", "frames",
  "reel", "reels", "showcase", "banner", "hero", "lead", "leads", "profile", "layout",
  "welcome", "morning", "overview", "studio", "services", "packages", "catalog", "memory",
  "ongoing", "queue", "queued", "track", "tracking", "stage", "stages", "progress", "notes",
  "latest", "actions", "action", "code", "reference", "account", "accounts", "payment", "method",
  "methods", "used", "allocation", "breakdown", "optimal", "safe", "empty", "now", "backup",
  "health", "most", "popular", "free", "instant", "published", "holder", "instructions",
  "switch", "dark", "light", "archive", "search", "engine", "pipeline", "live", "cloud",
  "create", "cancel", "example", "folder", "device", "wheel", "library", "apply", "turnaround", "delivered"
]);

export function scoreText(text: string) {
  if (!text || typeof text !== "string") return { idScore: 0, enScore: 0 };
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  let idScore = 0;
  let enScore = 0;
  for (const w of words) {
    if (ID_WORDS_SET.has(w)) idScore += 3;
    if (EN_WORDS_SET.has(w)) enScore += 3;

    // Indonesian morphology markers
    if (/^(ber|ter|per|peng|pen|pem|meny|meng|men|mem|di)[a-z]{3,}$/.test(w)) idScore += 2;
    if (/[a-z]{3,}(kan|kanlah|nya|i|lah|kah)$/.test(w)) idScore += 2;
    if (/^(se|ke)[a-z]{3,}(an)?$/.test(w)) idScore += 1;

    // English morphology markers
    if (/[a-z]{3,}(ing|ed|tion|tions|ment|ments|able|ible|less|ness|ize|ise|ly)$/.test(w)) enScore += 2;
  }
  return { idScore, enScore };
}

export function resolveTrPair(a: string, b?: string): { en: string; id: string; min?: string } {
  if (!a && !b) return { en: "", id: "" };
  if (!b) {
    const kSingle = getKnownPair(a);
    if (kSingle) return { en: kSingle.en, id: kSingle.id, min: kSingle.min };
    const sa = scoreText(a);
    if (sa.enScore >= sa.idScore) return { en: a, id: toIndonesian(a) };
    return { en: toEnglish(a), id: a };
  }
  if (!a) {
    const kSingle = getKnownPair(b);
    if (kSingle) return { en: kSingle.en, id: kSingle.id, min: kSingle.min };
    const sb = scoreText(b);
    if (sb.enScore >= sb.idScore) return { en: b, id: toIndonesian(b) };
    return { en: toEnglish(b), id: b };
  }

  // 1. Direct Known UI Pair lookup
  const normA = a.toLowerCase().trim();
  const normB = b.toLowerCase().trim();
  const kA = KNOWN_PAIRS_MAP.get(normA);
  const kB = KNOWN_PAIRS_MAP.get(normB);

  if (kA && (!b || normB === kA.en.toLowerCase() || normB === kA.id.toLowerCase() || normA === normB)) {
    return { en: kA.en, id: kA.id, min: kA.min };
  }
  if (kB && (!a || normA === kB.en.toLowerCase() || normA === kB.id.toLowerCase() || normA === normB)) {
    return { en: kB.en, id: kB.id, min: kB.min };
  }

  // 2. If identical strings were passed: auto-translate missing counterpart
  if (normA === normB) {
    const sa = scoreText(a);
    if (sa.idScore > sa.enScore) return { en: toEnglish(a), id: a };
    return { en: a, id: toIndonesian(a) };
  }

  // 3. Indicator Regexes
  const aIsId = ID_INDICATORS.some((r) => r.test(a.trim()));
  const aIsEn = EN_INDICATORS.some((r) => r.test(a.trim()));
  const bIsId = ID_INDICATORS.some((r) => r.test(b.trim()));
  const bIsEn = EN_INDICATORS.some((r) => r.test(b.trim()));

  if (aIsId && bIsEn) return { id: a, en: b };
  if (bIsId && aIsEn) return { id: b, en: a };
  if (aIsId && !bIsId) return { id: a, en: b };
  if (bIsId && !aIsId) return { id: b, en: a };
  if (aIsEn && !bIsEn) return { en: a, id: b };
  if (bIsEn && !aIsEn) return { en: b, id: a };

  // 4. Vocabulary Scoring
  const sa = scoreText(a);
  const sb = scoreText(b);

  const aNetId = sa.idScore - sa.enScore;
  const bNetId = sb.idScore - sb.enScore;

  if (aNetId > 0 && bNetId < 0) return { id: a, en: b };
  if (bNetId > 0 && aNetId < 0) return { id: b, en: a };
  if (aNetId > bNetId) return { id: a, en: b };
  if (bNetId > aNetId) return { id: b, en: a };

  if (sa.enScore > sb.enScore) return { en: a, id: b };
  if (sb.enScore > sa.enScore) return { en: b, id: a };
  if (sa.idScore > sb.idScore) return { id: a, en: b };
  if (sb.idScore > sa.idScore) return { id: b, en: a };

  // 5. Final fallback
  return { en: a, id: b };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default is explicitly English ("en")
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate preference from localStorage (default to 'en' if not set)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rizx-lang") as Lang | null;
      if (saved === "en" || saved === "id" || saved === "min") {
        setLangState(saved);
      } else {
        setLangState("en");
        localStorage.setItem("rizx-lang", "en");
      }
    } catch (e) {
      setLangState("en");
    }
  }, []);

  // Listen for language sync across windows/tabs and components
  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<Lang>;
      if (custom.detail && (custom.detail === "en" || custom.detail === "id" || custom.detail === "min")) {
        setLangState(custom.detail);
      }
    };
    window.addEventListener("rizx-lang-change", handleCustomEvent);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("rizx_lang_sync_channel");
        bc.onmessage = (event) => {
          if (event.data && event.data.type === "LANG_CHANGE" && event.data.lang) {
            setLangState(event.data.lang);
          }
        };
      } catch (e) {}
    }

    return () => {
      window.removeEventListener("rizx-lang-change", handleCustomEvent);
      if (bc) bc.close();
    };
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("rizx-lang", l);
        window.dispatchEvent(new CustomEvent("rizx-lang-change", { detail: l }));
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("rizx_lang_sync_channel");
          bc.postMessage({ type: "LANG_CHANGE", lang: l });
          bc.close();
        }
      }
    } catch (e) {}
  };

  const t = (key: string): string => {
    return (
      translations[lang]?.[key] ??
      translations["en"]?.[key] ??
      translations["id"]?.[key] ??
      key
    );
  };

  const tr = (arg1: string, arg2?: string, arg3?: string): string => {
    // If Minang is selected and a dedicated Minang text is explicitly provided, use it directly
    if (lang === "min" && arg3) {
      return arg3;
    }

    const pair = resolveTrPair(arg1, arg2);
    if (lang === "en") return pair.en;
    if (lang === "id") return pair.id;
    if (lang === "min") return arg3 || pair.min || toMinang(pair.id);
    return pair.en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tr, toMinang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

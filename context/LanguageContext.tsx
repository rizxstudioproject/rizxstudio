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
    "projects.stage3.card.btn": "Caliak Sangenek",

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
  "thema", "profil", "materi", "tata", "letak", "prospek"
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
  "reel", "reels", "showcase", "banner", "hero", "lead", "leads", "profile", "layout"
]);

function scoreText(text: string) {
  if (!text || typeof text !== "string") return { idScore: 0, enScore: 0 };
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  let idScore = 0;
  let enScore = 0;
  for (const w of words) {
    if (ID_WORDS_SET.has(w)) idScore += 2;
    if (EN_WORDS_SET.has(w)) enScore += 2;
  }
  return { idScore, enScore };
}

export function resolveTrPair(a: string, b: string): { en: string; id: string } {
  if (!a && !b) return { en: "", id: "" };
  if (!b) return { en: a, id: a };
  if (!a) return { en: b, id: b };

  const sa = scoreText(a);
  const sb = scoreText(b);

  // If a has ID signal and b has EN signal
  if (sa.idScore > sa.enScore && sb.enScore >= sb.idScore) {
    return { id: a, en: b };
  }
  // If a has EN signal and b has ID signal
  if (sa.enScore > sa.idScore && sb.idScore >= sb.enScore) {
    return { id: b, en: a };
  }
  // One-sided signals
  if (sb.enScore > sb.idScore && sa.enScore <= sa.idScore) {
    return { id: a, en: b };
  }
  if (sa.enScore > sa.idScore && sb.enScore <= sb.idScore) {
    return { id: b, en: a };
  }
  if (sa.idScore > sa.enScore && sb.idScore <= sb.enScore) {
    return { id: a, en: b };
  }
  if (sb.idScore > sb.enScore && sa.idScore <= sa.enScore) {
    return { id: b, en: a };
  }
  return { en: a, id: b };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("rizx-lang") as Lang | null;
    if (saved === "en" || saved === "id" || saved === "min") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("rizx-lang", l);
  };

  const t = (key: string): string => {
    return (
      translations[lang]?.[key] ??
      translations["id"]?.[key] ??
      translations["en"]?.[key] ??
      key
    );
  };

  const tr = (arg1: string, arg2?: string, arg3?: string): string => {
    if (!arg2) return arg1;
    const pair = resolveTrPair(arg1, arg2);
    if (lang === "en") return pair.en;
    if (lang === "id") return pair.id;
    if (lang === "min") return arg3 || toMinang(pair.id);
    return pair.en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tr, toMinang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

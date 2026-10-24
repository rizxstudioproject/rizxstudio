"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HiChatBubbleLeftRight,
  HiCheck,
  HiArrowPath,
  HiEnvelope,
  HiGlobeAlt,
  HiArrowTopRightOnSquare,
  HiPhone,
} from "react-icons/hi2";
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa6";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function SocialContactsWorkspace() {
  const { socialContacts, updateSocialContacts, primaryColor } = useMotionTheme();
  const { lang, tr } = useLang();

  const [form, setForm] = useState({
    whatsappNumber: socialContacts.whatsappNumber,
    whatsappMessage: socialContacts.whatsappMessage,
    instagramUrl: socialContacts.instagramUrl,
    linkedinUrl: socialContacts.linkedinUrl,
    email: socialContacts.email,
    githubUrl: socialContacts.githubUrl,
  });

  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSocialContacts(form);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const cleanWaNumber = form.whatsappNumber.replace(/[^0-9]/g, "");
  const waTestUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    form.whatsappMessage
  )}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              {tr("Direct Reach & Socials", "Kontak & Jejaring Sosial", "Kontak & Jariangan Sosial")}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tr("Contact & Social Media Settings", "Pengaturan Kontak & Media Sosial", "Aturan Kontak & Media Sosial")}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            {tr(
              "Update your WhatsApp phone number, custom pre-filled message, and social profiles. Changes automatically reflect across the Footer, Contact section, Navbar, and Floating WhatsApp popup.",
              "Kelola nomor WhatsApp, pesan default, serta link Instagram dan LinkedIn. Perubahan otomatis memperbarui tampilan di Footer, Contact Page, Navbar, dan Pop-up WhatsApp mengambang.",
              "Atua nomor WhatsApp, pasan default, sarato link Instagram jo LinkedIn. Otomatis marubah tampilan di Footer, Contact, Navbar, jo Pop-up WhatsApp."
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-black shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <HiCheck className="w-4 h-4" />
            <span>{tr("Save Changes", "Simpan Perubahan", "Simpan Parubahan")}</span>
          </button>
          {saveToast && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-white flex items-center gap-1.5 shadow-lg bg-emerald-600"
            >
              <HiCheck className="w-3.5 h-3.5" />
              <span>{tr("Updated Globally!", "Tersimpan Global!", "Tasimpan Global!")}</span>
            </motion.div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WHATSAPP CONFIGURATION */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FaWhatsapp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {tr("WhatsApp Business / Direct Line", "Jalur Langsung WhatsApp", "Jalur Langsuang WhatsApp")}
              </h3>
              <p className="text-xs text-neutral-400">
                {tr(
                  "Configures the Floating WhatsApp popup and quick chat buttons.",
                  "Mengatur nomor tombol chat cepat dan pop-up WhatsApp mengambang.",
                  "Mangatur nomor tombol chat capek sarato pop-up WhatsApp malayang."
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WA Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <HiPhone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{tr("WhatsApp Number (with country code, e.g. 628...)", "Nomor WhatsApp (Kode Negara, cth: 628...)", "Nomor WhatsApp (Kode Negara, cth: 628...)")}</span>
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="6282381769146"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-white/30"
              />
              <span className="text-[11px] text-neutral-500">
                {tr("Target URL: ", "URL Tujuan: ", "URL Tujuan: ")}
                <code className="text-emerald-400">https://wa.me/{cleanWaNumber}</code>
              </span>
            </div>

            {/* WA Test Link */}
            <div className="flex items-end pb-1">
              <a
                href={waTestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium inline-flex items-center gap-2 transition-all"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>{tr("Test Open WhatsApp", "Uji Buka WhatsApp", "Uji Bukak WhatsApp")}</span>
                <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* WA Pre-filled Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              {tr("Default Pre-filled Message", "Pesan Pembuka Otomatis", "Pasan Pambuko Otomatis")}
            </label>
            <textarea
              rows={2}
              value={form.whatsappMessage}
              onChange={(e) => setForm({ ...form, whatsappMessage: e.target.value })}
              placeholder="Halo Fomy R, saya tertarik dengan portofolio Anda..."
              className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* SOCIAL MEDIA PROFILES */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <HiGlobeAlt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {tr("Social Profiles & Channels", "Profil Media Sosial & Portofolio Eksternal", "Profil Media Sosial & Portofolio Eksternal")}
              </h3>
              <p className="text-xs text-neutral-400">
                {tr(
                  "Direct links to your Instagram, LinkedIn, GitHub, and professional inquiry email.",
                  "Pautan langsung ke akun Instagram, LinkedIn, GitHub, dan email bisnis Anda.",
                  "Pautan langsuang ka akun Instagram, LinkedIn, GitHub, sarato email bisnis Sanak."
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <FaInstagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                placeholder="https://www.instagram.com/rizxstudio/"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <FaLinkedinIn className="w-3.5 h-3.5 text-sky-400" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="https://www.linkedin.com/in/rizxstudio/"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <FaGithub className="w-3.5 h-3.5 text-neutral-400" />
                <span>GitHub Profile URL</span>
              </label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://github.com/rizxstudio"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <HiEnvelope className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr("Business Inquiry Email", "Email Penawaran Proyek", "Email Panawaran Proyek")}</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="fomy@rizxstudio.com"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl text-black font-semibold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            {tr("Save & Apply All Contacts", "Simpan & Terapkan Semua Kontak", "Simpan & Tarapkan Sadonyo Kontak")}
          </button>
        </div>
      </form>
    </div>
  );
}

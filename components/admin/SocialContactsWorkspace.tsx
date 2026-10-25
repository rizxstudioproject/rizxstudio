"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiChat3Fill as HiChatBubbleLeftRight,
  RiCheckFill as HiCheck,
  RiRestartFill as HiArrowPath,
  RiMailFill as HiEnvelope,
  RiGlobalFill as HiGlobeAlt,
  RiExternalLinkFill as HiArrowTopRightOnSquare,
  RiPhoneFill as HiPhone,
  RiSave3Fill,
  RiCheckboxCircleFill,
} from "react-icons/ri";
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa6";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";
import {
  normalizeSocialUrl,
  saveSocialContacts,
  DEFAULT_SOCIAL_CONTACTS,
  SocialContactsConfig,
} from "@/lib/socialService";

export default function SocialContactsWorkspace() {
  const { socialContacts, updateSocialContacts, primaryColor, themeMode } = useMotionTheme();
  const isLight = themeMode === "light";
  const { lang, tr } = useLang();

  const [form, setForm] = useState<SocialContactsConfig>({
    whatsappNumber: socialContacts.whatsappNumber || DEFAULT_SOCIAL_CONTACTS.whatsappNumber,
    whatsappMessage: socialContacts.whatsappMessage || DEFAULT_SOCIAL_CONTACTS.whatsappMessage,
    instagramUrl: socialContacts.instagramUrl || DEFAULT_SOCIAL_CONTACTS.instagramUrl,
    linkedinUrl: socialContacts.linkedinUrl || DEFAULT_SOCIAL_CONTACTS.linkedinUrl,
    email: socialContacts.email || DEFAULT_SOCIAL_CONTACTS.email,
    githubUrl: socialContacts.githubUrl || DEFAULT_SOCIAL_CONTACTS.githubUrl,
  });

  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync form state when socialContacts is loaded from Supabase Cloud
  useEffect(() => {
    setForm({
      whatsappNumber: socialContacts.whatsappNumber || DEFAULT_SOCIAL_CONTACTS.whatsappNumber,
      whatsappMessage: socialContacts.whatsappMessage || DEFAULT_SOCIAL_CONTACTS.whatsappMessage,
      instagramUrl: socialContacts.instagramUrl || DEFAULT_SOCIAL_CONTACTS.instagramUrl,
      linkedinUrl: socialContacts.linkedinUrl || DEFAULT_SOCIAL_CONTACTS.linkedinUrl,
      email: socialContacts.email || DEFAULT_SOCIAL_CONTACTS.email,
      githubUrl: socialContacts.githubUrl || DEFAULT_SOCIAL_CONTACTS.githubUrl,
    });
  }, [socialContacts]);

  const showToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleFieldChange = (field: keyof SocialContactsConfig, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const normalizedPayload: SocialContactsConfig = {
        whatsappNumber: form.whatsappNumber.trim(),
        whatsappMessage: form.whatsappMessage.trim(),
        instagramUrl: normalizeSocialUrl(form.instagramUrl, "instagram"),
        linkedinUrl: normalizeSocialUrl(form.linkedinUrl, "linkedin"),
        githubUrl: normalizeSocialUrl(form.githubUrl, "github"),
        email: form.email.trim(),
      };

      // Update in context immediately
      updateSocialContacts(normalizedPayload);
      setForm(normalizedPayload);

      // Persist to Supabase Cloud & LocalStorage
      const ok = await saveSocialContacts(normalizedPayload);
      if (ok) {
        showToast(tr("Tersimpan & Disinkronkan ke Cloud!", "Saved & Synced to Cloud!", "Tasimpan & Disinkronkan ka Cloud!"));
      } else {
        showToast(tr("Tersimpan secara lokal", "Saved locally", "Tasimpan di lokal"));
      }
    } catch (err) {
      console.error("Save social contacts error:", err);
      showToast("Gagal menyimpan ke cloud");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm(tr("Kembalikan kontak & sosial media ke bawaan?", "Reset contacts & socials to default?", "Baliakkan kontak & sosmed ka setelan awal?"))) {
      setForm({ ...DEFAULT_SOCIAL_CONTACTS });
      updateSocialContacts(DEFAULT_SOCIAL_CONTACTS);
      saveSocialContacts(DEFAULT_SOCIAL_CONTACTS);
      showToast(tr("Pengaturan dikembalikan ke bawaan", "Reset to defaults", "Setelan dibaliakkan ka awal"));
    }
  };

  const cleanWaNumber = (form.whatsappNumber || "").replace(/[^0-9]/g, "");
  const waTestUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(form.whatsappMessage || "")}`;
  const igTestUrl = normalizeSocialUrl(form.instagramUrl, "instagram");
  const liTestUrl = normalizeSocialUrl(form.linkedinUrl, "linkedin");
  const ghTestUrl = normalizeSocialUrl(form.githubUrl, "github");
  const emailTestUrl = normalizeSocialUrl(form.email, "email");

  return (
    <div className={`p-4 md:p-8 space-y-8 max-w-5xl mx-auto pb-16 ${isLight ? "text-slate-800" : "text-slate-100"}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold border bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
          >
            <RiCheckboxCircleFill className="w-4 h-4" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {tr("Contact & Social Media Settings", "Pengaturan Kontak & Media Sosial", "Aturan Kontak & Media Sosial")}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            {tr(
              "Manage WhatsApp, Instagram, LinkedIn, and email channels. Changes automatically sync to Supabase Cloud and update across the Footer, Navbar, and Floating WhatsApp popup.",
              "Kelola nomor WhatsApp, pesan default, serta link Instagram dan LinkedIn. Perubahan otomatis disinkronkan ke Supabase Cloud dan memperbarui tampilan di Footer, Navbar, dan Pop-up WhatsApp.",
              "Atua nomor WhatsApp, pasan default, sarato link Instagram jo LinkedIn. Otomatis disinkronkan ka Supabase Cloud sarato marubah tampilan di Footer, Navbar, jo Pop-up WhatsApp."
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isLight
                ? "bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiArrowPath className="w-3.5 h-3.5 inline mr-1" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <RiSave3Fill className="w-4 h-4" />
            <span>{saving ? tr("Menyimpan...", "Saving...", "Manyimpan...") : tr("Simpan ke Cloud", "Save to Cloud", "Simpan ka Cloud")}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WHATSAPP CONFIGURATION */}
        <div className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FaWhatsapp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
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
              <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                <HiPhone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{tr("Nomor WhatsApp (Kode Negara, cth: 628...)", "WhatsApp Number (with country code, e.g. 628...)", "Nomor WhatsApp (Kode Negara, cth: 628...)")}</span>
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => handleFieldChange("whatsappNumber", e.target.value)}
                placeholder="6282381769146"
                className={`w-full border rounded-xl px-4 py-2.5 text-xs font-mono outline-none transition-all ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-primary" : "bg-white/5 border-white/10 text-white focus:border-primary"
                }`}
              />
              <span className="text-[11px] text-neutral-500 block truncate">
                {tr("URL Tujuan: ", "Target URL: ", "URL Tujuan: ")}
                <code className="text-emerald-400 font-mono">https://wa.me/{cleanWaNumber}</code>
              </span>
            </div>

            {/* WA Test Link */}
            <div className="flex items-center md:items-end pb-1">
              <a
                href={waTestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>{tr("Uji Buka WhatsApp", "Test Open WhatsApp", "Uji Bukak WhatsApp")}</span>
                <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* WA Pre-filled Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {tr("Pesan Pembuka Otomatis (Pre-filled Message)", "Default Pre-filled Message", "Pasan Pambuko Otomatis")}
            </label>
            <textarea
              rows={2}
              value={form.whatsappMessage}
              onChange={(e) => handleFieldChange("whatsappMessage", e.target.value)}
              placeholder="Halo Fomy R, saya tertarik dengan portofolio Anda..."
              className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all resize-none ${
                isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-primary" : "bg-white/5 border-white/10 text-white focus:border-primary"
              }`}
            />
          </div>
        </div>

        {/* SOCIAL MEDIA PROFILES */}
        <div className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <HiGlobeAlt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {tr("Profil Media Sosial & Portofolio Eksternal", "Social Profiles & Channels", "Profil Media Sosial & Portofolio Eksternal")}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Instagram */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <FaInstagram className="w-4 h-4 text-pink-400" />
                  <span className="font-semibold">Instagram Profile</span>
                </label>
                {igTestUrl && (
                  <a
                    href={igTestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Uji Buka</span>
                    <HiArrowTopRightOnSquare className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={form.instagramUrl}
                onChange={(e) => handleFieldChange("instagramUrl", e.target.value)}
                placeholder="https://www.instagram.com/rizxstudio/ atau @rizxstudio"
                className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-primary" : "bg-white/5 border-white/10 text-white focus:border-primary"
                }`}
              />
              <span className="text-[11px] text-neutral-500 block truncate">
                Target URL: <code className="text-pink-400 font-mono">{igTestUrl || "-"}</code>
              </span>
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <FaLinkedinIn className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold">LinkedIn Profile</span>
                </label>
                {liTestUrl && (
                  <a
                    href={liTestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Uji Buka</span>
                    <HiArrowTopRightOnSquare className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={form.linkedinUrl}
                onChange={(e) => handleFieldChange("linkedinUrl", e.target.value)}
                placeholder="https://www.linkedin.com/in/rizxstudio/"
                className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-primary" : "bg-white/5 border-white/10 text-white focus:border-primary"
                }`}
              />
              <span className="text-[11px] text-neutral-500 block truncate">
                Target URL: <code className="text-sky-400 font-mono">{liTestUrl || "-"}</code>
              </span>
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <FaGithub className="w-4 h-4 text-neutral-400" />
                  <span className="font-semibold">GitHub Profile</span>
                </label>
                {ghTestUrl && (
                  <a
                    href={ghTestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-neutral-300 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Uji Buka</span>
                    <HiArrowTopRightOnSquare className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={form.githubUrl}
                onChange={(e) => handleFieldChange("githubUrl", e.target.value)}
                placeholder="https://github.com/rizxstudio"
                className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-primary" : "bg-white/5 border-white/10 text-white focus:border-primary"
                }`}
              />
              <span className="text-[11px] text-neutral-500 block truncate">
                Target URL: <code className="text-neutral-400 font-mono">{ghTestUrl || "-"}</code>
              </span>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <HiEnvelope className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">{tr("Email Penawaran Proyek", "Business Inquiry Email", "Email Panawaran Proyek")}</span>
                </label>
                {emailTestUrl && (
                  <a
                    href={emailTestUrl}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Uji Kirim</span>
                    <HiArrowTopRightOnSquare className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="fomy@rizxstudio.com"
                className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-primary" : "bg-white/5 border-white/10 text-white focus:border-primary"
                }`}
              />
              <span className="text-[11px] text-neutral-500 block truncate">
                Target Action: <code className="text-amber-400 font-mono">{emailTestUrl || "-"}</code>
              </span>
            </div>
          </div>
        </div>

        {/* Big Mobile & Desktop Save Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <RiSave3Fill className="w-4 h-4" />
            <span>{saving ? tr("Menyimpan ke Cloud...", "Saving to Cloud...", "Manyimpan ka Cloud...") : tr("Simpan Perubahan Kontak & Sosmed", "Save Contact & Social Changes", "Simpan Parubahan Kontak & Sosmed")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

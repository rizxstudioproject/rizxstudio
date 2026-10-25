"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiGoogleFill,
  RiShareBoxLine,
  RiCheckboxCircleFill,
  RiSave3Fill,
  RiRestartFill,
  RiGlobalLine,
  RiEyeLine,
  RiInformationFill,
  RiCodeSSlashLine,
  RiShieldCheckLine,
  RiSmartphoneLine,
  RiComputerLine,
} from "react-icons/ri";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";
import {
  getSeoConfig,
  saveSeoConfig,
  SeoConfig,
  DEFAULT_SEO_CONFIG,
} from "@/lib/seoService";

export default function SeoWorkspace() {
  const { themeMode, primaryColor } = useMotionTheme();
  const isLight = themeMode === "light";
  const { lang, tr } = useLang();

  const [config, setConfig] = useState<SeoConfig>(DEFAULT_SEO_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getSeoConfig().then((data) => {
      setConfig(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await saveSeoConfig(config);
      if (ok) {
        showToast("Pengaturan SEO berhasil disimpan & disinkronkan ke Cloud!");
      } else {
        showToast("Gagal menyimpan ke cloud, tersimpan di lokal", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset pengaturan SEO ke rekomendasi bawaan?")) {
      setConfig({ ...DEFAULT_SEO_CONFIG });
      showToast("Pengaturan SEO dikembalikan ke bawaan");
    }
  };

  const titleLength = config.metaTitle.length;
  const descLength = config.metaDescription.length;

  return (
    <div className={`p-4 md:p-8 space-y-8 min-h-screen ${isLight ? "bg-slate-50 text-slate-800" : "bg-[#0b0f19] text-slate-100"}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-sm font-medium border ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <RiCheckboxCircleFill className="w-5 h-5" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {tr("Search Engine Optimization (SEO)", "Search Engine Optimization (SEO)", "Search Engine Optimization (SEO)")}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Indexable
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {tr(
              "Manage search engine meta tags, OpenGraph previews, Schema.org rich snippets, and Google verification.",
              "Kelola meta tag mesin pencari, pratinjau media sosial, cuplikan kaya Schema.org, dan kode verifikasi Google.",
              "Atua meta tag masin pancari, pratinjau medsos, cuplikan Schema.org, jo kode verifikasi Google."
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isLight
                ? "bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <RiRestartFill className="w-4 h-4 inline mr-1.5" />
            Reset Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <RiSave3Fill className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan SEO Cloud"}</span>
          </button>
        </div>
      </div>

      {/* Live SERP & Social Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google SERP Preview Card */}
        <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RiGoogleFill className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-bold">Pratinjau Hasil Pencarian Google</h2>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition-all ${previewDevice === "desktop" ? "bg-primary text-white" : "text-slate-400"}`}
                title="Desktop View"
              >
                <RiComputerLine className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition-all ${previewDevice === "mobile" ? "bg-primary text-white" : "text-slate-400"}`}
                title="Mobile View"
              >
                <RiSmartphoneLine className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simulated Google Box */}
          <div className={`p-4 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#1f2937]/50 border-white/10"}`}>
            {/* Favicon & Breadcrumb */}
            <div className="flex items-center gap-2 text-xs mb-1">
              <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center p-1">
                <img src="/logo-public.png" alt="Rizxstudio" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-300 text-[11px]">{config.studioName || "Rizxstudio"}</span>
                <span className="text-[10px] text-slate-500 font-mono">{config.canonicalUrl}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-blue-400 hover:underline cursor-pointer line-clamp-1 mt-1">
              {config.metaTitle || "Judul Website"}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {config.metaDescription || "Deskripsi website Anda akan muncul di sini ketika pengunjung mencari di Google."}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Judul:{" "}
              <strong className={titleLength >= 40 && titleLength <= 65 ? "text-emerald-400" : "text-amber-400"}>
                {titleLength} karakter
              </strong>{" "}
              (ideal: 50-60)
            </span>
            <span>
              Deskripsi:{" "}
              <strong className={descLength >= 120 && descLength <= 165 ? "text-emerald-400" : "text-amber-400"}>
                {descLength} karakter
              </strong>{" "}
              (ideal: 120-160)
            </span>
          </div>
        </div>

        {/* Social Share Preview (WhatsApp / LinkedIn / Twitter) */}
        <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RiShareBoxLine className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold">Pratinjau Berbagi Tautan (WhatsApp / Medsos)</h2>
            </div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">OpenGraph 1000x1000</span>
          </div>

          {/* Social Card Preview */}
          <div className={`rounded-xl border overflow-hidden ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#1f2937]/50 border-white/10"}`}>
            <div className="w-full h-36 bg-slate-900 relative flex items-center justify-center overflow-hidden">
              <img
                src={config.ogImage || "/og-image-square.png"}
                alt="OG Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/og-image-square.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-mono text-white/80">{config.canonicalUrl}</span>
              </div>
            </div>
            <div className="p-3 space-y-1">
              <h4 className="text-xs font-bold truncate text-slate-200">{config.metaTitle}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{config.metaDescription}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Gambar Cuplikan: <strong>{config.ogImage}</strong></span>
            <span className="text-emerald-400 font-semibold">Tampil otomatis saat link di-share</span>
          </div>
        </div>
      </div>

      {/* SEO Form Settings */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Meta Tags */}
        <div className={`p-6 rounded-2xl border space-y-5 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <RiGlobalLine className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold">1. Informasi Utama & Tag Meta Halaman</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Meta Title */}
            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-400">
                <label>Judul Website (Meta Title) *</label>
                <span className="text-slate-500 font-mono">{titleLength}/70</span>
              </div>
              <input
                type="text"
                required
                value={config.metaTitle}
                onChange={(e) => setConfig({ ...config, metaTitle: e.target.value })}
                placeholder="Rizxstudio — Professional Creative Studio"
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-400">
                <label>Deskripsi Website (Meta Description) *</label>
                <span className="text-slate-500 font-mono">{descLength}/180</span>
              </div>
              <textarea
                rows={3}
                required
                value={config.metaDescription}
                onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                placeholder="Deskripsi rangkuman layanan studio yang menarik calon klien..."
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium resize-none ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block font-semibold mb-1 text-slate-400">Kata Kunci Utama (Keywords - Pisahkan dengan Koma)</label>
              <textarea
                rows={2}
                value={config.keywords}
                onChange={(e) => setConfig({ ...config, keywords: e.target.value })}
                placeholder="Rizxstudio, FOMY, Creative Designer, Motion Specialist, Video Production..."
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium resize-none ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
            </div>

            {/* Canonical & Studio Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-400">URL Kanonikal Resmi (Canonical Base URL)</label>
                <input
                  type="url"
                  value={config.canonicalUrl}
                  onChange={(e) => setConfig({ ...config, canonicalUrl: e.target.value })}
                  placeholder="https://rizxstudio.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-400">Nama Studio / Brand</label>
                <input
                  type="text"
                  value={config.studioName}
                  onChange={(e) => setConfig({ ...config, studioName: e.target.value })}
                  placeholder="Rizxstudio"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                  }`}
                />
              </div>
            </div>

            {/* Author & OG Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-400">Nama Pendiri / Kreator (Author)</label>
                <input
                  type="text"
                  value={config.authorName}
                  onChange={(e) => setConfig({ ...config, authorName: e.target.value })}
                  placeholder="FOMY R"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-400">URL Gambar OpenGraph (Social Share Image)</label>
                <input
                  type="text"
                  value={config.ogImage}
                  onChange={(e) => setConfig({ ...config, ogImage: e.target.value })}
                  placeholder="/og-image-square.png"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Console Verifications */}
        <div className={`p-6 rounded-2xl border space-y-5 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <RiShieldCheckLine className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold">2. Kode Verifikasi Search Console (Google & Bing)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-400">Google Search Console Verification Tag</label>
              <input
                type="text"
                value={config.googleVerification}
                onChange={(e) => {
                  let val = e.target.value.trim();
                  // Auto extract content if user pastes whole <meta ... content="..." />
                  const match = val.match(/content=["']([^"']+)["']/i);
                  if (match) val = match[1];
                  setConfig({ ...config, googleVerification: val });
                }}
                placeholder="Contoh: 3gmIFS0RsobGQ6..."
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Masukkan nilai atribut <code>content</code> dari tag <code>&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code>.
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-400">Bing Webmaster Tools Verification Tag</label>
              <input
                type="text"
                value={config.bingVerification}
                onChange={(e) => setConfig({ ...config, bingVerification: e.target.value })}
                placeholder="Contoh: 1234567890ABCDEF1234567890ABCDEF"
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Masukkan kode dari tag <code>&lt;meta name=&quot;msvalidate.01&quot; content=&quot;...&quot; /&gt;</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Data / Schema.org */}
        <div className={`p-6 rounded-2xl border space-y-5 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <RiCodeSSlashLine className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold">3. Data Terstruktur (Schema.org / JSON-LD Rich Snippet)</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={config.enableRichSnippets}
                onChange={(e) => setConfig({ ...config, enableRichSnippets: e.target.checked })}
                className="w-4 h-4 rounded text-primary"
              />
              <span>Aktifkan Rich Snippets</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-400">Nomor Telepon Studio (Schema telephone)</label>
              <input
                type="text"
                value={config.telephone}
                onChange={(e) => setConfig({ ...config, telephone: e.target.value })}
                placeholder="+6282381769146"
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-400">Kisaran Harga (Price Range)</label>
              <input
                type="text"
                value={config.priceRange}
                onChange={(e) => setConfig({ ...config, priceRange: e.target.value })}
                placeholder="$$$"
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Useful SEO Quick Links */}
        <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-white/10"}`}>
          <h2 className="text-sm font-bold mb-3">Tautan Cepat Pengujian SEO Google</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-white/10 hover:border-primary/50 transition-all flex items-center justify-between"
            >
              <span>Google Rich Results Test</span>
              <RiShareBoxLine className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="https://developers.facebook.com/tools/debug/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-white/10 hover:border-primary/50 transition-all flex items-center justify-between"
            >
              <span>Facebook / WhatsApp OG Debugger</span>
              <RiShareBoxLine className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-white/10 hover:border-primary/50 transition-all flex items-center justify-between"
            >
              <span>Buka Sitemap.xml Langsung</span>
              <RiShareBoxLine className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-white/10 hover:border-primary/50 transition-all flex items-center justify-between"
            >
              <span>Buka Robots.txt Langsung</span>
              <RiShareBoxLine className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <RiSave3Fill className="w-4 h-4" />
            <span>{saving ? "Menyimpan ke Cloud..." : "Simpan Semua Pengaturan SEO"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

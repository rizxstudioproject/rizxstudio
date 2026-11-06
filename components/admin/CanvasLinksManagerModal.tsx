"use client";

import React, { useState, useEffect } from "react";
import {
  RiCloseFill as HiXMark,
  RiAddFill as HiPlus,
  RiDeleteBinFill as HiTrash,
  RiExternalLinkFill as HiArrowTopRightOnSquare,
  RiCheckFill as HiCheck,
  RiRestartFill as HiArrowPath,
} from "react-icons/ri";
import {
  CanvasExternalLink,
  DEFAULT_CANVAS_LINKS,
  getCanvasExternalLinks,
  saveCanvasExternalLinks,
  fetchCanvasExternalLinksFromCloud,
  isFigmaUrl,
  normalizeCanvasUrl,
} from "@/lib/canvasLinksService";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

interface CanvasLinksManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function FigmaIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
        fill="#1ABCFE"
      />
      <path
        d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
        fill="#0ACF83"
      />
      <path
        d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
        fill="#FF7262"
      />
      <path
        d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
        fill="#F24E1E"
      />
      <path
        d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
        fill="#A259FF"
      />
    </svg>
  );
}

export default function CanvasLinksManagerModal({
  isOpen,
  onClose,
  onSaved,
}: CanvasLinksManagerModalProps) {
  const { themeMode } = useMotionTheme();
  const { tr } = useLang();
  const isLight = themeMode === "light";

  const [links, setLinks] = useState<CanvasExternalLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLinks(getCanvasExternalLinks());
      fetchCanvasExternalLinksFromCloud().then((cloudLinks) => {
        if (cloudLinks && cloudLinks.length > 0) {
          setLinks(cloudLinks);
        }
      });
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    const newId = `link-${Date.now()}`;
    const newLink: CanvasExternalLink = {
      id: newId,
      title: "Open in Figma",
      url: "https://www.figma.com/design/stiNMbWG9UP6MBMfYr4fma/Rizx-Project-Porfolio?node-id=1-2&t=7nXMV1klfGcwOZos-1",
      type: "figma",
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const handleUpdateLink = (id: string, updates: Partial<CanvasExternalLink>) => {
    setLinks((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const next = { ...l, ...updates };
          if (updates.url !== undefined) {
            next.type = isFigmaUrl(updates.url) ? "figma" : "website";
          }
          return next;
        }
        return l;
      })
    );
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleResetDefault = () => {
    setLinks(DEFAULT_CANVAS_LINKS);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCanvasExternalLinks(links);
      setSaveSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-[#14161d] border-white/10 text-white"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0d0f14]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
              <FigmaIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>{tr("Kelola Link Figma / Canvas", "Manage Figma / Canvas Links", "Atua Link Figma / Canvas")}</span>
              </h3>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                {tr(
                  "Link ini ditampilkan pada floating bar bawah Rizx Canvas (publik & studio).",
                  "These links are displayed on the Rizx Canvas bottom floating bar.",
                  "Link ko batampilan pado floating bar bawah Rizx Canvas."
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? "text-slate-400 hover:text-slate-700 hover:bg-slate-200" : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Links List */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {links.length === 0 ? (
            <div
              className={`p-8 text-center rounded-xl border border-dashed ${
                isLight ? "border-slate-300 text-slate-500" : "border-white/10 text-neutral-400"
              }`}
            >
              <p className="text-xs font-mono mb-2">
                {tr("Tidak ada link aktif saat ini.", "No active links right now.", "Indak ado link aktif kini ko.")}
              </p>
              <p className="text-[11px] opacity-75 mb-4">
                {tr(
                  "Jika kosong, tombol link pada bar canvas tidak akan ditampilkan.",
                  "When empty, the link button on the canvas bar will be hidden.",
                  "Kok kosong, tombol link pado bar canvas indak ka ditampilkan."
                )}
              </p>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3.5 py-1.5 rounded-lg bg-[#16b09f] hover:bg-[#119889] text-black font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <HiPlus className="w-3.5 h-3.5" />
                <span>{tr("Tambah Link Figma", "Add Figma Link", "Tambah Link Figma")}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link, idx) => {
                const isFigma = isFigmaUrl(link.url);

                return (
                  <div
                    key={link.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-neutral-900/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isLight ? "bg-teal-500/20 text-teal-700" : "bg-teal-500/15 text-teal-400"
                        }`}>
                          #{idx + 1}
                        </span>
                        {isFigma ? (
                          <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                            isLight ? "text-rose-600" : "text-rose-400"
                          }`}>
                            <FigmaIcon className="w-3.5 h-3.5" />
                            <span>Figma Design</span>
                          </div>
                        ) : (
                          <span className={`text-xs font-semibold ${
                            isLight ? "text-cyan-700" : "text-cyan-400"
                          }`}>
                            Web / External Link
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {link.url && (
                          <a
                            href={normalizeCanvasUrl(link.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={tr("Buka link di tab baru untuk tes", "Open link in new tab to test", "Buka link di tab baru")}
                            className={`p-1.5 rounded transition-colors ${
                              isLight
                                ? "text-slate-500 hover:text-cyan-600 hover:bg-slate-200"
                                : "text-neutral-400 hover:text-cyan-400 hover:bg-white/10"
                            }`}
                          >
                            <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          title={tr("Hapus Link Ini", "Delete This Link", "Hapuih Link Ko")}
                          className="p-1.5 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Title Input */}
                      <div>
                        <label className={`block text-[10px] font-mono mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                          {tr("Judul Tombol", "Button Label", "Judul Tombol")}
                        </label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                          placeholder="Open in Figma"
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-[#16b09f] selection:bg-[#16b09f] selection:text-black ${
                            isLight
                              ? "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                              : "bg-[#090b0e] border-white/10 text-white placeholder:text-neutral-500"
                          }`}
                        />
                      </div>

                      {/* URL Input */}
                      <div className="sm:col-span-2">
                        <label className={`block text-[10px] font-mono mb-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                          {tr("URL / Link Figma", "Figma / URL Link", "URL / Link Figma")}
                        </label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                          placeholder="https://www.figma.com/design/..."
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-[#16b09f] selection:bg-[#16b09f] selection:text-black ${
                            isLight
                              ? "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                              : "bg-[#090b0e] border-white/10 text-white placeholder:text-neutral-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddLink}
                className={`w-full py-2.5 rounded-xl border border-dashed flex items-center justify-center gap-1.5 text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isLight
                    ? "border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                    : "border-white/15 text-neutral-300 hover:text-white hover:border-[#16b09f]/50 hover:bg-[#16b09f]/5"
                }`}
              >
                <HiPlus className="w-3.5 h-3.5 text-[#16b09f]" />
                <span>{tr("+ Tambah Link Lain", "+ Add Another Link", "+ Tambah Link Lain")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 ${
            isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0d0f14]"
          }`}
        >
          <button
            type="button"
            onClick={handleResetDefault}
            title={tr("Kembalikan ke Link Figma Asli", "Reset to Original Figma Link", "Baliakan ka link samulo")}
            className={`text-[11px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer ${
              isLight ? "text-slate-500 hover:text-slate-900" : "text-neutral-400 hover:text-white"
            }`}
          >
            <HiArrowPath className="w-3 h-3" />
            <span>{tr("Reset Default", "Reset Default", "Reset Samulo")}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                isLight ? "text-slate-600 hover:bg-slate-200" : "text-neutral-400 hover:bg-white/10"
              }`}
            >
              {tr("Batal", "Cancel", "Batal")}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-[#16b09f] hover:bg-[#119889] disabled:opacity-50 text-black font-bold text-xs inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#16b09f]/20"
            >
              {saveSuccess ? (
                <>
                  <HiCheck className="w-3.5 h-3.5" />
                  <span>{tr("Tersimpan!", "Saved!", "Tapanuah!")}</span>
                </>
              ) : (
                <span>
                  {isSaving
                    ? tr("Menyimpan...", "Saving...", "Manyimpan...")
                    : tr("Simpan & Terapkan", "Save & Apply", "Simpan & Terapkan")}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

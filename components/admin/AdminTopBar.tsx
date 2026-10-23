"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  HiMagnifyingGlass,
  HiBell,
  HiArrowTopRightOnSquare,
  HiArrowRightOnRectangle,
  HiCheckCircle,
  HiCloud,
  HiBars3,
} from "react-icons/hi2";
import { useLang } from "@/context/LanguageContext";

interface AdminTopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onViewWebsite: () => void;
  onLogout: () => void;
  isCloudSyncActive?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function AdminTopBar({
  searchQuery,
  onSearchChange,
  onViewWebsite,
  onLogout,
  isCloudSyncActive = true,
  onToggleMobileMenu,
}: AdminTopBarProps) {
  const { lang, setLang } = useLang();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global ⌘K / Ctrl+K shortcut listener to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-14 shrink-0 bg-[#0c0e12] border-b border-white/5 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Menu Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            <HiBars3 className="w-4 h-4" />
          </button>
        )}

        <div className="relative w-full">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clients, folders, assets"
            className="w-full bg-[#12151a] hover:bg-[#161a20] focus:bg-[#161a20] border border-white/5 focus:border-[#14AF9E]/60 rounded-xl pl-9 pr-14 py-2 text-xs text-white placeholder-neutral-500 transition-all outline-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-white/10 text-[10px] font-mono text-neutral-400">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions: Notifications, View Website, Language, Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Notifications & Cloud Sync"
          >
            <HiBell className="w-4 h-4" />
            {isCloudSyncActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#14AF9E]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#12151a] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-white">System Status</span>
                <span className="text-[10px] font-mono text-[#14AF9E] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14AF9E] animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="mt-2.5 space-y-2 text-xs">
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                  <HiCheckCircle className="w-4 h-4 text-[#14AF9E] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-200 font-medium">Supabase Cloud Connected</p>
                    <p className="text-[10px] text-neutral-400">All portfolio assets & client changes are synced live.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.03]">
                  <HiCloud className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-200 font-medium">IndexedDB Backup Active</p>
                    <p className="text-[10px] text-neutral-400">Fast local frame caching enabled.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Website Button */}
        <button
          type="button"
          onClick={onViewWebsite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <span>View website</span>
          <HiArrowTopRightOnSquare className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* Language Switcher */}
        <div className="flex items-center p-0.5 rounded-xl bg-[#12151a] border border-white/10">
          <button
            type="button"
            onClick={() => setLang("id")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              lang === "id"
                ? "bg-[#14AF9E] text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              lang === "en"
                ? "bg-[#14AF9E] text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            EN
          </button>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Logout Admin"
        >
          <HiArrowRightOnRectangle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

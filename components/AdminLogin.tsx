"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiEye,
  HiEyeSlash,
  HiArrowRight,
  HiExclamationTriangle,
  HiLockClosed,
  HiArrowLeft,
} from "react-icons/hi2";

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const ADMIN_USER = "admin";
const ADMIN_PASS = "rizxstudio2026";

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((res) => setTimeout(res, 600));

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      try {
        sessionStorage.setItem("rizx_admin_session", "authenticated");
      } catch (_) {}
      onSuccess();
    } else {
      setError("Username atau password salah. Silakan coba kembali.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#080809] font-sans overflow-hidden relative">
      {/* Full-screen subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#14AF9E]/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-800/[0.04] blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-neutral-800/[0.15] blur-[80px]" />
      </div>

      {/* Centered Card: Split Layout (Form Left | Image Right) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-4xl mx-4 bg-[#0d0e12]/95 border border-white/[0.08] rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ minHeight: "520px" }}
      >
        {/* LEFT SIDE: Login Form */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 sm:py-12">
          {/* Logo + badge */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#14AF9E] to-cyan-600 flex items-center justify-center text-black font-black text-base shadow-[0_0_25px_rgba(20,175,158,0.5)]">
                RX
              </div>
              <div>
                <span className="text-white font-bold text-sm tracking-wide block">Rizx Studio</span>
                <span className="text-[11px] text-neutral-500 font-mono tracking-wider">rizxstudio.com</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1.5">
              Selamat datang, Admin.
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              Masuk untuk mengelola portfolio, upload karya, dan kelola konten website.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Username */}
            <div>
              <label className="block text-xs font-mono text-neutral-400 font-medium mb-1.5 tracking-wide">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="admin"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#14AF9E]/70 focus:bg-[#14AF9E]/[0.04] focus:ring-1 focus:ring-[#14AF9E]/30 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-neutral-400 font-medium tracking-wide">
                  PASSWORD
                </label>
                <span className="text-[10px] text-neutral-600 font-mono flex items-center gap-1">
                  <HiLockClosed className="w-3 h-3" />
                  Terenkripsi
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#14AF9E]/70 focus:bg-[#14AF9E]/[0.04] focus:ring-1 focus:ring-[#14AF9E]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono"
                >
                  <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group mt-2"
              style={{
                background: isLoading
                  ? "rgba(20,175,158,0.5)"
                  : "linear-gradient(135deg, #14AF9E 0%, #0cb8a5 50%, #07c4b0 100%)",
                boxShadow: "0 6px 30px rgba(20, 175, 158, 0.4)",
                color: "#000",
              }}
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Memverifikasi…</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer back link */}
          <div className="mt-8 pt-6 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-xs font-mono transition-colors cursor-pointer group"
            >
              <HiArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Website</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Cinematic Image Panel */}
        <div className="hidden md:flex relative w-[42%] shrink-0 overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/assets/antigravity/hero-large.jpg')`,
              filter: "brightness(0.55) saturate(0.7)",
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-[#14AF9E]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            {/* Live Sync badge */}
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/15 backdrop-blur-md w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14AF9E] animate-pulse" />
              <span className="text-[11px] font-mono text-[#14AF9E] font-semibold tracking-wider">ADMIN CONTROL PANEL</span>
            </div>

            <h2 className="text-xl font-bold text-white leading-snug mb-1.5">
              Rizx Studio CMS
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-[220px]">
              Kelola portfolio, upload karya, embed video YouTube, dan deskripsi brand secara real-time.
            </p>

            {/* Feature list */}
            <div className="mt-4 space-y-1.5">
              {[
                "Upload & kelola portofolio klien",
                "Embed video YouTube Flagship",
                "Edit deskripsi brand klien",
                "Buat & hapus folder klien",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#14AF9E] shrink-0" />
                  <span className="text-[11px] text-neutral-400 font-mono">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

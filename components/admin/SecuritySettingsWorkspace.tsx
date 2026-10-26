"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiShieldCheckFill,
  RiLockPasswordFill,
  RiKeyFill,
  RiUser3Fill,
  RiMailLine,
  RiEyeLine,
  RiEyeOffLine,
  RiFileCopyLine,
  RiCheckFill,
  RiSave3Fill,
  RiInformationFill,
  RiCloudLine,
  RiKeyboardLine,
  RiLogoutBoxRFill,
  RiTeamLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { getAdminCredentials, saveAdminCredentials, AdminCredentials } from "@/lib/adminAuth";
import AdminUsersManager from "./AdminUsersManager";

interface SecuritySettingsWorkspaceProps {
  showToast?: (msg: string) => void;
  onCredentialsUpdated?: (creds: AdminCredentials) => void;
  onLogout?: () => void;
  initialSection?: "team" | "credentials" | "all";
}

export default function SecuritySettingsWorkspace({
  showToast,
  onCredentialsUpdated,
  onLogout,
  initialSection = "all",
}: SecuritySettingsWorkspaceProps) {
  const { tr } = useLang();
  const { themeMode, primaryColor } = useMotionTheme();
  const isLight = themeMode === "light";

  const [activeSection, setActiveSection] = useState<"team" | "credentials" | "all">(
    initialSection
  );

  const [adminUser, setAdminUser] = useState("admin");
  const [adminEmail, setAdminEmail] = useState("rizxstudioproject@gmail.com");
  const [adminSecretKey, setAdminSecretKey] = useState("secret");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load existing credentials on mount
  useEffect(() => {
    getAdminCredentials().then((creds) => {
      if (creds.username) setAdminUser(creds.username);
      if (creds.email) setAdminEmail(creds.email);
      if (creds.secretParam) setAdminSecretKey(creds.secretParam);
    });
  }, []);

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    }
  };

  const fullSecretUrl = `https://rizxstudio.com/?login=${adminSecretKey || "secret"}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullSecretUrl);
      setCopiedLink(true);
      triggerToast(tr("Link URL login rahasia berhasil disalin!", "Secret login URL copied to clipboard!", "Link URL login rahasia disalin!"));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (_) {
      triggerToast("Gagal menyalin link.");
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      triggerToast(tr("Peringatan: Konfirmasi password tidak cocok!", "Warning: Password confirmation does not match!", "Paringatan: Konfirmasi password indak cocok!"));
      return;
    }

    if (newPassword && newPassword.length < 6) {
      triggerToast(tr("Peringatan: Password baru minimal 6 karakter!", "Warning: New password must be at least 6 characters!", "Paringatan: Password baru minimal 6 karakter!"));
      return;
    }

    setIsSaving(true);
    try {
      const currentCreds = await getAdminCredentials();
      const cleanSecret = adminSecretKey.trim().replace(/^[\?&]?(login=)?/, "") || "secret";
      const updated = await saveAdminCredentials({
        username: adminUser.trim() || "admin",
        email: adminEmail.trim() || "rizxstudioproject@gmail.com",
        secretParam: cleanSecret,
        adminUsers: currentCreds.adminUsers,
        ...(newPassword ? { password: newPassword.trim() } : {}),
      });

      setAdminSecretKey(cleanSecret);
      setNewPassword("");
      setConfirmPassword("");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      if (onCredentialsUpdated) {
        onCredentialsUpdated(updated);
      }

      triggerToast(tr("Pengaturan keamanan & akun berhasil disimpan ke Cloud!", "Security & account settings saved to Cloud!", "Pangaturan kaamanan & akun tasimpan ka Cloud!"));
    } catch (err) {
      console.error("Save credentials error:", err);
      triggerToast("Gagal menyimpan perubahan akun.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const onTriggerSave = () => {
      handleSave();
    };
    window.addEventListener("app:trigger-settings-save", onTriggerSave);
    return () => window.removeEventListener("app:trigger-settings-save", onTriggerSave);
  }, [adminUser, adminEmail, adminSecretKey, newPassword, confirmPassword]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="security-settings-workspace p-4 sm:p-6 space-y-6 max-w-4xl mx-auto"
    >
      {/* Header Explainer Card */}
      <div
        className={`p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden ${
          isLight
            ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-xs"
            : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10 shadow-lg"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <RiShieldCheckFill className="w-3.5 h-3.5" />
          </div>
          <span
            className={`text-[10px] font-mono tracking-widest uppercase font-bold ${
              isLight ? "text-teal-700" : "text-[#16b09f]"
            }`}
          >
            ADMIN SECURITY & CREDENTIALS
          </span>
        </div>

        <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {tr("Pengaturan Akun, Password & Akses Rahasia", "Account Settings, Password & Secret Access", "Pangaturan Akun, Password & Akses Rahasia")}
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
          {tr(
            "Kelola kredensial login Admin Panel, email pemulihan, dan parameter URL rahasia. Perubahan tersinkronisasi otomatis dengan database Supabase Cloud.",
            "Manage Admin Panel credentials, recovery email, and secret login parameter. Changes automatically sync with Supabase Cloud database.",
            "Kelola kredensial login Admin Panel, email pemulihan, jo parameter URL rahasia. Perubahan otomatis basinkron jo database Supabase Cloud."
          )}
        </p>
      </div>

      {/* Sub-tab Navigation (Memudahkan Akses Langsung di Mobile & Desktop) */}
      <div className={`flex items-center p-1 rounded-2xl border ${isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"}`}>
        <button
          type="button"
          onClick={() => setActiveSection("all")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeSection === "all"
              ? isLight ? "bg-white text-slate-900 shadow-xs font-extrabold" : "bg-white/15 text-white shadow-xs font-extrabold"
              : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
          }`}
        >
          {tr("Semua", "All", "Kasadonyo")}
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("team")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === "team"
              ? isLight ? "bg-white text-teal-700 shadow-xs font-extrabold" : "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs font-extrabold"
              : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
          }`}
        >
          <RiTeamLine className="w-3.5 h-3.5 text-teal-400" />
          <span>{tr("Kelola Akun Admin", "Admin Accounts", "Kelola Akun Admin")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("credentials")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === "credentials"
              ? isLight ? "bg-white text-slate-900 shadow-xs font-extrabold" : "bg-white/15 text-white shadow-xs font-extrabold"
              : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
          }`}
        >
          <RiKeyFill className="w-3.5 h-3.5 text-amber-400" />
          <span>{tr("Password & URL", "Password & URL", "Password & URL")}</span>
        </button>
      </div>

      {/* Multi-User Admin Team Management (Tampil di atas ketika tab team aktif) */}
      {activeSection === "team" && (
        <div className="w-full">
          <AdminUsersManager showToast={showToast} />
        </div>
      )}

      {/* Kredensial & Info Akses Grid */}
      {(activeSection === "credentials" || activeSection === "all") && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form Kolom Kiri */}
        <div
          className={`lg:col-span-7 border rounded-2xl p-5 backdrop-blur-sm ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-neutral-900/60 border-white/10"
          }`}
        >
          <form onSubmit={handleSave} className="space-y-4">
            {/* 1. Username Admin */}
            <div>
              <label
                className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${
                  isLight ? "text-slate-700 font-semibold" : "text-neutral-300"
                }`}
              >
                {tr("USERNAME ADMIN", "ADMIN USERNAME", "USERNAME ADMIN")} <span className="text-[#16b09f]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-xs sm:text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                      : "bg-neutral-950 border-white/15 text-white"
                  }`}
                />
                <RiUser3Fill
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isLight ? "text-slate-400" : "text-neutral-500"
                  }`}
                />
              </div>
              <span className={`text-[10px] font-mono mt-1 block ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                {tr("Nama akun yang digunakan untuk masuk ke panel admin.", "Account username used to log into the admin dashboard.", "Namo akun untuak masuak ka dasbor admin.")}
              </span>
            </div>

            {/* 2. Recovery Email */}
            <div>
              <label
                className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${
                  isLight ? "text-slate-700 font-semibold" : "text-neutral-300"
                }`}
              >
                {tr("EMAIL PEMULIHAN / VERIFIKASI", "RECOVERY / VERIFICATION EMAIL", "EMAIL PAMULIAHAN")} <span className="text-[#16b09f]">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="rizxstudioproject@gmail.com"
                  className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-xs sm:text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                      : "bg-neutral-950 border-white/15 text-white"
                  }`}
                />
                <RiMailLine
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isLight ? "text-slate-400" : "text-neutral-500"
                  }`}
                />
              </div>
              <span className={`text-[10px] font-mono mt-1 block ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                {tr("Alamat email penerima kode OTP pemulihan jika lupa kata sandi.", "Email address for OTP password recovery codes.", "Alamaik email panarimo kode OTP jikok lupo password.")}
              </span>
            </div>

            {/* 3. Parameter URL Rahasia */}
            <div className={`pt-3 border-t ${isLight ? "border-slate-100" : "border-white/10"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`block text-xs font-mono font-medium tracking-wide ${
                    isLight ? "text-slate-700 font-semibold" : "text-neutral-300"
                  }`}
                >
                  {tr("KATA KUNCI URL RAHASIA", "SECRET URL PARAMETER", "KATA KUNCI URL RAHASIA")} <span className="text-[#16b09f]">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isLight
                      ? "bg-teal-50 border-teal-200 text-teal-700 font-bold"
                      : "bg-[#16b09f]/10 border-[#16b09f]/30 text-[#16b09f]"
                  }`}
                >
                  ?login={adminSecretKey || "secret"}
                </span>
              </div>
              <div
                className={`relative flex rounded-xl border focus-within:border-[#16b09f] focus-within:ring-1 focus-within:ring-[#16b09f] transition-all overflow-hidden ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-950 border-white/15"
                }`}
              >
                <span
                  className={`inline-flex items-center px-3 border-r font-mono text-[11px] sm:text-xs select-none ${
                    isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-neutral-400"
                  }`}
                >
                  ?login=
                </span>
                <input
                  type="text"
                  value={adminSecretKey}
                  onChange={(e) => {
                    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                    setAdminSecretKey(clean);
                  }}
                  placeholder="secret"
                  className={`flex-1 px-3 py-2.5 bg-transparent font-bold text-xs sm:text-sm font-mono focus:outline-none ${
                    isLight ? "text-teal-700 placeholder:text-slate-400" : "text-[#16b09f] placeholder:text-neutral-600"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between gap-2 mt-1.5">
                <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  {tr("Hanya Anda yang tahu kata kunci URL ini.", "Only you know this secret access key.", "Hanyo Sanak nan tahu kato kunci URL ko.")}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    copiedLink
                      ? "text-emerald-400"
                      : isLight
                      ? "text-teal-700 hover:text-teal-800"
                      : "text-cyan-400 hover:text-cyan-300"
                  }`}
                >
                  {copiedLink ? <RiCheckFill className="w-3.5 h-3.5" /> : <RiFileCopyLine className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? tr("Tersalin!", "Copied!", "Tasalin!") : tr("Salin Link URL", "Copy Link", "Salin Link")}</span>
                </button>
              </div>
            </div>

            {/* 4. Ganti Password Baru */}
            <div className={`pt-3 border-t ${isLight ? "border-slate-100" : "border-white/10"}`}>
              <label
                className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${
                  isLight ? "text-slate-700 font-semibold" : "text-neutral-300"
                }`}
              >
                {tr("GANTI PASSWORD BARU (OPSIONAL)", "CHANGE PASSWORD (OPTIONAL)", "GANTI PASSWORD BARU (OPSIONAL)")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={tr("Kosongkan jika tidak ingin mengubah password", "Leave blank to keep current password", "Kosongan jikok indak nio mangganti password")}
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-xs sm:text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                      : "bg-neutral-950 border-white/15 text-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer p-1 ${
                    isLight ? "text-slate-400 hover:text-slate-700" : "text-neutral-500 hover:text-white"
                  }`}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 5. Konfirmasi Password Baru */}
            {newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.15 }}
              >
                <label
                  className={`block text-xs font-mono font-medium mb-1.5 tracking-wide ${
                    isLight ? "text-slate-700 font-semibold" : "text-neutral-300"
                  }`}
                >
                  {tr("KONFIRMASI PASSWORD BARU", "CONFIRM NEW PASSWORD", "KONFIRMASI PASSWORD BARU")} <span className="text-[#16b09f]">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={tr("Ulangi password baru yang sama", "Repeat the same password", "Ulangi password baru")}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:ring-1 focus:ring-[#16b09f] transition-all ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                      : "bg-neutral-950 border-white/15 text-white"
                  }`}
                />
              </motion.div>
            )}


          </form>
        </div>

        {/* Kolom Kanan: Info & Panduan Keamanan */}
        <div className="lg:col-span-5 space-y-3.5">
          <div
            className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-sm space-y-3.5 ${
              isLight ? "bg-white border-slate-200 shadow-xs" : "bg-neutral-900/60 border-white/10"
            }`}
          >
            <div
              className={`flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider ${
                isLight ? "text-teal-700" : "text-cyan-400"
              }`}
            >
              <RiInformationFill className="w-4 h-4" />
              <span>{tr("Panduan Akses & Keamanan", "Security & Access Guide", "Panduan Akses & Kaamanan")}</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono leading-relaxed">
              {/* URL Akses Rahasia */}
              <div
                className={`p-3 rounded-xl border space-y-1.5 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-semibold ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                    {tr("URL Akses Rahasia Saat Ini", "Active Secret URL", "URL Akses Rahasia")}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`text-[10px] underline font-bold cursor-pointer ${
                      isLight ? "text-teal-700 hover:text-teal-800" : "text-cyan-400 hover:text-cyan-300"
                    }`}
                  >
                    {copiedLink ? tr("Tersalin ✓", "Copied ✓", "Tasalin ✓") : tr("Salin 📋", "Copy 📋", "Salin 📋")}
                  </button>
                </div>
                <span
                  className={`font-bold block break-all text-xs ${
                    isLight ? "text-teal-700" : "text-[#16b09f]"
                  }`}
                >
                  {fullSecretUrl}
                </span>
              </div>

              {/* Email Verifikasi */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/5"
                }`}
              >
                <span className={`text-[10px] uppercase block font-semibold ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  {tr("Email Pemulihan", "Recovery Email", "Email Pamuliahan")}
                </span>
                <span className={`font-bold block break-all ${isLight ? "text-slate-900" : "text-white"}`}>
                  {adminEmail || "rizxstudioproject@gmail.com"}
                </span>
              </div>

              {/* Shortcut Keyboard */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/5"
                }`}
              >
                <span className={`text-[10px] uppercase block font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  <RiKeyboardLine className="w-3.5 h-3.5" />
                  <span>{tr("Shortcut Keyboard Cepat", "Quick Keyboard Shortcut", "Shortcut Keyboard Capek")}</span>
                </span>
                <span className={`block text-[11px] ${isLight ? "text-slate-700 font-medium" : "text-white"}`}>
                  {tr("Tekan", "Press", "Takan")}{" "}
                  <kbd
                    className={`px-1.5 py-0.5 rounded font-bold border text-[10px] ${
                      isLight ? "bg-slate-200 border-slate-300 text-teal-800" : "bg-white/10 border-white/20 text-cyan-400"
                    }`}
                  >
                    Ctrl + Shift + A
                  </kbd>{" "}
                  {tr("dari halaman utama website.", "from anywhere on the website.", "dari barando web.")}
                </span>
              </div>

              {/* Cloud Sync Status */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/5"
                }`}
              >
                <span className={`text-[10px] uppercase block font-semibold flex items-center gap-1.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  <RiCloudLine className="w-3.5 h-3.5" />
                  <span>{tr("Sinkronisasi Cloud", "Cloud Sync", "Sinkronisasi Cloud")}</span>
                </span>
                <span className={`block font-semibold flex items-center gap-1.5 text-[11px] ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Supabase Database Aktif & Terhubung</span>
                </span>
              </div>

              {/* Logout Session Action Card (Sesuai Permintaan: Logout berada di dalam Icon Setting) */}
              {onLogout && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 mt-2 transition-all ${
                    isLight
                      ? "bg-rose-50/80 border-rose-200/90 shadow-xs"
                      : "bg-rose-500/10 border-rose-500/25"
                  }`}
                >
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                    <RiLogoutBoxRFill className="w-4 h-4" />
                    <span>{tr("Keluar Sesi Admin", "Logout Admin Session", "Kalua Sesi Admin")}</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    {tr(
                      "Akhiri sesi login aman dan kunci akses dashboard admin.",
                      "End your secure admin session and lock dashboard access.",
                      "Sudahi sesi login dan kunci akses dashboard admin."
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RiLogoutBoxRFill className="w-4 h-4" />
                    <span>{tr("Keluar Sekarang (Logout)", "Logout Now", "Kalua Kini")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Multi-User Admin Team Management (Tampil di bawah ketika tab 'all' aktif) */}
      {activeSection === "all" && (
        <div className="w-full">
          <AdminUsersManager showToast={showToast} />
        </div>
      )}
    </motion.div>
  );
}

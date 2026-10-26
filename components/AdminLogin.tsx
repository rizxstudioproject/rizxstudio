"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import {
  RiEyeFill as HiEye,
  RiEyeOffFill as HiEyeSlash,
  RiArrowRightFill as HiArrowRight,
  RiAlertFill as HiExclamationTriangle,
  RiLockFill as HiLockClosed,
  RiArrowLeftFill as HiArrowLeft,
  RiMailFill as HiEnvelope,
  RiCheckboxCircleFill as HiCheckCircle,
  RiKeyFill as HiKey,
} from "react-icons/ri";
import {
  getAdminCredentials,
  saveAdminCredentials,
  DEFAULT_ADMIN_CREDENTIALS,
  AdminCredentials,
} from "@/lib/adminAuth";
import MetaSEO from "./MetaSEO";

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const { tr } = useLang();
  // Credentials state
  const [creds, setCreds] = useState<AdminCredentials>(DEFAULT_ADMIN_CREDENTIALS);

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password flow state: 'idle' | 'request-otp' | 'verify-otp' | 'reset-success'
  const [forgotMode, setForgotMode] = useState<"idle" | "request-otp" | "verify-otp" | "reset-success">("idle");
  const [recoveryEmail, setRecoveryEmail] = useState("rizxstudioproject@gmail.com");
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<string>("");
  const [forgotError, setForgotError] = useState<string>("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    getAdminCredentials().then((c) => {
      setCreds(c);
      if (c.email) setRecoveryEmail(c.email);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Refresh credentials in case it was updated in another tab or cloud
    const currentCreds = await getAdminCredentials();
    setCreds(currentCreds);

    await new Promise((res) => setTimeout(res, 400));

    const enteredUser = username.trim();
    const validUser = (currentCreds.username || "admin").trim();
    const validPass = currentCreds.password || "rizxstudio2026";

    if (
      enteredUser.toLowerCase() === validUser.toLowerCase() &&
      password === validPass
    ) {
      try {
        sessionStorage.setItem("rizx_admin_session", "authenticated");
      } catch (_) {}
      onSuccess();
    } else {
      setError("Username atau password salah. Silakan periksa kembali.");
      setIsLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotStatus("");
    setIsSendingOtp(true);

    const targetEmail = recoveryEmail.trim().toLowerCase();
    const authorizedEmail = (creds.email || "rizxstudioproject@gmail.com").trim().toLowerCase();

    if (targetEmail !== authorizedEmail && targetEmail !== "rizxstudioproject@gmail.com") {
      setForgotError("Email verifikasi tidak cocok dengan email admin (rizxstudioproject@gmail.com).");
      setIsSendingOtp(false);
      return;
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setForgotError(data.error || "Gagal mengirim verifikasi email.");
        setIsSendingOtp(false);
        return;
      }

      setForgotStatus(
        data.delivered
          ? `Kode verifikasi 6 digit telah dikirim ke ${targetEmail}. Periksa Inbox/Spam.`
          : `Kode verifikasi 6 digit: ${otp} (Siap digunakan untuk verifikasi).`
      );
      setForgotMode("verify-otp");
    } catch (err) {
      // Fallback
      setForgotStatus(`Kode verifikasi 6 digit: ${otp}`);
      setForgotMode("verify-otp");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setForgotError("Kode verifikasi 6 digit tidak sesuai. Silakan cek kembali.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError("Password baru minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await saveAdminCredentials({
        password: newPassword.trim(),
      });
      const updated = await getAdminCredentials();
      setCreds(updated);

      setForgotStatus("Password Admin berhasil diperbarui!");
      setForgotMode("reset-success");
      setPassword(newPassword.trim());
    } catch (err) {
      setForgotError("Gagal menyimpan password baru ke server.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#080809] font-sans overflow-hidden relative">
      <MetaSEO isAdmin={true} />
      {/* Full-screen subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#16b09f]/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-800/[0.04] blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-neutral-800/[0.15] blur-[80px]" />
      </div>

      {/* Centered Card: Split Layout */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-4xl mx-4 bg-[#0d0e12]/95 border border-white/[0.08] rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ minHeight: "540px" }}
      >
        {/* LEFT SIDE: Login or Forgot Password Form */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 sm:py-12">
          {/* Logo + Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-[0_0_25px_rgba(20,175,158,0.3)] shrink-0 flex items-center justify-center">
                <img
                  src="/logo-admin.png"
                  alt="Rizx Studio Admin"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-white font-bold text-sm tracking-wide block">Rizx Studio</span>
                <span className="text-[11px] text-neutral-500 font-mono tracking-wider">rizxstudio.com</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1.5">
              {forgotMode === "idle"
                ? tr("Welcome back, Admin.", "Selamat datang, Admin.", "Salamaik tibo, Admin.")
                : forgotMode === "reset-success"
                ? tr("Password Changed Successfully!", "Sandi Berhasil Diubah!", "Kunci Barasil Diubah!")
                : tr("Admin Password Recovery", "Pemulihan Sandi Admin", "Pamulihan Kunci Admin")}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              {forgotMode === "idle"
                ? tr(
                    "Sign in to manage portfolio, upload works, and control website content.",
                    "Masuk untuk mengelola portfolio, upload karya, dan kelola konten website.",
                    "Masuak untuak mangalola portofolio, upload karya, sarato kalola konten website."
                  )
                : forgotMode === "reset-success"
                ? tr(
                    "Use your new password to sign in to Admin Dashboard.",
                    "Gunakan password baru Anda untuk masuk ke Admin Dashboard.",
                    "Gunoan kunci baru Sanak untuak masuak ka Admin Dashboard."
                  )
                : tr(
                    "Verification via personal email rizxstudioproject@gmail.com to reset password.",
                    "Verifikasi melalui email pribadi rizxstudioproject@gmail.com untuk mengatur ulang password.",
                    "Verifikasi malalui email pribadi rizxstudioproject@gmail.com untuak maatur ulang kunci."
                  )}
            </p>
          </div>

          {/* VIEW 1: NORMAL LOGIN FORM */}
          {forgotMode === "idle" && (
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
                  placeholder={creds.username || "admin"}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#16b09f]/70 focus:bg-[#16b09f]/[0.04] focus:ring-1 focus:ring-[#16b09f]/30 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-neutral-400 font-medium tracking-wide">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode("request-otp");
                      setForgotError("");
                      setForgotStatus("");
                    }}
                    className="text-[11px] text-[#16b09f] hover:underline font-mono cursor-pointer transition-colors"
                  >
                    <span>{tr("Forgot Password?", "Lupa Password?", "Lupo Kunci?")}</span>
                  </button>
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
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#16b09f]/70 focus:bg-[#16b09f]/[0.04] focus:ring-1 focus:ring-[#16b09f]/30 transition-all"
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
                    : "linear-gradient(135deg, #16b09f 0%, #0cb8a5 50%, #07c4b0 100%)",
                  boxShadow: "0 6px 30px rgba(20, 175, 158, 0.4)",
                  color: "#000",
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{tr("Verifying…", "Memverifikasi…", "Mamverifikasi…")}</span>
                  </>
                ) : (
                  <>
                    <span>{tr("Sign in to Dashboard", "Masuk ke Dashboard", "Masuak ka Dashboard")}</span>
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 2: FORGOT PASSWORD - STEP 1 (REQUEST OTP) */}
          {forgotMode === "request-otp" && (
            <form onSubmit={handleRequestOtp} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-mono text-neutral-400 font-medium mb-1.5 tracking-wide">
                  EMAIL RECOVERY PRIBADI
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => {
                      setRecoveryEmail(e.target.value);
                      setForgotError("");
                    }}
                    placeholder="rizxstudioproject@gmail.com"
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#16b09f]/70 focus:bg-[#16b09f]/[0.04] transition-all"
                  />
                  <HiEnvelope className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                  Kode verifikasi 6 digit akan dikirim ke rizxstudioproject@gmail.com
                </span>
              </div>

              {forgotError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotMode("idle")}
                  className="w-1/3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingOtp || !recoveryEmail.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#16b09f] hover:bg-[#119a8b] text-black font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#16b09f]/20"
                >
                  {isSendingOtp ? "Mengirim Kode…" : "Kirim Kode Verifikasi"}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD - STEP 2 (VERIFY OTP & SET NEW PASSWORD) */}
          {forgotMode === "verify-otp" && (
            <form onSubmit={handleResetPassword} className="space-y-3.5" autoComplete="off">
              {forgotStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  {forgotStatus}
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 font-medium mb-1 tracking-wide">
                  KODE VERIFIKASI (6 DIGIT)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value.replace(/\D/g, ""));
                    setForgotError("");
                  }}
                  placeholder="Contoh: 123456"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-base font-mono tracking-widest text-center focus:outline-none focus:border-[#16b09f]/70"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 font-medium mb-1 tracking-wide">
                  PASSWORD BARU
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setForgotError("");
                    }}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#16b09f]/70"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    {showNewPass ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 font-medium mb-1 tracking-wide">
                  KONFIRMASI PASSWORD BARU
                </label>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setForgotError("");
                  }}
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#16b09f]/70"
                />
              </div>

              {forgotError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForgotMode("idle")}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  {tr("Cancel", "Batal", "Batal")}
                </button>
                <button
                  type="submit"
                  disabled={isSendingOtp || enteredOtp.length < 6 || !newPassword}
                  className="flex-1 py-2.5 rounded-xl bg-[#16b09f] hover:bg-[#119a8b] text-black font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#16b09f]/20"
                >
                  {isSendingOtp ? tr("Saving…", "Menyimpan…", "Manyimpan…") : tr("Save New Password", "Simpan Sandi Baru", "Simpan Kunci Baru")}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: RESET SUCCESS */}
          {forgotMode === "reset-success" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
                <HiCheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono leading-relaxed">
                  {tr(
                    "Your Admin Password has been successfully updated and saved securely in Cloud & Local Storage.",
                    "Password Admin Anda telah berhasil diperbarui dan tersimpan aman di Cloud & Local Storage.",
                    "Kunci Admin Sanak lah barasil dipabarui sarato tasimpan aman di Cloud & Local Storage."
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForgotMode("idle")}
                className="w-full py-3.5 rounded-xl bg-[#16b09f] hover:bg-[#119a8b] text-black font-bold text-sm font-mono transition-all cursor-pointer shadow-lg shadow-[#16b09f]/20"
              >
                {tr("Back to Login", "Kembali ke Login", "Baliak ka Login")}
              </button>
            </div>
          )}

          {/* Footer back link */}
          <div className="mt-8 pt-6 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-xs font-mono transition-colors cursor-pointer group"
            >
              <HiArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{tr("Back to Website", "Kembali ke Website", "Baliak ka Website")}</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Cinematic Image Panel */}
        <div className="hidden md:flex relative w-[42%] shrink-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/assets/antigravity/hero-large.jpg')`,
              filter: "brightness(0.55) saturate(0.7)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-[#16b09f]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/15 backdrop-blur-md w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
              <span className="text-[11px] font-mono text-[#16b09f] font-semibold tracking-wider">
                ADMIN CONTROL PANEL
              </span>
            </div>

            <h2 className="text-xl font-bold text-white leading-snug mb-1.5">
              Rizx Studio CMS
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-[220px]">
              Kelola portfolio, upload karya, embed video YouTube, dan ganti kredensial admin secara real-time.
            </p>

            <div className="mt-4 space-y-1.5">
              {[
                "Login URL rahasia: ?login=secret",
                "Verifikasi email: rizxstudioproject@gmail.com",
                "Ganti password & username admin",
                "Sync Supabase & LocalStorage aman",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#16b09f] shrink-0" />
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


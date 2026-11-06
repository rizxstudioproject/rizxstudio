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
  RiFingerprint2Line,
} from "react-icons/ri";
import {
  getAdminCredentials,
  saveAdminCredentials,
  DEFAULT_ADMIN_CREDENTIALS,
  AdminCredentials,
  authenticateAdminUser,
  updateAdminUser,
  setActiveAdminUser,
  getUserBiometricsMap,
} from "@/lib/adminAuth";
import MetaSEO from "./MetaSEO";

function FaceIdIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 17V12a4 4 0 0 1 4-4h5" />
      <path d="M40 17V12a4 4 0 0 0-4-4h-5" />
      <path d="M8 31v5a4 4 0 0 0 4 4h5" />
      <path d="M40 31v5a4 4 0 0 1-4 4h-5" />
      <circle cx="18" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="30" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <path d="M24 19v6a1.5 1.5 0 0 0 1.5 1.5" />
      <path d="M18 31a8 8 0 0 0 12 0" />
    </svg>
  );
}

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const { tr } = useLang();

  // Mobile splash/welcome screen state: 'splash' | 'welcome' | 'form'
  const [mobileScreen, setMobileScreen] = useState<"splash" | "welcome" | "form">("splash");
  const [isMobile, setIsMobile] = useState(false);

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

  // Biometric (WebAuthn) state
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  useEffect(() => {
    getAdminCredentials().then((c) => {
      setCreds(c);
      if (c.email) setRecoveryEmail(c.email);
    });
  }, []);

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) return;
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsBiometricAvailable(available);
        const credId = localStorage.getItem("rizx_biometric_credId");
        const map = getUserBiometricsMap();
        const hasEnrolled = !!credId || Object.keys(map).length > 0;
        setIsBiometricRegistered(hasEnrolled);
      } catch (_) {}
    };
    checkBiometric();
  }, []);

  // Check mobile device size on mount & resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile splash screen auto-transition to welcome screen
  useEffect(() => {
    if (mobileScreen === "splash") {
      const timer = setTimeout(() => {
        setMobileScreen("welcome");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mobileScreen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Refresh credentials in case it was updated in another tab or cloud
    const currentCreds = await getAdminCredentials();
    setCreds(currentCreds);

    await new Promise((res) => setTimeout(res, 400));

    const authResult = await authenticateAdminUser(username, password);
    if (authResult.success && authResult.user) {
      try {
        sessionStorage.setItem("rizx_admin_session", "authenticated");
        setActiveAdminUser(authResult.user);
      } catch (_) {}
      onSuccess();
    } else {
      setError(authResult.error || "Username atau password salah. Silakan periksa kembali.");
      setIsLoading(false);
    }
  };

  // Biometric: Register (first time setup)
  const handleRegisterBiometric = async () => {
    setIsBiometricLoading(true);
    setBiometricError("");
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Rizx Studio Admin", id: window.location.hostname },
          user: { id: userId, name: "admin", displayName: "Rizx Admin" },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;
      if (credential) {
        const rawIdBytes = new Uint8Array(credential.rawId);
        let binary = "";
        rawIdBytes.forEach((b) => { binary += String.fromCharCode(b); });
        const credId = btoa(binary);
        localStorage.setItem("rizx_biometric_credId", credId);
        setIsBiometricRegistered(true);
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name !== "NotAllowedError") {
        setBiometricError(
          e?.message || tr("Biometric setup failed.", "Gagal mengaktifkan biometrik.", "Gagal maaktifkan biometrik.")
        );
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // Biometric: Authenticate (supports 1 user 1 biometric / multi-user)
  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    setBiometricError("");
    setError("");
    try {
      const biometricsMap = getUserBiometricsMap();
      const records = Object.values(biometricsMap);
      const fallbackCredId = localStorage.getItem("rizx_biometric_credId");

      if (records.length === 0 && !fallbackCredId) {
        setBiometricError(
          tr(
            "Biometric not set up yet.",
            "Biometrik belum diaktifkan.",
            "Biometrik alun diaktifkan."
          )
        );
        return;
      }

      const allowCredentials: PublicKeyCredentialDescriptor[] = [];
      const credIdToUserId: Record<string, string> = {};

      records.forEach((r) => {
        try {
          const rawId = Uint8Array.from(atob(r.credId), (c) => c.charCodeAt(0));
          allowCredentials.push({ id: rawId, type: "public-key" });
          credIdToUserId[r.credId] = r.userId;
        } catch (_) {}
      });

      if (fallbackCredId && allowCredentials.length === 0) {
        try {
          const rawId = Uint8Array.from(atob(fallbackCredId), (c) => c.charCodeAt(0));
          allowCredentials.push({ id: rawId, type: "public-key" });
        } catch (_) {}
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          allowCredentials,
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (assertion) {
        const rawIdBytes = new Uint8Array(assertion.rawId);
        let binary = "";
        rawIdBytes.forEach((b) => {
          binary += String.fromCharCode(b);
        });
        const matchedCredId = btoa(binary);

        const currentCreds = await getAdminCredentials();
        const allUsers =
          currentCreds.adminUsers && currentCreds.adminUsers.length > 0
            ? currentCreds.adminUsers
            : [
                {
                  id: "admin-root",
                  username: currentCreds.username,
                  email: currentCreds.email,
                  password: currentCreds.password,
                  role: "admin" as const,
                },
              ];

        // Find which exact user's biometric matched
        const matchedUserId = credIdToUserId[matchedCredId];
        let adminUser = allUsers.find(
          (u) =>
            (matchedUserId && u.id === matchedUserId) ||
            u.biometricCredId === matchedCredId ||
            biometricsMap[u.id]?.credId === matchedCredId
        );

        if (!adminUser) {
          adminUser = allUsers[0];
        }

        sessionStorage.setItem("rizx_admin_session", "authenticated");
        setActiveAdminUser(adminUser);
        onSuccess();
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name !== "NotAllowedError") {
        setBiometricError(
          e?.message ||
            tr(
              "Biometric auth failed. Try password.",
              "Autentikasi biometrik gagal. Coba password.",
              "Autentikasi biometrik gagal. Coba password."
            )
        );
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotStatus("");
    setIsSendingOtp(true);

    const targetEmail = recoveryEmail.trim().toLowerCase();
    const allUsers = creds.adminUsers && creds.adminUsers.length > 0
      ? creds.adminUsers
      : [{ id: "admin-root", username: creds.username, email: creds.email, password: creds.password }];

    const matchedUser = allUsers.find(
      (u) => (u.email || "").trim().toLowerCase() === targetEmail
    );
    const isRootMatch =
      targetEmail === (creds.email || "rizxstudioproject@gmail.com").trim().toLowerCase() ||
      targetEmail === "rizxstudioproject@gmail.com";

    if (!matchedUser && !isRootMatch) {
      setForgotError("Email verifikasi tidak terdaftar pada akun admin.");
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
      const targetEmail = recoveryEmail.trim().toLowerCase();
      const allUsers = creds.adminUsers && creds.adminUsers.length > 0
        ? creds.adminUsers
        : [{ id: "admin-root", username: creds.username, email: creds.email, password: creds.password }];

      const matchedUser = allUsers.find(
        (u) => (u.email || "").trim().toLowerCase() === targetEmail
      );

      if (matchedUser) {
        await updateAdminUser(matchedUser.id, { password: newPassword.trim() });
      } else {
        await saveAdminCredentials({ password: newPassword.trim() });
      }

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

      {/* ================= MOBILE VIEW (Matching Banking App Mockup with Tosca Brand) ================= */}
      <div className="md:hidden fixed inset-0 z-30 w-full h-full bg-[#f8fafc] text-slate-800 flex flex-col overflow-hidden font-sans">
        <AnimatePresence mode="wait">
          {/* SCREEN 1: SPLASH SCREEN (Tosca Rizx Studio Logo) */}
          {mobileScreen === "splash" && (
            <motion.div
              key="mobile-splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              onClick={() => setMobileScreen("welcome")}
              className="w-full h-full flex-1 flex flex-col items-center justify-center p-6 cursor-pointer select-none bg-white relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute w-72 h-72 rounded-full bg-[#16b09f]/10 blur-3xl pointer-events-none" />

              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center relative z-10"
              >
                {/* Logo with Tosca glowing accent */}
                <div className="w-24 h-24 rounded-3xl p-3 bg-gradient-to-br from-teal-50 to-teal-100/70 border border-[#16b09f]/30 shadow-[0_12px_40px_rgba(20,175,158,0.25)] flex items-center justify-center">
                  <img
                    src="/logo-admin.png"
                    alt="Rizx Studio"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>

                <h1 className="mt-5 text-2xl font-black tracking-tight text-[#16b09f] font-sans">
                  RIZX STUDIO
                </h1>
                <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
                  ADMIN PORTAL
                </span>

                {/* Pulse dot */}
                <div className="mt-8 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16b09f] animate-ping" />
                  <span className="text-xs font-mono text-teal-600 font-medium">
                    {tr("Starting...", "Memuat...", "Mamuat...")}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* SCREEN 2: WELCOME SCREEN (Biometric Login with Tosca Header) */}
          {mobileScreen === "welcome" && (
            <motion.div
              key="mobile-welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full flex-1 flex flex-col justify-between overflow-y-auto bg-white"
            >
              {/* Curved Tosca Header */}
              <div className="relative w-full bg-gradient-to-br from-[#0d9488] via-[#14b8a6] to-[#16b09f] pt-14 pb-12 px-6 rounded-b-[40px] shadow-[0_14px_35px_rgba(20,175,158,0.28)] text-center text-white overflow-hidden shrink-0">
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/10 blur-lg pointer-events-none" />

                <h1 className="text-2xl font-black tracking-tight relative z-10">
                  {tr("Welcome Back!", "Selamat Datang!", "Salamaik Tibo!")}
                </h1>
                <p className="text-xs text-teal-50 font-medium tracking-wide mt-1.5 opacity-90 relative z-10 font-mono">
                  {tr("Fast and Secure Login", "Login Cepat dan Aman", "Login Capek jo Aman")}
                </p>
              </div>

              {/* Center Biometric Actions */}
              <div className="flex-1 flex flex-col items-center justify-center py-8 px-6 gap-6">
                {/* Face ID Icon Button */}
                <button
                  type="button"
                  onClick={isBiometricRegistered ? handleBiometricLogin : handleRegisterBiometric}
                  disabled={isBiometricLoading}
                  className={`p-5 rounded-3xl bg-slate-50 border border-slate-200/90 text-[#16b09f] shadow-[0_6px_25px_rgba(20,175,158,0.12)] hover:bg-teal-50 hover:border-teal-200 active:scale-95 transition-all group cursor-pointer relative ${
                    isBiometricLoading ? "opacity-75 animate-pulse ring-4 ring-[#16b09f]/30" : ""
                  }`}
                  aria-label="Login with Face ID"
                >
                  <FaceIdIcon className="w-16 h-16 group-hover:scale-105 transition-transform" />
                </button>

                {/* OR divider */}
                <span className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">
                  {tr("OR", "ATAU", "ATAU")}
                </span>

                {/* Fingerprint Icon Button */}
                <button
                  type="button"
                  onClick={isBiometricRegistered ? handleBiometricLogin : handleRegisterBiometric}
                  disabled={isBiometricLoading}
                  className={`p-5 rounded-3xl bg-slate-50 border border-slate-200/90 text-[#16b09f] shadow-[0_6px_25px_rgba(20,175,158,0.12)] hover:bg-teal-50 hover:border-teal-200 active:scale-95 transition-all group cursor-pointer relative ${
                    isBiometricLoading ? "opacity-75 animate-pulse ring-4 ring-[#16b09f]/30" : ""
                  }`}
                  aria-label="Login with Fingerprint"
                >
                  <RiFingerprint2Line className="w-16 h-16 group-hover:scale-105 transition-transform" />
                </button>

                {/* Biometric Status / Loading */}
                {isBiometricLoading && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#0d9488] font-semibold mt-1">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{tr("Waiting for biometric…", "Menunggu biometrik…", "Manunggu biometrik…")}</span>
                  </div>
                )}

                {/* Biometric Error */}
                {biometricError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono text-center max-w-xs shadow-xs">
                    {biometricError}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pb-8 px-6 text-center shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileScreen("form")}
                  className="text-xs font-bold font-mono tracking-wider text-slate-700 hover:text-[#16b09f] active:text-[#0d9488] transition-colors uppercase py-3 px-6 cursor-pointer"
                >
                  {tr("LOGIN WITH USERNAME & PASSWORD", "LOGIN DENGAN USERNAME & PASSWORD", "LOGIN JO USERNAME & PASSWORD")}
                </button>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 text-slate-400">
                  <button
                    type="button"
                    onClick={onBack}
                    className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Back to Website"
                  >
                    <HiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-pulse" />
                    <span>Protected by WebAuthn</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: FORM LOGIN SCREEN */}
          {mobileScreen === "form" && (
            <motion.div
              key="mobile-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full flex-1 flex flex-col justify-between overflow-y-auto bg-white p-6"
            >
              <div>
                {/* Top Nav */}
                <div className="flex items-center justify-between mb-6 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotMode !== "idle") {
                        setForgotMode("idle");
                      } else {
                        setMobileScreen("welcome");
                      }
                    }}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-600 hover:text-slate-900 active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="Back"
                  >
                    <HiArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-teal-100 p-0.5 bg-teal-50">
                      <img src="/logo-admin.png" alt="Rizx Studio" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 tracking-tight">Rizx Studio</span>
                  </div>

                  <div className="w-10" />
                </div>

                {/* Header Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {forgotMode === "idle"
                      ? tr("Admin Sign In", "Masuk Admin", "Masuak Admin")
                      : forgotMode === "reset-success"
                      ? tr("Password Changed!", "Sandi Berhasil Diubah!", "Kunci Barasil Diubah!")
                      : tr("Password Recovery", "Pemulihan Sandi", "Pamulihan Kunci")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {forgotMode === "idle"
                      ? tr("Enter credentials to access Admin Dashboard", "Masukkan kredensial untuk membuka Dashboard Admin", "Masuakkan kredensial untuak mambukak Dashboard Admin")
                      : tr("Verification via personal email to reset password", "Verifikasi melalui email pribadi untuk mengatur ulang password", "Verifikasi malalui email pribadi untuak maatur ulang kunci")}
                  </p>
                </div>

                {/* Normal Login Form */}
                {forgotMode === "idle" && (
                  <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">
                        {tr("Bank ID / Username", "Bank ID / Username", "Bank ID / Username")}
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
                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#16b09f] focus:bg-white focus:ring-2 focus:ring-[#16b09f]/20 transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
                          {tr("Password", "Password", "Kunci")}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotMode("request-otp");
                            setForgotError("");
                            setForgotStatus("");
                          }}
                          className="text-[11px] text-[#0d9488] font-bold font-mono hover:underline cursor-pointer"
                        >
                          {tr("Forgot Password?", "Lupa Password?", "Lupo Kunci?")}
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
                          className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#16b09f] focus:bg-white focus:ring-2 focus:ring-[#16b09f]/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPass ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono flex items-center gap-2">
                        <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !username.trim() || !password}
                      className="w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3 text-white shadow-[0_8px_25px_rgba(20,175,158,0.35)]"
                      style={{
                        background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #16b09f 100%)",
                      }}
                    >
                      {isLoading ? tr("Signing In…", "Masuk…", "Masuak…") : tr("LOGIN", "LOGIN", "MASUAK")}
                    </button>
                  </form>
                )}

                {/* Forgot Password - Step 1 (Request OTP) */}
                {forgotMode === "request-otp" && (
                  <form onSubmit={handleRequestOtp} className="space-y-4" autoComplete="off">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">
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
                          className="w-full px-4 py-3.5 pl-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#16b09f] focus:bg-white transition-all"
                        />
                        <HiEnvelope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                        Kode 6 digit akan dikirim ke rizxstudioproject@gmail.com
                      </span>
                    </div>

                    {forgotError && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono flex items-center gap-2">
                        <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setForgotMode("idle")}
                        className="w-1/3 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-mono text-xs font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingOtp || !recoveryEmail.trim()}
                        className="flex-1 py-3.5 rounded-2xl bg-[#16b09f] hover:bg-[#0d9488] text-white font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#16b09f]/20"
                      >
                        {isSendingOtp ? "Mengirim Kode…" : "Kirim Kode Verifikasi"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Forgot Password - Step 2 (Verify OTP & Reset) */}
                {forgotMode === "verify-otp" && (
                  <form onSubmit={handleResetPassword} className="space-y-3.5" autoComplete="off">
                    {forgotStatus && (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                        {forgotStatus}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 font-semibold mb-1 uppercase tracking-wider">
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
                        placeholder="123456"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-center tracking-[0.5em] text-lg font-mono font-bold focus:outline-none focus:border-[#16b09f] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 font-semibold mb-1 uppercase tracking-wider">
                        PASSWORD BARU
                      </label>
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setForgotError("");
                        }}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 font-semibold mb-1 uppercase tracking-wider">
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
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-[#16b09f] focus:bg-white transition-all"
                      />
                    </div>

                    {forgotError && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono flex items-center gap-2">
                        <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setForgotMode("idle")}
                        className="w-1/3 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-mono text-xs font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingOtp || enteredOtp.length < 6 || !newPassword}
                        className="flex-1 py-3.5 rounded-2xl bg-[#16b09f] hover:bg-[#0d9488] text-white font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#16b09f]/20"
                      >
                        {isSendingOtp ? "Menyimpan…" : "Simpan Sandi Baru"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Forgot Password - Step 3 (Reset Success) */}
                {forgotMode === "reset-success" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                      <HiCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                      <span className="text-xs font-mono leading-relaxed">
                        {tr(
                          "Your Admin Password has been successfully updated and saved securely.",
                          "Password Admin Anda telah berhasil diperbarui dan tersimpan aman.",
                          "Kunci Admin Sanak lah barasil dipabarui sarato tasimpan aman."
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotMode("idle")}
                      className="w-full py-3.5 rounded-2xl bg-[#16b09f] hover:bg-[#0d9488] text-white font-bold text-sm font-mono transition-all cursor-pointer shadow-lg shadow-[#16b09f]/20"
                    >
                      {tr("Back to Login", "Kembali ke Login", "Baliak ka Login")}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Switch back to Biometric / Website */}
              <div className="pt-6 border-t border-slate-100 text-center shrink-0 space-y-3">
                <button
                  type="button"
                  onClick={() => setMobileScreen("welcome")}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border border-teal-200 bg-teal-50/70 text-[#0d9488] font-bold text-xs font-mono hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <RiFingerprint2Line className="w-4 h-4" />
                  <span>{tr("Use Face ID / Fingerprint", "Gunakan Face ID / Sidik Jari", "Gunoan Face ID / Sidik Jari")}</span>
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-mono text-slate-400 hover:text-slate-700 transition-colors block mx-auto pt-1 cursor-pointer"
                >
                  {tr("← Back to Website", "← Kembali ke Website", "← Baliak ka Website")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centered Card: Split Layout (Desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex relative z-10 w-full max-w-4xl mx-4 bg-[#0d0e12]/95 border border-white/[0.08] rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden flex-col md:flex-row"
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

              {/* Biometric Login */}
              {isBiometricAvailable && (
                <>
                  <div className="relative flex items-center my-1">
                    <div className="flex-1 border-t border-white/[0.08]" />
                    <span className="mx-3 text-[11px] text-neutral-600 font-mono">or</span>
                    <div className="flex-1 border-t border-white/[0.08]" />
                  </div>
                  <button
                    type="button"
                    onClick={isBiometricRegistered ? handleBiometricLogin : handleRegisterBiometric}
                    disabled={isBiometricLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 border border-[#16b09f]/30 bg-[#16b09f]/[0.07] hover:bg-[#16b09f]/15 text-[#16b09f]"
                  >
                    {isBiometricLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>{tr("Waiting for biometric…", "Menunggu biometrik…", "Manunggu biometrik…")}</span>
                      </>
                    ) : (
                      <>
                        <RiFingerprint2Line className="w-5 h-5" />
                        <span>
                          {isBiometricRegistered
                            ? tr("Login with Fingerprint / Face ID", "Login dengan Sidik Jari / Face ID", "Login jo Sidik Jari / Face ID")
                            : tr("Set Up Biometric Login", "Aktifkan Login Biometrik", "Aktifkan Login Biometrik")}
                        </span>
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {biometricError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono"
                      >
                        <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                        <span>{biometricError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
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


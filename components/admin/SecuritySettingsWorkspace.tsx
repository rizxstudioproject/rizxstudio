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
  RiFingerprint2Line,
  RiDeleteBin7Line,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { getAdminCredentials, saveAdminCredentials, AdminCredentials } from "@/lib/adminAuth";
import AdminUsersManager from "./AdminUsersManager";

interface SecuritySettingsWorkspaceProps {
  showToast?: (msg: string) => void;
  onCredentialsUpdated?: (creds: AdminCredentials) => void;
  onLogout?: () => void;
  initialSection?: "team" | "credentials" | "biometric" | "all";
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

  const [activeSection, setActiveSection] = useState<"team" | "credentials" | "biometric" | "all">(
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

  // Biometric WebAuthn state
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);
  const [biometricRegisteredDate, setBiometricRegisteredDate] = useState("");
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Load existing credentials & biometric status on mount
  useEffect(() => {
    getAdminCredentials().then((creds) => {
      if (creds.username) setAdminUser(creds.username);
      if (creds.email) setAdminEmail(creds.email);
      if (creds.secretParam) setAdminSecretKey(creds.secretParam);
    });

    const checkBiometric = async () => {
      try {
        if (typeof window === "undefined" || !window.PublicKeyCredential) return;
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsBiometricSupported(available);
        const credId = localStorage.getItem("rizx_biometric_credId");
        setIsBiometricRegistered(!!credId);
        const date = localStorage.getItem("rizx_biometric_registered_at") || "";
        setBiometricRegisteredDate(date);
      } catch (_) {}
    };
    checkBiometric();
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

  // Biometric Handlers
  const handleRegisterBiometric = async () => {
    setIsBiometricLoading(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Rizx Studio Admin", id: window.location.hostname },
          user: {
            id: userId,
            name: adminUser || "admin",
            displayName: `Admin (${adminUser || "admin"})`,
          },
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
        rawIdBytes.forEach((b) => {
          binary += String.fromCharCode(b);
        });
        const credId = btoa(binary);
        const nowStr = new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        localStorage.setItem("rizx_biometric_credId", credId);
        localStorage.setItem("rizx_biometric_registered_at", nowStr);
        localStorage.setItem("rizx_biometric_user", adminUser || "admin");

        setIsBiometricRegistered(true);
        setBiometricRegisteredDate(nowStr);
        triggerToast(
          tr(
            "Berhasil! Sidik Jari / Face ID berhasil didaftarkan di perangkat ini.",
            "Success! Fingerprint / Face ID enrolled on this device.",
            "Barasil! Sidik Jari / Face ID tadaftar di parangkek ko."
          )
        );
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name !== "NotAllowedError") {
        triggerToast(
          e?.message ||
            tr(
              "Gagal mendaftarkan biometrik.",
              "Biometric registration failed.",
              "Gagal mendaftarkan biometrik."
            )
        );
      } else {
        triggerToast(
          tr(
            "Pendaftaran biometrik dibatalkan.",
            "Biometric registration cancelled.",
            "Pendaftaran biometrik dibatalkan."
          )
        );
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleTestBiometric = async () => {
    setIsBiometricLoading(true);
    try {
      const credId = localStorage.getItem("rizx_biometric_credId");
      if (!credId) {
        triggerToast(
          tr(
            "Belum ada biometrik yang didaftarkan di perangkat ini.",
            "No biometric enrolled on this device yet.",
            "Alun ado biometrik tadaftar di parangkek ko."
          )
        );
        return;
      }
      const rawId = Uint8Array.from(atob(credId), (c) => c.charCodeAt(0));
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          allowCredentials: [{ id: rawId, type: "public-key" }],
          timeout: 60000,
        },
      });

      if (assertion) {
        triggerToast(
          tr(
            "Verifikasi Berhasil! Sensor biometrik berfungsi sempurna.",
            "Verification Success! Biometric sensor works perfectly.",
            "Verifikasi Barasil! Sensor biometrik bajalan elok."
          )
        );
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name !== "NotAllowedError") {
        triggerToast(
          e?.message ||
            tr(
              "Verifikasi biometrik gagal.",
              "Biometric verification failed.",
              "Verifikasi biometrik gagal."
            )
        );
      } else {
        triggerToast(
          tr(
            "Verifikasi biometrik dibatalkan.",
            "Biometric verification cancelled.",
            "Verifikasi biometrik dibatalkan."
          )
        );
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleRemoveBiometric = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rizx_biometric_credId");
      localStorage.removeItem("rizx_biometric_registered_at");
      localStorage.removeItem("rizx_biometric_user");
      setIsBiometricRegistered(false);
      setBiometricRegisteredDate("");
      triggerToast(
        tr(
          "Data biometrik di perangkat ini telah dihapus.",
          "Biometric data on this device removed.",
          "Data biometrik di parangkek ko lah dihapuih."
        )
      );
    }
  };

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
      <div className={`flex items-center p-1 rounded-2xl border overflow-x-auto no-scrollbar gap-1 ${isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"}`}>
        <button
          type="button"
          onClick={() => setActiveSection("all")}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center shrink-0 sm:shrink ${
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
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:shrink ${
            activeSection === "team"
              ? isLight ? "bg-white text-teal-700 shadow-xs font-extrabold" : "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs font-extrabold"
              : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
          }`}
        >
          <RiTeamLine className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{tr("Kelola Akun", "Admin Accounts", "Kelola Akun")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("credentials")}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:shrink ${
            activeSection === "credentials"
              ? isLight ? "bg-white text-slate-900 shadow-xs font-extrabold" : "bg-white/15 text-white shadow-xs font-extrabold"
              : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
          }`}
        >
          <RiKeyFill className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{tr("Password & URL", "Password & URL", "Password & URL")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("biometric")}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 sm:shrink ${
            activeSection === "biometric"
              ? isLight
                ? "bg-white text-teal-700 shadow-xs font-extrabold"
                : "bg-teal-500/20 text-[#16b09f] border border-teal-500/40 shadow-xs font-extrabold"
              : isLight
              ? "text-slate-500 hover:text-slate-800"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <RiFingerprint2Line className="w-3.5 h-3.5 text-[#16b09f] shrink-0" />
          <span>{tr("Biometrik", "Biometrics", "Biometrik")}</span>
        </button>
      </div>

      {/* Biometric (Fingerprint / Face ID) Management Card */}
      {(activeSection === "biometric" || activeSection === "all") && (
        <div
          className={`border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-xs"
              : "bg-neutral-900/60 border-white/10"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-[#16b09f] flex items-center justify-center shrink-0 shadow-xs">
                <RiFingerprint2Line className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm sm:text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Login Biometrik (Sidik Jari / Face ID)", "Biometric Login (Fingerprint / Face ID)", "Login Biometrik (Sidik Jari / Face ID)")}
                  </h3>
                  {isBiometricRegistered ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      {tr("Aktif", "Active", "Aktif")}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      {tr("Belum Didaftarkan", "Not Enrolled", "Alun Didaftarkan")}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Aktifkan sensor sidik jari atau Face ID di perangkat Anda ini agar dapat masuk ke Admin Panel dengan sekali sentuh.",
                    "Enable fingerprint or Face ID on this device to log into the Admin Panel with a single touch.",
                    "Aktifkan sensor sidik jari atau Face ID di parangkek ko supayo dapek masuak ka Admin Panel sakali sentuah."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Biometric Status / Hardware Support */}
          <div className="pt-4 space-y-4">
            {!isBiometricSupported ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                {tr(
                  "Perangkat atau browser ini tidak mendukung sensor biometrik WebAuthn bawaan. Pastikan menggunakan browser modern (Chrome/Safari) dan perangkat memiliki sensor sidik jari/Face ID.",
                  "This device or browser does not support WebAuthn platform biometrics. Ensure you are using a modern browser (Chrome/Safari) with biometric hardware.",
                  "Parangkek atau browser ko indak mandukuang sensor biometrik WebAuthn bawaan."
                )}
              </div>
            ) : (
              <>
                {isBiometricRegistered ? (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLight ? "bg-teal-50/60 border-teal-200" : "bg-teal-950/20 border-teal-500/25"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <RiCheckFill className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>
                            {tr("Biometrik Siap Digunakan", "Biometrics Ready for Login", "Biometrik Siap Digunoan")}
                          </span>
                          <span className={`text-[11px] font-mono block ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                            {biometricRegisteredDate
                              ? `${tr("Terdaftar sejak", "Enrolled on", "Tadaftar sajak")} ${biometricRegisteredDate}`
                              : tr("Kredensial tersimpan aman di browser perangkat ini", "Credentials securely stored in this browser", "Kredensial tasimpan aman di browser parangkek ko")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTestBiometric}
                          disabled={isBiometricLoading}
                          className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#16b09f] text-black hover:bg-[#119a8b] transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <RiFingerprint2Line className="w-4 h-4" />
                          <span>{tr("Uji Coba Verifikasi", "Test Biometric", "Uji Coba Verifikasi")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveBiometric}
                          disabled={isBiometricLoading}
                          className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                          title="Hapus Biometrik"
                        >
                          <RiDeleteBin7Line className="w-4 h-4" />
                          <span>{tr("Hapus", "Remove", "Hapuih")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-neutral-950/60 border-white/10"
                  }`}>
                    <div>
                      <span className={`text-xs font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>
                        {tr("Daftarkan Sidik Jari / Face ID Sekarang", "Enroll Fingerprint / Face ID Now", "Daftarkan Sidik Jari / Face ID Kini")}
                      </span>
                      <span className={`text-[11px] font-mono block mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                        {tr(
                          "Sentuh tombol di samping untuk mengaktifkan sensor keamanan HP/Laptop Anda.",
                          "Tap the button to link your device biometric sensor.",
                          "Santuah tombol untuak maaktifkan sensor kaamanan HP/Laptop Sanak."
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRegisterBiometric}
                      disabled={isBiometricLoading}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide bg-[#16b09f] hover:bg-[#119a8b] text-black transition-all cursor-pointer shadow-md shadow-[#16b09f]/20 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                    >
                      {isBiometricLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>{tr("Memproses Sensor…", "Scanning…", "Mamproses Sensor…")}</span>
                        </>
                      ) : (
                        <>
                          <RiFingerprint2Line className="w-4 h-4" />
                          <span>{tr("+ Tambah Biometrik", "+ Add Biometric", "+ Tambah Biometrik")}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

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

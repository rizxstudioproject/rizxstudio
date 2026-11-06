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
  RiShieldUserLine,
  RiEditLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import {
  getAdminCredentials,
  saveAdminCredentials,
  AdminCredentials,
  AdminUserItem,
  updateAdminUser,
  getUserBiometricsMap,
  saveUserBiometricRecord,
  removeUserBiometricRecord,
  UserBiometricRecord,
} from "@/lib/adminAuth";
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
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [activeBiometricUserId, setActiveBiometricUserId] = useState<string | null>(null);

  // Multi-user state for 1 User = 1 Biometric
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [biometricsMap, setBiometricsMap] = useState<Record<string, UserBiometricRecord>>({});

  const refreshUsersAndBiometrics = async () => {
    try {
      const creds = await getAdminCredentials();
      const users =
        creds.adminUsers && creds.adminUsers.length > 0
          ? creds.adminUsers
          : [
              {
                id: "admin-root",
                username: creds.username || "admin",
                password: creds.password,
                email: creds.email,
                role: "superadmin",
              },
            ];
      setAdminUsers(users);

      const map = getUserBiometricsMap();
      users.forEach((u) => {
        if (u.biometricCredId && !map[u.id]) {
          map[u.id] = {
            userId: u.id,
            username: u.username,
            credId: u.biometricCredId,
            registeredAt: u.biometricRegisteredAt || "",
          };
        }
      });
      setBiometricsMap(map);
    } catch (_) {}
  };

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
      } catch (_) {}
    };
    checkBiometric();
    refreshUsersAndBiometrics();

    const handleUpdate = () => {
      refreshUsersAndBiometrics();
    };
    window.addEventListener("rizx_user_biometrics_updated", handleUpdate);
    window.addEventListener("rizx_admin_credentials_updated", handleUpdate);
    return () => {
      window.removeEventListener("rizx_user_biometrics_updated", handleUpdate);
      window.removeEventListener("rizx_admin_credentials_updated", handleUpdate);
    };
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

  // Biometric Handlers (1 User = 1 Biometric)
  const handleRegisterUserBiometric = async (u: AdminUserItem) => {
    setActiveBiometricUserId(u.id);
    setIsBiometricLoading(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userIdBytes = new TextEncoder().encode(u.id.slice(0, 16).padEnd(16, "0"));
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Rizx Studio Admin", id: window.location.hostname },
          user: {
            id: userIdBytes,
            name: u.username,
            displayName: u.name || `@${u.username}`,
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

        saveUserBiometricRecord(u.id, u.username, credId, nowStr);
        await updateAdminUser(u.id, {
          biometricCredId: credId,
          biometricRegisteredAt: nowStr,
        });

        await refreshUsersAndBiometrics();
        triggerToast(
          tr(
            `Berhasil! Biometrik aktif untuk akun @${u.username}.`,
            `Success! Biometric enrolled for @${u.username}.`,
            `Barasil! Biometrik tadaftar untuak @${u.username}.`
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
      setActiveBiometricUserId(null);
    }
  };

  const handleTestUserBiometric = async (u: AdminUserItem) => {
    const record = biometricsMap[u.id];
    const credId = record?.credId || u.biometricCredId;
    if (!credId) {
      triggerToast(
        tr(
          `Akun @${u.username} belum mendaftarkan biometrik.`,
          `No biometric enrolled for @${u.username}.`,
          `Alun ado biometrik tadaftar untuak @${u.username}.`
        )
      );
      return;
    }
    setActiveBiometricUserId(u.id);
    setIsBiometricLoading(true);
    try {
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
            `Verifikasi Berhasil! Sidik Jari / Face ID cocok untuk @${u.username}.`,
            `Verification Success! Biometric verified for @${u.username}.`,
            `Verifikasi Barasil! Biometrik cocok untuak @${u.username}.`
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
      setActiveBiometricUserId(null);
    }
  };

  const handleRemoveUserBiometric = async (u: AdminUserItem) => {
    removeUserBiometricRecord(u.id);
    await updateAdminUser(u.id, {
      biometricCredId: undefined,
      biometricRegisteredAt: undefined,
    });
    await refreshUsersAndBiometrics();
    triggerToast(
      tr(
        `Biometrik untuk @${u.username} telah dihapus dari perangkat ini.`,
        `Biometric for @${u.username} removed from this device.`,
        `Biometrik untuak @${u.username} lah dihapuih dari parangkek ko.`
      )
    );
  };

  const getRoleBadge = (r?: string) => {
    const roleKey = (r || "admin").toLowerCase();
    if (roleKey === "superadmin") {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
          <RiShieldCheckFill className="w-3 h-3 text-amber-400" />
          Super Admin
        </span>
      );
    }
    if (roleKey === "editor") {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
          <RiEditLine className="w-3 h-3 text-purple-400" />
          Editor
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
        <RiShieldUserLine className="w-3 h-3 text-teal-400" />
        Admin
      </span>
    );
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

      {/* Biometric (Fingerprint / Face ID) Management Card - 1 User = 1 Biometrik */}
      {(activeSection === "biometric" || activeSection === "all") && (
        <div
          className={`border rounded-2xl p-5 sm:p-7 backdrop-blur-sm relative overflow-hidden transition-all space-y-5 ${
            isLight
              ? "bg-white border-slate-200 shadow-sm"
              : "bg-neutral-900/60 border-white/10"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-[#16b09f] flex items-center justify-center shrink-0 shadow-xs">
                <RiFingerprint2Line className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {tr("Login Biometrik (1 User = 1 Biometrik)", "Biometric Login (1 User = 1 Biometric)", "Login Biometrik (1 User = 1 Biometrik)")}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 border border-teal-500/30 text-teal-300">
                    {adminUsers.filter((u) => !!biometricsMap[u.id] || !!u.biometricCredId).length} / {adminUsers.length} {tr("Terdaftar", "Enrolled", "Tadaftar")}
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {tr(
                    "Setiap akun admin memiliki 1 sensor biometrik (sidik jari / Face ID) tersendiri di perangkat ini. Saat Anda memindai sensor, sistem otomatis mendeteksi dan login langsung ke akun tersebut.",
                    "Each admin user has 1 dedicated biometric credential (fingerprint / Face ID) on this device. Scanning automatically identifies and logs into that specific account.",
                    "Satiap akun admin punyo 1 biometrik surang-surang di parangkek ko."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Hardware Support Alert */}
          {!isBiometricSupported ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              {tr(
                "Perangkat atau browser ini tidak mendukung sensor biometrik WebAuthn bawaan. Pastikan menggunakan browser modern (Chrome/Safari) dengan sensor sidik jari atau Face ID aktif.",
                "This device or browser does not support WebAuthn platform biometrics. Ensure you are using a modern browser (Chrome/Safari) with biometric hardware.",
                "Parangkek atau browser ko indak mandukuang sensor biometrik WebAuthn bawaan."
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {adminUsers.map((u, idx) => {
                const record = biometricsMap[u.id];
                const isEnrolled = !!record?.credId || !!u.biometricCredId;
                const regDate = record?.registeredAt || u.biometricRegisteredAt || "";
                const isUserLoading = isBiometricLoading && activeBiometricUserId === u.id;

                return (
                  <div
                    key={u.id || idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
                      isEnrolled
                        ? isLight
                          ? "bg-teal-50/50 border-teal-200/90 shadow-2xs"
                          : "bg-teal-950/20 border-teal-500/30 shadow-2xs"
                        : isLight
                        ? "bg-slate-50/70 border-slate-200"
                        : "bg-black/30 border-white/5"
                    }`}
                  >
                    {/* User Identity & Biometric Status */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border uppercase font-mono shadow-xs"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          borderColor: `${primaryColor}50`,
                          color: primaryColor,
                        }}
                      >
                        {u.username.substring(0, 2)}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-bold text-sm font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
                            @{u.username}
                          </span>
                          {getRoleBadge(u.role)}
                          {isEnrolled ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 flex items-center gap-1">
                              <RiCheckFill className="w-3 h-3 text-emerald-400" />
                              <span>{tr("Biometrik Aktif", "Biometric Active", "Biometrik Aktif")}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium bg-neutral-800 text-neutral-400 border border-white/10">
                              {tr("Belum Terdaftar", "Not Enrolled", "Alun Tadaftar")}
                            </span>
                          )}
                        </div>

                        <div className={`text-xs truncate ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                          {u.name || u.username} · <span className="font-mono text-[11px] text-teal-400">{u.email}</span>
                        </div>

                        <div className={`text-[11px] font-mono flex items-center gap-1.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                          <RiFingerprint2Line className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>
                            {isEnrolled
                              ? regDate
                                ? `${tr("Terdaftar", "Enrolled", "Tadaftar")}: ${regDate}`
                                : tr("Kredensial biometrik aktif di browser ini", "Biometric active in this browser", "Biometrik aktif di browser ko")
                              : tr("1 Akun 1 Biometrik — Siap didaftarkan", "1 User 1 Biometric — Ready to enroll", "1 Akun 1 Biometrik — Siap didaftarkan")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for this specific user */}
                    <div className="flex items-center gap-2 self-stretch sm:self-center justify-end shrink-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                      {isEnrolled ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTestUserBiometric(u)}
                            disabled={isBiometricLoading}
                            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#16b09f] text-black hover:bg-[#119a8b] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isUserLoading ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <RiFingerprint2Line className="w-3.5 h-3.5" />
                            )}
                            <span>{tr("Uji Coba", "Test", "Uji Coba")}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveUserBiometric(u)}
                            disabled={isBiometricLoading}
                            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                            title="Hapus Biometrik User Ini"
                          >
                            <RiDeleteBin7Line className="w-3.5 h-3.5" />
                            <span>{tr("Hapus", "Remove", "Hapuih")}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRegisterUserBiometric(u)}
                          disabled={isBiometricLoading}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-[#16b09f] hover:bg-[#119a8b] text-black transition-all cursor-pointer shadow-md shadow-[#16b09f]/20 active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isUserLoading ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              <span>{tr("Memproses…", "Scanning…", "Mamproses…")}</span>
                            </>
                          ) : (
                            <>
                              <RiFingerprint2Line className="w-3.5 h-3.5" />
                              <span>{tr("+ Tambah Biometrik", "+ Add Biometric", "+ Tambah Biometrik")}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

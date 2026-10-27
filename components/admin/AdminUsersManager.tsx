"use client";

import React, { useState, useEffect } from "react";
import {
  RiTeamLine,
  RiShieldUserLine,
  RiKey2Line,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiUser3Line,
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldCheckLine,
  RiInformationLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import {
  getAdminCredentials,
  addAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getActiveAdminUser,
  setActiveAdminUser,
  AdminUserItem,
  AdminCredentials,
} from "@/lib/adminAuth";

interface AdminUsersManagerProps {
  showToast?: (msg: string) => void;
}

export default function AdminUsersManager({ showToast }: AdminUsersManagerProps) {
  const { tr } = useLang();
  const { themeMode, primaryColor } = useMotionTheme();
  const isLight = themeMode === "light";

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<AdminUserItem | null>(null);

  // Forms
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"superadmin" | "admin" | "editor">("admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password change form
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
    else alert(msg);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const creds = await getAdminCredentials();
      setUsers(creds.adminUsers || []);
    } catch (err) {
      console.error("Failed to load admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<AdminCredentials>;
      if (custom.detail?.adminUsers) {
        setUsers(custom.detail.adminUsers);
      }
    };

    window.addEventListener("rizx_admin_credentials_updated", handleUpdate);
    return () => {
      window.removeEventListener("rizx_admin_credentials_updated", handleUpdate);
    };
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setUsername("");
    setName("");
    setEmail("");
    setRole("admin");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  // Submit Add User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanUser || cleanUser.length < 3) {
      setFormError("Username minimal 3 karakter (hanya huruf, angka, minus, underscore).");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFormError("Email verifikasi tidak valid.");
      return;
    }

    if (!password || password.length < 6) {
      setFormError("Password baru minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addAdminUser({
        username: cleanUser,
        name: name.trim() || cleanUser,
        email: email.trim().toLowerCase(),
        role,
        password: password.trim(),
      });

      if (!res.success) {
        setFormError(res.error || "Gagal menambahkan akun admin.");
        setIsSubmitting(false);
        return;
      }

      await loadUsers();
      setIsAddModalOpen(false);
      notify(`Akun admin @${cleanUser} berhasil ditambahkan!`);
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setUsername(u.username);
    setName(u.name || "");
    setEmail(u.email);
    setRole((u.role as any) || "admin");
    setFormError("");
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError("");

    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanUser || cleanUser.length < 3) {
      setFormError("Username minimal 3 karakter.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFormError("Email verifikasi tidak valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateAdminUser(editingUser.id, {
        username: cleanUser,
        name: name.trim() || cleanUser,
        email: email.trim().toLowerCase(),
        role,
      });

      if (!res.success) {
        setFormError(res.error || "Gagal memperbarui akun.");
        setIsSubmitting(false);
        return;
      }

      const active = getActiveAdminUser();
      if (
        active &&
        (active.id === editingUser.id ||
          active.username.toLowerCase() === editingUser.username.toLowerCase())
      ) {
        setActiveAdminUser({
          ...active,
          username: cleanUser,
          name: name.trim() || cleanUser,
          email: email.trim().toLowerCase(),
          role,
        });
      }

      await loadUsers();
      setEditingUser(null);
      notify(`Akun admin @${cleanUser} berhasil diperbarui!`);
    } catch (err: any) {
      setFormError(err.message || "Gagal memperbarui akun.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Password Modal
  const handleOpenPasswordModal = (u: AdminUserItem) => {
    setPasswordModalUser(u);
    setNewPassword("");
    setConfirmNewPassword("");
    setFormError("");
    setShowNewPassword(false);
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    setFormError("");

    if (!newPassword || newPassword.length < 6) {
      setFormError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateAdminUser(passwordModalUser.id, {
        password: newPassword.trim(),
      });

      if (!res.success) {
        setFormError(res.error || "Gagal mengganti password.");
        setIsSubmitting(false);
        return;
      }

      await loadUsers();
      setPasswordModalUser(null);
      notify(`Password untuk @${passwordModalUser.username} berhasil diubah!`);
    } catch (err: any) {
      setFormError(err.message || "Gagal mengubah password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (u: AdminUserItem) => {
    if (users.length <= 1) {
      notify("Tidak dapat menghapus. Sistem harus memiliki minimal 1 akun Admin aktif.");
      return;
    }

    const confirmed = confirm(
      `Apakah Anda yakin ingin menghapus akun admin @${u.username} (${u.name || u.email})?\n\nSetelah dihapus, user ini tidak akan bisa login lagi.`
    );
    if (!confirmed) return;

    try {
      const res = await deleteAdminUser(u.id);
      if (!res.success) {
        notify(res.error || "Gagal menghapus akun admin.");
        return;
      }

      await loadUsers();
      notify(`Akun admin @${u.username} berhasil dihapus.`);
    } catch (err: any) {
      notify("Gagal menghapus akun: " + err.message);
    }
  };

  const getRoleBadge = (r?: string) => {
    const roleKey = (r || "admin").toLowerCase();
    if (roleKey === "superadmin") {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
          <RiShieldCheckLine className="w-3 h-3 text-amber-400" />
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
    <div
      className={`border rounded-2xl p-5 sm:p-7 backdrop-blur-sm space-y-5 transition-all ${
        isLight ? "bg-white border-slate-200 shadow-sm" : "bg-neutral-900/60 border-white/10"
      }`}
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <RiTeamLine className="w-5 h-5 text-teal-400 shrink-0" />
            <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {tr("Kelola Akun Admin (Multi-User)", "Admin Team Accounts (Multi-User)", "Kelola Akun Admin")}
            </h3>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                isLight ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-teal-500/10 border-teal-500/30 text-teal-300"
              }`}
            >
              {users.length} {users.length > 1 ? "Admins" : "Admin"}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
            {tr(
              "Tambahkan akun untuk tim atau staf Anda. Setiap admin dapat login dengan username dan password terpisah.",
              "Add accounts for your team or staff. Each admin can log in with their own separate username and password.",
              "Tambah akun untuak tim sanak. Satiap admin dapek login jo username sarato password surang-surang."
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-black shadow-lg shadow-teal-500/20 active:scale-95 transition cursor-pointer w-full sm:w-auto shrink-0"
        >
          <RiUser3Line className="w-4 h-4 text-black" />
          <span>{tr("Add New Admin", "Tambah Admin Baru", "Tambah Admin Baru")}</span>
        </button>
      </div>

      {/* Admin Users List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-neutral-400 font-mono flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          Memuat daftar akun admin...
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500 font-mono">
          Belum ada admin terdaftar.
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u, idx) => (
            <div
              key={u.id || idx}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
                isLight
                  ? "bg-slate-50/80 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                  : "bg-black/40 hover:bg-black/60 border-white/10 hover:border-white/20"
              }`}
            >
              {/* User Identity */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border uppercase font-mono shadow-sm"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    borderColor: `${primaryColor}50`,
                    color: primaryColor,
                  }}
                >
                  {u.username.substring(0, 2)}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-bold text-sm font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
                      @{u.username}
                    </span>
                    {getRoleBadge(u.role)}
                    {idx === 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-white/10">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className={`text-xs font-medium truncate ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                    {u.name || u.username}
                  </div>

                  <div className={`text-[11px] font-mono truncate flex items-center gap-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    <RiMailLine className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>{u.email}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch sm:self-center justify-end shrink-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                <button
                  type="button"
                  onClick={() => handleOpenPasswordModal(u)}
                  title="Ganti Password Akun Ini"
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    isLight
                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
                  }`}
                >
                  <RiKey2Line className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(u)}
                  title="Edit Data Akun"
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    isLight
                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
                  }`}
                >
                  <RiEditLine className="w-3.5 h-3.5 text-teal-400" />
                  <span>Edit</span>
                </button>

                {users.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u)}
                    title="Hapus Akun Admin Ini"
                    className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer active:scale-95"
                  >
                    <RiDeleteBinLine className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: TAMBAH ADMIN BARU ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0f1217] border-white/15 text-white"
            }`}
          >
            {/* Sticky Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-[#0d1015]"
            }`}>
              <div className="flex items-center gap-2">
                <RiUser3Line className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-base">
                  {tr("Add New Admin Account", "Tambah Akun Admin Baru", "Tambah Akun Admin Baru")}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <RiInformationLine className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-mono font-medium mb-1">
                    Username <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      placeholder="misal: admin2, manager, sarah"
                      className={`w-full px-3.5 py-2 pl-9 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                      }`}
                    />
                    <RiUser3Line className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                    Hanya huruf kecil, angka, minus, & underscore (tanpa spasi).
                  </span>
                </div>

                <div>
                  <label className="block font-mono font-medium mb-1">Nama Lengkap / Panggilan</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="misal: Sarah Creative Lead"
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium mb-1">
                    Email Verifikasi / OTP <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin2@rizxstudio.com"
                      className={`w-full px-3.5 py-2 pl-9 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                      }`}
                    />
                    <RiMailLine className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-mono font-medium mb-1">Hak Akses / Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black border-white/10 text-white"
                    }`}
                  >
                    <option value="superadmin">Super Admin (Akses Penuh Seluruh Sistem)</option>
                    <option value="admin">Admin (Akses Katalog, Proyek, & Leads)</option>
                    <option value="editor">Editor (Manajemen Konten & Produk)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-mono font-medium mb-1">
                      Password Baru <span className="text-teal-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className={`w-full px-3.5 py-2 pr-8 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                          isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono font-medium mb-1">
                      Konfirmasi Password <span className="text-teal-400">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      className={`w-full px-3.5 py-2 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0 ${
                isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0d1015]"
              }`}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RiUser3Line className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? tr("Saving to Cloud...", "Menyimpan ke Cloud...", "Manyimpan ka Cloud...")
                      : tr("Save Admin Account", "Simpan Akun Admin", "Simpan Akun Admin")}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT DATA ADMIN ── */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0f1217] border-white/15 text-white"
            }`}
          >
            {/* Sticky Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-[#0d1015]"
            }`}>
              <div className="flex items-center gap-2">
                <RiEditLine className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-base">Edit Data Admin (@{editingUser.username})</h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <RiInformationLine className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-mono font-medium mb-1">
                    Username <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium mb-1">Nama Lengkap / Panggilan</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium mb-1">
                    Email Verifikasi / OTP <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-mono font-medium mb-1">Hak Akses / Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black border-white/10 text-white"
                    }`}
                  >
                    <option value="superadmin">Super Admin (Akses Penuh Seluruh Sistem)</option>
                    <option value="admin">Admin (Akses Katalog, Proyek, & Leads)</option>
                    <option value="editor">Editor (Manajemen Konten & Produk)</option>
                  </select>
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0 ${
                isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0d1015]"
              }`}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RiCheckLine className="w-4 h-4" />
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: GANTI PASSWORD USER ── */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0f1217] border-white/15 text-white"
            }`}
          >
            {/* Sticky Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-[#0d1015]"
            }`}>
              <div className="flex items-center gap-2">
                <RiKey2Line className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-base">Ganti Password @{passwordModalUser.username}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <RiInformationLine className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-mono font-medium mb-1">
                    Password Baru <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className={`w-full px-3.5 py-2 pr-8 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-mono font-medium mb-1">
                    Konfirmasi Password Baru <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono focus:outline-none focus:border-teal-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" : "bg-black/60 border-white/10 text-white"
                    }`}
                  />
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0 ${
                isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0d1015]"
              }`}>
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RiKey2Line className="w-4 h-4" />
                  <span>{isSubmitting ? "Menyimpan..." : "Ubah Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

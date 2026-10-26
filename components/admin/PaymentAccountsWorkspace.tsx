"use client";

import React, { useState, useEffect } from "react";
import {
  RiBankCardLine,
  RiQrCodeLine,
  RiWallet3Line,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiSave3Fill,
  RiInformationLine,
  RiFileCopyLine,
  RiShieldCheckLine,
  RiEyeLine,
  RiUpload2Line,
  RiRefreshLine,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import { useMotionTheme } from "@/context/MotionThemeContext";
import {
  PaymentAccount,
  getPaymentAccounts,
  savePaymentAccounts,
  PAYMENT_ACCOUNTS as DEFAULT_ACCOUNTS,
} from "@/lib/paymentService";

interface PaymentAccountsWorkspaceProps {
  showToast?: (msg: string) => void;
}

export default function PaymentAccountsWorkspace({ showToast }: PaymentAccountsWorkspaceProps) {
  const { tr } = useLang();
  const { themeMode } = useMotionTheme();
  const isLight = themeMode === "light";

  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] = useState<"bank" | "qris" | "ewallet">("bank");
  const [formAccountNumber, setFormAccountNumber] = useState<string>("");
  const [formAccountHolder, setFormAccountHolder] = useState<string>("");
  const [formInstructions, setFormInstructions] = useState<string>("");
  const [formBadge, setFormBadge] = useState<string>("");
  const [formQrImageUrl, setFormQrImageUrl] = useState<string>("");
  const [isUploadingQr, setIsUploadingQr] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Live Preview selector
  const [previewSelectedId, setPreviewSelectedId] = useState<string>("");
  const [copiedAccount, setCopiedAccount] = useState<string>("");

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPaymentAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setPreviewSelectedId(data[0].id);
      }
    } catch (err) {
      console.error("Load payment accounts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<PaymentAccount[]>;
      if (custom.detail) {
        setAccounts(custom.detail);
      }
    };
    window.addEventListener("rizx_payment_accounts_updated", handleUpdate);
    return () => window.removeEventListener("rizx_payment_accounts_updated", handleUpdate);
  }, []);

  // Save to Cloud & LocalStorage
  const handleSaveAll = async (newList?: PaymentAccount[]) => {
    const toSave = newList || accounts;
    setIsSaving(true);
    try {
      const res = await savePaymentAccounts(toSave);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        notify(tr("Pengaturan rekening bank berhasil disimpan & dipublikasikan ke web produk!", "Bank accounts saved & published live to web product!", "Rekening bank tasimpan & dipublikasikan ka web!"));
      } else {
        notify("Gagal menyimpan akun pembayaran: " + (res.error || ""));
      }
    } catch (err: any) {
      notify("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName("");
    setFormCategory("bank");
    setFormAccountNumber("");
    setFormAccountHolder("Rizx Studio / Fomi R");
    setFormInstructions("Transfer melalui mobile banking, ATM, atau internet banking.");
    setFormBadge("");
    setFormQrImageUrl("");
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (acc: PaymentAccount) => {
    setEditingId(acc.id);
    setFormName(acc.name);
    setFormCategory(acc.category);
    setFormAccountNumber(acc.accountNumber);
    setFormAccountHolder(acc.accountHolder);
    setFormInstructions(acc.instructions);
    setFormBadge(acc.badge || "");
    setFormQrImageUrl(acc.qrImageUrl || "");
    setFormError("");
    setIsModalOpen(true);
  };

  // Toggle Active
  const handleToggleActive = async (id: string) => {
    const updated = accounts.map((a) => (a.id === id ? { ...a, isActive: a.isActive === false ? true : false } : a));
    setAccounts(updated);
    await handleSaveAll(updated);
  };

  // Delete Account
  const handleDelete = async (acc: PaymentAccount) => {
    if (accounts.length <= 1) {
      notify("Sistem memerlukan minimal 1 rekening atau metode pembayaran aktif.");
      return;
    }
    const confirmed = confirm(`Hapus metode pembayaran "${acc.name}" (${acc.accountNumber})?`);
    if (!confirmed) return;

    const filtered = accounts.filter((a) => a.id !== acc.id);
    setAccounts(filtered);
    await handleSaveAll(filtered);
    notify(`Metode ${acc.name} berhasil dihapus.`);
  };

  // Upload QR Image
  const handleUploadQrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "qris");

      const res = await fetch("/api/admin/media-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormQrImageUrl(data.url);
        notify("Foto QRIS berhasil diunggah!");
      } else {
        alert("Gagal unggah foto QRIS: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Gagal unggah: " + err.message);
    } finally {
      setIsUploadingQr(false);
    }
  };

  // Save Modal Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Nama bank / metode pembayaran wajib diisi.");
      return;
    }

    if (!formAccountNumber.trim()) {
      setFormError("Nomor rekening / ID pembayaran wajib diisi.");
      return;
    }

    if (!formAccountHolder.trim()) {
      setFormError("Nama atas nama pemilik rekening wajib diisi.");
      return;
    }

    const accountId = editingId || formName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-") || `acc-${Date.now()}`;

    const newAccount: PaymentAccount = {
      id: accountId,
      name: formName.trim(),
      category: formCategory,
      accountNumber: formAccountNumber.trim(),
      accountHolder: formAccountHolder.trim(),
      instructions: formInstructions.trim() || "Transfer sesuai nominal pesanan.",
      badge: formBadge.trim() || undefined,
      qrImageUrl: formCategory === "qris" ? formQrImageUrl.trim() || undefined : undefined,
      isActive: true,
    };

    let updatedList: PaymentAccount[];
    if (editingId) {
      updatedList = accounts.map((a) => (a.id === editingId ? newAccount : a));
    } else {
      updatedList = [...accounts, newAccount];
    }

    setAccounts(updatedList);
    setIsModalOpen(false);
    await handleSaveAll(updatedList);
    notify(editingId ? `Rekening ${newAccount.name} berhasil diperbarui!` : `Rekening baru ${newAccount.name} berhasil ditambahkan!`);
  };

  const previewAccount = accounts.find((a) => a.id === previewSelectedId) || accounts[0];

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAccount(text);
      setTimeout(() => setCopiedAccount(""), 2000);
      notify("Nomor rekening disalin ke clipboard!");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isLight
            ? "bg-gradient-to-r from-teal-50/90 via-white to-slate-50 border-teal-200/80 shadow-xs"
            : "bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 border-white/10 shadow-lg"
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <RiBankCardLine className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] font-mono tracking-widest uppercase font-bold ${
                isLight ? "text-teal-700" : "text-[#16b09f]"
              }`}
            >
              PAYMENT METHODS & BANK ACCOUNTS
            </span>
          </div>
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            Bank & QRIS (Web Produk)
          </h2>
          <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
            Kelola nomor rekening bank resmi, QRIS, dan e-wallet yang tampil secara publik pada formulir pemesanan produk dan struk resi digital.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black shadow-lg shadow-teal-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RiAddLine className="w-4 h-4 text-black" />
            <span>Tambah Rekening / QRIS</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveAll()}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              savedSuccess
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
            }`}
          >
            {savedSuccess ? (
              <>
                <RiCheckLine className="w-4 h-4" />
                <span>Terpublikasi!</span>
              </>
            ) : isSaving ? (
              <>
                <RiRefreshLine className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <RiSave3Fill className="w-4 h-4 text-teal-400" />
                <span>Publikasikan ke Web</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left List (7 Cols) & Right Live Client Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Accounts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              Daftar Rekening & Metode Aktif ({accounts.length})
            </h3>
            <span className="text-[11px] text-teal-400 font-mono">
              Perubahan otomatis live di /products
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              Memuat data rekening...
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-8 rounded-2xl border text-center text-xs text-neutral-400 font-mono">
              Belum ada rekening pembayaran yang tersimpan.
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => {
                const isQris = acc.category === "qris";
                const isEwallet = acc.category === "ewallet";
                const isActive = acc.isActive !== false;

                return (
                  <div
                    key={acc.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      !isActive
                        ? "opacity-50 bg-neutral-900/30 border-white/5"
                        : isLight
                        ? "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
                        : "bg-neutral-900/60 border-white/10 hover:border-white/20 shadow-md"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: Icon & Bank Name */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            isQris
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : isEwallet
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                              : "bg-teal-500/10 border-teal-500/30 text-teal-400"
                          }`}
                        >
                          {isQris ? (
                            <RiQrCodeLine className="w-5 h-5" />
                          ) : isEwallet ? (
                            <RiWallet3Line className="w-5 h-5" />
                          ) : (
                            <RiBankCardLine className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={`font-bold text-sm sm:text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                              {acc.name}
                            </h4>
                            {acc.badge && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-teal-500/15 border border-teal-500/30 text-teal-300">
                                {acc.badge}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-neutral-700 text-neutral-400 border border-neutral-600"
                              }`}
                            >
                              {isActive ? "Aktif di Web" : "Nonaktif"}
                            </span>
                          </div>

                          {/* Account Number Box */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-xs text-neutral-400 font-mono">No. Rekening / ID:</span>
                            <span className={`font-mono font-bold text-sm ${isLight ? "text-teal-700" : "text-teal-300"}`}>
                              {acc.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.accountNumber)}
                              className="p-1 rounded hover:bg-white/10 cursor-pointer"
                              title="Salin Nomor Rekening"
                            >
                              <RiFileCopyLine className="w-3.5 h-3.5 text-neutral-400" />
                            </button>
                            {copiedAccount === acc.accountNumber && (
                              <span className="text-[10px] font-mono text-teal-400 font-bold">Tersalin!</span>
                            )}
                          </div>

                          <div className="text-xs text-neutral-400">
                            Atas Nama: <span className={`font-medium ${isLight ? "text-slate-700" : "text-neutral-200"}`}>{acc.accountHolder}</span>
                          </div>

                          <p className={`text-[11px] leading-relaxed pt-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                            {acc.instructions}
                          </p>

                          {isQris && acc.qrImageUrl && (
                            <div className="pt-2 flex items-center gap-3">
                              <img
                                src={acc.qrImageUrl}
                                alt="QRIS Barcode"
                                className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-white/20 shadow-sm"
                              />
                              <span className="text-[10px] font-mono text-neutral-400">
                                Barcode QRIS aktif untuk instant scan
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(acc.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer active:scale-95 ${
                            isActive
                              ? "bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-700"
                              : "bg-teal-500/20 text-teal-300 border-teal-500/30 hover:bg-teal-500/30"
                          }`}
                          title={isActive ? "Nonaktifkan rekening ini" : "Aktifkan rekening ini"}
                        >
                          {isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer active:scale-95 ${
                            isLight
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                              : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border-white/10"
                          }`}
                          title="Edit Rekening"
                        >
                          <RiEditLine className="w-4 h-4 text-teal-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(acc)}
                          className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer active:scale-95"
                          title="Hapus Rekening"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Client Preview Mockup */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <RiEyeLine className="w-4 h-4 text-teal-400" />
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              Live Preview Tampilan Klien di Checkout Web
            </h3>
          </div>

          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0b0e14] border-white/15 shadow-xl"
            }`}
          >
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold block mb-1">
                PREVIEW FORMULIR ORDER WEB
              </span>
              <h4 className="font-bold text-sm text-white">Metode Pembayaran Resmi Rizx Studio</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Ini adalah simulasi tampilan yang dilihat klien saat memilih rekening transfer.
              </p>
            </div>

            {/* Simulated Payment Pills */}
            <div className="grid grid-cols-2 gap-2">
              {accounts.filter((a) => a.isActive !== false).map((acc) => {
                const isSelected = previewAccount?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setPreviewSelectedId(acc.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-teal-500/15 border-teal-500 text-teal-300"
                        : "bg-white/[0.03] border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase tracking-wider block text-neutral-400 truncate">
                        {acc.category}
                      </span>
                      <span className="text-xs font-bold block truncate">{acc.name.split("(")[0]}</span>
                    </div>
                    {isSelected && <RiCheckLine className="w-4 h-4 text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Selected Account Detail Card */}
            {previewAccount && (
              <div className="p-4 rounded-xl bg-black/50 border border-teal-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{previewAccount.name}</span>
                  {previewAccount.badge && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                      {previewAccount.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between bg-white/[0.04] p-2.5 rounded-lg border border-white/5">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">
                      Nomor Rekening Tujuan:
                    </span>
                    <span className="font-mono text-sm font-bold text-teal-400 tracking-wider">
                      {previewAccount.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(previewAccount.accountNumber)}
                    className="px-2.5 py-1 rounded-md bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-mono font-bold cursor-pointer transition active:scale-95"
                  >
                    {copiedAccount === previewAccount.accountNumber ? "Disalin!" : "Salin"}
                  </button>
                </div>

                <div className="text-[11px] text-neutral-300">
                  <span className="text-neutral-400">Atas Nama:</span>{" "}
                  <span className="font-semibold text-white">{previewAccount.accountHolder}</span>
                </div>

                <p className="text-[10px] text-neutral-400 italic">
                  {previewAccount.instructions}
                </p>

                {previewAccount.category === "qris" && previewAccount.qrImageUrl && (
                  <div className="pt-1 flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <img
                      src={previewAccount.qrImageUrl}
                      alt="QRIS Preview"
                      className="w-32 h-32 rounded-lg bg-white p-2 object-contain shadow-md"
                    />
                    <span className="text-[10px] text-neutral-300 font-mono mt-1.5 font-bold">
                      Scan QRIS dari Mobile Banking / E-Wallet
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: TAMBAH / EDIT REKENING ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0f1217] border-white/15 text-white"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <RiBankCardLine className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-base">
                  {editingId ? "Edit Rekening / Metode Pembayaran" : "Tambah Rekening / QRIS Baru"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <RiInformationLine className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-mono font-medium mb-1">
                  Kategori Metode <span className="text-teal-400">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black border-white/10 text-white"
                  }`}
                >
                  <option value="bank">Transfer Bank (BCA, Mandiri, BRI, BNI, BSI, dll)</option>
                  <option value="qris">QRIS Instant Scan (All Payment)</option>
                  <option value="ewallet">E-Wallet (DANA, GoPay, OVO, ShopeePay)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium mb-1">
                  Nama Bank / Layanan <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="misal: Bank Central Asia (BCA) atau Bank Rakyat Indonesia (BRI)"
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block font-mono font-medium mb-1">
                  Nomor Rekening / No. HP / NMID <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  placeholder="misal: 82170214498"
                  className={`w-full px-3.5 py-2 rounded-xl border font-mono font-bold focus:outline-none focus:border-teal-500 ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block font-mono font-medium mb-1">
                  Atas Nama Pemilik Rekening <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formAccountHolder}
                  onChange={(e) => setFormAccountHolder(e.target.value)}
                  placeholder="misal: Rizx Studio / Fomi R"
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block font-mono font-medium mb-1">Badge Sorotan (Opsional)</label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="misal: Paling Populer, Bebas Biaya, Instant Scan"
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block font-mono font-medium mb-1">Petunjuk Pembayaran Singkat</label>
                <textarea
                  rows={2}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Petunjuk singkat bagi klien saat melakukan transfer..."
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/60 border-white/10 text-white"
                  }`}
                />
              </div>

              {/* QRIS Image Options */}
              {formCategory === "qris" && (
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                  <label className="block font-mono font-medium text-amber-400">
                    Gambar Barcode QRIS
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formQrImageUrl}
                      onChange={(e) => setFormQrImageUrl(e.target.value)}
                      placeholder="URL Gambar Barcode QRIS..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs font-mono"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                      <RiUpload2Line className="w-3.5 h-3.5" />
                      <span>{isUploadingQr ? "..." : "Upload QR"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadQrFile}
                      />
                    </label>
                  </div>
                  {formQrImageUrl && (
                    <div className="pt-1 flex items-center gap-2">
                      <img
                        src={formQrImageUrl}
                        alt="Preview QR"
                        className="w-16 h-16 rounded-lg bg-white p-1 object-contain border"
                      />
                      <span className="text-[10px] text-neutral-400">Preview QRIS siap ditampilkan</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-md active:scale-95 transition cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

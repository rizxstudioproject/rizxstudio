"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiBarChartFill,
  RiLineChartFill,
  RiTeamFill,
  RiMoneyDollarCircleFill,
  RiRestartFill,
  RiSignalTowerFill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiUserAddLine,
  RiSearchLine,
  RiDeleteBinLine,
  RiEditLine,
  RiWhatsappLine,
  RiMailLine,
  RiCloseLine,
  RiFilter3Line,
} from "react-icons/ri";
import {
  fetchCrmAnalytics,
  testCrmConnection,
  getRealLeads,
  addRealLead,
  updateLead,
  updateLeadStatus,
  deleteRealLead,
  CrmAnalyticsData,
  CrmConnectionStatus,
  CrmLead,
  CrmLeadStatus,
} from "@/lib/crmService";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function CrmAnalyticsView() {
  const { themeMode, primaryColor } = useMotionTheme();
  const isLight = themeMode === "light";
  const { lang } = useLang();

  const [period, setPeriod] = useState<"7d" | "30d" | "12m">("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<CrmAnalyticsData | null>(null);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [connStatus, setConnStatus] = useState<CrmConnectionStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [chartMode, setChartMode] = useState<"line" | "bar">("bar");

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Brand Identity & 3D Motion",
    value: "25000000",
    source: "Direct Inbound",
    status: "New" as CrmLeadStatus,
    notes: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setSyncToast({ message, type });
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Load all telemetry & leads
  const loadData = async (selectedPeriod = period) => {
    setLoading(true);
    try {
      const [analyticsData, leadsData, conn] = await Promise.all([
        fetchCrmAnalytics(selectedPeriod),
        getRealLeads(),
        testCrmConnection(),
      ]);
      setAnalytics(analyticsData);
      setLeads(leadsData);
      setConnStatus(conn);
    } catch (err) {
      console.error("Error loading CRM analytics:", err);
      showToast("Gagal memuat data dari cloud", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const handleTestConnection = async () => {
    setIsSyncing(true);
    try {
      const res = await testCrmConnection();
      setConnStatus(res);
      showToast(
        res.isConnected
          ? `Terhubung ke Supabase Cloud (${res.latencyMs}ms)`
          : "Gagal terhubung ke Cloud, fallback ke storage lokal",
        res.isConnected ? "success" : "error"
      );
    } catch {
      showToast("Koneksi gagal", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Status Change directly from table
  const handleQuickStatusChange = async (leadId: string, newStatus: CrmLeadStatus) => {
    const updated = await updateLeadStatus(leadId, newStatus);
    setLeads(updated);
    // Refresh analytics dynamically
    const refreshedAnalytics = await fetchCrmAnalytics(period);
    setAnalytics(refreshedAnalytics);
    showToast(`Status prospek diperbarui menjadi "${newStatus}"`);
  };

  // Delete Lead
  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Hapus data prospek "${leadName}" secara permanen?`)) return;
    const updated = await deleteRealLead(leadId);
    setLeads(updated);
    const refreshedAnalytics = await fetchCrmAnalytics(period);
    setAnalytics(refreshedAnalytics);
    showToast(`Prospek "${leadName}" berhasil dihapus`);
  };

  // Open Edit Modal
  const openEditModal = (lead: CrmLead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone || "",
      email: lead.email || "",
      service: lead.service || "Brand Identity & 3D Motion",
      value: lead.value ? lead.value.toString() : "0",
      source: lead.source || "Direct Inbound",
      status: lead.status || "New",
      notes: lead.notes || "",
    });
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingLead(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      service: "Brand Identity & 3D Motion",
      value: "25000000",
      source: "Manual Entry",
      status: "New",
      notes: "",
    });
    setIsAddModalOpen(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Nama prospek wajib diisi", "error");
      return;
    }

    const numericValue = parseInt(formData.value.replace(/[^0-9]/g, "")) || 0;

    if (editingLead) {
      // Edit
      const updated = await updateLead(editingLead.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: formData.service,
        value: numericValue,
        source: formData.source,
        status: formData.status,
        notes: formData.notes,
      });
      setLeads(updated);
      showToast(`Data prospek "${formData.name}" berhasil disimpan!`);
    } else {
      // Add
      await addRealLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: formData.service,
        value: numericValue,
        source: formData.source,
        status: formData.status,
        notes: formData.notes,
      });
      const updated = await getRealLeads();
      setLeads(updated);
      showToast(`Prospek "${formData.name}" berhasil ditambahkan ke CRM Cloud!`);
    }

    const refreshedAnalytics = await fetchCrmAnalytics(period);
    setAnalytics(refreshedAnalytics);
    setIsAddModalOpen(false);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchStatus = statusFilter === "ALL" || lead.status.toUpperCase() === statusFilter.toUpperCase();
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        (lead.email && lead.email.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.toLowerCase().includes(query)) ||
        (lead.service && lead.service.toLowerCase().includes(query));
      return matchStatus && matchSearch;
    });
  }, [leads, statusFilter, searchQuery]);

  // Formatter for IDR
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={`p-4 md:p-8 space-y-8 min-h-screen ${isLight ? "bg-slate-50 text-slate-800" : "bg-[#0b0f19] text-slate-100"}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-sm font-medium border ${
              syncToast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {syncToast.type === "success" ? <RiCheckboxCircleFill className="w-5 h-5" /> : <RiTimeFill className="w-5 h-5" />}
            <span>{syncToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === "en" ? "CRM & Real Client Pipeline" : lang === "min" ? "CRM & Pipeline Klien Nyato" : "CRM & Pipeline Klien Nyata"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Cloud Active
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {lang === "en"
              ? "Real-time client leads stored securely in Supabase Cloud with automatic web inquiry capture."
              : "Data prospek nyata tersimpan permanen di Supabase Cloud dengan pelacakan otomatis dari WhatsApp & website."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cloud Status Pill */}
          <button
            onClick={handleTestConnection}
            title="Klik untuk uji koneksi cloud langsung"
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              connStatus?.isConnected
                ? isLight
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20"
                : isLight
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connStatus?.isConnected ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connStatus?.isConnected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
            <span className="font-semibold">
              {connStatus?.mode === "cloud" ? "Supabase Cloud" : "Local Storage"}
            </span>
            {connStatus?.latencyMs !== undefined && (
              <span className="text-[10px] opacity-70">({connStatus.latencyMs}ms)</span>
            )}
            <RiRestartFill className={`w-3.5 h-3.5 ml-1 ${isSyncing ? "animate-spin" : ""}`} />
          </button>

          {/* Period Selector */}
          <div className={`flex rounded-xl p-1 border ${isLight ? "bg-slate-200/70 border-slate-300" : "bg-white/5 border-white/10"}`}>
            {(["7d", "30d", "12m"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p === "7d" ? "7 Hari" : p === "30d" ? "30 Hari" : "1 Tahun"}
              </button>
            ))}
          </div>

          {/* Add Lead Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <RiUserAddLine className="w-4 h-4" />
            <span>+ Tambah Lead Baru</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className={`p-5 rounded-2xl border transition-all ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Prospek Masuk</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/15 text-blue-400">
              <RiTeamFill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{analytics?.totalLeads ?? leads.length}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              +{analytics?.growthRate ?? 14}% MoM
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Tersinkron langsung dengan website</p>
        </div>

        {/* Won Transactions */}
        <div className={`p-5 rounded-2xl border transition-all ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaksi Won / Closed</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/15 text-emerald-400">
              <RiCheckboxCircleFill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{analytics?.activeTransactions ?? leads.filter((l) => l.status === "Won").length}</span>
            <span className="text-xs font-semibold text-slate-400">Deal Berhasil</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Klien aktif & kontrak disetujui</p>
        </div>

        {/* Conversion Rate */}
        <div className={`p-5 rounded-2xl border transition-all ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversion Rate</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-400">
              <RiLineChartFill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{analytics?.conversionRate ?? 0}%</span>
            <span className="text-xs font-semibold text-emerald-400">Rasio Prospek-ke-Deal</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Dihitung otomatis dari data nyata</p>
        </div>

        {/* Pipeline Value */}
        <div className={`p-5 rounded-2xl border transition-all ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nilai Pipeline Deal</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/15 text-amber-400">
              <RiMoneyDollarCircleFill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-400">
              {formatIDR(analytics?.pipelineValue ?? 0)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Total estimasi potensi transaksi</p>
        </div>
      </div>

      {/* Visual Analytics Chart & Source Acquisition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progression Chart */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold">Tren Pertumbuhan Prospek & Transaksi</h2>
              <p className="text-xs text-slate-400">Aktivitas lead baru vs closing transaksi berkala</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => setChartMode("bar")}
                className={`p-1.5 rounded-lg transition-all ${chartMode === "bar" ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}
              >
                <RiBarChartFill className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartMode("line")}
                className={`p-1.5 rounded-lg transition-all ${chartMode === "line" ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}
              >
                <RiLineChartFill className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-white/10">
            {analytics?.chartData && analytics.chartData.length > 0 ? (
              analytics.chartData.map((pt, idx) => {
                const maxVal = Math.max(...analytics.chartData.map((d) => Math.max(d.leads, d.transactions)), 5);
                const leadHeight = Math.max(8, (pt.leads / maxVal) * 100);
                const transHeight = Math.max(8, (pt.transactions / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* Leads bar */}
                      <div
                        style={{ height: `${leadHeight}%` }}
                        className="w-full max-w-[20px] rounded-t-md bg-blue-500/70 group-hover:bg-blue-400 transition-all relative"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-white whitespace-nowrap z-10 pointer-events-none">
                          {pt.leads} lead
                        </span>
                      </div>
                      {/* Transactions bar */}
                      <div
                        style={{ height: `${transHeight}%` }}
                        className="w-full max-w-[20px] rounded-t-md bg-emerald-500/80 group-hover:bg-emerald-400 transition-all relative"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-emerald-300 whitespace-nowrap z-10 pointer-events-none">
                          {pt.transactions} deal
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 truncate max-w-[60px] text-center">
                      {pt.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Memuat data chart...
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
              <span>Prospek Masuk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span>Deal Selesai (Won)</span>
            </div>
          </div>
        </div>

        {/* Acquisition Channel Breakdown */}
        <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10"}`}>
          <h2 className="text-base font-bold mb-1">Kanal Masuk Prospek</h2>
          <p className="text-xs text-slate-400 mb-6">Sumber akuisisi klien secara riil</p>

          <div className="space-y-4">
            {analytics?.sources && analytics.sources.length > 0 ? (
              analytics.sources.map((src, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: src.color || primaryColor }}></span>
                      <span>{src.source}</span>
                    </span>
                    <span className="font-bold">{src.count} lead ({src.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${src.percentage}%`,
                        backgroundColor: src.color || primaryColor,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">Belum ada rincian kanal</div>
            )}
          </div>

          <div className={`mt-8 p-3.5 rounded-xl border text-xs ${isLight ? "bg-blue-50/60 border-blue-100 text-blue-900" : "bg-blue-500/10 border-blue-500/20 text-blue-300"}`}>
            💡 <strong>Otomatisasi:</strong> Setiap pengunjung yang menekan tombol WhatsApp atau mengisi Brief Proyek di web langsung dicatat ke CRM ini secara instan.
          </div>
        </div>
      </div>

      {/* Leads Management Table */}
      <div className={`rounded-2xl border overflow-hidden ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/10"}`}>
        {/* Table Filter & Search Header */}
        <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "Semua Lead" },
              { id: "New", label: "Baru" },
              { id: "Contacted", label: "Dihubungi" },
              { id: "Proposal", label: "Proposal" },
              { id: "Won", label: "Deal Won" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : isLight
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
                {tab.id !== "ALL" && (
                  <span className="ml-1.5 opacity-70">
                    ({leads.filter((l) => l.status === tab.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <RiSearchLine className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, nomor WA, servis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition-all ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-900 focus:bg-white focus:border-primary"
                  : "bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-primary"
              }`}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${isLight ? "bg-slate-100/70 border-slate-200 text-slate-600" : "bg-white/[0.02] border-white/10 text-slate-400"}`}>
                <th className="py-3.5 px-4">Prospek / Klien</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4">Layanan & Sumber</th>
                <th className="py-3.5 px-4">Estimasi Deal</th>
                <th className="py-3.5 px-4">Status Pipeline</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`transition-colors ${isLight ? "hover:bg-slate-50" : "hover:bg-white/[0.02]"}`}
                  >
                    {/* Name & ID */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase bg-primary/20 text-primary border border-primary/30">
                          {lead.name ? lead.name.charAt(0) : "P"}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{lead.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{lead.id}</div>
                          {lead.notes && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 italic max-w-xs mt-0.5">
                              &ldquo;{lead.notes}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact (WA / Email) */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {lead.phone ? (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-emerald-400 hover:underline font-mono"
                          >
                            <RiWhatsappLine className="w-3.5 h-3.5" />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <RiMailLine className="w-3 h-3" />
                            <span className="truncate max-w-[140px]">{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Service & Source */}
                    <td className="py-4 px-4">
                      <div className="font-semibold">{lead.service}</div>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          lead.source.includes("WhatsApp")
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : lead.source.includes("Inquiry")
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                            : "bg-blue-500/15 border-blue-500/30 text-blue-400"
                        }`}>
                          {lead.source}
                        </span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-amber-400 font-mono">
                        {formatIDR(lead.value || 0)}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleQuickStatusChange(lead.id, e.target.value as CrmLeadStatus)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${
                          lead.status === "Won"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : lead.status === "Proposal"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                            : lead.status === "Contacted"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        }`}
                      >
                        <option value="New" className="bg-slate-900 text-amber-400">Baru (New)</option>
                        <option value="Contacted" className="bg-slate-900 text-blue-400">Dihubungi (Contacted)</option>
                        <option value="Proposal" className="bg-slate-900 text-purple-400">Kirim Proposal</option>
                        <option value="Won" className="bg-slate-900 text-emerald-400">Deal Selesai (Won)</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-400 font-medium whitespace-nowrap">
                      {lead.displayDate || "Baru saja"}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(lead)}
                          title="Edit Prospek"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          title="Hapus Prospek"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    {searchQuery ? "Tidak ada prospek yang cocok dengan pencarian" : "Belum ada prospek terdaftar."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Lead */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl overflow-hidden ${
                isLight ? "bg-white border-slate-200" : "bg-[#111827] border-white/10"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <h3 className="text-lg font-bold">
                  {editingLead ? "Edit Prospek Klien" : "Tambah Prospek Klien Baru"}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Nama Klien / Perusahaan *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: PT Surya Kreasi Mandiri"
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Nomor WhatsApp / HP</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08123456789"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Email Klien</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@company.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Layanan yang Diminati</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-slate-900 border-white/10 text-white"
                      }`}
                    >
                      <option value="Brand Identity & 3D Motion">Brand Identity & 3D Motion</option>
                      <option value="Campaign Visuals & Ads">Campaign Visuals & Ads</option>
                      <option value="UI/UX & Interactive Design">UI/UX & Interactive Design</option>
                      <option value="Video Commercial Production">Video Commercial Production</option>
                      <option value="Konsultasi Kreatif Umum">Konsultasi Kreatif Umum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Nilai Transaksi (Rp)</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="25000000"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Kanal Masuk (Sumber)</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-slate-900 border-white/10 text-white"
                      }`}
                    >
                      <option value="Direct Portfolio">Direct Portfolio</option>
                      <option value="WhatsApp Floating">WhatsApp Floating</option>
                      <option value="WhatsApp Footer">WhatsApp Footer</option>
                      <option value="Inquiry Form">Inquiry Form</option>
                      <option value="Manual Entry">Manual Entry (Admin)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Status Pipeline</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CrmLeadStatus })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-slate-900 border-white/10 text-white"
                      }`}
                    >
                      <option value="New">Baru (New)</option>
                      <option value="Contacted">Dihubungi (Contacted)</option>
                      <option value="Proposal">Kirim Proposal</option>
                      <option value="Won">Deal Selesai (Won)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Catatan Tambahan / Brief Klien</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Contoh: Klien minta deadline awal bulan depan, revisi maksimal 3x."
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium resize-none ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                    }`}
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-primary/30"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {editingLead ? "Simpan Perubahan" : "Tambah Prospek"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

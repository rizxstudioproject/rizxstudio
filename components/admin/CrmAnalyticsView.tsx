"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiBarChartFill as HiChartBar,
  RiLineChartFill as HiArrowTrendingUp,
  RiTeamFill as HiUsers,
  RiMoneyDollarCircleFill as HiBanknotes,
  RiRestartFill as HiArrowPath,
  RiSignalTowerFill as HiSignal,
  RiCheckboxCircleFill as HiCheckCircle,
  RiInformationFill as HiInformationCircle,
  RiSendPlaneFill as HiPaperAirplane,
  RiTimeFill as HiClock,
} from "react-icons/ri";
import {
  fetchCrmAnalytics,
  testCrmConnection,
  CrmAnalyticsData,
  CrmConnectionStatus,
  syncNewLead,
} from "@/lib/crmService";
import { useMotionTheme } from "@/context/MotionThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function CrmAnalyticsView() {
  const { primaryColor, accentColor } = useMotionTheme();
  const { lang, tr } = useLang();

  const [period, setPeriod] = useState<"7d" | "30d" | "12m">("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CrmAnalyticsData | null>(null);
  const [connStatus, setConnStatus] = useState<CrmConnectionStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [activeChartMode, setActiveChartMode] = useState<"line" | "bar">("line");

  // Load telemetry
  const loadData = async (selectedPeriod: "7d" | "30d" | "12m") => {
    setLoading(true);
    try {
      const [analytics, connection] = await Promise.all([
        fetchCrmAnalytics(selectedPeriod),
        testCrmConnection(),
      ]);
      setData(analytics);
      setConnStatus(connection);
    } catch (err) {
      console.error("Error loading CRM analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncNewLead({
        name: "Manual Lead Ping",
        email: "ping@rizxstudio.com",
        service: "CRM Health Check & Sync",
        source: "Admin Dashboard Trigger",
      });
      await loadData(period);
      setSyncToast(tr("CRM Telemetry Synced!", "Data CRM Berhasil Disinkron!", "Data CRM Barasil Disinkron!"));
      setTimeout(() => setSyncToast(null), 3000);
    } catch (e) {
      console.warn("Manual sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper for max chart scale
  const maxLeads = data
    ? Math.max(...data.chartData.map((d) => Math.max(d.leads, d.transactions)), 10)
    : 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              {tr("CRM & Business Pipeline", "CRM & Pipeline Bisnis", "CRM & Pipeline Bisnis")}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tr("Lead & Transaction Analytics", "Statistik Prospek & Transaksi", "Statistik Prospek & Transaksi")}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            {tr(
              "Real-time CRM client telemetry, deal conversion ratios, and inquiry acquisition channels.",
              "Data telemetri klien CRM secara real-time, rasio konversi transaksi, dan saluran akuisisi prospek.",
              "Data telemetri klien CRM sacaro langsuang, rasio konversi transaksi, sarato saluran prospek."
            )}
          </p>
        </div>

        {/* Action buttons & Time-range selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center rounded-xl bg-neutral-900 border border-white/10 p-1 text-xs font-mono">
            {(["7d", "30d", "12m"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  period === p
                    ? "bg-white text-black font-semibold shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {p === "7d" ? "7D" : p === "30d" ? "30D" : "12M"}
              </button>
            ))}
          </div>

          {/* Sync button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <HiArrowPath className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? tr("Syncing...", "Sinkron...", "Sinkron...") : tr("Sync CRM", "Sinkronisasi", "Sinkronisasi")}</span>
          </button>
        </div>
      </div>

      {/* Sync Toast */}
      {syncToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2"
        >
          <HiCheckCircle className="w-4 h-4" />
          <span>{syncToast}</span>
        </motion.div>
      )}

      {/* 1. CRM CONNECTION STATUS BANNER */}
      {connStatus && (
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-white font-medium">{connStatus.message}</span>
              <span className="text-neutral-500 block font-mono text-[11px] truncate max-w-md">
                Endpoint: {connStatus.endpoint}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span>Latency: {connStatus.latencyMs}ms</span>
            <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-white capitalize">
              {connStatus.mode === "live" ? "Cloud API Active" : "Telemetry Standby"}
            </span>
          </div>
        </div>
      )}

      {/* 2. KPI METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">
              {tr("Total Leads", "Total Prospek", "Total Prospek")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/5 flex items-center justify-center text-white">
              <HiUsers className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-white/[0.08] rounded animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {data?.totalLeads}
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center">
                <HiArrowTrendingUp className="w-3.5 h-3.5 inline mr-0.5" />
                +{data?.growthRate}%
              </span>
            </div>
          )}
          <span className="text-[11px] text-neutral-500 block">
            {tr("Qualified client inquiries", "Prospek klien terkualifikasi", "Prospek klien takualifikasi")}
          </span>
        </div>

        {/* Transactions Won */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">
              {tr("Transactions Won", "Transaksi Deal", "Transaksi Deal")}
            </span>
            <div
              className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <HiChartBar className="w-4 h-4" style={{ color: primaryColor }} />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-white/[0.08] rounded animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {data?.activeTransactions}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {tr("Active Deals", "Kontrak Aktif", "Kontrak Aktif")}
              </span>
            </div>
          )}
          <span className="text-[11px] text-neutral-500 block">
            {tr("Signed production briefs", "Brief produksi disetujui", "Brief produksi disatujui")}
          </span>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">
              {tr("Conversion Rate", "Rasio Konversi", "Rasio Konversi")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/5 flex items-center justify-center text-white">
              <HiSignal className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-white/[0.08] rounded animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {data?.conversionRate}%
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {tr("High Performing", "Sangat Baik", "Rancak Bana")}
              </span>
            </div>
          )}
          <span className="text-[11px] text-neutral-500 block">
            {tr("Lead to client close ratio", "Rasio closing prospek", "Rasio closing prospek")}
          </span>
        </div>

        {/* Pipeline Value */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">
              {tr("Pipeline Value", "Nilai Pipeline", "Nilai Pipeline")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HiBanknotes className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-24 bg-white/[0.08] rounded animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                ${data?.pipelineValue.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-neutral-400">USD</span>
            </div>
          )}
          <span className="text-[11px] text-neutral-500 block">
            {tr("Gross transaction volume", "Estimasi nilai transaksi", "Estimasi nilai transaksi")}
          </span>
        </div>
      </section>

      {/* 3. INTERACTIVE CHART (LINE & BAR ANIMATED) */}
      <section className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {tr("Inquiry & Deal Conversion Trends", "Grafik Tren Prospek & Transaksi", "Grafik Tren Prospek & Transaksi")}
            </h3>
            <p className="text-xs text-neutral-400">
              {tr(
                "Visual trajectory comparing incoming inquiries vs confirmed closed deals.",
                "Perbandingan jumlah prospek masuk dengan konversi transaksi deal.",
                "Pambandiangan jumlah prospek masuak jo konversi transaksi deal."
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: primaryColor }} />
                <span>Leads</span>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: accentColor }} />
                <span>Deals</span>
              </span>
            </div>

            {/* Chart type toggle */}
            <div className="flex items-center rounded-lg bg-black/40 border border-white/10 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveChartMode("line")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeChartMode === "line" ? "bg-white/[0.12] text-white" : "text-neutral-500"
                }`}
              >
                Line
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMode("bar")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeChartMode === "bar" ? "bg-white/[0.12] text-white" : "text-neutral-500"
                }`}
              >
                Bar
              </button>
            </div>
          </div>
        </div>

        {/* Chart Canvas / SVG Container */}
        <div className="h-64 w-full relative pt-4 pb-2">
          {loading ? (
            /* Skeleton Loading State */
            <div className="h-full w-full flex items-end justify-between gap-3 animate-pulse px-4">
              {[40, 65, 30, 85, 55, 90, 45, 70, 60, 75, 50, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white/[0.04] rounded-t-lg transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          ) : data ? (
            activeChartMode === "bar" ? (
              /* BAR CHART */
              <div className="h-full w-full flex items-end justify-between gap-3 px-2 sm:px-4">
                {data.chartData.map((d, idx) => {
                  const leadHeight = Math.max((d.leads / maxLeads) * 100, 8);
                  const dealHeight = Math.max((d.transactions / maxLeads) * 100, 5);
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 text-[10px] font-mono text-white px-2 py-1 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
                        {d.label}: {d.leads} leads / {d.transactions} deals
                      </div>

                      {/* Twin Bars */}
                      <div className="w-full flex items-end justify-center gap-1 h-[85%]">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${leadHeight}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.04 }}
                          className="w-1/2 max-w-[16px] rounded-t-md opacity-85 hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${dealHeight}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.04 + 0.1 }}
                          className="w-1/2 max-w-[16px] rounded-t-md opacity-85 hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: accentColor }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[10px] font-mono text-neutral-400 mt-2 truncate max-w-full">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LINE / AREA CHART (SVG Animated) */
              <div className="h-full w-full relative">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${data.chartData.length * 100} 200`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="dealsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="0" y1="40" x2="1200" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="1200" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="160" x2="1200" y2="160" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                  {/* Leads Path (Smooth Spline) */}
                  {(() => {
                    const step = (data.chartData.length * 100) / (data.chartData.length - 1 || 1);
                    const points = data.chartData.map((d, i) => {
                      const x = i * step;
                      const y = 180 - (d.leads / maxLeads) * 160;
                      return { x, y };
                    });
                    const dLine = points.reduce(
                      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                      ""
                    );
                    const dArea = `${dLine} L ${points[points.length - 1].x} 200 L 0 200 Z`;

                    return (
                      <>
                        <path d={dArea} fill="url(#leadsGradient)" />
                        <motion.path
                          d={dLine}
                          fill="none"
                          stroke={primaryColor}
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </>
                    );
                  })()}

                  {/* Deals Path */}
                  {(() => {
                    const step = (data.chartData.length * 100) / (data.chartData.length - 1 || 1);
                    const points = data.chartData.map((d, i) => {
                      const x = i * step;
                      const y = 180 - (d.transactions / maxLeads) * 160;
                      return { x, y };
                    });
                    const dLine = points.reduce(
                      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                      ""
                    );
                    return (
                      <motion.path
                        d={dLine}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      />
                    );
                  })()}
                </svg>

                {/* X-axis labels under line */}
                <div className="flex justify-between w-full absolute -bottom-5 text-[10px] font-mono text-neutral-400">
                  {data.chartData.map((d, i) => (
                    <span key={i}>{d.label}</span>
                  ))}
                </div>
              </div>
            )
          ) : null}
        </div>
      </section>

      {/* 4. RECENT LEADS & SOURCE CHANNELS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {tr("Recent Client Inquiries", "Prospek Klien Terkini", "Prospek Klien Tabaru")}
            </h3>
            <span className="text-xs font-mono text-neutral-500">Live Queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-400 font-mono">
                  <th className="pb-3">{tr("Client", "Klien", "Klien")}</th>
                  <th className="pb-3">{tr("Scope", "Layanan", "Layanan")}</th>
                  <th className="pb-3">{tr("Status", "Status", "Status")}</th>
                  <th className="pb-3 text-right">{tr("Value", "Nilai", "Nilai")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{lead.email}</div>
                    </td>
                    <td className="py-3 text-neutral-300">{lead.service}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          lead.status === "Won"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : lead.status === "Proposal"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-white font-medium">
                      ${lead.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Source Breakdown (1 Col) */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-white">
            {tr("Acquisition Channels", "Saluran Akuisisi", "Saluran Akuisisi")}
          </h3>

          <div className="space-y-4 pt-2">
            {data?.sources.map((src, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300">{src.source}</span>
                  <span className="font-mono text-white font-medium">{src.percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${src.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        i === 0
                          ? primaryColor
                          : i === 1
                          ? accentColor
                          : i === 2
                          ? "#F59E0B"
                          : "#8B5CF6",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

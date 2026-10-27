import { ProjectTrackingItem, getAllTrackedProjects, saveAllTrackedProjects, registerTrackedProject } from "./projectTrackerService";
import { syncNewLead } from "./crmService";
import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Escape string for CSV output
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Format stage name for readable customer export
 */
function formatStageLabel(stage: string): string {
  switch (stage) {
    case "queued":
      return "Antrean (Menunggu Kickoff)";
    case "in_progress":
      return "Sedang Dikerjakan (In Progress)";
    case "review":
      return "Tahap Review & Revisi";
    case "completed":
      return "Selesai (Completed 100%)";
    default:
      return stage || "Baru";
  }
}

/**
 * 1. Download Customer Data as CSV (Compatible with Microsoft Excel, Google Sheets, & Numbers)
 */
export function downloadCustomerCsv(records: ProjectTrackingItem[], customFilename?: string): void {
  if (typeof window === "undefined") return;

  const headers = [
    "No",
    "Kode Referensi (Ref Code)",
    "Nama Customer / Klien",
    "Nomor WhatsApp / HP",
    "Email Customer",
    "Layanan Proyek",
    "Kategori Layanan",
    "Paket Layanan",
    "Durasi / Target Pengerjaan",
    "Budget / Biaya",
    "Rencana Pembayaran",
    "Metode Pembayaran",
    "Nomor Resi Pembayaran",
    "Bukti Transfer (URL)",
    "Status Proyek",
    "Progres (%)",
    "Catatan Milestone Terkini",
    "Brief Kebutuhan Klien",
    "Tanggal Masuk",
    "Terakhir Diperbarui",
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    r.refCode,
    r.clientName,
    r.clientPhone || "-",
    r.clientEmail || "-",
    r.serviceTitle || "-",
    r.categoryLabel || "-",
    r.packageName || "-",
    r.targetDeadline || r.packageDuration || "-",
    r.budget || "-",
    r.paymentPlan === "dp50" ? "DP 50%" : r.paymentPlan === "full100" ? "Pelunasan 100%" : r.paymentPlan || "-",
    r.paymentMethod ? r.paymentMethod.toUpperCase() : "-",
    r.receiptNumber || "-",
    r.paymentProofUrl || "-",
    formatStageLabel(r.currentStage),
    `${r.progressPercent || 0}%`,
    r.notes || "-",
    r.brief || "-",
    r.startDate ? new Date(r.startDate).toLocaleDateString("id-ID") : "-",
    r.updatedAt ? new Date(r.updatedAt).toLocaleString("id-ID") : "-",
  ]);

  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\r\n");

  // \uFEFF is UTF-8 BOM so Excel opens indonesian characters and accents correctly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `data-customer-rizxstudio-${dateStr}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 2. Download Customer Data as JSON Backup
 */
export function downloadCustomerJson(records: ProjectTrackingItem[], customFilename?: string): void {
  if (typeof window === "undefined") return;

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `backup-customer-rizxstudio-${dateStr}.json`;
  const jsonStr = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      customers: records,
    },
    null,
    2
  );

  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 3. Sync all customer records to Supabase Cloud Database
 */
export async function syncCustomersToDatabase(
  records?: ProjectTrackingItem[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const list = records && records.length > 0 ? records : await getAllTrackedProjects();

    // 1. Save to local storage & broadcast
    await saveAllTrackedProjects(list);

    // 2. Direct upsert to Supabase client_descriptions table
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("client_descriptions").upsert(
        {
          client_id: "site-project-tracking",
          client_name: "Project Progress Tracker",
          category: "Customer Orders & Tracker Data",
          description: JSON.stringify(list),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );

      if (error) {
        console.warn("Supabase customer sync notice:", error);
      }
    }

    // 3. Sync each client inquiry as lead in CRM service
    for (const item of list) {
      try {
        await syncNewLead({
          name: item.clientName,
          phone: item.clientPhone,
          email: item.clientEmail,
          service: item.serviceTitle,
          budget: item.budget,
          message: item.brief || item.notes,
          source: `Website Tracker (${item.refCode})`,
          status: item.currentStage === "completed" ? "Won" : item.currentStage === "in_progress" ? "Contacted" : "New",
        });
      } catch (_) {
        // non-blocking
      }
    }

    return { success: true, count: list.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || "Gagal sinkron ke database" };
  }
}

/**
 * 4. Parse CSV string into customer order records
 */
export function parseCustomerCsv(csvText: string): Partial<ProjectTrackingItem>[] {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let currentVal = "";
    let insideQuote = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (insideQuote && line[i + 1] === '"') {
          currentVal += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === ',' && !insideQuote) {
        values.push(currentVal.trim());
        currentVal = "";
      } else {
        currentVal += c;
      }
    }
    values.push(currentVal.trim());
    return values;
  };

  const headerRow = parseLine(lines[0]).map((h) => h.toLowerCase());
  const refCodeIdx = headerRow.findIndex((h) => h.includes("ref") || h.includes("kode"));
  const nameIdx = headerRow.findIndex((h) => h.includes("nama") || h.includes("client") || h.includes("klien") || h.includes("customer"));
  const phoneIdx = headerRow.findIndex((h) => h.includes("wa") || h.includes("phone") || h.includes("telepon") || h.includes("hp"));
  const emailIdx = headerRow.findIndex((h) => h.includes("email"));
  const serviceIdx = headerRow.findIndex((h) => h.includes("layanan") || h.includes("service"));
  const packageIdx = headerRow.findIndex((h) => h.includes("paket") || h.includes("package"));
  const budgetIdx = headerRow.findIndex((h) => h.includes("budget") || h.includes("biaya") || h.includes("harga"));
  const notesIdx = headerRow.findIndex((h) => h.includes("catatan") || h.includes("notes") || h.includes("milestone"));
  const briefIdx = headerRow.findIndex((h) => h.includes("brief") || h.includes("pesan"));

  const results: Partial<ProjectTrackingItem>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (!cols || cols.length === 0) continue;

    const clientName = nameIdx >= 0 ? cols[nameIdx] : cols[2] || cols[1];
    if (!clientName || clientName === "Nama Customer / Klien") continue;

    const refCode = refCodeIdx >= 0 && cols[refCodeIdx]
      ? cols[refCodeIdx]
      : `RZX-IMP-${Math.floor(100000 + Math.random() * 900000)}`;

    results.push({
      refCode,
      clientName: clientName.trim(),
      clientPhone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
      clientEmail: emailIdx >= 0 ? cols[emailIdx] : undefined,
      serviceTitle: serviceIdx >= 0 ? cols[serviceIdx] : "Creative Service",
      packageName: packageIdx >= 0 ? cols[packageIdx] : "Standard Package",
      budget: budgetIdx >= 0 ? cols[budgetIdx] : "Negosiasi",
      notes: notesIdx >= 0 ? cols[notesIdx] : "Diimpor dari file CSV",
      brief: briefIdx >= 0 ? cols[briefIdx] : undefined,
      currentStage: "queued",
      progressPercent: 15,
      startDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * 5. Import Customer Data (CSV or JSON) file directly into Supabase Database
 */
export async function importCustomerFileToDatabase(
  file: File
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const text = await file.text();
    let itemsToInsert: Partial<ProjectTrackingItem>[] = [];

    if (file.name.endsWith(".json")) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        itemsToInsert = parsed;
      } else if (parsed && Array.isArray(parsed.customers)) {
        itemsToInsert = parsed.customers;
      } else {
        return { success: false, count: 0, error: "Format JSON tidak valid (harus array customer)." };
      }
    } else {
      itemsToInsert = parseCustomerCsv(text);
    }

    if (itemsToInsert.length === 0) {
      return { success: false, count: 0, error: "Tidak ada baris data customer yang ditemukan di dalam file." };
    }

    let insertedCount = 0;
    for (const raw of itemsToInsert) {
      if (!raw.clientName) continue;
      const completeItem: ProjectTrackingItem = {
        refCode: raw.refCode || `RZX-PRJ-${Math.floor(100000 + Math.random() * 900000)}`,
        clientName: raw.clientName.trim(),
        clientPhone: raw.clientPhone || "",
        clientEmail: raw.clientEmail || "",
        serviceTitle: raw.serviceTitle || "Creative Service",
        categoryLabel: raw.categoryLabel || "Design & Branding",
        packageName: raw.packageName || "Standard Package",
        packageDuration: raw.packageDuration || "7 - 10 Hari Kerja",
        budget: raw.budget || "Negosiasi",
        startDate: raw.startDate || new Date().toISOString(),
        targetDeadline: raw.targetDeadline || "7 - 10 Hari Kerja",
        currentStage: raw.currentStage || "queued",
        progressPercent: raw.progressPercent !== undefined ? raw.progressPercent : 15,
        notes: raw.notes || "Data diimpor ke database",
        brief: raw.brief || "",
        updatedAt: new Date().toISOString(),
      };

      await registerTrackedProject(completeItem);
      insertedCount++;
    }

    // Push all to cloud database
    await syncCustomersToDatabase();

    return { success: true, count: insertedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || "Gagal memproses file customer." };
  }
}

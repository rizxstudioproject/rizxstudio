/**
 * Project Tracker Service — Connected to Supabase Cloud & LocalStorage
 * Allows clients to track the live progress of their projects using their Reference Code
 * (e.g. RZX-PRJ-632153), and allows Admin to update status from Belum -> Proses -> Finish.
 */
import { supabase, isSupabaseConfigured } from "./supabase";

export type ProjectProgressStage = "queued" | "in_progress" | "review" | "completed";

export interface ProjectTrackingItem {
  refCode: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceTitle: string;
  categoryLabel?: string;
  packageName: string;
  packageDuration?: string;
  budget?: string;
  startDate: string; // ISO string
  targetDeadline?: string;
  currentStage: ProjectProgressStage;
  progressPercent: number; // 0 - 100
  notes?: string;
  deliverables?: string[];
  previewUrl?: string;
  brief?: string;
  confirmedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

const STORAGE_KEY = "rizx_project_tracking_records";
const SUPABASE_TRACKER_KEY = "site-project-tracking";

// Default starter projects including user reference code RZX-PRJ-632153
export const DEFAULT_TRACKED_PROJECTS: ProjectTrackingItem[] = [
  {
    refCode: "RZX-PRJ-632153",
    clientName: "Rizx Creative Partner",
    clientPhone: "+62 821-7021-4498",
    clientEmail: "partner@rizxstudio.com",
    serviceTitle: "Logo Branding & Identity",
    categoryLabel: "Branding & Identitas",
    packageName: "Professional Brand System",
    packageDuration: "7 - 10 Hari Kerja",
    budget: "15jt - 30jt IDR",
    startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    targetDeadline: "7 - 10 Hari Kerja",
    currentStage: "in_progress",
    progressPercent: 65,
    notes:
      "Eksplorasi 3 arah konsep logo telah selesai. Tim saat ini sedang mematangkan pemilihan tipografi, palet warna sekunder, dan penyusunan brand guideline book.",
    deliverables: [
      "Master Logo Primer & Sekunder",
      "Buku Brand Guideline Lengkap (PDF)",
      "Stationery & Social Media Kit Mockup",
      "Vector Files (AI, SVG, PNG Transparan, PDF)",
    ],
    previewUrl: "",
    updatedAt: new Date().toISOString(),
  },
  {
    refCode: "RZX-PRJ-108420",
    clientName: "Nexus Digital Ventures",
    clientPhone: "+62 812-9988-7766",
    clientEmail: "contact@nexusventures.id",
    serviceTitle: "Web Fullpage",
    categoryLabel: "Web & App Development",
    packageName: "Professional Multi-Section Website",
    packageDuration: "10 - 14 Hari Kerja",
    budget: "15jt - 30jt IDR",
    startDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    targetDeadline: "10 - 14 Hari Kerja",
    currentStage: "review",
    progressPercent: 85,
    notes:
      "Seluruh 5 halaman utama dan animasi interaktif telah diimplementasikan di server staging. Menunggu sesi review dan masukan akhir dari pihak klien.",
    deliverables: [
      "5 Halaman Fullpage Responsive Next.js",
      "Animasi Interaktif & WebGL Effects",
      "Integrasi Form Kontak & CRM Cloud",
      "Audit PageSpeed 95+ & SEO Setup",
    ],
    previewUrl: "https://rizxstudio.com",
    updatedAt: new Date().toISOString(),
  },
  {
    refCode: "RZX-PRJ-992144",
    clientName: "Aethelgard Cinematic Media",
    clientPhone: "+62 878-1122-3344",
    clientEmail: "producer@aethelgard.com",
    serviceTitle: "Video Production",
    categoryLabel: "Video & Motion",
    packageName: "Brand Film & Commercial Showcase",
    packageDuration: "8 - 14 Hari Kerja",
    budget: "> 30jt IDR",
    startDate: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
    targetDeadline: "14 Hari Kerja",
    currentStage: "completed",
    progressPercent: 100,
    notes:
      "Proyek selesai 100%. Master video 4K ProRes, cutdown video iklan 9:16 untuk media sosial, dan lisensi audio telah diserahkan.",
    deliverables: [
      "Master Video Sinematik 4K ProRes",
      "3x Cutdown Ads Vertikal (9:16)",
      "Color Grading Teater & Sound Design 5.1",
      "Lisensi Komersial Lengkap",
    ],
    completedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get all tracked projects from Supabase Cloud + LocalStorage fallback
 */
export async function getAllTrackedProjects(): Promise<ProjectTrackingItem[]> {
  let records: ProjectTrackingItem[] | null = null;

  // 1. Try Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("client_descriptions")
        .select("description")
        .eq("client_id", SUPABASE_TRACKER_KEY)
        .single();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed) && parsed.length > 0) {
          records = parsed;
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
          }
        }
      }
    } catch (err) {
      console.warn("Supabase project tracker read notice:", err);
    }
  }

  // 2. Try LocalStorage
  if (!records && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        records = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("LocalStorage project tracker read notice:", e);
    }
  }

  // 3. Fallback to default tracked projects (ensure RZX-PRJ-632153 is present)
  if (!records || records.length === 0) {
    records = [...DEFAULT_TRACKED_PROJECTS];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  } else {
    // Verify RZX-PRJ-632153 is present in records
    const hasTarget = records.some((r) => r.refCode.toUpperCase() === "RZX-PRJ-632153");
    if (!hasTarget) {
      records = [DEFAULT_TRACKED_PROJECTS[0], ...records];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      }
    }
  }

  return records;
}

/**
 * Save all tracked projects to Supabase Cloud + LocalStorage
 */
export async function saveAllTrackedProjects(records: ProjectTrackingItem[]): Promise<boolean> {
  // 1. Save LocalStorage & Broadcast Live Sync Event
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent("rizx_tracker_updated", { detail: records }));
    } catch (e) {
      console.warn("LocalStorage project tracker save notice:", e);
    }
  }

  // 2. Save Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("client_descriptions").upsert(
        {
          client_id: SUPABASE_TRACKER_KEY,
          client_name: "Project Progress Tracker",
          description: JSON.stringify(records),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" }
      );
      return true;
    } catch (err) {
      console.warn("Supabase project tracker save notice:", err);
    }
  }

  return true;
}

/**
 * Lookup project by Reference Code (Case-insensitive)
 */
export async function getProjectByRefCode(rawCode: string): Promise<ProjectTrackingItem | null> {
  if (!rawCode || typeof rawCode !== "string") return null;
  const cleanCode = rawCode.trim().toUpperCase();
  const all = await getAllTrackedProjects();
  const found = all.find(
    (item) =>
      item.refCode.toUpperCase() === cleanCode ||
      item.refCode.toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanCode.replace(/[^A-Z0-9]/g, "")
  );
  return found || null;
}

/**
 * Register or update a project record
 */
export async function registerTrackedProject(item: ProjectTrackingItem): Promise<ProjectTrackingItem> {
  const current = await getAllTrackedProjects();
  const existingIdx = current.findIndex(
    (i) => i.refCode.toUpperCase() === item.refCode.toUpperCase()
  );

  let updatedList: ProjectTrackingItem[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = {
      ...updatedList[existingIdx],
      ...item,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updatedList = [item, ...current];
  }

  await saveAllTrackedProjects(updatedList);
  return item;
}

/**
 * Update project progress status & notes
 */
export async function updateProjectProgress(
  refCode: string,
  stage: ProjectProgressStage,
  progressPercent: number,
  notes?: string,
  previewUrl?: string
): Promise<ProjectTrackingItem | null> {
  const current = await getAllTrackedProjects();
  const cleanCode = refCode.trim().toUpperCase();
  const idx = current.findIndex(
    (i) =>
      i.refCode.toUpperCase() === cleanCode ||
      i.refCode.toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanCode.replace(/[^A-Z0-9]/g, "")
  );

  if (idx < 0) return null;

  const now = new Date().toISOString();
  const updatedItem: ProjectTrackingItem = {
    ...current[idx],
    currentStage: stage,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    notes: notes !== undefined ? notes : current[idx].notes,
    previewUrl: previewUrl !== undefined ? previewUrl : current[idx].previewUrl,
    completedAt: stage === "completed" ? (current[idx].completedAt || now) : undefined,
    updatedAt: now,
  };

  current[idx] = updatedItem;
  await saveAllTrackedProjects(current);
  return updatedItem;
}

/**
 * Confirm project kickoff (Change stage to in_progress, set initial progress & confirmation note)
 */
export async function confirmProjectKickoff(
  refCode: string,
  initialProgress: number = 30,
  kickoffNote?: string
): Promise<ProjectTrackingItem | null> {
  const current = await getAllTrackedProjects();
  const cleanCode = refCode.trim().toUpperCase();
  const idx = current.findIndex(
    (i) =>
      i.refCode.toUpperCase() === cleanCode ||
      i.refCode.toUpperCase().replace(/[^A-Z0-9]/g, "") === cleanCode.replace(/[^A-Z0-9]/g, "")
  );

  if (idx < 0) return null;

  const now = new Date().toISOString();
  const defaultNote =
    kickoffNote ||
    "Pesanan telah dikonfirmasi oleh Studio Rizx. Proyek resmi dimulai & masuk proses produksi kreatif sesuai brief.";

  const updatedItem: ProjectTrackingItem = {
    ...current[idx],
    currentStage: "in_progress",
    progressPercent: Math.max(initialProgress, current[idx].progressPercent || 30),
    notes: defaultNote,
    confirmedAt: current[idx].confirmedAt || now,
    updatedAt: now,
  };

  current[idx] = updatedItem;
  await saveAllTrackedProjects(current);
  return updatedItem;
}

/**
 * Delete a tracked project record
 */
export async function deleteTrackedProject(refCode: string): Promise<boolean> {
  const current = await getAllTrackedProjects();
  const cleanCode = refCode.trim().toUpperCase();
  const filtered = current.filter((i) => i.refCode.toUpperCase() !== cleanCode);
  await saveAllTrackedProjects(filtered);
  return true;
}

/**
 * Stage display metadata helper
 */
export function getStageMetadata(stage: ProjectProgressStage) {
  switch (stage) {
    case "queued":
      return {
        label: "Belum Dikerjakan (Antrean)",
        step: 1,
        color: "#f59e0b",
        badgeBg: "rgba(245, 158, 11, 0.15)",
        badgeBorder: "rgba(245, 158, 11, 0.35)",
        description: "Pesanan telah dikonfirmasi dan masuk antrean persiapan produksi kreatif.",
      };
    case "in_progress":
      return {
        label: "Sedang Dikerjakan (Dalam Proses)",
        step: 2,
        color: "#16b09f",
        badgeBg: "rgba(22, 176, 159, 0.15)",
        badgeBorder: "rgba(22, 176, 159, 0.4)",
        description: "Karya sedang dalam proses produksi intensif sesuai brief yang disepakati.",
      };
    case "review":
      return {
        label: "Tahap Review & Revisi",
        step: 3,
        color: "#818cf8",
        badgeBg: "rgba(129, 140, 248, 0.15)",
        badgeBorder: "rgba(129, 140, 248, 0.35)",
        description: "Draft karya awal telah selesai dan sedang dalam peninjauan / revisi bersama klien.",
      };
    case "completed":
      return {
        label: "Finish / Selesai (Diserahkan)",
        step: 4,
        color: "#10b981",
        badgeBg: "rgba(16, 185, 129, 0.15)",
        badgeBorder: "rgba(16, 185, 129, 0.4)",
        description: "Karya telah selesai 100% dan seluruh master files telah diserahkan penuh.",
      };
  }
}

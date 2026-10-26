/**
 * Payment & Order Receipt Service — Rizx Studio
 * Handles payment methods, accounts, receipt slips, and payment proof linking.
 * Connected to Supabase Cloud & LocalStorage
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { updateProjectPaymentProof } from "./projectTrackerService";

export interface PaymentAccount {
  id: string;
  name: string;
  category: "bank" | "qris" | "ewallet";
  accountNumber: string;
  accountHolder: string;
  instructions: string;
  badge?: string;
  qrImageUrl?: string;
  isActive?: boolean;
}

export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: "bca",
    name: "Bank Central Asia (BCA)",
    category: "bank",
    accountNumber: "82170214498",
    accountHolder: "Rizx Studio / Fomi R",
    instructions: "Transfer melalui m-BCA, KlikBCA, atau ATM BCA ke nomor rekening resmi di atas.",
    badge: "Paling Populer",
    isActive: true,
  },
  {
    id: "mandiri",
    name: "Bank Mandiri",
    category: "bank",
    accountNumber: "111-00-2233445-5",
    accountHolder: "Rizx Studio",
    instructions: "Transfer melalui Livin' by Mandiri, ATM, atau internet banking Mandiri.",
    badge: "Bebas Biaya",
    isActive: true,
  },
  {
    id: "qris",
    name: "QRIS All Payment (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay)",
    category: "qris",
    accountNumber: "NMID: ID1026381769146",
    accountHolder: "Rizx Studio Official",
    instructions: "Scan kode QRIS menggunakan aplikasi mobile banking atau e-wallet apa saja.",
    badge: "Instant Scan",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126670016ID.CO.QRIS.WWW0118936009143817691460215ID10263817691460303UMI51440014ID.LINKAJA.WWW0215ID10263817691460303UMI5204581253033605802ID5911RIZX_STUDIO6007PADANG61052511162070703A016304E8A3",
    isActive: true,
  },
  {
    id: "dana",
    name: "DANA / E-Wallet",
    category: "ewallet",
    accountNumber: "082170214498",
    accountHolder: "Rizx Studio / Fomi R",
    instructions: "Kirim saldo DANA ke nomor akun di atas tanpa biaya admin.",
    badge: "E-Wallet",
    isActive: true,
  },
];

const SUPABASE_PAYMENT_ACCOUNTS_KEY = "site-payment-accounts";
const PAYMENT_ACCOUNTS_STORAGE_KEY = "rizx_payment_accounts_v1";

/**
 * Get all payment accounts from Supabase Cloud with LocalStorage fallback
 */
export async function getPaymentAccounts(): Promise<PaymentAccount[]> {
  // 1. Try Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("client_descriptions")
        .select("description")
        .eq("client_id", SUPABASE_PAYMENT_ACCOUNTS_KEY)
        .single();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof window !== "undefined") {
            localStorage.setItem(PAYMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Supabase payment accounts read notice:", err);
    }
  }

  // 2. Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(PAYMENT_ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // 3. Fallback to default
  return PAYMENT_ACCOUNTS;
}

/**
 * Synchronous get for immediate render
 */
export function getPaymentAccountsSync(): PaymentAccount[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(PAYMENT_ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return PAYMENT_ACCOUNTS;
}

/**
 * Persist payment accounts to Supabase Cloud & LocalStorage
 */
export async function savePaymentAccounts(accounts: PaymentAccount[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(PAYMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent("rizx_payment_accounts_updated", { detail: accounts }));
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("client_descriptions").upsert({
        client_id: SUPABASE_PAYMENT_ACCOUNTS_KEY,
        description: JSON.stringify(accounts),
        tools: "payment_accounts",
      });
      if (error) {
        console.warn("Supabase payment accounts save notice:", error);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan akun pembayaran" };
  }
}

export interface OrderReceiptItem {
  receiptNumber: string; // e.g. RZ-INV-2026-8492
  refCode: string; // e.g. RZX-PRJ-849201
  createdAt: string; // ISO string
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceTitle: string;
  categoryLabel?: string;
  packageName: string;
  packageDuration?: string;
  deliverables?: string[];
  totalBudget: string;
  paymentPlan: "dp50" | "full";
  paymentPlanLabel: string;
  paymentMethod: string;
  accountDetails: PaymentAccount;
  amountToPay: string;
  status: "waiting_payment" | "verifying" | "in_progress" | "completed";
  paymentProofUrl?: string;
  trackingUrl: string;
  notes?: string;
}

const RECEIPTS_STORAGE_KEY = "rizx_order_receipts_v1";

/**
 * Saves a new or updated receipt to local storage
 */
export function saveOrderReceipt(receipt: OrderReceiptItem): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    const existing: OrderReceiptItem[] = raw ? JSON.parse(raw) : [];
    const idx = existing.findIndex(
      (r) => r.receiptNumber === receipt.receiptNumber || r.refCode === receipt.refCode
    );
    if (idx !== -1) {
      existing[idx] = receipt;
    } else {
      existing.unshift(receipt);
    }
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent("rizx_receipt_updated", { detail: receipt }));

    if (receipt.paymentProofUrl) {
      updateProjectPaymentProof(
        receipt.refCode,
        receipt.paymentProofUrl,
        receipt.receiptNumber,
        receipt.paymentMethod,
        receipt.paymentPlan
      ).catch(() => {});
    }
  } catch (err) {
    console.warn("Save receipt notice:", err);
  }
}

/**
 * Retrieves a receipt by reference code or receipt number
 */
export function getOrderReceipt(code: string): OrderReceiptItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    if (!raw) return null;
    const list: OrderReceiptItem[] = JSON.parse(raw);
    const clean = code.trim().toUpperCase();
    return (
      list.find(
        (r) =>
          r.receiptNumber.toUpperCase() === clean ||
          r.refCode.toUpperCase() === clean
      ) || null
    );
  } catch {
    return null;
  }
}

/**
 * Creates receipt object from order form inputs
 */
export function createReceiptFromOrder(data: {
  refCode: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceTitle: string;
  categoryLabel?: string;
  packageName: string;
  packageDuration?: string;
  deliverables?: string[];
  budget: string;
  paymentPlan: "dp50" | "full";
  paymentMethod: string;
  paymentProofUrl?: string;
  notes?: string;
}): OrderReceiptItem {
  const accounts = getPaymentAccountsSync();
  const account =
    accounts.find((a) => a.id === data.paymentMethod) || accounts[0];

  const receiptNumber = `RZ-INV-${data.refCode.replace(/[^a-zA-Z0-9]/g, "").slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://rizxstudio.com";
  const trackingUrl = `${origin}/tracking?code=${data.refCode}`;

  let amountToPay = data.budget;
  const isDp = data.paymentPlan === "dp50";
  const planLabel = isDp ? "DP 50% (Uang Muka Mulai Pengerjaan)" : "Bayar Lunas 100% (Full Payment)";

  if (isDp) {
    amountToPay = `${data.budget} (DP 50%)`;
  }

  const receipt: OrderReceiptItem = {
    receiptNumber,
    refCode: data.refCode,
    createdAt: new Date().toISOString(),
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    clientEmail: data.clientEmail,
    serviceTitle: data.serviceTitle,
    categoryLabel: data.categoryLabel,
    packageName: data.packageName,
    packageDuration: data.packageDuration,
    deliverables: data.deliverables,
    totalBudget: data.budget,
    paymentPlan: data.paymentPlan,
    paymentPlanLabel: planLabel,
    paymentMethod: data.paymentMethod,
    accountDetails: account,
    amountToPay,
    status: data.paymentProofUrl ? "verifying" : "waiting_payment",
    paymentProofUrl: data.paymentProofUrl,
    trackingUrl,
    notes: data.notes,
  };

  saveOrderReceipt(receipt);
  return receipt;
}

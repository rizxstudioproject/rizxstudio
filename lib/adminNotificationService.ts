/**
 * Admin Notification Service — Realtime Audio, Push, & In-App Alerts
 * Notifies admin instantly when a new project/order arrives from client,
 * even when the admin tab is running in the background or minimized.
 */

import { ProjectTrackingItem } from "./projectTrackerService";

const BROADCAST_CHANNEL_NAME = "rizx_admin_new_project_alert";

// Subscribers for in-app floating banner notifications
type NotificationCallback = (project: ProjectTrackingItem) => void;
const inAppSubscribers: Set<NotificationCallback> = new Set();

let titleBlinkInterval: NodeJS.Timeout | null = null;
let originalDocumentTitle = "";

/**
 * 1. Play Modern Synthesized Notification Chime using Web Audio API
 * Guaranteed to work without external mp3/wav files and across all browsers.
 */
export function playNotificationChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First note (E6 - 1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.5, now); // C6
    osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12); // E6

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Second chime note (A6 - 1760 Hz) - uplifting pleasant chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1760, now + 0.14);

    gain2.gain.setValueAtTime(0, now + 0.14);
    gain2.gain.linearRampToValueAtTime(0.45, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn("Audio chime synthesize notice:", err);
  }
}

/**
 * 2. Request Browser Desktop Push Notification Permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (e) {
      console.warn("Notification permission request error:", e);
      return false;
    }
  }

  return false;
}

/**
 * 3. Start Browser Tab Title Blinking Alert
 */
export function startTitleBlinking(message: string) {
  if (typeof document === "undefined") return;

  if (!titleBlinkInterval) {
    originalDocumentTitle = document.title;
    let isAlert = false;
    titleBlinkInterval = setInterval(() => {
      document.title = isAlert ? message : originalDocumentTitle;
      isAlert = !isAlert;
    }, 1000);

    const stopOnFocus = () => {
      stopTitleBlinking();
      window.removeEventListener("focus", stopOnFocus);
    };
    window.addEventListener("focus", stopOnFocus);
  }
}

export function stopTitleBlinking() {
  if (titleBlinkInterval) {
    clearInterval(titleBlinkInterval);
    titleBlinkInterval = null;
    if (originalDocumentTitle && typeof document !== "undefined") {
      document.title = originalDocumentTitle;
    }
  }
}

/**
 * 4. Dispatch System Desktop Notification
 */
export function showDesktopNotification(project: ProjectTrackingItem) {
  if (typeof window === "undefined") return;

  // 1. Play sound chime
  playNotificationChime();

  // 2. Start title alert if tab is not focused
  if (document.hidden) {
    startTitleBlinking(`(1) 🔔 Proyek Baru: ${project.clientName}`);
  }

  // 3. Desktop Notification (Works when browser is in background/minimized)
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const notif = new Notification("🔔 Proyek Baru Masuk!", {
        body: `Klien: ${project.clientName}\nLayanan: ${project.serviceTitle} (${project.packageName})\nRef: ${project.refCode}`,
        icon: "/brand-logo.png",
        badge: "/icon.png",
        tag: `order-${project.refCode}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn("Desktop notification display error:", err);
    }
  }

  // 4. Trigger in-app listeners
  inAppSubscribers.forEach((cb) => {
    try {
      cb(project);
    } catch (e) {
      console.error("Subscriber notification error:", e);
    }
  });
}

/**
 * 5. Broadcast to All Tabs & Admin Windows
 */
export function broadcastNewIncomingOrder(project: ProjectTrackingItem) {
  if (typeof window === "undefined") return;

  // Trigger locally
  showDesktopNotification(project);

  // Cross-tab broadcast
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage(project);
      bc.close();
    }
  } catch (e) {
    console.warn("BroadcastChannel notice:", e);
  }
}

/**
 * 6. Subscribe to Incoming Order Alerts in Admin Dashboards
 */
export function subscribeToNewOrderNotifications(
  callback: NotificationCallback
): () => void {
  inAppSubscribers.add(callback);

  let bc: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data && event.data.refCode) {
          showDesktopNotification(event.data);
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel subscribe notice:", e);
    }
  }

  return () => {
    inAppSubscribers.delete(callback);
    if (bc) {
      bc.close();
    }
  };
}

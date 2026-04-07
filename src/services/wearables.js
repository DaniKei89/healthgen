// Wearable integration service
// Uses Capacitor Health plugin on native, Firestore on web

import { db } from "../firebase";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

// ═══════════════════════════════════════
// AVAILABLE WEARABLE SERVICES
// ═══════════════════════════════════════

const SERVICES = [
  {
    id: "apple_health",
    name: "Apple Health",
    icon: "\uD83C\uDF4F",
    description: "Sync health data from your iPhone and Apple Watch",
    connected: false,
  },
  {
    id: "google_fit",
    name: "Google Fit",
    icon: "\u2764\uFE0F",
    description: "Connect your Google Fit activity and health metrics",
    connected: false,
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: "\u231A",
    description: "Import steps, sleep, and heart rate from Fitbit",
    connected: false,
  },
  {
    id: "garmin",
    name: "Garmin",
    icon: "\uD83E\uDDED",
    description: "Sync workouts and vitals from Garmin devices",
    connected: false,
  },
  {
    id: "samsung_health",
    name: "Samsung Health",
    icon: "\uD83D\uDCF1",
    description: "Connect Samsung Health and Galaxy Watch data",
    connected: false,
  },
  {
    id: "oura",
    name: "Oura",
    icon: "\uD83D\uDCAD",
    description: "Import sleep, readiness, and activity from Oura Ring",
    connected: false,
  },
  {
    id: "withings",
    name: "Withings",
    icon: "\u2696\uFE0F",
    description: "Sync weight, blood pressure, and sleep from Withings",
    connected: false,
  },
  {
    id: "strava",
    name: "Strava",
    icon: "\uD83D\uDEB4",
    description: "Import runs, rides, and workouts from Strava",
    connected: false,
  },
];

// ═══════════════════════════════════════
// SERVICE FUNCTIONS
// ═══════════════════════════════════════

/**
 * Check if running inside a Capacitor native environment
 */
export function isNativeApp() {
  return (
    typeof window !== "undefined" &&
    window.Capacitor !== undefined &&
    window.Capacitor.isNativePlatform &&
    window.Capacitor.isNativePlatform()
  );
}

/**
 * Returns the list of available wearable integrations with their status.
 * The `connected` field is always false here; consumers should merge
 * with the user's saved integrations from Firestore.
 */
export function getAvailableIntegrations() {
  return SERVICES.map((s) => ({ ...s }));
}

// Providers that support OAuth web flow
const OAUTH_PROVIDERS = ["google_fit", "fitbit", "oura"];
// Providers that are native-only
const NATIVE_ONLY = ["apple_health", "samsung_health"];

/**
 * Connect a wearable service.
 * - OAuth providers (Google Fit, Fitbit, Oura): redirects to OAuth consent page
 * - Native-only (Apple Health, Samsung Health): only works in Capacitor native app
 * - Others (Garmin, Withings, Strava): marks as connected in Firestore (manual for now)
 */
export async function connectService(uid, serviceId) {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) throw new Error(`Unknown service: ${serviceId}`);

  // OAuth providers — redirect to serverless OAuth endpoint
  const oauthId = serviceId.replace("_", "-"); // google_fit → google-fit
  if (OAUTH_PROVIDERS.includes(serviceId)) {
    window.location.href = `/api/auth/${oauthId}?action=connect&uid=${uid}`;
    return; // Page will redirect
  }

  // Native-only providers
  if (NATIVE_ONLY.includes(serviceId) && !isNativeApp()) {
    throw new Error("This provider is only available on the mobile app.");
  }

  // For native or manual providers, mark as connected in Firestore
  const ref = doc(db, "users", uid, "integrations", serviceId);
  await setDoc(ref, {
    serviceId,
    name: service.name,
    icon: service.icon,
    connected: true,
    connectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Handle OAuth callback — save tokens and mark as connected.
 * Called from the app when redirected back from OAuth flow.
 */
export async function handleOAuthCallback(uid, provider, tokenData) {
  const serviceId = provider.replace("-", "_"); // google-fit → google_fit
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return;

  const ref = doc(db, "users", uid, "integrations", serviceId);
  await setDoc(ref, {
    serviceId,
    name: service.name,
    icon: service.icon,
    connected: true,
    connectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    tokens: tokenData, // Stored encrypted in Firestore
  });
}

/**
 * Fetch latest health data from a connected provider via the sync API.
 */
export async function syncProviderData(uid, provider, accessToken) {
  try {
    const res = await fetch(`/api/auth/sync?provider=${provider}&accessToken=${accessToken}`);
    if (!res.ok) throw new Error("Sync failed");
    const result = await res.json();

    // Save synced data to Firestore
    const ref = doc(db, "users", uid, "wearableData", "latest");
    await setDoc(ref, {
      ...result.data,
      source: provider,
      syncedAt: serverTimestamp(),
    }, { merge: true });

    return result.data;
  } catch (err) {
    console.error(`Sync error for ${provider}:`, err);
    return null;
  }
}

/**
 * Remove a wearable integration from Firestore
 */
export async function disconnectService(uid, serviceId) {
  // Import deleteDoc dynamically to avoid pulling it in when not needed
  const { deleteDoc } = await import("firebase/firestore");
  const ref = doc(db, "users", uid, "integrations", serviceId);
  await deleteDoc(ref);
}

/**
 * Real-time listener for wearable data from Firestore
 * Listens on users/{uid}/wearableData (collection-level)
 * Returns unsubscribe function
 */
export function onWearableData(uid, callback) {
  const ref = doc(db, "users", uid, "wearableData", "latest");
  return onSnapshot(
    ref,
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    (error) => {
      console.warn("onWearableData error:", error.message);
      callback(null);
    }
  );
}

/**
 * Push health data from the native layer to Firestore.
 * Called from the Capacitor native bridge when new data is available.
 */
export async function syncFromNative(uid, data) {
  if (!uid || !data) return;

  const ref = doc(db, "users", uid, "wearableData", "latest");
  await setDoc(
    ref,
    {
      ...data,
      source: "native",
      syncedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

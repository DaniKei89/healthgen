/**
 * Biometric authentication service.
 * Uses Capacitor BiometricAuth plugin for native Face ID / Touch ID / Fingerprint.
 * Falls back gracefully on web (non-native) environments.
 */

let BiometricAuth = null;

async function loadPlugin() {
  if (BiometricAuth) return BiometricAuth;
  try {
    const mod = await import("@aparajita/capacitor-biometric-auth");
    BiometricAuth = mod.BiometricAuth;
    return BiometricAuth;
  } catch {
    return null;
  }
}

/**
 * Check if biometric authentication is available on this device.
 */
export async function isBiometricAvailable() {
  const plugin = await loadPlugin();
  if (!plugin) return false;
  try {
    const result = await plugin.checkBiometry();
    return result.isAvailable;
  } catch {
    return false;
  }
}

/**
 * Get the type of biometric available (Face ID, Touch ID, Fingerprint, etc.)
 */
export async function getBiometricType() {
  const plugin = await loadPlugin();
  if (!plugin) return null;
  try {
    const result = await plugin.checkBiometry();
    if (!result.isAvailable) return null;
    // Map biometry type to user-friendly name
    const typeMap = {
      1: "Touch ID",
      2: "Face ID",
      3: "Fingerprint",
      4: "Face Recognition",
      5: "Iris",
    };
    return typeMap[result.biometryType] || "Biometric";
  } catch {
    return null;
  }
}

/**
 * Authenticate the user via biometrics.
 * Returns true if authenticated, false if cancelled or failed.
 */
export async function authenticateWithBiometrics(reason) {
  const plugin = await loadPlugin();
  if (!plugin) return false;
  try {
    await plugin.authenticate({
      reason: reason || "Verify your identity to access Ledora AI",
      cancelTitle: "Cancel",
      allowDeviceCredential: true, // Allow PIN/password fallback
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Save credential for biometric login (stores in localStorage).
 */
export function saveBiometricCredential(email) {
  try {
    localStorage.setItem("ledora_biometric_email", email);
    localStorage.setItem("ledora_biometric_enabled", "true");
  } catch {
    // localStorage might not be available
  }
}

/**
 * Get saved biometric credential.
 */
export function getBiometricCredential() {
  try {
    const enabled = localStorage.getItem("ledora_biometric_enabled");
    const email = localStorage.getItem("ledora_biometric_email");
    return enabled === "true" && email ? { email } : null;
  } catch {
    return null;
  }
}

/**
 * Clear saved biometric credential.
 */
export function clearBiometricCredential() {
  try {
    localStorage.removeItem("ledora_biometric_email");
    localStorage.removeItem("ledora_biometric_enabled");
  } catch {
    // ignore
  }
}

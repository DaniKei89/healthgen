import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthChange, logOut } from "./firebase";
import { getUserProfile, saveUserProfile } from "./services/firestore";

const AuthContext = createContext(null);

// Cache key helpers
const cacheKey = (uid) => `hg_profile_cache_${uid}`;
const doneKey = (uid) => `hg_onboarding_done_${uid}`;
const needsKey = (uid) => `hg_needs_onboarding_${uid}`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStep, setAuthStep] = useState("welcome");
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [onboardingData, setOnboardingData] = useState({});

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      // One-time migration: force logout for sessions from old auth system
      if (firebaseUser && !localStorage.getItem("hg_auth_v2")) {
        localStorage.setItem("hg_auth_v2", "true");
        logOut();
        setUser(null);
        setAuthStep("welcome");
        setOnboardingDone(true);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        const uid = firebaseUser.uid;

        // ─── INSTANT: Check localStorage first (0ms) ───
        const localDone = localStorage.getItem(doneKey(uid)) === "true";
        const needsOnboarding = localStorage.getItem(needsKey(uid)) === "true";
        const cached = localStorage.getItem(cacheKey(uid));
        let cachedProfile = null;
        if (cached) {
          try { cachedProfile = JSON.parse(cached); } catch { cachedProfile = null; }
        }

        if (needsOnboarding && !localDone) {
          // New user, needs onboarding
          setOnboardingDone(false);
        } else if (cachedProfile && cachedProfile.firstName) {
          // Has cached profile → show dashboard immediately
          setOnboardingData(cachedProfile);
          setOnboardingDone(true);
        } else if (localDone) {
          // Onboarding done but no cached profile
          setOnboardingDone(true);
        } else {
          // Unknown state — default to done (will show demo data)
          setOnboardingDone(true);
        }

        setAuthStep("authenticated");
        setLoading(false); // ← INSTANT, no waiting for Firestore

        // ─── BACKGROUND: Sync with Firestore (non-blocking) ───
        getUserProfile(uid).then((firestoreProfile) => {
          if (firestoreProfile) {
            // Update with fresh Firestore data
            setOnboardingData(firestoreProfile);
            setOnboardingDone(true);
            // Update cache for next visit
            localStorage.setItem(cacheKey(uid), JSON.stringify(firestoreProfile));
            localStorage.setItem(doneKey(uid), "true");
            localStorage.removeItem(needsKey(uid));
          } else if (localDone && !cachedProfile?.firstName) {
            // Onboarding done in localStorage but not in Firestore — migrate
            const localData = localStorage.getItem(`hg_onboarding_data_${uid}`);
            if (localData) {
              let parsed = {};
              try { parsed = JSON.parse(localData); } catch { parsed = {}; }
              const profileData = {
                firstName: parsed.firstName || "",
                dob: parsed.dob || "",
                sex: parsed.sex || "",
                country: parsed.country || "",
                height: parsed.height || "",
                weight: parsed.weight || "",
                bloodType: parsed.bloodType || "",
                allergies: parsed.allergiesText ? parsed.allergiesText.split(",").map(s => s.trim()).filter(Boolean) : (parsed.allergies || []),
                medications: parsed.medsText ? parsed.medsText.split(",").map(s => s.trim()).filter(Boolean) : (parsed.medications || []),
                conditions: parsed.conditionsText ? parsed.conditionsText.split(",").map(s => s.trim()).filter(Boolean) : (parsed.conditions || []),
                familyConditions: parsed.familyConditions || [],
                selectedIntegrations: parsed.selectedIntegrations || [],
                permissions: {
                  health: parsed.permHealth ?? true,
                  notif: parsed.permNotif ?? true,
                  camera: parsed.permCamera ?? true,
                  files: parsed.permFiles ?? true,
                },
              };
              saveUserProfile(uid, profileData).then(() => {
                localStorage.setItem(cacheKey(uid), JSON.stringify(profileData));
                localStorage.removeItem(`hg_onboarding_data_${uid}`);
              }).catch(() => {});
              setOnboardingData(profileData);
            }
          }
        }).catch((e) => {
          console.warn("Background Firestore sync failed:", e.message);
          // Already showing cached/localStorage data, no problem
        });

      } else {
        setAuthStep("welcome");
        setOnboardingDone(true);
        setOnboardingData({});
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  // Called right after sign-up to flag user as needing onboarding
  const markNewUser = useCallback((uid) => {
    localStorage.setItem(needsKey(uid), "true");
    setOnboardingDone(false);
  }, []);

  const completeOnboarding = useCallback(async (rawData) => {
    if (!user) return;

    const profileData = {
      firstName: rawData.firstName || "",
      dob: rawData.dob || "",
      sex: rawData.sex || "",
      country: rawData.country || "",
      height: rawData.height || "",
      weight: rawData.weight || "",
      bloodType: rawData.bloodType || "",
      allergies: rawData.allergiesText ? rawData.allergiesText.split(",").map(s => s.trim()).filter(Boolean) : [],
      medications: rawData.medsText ? rawData.medsText.split(",").map(s => s.trim()).filter(Boolean) : [],
      conditions: rawData.conditionsText ? rawData.conditionsText.split(",").map(s => s.trim()).filter(Boolean) : [],
      familyConditions: rawData.familyConditions || [],
      selectedIntegrations: rawData.selectedIntegrations || [],
      permissions: {
        health: rawData.permHealth ?? true,
        notif: rawData.permNotif ?? true,
        camera: rawData.permCamera ?? true,
        files: rawData.permFiles ?? true,
      },
    };

    // Cache locally FIRST (instant on next load)
    localStorage.setItem(cacheKey(user.uid), JSON.stringify(profileData));
    localStorage.setItem(doneKey(user.uid), "true");
    localStorage.removeItem(needsKey(user.uid));

    // Update state immediately
    setOnboardingData(profileData);
    setOnboardingDone(true);

    // Save to Firestore in background
    saveUserProfile(user.uid, profileData).catch((e) => {
      console.warn("Firestore save failed:", e.message);
    });
  }, [user]);

  const saveOnboardingProgress = useCallback((data) => {
    if (user) {
      localStorage.setItem(`hg_onboarding_data_${user.uid}`, JSON.stringify(data));
      setOnboardingData(data);
    }
  }, [user]);

  const handleLogout = useCallback(async () => {
    await logOut();
    setAuthStep("welcome");
    setOnboardingDone(true);
    setOnboardingData({});
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, authStep, setAuthStep,
      onboardingDone, onboardingData,
      markNewUser, completeOnboarding, saveOnboardingProgress,
      handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

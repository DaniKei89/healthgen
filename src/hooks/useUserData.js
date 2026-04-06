import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../AuthContext";
import {
  onUserProfile,
  onLabResults,
  onFamilyMembers,
  onDocuments,
  onInsights,
} from "../services/firestore";
import { RG } from "../data/referenceRanges";
import {
  DEMO_PROFILE,
  DEMO_WEAR,
  DEMO_FAMILY,
  DEMO_CONNECTIONS,
  DEMO_RISKS,
  DEMO_LABS,
  DEMO_INSIGHTS,
  DEMO_DOCS,
  DEMO_DOCS_DESKTOP,
  DEMO_TIPS,
  DEMO_CHAT_INIT,
  DEMO_AI_RESPONSES,
  DEMO_CHAT_SUGGESTIONS,
} from "../data/demo";

// Re-export for backwards compatibility & convenience
export { RG };
export {
  DEMO_PROFILE,
  DEMO_WEAR,
  DEMO_FAMILY,
  DEMO_CONNECTIONS,
  DEMO_RISKS,
  DEMO_LABS,
  DEMO_INSIGHTS,
  DEMO_DOCS,
  DEMO_DOCS_DESKTOP,
  DEMO_TIPS,
  DEMO_CHAT_INIT,
  DEMO_AI_RESPONSES,
  DEMO_CHAT_SUGGESTIONS,
};

// Keep old export names for any existing imports
export const WEAR = DEMO_WEAR;

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calculateBMI(height, weight) {
  if (!height || !weight) return null;
  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  if (h <= 0 || w <= 0) return null;
  return (w / (h * h)).toFixed(1);
}

// Derive hereditary risks from family members data
function deriveHereditaryRisks(members) {
  if (!members || members.length === 0) return [];

  const conditionMap = {};
  for (const m of members) {
    for (const c of (m.conditions || [])) {
      const key = c.toLowerCase().replace(/\s*\(.*?\)\s*/g, "").trim();
      if (!conditionMap[key]) conditionMap[key] = [];
      conditionMap[key].push(m.name);
    }
  }

  const colors = ["#E5484D", "#FF8B3E", "#0091FF", "#7C66DC", "#30A46C", "#E93D82"];
  let ci = 0;

  return Object.entries(conditionMap)
    .filter(([, ms]) => ms.length >= 2)
    .map(([condition, ms]) => ({
      p: condition.charAt(0).toUpperCase() + condition.slice(1),
      m: ms,
      i: `Patr\u00f3n detectado en ${ms.length} miembros de la familia.`,
      c: colors[ci++ % colors.length],
      risk: Math.min(95, ms.length * 25),
    }))
    .sort((a, b) => b.risk - a.risk);
}

// Generate tips based on lab results and profile
function generateTips(labResults, profile, refRanges) {
  const tips = [];
  if (!labResults || labResults.length === 0) return tips;

  const latest = labResults[labResults.length - 1];

  if (latest.ir != null && latest.ir < refRanges.ir.n) {
    tips.push({
      cat: "diet", title: "Plan anti-an\u00e9mico",
      desc: "Plan alimenticio semanal optimizado para tu d\u00e9ficit de hierro.",
      tags: ["Hierro"], cl: "#30A46C",
    });
  }
  if (latest.ch != null && latest.ch > refRanges.ch.x) {
    tips.push({
      cat: "exercise", title: "Cardio anti-colesterol",
      desc: "Rutina cardiovascular progresiva. 150min/sem seg\u00fan OMS.",
      tags: ["Colesterol", "30min/d\u00eda"], cl: "#0091FF",
    });
  }
  if (latest.vc != null && latest.vc < refRanges.vc.n) {
    tips.push({
      cat: "diet", title: "Vitamina C",
      desc: "Aumenta tu ingesta de c\u00edtricos, kiwi y pimientos.",
      tags: ["Vit C"], cl: "#FF8B3E",
    });
  }
  if (latest.gl != null && latest.gl > 90) {
    tips.push({
      cat: "diet", title: "Control de glucosa",
      desc: "Reduce az\u00facares simples y aumenta fibra en tu dieta.",
      tags: ["Glucosa"], cl: "#7C66DC",
    });
  }

  return tips;
}

export function useUserData() {
  const { user, onboardingData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLabResults([]);
      setFamilyMembers([]);
      setDocuments([]);
      setInsights([]);
      setLoading(false);
      return;
    }

    let loadCount = 0;
    const total = 5;
    let resolved = false;
    const checkLoaded = () => {
      loadCount++;
      if (loadCount >= total && !resolved) { resolved = true; setLoading(false); }
    };

    // Timeout: don't block UI for more than 3 seconds
    const timeout = setTimeout(() => {
      if (!resolved) { resolved = true; setLoading(false); }
    }, 3000);

    const unsubs = [
      onUserProfile(user.uid, (data) => { setProfile(data); checkLoaded(); }),
      onLabResults(user.uid, (data) => { setLabResults(data); checkLoaded(); }),
      onFamilyMembers(user.uid, (data) => { setFamilyMembers(data); checkLoaded(); }),
      onDocuments(user.uid, (data) => { setDocuments(data); checkLoaded(); }),
      onInsights(user.uid, (data) => { setInsights(data); checkLoaded(); }),
    ];

    return () => { clearTimeout(timeout); unsubs.forEach(fn => fn()); };
  }, [user]);

  // Derive connections from family members
  const connections = useMemo(() => {
    return familyMembers.flatMap(m =>
      (m.connections || []).map(parentId => [parentId, m.id])
    );
  }, [familyMembers]);

  // Derive hereditary risks
  const hereditaryRisks = useMemo(() => {
    return deriveHereditaryRisks(familyMembers);
  }, [familyMembers]);

  // Compute display profile (replaces hardcoded U)
  // Uses Firestore profile first, falls back to onboardingData from AuthContext
  const displayProfile = useMemo(() => {
    const src = profile || (onboardingData && onboardingData.firstName ? onboardingData : null);
    if (!src) return null;
    return {
      name: src.firstName || "Usuario",
      firstName: src.firstName || "Usuario",
      age: calculateAge(src.dob),
      bl: src.bloodType || "\u2014",
      h: src.height || "\u2014",
      w: src.weight || "\u2014",
      bmi: calculateBMI(src.height, src.weight),
      hr: 0, // From wearable (mock)
      bp: "\u2014", // From wearable (mock)
      sp02: 0, // From wearable (mock)
      al: src.allergies || [],
      co: src.conditions || [],
      va: [], // Vaccinations - not collected in onboarding yet
      meds: src.medications || [],
      bid: `HG-${user?.uid?.substring(0, 4).toUpperCase() || "0000"}-${user?.uid?.substring(4, 8).toUpperCase() || "0000"}`,
    };
  }, [profile, onboardingData, user]);

  // Generate tips
  const tips = useMemo(() => {
    return generateTips(labResults, profile, RG);
  }, [labResults, profile]);

  // Determine data state
  const isEmpty = {
    profile: !profile,
    labs: labResults.length === 0,
    family: familyMembers.length === 0,
    docs: documents.length === 0,
  };

  // Demo mode: ONLY for the designated demo account
  const DEMO_EMAIL = "dani_278@hotmail.com";
  const isDemoAccount = user?.email === DEMO_EMAIL;
  const isDemo = isDemoAccount && isEmpty.profile && isEmpty.labs && isEmpty.family && isEmpty.docs;

  return {
    profile: displayProfile,
    rawProfile: profile,
    labResults,
    familyMembers,
    connections,
    documents,
    insights,
    hereditaryRisks,
    tips,
    loading,
    isEmpty,
    isDemo,
    // Demo data — consumers can use these when isEmpty flags are true
    demo: {
      profile: DEMO_PROFILE,
      wear: DEMO_WEAR,
      family: DEMO_FAMILY,
      connections: DEMO_CONNECTIONS,
      risks: DEMO_RISKS,
      labs: DEMO_LABS,
      insights: DEMO_INSIGHTS,
      docs: DEMO_DOCS,
      docsDesktop: DEMO_DOCS_DESKTOP,
      tips: DEMO_TIPS,
      chatInit: DEMO_CHAT_INIT,
      aiResponses: DEMO_AI_RESPONSES,
      chatSuggestions: DEMO_CHAT_SUGGESTIONS,
    },
  };
}

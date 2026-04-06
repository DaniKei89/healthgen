import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import { signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, getAdditionalUserInfo } from "./firebase";

/* ═══ ICONS ═══ */
const S = (p) => (
  <svg width={p.z||20} height={p.z||20} viewBox="0 0 24 24" fill="none" stroke={p.sk||"currentColor"} strokeWidth={p.sw||1.7} strokeLinecap="round" strokeLinejoin="round" style={p.style}>{p.children}</svg>
);
const I = {
  Heart:(p)=><S {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></S>,
  Lock:(p)=><S {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></S>,
  Shield:(p)=><S {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></S>,
  Ok:(p)=><S {...p}><polyline points="20 6 9 17 4 12"/></S>,
  Eye:(p)=><S {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></S>,
  EyeOff:(p)=><S {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></S>,
  Mail:(p)=><S {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></S>,
  Chv:(p)=><S {...p}><polyline points="15 18 9 12 15 6"/></S>,
  ChvR:(p)=><S {...p}><polyline points="9 18 15 12 9 6"/></S>,
  User:(p)=><S {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></S>,
  Target:(p)=><S {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></S>,
  Activity:(p)=><S {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></S>,
  Users:(p)=><S {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></S>,
  Link:(p)=><S {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></S>,
  Bell:(p)=><S {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></S>,
  Star:(p)=><S {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></S>,
  Zap:(p)=><S {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></S>,
  Globe:(p)=><S {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></S>,
  Camera:(p)=><S {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></S>,
  File:(p)=><S {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></S>,
  Watch:(p)=><S {...p}><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></S>,
  Sparkle:(p)=><S {...p}><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/></S>,
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

/* ═══ THEME ═══ */
const C = { bg:"#F4F5F9", bg2:"#EAECF2", card:"#FFFFFF", glass:"rgba(255,255,255,0.8)", brd:"#DFE2EB", brd2:"#CDD1DE", tx:"#0F1117", tx2:"#555970", tx3:"#8E93A8", pri:"#4F6AE8", priL:"#EEF1FD", priS:"#D0D8FA", priD:"#3548B0", dan:"#E5484D", danL:"#FFF0F0", danS:"#FECDD3", wrn:"#FF8B3E", wrnL:"#FFF5ED", suc:"#30A46C", sucL:"#ECFDF5", sucS:"#BBF7D0", pur:"#7C66DC", purL:"#F5F2FF", pnk:"#E93D82", blu:"#0091FF" };

const Ring = ({ pct, color, sz=44, sw=4 }) => {
  const r=(sz-sw)/2, circ=2*Math.PI*r;
  return <svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={C.bg2} strokeWidth={sw}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-Math.min(pct,100)/100)}/></svg>;
};

/* ═══ DATA ═══ */
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-","No lo sé"];

import { ALLERGIES as ALLERGY_OPTIONS, MEDICATIONS as MED_OPTIONS, CONDITIONS as CONDITION_OPTIONS, COUNTRIES } from "./data/medicalOptions";

const FAMILY_CONDITIONS = [
  "Diabetes","Hipertensión","Cáncer","Enf. cardíaca","Colesterol alto",
  "Asma","Alzheimer","Artritis","Depresión","Obesidad","Tiroides","Ninguna",
];

const INTEGRATIONS = [
  { id:"apple_health", name:"Apple Health", icon:"🍎", desc:"Pasos, sueño, FC" },
  { id:"google_fit", name:"Google Fit", icon:"🏃", desc:"Actividad diaria" },
  { id:"garmin", name:"Garmin", icon:"⌚", desc:"GPS, deportes" },
  { id:"fitbit", name:"Fitbit", icon:"📱", desc:"Sueño, pasos, FC" },
  { id:"samsung", name:"Samsung Health", icon:"📊", desc:"Actividad, sueño" },
  { id:"strava", name:"Strava", icon:"🚴", desc:"Running, ciclismo" },
  { id:"oura", name:"Oura Ring", icon:"💍", desc:"Sueño, readiness" },
  { id:"withings", name:"Withings", icon:"⚖️", desc:"Peso, tensión" },
];

/* ═══ AUTOCOMPLETE COMPONENT ═══ */
const AutocompleteInput = ({ options, selected, onSelect, onRemove, placeholder, color }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const C = { pri:"#4F6AE8",priL:"#EEF1FD",priS:"#D0D8FA",brd:"#DFE2EB",bg:"#F4F5F9",tx:"#0F1117",tx2:"#555970",tx3:"#8E93A8",card:"#FFFFFF",dan:"#E5484D" };
  const filtered = query.length >= 1 ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o)).slice(0, 6) : [];
  return (
    <div style={{ marginTop: 8, position: "relative" }}>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {selected.map(item => (
            <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: color || C.priL, color: C.pri, border: `1px solid ${C.priS}` }}>
              {item}
              <button onClick={() => onRemove(item)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 14, color: C.tx3, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
      {/* Input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) { e.preventDefault(); if (filtered.length > 0) { onSelect(filtered[0]); } else { onSelect(query.trim()); } setQuery(""); } }}
        placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${focused ? C.pri : C.brd}`, background: C.card, fontSize: 13, color: C.tx, outline: "none", fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif", transition: "border-color 0.2s" }}
      />
      {/* Dropdown */}
      {focused && filtered.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 4, background: C.card, borderRadius: 12, border: `1px solid ${C.brd}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 50, maxHeight: 200, overflowY: "auto" }}>
          {filtered.map(opt => (
            <button key={opt} onMouseDown={(e) => { e.preventDefault(); onSelect(opt); setQuery(""); }} style={{ width: "100%", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: C.tx, textAlign: "left", fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif", transition: "background 0.1s" }} onMouseEnter={(e) => e.target.style.background = C.bg} onMouseLeave={(e) => e.target.style.background = "none"}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══ PASSWORD VALIDATION ═══ */
const pwRules = [
  { id:"len", labelKey:"onboarding.pwRules.length", test: (pw) => pw.length >= 12 },
  { id:"upper", labelKey:"onboarding.pwRules.upper", test: (pw) => /[A-Z]/.test(pw) },
  { id:"num", labelKey:"onboarding.pwRules.number", test: (pw) => /[0-9]/.test(pw) },
  { id:"spec", labelKey:"onboarding.pwRules.special", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];
const passwordValid = (pw) => pwRules.every((r) => r.test(pw));

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const { user, authStep, onboardingDone, markNewUser, completeOnboarding, saveOnboardingProgress, onboardingData } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Auth state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Onboarding state — step 0-6
  const [obStep, setObStep] = useState(0);
  const [visible, setVisible] = useState(true);

  // Step 1: Personal data
  const [firstName, setFirstName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [country, setCountry] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 2: Health status
  const [hasAllergies, setHasAllergies] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [allergiesList, setAllergiesList] = useState([]);
  const [hasMeds, setHasMeds] = useState("");
  const [medsText, setMedsText] = useState("");
  const [medsList, setMedsList] = useState([]);
  const [hasConditions, setHasConditions] = useState("");
  const [conditionsText, setConditionsText] = useState("");
  const [conditionsList, setConditionsList] = useState([]);
  const [bloodType, setBloodType] = useState("");

  // Step 3: Family history
  const [familyConditions, setFamilyConditions] = useState([]);

  // Step 4: Integrations
  const [selectedIntegrations, setSelectedIntegrations] = useState([]);

  // Step 5: Permissions (default ON)
  const [permHealth, setPermHealth] = useState(true);
  const [permNotif, setPermNotif] = useState(true);
  const [permCamera, setPermCamera] = useState(true);
  const [permFiles, setPermFiles] = useState(true);

  // Load saved progress
  useEffect(() => {
    if (onboardingData && Object.keys(onboardingData).length > 0) {
      if (onboardingData.firstName) setFirstName(onboardingData.firstName);
      if (onboardingData.dob) setDob(onboardingData.dob);
      if (onboardingData.sex) setSex(onboardingData.sex);
      if (onboardingData.country) setCountry(onboardingData.country);
      if (onboardingData.height) setHeight(onboardingData.height);
      if (onboardingData.weight) setWeight(onboardingData.weight);
      if (onboardingData.hasAllergies) setHasAllergies(onboardingData.hasAllergies);
      if (onboardingData.allergiesText) setAllergiesText(onboardingData.allergiesText);
      if (onboardingData.hasMeds) setHasMeds(onboardingData.hasMeds);
      if (onboardingData.medsText) setMedsText(onboardingData.medsText);
      if (onboardingData.hasConditions) setHasConditions(onboardingData.hasConditions);
      if (onboardingData.conditionsText) setConditionsText(onboardingData.conditionsText);
      if (onboardingData.bloodType) setBloodType(onboardingData.bloodType);
      if (onboardingData.familyConditions) setFamilyConditions(onboardingData.familyConditions);
      if (onboardingData.selectedIntegrations) setSelectedIntegrations(onboardingData.selectedIntegrations);
      if (onboardingData.permHealth) setPermHealth(onboardingData.permHealth);
      if (onboardingData.permNotif) setPermNotif(onboardingData.permNotif);
      if (onboardingData.permCamera) setPermCamera(onboardingData.permCamera);
      if (onboardingData.permFiles) setPermFiles(onboardingData.permFiles);
      if (onboardingData.obStep) setObStep(onboardingData.obStep);
    }
  }, []);

  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Auto-save onboarding progress
  const collectData = () => ({
    firstName, dob, sex, country, height, weight,
    hasAllergies, allergiesText, hasMeds, medsText,
    hasConditions, conditionsText, bloodType,
    familyConditions, selectedIntegrations,
    permHealth, permNotif, permCamera, permFiles, obStep,
  });

  const autoSave = () => { if (user) saveOnboardingProgress(collectData()); };

  // Transition animation
  const transition = (callback) => {
    setVisible(false);
    setTimeout(() => { callback(); setVisible(true); }, 280);
  };

  const nextOb = () => { autoSave(); transition(() => setObStep((s) => Math.min(s + 1, 6))); };
  const prevOb = () => { transition(() => setObStep((s) => Math.max(s - 1, 0))); };

  /* ═══ AUTH HANDLERS ═══ */
  const authError = (code) => {
    const map = {
      "auth/email-already-in-use": t("onboarding.errors.emailInUse"),
      "auth/weak-password": t("onboarding.errors.weakPassword"),
      "auth/invalid-email": t("onboarding.errors.invalidEmail"),
      "auth/too-many-requests": t("onboarding.errors.tooManyRequests"),
      "auth/invalid-credential": t("onboarding.errors.invalidCredential"),
      "auth/user-not-found": t("onboarding.errors.userNotFound"),
      "auth/wrong-password": t("onboarding.errors.wrongPassword"),
    };
    return map[code] || t("onboarding.errors.generic");
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) { setErr(t("onboarding.errors.enterEmailPassword")); return; }
    if (isSignUp && !passwordValid(password)) { setErr(t("onboarding.errors.passwordRequirements")); return; }
    setErr(""); setBusy(true);
    try {
      localStorage.setItem("ledora_auth_v2", "true");
      if (isSignUp) {
        const result = await signUpWithEmail(email, password);
        markNewUser(result.user.uid);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (e) { setErr(authError(e.code)); }
    setBusy(false);
  };

  const handleGoogleAuth = async () => {
    setErr(""); setBusy(true);
    try {
      localStorage.setItem("ledora_auth_v2", "true");
      const result = await signInWithGoogle();
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        markNewUser(result.user.uid);
      }
    }
    catch (e) { if (e.code !== "auth/popup-closed-by-user") setErr(authError(e.code)); }
    setBusy(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setErr(t("onboarding.enterEmailFirst")); return; }
    setBusy(true); setErr("");
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (e) {
      setErr(authError(e.code));
    }
    setBusy(false);
  };

  /* ═══ COMMON STYLES ═══ */
  const inputStyle = {
    width:"100%", padding:"12px 16px", borderRadius:12,
    border:`1.5px solid ${C.brd}`, background:C.card, fontSize:14,
    color:C.tx, outline:"none", fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
    transition:"border-color 0.2s",
  };
  const primaryBtn = {
    width:"100%", padding:"13px 20px", borderRadius:12, border:"none",
    background:`linear-gradient(135deg,${C.pri},${C.priD})`, color:"white",
    fontSize:14, fontWeight:700, cursor:"pointer",
    boxShadow:`0 4px 14px ${C.pri}35`, transition:"all 0.2s",
    opacity:busy?0.7:1, pointerEvents:busy?"none":"auto",
    fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
  };
  const secondaryBtn = {
    ...primaryBtn, background:C.card, color:C.tx, border:`1.5px solid ${C.brd}`,
    boxShadow:"none", opacity:1, pointerEvents:"auto",
  };
  const chipStyle = (active) => ({
    padding:"8px 16px", borderRadius:20, border:`1.5px solid ${active?C.pri:C.brd}`,
    background:active?C.priL:C.card, color:active?C.pri:C.tx2,
    fontSize:13, fontWeight:active?700:500, cursor:"pointer", transition:"all 0.2s",
    display:"inline-flex", alignItems:"center", gap:6, userSelect:"none",
    fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
  });
  const cardBox = {
    background:C.card, borderRadius:18, padding:24,
    border:`1px solid ${C.brd}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
    display:"flex", flexDirection:"column", gap:14,
  };
  const labelStyle = { fontSize:12, fontWeight:700, color:C.tx2, marginBottom:2 };
  const triBtn = (active, val) => ({
    flex:1, padding:"10px 8px", borderRadius:10,
    border:`1.5px solid ${active===val?C.pri:C.brd}`,
    background:active===val?C.priL:"transparent",
    color:active===val?C.pri:C.tx2,
    fontSize:13, fontWeight:active===val?700:500, cursor:"pointer",
    fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
    transition:"all 0.2s", textAlign:"center",
  });

  /* ═══ PROGRESS BAR ═══ */
  const totalSteps = 7; // 0-6
  const progressPct = ((obStep + 1) / totalSteps) * 100;

  const OnboardingProgress = () => (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.tx3 }}>{t("onboarding.stepOf", {current: obStep + 1, total: totalSteps})}</span>
        <span style={{ fontSize:11, fontWeight:700, color:C.pri }}>{Math.round(progressPct)}%</span>
      </div>
      <div style={{ height:4, borderRadius:4, background:C.bg2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${progressPct}%`, borderRadius:4, background:`linear-gradient(90deg,${C.pri},${C.pur})`, transition:"width 0.4s ease" }}/>
      </div>
    </div>
  );

  const BackBtn = () => obStep > 0 ? (
    <button onClick={prevOb} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, color:C.tx3, fontSize:13, fontWeight:600, marginBottom:8, fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif" }}>
      <I.Chv z={16}/> {t("onboarding.back")}
    </button>
  ) : null;

  /* ═══ AUTH SCREEN (before onboarding) ═══ */
  const renderAuth = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:8 }}>
        <div style={{
          width:56, height:56, borderRadius:16, margin:"0 auto 12px",
          background:`linear-gradient(135deg,${C.pri},${C.pur})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 8px 24px ${C.pri}30`,
        }}><I.Heart z={26} sk="white" sw={2}/></div>
        <h1 style={{ fontSize:28, fontWeight:900, color:C.tx, letterSpacing:-0.5 }}>
          Ledora<span style={{ color:C.pri }}>AI</span>
        </h1>
        <p style={{ fontSize:14, color:C.tx2, marginTop:4 }}>Your health, across generations.</p>
      </div>

      {/* Sign In / Sign Up toggle */}
      <div style={{ display:"flex", borderRadius:12, overflow:"hidden", border:`1.5px solid ${C.brd}`, background:C.bg }}>
        <button onClick={()=>{setIsSignUp(false);setErr("");}} style={{
          flex:1, padding:"10px 0", border:"none", fontSize:13, fontWeight:700,
          cursor:"pointer", transition:"all 0.2s",
          background:!isSignUp?C.pri:"transparent", color:!isSignUp?"white":C.tx3,
          fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
        }}>{t("onboarding.signIn")}</button>
        <button onClick={()=>{setIsSignUp(true);setErr("");setResetSent(false)}} style={{
          flex:1, padding:"10px 0", border:"none", fontSize:13, fontWeight:700,
          cursor:"pointer", transition:"all 0.2s",
          background:isSignUp?C.pri:"transparent", color:isSignUp?"white":C.tx3,
          fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
        }}>{t("onboarding.createAccount")}</button>
      </div>

      {/* Form */}
      <div style={cardBox}>
        <div style={{ position:"relative" }}>
          <I.Mail z={16} style={{ position:"absolute", left:14, top:14, color:C.tx3 }}/>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
            placeholder="tu@email.com" style={{...inputStyle, paddingLeft:40}}
            onFocus={(e)=>(e.target.style.borderColor=C.pri)}
            onBlur={(e)=>(e.target.style.borderColor=C.brd)}/>
        </div>
        <div style={{ position:"relative" }}>
          <I.Lock z={16} style={{ position:"absolute", left:14, top:14, color:C.tx3 }}/>
          <input type={showPw?"text":"password"} value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder={isSignUp?t("onboarding.createPassword"):t("onboarding.password")}
            style={{...inputStyle, paddingLeft:40, paddingRight:44}}
            onKeyDown={(e)=>e.key==="Enter"&&handleEmailAuth()}
            onFocus={(e)=>(e.target.style.borderColor=C.pri)}
            onBlur={(e)=>(e.target.style.borderColor=C.brd)}/>
          <button onClick={()=>setShowPw(!showPw)} style={{
            position:"absolute", right:10, top:10, background:"none", border:"none", cursor:"pointer", padding:4,
          }}>
            {showPw?<I.EyeOff z={16} style={{color:C.tx3}}/>:<I.Eye z={16} style={{color:C.tx3}}/>}
          </button>
        </div>

        {/* Password requirements (sign up only) */}
        {isSignUp && password.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:4, padding:"4px 0" }}>
            {pwRules.map((r) => {
              const ok = r.test(password);
              return (
                <div key={r.id} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{
                    width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background:ok?C.sucL:C.bg2, border:`1.5px solid ${ok?C.suc:C.brd}`, transition:"all 0.2s",
                  }}>{ok && <I.Ok z={9} sk={C.suc} sw={3}/>}</div>
                  <span style={{ fontSize:11, color:ok?C.suc:C.tx3, fontWeight:ok?600:400 }}>{t(r.labelKey)}</span>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={handleEmailAuth} style={{...primaryBtn, opacity:(busy||(isSignUp&&!passwordValid(password)&&password.length>0))?0.6:1, pointerEvents:(busy)?"none":"auto"}}>
          {busy?t("onboarding.verifying"):isSignUp?t("onboarding.createAccount"):t("onboarding.signIn")}
        </button>

        {/* Forgot Password */}
        {!isSignUp && (
          resetSent ? (
            <div style={{ padding:"10px 14px", borderRadius:10, background:C.sucL, border:`1px solid ${C.sucS}`, fontSize:12, color:C.suc, fontWeight:600, textAlign:"center" }}>
              {t("onboarding.resetSent")}
            </div>
          ) : (
            <button onClick={handleForgotPassword} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:600, color:C.pri, textAlign:"center", width:"100%", padding:"4px 0", fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif" }}>
              {t("onboarding.forgotPassword")}
            </button>
          )
        )}

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1, height:1, background:C.brd }}/>
          <span style={{ fontSize:12, color:C.tx3, fontWeight:500 }}>o</span>
          <div style={{ flex:1, height:1, background:C.brd }}/>
        </div>

        {/* Google */}
        <button onClick={handleGoogleAuth} style={{
          width:"100%", padding:"12px 20px", borderRadius:12,
          border:`1px solid ${C.brd}`, background:C.card, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          fontSize:14, fontWeight:600, color:C.tx, transition:"all 0.2s",
          fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
        }}>
          <GoogleIcon/> {t("onboarding.continueGoogle")}
        </button>
      </div>

      {/* Error */}
      {err && <div style={{
        padding:"10px 14px", borderRadius:10, background:C.danL,
        border:`1px solid ${C.danS}`, fontSize:12, color:C.dan, fontWeight:600,
      }}>{err}</div>}

      {/* Language Toggle */}
      <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
        {[{code:"es",label:"Español"},{code:"en",label:"English"}].map(lng=>(
          <button key={lng.code} onClick={()=>{i18n.changeLanguage(lng.code);setErr("");setResetSent(false)}} style={{
            padding:"6px 16px", borderRadius:10, fontSize:12, fontWeight:i18n.language?.startsWith(lng.code)?700:500,
            cursor:"pointer", transition:"all 0.2s",
            background:i18n.language?.startsWith(lng.code)?C.pri:"transparent",
            color:i18n.language?.startsWith(lng.code)?"white":C.tx3,
            border:`1px solid ${i18n.language?.startsWith(lng.code)?C.pri:C.brd}`,
            fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
          }}>{lng.label}</button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginTop:4 }}>
        <I.Lock z={11} style={{ color:C.suc, opacity:0.6 }}/>
        <span style={{ fontSize:10.5, color:C.tx3, fontWeight:500 }}>{t("onboarding.securityFooter")}</span>
      </div>
    </div>
  );

  /* ═══ STEP 0: WELCOME POST-SIGNUP ═══ */
  const renderStep0 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:16, textAlign:"center" }}>
      <div style={{
        width:80, height:80, borderRadius:24, margin:"0 auto",
        background:`linear-gradient(135deg,${C.pri},${C.pur})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:`0 12px 32px ${C.pri}30`,
      }}><I.Sparkle z={40} sk="white" sw={1.8}/></div>
      <h1 style={{ fontSize:26, fontWeight:900, color:C.tx }}>
        {user?.displayName ? t("onboarding.welcome.helloUser", {name: user.displayName.split(" ")[0]}) : t("onboarding.welcome.helloDefault")}
      </h1>
      <p style={{ fontSize:14, color:C.tx2, lineHeight:1.6, maxWidth:320, margin:"0 auto" }} dangerouslySetInnerHTML={{__html: t("onboarding.welcome.subtitle1") + " " + t("onboarding.welcome.subtitle2")}} />
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginTop:4 }}>
        {[{icon:"🔒",t:t("onboarding.welcome.badge1")},{icon:"⚡",t:t("onboarding.welcome.badge2")},{icon:"✏️",t:t("onboarding.welcome.badge3")}].map((b)=>(
          <span key={b.t} style={{
            padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600,
            background:C.bg, border:`1px solid ${C.brd}`, color:C.tx2,
          }}>{b.icon} {b.t}</span>
        ))}
      </div>
      <button onClick={nextOb} style={{...primaryBtn, marginTop:8, opacity:1}}>
        {t("onboarding.welcome.startButton")}
      </button>
    </div>
  );

  /* ═══ STEP 1: PERSONAL DATA ═══ */
  const renderStep1 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {BackBtn()}
      <OnboardingProgress/>
      <div style={{ textAlign:"center", marginBottom:4 }}>
        <div style={{
          width:48, height:48, borderRadius:14, margin:"0 auto 10px",
          background:`linear-gradient(135deg,${C.pri}15,${C.pur}15)`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><I.User z={24} style={{color:C.pri}}/></div>
        <h2 style={{ fontSize:22, fontWeight:900, color:C.tx }}>{t("onboarding.step1.title")}</h2>
        <p style={{ fontSize:13, color:C.tx2, marginTop:4 }}>{t("onboarding.step1.subtitle")}</p>
      </div>
      <div style={cardBox}>
        <div>
          <label style={labelStyle}>{t("onboarding.step1.name")}</label>
          <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder={t("onboarding.step1.namePlaceholder")}
            style={inputStyle} onFocus={(e)=>(e.target.style.borderColor=C.pri)} onBlur={(e)=>(e.target.style.borderColor=C.brd)}/>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>{t("onboarding.step1.dob")}</label>
            <input type="date" value={dob} onChange={(e)=>setDob(e.target.value)}
              style={{...inputStyle, colorScheme:"light"}}
              onFocus={(e)=>(e.target.style.borderColor=C.pri)} onBlur={(e)=>(e.target.style.borderColor=C.brd)}/>
          </div>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>{t("onboarding.step1.sex")}</label>
            <select value={sex} onChange={(e)=>setSex(e.target.value)}
              style={{...inputStyle, appearance:"auto", cursor:"pointer"}}>
              <option value="">{t("onboarding.step1.selectSex")}</option>
              <option value="M">{t("onboarding.step1.male")}</option>
              <option value="F">{t("onboarding.step1.female")}</option>
              <option value="O">{t("onboarding.step1.other")}</option>
              <option value="N">{t("onboarding.step1.preferNotSay")}</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t("onboarding.step1.country")}</label>
          <select value={country} onChange={(e)=>setCountry(e.target.value)}
            style={{...inputStyle, appearance:"auto", cursor:"pointer"}}>
            <option value="">{t("onboarding.step1.selectCountry")}</option>
            {COUNTRIES.map((c)=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>{t("onboarding.step1.height")}</label>
            <input type="number" value={height} onChange={(e)=>setHeight(e.target.value)} placeholder="170"
              style={inputStyle} onFocus={(e)=>(e.target.style.borderColor=C.pri)} onBlur={(e)=>(e.target.style.borderColor=C.brd)}/>
          </div>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>{t("onboarding.step1.weight")}</label>
            <input type="number" value={weight} onChange={(e)=>setWeight(e.target.value)} placeholder="70"
              style={inputStyle} onFocus={(e)=>(e.target.style.borderColor=C.pri)} onBlur={(e)=>(e.target.style.borderColor=C.brd)}/>
          </div>
        </div>
      </div>
      <button onClick={nextOb} style={{...primaryBtn, opacity:firstName.trim()?1:0.5}}>
        {t("onboarding.continue")}
      </button>
    </div>
  );

  /* ═══ STEP 2: HEALTH STATUS ═══ */
  const TriToggle = ({ value, onChange, labels=["Sí","No","No lo sé"] }) => (
    <div style={{ display:"flex", gap:6 }}>
      {labels.map((l)=>(
        <button key={l} onClick={()=>onChange(l)} style={triBtn(value,l)}>{l}</button>
      ))}
    </div>
  );

  const renderStep2 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {BackBtn()}
      <OnboardingProgress/>
      <div style={{ textAlign:"center", marginBottom:4 }}>
        <div style={{
          width:48, height:48, borderRadius:14, margin:"0 auto 10px",
          background:`linear-gradient(135deg,${C.pri}15,${C.pur}15)`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><I.Activity z={24} style={{color:C.pri}}/></div>
        <h2 style={{ fontSize:22, fontWeight:900, color:C.tx }}>{t("onboarding.step2.title")}</h2>
        <p style={{ fontSize:13, color:C.tx2, marginTop:4 }}>{t("onboarding.step2.subtitle")}</p>
      </div>
      <div style={{...cardBox, gap:18}}>
        {/* Allergies */}
        <div>
          <label style={labelStyle}>{t("onboarding.step2.allergiesQuestion")}</label>
          <TriToggle value={hasAllergies} onChange={setHasAllergies}/>
          {hasAllergies==="Sí" && (
            <AutocompleteInput options={ALLERGY_OPTIONS} selected={allergiesList} onSelect={(v)=>{setAllergiesList(p=>[...p,v]);setAllergiesText([...allergiesList,v].join(", "))}} onRemove={(v)=>{const next=allergiesList.filter(x=>x!==v);setAllergiesList(next);setAllergiesText(next.join(", "))}} placeholder={t("onboarding.searchAllergies")} />
          )}
        </div>
        {/* Medications */}
        <div>
          <label style={labelStyle}>{t("onboarding.step2.medsQuestion")}</label>
          <TriToggle value={hasMeds} onChange={setHasMeds}/>
          {hasMeds==="Sí" && (
            <AutocompleteInput options={MED_OPTIONS} selected={medsList} onSelect={(v)=>{setMedsList(p=>[...p,v]);setMedsText([...medsList,v].join(", "))}} onRemove={(v)=>{const next=medsList.filter(x=>x!==v);setMedsList(next);setMedsText(next.join(", "))}} placeholder={t("onboarding.searchMeds")} />
          )}
        </div>
        {/* Conditions */}
        <div>
          <label style={labelStyle}>{t("onboarding.step2.conditionsQuestion")}</label>
          <TriToggle value={hasConditions} onChange={setHasConditions}/>
          {hasConditions==="Sí" && (
            <AutocompleteInput options={CONDITION_OPTIONS} selected={conditionsList} onSelect={(v)=>{setConditionsList(p=>[...p,v]);setConditionsText([...conditionsList,v].join(", "))}} onRemove={(v)=>{const next=conditionsList.filter(x=>x!==v);setConditionsList(next);setConditionsText(next.join(", "))}} placeholder={t("onboarding.searchConditions")} />
          )}
        </div>
        {/* Blood type */}
        <div>
          <label style={labelStyle}>{t("onboarding.step2.bloodType")}</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {BLOOD_TYPES.map((bt)=>(
              <button key={bt} onClick={()=>setBloodType(bt)} style={{
                padding:"7px 14px", borderRadius:10, fontSize:13, fontWeight:bloodType===bt?700:500,
                border:`1.5px solid ${bloodType===bt?C.pri:C.brd}`,
                background:bloodType===bt?C.priL:C.card, color:bloodType===bt?C.pri:C.tx2,
                cursor:"pointer", transition:"all 0.2s",
                fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
              }}>{bt}</button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={nextOb} style={primaryBtn}>{t("onboarding.continue")}</button>
    </div>
  );

  /* ═══ STEP 3: FAMILY HISTORY ═══ */
  const toggleFamily = (c) => setFamilyConditions((f) => f.includes(c) ? f.filter((x)=>x!==c) : [...f,c]);
  const renderStep3 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {BackBtn()}
      <OnboardingProgress/>
      <div style={{ textAlign:"center", marginBottom:4 }}>
        <div style={{
          width:48, height:48, borderRadius:14, margin:"0 auto 10px",
          background:`linear-gradient(135deg,${C.pri}15,${C.pur}15)`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><I.Users z={24} style={{color:C.pri}}/></div>
        <h2 style={{ fontSize:22, fontWeight:900, color:C.tx }}>{t("onboarding.step3.title")}</h2>
        <p style={{ fontSize:13, color:C.tx2, marginTop:4 }}>{t("onboarding.step3.subtitle")}</p>
      </div>
      <div style={{...cardBox, padding:18}}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {FAMILY_CONDITIONS.map((c)=>(
            <button key={c} onClick={()=>toggleFamily(c)} style={chipStyle(familyConditions.includes(c))}>
              {familyConditions.includes(c) && <I.Ok z={12} sk={C.pri} sw={2.5}/>} {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding:"8px 14px", borderRadius:10, background:C.priL, border:`1px solid ${C.priS}`, display:"flex", alignItems:"center", gap:8 }}>
        <I.Shield z={14} style={{color:C.pri, flexShrink:0}}/>
        <span style={{ fontSize:11, color:C.tx2 }} dangerouslySetInnerHTML={{__html: t("onboarding.step3.confidential")}} />
      </div>
      <button onClick={nextOb} style={primaryBtn}>{t("onboarding.continue")}</button>
    </div>
  );

  /* ═══ STEP 4: INTEGRATIONS ═══ */
  const toggleIntegration = (id) => setSelectedIntegrations((s) => s.includes(id) ? s.filter((x)=>x!==id) : [...s,id]);
  const renderStep4 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {BackBtn()}
      <OnboardingProgress/>
      <div style={{ textAlign:"center", marginBottom:4 }}>
        <div style={{
          width:48, height:48, borderRadius:14, margin:"0 auto 10px",
          background:`linear-gradient(135deg,${C.pri}15,${C.pur}15)`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><I.Link z={24} style={{color:C.pri}}/></div>
        <h2 style={{ fontSize:22, fontWeight:900, color:C.tx }}>{t("onboarding.step4.title")}</h2>
        <p style={{ fontSize:13, color:C.tx2, marginTop:4 }}>{t("onboarding.step4.subtitle")}</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {INTEGRATIONS.map((itg)=>{
          const active = selectedIntegrations.includes(itg.id);
          return (
            <button key={itg.id} onClick={()=>toggleIntegration(itg.id)} style={{
              display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
              borderRadius:14, border:`1.5px solid ${active?C.pri:C.brd}`,
              background:active?C.priL:C.card, cursor:"pointer", transition:"all 0.2s",
              textAlign:"left", width:"100%",
              fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
            }}>
              <span style={{ fontSize:24 }}>{itg.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.tx }}>{itg.name}</div>
                <div style={{ fontSize:11, color:C.tx3, marginTop:1 }}>{itg.desc}</div>
              </div>
              <div style={{
                width:22, height:22, borderRadius:6,
                border:`2px solid ${active?C.pri:C.brd}`, background:active?C.pri:"transparent",
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
              }}>{active && <I.Ok z={12} sk="white" sw={3}/>}</div>
            </button>
          );
        })}
      </div>
      <button onClick={nextOb} style={primaryBtn}>
        {selectedIntegrations.length > 0 ? t("onboarding.step4.connectButton", {count: selectedIntegrations.length}) : t("onboarding.step4.skipButton")}
      </button>
    </div>
  );

  /* ═══ STEP 5: PERMISSIONS ═══ */
  const PermToggle = ({ label, desc, icon:Ico, value, onChange }) => (
    <button onClick={()=>onChange(!value)} style={{
      display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
      borderRadius:14, border:`1.5px solid ${value?C.suc+"60":C.brd}`,
      background:value?C.sucL:C.card, cursor:"pointer", width:"100%",
      transition:"all 0.2s", textAlign:"left",
      fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
    }}>
      <div style={{
        width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center",
        background:value?`${C.suc}15`:C.bg, transition:"all 0.2s",
      }}><Ico z={20} style={{color:value?C.suc:C.tx3}}/></div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.tx }}>{label}</div>
        <div style={{ fontSize:11, color:C.tx3, marginTop:1 }}>{desc}</div>
      </div>
      <div style={{
        width:44, height:24, borderRadius:12, padding:2,
        background:value?C.suc:C.bg2, transition:"all 0.2s",
        display:"flex", alignItems:"center",
      }}>
        <div style={{
          width:20, height:20, borderRadius:10, background:"white",
          boxShadow:"0 1px 4px rgba(0,0,0,0.15)", transition:"transform 0.2s",
          transform:value?"translateX(20px)":"translateX(0px)",
        }}/>
      </div>
    </button>
  );

  const renderStep5 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {BackBtn()}
      <OnboardingProgress/>
      <div style={{ textAlign:"center", marginBottom:4 }}>
        <div style={{
          width:48, height:48, borderRadius:14, margin:"0 auto 10px",
          background:`linear-gradient(135deg,${C.pri}15,${C.pur}15)`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><I.Shield z={24} style={{color:C.pri}}/></div>
        <h2 style={{ fontSize:22, fontWeight:900, color:C.tx }}>{t("onboarding.step5.title")}</h2>
        <p style={{ fontSize:13, color:C.tx2, marginTop:4, lineHeight:1.5 }}>{t("onboarding.step5.subtitle")}</p>
      </div>

      {/* Recommendation banner */}
      <div style={{ padding:"12px 14px", borderRadius:12, background:`linear-gradient(135deg,${C.priL},${C.purL})`, border:`1px solid ${C.priS}`, display:"flex", alignItems:"flex-start", gap:10 }}>
        <I.Sparkle z={18} style={{color:C.pri, flexShrink:0, marginTop:1}}/>
        <div>
          <span style={{ fontSize:12, fontWeight:700, color:C.pri }}>{t("onboarding.step5.recommended")}</span>
          <p style={{ fontSize:11, color:C.tx2, marginTop:2, lineHeight:1.4 }}>{t("onboarding.step5.recommendedDesc")}</p>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <PermToggle label={t("onboarding.step5.healthData")} desc={t("onboarding.step5.healthDataDesc")} icon={I.Activity} value={permHealth} onChange={setPermHealth}/>
        <PermToggle label={t("onboarding.step5.notifications")} desc={t("onboarding.step5.notificationsDesc")} icon={I.Bell} value={permNotif} onChange={setPermNotif}/>
        <PermToggle label={t("onboarding.step5.camera")} desc={t("onboarding.step5.cameraDesc")} icon={I.Camera} value={permCamera} onChange={setPermCamera}/>
        <PermToggle label={t("onboarding.step5.files")} desc={t("onboarding.step5.filesDesc")} icon={I.File} value={permFiles} onChange={setPermFiles}/>
      </div>

      {/* Security + changeable notes */}
      <div style={{ padding:"10px 14px", borderRadius:10, background:C.sucL, border:`1px solid ${C.sucS}`, display:"flex", alignItems:"flex-start", gap:8 }}>
        <I.Shield z={14} style={{color:C.suc, flexShrink:0, marginTop:1}}/>
        <div>
          <span style={{ fontSize:11, color:C.tx2 }} dangerouslySetInnerHTML={{__html: t("onboarding.step5.secureNote1")}} />
          <p style={{ fontSize:11, color:C.tx2, marginTop:4 }} dangerouslySetInnerHTML={{__html: t("onboarding.step5.secureNote2")}} />
        </div>
      </div>
      <button onClick={nextOb} style={primaryBtn}>{t("onboarding.continue")}</button>
    </div>
  );

  /* ═══ STEP 6: SUMMARY ═══ */
  const profileFields = [firstName, dob, sex, country, height, weight, bloodType];
  const filledCount = profileFields.filter(Boolean).length;
  const profilePct = Math.round((filledCount / profileFields.length) * 100);

  const renderStep6 = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {BackBtn()}
      <OnboardingProgress/>
      <div style={{ textAlign:"center", marginBottom:4 }}>
        <div style={{ position:"relative", width:80, height:80, margin:"0 auto 12px" }}>
          <Ring pct={profilePct} color={C.pri} sz={80} sw={5}/>
          <span style={{
            position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, fontWeight:900, color:C.pri,
          }}>{profilePct}%</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:900, color:C.tx }}>{t("onboarding.step6.title")}</h2>
        <p style={{ fontSize:13, color:C.tx2, marginTop:4 }}>{t("onboarding.step6.subtitle")}</p>
      </div>

      <div style={cardBox}>
        {/* Summary items */}
        {firstName && <SummaryRow icon="👤" label={t("onboarding.step6.name")} value={firstName}/>}
        {dob && <SummaryRow icon="📅" label={t("onboarding.step6.dob")} value={dob}/>}
        {sex && <SummaryRow icon="⚧" label={t("onboarding.step6.sex")} value={{M:t("onboarding.step1.male"),F:t("onboarding.step1.female"),O:t("onboarding.step1.other"),N:t("onboarding.step1.preferNotSay")}[sex]}/>}
        {country && <SummaryRow icon="🌍" label={t("onboarding.step6.country")} value={country}/>}
        {height && <SummaryRow icon="📏" label={t("onboarding.step6.height")} value={`${height} cm`}/>}
        {weight && <SummaryRow icon="⚖️" label={t("onboarding.step6.weight")} value={`${weight} kg`}/>}
        {bloodType && <SummaryRow icon="🩸" label={t("onboarding.step6.bloodType")} value={bloodType}/>}
        {familyConditions.length>0 && <SummaryRow icon="👨‍👩‍👧" label={t("onboarding.step6.familyHistory")} value={`${familyConditions.length} ${t("onboarding.step6.conditions")}`}/>}
        {selectedIntegrations.length>0 && <SummaryRow icon="🔗" label={t("onboarding.step6.integrations")} value={`${selectedIntegrations.length} ${t("onboarding.step6.connected")}`}/>}
      </div>

      {/* Next steps */}
      <div style={{ ...cardBox, background:`linear-gradient(135deg,${C.priL},${C.purL})`, border:`1px solid ${C.priS}` }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.pri, marginBottom:4 }}>
          <I.Zap z={14} style={{verticalAlign:"middle", marginRight:4}}/> {t("onboarding.step6.nextSteps")}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[t("onboarding.step6.nextStep1"),t("onboarding.step6.nextStep2"),t("onboarding.step6.nextStep3")].map((step,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{
                width:20, height:20, borderRadius:6, background:C.pri,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:800, color:"white", flexShrink:0,
              }}>{i+1}</div>
              <span style={{ fontSize:12, color:C.tx2, fontWeight:500 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={()=>completeOnboarding(collectData())} style={{...primaryBtn, opacity:1, background:`linear-gradient(135deg,${C.suc},#1E8A56)`}}>
        <I.Sparkle z={16} sk="white" sw={2} style={{verticalAlign:"middle", marginRight:6}}/> {t("onboarding.step6.enterApp")}
      </button>
    </div>
  );

  const SummaryRow = ({ icon, label, value }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:`1px solid ${C.bg2}` }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span style={{ fontSize:12, color:C.tx3, fontWeight:600, width:90 }}>{label}</span>
      <span style={{ fontSize:13, color:C.tx, fontWeight:700, flex:1 }}>{value}</span>
    </div>
  );

  /* ═══ RENDER ROUTER ═══ */
  const renderStep = () => {
    // Not authenticated yet — show login/signup
    if (authStep !== "authenticated") return renderAuth();
    // Authenticated but onboarding not done — show onboarding steps
    if (!onboardingDone) {
      if (obStep === 0) return renderStep0();
      if (obStep === 1) return renderStep1();
      if (obStep === 2) return renderStep2();
      if (obStep === 3) return renderStep3();
      if (obStep === 4) return renderStep4();
      if (obStep === 5) return renderStep5();
      return renderStep6();
    }
    return null;
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      background:isDesktop?C.card:`linear-gradient(180deg,${C.bg},${C.bg2})`,
      fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
        button{outline:none}input{outline:none}select{outline:none}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .step-anim{animation:fadeSlideIn 0.4s ease-out}
      `}</style>

      {/* Desktop: Left decorative panel */}
      {isDesktop && (
        <div style={{
          width:"45%", minHeight:"100vh", position:"relative", overflow:"hidden",
          background:`linear-gradient(135deg,${C.pri},${C.pur})`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        }}>
          <div style={{ position:"absolute", inset:0, opacity:0.08 }}>
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{
                position:"absolute", width:120+i*40, height:120+i*40,
                borderRadius:"50%", border:"1.5px solid white",
                left:`${10+i*12}%`, top:`${5+i*14}%`,
              }}/>
            ))}
          </div>
          <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:40 }}>
            <div style={{
              width:72, height:72, borderRadius:20, margin:"0 auto 20px",
              background:"rgba(255,255,255,0.15)", backdropFilter:"blur(10px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"1px solid rgba(255,255,255,0.2)",
            }}><I.Heart z={34} sk="white" sw={2}/></div>
            <h1 style={{ fontSize:36, fontWeight:900, color:"white", letterSpacing:-0.5 }}>Ledora AI</h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.7)", marginTop:8, lineHeight:1.5 }}>
              {t("onboarding.heroTagline")}
            </p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:6, fontStyle:"italic" }}>
              {t("onboarding.heroSubtagline")}
            </p>
            <div style={{ marginTop:24, display:"flex", gap:10, justifyContent:"center" }}>
              {[t("onboarding.badgeE2E"),"GDPR","HIPAA"].map((badge)=>(
                <span key={badge} style={{
                  padding:"4px 12px", borderRadius:20, fontSize:10, fontWeight:600,
                  background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.8)",
                  border:"1px solid rgba(255,255,255,0.1)",
                }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right/Main panel */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:isDesktop?"40px 60px":"24px 20px",
        background:isDesktop?C.bg:"transparent",
        overflowY:"auto",
      }}>
        <div style={{
          width:"100%", maxWidth:isDesktop?480:420,
          opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(12px)",
          transition:"opacity 0.28s ease, transform 0.28s ease",
        }} className="step-anim" key={authStep==="authenticated"?`ob-${obStep}`:"auth"}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

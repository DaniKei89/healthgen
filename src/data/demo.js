// ═══════════════════════════════════════════════════════════════
// DEMO DATA — shown to users who have no real data yet.
// This is the single source of truth for all demo/mock content.
// ═══════════════════════════════════════════════════════════════

// Demo user profile
export const DEMO_PROFILE = {
  name: "Carlos Mart\u00ednez",
  firstName: "Carlos",
  age: 34,
  bl: "A+",
  h: "178",
  w: "76",
  bmi: "24.0",
  hr: 68,
  bp: "120/78",
  sp02: 98,
  al: ["Penicilina", "Polen"],
  co: [
    "Soplo card\u00edaco (infancia, resuelto)",
    "Asma leve (infantil, remitido)",
    "Miop\u00eda (-1.5 diop.)",
    "Dermatitis at\u00f3pica (leve)",
  ],
  va: ["COVID-19 (3 dosis)", "T\u00e9tanos", "Hepatitis B", "Gripe 2025"],
  meds: ["Loratadina (estacional)"],
  bid: "HG-7X2K-9M4P-E8RT",
};

// Wearable device data (mock — real integration deferred)
export const DEMO_WEAR = {
  steps: { v: 8432, g: 10000, u: "pasos", l: "Pasos hoy", src: "iPhone", cl: "#4F6AE8" },
  cal: { v: 487, g: 650, u: "kcal", l: "Calor\u00edas", src: "Apple Watch", cl: "#E93D82" },
  sleep: { v: 7.2, g: 8, u: "hrs", l: "Sue\u00f1o", src: "Apple Watch", cl: "#7C66DC" },
  o2: { v: 98, g: 95, u: "%", l: "SpO2", src: "Apple Watch", cl: "#30A46C" },
  hrv: { v: 42, g: 40, u: "ms", l: "VFC", src: "Apple Watch", cl: "#FF8B3E" },
  stand: { v: 10, g: 12, u: "hrs", l: "De pie", src: "Apple Watch", cl: "#0091FF" },
};

// Family tree members (4 generations)
export const DEMO_FAMILY = [
  { id: "gp1", nm: "Antonio M.", rl: "Abuelo Pat.", ag: "82\u2020", bl: "A+", co: ["Hipertensi\u00f3n", "Diabetes T2"], gn: 0, x: 15, y: 10, av: "\ud83d\udc74" },
  { id: "gp2", nm: "Mar\u00eda L.", rl: "Abuela Pat.", ag: "79\u2020", bl: "O+", co: ["Artritis"], gn: 0, x: 38, y: 10, av: "\ud83d\udc75" },
  { id: "gp3", nm: "Jos\u00e9 R.", rl: "Abuelo Mat.", ag: 85, bl: "B+", co: ["Colesterol", "Soplo card\u00edaco"], gn: 0, x: 62, y: 10, av: "\ud83d\udc74" },
  { id: "gp4", nm: "Carmen S.", rl: "Abuela Mat.", ag: "76\u2020", bl: "A-", co: ["C\u00e1ncer mama"], gn: 0, x: 85, y: 10, av: "\ud83d\udc75" },
  { id: "p1", nm: "Miguel M.", rl: "Padre", ag: 62, bl: "A+", co: ["Soplo card\u00edaco", "Hipertensi\u00f3n", "Asma"], gn: 1, x: 26, y: 38, av: "\ud83d\udc68" },
  { id: "p2", nm: "Elena R.", rl: "Madre", ag: 59, bl: "B+", co: ["Hipotiroidismo", "Alergia penicilina", "Miop\u00eda"], gn: 1, x: 74, y: 38, av: "\ud83d\udc69" },
  { id: "me", nm: "Carlos M.", rl: "T\u00fa", ag: 34, bl: "A+", co: ["Soplo card\u00edaco (resuelto)", "Asma leve (remitido)"], gn: 2, x: 40, y: 66, me: 1, av: "\ud83e\uddd1" },
  { id: "s1", nm: "Laura M.", rl: "Hermana", ag: 31, bl: "B+", co: ["Alergia penicilina"], gn: 2, x: 65, y: 66, av: "\ud83d\udc69" },
  { id: "c1", nm: "Sof\u00eda M.", rl: "Hija", ag: 4, bl: "A+", co: [], gn: 3, x: 40, y: 90, av: "\ud83d\udc67" },
];

// Family tree connections (parent → child relationships)
export const DEMO_CONNECTIONS = [
  ["gp1", "p1"], ["gp2", "p1"],
  ["gp3", "p2"], ["gp4", "p2"],
  ["p1", "me"], ["p2", "me"],
  ["p1", "s1"], ["p2", "s1"],
  ["me", "c1"],
];

// Hereditary risk analysis
export const DEMO_RISKS = [
  { p: "Soplo Card\u00edaco", m: ["Jos\u00e9 R.", "Miguel M.", "Carlos M."], i: "Patr\u00f3n en 3 generaciones. Ecocardiograma preventivo recomendado para Sof\u00eda.", c: "#E5484D", risk: 75 },
  { p: "Alergia Penicilina", m: ["Elena R.", "Laura M."], i: "Heredada l\u00ednea materna. Sof\u00eda: 25-50% probabilidad.", c: "#FF8B3E", risk: 40 },
  { p: "Asma", m: ["Miguel M.", "Carlos M."], i: "Patr\u00f3n paterno. Ambos remitidos. Vigilar en Sof\u00eda.", c: "#0091FF", risk: 35 },
  { p: "Hipertensi\u00f3n", m: ["Antonio M.", "Miguel M."], i: "Predisposici\u00f3n paterna. Control tensi\u00f3n desde los 40.", c: "#7C66DC", risk: 55 },
  { p: "Miop\u00eda", m: ["Elena R.", "Carlos M."], i: "L\u00ednea materna. Control anual oftalmol\u00f3gico.", c: "#30A46C", risk: 30 },
  { p: "Diabetes T2", m: ["Antonio M."], i: "Un caso directo. Riesgo moderado.", c: "#E93D82", risk: 20 },
];

// Lab results history (5 data points over 12 months)
export const DEMO_LABS = [
  { d: "Mar 24", ir: 65, vc: 8.2, rb: 4.5, ch: 195, gl: 92, hg: 14.2, wt: 78 },
  { d: "Jun 24", ir: 58, vc: 7.8, rb: 4.3, ch: 201, gl: 88, hg: 13.8, wt: 77 },
  { d: "Sep 24", ir: 52, vc: 6.5, rb: 4.1, ch: 210, gl: 95, hg: 13.5, wt: 79 },
  { d: "Dic 24", ir: 48, vc: 5.9, rb: 4.0, ch: 218, gl: 91, hg: 13.2, wt: 78 },
  { d: "Mar 25", ir: 42, vc: 5.2, rb: 3.9, ch: 225, gl: 97, hg: 12.8, wt: 76 },
];

// AI-generated insights / alerts
export const DEMO_INSIGHTS = [
  { ty: "w", ti: "Hierro en descenso", ds: "35% menos en 12m (65\u219242). Bajo rango. Fatiga y debilidad.", rc: ["M\u00e1s carne roja, lentejas, espinacas", "Combinar hierro con vitamina C", "Evitar t\u00e9/caf\u00e9 en comidas", "Consultar suplementaci\u00f3n"], fd: ["Lentejas", "Espinacas", "H\u00edgado", "Almejas"], ur: "high" },
  { ty: "w", ti: "Vitamina C insuficiente", ds: "8.2\u21925.2 mg/L. Afecta absorci\u00f3n hierro e inmunidad.", rc: ["M\u00e1s c\u00edtricos, kiwi, pimientos", "Zumo naranja en desayuno"], fd: ["Naranja", "Kiwi", "Pimiento", "Br\u00f3coli"], ur: "med" },
  { ty: "a", ti: "Colesterol en ascenso", ds: "195\u2192225 mg/dL, sobre 200. Historial familiar relevante.", rc: ["Reducir grasas saturadas", "M\u00e1s omega-3", "150min/sem ejercicio", "Visita m\u00e9dico"], fd: ["Salm\u00f3n", "Nueces", "Avena", "Aguacate"], ur: "high" },
  { ty: "p", ti: "Glucosa estable", ds: "88-97 mg/dL en rango. Excelente dado antecedente diabetes.", rc: ["Continuar h\u00e1bitos", "Controles anuales"], fd: [], ur: "low" },
];

// Sample documents (mobile format)
export const DEMO_DOCS = [
  { id: 1, n: "Anal\u00edtica Mar 2025", e: "\ud83e\ude78", dt: "15/03/25" },
  { id: 2, n: "Ecocardiograma", e: "\u2764\ufe0f", dt: "10/01/25" },
  { id: 3, n: "Rx t\u00f3rax", e: "\ud83e\uddb4", dt: "05/11/24" },
  { id: 4, n: "RM rodilla", e: "\ud83e\udde0", dt: "20/08/24" },
  { id: 5, n: "Inf. dermatolog\u00eda", e: "\ud83d\udccb", dt: "12/06/24" },
  { id: 6, n: "Rev. oftalmol\u00f3gica", e: "\ud83d\udc41\ufe0f", dt: "03/04/24" },
  { id: 7, n: "Anal\u00edtica Dic 2024", e: "\ud83e\ude78", dt: "18/12/24" },
];

// Sample documents (desktop format — includes type & size)
export const DEMO_DOCS_DESKTOP = [
  { id: 1, n: "Anal\u00edtica Mar 2025", e: "\ud83e\ude78", dt: "15/03/25", type: "Anal\u00edtica", size: "2.4 MB" },
  { id: 2, n: "Ecocardiograma", e: "\u2764\ufe0f", dt: "10/01/25", type: "Informe", size: "5.1 MB" },
  { id: 3, n: "Rx t\u00f3rax", e: "\ud83e\uddb4", dt: "05/11/24", type: "Radiograf\u00eda", size: "8.3 MB" },
  { id: 4, n: "RM rodilla", e: "\ud83e\udde0", dt: "20/08/24", type: "MRI/TAC", size: "12.7 MB" },
  { id: 5, n: "Inf. dermatolog\u00eda", e: "\ud83d\udccb", dt: "12/06/24", type: "Informe", size: "1.1 MB" },
  { id: 6, n: "Rev. oftalmol\u00f3gica", e: "\ud83d\udc41\ufe0f", dt: "03/04/24", type: "Oftalm.", size: "0.8 MB" },
  { id: 7, n: "Anal\u00edtica Dic 2024", e: "\ud83e\ude78", dt: "18/12/24", type: "Anal\u00edtica", size: "2.2 MB" },
];

// Health tips (icon keys map to local I.* icons at render time)
export const DEMO_TIPS = [
  { cat: "diet", title: "Plan anti-an\u00e9mico", desc: "Plan alimenticio semanal optimizado para tu d\u00e9ficit de hierro y vitamina C.", tags: ["Hierro", "Vit C"], icKey: "Leaf", cl: "#30A46C" },
  { cat: "exercise", title: "Cardio anti-colesterol", desc: "Rutina cardiovascular progresiva. 150min/sem seg\u00fan OMS.", tags: ["Colesterol", "30min/d\u00eda"], icKey: "Run", cl: "#0091FF" },
  { cat: "natural", title: "Suplementos naturales", desc: "Espirulina y ortiga como complemento. Consulta con tu m\u00e9dico.", tags: ["Natural", "Hierro"], icKey: "Leaf", cl: "#7C66DC" },
  { cat: "diet", title: "Dieta para la vista", desc: "Rica en lute\u00edna y zeaxantina para tu miop\u00eda.", tags: ["Miop\u00eda", "Lute\u00edna"], icKey: "Eye", cl: "#FF8B3E" },
  { cat: "meds", title: "Interacci\u00f3n: Loratadina", desc: "Sin interacciones con hierro oral. Seguro combinar.", tags: ["Medicaci\u00f3n", "Seguro"], icKey: "Pill", cl: "#E93D82" },
];

// Initial chat messages
export const DEMO_CHAT_INIT = [
  { r: "ai", t: "Hola Carlos \ud83d\udc4b Soy tu asistente m\u00e9dico IA. Puedo analizar tus datos, patrones hereditarios, wearables y m\u00e1s. \u00bfEn qu\u00e9 te ayudo?" },
  { r: "sug", t: null, opts: ["\u00bfPor qu\u00e9 baja mi hierro?", "\u00bfRiesgos para Sof\u00eda?", "\u00bfQu\u00e9 comer esta semana?", "\u00bfMi sue\u00f1o es suficiente?"] },
];

// Pre-loaded AI responses
export const DEMO_AI_RESPONSES = {
  "\u00bfPor qu\u00e9 baja mi hierro?": "Tu hierro baj\u00f3 35% en 12 meses (65\u219242 \u00b5g/dL). Causas probables:\n\n\u2022 **Dieta insuficiente** en hierro hemo\n\u2022 **Baja vitamina C** (5.2 mg/L) dificulta absorci\u00f3n\n\u2022 Posible **malabsorci\u00f3n** intestinal\n\nTu vit C tambi\u00e9n baja crea un c\u00edrculo vicioso.\n\n\u26a0\ufe0f *Consulta con tu m\u00e9dico. Informaci\u00f3n orientativa.*",
  "\u00bfRiesgos para Sof\u00eda?": "An\u00e1lisis hereditario para Sof\u00eda (4 a\u00f1os, A+):\n\n\ud83d\udfe5 **Soplo card\u00edaco** \u2014 75% prob. 3 generaciones. Eco pedi\u00e1trico recomendado.\n\ud83d\udfe7 **Alergia penicilina** \u2014 25-50%. L\u00ednea materna.\n\ud83d\udfe6 **Asma** \u2014 35%. Patr\u00f3n paterno.\n\u2705 **Glucosa** \u2014 Riesgo bajo.\n\n\u26a0\ufe0f *Consulta con el pediatra. Puramente orientativo.*",
  "\u00bfQu\u00e9 comer esta semana?": "Plan semanal para subir hierro y vit C:\n\n**Lun**: Lentejas + pimiento rojo + naranja\n**Mar**: Salm\u00f3n + espinacas\n**Mi\u00e9**: H\u00edgado + br\u00f3coli al vapor\n**Jue**: Garbanzos + espinacas + kiwi\n**Vie**: Almejas + ensalada\n**S\u00e1b**: Pollo + quinoa + aguacate\n**Dom**: Ternera + verduras + fresas\n\n\ud83d\udca1 Zumo naranja con comidas ricas en hierro.\n\u274c Evita caf\u00e9/t\u00e9 durante comidas.\n\n\u26a0\ufe0f *Plan orientativo. Consulta nutricionista.*",
  "\u00bfMi sue\u00f1o es suficiente?": "Seg\u00fan tu Apple Watch, duermes **7.2h/noche** de media.\n\n\u2022 La OMS recomienda **7-9 horas** para adultos\n\u2022 Tu VFC (variabilidad card\u00edaca) es **42ms** \u2014 dentro de rango\n\u2022 Tu SpO2 nocturno es **98%** \u2014 excelente\n\nEst\u00e1s bien, aunque acercarte a 8h mejorar\u00eda recuperaci\u00f3n muscular y consolidaci\u00f3n de memoria.\n\n\u26a0\ufe0f *Datos de wearable. Consulta m\u00e9dico si tienes problemas de sue\u00f1o.*",
};

// Chat suggestion options (reusable)
export const DEMO_CHAT_SUGGESTIONS = [
  "\u00bfPor qu\u00e9 baja mi hierro?",
  "\u00bfRiesgos para Sof\u00eda?",
  "\u00bfQu\u00e9 comer esta semana?",
  "\u00bfMi sue\u00f1o es suficiente?",
];

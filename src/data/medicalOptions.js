// Comprehensive medical options for autocomplete during onboarding.
// These standardize naming so all users select from the same set.

export const ALLERGIES = [
  // Drug allergies
  "Penicilina", "Amoxicilina", "Sulfonamidas", "Aspirina", "Ibuprofeno",
  "Naproxeno", "Cefalosporinas", "Codeína", "Morfina", "Anestesia local",
  "Contraste yodado", "Latex", "Insulina",
  // Food allergies
  "Cacahuete/Maní", "Frutos secos", "Leche/Lácteos", "Huevo", "Trigo/Gluten",
  "Soja", "Mariscos", "Pescado", "Sésamo", "Mostaza", "Apio",
  "Moluscos", "Frutas tropicales", "Chocolate", "Cafeína",
  // Environmental
  "Polen", "Ácaros del polvo", "Moho", "Pelo de gato", "Pelo de perro",
  "Picadura de abeja", "Picadura de avispa", "Níquel", "Fragancias/Perfumes",
  // English equivalents
  "Penicillin", "Amoxicillin", "Sulfonamides", "Aspirin", "Ibuprofen",
  "Naproxen", "Codeine", "Morphine", "Local anesthesia", "Iodine contrast",
  "Latex", "Insulin",
  "Peanut", "Tree nuts", "Milk/Dairy", "Egg", "Wheat/Gluten",
  "Soy", "Shellfish", "Fish", "Sesame", "Mustard", "Celery",
  "Tropical fruits", "Chocolate", "Caffeine",
  "Pollen", "Dust mites", "Mold", "Cat hair", "Dog hair",
  "Bee sting", "Wasp sting", "Nickel", "Fragrances/Perfumes",
];

export const MEDICATIONS = [
  // Pain / Anti-inflammatory
  "Paracetamol/Acetaminofén", "Ibuprofeno", "Naproxeno", "Aspirina",
  "Diclofenaco", "Tramadol", "Codeína",
  // Cardiovascular
  "Atenolol", "Metoprolol", "Amlodipino", "Losartán", "Enalapril",
  "Lisinopril", "Ramipril", "Hidroclorotiazida", "Furosemida",
  "Atorvastatina", "Simvastatina", "Rosuvastatina", "Clopidogrel",
  "Warfarina", "Rivaroxabán", "Apixabán",
  // Diabetes
  "Metformina", "Insulina", "Glibenclamida", "Sitagliptina",
  "Empagliflozina", "Liraglutida", "Semaglutida",
  // Respiratory
  "Salbutamol/Albuterol", "Budesonida", "Fluticasona", "Montelukast",
  "Tiotropio", "Formoterol",
  // Gastrointestinal
  "Omeprazol", "Esomeprazol", "Pantoprazol", "Ranitidina",
  "Domperidona", "Metoclopramida", "Loperamida",
  // Mental health
  "Sertralina", "Fluoxetina", "Escitalopram", "Paroxetina",
  "Venlafaxina", "Duloxetina", "Alprazolam", "Diazepam",
  "Lorazepam", "Quetiapina", "Risperidona", "Litio",
  // Thyroid
  "Levotiroxina", "Metimazol", "Propiltiouracilo",
  // Allergy
  "Loratadina", "Cetirizina", "Desloratadina", "Fexofenadina",
  // Antibiotics
  "Amoxicilina", "Azitromicina", "Ciprofloxacino", "Doxiciclina",
  "Metronidazol", "Clindamicina",
  // Hormones
  "Anticonceptivos orales", "Terapia hormonal", "Testosterona",
  "Prednisona", "Dexametasona", "Hidrocortisona",
  // Supplements
  "Vitamina D", "Vitamina B12", "Hierro", "Ácido fólico",
  "Omega-3", "Calcio", "Magnesio", "Zinc", "Melatonina",
  // English equivalents
  "Acetaminophen", "Ibuprofen", "Naproxen", "Aspirin",
  "Atorvastatin", "Simvastatin", "Metformin", "Insulin",
  "Levothyroxine", "Loratadine", "Cetirizine", "Omeprazole",
  "Sertraline", "Fluoxetine", "Escitalopram", "Alprazolam",
  "Amoxicillin", "Azithromycin", "Birth control pills",
  "Vitamin D", "Vitamin B12", "Iron", "Folic acid",
  "Omega-3", "Calcium", "Magnesium", "Zinc", "Melatonin",
];

export const CONDITIONS = [
  // Cardiovascular
  "Hipertensión", "Hipotensión", "Arritmia", "Fibrilación auricular",
  "Soplo cardíaco", "Insuficiencia cardíaca", "Enfermedad coronaria",
  "Infarto previo", "Aneurisma", "Trombosis venosa", "Varices",
  // Metabolic
  "Diabetes tipo 1", "Diabetes tipo 2", "Prediabetes", "Resistencia a insulina",
  "Colesterol alto", "Triglicéridos altos", "Síndrome metabólico",
  "Obesidad", "Gota", "Hiperuricemia",
  // Respiratory
  "Asma", "EPOC", "Bronquitis crónica", "Apnea del sueño",
  "Rinitis alérgica", "Sinusitis crónica", "Fibrosis pulmonar",
  // Thyroid / Endocrine
  "Hipotiroidismo", "Hipertiroidismo", "Nódulos tiroideos",
  "Síndrome de Cushing", "Insuficiencia suprarrenal",
  // Gastrointestinal
  "Reflujo gastroesofágico", "Gastritis", "Úlcera gástrica",
  "Síndrome de intestino irritable", "Enfermedad de Crohn",
  "Colitis ulcerosa", "Celiaquía", "Intolerancia a la lactosa",
  "Hígado graso", "Cirrosis", "Cálculos biliares",
  // Neurological
  "Migraña", "Cefalea tensional", "Epilepsia", "Esclerosis múltiple",
  "Parkinson", "Alzheimer", "Neuropatía", "Vértigo",
  // Mental health
  "Depresión", "Ansiedad", "Trastorno bipolar", "TDAH",
  "Trastorno de pánico", "TOC", "TEPT", "Insomnio",
  // Musculoskeletal
  "Artritis", "Artritis reumatoide", "Osteoporosis", "Osteoartritis",
  "Fibromialgia", "Hernia discal", "Escoliosis", "Tendinitis",
  // Skin
  "Psoriasis", "Eczema", "Dermatitis atópica", "Acné",
  "Rosácea", "Vitíligo", "Urticaria crónica",
  // Eyes
  "Miopía", "Hipermetropía", "Astigmatismo", "Glaucoma",
  "Cataratas", "Degeneración macular",
  // Kidney / Urinary
  "Enfermedad renal crónica", "Cálculos renales", "Incontinencia",
  "Infecciones urinarias recurrentes",
  // Autoimmune
  "Lupus", "Artritis reumatoide", "Esclerosis múltiple",
  "Enfermedad celíaca", "Tiroiditis de Hashimoto",
  // Cancer history
  "Cáncer de mama", "Cáncer de próstata", "Cáncer de colon",
  "Cáncer de pulmón", "Cáncer de piel/melanoma", "Leucemia", "Linfoma",
  // English equivalents
  "Hypertension", "Arrhythmia", "Heart murmur", "Heart failure",
  "Type 1 diabetes", "Type 2 diabetes", "Prediabetes",
  "High cholesterol", "High triglycerides", "Obesity",
  "Asthma", "COPD", "Sleep apnea", "Allergic rhinitis",
  "Hypothyroidism", "Hyperthyroidism",
  "GERD", "IBS", "Crohn's disease", "Celiac disease", "Lactose intolerance",
  "Migraine", "Epilepsy", "Multiple sclerosis", "Parkinson's",
  "Depression", "Anxiety", "Bipolar disorder", "ADHD", "Insomnia",
  "Arthritis", "Osteoporosis", "Fibromyalgia",
  "Psoriasis", "Eczema", "Acne",
  "Myopia", "Glaucoma", "Cataracts",
  "Chronic kidney disease", "Kidney stones",
  "Lupus", "Breast cancer", "Prostate cancer", "Colon cancer",
];

export const COUNTRIES = [
  // Americas
  "Argentina", "Bolivia", "Brasil", "Canadá", "Chile", "Colombia",
  "Costa Rica", "Cuba", "Ecuador", "El Salvador", "Estados Unidos",
  "Guatemala", "Haití", "Honduras", "Jamaica", "México", "Nicaragua",
  "Panamá", "Paraguay", "Perú", "Puerto Rico", "Rep. Dominicana",
  "Trinidad y Tobago", "Uruguay", "Venezuela",
  // Europe
  "Alemania", "Austria", "Bélgica", "Bulgaria", "Croacia", "Dinamarca",
  "Eslovaquia", "Eslovenia", "España", "Estonia", "Finlandia", "Francia",
  "Grecia", "Hungría", "Irlanda", "Islandia", "Italia", "Letonia",
  "Lituania", "Luxemburgo", "Malta", "Noruega", "Países Bajos", "Polonia",
  "Portugal", "Reino Unido", "República Checa", "Rumanía", "Suecia", "Suiza",
  // Asia & Middle East
  "Arabia Saudita", "China", "Corea del Sur", "Emiratos Árabes Unidos",
  "Filipinas", "India", "Indonesia", "Israel", "Japón", "Malasia",
  "Pakistán", "Singapur", "Tailandia", "Turquía", "Vietnam",
  // Africa
  "Egipto", "Kenia", "Marruecos", "Nigeria", "Sudáfrica", "Tanzania",
  // Oceania
  "Australia", "Nueva Zelanda",
  // Catch-all
  "Otro / Other",
];

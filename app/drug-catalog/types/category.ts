// ─────────────────────────────────────────────────────────────────────────────
// تصنيفات الأدوية (Category Enum)
// ─────────────────────────────────────────────────────────────────────────────
// قائمة شاملة بكل تصنيفات الأدوية الموجودة في كتالوج العيادة.
// كل قيمة هنا هي النص اللي بيظهر للمستخدم (مزيج عربي + إنجليزي للوضوح).
// استخدمنا enum بدل strings مباشرة علشان الـ TypeScript يمسك أي تصنيف مكتوب غلط
// في أي مكان تاني من الكود ويطلع error وقت البناء بدل ما يكسر على المستخدم.
// ─────────────────────────────────────────────────────────────────────────────

export enum Category {
  // مسكنات وخافض حرارة أساسية
  PARACETAMOL = 'Paracetamol',
  IBUPROFEN = 'Ibuprofen',
  DICLOFENAC = 'Diclofenac',

  // مضادات حيوية (Antibiotics) — مرتبة حسب الفصيلة
  AMOXICILLIN_CLAV = 'Amoxicillin Clavulanic',
  CEPHALOSPORINS_G1 = 'Cephalosporins Gen 1 (مضاد حيوي جيل أول)',
  CEPHALOSPORINS_G2 = 'Cephalosporins Gen 2 (مضاد حيوي جيل ثاني)',
  CEPHALOSPORINS_G3 = 'Cephalosporins Gen 3 (مضاد حيوي جيل ثالث)',
  CEPHALOSPORINS_G4 = 'Cephalosporins Gen 4 (مضاد حيوي جيل رابع)',
  TETRACYCLINES = 'Antibiotics - Tetracyclines (مضادات حيوية تتراسيكلين)',
  PENICILLIN = 'Antibiotics - Penicillins (بنسلين)',
  SULFONAMIDES = 'Antibiotics - Sulfonamides (سلفا / حروق)',
  FLUOROQUINOLONES = 'Antibiotics - Fluoroquinolones (كينولون)',
  MACROLIDES = 'Macrolides',
  CARBAPENEMS = 'Antibiotics - Carbapenems (كاربابينيم)',
  LINCOSAMIDES = 'Antibiotics - Lincosamides (كليندامايسين)',
  GLYCOPEPTIDES = 'Antibiotics - Glycopeptides (فانكومايسين / تيكوبلانين)',
  TOPICAL_ANTIBIOTICS = 'Antibiotics - Topical (مضادات حيوية موضعية)',
  ANTIBIOTICS_OPHTHALMIC = 'Antibiotics - Ophthalmic (قطرات عيون مضاد حيوي)',

  // مضادات فيروسات وفطريات ولقاحات وشعر وطفيليات
  ANTIVIRAL = 'Antiviral (مضادات الفيروسات)',
  ANTIFUNGAL = 'Antifungal (مضادات الفطريات)',
  VACCINES = 'Vaccines (لقاحات)',
  HAIR_CARE = 'Hair Care (العناية بالشعر)',
  ANTIPARASITIC = 'Gastro (طفيليات وديدان)',

  // الغدد الصماء والروماتيزم
  DIABETES = 'Diabetes & Endocrine (السكر والغدد الصماء)',
  RHEUMATOLOGY = 'Rheumatology & Immunology (روماتيزم ومناعة)',

  // أدوية السعال والحساسية
  DRY_COUGH = 'Dry Cough (كحة ناشفة)',
  PRODUCTIVE_COUGH = 'Productive Cough (كحة ببلغم)',
  HERBAL_COUGH = 'Herbal Cough (أعشاب/آمن)',
  NON_SEDATING_ANTIHISTAMINE = 'Allergy (مضادات حساسية لا تسبب النعاس)',
  SEDATING_ANTIHISTAMINE = 'Allergy (مضادات حساسية تسبب النعاس)',
  ANTIHISTAMINIC = 'Antihistaminic (مضادات الحساسية)',
  COLD_FLU = 'Respiratory - Cold & Flu (البرد والإنفلونزا)',
  ORAL_CORTICOSTEROIDS = 'Oral Corticosteroids (كورتيزون شراب وأقراص)',

  // الجهاز الهضمي (GIT / Gastro)
  PROTON_PUMP_INHIBITORS = 'GIT - PPIs (علاج حموضة المعدة وارتجاع المريء)',
  H2_BLOCKERS = 'GIT - H2 Blockers (مضادات الهيستامين للمعدة)',
  ANTACIDS = 'GIT - Antacids (فوار ومضادات الحموضة الموضعية)',
  H_PYLORI = 'GIT - H.Pylori (علاج جرثومة المعدة الثلاثي)',
  ANTIEMETIC = 'Gastro - Antiemetics & Antinauseants (مضادات التقيؤ والغثيان)',
  LAXATIVES = 'Gastro - Laxatives (ملينات وعلاج الإمساك)',
  ANTIDIARRHEAL = 'Gastro - Antidiarrheal (مطهر معوي وعلاج الإسهال)',
  IBS_SPASTIC_COLON = 'Gastro - IBS & Spastic Colon (القولون العصبي والتقلصات)',
  LIVER_SUPPORT = 'Gastro - Liver Support (دعم الكبد)',
  WEIGHT_LOSS = 'Weight Loss & Diet (التخسيس وإنقاص الوزن)',
  DIGESTIVE = 'Digestive (مهضم وفاتح شهية)',
  ANTIFLATULENT = 'Gastro - Antiflatulent (طارد للغازات والانتفاخ)',
  GIT_DISTURBANCE = 'Gastro - Disturbance (ماء غريب ومغص الرضع)',
  ANTISPASMODIC = 'Gastro (مغص وتقلصات)',
  DIARRHEA_MANAGEMENT = 'Gastro (علاج الإسهال)',
  GUT_ANTISEPTIC = 'Gastro (مطهر معوي حديث)',
  PROBIOTICS = 'Gastro (بكتيريا نافعة)',
  APPETIZER_LIVER = 'Gastro (فاتح شهية ودعم كبد)',

  // الجهاز التنفسي (Respiratory)
  COPD = 'Respiratory - COPD (الانسداد الرئوي المزمن)',
  BRONCHODILATOR = 'Respiratory - Bronchodilators (موسعات الشعب الهوائية)',
  BRONCHODILATORS = 'Respiratory - Bronchodilators',
  DECONGESTANT = 'Respiratory - Decongestant (مزيل احتقان الأنف)',
  NASAL_DECONGESTANTS = 'Respiratory - Nasal Decongestants',
  SALINE = 'Respiratory - Saline (محلول ملحي)',
  NASAL = 'Respiratory - Nasal (قطرات الأنف)',
  NASAL_ANTI_ALLERGY = 'Respiratory - Nasal Anti Allergy (حساسية الأنف والجيوب الأنفية)',
  COUGH = 'Respiratory - Cough (علاج الكحة)',
  COUGH_1 = 'Respiratory - Cough 1',
  COUGH_2 = 'Respiratory - Cough 2',

  // عناية عامة بالفم والحلق والأنف والأذن والمسالك البولية
  MOUTH_THROAT = 'Mouth & Throat (العناية بالفم والحلق)',
  NASAL_CARE = 'Nasal Care (العناية بالأنف)',
  EAR_CARE = 'Ear Care (العناية بالأذن)',
  URINARY_CARE = 'Urinary (مسالك بولية)',

  // فيتامينات ومكملات
  MULTI_VITAMINS = 'Vitamins & Supplements (فيتامينات ومكملات)',
  DIETARY_SUPPLEMENTS = 'Dietary Supplements (مكملات غذائية ومناعة)',
  VITAMINS_MINERALS = 'Vitamins (الفيتامينات والمعادن)',

  // الجلدية والعناية بالبشرة
  TOPICAL_CARE = 'Topical (كريمات ودهانات موضعي)',
  DERMA_CARE = 'Dermatology (جلدية وتلطيف)',
  SKIN_CARE = 'Skin Care Products (عناية بالبشرة ومستحضرات تجميل)',

  // أمراض النساء (Gynecology)
  CONTRACEPTION = 'Gynecology - Contraception (منع الحمل)',
  UTEROTONICS = 'Gynecology - Uterotonics (منشطات الرحم)',
  MENSTRUAL_PAIN_RELIEF = 'Gynecology - Menstrual Pain Relief (آلام الدورة)',
  LACTAGOGUE = 'Gynecology - Lactagogue (مدرات اللبن)',
  PROLACTIN_INHIBITORS_GYN = 'Gynecology - Prolactin Inhibitors (مثبطات البرولاكتين)',
  VAGINAL_CARE = 'Gynecology - Vaginal Care (عناية مهبلية)',
  VAGINAL_INFECTIONS = 'Gynecology - Vaginal Infections (التهابات مهبلية)',
  VAGINAL_ANTIFUNGAL = 'Gynecology - Vaginal Antifungal (مضادات فطريات مهبلية)',
  ANTI_ESTROGEN = 'Oncology - Anti-Estrogen (مضادات الإستروجين)',
  PROGESTOGENS = 'Gynecology - Progestogens (بروجستيرون ومشتقاته)',
  HORMONE_REPLACEMENT_THERAPY = 'Gynecology - Hormone Replacement Therapy (العلاج الهرموني التعويضي)',
  FEMALE_HORMONES = 'Gynecology - Female Hormones (هرمونات نسائية)',
  INFERTILITY = 'Gynecology - Infertility (الخصوبة والعقم)',
  MALE_FERTILITY = 'Infertility - Male Fertility (خصوبة الرجال)',
  INFERTILITY_HMG = 'Infertility - HMG / Menotropins (HMG/مينوتروبين)',
  INFERTILITY_HCG = 'Infertility - HCG (HCG/هرمون الحمل)',
  INFERTILITY_FSH = 'Infertility - FSH (FSH/منشطات)',
  OVULATION_INDUCER = 'Infertility - Ovulation Inducer (منشطات التبويض)',
  AROMATASE_INHIBITOR = 'Infertility - Aromatase Inhibitor (مثبطات الأروماتاز)',

  // أخرى (Misc)
  ANTI_ACNE = 'Anti-Acne Preparations (علاج حب الشباب)',
  PSORIASIS = 'Dermatology - Psoriasis (الصدفية)',
  NEBULIZER = 'Respiratory (جلسات نيبوليزر)',
  OPHTHALMIC = 'Ophthalmic (قطرات عيون)',
  ANTI_INFLAMMATORY_EDEMA = 'Anti-inflammatory (مضاد للتورم والتهاب الزور)',
  IMMUNITY_OMEGA = 'Immunity & Omega (مناعة وأوميجا ٣)',
  CALCIUM_GROWTH = 'Calcium (كالسيوم ونمو)',
  BONE_SUPPORT = 'Bone Support (دعم العظام والغضاريف)',
  LICE_SCABIES = 'Hygiene (قمل وجرب)',
  FIRST_AID = 'Emergency (حروق وكدمات)',

  // الدم والتجلط (Hematology)
  HEMATOLOGY = 'Hematology (أدوية الدم والنزيف)',
  ANTIHEMORRHAGIC = 'Antihemorrhagic (مضادات النزيف)',
  SPECIALIZED_HEMATOLOGY = 'Specialized Hematology (أدوية دم متخصصة)',
  CORTICOSTEROID = 'Corticosteroid (كورتيزون)',
  VITAMIN_SUPPLEMENT = 'Vitamin Supplement (مكملات فيتامينات)',
  AMINOGLYCOSIDES = 'Antibiotics - Aminoglycosides (مضادات حيوية أمينوجليكوزيد)',

  // أدوية القلب والأوعية الدموية (Cardiovascular)
  ANTIHYPERLIPIDEMICS = 'Cardiovascular - Antihyperlipidemics (أدوية الكوليسترول والدهون)',
  ORTHOSTATIC_HYPOTENSION = 'Cardiovascular - Orthostatic Hypotension (علاج هبوط ضغط الدم)',
  ANTI_ISCHEMIC = 'Cardiovascular - Anti-Ischemic (قصور الدورة الدموية والذبحة)',
  HEART_FAILURE = 'Cardiovascular - Heart Failure (قصور عضلة القلب)',
  ANTIARRHYTHMIC = 'Cardiovascular - Antiarrhythmics (منظمات ضربات القلب)',
  LOOP_DIURETICS = 'Cardiovascular - Diuretics (مدرات البول - Loop)',
  THIAZIDE_DIURETICS = 'Cardiovascular - Diuretics (مدرات البول - Thiazide Combo)',
  THIAZIDE_LIKE_DIURETICS = 'Cardiovascular - Diuretics (مدرات البول - Thiazide Like / Indapamide)',
  POTASSIUM_SPARING_DIURETICS = 'Cardiovascular - Diuretics (مدرات البول - Potassium Sparing)',
  ALDOSTERONE_ANTAGONISTS = 'Cardiovascular - Diuretics (Aldosterone Antagonists)',
  CARBONIC_ANHYDRASE_INHIBITORS = 'Cardiovascular - Diuretics (Carbonic Anhydrase Inhibitors)',
  VASODILATORS = 'Cardiovascular - Vasodilators (Alpha Blockers)',
  BETA_BLOCKERS = 'Cardiovascular - Beta Blockers (Plain/Combined)',
  CALCIUM_CHANNEL_BLOCKERS = 'Cardiovascular - Calcium Channel Blockers (CCB)',
  ACE_INHIBITORS = 'Cardiovascular - ACE Inhibitors (ACEi)',
  ARBS = 'Cardiovascular - ARBs (Angiotensin II Receptor Blockers)',

  // الجهاز العصبي والنفسي (Nervous System)
  ANALGESICS = 'Analgesics (مسكنات الألم وخافض حرارة)',
  ANTIEPILEPTICS = 'Nervous System - Antiepileptics (الصرع والتشنجات والتهاب الأعصاب)',
  ANTI_PARKINSON = 'Nervous System - Anti-Parkinson (الشلل الرعاش)',
  ANTIDEPRESSANTS = 'Nervous System - Antidepressants (مضادات الاكتئاب)',
  ADHD_NOOTROPICS = 'Nervous System - ADHD & Nootropics (فرط الحركة والذاكرة)',
  ANTIPSYCHOTIC = 'Nervous System - Antipsychotics (مضادات الذهان)',
  HYPNOTICS_SEDATIVES = 'Nervous System - Hypnotics & Sedatives (منومات ومهدئات)',
  DEMENTIA = 'Nervous System - Dementia (الخرف والزهايمر)',
  VERTIGO = 'Nervous System - Vertigo (الدوخة والدوار)',

  // العظام والعضلات (Musculoskeletal)
  MUSCULOSKELETAL = 'Musculoskeletal System (عظام وعضلات)',
  MUSCLE_RELAXANTS = 'Skeletal Muscle Relaxants (مرخيات العضلات)',
  ANTI_RHEUMATIC_OSTEOARTHRITIS = 'Anti-rheumatic & Osteoarthritis (روماتيزم وخشونة)',
  ANTI_GOUT = 'Anti-Gout (النقرس وحمض اليوريك)',

  // أورام ومناعة
  ANTI_NEOPLASTIC_IMMUNOMODULATING = 'Anti-Neoplastic & Immunomodulating (أورام ومناعة)',

  // تصنيفات ثابتة قديمة مستخدمة في بعض الوصفات الجاهزة أو الأدوية المخصصة
  // الحفاظ عليها ضروري للتوافق مع البيانات القديمة المخزنة في Firestore
  COMMON_COLD = "COMMON_COLD",
  ANTICHOLINERGICS = "ANTICHOLINERGICS",
  ACID_RELATED_DISORDERS = "ACID_RELATED_DISORDERS",
  ANTIBIOTICS = "ANTIBIOTICS",
  STEROIDS = "STEROIDS",
  VASOPRESSORS = "VASOPRESSORS",
  ANTIHYPERTENSIVE = "ANTIHYPERTENSIVE",
  DIURETIC = "DIURETIC",
  ANTIBIOTIC_SUSPENSIONS = "ANTIBIOTIC_SUSPENSIONS",
  ANTIANEMIC = "ANTIANEMIC",
  ANTIPLATELET = "ANTIPLATELET",
  ANTICOAGULANT = "ANTICOAGULANT",
  DIRECT_THROMBIN_INHIBITOR = "DIRECT_THROMBIN_INHIBITOR",
  HEMORRHOIDS = 'Hemorrhoids (البواسير)',
  IMMUNITY_AND_ANEMIA = "IMMUNITY_AND_ANEMIA"
}

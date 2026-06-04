export type RenalDoseStatus = 'normal' | 'adjust' | 'avoid' | 'insufficient_data';

export interface LocalRenalDoseResult {
  status: RenalDoseStatus;
  resolvedDrugName: string;
  recommendation: string;
  reasoning: string;
  reference: string;
  criticalNote: string | null;
  isInsufficientData: boolean;
}

type LocalRenalRule = {
  genericName: string;
  aliases: string[];
  reference: string;
  reason: string;
  note?: string;
  evaluate: (crcl: number) => Omit<LocalRenalDoseResult, 'resolvedDrugName' | 'reference' | 'reasoning' | 'isInsufficientData'>;
};

const normalizeDrugName = (value: string): string => value
  .toLowerCase()
  .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
  .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  .replace(/\d+(\.\d+)?\s*(mg\/ml|mg\/kg|mcg\/ml|mg|mcg|µg|ug|g|gm|ml|iu|kg|%)\b/gi, ' ')
  .replace(/\b(tablets?|tabs?|capsules?|caps?|syrup|drops?|amp(?:oules?)?|vials?|cream|gel|injections?|inj|suspensions?|susp|solutions?|sol|spray|patch(?:es)?|sachets?|ointment|lozenges?|effervescent|xr|sr|cr|mr|retard)\b/gi, ' ')
  .replace(/[.,\-_/\\(){}[\]:;|+]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const mentionsAny = (normalizedInput: string, aliases: string[]): boolean => {
  const padded = ` ${normalizedInput} `;
  return aliases.some((alias) => {
    const normalizedAlias = normalizeDrugName(alias);
    if (!normalizedAlias) return false;
    return padded.includes(` ${normalizedAlias} `) || normalizedAlias.includes(normalizedInput);
  });
};

const fda = 'FDA Label';

const rules: LocalRenalRule[] = [
  {
    genericName: 'Metformin',
    aliases: ['metformin', 'glucophage', 'cidophage', 'amophage', 'dialon', 'metfor', 'metformin hydrochloride'],
    reference: fda,
    reason: 'Metformin exposure and lactic acidosis risk rise as kidney function falls.',
    note: 'Use eGFR for final metformin decisions when available; CrCl is only a practical screen here.',
    evaluate: (crcl) => {
      if (crcl < 30) {
        return {
          status: 'avoid',
          recommendation: 'تجنب/أوقف metformin عند CrCl أقل من 30 مل/دقيقة.',
          criticalNote: 'خطر lactic acidosis أعلى مع القصور الكلوي الشديد أو الجفاف أو الصبغة.',
        };
      }
      if (crcl < 45) {
        return {
          status: 'adjust',
          recommendation: 'لا تبدأ metformin غالبا؛ لو مستخدم بالفعل قلل الجرعة وراجع eGFR والمتابعة.',
          criticalNote: 'أوقفه مؤقتا قبل الصبغة iodinated contrast حسب عوامل الخطورة.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل جرعة كلوية واضح عند هذه القيمة، مع متابعة وظائف الكلى.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Amoxicillin/clavulanate',
    aliases: ['amoxicillin clavulanate', 'amoxicillin clavulanic', 'augmentin', 'hibiotic', 'e-moxclav', 'megamox', 'clavimox', 'curam'],
    reference: fda,
    reason: 'Amoxicillin is primarily renally cleared; high-strength tablets are not recommended below 30 mL/min.',
    evaluate: (crcl) => {
      if (crcl < 10) {
        return {
          status: 'adjust',
          recommendation: 'تجنب تركيز 875/125 mg؛ استخدم 500/125 mg أو 250/125 mg كل 24 ساعة حسب شدة العدوى.',
          criticalNote: 'راجع حساسية البنسلين، شدة العدوى، ووظائف الكبد.',
        };
      }
      if (crcl < 30) {
        return {
          status: 'adjust',
          recommendation: 'تجنب تركيز 875/125 mg؛ استخدم 500/125 mg أو 250/125 mg كل 12 ساعة حسب شدة العدوى.',
          criticalNote: 'لا تستخدم قرص 875 mg عندما GFR/CrCl أقل من 30 مل/دقيقة.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى عادة عند CrCl 30 مل/دقيقة أو أعلى.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Ciprofloxacin',
    aliases: ['ciprofloxacin', 'cipro', 'ciprobay', 'ciprocin', 'ciproxin', 'ciproflox'],
    reference: fda,
    reason: 'Ciprofloxacin is substantially renally eliminated and needs interval adjustment in renal impairment.',
    evaluate: (crcl) => {
      if (crcl < 30) {
        return {
          status: 'adjust',
          recommendation: 'للفم: 250-500 mg كل 18 ساعة تقريبا؛ للوريد غالبا كل 18-24 ساعة حسب العدوى.',
          criticalNote: 'تجنب مع QT risk شديد؛ افصل عن الحديد/الكالسيوم/مضادات الحموضة.',
        };
      }
      if (crcl <= 50) {
        return {
          status: 'adjust',
          recommendation: 'للفم: 250-500 mg كل 12 ساعة حسب نوع وشدة العدوى.',
          criticalNote: 'راقب أعراض الأوتار وQT والجلوكوز خاصة في كبار السن.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى عادة عند CrCl أعلى من 50 مل/دقيقة.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Levofloxacin',
    aliases: ['levofloxacin', 'levoflox', 'tavanic', 'levaquin', 'levonic'],
    reference: fda,
    reason: 'Levofloxacin clearance falls when CrCl is below 50 mL/min, causing accumulation.',
    evaluate: (crcl) => {
      if (crcl < 20) {
        return {
          status: 'adjust',
          recommendation: 'إذا الجرعة المعتادة 500 mg يوميا: 500 mg جرعة أولى ثم 250 mg كل 48 ساعة.',
          criticalNote: 'عدّل حسب الجرعة الأصلية والمؤشر المرضي؛ راقب QT والأوتار وCNS.',
        };
      }
      if (crcl < 50) {
        return {
          status: 'adjust',
          recommendation: 'إذا الجرعة المعتادة 500 mg يوميا: 500 mg جرعة أولى ثم 250 mg كل 24 ساعة.',
          criticalNote: 'في نظام 750 mg يوميا غالبا تصبح 750 mg كل 48 ساعة.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى عادة عند CrCl 50 مل/دقيقة أو أعلى.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Cefdinir',
    aliases: ['cefdinir', 'omnicef', 'cefdin', 'dinir'],
    reference: fda,
    reason: 'Cefdinir exposure persists longer when CrCl is below 30 mL/min.',
    evaluate: (crcl) => {
      if (crcl < 30) {
        return {
          status: 'adjust',
          recommendation: 'للبالغين: 300 mg مرة يوميا بحد أقصى عند CrCl أقل من 30 مل/دقيقة.',
          criticalNote: 'للأطفال: راجع جرعة mg/kg المناسبة ولا تتجاوز الحد اليومي المعدل.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى عادة عند CrCl 30 مل/دقيقة أو أعلى.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Fluconazole',
    aliases: ['fluconazole', 'diflucan', 'flucoral', 'fungican', 'flucazole'],
    reference: fda,
    reason: 'Fluconazole is mainly renally cleared; maintenance dose is reduced after a loading dose.',
    evaluate: (crcl) => {
      if (crcl <= 50) {
        return {
          status: 'adjust',
          recommendation: 'أعط جرعة تحميل كاملة، ثم استخدم 50% من جرعة الصيانة المعتادة.',
          criticalNote: 'لا تطبق التخفيض على الجرعة الواحدة فقط؛ راقب QT والكبد والتداخلات.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى عادة عند CrCl أعلى من 50 مل/دقيقة.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Acyclovir',
    aliases: ['acyclovir', 'aciclovir', 'zovirax', 'cyclovir'],
    reference: fda,
    reason: 'Acyclovir is renally eliminated and can cause crystal nephropathy/neurotoxicity if accumulated.',
    evaluate: (crcl) => {
      if (crcl <= 10) {
        return {
          status: 'adjust',
          recommendation: 'للنظام 200 mg خمس مرات يوميا: عدله إلى 200 mg كل 12 ساعة.',
          criticalNote: 'الجرعات الأعلى للهربس/الحزام الناري لها جداول مختلفة؛ حافظ على hydration.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'غالبا لا يحتاج تعديل للنظام 200 mg خمس مرات يوميا إذا CrCl أعلى من 10.',
        criticalNote: 'للجرعات الأعلى راجع جدول acyclovir حسب المؤشر المرضي.',
      };
    },
  },
  {
    genericName: 'Famotidine',
    aliases: ['famotidine', 'pepcid', 'famotin', 'gastrogen', 'famodar'],
    reference: fda,
    reason: 'Famotidine exposure increases in moderate to severe renal impairment.',
    evaluate: (crcl) => {
      if (crcl < 30) {
        return {
          status: 'adjust',
          recommendation: 'خفض الجرعة 50% أو مدد الفاصل إلى 36-48 ساعة حسب المؤشر والجرعة المتاحة.',
          criticalNote: 'راقب confusion أو CNS effects خاصة في كبار السن.',
        };
      }
      if (crcl < 60) {
        return {
          status: 'adjust',
          recommendation: 'خفض الجرعة 50% أو مدد الفاصل إلى 24-36 ساعة حسب المؤشر.',
          criticalNote: null,
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى عادة عند CrCl 60 مل/دقيقة أو أعلى.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Gabapentin',
    aliases: ['gabapentin', 'neurontin', 'gaptin', 'conventin', 'gabalepsy'],
    reference: fda,
    reason: 'Gabapentin is renally cleared and needs dose range reduction by CrCl.',
    evaluate: (crcl) => {
      if (crcl < 15) {
        return {
          status: 'adjust',
          recommendation: '100-300 mg/day تقريبا؛ خفض أكثر بالتناسب إذا CrCl أقل من 15.',
          criticalNote: 'راقب sedation, dizziness, ataxia؛ يحتاج نظام خاص مع hemodialysis.',
        };
      }
      if (crcl < 30) {
        return {
          status: 'adjust',
          recommendation: '200-700 mg/day كجرعة يومية واحدة غالبا.',
          criticalNote: 'ابدأ منخفضا وزد تدريجيا حسب الاستجابة والتحمل.',
        };
      }
      if (crcl < 60) {
        return {
          status: 'adjust',
          recommendation: '400-1400 mg/day مقسمة غالبا على جرعتين.',
          criticalNote: 'راقب النعاس والدوخة خاصة مع opioids أو كبار السن.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'جرعات البالغين المعتادة غالبا ضمن 900-3600 mg/day مقسمة حسب المؤشر.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Pregabalin',
    aliases: ['pregabalin', 'lyrica', 'lyrolin', 'pagamax', 'pregavax'],
    reference: fda,
    reason: 'Pregabalin is primarily renally eliminated and dosing is based on CrCl.',
    evaluate: (crcl) => {
      if (crcl < 15) {
        return {
          status: 'adjust',
          recommendation: '25-75 mg/day إجمالي يومي غالبا حسب الجرعة الأصلية والمؤشر.',
          criticalNote: 'يلزم جرعة إضافية بعد hemodialysis عند مستخدمي الغسيل.',
        };
      }
      if (crcl < 30) {
        return {
          status: 'adjust',
          recommendation: '25-150 mg/day إجمالي يومي غالبا على جرعة واحدة أو جرعتين.',
          criticalNote: 'راقب sedation والدوخة والوذمة.',
        };
      }
      if (crcl < 60) {
        return {
          status: 'adjust',
          recommendation: '75-300 mg/day إجمالي يومي غالبا مقسمة على جرعتين أو ثلاث.',
          criticalNote: null,
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى عادة عند CrCl 60 مل/دقيقة أو أعلى.',
        criticalNote: null,
      };
    },
  },
  {
    genericName: 'Enoxaparin',
    aliases: ['enoxaparin', 'lovenox', 'clexane', 'enoxa', 'low molecular weight heparin'],
    reference: fda,
    reason: 'Enoxaparin exposure increases significantly when CrCl is below 30 mL/min.',
    evaluate: (crcl) => {
      if (crcl < 30) {
        return {
          status: 'adjust',
          recommendation: 'للعلاج الكامل: 1 mg/kg SC مرة يوميا بدلا من كل 12 ساعة؛ الوقاية غالبا 30 mg يوميا.',
          criticalNote: 'راقب النزيف والصفائح؛ anti-Xa قد يلزم في الحمل/السمنة/الفشل الكلوي الشديد.',
        };
      }
      return {
        status: 'normal',
        recommendation: 'لا يحتاج تعديل كلوى إلزامي عادة عند CrCl 30 مل/دقيقة أو أعلى.',
        criticalNote: 'راقب النزيف خاصة مع كبار السن أو مضادات الصفائح.',
      };
    },
  },
];

export const getLocalRenalDoseAdjustment = (drugName: string, crcl: number): LocalRenalDoseResult | null => {
  const normalizedInput = normalizeDrugName(drugName);
  if (!normalizedInput || !Number.isFinite(crcl) || crcl <= 0) return null;

  const rule = rules.find((candidate) => mentionsAny(normalizedInput, [candidate.genericName, ...candidate.aliases]));
  if (!rule) return null;

  const evaluated = rule.evaluate(crcl);
  return {
    ...evaluated,
    resolvedDrugName: rule.genericName,
    reasoning: rule.reason,
    reference: rule.reference,
    criticalNote: evaluated.criticalNote ?? rule.note ?? null,
    isInsufficientData: false,
  };
};


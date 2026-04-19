import type { Medication } from '../../types';
import { Category } from '../../types';

const uniq = (arr: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const s = (item ?? '').toString().trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
};

const commonGynBoost = (m: Medication): string[] => {
  const n = (m.name || '').toString().toLowerCase();
  const g = (m.genericName || '').toString().toLowerCase();
  const c = (m.concentration || '').toString().toLowerCase();

  const boost: string[] = [
    '#gyn',
    'gyn',
    'gynecology',
    'gynaecology',
    'obgyn',
    'women',
    'womens health',
    'women health',
    'نساء',
    'نسائي',
    'امراض نساء',
  ];

  // Common unit tokens for injectables
  if (c.includes('iu') || n.includes('iu') || n.includes('i.u') || n.includes('i.u.') || n.includes('i.u')) {
    boost.push('iu', 'i.u', 'international unit', 'international units', 'وحده دوليه', 'وحدة دولية', 'وحدات دولية');
  }

  // Form hints
  if (n.includes('pen') || (m.form || '').toString().toLowerCase().includes('pen')) {
    boost.push('pen', 'قلم', 'قلم حقن');
  }
  if (n.includes('ovule') || n.includes('ovules')) boost.push('ovules', 'ovule', 'اوڤيول', 'أوفيل', 'لبوس مهبلي');
  if (n.includes('supp') || n.includes('suppos')) boost.push('suppository', 'supp', 'لبوس', 'تحاميل');
  if (n.includes('cream')) boost.push('cream', 'كريم');
  if (n.includes('caps')) boost.push('caps', 'capsule', 'كبسول');
  if (n.includes('tab')) boost.push('tab', 'tablet', 'اقراص', 'أقراص');

  // Category-based boosts
  switch (m.category) {
    case Category.CONTRACEPTION:
      boost.push('contraception', 'contraceptive', 'family planning', 'منع حمل', 'حبوب منع الحمل', 'تنظيم الاسره', 'تنظيم الأسرة');
      break;
    case Category.UTEROTONICS:
      boost.push('uterotonic', 'postpartum hemorrhage', 'pph', 'منشط رحم', 'منشطات الرحم', 'نزيف بعد الولاده', 'نزيف بعد الولادة');
      break;
    case Category.MENSTRUAL_PAIN_RELIEF:
      boost.push('dysmenorrhea', 'period pain', 'menstrual pain', 'الم الدورة', 'آلام الدورة', 'عسر الطمث');
      break;
    case Category.LACTAGOGUE:
      boost.push('lactation', 'lactagogue', 'galactagogue', 'breastfeeding', 'رضاعه', 'رضاعة', 'زيادة اللبن', 'ادرار اللبن', 'إدرار اللبن');
      break;
    case Category.PROLACTIN_INHIBITORS_GYN:
      boost.push('prolactin', 'prolactin inhibitor', 'cabergoline', 'هرمون الحليب', 'برولاكتين', 'ايقاف اللبن', 'إيقاف اللبن');
      break;
    case Category.VAGINAL_CARE:
      boost.push('intimate', 'intimate wash', 'vaginal care', 'عناية مهبلية', 'غسول مهبلي', 'غسول');
      break;
    case Category.VAGINAL_INFECTIONS:
      boost.push('vaginitis', 'vaginal infection', 'itching', 'discharge', 'التهاب مهبلي', 'التهابات مهبلية', 'حكة', 'حكه', 'افرازات', 'إفرازات');
      break;
    case Category.VAGINAL_ANTIFUNGAL:
      boost.push('antifungal', 'candida', 'yeast', 'fungal', 'فطريات', 'كانديدا');
      break;
    case Category.ANTI_ESTROGEN:
      boost.push('anti estrogen', 'anti-estrogen', 'serm', 'breast cancer', 'سرطان الثدي', 'اورام', 'أورام');
      break;
    case Category.PROGESTOGENS:
      boost.push('progesterone', 'progestogen', 'luteal support', 'تثبيت الحمل', 'بروجستيرون', 'بروجسترون', 'هرمون الحمل');
      break;
    case Category.HORMONE_REPLACEMENT_THERAPY:
      boost.push('hrt', 'menopause', 'perimenopause', 'سن اليأس', 'انقطاع الطمث', 'هبات ساخنة', 'hot flashes');
      break;
    case Category.INFERTILITY:
    case Category.MALE_FERTILITY:
    case Category.INFERTILITY_HMG:
    case Category.INFERTILITY_HCG:
    case Category.INFERTILITY_FSH:
    case Category.OVULATION_INDUCER:
    case Category.AROMATASE_INHIBITOR:
      boost.push('infertility', 'fertility', 'ivf', 'icsi', 'ovulation', 'عقم', 'تأخر حمل', 'تأخر الانجاب', 'تأخر الإنجاب', 'تنشيط', 'تنشيط التبويض');
      break;
    default:
      break;
  }

  // GenericName + some common Arabic transliterations when obvious
  if (g.includes('progesterone')) boost.push('progesterone', 'بروجستيرون', 'بروجسترون');
  if (g.includes('dydrogesterone')) boost.push('dydrogesterone', 'ديدروجيستيرون', 'ديدروجستيرون');
  if (g.includes('norethisterone')) boost.push('norethisterone', 'نوريثيستيرون', 'نوريثيسترون');
  if (g.includes('clomiphene')) boost.push('clomiphene', 'كلوميفين', 'كلوميد');
  if (g.includes('letrozole')) boost.push('letrozole', 'ليتروزول', 'فيمارا');
  if (g.includes('cabergoline')) boost.push('cabergoline', 'كابيرجولين', 'دوستينيكس');

  // A few helpful tokens from name itself
  if (n.includes('gonal')) boost.push('gonal', 'جونال', 'جونال اف', 'gonal-f');
  if (n.includes('epifasi')) boost.push('ايبيفاسي', 'epifasi');
  if (n.includes('meriofert')) boost.push('ميريوفيرت', 'meriofert');

  return boost;
};

export const enhanceGynMedicationList = (list: Medication[]): Medication[] => {
  return list.map(m => ({
    ...m,
    matchKeywords: uniq([...(m.matchKeywords || []), ...commonGynBoost(m)]),
  }));
};


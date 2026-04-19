
import { Medication, Category } from '../../types';

const fixed = (text: string) => (_w: number, _a: number) => text;

const VITAMIN_E_WARNINGS = [
  'لا تتجاوز الجرعة اليومية الموصى بها.',
  'يُفضّل تناوله مع وجبة تحتوي على دهون لزيادة الامتصاص.',
  'يُستخدم بحذر مع أدوية السيولة (مثل وارفارين/أسبرين بجرعات عالية) لأنه قد يزيد خطر النزف.',
  'أوقف قبل العمليات الجراحية بأسبوعين على الأقل.',
];

export const VITAMIN_E_GROUP: Medication[] = [
  // 1
  {
    id: 'vitamin-e-400mg-24-soft-gelatin-caps-ve',
    name: 'vitamin e 400mg 24 soft gelatin caps.',
    genericName: 'vitamin e',
    concentration: '400mg (24 soft gelatin caps)',
    price: 50,
    matchKeywords: ['vitamin e 400', 'vitamin e 400mg', 'soft gelatin', 'tocopherol', 'vit e', 'فيتامين هـ', 'فيتامين ه', 'بشرة', 'شعر', 'antioxidant', '#vitamin_e'],
    usage: 'فيتامين E مضاد أكسدة لدعم صحة الجلد والشعر وتعويض النقص.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: VITAMIN_E_WARNINGS,
  },

  // 2
  {
    id: 'vitamin-e-forte-400iu-20-caps-ve',
    name: 'vitamin e forte 400 i.u. 20 caps.',
    genericName: 'dl-alpha-tocopheryl acetate',
    concentration: '400 IU (20 caps)',
    price: 34,
    matchKeywords: ['vitamin e forte', 'vit e forte', '400 iu', 'tocopheryl acetate', 'dl-alpha', 'فيتامين هـ فورت', 'فيتامين ه فورت', 'antioxidant', '#vitamin_e'],
    usage: 'فيتامين E (مضاد أكسدة) بتركيز ٤٠٠ وحدة لدعم الخلايا وتعويض النقص.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: VITAMIN_E_WARNINGS,
  },

  // 3
  {
    id: 'vitamin-e-1000mg-20-soft-gelatin-cap-ve',
    name: 'vitamin e 1000mg 20 soft gelatin cap.',
    genericName: 'vitamin e',
    concentration: '1000mg (20 soft gelatin caps)',
    price: 20,
    matchKeywords: ['vitamin e 1000', 'vitamin e 1000mg', 'soft gelatin', 'tocopherol', 'فيتامين هـ 1000', 'فيتامين ه 1000', 'antioxidant', '#vitamin_e'],
    usage: 'فيتامين E عالي الجرعة (١٠٠٠ مجم) مضاد أكسدة لتعويض النقص لدى البالغين.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...VITAMIN_E_WARNINGS, 'التركيز عالي (١٠٠٠ مجم): لا يُستخدم لفترات طويلة بدون متابعة.'],
  },

  // 4
  {
    id: 'vitamin-e-1000mg-24-caps-ve',
    name: 'vitamin e 1000mg 24 caps.',
    genericName: 'd-alpha-tocopheryl acetate',
    concentration: '1000mg (24 caps)',
    price: 89,
    matchKeywords: ['vitamin e 1000', 'vitamin e 1000mg', 'd-alpha', 'tocopheryl acetate', 'فيتامين هـ 1000', 'فيتامين ه 1000', 'antioxidant', '#vitamin_e'],
    usage: 'فيتامين E عالي الجرعة (١٠٠٠ مجم) مضاد أكسدة لتعويض النقص لدى البالغين.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...VITAMIN_E_WARNINGS, 'التركيز عالي (١٠٠٠ مجم): لا يُستخدم لفترات طويلة بدون متابعة.'],
  },
];


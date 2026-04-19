// ─────────────────────────────────────────────────────────────────────────────
// المصدر الرئيسي لكتالوج الأدوية (MEDICATIONS Master Array)
// ─────────────────────────────────────────────────────────────────────────────
// الملف ده بيجمع كل ملفات الأدوية المتفرقة تحت فولدر /drugs في مصفوفة واحدة.
// كل فصيلة دوائية موجودة في ملف مستقل (مثال: drugs/git/antiemetics.ts)
// عشان نقدر نعمل Code Splitting في Vite ونحمل كل فصيلة بشكل كسول عند الحاجة.
//
// خطوات المعالجة هنا (مهمة للفهم):
//   1) نجمع كل المصفوفات في ALL_MEDS_RAW بترتيب الاستيراد.
//   2) dedupeMedicationsByNameAndPriceKeepFirst: نشيل المكرر حسب (الاسم + السعر)
//      — بنحتفظ بأول نسخة، لأن الملفات الأقدم عادة تكون هي المرجع الأساسي.
//   3) dedupeMedicationsByIdKeepLast: نشيل المكرر حسب (id) — بنحتفظ بآخر نسخة،
//      لأن لو id اتكرر يبقى الأحدث هو التصحيح أو الإضافة الأخيرة.
//   4) النتيجة النهائية موجودة في MEDICATIONS.
//
// MEDICATIONS_DEDUPE_REPORT: تقرير تشخيصي نستخدمه في scripts/countMeds.ts
// لمعرفة عدد المكرر الذي تم حذفه، ولمراقبة جودة البيانات قبل الإطلاق.
// ─────────────────────────────────────────────────────────────────────────────

import { Medication } from './types';
import { ANTIEMETIC_MEDS } from '../../drugs/git/antiemetics';
import { ANTIDIARRHEAL_MEDS } from '../../drugs/git/Antidiarrheal';
import { LAXATIVE_MEDS } from '../../drugs/git/laxatives';
import { DIGESTIVES_MEDS } from '../../drugs/git/digestives';
import { ANTIFLATULENT_MEDS } from '../../drugs/git/antiflatulent';
import ACID_RELATED_DISORDERS from '../../drugs/git/acid_related_disorders';
import { ACID_RELATED_DISORDERS_2 } from '../../drugs/git/acid_related_disorders 2';
import { ANTISPASMODIC_MEDS } from '../../drugs/git/antispasmodic';
import { GIT_DISTURBANCES_MEDS } from '../../drugs/git/git disturbances';
import { LIVER_SUPPORT_SUPPLEMENTS } from '../../drugs/git/liver support supplements';
import { WEIGHT_LOSS_MEDS } from '../../drugs/git/For weight loss';
import { IBS_SPASTIC_COLON_MEDS } from '../../drugs/git/IBS & Spastic colon';
import { ANTIHISTAMINIC_MEDICATIONS } from '../../drugs/respiratory/antihistaminic_medications';
import { NASAL_DECONGESTANTS } from '../../drugs/respiratory/NASAL_DECONGESTANTS';
import { BRONCHODILATORS } from '../../drugs/respiratory/BRONCHODILATORS';
import { COUGH_1 } from '../../drugs/respiratory/COUGH 1';
import { COUGH_2 } from '../../drugs/respiratory/COUGH 2';
import { COMMON_COLD_AND_FLU } from '../../drugs/respiratory/common cold & flu';
import { VITAMINS_SUPPLEMENTS } from '../../drugs/vitamins_supplements/multivitamins_supplements_1';
import { MULTIVITAMINS_SUPPLEMENTS_2 } from '../../drugs/vitamins_supplements/multivitamins_supplements_2';
import { MULTIVITAMINS_SUPPLEMENTS_3 } from '../../drugs/vitamins_supplements/multivitamins_supplements_3';
import { MULTIVITAMINS_SUPPLEMENTS_4 } from '../../drugs/vitamins_supplements/multivitamins_supplements_4';
import { MULTIVITAMINS_SUPPLEMENTS_5 } from '../../drugs/vitamins_supplements/multivitamins_supplements_5';
import { MULTIVITAMINS_SUPPLEMENTS_6 } from '../../drugs/vitamins_supplements/multivitamins_supplements_6';
import { DIETARY_SUPPLEMENTS } from '../../drugs/vitamins_supplements/dietary_supplements';
import { ANTIOXIDANTS } from '../../drugs/vitamins_supplements/antioxidants';
import { VITAMINS_C } from '../../drugs/vitamins_supplements/vitamins_c';
import { VITAMIN_B_GROUP } from '../../drugs/vitamins_supplements/vitamin_b';
import { VITAMIN_K_GROUP } from '../../drugs/vitamins_supplements/vitamin_k';
import { VITAMIN_E_GROUP } from '../../drugs/vitamins_supplements/vitamin_e';
import { VITAMIN_A_GROUP } from '../../drugs/vitamins_supplements/vitamin_a';
import { VITAMIN_IRON_GROUP } from '../../drugs/vitamins_supplements/vitamin_iron';
import { CALCIUM_GROUP } from '../../drugs/vitamins_supplements/calcium';
import { IRON_GROUP } from '../../drugs/vitamins_supplements/iron';
import { OMEGA_GROUP } from '../../drugs/vitamins_supplements/omega';
import { ZINC_GROUP } from '../../drugs/vitamins_supplements/zinc';
import { FOLIC_GROUP } from '../../drugs/vitamins_supplements/folic';
import { IMMUNITY_GROUP } from '../../drugs/vitamins_supplements/for_immunity';
import { LIVER_SUPPORT_GROUP } from '../../drugs/vitamins_supplements/liver_support';
import { ANTIHEMORRHAGICS_GROUP } from '../../drugs/hematology/antihemorrhagics';
import { ANTIANEMIC_PREPARATIONS_GROUP } from '../../drugs/hematology/antianemic_preperations';
import { HEPARIN_GROUP } from '../../drugs/hematology/antithrombotic_agents/heparin_group';
import { ANTIPLATELETS_GROUP } from '../../drugs/hematology/antithrombotic_agents/antiplatelets';
import { DIRECT_FACTOR_XA_INHIBITORS } from '../../drugs/hematology/antithrombotic_agents/direct_factor_xa_inhibitors';
import { DIRECT_THROMBIN_INHIBITORS } from '../../drugs/hematology/antithrombotic_agents/direct_thrombin_inhibitors';
import { AMINOGLYCOSIDES_GROUP } from '../../drugs/antibiotics/aminoglycosides';
import { FIRST_GEN_CEPHALOSPORINS } from '../../drugs/antibiotics/cephalosporins/first_generation';
import { SECOND_GEN_CEPHALOSPORINS } from '../../drugs/antibiotics/cephalosporins/second_generation';
import { THIRD_GEN_CEPHALOSPORINS } from '../../drugs/antibiotics/cephalosporins/third_generation';
import { FOURTH_GEN_CEPHALOSPORINS } from '../../drugs/antibiotics/cephalosporins/fourth_generation';
import { TETRACYCLINES_GROUP } from '../../drugs/antibiotics/tetracyclines';
import { PENICILLIN_GROUP } from '../../drugs/antibiotics/penicillin';
import { SULFONAMIDES_GROUP } from '../../drugs/antibiotics/sulfonamides';
import { FLUOROQUINOLONES_GROUP } from '../../drugs/antibiotics/fluoroquinolones';
import { FLUOROQUINOLONES_GROUP_PART2 } from '../../drugs/antibiotics/fluoroquinolones_part2';
import { MACROLIDES_GROUP } from '../../drugs/antibiotics/macrolides';
import { CARBAPENEMS_GROUP } from '../../drugs/antibiotics/carbapenems';
import { LINCOSAMIDES_GROUP } from '../../drugs/antibiotics/lincosamides';
import { GLYCOPEPTIDES_GROUP } from '../../drugs/antibiotics/glycopeptides';
import { TOPICAL_ANTIBIOTICS_GROUP } from '../../drugs/antibiotics/topical_antibiotics';
import { OPHTHALMIC_ANTIBIOTICS_GROUP } from '../../drugs/opthalmic/ophthalmic antibiotics';
import { ANTIBIOTIC_SUSPENSIONS_GROUP } from '../../drugs/antibiotics/antibiotics_susp_syrup';
import { EYE_LUBRICANTS_GROUP } from '../../drugs/opthalmic/eye lubricants';
import { OPHTHALMIC_ANTIHISTAMINIC_GROUP } from '../../drugs/opthalmic/opthalmic antihistaminic';
import { HAIR_CARE_LGT_PART_1_GROUP } from '../../drugs/other medications/Hair Care/lgt part 1';
import { HAIR_CARE_LGT_PART_2_GROUP } from '../../drugs/other medications/Hair Care/lgt part 2';
import { HAIR_CARE_LGT_PART_3_GROUP } from '../../drugs/other medications/Hair Care/lgt part 3';
import { HAIR_CARE_LGT_PART_4_GROUP } from '../../drugs/other medications/Hair Care/lgt part 4';
import { ORAL_CARE_GROUP } from '../../drugs/other medications/oral care';
import { MASSAGE_GROUP } from '../../drugs/other medications/massage';
import { HEMORRHOIDS_GROUP } from '../../drugs/other medications/hemorrhoids';
import { SUN_BLOCK_GROUP } from '../../drugs/other medications/sun block';
import { ANTIVIRAL_GROUP } from '../../drugs/antiviral/antivirals';
import { ANTIFUNGAL_GROUP } from '../../drugs/antifungal/antifungals';
import { DERM_ANTIFUNGALS } from '../../drugs/Dermatologicals/antifungal';
import { DERM_ANTIFUNGALS_2 } from '../../drugs/Dermatologicals/antifungal 2';
import { ANTIPARASITIC_GROUP } from '../../drugs/antiparasitic/antiparasitics';
import { VACCINES_GROUP } from '../../drugs/vaccines/vaccines';
import { GLUCOSE_LOWERING_AGENTS_1 } from '../../drugs/endocrine_system/dm/oral/glucose lowering agebts 1';
import { GLUCOSE_LOWERING_AGENTS_2 } from '../../drugs/endocrine_system/dm/oral/glucose lowering agebts 2';
import { GLUCOSE_LOWERING_AGENTS_3 } from '../../drugs/endocrine_system/dm/oral/glucose lowering agebts 3';
import { GLUCOSE_LOWERING_AGENTS_4 } from '../../drugs/endocrine_system/dm/oral/glucose lowering agebts 4';
import { GLUCOSE_LOWERING_AGENTS_5 } from '../../drugs/endocrine_system/dm/oral/glucose lowering agebts 5';
import { DIABETES_INSULIN_RAPID } from '../../drugs/endocrine_system/dm/insulin/rapid_acting_insulin';
import { DIABETES_INSULIN_INTERMEDIATE_MIX } from '../../drugs/endocrine_system/dm/insulin/intermediate_acting_insulin';
import { DIABETES_INSULIN_LONG_ACTING } from '../../drugs/endocrine_system/dm/insulin/long_acting_insulin';
import { THYROXINE_MEDICATIONS } from '../../drugs/endocrine_system/thyroxine';
import { ANTI_THYROID_MEDICATIONS } from '../../drugs/endocrine_system/anti_thyroid';
import { HYPERPARATHYROIDISM_MEDICATIONS } from '../../drugs/endocrine_system/hyperparathyroidism';
import { GROWTH_HORMONE_MEDICATIONS } from '../../drugs/endocrine_system/growth_hormone';
import { SOMATOSTATIN_MEDICATIONS } from '../../drugs/endocrine_system/somatostatin';
import { PROLACTIN_INHIBITORS } from '../../drugs/endocrine_system/prolactin_inhibitors';
import { CONTRACEPTIVES_GROUP } from '../../drugs/gynacologicals/contraceptives';
import { UTEROTONICS_GROUP } from '../../drugs/gynacologicals/uterotinics';
import { MENSTRUAL_PAIN_RELIEF_GROUP } from '../../drugs/gynacologicals/Menstrual pain relief';
import { LACTAGOGUE_GROUP } from '../../drugs/gynacologicals/Galctogogue';
import { PROLACTIN_INHIBITORS_GYN_GROUP } from '../../drugs/gynacologicals/prolactin inhibitors';
import { VAGINAL_WASH_DOUCHE_CLEANSER_GROUP } from '../../drugs/gynacologicals/vaginal wash doush cleanser';
import { VAGINAL_INFECTIONS_GROUP } from '../../drugs/gynacologicals/vaginal infections';
import { VAGINAL_ANTIFUNGAL_GROUP } from '../../drugs/gynacologicals/vaginal antifungal';
import { TAMOXIFEN_GROUP } from '../../drugs/gynacologicals/tamoxifen';
import { PROGESTERONE_PROGESTOGENS_GROUP } from '../../drugs/gynacologicals/containing progesterone progesterone';
import { HMG_GROUP } from '../../drugs/gynacologicals/HMGs';
import { HCG_GROUP } from '../../drugs/gynacologicals/HCG';
import { FSH_GROUP } from '../../drugs/gynacologicals/FSH';
import { FERTILITY_DRUGS_GROUP } from '../../drugs/gynacologicals/fertility drugs';
import { HORMONE_REPLACEMENT_THERAPY_GROUP } from '../../drugs/gynacologicals/hormone replacement therapy';
import { URINE_INCONTINENCE_MEDS } from '../../drugs/urology/urine_incontinence';
import { OVER_ACTIVE_BLADDER_MEDS } from '../../drugs/urology/over_active_bladder';
import { BPH_MEDS } from '../../drugs/urology/benign_prostatic_hypertrophy';
import { URINARY_ANTI_INFECTIVE_MEDS } from '../../drugs/urology/urinary_anti_infective';
import { NEPHROLITHIASIS_MEDS } from '../../drugs/urology/nephrolithiasis';
import { URINARY_ANTISPASMODIC_MEDS } from '../../drugs/urology/urinary_antispasmodic_analgesic';
import { ANTIHYPERLIPIDEMIC_MEDS } from '../../drugs/cardiovascular_system/antihyperlipidemics';
import { ORTHOSTATIC_HYPOTENSION_MEDS } from '../../drugs/cardiovascular_system/orthostatic_hypotension';
import { ANTI_ISCHEMIC_MEDS } from '../../drugs/cardiovascular_system/anti_ischemic';
import { LOOP_DIURETICS_MEDS } from '../../drugs/cardiovascular_system/hypertension/diuretics/loop_diuretics';
import { THIAZIDE_DIURETICS_MEDS } from '../../drugs/cardiovascular_system/hypertension/diuretics/thiazide_diuretics';
import { THIAZIDE_LIKE_DIURETICS_MEDS } from '../../drugs/cardiovascular_system/hypertension/diuretics/thiazide_like_diuretics';
import { POTASSIUM_SPARING_DIURETICS_MEDS } from '../../drugs/cardiovascular_system/hypertension/diuretics/potassium_sparing_diuretics';
import { OSMOTIC_DIURETICS_MEDS } from '../../drugs/cardiovascular_system/hypertension/diuretics/osmotic_diuretics';
import { CARBONIC_ANHYDRASE_INHIBITORS_MEDS } from '../../drugs/cardiovascular_system/hypertension/diuretics/carbonic_anhydrase_inhibitors';
import { VASODILATORS_MEDS } from '../../drugs/cardiovascular_system/hypertension/vasodilators';
import { BETA_BLOCKERS_MEDS } from '../../drugs/cardiovascular_system/hypertension/beta_blockers';
import { CALCIUM_CHANNEL_BLOCKERS_MEDS } from '../../drugs/cardiovascular_system/hypertension/calcium_channel_blockers';
import { HEART_FAILURE_ACE_MEDS } from '../../drugs/cardiovascular_system/heart failure/ace';
import { HEART_FAILURE_ARB_MEDS } from '../../drugs/cardiovascular_system/heart failure/arb';
import { HEART_FAILURE_DIGOXIN_MEDS } from '../../drugs/cardiovascular_system/heart failure/digoxin';
import { SACUBITRIL_VALSARTAN_MEDS } from '../../drugs/cardiovascular_system/heart failure/sacubitril_valsartan';
import { ANTIARRHYTHMIC_MEDS } from '../../drugs/cardiovascular_system/Antiarrhythmics';
import { PSORIASIS_MEDS } from '../../drugs/Dermatologicals/psoriasis';
import { SKIN_CARE_PRODUCTS } from '../../drugs/Dermatologicals/skin_care_products';
import { TOPICAL_ANTIBIOTIC_MEDS } from '../../drugs/Dermatologicals/topical antibiotic';
import { TOPICAL_ANALGESICS_MEDS } from '../../drugs/Dermatologicals/topical analgesics';
import { ANTI_INFLAMMATORY_MEDS } from '../../drugs/Dermatologicals/anti-inflammatory';
import { TOPICAL_CORTICOID_MEDS } from '../../drugs/Dermatologicals/topical corticoid';
import { TOPICAL_ANTIHISTAMINIC_MEDS } from '../../drugs/Dermatologicals/topical antihistaminic';
import { TOPICAL_ANTIVIRAL_MEDS } from '../../drugs/Dermatologicals/antiviral';
import { ANTI_ACNE_PREPARATIONS } from '../../drugs/Dermatologicals/anti_acne_preparations';
import { ANALGESICS_1 } from '../../drugs/nervous_system/analgesics/analgesics_1';
import { ANALGESICS_2 } from '../../drugs/nervous_system/analgesics/analgesics_2';
import { ANALGESICS_3 } from '../../drugs/nervous_system/analgesics/analgesics_3';
import { ANALGESICS_4 } from '../../drugs/nervous_system/analgesics/analgesics_4';
import { ANALGESICS_5 } from '../../drugs/nervous_system/analgesics/analgesics_5';
import { ANALGESICS_6 } from '../../drugs/nervous_system/analgesics/analgesics_6';
import { ANALGESICS_7 } from '../../drugs/nervous_system/analgesics/analgesics_7';
import { ANALGESICS_8 } from '../../drugs/nervous_system/analgesics/analgesics_8';
import { ANTIEPILEPTIC_1 } from '../../drugs/nervous_system/antiepileptic/antiepileptic_1';
import { ANTIEPILEPTIC_2 } from '../../drugs/nervous_system/antiepileptic/antiepileptic_2';
import { ANTIEPILEPTIC_3 } from '../../drugs/nervous_system/antiepileptic/antiepileptic_3';
import { ANTI_PARKINSON_DRUGS } from '../../drugs/nervous_system/antiparkinson/antiparkinson';
import { ANTIDEPRESSANTS_DRUGS } from '../../drugs/nervous_system/antidepressants/antidepressants';
import { ADHD_NOOTROPICS_DRUGS } from '../../drugs/nervous_system/adhd_nootropics/adhd_nootropics';
import { ANTIPSYCHOTIC_DRUGS } from '../../drugs/nervous_system/antipsychotic/antipsychotic';
import { HYPNOTICS_SEDATIVES_DRUGS } from '../../drugs/nervous_system/hypnotics_sedatives/hypnotics_sedatives';
import { DEMENTIA_DRUGS } from '../../drugs/nervous_system/dementia/dementia';
import { VERTIGO_DRUGS } from '../../drugs/nervous_system/vertigo/vertigo';
import { ANTI_INFLAMMATORY_AND_ANTI_RHEUMATIC_PRODUCTS } from '../../drugs/musco_skeletal_system/anti_inflammatory_and_anti_rheumatic_products';
import { SKELETAL_MUSCLE_RELAXANTS } from '../../drugs/musco_skeletal_system/skeletal_muscle_relaxants';
import { ANTIGOUT } from '../../drugs/musco_skeletal_system/antigout';
import { BONE_SUPPORT } from '../../drugs/musco_skeletal_system/BONE SUPPORT';
import { OSTEOARTHRITIS_ANTI_RHEUMATIC_2 } from '../../drugs/musco_skeletal_system/osteoarthritis/anti rheumatic 2';
import { ANTI_NEOPLASTIC_1 } from '../../drugs/anti_neoplastic_immunomodulating/part1';
import { NEW_RESPIRATORY_MEDS } from '../../drugs/new_medications/Respiratory';

/**
 * إزالة المكرر من مصفوفة الأدوية بناءً على الـ id، مع الاحتفاظ بآخر نسخة ظهرت.
 * السبب في الاحتفاظ بالأخيرة: لو في ملف تصحيحي أضيف بعدين، تكون النسخة الأحدث
 * هي الأصح. بنلف على المصفوفة من آخرها، نضيف كل id جديد لمجموعة seen،
 * ثم نعكس النتيجة عشان نحافظ على الترتيب الأصلي.
 */
const dedupeMedicationsByIdKeepLast = (meds: Medication[]): Medication[] => {
  const seen = new Set<string>();
  const result: Medication[] = [];

  for (let i = meds.length - 1; i >= 0; i--) {
    const med = meds[i];
    if (!seen.has(med.id)) {
      seen.add(med.id);
      result.push(med);
    }
  }

  return result.reverse();
};

/**
 * توحيد اسم الدواء لاستخدامه كمفتاح مقارنة:
 *   - إزالة المسافات من البداية والنهاية
 *   - تحويل لحروف صغيرة
 *   - دمج المسافات المتعددة في مسافة واحدة
 * ده بيخلي "Panadol  Extra" و "PANADOL Extra" و " panadol extra " كلهم مفتاح واحد.
 */
const normalizeNameForKey = (name: string): string => name.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * إزالة المكرر الحرفي من مصفوفة الأدوية بناءً على (الاسم + السعر)،
 * مع الاحتفاظ بأول نسخة ظهرت.
 * السبب في الاحتفاظ بالأولى: الملفات المرتبة أولاً في ALL_MEDS_RAW عادة
 * هي الفصائل الرئيسية (وهي الأدق). لو فيه تكرار بين فصيلة عامة وفصيلة فرعية،
 * بنعتمد على الفصيلة الأساسية.
 * ترجع التقرير (عدد المحذوف) عشان نعرضه في MEDICATIONS_DEDUPE_REPORT.
 */
const dedupeMedicationsByNameAndPriceKeepFirst = (meds: Medication[]): { meds: Medication[]; removedCount: number } => {
  const seen = new Set<string>();
  const result: Medication[] = [];

  for (const med of meds) {
    const key = `${normalizeNameForKey(med.name)}|${med.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(med);
    }
  }

  return { meds: result, removedCount: meds.length - result.length };
};

const ALL_MEDS_RAW = [
  ...ACID_RELATED_DISORDERS, ...ACID_RELATED_DISORDERS_2,
  ...ANTIEMETIC_MEDS, ...ANTISPASMODIC_MEDS, ...ANTIDIARRHEAL_MEDS, ...GIT_DISTURBANCES_MEDS, ...LAXATIVE_MEDS, ...DIGESTIVES_MEDS, ...ANTIFLATULENT_MEDS, ...LIVER_SUPPORT_SUPPLEMENTS, ...WEIGHT_LOSS_MEDS, ...IBS_SPASTIC_COLON_MEDS,
  ...ANTIHISTAMINIC_MEDICATIONS, ...NASAL_DECONGESTANTS, ...BRONCHODILATORS, ...COUGH_1, ...COUGH_2, ...COMMON_COLD_AND_FLU,
  ...VITAMINS_SUPPLEMENTS, ...MULTIVITAMINS_SUPPLEMENTS_2, ...MULTIVITAMINS_SUPPLEMENTS_3, ...MULTIVITAMINS_SUPPLEMENTS_4, ...MULTIVITAMINS_SUPPLEMENTS_5, ...MULTIVITAMINS_SUPPLEMENTS_6, ...DIETARY_SUPPLEMENTS, ...ANTIOXIDANTS, ...VITAMINS_C, ...VITAMIN_B_GROUP, ...VITAMIN_K_GROUP, ...VITAMIN_E_GROUP, ...VITAMIN_A_GROUP,
  ...VITAMIN_IRON_GROUP,
  ...CALCIUM_GROUP,
  ...IRON_GROUP, ...OMEGA_GROUP, ...ZINC_GROUP, ...FOLIC_GROUP, ...IMMUNITY_GROUP, ...LIVER_SUPPORT_GROUP,
  ...ANTIHEMORRHAGICS_GROUP, ...ANTIANEMIC_PREPARATIONS_GROUP, ...HEPARIN_GROUP, ...ANTIPLATELETS_GROUP, ...DIRECT_FACTOR_XA_INHIBITORS, ...DIRECT_THROMBIN_INHIBITORS,
  ...AMINOGLYCOSIDES_GROUP, ...FIRST_GEN_CEPHALOSPORINS, ...SECOND_GEN_CEPHALOSPORINS, ...THIRD_GEN_CEPHALOSPORINS, ...FOURTH_GEN_CEPHALOSPORINS,
  ...TETRACYCLINES_GROUP, ...PENICILLIN_GROUP, ...SULFONAMIDES_GROUP, ...FLUOROQUINOLONES_GROUP, ...FLUOROQUINOLONES_GROUP_PART2, ...MACROLIDES_GROUP, ...CARBAPENEMS_GROUP, ...LINCOSAMIDES_GROUP, ...GLYCOPEPTIDES_GROUP, ...TOPICAL_ANTIBIOTICS_GROUP, ...OPHTHALMIC_ANTIBIOTICS_GROUP, ...EYE_LUBRICANTS_GROUP, ...OPHTHALMIC_ANTIHISTAMINIC_GROUP, ...ANTIBIOTIC_SUSPENSIONS_GROUP,
  ...HAIR_CARE_LGT_PART_1_GROUP,
  ...HAIR_CARE_LGT_PART_2_GROUP,
  ...HAIR_CARE_LGT_PART_3_GROUP,
  ...HAIR_CARE_LGT_PART_4_GROUP,
  ...ORAL_CARE_GROUP,
  ...ANTIVIRAL_GROUP, ...ANTIFUNGAL_GROUP, ...DERM_ANTIFUNGALS, ...DERM_ANTIFUNGALS_2, ...ANTIPARASITIC_GROUP,
  ...VACCINES_GROUP,
  ...GLUCOSE_LOWERING_AGENTS_1, ...GLUCOSE_LOWERING_AGENTS_2, ...GLUCOSE_LOWERING_AGENTS_3, ...GLUCOSE_LOWERING_AGENTS_4, ...GLUCOSE_LOWERING_AGENTS_5, ...DIABETES_INSULIN_RAPID, ...DIABETES_INSULIN_INTERMEDIATE_MIX, ...DIABETES_INSULIN_LONG_ACTING,
  ...THYROXINE_MEDICATIONS, ...ANTI_THYROID_MEDICATIONS, ...HYPERPARATHYROIDISM_MEDICATIONS, ...GROWTH_HORMONE_MEDICATIONS, ...SOMATOSTATIN_MEDICATIONS, ...PROLACTIN_INHIBITORS,
  ...CONTRACEPTIVES_GROUP, ...UTEROTONICS_GROUP, ...MENSTRUAL_PAIN_RELIEF_GROUP,
  ...LACTAGOGUE_GROUP, ...PROLACTIN_INHIBITORS_GYN_GROUP, ...VAGINAL_WASH_DOUCHE_CLEANSER_GROUP,
  ...VAGINAL_INFECTIONS_GROUP, ...VAGINAL_ANTIFUNGAL_GROUP, ...TAMOXIFEN_GROUP,
  ...PROGESTERONE_PROGESTOGENS_GROUP,
  ...HMG_GROUP, ...HCG_GROUP, ...FSH_GROUP,
  ...FERTILITY_DRUGS_GROUP,
  ...HORMONE_REPLACEMENT_THERAPY_GROUP,
  ...URINE_INCONTINENCE_MEDS, ...OVER_ACTIVE_BLADDER_MEDS, ...BPH_MEDS, ...URINARY_ANTI_INFECTIVE_MEDS, ...NEPHROLITHIASIS_MEDS, ...URINARY_ANTISPASMODIC_MEDS,
  ...ANTIHYPERLIPIDEMIC_MEDS, ...ORTHOSTATIC_HYPOTENSION_MEDS, ...ANTI_ISCHEMIC_MEDS, ...LOOP_DIURETICS_MEDS, ...THIAZIDE_DIURETICS_MEDS, ...THIAZIDE_LIKE_DIURETICS_MEDS, ...POTASSIUM_SPARING_DIURETICS_MEDS, ...OSMOTIC_DIURETICS_MEDS, ...CARBONIC_ANHYDRASE_INHIBITORS_MEDS, ...VASODILATORS_MEDS, ...BETA_BLOCKERS_MEDS, ...CALCIUM_CHANNEL_BLOCKERS_MEDS, ...HEART_FAILURE_ACE_MEDS, ...HEART_FAILURE_ARB_MEDS, ...HEART_FAILURE_DIGOXIN_MEDS, ...SACUBITRIL_VALSARTAN_MEDS, ...ANTIARRHYTHMIC_MEDS, ...PSORIASIS_MEDS, ...SKIN_CARE_PRODUCTS, ...SUN_BLOCK_GROUP, ...TOPICAL_ANTIBIOTIC_MEDS, ...TOPICAL_ANALGESICS_MEDS, ...MASSAGE_GROUP, ...HEMORRHOIDS_GROUP, ...ANTI_INFLAMMATORY_MEDS, ...TOPICAL_CORTICOID_MEDS, ...TOPICAL_ANTIHISTAMINIC_MEDS, ...TOPICAL_ANTIVIRAL_MEDS, ...ANTI_ACNE_PREPARATIONS,
  ...ANALGESICS_1, ...ANALGESICS_2, ...ANALGESICS_3, ...ANALGESICS_4, ...ANALGESICS_5, ...ANALGESICS_6, ...ANALGESICS_7, ...ANALGESICS_8,
  ...ANTIEPILEPTIC_1, ...ANTIEPILEPTIC_2, ...ANTIEPILEPTIC_3, ...ANTI_PARKINSON_DRUGS, ...ANTIDEPRESSANTS_DRUGS, ...ADHD_NOOTROPICS_DRUGS, ...ANTIPSYCHOTIC_DRUGS, ...HYPNOTICS_SEDATIVES_DRUGS, ...DEMENTIA_DRUGS, ...VERTIGO_DRUGS,
  ...ANTI_INFLAMMATORY_AND_ANTI_RHEUMATIC_PRODUCTS, ...SKELETAL_MUSCLE_RELAXANTS, ...ANTIGOUT, ...BONE_SUPPORT, ...OSTEOARTHRITIS_ANTI_RHEUMATIC_2, ...ANTI_NEOPLASTIC_1,
  ...NEW_RESPIRATORY_MEDS,

];

// خطوة 1: إزالة المكرر بناءً على (الاسم + السعر) مع الاحتفاظ بالأول
const _stepNamePrice = dedupeMedicationsByNameAndPriceKeepFirst(ALL_MEDS_RAW);
// خطوة 2: إزالة المكرر بناءً على id مع الاحتفاظ بالآخر
const _afterId = dedupeMedicationsByIdKeepLast(_stepNamePrice.meds);

/**
 * تقرير تشخيصي لنتائج عملية إزالة المكرر — لاستخدامه في scripts/countMeds.ts
 * لمراقبة جودة بيانات الأدوية قبل أي إطلاق.
 * المفاتيح العربية (مثل "قبل_اسم_وسعر") موجودة كـ fallback للتوافق مع السكريبت
 * القديم اللي ممكن يقرا المفاتيح العربية. لو شلناها، هيكسر السكريبت.
 */
export const MEDICATIONS_DEDUPE_REPORT = {
  beforeNameAndPrice: ALL_MEDS_RAW.length,
  removedDuplicateNameAndPrice: _stepNamePrice.removedCount,
  remainingAfterNameAndPrice: _stepNamePrice.meds.length,
  finalAfterIdDedup: _afterId.length,
  'قبل_اسم_وسعر': ALL_MEDS_RAW.length,
  'محذوف_مكرر_اسم_وسعر': _stepNamePrice.removedCount,
  'باقي_بعد_اسم_وسعر': _stepNamePrice.meds.length,
  'نهائي_بعد_إزالة_تكرار_id': _afterId.length,
};

/**
 * المصفوفة النهائية المستخدمة في التطبيق — بعد تصفية التكرار من الخطوتين.
 * هذه هي الـ MEDICATIONS اللي بتظهر للطبيب في شاشة اختيار الأدوية.
 */
export const MEDICATIONS: Medication[] = _afterId;


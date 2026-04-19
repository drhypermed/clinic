import { Medication } from '../../../types';

import { SCAR_THERAPY_MEDS } from './scar therapy';
import { ANTISEPTIC_MEDS } from './antiseptic';
import { WHITENING_MEDS } from './whitening';
import { MOISTURIZING_MEDS } from './moisturizing';
import { MOISTURIZING_2_MEDS } from './moisturizing 2';
import { SOOTHING_MEDS } from './soothing';
import { HEELING_MEDS } from './heeling';
import { DIAPER_RASH_MEDS } from './diaper rash';
import { FEET_CARE_MEDS } from './feet care';
import { EYE_CONTOUR_MEDS } from './eye contour';
import { SOAPS_MEDS } from './soaps';
import { SUN_BLOCK_MEDS } from './sun block';
import { MASSAGE_1_MEDS } from './massage 1';
import { MASSAGE_2_MEDS } from './massage 2';

export const SKIN_CARE_PRODUCTS: Medication[] = [
  ...SCAR_THERAPY_MEDS,
  ...ANTISEPTIC_MEDS,
  ...WHITENING_MEDS,
  ...MOISTURIZING_MEDS,
  ...MOISTURIZING_2_MEDS,
  ...SOOTHING_MEDS,
  ...HEELING_MEDS,
  ...DIAPER_RASH_MEDS,
  ...FEET_CARE_MEDS,
  ...EYE_CONTOUR_MEDS,
  ...SOAPS_MEDS,
  ...SUN_BLOCK_MEDS,
  ...MASSAGE_1_MEDS,
  ...MASSAGE_2_MEDS,
];


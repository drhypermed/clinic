import type { Medication } from '../../../types';

import { ANTIDEPRESSANTS_1 } from './antidepressants_1';
import { ANTIDEPRESSANTS_2 } from './antidepressants_2';

export const ANTIDEPRESSANTS_DRUGS: Medication[] = [
	...ANTIDEPRESSANTS_1,
	...ANTIDEPRESSANTS_2,
];

export { ANTIDEPRESSANTS_1, ANTIDEPRESSANTS_2 };



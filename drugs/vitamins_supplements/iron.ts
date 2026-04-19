
import { Medication, Category } from '../../types';

// Helper to convert numbers to Arabic numerals
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

export const IRON_GROUP: Medication[] = [
 
];


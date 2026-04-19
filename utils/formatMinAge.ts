/** تنسيق الحد الأدنى للعمر بشكل مقروء بالعربية */
export const formatMinAge = (months?: number): string | null => {
    if (months === undefined || months === null || !Number.isFinite(months)) return null;
    if (months <= 0) return 'من الولادة';
    if (months < 12) return `من ${months} شهر`;
    return `+${Math.floor(months / 12)} سنة`;
};

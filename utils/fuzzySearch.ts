/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching in search
 * 
 * حساب "مسافة ليفنشتاين" (Levenshtein Distance):
 * خوارزمية رياضية تحسب عدد العمليات (إضافة، حذف، تبديل) المطلوبة لتحويل 
 * نص إلى آخر. تُستخدم هنا لتوفير ميزة "هل تقصد؟" عند وجود خطأ إملائي في البحث.
 */
const levenshteinDistance = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    // Initialize matrix
    // تهيئة المصفوفة الحسابية
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    // ملء المصفوفة بناءً على تكلفة العمليات
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion / حذف حرف
                matrix[i][j - 1] + 1,      // insertion / إضافة حرف
                matrix[i - 1][j - 1] + cost // substitution / تبديل حرف
            );
        }
    }

    return matrix[len1][len2];
};

/**
 * Calculate relevance score for search matching
 * Lower score = better match
 * 
 * حساب درجة الصلة (calculateRelevanceScore):
 * تعطي كل نتيجة "نقاطاً" بناءً على دقتها.
 * القاعدة: كلما قل الرقم، زادت دقة النتيجة وظهرت أولاً.
 */
const calculateRelevanceScore = (
    searchTerm: string,
    targetString: string
): number => {
    const search = searchTerm.toLowerCase().trim();
    const target = targetString.toLowerCase().trim();

    // Exact match - highest priority
    // 1. تطابق تام (أعلى أولوية)
    if (target === search) return 0;

    // Starts with search term - very high priority
    // 2. يبدأ بكلمة البحث
    if (target.startsWith(search)) return 1;

    // Contains search term - high priority
    // 3. يحتوي على كلمة البحث
    if (target.includes(search)) return 2;

    // Check if target contains all characters of search (in order)
    // 4. فحص "التطابق المتسلسل": هل حروف البحث موجودة بنفس الترتيب؟
    let searchIndex = 0;
    for (let i = 0; i < target.length && searchIndex < search.length; i++) {
        if (target[i] === search[searchIndex]) {
            searchIndex++;
        }
    }
    if (searchIndex === search.length) {
        return 2.5; // All characters found in order
    }

    // Fuzzy match using Levenshtein distance
    /** 
     * 5. البحث التقريبي (Fuzzy Match):
     * استخدام مسافة ليفنشتاين لقبول النتائج التي تحتوي على أخطاء إملائية بسيطة
     * بشرط أن تكون نسبة التشابه أكبر من 40%.
     */
    const distance = levenshteinDistance(search, target);
    const maxLength = Math.max(search.length, target.length);
    const similarity = 1 - distance / maxLength;

    // More lenient threshold - consider matches with > 40% similarity
    if (similarity < 0.4) return 1000; // Very low priority / نتيجة غير ذات صلة

    return 3 + (1 - similarity) * 10; // Score between 3-13 / درجة مابين 3 و 13
};

/**
 * Normalize Arabic text for better search matching
 * Handles common Arabic character variations
 * 
 * تطبيع النصوص العربية (normalizeArabicText):
 * توحيد الهياكل اللغوية للحروف العربية لضمان نجاح البحث.
 */
const normalizeArabicText = (text: string): string => {
    return text
        .replace(/[أإآ]/g, 'ا')  // Normalize alef variants
        .replace(/[ىئ]/g, 'ي')   // Normalize ya variants
        .replace(/ة/g, 'ه')      // Normalize ta marbuta
        .replace(/\s+/g, ' ')     // Normalize spaces
        .trim();
};

/**
 * Smart search function with fuzzy matching
 * 
 * وظيفة البحث الذكي (fuzzySearch):
 * المحرك الرئيسي للبحث في القوائم والمصفوفات داخل التطبيق.
 * تدعم البحث في حقول متعددة (مثل الاسم، الأرقام، الكلمات الدلالية).
 */
export const fuzzySearch = <T extends Record<string, any>>(
    items: T[],
    searchTerm: string,
    searchFields: (keyof T)[]
): T[] => {
    if (!searchTerm || searchTerm.trim() === '') return [];

    const normalizedSearch = normalizeArabicText(searchTerm);

    // Calculate scores for each item
    // حساب الدرجات لكل عنصر في القائمة
    const itemsWithScores = items.map(item => {
        let bestScore = 1000; // Start with worst score

        // Check each search field
        for (const field of searchFields) {
            const fieldValue = item[field];
            if (typeof fieldValue === 'string') {
                const normalizedField = normalizeArabicText(fieldValue);
                const score = calculateRelevanceScore(normalizedSearch, normalizedField);
                bestScore = Math.min(bestScore, score);
            } else if (Array.isArray(fieldValue)) {
                // Handle array fields (like matchKeywords)
                // البحث داخل المصفوفات (مثل الكلمات الدلالية للدواء)
                const arrayField = fieldValue as unknown[];
                for (const arrayItem of arrayField) {
                    if (typeof arrayItem === 'string') {
                        const normalizedArrayItem = normalizeArabicText(arrayItem);
                        const score = calculateRelevanceScore(normalizedSearch, normalizedArrayItem);
                        bestScore = Math.min(bestScore, score);
                    }
                }
            }
        }

        return { item, score: bestScore };
    });

    // Filter and sort by relevance
    // إرجاع النتائج مرتبة من الأكثر دقة (الرقم الأقل) إلى الأقل دقة
    return itemsWithScores
        .filter(({ score }) => score < 1000) // Remove irrelevant results
        .sort((a, b) => a.score - b.score)   // Sort by score (lower = better)
        .map(({ item }) => item);             // Extract items
};

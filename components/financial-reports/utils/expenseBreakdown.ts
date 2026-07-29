export interface ExpenseBreakdown {
    rent: number;
    salaries: number;
    tools: number;
    electricity: number;
    daily: number;
    other: number;
    discounts: number;
}

export const EXPENSE_BREAKDOWN_KEYS: readonly (keyof ExpenseBreakdown)[] = [
    'rent',
    'salaries',
    'tools',
    'electricity',
    'daily',
    'other',
    'discounts',
];

export const createEmptyExpenseBreakdown = (): ExpenseBreakdown => ({
    rent: 0,
    salaries: 0,
    tools: 0,
    electricity: 0,
    daily: 0,
    other: 0,
    discounts: 0,
});

export const sumExpenseBreakdown = (breakdown: ExpenseBreakdown): number =>
    EXPENSE_BREAKDOWN_KEYS.reduce(
        (sum, key) => sum + (Number(breakdown[key]) || 0),
        0,
    );

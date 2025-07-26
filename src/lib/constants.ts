
export const PROGRAM_CATEGORIES = ['UKM Esensial', 'UKM Pengembangan'] as const;

export type ProgramCategory = typeof PROGRAM_CATEGORIES[number];

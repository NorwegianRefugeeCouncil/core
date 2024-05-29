import { z } from 'zod';

export const IsoCodeSchema = z.string().max(20);
export type IsoCode = z.infer<typeof IsoCodeSchema>;

export const LanguageSchema = z.object({
  id: IsoCodeSchema,
  enabled: z.boolean(),
});
export type Language = z.infer<typeof LanguageSchema>;

export const LanguageSortingFields = ['id'] as const;

export const LanguageFilterSchema = z.object({
  enabled: z.boolean().optional(),
});
export type LanguageFilter = z.infer<typeof LanguageFilterSchema>;

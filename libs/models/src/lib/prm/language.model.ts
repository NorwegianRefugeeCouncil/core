import { z } from 'zod';

import { BoolStr } from '../utils';

import { IsoCodeSchema } from './common';

export const LanguageSchema = z.object({
  id: IsoCodeSchema,
  enabled: z.boolean(),
});
export type Language = z.infer<typeof LanguageSchema>;

export const LanguageSortingFields = ['id'] as const;
export const LanguageDefaultSorting = 'id';

export const LanguageFilterSchema = z.object({
  enabled: BoolStr.optional(),
});
export type LanguageFilter = z.infer<typeof LanguageFilterSchema>;

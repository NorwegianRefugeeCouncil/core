import { z } from 'zod';

import { BoolStr } from '../utils';

import { IsoCodeSchema } from './common';

export const NationalitySchema = z.object({
  id: IsoCodeSchema,
  enabled: z.boolean(),
});
export type Nationality = z.infer<typeof NationalitySchema>;

export const NationalitySortingFields = ['id'] as const;
export const NationalityDefaultSorting = 'id';

export const NationalityFilterSchema = z.object({
  enabled: BoolStr.optional(),
});
export type NationalityFilter = z.infer<typeof NationalityFilterSchema>;

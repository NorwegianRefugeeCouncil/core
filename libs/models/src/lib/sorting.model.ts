import { z } from 'zod';

import { EntityType, getEntityListSortingFields } from './prm';

export enum SortingDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export const createSortingSchema = (entityType: EntityType) => {
  const possibleSortingFields = getEntityListSortingFields(entityType);
  if (possibleSortingFields.length === 0) {
    throw new Error('possibleSortingFields must contain at least one element');
  }

  return z.object({
    sort: z
      .enum(possibleSortingFields as [string, ...string[]])
      .optional()
      .default(possibleSortingFields[0]),
    direction: z
      .nativeEnum(SortingDirection)
      .optional()
      .default(SortingDirection.Asc),
  });
};
export type Sorting = z.infer<ReturnType<typeof createSortingSchema>>;

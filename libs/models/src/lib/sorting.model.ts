import { z } from 'zod';

export enum SortingDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export const createSortingSchema = (possibleSortingFields: string[]) => {
  if (possibleSortingFields.length === 0) {
    throw new Error('possibleSortingFields must contain at least one element');
  }

  return z.object({
    sort: z.enum(possibleSortingFields as [string, ...string[]]).optional(),
    direction: z
      .nativeEnum(SortingDirection)
      .optional()
      .default(SortingDirection.Asc),
  });
};
export type Sorting = z.infer<ReturnType<typeof createSortingSchema>>;

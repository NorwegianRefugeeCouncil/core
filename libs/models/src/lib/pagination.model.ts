import { z } from 'zod';

export const PaginationSchema = z.object({
  startIndex: z.coerce.number().int().min(0).optional().default(0),
  pageSize: z.coerce.number().int().min(1).optional().default(100),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) => {
  return z.object({
    startIndex: z.number().int().min(0),
    pageSize: z.number().int().min(1),
    totalCount: z.number().int().min(0),
    items: z.array(itemSchema),
  });
};
export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof createPaginatedResponseSchema<z.ZodType<T>>>
>;

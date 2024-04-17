import { z } from 'zod';

export const PaginationSchema = z.object({
  startIndex: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).optional().default(100),
});

export type Pagination = z.infer<typeof PaginationSchema>;

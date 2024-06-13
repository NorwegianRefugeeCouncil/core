import { z } from 'zod';

export const IsoCodeSchema = z.string().min(1).max(20);
export type IsoCode = z.infer<typeof IsoCodeSchema>;

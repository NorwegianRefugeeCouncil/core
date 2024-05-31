import { z } from 'zod';

export const IsoCodeSchema = z.string().max(20);
export type IsoCode = z.infer<typeof IsoCodeSchema>;

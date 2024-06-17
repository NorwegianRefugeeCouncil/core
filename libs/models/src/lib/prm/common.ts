import { z } from 'zod';

export const IsoCodeSchema = z.string().min(1).max(20);
export type IsoCode = z.infer<typeof IsoCodeSchema>;

export const DateOfBirthSchema = z.coerce
  .date()
  .min(new Date('1900-01-01'))
  .max(new Date());

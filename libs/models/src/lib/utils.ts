import { z } from 'zod';

export const BoolStr = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true';
  }
  return val;
}, z.boolean());

export const UUIDSchema = z.string().uuid();
export const ULIDSchema = z.string().regex(/^ulid_[0-9a-zA-Z]{26}$/);

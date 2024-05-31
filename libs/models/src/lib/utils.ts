import { z } from 'zod';

export const BoolStr = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true';
  }
  return val;
}, z.boolean());

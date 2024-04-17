import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false,
  message: 'Too many requests',
  keyGenerator: (req, res): string => {
    if (!req.ip) {
      console.error('Warning: request.ip is missing!');
      return req.socket.remoteAddress ?? '';
    }

    return req.ip.replace(/:\d+[^:]*$/, '');
  },
});

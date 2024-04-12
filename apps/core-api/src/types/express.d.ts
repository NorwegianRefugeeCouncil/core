import { Request as JWTRequest } from 'express-jwt';

import { User } from '../models/user.model';

export {};

declare global {
  declare namespace Express {
    export interface Request {
      user?: User;
      auth?: JWTRequest['auth']; // This is typed as any, I couldn't get this quite right
    }
  }
}

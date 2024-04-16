import { User } from '../models/user.model';

export {};

declare global {
  declare namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

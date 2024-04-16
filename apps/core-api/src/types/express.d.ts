import { User as CoreUser } from '../models/user.model';

export {};

declare global {
  namespace Express {
    interface User extends CoreUser {
      __ignore__: undefined; // HACK: This is a workaround to prevent TS from removing the declaration
    }
  }
}

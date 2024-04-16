import { User as CoreUser } from '@nrcno/core-models';

declare global {
  namespace Express {
    interface User extends CoreUser {
      __ignore__: undefined; // HACK: This is a workaround to prevent TS from removing the declaration
    }
  }
}

import { User as CoreUser, PermissionMap } from '@nrcno/core-models';

export {};

type CoreUserWithPermissions = CoreUser & {
  permissions: PermissionMap;
};

declare global {
  namespace Express {
    interface User extends CoreUserWithPermissions {
      __ignore__?: undefined; // HACK: This is a workaround to prevent TS from removing the declaration
    }
  }
}

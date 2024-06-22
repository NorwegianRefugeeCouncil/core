import { useMemo } from 'react';
import { Permissions } from '@nrcno/core-models';

import { useUserContext } from '../user.context';

type Props = {
  permissions: Permissions | Permissions[];
  every?: boolean;
  children: React.ReactNode;
};

export const PermissionGate: React.FC<Props> = ({
  permissions,
  every,
  children,
}) => {
  const { me } = useUserContext();

  const hasPermission = useMemo(
    () =>
      every
        ? [permissions].flat().every((p) => me.data?.permissions[p])
        : [permissions].flat().some((p) => me.data?.permissions[p]),
    [JSON.stringify(me.data?.permissions), JSON.stringify(permissions)],
  );

  return hasPermission ? children : null;
};

export const withPermissionGate =
  (permissions: Permissions | Permissions[]) =>
  <T extends object>(Component: React.FC<T>) =>
  (props: T) => (
    <PermissionGate permissions={permissions}>
      <Component {...props} />
    </PermissionGate>
  );

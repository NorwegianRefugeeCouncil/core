import { VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { Permissions } from '@nrcno/core-models';
import { PermissionGate } from '@nrcno/core-user-components';

export const Navigation: React.FC = () => {
  return (
    <VStack>
      <PermissionGate
        permissions={[
          Permissions.ViewProgrammeData,
          Permissions.EditProgrammeData,
          Permissions.DeleteProgrammeData,
        ]}
        every={false}
      >
        <Link to="/prm/individuals">Individuals</Link>
      </PermissionGate>
      <PermissionGate permissions={Permissions.ManageUsers}>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/positions">Positions</Link>
        <Link to="/admin/teams">Teams</Link>
      </PermissionGate>
      <Link to="/developer-tools">Developer Tools</Link>
    </VStack>
  );
};

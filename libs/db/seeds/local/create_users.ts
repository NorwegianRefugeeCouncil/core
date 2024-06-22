import { getAuthorisationClient } from '@nrcno/core-authorisation';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // TODO: Fetch users from Okta and insert them into the database
  // const scimUsers: ScimUser[] = await axios.get(...);
  // const users: User[] = scimUsers.map(mapScimUserToUser);
  // const snakeCaseUsers = users.map((user) => camelToSnake(user));
  // await knex('users').insert(snakeCaseUsers);

  const [{ count }] = await knex('users').count();
  if (count !== '0') {
    return;
  }

  const users = [
    {
      id: '261d304f-ec5b-4ecb-8d7c-88c4583cc832',
      oktaId: '00u7gyomqtlFFSaNW5d7',
      userName: 'irena.lammerer@nrc.no',
      firstName: 'Irena',
      lastName: 'Lammerer',
      displayName: 'Irena Lammerer',
      emails: JSON.stringify([
        {
          primary: true,
          value: 'irena.lammerer@nrc.no',
          type: 'work',
        },
      ]),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: {},
    },
    {
      id: '0b8e4278-a133-49dc-adf6-f43e74d4546a',
      oktaId: '00u7gxn090KJDLL0v5d7',
      userName: 'ben.mcalindin@nrc.no',
      firstName: 'Benjamin',
      lastName: 'McAlindin',
      displayName: 'Benjamin McAlindin',
      emails: JSON.stringify([
        {
          primary: true,
          value: 'ben.mcalindin@nrc.no',
          type: 'work',
        },
      ]),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: {},
    },
    {
      id: '2663e6fc-ed4d-4c7d-af31-22a3b88c4dec',
      oktaId: '00udavk2lifhfWNwX5d7',
      userName: 'david.figueroa@nrc.no',
      firstName: 'David',
      lastName: 'Figueroa',
      displayName: 'David Figueroa',
      emails: JSON.stringify([
        {
          primary: true,
          value: 'david.figueroa@nrc.no',
          type: 'work',
        },
      ]),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: {},
    },
  ];

  const superAdminPosition = {
    id: 'b0e5f7f6-3b6e-4e7a-9f9f-2e3f1b8b2d7a',
    name: 'Default super admin',
  };

  await knex('users').del();
  await knex('users').insert(users);

  await knex('positions').del();
  await knex('positions').insert([superAdminPosition]);

  await knex('position_roles').del();
  await knex('position_roles').insert([
    {
      position_id: superAdminPosition.id,
      role: 'super_admin',
    },
  ]);

  await knex('position_user_assignments').del();
  await knex('position_user_assignments').insert(
    users.map((user) => ({
      position_id: superAdminPosition.id,
      user_id: user.id,
    })),
  );

  const authorisationClient = getAuthorisationClient();
  await authorisationClient.position.create({
    id: superAdminPosition.id,
    name: superAdminPosition.name,
    staff: users.map((user) => ({
      ...user,
      emails: [],
    })),
    roles: {
      super_admin: true,
    },
  });
}

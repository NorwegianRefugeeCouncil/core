import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  // TODO: Fetch users from Okta and insert them into the database
  // const scimUsers: ScimUser[] = await axios.get(...);
  // const users: User[] = scimUsers.map(mapScimUserToUser);
  // const snakeCaseUsers = users.map((user) => camelToSnake(user));
  // await knex('users').insert(snakeCaseUsers);

  await knex('users').insert([
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
      createdAt: '2024-04-15T17:10:22.288Z',
      updatedAt: '2024-04-15T17:10:22.288Z',
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
      createdAt: '2024-04-15T17:10:22.875Z',
      updatedAt: '2024-04-15T17:10:22.875Z',
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
      createdAt: '2024-04-16T12:17:54.390Z',
      updatedAt: '2024-04-16T12:17:54.390Z',
    },
  ]);
}

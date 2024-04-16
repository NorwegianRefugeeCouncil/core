import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  // TODO: Fetch users from Okta and insert them into the database
  // const scimUsers: ScimUser[] = await axios.get(...);
  // const users: User[] = scimUsers.map(mapScimUserToUser);
  // const snakeCaseUsers = users.map((user) => camelToSnake(user));
  // await knex('users').insert(snakeCaseUsers);

  // await knex('users').insert([
  //   {
  //     id: '887063c7-7937-40bc-a7a5-4a92a88501a8',
  //     okta_id: 'admin',
  //     user_name: 'admin',
  //     first_name: 'Admin',
  //     last_name: 'User',
  //     display_name: 'Admin User',
  //     emails: JSON.stringify([
  //       {
  //         value: 'admin@not.nrc.no',
  //         primary: true,
  //         type: 'work',
  //       },
  //     ]),
  //     active: true,
  //   },
  // ]);
}

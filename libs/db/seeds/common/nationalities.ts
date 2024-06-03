import * as fs from 'fs';
import * as path from 'path';

import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const nationalities: {
    id: string;
  }[] = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../../constants/', 'countries.json'),
      'utf8',
    ),
  ).map((nat: any) => ({
    id: nat.iso3166Alpha3,
  }));

  // Upsert all rows in nationalities
  await knex('nationalities').insert(nationalities).onConflict('id').merge();

  // Disable any rows not in nationalities
  await knex('nationalities')
    .whereNotIn(
      'id',
      nationalities.map((nat) => nat.id),
    )
    .update({ enabled: false });
}

import * as fs from 'fs';
import * as path from 'path';

import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const languages: {
    id: string;
  }[] = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../../constants/', 'languages.json'),
      'utf8',
    ),
  ).map((lang: any) => ({
    id: lang.id,
  }));

  // Upsert all rows in languages
  await knex('languages').insert(languages).onConflict('id').merge();

  // Disable any rows not in languages
  await knex('languages')
    .whereNotIn(
      'id',
      languages.map((lang) => lang.id),
    )
    .update({ enabled: false });
}

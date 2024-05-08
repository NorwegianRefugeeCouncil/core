import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // TODO: Import languages from a JSON file
  const languages = [
    { isoCode: 'en' },
    { isoCode: 'es' },
    { isoCode: 'fr' },
    { isoCode: 'ar' },
  ];

  // Upsert all rows in languages
  await knex('languages').insert(languages).onConflict('iso_code').merge();

  // Disable any rows not in languages
  await knex('languages')
    .whereNotIn(
      'iso_code',
      languages.map((lang) => lang.isoCode),
    )
    .update({ enabled: false });
}

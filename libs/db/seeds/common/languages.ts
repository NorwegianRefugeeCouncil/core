import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // TODO: Import languages from a JSON file
  const languages = [
    { translationKey: 'language__en', isoCode: 'en' },
    { translationKey: 'language__es', isoCode: 'es' },
    { translationKey: 'language__fr', isoCode: 'fr' },
    { translationKey: 'language__ar', isoCode: 'ar' },
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

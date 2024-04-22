import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // TODO: Import nationalities from a JSON file
  const nationalities = [
    { translationKey: 'nationality__en', isoCode: 'en' },
    { translationKey: 'nationality__es', isoCode: 'es' },
    { translationKey: 'nationality__fr', isoCode: 'fr' },
    { translationKey: 'nationality__ar', isoCode: 'ar' },
  ];

  // Upsert all rows in nationalities
  await knex('nationality')
    .insert(nationalities)
    .onConflict('iso_code')
    .merge();

  // Disable any rows not in nationalities
  await knex('nationality')
    .whereNotIn(
      'iso_code',
      nationalities.map((lang) => lang.isoCode),
    )
    .update({ enabled: false });
}

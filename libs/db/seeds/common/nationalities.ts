import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // TODO: Import nationalities from a JSON file
  const nationalities = [
    { isoCode: 'en' },
    { isoCode: 'es' },
    { isoCode: 'fr' },
    { isoCode: 'ar' },
  ];

  // Upsert all rows in nationalities
  await knex('nationalities')
    .insert(nationalities)
    .onConflict('iso_code')
    .merge();

  // Disable any rows not in nationalities
  await knex('nationalities')
    .whereNotIn(
      'iso_code',
      nationalities.map((lang) => lang.isoCode),
    )
    .update({ enabled: false });
}

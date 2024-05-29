import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // TODO: Import nationalities from a JSON file
  const nationalities = [
    { id: 'en' },
    { id: 'es' },
    { id: 'fr' },
    { id: 'ar' },
  ];

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

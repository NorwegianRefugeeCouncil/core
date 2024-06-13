import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE participants CASCADE');
  await knex.raw('TRUNCATE TABLE persons CASCADE');
  await knex.raw('TRUNCATE TABLE entities CASCADE');
}

export async function down(knex: Knex): Promise<void> {
  // Can't be undone, but since we only have test data in DEV, this is not a problem
}

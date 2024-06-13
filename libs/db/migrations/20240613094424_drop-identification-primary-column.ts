import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('participant_identifications', (table) => {
    table.dropColumn('is_primary');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('participant_identifications', (table) => {
    table.boolean('is_primary').notNullable().defaultTo(false);
  });
}

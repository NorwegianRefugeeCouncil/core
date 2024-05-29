import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('participants', (table) => {
    table.boolean('prefers_anonymity');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('participants', (table) => {
    table.dropColumn('prefers_anonymity');
  });
}

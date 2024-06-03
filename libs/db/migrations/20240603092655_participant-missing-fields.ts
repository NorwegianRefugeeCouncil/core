import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('participants', (table) => {
    table.boolean('prefers_to_remain_anonymous');
    table.string('preferred_language');
    table.date('date_of_registration');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('participants', (table) => {
    table.dropColumn('prefers_to_remain_anonymous');
    table.dropColumn('preferred_language');
    table.dropColumn('date_of_registration');
  });
}

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('participants', (table) => {
    table.index('last_name');
    table.index('date_of_birth');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('participants', (table) => {
    table.dropIndex('last_name');
    table.dropIndex('date_of_birth');
  });
}

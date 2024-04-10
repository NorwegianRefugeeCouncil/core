import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('okta_id').unique();
    table.string('user_name').unique().notNullable();
    table.string('first_name');
    table.string('last_name');
    table.string('display_name');
    table.jsonb('emails');
    table.boolean('active').defaultTo(true);
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}

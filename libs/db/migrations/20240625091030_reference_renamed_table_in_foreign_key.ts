import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('household_individuals', (table) => {
    table.dropForeign('individual_id');
    table
      .foreign('individual_id')
      .references('individuals.id')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('household_individuals', (table) => {
    table.dropForeign('individual_id');
    table
      .foreign('individual_id')
      .references('participants.id')
      .onDelete('CASCADE');
  });
}

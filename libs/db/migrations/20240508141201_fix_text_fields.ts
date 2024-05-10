import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('participants', (table) => {
    table.text('residence').alter();
    table.text('contact_means_comment').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('participants', (table) => {
    table.string('residence').alter();
    table.string('contact_means_comment').alter();
  });
}

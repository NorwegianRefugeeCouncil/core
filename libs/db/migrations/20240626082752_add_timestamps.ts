import type { Knex } from 'knex';

const tables = ['households', 'household_individuals'];

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = current_timestamp(3);
       RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  for (const table of tables) {
    await knex.schema.table(table, (table) => {
      table.timestamp('created_at', { precision: 3 }).defaultTo(knex.fn.now(3));
      table.timestamp('updated_at', { precision: 3 }).defaultTo(knex.fn.now(3));
    });

    await knex.raw(`
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP FUNCTION update_updated_at_column CASCADE;`);

  for (const table of tables) {
    await knex.schema.table(table, (table) => {
      table.dropColumn('created_at');
      table.dropColumn('updated_at');
    });
  }
}

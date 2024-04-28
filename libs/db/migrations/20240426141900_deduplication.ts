import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$;
  `);

  await knex.schema.createTable('duplicates', (table) => {
    table.string('participant_id_a', 26).notNullable();
    table.string('participant_id_b', 26).notNullable();
    table.float('weighted_score').notNullable();
    table.jsonb('scores').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.primary(['participant_id_a', 'participantIdB']);
  });

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON duplicates 
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);

  await knex.schema.createTable('deduplication_resolutions', (table) => {
    table.string('participant_id_a', 26).notNullable();
    table.string('participantIdB', 26).notNullable();
    table.enum('resolution', ['merge', 'ignore']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.primary(['participant_id_a', 'participantIdB']);
  });

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON deduplication_resolutions 
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('duplicates');
  await knex.schema.dropTable('deduplication_resolution');
  await knex.raw('DROP FUNCTION update_timestamp');
}

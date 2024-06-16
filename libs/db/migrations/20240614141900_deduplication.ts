import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION DICE_COEFF(p_str1 text, p_str2 text) RETURNS float AS $$
    DECLARE
      co_substr_len CONSTANT integer := 2;
      v_x     text[];
      v_y     text[];
      v_inter text[];
      v_part  text;
      i       integer;
    BEGIN
      -- building set X
      FOR i IN 1 .. length(p_str1) - co_substr_len + 1 LOOP
        v_part := substr(p_str1, i, co_substr_len);
        v_x := array_append(v_x, v_part);
      END LOOP;

      -- building set Y
      FOR i IN 1 .. length(p_str2) - co_substr_len + 1 LOOP
        v_part := substr(p_str2, i, co_substr_len);
        v_y := array_append(v_y, v_part);

        IF v_part = ANY(v_x) THEN
          v_inter := array_append(v_inter, v_part); -- build intersect            
        END IF;
      END LOOP;

      RETURN 2.0 * array_length(v_inter, 1) / (array_length(v_x, 1) + array_length(v_y, 1));
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION levenshtein_norm(text, text) RETURNS float AS $$
    DECLARE
      len_a float;
      len_b float;
      lev float;
    BEGIN
      len_a := length($1);
      len_b := length($2);
      lev := levenshtein($1, $2);
      RETURN lev / greatest(len_a, len_b);
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION jaccard_similarity(set1 TEXT[], set2 TEXT[])
RETURNS FLOAT AS $$
DECLARE
    intersection_count INTEGER;
    union_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO intersection_count
    FROM UNNEST(set1) s1
    WHERE s1 = ANY(set2);

    SELECT COUNT(*) INTO union_count
    FROM (
        SELECT UNNEST(set1) AS element
        UNION
        SELECT UNNEST(set2)
    ) AS union_set;

    RETURN intersection_count::FLOAT / union_count;
END;
$$ LANGUAGE plpgsql;
    `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION normalise_address(address TEXT)
RETURNS TEXT AS $$
DECLARE
    address_lower TEXT;
    address_normalised TEXT;
BEGIN
    address_lower := LOWER(address);
    address_normalised := address_lower;

    address_normalised := REPLACE(address_normalised, ' rd', ' road');
    address_normalised := REPLACE(address_normalised, ' st', ' street');
    address_normalised := REPLACE(address_normalised, ' ave', ' avenue');
    address_normalised := REPLACE(address_normalised, ' pl', ' place');
    address_normalised := REPLACE(address_normalised, ' dr', ' drive');
    address_normalised := REPLACE(address_normalised, ' blvd', ' boulevard');
    address_normalised := REPLACE(address_normalised, ' ct', ' court');
    address_normalised := REPLACE(address_normalised, ' sq', ' square');
    address_normalised := REPLACE(address_normalised, ' apt', ' apartment');

    RETURN address_normalised;
END;
$$ LANGUAGE plpgsql;
    `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION calculate_residence_score(address1 text, address2 text)
  RETURNS float AS $$
  DECLARE
    address1Normalised text;
    address2Normalised text;
    address1Tokens text[];
    address2Tokens text[];
  BEGIN
    IF address1 IS NULL OR address2 IS NULL THEN
      RETURN 0;
    END IF;

    address1Normalised := normalise_address(address1);
    address2Normalised := normalise_address(address2);

    address1Tokens := STRING_TO_ARRAY(TRIM(address1Normalised), ' ');
    address2Tokens := STRING_TO_ARRAY(TRIM(address2Normalised), ' ');

    RETURN jaccard_similarity(address1Tokens, address2Tokens);
  END;
  $$ LANGUAGE plpgsql;
  `);

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

  await knex.raw(`
    CREATE INDEX idx_participants_on_id_updated_at_sex_nrc_id
    ON participants(id, updated_at, sex, nrc_id)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('duplicates');
  await knex.schema.dropTable('deduplication_resolution');
  await knex.raw('DROP FUNCTION update_timestamp');
}

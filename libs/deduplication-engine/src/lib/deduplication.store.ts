import { getDb } from '@nrcno/core-db';
import { getLogger } from '@nrcno/core-logger';
import {
  DeduplicationRecord,
  DeduplicationRecordDefinition,
  DeduplicationRecordSchema,
  Individual,
  IndividualDefinition,
  Pagination,
} from '@nrcno/core-models';

export const count = async (): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('duplicates').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const list = async (
  pagination: Pagination,
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const rows = await db('duplicates')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderBy('weighted_score', 'desc');

  return rows.map((row: any) => {
    const {
      individualIdA,
      individualIdB,
      weightedScore,
      createdAt,
      updatedAt,
      scores,
    } = row;

    return DeduplicationRecordSchema.parse({
      individualIdA,
      individualIdB,
      weightedScore,
      scores,
      createdAt,
      updatedAt,
    });
  });
};

export const upsert = async (
  records: (DeduplicationRecord | DeduplicationRecordDefinition)[],
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const insertRecords = records.map((record) => ({
    individualIdA: record.individualIdA,
    individualIdB: record.individualIdB,
    weightedScore: record.weightedScore,
    scores: JSON.stringify(record.scores),
  }));

  const rows = await db('duplicates')
    .insert(insertRecords)
    .onConflict(['individualId_a', 'individualId_b'])
    .merge()
    .returning('*');

  return rows.map((r) => DeduplicationRecordSchema.parse(r));
};

export const getForUser = async (
  individualId: string,
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const rows = await db('duplicates')
    .where('individualId_a', individualId)
    .orWhere('individualId_b', individualId);

  return rows.map((r: unknown) => DeduplicationRecordSchema.parse(r));
};

export const deletePair = async (
  individualIdA: string,
  individualIdB: string,
): Promise<void> => {
  const db = getDb();

  await db('duplicates')
    .where('individualId_a', individualIdA)
    .andWhere('individualId_b', individualIdB)
    .del();
};

export const logResolution = async (
  individualIdA: string,
  individualIdB: string,
  resolution: 'merge' | 'ignore',
): Promise<void> => {
  const db = getDb();

  await db('deduplication_resolutions').insert({
    individualId_a: individualIdA,
    individualId_b: individualIdB,
    resolution,
  });
};

export const prepareTempIndividualTables = async (
  individuals: (Individual | IndividualDefinition)[],
  tempTableId: string,
): Promise<void> => {
  const db = getDb();

  await db.raw(`
    CREATE TEMPORARY TABLE individuals_${tempTableId} AS (
      SELECT * FROM individuals WHERE FALSE
    )  
  `);

  await db.raw(`
    ALTER TABLE individuals_${tempTableId}
    ALTER COLUMN id DROP NOT NULL
  `);

  await db.raw(`
    ALTER TABLE individuals_${tempTableId}
    ADD COLUMN idx SERIAL PRIMARY KEY
  `);

  await db.raw(`
    CREATE TEMPORARY TABLE individual_contact_details_${tempTableId} AS (
      SELECT * FROM individual_contact_details WHERE FALSE
    )
  `);

  await db.raw(`
    ALTER TABLE individual_contact_details_${tempTableId}
    ALTER COLUMN individualId DROP NOT NULL
  `);

  await db.raw(`
    ALTER TABLE individual_contact_details_${tempTableId}
    ADD COLUMN idx SERIAL PRIMARY KEY
  `);

  await db.raw(`
    CREATE TEMPORARY TABLE individual_identifications_${tempTableId} AS (
      SELECT * FROM individual_identifications WHERE FALSE
    )
  `);

  await db.raw(`
    ALTER TABLE individual_identifications_${tempTableId}
    ALTER COLUMN individualId DROP NOT NULL
  `);

  await db.raw(`
    ALTER TABLE individual_identifications_${tempTableId}
    ADD COLUMN idx SERIAL PRIMARY KEY
  `);

  const data = individuals.reduce<{
    individuals: any[];
    individualContactDetails: any[];
    individualIdentifications: any[];
  }>(
    (acc, ind: any, idx) => {
      const { id, phones, emails, identification, ...individual } = ind;
      return {
        individuals: [
          ...acc.individuals,
          {
            ...individual,
            id,
            idx,
          },
        ],
        individualContactDetails: [
          ...acc.individualContactDetails,
          ...phones.map((phone: any) => ({
            ...phone,
            individualId: id,
            contactDetailType: 'phone',
            idx,
          })),
          ...emails.map((email: any) => ({
            ...email,
            individualId: id,
            contactDetailType: 'email',
            idx,
          })),
        ],
        individualIdentifications: [
          ...acc.individualIdentifications,
          ...identification.map((idn: any) => ({
            ...idn,
            individualId: id,
            idx,
          })),
        ],
      };
    },
    {
      individuals: [],
      individualContactDetails: [],
      individualIdentifications: [],
    },
  );

  await db(`individuals_${tempTableId}`).insert(data.individuals);
  await db(`individual_contact_details_${tempTableId}`).insert(
    data.individualContactDetails,
  );
  await db(`individual_identifications_${tempTableId}`).insert(
    data.individualIdentifications,
  );
};

export const prepareViews = async (
  tempTableId?: string,
  compareWithSelf?: boolean,
): Promise<void> => {
  const logger = getLogger();
  const db = getDb();

  const individualIdentificationsTableNameA = tempTableId
    ? `individual_identifications_${tempTableId}`
    : 'individual_identifications';
  const individualIdentificationsTableNameB =
    compareWithSelf && tempTableId
      ? `individual_identifications_${tempTableId}`
      : 'individual_identifications';

  logger.info('Preparing individual_identification_matches temp table');
  await db.raw(`
    CREATE TEMPORARY TABLE individual_identification_matches AS (
      SELECT
        individual_identifications_a.individual_id AS individual_id_a,
        individual_identifications_b.individual_id AS individual_id_b
      FROM
        ${individualIdentificationsTableNameA} AS individual_identifications_a
      CROSS JOIN
        ${individualIdentificationsTableNameB} AS individual_identifications_b
      WHERE
        individual_identifications_a.identification_type = individual_identifications_b.identification_type
      AND
        individual_identifications_a.identification_number = individual_identifications_b.identification_number
    )
  `);

  logger.info('Creating indexes for individual_identification_matches');
  await db.raw(`
    CREATE INDEX idx_pim_on_individual_id_a_id_b
    ON individual_identification_matches(individual_id_a, individual_id_b)
  `);

  return;
};

export async function* getExactMatches(
  fromDate: Date,
  tempTableId?: boolean,
  compareWithSelf?: boolean,
): AsyncGenerator<DeduplicationRecord, void, unknown> {
  const individualATableName = tempTableId
    ? `individuals_${tempTableId}`
    : 'individuals';
  const individualBTableName =
    compareWithSelf && tempTableId
      ? `individuals_${tempTableId}`
      : 'individuals';

  const db = getDb();

  const result = await db.raw(
    `
    SELECT individuals_a.id as individual_id_a, individuals_b.id as individual_id_b
    FROM ${individualATableName} individuals_a
    CROSS JOIN ${individualBTableName} individuals_b
    WHERE individuals_a.id != individuals_b.id
    AND individuals_a.updated_at >= ?
    AND (
      individuals_a.nrc_id = individuals_b.nrc_id
      OR (individuals_a.id, individuals_b.id) IN (
        SELECT individual_id_a, individual_id_b
        FROM individual_identification_matches
      )
    )
  `,
    [fromDate],
  );

  for (const row of result.rows) {
    yield row.map((r: any) => ({
      individualIdA: r.individual_id_a,
      individualIdB: r.individual_id_b,
      weightedScore: 1,
      scores: {},
    }));
  }
}

export async function* getWeightedMatches(
  fromDate: Date,
  pagination: Pagination,
  tempTableId?: boolean,
  compareWithSelf?: boolean,
): AsyncGenerator<any, void, unknown> {
  const individualATableName = tempTableId
    ? `individuals_${tempTableId}`
    : 'individuals';
  const individualBTableName =
    compareWithSelf && tempTableId
      ? `individuals_${tempTableId}`
      : 'individuals';

  const individualContactDetailsTableNameA = tempTableId
    ? `individual_contact_details_${tempTableId}`
    : 'individual_contact_details';
  const individualContactDetailsTableNameB =
    compareWithSelf && tempTableId
      ? `individual_contact_detail_${tempTableId}`
      : 'individual_contact_details';

  const db = getDb();

  await db.raw(
    `
    CREATE TEMPORARY TABLE individual_max_email_score AS (
      SELECT
        icd_a.individual_id as individual_id_a,
        icd_b.individual_id as individual_id_b,  
        MAX(
          CASE
            WHEN split_part(icd_a.raw_value, '@', 2) != split_part(icd_b.raw_value, '@', 2) THEN 0
            ELSE DICE_COEFF(icd_a.raw_value, icd_b.raw_value)
          END
        ) as email_score_max
      FROM ${individualContactDetailsTableNameA} AS icd_a
      JOIN ${individualContactDetailsTableNameB} AS icd_b ON icd_a.individual_id != icd_b.individual_id AND icd_a.contact_detail_type = 'email' AND icd_b.contact_detail_type = 'email'
      JOIN (
        SELECT id
        FROM ${individualContactDetailsTableNameA} 
        ORDER BY updated_at DESC
        LIMIT ?
        OFFSET ?
      ) sub_icd ON icd_a.id = sub_icd.id
      GROUP BY icd_a.individual_id, icd_b.individual_id
    )  
  `,
    [pagination.pageSize, pagination.startIndex],
  );

  await db.raw(`
    CREATE INDEX idx_pmes_on_individual_id_a_id_b
    ON individual_max_email_score(individual_id_a, individual_id_b)
  `);

  const result = await db.raw(
    `
    SELECT
      ia.id as individual_id_a,
      ib.id as individual_id_b,
      CASE
        WHEN ia.date_of_birth IS NOT NULL AND ib.date_of_birth IS NOT NULL AND ia.date_of_birth = ib.date_of_birth THEN 1
        ELSE 0
      END as dob_score,
      ((
        DICE_COEFF(ia.first_name, ib.first_name) +
        DICE_COEFF(ia.last_name, ib.last_name) +
        DICE_COEFF(concat(ia.first_name, ' ', ia.last_name), concat(ib.first_name, ' ', ib.last_name))
      ) / 3) as name_score,
      pmes.email_score_max as email_score,
      calculate_address_score(ia.address, ib.address) as address_score
    FROM ${individualATableName} ia
    JOIN ${individualBTableName} ib ON ia.sex = ib.sex AND ia.nrc_id != ib.nrc_id AND ia.id != ib.id
    LEFT JOIN individual_max_email_score pmes ON ia.id = pmes.individual_id_a AND ib.id = pmes.individual_id_b
    LEFT JOIN individual_identification_matches pim ON ia.id = pim.individual_id_a AND ib.id = pim.individual_id_b
    JOIN (
      SELECT id
      FROM ${individualATableName} 
      ORDER BY updated_at DESC
      LIMIT ?
      OFFSET ?
    ) sub_ia ON ia.id = sub_ia.id
    WHERE ia.updated_at >= ?
    AND pim.individual_id_a IS NULL
    AND pim.individual_id_b IS NULL  
  `,
    [pagination.pageSize, pagination.startIndex, fromDate],
  );

  await db.raw(`
    DROP TABLE individual_max_email_score
  `);

  for (const row of result.rows) {
    yield row;
  }
}

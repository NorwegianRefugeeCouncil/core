import { getDb } from '@nrcno/core-db';
import { getLogger } from '@nrcno/core-logger';
import {
  DeduplicationRecord,
  DeduplicationRecordDefinition,
  DeduplicationRecordSchema,
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

export const prepareViews = async (): Promise<void> => {
  const logger = getLogger();
  const db = getDb();

  logger.info('Preparing individual_identification_matches temp table');
  await db.raw(`
    CREATE TEMPORARY TABLE individual_identification_matches AS (
      SELECT
        individual_identifications_a.individual_id AS individual_id_a,
        individual_identifications_b.individual_id AS individual_id_b
      FROM
        individual_identifications AS individual_identifications_a
      CROSS JOIN
        individual_identifications AS individual_identifications_b
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

export async function* getIndividualIdPairs(
  fromDate: Date,
): AsyncGenerator<[string, string], void, unknown> {
  const db = getDb();

  const result = await db.raw(
    `
    SELECT individuals_a.id as individual_id_a, individuals_b.id as individual_id_b
    FROM individuals individuals_a
    CROSS JOIN individuals individuals_b
    WHERE individuals_a.id != individuals_b.id
    AND individuals_a.updated_at >= ?
    AND individuals_a.sex = individuals_b.sex
    AND individuals_a.nrc_id != individuals_b.nrc_id
    AND (individuals_a.id, individuals_b.id) NOT IN (
      SELECT individual_id_a, individual_id_b
      FROM individual_identification_matches
    )
  `,
    [fromDate],
  );

  for (const row of result.rows) {
    yield [row.individual_id_a, row.individual_id_b];
  }
}

export async function* getExactMatches(
  fromDate: Date,
): AsyncGenerator<DeduplicationRecord, void, unknown> {
  const db = getDb();

  const result = await db.raw(
    `
    SELECT individuals_a.id as individual_id_a, individuals_b.id as individual_id_b
    FROM individuals individuals_a
    CROSS JOIN individuals individuals_b
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
): AsyncGenerator<any, void, unknown> {
  const db = getDb();

  await db.raw(
    `
    CREATE TEMPORARY TABLE individual_max_email_score AS (
      SELECT
        pcd_a.individual_id as individual_id_a,
        pcd_b.individual_id as individual_id_b,  
        MAX(
          CASE
            WHEN split_part(pcd_a.raw_value, '@', 2) != split_part(pcd_b.raw_value, '@', 2) THEN 0
            ELSE DICE_COEFF(pcd_a.raw_value, pcd_b.raw_value)
          END
        ) as email_score_max
      FROM individual_contact_details AS pcd_a
      JOIN individual_contact_details AS pcd_b ON pcd_a.individual_id != pcd_b.individual_id AND pcd_a.contact_detail_type = 'email' AND pcd_b.contact_detail_type = 'email'
      JOIN (
        SELECT id
        FROM individual_contact_details
        ORDER BY updated_at DESC
        LIMIT ?
        OFFSET ?
      ) sub_pcd ON pcd_a.id = sub_pcd.id
      GROUP BY pcd_a.individual_id, pcd_b.individual_id
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
      pa.id as individual_id_a,
      pb.id as individual_id_b,
      CASE
        WHEN pa.date_of_birth IS NOT NULL AND pb.date_of_birth IS NOT NULL AND pa.date_of_birth = pb.date_of_birth THEN 1
        ELSE 0
      END as dob_score,
      ((
        DICE_COEFF(pa.first_name, pb.first_name) +
        DICE_COEFF(pa.last_name, pb.last_name) +
        DICE_COEFF(concat(pa.first_name, ' ', pa.last_name), concat(pb.first_name, ' ', pb.last_name))
      ) / 3) as name_score,
      pmes.email_score_max as email_score,
      calculate_residence_score(pa.residence, pb.residence) as residence_score
    FROM individuals pa
    JOIN individuals pb ON pa.sex = pb.sex AND pa.nrc_id != pb.nrc_id AND pa.id != pb.id
    LEFT JOIN individual_max_email_score pmes ON pa.id = pmes.individual_id_a AND pb.id = pmes.individual_id_b
    LEFT JOIN individual_identification_matches pim ON pa.id = pim.individual_id_a AND pb.id = pim.individual_id_b
    JOIN (
      SELECT id
      FROM individuals
      ORDER BY updated_at DESC
      LIMIT ?
      OFFSET ?
    ) sub_pa ON pa.id = sub_pa.id
    WHERE pa.updated_at >= ?
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

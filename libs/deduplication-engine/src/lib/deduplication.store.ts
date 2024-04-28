import { getDb } from '@nrcno/core-db';
import {
  DeduplicationRecord,
  DeduplicationRecordSchema,
} from '@nrcno/core-models';

export const list = async (): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const rows = await db('duplicates');

  return rows.map((row: any) => {
    const { participantIdA, participantIdB, weightedScore, ...scores } = row;
    return DeduplicationRecordSchema.parse({
      participantIdA,
      participantIdB,
      weightedScore,
      scores,
    });
  });
};

export const upsert = async (
  records: DeduplicationRecord[],
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const insertRecords = records.map((record) => ({
    participantIdA: record.participantIdA,
    participantIdB: record.participantIdB,
    weightedScore: record.weightedScore,
    scores: JSON.stringify(record.scores),
  }));

  const rows = await db('duplicates')
    .insert(insertRecords)
    .onConflict(['participantId_a', 'participantId_b'])
    .merge()
    .returning('*');

  return rows.map((r) => DeduplicationRecordSchema.parse(r));
};

export const getForUser = async (
  participantId: string,
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const rows = await db('duplicates')
    .where('participantId_a', participantId)
    .orWhere('participantId_b', participantId);

  return rows.map((r: unknown) => DeduplicationRecordSchema.parse(r));
};

export const deletePair = async (
  participantIdA: string,
  participantIdB: string,
): Promise<void> => {
  const db = getDb();

  await db('duplicates')
    .where('participantId_a', participantIdA)
    .andWhere('participantId_b', participantIdB)
    .del();
};

export const logResolution = async (
  participantIdA: string,
  participantIdB: string,
  resolution: 'merge' | 'ignore',
): Promise<void> => {
  const db = getDb();

  await db('deduplication_resolutions').insert({
    participantId_a: participantIdA,
    participantId_b: participantIdB,
    resolution,
  });
};

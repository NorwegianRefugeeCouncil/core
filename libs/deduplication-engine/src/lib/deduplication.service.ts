import { Participant } from '@nrcno/core-models';
import { PrmService } from '@nrcno/core-prm-engine';

import * as DeduplicationStore from './deduplication.store';
import { DeduplicationRecord } from './deduplication.model';
import { config, totalWeight } from './config';

const cutoff = 0.4;
const batchSize = 1000;
const returnLimit = 10;

const ParticipantService = PrmService.participants;

const compareParticipants = (
  participantA: Partial<Participant>,
  participantB: Participant,
): DeduplicationRecord => {
  const scores: DeduplicationRecord['scores'] = config.reduce(
    (acc, { key, score, weight }) => {
      const s = score(participantA, participantB);
      return {
        ...acc,
        [key]: {
          raw: s,
          weighted: s * weight,
        },
      };
    },
    {},
  );

  const weightedScore =
    Object.values(scores).reduce((acc, { weighted }) => acc + weighted, 0) /
    totalWeight;

  return {
    participantIdA: participantA.id,
    participantIdB: participantB.id,
    weightedScore,
    scores,
  };
};

export const getDuplicatesForParticipant = async (
  participantA: Partial<Participant>,
): Promise<DeduplicationRecord[]> => {
  const getDuplicatesForParticipantIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecord[]> => {
    const participants = await ParticipantService.list({
      startIndex,
      limit: batchSize,
    });
    return participants.map((participantB) =>
      compareParticipants(participantA, participantB),
    );
  };

  const results: DeduplicationRecord[] = [];
  const totalParticipants = await ParticipantService.count();
  const batches = Math.ceil(totalParticipants / batchSize);

  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize;
    const records = await getDuplicatesForParticipantIdBatch(startIdx);
    for (const record of records) {
      if (record.weightedScore > cutoff) {
        results.push(record);
      }
    }
  }

  return results
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, returnLimit);
};

export const compareAllParticipants = async (): Promise<void> => {
  const getDuplicatesForParticipantIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecord[]> => {
    const participants = await ParticipantService.list({
      startIndex,
      limit: batchSize,
    });
    return participants.flatMap((participantA) =>
      participants.map((participantB) =>
        compareParticipants(participantA, participantB),
      ),
    );
  };

  const totalParticipants = await ParticipantService.count();
  const batches = Math.ceil(totalParticipants / batchSize);
  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize;
    const records = await getDuplicatesForParticipantIdBatch(startIdx);
    const results = records.filter(
      (r) => r.participantIdA !== r.participantIdB && r.weightedScore > cutoff,
    );
    if (results.length > 0) {
      await DeduplicationStore.upsert(results);
    }
  }
};

export const mergeDuplicate = async (
  participantId: string,
  duplicateParticipantId: string,
  resolvedParticipant: Participant,
): Promise<Participant> => {
  await DeduplicationStore.deletePair(participantId, duplicateParticipantId);
  await DeduplicationStore.logResolution(
    participantId,
    duplicateParticipantId,
    'merge',
  );

  const participant = await ParticipantService.update(
    participantId,
    resolvedParticipant,
  );

  if (!participant) {
    throw new Error('Participant not found');
  }

  return participant;
};

export const ignoreDuplicate = async (
  participantId: string,
  duplicateParticipantId: string,
): Promise<void> => {
  await DeduplicationStore.deletePair(participantId, duplicateParticipantId);
  await DeduplicationStore.logResolution(
    participantId,
    duplicateParticipantId,
    'ignore',
  );
};

export const listDuplicates = async (): Promise<DeduplicationRecord[]> => {
  return DeduplicationStore.list();
};

export const checkDuplicatesWithinList = async (
  participants: Participant[],
): Promise<DeduplicationRecord[]> => {
  const records: DeduplicationRecord[] = [];
  for (const participantA of participants) {
    for (const participantB of participants) {
      if (participantA.id === participantB.id) continue;
      const record = compareParticipants(participantA, participantB);
      if (record.weightedScore > cutoff) {
        records.push(record);
      }
    }
  }

  return records.sort((a, b) => b.weightedScore - a.weightedScore);
};

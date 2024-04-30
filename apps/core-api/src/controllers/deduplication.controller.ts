import { Router } from 'express';

import { DeduplicationService } from '@nrcno/core-deduplication-engine';
import {
  ParticipantSchema,
  DeduplicationIgnoreDefinitionSchema,
  DeduplicationMergeDefinitionSchema,
  PaginationSchema,
} from '@nrcno/core-models';

const router = Router();

router.post('/deduplication/check', async (req, res, next) => {
  try {
    const partialParticipant = ParticipantSchema.partial().parse(req.body);
    const duplicates =
      await DeduplicationService.getDuplicatesForParticipant(
        partialParticipant,
      );
    res.json({ duplicates }).status(200);
  } catch (error) {
    next(error);
  }
});

router.post('/deduplication/merge', async (req, res, next) => {
  try {
    const { participantIdA, participantIdB, resolvedParticipant } =
      DeduplicationMergeDefinitionSchema.parse(req.body);

    const participant = await DeduplicationService.mergeDuplicate(
      participantIdA,
      participantIdB,
      resolvedParticipant,
    );

    res.json(participant).status(200);
  } catch (error) {
    next(error);
  }
});

router.post('/deduplication/ignore', async (req, res, next) => {
  try {
    const { participantIdA, participantIdB } =
      DeduplicationIgnoreDefinitionSchema.parse(req.body);

    await DeduplicationService.ignoreDuplicate(participantIdA, participantIdB);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/deduplication', async (req, res, next) => {
  try {
    const pagination = PaginationSchema.parse(req.query);
    const duplicates = await DeduplicationService.listDuplicates(pagination);
    const denormalisedDuplicates =
      await DeduplicationService.denormaliseDuplicateRecords(duplicates);
    res.json({ duplicates: denormalisedDuplicates }).status(200);
  } catch (error) {
    next(error);
  }
});

export { router as deduplicationRouter };

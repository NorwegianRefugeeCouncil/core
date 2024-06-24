import { Router } from 'express';
import { DeduplicationService } from '@nrcno/core-deduplication-engine';

import {
  IndividualSchema,
  DeduplicationIgnoreDefinitionSchema,
  DeduplicationMergeDefinitionSchema,
  PaginationSchema,
  DenormalisedDeduplicationRecord,
  PaginatedResponse,
} from '@nrcno/core-models';

const router = Router();

router.post('/deduplication/check', async (req, res, next) => {
  try {
    const partialIndividual = IndividualSchema.partial().parse(req.body);
    const duplicates =
      await DeduplicationService.getDuplicatesForIndividual(partialIndividual);
    res.json({ duplicates }).status(200);
  } catch (error) {
    next(error);
  }
});

router.post('/deduplication/merge', async (req, res, next) => {
  try {
    const { individualIdA, individualIdB, resolvedIndividual } =
      DeduplicationMergeDefinitionSchema.parse(req.body);

    const individual = await DeduplicationService.mergeDuplicate(
      individualIdA,
      individualIdB,
      resolvedIndividual,
    );

    res.json(individual).status(200);
  } catch (error) {
    next(error);
  }
});

router.post('/deduplication/ignore', async (req, res, next) => {
  try {
    const { individualIdA, individualIdB } =
      DeduplicationIgnoreDefinitionSchema.parse(req.body);

    await DeduplicationService.ignoreDuplicate(individualIdA, individualIdB);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/deduplication', async (req, res, next) => {
  try {
    const pagination = PaginationSchema.parse(req.query);
    const duplicates = await DeduplicationService.listDuplicates(pagination);
    const [denormalisedDuplicates, totalCount] = await Promise.all([
      DeduplicationService.denormaliseDuplicateRecords(duplicates),
      DeduplicationService.countDuplicates(),
    ]);
    const response: PaginatedResponse<DenormalisedDeduplicationRecord> = {
      startIndex: pagination.startIndex,
      pageSize: pagination.pageSize,
      totalCount,
      items: denormalisedDuplicates,
    };
    res.json(response).status(200);
  } catch (error) {
    next(error);
  }
});

export { router as deduplicationRouter };

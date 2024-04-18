import { Router } from 'express';

import { PrmService } from '@nrcno/core-prm-engine';
import { EntityTypeSchema } from '@nrcno/core-models';

const router = Router();

router.post('/prm/:entityType', async (req, res, next) => {
  try {
    const entityType = EntityTypeSchema.parse(req.params.entityType);
    const prmService = PrmService[entityType];

    if (!prmService) {
      res.sendStatus(404);
      return;
    }

    const entityDefinition = req.body; // TODO: Validate entity definition
    const createdEntity = await prmService.create(entityDefinition);

    res.status(201).json(createdEntity);
  } catch (error) {
    next(error);
  }
});

export { router as prmRouter };

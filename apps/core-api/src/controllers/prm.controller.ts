import { Router, Request, Response, NextFunction } from 'express';

import { PrmService } from '@nrcno/core-prm-engine';
import { EntityTypeSchema } from '@nrcno/core-models';

const createEntity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // TODO: Error handling of failed validation
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
};

const router = Router();
router.post('/prm/:entityType', createEntity);

export { router as prmRouter };

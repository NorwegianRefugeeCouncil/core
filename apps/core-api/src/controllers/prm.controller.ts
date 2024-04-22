import { Router, Request, Response, NextFunction } from 'express';

import { PrmService } from '@nrcno/core-prm-engine';
import { EntityTypeSchema } from '@nrcno/core-models';

// This is exported for testing purposes (not great)
export const createEntity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const entityType = EntityTypeSchema.parse(req.params.entityType);

    const prmService = PrmService[entityType];

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

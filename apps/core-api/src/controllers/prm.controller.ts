import { Router, Request, Response, NextFunction } from 'express';

import { PrmService } from '@nrcno/core-prm-engine';
import {
  EntityTypeSchema,
  EntityIdSchema,
  getEntityDefinitionSchema,
  getEntityUpdateSchema,
} from '@nrcno/core-models';
import { NotFoundError } from '@nrcno/core-errors';

// This is exported for testing purposes (not great)
export const createEntity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const entityType = EntityTypeSchema.safeParse(req.params.entityType);

    if (entityType.success === false) {
      res.sendStatus(404);
      return;
    }

    const prmService = PrmService[entityType.data];

    const schema = getEntityDefinitionSchema(entityType.data);
    const entityDefinition = schema.safeParse(req.body);
    if (entityDefinition.success === false) {
      res.status(400).json(entityDefinition.error);
      return;
    }
    const createdEntity = await prmService.create(entityDefinition.data);

    res.status(201).json(createdEntity);
  } catch (error) {
    next(error);
  }
};

export const getEntity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const entityType = EntityTypeSchema.safeParse(req.params.entityType);
    const entityId = EntityIdSchema.safeParse(req.params.entityId);

    if (entityType.success === false || entityId.success === false) {
      res.sendStatus(404);
      return;
    }

    const prmService = PrmService[entityType.data];

    const entity = await prmService.get(entityId.data);

    if (!entity) {
      res.sendStatus(404);
    } else {
      res.status(200).json(entity);
    }
  } catch (error) {
    next(error);
  }
};

export const updateEntity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const entityType = EntityTypeSchema.safeParse(req.params.entityType);
    const entityId = EntityIdSchema.safeParse(req.params.entityId);

    if (entityType.success === false || entityId.success === false) {
      res.sendStatus(404);
      return;
    }

    const prmService = PrmService[entityType.data];

    const schema = getEntityUpdateSchema(entityType.data);
    const entityUpdate = schema.safeParse(req.body);
    if (entityUpdate.success === false) {
      res.status(400).json(entityUpdate.error);
      return;
    }

    const updatedEntity = await prmService.update(
      entityId.data,
      entityUpdate.data,
    );

    res.status(200).json(updatedEntity);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.sendStatus(404);
      return;
    }
    next(error);
  }
};

const router = Router();
router.post('/prm/:entityType', createEntity);
router.get('/prm/:entityType/:entityId', getEntity);
router.put('/prm/:entityType/:entityId', updateEntity);

export { router as prmRouter };

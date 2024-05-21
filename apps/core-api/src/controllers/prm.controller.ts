import { Router, Request, Response, NextFunction } from 'express';

import { PrmService } from '@nrcno/core-prm-engine';
import {
  EntityTypeSchema,
  EntityIdSchema,
  getEntityDefinitionSchema,
  getEntityUpdateSchema,
  PaginatedResponse,
  EntityListItem,
  PaginationSchema,
  createSortingSchema,
  getEntityListItemSchema,
  getEntityListSortingFields,
} from '@nrcno/core-models';

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
    const entityDefinition = schema.parse(req.body);

    const createdEntity = await prmService.create(entityDefinition);

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
    const entityUpdate = schema.parse(req.body);

    const updatedEntity = await prmService.update(entityId.data, entityUpdate);

    res.status(200).json(updatedEntity);
  } catch (error) {
    next(error);
  }
};

export const listEntities = async (
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
    const pagination = PaginationSchema.parse(req.query);

    const possibleSortingFields = getEntityListSortingFields(entityType.data);
    const sortingSchema = createSortingSchema(possibleSortingFields);
    const sorting = sortingSchema.parse(req.query);

    const prmService = PrmService[entityType.data];

    const entities = await prmService.list(pagination, sorting);
    const totalCount = await prmService.count();

    const response: PaginatedResponse<EntityListItem> = {
      startIndex: pagination.startIndex,
      pageSize: pagination.pageSize,
      totalCount,
      items: entities,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const router = Router();
router.post('/prm/:entityType', createEntity);
router.get('/prm/:entityType', listEntities);
router.get('/prm/:entityType/:entityId', getEntity);
router.put('/prm/:entityType/:entityId', updateEntity);

export { router as prmRouter };

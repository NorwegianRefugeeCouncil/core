import { Router, Request, Response, NextFunction } from 'express';

import {
  getPrmService,
  hasCreateMixin,
  hasGetMixin,
  hasListMixin,
  hasUpdateMixin,
} from '@nrcno/core-prm-engine';
import {
  EntityTypeSchema,
  EntityIdSchema,
  getEntityDefinitionSchema,
  getEntityUpdateSchema,
  PaginatedResponse,
  EntityListItem,
  PaginationSchema,
  createSortingSchema,
  getEntityFilteringSchema,
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

    const prmService = getPrmService(entityType.data);

    if (!hasCreateMixin(prmService)) {
      res.sendStatus(404);
      return;
    }

    const createdEntity = await prmService.validateAndCreate(req.body);

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

    const prmService = getPrmService(entityType.data);

    if (!hasGetMixin(prmService)) {
      res.sendStatus(404);
      return;
    }

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

    const prmService = getPrmService(entityType.data);

    if (!hasUpdateMixin(prmService)) {
      res.sendStatus(404);
      return;
    }

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

    const sortingSchema = createSortingSchema(entityType.data);
    const sorting = sortingSchema.parse(req.query);

    const filteringSchema = getEntityFilteringSchema(entityType.data);
    const filtering = filteringSchema.parse(req.query);

    const prmService = getPrmService(entityType.data);

    if (!hasListMixin(prmService)) {
      res.sendStatus(404);
      return;
    }

    const entities = await prmService.list(pagination, sorting, filtering);
    const totalCount = await prmService.count(filtering);

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

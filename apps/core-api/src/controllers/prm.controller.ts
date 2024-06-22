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
  Permissions,
  EntityType,
} from '@nrcno/core-models';

import { checkPermissions } from '../middleware/authorisation.middleware';

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

const checkPermissionsForEntityType =
  (action: 'read' | 'write' | 'delete') =>
  (request: Request, response: Response, next: NextFunction) => {
    const entityType = EntityTypeSchema.parse(request.params.entityType);

    const permission = (() => {
      switch (entityType) {
        case EntityType.Individual: {
          switch (action) {
            case 'read':
              return Permissions.ViewProgrammeData;
            case 'write':
              return Permissions.EditProgrammeData;
            case 'delete':
              return Permissions.DeleteProgrammeData;
            default:
              throw new Error('Invalid action');
          }
        }
        case EntityType.Language:
        case EntityType.Nationality: {
          switch (action) {
            case 'read':
              return Permissions.ViewSystemData;
            case 'write':
              return Permissions.EditSystemData;
            case 'delete':
              return Permissions.DeleteSystemData;
            default:
              throw new Error('Invalid action');
          }
        }
      }
    })();

    return checkPermissions(permission)(request, response, next);
  };

const router = Router();
router.post(
  '/prm/:entityType',
  checkPermissionsForEntityType('write'),
  createEntity,
);
router.get(
  '/prm/:entityType',
  checkPermissionsForEntityType('read'),
  listEntities,
);
router.get(
  '/prm/:entityType/:entityId',
  checkPermissionsForEntityType('read'),
  getEntity,
);
router.put(
  '/prm/:entityType/:entityId',
  checkPermissionsForEntityType('write'),
  updateEntity,
);

export { router as prmRouter };

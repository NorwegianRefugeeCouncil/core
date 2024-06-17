import { Router, Request, Response, NextFunction } from 'express';
import { PositionService } from '@nrcno/core-user-engine';

import {
  PaginatedResponse,
  PositionListItem,
  PaginationSchema,
  PositionDefinitionSchema,
  PositionPartialUpdateSchema,
  PositionIdSchema,
} from '@nrcno/core-models';

// This is exported for testing purposes (not great)
export const createPosition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const positionDefinition = PositionDefinitionSchema.parse(req.body);

    const createdPosition = await PositionService.create(positionDefinition);

    res.status(201).json(createdPosition);
  } catch (error) {
    next(error);
  }
};

export const getPosition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const positionId = PositionIdSchema.safeParse(req.params.positionId);

    if (positionId.success === false) {
      res.sendStatus(404);
      return;
    }

    const position = await PositionService.get(positionId.data);

    if (!position) {
      res.sendStatus(404);
    } else {
      res.status(200).json(position);
    }
  } catch (error) {
    next(error);
  }
};

export const updatePosition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const positionId = PositionIdSchema.safeParse(req.params.positionId);

    if (positionId.success === false) {
      res.sendStatus(404);
      return;
    }

    const positionUpdate = PositionPartialUpdateSchema.parse(req.body);

    const updatedPosition = await PositionService.update(
      positionId.data,
      positionUpdate,
    );

    res.status(200).json(updatedPosition);
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
    const pagination = PaginationSchema.parse(req.query);

    const [positions, totalCount] = await Promise.all([
      PositionService.list(pagination),
      PositionService.count(),
    ]);

    const response: PaginatedResponse<PositionListItem> = {
      startIndex: pagination.startIndex,
      pageSize: pagination.pageSize,
      totalCount,
      items: positions,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const deletePosition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const positionId = PositionIdSchema.safeParse(req.params.positionId);

    if (positionId.success === false) {
      res.sendStatus(404);
      return;
    }

    await PositionService.del(positionId.data);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const router = Router();
router.post('/position', createPosition);
router.get('/position', listEntities);
router.get('/position/:positionId', getPosition);
router.put('/position/:positionId', updatePosition);
router.delete('/position/:positionId', deletePosition);

export { router as prmRouter };

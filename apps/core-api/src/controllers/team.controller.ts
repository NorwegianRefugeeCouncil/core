import { Router, Request, Response, NextFunction } from 'express';
import { TeamService } from '@nrcno/core-user-engine';

import {
  PaginatedResponse,
  TeamListItem,
  PaginationSchema,
  TeamDefinitionSchema,
  TeamUpdateSchema,
  TeamIdSchema,
} from '@nrcno/core-models';

// This is exported for testing purposes (not great)
export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teamDefinition = TeamDefinitionSchema.parse(req.body);

    const createdTeam = await TeamService.create(teamDefinition);

    res.status(201).json(createdTeam);
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teamId = TeamIdSchema.safeParse(req.params.teamId);

    if (teamId.success === false) {
      res.sendStatus(404);
      return;
    }

    const team = await TeamService.get(teamId.data);

    if (!team) {
      res.sendStatus(404);
    } else {
      res.status(200).json(team);
    }
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teamId = TeamIdSchema.safeParse(req.params.teamId);

    if (teamId.success === false) {
      res.sendStatus(404);
      return;
    }

    const teamUpdate = TeamUpdateSchema.parse(req.body);

    const updatedTeam = await TeamService.update(teamId.data, teamUpdate);

    res.status(200).json(updatedTeam);
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

    const [teams, totalCount] = await Promise.all([
      TeamService.list(pagination),
      TeamService.count(),
    ]);

    const response: PaginatedResponse<TeamListItem> = {
      startIndex: pagination.startIndex,
      pageSize: pagination.pageSize,
      totalCount,
      items: teams,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = TeamIdSchema.safeParse(req.params.teamId);

    if (teamId.success === false) {
      res.sendStatus(404);
      return;
    }

    await TeamService.del(teamId.data);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const router = Router();
router.post('/teams', createTeam);
router.get('/teams', listEntities);
router.get('/teams/:teamId', getTeam);
router.put('/teams/:teamId', updateTeam);
router.delete('/teams/:teamId', deleteTeam);

export { router as teamRouter };

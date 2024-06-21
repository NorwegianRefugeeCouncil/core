import {
  Pagination,
  Roles,
  Team,
  TeamDefinition,
  TeamListItem,
  TeamSchema,
  TeamUpdate,
} from '@nrcno/core-models';
import { getTrx } from '@nrcno/core-db';
import { getAuthorisationClient } from '@nrcno/core-authorisation';

import { TeamStore } from '../stores/team.store';

import { PositionService } from './position.service';

export interface ITeamService {
  create: (team: TeamDefinition) => Promise<Team>;
  get: (teamId: string) => Promise<Team | null>;
  list: (pagination: Pagination) => Promise<TeamListItem[]>;
  update: (teamId: string, teamUpdate: TeamUpdate) => Promise<Team>;
  del: (teamId: string) => Promise<void>;
  count: () => Promise<number>;
}

const create: ITeamService['create'] = async (team) => {
  const trx = await getTrx();

  const authorisationClient = getAuthorisationClient();

  try {
    const createdTeam = await TeamStore.create(team, trx);
    const positions =
      team.positions.length > 0
        ? await PositionService.listByIds(team.positions)
        : [];
    const validatedCreatedTeam = TeamSchema.parse({
      ...createdTeam,
      positions,
    });

    await authorisationClient.team.create(validatedCreatedTeam);

    await trx.commit();
    return validatedCreatedTeam;
  } catch (error) {
    await trx.rollback();
    // TODO: Rollback authorisation tuples
    throw error;
  }
};

const get: ITeamService['get'] = async (teamId) => {
  const team = await TeamStore.get(teamId);
  if (!team) {
    return null;
  }
  const positions =
    team.positions.length > 0
      ? await PositionService.listByIds(team.positions)
      : [];
  return TeamSchema.parse({
    ...team,
    positions,
  });
};

const list: ITeamService['list'] = async (pagination) => {
  return TeamStore.list(pagination);
};

const update: ITeamService['update'] = async (teamId, teamUpdate) => {
  const trx = await getTrx();

  const authorisationClient = getAuthorisationClient();

  try {
    const existingTeam = await TeamStore.get(teamId);
    if (!existingTeam) {
      throw new Error(`Team with id ${teamId} not found`);
    }
    const partialTeamUpdate = {
      ...teamUpdate,
      positions: {
        add: teamUpdate.positions.filter((id) =>
          existingTeam.positions.every((pId) => pId !== id),
        ),
        remove: existingTeam.positions.filter((id) =>
          teamUpdate.positions.every((pId) => pId !== id),
        ),
      },
      roles: {
        add: Object.values(Roles).filter(
          (role) =>
            teamUpdate.roles?.[role] &&
            teamUpdate.roles[role] !== existingTeam.roles[role],
        ),
        remove: Object.values(Roles).filter(
          (role) =>
            !teamUpdate.roles?.[role] && existingTeam.roles[role] === true,
        ),
      },
    };

    await TeamStore.update(teamId, partialTeamUpdate, trx);

    await authorisationClient.team.update(teamId, partialTeamUpdate);

    const team = await get(teamId);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    await trx.commit();

    return team;
  } catch (error) {
    await trx.rollback();
    // TODO: Rollback authorisation tuples
    throw error;
  }
};

const del: ITeamService['del'] = async (teamId) => {
  const trx = await getTrx();

  const authorisationClient = getAuthorisationClient();

  try {
    await TeamStore.del(teamId, trx);
    await authorisationClient.team.delete(teamId);
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    // TODO: Rollback authorisation tuples
    throw error;
  }
};

const count: ITeamService['count'] = async () => {
  return TeamStore.count();
};

export const TeamService: ITeamService = {
  create,
  get,
  list,
  update,
  del,
  count,
};

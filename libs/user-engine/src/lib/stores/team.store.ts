import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { getDb } from '@nrcno/core-db';
import {
  Pagination,
  Team,
  TeamDefinition,
  TeamListItem,
  TeamPartialUpdate,
  TeamSchema,
} from '@nrcno/core-models';

type TeamWithPositionIds = Omit<Team, 'positions'> & { positions: string[] };

export interface ITeamStore {
  create: (team: TeamDefinition) => Promise<TeamWithPositionIds>;
  get: (teamId: string) => Promise<TeamWithPositionIds | null>;
  list: (pagination: Pagination) => Promise<TeamListItem[]>;
  update: (teamId: string, partialTeam: TeamPartialUpdate) => Promise<void>;
  del: (teamId: string) => Promise<void>;
  count: () => Promise<number>;
}

const create: ITeamStore['create'] = async (team) => {
  const db = getDb();

  const result = await db('teams')
    .insert({
      ...team,
      id: uuid(),
    })
    .returning('*');

  const teamId = result[0].id;

  if (team.positions.length > 0) {
    await db('team_position_assignments').insert(
      team.positions.map((positionId) => ({
        teamId,
        positionId,
      })),
    );
  }

  return {
    ...result[0],
    positions: team.positions,
  };
};

const get: ITeamStore['get'] = async (teamId) => {
  const db = getDb();

  const [team, positionIds] = await Promise.all([
    db('teams').where('id', teamId).first(),
    db('team_position_assignments')
      .where('teamId', teamId)
      .select('positionId'),
  ]);

  if (!team) {
    return null;
  }

  return {
    ...team,
    positions: positionIds.map((row) => row.positionId),
  };
};

const list: ITeamStore['list'] = async (pagination) => {
  const db = getDb();

  const result = await db('teams')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex);

  return z.array(TeamSchema).parse(result);
};

const update: ITeamStore['update'] = async (teamId, partialTeamUpdate) => {
  const db = getDb();

  const {
    positions: { add = [], remove = [] },
    ...teamUpdate
  } = partialTeamUpdate;

  await db('teams').where('id', teamId).update(teamUpdate);

  if (add.length > 0) {
    await db('team_position_assignments').insert(
      add.map((positionId) => ({
        teamId,
        positionId,
      })),
    );
  }

  if (remove.length > 0) {
    await db('team_position_assignments')
      .where('teamId', teamId)
      .whereIn('positionId', remove)
      .del();
  }
};

const del: ITeamStore['del'] = async (teamId) => {
  const db = getDb();

  await db('teams').where('id', teamId).del();
};

const count: ITeamStore['count'] = async () => {
  const db = getDb();

  const [{ count }] = await db('teams').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const TeamStore: ITeamStore = {
  create,
  get,
  list,
  update,
  del,
  count,
};

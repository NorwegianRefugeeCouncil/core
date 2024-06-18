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

export interface ITeamStore {
  create: (team: TeamDefinition) => Promise<Team>;
  get: (teamId: string) => Promise<Team | null>;
  list: (pagination: Pagination) => Promise<TeamListItem[]>;
  update: (teamId: string, partialTeam: TeamPartialUpdate) => Promise<Team>;
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

  return TeamSchema.parse(result[0]);
};

const get: ITeamStore['get'] = async (teamId) => {
  const db = getDb();

  const result = await db('teams').where('id', teamId).first();

  if (!result) {
    return null;
  }

  return TeamSchema.parse(result);
};

const list: ITeamStore['list'] = async (pagination) => {
  const db = getDb();

  const result = await db('teams')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex);

  return z.array(TeamSchema).parse(result);
};

const update: ITeamStore['update'] = async (teamId, partialTeam) => {
  const db = getDb();

  const result = await db('teams')
    .where('id', teamId)
    .update(partialTeam)
    .returning('*');

  return TeamSchema.parse(result[0]);
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

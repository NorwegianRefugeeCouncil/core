import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { Knex } from 'knex';

import { getDb } from '@nrcno/core-db';
import {
  Pagination,
  Roles,
  Team,
  TeamDefinition,
  TeamListItem,
  TeamListItemSchema,
  TeamPartialUpdate,
} from '@nrcno/core-models';

type TeamWithPositionIds = Omit<Team, 'positions'> & { positions: string[] };

export interface ITeamStore {
  create: (
    team: TeamDefinition,
    trx: Knex.Transaction,
  ) => Promise<TeamWithPositionIds>;
  get: (teamId: string) => Promise<TeamWithPositionIds | null>;
  list: (pagination: Pagination) => Promise<TeamListItem[]>;
  update: (
    teamId: string,
    partialTeam: TeamPartialUpdate,
    trx: Knex.Transaction,
  ) => Promise<void>;
  del: (teamId: string, trx: Knex.Transaction) => Promise<void>;
  count: () => Promise<number>;
}

const create: ITeamStore['create'] = async (team, trx) => {
  const { positions, roles, ...teamDetails } = team;

  const result = await trx('teams')
    .insert({
      ...teamDetails,
      id: uuid(),
    })
    .returning('*');

  const teamId = result[0].id;

  if (positions.length > 0) {
    await trx('team_position_assignments').insert(
      positions.map((positionId) => ({
        teamId,
        positionId,
      })),
    );
  }

  if (Object.values(roles).some((enabled) => enabled)) {
    await trx('team_roles').insert(
      Object.entries(roles)
        .filter(([, enabled]) => enabled)
        .map(([role]) => ({
          teamId,
          role,
        })),
    );
  }

  return {
    ...result[0],
    positions: team.positions,
    roles,
  };
};

const get: ITeamStore['get'] = async (teamId) => {
  const db = getDb();

  const [team, positionIds, roles] = await Promise.all([
    db('teams').where('id', teamId).first(),
    db('team_position_assignments')
      .where('teamId', teamId)
      .select('positionId'),
    db('team_roles').where('teamId', teamId).select('role'),
  ]);

  if (!team) {
    return null;
  }

  return {
    ...team,
    positions: positionIds.map((row) => row.positionId),
    roles: roles.reduce(
      (acc, { role }) => ({
        ...acc,
        [role]: true,
      }),
      {} as Record<Roles, boolean>,
    ),
  };
};

const list: ITeamStore['list'] = async (pagination) => {
  const db = getDb();

  const result = await db('teams')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex);

  return z.array(TeamListItemSchema).parse(result);
};

const update: ITeamStore['update'] = async (teamId, partialTeamUpdate, trx) => {
  const {
    roles: { add: addRoles = [], remove: removeRoles = [] },
    positions: { add = [], remove = [] },
    ...teamUpdate
  } = partialTeamUpdate;

  await trx('teams').where('id', teamId).update(teamUpdate);

  if (add.length > 0) {
    await trx('team_position_assignments').insert(
      add.map((positionId) => ({
        teamId,
        positionId,
      })),
    );
  }

  if (remove.length > 0) {
    await trx('team_position_assignments')
      .where('teamId', teamId)
      .whereIn('positionId', remove)
      .del();
  }

  if (addRoles.length > 0) {
    await trx('team_roles').insert(
      addRoles.map((role) => ({
        teamId,
        role,
      })),
    );
  }

  if (removeRoles.length > 0) {
    await trx('team_roles')
      .where('teamId', teamId)
      .whereIn('role', removeRoles)
      .del();
  }
};

const del: ITeamStore['del'] = async (teamId, trx) => {
  await trx('teams').where('id', teamId).del();
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

import {
  Pagination,
  Team,
  TeamDefinition,
  TeamListItem,
  TeamPartialUpdate,
} from '@nrcno/core-models';

import { TeamStore } from '../stores/team.store';

export interface ITeamService {
  create: (team: TeamDefinition) => Promise<Team>;
  get: (teamId: string) => Promise<Team | null>;
  list: (pagination: Pagination) => Promise<TeamListItem[]>;
  update: (teamId: string, partialTeam: TeamPartialUpdate) => Promise<Team>;
  del: (teamId: string) => Promise<void>;
  count: () => Promise<number>;
}

const create: ITeamService['create'] = async (team) => {
  return TeamStore.create(team);
};

const get: ITeamService['get'] = async (teamId) => {
  return TeamStore.get(teamId);
};

const list: ITeamService['list'] = async (pagination) => {
  return TeamStore.list(pagination);
};

const update: ITeamService['update'] = async (teamId, partialTeam) => {
  return TeamStore.update(teamId, partialTeam);
};

const del: ITeamService['del'] = async (teamId) => {
  return TeamStore.del(teamId);
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

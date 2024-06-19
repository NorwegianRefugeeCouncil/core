import { AxiosInstance } from 'axios';

import {
  createPaginatedResponseSchema,
  PaginatedResponse,
  Pagination,
  Team,
  TeamDefinition,
  TeamUpdate,
  TeamSchema,
  TeamListItem,
  TeamListItemSchema,
} from '@nrcno/core-models';

import { BaseClient } from '../base.client';

const paginatedTeamListItemSchema =
  createPaginatedResponseSchema(TeamListItemSchema);

export class TeamClient extends BaseClient {
  constructor(instance: AxiosInstance) {
    super(instance);
  }

  async create(data: TeamDefinition): Promise<Team> {
    const res = await super.post('/teams', data);
    return TeamSchema.parse(res.data);
  }

  async list(pagination: Pagination): Promise<PaginatedResponse<TeamListItem>> {
    const res = await super.get('/teams', { params: pagination });
    return paginatedTeamListItemSchema.parse(res.data);
  }

  async read(id: string): Promise<Team> {
    const res = await super.get(`/teams/${id}`);
    return TeamSchema.parse(res.data);
  }

  async update(id: string, data: TeamUpdate): Promise<Team> {
    const res = await super.put(`/teams/${id}`, data);
    return TeamSchema.parse(res.data);
  }

  async del(id: string): Promise<void> {
    await super.delete(`/teams/${id}`);
  }
}

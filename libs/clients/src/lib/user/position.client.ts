import { AxiosInstance } from 'axios';

import {
  createPaginatedResponseSchema,
  PaginatedResponse,
  Pagination,
  Position,
  PositionDefinition,
  PositionUpdate,
  PositionSchema,
  PositionListItemSchema,
  PositionListItem,
} from '@nrcno/core-models';

import { BaseClient } from '../base.client';

const paginatedPositionListItemSchema = createPaginatedResponseSchema(
  PositionListItemSchema,
);

export class PositionClient extends BaseClient {
  constructor(instance: AxiosInstance) {
    super(instance);
  }

  async getMe(): Promise<Position> {
    const res = await super.get('/positions/me');
    return PositionSchema.parse(res.data);
  }

  async create(data: PositionDefinition): Promise<Position> {
    const res = await super.post('/positions', data);
    return PositionSchema.parse(res.data);
  }

  async list(
    pagination: Pagination,
  ): Promise<PaginatedResponse<PositionListItem>> {
    const res = await super.get('/positions', { params: pagination });
    return paginatedPositionListItemSchema.parse(res.data);
  }

  async read(id: string): Promise<Position> {
    const res = await super.get(`/positions/${id}`);
    return PositionSchema.parse(res.data);
  }

  async update(id: string, data: PositionUpdate): Promise<Position> {
    const res = await super.put(`/positions/${id}`, data);
    return PositionSchema.parse(res.data);
  }

  async del(id: string): Promise<void> {
    await super.delete(`/positions/${id}`);
  }
}

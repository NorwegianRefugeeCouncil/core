import { AxiosInstance } from 'axios';

import {
  createPaginatedResponseSchema,
  PaginatedResponse,
  Pagination,
  Position,
  PositionDefinition,
  PositionPartialUpdate,
  PositionSchema,
} from '@nrcno/core-models';

import { BaseClient } from '../base.client';

const paginatedPositionSchema = createPaginatedResponseSchema(PositionSchema);

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

  async list(pagination: Pagination): Promise<PaginatedResponse<Position>> {
    const res = await super.get('/positions', { params: pagination });
    return paginatedPositionSchema.parse(res.data);
  }

  async read(id: string): Promise<Position> {
    const res = await super.get(`/positions/${id}`);
    return PositionSchema.parse(res.data);
  }

  async update(id: string, data: PositionPartialUpdate): Promise<Position> {
    const res = await super.put(`/positions/${id}`, data);
    return PositionSchema.parse(res.data);
  }

  async del(id: string): Promise<void> {
    await super.delete(`/positions/${id}`);
  }
}

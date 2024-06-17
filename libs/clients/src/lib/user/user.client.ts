import { AxiosInstance } from 'axios';

import {
  createPaginatedResponseSchema,
  PaginatedResponse,
  Pagination,
  User,
  UserSchema,
} from '@nrcno/core-models';

import { BaseClient } from '../base.client';

const paginatedUserSchema = createPaginatedResponseSchema(UserSchema);

export class UserClient extends BaseClient {
  constructor(instance: AxiosInstance) {
    super(instance);
  }

  async getMe(): Promise<User> {
    const res = await super.get('/users/me');
    return UserSchema.parse(res.data);
  }

  async list(pagination: Pagination): Promise<PaginatedResponse<User>> {
    const res = await super.get('/users', { params: pagination });
    return paginatedUserSchema.parse(res.data);
  }

  async read(id: string): Promise<User> {
    const res = await super.get(`/users/${id}`);
    return UserSchema.parse(res.data);
  }
}

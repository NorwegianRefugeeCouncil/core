import { AxiosInstance } from 'axios';

import { User, UserSchema } from '@nrcno/core-models';

import { BaseClient } from './base.client';

export class UserClient extends BaseClient {
  constructor(instance: AxiosInstance) {
    super(instance);
  }

  async getMe(): Promise<User> {
    const res = await super.get('/users/me');
    return UserSchema.parse(res.data);
  }
}

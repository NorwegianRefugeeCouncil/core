import { AxiosInstance } from 'axios';

import { User, UserSchema } from '@nrcno/core-models';

import { BaseClient, ClientConfig } from './base.client';

export class UserClient extends BaseClient {
  constructor(instance?: AxiosInstance, config?: ClientConfig) {
    super(instance, config);
  }

  async getMe(): Promise<User> {
    const res = await super.get('/users/me');
    return UserSchema.parse(res.data);
  }
}

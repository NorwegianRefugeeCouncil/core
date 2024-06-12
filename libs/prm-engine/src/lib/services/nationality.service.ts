import { EntityType, Nationality, NationalityFilter } from '@nrcno/core-models';

import { NationalityStore } from '../stores/nationality.store';

import { ListMixin } from './base.service';

export class NationalityService extends ListMixin<
  Nationality,
  NationalityFilter
>()(
  class {
    public entityType = EntityType.Nationality;
    public store = NationalityStore;
  },
) {
  async validateIsoCode(value: string) {
    const nationality = await this.store.get(value);
    if (!nationality || !nationality.enabled) {
      throw new Error(`Invalid nationality: ${value}`);
    }
  }
}

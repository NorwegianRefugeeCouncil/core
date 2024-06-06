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
    const enabledCountries = await this.list(
      { startIndex: 0, pageSize: 300 },
      undefined,
      { enabled: true },
    );
    const possibleValues = enabledCountries.map((country) => country.id);
    if (!possibleValues.includes(value)) {
      throw new Error(`Invalid nationality: ${value}`);
    }
  }
}

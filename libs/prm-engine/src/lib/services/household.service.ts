import { z } from 'zod';

import {
  EntityType,
  Household,
  HouseholdDefinition,
  HouseholdDefinitionSchema,
  HouseholdFiltering,
  HouseholdListItem,
} from '@nrcno/core-models';

import { HouseholdStore } from '../stores/household.store';

import { CRUDMixin } from './base.service';

export class HouseholdService extends CRUDMixin<
  HouseholdDefinition,
  Household,
  any,
  any,
  HouseholdListItem,
  HouseholdFiltering
>(HouseholdDefinitionSchema as z.ZodType<HouseholdDefinition>)(
  class {
    public entityType = EntityType.Household;
    public store = HouseholdStore;
  },
) {
  override mapUpdateToPartial(id: string, update: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

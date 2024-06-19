import {
  EntityType,
  Household,
  HouseholdDefinition,
  HouseholdDefinitionSchema,
} from '@nrcno/core-models';

import { HouseholdStore } from '../stores/household.store';

import { CRUDMixin } from './base.service';

export class HouseholdService extends CRUDMixin<
  HouseholdDefinition,
  Household,
  any,
  any,
  any,
  any
>()(
  class {
    public entityType = EntityType.Household;
    public store = HouseholdStore;
    public definitionSchema = HouseholdDefinitionSchema;
  },
) {
  override mapUpdateToPartial(id: string, update: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  override async create(household: HouseholdDefinition) {
    return super.create(household);
  }
}

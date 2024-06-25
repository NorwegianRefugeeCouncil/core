import { z } from 'zod';

import {
  EntityType,
  Household,
  HouseholdDefinition,
  HouseholdDefinitionSchema,
  HouseholdPartialUpdate,
  HouseholdUpdate,
  HouseholdUpdateSchema,
} from '@nrcno/core-models';
import { NotFoundError } from '@nrcno/core-errors';

import { HouseholdStore } from '../stores/household.store';

import { CRUDMixin } from './base.service';

export class HouseholdService extends CRUDMixin<
  HouseholdDefinition,
  Household,
  HouseholdUpdate,
  HouseholdPartialUpdate,
  any,
  any
>(
  HouseholdDefinitionSchema as z.ZodType<HouseholdDefinition>,
  HouseholdUpdateSchema as z.ZodType<HouseholdUpdate>,
)(
  class {
    public entityType = EntityType.Household;
    public store = HouseholdStore;
  },
) {
  async mapUpdateToPartial(
    id: string,
    update: HouseholdUpdate,
  ): Promise<HouseholdPartialUpdate> {
    return {
      headType: update.headType,
      sizeOverride: update.sizeOverride,
    };
  }

  override async update(id: string, household: HouseholdUpdate) {
    const existingHousehold = await this.store.get(id);
    if (!existingHousehold) {
      throw new NotFoundError(`Household with id ${id} not found`);
    }

    const { individuals } = household;
    const individualsToCreate = individuals.filter(
      (individual) => !individual.id,
    );
    // TODO: Create individuals passing the household id

    const individualsToUpdate = individuals.filter(
      (individual) => !!individual.id,
    );
    // TODO: define strategy for updating individuals

    const householdDetailsUpdate = this.mapUpdateToPartial(id, household);
    return this.store.update(id, householdDetailsUpdate);
  }
}

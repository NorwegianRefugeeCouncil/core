import { Household, HouseholdDefinition, EntityType } from '@nrcno/core-models';

import { BasePrmClient, CRUDMixin } from './prm-base.client';

export class HouseholdClient extends CRUDMixin<
  Household,
  HouseholdDefinition,
  any
>()(BasePrmClient(EntityType.Household)) {}

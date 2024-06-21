import * as z from 'zod';

import {
  Household,
  HouseholdDefinition,
  EntityType,
  HouseholdDefinitionSchema,
} from '@nrcno/core-models';

import { BasePrmClient, CRUDMixin } from './prm-base.client';

export class HouseholdClient extends CRUDMixin<
  Household,
  HouseholdDefinition,
  any
>(HouseholdDefinitionSchema as z.ZodType<HouseholdDefinition>)(
  BasePrmClient(EntityType.Household),
) {}

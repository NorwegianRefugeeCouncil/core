import { z } from 'zod';

import {
  IndividualListItem,
  Individual,
  IndividualDefinition,
  EntityType,
  IndividualDefinitionSchema,
} from '@nrcno/core-models';

import { BasePrmClient, CRUDMixin } from './prm-base.client';

export class IndividualClient extends CRUDMixin<
  Individual,
  IndividualDefinition,
  IndividualListItem
>(IndividualDefinitionSchema as z.ZodType<IndividualDefinition>)(
  BasePrmClient(EntityType.Individual),
) {}

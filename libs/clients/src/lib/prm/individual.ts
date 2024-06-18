import {
  IndividualListItem,
  Individual,
  IndividualDefinition,
  EntityType,
} from '@nrcno/core-models';

import { BasePrmClient, CRUDMixin } from './prm-base.client';

export class IndividualClient extends CRUDMixin<
  Individual,
  IndividualDefinition,
  IndividualListItem
>()(BasePrmClient(EntityType.Individual)) {}

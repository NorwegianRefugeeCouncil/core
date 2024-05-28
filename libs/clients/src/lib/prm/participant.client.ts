import {
  ParticipantListItem,
  Participant,
  ParticipantDefinition,
  EntityType,
} from '@nrcno/core-models';

import { BasePrmClient, CRUDMixin } from './prm-base.client';

export class ParticipantClient extends CRUDMixin<
  Participant,
  ParticipantDefinition,
  ParticipantListItem
>()(BasePrmClient(EntityType.Participant)) {}

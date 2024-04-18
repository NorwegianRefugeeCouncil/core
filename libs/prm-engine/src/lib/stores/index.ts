import { EntityType } from '@nrcno/core-models';

import { ParticipantStore } from './participant.store';

export const PrmStore = {
  [EntityType.Participant]: ParticipantStore,
};

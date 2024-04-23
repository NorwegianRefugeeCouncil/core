import {
  EntityType,
  Participant,
  ParticipantDefinition,
} from '@nrcno/core-models';

import { PrmService, getPrmService } from './base.service';

const prmService = getPrmService(EntityType.Participant);

export const ParticipantService: PrmService<
  ParticipantDefinition,
  Participant
> = {
  // This isn't really needed, but it's here to show how you can add custom logic
  create: async (participant: ParticipantDefinition) => {
    // Add custom logic here
    return prmService.create(participant);
  },

  get: async (id: string) => {
    return prmService.get(id);
  },
};

import {
  EntityType,
  Participant,
  ParticipantDefinition,
} from '@nrcno/core-models';

import { PrmService, getPrmService } from './base.service';

export const ParticipantService: PrmService<
  ParticipantDefinition,
  Participant
> = (() => {
  const prmService = getPrmService(EntityType.Participant);

  // This isn't really needed, but it's here to show how you can add custom logic
  const create = async (participant: ParticipantDefinition) => {
    // Add custom logic here
    return prmService.create(participant);
  };

  return {
    create,
  };
})();

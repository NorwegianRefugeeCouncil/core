import { Participant, ParticipantDefinition } from '../models';

import { BasePrmService } from './base.service';

export class ParticipantService extends BasePrmService<
  Participant,
  ParticipantDefinition
> {
  constructor() {
    super('participant');
  }

  override create(
    participantDefinition: ParticipantDefinition,
  ): Promise<Participant> {
    throw new Error('Not implemented');
  }
}

import { Participant, ParticipantDefinition } from '@nrcno/core-models';

import { BasePrmStore } from './base.store';

export class ParticipantStore extends BasePrmStore<
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
import {
  ContactDetails,
  ContactDetailsDefinition,
  Identification,
  Pagination,
  Participant,
  ParticipantDefinition,
  ParticipantListItem,
  ParticipantUpdate,
} from '@nrcno/core-models';
import { NotFoundError } from '@nrcno/core-errors';

import { ParticipantStore } from '../stores/participant.store';

import { PrmService } from './base.service';

export const ParticipantService: PrmService<
  ParticipantDefinition,
  Participant,
  ParticipantUpdate,
  ParticipantListItem
> = {
  count: async () => {
    return ParticipantStore.count();
  },

  create: async (participant: ParticipantDefinition) => {
    return ParticipantStore.create(participant);
  },

  get: async (id: string) => {
    return ParticipantStore.get(id);
  },

  list: async (pagination: Pagination) => {
    return ParticipantStore.list(pagination);
  },

  update: async (id: string, participant: ParticipantUpdate) => {
    const {
      disabilities,
      contactDetails,
      identification,
      languages,
      nationalities,
      ...participantDetails
    } = participant;

    const existingParticipant = await ParticipantStore.get(id);
    if (!existingParticipant) {
      throw new NotFoundError(`Participant with id ${id} not found`);
    }

    const phonesToAdd =
      contactDetails?.phones?.filter(
        (cd): cd is ContactDetailsDefinition => !cd.id,
      ) || [];
    const emailsToAdd =
      contactDetails?.emails?.filter(
        (cd): cd is ContactDetailsDefinition => !cd.id,
      ) || [];

    const phonesToUpdate =
      contactDetails?.phones?.filter(
        (cd): cd is ContactDetails => cd.id !== undefined,
      ) || [];
    const emailsToUpdate =
      contactDetails?.emails?.filter(
        (cd): cd is ContactDetails => cd.id !== undefined,
      ) || [];

    const phonesToRemove = existingParticipant.contactDetails?.phones
      ?.filter(
        (existingContactDetail) =>
          !contactDetails?.phones?.some(
            (cd) => cd.id === existingContactDetail.id,
          ),
      )
      .map((cd) => cd.id);
    const emailsToRemove = existingParticipant.contactDetails?.emails
      ?.filter(
        (existingContactDetail) =>
          !contactDetails?.emails?.some(
            (cd) => cd.id === existingContactDetail.id,
          ),
      )
      .map((cd) => cd.id);

    const contactDetailUpdates = {
      phones: {
        add: phonesToAdd,
        update: phonesToUpdate,
        remove: phonesToRemove,
      },
      emails: {
        add: emailsToAdd,
        update: emailsToUpdate,
        remove: emailsToRemove,
      },
    };

    const identificationUpdates = {
      add: identification?.filter((id) => !id.id),
      update: identification?.filter((id) => id.id) as Identification[],
      remove: existingParticipant.identification
        .filter(
          (existingIdentification) =>
            !identification?.some((id) => id.id === existingIdentification.id),
        )
        .map((id) => id.id),
    };

    const languageUpdates = {
      add: languages?.filter((lang) =>
        existingParticipant.languages.every(
          (existingLang) => lang !== existingLang,
        ),
      ),
      remove: existingParticipant.languages.filter((existingLang) =>
        languages?.every((lang) => lang !== existingLang),
      ),
    };

    const nationalityUpdates = {
      add: nationalities?.filter((nat) =>
        existingParticipant.nationalities.every(
          (existingNat) => nat !== existingNat,
        ),
      ),
      remove: existingParticipant.nationalities.filter((existingNat) =>
        nationalities?.every((nat) => nat !== existingNat),
      ),
    };

    return ParticipantStore.update(id, {
      ...participantDetails,
      disabilities,
      contactDetails: contactDetailUpdates,
      identification: identificationUpdates,
      languages: languageUpdates,
      nationalities: nationalityUpdates,
    });
  },
};

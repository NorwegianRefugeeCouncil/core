import { z } from 'zod';
import { Knex } from 'knex';

import {
  ContactDetails,
  ContactDetailsDefinition,
  EntityType,
  Identification,
  Individual,
  IndividualDefinition,
  IndividualDefinitionSchema,
  IndividualFiltering,
  IndividualListItem,
  IndividualPartialUpdate,
  IndividualUpdate,
  IndividualUpdateSchema,
} from '@nrcno/core-models';
import { NotFoundError } from '@nrcno/core-errors';

import { IndividualStore } from '../stores/individual.store';

import { CRUDMixin } from './base.service';
import { LanguageService } from './language.service';
import { NationalityService } from './nationality.service';
import { HouseholdService } from './household.service';
import { createTrx } from './utils';

export class IndividualService extends CRUDMixin<
  IndividualDefinition,
  Individual,
  IndividualUpdate,
  IndividualPartialUpdate,
  IndividualListItem,
  IndividualFiltering
>(
  IndividualDefinitionSchema as z.ZodType<IndividualDefinition>,
  IndividualUpdateSchema as z.ZodType<IndividualUpdate>,
)(
  class {
    public entityType = EntityType.Individual;
    public store = IndividualStore;
  },
) {
  private async validateLanguages(languages: string[] = []) {
    const languageService = new LanguageService();
    await Promise.all(
      languages.map((lang) => languageService.validateIsoCode(lang)),
    );
  }

  private async validateNationalities(nationalities: string[] = []) {
    const nationalitiesService = new NationalityService();
    await Promise.all(
      nationalities.map((nat) => nationalitiesService.validateIsoCode(nat)),
    );
  }

  private async validate(individual: IndividualDefinition) {
    const { languages, preferredLanguage, nationalities } = individual;

    await this.validateLanguages(languages);
    if (preferredLanguage) {
      await this.validateLanguages([preferredLanguage]);
    }

    await this.validateNationalities(nationalities);
  }

  override async create(
    individualDef: IndividualDefinition,
    _trx?: Knex.Transaction,
  ) {
    const trx = _trx || (await createTrx());
    let individual;

    try {
      await this.validate(individualDef);

      if (!individualDef.householdId) {
        const householdService = new HouseholdService();
        await householdService
          .create(
            {
              sizeOverride: 1,
              individuals: [{ ...individualDef, isHeadOfHousehold: true }],
              headType: null,
            },
            trx,
          )
          .then((h) => {
            individual = {
              ...h?.individuals[0],
              householdId: h?.id,
              isHeadOfHousehold: true,
            };
          });
      } else {
        individual = super.create(individualDef, trx);
      }
    } catch (error) {
      trx.rollback();
      throw error;
    }

    if (!_trx) {
      trx.commit();
    }
    return individual;
  }

  override async update(id: string, individual: IndividualUpdate) {
    await this.validate(individual);

    return super.update(id, individual);
  }

  mapUpdateToPartial = async (id: string, individual: IndividualUpdate) => {
    const {
      emails,
      phones,
      identification,
      languages,
      nationalities,
      ...individualDetails
    } = individual;

    const existingIndividual = await IndividualStore.get(id);
    if (!existingIndividual) {
      throw new NotFoundError(`Individual with id ${id} not found`);
    }

    const phonesToAdd =
      phones?.filter((cd): cd is ContactDetailsDefinition => !cd.id) || [];
    const emailsToAdd =
      emails?.filter((cd): cd is ContactDetailsDefinition => !cd.id) || [];

    const phonesToUpdate =
      phones?.filter((cd): cd is ContactDetails => cd.id !== undefined) || [];
    const emailsToUpdate =
      emails?.filter((cd): cd is ContactDetails => cd.id !== undefined) || [];

    const phonesToRemove = existingIndividual.phones
      ?.filter(
        (existingContactDetail) =>
          !phones?.some((cd) => cd.id === existingContactDetail.id),
      )
      .map((cd) => cd.id);
    const emailsToRemove = existingIndividual.emails
      ?.filter(
        (existingContactDetail) =>
          !emails?.some((cd) => cd.id === existingContactDetail.id),
      )
      .map((cd) => cd.id);

    const phoneUpdates = {
      add: phonesToAdd,
      update: phonesToUpdate,
      remove: phonesToRemove,
    };
    const emailUpdates = {
      add: emailsToAdd,
      update: emailsToUpdate,
      remove: emailsToRemove,
    };

    const identificationUpdates = {
      add: identification?.filter((id) => !id.id),
      update: identification?.filter((id) => id.id) as Identification[],
      remove: existingIndividual.identification
        .filter(
          (existingIdentification) =>
            !identification?.some((id) => id.id === existingIdentification.id),
        )
        .map((id) => id.id),
    };

    const languageUpdates = {
      add: languages?.filter((lang) =>
        existingIndividual.languages?.every(
          (existingLang) => lang !== existingLang,
        ),
      ),
      remove: existingIndividual.languages?.filter((existingLang) =>
        languages?.every((lang) => lang !== existingLang),
      ),
    };

    const nationalityUpdates = {
      add: nationalities?.filter((nat) =>
        existingIndividual.nationalities?.every(
          (existingNat) => nat !== existingNat,
        ),
      ),
      remove: existingIndividual.nationalities?.filter((existingNat) =>
        nationalities?.every((nat) => nat !== existingNat),
      ),
    };

    return {
      ...individualDetails,
      phones: phoneUpdates,
      emails: emailUpdates,
      identification: identificationUpdates,
      languages: languageUpdates,
      nationalities: nationalityUpdates,
    };
  };
}

import { z } from 'zod';
import { Knex } from 'knex';

import {
  EntityType,
  Household,
  HouseholdDefinition,
  HouseholdDefinitionSchema,
} from '@nrcno/core-models';

import { HouseholdStore } from '../stores/household.store';

import { CRUDMixin } from './base.service';
import { createTrx } from './utils';

export class HouseholdService extends CRUDMixin<
  HouseholdDefinition,
  Household,
  any,
  any,
  any,
  any
>(HouseholdDefinitionSchema as z.ZodType<HouseholdDefinition>)(
  class {
    public entityType = EntityType.Household;
    public store = HouseholdStore;
  },
) {
  override mapUpdateToPartial(id: string, update: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  override async create(
    householdDef: HouseholdDefinition,
    _trx?: Knex.Transaction,
  ) {
    const trx = _trx || (await createTrx());

    const household = await super.create(householdDef, trx).catch((error) => {
      trx.rollback();
      throw error;
    });

    if (!_trx) {
      trx.commit();
    }

    return household;
  }
}

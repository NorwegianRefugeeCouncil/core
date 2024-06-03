import { Nationality, EntityType } from '@nrcno/core-models';

import { ListMixin, BasePrmClient } from './prm-base.client';

export class NationalityClient extends ListMixin<Nationality>()(
  BasePrmClient(EntityType.Nationality),
) {}

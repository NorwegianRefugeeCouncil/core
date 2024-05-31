import { Language, EntityType } from '@nrcno/core-models';

import { ListMixin, BasePrmClient } from './prm-base.client';

export class LanguageClient extends ListMixin<Language>()(
  BasePrmClient(EntityType.Language),
) {}

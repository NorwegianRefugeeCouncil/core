import { EmptyFilter, EntityType, Language } from '@nrcno/core-models';

import { LanguageStore } from '../stores/language.store';

import { ListMixin } from './base.service';

export class LanguageService extends ListMixin<Language, EmptyFilter>()(
  class {
    public entityType = EntityType.Language;
    public store = LanguageStore;
  },
) {}

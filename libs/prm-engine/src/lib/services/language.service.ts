import { Language } from '@nrcno/core-models';

import { LanguageStore } from '../stores/language.store';

import { ListMixin } from './base.service';

export class LanguageService extends ListMixin<Language>()(
  class {
    public store = LanguageStore;
  },
) {}

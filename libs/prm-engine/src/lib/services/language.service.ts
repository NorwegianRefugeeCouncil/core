import { EntityType, Language, LanguageFilter } from '@nrcno/core-models';

import { LanguageStore } from '../stores/language.store';

import { ListMixin } from './base.service';

export class LanguageService extends ListMixin<Language, LanguageFilter>()(
  class {
    public entityType = EntityType.Language;
    public store = LanguageStore;
  },
) {
  async validateIsoCode(value: string) {
    const language: Language = await this.store.get(value);
    if (!language || !language.enabled) {
      throw new Error(`Invalid language: ${value}`);
    }
  }
}
